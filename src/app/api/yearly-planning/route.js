import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year") || new Date().getFullYear();

    const { data: planning, error } = await sql
      .from('yearly_planning')
      .select('*')
      .eq('year', year)
      .order('planned_month', { ascending: true });

    if (error) throw error;

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

    const { data, error } = await sql
      .from('yearly_planning')
      .insert({
        year,
        department: department || null,
        planned_audit_title,
        planned_quarter: planned_quarter || null,
        planned_month: planned_month || null,
        notes: notes || null
      })
      .select();

    if (error) throw error;

    return Response.json({ plan: data[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating yearly plan:", error);
    return Response.json(
      { error: "Failed to create yearly plan" },
      { status: 500 },
    );
  }
}
