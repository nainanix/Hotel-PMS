import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { nightsBetween, offsetISODate, formatDateLong, addDays, parseISODate, toISODate } from '../../utils/dates'
import { formatCurrency } from '../../utils/format'

const BASE_RATE = {
  'Deluxe King Room': 200,
  'Luxury Suite Room': 320,
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
  const [guestId, setGuestId] = useState(prefill?.guestId ?? guests[0]?.id ?? '')
  const [roomId, setRoomId] = useState(prefill?.roomId ?? rooms[0]?.id ?? '')
  const initialCheckIn = prefill?.checkIn ?? offsetISODate(0)
  const [checkIn, setCheckIn] = useState(initialCheckIn)
  const [checkOut, setCheckOut] = useState(
    prefill?.checkOut ?? toISODate(addDays(parseISODate(initialCheckIn), 2))
  )
  const [status, setStatus] = useState('confirmed')

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
  const total = room ? (BASE_RATE[room.type] ?? 200) * nights : 0
  const canSubmit = guestId && roomId && nights > 0

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    onCreate({ guestId, roomId, checkIn, checkOut, status, total })
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
        <Field label="Guest">
          <select className={inputClass} value={guestId} onChange={(e) => setGuestId(e.target.value)}>
            {guests.map((guest) => (
              <option key={guest.id} value={guest.id}>
                {guest.name}
              </option>
            ))}
          </select>
        </Field>

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
            <input
              type="date"
              className={inputClass}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </Field>
          <Field label="Check-out">
            <input
              type="date"
              className={inputClass}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </Field>
        </div>

        <Field label="Status">
          <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
          </select>
        </Field>

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
