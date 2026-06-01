import { supabaseServer } from '@/lib/supabase-server';
// GET: Fetch events
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");

    let query = supabaseServer
      .from('calendar_events')
      .select('*');

    if (start_date) {
      query = query.gte('event_date', start_date);
    }

    if (end_date) {
      query = query.lte('event_date', end_date);
    }

    const { data, error } = await query.order('event_date', {
      ascending: true,
    });

    if (error) throw error;

    return Response.json({ events: data });
  } catch (error) {
    console.error("GET calendar error:", error);
    return Response.json(
      { error: error.message || "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// POST: Create event
// ─────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      title,
      description,
      event_date,
      event_type,
      related_id,
    } = body;

    // basic validation
    if (!title || !event_date) {
      return Response.json(
        { error: "Title and event_date are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from('calendar_events')
      .insert([
        {
          title,
          description,
          event_date,
          event_type,
          related_id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return Response.json({ event: data });
  } catch (error) {
    console.error("POST calendar error:", error);
    return Response.json(
      { error: error.message || "Failed to create calendar event" },
      { status: 500 }
    );
  }
}