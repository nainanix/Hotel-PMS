import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, ClipboardList, BedDouble } from 'lucide-react'
import SearchInput from '../ui/SearchInput'
import { searchAll } from '../../data/api'

const CATEGORY_SHORTCUTS = [
  { key: 'guests', label: 'Guests', description: 'Browse the guest directory', icon: Users, to: '/guests/database' },
  { key: 'reservations', label: 'Reservations', description: 'View all bookings', icon: ClipboardList, to: '/reservations' },
  { key: 'rooms', label: 'Rooms', description: 'Open the Stay View calendar', icon: BedDouble, to: '/stay-view' },
]

function ResultRow({ icon: Icon, title, subtitle, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-muted"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-600 dark:bg-gold-500/10 dark:text-gold-400">
        <Icon size={14} strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-navy-600 dark:text-navy-50">{title}</p>
        <p className="truncate text-xs text-navy-300 dark:text-navy-500">{subtitle}</p>
      </div>
    </button>
  )
}

function ResultGroup({ label, children }) {
  return (
    <div>
      <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-navy-300 dark:text-navy-500">
        {label}
      </p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}

function GlobalSearch({ className = '' }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  function go(to) {
    navigate(to)
    setQuery('')
    setOpen(false)
  }

  const results = query.trim() ? searchAll(query) : null
  const hasResults = results && (results.guests.length || results.reservations.length || results.rooms.length)

  return (
    <div className={`relative ${className}`}>
      <SearchInput
        value={query}
        onChange={setQuery}
        onFocus={() => setOpen(true)}
        placeholder="Search"
        className="w-full"
      />

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-navy-100/10 bg-surface p-2 shadow-2xl dark:border-white/10">
            {!query.trim() && (
              <ResultGroup label="Quick Links">
                {CATEGORY_SHORTCUTS.map((item) => (
                  <ResultRow
                    key={item.key}
                    icon={item.icon}
                    title={item.label}
                    subtitle={item.description}
                    onClick={() => go(item.to)}
                  />
                ))}
              </ResultGroup>
            )}

            {query.trim() && !hasResults && (
              <p className="px-3 py-4 text-center text-sm text-navy-300 dark:text-navy-500">
                No matches for "{query}"
              </p>
            )}

            {query.trim() && results.guests.length > 0 && (
              <ResultGroup label="Guests">
                {results.guests.map((guest) => (
                  <ResultRow
                    key={guest.id}
                    icon={Users}
                    title={guest.name}
                    subtitle={guest.email}
                    onClick={() => go('/guests/database')}
                  />
                ))}
              </ResultGroup>
            )}

            {query.trim() && results.reservations.length > 0 && (
              <ResultGroup label="Reservations">
                {results.reservations.map((reservation) => (
                  <ResultRow
                    key={reservation.id}
                    icon={ClipboardList}
                    title={reservation.guestName}
                    subtitle={`${reservation.id} · Room ${reservation.roomNumber}`}
                    onClick={() => go('/reservations')}
                  />
                ))}
              </ResultGroup>
            )}

            {query.trim() && results.rooms.length > 0 && (
              <ResultGroup label="Rooms">
                {results.rooms.map((room) => (
                  <ResultRow
                    key={room.id}
                    icon={BedDouble}
                    title={`Room ${room.number}`}
                    subtitle={room.type}
                    onClick={() => go('/stay-view')}
                  />
                ))}
              </ResultGroup>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default GlobalSearch
