import { supabase } from '@/lib/supabase';

const HARDCODED_ADMIN = {
  id: 1,
  name: "Haifa Sdiri",
  email: "Haifa.SDIRI@tunisair.com.tn",
  role: "admin",
  department: "Administration",
  title: "Administrator",
};

const DEFAULT_PASSWORD = "password";

export async function action({ request }: { request: Request }) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    if (!supabase) {
      console.error("Supabase client not initialized - check environment variables");
      return Response.json(
        { error: "Database configuration error" },
        { status: 500 },
      );
    }

    const emailNorm = email.trim().toLowerCase();

    let userRow = null;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, role, department_id, title')
        .eq('email', emailNorm)
        .limit(1)
        .single();
      
      if (error) {
        console.error("Supabase query error:", error);
      }
      
      if (data) {
        userRow = {
          id: data.id,
          name: `${data.first_name} ${data.last_name}`,
          email: data.email,
          role: data.role,
          department: data.department_id,
          title: data.title
        };
      }
    } catch (err) {
      console.error("Database query error:", err);
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
