import { ArrowRight, CheckCircle2 } from "lucide-react";

function RoadmapCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-slate-500">
            Your roadmap
          </p>

          <h3 className="mt-1 text-lg font-semibold text-slate-900">
            Software Engineer
          </h3>
        </div>

        <div className="rounded-lg bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
          Week 3 of 8
        </div>

      </div>

      {/* Progress */}
      <div className="mt-6">

        <div className="mb-2 flex justify-between text-xs">
          <span className="font-medium text-slate-600">
            Overall progress
          </span>

          <span className="font-semibold text-slate-900">
            37%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-[37%] rounded-full bg-green-500" />
        </div>

      </div>

      {/* Current focus */}
      <div className="mt-6 rounded-xl bg-slate-50 p-4">

        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Current focus
        </p>

        <div className="mt-2 flex items-center gap-2">
          <CheckCircle2 size={17} className="text-green-500" />

          <span className="text-sm font-medium text-slate-700">
            Data Structures & Algorithms
          </span>
        </div>

      </div>

      <button className="mt-5 flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
        View full roadmap
        <ArrowRight size={16} />
      </button>

    </div>
  );
}

export default RoadmapCard;