import { supabaseServer } from '@/lib/supabase-server';

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const allowedFields = [
      "planned_audit_title",
      "department",
      "planned_quarter",
      "planned_month",
      "status",
      "notes",
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field] || null;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const { data: plan, error } = await supabaseServer
      .from('yearly_planning')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !plan) {
      return Response.json({ error: "Entry not found" }, { status: 404 });
    }

    return Response.json({ plan });
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
    const { error } = await supabaseServer
      .from('yearly_planning')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting yearly plan:", error);
    return Response.json(
      { error: "Failed to delete yearly plan" },
      { status: 500 },
    );
  }
}
