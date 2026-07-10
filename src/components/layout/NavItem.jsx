import { NavLink } from 'react-router-dom'

function NavItem({ to, icon: Icon, label, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-navy-700 text-gold border-l-2 border-gold pl-[10px]'
            : 'text-navy-200 hover:bg-navy-700/60 hover:text-white border-l-2 border-transparent pl-[10px]',
        ].join(' ')
      }
    >
      <Icon size={18} strokeWidth={1.75} />
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="rounded-full bg-status-urgent px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
          {badge}
        </span>
      )}
    </NavLink>
  )
}

export default NavItem
