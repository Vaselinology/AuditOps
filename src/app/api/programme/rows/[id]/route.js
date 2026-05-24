import { supabase } from '@/lib/supabase';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const { error } = await supabase
      .from('programme_rows')
      .delete()
      .eq('id', id);

    if (error) throw error;

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

    const { data: row } = await supabase
      .from('programme_rows')
      .update({ domain, referentiel })
      .eq('id', id)
      .select()
      .single();

    return Response.json({ row });
  } catch (error) {
    console.error("Error updating programme row:", error);
    return Response.json({ error: "Failed to update row" }, { status: 500 });
  }
}
