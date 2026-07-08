import { NavLink } from 'react-router-dom'

function NavItem({ to, icon: Icon, label }) {
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
      <span>{label}</span>
    </NavLink>
  )
}

export default NavItem
