import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const { audit_id, title, description, severity, assigned_to } = body;

    if (!audit_id) {
      return Response.json({ error: "audit_id is required" }, { status: 400 });
    }

    // Get audit details for finding number
    const auditResult =
      await sql`SELECT audit_number FROM audits WHERE id = ${audit_id}`;
    if (auditResult.length === 0) {
      return Response.json({ error: "Audit not found" }, { status: 404 });
    }

    const audit = auditResult[0];
    const findingCount =
      await sql`SELECT COUNT(*) as count FROM findings WHERE audit_id = ${audit_id}`;
    const count = parseInt(findingCount[0].count) + 1;
    const finding_number = `${audit.audit_number}-F${count.toString().padStart(2, "0")}`;

    // Calculate deadline based on severity
    let deadline = new Date();
    if (severity === "critical") {
      deadline.setDate(deadline.getDate() + 7); // 7 days
    } else if (severity === "major") {
      deadline.setDate(deadline.getDate() + 30); // 30 days
    } else {
      deadline.setDate(deadline.getDate() + 90); // 90 days
    }

    const result = await sql`
      INSERT INTO findings (audit_id, finding_number, title, description, severity, deadline, assigned_to)
      VALUES (${audit_id}, ${finding_number}, ${title}, ${description}, ${severity}, ${deadline.toISOString().split("T")[0]}, ${assigned_to || null})
      RETURNING *
    `;

    const finding = result[0];

    // Create calendar event for deadline
    await sql`
      INSERT INTO calendar_events (title, description, event_date, event_type, related_id)
      VALUES (${finding_number + ": " + title}, ${"Finding deadline: " + severity}, ${finding.deadline}, 'deadline', ${finding.id})
    `;

    return Response.json({ finding }, { status: 201 });
  } catch (error) {
    console.error("Error creating finding:", error);
    return Response.json(
      { error: "Failed to create finding" },
      { status: 500 },
    );
  }
}
