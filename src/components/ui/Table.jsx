// Unopinionated table shell — pages supply their own <thead>/<tbody> markup
// using the Th/Td helpers below so column layout stays flexible per screen.

export function Table({ children }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-navy-100 bg-surface dark:border-navy-700">
      <table className="w-full min-w-max text-left text-sm">{children}</table>
    </div>
  )
}

export function Th({ children, className = '', ...props }) {
  return (
    <th
      className={`border-b border-navy-100 bg-surface-muted px-4 py-3 text-xs font-semibold uppercase tracking-wide text-navy-300 dark:border-navy-700 dark:text-navy-500 ${className}`}
      {...props}
    >
      {children}
    </th>
  )
}

export function Td({ children, className = '', ...props }) {
  return (
    <td
      className={`border-b border-navy-100 px-4 py-3 text-navy-500 dark:border-navy-700 dark:text-navy-300 ${className}`}
      {...props}
    >
      {children}
    </td>
  )
}
