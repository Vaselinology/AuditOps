import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const department = searchParams.get("department");

    let query = "SELECT * FROM users WHERE 1=1";
    const params = [];
    let paramCount = 1;

    if (role) {
      query += ` AND role = $${paramCount}`;
      params.push(role);
      paramCount++;
    }

    if (department) {
      query += ` AND department = $${paramCount}`;
      params.push(department);
      paramCount++;
    }

    query += " ORDER BY name ASC";

    const users = await sql(query, params);
    return Response.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, name, role, department } = body;

    const result = await sql`
      INSERT INTO users (email, name, role, department)
      VALUES (${email}, ${name}, ${role || "user"}, ${department || null})
      RETURNING *
    `;

    return Response.json({ user: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, name, email, role, department } = body;
    if (!id) return Response.json({ error: "id required" }, { status: 400 });

    const result = await sql`
      UPDATE users
      SET name=${name}, email=${email}, role=${role || "user"}, department=${department || null}
      WHERE id=${id}
      RETURNING *
    `;
    return Response.json({ user: result[0] });
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
    await sql`DELETE FROM users WHERE id=${id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return Response.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
