import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { audit_id, html_dgac, html_part, created_by } = body;

    if (!audit_id) {
      return Response.json({ error: "audit_id required" }, { status: 400 });
    }

    const { data: audit } = await supabase
      .from('audits')
      .select('audit_number')
      .eq('id', audit_id)
      .single();

    const auditNumber = audit?.audit_number || "NA-XX-XX";

    await supabase
      .from('audit_notifications')
      .delete()
      .eq('audit_id', audit_id);

    const results = [];

    if (html_dgac) {
      const { data } = await supabase
        .from('audit_notifications')
        .insert({
          audit_id,
          notification_number: `${auditNumber}-DGAC`,
          version: 'DGAC',
          html_content: html_dgac,
          created_by: created_by || null
        })
        .select('id')
        .single();
      results.push(data);
    }

    if (html_part) {
      const { data } = await supabase
        .from('audit_notifications')
        .insert({
          audit_id,
          notification_number: `${auditNumber}-PART`,
          version: 'PART',
          html_content: html_part,
          created_by: created_by || null
        })
        .select('id')
        .single();
      results.push(data);
    }

    await supabase
      .from('audits')
      .update({
        notification_sent_at: new Date().toISOString(),
        status: 'notified'
      })
      .eq('id', audit_id);

    return Response.json({ saved: results.length }, { status: 201 });
  } catch (error) {
    console.error("Error saving notifications:", error);
    return Response.json(
      { error: "Failed to save notifications" },
      { status: 500 },
    );
  }
}
