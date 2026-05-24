import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");
    const unread_only = searchParams.get("unread_only") === "true";

    if (!user_id) {
      return Response.json({ error: "user_id is required" }, { status: 400 });
    }

    let query = "SELECT * FROM notifications WHERE user_id = $1";
    const params = [user_id];

    if (unread_only) {
      query += " AND is_read = false";
    }

    query += " ORDER BY created_at DESC LIMIT 50";

    const notifications = await sql(query, params);
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

    await sql`UPDATE notifications SET is_read = ${is_read !== false} WHERE id = ${notification_id}`;
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

    const result = await sql`
      INSERT INTO notifications (user_id, title, message, type, related_id, is_read)
      VALUES (${user_id}, ${title}, ${message}, ${type || "info"}, ${related_id || null}, false)
      RETURNING *
    `;

    return Response.json({ notification: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return Response.json(
      { error: "Failed to create notification" },
      { status: 500 },
    );
  }
}
