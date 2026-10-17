
import { useState } from "react";
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          `The server returned an unexpected response (${response.status}). Please check the API URL and backend routes.`
        );
      }

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Login failed. Please check your credentials."
        );
        return;
      }

      if (!data.token || !data.user) {
        setError("Login response is incomplete. Please try again.");
        return;
      }

      login(data.token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.message?.includes("unexpected response")
          ? err.message
          : "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (loading) return;

    if (!credentialResponse?.credential) {
      setError("Google did not return a credential. Please try again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          `The server returned an unexpected response (${response.status}). Please check the backend route.`
        );
      }

      const data = await response.json();

      if (!response.ok || !data.token || !data.user) {
        setError(
          data.message || "Google sign-in failed. Please try again."
        );
        return;
      }

      login(data.token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Google sign-in error:", err);

      setError(
        err.message?.includes("unexpected response")
          ? err.message
          : "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google sign-in was unsuccessful. Please try again.");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#171614] px-4 py-5 text-[#F0ECE5] sm:px-6 sm:py-8">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(173,135,91,0.10),transparent_70%)] blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(135,145,119,0.06),transparent_70%)] blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-2.5rem)] w-full max-w-6xl overflow-hidden rounded-[28px] border border-[#403B35] bg-[#1E1C19] shadow-[0_25px_80px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.035)] lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[0.92fr_1.08fr]">
        {/* Branding panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden border-r border-[#403B35] bg-gradient-to-br from-[#29251F] via-[#211F1B] to-[#191817] p-10 lg:flex xl:p-12">
          <div className="pointer-events-none absolute -right-20 -top-16 h-72 w-72 rounded-full border border-[#C5A984]/10" />
          <div className="pointer-events-none absolute -right-10 -top-8 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(197,169,132,0.09),transparent_70%)]" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(135,145,119,0.08),transparent_70%)]" />

          <Branding />

          <div className="relative my-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#65513C]/70 bg-[#332A21]/70 px-3 py-1.5 text-xs font-medium text-[#D8BD98]">
              <Sparkles size={13} />
              YOUR AI-POWERED CAREER COMPANION
            </span>

            <h2 className="mt-6 max-w-md text-4xl font-semibold leading-[1.15] tracking-[-0.04em] xl:text-5xl">
              Your future
              <br />
              looks{" "}
              <span className="bg-gradient-to-r from-[#E7D8C1] via-[#C5A984] to-[#A99175] bg-clip-text text-transparent">
                promising.
              </span>
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-[#AAA093]">
              Prepare for placements with tools that help you understand your
              strengths, improve your skills, and feel more confident about
              what&apos;s next.
            </p>

            <div className="mt-8 space-y-4">
              <Feature text="AI-powered resume analysis" />
              <Feature text="Personalized interview preparation" />
              <Feature text="Learning roadmaps built around your goals" />
            </div>

            <div className="mt-9 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#A4B49A]" />
              <span className="text-xs text-[#AAA093]">
                One step closer to your goals
              </span>
            </div>
          </div>

          <Footer />
        </div>

        {/* Login form */}
        <div className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden">
              <Branding />
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C5A984]">
                WELCOME BACK
              </span>

              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#F0ECE5] sm:text-4xl">
                Let&apos;s get you in.
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#AAA093]">
                Sign in to pick up where you left off.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-3 rounded-xl border border-[#744540] bg-[#332321] p-3.5 text-sm text-[#E7B2A9]"
              >
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                <p className="leading-6">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <FormField label="Email address" htmlFor="email">
                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#81796F]"
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
                    className="w-full rounded-xl border border-[#403B35] bg-[#191817] py-3.5 pl-11 pr-4 text-sm text-[#F0ECE5] outline-none transition placeholder:text-[#746D63] focus:border-[#9B7B53] focus:ring-4 focus:ring-[#C5A984]/10"
                  />
                </div>
              </FormField>

              <FormField label="Password" htmlFor="password">
                <div className="relative">
                  <Lock
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#81796F]"
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
                    className="w-full rounded-xl border border-[#403B35] bg-[#191817] py-3.5 pl-11 pr-12 text-sm text-[#F0ECE5] outline-none transition placeholder:text-[#746D63] focus:border-[#9B7B53] focus:ring-4 focus:ring-[#C5A984]/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#81796F] transition hover:bg-[#292621] hover:text-[#D8BD98]"
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </FormField>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#D8C1A0] bg-gradient-to-br from-[#D8C1A0] to-[#B39470] px-5 py-3.5 text-sm font-semibold text-[#241E17] shadow-[0_5px_20px_rgba(160,126,86,0.10)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#241E17]/30 border-t-[#241E17]" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#35312B]" />
              <span className="text-xs text-[#746D63]">
                OR CONTINUE WITH
              </span>
              <div className="h-px flex-1 bg-[#35312B]" />
            </div>

            <div className="flex justify-center">
              <div className="google-login-wrapper w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_black"
                  shape="rectangular"
                  size="large"
                  width="100%"
                  text="continue_with"
                />
              </div>
            </div>

            <div className="mt-7 flex items-start gap-3 rounded-xl border border-[#35312B] bg-[#191817] p-4">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-[#A4B49A]"
              />

              <div>
                <p className="text-sm font-medium text-[#E9E2D8]">
                  Your workspace awaits
                </p>
                <p className="mt-1 text-xs leading-5 text-[#928A80]">
                  Sign in to access your saved progress, resume tools, and
                  interview preparation.
                </p>
              </div>
            </div>

            <p className="mt-7 text-center text-sm text-[#928A80]">
              Don&apos;t have an account?
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="ml-1.5 font-semibold text-[#D8BD98] transition hover:text-[#F0ECE5]"
              >
                Create an account
              </button>
            </p>

            <p className="mt-10 text-center text-xs text-[#746D63]">
              Your career journey, one step at a time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Branding() {
  return (
    <div className="relative flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#65513C]/70 bg-gradient-to-br from-[#D8C1A0] to-[#A88A65] text-[#241E17]">
        <Sparkles size={21} />
      </div>

      <div>
        <h1 className="text-base font-bold tracking-tight text-[#F0ECE5]">
          Ascend
        </h1>
        <p className="mt-0.5 text-xs text-[#928A80]">
          Your next chapter starts here
        </p>
      </div>
    </div>
  );
}

function Feature({ text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#465B45] bg-[#293328] text-[#B5C4AA]">
        <Check size={13} />
      </div>

      <span className="text-sm text-[#C9C1B6]">{text}</span>
    </div>
  );
}

function FormField({ label, htmlFor, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-medium text-[#D9D1C6]"
      >
        {label}
      </label>

      {children}
    </div>
  );
}

function Footer() {
  return (
    <p className="relative text-xs text-[#81796F]">
      Built for students, powered by AI.
    </p>
  );
}

export default Login;
