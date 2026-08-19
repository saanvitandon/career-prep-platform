import { useState } from "react";
import {
  Map,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock3,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

function Roadmap() {
  const [showRoadmap, setShowRoadmap] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateRoadmap = () => {
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      setShowRoadmap(true);
    }, 1200);
  };

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
              Your AI-generated plan to become placement-ready.
            </p>
          </div>

        </div>
      </section>


      {showRoadmap && (
        <>
          {/* Overview */}
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-start justify-between">

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
                onClick={() => {
                  setShowRoadmap(false);
                }}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
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
                  37%
                </span>

              </div>

              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[37%] rounded-full bg-green-500" />
              </div>

              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>3 of 8 weeks</span>
                <span>5 weeks remaining</span>
              </div>

            </div>

          </section>


          {/* Main grid */}
          <section className="mt-8 grid grid-cols-3 gap-6">

            {/* Timeline */}
            <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Your 8-week plan
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Follow the roadmap step by step to build your skills.
                </p>
              </div>


              <div className="mt-7">

                {roadmapWeeks.map((week, index) => (
                  <RoadmapItem
                    key={week.week}
                    {...week}
                    isLast={index === roadmapWeeks.length - 1}
                  />
                ))}

              </div>

            </div>


            {/* Right column */}
            <div className="space-y-5">

              {/* AI Recommendation */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-6">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Sparkles size={19} />
                </div>

                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  AI recommendation
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  You're progressing well. Your strongest area is
                  problem-solving, but you should spend extra time on
                  binary search and complexity analysis this week.
                </p>

                <button className="mt-5 flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
                  View current goals
                  <ArrowRight size={15} />
                </button>

              </div>


              {/* Current Focus */}
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
                      Binary Search
                    </h3>
                  </div>

                </div>


                <div className="mt-5">

                  <div className="flex justify-between text-xs">

                    <span className="text-slate-500">
                      Topic progress
                    </span>

                    <span className="font-semibold text-slate-700">
                      65%
                    </span>

                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-[65%] rounded-full bg-green-500" />
                  </div>

                </div>


                <div className="mt-5 rounded-xl bg-slate-50 p-4">

                  <p className="text-xs font-semibold text-slate-700">
                    Next up
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Practice 5 medium-level binary search problems.
                  </p>

                </div>

              </div>

            </div>

          </section>
        </>
      )}


      {/* Regenerate state */}
      {!showRoadmap && (
        <section className="mt-8">

          <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

            <div className="text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <Sparkles size={25} />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-slate-900">
                Generate a new roadmap
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Our AI will create a personalized preparation plan based
                on your target role, skills, and preparation goals.
              </p>

              <button
                onClick={generateRoadmap}
                disabled={isGenerating}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-300"
              >

                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Generating roadmap...
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
                    Generate Roadmap
                  </>
                )}

              </button>

            </div>

          </div>

        </section>
      )}

    </div>
  );
}


/* Timeline item */
function RoadmapItem({
  week,
  title,
  description,
  status,
  isLast,
}) {
  const completed = status === "completed";
  const current = status === "current";

  return (
    <div className="flex gap-4">

      {/* Timeline */}
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


      {/* Content */}
      <div className="pb-8">

        <div className="flex items-center gap-2">

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

      </div>

    </div>
  );
}


/* Mock roadmap data */
const roadmapWeeks = [
  {
    week: 1,
    title: "Arrays & Strings",
    description:
      "Build strong fundamentals with arrays, strings, sorting, and basic problem-solving patterns.",
    status: "completed",
  },
  {
    week: 2,
    title: "Hashing & Two Pointers",
    description:
      "Learn efficient lookup techniques and common two-pointer problem patterns.",
    status: "completed",
  },
  {
    week: 3,
    title: "Binary Search",
    description:
      "Master binary search and learn how to identify problems where it can reduce complexity.",
    status: "current",
  },
  {
    week: 4,
    title: "Linked Lists",
    description:
      "Understand linked list operations, pointer manipulation, and common interview problems.",
    status: "upcoming",
  },
  {
    week: 5,
    title: "Trees & Binary Search Trees",
    description:
      "Learn tree traversal, recursion, BST operations, and common interview patterns.",
    status: "upcoming",
  },
  {
    week: 6,
    title: "Graphs",
    description:
      "Cover BFS, DFS, shortest paths, and graph-based problem solving.",
    status: "upcoming",
  },
  {
    week: 7,
    title: "Dynamic Programming",
    description:
      "Learn the fundamentals of memoization, tabulation, and common DP patterns.",
    status: "upcoming",
  },
  {
    week: 8,
    title: "Interview Preparation",
    description:
      "Practice mixed DSA problems, behavioral questions, and mock interview sessions.",
    status: "upcoming",
  },
];

export default Roadmap;