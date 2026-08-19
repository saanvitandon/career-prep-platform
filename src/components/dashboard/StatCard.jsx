function StatCard({ icon, label, value, description, trend }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {value}
            </span>
          </div>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>

      </div>

      <div className="mt-4 flex items-center gap-2 text-xs">
        {trend && (
          <span className="font-semibold text-green-600">
            {trend}
          </span>
        )}

        <span className="text-slate-400">
          {description}
        </span>
      </div>

    </div>
  );
}

export default StatCard;