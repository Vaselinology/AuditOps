import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { audit_id, title, description, severity, assigned_to } = body;

    if (!audit_id) {
      return Response.json({ error: "audit_id is required" }, { status: 400 });
    }

    // Get audit details for finding number
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .select('audit_number')
      .eq('id', audit_id)
      .single();

    if (auditError || !audit) {
      return Response.json({ error: "Audit not found" }, { status: 404 });
    }

    const { count } = await supabase
      .from('findings')
      .select('*', { count: 'exact', head: true })
      .eq('audit_id', audit_id);

    const finding_number = `${audit.audit_number}-F${(count + 1).toString().padStart(2, "0")}`;

    // Calculate deadline based on severity
    let deadline = new Date();
    if (severity === "critical") {
      deadline.setDate(deadline.getDate() + 7);
    } else if (severity === "major") {
      deadline.setDate(deadline.getDate() + 30);
    } else {
      deadline.setDate(deadline.getDate() + 90);
    }

    const { data: finding, error } = await supabase
      .from('findings')
      .insert({
        audit_id,
        finding_number,
        title,
        description,
        severity,
        deadline: deadline.toISOString().split('T')[0],
        assigned_to: assigned_to || null
      })
      .select()
      .single();

    if (error) throw error;

    // Create calendar event for deadline
    await supabase
      .from('calendar_events')
      .insert({
        title: `${finding_number}: ${title}`,
        description: `Finding deadline: ${severity}`,
        event_date: finding.deadline,
        event_type: 'deadline',
        related_id: finding.id
      });

    return Response.json({ finding }, { status: 201 });
  } catch (error) {
    console.error("Error creating finding:", error);
    return Response.json(
      { error: "Failed to create finding" },
      { status: 500 },
    );
  }
}
