import sql from "@/app/api/utils/sql";

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    // Slots are cascade-deleted via FK
    await sql`DELETE FROM programme_rows WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting programme row:", error);
    return Response.json({ error: "Failed to delete row" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { domain, referentiel } = body;

    const result = await sql`
      UPDATE programme_rows SET domain = ${domain}, referentiel = ${referentiel}
      WHERE id = ${id} RETURNING *
    `;

    return Response.json({ row: result[0] });
  } catch (error) {
    console.error("Error updating programme row:", error);
    return Response.json({ error: "Failed to update row" }, { status: 500 });
  }
}
