import { supabase } from '@/lib/supabase';

export async function loader({ request }: { request: Request }) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const type = url.searchParams.get("type");
    const department = url.searchParams.get("department");

    let query = supabase
      .from('audits')
      .select(`
        *,
        users!audits_auditor_id_fkey (
          first_name,
          last_name,
          email
        )
      `);

    if (status) {
      query = query.eq('status', status);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (department) {
      query = query.eq('department', department);
    }

    query = query.order('created_at', { ascending: false });

    const { data: audits, error } = await query;

    if (error) throw error;

    const transformedAudits = audits.map(audit => ({
      ...audit,
      auditor_name: audit.users ? `${audit.users.first_name} ${audit.users.last_name}` : null
    }));

    return Response.json({ audits: transformedAudits });
  } catch (error) {
    console.error("Error fetching audits:", error);
    return Response.json({ error: "Failed to fetch audits" }, { status: 500 });
  }
}

export async function action({ request }: { request: Request }) {
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
      adresse,
      audit_subject,
      audit_duration,
      audit_place,
      referentials,
      audit_plan,
      auditees,
    } = body;

    const year = new Date().getFullYear().toString().slice(-2);
    const currentYear = new Date().getFullYear();
    const { count } = await supabase
      .from('audits')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${currentYear}-01-01`)
      .lt('created_at', `${currentYear + 1}-01-01`);

    const audit_number = `NA-${year}-${(count + 1).toString().padStart(2, "0")}`;

    const { data: audit, error } = await supabase
      .from('audits')
      .insert({
        audit_number,
        title,
        description,
        type,
        department,
        auditor_id: auditor_id || null,
        planned_date: planned_date || null,
        created_by: created_by || null,
        status: 'draft',
        adresse: adresse || null,
        audit_subject: audit_subject || null,
        audit_duration: audit_duration || null,
        audit_place: audit_place || null,
        referentials: referentials || null,
        audit_plan: audit_plan || null,
        auditees: auditees || null
      })
      .select()
      .single();

    if (error) throw error;

    if (planned_date) {
      await supabase
        .from('calendar_events')
        .insert({
          title,
          description: description || "",
          event_date: planned_date,
          event_type: 'audit',
          related_id: audit.id
        });
    }

    return Response.json({ audit }, { status: 201 });
  } catch (error) {
    console.error("Error creating audit:", error);
    return Response.json({ error: "Failed to create audit" }, { status: 500 });
  }
}
