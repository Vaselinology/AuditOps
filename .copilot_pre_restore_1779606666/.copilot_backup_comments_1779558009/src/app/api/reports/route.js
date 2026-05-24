import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const { audit_id, content, generated_by } = body;

    if (!audit_id) {
      return Response.json({ error: "audit_id is required" }, { status: 400 });
    }

    // Get audit details
    const auditResult =
      await sql`SELECT audit_number FROM audits WHERE id = ${audit_id}`;
    if (auditResult.length === 0) {
      return Response.json({ error: "Audit not found" }, { status: 404 });
    }

    const audit = auditResult[0];
    // Generate report number by replacing NA with RA
    const report_number = audit.audit_number.replace("NA", "RA");

    const result = await sql`
      INSERT INTO audit_reports (audit_id, report_number, content, generated_by)
      VALUES (${audit_id}, ${report_number}, ${content}, ${generated_by || null})
      RETURNING *
    `;

    return Response.json({ report: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating report:", error);
    return Response.json({ error: "Failed to create report" }, { status: 500 });
  }
}
