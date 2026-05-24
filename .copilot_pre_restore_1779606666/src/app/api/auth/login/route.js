import sql from "@/app/api/utils/sql";

const HARDCODED_ADMIN = {
  id: 1,
  name: "Haifa Sdiri",
  email: "Haifa.SDIRI@tunisair.com.tn",
  role: "admin",
  department: "Administration",
  title: "Administrator",
};

const DEFAULT_PASSWORD = "password";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const emailNorm = email.trim().toLowerCase();

    let userRow = null;

    try {
      const rows = await sql`
        SELECT id, name, email, role, department
        FROM users
        WHERE LOWER(email) = ${emailNorm}
        LIMIT 1
      `;
      if (rows.length > 0) userRow = rows[0];
    } catch {
      if (
        emailNorm === HARDCODED_ADMIN.email.toLowerCase() &&
        password === DEFAULT_PASSWORD
      ) {
        return Response.json({ user: HARDCODED_ADMIN });
      }
      return Response.json(
        { error: "Identifiants invalides" },
        { status: 401 },
      );
    }

    if (!userRow) {
      return Response.json(
        { error: "Identifiants invalides" },
        { status: 401 },
      );
    }

    const passwordOk = password === DEFAULT_PASSWORD;
    if (!passwordOk) {
      return Response.json(
        { error: "Identifiants invalides" },
        { status: 401 },
      );
    }

    const user = {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      role: userRow.role,
      department: userRow.department || "",
      title: userRow.title || "",
    };

    return Response.json({ user });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
