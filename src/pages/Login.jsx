
import { useState } from "react";
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed. Please check your credentials.");
        return;
      }

      if (!data.token || !data.user) {
        alert("Login response is incomplete. Please try again.");
        return;
      }

      // Update AuthContext and persist the session.
      login(data.token, data.user);

      // Redirect to the dashboard after successful login.
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      alert(
        "Unable to connect to the server. Please ensure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100/60">
      <div className="flex min-h-screen items-center justify-center px-6 py-4">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:max-h-[calc(100vh-2rem)] lg:grid-cols-2">

          {/* LEFT — BRANDING */}
          <div className="relative hidden overflow-hidden bg-blue-600 p-9 lg:flex lg:flex-col lg:justify-between">
            {/* Decorative circles */}
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/40" />
            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-blue-700/40" />

            {/* Logo */}
            <div className="relative flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600">
                <Sparkles size={20} />
              </div>

              <div>
                <h1 className="text-base font-bold text-white">
                  Placement
                </h1>
                <p className="text-xs font-medium text-blue-100">
                  Copilot
                </p>
              </div>
            </div>

            {/* Main message */}
            <div className="relative">
              <p className="text-sm font-medium text-blue-100">
                Your AI-powered career companion
              </p>

              <h2 className="mt-3 max-w-md text-4xl font-bold leading-tight tracking-tight text-white">
                Prepare smarter.
                <br />
                Get placement ready.
              </h2>

              <p className="mt-4 max-w-md text-sm leading-6 text-blue-100">
                Analyze your resume, match job opportunities, practice
                interviews, build your roadmap, and learn from your own
                documents — all in one place.
              </p>

              {/* Feature list */}
              <div className="mt-6 space-y-3">
                <Feature text="AI-powered resume analysis" />
                <Feature text="Personalized interview preparation" />
                <Feature text="Smart learning roadmaps" />
              </div>
            </div>

            {/* Bottom */}
            <p className="relative text-xs text-blue-200">
              Built for students, powered by AI.
            </p>
          </div>

          {/* RIGHT — LOGIN FORM */}
          <div className="flex items-center justify-center px-8 py-6 sm:px-10 sm:py-7">
            <div className="w-full max-w-md">

              {/* Mobile logo */}
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <Sparkles size={20} />
                </div>

                <div>
                  <h1 className="text-base font-bold text-slate-900">
                    Placement
                  </h1>
                  <p className="text-xs font-medium text-slate-500">
                    Copilot
                  </p>
                </div>
              </div>

              {/* Heading */}
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Sign in to continue your placement preparation.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-700"
                  >
                    Email address
                  </label>

                  <div className="relative mt-2">
                    <Mail
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-slate-700"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        alert("Password reset is not available yet.")
                      }
                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative mt-2">
                    <Lock
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-11 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((previous) => !previous)
                      }
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Signing in..." : "Sign in"}
                  {!loading && <ArrowRight size={17} />}
                </button>
              </form>

              {/* Divider */}
              <div className="my-5 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs text-slate-400">or</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Demo button */}
              <button
                type="button"
                onClick={() =>
                  alert("Demo login is not configured yet. Please sign in with your account.")
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Continue as demo user
              </button>

              {/* Register */}
              <p className="mt-5 text-center text-sm text-slate-500">
                Don't have an account?
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="ml-1 font-semibold text-blue-600 hover:text-blue-700"
                >
                  Create one
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Feature bullet */
function Feature({ text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-white">
        <span className="text-xs">✓</span>
      </div>

      <span className="text-sm text-blue-50">{text}</span>
    </div>
  );
}

export default Login;
