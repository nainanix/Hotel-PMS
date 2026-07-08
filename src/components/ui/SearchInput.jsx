import { Search } from 'lucide-react'

function SearchInput({ value, onChange, placeholder = 'Search', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={16}
        strokeWidth={1.75}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy-300 dark:text-navy-500"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-navy-100 bg-surface py-2 pl-9 pr-3 text-sm text-navy-600 placeholder:text-navy-300 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold dark:border-navy-700 dark:text-navy-100 dark:placeholder:text-navy-500"
      />
    </div>
  )
}

export default SearchInput
