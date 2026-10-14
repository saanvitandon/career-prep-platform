
import { useState } from "react";
import {
  Mic2,
  Sparkles,
  ChevronDown,
  RotateCcw,
  Lightbulb,
  Save,
} from "lucide-react";
import { useEffect } from "react";

const API_URL = "http://localhost:5000/api/interview";

function InterviewPrep() {
  const [role, setRole] = useState("Software Engineer Intern");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionType, setQuestionType] = useState("Technical");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const getToken = () => localStorage.getItem("token");

  const generateQuestions = async () => {
    if (!role.trim() || isGenerating) return;

    const token = getToken();

    if (!token) {
      setError("Please log in again to continue.");
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
        throw new Error(
          data.message || "Unable to generate questions."
        );
      }

      setSession(data.session);
      setAnswers(
        Array(data.session.questions.length).fill("")
      );
      setShowQuestions(true);
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
      setError("Please log in again to continue.");
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/${session.id}/answers`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ answers }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to save your answers."
        );
      }

      setSession((previous) => ({
        ...previous,
        answers: data.session.answers,
        updated_at: data.session.updated_at,
      }));

      setMessage("Your answers have been saved successfully.");
    } catch (err) {
      console.error("Save interview answers error:", err);
      setError(err.message || "Unable to save your answers.");
    } finally {
      setIsSaving(false);
    }
  };

  const reset = () => {
    setShowQuestions(false);
    setExpandedQuestion(null);
    setSession(null);
    setAnswers([]);
    setError("");
    setMessage("");
  };

  const questions = session?.questions || [];

  return (
    <div>
      <section>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <Mic2 size={21} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Interview Prep
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Practice role-specific questions and save your answers.
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          {message}
        </div>
      )}

      {!showQuestions ? (
        <section className="mt-8">
          <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <div>
              <label
                htmlFor="target-role"
                className="text-sm font-semibold text-slate-800"
              >
                Target role
              </label>
              <p className="mt-1 text-xs text-slate-500">
                What position are you preparing for?
              </p>
              <input
                id="target-role"
                type="text"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                maxLength={255}
                placeholder="e.g. Software Engineer Intern"
                className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div className="mt-7">
              <label className="text-sm font-semibold text-slate-800">
                Difficulty
              </label>
              <p className="mt-1 text-xs text-slate-500">
                Choose the level of questions you want to practice.
              </p>
              <div className="mt-3 flex gap-3">
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

            <div className="mt-7">
              <label className="text-sm font-semibold text-slate-800">
                Question type
              </label>
              <p className="mt-1 text-xs text-slate-500">
                Choose the kind of interview questions you want.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
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
              onClick={generateQuestions}
              disabled={!role.trim() || isGenerating}
              className={`mt-8 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                role.trim() && !isGenerating
                  ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md"
                  : "cursor-not-allowed bg-slate-100 text-slate-400"
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Generating questions...
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Generate Questions
                </>
              )}
            </button>
          </div>

          <div className="mx-auto mt-6 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
            <InfoCard
              title="Role-specific"
              description="Practice questions for your selected role."
            />
            <InfoCard
              title="Saved sessions"
              description="Your generated sessions are stored in PostgreSQL."
            />
            <InfoCard
              title="Practice-ready"
              description="Expand questions, review tips, and save answers."
            />
          </div>
        </section>
      ) : (
        <section className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">
                Interview practice session
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                {session.target_role}
              </h2>
              <div className="mt-2 flex gap-2">
                <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                  {session.difficulty}
                </span>
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {session.question_type}
                </span>
              </div>
            </div>

            <button
              onClick={reset}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              <RotateCcw size={16} />
              New session
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Practice questions
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Expand a question to see its preparation tip and write your answer.
                </p>
              </div>
              <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                {questions.length} questions
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {questions.map((question, index) => (
                <QuestionItem
                  key={index}
                  number={index + 1}
                  question={question.question}
                  tip={question.tip}
                  answer={answers[index] || ""}
                  onAnswerChange={(value) =>
                    setAnswers((previous) =>
                      previous.map((answer, answerIndex) =>
                        answerIndex === index ? value : answer
                      )
                    )
                  }
                  expanded={expandedQuestion === index}
                  onClick={() =>
                    setExpandedQuestion(
                      expandedQuestion === index ? null : index
                    )
                  }
                />
              ))}
            </div>

            <div className="mt-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <p className="text-xs text-slate-500">
                Remember to save your answers before leaving this session.
              </p>
              <button
                onClick={saveAnswers}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={17} />
                {isSaving ? "Saving answers..." : "Save answers"}
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={reset}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <RotateCcw size={17} />
              Start another session
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function OptionButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
        active
          ? "border-blue-200 bg-blue-50 text-blue-600"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

function InfoCard({ title, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
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
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <button
        type="button"
        onClick={onClick}
        aria-expanded={expanded}
        className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-slate-50"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600">
          {String(number).padStart(2, "0")}
        </span>
        <span className="flex-1 text-sm font-medium text-slate-700">
          {question}
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-slate-400 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-slate-100 bg-blue-50/50 px-4 py-4">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Lightbulb size={16} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">
                Preparation tip
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">{tip}</p>
            </div>
          </div>

          <div>
            <label
              htmlFor={`answer-${number}`}
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Your answer
            </label>
            <textarea
              id={`answer-${number}`}
              value={answer}
              maxLength={10000}
              onChange={(event) => onAnswerChange(event.target.value)}
              placeholder="Write your answer here..."
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewPrep;
