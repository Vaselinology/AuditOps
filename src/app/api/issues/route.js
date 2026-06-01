import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = supabaseServer
      .from('issue_reports')
      .select(`
        *,
        users!issue_reports_reported_by_fkey (
          first_name,
          last_name,
          email
        ),
        assigned_to_user:users!issue_reports_assigned_to_fkey (
          first_name,
          last_name,
          email
        )
      `);

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const { data: issues, error } = await query;

    if (error) throw error;

    const transformedIssues = issues.map(issue => ({
      ...issue,
      reported_by_name: issue.users ? `${issue.users.first_name} ${issue.users.last_name}` : null,
      assigned_to_name: issue.assigned_to_user ? `${issue.assigned_to_user.first_name} ${issue.assigned_to_user.last_name}` : null
    }));

    return Response.json({ issues: transformedIssues });
  } catch (error) {
    console.error("Error fetching issues:", error);
    return Response.json({ error: "Failed to fetch issues" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const year = new Date().getFullYear().toString().slice(-2);
    const currentYear = new Date().getFullYear();
    const { count } = await supabaseServer
      .from('issue_reports')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${currentYear}-01-01`)
      .lt('created_at', `${currentYear + 1}-01-01`);

    const safeCount = count ?? 0;
    const auto_event_id =
      body.event_id ||
      `EVT-${year}-${(safeCount + 1).toString().padStart(3, "0")}`;

    const initial_risk = body.initial_probability && body.initial_severity
      ? body.initial_probability * body.initial_severity
      : null;
    const reass_risk = body.reass_probability && body.reass_severity
      ? body.reass_probability * body.reass_severity
      : null;

    const { data: issue, error } = await supabaseServer
      .from('issue_reports')
      .insert({
        description: body.description || null,
        event_type: body.event_type || null,
        urgency: body.urgency || "normal",
        reported_by: body.reported_by || null,
        status: 'submitted',
        event_id: auto_event_id,
        event_date: body.event_date || null,
        event_references: body.event_references || null,
        ac_mat: body.ac_mat || null,
        event_name: body.event_name || null,
        location: body.location || null,
        source: body.source || null,
        initial_probability: body.initial_probability || null,
        initial_severity: body.initial_severity || null,
        investigation: body.investigation || null,
        investigation_report_url: body.investigation_report_url || null,
        action_recommendation: body.action_recommendation || null,
        reass_probability: body.reass_probability || null,
        reass_severity: body.reass_severity || null,
        effectiveness_suitability: body.effectiveness_suitability || null,
        effectiveness_date: body.effectiveness_date || null,
        risk_analysis_p: body.risk_analysis_p || false,
        risk_analysis_s: body.risk_analysis_s || false,
        risk_analysis_r: body.risk_analysis_r || false
      })
      .select()
      .single();

    if (error) throw error;

    return Response.json({ issue }, { status: 201 });
  } catch (error) {
    console.error("Error creating issue:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) return Response.json({ error: "id is required" }, { status: 400 });

    if (fields.initial_probability !== undefined && fields.initial_severity !== undefined) {
      fields.initial_risk = fields.initial_probability * fields.initial_severity;
    }
    if (fields.reass_probability !== undefined && fields.reass_severity !== undefined) {
      fields.reass_risk = fields.reass_probability * fields.reass_severity;
    }

    const allowed = [
      "status", "corrective_action", "assigned_to", "urgency", "deadline",
      "event_id", "event_type", "event_date", "event_references", "ac_mat",
      "event_name", "location", "source", "description", "category",
      "initial_probability", "initial_severity",
      "investigation", "investigation_report_url", "action_recommendation",
      "reass_probability", "reass_severity",
      "effectiveness_suitability", "effectiveness_date",
      "risk_analysis_p", "risk_analysis_s", "risk_analysis_r",
      "report_html", "potential_hazard", "existing_measures",
      "proposed_actions", "responsible_id", "review_date"
    ];

    const updateData = {};
    for (const field of allowed) {
      if (fields[field] !== undefined) {
        updateData[field] = fields[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    updateData.updated_at = new Date().toISOString();

    const { data: issue, error } = await supabaseServer
      .from('issue_reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (fields.deadline && issue) {
      await supabaseServer
        .from('calendar_events')
        .insert({
          title: `${issue.event_id || ""}: ${issue.event_name || issue.event_id || ""}`,
          description: "Issue deadline",
          event_date: fields.deadline,
          event_type: 'deadline',
          related_id: issue.id
        });
    }

    return Response.json({ issue });
  } catch (error) {
    console.error("Error updating issue:", error);
    return Response.json({ error: "Failed to update issue" }, { status: 500 });
  }
}
