import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  try {
    const now = new Date();
    const thisYear = now.getFullYear();
    const lastYear = thisYear - 1;
    const thisMonth = now.getMonth() + 1;
    const lastMonth = thisMonth === 1 ? 12 : thisMonth - 1;
    const lastMonthYear = thisMonth === 1 ? lastYear : thisYear;

    // ── Audits: this year vs last year ──────────────────────────────────────
    const [auditThisYear, auditLastYear] = await Promise.all([
      supabaseServer
        .from('audits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${thisYear}-01-01`)
        .lt('created_at', `${thisYear + 1}-01-01`),
      supabaseServer
        .from('audits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${lastYear}-01-01`)
        .lt('created_at', `${thisYear}-01-01`),
    ]);

    // ── Audits by status this year ──────────────────────────────────────────
    const { data: auditsByStatus } = await supabaseServer
      .from('audits')
      .select('status')
      .gte('created_at', `${thisYear}-01-01`)
      .lt('created_at', `${thisYear + 1}-01-01`);

    // ── Audits: this month vs last month ────────────────────────────────────
    const [auditThisMonth, auditLastMonth] = await Promise.all([
      supabaseServer
        .from('audits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${thisYear}-${thisMonth.toString().padStart(2, '0')}-01`)
        .lt('created_at', `${thisYear}-${thisMonth.toString().padStart(2, '0')}-01`),
      supabaseServer
        .from('audits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${lastMonthYear}-${lastMonth.toString().padStart(2, '0')}-01`)
        .lt('created_at', `${lastMonthYear}-${lastMonth.toString().padStart(2, '0')}-01`),
    ]);

    // ── Issues: this year vs last year ──────────────────────────────────────
    const [issueThisYear, issueLastYear] = await Promise.all([
      supabaseServer
        .from('issue_reports')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${thisYear}-01-01`)
        .lt('created_at', `${thisYear + 1}-01-01`),
      supabaseServer
        .from('issue_reports')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${lastYear}-01-01`)
        .lt('created_at', `${thisYear}-01-01`),
    ]);

    // ── Issues: this month vs last month ────────────────────────────────────
    const [issueThisMonth, issueLastMonth] = await Promise.all([
      supabaseServer
        .from('issue_reports')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${thisYear}-${thisMonth.toString().padStart(2, '0')}-01`)
        .lt('created_at', `${thisYear}-${thisMonth.toString().padStart(2, '0')}-01`),
      supabaseServer
        .from('issue_reports')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${lastMonthYear}-${lastMonth.toString().padStart(2, '0')}-01`)
        .lt('created_at', `${lastMonthYear}-${lastMonth.toString().padStart(2, '0')}-01`),
    ]);

    // ── Issues by urgency this year ─────────────────────────────────────────
    const { data: issuesByUrgency } = await supabaseServer
      .from('issue_reports')
      .select('urgency')
      .gte('created_at', `${thisYear}-01-01`)
      .lt('created_at', `${thisYear + 1}-01-01`);

    // ── Issues by status this year ──────────────────────────────────────────
    const { data: issuesByStatus } = await supabaseServer
      .from('issue_reports')
      .select('status')
      .gte('created_at', `${thisYear}-01-01`)
      .lt('created_at', `${thisYear + 1}-01-01`);

    // ── Monthly trend: last 6 months (audits + issues) ──────────────────────
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const { data: monthlyAudits } = await supabaseServer
      .from('audits')
      .select('created_at')
      .gte('created_at', sixMonthsAgo.toISOString());

    const { data: monthlyIssues } = await supabaseServer
      .from('issue_reports')
      .select('created_at')
      .gte('created_at', sixMonthsAgo.toISOString());

    // ── Findings by severity this year ──────────────────────────────────────
    const { data: findingsBySeverity } = await supabaseServer
      .from('findings')
      .select('severity')
      .gte('created_at', `${thisYear}-01-01`)
      .lt('created_at', `${thisYear + 1}-01-01`);

    // ── Completed audits ratio ───────────────────────────────────────────────
    const { count: completedAudits } = await supabaseServer
      .from('audits')
      .select('*', { count: 'exact', head: true })
      .in('status', ['completed', 'closed'])
      .gte('created_at', `${thisYear}-01-01`)
      .lt('created_at', `${thisYear + 1}-01-01`);

    // Process data
    const auditStatusCounts = {};
    auditsByStatus?.forEach(a => {
      auditStatusCounts[a.status] = (auditStatusCounts[a.status] || 0) + 1;
    });

    const issueUrgencyCounts = {};
    issuesByUrgency?.forEach(i => {
      issueUrgencyCounts[i.urgency] = (issueUrgencyCounts[i.urgency] || 0) + 1;
    });

    const issueStatusCounts = {};
    issuesByStatus?.forEach(i => {
      issueStatusCounts[i.status] = (issueStatusCounts[i.status] || 0) + 1;
    });

    const findingSeverityCounts = {};
    findingsBySeverity?.forEach(f => {
      findingSeverityCounts[f.severity] = (findingSeverityCounts[f.severity] || 0) + 1;
    });

    // Process monthly data
    const auditMonthlyData = {};
    monthlyAudits?.forEach(a => {
      const d = new Date(a.created_at);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      auditMonthlyData[key] = (auditMonthlyData[key] || 0) + 1;
    });

    const issueMonthlyData = {};
    monthlyIssues?.forEach(i => {
      const d = new Date(i.created_at);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      issueMonthlyData[key] = (issueMonthlyData[key] || 0) + 1;
    });

    const auditMonthlyRows = Object.entries(auditMonthlyData).map(([key, count]) => {
      const [year, month] = key.split('-');
      return { month: parseInt(month), year: parseInt(year), count };
    });

    const issueMonthlyRows = Object.entries(issueMonthlyData).map(([key, count]) => {
      const [year, month] = key.split('-');
      return { month: parseInt(month), year: parseInt(year), count };
    });

    return Response.json({
      audits: {
        thisYear: auditThisYear?.count ?? 0,
        lastYear: auditLastYear?.count ?? 0,
        thisMonth: auditThisMonth?.count ?? 0,
        lastMonth: auditLastMonth?.count ?? 0,
        byStatus: Object.entries(auditStatusCounts).map(([status, count]) => ({ status, count })),
        completed: completedAudits ?? 0,
      },
      issues: {
        thisYear: issueThisYear?.count ?? 0,
        lastYear: issueLastYear?.count ?? 0,
        thisMonth: issueThisMonth?.count ?? 0,
        lastMonth: issueLastMonth?.count ?? 0,
        byUrgency: Object.entries(issueUrgencyCounts).map(([urgency, count]) => ({ urgency, count })),
        byStatus: Object.entries(issueStatusCounts).map(([status, count]) => ({ status, count })),
      },
      findings: {
        bySeverity: Object.entries(findingSeverityCounts).map(([severity, count]) => ({ severity, count })),
      },
      trend: {
        months: buildTrend(auditMonthlyRows, issueMonthlyRows),
      },
      meta: { thisYear, lastYear, thisMonth, lastMonth },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

function buildTrend(auditRows, issueRows) {
  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const now = new Date();
  const result = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    const label = MONTHS[m - 1];
    const auditRow = auditRows.find(
      (r) => parseInt(r.month) === m && parseInt(r.year) === y,
    );
    const issueRow = issueRows.find(
      (r) => parseInt(r.month) === m && parseInt(r.year) === y,
    );
    result.push({
      label,
      audits: auditRow ? parseInt(auditRow.count) : 0,
      issues: issueRow ? parseInt(issueRow.count) : 0,
    });
  }
  return result;
}
