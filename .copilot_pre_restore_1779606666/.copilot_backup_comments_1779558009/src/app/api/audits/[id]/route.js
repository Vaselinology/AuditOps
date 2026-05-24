import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await sql`
      SELECT a.*, u.name as auditor_name, c.name as created_by_name
      FROM audits a
      LEFT JOIN users u ON a.auditor_id = u.id
      LEFT JOIN users c ON a.created_by = c.id
      WHERE a.id = ${id}
    `;

    if (result.length === 0) {
      return Response.json({ error: "Audit not found" }, { status: 404 });
    }

    const findings = await sql`
      SELECT f.*, u.name as assigned_to_name
      FROM findings f
      LEFT JOIN users u ON f.assigned_to = u.id
      WHERE f.audit_id = ${id}
      ORDER BY f.created_at DESC
    `;

    const reports = await sql`
      SELECT r.*, u.name as generated_by_name
      FROM audit_reports r
      LEFT JOIN users u ON r.generated_by = u.id
      WHERE r.audit_id = ${id}
      ORDER BY r.generated_at DESC
    `;

    const notifications = await sql`
      SELECT * FROM audit_notifications
      WHERE audit_id = ${id}
      ORDER BY created_at DESC
    `;

    const finding_sheets = await sql`
      SELECT * FROM finding_sheets
      WHERE audit_id = ${id}
      ORDER BY created_at DESC
    `;

    const audit = {
      ...result[0],
      findings,
      reports,
      notifications,
      finding_sheets,
    };
    return Response.json({ audit });
  } catch (error) {
    console.error("Error fetching audit:", error);
    return Response.json({ error: "Failed to fetch audit" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const updates = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      "title",
      "description",
      "status",
      "auditor_id",
      "department",
      "planned_date",
      "start_date",
      "end_date",
      // Notification fields
      "notification_sent_at",
      "adresse",
      "audit_subject",
      "audit_duration",
      "audit_place",
      "referentials",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${paramCount}`);
        values.push(body[field]);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      return Response.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE audits SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`;
    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ error: "Audit not found" }, { status: 404 });
    }

    return Response.json({ audit: result[0] });
  } catch (error) {
    console.error("Error updating audit:", error);
    return Response.json({ error: "Failed to update audit" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await sql`DELETE FROM audits WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting audit:", error);
    return Response.json({ error: "Failed to delete audit" }, { status: 500 });
  }
}
