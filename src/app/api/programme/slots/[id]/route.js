import sql from "@/app/api/utils/sql";

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const { error } = await sql
      .from('programme_slots')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting slot:", error);
    return Response.json({ error: "Failed to delete slot" }, { status: 500 });
  }
}
