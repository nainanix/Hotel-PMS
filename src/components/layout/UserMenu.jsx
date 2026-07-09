import { User, Building2, Settings, LogOut } from 'lucide-react'
import Popover from '../ui/Popover'
import { useAuth } from '../../context/AuthContext'

function UserMenu({ onClose }) {
  const { session, profile, demoSession, signOut } = useAuth()

  const displayName = profile?.full_name ?? (demoSession ? 'Demo Vendor' : 'Ariana Cole')
  const displayHandle = session?.user?.email ?? (demoSession ? 'test' : '@ariana.cole')
  const hotelName = profile?.hotels?.name ?? (demoSession ? 'EVOTEL Demo Property' : 'EVOTEL Downtown')

  async function handleSignOut() {
    await signOut()
    onClose()
  }

  return (
    <Popover title="Account" onClose={onClose} className="right-0 top-full mt-2">
      <div className="flex flex-col gap-4 text-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-navy-900">
            <User size={18} strokeWidth={2} />
          </div>
          <div>
            <p className="font-medium text-navy-600 dark:text-navy-50">{displayName}</p>
            <p className="text-xs text-navy-300 dark:text-navy-400">{displayHandle}</p>
          </div>
        </div>

        <div className="rounded-lg bg-surface-muted px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-navy-300 dark:text-navy-400">
            <Building2 size={12} strokeWidth={2} />
            Property
          </p>
          <p className="mt-1 font-medium text-navy-600 dark:text-navy-50">{hotelName}</p>
        </div>

        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-left text-navy-500 transition-colors hover:bg-surface-muted dark:text-navy-300"
          >
            <Settings size={15} strokeWidth={1.75} />
            Account settings
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-left text-status-urgent transition-colors hover:bg-status-urgent/10"
          >
            <LogOut size={15} strokeWidth={1.75} />
            Sign out
          </button>
        </div>
      </div>
    </Popover>
  )
}

export default UserMenu
