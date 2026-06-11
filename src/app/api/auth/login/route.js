import { supabase } from '@/lib/supabase';
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    console.log("Login request received");
    const body = await request.json();
    console.log("Login request body:", body);
    const { email, password } = body;

    if (!email || !password) {
      console.log("Missing email or password");
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const emailNorm = email.trim();

    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, role, department_id, title, password_hash')
      .eq('email', emailNorm)
      .single();

    // 🚨 handle query error OR user not found
    if (error || !data) {
      return Response.json(
        { error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    // ✅ compare password
    const passwordOk = await bcrypt.compare(password, data.password_hash);

    if (!passwordOk) {
      return Response.json(
        { error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    // ✅ build user object
    const user = {
      id: data.id,
      name: `${data.first_name} ${data.last_name}`,
      email: data.email,
      role: data.role,
      department: data.department_id || "",
      title: data.title || "",
    };

    return Response.json({ user });

  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}