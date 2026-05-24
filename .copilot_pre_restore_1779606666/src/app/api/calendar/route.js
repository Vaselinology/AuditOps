import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");

    let query = "SELECT * FROM calendar_events WHERE 1=1";
    const params = [];
    let paramCount = 1;

    if (start_date) {
      query += ` AND event_date >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND event_date <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    query += " ORDER BY event_date ASC";

    const events = await sql(query, params);
    return Response.json({ events });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return Response.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 },
    );
  }
}
