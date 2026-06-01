import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const { data: audit, error: auditError } = await supabaseServer
      .from('audits')
      .select('*')
      .eq('id', id)
      .single();

    if (auditError || !audit) {
      return Response.json({ error: "Audit not found" }, { status: 404 });
    }

    const dgacHtml = generateNotificationHtml(audit, body, 'DGAC');
    const partHtml = generateNotificationHtml(audit, body, 'PART');

    return Response.json({
      dgac: dgacHtml,
      part: partHtml
    });
  } catch (error) {
    console.error("Error generating notification preview:", error);
    return Response.json(
      { error: "Failed to generate preview" },
      { status: 500 },
    );
  }
}

function generateNotificationHtml(audit, formData, version) {
  const today = new Date().toLocaleDateString('fr-FR');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Notification d'Audit - ${version}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1e40af; padding-bottom: 20px; }
    .header h1 { color: #1e40af; margin: 0; }
    .header .subtitle { color: #666; margin-top: 10px; }
    .content { margin: 30px 0; }
    .field { margin: 15px 0; }
    .field label { font-weight: bold; color: #333; display: block; margin-bottom: 5px; }
    .field .value { color: #555; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
    .version-badge { display: inline-block; background: #1e40af; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>NOTIFICATION D'AUDIT</h1>
      <div class="subtitle">Direction Assurance Qualité et Sécurité</div>
      <div class="version-badge">${version}</div>
    </div>
    
    <div class="content">
      <div class="field">
        <label>Numéro d'audit:</label>
        <div class="value">${audit.audit_number || 'N/A'}</div>
      </div>
      
      <div class="field">
        <label>Titre de l'audit:</label>
        <div class="value">${audit.title || 'N/A'}</div>
      </div>
      
      <div class="field">
        <label>Date de notification:</label>
        <div class="value">${formData.date || today}</div>
      </div>
      
      <div class="field">
        <label>Lieu:</label>
        <div class="value">${formData.location || audit.audit_place || 'N/A'}</div>
      </div>
      
      <div class="field">
        <label>Date prévue:</label>
        <div class="value">${audit.planned_date ? new Date(audit.planned_date).toLocaleDateString('fr-FR') : 'N/A'}</div>
      </div>
      
      <div class="field">
        <label>Type d'audit:</label>
        <div class="value">${audit.type || 'N/A'}</div>
      </div>
      
      ${formData.notes ? `
      <div class="field">
        <label>Notes:</label>
        <div class="value">${formData.notes}</div>
      </div>
      ` : ''}
      
      <div class="field">
        <label>Description:</label>
        <div class="value">${audit.description || 'N/A'}</div>
      </div>
    </div>
    
    <div class="footer">
      <p>Document généré le ${today}</p>
      <p>Tunisair — Direction Assurance Qualité et Sécurité</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
