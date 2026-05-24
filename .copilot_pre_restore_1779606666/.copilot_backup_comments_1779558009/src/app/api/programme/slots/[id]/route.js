import sql from "@/app/api/utils/sql";

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await sql`DELETE FROM programme_slots WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting slot:", error);
    return Response.json({ error: "Failed to delete slot" }, { status: 500 });
  }
}
