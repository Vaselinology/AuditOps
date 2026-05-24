import { supabase } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");

    let query = supabase
      .from('calendar_events')
      .select('*');

    if (start_date) {
      query = query.gte('event_date', start_date);
    }

    if (end_date) {
      query = query.lte('event_date', end_date);
    }

    query = query.order('event_date', { ascending: true });

    const { data: events, error } = await query;

    if (error) throw error;

    return Response.json({ events });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return Response.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 },
    );
  }
}
