import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Map,
  MessageCircle,
  Mic2,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const palettes = {
  champagne: {
    icon: "border-[#5A4A38]/60 bg-[#393126] text-[#D5BB96]",
    hover: "hover:border-[#8A7559]",
  },
  rose: {
    icon: "border-[#624447]/60 bg-[#35282A] text-[#CBA09A]",
    hover: "hover:border-[#805B58]",
  },
  sage: {
    icon: "border-[#465344]/60 bg-[#283029] text-[#A8B79E]",
    hover: "hover:border-[#62735C]",
  },
  silver: {
    icon: "border-[#484642]/60 bg-[#302F2C] text-[#C4C0B8]",
    hover: "hover:border-[#6A655D]",
  },
};

const tools = [
  {
    title: "Resume Analyzer",
    description:
      "Discover resume gaps and improve your ATS compatibility.",
    action: "Analyze resume",
    icon: FileText,
    palette: "champagne",
    route: "/resume-analyzer",
    number: "01",
  },
  {
    title: "Resume Matcher",
    description:
      "Compare your resume with a job description and identify missing skills.",
    action: "Match a job",
    icon: BriefcaseBusiness,
    palette: "rose",
    route: "/resume-matcher",
    number: "02",
  },
  {
    title: "Interview Prep",
    description:
      "Practice interview questions and build confidence for your next opportunity.",
    action: "Start practicing",
    icon: Mic2,
    palette: "silver",
    route: "/interview-prep",
    number: "03",
  },
  {
    title: "PDF Assistant",
    description:
      "Explore your study material and get answers from your documents.",
    action: "Open assistant",
    icon: MessageCircle,
    palette: "sage",
    route: "/pdf-assistant",
    number: "04",
  },
];

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [dashboardUser, setDashboardUser] = useState(user);
  const [stats, setStats] = useState({
    latestAtsScore: null,
    totalResumeAnalyses: 0,
    latestMatch: null,
    preparationProgress: 0,
    completedWeeks: 0,
    totalWeeks: 8,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const API_URL =
          import.meta.env.VITE_API_URL || "http://localhost:5000";

        const response = await fetch(`${API_URL}/api/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load dashboard."
          );
        }

        if (!cancelled) {
          if (data.user) setDashboardUser(data.user);

          if (data.stats) {
            setStats((previous) => ({
              ...previous,
              ...data.stats,
            }));
          }

          setRecentActivity(data.recentActivity || []);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Dashboard fetch error:", err);
          setError(err.message || "Unable to load dashboard data.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, [navigate, logout]);

  const displayName = dashboardUser?.name?.trim() || "there";
  const firstName = displayName.split(" ")[0];

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 17
        ? "Good afternoon"
        : "Good evening";

  function formatTime(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  const progress = Math.min(
    100,
    Math.max(0, Number(stats.preparationProgress) || 0)
  );

  const statCards = [
    {
      label: "Resume ATS score",
      value: stats.latestAtsScore ?? "—",
      suffix: stats.latestAtsScore == null ? "" : "/100",
      description:
        stats.totalResumeAnalyses > 0
          ? `${stats.totalResumeAnalyses} saved ${
              stats.totalResumeAnalyses === 1
                ? "analysis"
                : "analyses"
            }`
          : "Your resume score will appear here",
      icon: FileText,
      palette: "champagne",
      route: "/resume-analyzer",
    },
    {
      label: "Latest job match",
      value:
        stats.latestMatch == null
          ? "—"
          : `${stats.latestMatch}%`,
      suffix: "",
      description:
        stats.latestMatch == null
          ? "Find roles that fit your skills"
          : "Your latest resume match",
      icon: Target,
      palette: "rose",
      route: "/resume-matcher",
    },
    {
      label: "Preparation progress",
      value: `${progress}%`,
      suffix: "",
      description: `${stats.completedWeeks ?? 0} of ${
        stats.totalWeeks ?? 8
      } weeks completed`,
      icon: TrendingUp,
      palette: "sage",
      route: "/roadmap",
    },
  ];

  return (
    <div className="relative isolate mx-auto max-w-[1500px] space-y-10 pb-8">
      {/* Ambient page lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-12 -top-24 -z-10 h-[850px] bg-[radial-gradient(ellipse_at_12%_8%,rgba(183,161,138,0.075),transparent_42%),radial-gradient(ellipse_at_88%_20%,rgba(167,127,121,0.065),transparent_38%),radial-gradient(ellipse_at_50%_80%,rgba(130,145,125,0.035),transparent_44%)]"
      />

      {/* Welcome banner */}
      <section className="group relative isolate overflow-hidden rounded-[28px] border border-[#49413B] bg-gradient-to-br from-[#252321] via-[#1D1C1C] to-[#262120] shadow-[0_22px_65px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(237,220,196,0.075)] transition-all duration-300 hover:border-[#5B5046]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-44 -z-10 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(183,161,138,0.17)_0%,rgba(183,161,138,0.045)_42%,transparent_70%)] blur-2xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-44 left-[25%] -z-10 h-[350px] w-[520px] rounded-full bg-[radial-gradient(ellipse,rgba(167,127,121,0.10),transparent_70%)] blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-36 -z-10 h-[370px] w-[370px] rounded-full border border-[#B7A18A]/20 shadow-[0_0_45px_rgba(183,161,138,0.035)]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-24 -z-10 h-[300px] w-[300px] rounded-full border border-[#B7A18A]/10"
        />

        <div className="relative p-6 sm:p-9 lg:p-10">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#655747]/65 bg-[#302B26]/80 px-3.5 py-2 text-[10px] font-semibold tracking-[0.17em] text-[#C9B398] shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] backdrop-blur-md">
                <Sparkles size={14} />
                YOUR PLACEMENT WORKSPACE
              </div>

              <h1 className="mt-7 text-4xl font-semibold leading-[1.12] tracking-[-0.045em] text-[#F0ECE5] sm:text-5xl lg:text-[58px]">
                {greeting},
                <br />
                <span className="bg-gradient-to-r from-[#F0E8DC] via-[#D4BFA5] to-[#B69C83] bg-clip-text text-transparent">
                  {firstName}.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-[#B5AEA5] sm:text-base sm:leading-8">
                Let's get you one step closer to your dream role.
                Small steps today can make a real difference tomorrow.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/roadmap")}
              className="group/cta inline-flex w-fit shrink-0 items-center gap-3 rounded-xl border border-[#D1B99A]/60 bg-gradient-to-b from-[#D1B99A] to-[#B49A7D] px-5 py-3.5 text-sm font-semibold text-[#24201B] shadow-[0_8px_24px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:from-[#DDC7A9] hover:to-[#C2A788] hover:shadow-[0_12px_30px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B7A18A]"
            >
              View my roadmap
              <ArrowRight
                size={17}
                className="transition-transform duration-200 group-hover/cta:translate-x-1"
              />
            </button>
          </div>

          {dashboardUser?.email && (
            <div className="mt-8 flex items-center gap-3 border-t border-[#49413B]/80 pt-5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#91A184] shadow-[0_0_9px_rgba(145,161,132,0.45)]" />
              <p className="text-xs text-[#A29A90]">
                Signed in as {dashboardUser.email}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-[#393633] bg-gradient-to-r from-[#1D1C1C] to-[#222120] p-4 text-sm text-[#B4ADA4] shadow-[0_8px_24px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.025)]">
          Loading your latest preparation data...
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-[#654744] bg-gradient-to-r from-[#302322] to-[#292120] p-4 text-sm text-[#D6AAA2] shadow-[0_8px_24px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(214,170,162,0.045)] sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-fit font-semibold underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      {/* Statistics */}
      <section>
        <SectionHeading
          eyebrow="YOUR PROGRESS"
          title="The numbers so far"
          description="A clearer picture of where your preparation stands."
        />

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const palette = palettes[stat.palette];

            return (
              <button
                key={stat.label}
                type="button"
                onClick={() => navigate(stat.route)}
                className={`group relative isolate flex min-h-[192px] flex-col justify-between overflow-hidden rounded-[22px] border border-[#3D3935] bg-gradient-to-br from-[#252321] via-[#201F1E] to-[#1B1A1A] p-5 text-left shadow-[0_10px_30px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(237,220,196,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-[#625448] hover:shadow-[0_18px_42px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(237,220,196,0.075)] sm:p-6`}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-14 -top-20 -z-10 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(183,161,138,0.10),transparent_70%)] opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                />

                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#B4ADA4]">
                      {stat.label}
                    </p>

                    <div className="mt-4 flex items-baseline gap-1.5">
                      <span className="text-4xl font-semibold tracking-[-0.04em] text-[#F0ECE5]">
                        {stat.value}
                      </span>

                      {stat.suffix && (
                        <span className="text-sm text-[#948B80]">
                          {stat.suffix}
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] ${palette.icon}`}
                  >
                    <Icon size={20} strokeWidth={1.7} />
                  </span>
                </div>

                <div className="relative mt-6 flex items-end justify-between gap-3">
                  <p className="text-xs leading-5 text-[#948D84]">
                    {stat.description}
                  </p>

                  <ArrowUpRight
                    size={17}
                    className="shrink-0 text-[#8E877D] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#C5AD8F]"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Tools */}
      <section>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="YOUR TOOLKIT"
            title="Make your next move"
            description="Thoughtful tools to help you prepare for what comes next."
          />

          <span className="text-[10px] font-semibold tracking-[0.18em] text-[#817B72]">
            04 TOOLS
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const palette = palettes[tool.palette];

            return (
              <button
                key={tool.route}
                type="button"
                onClick={() => navigate(tool.route)}
                className={`group relative isolate flex min-h-[260px] flex-col overflow-hidden rounded-[22px] border border-[#3D3935] bg-gradient-to-br from-[#252321] via-[#201F1E] to-[#1B1A1A] p-5 text-left shadow-[0_10px_30px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(237,220,196,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-[#625448] hover:shadow-[0_18px_42px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(237,220,196,0.075)] ${palette.hover} sm:p-6`}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-16 -top-20 -z-10 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(183,161,138,0.095),transparent_70%)] opacity-60 transition-opacity duration-300 group-hover:opacity-100"
                />

                <div className="relative flex items-start justify-between">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] ${palette.icon}`}
                  >
                    <Icon size={20} strokeWidth={1.7} />
                  </span>

                  <span className="text-[10px] font-semibold tracking-[0.17em] text-[#756F67]">
                    {tool.number}
                  </span>
                </div>

                <div className="relative mt-7 flex-1">
                  <h3 className="text-base font-semibold tracking-tight text-[#EDE8E0]">
                    {tool.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#A69E94]">
                    {tool.description}
                  </p>
                </div>

                <div className="relative mt-6 flex items-center justify-between border-t border-[#403B35] pt-4 text-sm font-medium text-[#C0A98C]">
                  <span>{tool.action}</span>

                  <ArrowUpRight
                    size={17}
                    className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Roadmap and recent activity */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        {/* Roadmap */}
        <div className="group relative isolate overflow-hidden rounded-[24px] border border-[#514638] bg-gradient-to-br from-[#29251F] via-[#22201D] to-[#1D1B19] p-6 shadow-[0_14px_40px_rgba(0,0,0,0.19),inset_0_1px_0_rgba(222,201,169,0.07)] transition-all duration-300 hover:border-[#77634A] hover:shadow-[0_20px_48px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(222,201,169,0.09)] sm:p-7">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-24 -z-10 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(183,161,138,0.15),transparent_70%)] blur-2xl"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 left-0 -z-10 h-56 w-72 rounded-full bg-[radial-gradient(ellipse,rgba(130,145,125,0.055),transparent_70%)] blur-2xl"
          />

          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[#B8A184]">
                STAY ON TRACK
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#F0E9DE]">
                Your roadmap
              </h2>
            </div>

            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#64533E] bg-[#393126] text-[#D5BB96] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <Map size={20} strokeWidth={1.7} />
            </span>
          </div>

          <p className="relative mt-3 max-w-sm text-sm leading-6 text-[#B1A799]">
            Keep building momentum, one week at a time. Your progress
            is saved as you work through your plan.
          </p>

          <div className="relative mt-7 rounded-2xl border border-[#494035] bg-[#1A1917]/75 p-4 shadow-[0_6px_20px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(236,213,181,0.035)]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-[#D0C3B0]">
                Overall completion
              </span>

              <span className="text-sm font-semibold text-[#D7BD98]">
                {progress}%
              </span>
            </div>

            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-[#3B352D] shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]"
              role="progressbar"
              aria-label="Preparation progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#88765F] via-[#B7A18A] to-[#D3B99A] shadow-[0_0_12px_rgba(183,161,138,0.22)] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="mt-3 text-xs text-[#9F9281]">
              {stats.completedWeeks ?? 0} of {stats.totalWeeks ?? 8} weeks completed
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/roadmap")}
            className="group/roadmap relative mt-5 inline-flex items-center gap-2 rounded-xl border border-[#655441] bg-gradient-to-b from-[#3B3329] to-[#2B261F] px-5 py-3 text-sm font-medium text-[#E4D0B4] shadow-[0_7px_20px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.07)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#907554] hover:shadow-[0_10px_25px_rgba(0,0,0,0.23)]"
          >
            Continue roadmap
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover/roadmap:translate-x-1"
            />
          </button>
        </div>

        {/* Recent activity */}
        <div className="relative isolate overflow-hidden rounded-[24px] border border-[#3F3A35] bg-gradient-to-br from-[#242220] via-[#1E1D1C] to-[#1A1919] p-6 shadow-[0_14px_40px_rgba(0,0,0,0.17),inset_0_1px_0_rgba(232,217,197,0.045)] sm:p-7">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-28 -z-10 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(167,127,121,0.09),transparent_70%)]"
          />

          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[#A69B8E]">
                YOUR HISTORY
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#F0EBE3]">
                Recent activity
              </h2>

              <p className="mt-2 text-sm text-[#A69F95]">
                Your latest saved preparation activity.
              </p>
            </div>

            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#4A413A] bg-[#302A26] text-[#C5A99B] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <Clock3 size={20} strokeWidth={1.7} />
            </span>
          </div>

          <div className="relative mt-5">
            {loading ? (
              <p className="py-6 text-sm text-[#948B80]">
                Loading activity...
              </p>
            ) : recentActivity.length > 0 ? (
              <div className="divide-y divide-[#393532]">
                {recentActivity.map((activity, index) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    time={formatTime(activity.createdAt)}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#3B3733] bg-[#191817]/70 px-4 py-7 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#4A4138] bg-[#302A24] text-[#C7B092]">
                  <GraduationCap size={23} strokeWidth={1.7} />
                </span>

                <p className="mt-3 text-sm font-semibold text-[#EAE4DB]">
                  Your journey starts here
                </p>

                <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-[#A39A8F]">
                  Once you use a preparation tool, your saved activity
                  will show up here.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/resume-analyzer")}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#C6AE90] transition hover:text-[#E0C6A5] hover:underline"
                >
                  Analyze your resume
                  <ArrowRight size={15} />
                </button>
              </div>
            )}
          </div>

          {recentActivity.length > 0 && (
            <button
              type="button"
              onClick={() => navigate("/resume-analyzer")}
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#C6AE90] transition hover:text-[#E0C6A5] hover:underline"
            >
              Continue preparing
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-[0.19em] text-[#9F9588]">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#EEE8DF] sm:text-2xl">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-[#A69E94]">
        {description}
      </p>
    </div>
  );
}

function ActivityItem({ activity, time, index }) {
  const iconList = [
    FileText,
    BriefcaseBusiness,
    Mic2,
    MessageCircle,
    CheckCircle2,
  ];

  const paletteList = [
    "champagne",
    "rose",
    "sage",
    "silver",
    "champagne",
  ];

  const Icon = iconList[index % iconList.length];
  const palette = palettes[paletteList[index % paletteList.length]];

  return (
    <div className="group/activity flex items-start gap-3 py-4">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-transform duration-200 group-hover/activity:scale-[1.03] ${palette.icon}`}
      >
        <Icon size={18} strokeWidth={1.7} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#EAE5DC]">
          {activity.title}
        </p>

        <p className="mt-1 break-words text-xs leading-5 text-[#A69E94]">
          {activity.description}
        </p>

        {time && (
          <p className="mt-1.5 text-[11px] text-[#827B72]">
            {time}
          </p>
        )}
      </div>

      <ArrowDownRight
        size={16}
        className="mt-1 shrink-0 text-[#81786E] transition-transform duration-200 group-hover/activity:translate-x-0.5 group-hover/activity:translate-y-0.5 group-hover/activity:text-[#C3AA8C]"
      />
    </div>
  );
}

export default Dashboard;