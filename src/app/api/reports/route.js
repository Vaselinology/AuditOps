import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const { audit_id, content, generated_by } = body;

    if (!audit_id) {
      return Response.json({ error: "audit_id is required" }, { status: 400 });
    }

    // Get audit details
    const { data: auditResult, error: auditError } = await sql
      .from('audits')
      .select('audit_number')
      .eq('id', audit_id)
      .single();

    if (auditError || !auditResult) {
      return Response.json({ error: "Audit not found" }, { status: 404 });
    }

    const audit = auditResult;
    // Generate report number by replacing NA with RA
    const report_number = audit.audit_number.replace("NA", "RA");

    const { data, error } = await sql
      .from('audit_reports')
      .insert({
        audit_id,
        report_number,
        content,
        generated_by: generated_by || null
      })
      .select();

    if (error) throw error;

    return Response.json({ report: data[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating report:", error);
    return Response.json({ error: "Failed to create report" }, { status: 500 });
  }
}
