import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Map,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock3,
  ArrowRight,
  RotateCcw,
  LoaderCircle,
  AlertCircle,
  Target,
  BookOpen,
  Trophy,
  TrendingUp,
  ChevronDown,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000"
}/api/roadmap`;

const INITIAL_FORM = {
  role: "Software Engineer Intern",
  level: "Some experience",
  hours: "6–10 hours",
  duration: "12 weeks",
  priority: "Balanced",
  skills: "",
};

const LEVELS = [
  "Complete beginner",
  "Some experience",
  "Intermediate",
  "Advanced",
];

const HOURS = ["1–5 hours", "6–10 hours", "11–20 hours", "20+ hours"];

const DURATIONS = [
  "4 weeks",
  "8 weeks",
  "12 weeks",
  "16 weeks",
  "6 months",
];

const PRIORITIES = [
  "Balanced",
  "Get job-ready quickly",
  "Build projects",
  "Interview preparation",
  "Learn fundamentals",
];

function getToken() {
  return localStorage.getItem("token");
}

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message ||
        (response.status === 401
          ? "Your session has expired. Please log in again."
          : "Something went wrong. Please try again.")
    );
  }

  return data;
}

function Roadmap() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [roadmap, setRoadmap] = useState(null);
  const [savedCriteria, setSavedCriteria] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [expandedWeeks, setExpandedWeeks] = useState([]);
  const [showSetup, setShowSetup] = useState(false);

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

      const data = await readResponse(response);

      const savedRoadmap =
        data.roadmap && Array.isArray(data.roadmap.weeks)
          ? data.roadmap
          : null;

      setRoadmap(savedRoadmap);
      setSavedCriteria(data.criteria || null);

      const savedTasks = Array.isArray(data.completedTasks)
        ? data.completedTasks
        : [];

      setCompletedTasks(savedTasks);

      if (data.criteria) {
        setForm({ ...INITIAL_FORM, ...data.criteria });
      }

      setExpandedWeeks(
        savedRoadmap?.weeks?.length ? [savedRoadmap.weeks[0].week] : []
      );

      setShowSetup(!savedRoadmap);
    } catch (err) {
      console.error("Load roadmap error:", err);
      setError(err.message || "Unable to load your roadmap.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoadmap();
  }, [loadRoadmap]);

  const totalWeeks = roadmap?.weeks?.length || 0;

  const totalTasks = useMemo(
    () =>
      roadmap?.weeks?.reduce(
        (total, week) => total + (week.tasks?.length || 0),
        0
      ) || 0,
    [roadmap]
  );

  const completedSet = useMemo(
    () => new Set(completedTasks),
    [completedTasks]
  );

  const completedCount = completedTasks.length;

  const progress =
    totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const completedWeeks = useMemo(() => {
    if (!roadmap) return [];

    return roadmap.weeks
      .filter(
        (week) =>
          week.tasks?.length > 0 &&
          week.tasks.every((task) => completedSet.has(task.id))
      )
      .map((week) => week.week);
  }, [roadmap, completedSet]);

  const currentWeek = roadmap?.weeks?.find(
    (week) => !completedWeeks.includes(week.week)
  );

  const updateForm = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const generateRoadmap = async (event) => {
    event?.preventDefault();

    if (isGenerating || isSaving) return;

    if (!form.role.trim()) {
      setError("Enter the role you want to prepare for.");
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    if (roadmap) {
      const confirmed = window.confirm(
        "Generate a new roadmap? Your current roadmap and its task progress will be replaced."
      );

      if (!confirmed) return;
    }

    setIsGenerating(true);
    setError("");
    setSaveMessage("");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 75000);

    try {
      const response = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          ...form,
          role: form.role.trim(),
          skills: form.skills.trim(),
        }),
      });

      const data = await readResponse(response);

      if (!data.roadmap || !Array.isArray(data.roadmap.weeks)) {
        throw new Error("The server returned an invalid roadmap.");
      }

      setRoadmap(data.roadmap);
      setSavedCriteria(data.criteria || { ...form });
      setCompletedTasks(
        Array.isArray(data.completedTasks) ? data.completedTasks : []
      );
      setExpandedWeeks(
        data.roadmap.weeks.length ? [data.roadmap.weeks[0].week] : []
      );
      setShowSetup(false);
      setSaveMessage("Your personalized roadmap has been generated.");
    } catch (err) {
      console.error("Generate roadmap error:", err);

      setError(
        err.name === "AbortError"
          ? "Generation timed out. Check your backend terminal and try again."
          : err.message || "Unable to generate your roadmap."
      );
    } finally {
      clearTimeout(timeoutId);
      setIsGenerating(false);
    }
  };

  const toggleTask = async (taskId) => {
    if (isSaving || isGenerating || !roadmap) return;

    const token = getToken();

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    const previousTasks = completedTasks;

    const nextTasks = completedSet.has(taskId)
      ? completedTasks.filter((id) => id !== taskId)
      : [...completedTasks, taskId];

    setCompletedTasks(nextTasks);
    setIsSaving(true);
    setError("");
    setSaveMessage("");

    try {
      const response = await fetch(`${API_URL}/progress`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completedTasks: nextTasks }),
      });

      const data = await readResponse(response);

      setCompletedTasks(
        Array.isArray(data.completedTasks) ? data.completedTasks : nextTasks
      );
      setSaveMessage("Your progress has been saved.");
    } catch (err) {
      console.error("Save roadmap progress error:", err);
      setCompletedTasks(previousTasks);
      setError(err.message || "Unable to save your progress.");
    } finally {
      setIsSaving(false);
    }
  };

  const markWeekComplete = async (week) => {
    if (isSaving || isGenerating || !roadmap) return;

    const token = getToken();

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    const weekTasks = Array.isArray(week.tasks) ? week.tasks : [];
    if (weekTasks.length === 0) return;

    const allTasksCompleted = weekTasks.every((task) =>
      completedSet.has(task.id)
    );

    const weekTaskIds = new Set(weekTasks.map((task) => task.id));

    const previousTasks = completedTasks;

    // If every task is complete, remove this week's tasks.
    // Otherwise, mark every task in this week as complete.
    const nextTasks = allTasksCompleted
      ? completedTasks.filter((id) => !weekTaskIds.has(id))
      : [
          ...new Set([
            ...completedTasks,
            ...weekTasks.map((task) => task.id),
          ]),
        ];

    setCompletedTasks(nextTasks);
    setIsSaving(true);
    setError("");
    setSaveMessage("");

    try {
      const response = await fetch(`${API_URL}/progress`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completedTasks: nextTasks }),
      });

      const data = await readResponse(response);

      setCompletedTasks(
        Array.isArray(data.completedTasks) ? data.completedTasks : nextTasks
      );

      setSaveMessage(
        allTasksCompleted
          ? `Week ${week.week} marked as incomplete.`
          : `Week ${week.week} marked as completed.`
      );
    } catch (err) {
      console.error("Update week progress error:", err);
      setCompletedTasks(previousTasks);
      setError(err.message || "Unable to save your progress.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetProgress = async () => {
    if (!roadmap || isSaving || isGenerating) return;

    const confirmed = window.confirm(
      "Reset all task progress for this roadmap? Your generated roadmap will be kept."
    );

    if (!confirmed) return;

    const token = getToken();

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSaveMessage("");

    try {
      const response = await fetch(`${API_URL}/reset`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await readResponse(response);

      setCompletedTasks(
        Array.isArray(data.completedTasks) ? data.completedTasks : []
      );
      setSaveMessage("Your roadmap progress has been reset.");
    } catch (err) {
      console.error("Reset roadmap progress error:", err);
      setError(err.message || "Unable to reset your progress.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleWeek = (weekNumber) => {
    setExpandedWeeks((previous) =>
      previous.includes(weekNumber)
        ? previous.filter((week) => week !== weekNumber)
        : [...previous, weekNumber]
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-[#A59D93]">
        <LoaderCircle size={19} className="mr-3 animate-spin text-[#C5A984]" />
        Loading your saved roadmap...
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-[1400px] space-y-6 pb-8 text-[#F0ECE5]">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-32 top-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(173,135,91,0.06),transparent_70%)] blur-3xl" />
        <div className="absolute -left-40 top-[55%] h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(135,145,119,0.04),transparent_70%)] blur-3xl" />
      </div>

      {/* Compact page introduction */}
      <section className="relative overflow-hidden rounded-[24px] border border-[#403B35] bg-[#201E1B] px-6 py-6 shadow-[0_12px_35px_rgba(0,0,0,0.16)] sm:px-8 sm:py-7">
        <div className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full border border-[#C5A984]/10" />

        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#65513C]/70 bg-[#332A21]/70 px-3 py-1.5 text-[10px] font-semibold tracking-[0.16em] text-[#D4B994]">
            <Map size={13} />
            YOUR LEARNING PATH
          </div>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="max-w-3xl min-w-0">
              <h1 className="text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#F1ECE4] sm:text-4xl">
                Small steps.
                <span className="block text-[#C5A984]">Real progress.</span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#AAA197] sm:text-base">
                Build a learning plan around your career goal, your current
                skills, and the time you actually have.
              </p>
            </div>

            {roadmap && (
              <div className="flex shrink-0 items-center gap-3 self-start rounded-xl border border-[#403B35] bg-[#191817] px-4 py-3 sm:self-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#65513C]/60 bg-[#332A21] text-[#D4B994]">
                  <Target size={19} />
                </div>

                <div>
                  <p className="text-lg font-semibold text-[#F0ECE5]">
                    {completedWeeks.length}
                    <span className="text-[#81796F]"> / {totalWeeks}</span>
                  </p>
                  <p className="text-xs text-[#928A80]">Weeks completed</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#403B35]/80 pt-4 text-xs text-[#928A80]">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[#A4B49A]" />
              Track individual tasks
            </span>

            <span className="inline-flex items-center gap-2">
              <TrendingUp size={14} className="text-[#C5A984]" />
              Progress saved to your account
            </span>
          </div>
        </div>
      </section>

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
              Reload saved roadmap
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

      {isGenerating ? (
        <section className="rounded-[26px] border border-[#51483D] bg-gradient-to-b from-[#23211E] to-[#1B1A19] p-10 text-center">
          <LoaderCircle
            size={32}
            className="mx-auto animate-spin text-[#C5A984]"
          />
          <h2 className="mt-5 text-xl font-semibold text-[#F0ECE5]">
            Building your personalized roadmap
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#928A80]">
            Gemini is tailoring your weekly goals, practical tasks, and
            resources to your career target. This can take a little while.
          </p>
        </section>
      ) : showSetup || !roadmap ? (
        <SetupForm
          form={form}
          updateForm={updateForm}
          onSubmit={generateRoadmap}
          isGenerating={isGenerating}
          hasRoadmap={Boolean(roadmap)}
          onCancel={() => setShowSetup(false)}
        />
      ) : (
        <>
          <section className="relative overflow-hidden rounded-[26px] border border-[#65513C]/80 bg-gradient-to-br from-[#393024] via-[#30281F] to-[#211E19] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-8">
            <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(197,169,132,0.08),transparent_70%)]" />

            <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold tracking-[0.18em] text-[#C5A984]">
                  YOUR CURRENT PLAN
                </p>

                <h2 className="mt-3 break-words text-2xl font-semibold text-[#F0ECE5] sm:text-3xl">
                  {roadmap.title}
                </h2>

                <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-6 text-[#AAA093]">
                  {roadmap.overview}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Pill>{savedCriteria?.role || form.role}</Pill>
                  <Pill>
                    {savedCriteria?.duration || `${totalWeeks} weeks`}
                  </Pill>
                  <Pill>
                    {savedCriteria?.hours || "Flexible schedule"}/week
                  </Pill>
                  {savedCriteria?.priority && (
                    <Pill>{savedCriteria.priority}</Pill>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setForm({ ...INITIAL_FORM, ...(savedCriteria || {}) });
                    setShowSetup(true);
                    setError("");
                    setSaveMessage("");
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#65513C] bg-[#332A21] px-4 py-2.5 text-sm font-medium text-[#D8BD98] transition hover:bg-[#413526]"
                >
                  <RefreshCw size={15} />
                  Regenerate
                </button>
              </div>
            </div>

            <div className="relative mt-8 border-t border-[#65513C]/60 pt-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-[#AAA093]">Task completion</p>
                  <p className="mt-1 text-4xl font-semibold tabular-nums text-[#F0E6D8]">
                    {progress}%
                  </p>
                </div>
                <p className="text-right text-sm text-[#AAA093]">
                  {completedCount} of {totalTasks} tasks
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
                  className="h-full rounded-full bg-gradient-to-r from-[#9B7B53] via-[#D8BD98] to-[#A4B49A] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-3 flex justify-between text-xs text-[#928A80]">
                <span>{completedWeeks.length} completed weeks</span>
                <span>{totalWeeks} total weeks</span>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-[26px] border border-[#403B35] bg-gradient-to-b from-[#23211E] to-[#1B1A19] p-5 shadow-[0_14px_38px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.035)] sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-[#F0ECE5]">
                    Your learning plan
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#928A80]">
                    Expand a week to view its tasks, resources, and deliverable.
                  </p>
                </div>

                <span className="rounded-full border border-[#51483D] bg-[#292621] px-3 py-1.5 text-xs font-medium text-[#C5A984]">
                  {completedWeeks.length === totalWeeks
                    ? "Plan completed"
                    : `Week ${currentWeek?.week || totalWeeks} of ${totalWeeks}`}
                </span>
              </div>

              <div className="mt-8 space-y-3">
                {roadmap.weeks.map((week) => (
                  <WeekCard
                    key={week.week}
                    week={week}
                    expanded={expandedWeeks.includes(week.week)}
                    onExpand={() => toggleWeek(week.week)}
                    completedSet={completedSet}
                    onToggleTask={toggleTask}
                    onMarkWeekComplete={markWeekComplete}
                    disabled={isSaving || isGenerating}
                  />
                ))}
              </div>

              {completedWeeks.length === totalWeeks && totalWeeks > 0 && (
                <div className="mt-5 rounded-2xl border border-[#465B45] bg-gradient-to-r from-[#253025] to-[#202720] p-5">
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
                        You've completed every task in this roadmap. Keep
                        practicing and apply what you've learned.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div className="relative overflow-hidden rounded-[26px] border border-[#65513C]/70 bg-gradient-to-br from-[#332A21] via-[#29231D] to-[#211F1B] p-6">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(197,169,132,0.08),transparent_70%)]" />
                <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[#65513C] bg-[#413526] text-[#D8BD98]">
                  <Sparkles size={21} />
                </span>

                <p className="relative mt-5 text-[10px] font-semibold tracking-[0.18em] text-[#C5A984]">
                  CURRENT FOCUS
                </p>
                <h3 className="relative mt-2 text-xl font-semibold text-[#F0ECE5]">
                  {currentWeek?.title || "Roadmap completed"}
                </h3>
                <p className="relative mt-3 text-sm leading-6 text-[#AAA093]">
                  {currentWeek?.description ||
                    "All weekly tasks are complete. Revisit difficult topics and continue building your skills."}
                </p>

                {currentWeek && (
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedWeeks((previous) =>
                        previous.includes(currentWeek.week)
                          ? previous
                          : [...previous, currentWeek.week]
                      );

                      document
                        .getElementById(`roadmap-week-${currentWeek.week}`)
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                    }}
                    className="relative mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#D8BD98] transition hover:gap-3"
                  >
                    View current goals
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>

              <div className="rounded-[26px] border border-[#403B35] bg-gradient-to-b from-[#23211E] to-[#1B1A19] p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#465B45] bg-[#293328] text-[#B5C4AA]">
                    <Clock3 size={19} />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.15em] text-[#928A80]">
                      YOUR COMMITMENT
                    </p>
                    <h3 className="mt-1 font-semibold text-[#F0ECE5]">
                      {savedCriteria?.hours || form.hours} per week
                    </h3>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-[#403B35] bg-[#191817] p-4">
                  <p className="text-sm font-semibold text-[#E9E2D8]">
                    Weekly deliverable
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#928A80]">
                    {currentWeek?.deliverable ||
                      "Complete your remaining tasks and review your learning outcomes."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetProgress}
                  disabled={isSaving || isGenerating || completedCount === 0}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#51483D] px-4 py-3 text-sm font-medium text-[#C9C1B6] transition hover:border-[#80694C] hover:bg-[#332A21] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RotateCcw size={15} />
                  Reset task progress
                </button>
              </div>

              <div className="rounded-[24px] border border-[#403B35] bg-[#201F1C] p-5">
                <h3 className="text-sm font-semibold text-[#E9E2D8]">
                  Your roadmap settings
                </h3>
                <div className="mt-4 space-y-3 text-sm">
                  <SettingRow
                    label="Current level"
                    value={savedCriteria?.level || form.level}
                  />
                  <SettingRow
                    label="Priority"
                    value={savedCriteria?.priority || form.priority}
                  />
                  <SettingRow
                    label="Duration"
                    value={savedCriteria?.duration || `${totalWeeks} weeks`}
                  />
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function SetupForm({
  form,
  updateForm,
  onSubmit,
  isGenerating,
  hasRoadmap,
  onCancel,
}) {
  return (
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <form
        onSubmit={onSubmit}
        className="relative overflow-hidden rounded-[26px] border border-[#403B35] bg-gradient-to-br from-[#22211F] to-[#1B1A19] p-6 shadow-[0_12px_35px_rgba(0,0,0,0.16)] sm:p-8"
      >
        <p className="text-[10px] font-semibold tracking-[0.19em] text-[#B7A18A]">
          BUILD YOUR ROADMAP
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#F0ECE5]">
          Let's plan your next move.
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#A59D93]">
          Tell us where you want to go. Gemini will create a learning plan
          tailored to your goals and available time.
        </p>

        <div className="mt-7 space-y-6">
          <div>
            <label
              htmlFor="roadmap-role"
              className="text-sm font-medium text-[#D9D2C8]"
            >
              Target role
            </label>
            <input
              id="roadmap-role"
              type="text"
              value={form.role}
              onChange={(event) => updateForm("role", event.target.value)}
              maxLength={255}
              required
              placeholder="e.g. Data Analyst, Backend Developer"
              className="mt-2 w-full rounded-xl border border-[#454039] bg-[#171615] px-4 py-3.5 text-sm text-[#F0ECE5] placeholder:text-[#746D63] outline-none transition focus:border-[#A58A68] focus:ring-4 focus:ring-[#C5A984]/10"
            />
          </div>

          <FormSelect
            id="roadmap-level"
            label="Current skill level"
            value={form.level}
            options={LEVELS}
            onChange={(value) => updateForm("level", value)}
          />

          <FormSelect
            id="roadmap-hours"
            label="Time available per week"
            value={form.hours}
            options={HOURS}
            onChange={(value) => updateForm("hours", value)}
          />

          <FormSelect
            id="roadmap-duration"
            label="Target timeline"
            value={form.duration}
            options={DURATIONS}
            onChange={(value) => updateForm("duration", value)}
          />

          <FormSelect
            id="roadmap-priority"
            label="Main priority"
            value={form.priority}
            options={PRIORITIES}
            onChange={(value) => updateForm("priority", value)}
          />

          <div>
            <label
              htmlFor="roadmap-skills"
              className="text-sm font-medium text-[#D9D2C8]"
            >
              Existing skills or preferences{" "}
              <span className="text-[#81796F]">(optional)</span>
            </label>
            <textarea
              id="roadmap-skills"
              value={form.skills}
              onChange={(event) => updateForm("skills", event.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="e.g. Know Python and SQL, have built a React project..."
              className="mt-2 w-full resize-y rounded-xl border border-[#454039] bg-[#171615] px-4 py-3.5 text-sm leading-6 text-[#F0ECE5] placeholder:text-[#746D63] outline-none transition focus:border-[#A58A68] focus:ring-4 focus:ring-[#C5A984]/10"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isGenerating || !form.role.trim()}
          className="group mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-[#D8C1A0] bg-gradient-to-r from-[#D8C1A0] via-[#C5A984] to-[#B39470] px-5 py-3.5 text-sm font-semibold text-[#241E17] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <LoaderCircle size={17} className="animate-spin" />
              Generating roadmap...
            </>
          ) : (
            <>
              <Sparkles size={17} />
              {hasRoadmap ? "Generate new roadmap" : "Generate my roadmap"}
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </>
          )}
        </button>

        {hasRoadmap && (
          <button
            type="button"
            onClick={onCancel}
            className="mt-3 w-full rounded-xl border border-[#403B35] px-4 py-3 text-sm font-medium text-[#AAA093] transition hover:bg-[#292621]"
          >
            Cancel and return to current roadmap
          </button>
        )}
      </form>

      <div className="flex flex-col gap-5">
        <div className="relative overflow-hidden rounded-[26px] border border-[#51473A] bg-gradient-to-br from-[#302920] via-[#27231E] to-[#211F1C] p-6 sm:p-7">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#796348]/60 bg-[#3A3025] text-[#D8BD98]">
            <BookOpen size={21} />
          </span>
          <h3 className="mt-5 text-xl font-semibold text-[#F0E7D9]">
            A plan that fits your life.
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#B3A797]">
            Your roadmap adapts to your current experience, your available time,
            and the kind of preparation you need.
          </p>

          <div className="mt-6 space-y-4">
            {[
              "Weekly goals with actionable tasks.",
              "Practical deliverables and useful resources.",
              "Persistent task-level progress tracking.",
              "A new plan whenever your goals change.",
            ].map((tip, index) => (
              <div key={tip} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#68543D] bg-[#3A3025] text-[11px] font-semibold text-[#D8BD98]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="pt-0.5 text-sm leading-5 text-[#C0B5A6]">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[26px] border border-[#403B35] bg-gradient-to-b from-[#23211E] to-[#1B1A19] p-6">
          <div className="flex items-center gap-3">
            <Target size={20} className="text-[#C5A984]" />
            <h3 className="font-semibold text-[#F0ECE5]">Your choices</h3>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <SettingRow label="Target role" value={form.role || "Not selected"} />
            <SettingRow label="Experience" value={form.level} />
            <SettingRow label="Weekly time" value={form.hours} />
            <SettingRow label="Timeline" value={form.duration} />
            <SettingRow label="Priority" value={form.priority} />
          </div>
        </div>
      </div>
    </section>
  );
}

function FormSelect({ id, label, value, options, onChange }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-sm font-medium text-[#D9D2C8]"
      >
        {label}
      </label>
      <div className="relative mt-2">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-xl border border-[#454039] bg-[#171615] px-4 py-3.5 pr-10 text-sm text-[#F0ECE5] outline-none transition focus:border-[#A58A68] focus:ring-4 focus:ring-[#C5A984]/10"
        >
          {options.map((option) => (
            <option key={option} value={option} className="bg-[#1D1C1A]">
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#928A80]"
        />
      </div>
    </div>
  );
}

function WeekCard({
  week,
  expanded,
  onExpand,
  completedSet,
  onToggleTask,
  onMarkWeekComplete,
  disabled,
}) {
  const tasks = Array.isArray(week.tasks) ? week.tasks : [];
  const doneCount = tasks.filter((task) => completedSet.has(task.id)).length;
  const isComplete = tasks.length > 0 && doneCount === tasks.length;
  const remainingTasks = tasks.filter(
    (task) => !completedSet.has(task.id)
  ).length;

  return (
    <div
      id={`roadmap-week-${week.week}`}
      className={`scroll-mt-24 overflow-hidden rounded-2xl border transition-colors ${
        isComplete
          ? "border-[#384738] bg-[#1F251F]"
          : "border-[#403B35] bg-[#201F1C] hover:border-[#51483D]"
      }`}
    >
      <button
        type="button"
        onClick={onExpand}
        aria-expanded={expanded}
        className="flex w-full items-start gap-3 p-4 text-left sm:p-5"
      >
        <span
          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
            isComplete
              ? "border-[#52684C] bg-[#293328] text-[#B5C4AA]"
              : "border-[#51483D] bg-[#302920] text-[#D8BD98]"
          }`}
        >
          {isComplete ? (
            <CheckCircle2 size={19} />
          ) : (
            <span className="text-sm font-semibold">{week.week}</span>
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#928A80]">
              Week {week.week}
            </span>

            {week.phase && (
              <span className="rounded-full border border-[#51483D] px-2 py-0.5 text-[10px] text-[#C5A984]">
                {week.phase}
              </span>
            )}

            {isComplete && (
              <span className="rounded-full border border-[#465B45] bg-[#293328] px-2 py-0.5 text-[10px] font-semibold text-[#B5C4AA]">
                Completed
              </span>
            )}
          </span>

          <span className="mt-2 block text-base font-semibold text-[#F0ECE5]">
            {week.title}
          </span>

          <span className="mt-2 block text-sm leading-6 text-[#928A80]">
            {week.description}
          </span>

          <span className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#81796F]">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={13} />
              {doneCount}/{tasks.length} tasks
            </span>

            {tasks.length > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Clock3 size={13} />
                {tasks.reduce(
                  (sum, task) => sum + (Number(task.hours) || 0),
                  0
                )}{" "}
                estimated hours
              </span>
            )}
          </span>
        </span>

        <ChevronDown
          size={18}
          className={`mt-2 shrink-0 text-[#928A80] transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="border-t border-[#403B35] p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[#928A80]">
              {remainingTasks === 0
                ? "All tasks in this week are complete."
                : `${remainingTasks} task${
                    remainingTasks === 1 ? "" : "s"
                  } remaining`}
            </p>

            <button
  type="button"
  onClick={() => onMarkWeekComplete(week)}
  disabled={disabled || tasks.length === 0}
  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#65513C] bg-[#332A21] px-3.5 py-2 text-xs font-semibold text-[#D8BD98] transition hover:border-[#A58A68] hover:bg-[#413526] disabled:cursor-not-allowed disabled:opacity-50"
>
  {isComplete ? <RotateCcw size={15} /> : <CheckCircle2 size={15} />}
  {isComplete ? "Unmark all tasks" : "Mark all tasks done"}
</button>
          </div>

          <div className="space-y-4">
            {tasks.map((task) => {
              const completed = completedSet.has(task.id);

              return (
                <div
                  key={task.id}
                  className="rounded-xl border border-[#403B35] bg-[#191817] p-4"
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      disabled={disabled}
                      aria-pressed={completed}
                      aria-label={`Mark ${task.title} ${
                        completed ? "incomplete" : "complete"
                      }`}
                      className={`mt-0.5 shrink-0 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        completed
                          ? "text-[#A4B49A]"
                          : "text-[#81796F] hover:text-[#D8BD98]"
                      }`}
                    >
                      {completed ? (
                        <CheckCircle2 size={21} />
                      ) : (
                        <Circle size={21} />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <h4
                        className={`text-sm font-semibold ${
                          completed
                            ? "text-[#A7B49D]"
                            : "text-[#E9E2D8]"
                        }`}
                      >
                        {task.title}
                      </h4>

                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#928A80]">
                        {task.description}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#81796F]">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 size={13} />
                          {task.hours}{" "}
                          {Number(task.hours) === 1 ? "hour" : "hours"}
                        </span>

                        {completed && (
                          <span className="text-[#A4B49A]">Completed</span>
                        )}
                      </div>

                      {task.resourceTitle && (
                        <div className="mt-3">
                          {task.resourceUrl ? (
                            <a
                              href={task.resourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-xs font-medium text-[#D8BD98] underline-offset-4 hover:underline"
                            >
                              <BookOpen size={14} />
                              {task.resourceTitle}
                              <ExternalLink size={12} />
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-2 text-xs text-[#B7A18A]">
                              <BookOpen size={14} />
                              {task.resourceTitle}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {week.deliverable && (
              <div className="rounded-xl border border-[#65513C]/60 bg-[#302920]/50 p-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#D8BD98]">
                  <Trophy size={14} />
                  Weekly deliverable
                </p>

                <p className="mt-2 text-sm leading-6 text-[#C0B5A6]">
                  {week.deliverable}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="rounded-full border border-[#65513C]/70 bg-[#332A21] px-3 py-1.5 text-xs font-medium text-[#D8BD98]">
      {children}
    </span>
  );
}

function SettingRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[#928A80]">{label}</span>
      <span className="max-w-[65%] text-right font-medium text-[#D9D2C8]">
        {value || "Not specified"}
      </span>
    </div>
  );
}

export default Roadmap;