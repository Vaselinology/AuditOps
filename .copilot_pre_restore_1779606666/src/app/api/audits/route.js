import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const department = searchParams.get("department");

    let query =
      "SELECT a.*, u.name as auditor_name FROM audits a LEFT JOIN users u ON a.auditor_id = u.id WHERE 1=1";
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND a.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (type) {
      query += ` AND a.type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    if (department) {
      query += ` AND a.department = $${paramCount}`;
      params.push(department);
      paramCount++;
    }

    query += " ORDER BY a.created_at DESC";

    const audits = await sql(query, params);
    return Response.json({ audits });
  } catch (error) {
    console.error("Error fetching audits:", error);
    return Response.json({ error: "Failed to fetch audits" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      type,
      department,
      auditor_id,
      planned_date,
      created_by,
      // ── New notification fields ──
      adresse,
      audit_subject,
      audit_duration,
      audit_place,
      referentials,
      audit_plan,
      auditees,
    } = body;

    // Auto-generate audit number  e.g. NA-26-01
    const year = new Date().getFullYear().toString().slice(-2);
    const countResult =
      await sql`SELECT COUNT(*) as count FROM audits WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)`;
    const count = parseInt(countResult[0].count) + 1;
    const audit_number = `NA-${year}-${count.toString().padStart(2, "0")}`;

    const result = await sql`
      INSERT INTO audits (
        audit_number, title, description, type, department,
        auditor_id, planned_date, created_by, status,
        adresse, audit_subject, audit_duration, audit_place,
        referentials, audit_plan, auditees
      )
      VALUES (
        ${audit_number}, ${title}, ${description}, ${type}, ${department},
        ${auditor_id || null}, ${planned_date || null}, ${created_by || null}, 'draft',
        ${adresse || null}, ${audit_subject || null}, ${audit_duration || null},
        ${audit_place || null}, ${referentials || null},
        ${audit_plan ? JSON.stringify(audit_plan) : null},
        ${auditees ? JSON.stringify(auditees) : null}
      )
      RETURNING *
    `;

    const audit = result[0];

    // Auto-create a calendar event when a date is set
    if (planned_date) {
      await sql`
        INSERT INTO calendar_events (title, description, event_date, event_type, related_id)
        VALUES (${title}, ${description || ""}, ${planned_date}, 'audit', ${audit.id})
      `;
    }

    return Response.json({ audit }, { status: 201 });
  } catch (error) {
    console.error("Error creating audit:", error);
    return Response.json({ error: "Failed to create audit" }, { status: 500 });
  }
}
