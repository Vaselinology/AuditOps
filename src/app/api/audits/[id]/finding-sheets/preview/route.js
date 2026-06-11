import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { date, notes } = body || {};

    const { data: audit, error: auditError } = await supabaseServer
      .from('audits')
      .select(`
        *,
        users!audits_auditor_id_fkey (
          first_name,
          last_name
        ),
        findings (
          id,
          finding_number,
          title,
          description,
          severity,
          deadline,
          users!findings_assigned_to_fkey (
            first_name,
            last_name
          )
        )
      `)
      .eq('id', id)
      .single();

    if (auditError || !audit) {
      return Response.json({ error: "Audit not found" }, { status: 404 });
    }

    const generateFindingSheetHTML = (version) => {
      const sheetDate = date ? new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      
      // Generate reference number in FS-AA-YY-** format
      const year = new Date().getFullYear().toString().slice(-2);
      const refNumber = audit.audit_number ? audit.audit_number.replace('NA-', 'FS-AA-') : `FS-AA-${year}-01`;
      
      const findingsHTML = audit.findings?.map((f, index) => `
        <tr>
          <td style="padding:8px 12px;border:1px solid #ddd;">${f.finding_number}</td>
          <td style="padding:8px 12px;border:1px solid #ddd;">${f.title}</td>
          <td style="padding:8px 12px;border:1px solid #ddd;">${f.description}</td>
          <td style="padding:8px 12px;border:1px solid #ddd;">${f.severity.toUpperCase()}</td>
          <td style="padding:8px 12px;border:1px solid #ddd;">${f.deadline ? new Date(f.deadline).toLocaleDateString('fr-FR') : '—'}</td>
          <td style="padding:8px 12px;border:1px solid #ddd;">${f.users ? `${f.users.first_name} ${f.users.last_name}` : '—'}</td>
        </tr>
      `).join('') || '<tr><td colspan="6" style="padding:8px 12px;border:1px solid #ddd;text-align:center;">Aucun constat</td></tr>';

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

    /* ── Findings table ── */
    .section-title { font-size:11pt; font-weight:700; color:#CC0000; margin:20px 0 8px; text-transform:uppercase; letter-spacing:0.5px; }
    .findings-table { width:100%; border-collapse:collapse; }
    .findings-table th { background:#CC0000; color:#fff; padding:8px 12px; text-align:left; border:1px solid #CC0000; font-size:10pt; }
    .findings-table td { border:1px solid #ddd; font-size:10pt; }
    .findings-table tr:nth-child(even) td { background:#fafafa; }

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
      <div class="doc-title">Fiche de Constat</div>
      <div class="doc-ref">Réf. : ${refNumber} / Doc. 4 — ${version}</div>
    </div>
  </div>

  <!-- ── Identification fields ── -->
  <table class="info-table">
    <tr><td>Date de la fiche</td><td>${sheetDate}</td></tr>
    <tr><td>Numéro d'audit</td><td>${audit.audit_number || '—'}</td></tr>
    <tr><td>Titre de l'audit</td><td>${audit.title || '—'}</td></tr>
    <tr><td>Département</td><td>${audit.department || '—'}</td></tr>
    <tr><td>Auditeur</td><td>${audit.users ? `${audit.users.first_name} ${audit.users.last_name}` : '—'}</td></tr>
    ${notes ? `<tr><td>Notes</td><td>${notes}</td></tr>` : ''}
  </table>

  <!-- ── Findings ── -->
  <div class="section-title">Constats (${audit.findings?.length || 0})</div>
  <table class="findings-table">
    <thead>
      <tr>
        <th style="width:12%">Numéro</th>
        <th style="width:22%">Titre</th>
        <th style="width:28%">Description</th>
        <th style="width:12%">Sévérité</th>
        <th style="width:16%">Échéance</th>
        <th style="width:10%">Assigné à</th>
      </tr>
    </thead>
    <tbody>
      ${findingsHTML}
    </tbody>
  </table>

  <!-- ── Signatures ── -->
  <div class="signatures">
    <div class="sig-block">
      <div class="sig-line">Responsable Audit<br/>${audit.users ? `${audit.users.first_name} ${audit.users.last_name}` : '—'}</div>
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

    const dgacHtml = generateFindingSheetHTML('DGAC');
    const partHtml = generateFindingSheetHTML('PART');

    return Response.json({
      dgac: dgacHtml,
      part: partHtml
    });
  } catch (error) {
    console.error("Error generating finding sheet preview:", error);
    return Response.json(
      { error: "Failed to generate preview" },
      { status: 500 },
    );
  }
}
