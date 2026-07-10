import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'

function NavGroup({ label, icon: Icon, items }) {
  const { pathname } = useLocation()
  const hasActiveChild = items.some((item) => item.to === pathname)
  const [open, setOpen] = useState(hasActiveChild)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={[
          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          hasActiveChild
            ? 'bg-navy-700/60 text-white'
            : 'text-navy-200 hover:bg-navy-700/60 hover:text-white',
        ].join(' ')}
      >
        <Icon size={18} strokeWidth={1.75} />
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="ml-[22px] mt-1 flex flex-col gap-0.5 border-l border-navy-700 pl-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'rounded-lg px-2.5 py-1.5 text-sm transition-colors',
                  isActive ? 'font-medium text-gold' : 'text-navy-300 hover:text-white',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default NavGroup
