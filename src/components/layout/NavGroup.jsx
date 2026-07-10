import { useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'

function NavGroup({ label, icon: Icon, items, open, onOpen, onClose }) {
  const { pathname } = useLocation()
  const hasActiveChild = items.some((item) => item.to === pathname)
  const rootRef = useRef(null)

  // Closes as soon as a click lands outside this group's own button/panel —
  // covers clicking another section of the sidebar, another dropdown, or
  // anywhere else in the app, without needing every other element to know
  // about this one.
  useEffect(() => {
    if (!open) return
    function handlePointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open, onClose])

  function handleToggle() {
    if (open) onClose()
    else onOpen()
  }

  return (
    <div ref={rootRef}>
      <button
        type="button"
        onClick={handleToggle}
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
              onClick={onClose}
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
