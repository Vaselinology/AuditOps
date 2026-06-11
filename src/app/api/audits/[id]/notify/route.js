import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { date, location, notes, type, duration, referentiels, auditPlan } = body || {};

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

    const generateNotificationHTML = (version) => {
      const today = date ? new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      const plannedDate = audit.planned_date ? new Date(audit.planned_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
      
      // Generate reference number in NA-YY-** format
      const year = new Date().getFullYear().toString().slice(-2);
      const refNumber = audit.audit_number || `NA-${year}-01`;
      
      // Generate audit plan rows from form data
      const auditPlanRows = auditPlan && auditPlan.length > 0 
        ? auditPlan.map(item => `
          <tr>
            <td style="padding:8px 12px;border:1px solid #ddd;">${item.time || '—'}</td>
            <td style="padding:8px 12px;border:1px solid #ddd;">${item.activity || '—'}</td>
            <td style="padding:8px 12px;border:1px solid #ddd;">${item.auditor || audit.auditor_name || '—'}</td>
            <td style="padding:8px 12px;border:1px solid #ddd;">${item.observations || ''}</td>
          </tr>
        `).join('')
        : `
          <tr>
            <td style="padding:8px 12px;border:1px solid #ddd;">08h00</td>
            <td style="padding:8px 12px;border:1px solid #ddd;">Réunion d'ouverture</td>
            <td style="padding:8px 12px;border:1px solid #ddd;">${audit.auditor_name || '—'}</td>
            <td style="padding:8px 12px;border:1px solid #ddd;"></td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #ddd;">09h00</td>
            <td style="padding:8px 12px;border:1px solid #ddd;"></td>
            <td style="padding:8px 12px;border:1px solid #ddd;">${audit.auditor_name || '—'}</td>
            <td style="padding:8px 12px;border:1px solid #ddd;"></td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #ddd;">12h00</td>
            <td style="padding:8px 12px;border:1px solid #ddd;">Pause déjeuner</td>
            <td style="padding:8px 12px;border:1px solid #ddd;">—</td>
            <td style="padding:8px 12px;border:1px solid #ddd;"></td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #ddd;">13h00</td>
            <td style="padding:8px 12px;border:1px solid #ddd;"></td>
            <td style="padding:8px 12px;border:1px solid #ddd;">${audit.auditor_name || '—'}</td>
            <td style="padding:8px 12px;border:1px solid #ddd;"></td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #ddd;">16h00</td>
            <td style="padding:8px 12px;border:1px solid #ddd;">Réunion de clôture</td>
            <td style="padding:8px 12px;border:1px solid #ddd;">${audit.auditor_name || '—'}</td>
            <td style="padding:8px 12px;border:1px solid #ddd;"></td>
          </tr>
        `;
      
      return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, sans-serif; font-size: 11pt; color: #1a1a1a; padding: 0; background:#fff; }
    .page { max-width: 720px; margin: 0 auto; padding: 32px 40px; }

    /* ── Header ── */
    .header { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; padding-bottom:16px; border-bottom:3px solid #CC0000; }
    .logo-block { display:flex; align-items:center; gap:10px; }
    .logo-circle { width:56px; height:56px; background:#CC0000; border-radius:50%; display:flex; align-items:center; justify-content:center; }
    .logo-circle svg { width:36px; height:36px; }
    .company-name { font-size:14pt; font-weight:700; color:#CC0000; line-height:1.2; }
    .company-sub  { font-size:8pt; color:#666; }
    .doc-title-block { text-align:right; }
    .doc-title { font-size:13pt; font-weight:700; color:#CC0000; text-transform:uppercase; }
    .doc-ref   { font-size:9pt; color:#555; margin-top:4px; }

    /* ── Info table ── */
    .info-table { width:100%; border-collapse:collapse; margin-bottom:20px; }
    .info-table td { padding:7px 10px; border:1px solid #ccc; font-size:10pt; }
    .info-table td:first-child { background:#f5f5f5; font-weight:600; white-space:nowrap; width:36%; }

    /* ── Plan table ── */
    .section-title { font-size:11pt; font-weight:700; color:#CC0000; margin:20px 0 8px; text-transform:uppercase; letter-spacing:0.5px; }
    .plan-table { width:100%; border-collapse:collapse; }
    .plan-table th { background:#CC0000; color:#fff; padding:8px 12px; text-align:left; border:1px solid #CC0000; font-size:10pt; }
    .plan-table td { border:1px solid #ddd; font-size:10pt; }
    .plan-table tr:nth-child(even) td { background:#fafafa; }

    /* ── Signatures ── */
    .signatures { display:flex; gap:40px; margin-top:36px; }
    .sig-block  { flex:1; text-align:center; }
    .sig-line   { border-top:1px solid #999; margin-top:40px; padding-top:6px; font-size:9pt; color:#555; }

    /* ── Footer ── */
    .footer { margin-top:28px; padding-top:12px; border-top:1px solid #ddd; font-size:8pt; color:#888; text-align:center; }
    .badge  { display:inline-block; background:#CC0000; color:#fff; font-size:8pt; padding:2px 8px; border-radius:4px; margin-bottom:6px; }
  </style>
</head>
<body>
<div class="page">

  <!-- ── Header ── -->
  <div class="header">
    <div class="logo-block">
      <div class="logo-circle">
        <!-- Stylised Tunisair bird mark in white -->
        <svg viewBox="0 0 36 36" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 4 C10 4 4 10 4 18 C4 26 10 32 18 32 C26 32 32 26 32 18 C32 10 26 4 18 4 Z M14 13 L22 11 L24 18 L18 22 L12 18 Z"/>
        </svg>
      </div>
      <div>
        <div class="company-name">TUNISAIR</div>
        <div class="company-sub">Audit Interne — Qualité & Conformité</div>
      </div>
    </div>
    <div class="doc-title-block">
      <div class="doc-title">Notification d'Audit Interne</div>
      <div class="doc-ref">Réf. : ${refNumber} / Doc. 2 — ${version}</div>
    </div>
  </div>

  <!-- ── Identification fields ── -->
  <table class="info-table">
    <tr><td>Date de notification</td><td>${today}</td></tr>
    <tr>
      <td>À</td>
      <td>
        <strong>${audit.auditee_name || '—'}</strong><br/>
        ${location || audit.audit_place || ''}
      </td>
    </tr>
    <tr><td>Type d'audit</td><td>${type || audit.type || 'Planifié'}</td></tr>
    <tr><td>Objet de l'audit</td><td>${audit.title || '—'}</td></tr>
    <tr><td>Durée de l'audit</td><td>${duration || '—'}</td></tr>
    <tr><td>Lieu / Département</td><td>${audit.department || '—'}</td></tr>
    <tr><td>Référentiels appliqués</td><td>${referentiels || version}</td></tr>
    <tr><td>Auditeur(s)</td><td>${audit.auditor_name || '—'}</td></tr>
  </table>

  <!-- ── Audit plan ── -->
  <div class="section-title">Plan d'Audit</div>
  <table class="plan-table">
    <thead>
      <tr>
        <th style="width:14%">Heure</th>
        <th style="width:44%">Activité / Processus audité</th>
        <th style="width:22%">Auditeur</th>
        <th style="width:20%">Observations</th>
      </tr>
    </thead>
    <tbody>
      ${auditPlanRows}
    </tbody>
  </table>

  <!-- ── Signatures ── -->
  <div class="signatures">
    <div class="sig-block">
      <div class="sig-line">Responsable Audit<br/>${audit.auditor_name || '—'}</div>
    </div>
    <div class="sig-block">
      <div class="sig-line">Auditée(s)<br/>${audit.auditee_name || '—'}</div>
    </div>
    <div class="sig-block">
      <div class="sig-line">Direction Qualité</div>
    </div>
  </div>

  <!-- ── Footer ── -->
  <div class="footer">
    <div class="badge">CONFIDENTIEL</div><br/>
    Tunisair — Direction Qualité & Audit Interne — Ce document est strictement confidentiel.
  </div>

</div>
</body>
</html>
      `.trim();
    };

    for (const version of ['DGAC', 'PART']) {
      await supabaseServer
        .from('audit_notifications')
        .insert({
          audit_id: id,
          version,
          html_content: generateNotificationHTML(version),
          created_at: new Date().toISOString()
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
