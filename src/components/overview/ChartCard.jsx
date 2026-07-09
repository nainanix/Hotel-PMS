function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`rounded-xl border border-navy-100 bg-surface p-5 dark:border-navy-700 ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-navy-600 dark:text-navy-50">{title}</h3>
        {subtitle && <p className="text-xs text-navy-300 dark:text-navy-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

export default ChartCard
