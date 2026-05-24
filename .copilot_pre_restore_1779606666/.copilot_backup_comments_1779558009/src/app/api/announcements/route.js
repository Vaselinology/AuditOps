import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const announcements = await sql`
      SELECT a.*, u.name as published_by_name
      FROM announcements a
      LEFT JOIN users u ON a.published_by = u.id
      WHERE a.expires_at IS NULL OR a.expires_at > CURRENT_TIMESTAMP
      ORDER BY a.published_at DESC
      LIMIT 20
    `;

    return Response.json({ announcements });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return Response.json(
      { error: "Failed to fetch announcements" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, content, priority, published_by, expires_at } = body;

    const result = await sql`
      INSERT INTO announcements (title, content, priority, published_by, expires_at)
      VALUES (${title}, ${content}, ${priority || "normal"}, ${published_by || null}, ${expires_at || null})
      RETURNING *
    `;

    return Response.json({ announcement: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return Response.json(
      { error: "Failed to create announcement" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "id is required" }, { status: 400 });
    }

    await sql`DELETE FROM announcements WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return Response.json(
      { error: "Failed to delete announcement" },
      { status: 500 },
    );
  }
}
