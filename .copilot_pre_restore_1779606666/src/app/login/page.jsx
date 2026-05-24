"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, AlertCircle, Plane, Shield } from "lucide-react";

const SESSION_KEY = "audit_session";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      window.location.href = "/";
    } else {
      setChecked(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.user) {
        setError(data.error || "Identifiants invalides. Veuillez réessayer.");
        return;
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
      window.location.href = "/";
    } catch {
      setError("Erreur de connexion. Vérifiez votre connexion internet.");
    } finally {
      setLoading(false);
    }
  };

  if (!checked) return null;

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F8FAFC" }}>
      <div
        className="hidden lg:flex lg:flex-1 flex-col justify-between p-12"
        style={{ backgroundColor: "#0C1B33" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
            style={{ backgroundColor: "#CC0000", color: "#FFFFFF" }}
          >
            TA
          </div>
          <div>
            <p className="font-bold text-white text-lg leading-tight">
              Tunisair
            </p>
            <p className="text-xs leading-tight" style={{ color: "#94A3B8" }}>
              Direction Assurance Qualité et Sécurité
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#1E3A5F" }}
            >
              <Shield size={24} style={{ color: "#3B82F6" }} />
            </div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#1E3A5F" }}
            >
              <Plane size={24} style={{ color: "#3B82F6" }} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Système de gestion
            <br />
            des audits qualité
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "#94A3B8" }}>
            Plateforme centralisée pour la planification, le suivi et le
            reporting des audits de sécurité et de conformité.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Audits suivis", value: "100%" },
            { label: "Conformité", value: "PART-145" },
            { label: "Référentiel", value: "DGAC" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl p-4"
              style={{ backgroundColor: "#1E3A5F" }}
            >
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: "#CC0000", color: "#FFFFFF" }}
            >
              TA
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base leading-tight">
                Tunisair
              </p>
              <p className="text-xs leading-tight text-gray-500">
                Direction Assurance Qualité et Sécurité
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold" style={{ color: "#0C1B33" }}>
              Connexion
            </h2>
            <p className="mt-2 text-sm" style={{ color: "#6B7280" }}>
              Connectez-vous pour accéder à la plateforme d'audit.
            </p>
          </div>

          {error && (
            <div
              className="mb-6 p-4 rounded-xl flex items-start gap-3"
              style={{
                backgroundColor: "#FEF2F2",
                border: "1px solid #FCA5A5",
              }}
            >
              <AlertCircle
                size={18}
                style={{ color: "#DC2626", flexShrink: 0, marginTop: 1 }}
              />
              <p className="text-sm" style={{ color: "#DC2626" }}>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#374151" }}
              >
                Adresse e-mail
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="prenom.NOM@tunisair.com.tn"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                style={{
                  borderColor: "#D1D5DB",
                  backgroundColor: "#FFFFFF",
                  color: "#111827",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                onBlur={(e) => (e.target.style.borderColor = "#D1D5DB")}
              />
            </div>

            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#374151" }}
              >
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl border text-sm outline-none transition-all"
                  style={{
                    borderColor: "#D1D5DB",
                    backgroundColor: "#FFFFFF",
                    color: "#111827",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                  onBlur={(e) => (e.target.style.borderColor = "#D1D5DB")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded"
                  style={{ color: "#9CA3AF" }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: loading ? "#93C5FD" : "#2563EB",
                color: "#FFFFFF",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray="30 70"
                    />
                  </svg>
                  Connexion en cours…
                </span>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          <div
            className="mt-8 p-4 rounded-xl"
            style={{ backgroundColor: "#F1F5F9", border: "1px solid #E2E8F0" }}
          >
            <p
              className="text-xs font-semibold mb-2"
              style={{ color: "#64748B" }}
            >
              Compte administrateur par défaut :
            </p>
            <div className="space-y-1">
              <p className="text-xs" style={{ color: "#475569" }}>
                <span className="font-medium">Email :</span>{" "}
                Haifa.SDIRI@tunisair.com.tn
              </p>
              <p className="text-xs" style={{ color: "#475569" }}>
                <span className="font-medium">Mot de passe :</span> password
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-xs" style={{ color: "#9CA3AF" }}>
            © {new Date().getFullYear()} Tunisair — Direction Assurance Qualité
            et Sécurité
            <br />
            Système d'audit interne confidentiel
          </p>
        </div>
      </div>
    </div>
  );
}
