import { List, LayoutGrid } from 'lucide-react'

function ViewToggle({ view, onChange }) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-navy-100 p-1 dark:border-navy-700">
      <button
        type="button"
        onClick={() => onChange('list')}
        aria-label="List view"
        className={
          view === 'list'
            ? 'rounded-md bg-navy p-1.5 text-white dark:bg-gold dark:text-navy-900'
            : 'rounded-md p-1.5 text-navy-300 transition-colors hover:text-navy-600 dark:text-navy-500 dark:hover:text-navy-100'
        }
      >
        <List size={16} strokeWidth={1.75} />
      </button>
      <button
        type="button"
        onClick={() => onChange('grid')}
        aria-label="Grid view"
        className={
          view === 'grid'
            ? 'rounded-md bg-navy p-1.5 text-white dark:bg-gold dark:text-navy-900'
            : 'rounded-md p-1.5 text-navy-300 transition-colors hover:text-navy-600 dark:text-navy-500 dark:hover:text-navy-100'
        }
      >
        <LayoutGrid size={16} strokeWidth={1.75} />
      </button>
    </div>
  )
}

export default ViewToggle
