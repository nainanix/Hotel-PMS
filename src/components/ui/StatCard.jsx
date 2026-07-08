function StatCard({ label, value, icon: Icon, hint }) {
  return (
    <div className="rounded-xl border border-navy-100 bg-surface p-5 dark:border-navy-700">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-navy-300 dark:text-navy-400">{label}</p>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-50 text-gold-600 dark:bg-gold-500/10 dark:text-gold-400">
            <Icon size={16} strokeWidth={1.75} />
          </div>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold text-navy-600 dark:text-navy-50">{value}</p>
      {hint && <p className="mt-1 text-xs text-navy-300 dark:text-navy-500">{hint}</p>}
    </div>
  )
}

export default StatCard
