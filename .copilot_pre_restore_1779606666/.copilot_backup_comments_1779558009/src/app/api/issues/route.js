import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = `
      SELECT i.*, 
             r.name as reported_by_name,
             a.name as assigned_to_name
      FROM issue_reports i
      LEFT JOIN users r ON i.reported_by = r.id
      LEFT JOIN users a ON i.assigned_to = a.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND i.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += " ORDER BY i.created_at DESC";

    const issues = await sql(query, params);
    return Response.json({ issues });
  } catch (error) {
    console.error("Error fetching issues:", error);
    return Response.json({ error: "Failed to fetch issues" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const year = new Date().getFullYear().toString().slice(-2);
    const countResult =
      await sql`SELECT COUNT(*) as count FROM issue_reports WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)`;
    const count = parseInt(countResult[0].count) + 1;
    const auto_event_id =
      body.event_id || `EVT-${year}-${count.toString().padStart(3, "0")}`;

    const initial_risk =
      body.initial_probability && body.initial_severity
        ? body.initial_probability * body.initial_severity
        : null;
    const reass_risk =
      body.reass_probability && body.reass_severity
        ? body.reass_probability * body.reass_severity
        : null;

    const result = await sql`
      INSERT INTO issue_reports (
        title, description, category, urgency, reported_by, status,
        event_id, event_type, event_date, event_references, ac_mat,
        event_name, location, source,
        initial_probability, initial_severity, initial_risk,
        investigation, investigation_report_url, action_recommendation,
        reass_probability, reass_severity, reass_risk,
        effectiveness_suitability, effectiveness_date,
        risk_analysis_p, risk_analysis_s, risk_analysis_r
      ) VALUES (
        ${body.title || body.event_name || "Untitled"},
        ${body.description || null},
        ${body.category || null},
        ${body.urgency || "normal"},
        ${body.reported_by || null},
        'submitted',
        ${auto_event_id},
        ${body.event_type || null},
        ${body.event_date || null},
        ${body.event_references || null},
        ${body.ac_mat || null},
        ${body.event_name || null},
        ${body.location || null},
        ${body.source || null},
        ${body.initial_probability || null},
        ${body.initial_severity || null},
        ${initial_risk},
        ${body.investigation || null},
        ${body.investigation_report_url || null},
        ${body.action_recommendation || null},
        ${body.reass_probability || null},
        ${body.reass_severity || null},
        ${reass_risk},
        ${body.effectiveness_suitability || null},
        ${body.effectiveness_date || null},
        ${body.risk_analysis_p || false},
        ${body.risk_analysis_s || false},
        ${body.risk_analysis_r || false}
      ) RETURNING *
    `;

    return Response.json({ issue: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating issue:", error);
    return Response.json({ error: "Failed to create issue" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) return Response.json({ error: "id is required" }, { status: 400 });

    if (
      fields.initial_probability !== undefined &&
      fields.initial_severity !== undefined
    ) {
      fields.initial_risk =
        fields.initial_probability * fields.initial_severity;
    }
    if (
      fields.reass_probability !== undefined &&
      fields.reass_severity !== undefined
    ) {
      fields.reass_risk = fields.reass_probability * fields.reass_severity;
    }

    const allowed = [
      "status",
      "corrective_action",
      "assigned_to",
      "urgency",
      "deadline",
      "title",
      "event_type",
      "event_date",
      "event_references",
      "ac_mat",
      "event_name",
      "location",
      "source",
      "description",
      "category",
      "initial_probability",
      "initial_severity",
      "initial_risk",
      "investigation",
      "investigation_report_url",
      "action_recommendation",
      "reass_probability",
      "reass_severity",
      "reass_risk",
      "effectiveness_suitability",
      "effectiveness_date",
      "risk_analysis_p",
      "risk_analysis_s",
      "risk_analysis_r",
      "report_html",
      "potential_hazard",
      "existing_measures",
      "proposed_actions",
      "responsible_id",
      "review_date",
    ];

    const updates = [];
    const values = [];
    let p = 1;

    for (const field of allowed) {
      if (fields[field] !== undefined) {
        updates.push(`${field} = $${p}`);
        values.push(fields[field]);
        p++;
      }
    }

    if (updates.length === 0)
      return Response.json({ error: "No fields to update" }, { status: 400 });

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await sql(
      `UPDATE issue_reports SET ${updates.join(", ")} WHERE id = $${p} RETURNING *`,
      values,
    );

    if (fields.deadline && result.length > 0) {
      const issue = result[0];
      await sql`
        INSERT INTO calendar_events (title, description, event_date, event_type, related_id)
        VALUES (${(issue.event_id || "") + ": " + (issue.event_name || issue.title || "")}, ${"Issue deadline"}, ${fields.deadline}, 'deadline', ${issue.id})
      `;
    }

    return Response.json({ issue: result[0] });
  } catch (error) {
    console.error("Error updating issue:", error);
    return Response.json({ error: "Failed to update issue" }, { status: 500 });
  }
}
