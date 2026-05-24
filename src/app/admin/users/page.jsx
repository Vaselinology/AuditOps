"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import AppShell from "@/components/AppShell";
import { Plus, X, Pencil, Trash2 } from "lucide-react";

// ─────────────────────────────────────────────
// Manage Users — Admin Page
// Lets admins view, add, edit and delete users.
// ─────────────────────────────────────────────

export default function ManageUsers() {
  const { theme, t } = useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | "add" | { editing user }
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "user",
    department: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isDark = theme === "dark";
  const bg = isDark ? "#111827" : "#FFFFFF";
  const bgMuted = isDark ? "#1F2937" : "#F9FAFB";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textMuted = isDark ? "#9CA3AF" : "#6B7280";
  const borderColor = isDark ? "#374151" : "#E5E7EB";

  // ── Load users ──
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ── Open modal ──
  const openAdd = () => {
    setForm({ name: "", email: "", role: "user", department: "" });
    setError(null);
    setModal("add");
  };

  const openEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || "",
    });
    setError(null);
    setModal(user);
  };

  // ── Save user (create or update) ──
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const isEdit = modal !== "add";
      const res = await fetch("/api/users", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { id: modal.id, ...form } : form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save");
      }
      setModal(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete user ──
  const handleDelete = async (userId) => {
    if (!confirm("Delete this user?")) return;
    try {
      await fetch(`/api/users?id=${userId}`, { method: "DELETE" });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // ── Role color ──
  const roleColor = (role) => {
    if (role === "admin") return { color: "#2563EB", bg: "#EFF6FF" };
    if (role === "auditor") return { color: "#059669", bg: "#D1FAE5" };
    return { color: "#6B7280", bg: "#F3F4F6" };
  };

  // ── Input style ──
  const inputCls =
    "w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const iStyle = { borderColor, backgroundColor: bg, color: textPrimary };

  return (
    <AppShell
      title="Manage Users"
      actions={
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
        >
          <Plus size={15} /> Add User
        </button>
      }
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <p className="text-center py-12 text-sm" style={{ color: textMuted }}>
            Loading users…
          </p>
        ) : (
          <div
            className="rounded-xl border overflow-hidden"
            style={{ borderColor }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: bgMuted }}>
                  {["Name", "Email", "Role", "Department", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide"
                        style={{ color: textMuted }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center"
                      style={{ color: textMuted }}
                    >
                      No users found
                    </td>
                  </tr>
                )}
                {users.map((user, i) => {
                  const rc = roleColor(user.role);
                  return (
                    <tr
                      key={user.id}
                      className="border-t"
                      style={{
                        borderColor,
                        backgroundColor: i % 2 === 0 ? bg : bgMuted,
                      }}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                            style={{
                              backgroundColor: "#EFF6FF",
                              color: "#2563EB",
                            }}
                          >
                            {user.name?.charAt(0)}
                          </div>
                          <span
                            className="font-medium"
                            style={{ color: textPrimary }}
                          >
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3" style={{ color: textMuted }}>
                        {user.email}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-medium capitalize"
                          style={{ color: rc.color, backgroundColor: rc.bg }}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-3" style={{ color: textMuted }}>
                        {user.department || "—"}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(user)}
                            className="p-1.5 rounded hover:bg-blue-50"
                            style={{ color: "#2563EB" }}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-1.5 rounded hover:bg-red-50"
                            style={{ color: "#DC2626" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {modal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setModal(null)}
        >
          <div
            className="rounded-xl border p-6 w-full max-w-md"
            style={{ backgroundColor: bg, borderColor }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3
                className="font-semibold text-base"
                style={{ color: textPrimary }}
              >
                {modal === "add" ? "Add New User" : "Edit User"}
              </h3>
              <button
                onClick={() => setModal(null)}
                style={{ color: textMuted }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: textPrimary }}
                >
                  Full Name
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className={inputCls}
                  style={iStyle}
                  placeholder="Jean Dupont"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: textPrimary }}
                >
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className={inputCls}
                  style={iStyle}
                  placeholder="jean@company.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: textPrimary }}
                  >
                    Role
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, role: e.target.value }))
                    }
                    className={inputCls}
                    style={iStyle}
                  >
                    <option value="user">User</option>
                    <option value="auditor">Auditor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: textPrimary }}
                  >
                    Department
                  </label>
                  <input
                    value={form.department}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, department: e.target.value }))
                    }
                    className={inputCls}
                    style={iStyle}
                    placeholder="Quality"
                  />
                </div>
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="px-4 py-2 rounded-lg border text-sm font-medium"
                  style={{ borderColor, color: textPrimary }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
                >
                  {saving
                    ? "Saving…"
                    : modal === "add"
                      ? "Add User"
                      : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
