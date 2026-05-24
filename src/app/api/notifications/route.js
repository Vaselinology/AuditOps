import { supabase } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");
    const unread_only = searchParams.get("unread_only") === "true";

    if (!user_id) {
      return Response.json({ error: "user_id is required" }, { status: 400 });
    }

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user_id);

    if (unread_only) {
      query = query.eq('is_read', false);
    }

    query = query.order('created_at', { ascending: false }).limit(50);

    const { data: notifications, error } = await query;

    if (error) throw error;

    return Response.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return Response.json(
      { error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { notification_id, is_read } = body;

    if (!notification_id) {
      return Response.json(
        { error: "notification_id is required" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: is_read !== false })
      .eq('id', notification_id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating notification:", error);
    return Response.json(
      { error: "Failed to update notification" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { user_id, title, message, type, related_id } = body;

    if (!user_id || !title || !message) {
      return Response.json(
        { error: "user_id, title, and message are required" },
        { status: 400 },
      );
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id,
        title,
        message,
        type: type || 'info',
        related_id: related_id || null,
        is_read: false
      })
      .select()
      .single();

    if (error) throw error;

    return Response.json({ notification }, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return Response.json(
      { error: "Failed to create notification" },
      { status: 500 },
    );
  }
}
