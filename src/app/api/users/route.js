import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const departmentId = searchParams.get("department");

    let query = supabaseServer
      .from('users')
      .select('*');

    if (role) {
      query = query.eq('role', role);
    }

    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }

    query = query.order('first_name', { ascending: true });

    const { data: users, error } = await query;

    if (error) throw error;

    // Transform users to include name property for dropdowns
    const usersWithNames = users.map(u => ({
      ...u,
      name: `${u.first_name} ${u.last_name}`.trim()
    }));

    return Response.json({ users: usersWithNames });
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, first_name, last_name, role, department_id, password_hash, title, activity } = body;

    const { data: user, error } = await supabaseServer
      .from('users')
      .insert({
        email,
        first_name,
        last_name,
        role: role || 'auditee',
        department_id: department_id || null,
        password_hash: password_hash || null,
        title: title || null,
        activity: activity || null
      })
      .select()
      .single();

    if (error) throw error;

    return Response.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, first_name, last_name, email, role, department_id, password_hash, title, activity } = body;
    if (!id) return Response.json({ error: "id required" }, { status: 400 });

    const updateData = {};
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (department_id !== undefined) updateData.department_id = department_id;
    if (password_hash !== undefined) updateData.password_hash = password_hash;
    if (title !== undefined) updateData.title = title;
    if (activity !== undefined) updateData.activity = activity;

    const { data: user, error } = await supabaseServer
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return Response.json({ user });
  } catch (error) {
    console.error("Error updating user:", error);
    return Response.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return Response.json({ error: "id required" }, { status: 400 });

    const { error } = await supabaseServer
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return Response.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
