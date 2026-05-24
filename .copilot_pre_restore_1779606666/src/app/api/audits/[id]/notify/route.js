import sql from "@/app/api/utils/sql";

export async function POST(request, { params }) {
  try {
    const { id } = params;

    // Get audit details
    const auditResult = await sql`SELECT * FROM audits WHERE id = ${id}`;
    if (auditResult.length === 0) {
      return Response.json({ error: "Audit not found" }, { status: 404 });
    }

    const audit = auditResult[0];

    // Update audit status to 'notified'
    await sql`UPDATE audits SET status = 'notified', updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`;

    // Get all users in the department (or all users if no department)
    let users;
    if (audit.department) {
      users =
        await sql`SELECT * FROM users WHERE department = ${audit.department}`;
    } else {
      users = await sql`SELECT * FROM users`;
    }

    // Create notifications for all relevant users
    for (const user of users) {
      await sql`
        INSERT INTO notifications (user_id, title, message, type, related_id)
        VALUES (
          ${user.id},
          ${"New Audit Notification: " + audit.audit_number},
          ${"A new audit has been scheduled: " + audit.title},
          'audit_notification',
          ${audit.id}
        )
      `;
    }

    return Response.json({
      success: true,
      message: `Notification sent to ${users.length} users`,
      audit_number: audit.audit_number,
    });
  } catch (error) {
    console.error("Error sending audit notification:", error);
    return Response.json(
      { error: "Failed to send notification" },
      { status: 500 },
    );
  }
}
