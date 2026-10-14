
import { useState } from "react";
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    const name = formData.name.trim();
    const email = formData.email.trim();

    if (!name) {
      alert("Please enter your full name.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (
      formData.password.length < 6 ||
      formData.password.length > 72
    ) {
      alert("Password must be between 6 and 72 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Registration failed. Please try again.");
        return;
      }

      if (!data.token || !data.user) {
        alert("Registration response is incomplete. Please try again.");
        return;
      }

      // Update AuthContext and persist the session.
      login(data.token, data.user);

      // Redirect after successful registration.
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Registration error:", error);
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
                Start your placement journey
              </p>

              <h2 className="mt-3 max-w-md text-4xl font-bold leading-tight tracking-tight text-white">
                Your career.
                <br />
                Your roadmap.
              </h2>

              <p className="mt-4 max-w-md text-sm leading-6 text-blue-100">
                Build stronger resumes, practice interviews, discover your
                skill gaps, and prepare smarter with your AI-powered career
                companion.
              </p>

              {/* Feature list */}
              <div className="mt-6 space-y-3">
                <Feature text="Analyze and improve your resume" />
                <Feature text="Match your skills with job descriptions" />
                <Feature text="Build a personalized preparation roadmap" />
              </div>
            </div>

            {/* Bottom */}
            <p className="relative text-xs text-blue-200">
              Built for students, powered by AI.
            </p>
          </div>

          {/* RIGHT — REGISTER FORM */}
          <div className="flex items-center justify-center px-8 py-5 sm:px-10 sm:py-6">
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
                  Create your account
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Start your journey towards placement readiness.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">

                {/* Full Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-slate-700"
                  >
                    Full name
                  </label>

                  <div className="relative mt-2">
                    <User
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      autoComplete="name"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                </div>

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
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>

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
                      placeholder="Create a password"
                      autoComplete="new-password"
                      minLength={6}
                      maxLength={72}
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

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-slate-700"
                  >
                    Confirm password
                  </label>

                  <div className="relative mt-2">
                    <Lock
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      minLength={6}
                      maxLength={72}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-11 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((previous) => !previous)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? (
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
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Creating account..." : "Create account"}
                  {!loading && <ArrowRight size={17} />}
                </button>
              </form>

              {/* Login link */}
              <p className="mt-5 text-center text-sm text-slate-500">
                Already have an account?
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="ml-1 font-semibold text-blue-600 hover:text-blue-700"
                >
                  Sign in
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

export default Register;
