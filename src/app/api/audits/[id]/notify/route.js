import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request, { params }) {
  try {
    const { id } = params;

    const { data: audit, error: auditError } = await supabaseServer
      .from('audits')
      .select('*')
      .eq('id', id)
      .single();

    if (auditError || !audit) {
      return Response.json({ error: "Audit not found" }, { status: 404 });
    }

    await supabaseServer
      .from('audits')
      .update({
        status: 'notified',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    let users;
    if (audit.department) {
      const { data } = await supabaseServer
        .from('users')
        .select('*')
        .eq('department_id', audit.department);
      users = data || [];
    } else {
      const { data } = await supabaseServer
        .from('users')
        .select('*');
      users = data || [];
    }

    for (const user of users) {
      await supabaseServer
        .from('notifications')
        .insert({
          user_id: user.id,
          title: `New Audit Notification: ${audit.audit_number}`,
          message: `A new audit has been scheduled: ${audit.title}`,
          type: 'audit_notification',
          related_id: audit.id
        });
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
