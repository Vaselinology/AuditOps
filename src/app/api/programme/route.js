import { supabase } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const plan_id = searchParams.get("plan_id") || 1;
    const year = searchParams.get("year") || new Date().getFullYear();

    const { data: rows } = await supabase
      .from('programme_rows')
      .select('*')
      .eq('plan_id', plan_id)
      .eq('year', year)
      .order('sort_order', { ascending: true })
      .order('domain', { ascending: true })
      .order('referentiel', { ascending: true });

    const rowIds = rows?.map((r) => r.id) || [];
    let slots = [];
    if (rowIds.length > 0) {
      const { data: slotsData } = await supabase
        .from('programme_slots')
        .select('*')
        .in('row_id', rowIds)
        .order('original_month', { ascending: true })
        .order('original_week', { ascending: true });
      slots = slotsData || [];
    }

    return Response.json({ rows, slots });
  } catch (error) {
    console.error("Error fetching programme:", error);
    return Response.json(
      { error: "Failed to fetch programme" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { plan_id, year, domain, referentiel } = body;

    const { data: maxOrderData } = await supabase
      .from('programme_rows')
      .select('sort_order')
      .eq('plan_id', plan_id)
      .eq('year', year)
      .order('sort_order', { ascending: false })
      .limit(1);

    const sort_order = (maxOrderData?.[0]?.sort_order || 0) + 1;

    const { data: row } = await supabase
      .from('programme_rows')
      .insert({
        plan_id,
        year,
        domain,
        referentiel,
        sort_order
      })
      .select()
      .single();

    return Response.json({ row }, { status: 201 });
  } catch (error) {
    console.error("Error creating programme row:", error);
    return Response.json({ error: "Failed to create row" }, { status: 500 });
  }
}
