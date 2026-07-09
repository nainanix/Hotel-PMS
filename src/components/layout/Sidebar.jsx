import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarRange,
  ClipboardList,
  Tag,
  Users,
  Sparkles,
  BarChart3,
  Settings,
} from 'lucide-react'
import NavItem from './NavItem'

const NAV_ITEMS = [
  { to: '/overview', label: 'Overview', icon: LayoutDashboard },
  { to: '/stay-view', label: 'Stay View', icon: CalendarRange },
  { to: '/reservations', label: 'Reservations', icon: ClipboardList },
  { to: '/rates', label: 'Rates', icon: Tag },
  { to: '/guests', label: 'Guest Database', icon: Users },
  { to: '/housekeeping', label: 'Housekeeping', icon: Sparkles },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
]

function Sidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-navy-900">
      <Link to="/overview" className="flex items-center px-6 py-7 transition-opacity hover:opacity-80">
        <span className="font-display text-2xl tracking-[0.2em] text-white">
          EVOTEL
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      <div className="border-t border-navy-700 px-3 py-3">
        <NavItem to="/settings" label="Settings" icon={Settings} />
      </div>
    </aside>
  )
}

export default Sidebar
