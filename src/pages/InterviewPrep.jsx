import { useCallback, useEffect, useState } from "react";
import {
  Mic2,
  Sparkles,
  ChevronDown,
  RotateCcw,
  Lightbulb,
  Save,
  CheckCircle2,
  Clock3,
  FileText,
  ArrowRight,
  History,
  AlertCircle,
  LoaderCircle,
  MessageSquare,
  Target,
  Trash2,
} from "lucide-react";

const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000"
}/api/interview`;

function InterviewPrep() {
  const [role, setRole] = useState("Software Engineer Intern");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionType, setQuestionType] = useState("Technical");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [loadingSessionId, setLoadingSessionId] = useState(null);
  const [deletingSessionId, setDeletingSessionId] = useState(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [dirty, setDirty] = useState(false);

  const getToken = () => localStorage.getItem("token");

  const loadHistory = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setIsLoadingHistory(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load interview history."
        );
      }

      setHistory(Array.isArray(data.sessions) ? data.sessions : []);
    } catch (err) {
      console.error("Load interview history error:", err);
      setError(err.message || "Unable to load interview history.");
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const reset = () => {
    setShowQuestions(false);
    setExpandedQuestion(null);
    setSession(null);
    setAnswers([]);
    setError("");
    setMessage("");
    setDirty(false);
  };

  const openPastSession = async (sessionId) => {
    const token = getToken();

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    setLoadingSessionId(sessionId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.session) {
        throw new Error(data.message || "Unable to open this session.");
      }

      const savedSession = data.session;
      const questions = Array.isArray(savedSession.questions)
        ? savedSession.questions
        : [];
      const savedAnswers = Array.isArray(savedSession.answers)
        ? savedSession.answers
        : [];

      setSession({ ...savedSession, questions });

      setAnswers(
        Array.from(
          { length: questions.length },
          (_, index) => savedAnswers[index] || ""
        )
      );

      setExpandedQuestion(null);
      setShowQuestions(true);
      setDirty(false);
    } catch (err) {
      console.error("Open interview session error:", err);
      setError(err.message || "Unable to open this session.");
    } finally {
      setLoadingSessionId(null);
    }
  };

  const deleteSession = async (sessionId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this interview session? This action cannot be undone."
    );

    if (!confirmed) return;

    const token = getToken();

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    setDeletingSessionId(sessionId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${sessionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete this session.");
      }

      setHistory((previous) =>
        previous.filter((item) => String(item.id) !== String(sessionId))
      );

      if (String(session?.id) === String(sessionId)) {
        reset();
      }

      setMessage("Interview session deleted successfully.");
    } catch (err) {
      console.error("Delete interview session error:", err);
      setError(err.message || "Unable to delete this session.");
    } finally {
      setDeletingSessionId(null);
    }
  };

  const generateQuestions = async () => {
    if (!role.trim() || isGenerating) return;

    const token = getToken();

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setMessage("");
    setExpandedQuestion(null);

    try {
      const response = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: role.trim(),
          difficulty,
          questionType,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.session) {
        throw new Error(data.message || "Unable to generate questions.");
      }

      const newSession = {
        ...data.session,
        questions: Array.isArray(data.session.questions)
          ? data.session.questions
          : [],
      };

      setSession(newSession);
      setAnswers(Array(newSession.questions.length).fill(""));
      setShowQuestions(true);
      setDirty(false);

      await loadHistory();
    } catch (err) {
      console.error("Interview generation error:", err);
      setError(err.message || "Unable to generate questions.");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveAnswers = async () => {
    if (!session || isSaving) return;

    const token = getToken();

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${session.id}/answers`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save your answers.");
      }

      setSession((previous) => ({
        ...previous,
        answers: data.session.answers,
        updated_at: data.session.updated_at,
      }));

      setAnswers(
        Array.isArray(data.session.answers)
          ? data.session.answers
          : answers
      );

      setDirty(false);
      setMessage("Your answers have been saved successfully.");

      await loadHistory();
    } catch (err) {
      console.error("Save interview answers error:", err);
      setError(err.message || "Unable to save your answers.");
    } finally {
      setIsSaving(false);
    }
  };

  const questions = Array.isArray(session?.questions)
    ? session.questions
    : [];

  const answeredCount = answers.filter((answer) => answer.trim()).length;

  const progress =
    questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 pb-8 text-[#F0ECE5]">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-40 top-28 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(173,135,91,0.055),transparent_70%)] blur-3xl" />
        <div className="absolute -left-48 top-[45%] h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(135,145,119,0.035),transparent_70%)] blur-3xl" />
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-[26px] border border-[#403B35] bg-gradient-to-br from-[#24221F] via-[#1C1B19] to-[#191817] p-6 shadow-[0_12px_35px_rgba(0,0,0,0.16)] sm:p-8">
        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#65513C]/70 bg-[#332A21]/70 px-3.5 py-2 text-[10px] font-semibold tracking-[0.18em] text-[#D4B994]">
            <Sparkles size={14} />
            YOUR INTERVIEW WORKSPACE
          </div>

          <h1 className="max-w-3xl text-3xl font-semibold leading-[1.2] tracking-[-0.04em] text-[#F1ECE4] sm:text-5xl">
            Practice with purpose.
            <span className="mt-1 block bg-gradient-to-r from-[#E7D8C1] via-[#C5A984] to-[#A99175] bg-clip-text text-transparent">
              Walk in prepared.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#AAA197] sm:text-base">
            Build confidence with role-specific questions, preparation tips,
            and a place to develop your answers at your own pace.
          </p>

          <div className="my-6 border-t border-[#403B35]/80" />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#65513C]/60 bg-[#332A21] text-[#D4B994]">
                <History size={18} />
              </div>

              <div>
                <p className="text-sm font-medium text-[#E9E2D8]">
                  {history.length}{" "}
                  {history.length === 1 ? "saved session" : "saved sessions"}
                </p>
                <p className="mt-1 text-xs text-[#928A80]">
                  Pick up where you left off.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#8F877D]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#A4B49A]" />
              Your preparation space, ready when you are.
            </div>
          </div>
        </div>
      </section>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-[#744540] bg-[#332321] p-4 text-sm text-[#E7B2A9]"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Success message */}
      {message && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-[#465B45] bg-[#222D23] p-4 text-sm text-[#C1D4B8]"
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <p>{message}</p>
        </div>
      )}

      {!showQuestions ? (
        <>
          {/* Session setup and tips */}
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="relative overflow-hidden rounded-[26px] border border-[#403B35] bg-gradient-to-br from-[#22211F] to-[#1B1A19] p-6 shadow-[0_12px_35px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.035)] sm:p-8">
              <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 bg-[radial-gradient(circle_at_top_right,rgba(197,169,132,0.06),transparent_70%)]" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.19em] text-[#B7A18A]">
                    BUILD YOUR SESSION
                  </p>

                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#F0ECE5]">
                    Let&apos;s get you ready.
                  </h2>

                  <p className="mt-2 max-w-md text-sm leading-6 text-[#A59D93]">
                    Tailor your practice to the position and interview style
                    you&apos;re preparing for.
                  </p>
                </div>

                <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#65513C]/60 bg-gradient-to-br from-[#3A3025] to-[#29231D] text-[#D4B994] sm:flex">
                  <Mic2 size={21} />
                </div>
              </div>

              <div className="relative mt-8">
                <label
                  htmlFor="target-role"
                  className="text-sm font-medium text-[#D9D2C8]"
                >
                  Target role
                </label>

                <input
                  id="target-role"
                  type="text"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  maxLength={255}
                  placeholder="e.g. Software Engineer Intern"
                  className="mt-2 w-full rounded-xl border border-[#454039] bg-[#171615] px-4 py-3.5 text-sm text-[#F0ECE5] placeholder:text-[#746D63] outline-none transition focus:border-[#A58A68] focus:ring-4 focus:ring-[#C5A984]/10"
                />
              </div>

              <div className="relative mt-7">
                <p className="text-sm font-medium text-[#D9D2C8]">
                  Difficulty
                </p>
                <p className="mt-1 text-xs text-[#8F877D]">
                  Choose the level you want to work towards.
                </p>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {["Easy", "Medium", "Hard"].map((level) => (
                    <OptionButton
                      key={level}
                      label={level}
                      active={difficulty === level}
                      onClick={() => setDifficulty(level)}
                    />
                  ))}
                </div>
              </div>

              <div className="relative mt-7">
                <p className="text-sm font-medium text-[#D9D2C8]">
                  Question type
                </p>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {["Technical", "Behavioral", "HR"].map((type) => (
                    <OptionButton
                      key={type}
                      label={type}
                      active={questionType === type}
                      onClick={() => setQuestionType(type)}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={generateQuestions}
                disabled={!role.trim() || isGenerating}
                className="group relative mt-8 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-[#D8C1A0] bg-gradient-to-r from-[#D8C1A0] via-[#C5A984] to-[#B39470] px-5 py-3.5 text-sm font-semibold text-[#241E17] shadow-[0_5px_20px_rgba(160,126,86,0.13),inset_0_1px_0_rgba(255,255,255,0.45)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(160,126,86,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Generating questions...
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
                    Generate questions
                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col gap-5">
              <div className="relative overflow-hidden rounded-[26px] border border-[#51473A] bg-gradient-to-br from-[#302920] via-[#27231E] to-[#211F1C] p-6 shadow-[0_14px_38px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.045)] sm:p-7">
                <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(197,169,132,0.10),transparent_70%)]" />

                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#796348]/60 bg-[#3A3025] text-[#D8BD98]">
                  <Lightbulb size={21} />
                </div>

                <h3 className="relative mt-5 text-xl font-semibold text-[#F0E7D9]">
                  Make practice count.
                </h3>

                <p className="relative mt-2 text-sm leading-6 text-[#B3A797]">
                  Don&apos;t aim for a perfect answer on the first try. Explain
                  your thinking, use specific examples, and refine your
                  response with each practice session.
                </p>

                <div className="relative mt-6 space-y-4">
                  {[
                    "Think through the question before writing.",
                    "Use examples from projects or experience.",
                    "Save your answers to revisit them later.",
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

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <InfoCard
                  icon={<Target size={18} />}
                  title="Role-specific"
                  description="Practice for your selected position."
                />
                <InfoCard
                  icon={<History size={18} />}
                  title="Saved sessions"
                  description="Return to previous questions and answers."
                />
                <InfoCard
                  icon={<FileText size={18} />}
                  title="Your own answers"
                  description="Write, save, and improve your responses."
                />
              </div>
            </div>
          </section>

          {/* Practice history */}
          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.19em] text-[#B7A18A]">
                  YOUR PRACTICE HISTORY
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#F0ECE5] sm:text-2xl">
                  Pick up where you left off.
                </h2>
              </div>

              <span className="text-sm text-[#8F877D]">
                {history.length}{" "}
                {history.length === 1 ? "session" : "sessions"}
              </span>
            </div>

            {isLoadingHistory ? (
              <div className="flex items-center gap-3 rounded-2xl border border-[#403B35] bg-[#1D1C1A] p-6 text-sm text-[#A59D93]">
                <LoaderCircle size={18} className="animate-spin" />
                Loading your interview history...
              </div>
            ) : history.length === 0 ? (
              <div className="rounded-[26px] border border-dashed border-[#514A40] bg-[#1B1A18] px-6 py-12 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#403B35] bg-[#292621] text-[#B7A18A]">
                  <MessageSquare size={21} />
                </span>
                <h3 className="mt-4 font-semibold text-[#E9E2D8]">
                  Your story starts here.
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#928A80]">
                  Generate your first set of interview questions. Your saved
                  sessions will show up here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="group relative overflow-hidden rounded-[24px] border border-[#403B35] bg-gradient-to-br from-[#22211F] to-[#1B1A19] p-5 shadow-[0_10px_28px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.035)] transition duration-200 hover:-translate-y-0.5 hover:border-[#685540] hover:shadow-[0_14px_35px_rgba(0,0,0,0.20)]"
                  >
                    <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#C5A984]/20 to-transparent opacity-0 transition group-hover:opacity-100" />

                    <div className="min-w-0">
                      <h3 className="break-words font-semibold text-[#F0ECE5]">
                        {item.target_role}
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full border border-[#645239] bg-[#332B20] px-3 py-1 text-xs font-medium text-[#D8C29D]">
                          {item.difficulty}
                        </span>
                        <span className="rounded-full border border-[#51463A] bg-[#2B2621] px-3 py-1 text-xs font-medium text-[#C7B7A3]">
                          {item.question_type}
                        </span>
                        <span className="rounded-full border border-[#3D4A3B] bg-[#252D24] px-3 py-1 text-xs font-medium text-[#B9C9AE]">
                          {item.question_count} questions
                        </span>
                      </div>
                    </div>

                    <p className="mt-4 flex items-center gap-2 text-xs text-[#8F877D]">
                      <Clock3 size={14} />
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString()
                        : "Date unavailable"}
                    </p>

                    {/* Buttons now share one row with consistent spacing */}
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => openPastSession(item.id)}
                        disabled={
                          loadingSessionId !== null ||
                          deletingSessionId !== null
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#51483D] bg-[#29251F] px-4 py-2.5 text-sm font-medium text-[#D8C29D] transition hover:border-[#8C7455] hover:bg-[#332B21] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {String(loadingSessionId) === String(item.id) ? (
                          <>
                            <LoaderCircle
                              size={15}
                              className="animate-spin"
                            />
                            Opening...
                          </>
                        ) : (
                          <>
                            Continue session
                            <ArrowRight size={15} />
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteSession(item.id)}
                        disabled={
                          deletingSessionId !== null ||
                          loadingSessionId !== null
                        }
                        aria-label={`Delete interview session for ${item.target_role}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#744540] bg-[#332321] px-4 py-2.5 text-sm font-medium text-[#E7B2A9] transition hover:border-[#A65E55] hover:bg-[#422A27] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {String(deletingSessionId) === String(item.id) ? (
                          <>
                            <LoaderCircle
                              size={15}
                              className="animate-spin"
                            />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 size={15} />
                            Delete session
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        <>
          {/* Active interview session */}
          <section>
            <button
              type="button"
              onClick={reset}
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#A59D93] transition hover:text-[#E0C7A5]"
            >
              <RotateCcw size={15} />
              Back to interview workspace
            </button>

            <div className="relative overflow-hidden rounded-[26px] border border-[#51483D] bg-gradient-to-br from-[#302920] via-[#211F1C] to-[#191817] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-8">
              <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-[#C5A984]/10" />
              <div className="pointer-events-none absolute -right-4 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(197,169,132,0.08),transparent_70%)]" />

              <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#65513C] bg-[#332A21]/70 px-3 py-1.5 text-[10px] font-semibold tracking-[0.16em] text-[#D8BD98]">
                    <Mic2 size={14} />
                    PRACTICE SESSION
                  </div>

                  <h2 className="mt-4 break-words text-2xl font-semibold tracking-tight text-[#F0ECE5] sm:text-3xl">
                    {session?.target_role || "Interview practice"}
                  </h2>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-[#645239] bg-[#332B20] px-3 py-1.5 text-xs font-semibold text-[#D8C29D]">
                      {session?.difficulty}
                    </span>
                    <span className="rounded-full border border-[#51463A] bg-[#2B2621] px-3 py-1.5 text-xs font-semibold text-[#C7B7A3]">
                      {session?.question_type}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 rounded-2xl border border-[#51483D] bg-[#191817]/70 p-4 sm:min-w-40">
                  <p className="text-xs text-[#A59D93]">
                    Questions answered
                  </p>

                  <p className="mt-2 text-3xl font-semibold tabular-nums text-[#F0ECE5]">
                    {answeredCount}
                    <span className="ml-1 text-base font-normal text-[#8F877D]">
                      / {questions.length}
                    </span>
                  </p>

                  <div
                    className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#403B35]"
                    role="progressbar"
                    aria-valuenow={answeredCount}
                    aria-valuemin={0}
                    aria-valuemax={questions.length}
                    aria-label="Questions answered"
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#A4B49A] to-[#C5D1B9] shadow-[0_0_10px_rgba(164,180,154,0.22)] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Questions and answers */}
          <section className="rounded-[26px] border border-[#403B35] bg-gradient-to-b from-[#22211F] to-[#1B1A19] p-5 shadow-[0_12px_35px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.035)] sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-[#F0ECE5]">
                  Your questions
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#A59D93]">
                  Expand a question to see its preparation tip and write your
                  answer.
                </p>
              </div>

              <span className="rounded-full border border-[#51483D] bg-[#2B2621] px-3 py-1.5 text-xs font-semibold text-[#D8BD98]">
                {questions.length} questions
              </span>
            </div>

            {questions.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-[#403B35] bg-[#191817] p-6 text-sm text-[#A59D93]">
                This session doesn&apos;t contain any questions.
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {questions.map((question, index) => (
                  <QuestionItem
                    key={`${session?.id}-${index}`}
                    number={index + 1}
                    question={question.question || "Untitled question"}
                    tip={
                      question.tip ||
                      "Think through your answer step by step."
                    }
                    answer={answers[index] || ""}
                    onAnswerChange={(value) => {
                      setAnswers((previous) =>
                        previous.map((answer, answerIndex) =>
                          answerIndex === index ? value : answer
                        )
                      );

                      setDirty(true);
                      setMessage("");
                    }}
                    expanded={expandedQuestion === index}
                    onClick={() =>
                      setExpandedQuestion((previous) =>
                        previous === index ? null : index
                      )
                    }
                  />
                ))}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-4 border-t border-[#403B35] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[#D1C9BE]">
                  {dirty
                    ? "You have unsaved changes."
                    : "Your answers are saved when you choose Save answers."}
                </p>

                <p className="mt-1 text-xs text-[#8F877D]">
                  {answeredCount} of {questions.length} questions answered
                </p>
              </div>

              <button
                type="button"
                onClick={saveAnswers}
                disabled={isSaving || questions.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D8C1A0] bg-gradient-to-r from-[#D8C1A0] to-[#B39470] px-5 py-3 text-sm font-semibold text-[#241E17] shadow-[0_4px_16px_rgba(160,126,86,0.12)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Saving answers...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save answers
                  </>
                )}
              </button>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-xl border border-[#403B35] bg-[#1D1C1A] px-5 py-3 text-sm font-medium text-[#B5ADA2] transition hover:border-[#65513C] hover:bg-[#292621] hover:text-[#E0C7A5]"
            >
              <RotateCcw size={16} />
              Start another session
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function OptionButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl border px-2 py-3 text-sm font-medium transition-all duration-200 sm:px-4 ${
        active
          ? "border-[#8D7455] bg-gradient-to-b from-[#403426] to-[#30271E] text-[#E1C49B] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_15px_rgba(197,169,132,0.04)]"
          : "border-[#403B35] bg-[#191817] text-[#A59D93] hover:border-[#625543] hover:bg-[#25231F] hover:text-[#E0D8CD]"
      }`}
    >
      {label}
    </button>
  );
}

function InfoCard({ icon, title, description }) {
  return (
    <div className="group flex items-start gap-3 rounded-2xl border border-[#393530] bg-gradient-to-br from-[#211F1D] to-[#1B1A19] p-4 transition duration-200 hover:border-[#514638]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#403B35] bg-[#292621] text-[#B7A18A] transition group-hover:border-[#65513C] group-hover:text-[#D8BD98]">
        {icon}
      </span>

      <div>
        <h3 className="text-sm font-semibold text-[#E9E2D8]">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-[#928A80]">{description}</p>
      </div>
    </div>
  );
}

function QuestionItem({
  number,
  question,
  tip,
  answer,
  onAnswerChange,
  expanded,
  onClick,
}) {
  return (
    <div className="group overflow-hidden rounded-[20px] border border-[#403B35] transition-colors duration-200 hover:border-[#51483D]">
      <button
        type="button"
        onClick={onClick}
        aria-expanded={expanded}
        className={`flex w-full items-center gap-3 p-4 text-left transition sm:gap-4 sm:p-5 ${
          expanded
            ? "bg-gradient-to-r from-[#302920] to-[#25221E]"
            : "bg-[#1C1B19] hover:bg-[#25231F]"
        }`}
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-semibold tabular-nums ${
            answer.trim()
              ? "border-[#465B45] bg-[#252D24] text-[#B9C9AE]"
              : "border-[#51483D] bg-[#302920] text-[#D8BD98]"
          }`}
        >
          {answer.trim() ? (
            <CheckCircle2 size={16} />
          ) : (
            String(number).padStart(2, "0")
          )}
        </span>

        <span className="min-w-0 flex-1 text-sm font-medium leading-6 text-[#E4DED4] sm:text-base">
          {question}
        </span>

        <ChevronDown
          size={18}
          className={`shrink-0 text-[#8F877D] transition-transform duration-200 ${
            expanded ? "rotate-180 text-[#D8BD98]" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="space-y-5 border-t border-[#403B35] bg-[#191817] p-4 sm:p-5">
          <div className="relative overflow-hidden rounded-2xl border border-[#51483D] bg-gradient-to-br from-[#302920] to-[#25211C] p-4">
            <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 bg-[radial-gradient(circle_at_top_right,rgba(197,169,132,0.08),transparent_70%)]" />

            <div className="relative flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#65513C]/70 bg-[#3A3025] text-[#D8BD98]">
                <Lightbulb size={18} />
              </span>

              <div>
                <p className="text-sm font-semibold text-[#E8D8C0]">
                  Preparation tip
                </p>
                <p className="mt-1 text-sm leading-6 text-[#B7AA98]">
                  {tip}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                htmlFor={`answer-${number}`}
                className="text-sm font-semibold text-[#D9D2C8]"
              >
                Your answer
              </label>

              <span className="text-xs tabular-nums text-[#81796F]">
                {answer.length.toLocaleString()}/10,000
              </span>
            </div>

            <textarea
              id={`answer-${number}`}
              value={answer}
              maxLength={10000}
              onChange={(event) => onAnswerChange(event.target.value)}
              placeholder="Structure your thoughts, add examples, and write your answer here..."
              rows={5}
              className="w-full resize-y rounded-xl border border-[#454039] bg-[#141312] p-4 text-sm leading-6 text-[#F0ECE5] outline-none transition placeholder:text-[#746D63] focus:border-[#A58A68] focus:ring-4 focus:ring-[#C5A984]/10"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewPrep;