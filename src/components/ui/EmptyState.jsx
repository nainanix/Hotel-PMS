function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-navy-100 bg-surface text-center dark:border-navy-700">
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold-50 text-gold-600 dark:bg-gold-500/10 dark:text-gold-400">
          <Icon size={22} strokeWidth={1.75} />
        </div>
      )}
      <h2 className="text-lg font-semibold text-navy-600 dark:text-navy-50">{title}</h2>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-navy-300 dark:text-navy-500">{description}</p>
      )}
    </div>
  )
}

export default EmptyState
