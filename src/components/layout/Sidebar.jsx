import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarRange,
  ClipboardList,
  Network,
  Cog,
  CircleUserRound,
  IndianRupee,
  Sparkles,
  FileText,
  Lock,
  BarChart3,
  FileDown,
  Settings,
} from 'lucide-react'
import NavItem from './NavItem'
import NavGroup from './NavGroup'

const NAV_ITEMS = [
  { to: '/overview', label: 'Overview', icon: LayoutDashboard },
  { to: '/stay-view', label: 'Stay View', icon: CalendarRange },
  { to: '/reservations', label: 'Reservations', icon: ClipboardList },
  {
    label: 'Rates & Availability',
    icon: Network,
    items: [
      { to: '/rates/plans', label: 'Rate Plans' },
      { to: '/rates/availability', label: 'Availability Calendar' },
      { to: '/rates/seasonal-pricing', label: 'Seasonal Pricing' },
      { to: '/rates/restrictions', label: 'Rate Restrictions' },
    ],
  },
  {
    label: 'Distribution',
    icon: Cog,
    items: [
      { to: '/distribution/channel-manager', label: 'Channel Manager' },
      { to: '/distribution/ota-connections', label: 'OTA Connections' },
      { to: '/distribution/rate-parity', label: 'Rate Parity' },
      { to: '/distribution/booking-engine', label: 'Booking Engine' },
    ],
  },
  {
    label: 'Guest',
    icon: CircleUserRound,
    items: [
      { to: '/guests/database', label: 'Guest Database' },
      { to: '/guests/profiles', label: 'Guest Profiles' },
      { to: '/guests/loyalty', label: 'Loyalty Program' },
      { to: '/guests/feedback', label: 'Feedback & Reviews' },
    ],
  },
  {
    label: 'Cashiering',
    icon: IndianRupee,
    items: [
      { to: '/cashiering/folios', label: 'Folios' },
      { to: '/cashiering/payments', label: 'Payments' },
      { to: '/cashiering/invoices', label: 'Invoices' },
      { to: '/cashiering/refunds', label: 'Refunds' },
    ],
  },
  {
    label: 'Housekeeping',
    icon: Sparkles,
    items: [
      { to: '/housekeeping/room-status', label: 'Room Status' },
      { to: '/housekeeping/staff-assignments', label: 'Staff Assignments' },
      { to: '/housekeeping/maintenance-requests', label: 'Maintenance Requests' },
      { to: '/housekeeping/schedule', label: 'Cleaning Schedule' },
    ],
  },
  {
    label: 'Night Audit',
    icon: FileText,
    items: [
      { to: '/night-audit/checklist', label: 'Audit Checklist' },
      { to: '/night-audit/end-of-day', label: 'End of Day Report' },
      { to: '/night-audit/discrepancies', label: 'Discrepancy Log' },
    ],
  },
]

const NAV_ITEMS_LOWER = [
  { to: '/net-locks', label: 'Net Locks', icon: Lock },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/exported-reports', label: 'Exported Reports', icon: FileDown },
]

function Sidebar({ open }) {
  const { pathname } = useLocation()
  const [openGroup, setOpenGroup] = useState(() => {
    const match = NAV_ITEMS.find((item) => item.items?.some((sub) => sub.to === pathname))
    return match?.label ?? null
  })

  return (
    <aside
      className={`flex h-screen shrink-0 flex-col overflow-hidden bg-navy-900 transition-all duration-200 ${
        open ? 'w-64' : 'w-0'
      }`}
    >
      <div className="flex h-screen w-64 flex-col">
        <Link to="/overview" className="flex items-center px-6 py-7 transition-opacity hover:opacity-80">
          <span className="font-display text-2xl tracking-[0.2em] text-white">EVOTEL</span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-3">
          {NAV_ITEMS.map((item) =>
            item.items ? (
              <NavGroup
                key={item.label}
                {...item}
                open={openGroup === item.label}
                onOpen={() => setOpenGroup(item.label)}
                onClose={() => setOpenGroup((g) => (g === item.label ? null : g))}
              />
            ) : (
              <NavItem key={item.to} {...item} />
            )
          )}

          <div className="my-2 border-t border-navy-700" />

          {NAV_ITEMS_LOWER.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        <div className="border-t border-navy-700 px-3 py-3">
          <NavItem to="/settings" label="Settings" icon={Settings} />
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
