
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
  LoaderCircle,
  AlertCircle,
  Target,
  BookOpen,
  Trophy,
  CalendarDays,
  TrendingUp,
} from "lucide-react";

const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000"
}/api/roadmap`;

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
      "Master binary search and identify problems where it can reduce complexity.",
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
      "Learn memoization, tabulation, and common dynamic programming patterns.",
  },
  {
    week: 8,
    title: "Interview Preparation",
    description:
      "Practice mixed DSA problems, behavioral questions, and mock interview sessions.",
  },
];

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

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to load roadmap.");
      }

      const validWeeks = Array.isArray(data.completedWeeks)
        ? data.completedWeeks.filter(
            (week) =>
              Number.isInteger(week) &&
              week >= 1 &&
              week <= roadmapWeeks.length
          )
        : [];

      setCompletedWeeks([...new Set(validWeeks)].sort((a, b) => a - b));
    } catch (err) {
      console.error("Load roadmap error:", err);
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
        body: JSON.stringify({ completedWeeks: weeks }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save progress.");
      }

      const savedWeeks = Array.isArray(data.completedWeeks)
        ? data.completedWeeks
        : weeks;

      setCompletedWeeks(savedWeeks);
      setSaveMessage("Your progress has been saved.");
      return true;
    } catch (err) {
      console.error("Save roadmap error:", err);
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
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to reset roadmap.");
      }

      setCompletedWeeks(
        Array.isArray(data.completedWeeks) ? data.completedWeeks : []
      );
      setShowRoadmap(true);
      setSaveMessage("Your roadmap progress has been reset.");
      return true;
    } catch (err) {
      console.error("Reset roadmap error:", err);
      setError(err.message || "Unable to reset roadmap progress.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (isLoading || isSaving) return;

    if (
      window.confirm(
        "Reset your progress? All completed weeks will be marked incomplete."
      )
    ) {
      resetRoadmap();
    }
  };

  const handleRestore = async () => {
    if (
      window.confirm(
        "Restore the eight-week roadmap and reset your saved progress?"
      )
    ) {
      await resetRoadmap();
    }
  };

  const completedCount = completedWeeks.length;
  const totalWeeks = roadmapWeeks.length;
  const progress = Math.round((completedCount / totalWeeks) * 100);

  const currentWeek =
    roadmapWeeks.find((week) => !completedWeeks.includes(week.week))?.week ??
    null;

  const currentTopic = roadmapWeeks.find(
    (week) => week.week === currentWeek
  );

  const remainingWeeks = totalWeeks - completedCount;

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-[#A59D93]">
        <LoaderCircle size={19} className="mr-3 animate-spin text-[#C5A984]" />
        Loading your saved roadmap...
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-[1400px] space-y-7 pb-8 text-[#F0ECE5]">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-32 top-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(173,135,91,0.06),transparent_70%)] blur-3xl" />
        <div className="absolute -left-40 top-[55%] h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(135,145,119,0.04),transparent_70%)] blur-3xl" />
      </div>

      {/* Introduction */}
      <section className="relative overflow-hidden rounded-[28px] border border-[#403B35] bg-gradient-to-br from-[#26231F] via-[#1E1C19] to-[#191817] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-9">
        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border border-[#C5A984]/10" />
        <div className="pointer-events-none absolute -right-4 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(197,169,132,0.07),transparent_70%)]" />

        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#65513C]/70 bg-[#332A21]/70 px-3.5 py-2 text-[10px] font-semibold tracking-[0.18em] text-[#D4B994]">
            <Map size={14} />
            YOUR LEARNING PATH
          </div>

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold leading-tight tracking-[-0.045em] text-[#F1ECE4] sm:text-5xl">
                Small steps.
                <br />
                <span className="bg-gradient-to-r from-[#E7D8C1] via-[#C5A984] to-[#A99175] bg-clip-text text-transparent">
                  Real progress.
                </span>
              </h1>

              <p className="mt-5 text-sm leading-7 text-[#AAA197] sm:text-base">
                An eight-week DSA plan to build consistency, strengthen
                problem-solving, and prepare for technical interviews.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-[#403B35] bg-[#191817]/80 px-4 py-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#65513C]/60 bg-[#332A21] text-[#D4B994]">
                <Target size={20} />
              </div>
              <div>
                <p className="text-xl font-semibold text-[#F0ECE5]">
                  {completedCount}
                  <span className="text-[#81796F]"> / {totalWeeks}</span>
                </p>
                <p className="mt-0.5 text-xs text-[#928A80]">
                  Weeks completed
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 border-t border-[#403B35]/80 pt-5 text-xs text-[#928A80]">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={14} className="text-[#C5A984]" />
              8-week learning plan
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[#A4B49A]" />
              Track your progress
            </span>
            <span className="inline-flex items-center gap-2">
              <TrendingUp size={14} className="text-[#C5A984]" />
              Interview-focused practice
            </span>
          </div>
        </div>
      </section>

      {/* Feedback */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-[#744540] bg-[#332321] p-4 text-sm text-[#E7B2A9]"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p>{error}</p>
            <button
              type="button"
              onClick={loadRoadmap}
              className="mt-2 font-semibold underline underline-offset-4"
            >
              Try loading again
            </button>
          </div>
        </div>
      )}

      {saveMessage && !error && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-3 rounded-2xl border border-[#465B45] bg-[#253025] p-4 text-sm text-[#B5C4AA]"
        >
          <CheckCircle2 size={18} />
          {saveMessage}
        </div>
      )}

      {isSaving && (
        <div
          role="status"
          className="flex items-center gap-2 text-sm text-[#A59D93]"
        >
          <LoaderCircle size={15} className="animate-spin text-[#C5A984]" />
          Saving your progress...
        </div>
      )}

      {showRoadmap ? (
        <>
          {/* Overview */}
          <section className="relative overflow-hidden rounded-[26px] border border-[#65513C]/80 bg-gradient-to-br from-[#393024] via-[#30281F] to-[#211E19] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-8">
            <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(197,169,132,0.08),transparent_70%)]" />

            <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] text-[#C5A984]">
                  YOUR CURRENT PLAN
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-[#F0ECE5] sm:text-3xl">
                  Software Engineer Intern
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#AAA093]">
                  An eight-week, DSA-focused plan covering essential problem
                  patterns and interview practice.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#65513C]/70 bg-[#332A21] px-3 py-1.5 text-xs font-medium text-[#D8BD98]">
                    8-week plan
                  </span>
                  <span className="rounded-full border border-[#465B45] bg-[#293328] px-3 py-1.5 text-xs font-medium text-[#B5C4AA]">
                    DSA focused
                  </span>
                </div>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#65513C] bg-[#413526] text-[#D8BD98]">
                <Map size={23} />
              </div>
            </div>

            <div className="relative mt-8 border-t border-[#65513C]/60 pt-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-[#AAA093]">Overall progress</p>
                  <p className="mt-1 text-4xl font-semibold tabular-nums text-[#F0E6D8]">
                    {progress}%
                  </p>
                </div>
                <p className="text-right text-sm text-[#AAA093]">
                  {remainingWeeks === 0
                    ? "All weeks completed!"
                    : `${remainingWeeks} ${
                        remainingWeeks === 1 ? "week" : "weeks"
                      } remaining`}
                </p>
              </div>

              <div
                className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#514333]"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Overall roadmap progress"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#9B7B53] via-[#D8BD98] to-[#A4B49A] shadow-[0_0_14px_rgba(197,169,132,0.18)] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-3 flex justify-between text-xs text-[#928A80]">
                <span>{completedCount} completed</span>
                <span>{totalWeeks} total weeks</span>
              </div>
            </div>
          </section>

          {/* Timeline and side panels */}
          <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-[26px] border border-[#403B35] bg-gradient-to-b from-[#23211E] to-[#1B1A19] p-5 shadow-[0_14px_38px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.035)] sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-[#F0ECE5]">
                    Your eight-week plan
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#928A80]">
                    Work through each topic and mark weeks complete as you go.
                  </p>
                </div>

                <span className="rounded-full border border-[#51483D] bg-[#292621] px-3 py-1.5 text-xs font-medium text-[#C5A984]">
                  {completedCount === totalWeeks
                    ? "Plan completed"
                    : `Week ${currentWeek} of ${totalWeeks}`}
                </span>
              </div>

              <div className="mt-8">
                {roadmapWeeks.map((week, index) => (
                  <RoadmapItem
                    key={week.week}
                    {...week}
                    completed={completedWeeks.includes(week.week)}
                    current={
                      !completedWeeks.includes(week.week) &&
                      week.week === currentWeek
                    }
                    isLast={index === roadmapWeeks.length - 1}
                    disabled={isSaving}
                    onToggle={() => toggleWeek(week.week)}
                  />
                ))}
              </div>

              {completedCount === totalWeeks && (
                <div className="mt-3 rounded-2xl border border-[#465B45] bg-gradient-to-r from-[#253025] to-[#202720] p-5">
                  <div className="flex items-start gap-3">
                    <Trophy
                      size={22}
                      className="mt-0.5 shrink-0 text-[#B5C4AA]"
                    />
                    <div>
                      <h3 className="font-semibold text-[#C4D2B9]">
                        You did it!
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-[#A7B49D]">
                        You've marked all eight weeks complete. Keep your skills
                        sharp with mixed problems and mock interviews.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-5">
              {/* Recommendation */}
              <div className="relative overflow-hidden rounded-[26px] border border-[#65513C]/70 bg-gradient-to-br from-[#332A21] via-[#29231D] to-[#211F1B] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(197,169,132,0.08),transparent_70%)]" />

                <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[#65513C] bg-[#413526] text-[#D8BD98]">
                  <Sparkles size={21} />
                </span>

                <p className="relative mt-5 text-[10px] font-semibold tracking-[0.18em] text-[#C5A984]">
                  STUDY RECOMMENDATION
                </p>

                <h3 className="relative mt-2 text-xl font-semibold text-[#F0ECE5]">
                  {currentTopic
                    ? `Focus on ${currentTopic.title}`
                    : "Keep your momentum going"}
                </h3>

                <p className="relative mt-3 text-sm leading-6 text-[#AAA093]">
                  {currentTopic
                    ? currentTopic.description
                    : "Revisit challenging topics and practice mixed interview problems to reinforce what you've learned."}
                </p>

                {currentWeek !== null && (
                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById(`roadmap-week-${currentWeek}`)
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        })
                    }
                    className="relative mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#D8BD98] transition hover:gap-3"
                  >
                    View current goals
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>

              {/* Current focus */}
              <div className="rounded-[26px] border border-[#403B35] bg-gradient-to-b from-[#23211E] to-[#1B1A19] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#465B45] bg-[#293328] text-[#B5C4AA]">
                    <Clock3 size={19} />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.15em] text-[#928A80]">
                      CURRENT FOCUS
                    </p>
                    <h3 className="mt-1 font-semibold text-[#F0ECE5]">
                      {currentTopic?.title ?? "Roadmap completed"}
                    </h3>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#928A80]">Completion</span>
                    <span className="font-semibold text-[#D8BD98]">
                      {progress}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#35312B]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#9B7B53] to-[#A4B49A] transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-[#403B35] bg-[#191817] p-4">
                  <p className="text-sm font-semibold text-[#E9E2D8]">
                    {currentTopic ? "What's on the agenda?" : "What's next?"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#928A80]">
                    {currentTopic
                      ? currentTopic.description
                      : "Revisit difficult topics, solve mixed DSA problems, and practice mock interviews."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    currentTopic && toggleWeek(currentTopic.week)
                  }
                  disabled={!currentTopic || isSaving}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#D8C1A0] bg-gradient-to-br from-[#D8C1A0] to-[#B39470] px-4 py-3 text-sm font-semibold text-[#241E17] transition hover:brightness-110 disabled:cursor-not-allowed disabled:border-[#403B35] disabled:bg-[#302D28] disabled:text-[#746D63]"
                >
                  <Check size={16} />
                  {currentTopic
                    ? "Mark current week complete"
                    : "All weeks completed"}
                </button>
              </div>

              {/* Manage progress */}
              <div className="rounded-[24px] border border-[#403B35] bg-[#201F1C] p-5">
                <h3 className="text-sm font-semibold text-[#E9E2D8]">
                  Manage your progress
                </h3>
                <p className="mt-1 text-xs leading-5 text-[#928A80]">
                  Reset completed weeks if you'd like to start over.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSaving}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#51483D] px-4 py-2.5 text-sm font-medium text-[#C9C1B6] transition hover:border-[#80694C] hover:bg-[#332A21] disabled:opacity-50"
                >
                  <RotateCcw size={15} />
                  Reset progress
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowRoadmap(false);
                  setError("");
                  setSaveMessage("");
                }}
                disabled={isSaving}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#403B35] bg-[#201F1C] px-4 py-3 text-sm font-medium text-[#AAA093] transition hover:border-[#65513C] hover:bg-[#292621] disabled:opacity-50"
              >
                <BookOpen size={16} />
                Hide roadmap
              </button>
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-[26px] border border-[#403B35] bg-gradient-to-b from-[#23211E] to-[#1B1A19] p-7 text-center shadow-[0_14px_38px_rgba(0,0,0,0.12)] sm:p-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#65513C] bg-[#332A21] text-[#D4B994]">
            <Map size={25} />
          </span>

          <h2 className="mt-5 text-xl font-semibold text-[#F0ECE5]">
            Your roadmap is tucked away.
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#AAA093]">
            Your saved progress is unchanged. Restore the view to continue
            tracking your eight-week plan.
          </p>

          <button
            type="button"
            onClick={() => setShowRoadmap(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#D8C1A0] bg-gradient-to-br from-[#D8C1A0] to-[#B39470] px-5 py-3 text-sm font-semibold text-[#241E17] transition hover:brightness-110"
          >
            Return to roadmap
            <ArrowRight size={16} />
          </button>

          <div>
            <button
              type="button"
              onClick={handleRestore}
              disabled={isSaving}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#928A80] transition hover:text-[#D8BD98] disabled:opacity-50"
            >
              <RotateCcw size={15} />
              Restore plan and reset progress
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

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
    <div id={`roadmap-week-${week}`} className="flex scroll-mt-24 gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition ${
            completed
              ? "border-[#52684C] bg-[#293328] text-[#B5C4AA]"
              : current
                ? "border-[#80694C] bg-[#332A21] text-[#D8BD98] shadow-[0_0_18px_rgba(197,169,132,0.10)]"
                : "border-[#403B35] bg-[#292621] text-[#81796F]"
          }`}
        >
          {completed ? (
            <CheckCircle2 size={19} />
          ) : current ? (
            <span className="h-2.5 w-2.5 rounded-full bg-[#D8BD98]" />
          ) : (
            <Circle size={18} />
          )}
        </div>

        {!isLast && (
          <div
            className={`mt-2 w-px flex-1 ${
              completed ? "bg-[#52684C]" : "bg-[#403B35]"
            }`}
          />
        )}
      </div>

      <div
        className={`mb-5 min-w-0 flex-1 rounded-2xl border p-4 transition-all duration-200 sm:p-5 ${
          current
            ? "border-[#65513C]/80 bg-gradient-to-br from-[#29241E] to-[#201E1A] shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]"
            : completed
              ? "border-[#384738] bg-[#1F251F]"
              : "border-[#35312B] bg-[#201F1C] hover:border-[#51483D]"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#928A80]">
            Week {week}
          </span>

          {current && (
            <span className="rounded-full border border-[#65513C] bg-[#332A21] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#D8BD98]">
              Up next
            </span>
          )}

          {completed && (
            <span className="rounded-full border border-[#465B45] bg-[#293328] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#B5C4AA]">
              Completed
            </span>
          )}
        </div>

        <h3
          className={`mt-2 text-base font-semibold ${
            completed ? "text-[#B9C0B2]" : "text-[#F0ECE5]"
          }`}
        >
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-[#928A80]">{description}</p>

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className={`mt-4 inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
            completed
              ? "border-[#465B45] text-[#B5C4AA] hover:bg-[#293328]"
              : "border-[#51483D] text-[#C9C1B6] hover:border-[#80694C] hover:bg-[#332A21]"
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

export default Roadmap;
