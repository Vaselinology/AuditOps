import sql from "@/app/api/utils/sql";

// POST — create or update a slot
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      row_id,
      original_month,
      original_week,
      status,
      title,
      notes,
      audit_day,
    } = body;

    // Check if slot already exists
    const { data: existing, error: checkError } = await sql
      .from('programme_slots')
      .select('id')
      .eq('row_id', row_id)
      .eq('original_month', original_month)
      .eq('original_week', original_week);

    if (checkError) throw checkError;

    let result;
    if (existing && existing.length > 0) {
      const { data, error } = await sql
        .from('programme_slots')
        .update({
          status: status || "planned",
          title: title || null,
          notes: notes || null,
          audit_day: audit_day || null
        })
        .eq('id', existing[0].id)
        .select();

      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await sql
        .from('programme_slots')
        .insert({
          row_id,
          original_month,
          original_week,
          status: status || "planned",
          title: title || null,
          notes: notes || null,
          audit_day: audit_day || null
        })
        .select();

      if (error) throw error;
      result = data;
    }

    return Response.json({ slot: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating slot:", error);
    return Response.json({ error: "Failed to save slot" }, { status: 500 });
  }
}

// PATCH — postpone a slot (set postponed_month/week, change status to postponed)
export async function PATCH(request) {
  try {
    const body = await request.json();
    const {
      id,
      status,
      postponed_month,
      postponed_week,
      title,
      notes,
      audit_day,
    } = body;

    if (!id) return Response.json({ error: "id required" }, { status: 400 });

    const { data, error } = await sql
      .from('programme_slots')
      .update({
        status: status || "planned",
        postponed_month: postponed_month || null,
        postponed_week: postponed_week || null,
        title: title || null,
        notes: notes || null,
        audit_day: audit_day || null
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    return Response.json({ slot: data[0] });
  } catch (error) {
    console.error("Error updating slot:", error);
    return Response.json({ error: "Failed to update slot" }, { status: 500 });
  }
}
