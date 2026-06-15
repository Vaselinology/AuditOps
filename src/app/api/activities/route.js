import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    let query = supabaseServer
      .from('activities')
      .select('*')
      .order('name', { ascending: true });

    if (type) {
      query = query.eq('type', type);
    }

    const { data: activities, error } = await query;

    if (error) throw error;

    return Response.json({ activities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return Response.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}
