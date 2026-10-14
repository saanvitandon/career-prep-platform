
import { useCallback, useEffect, useState } from "react";
import {
  Map,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock3,
  ArrowRight,
  RotateCcw,
  Check,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/roadmap";
const INITIAL_COMPLETED_WEEKS = [1, 2];

function Roadmap() {
  const [completedWeeks, setCompletedWeeks] = useState([]);
  const [showRoadmap, setShowRoadmap] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const getToken = () => localStorage.getItem("token");

  const loadRoadmap = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setError("Please log in to access your roadmap.");
      setIsLoading(false);
      return;
    }

    try {
      setError("");

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load roadmap.");
      }

      setCompletedWeeks(data.completedWeeks);
    } catch (err) {
      setError(err.message || "Unable to load roadmap progress.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoadmap();
  }, [loadRoadmap]);

  const saveWeeks = async (weeks) => {
    const token = getToken();

    if (!token) {
      setError("Your session is missing. Please log in again.");
      return false;
    }

    setIsSaving(true);
    setError("");
    setSaveMessage("");

    try {
      const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          completedWeeks: weeks,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save progress.");
      }

      setCompletedWeeks(data.completedWeeks);
      setSaveMessage("Progress saved successfully.");
      return true;
    } catch (err) {
      setError(err.message || "Unable to save roadmap progress.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const toggleWeek = async (weekNumber) => {
    if (isLoading || isSaving) return;

    const nextWeeks = completedWeeks.includes(weekNumber)
      ? completedWeeks.filter((week) => week !== weekNumber)
      : [...completedWeeks, weekNumber].sort((a, b) => a - b);

    await saveWeeks(nextWeeks);
  };

  const resetRoadmap = async () => {
    if (isLoading || isSaving) return;

    const token = getToken();

    if (!token) {
      setError("Your session is missing. Please log in again.");
      return false;
    }

    setIsSaving(true);
    setError("");
    setSaveMessage("");

    try {
      const response = await fetch(`${API_URL}/reset`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to reset roadmap.");
      }

      setCompletedWeeks(data.completedWeeks);
      setShowRoadmap(true);
      setSaveMessage("Roadmap progress reset successfully.");
      return true;
    } catch (err) {
      setError(err.message || "Unable to reset roadmap progress.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const completedCount = completedWeeks.length;
  const progress = Math.round(
    (completedCount / roadmapWeeks.length) * 100
  );

  const currentWeek =
    roadmapWeeks.find((week) => !completedWeeks.includes(week.week))
      ?.week ?? null;

  const currentTopic = roadmapWeeks.find(
    (week) => week.week === currentWeek
  );

  const handleReset = () => {
    if (
      window.confirm(
        "Reset your progress to the initial roadmap? This will update your saved progress."
      )
    ) {
      resetRoadmap();
    }
  };

  const handleRestore = async () => {
    const success = await resetRoadmap();

    if (success) {
      setShowRoadmap(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          Loading your saved roadmap...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <section>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <Map size={21} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Personalized Roadmap
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Your preparation plan to become placement-ready.
            </p>
          </div>
        </div>
      </section>

      {/* Error and save status */}
      {(error || saveMessage || isSaving) && (
        <div
          role="status"
          aria-live="polite"
          className={`mt-5 rounded-xl border p-3 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {error ||
            (isSaving ? "Saving your progress..." : saveMessage)}
          {error && (
            <button
              onClick={loadRoadmap}
              className="ml-3 font-semibold underline"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {showRoadmap && (
        <>
          {/* Overview */}
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Target role
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Software Engineer Intern
                </h2>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                    8 week plan
                  </span>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    DSA focused
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowRoadmap(false)}
                disabled={isSaving}
                className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                <RotateCcw size={16} />
                Regenerate
              </button>
            </div>

            {/* Progress */}
            <div className="mt-7">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  Overall progress
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {progress}%
                </span>
              </div>

              <div
                className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Overall roadmap progress"
              >
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>
                  {completedCount} of 8 weeks completed
                </span>
                <span>{8 - completedCount} weeks remaining</span>
              </div>
            </div>
          </section>

          {/* Main grid */}
          <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Timeline */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7 lg:col-span-2">
              <h2 className="text-lg font-semibold text-slate-900">
                Your 8-week plan
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Mark each week complete as you progress through your preparation.
              </p>

              <div className="mt-7">
                {roadmapWeeks.map((week, index) => {
                  const completed = completedWeeks.includes(week.week);
                  const current =
                    !completed && week.week === currentWeek;

                  return (
                    <RoadmapItem
                      key={week.week}
                      {...week}
                      completed={completed}
                      current={current}
                      isLast={index === roadmapWeeks.length - 1}
                      disabled={isSaving}
                      onToggle={() => toggleWeek(week.week)}
                    />
                  );
                })}
              </div>

              {completedCount === 8 && (
                <div className="mt-2 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700">
                  🎉 Congratulations! You've completed all eight weeks.
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-5">
              {/* Recommendation */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Sparkles size={19} />
                </div>

                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  Study recommendation
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {currentTopic
                    ? `Focus on ${currentTopic.title} this week. ${currentTopic.description}`
                    : "You've completed your roadmap. Review previous topics and practise mixed interview problems."}
                </p>

                <button
                  onClick={() =>
                    document
                      .getElementById(
                        `roadmap-week-${currentWeek ?? 8}`
                      )
                      ?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      })
                  }
                  disabled={!currentWeek}
                  className="mt-5 flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  View current goals
                  <ArrowRight size={15} />
                </button>
              </div>

              {/* Current focus */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600">
                    <Clock3 size={18} />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      CURRENT FOCUS
                    </p>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {currentTopic?.title ?? "Roadmap completed"}
                    </h3>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">
                      Overall completion
                    </span>
                    <span className="font-semibold text-slate-700">
                      {progress}%
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-700">
                    {currentTopic ? "Next up" : "What's next?"}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {currentTopic
                      ? currentTopic.description
                      : "Revise your DSA concepts and practise mock interviews."}
                  </p>
                </div>

                <button
                  onClick={() =>
                    currentTopic && toggleWeek(currentTopic.week)
                  }
                  disabled={!currentTopic || isSaving}
                  className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {currentTopic
                    ? "Mark current week complete"
                    : "All weeks completed"}
                </button>
              </div>

              {/* Reset */}
              <button
                onClick={handleReset}
                disabled={isSaving}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                <RotateCcw size={15} />
                Reset progress
              </button>
            </div>
          </section>
        </>
      )}

      {/* Restore roadmap */}
      {!showRoadmap && (
        <section className="mt-8">
          <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <Sparkles size={25} />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-slate-900">
                Restore your roadmap
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Restore the predefined eight-week preparation plan and
                reset your saved progress to the initial state.
              </p>

              <button
                onClick={handleRestore}
                disabled={isSaving}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSaving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Restoring roadmap...
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
                    Restore Roadmap
                  </>
                )}
              </button>

              <button
                onClick={() => setShowRoadmap(true)}
                disabled={isSaving}
                className="ml-3 mt-6 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Go back
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

/* Individual roadmap week */
function RoadmapItem({
  week,
  title,
  description,
  completed,
  current,
  isLast,
  disabled,
  onToggle,
}) {
  return (
    <div id={`roadmap-week-${week}`} className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            completed
              ? "bg-green-100 text-green-600"
              : current
                ? "bg-blue-100 text-blue-600 ring-4 ring-blue-50"
                : "bg-slate-100 text-slate-400"
          }`}
        >
          {completed ? (
            <CheckCircle2 size={18} />
          ) : current ? (
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
          ) : (
            <Circle size={17} />
          )}
        </div>

        {!isLast && (
          <div
            className={`mt-2 w-px flex-1 ${
              completed ? "bg-green-200" : "bg-slate-200"
            }`}
          />
        )}
      </div>

      <div className="min-w-0 flex-1 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Week {week}
          </span>

          {current && (
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-600">
              Current
            </span>
          )}

          {completed && (
            <span className="rounded-md bg-green-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-600">
              Completed
            </span>
          )}
        </div>

        <h3
          className={`mt-1 text-sm font-semibold ${
            current ? "text-blue-600" : "text-slate-800"
          }`}
        >
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>

        <button
          onClick={onToggle}
          disabled={disabled}
          className={`mt-3 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            completed
              ? "border-green-200 text-green-700 hover:bg-green-50"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          {completed ? (
            <>
              <RotateCcw size={13} />
              Mark incomplete
            </>
          ) : (
            <>
              <Check size={13} />
              Mark complete
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* Eight-week DSA plan */
const roadmapWeeks = [
  {
    week: 1,
    title: "Arrays & Strings",
    description:
      "Build strong fundamentals with arrays, strings, sorting, and basic problem-solving patterns.",
  },
  {
    week: 2,
    title: "Hashing & Two Pointers",
    description:
      "Learn efficient lookup techniques and common two-pointer problem patterns.",
  },
  {
    week: 3,
    title: "Binary Search",
    description:
      "Master binary search and learn how to identify problems where it can reduce complexity.",
  },
  {
    week: 4,
    title: "Linked Lists",
    description:
      "Understand linked list operations, pointer manipulation, and common interview problems.",
  },
  {
    week: 5,
    title: "Trees & Binary Search Trees",
    description:
      "Learn tree traversal, recursion, BST operations, and common interview patterns.",
  },
  {
    week: 6,
    title: "Graphs",
    description:
      "Cover BFS, DFS, shortest paths, and graph-based problem solving.",
  },
  {
    week: 7,
    title: "Dynamic Programming",
    description:
      "Learn the fundamentals of memoization, tabulation, and common DP patterns.",
  },
  {
    week: 8,
    title: "Interview Preparation",
    description:
      "Practice mixed DSA problems, behavioral questions, and mock interview sessions.",
  },
];

export default Roadmap;
