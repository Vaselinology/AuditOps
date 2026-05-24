import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const { audit_id, html_dgac, html_part, created_by } = body;

    if (!audit_id) {
      return Response.json({ error: "audit_id required" }, { status: 400 });
    }

    const auditResult =
      await sql`SELECT audit_number FROM audits WHERE id = ${audit_id}`;
    const auditNumber = auditResult[0]?.audit_number || "NA-XX-XX";

    await sql`DELETE FROM audit_notifications WHERE audit_id = ${audit_id}`;

    const results = [];

    if (html_dgac) {
      const r = await sql`
        INSERT INTO audit_notifications (audit_id, notification_number, version, html_content, created_by)
        VALUES (${audit_id}, ${auditNumber + "-DGAC"}, 'DGAC', ${html_dgac}, ${created_by || null})
        RETURNING id
      `;
      results.push(r[0]);
    }

    if (html_part) {
      const r = await sql`
        INSERT INTO audit_notifications (audit_id, notification_number, version, html_content, created_by)
        VALUES (${audit_id}, ${auditNumber + "-PART"}, 'PART', ${html_part}, ${created_by || null})
        RETURNING id
      `;
      results.push(r[0]);
    }

    await sql`
      UPDATE audits SET notification_sent_at = CURRENT_TIMESTAMP, status = 'notified'
      WHERE id = ${audit_id}
    `;

    return Response.json({ saved: results.length }, { status: 201 });
  } catch (error) {
    console.error("Error saving notifications:", error);
    return Response.json(
      { error: "Failed to save notifications" },
      { status: 500 },
    );
  }
}
