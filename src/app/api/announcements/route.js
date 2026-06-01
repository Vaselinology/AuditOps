import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request) {
  try {
    const { data: announcements, error } = await supabaseServer
      .from('announcements')
      .select(`
        *,
        users!announcements_published_by_fkey (
          first_name,
          last_name,
          email
        )
      `)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    const transformedAnnouncements = announcements.map(announcement => ({
      ...announcement,
      published_by_name: announcement.users ? `${announcement.users.first_name} ${announcement.users.last_name}` : null
    }));

    return Response.json({ announcements: transformedAnnouncements });
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

    const { data: announcement, error } = await supabaseServer
      .from('announcements')
      .insert({
        title,
        content,
        priority: priority || 'normal',
        published_by: published_by || null,
        expires_at: expires_at || null
      })
      .select()
      .single();

    if (error) throw error;

    return Response.json({ announcement }, { status: 201 });
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

    const { error } = await supabaseServer
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return Response.json(
      { error: "Failed to delete announcement" },
      { status: 500 },
    );
  }
}
