import { useNavigate } from 'react-router-dom'
import { getNotifications, markNotificationRead } from '../../data/api'
import { formatDateShort } from '../../utils/dates'
import Popover from '../ui/Popover'

function NotificationsPopover({ onClose, onRead }) {
  const navigate = useNavigate()
  const notifications = getNotifications()

  function handleNotificationClick(n) {
    markNotificationRead(n.id)
    onRead?.()
    onClose()
    if (n.type === 'reservation' && n.reservationId) {
      navigate('/reservations', { state: { openReservationId: n.reservationId } })
    } else if (n.type === 'housekeeping' && n.roomId) {
      navigate('/housekeeping/room-status', { state: { highlightRoomId: n.roomId } })
    }
  }

  return (
    <Popover title="Notifications" onClose={onClose} className="right-0 top-full mt-2">
      {notifications.length === 0 ? (
        <p className="py-3 text-center text-sm text-navy-300 dark:text-navy-500">No new notifications</p>
      ) : (
        <div className="flex flex-col gap-1">
          {notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => handleNotificationClick(n)}
              className="flex items-start gap-2.5 rounded-lg p-1.5 text-left transition-colors hover:bg-surface-muted"
            >
              <span
                className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-gold'}`}
              />
              <div>
                <p className="text-sm font-medium text-navy-600 dark:text-navy-50">{n.title}</p>
                <p className="text-xs text-navy-300 dark:text-navy-400">{n.description}</p>
                <p className="mt-0.5 text-[11px] text-navy-200 dark:text-navy-600">{formatDateShort(n.date)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </Popover>
  )
}

export default NotificationsPopover
