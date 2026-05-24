import sql from "@/app/api/utils/sql";

// GET /api/programme?plan_id=1&year=2026
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const plan_id = searchParams.get("plan_id") || 1;
    const year = searchParams.get("year") || new Date().getFullYear();

    const rows = await sql`
      SELECT * FROM programme_rows
      WHERE plan_id = ${plan_id} AND year = ${year}
      ORDER BY sort_order ASC, domain ASC, referentiel ASC
    `;

    const rowIds = rows.map((r) => r.id);
    let slots = [];
    if (rowIds.length > 0) {
      slots = await sql(
        `SELECT * FROM programme_slots WHERE row_id = ANY($1) ORDER BY original_month ASC, original_week ASC`,
        [rowIds],
      );
    }

    return Response.json({ rows, slots });
  } catch (error) {
    console.error("Error fetching programme:", error);
    return Response.json(
      { error: "Failed to fetch programme" },
      { status: 500 },
    );
  }
}

// POST /api/programme — create a new row
export async function POST(request) {
  try {
    const body = await request.json();
    const { plan_id, year, domain, referentiel } = body;

    // Get max sort_order for this plan/year
    const maxOrder = await sql`
      SELECT COALESCE(MAX(sort_order), 0) as max_order
      FROM programme_rows WHERE plan_id = ${plan_id} AND year = ${year}
    `;
    const sort_order = parseInt(maxOrder[0].max_order) + 1;

    const result = await sql`
      INSERT INTO programme_rows (plan_id, year, domain, referentiel, sort_order)
      VALUES (${plan_id}, ${year}, ${domain}, ${referentiel}, ${sort_order})
      RETURNING *
    `;

    return Response.json({ row: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating programme row:", error);
    return Response.json({ error: "Failed to create row" }, { status: 500 });
  }
}
