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
    const existing = await sql`
      SELECT id FROM programme_slots
      WHERE row_id = ${row_id} AND original_month = ${original_month} AND original_week = ${original_week}
    `;

    let result;
    if (existing.length > 0) {
      result = await sql`
        UPDATE programme_slots
        SET status = ${status || "planned"},
            title = ${title || null},
            notes = ${notes || null},
            audit_day = ${audit_day || null}
        WHERE id = ${existing[0].id}
        RETURNING *
      `;
    } else {
      result = await sql`
        INSERT INTO programme_slots (row_id, original_month, original_week, status, title, notes, audit_day)
        VALUES (${row_id}, ${original_month}, ${original_week}, ${status || "planned"}, ${title || null}, ${notes || null}, ${audit_day || null})
        RETURNING *
      `;
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

    const result = await sql`
      UPDATE programme_slots
      SET status = ${status || "planned"},
          postponed_month = ${postponed_month || null},
          postponed_week = ${postponed_week || null},
          title = ${title || null},
          notes = ${notes || null},
          audit_day = ${audit_day || null}
      WHERE id = ${id}
      RETURNING *
    `;

    return Response.json({ slot: result[0] });
  } catch (error) {
    console.error("Error updating slot:", error);
    return Response.json({ error: "Failed to update slot" }, { status: 500 });
  }
}
