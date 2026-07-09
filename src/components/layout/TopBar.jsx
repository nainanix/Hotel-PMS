import { useState } from 'react'
import { Bell, Phone, User, Moon, Sun } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import SearchInput from '../ui/SearchInput'
import ContactPopover from './ContactPopover'
import NotificationsPopover from './NotificationsPopover'
import UserMenu from './UserMenu'
import { useTheme } from '../../context/ThemeContext'
import { getNotifications } from '../../data/api'

const PAGE_TITLES = {
  '/overview': 'Overview',
  '/stay-view': 'Stay View',
  '/reservations': 'Reservations',
  '/rates': 'Rates',
  '/guests': 'Guest Database',
  '/housekeeping': 'Housekeeping',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

function TopBar() {
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] ?? 'Hotel PMS'
  const { theme, toggleTheme } = useTheme()
  const [openMenu, setOpenMenu] = useState(null) // 'contact' | 'notifications' | 'user' | null

  const unreadCount = getNotifications().filter((n) => !n.read).length

  function toggle(menu) {
    setOpenMenu((current) => (current === menu ? null : menu))
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-navy-100 bg-navy-900 px-6">
      <div className="flex items-center gap-6">
        <h1 className="text-base font-semibold text-white">{title}</h1>
        <SearchInput placeholder="Search" className="w-64" />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-full p-2 text-navy-200 transition-colors hover:bg-navy-700 hover:text-white"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun size={18} strokeWidth={1.75} /> : <Moon size={18} strokeWidth={1.75} />}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => toggle('notifications')}
            className="relative rounded-full p-2 text-navy-200 transition-colors hover:bg-navy-700 hover:text-white"
            aria-label="Notifications"
          >
            <Bell size={18} strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-gold" />
            )}
          </button>
          {openMenu === 'notifications' && (
            <NotificationsPopover onClose={() => setOpenMenu(null)} />
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => toggle('contact')}
            className="rounded-full p-2 text-navy-200 transition-colors hover:bg-navy-700 hover:text-white"
            aria-label="Contact us"
          >
            <Phone size={18} strokeWidth={1.75} />
          </button>
          {openMenu === 'contact' && <ContactPopover onClose={() => setOpenMenu(null)} />}
        </div>

        <div className="relative ml-1">
          <button
            type="button"
            onClick={() => toggle('user')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-navy-900 transition-opacity hover:opacity-90"
            aria-label="Account"
          >
            <User size={18} strokeWidth={2} />
          </button>
          {openMenu === 'user' && <UserMenu onClose={() => setOpenMenu(null)} />}
        </div>
      </div>
    </header>
  )
}

export default TopBar
