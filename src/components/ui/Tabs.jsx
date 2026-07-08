function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 rounded-lg bg-surface-muted p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={[
            'rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors',
            active === tab.key
              ? 'bg-navy text-white dark:bg-gold dark:text-navy-900'
              : 'text-navy-400 hover:text-navy-600 dark:text-navy-400 dark:hover:text-navy-100',
          ].join(' ')}
        >
          {tab.label}
          {typeof tab.count === 'number' && (
            <span className="ml-1.5 text-xs opacity-70">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}

export default Tabs
