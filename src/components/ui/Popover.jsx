import WindowDots from './WindowDots'

function Popover({ title, onClose, children, className = '' }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className={`absolute z-50 w-72 overflow-hidden rounded-2xl border border-navy-100/10 bg-surface shadow-2xl dark:border-white/10 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-navy-100 bg-surface-muted px-4 py-2.5 dark:border-navy-700">
          <WindowDots onClose={onClose} />
          <span className="flex-1 truncate text-center text-xs font-medium text-navy-500 dark:text-navy-200">{title}</span>
          <div className="w-9 shrink-0" />
        </div>
        <div className="p-4">{children}</div>
      </div>
    </>
  )
}

export default Popover
