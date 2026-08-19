import { useState } from "react";
import {
  Mic2,
  Sparkles,
  ChevronDown,
  RotateCcw,
  Lightbulb,
} from "lucide-react";

function InterviewPrep() {
  const [role, setRole] = useState("Software Engineer Intern");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionType, setQuestionType] = useState("Technical");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const generateQuestions = () => {
    if (!role.trim()) return;

    setIsGenerating(true);
    setExpandedQuestion(null);

    setTimeout(() => {
      setIsGenerating(false);
      setShowQuestions(true);
    }, 1200);
  };

  const reset = () => {
    setShowQuestions(false);
    setExpandedQuestion(null);
  };

  return (
    <div>

      {/* Header */}
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
              Practice with AI-generated questions tailored to your target role.
            </p>
          </div>

        </div>
      </section>


      {!showQuestions ? (

        /* =========================
           SETUP STATE
        ========================== */

        <section className="mt-8">

          <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

            {/* Target Role */}
            <div>

              <label className="text-sm font-semibold text-slate-800">
                Target role
              </label>

              <p className="mt-1 text-xs text-slate-500">
                What position are you preparing for?
              </p>

              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Software Engineer Intern"
                className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />

            </div>


            {/* Difficulty */}
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


            {/* Question Type */}
            <div className="mt-7">

              <label className="text-sm font-semibold text-slate-800">
                Question type
              </label>

              <p className="mt-1 text-xs text-slate-500">
                Select the kind of questions you want the AI to generate.
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


            {/* Generate */}
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


          {/* Info cards */}
          <div className="mx-auto mt-6 grid max-w-3xl grid-cols-3 gap-4">

            <InfoCard
              title="Role-specific"
              description="Questions tailored to your target position."
            />

            <InfoCard
              title="AI-generated"
              description="Fresh questions generated for every session."
            />

            <InfoCard
              title="Practice-ready"
              description="Prepare for technical and behavioral rounds."
            />

          </div>

        </section>

      ) : (

        /* =========================
           QUESTIONS STATE
        ========================== */

        <section className="mt-8">

          {/* Summary */}
          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-500">
                AI-generated interview session
              </p>

              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                {role}
              </h2>

              <div className="mt-2 flex gap-2">

                <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                  {difficulty}
                </span>

                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {questionType}
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


          {/* Questions */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <h3 className="text-base font-semibold text-slate-900">
                  Generated questions
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Click a question to view an AI preparation tip.
                </p>

              </div>

              <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                5 questions
              </span>

            </div>


            <div className="mt-5 space-y-3">

              {questions.map((question, index) => (
                <QuestionItem
                  key={index}
                  number={index + 1}
                  question={question.question}
                  tip={question.tip}
                  expanded={expandedQuestion === index}
                  onClick={() =>
                    setExpandedQuestion(
                      expandedQuestion === index ? null : index
                    )
                  }
                />
              ))}

            </div>

          </div>


          {/* Bottom CTA */}
          <div className="mt-6 flex justify-end">

            <button
              onClick={generateQuestions}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
            >
              <Sparkles size={17} />
              Generate New Questions
            </button>

          </div>

        </section>

      )}

    </div>
  );
}


/* Option button */
function OptionButton({ label, active, onClick }) {
  return (
    <button
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


/* Info card */
function InfoCard({ title, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

      <h3 className="text-sm font-semibold text-slate-800">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>

    </div>
  );
}


/* Question */
function QuestionItem({
  number,
  question,
  tip,
  expanded,
  onClick,
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">

      <button
        onClick={onClick}
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
        <div className="border-t border-slate-100 bg-blue-50/50 px-4 py-4">

          <div className="flex gap-3">

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Lightbulb size={16} />
            </div>

            <div>

              <p className="text-xs font-semibold text-slate-800">
                AI preparation tip
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                {tip}
              </p>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}


/* Mock questions */
const questions = [
  {
    question:
      "Explain the difference between a process and a thread.",
    tip:
      "Mention memory isolation, resource sharing, context switching, and how threads within the same process share resources.",
  },
  {
    question:
      "How would you optimize a slow SQL query?",
    tip:
      "Discuss query execution plans, indexing, avoiding unnecessary columns, joins, filtering, and database statistics.",
  },
  {
    question:
      "Tell me about a challenging project you worked on.",
    tip:
      "Use the STAR method: describe the situation, your task, the actions you took, and the measurable result.",
  },
  {
    question:
      "How would you design a scalable REST API?",
    tip:
      "Think about resource-oriented endpoints, HTTP methods, validation, authentication, error handling, pagination, and database design.",
  },
  {
    question:
      "Why are you interested in this role?",
    tip:
      "Connect your technical interests and experience with the company's role requirements rather than giving a generic answer.",
  },
];

export default InterviewPrep;