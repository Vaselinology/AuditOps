import { supabase } from '@/lib/supabase';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .select(`
        *,
        users!audits_auditor_id_fkey (
          first_name,
          last_name,
          email
        ),
        created_by_user:users!audits_created_by_fkey (
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', id)
      .single();

    if (auditError || !audit) {
      return Response.json({ error: "Audit not found" }, { status: 404 });
    }

    const { data: findings } = await supabase
      .from('findings')
      .select(`
        *,
        users!findings_assigned_to_fkey (
          first_name,
          last_name,
          email
        )
      `)
      .eq('audit_id', id)
      .order('created_at', { ascending: false });

    const { data: reports } = await supabase
      .from('audit_reports')
      .select(`
        *,
        users!audit_reports_generated_by_fkey (
          first_name,
          last_name,
          email
        )
      `)
      .eq('audit_id', id)
      .order('generated_at', { ascending: false });

    const { data: notifications } = await supabase
      .from('audit_notifications')
      .select('*')
      .eq('audit_id', id)
      .order('created_at', { ascending: false });

    const { data: finding_sheets } = await supabase
      .from('finding_sheets')
      .select('*')
      .eq('audit_id', id)
      .order('created_at', { ascending: false });

    const transformedAudit = {
      ...audit,
      auditor_name: audit.users ? `${audit.users.first_name} ${audit.users.last_name}` : null,
      created_by_name: audit.created_by_user ? `${audit.created_by_user.first_name} ${audit.created_by_user.last_name}` : null,
      findings: findings?.map(f => ({
        ...f,
        assigned_to_name: f.users ? `${f.users.first_name} ${f.users.last_name}` : null
      })) || [],
      reports: reports?.map(r => ({
        ...r,
        generated_by_name: r.users ? `${r.users.first_name} ${r.users.last_name}` : null
      })) || [],
      notifications: notifications || [],
      finding_sheets: finding_sheets || [],
    };

    return Response.json({ audit: transformedAudit });
  } catch (error) {
    console.error("Error fetching audit:", error);
    return Response.json({ error: "Failed to fetch audit" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const allowedFields = [
      "title",
      "description",
      "status",
      "auditor_id",
      "department",
      "planned_date",
      "start_date",
      "end_date",
      "notification_sent_at",
      "adresse",
      "audit_subject",
      "audit_duration",
      "audit_place",
      "referentials",
      "audit_plan",
      "auditees"
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    updateData.updated_at = new Date().toISOString();

    const { data: audit, error } = await supabase
      .from('audits')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !audit) {
      return Response.json({ error: "Audit not found" }, { status: 404 });
    }

    return Response.json({ audit });
  } catch (error) {
    console.error("Error updating audit:", error);
    return Response.json({ error: "Failed to update audit" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const { error } = await supabase
      .from('audits')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting audit:", error);
    return Response.json({ error: "Failed to delete audit" }, { status: 500 });
  }
}
