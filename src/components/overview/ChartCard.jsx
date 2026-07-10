function ChartCard({ title, subtitle, children, className = '', onClick }) {
  const Wrapper = onClick ? 'button' : 'div'

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={[
        'flex h-full flex-col rounded-xl border border-navy-100 bg-surface p-5 text-left dark:border-navy-700',
        onClick ? 'w-full cursor-pointer transition-colors hover:border-gold-300 dark:hover:border-gold-500/50' : '',
        className,
      ].join(' ')}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-navy-600 dark:text-navy-50">{title}</h3>
        {subtitle && <p className="text-xs text-navy-300 dark:text-navy-500">{subtitle}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </Wrapper>
  )
}

export default ChartCard
