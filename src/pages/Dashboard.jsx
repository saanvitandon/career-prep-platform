
import { useEffect, useState } from "react";
import {
  FileText,
  BriefcaseBusiness,
  TrendingUp,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import StatCard from "../components/dashboard/StatCard";
import FeatureCard from "../components/dashboard/FeatureCard";
import RoadmapCard from "../components/dashboard/RoadmapCard";

function Dashboard() {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();

  const [dashboardUser, setDashboardUser] = useState(authUser);
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
        const response = await fetch(
          "http://localhost:5000/api/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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
          setDashboardUser(data.user);
          setStats(data.stats);
          setRecentActivity(data.recentActivity || []);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Dashboard fetch error:", err);
          setError(
            err.message || "Unable to load dashboard data."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, [navigate, logout]);

  const displayName = dashboardUser?.name?.trim() || "there";

  function formatTime(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return (
    <div>
      {/* Welcome */}
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Good morning {displayName}!
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Let's get you one step closer to your dream role.
        </p>

        {loading && (
          <p className="mt-2 text-xs text-slate-400">
            Loading your dashboard...
          </p>
        )}

        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {dashboardUser?.email && (
          <p className="mt-1 text-xs text-slate-400">
            Signed in as {dashboardUser.email}
          </p>
        )}
      </section>

      {/* Real statistics */}
      <section className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<FileText size={19} />}
          label="Latest ATS Score"
          value={
            stats.latestAtsScore == null
              ? "—"
              : `${stats.latestAtsScore}/100`
          }
          description={
            stats.totalResumeAnalyses > 0
              ? `${stats.totalResumeAnalyses} saved ${
                  stats.totalResumeAnalyses === 1
                    ? "analysis"
                    : "analyses"
                }`
              : "No analysis yet"
          }
        />

        <StatCard
          icon={<BriefcaseBusiness size={19} />}
          label="Latest Match"
          value={
            stats.latestMatch == null
              ? "—"
              : `${stats.latestMatch}%`
          }
          description={
            stats.latestMatch == null
              ? "No matches yet"
              : "Latest resume match"
          }
        />

        <StatCard
          icon={<TrendingUp size={19} />}
          label="Preparation Progress"
          value={`${stats.preparationProgress ?? 0}%`}
          description={`${stats.completedWeeks ?? 0} of ${
            stats.totalWeeks ?? 8
          } weeks completed`}
        />
      </section>

      {/* Main content grid */}
      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Preparation tools */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Preparation tools
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Use AI-powered tools to strengthen your placement preparation.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FeatureCard
              icon={<FileText size={19} />}
              title="Resume Analyzer"
              description="Analyze your resume and identify ways to improve your ATS compatibility."
              action="Analyze resume"
              onClick={() => navigate("/resume-analyzer")}
            />

            <FeatureCard
              icon={<BriefcaseBusiness size={19} />}
              title="Resume Matcher"
              description="Compare your resume with a job description and discover skill gaps."
              action="Match resume"
              onClick={() => navigate("/resume-matcher")}
            />

            <FeatureCard
              icon={<TrendingUp size={19} />}
              title="Interview Prep"
              description="Generate role-specific interview questions tailored to your target role."
              action="Start practicing"
              onClick={() => navigate("/interview-prep")}
            />

            <FeatureCard
              icon={<FileText size={19} />}
              title="PDF Assistant"
              description="Upload study material and ask questions directly from your documents."
              action="Open assistant"
              onClick={() => navigate("/pdf-assistant")}
            />
          </div>
        </div>

        {/* Roadmap */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Your roadmap
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Keep moving forward.
            </p>
          </div>

          <RoadmapCard />
        </div>
      </section>

      {/* Real recent activity */}
      <section className="mt-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Recent activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your latest saved preparation activity.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/resume-analyzer")}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Analyze resume →
            </button>
          </div>

          <div className="mt-6 divide-y divide-slate-100">
            {loading ? (
              <p className="py-4 text-sm text-slate-400">
                Loading activity...
              </p>
            ) : recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  title={activity.title}
                  description={activity.description}
                  time={formatTime(activity.createdAt)}
                />
              ))
            ) : (
              <div className="py-8 text-center">
                <FileText
                  size={28}
                  className="mx-auto text-slate-300"
                />
                <p className="mt-3 text-sm font-medium text-slate-700">
                  No recent activity yet
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Your saved resume analyses will appear here.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/resume-analyzer")}
                  className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Analyze your first resume
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function ActivityItem({ title, description, time }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />

        <div>
          <p className="text-sm font-medium text-slate-800">
            {title}
          </p>

          <p className="mt-0.5 text-xs text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <span className="shrink-0 text-right text-xs text-slate-400">
        {time}
      </span>
    </div>
  );
}

export default Dashboard;
