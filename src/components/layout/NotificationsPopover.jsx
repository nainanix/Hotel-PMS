import { getNotifications } from '../../data/api'
import { formatDateShort } from '../../utils/dates'
import Popover from '../ui/Popover'

function NotificationsPopover({ onClose }) {
  const notifications = getNotifications()

  return (
    <Popover title="Notifications" onClose={onClose} className="right-0 top-full mt-2">
      {notifications.length === 0 ? (
        <p className="py-3 text-center text-sm text-navy-300 dark:text-navy-500">No new notifications</p>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <div key={n.id} className="flex items-start gap-2.5">
              <span
                className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-gold'}`}
              />
              <div>
                <p className="text-sm font-medium text-navy-600 dark:text-navy-50">{n.title}</p>
                <p className="text-xs text-navy-300 dark:text-navy-400">{n.description}</p>
                <p className="mt-0.5 text-[11px] text-navy-200 dark:text-navy-600">{formatDateShort(n.date)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Popover>
  )
}

export default NotificationsPopover
