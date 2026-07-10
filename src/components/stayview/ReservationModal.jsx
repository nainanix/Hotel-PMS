import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import DatePicker from '../ui/DatePicker'
import { nightsBetween, offsetISODate, formatDateLong, addDays, parseISODate, toISODate } from '../../utils/dates'
import { formatCurrency } from '../../utils/format'
import { hasRoomConflict, addGuest } from '../../data/api'

// Nightly rate card (INR) — kept in sync with the totals in
// data/reservations.js so historical and newly-created bookings price
// identically.
const BASE_RATE = {
  'Deluxe King Room': 6500,
  'Luxury Suite Room': 11000,
}

const inputClass =
  'w-full rounded-lg border border-navy-100 bg-surface px-3 py-2 text-sm text-navy-600 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold dark:border-navy-700 dark:text-navy-100'

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-navy-300 dark:text-navy-400">{label}</span>
      {children}
    </label>
  )
}

function ReservationModal({ mode, guests, rooms, prefill, reservation, onClose, onCreate }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [roomId, setRoomId] = useState(prefill?.roomId ?? rooms[0]?.id ?? '')
  const initialCheckIn = prefill?.checkIn ?? offsetISODate(0)
  const [checkIn, setCheckIn] = useState(initialCheckIn)
  const [checkOut, setCheckOut] = useState(
    prefill?.checkOut ?? toISODate(addDays(parseISODate(initialCheckIn), 1))
  )
  const [status, setStatus] = useState('confirmed')

  // Check-out always follows check-in by one night until the guest picks a
  // different check-out date themselves.
  function handleCheckInChange(newCheckIn) {
    setCheckIn(newCheckIn)
    setCheckOut(toISODate(addDays(parseISODate(newCheckIn), 1)))
  }

  if (mode === 'view' && reservation) {
    const room = rooms.find((r) => r.id === reservation.roomId)
    const guest = guests.find((g) => g.id === reservation.guestId)
    const nights = nightsBetween(reservation.checkIn, reservation.checkOut)

    return (
      <Modal title="Reservation Details" onClose={onClose} maximizable={false} footer={
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>Done</Button>
        </div>
      }>
        <div className="flex flex-col gap-4 text-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-lg font-semibold text-navy-600 dark:text-navy-50">{guest?.name ?? 'Unknown guest'}</p>
              <p className="text-navy-300 dark:text-navy-400">
                Room {room?.number} · {room?.type}
              </p>
            </div>
            <Badge status={reservation.status} />
          </div>
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-surface-muted p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-navy-300 dark:text-navy-400">Check-in</p>
              <p className="mt-0.5 font-medium text-navy-600 dark:text-navy-50">{formatDateLong(reservation.checkIn)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-navy-300 dark:text-navy-400">Check-out</p>
              <p className="mt-0.5 font-medium text-navy-600 dark:text-navy-50">{formatDateLong(reservation.checkOut)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-navy-300 dark:text-navy-400">Nights</p>
              <p className="mt-0.5 font-medium text-navy-600 dark:text-navy-50">{nights}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-navy-300 dark:text-navy-400">Total</p>
              <p className="mt-0.5 font-medium text-navy-600 dark:text-navy-50">{formatCurrency(reservation.total)}</p>
            </div>
          </div>
        </div>
      </Modal>
    )
  }

  const room = rooms.find((r) => r.id === roomId)
  const nights = Math.max(nightsBetween(checkIn, checkOut), 0)
  const total = room ? (BASE_RATE[room.type] ?? 6500) * nights : 0
  const conflict = roomId && nights > 0 && hasRoomConflict(roomId, checkIn, checkOut)
  const canSubmit = firstName.trim() && lastName.trim() && roomId && nights > 0 && !conflict

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    const guest = addGuest({ name: `${firstName.trim()} ${lastName.trim()}` })
    onCreate({ guestId: guest.id, roomId, checkIn, checkOut, status, total })
  }

  return (
    <Modal
      title="Create Reservation"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit}>
            Create Reservation
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name">
            <input
              type="text"
              required
              autoComplete="off"
              name="reservation-guest-first-name"
              className={inputClass}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </Field>
          <Field label="Last Name">
            <input
              type="text"
              required
              autoComplete="off"
              name="reservation-guest-last-name"
              className={inputClass}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Field>
        </div>

        <Field label="Room">
          <select className={inputClass} value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                Room {r.number} · {r.type}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Check-in">
            <DatePicker value={checkIn} onChange={handleCheckInChange} />
          </Field>
          <Field label="Check-out">
            <DatePicker value={checkOut} onChange={setCheckOut} />
          </Field>
        </div>

        <Field label="Status">
          <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
          </select>
        </Field>

        {conflict && (
          <div className="flex items-start gap-2 rounded-xl bg-status-urgent/10 px-4 py-3 text-status-urgent">
            <AlertTriangle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />
            <p>
              Room {room?.number} is unavailable for part of this date range — already booked or under
              maintenance. Choose different dates or another room.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl bg-surface-muted px-4 py-3">
          <span className="text-navy-300 dark:text-navy-400">
            {nights} night{nights === 1 ? '' : 's'}
          </span>
          <span className="text-base font-semibold text-navy-600 dark:text-navy-50">{formatCurrency(total)}</span>
        </div>
      </form>
    </Modal>
  )
}

export default ReservationModal
