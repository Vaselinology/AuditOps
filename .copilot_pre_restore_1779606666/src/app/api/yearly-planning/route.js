import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year") || new Date().getFullYear();

    const planning = await sql`
      SELECT * FROM yearly_planning 
      WHERE year = ${year}
      ORDER BY planned_month ASC
    `;

    return Response.json({ planning });
  } catch (error) {
    console.error("Error fetching yearly planning:", error);
    return Response.json(
      { error: "Failed to fetch yearly planning" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      year,
      department,
      planned_audit_title,
      planned_quarter,
      planned_month,
      notes,
    } = body;

    const result = await sql`
      INSERT INTO yearly_planning (year, department, planned_audit_title, planned_quarter, planned_month, notes)
      VALUES (${year}, ${department || null}, ${planned_audit_title}, ${planned_quarter || null}, ${planned_month || null}, ${notes || null})
      RETURNING *
    `;

    return Response.json({ plan: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating yearly plan:", error);
    return Response.json(
      { error: "Failed to create yearly plan" },
      { status: 500 },
    );
  }
}
