import sql from "@/app/api/utils/sql";

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const updates = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      "planned_audit_title",
      "department",
      "planned_quarter",
      "planned_month",
      "status",
      "notes",
    ];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${paramCount}`);
        values.push(body[field] || null);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      return Response.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    values.push(id);
    const query = `UPDATE yearly_planning SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`;
    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ error: "Entry not found" }, { status: 404 });
    }

    return Response.json({ plan: result[0] });
  } catch (error) {
    console.error("Error updating yearly plan:", error);
    return Response.json(
      { error: "Failed to update yearly plan" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await sql`DELETE FROM yearly_planning WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting yearly plan:", error);
    return Response.json(
      { error: "Failed to delete yearly plan" },
      { status: 500 },
    );
  }
}
