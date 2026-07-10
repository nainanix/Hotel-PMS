import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import DatePicker from '../ui/DatePicker'
import { nightsBetween, formatDateLong, addDays, parseISODate, toISODate } from '../../utils/dates'
import { formatCurrency, formatTime, formatTimeOfDay } from '../../utils/format'
import { hasRoomConflict, addGuest, updateGuest } from '../../data/api'

// Nightly rate card (INR) — used only to propose a starting tariff when a
// room type is picked; the tariff itself stays freely editable per booking.
const BASE_RATE = {
  'Deluxe King Room': 6500,
  'Luxury Suite Room': 11000,
}

const PROPERTY_LOCATION = 'EVOTEL Downtown'

const BUSINESS_SOURCES = ['Walk-in', 'OTA', 'Travel Agent', 'Corporate', 'Direct Website', 'Phone Booking', 'Sales Team']
const RATE_TYPES = ['Standard Rate', 'Corporate Rate', 'Package Rate', 'Promotional Rate', 'Government Rate', 'Long Stay Rate']
const ADULT_OPTIONS = [1, 2, 3, 4]
const CHILDREN_OPTIONS = [0, 1, 2, 3, 4]

const inputClass =
  'w-full rounded-lg border border-navy-100 bg-surface px-3 py-2 text-sm text-navy-600 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold dark:border-navy-700 dark:text-navy-100'

const tariffWrapClass =
  'flex items-center gap-1.5 rounded-lg border border-navy-100 bg-surface px-3 py-2 text-sm text-navy-600 focus-within:border-gold focus-within:ring-1 focus-within:ring-gold dark:border-navy-700 dark:text-navy-100'

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-navy-300 dark:text-navy-400">{label}</span>
      {children}
    </label>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 dark:text-gold-400">{children}</p>
  )
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-navy-300 dark:text-navy-400">{label}</p>
      <p className="mt-0.5 font-medium text-navy-600 dark:text-navy-50">{value}</p>
    </div>
  )
}

function splitGuestName(name = '') {
  const parts = name.trim().split(/\s+/)
  return [parts[0] ?? '', parts.slice(1).join(' ')]
}

// Booking timestamps created before this feature only stored a bare date
// (no time); newer ones store a full ISO datetime — handle both.
function formatBookingDateTime(createdAt) {
  if (!createdAt) return '—'
  return createdAt.includes('T')
    ? `${formatDateLong(createdAt.slice(0, 10))} · ${formatTime(createdAt)}`
    : formatDateLong(createdAt)
}

function ReservationModal({ mode, guests, rooms, prefill, reservation, onClose, onCreate, onUpdate }) {
  const isEdit = mode === 'edit' && Boolean(reservation)
  const editGuest = isEdit ? guests.find((g) => g.id === reservation.guestId) : null
  const [editFirst, editLast] = splitGuestName(editGuest?.name)

  const [firstName, setFirstName] = useState(editFirst)
  const [lastName, setLastName] = useState(editLast)
  const [mobile, setMobile] = useState(editGuest?.phone ?? '')
  const [email, setEmail] = useState(editGuest?.email ?? '')
  const [businessSource, setBusinessSource] = useState(reservation?.businessSource ?? '')
  const [status, setStatus] = useState(reservation?.status ?? 'confirmed')

  // roomId/checkIn may come from clicking a specific room+date cell on the
  // calendar (a deliberate action) but never fall back to a default room,
  // date, or reservation type beyond the "Confirmed" starting point above —
  // those stay blank until manually chosen (edit mode pre-fills from the
  // existing reservation instead).
  const initialRoom = rooms.find((r) => r.id === (reservation?.roomId ?? prefill?.roomId))
  const [roomType, setRoomType] = useState(initialRoom?.type ?? '')
  const [rateType, setRateType] = useState(reservation?.rateType ?? '')
  const [roomId, setRoomId] = useState(reservation?.roomId ?? prefill?.roomId ?? '')
  const [numberOfRooms, setNumberOfRooms] = useState(reservation?.numberOfRooms ?? 1)
  const [adults, setAdults] = useState(reservation?.adults ?? 1)
  const [children, setChildren] = useState(reservation?.children ?? 0)
  const [checkIn, setCheckIn] = useState(reservation?.checkIn ?? prefill?.checkIn ?? '')
  const [checkInTime, setCheckInTime] = useState(reservation?.checkInTime || '14:00')
  const [checkOut, setCheckOut] = useState(reservation?.checkOut ?? '')
  const [checkOutTime, setCheckOutTime] = useState(reservation?.checkOutTime || '11:00')
  const [tariff, setTariff] = useState(() => {
    if (isEdit) {
      const n = nightsBetween(reservation.checkIn, reservation.checkOut) || 1
      return String(Math.round(reservation.total / n))
    }
    return initialRoom ? String(BASE_RATE[initialRoom.type] ?? '') : ''
  })

  const roomTypes = [...new Set(rooms.map((r) => r.type))]
  const roomsOfType = rooms.filter((r) => r.type === roomType)

  // Check-out always follows check-in by one night until the guest picks a
  // different check-out date themselves.
  function handleCheckInChange(newCheckIn) {
    setCheckIn(newCheckIn)
    setCheckOut(toISODate(addDays(parseISODate(newCheckIn), 1)))
  }

  // Picking a room type proposes that type's rate-card tariff as a starting
  // point — the front desk can still edit it before creating the booking.
  // Changing type clears the room number since it belonged to the old type.
  function handleRoomTypeChange(e) {
    const newType = e.target.value
    setRoomType(newType)
    setRoomId('')
    setTariff(newType ? String(BASE_RATE[newType] ?? '') : '')
  }

  if (mode === 'view' && reservation) {
    const room = rooms.find((r) => r.id === reservation.roomId)
    const guest = guests.find((g) => g.id === reservation.guestId)
    const nights = nightsBetween(reservation.checkIn, reservation.checkOut) || 1
    const adr = Math.round(reservation.total / nights)
    const amountPaid = reservation.amountPaid ?? 0

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
                {PROPERTY_LOCATION} · Room {room?.number} · {room?.type}
              </p>
              {(guest?.phone || guest?.email) && (
                <p className="text-navy-300 dark:text-navy-400">
                  {[guest?.phone, guest?.email].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
            <Badge status={reservation.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-xl bg-surface-muted p-4">
            <DetailRow label="Reservation No." value={reservation.id} />
            <DetailRow label="Booking Date" value={formatBookingDateTime(reservation.createdAt)} />
            <DetailRow
              label="Arrival"
              value={`${formatDateLong(reservation.checkIn)}${
                reservation.checkInTime ? ` · ${formatTimeOfDay(reservation.checkInTime)}` : ''
              }`}
            />
            <DetailRow
              label="Departure"
              value={`${formatDateLong(reservation.checkOut)}${
                reservation.checkOutTime ? ` · ${formatTimeOfDay(reservation.checkOutTime)}` : ''
              }`}
            />
            <DetailRow label="Room Type" value={room?.type ?? '—'} />
            <DetailRow label="Rate Plan" value={reservation.rateType || '—'} />
            <DetailRow label="Average Daily Rate" value={formatCurrency(adr)} />
            <DetailRow label="Nights" value={nights} />
            {reservation.businessSource && <DetailRow label="Business Source" value={reservation.businessSource} />}
            {(reservation.adults || reservation.children) && (
              <DetailRow
                label="Occupancy"
                value={`${reservation.adults ?? 1} adult${(reservation.adults ?? 1) === 1 ? '' : 's'}${
                  reservation.children ? `, ${reservation.children} child${reservation.children === 1 ? '' : 'ren'}` : ''
                }`}
              />
            )}
            {reservation.numberOfRooms > 1 && <DetailRow label="Rooms" value={reservation.numberOfRooms} />}
          </div>

          <div className="grid grid-cols-3 gap-4 rounded-xl bg-surface-muted p-4">
            <DetailRow label="Total Amount" value={formatCurrency(reservation.total)} />
            <DetailRow label="Amount Paid" value={formatCurrency(amountPaid)} />
            <DetailRow label="Balance Due" value={formatCurrency(reservation.total - amountPaid)} />
          </div>
        </div>
      </Modal>
    )
  }

  const room = rooms.find((r) => r.id === roomId)
  const nights = checkIn && checkOut ? Math.max(nightsBetween(checkIn, checkOut), 0) : 0
  const tariffValue = Number(tariff)
  const roomsCount = Number(numberOfRooms) || 1
  // Total covers only the one room booked here (roomId) — every occupancy/
  // ADR/RevPAR calculation elsewhere reduces reservation.total / nights back
  // to a single room's nightly rate, so folding numberOfRooms into total
  // would silently corrupt those figures. numberOfRooms is captured as
  // booking metadata for now, not multiplied into the price.
  const total = tariffValue > 0 ? tariffValue * nights : 0
  const amountPaid = isEdit ? reservation.amountPaid ?? 0 : 0
  const conflict =
    roomId && nights > 0 && hasRoomConflict(roomId, checkIn, checkOut, isEdit ? reservation.id : undefined)
  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    roomType &&
    roomId &&
    checkIn &&
    checkOut &&
    status &&
    nights > 0 &&
    tariffValue > 0 &&
    !conflict

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return

    const fields = {
      roomId,
      checkIn,
      checkOut,
      checkInTime,
      checkOutTime,
      status,
      total,
      numberOfRooms: roomsCount,
      businessSource,
      roomType,
      rateType,
      adults: Number(adults),
      children: Number(children),
    }

    if (isEdit) {
      updateGuest(reservation.guestId, {
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        phone: mobile.trim(),
      })
      onUpdate(reservation.id, fields)
    } else {
      const guest = addGuest({ name: `${firstName.trim()} ${lastName.trim()}`, email: email.trim(), phone: mobile.trim() })
      onCreate({ guestId: guest.id, ...fields })
    }
  }

  return (
    <Modal
      title={isEdit ? 'Edit Reservation' : 'Create Reservation'}
      onClose={onClose}
      defaultMaximized
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit}>
            {isEdit ? 'Save Changes' : 'Create Reservation'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
        {isEdit && (
          <div className="grid grid-cols-3 gap-4 rounded-xl bg-surface-muted p-4">
            <DetailRow label="Reservation No." value={reservation.id} />
            <DetailRow label="Location" value={PROPERTY_LOCATION} />
            <DetailRow label="Booking Date" value={formatBookingDateTime(reservation.createdAt)} />
          </div>
        )}

        <SectionLabel>Guest Details</SectionLabel>
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
              placeholder="John"
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
              placeholder="Doe"
            />
          </Field>
          <Field label="Mobile Number">
            <input
              type="tel"
              autoComplete="off"
              className={inputClass}
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="(555) 000-0000"
            />
          </Field>
          <Field label="Email Address">
            <input
              type="email"
              autoComplete="off"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="guest@example.com"
            />
          </Field>
        </div>

        <SectionLabel>Booking Details</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Business Source">
            <select className={inputClass} value={businessSource} onChange={(e) => setBusinessSource(e.target.value)}>
              <option value="">Select source</option>
              {BUSINESS_SOURCES.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Reservation Type">
            <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              {isEdit && <option value="checked-in">Checked-In</option>}
              {isEdit && <option value="checked-out">Checked-Out</option>}
            </select>
          </Field>
        </div>

        <SectionLabel>Room Details</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Room Type">
            <select className={inputClass} value={roomType} onChange={handleRoomTypeChange}>
              <option value="" disabled>
                Select room type
              </option>
              {roomTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Rate Type">
            <select className={inputClass} value={rateType} onChange={(e) => setRateType(e.target.value)}>
              <option value="">Select rate type</option>
              {RATE_TYPES.map((rt) => (
                <option key={rt} value={rt}>
                  {rt}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Room Number">
            <select
              className={inputClass}
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              disabled={!roomType}
            >
              <option value="" disabled>
                {roomType ? 'Select a room' : 'Select room type first'}
              </option>
              {roomsOfType.map((r) => (
                <option key={r.id} value={r.id}>
                  Room {r.number}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Number of Rooms">
            <input
              type="number"
              min="1"
              step="1"
              className={inputClass}
              value={numberOfRooms}
              onChange={(e) => setNumberOfRooms(e.target.value)}
            />
          </Field>
          <Field label="Adults">
            <select className={inputClass} value={adults} onChange={(e) => setAdults(e.target.value)}>
              {ADULT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Children">
            <select className={inputClass} value={children} onChange={(e) => setChildren(e.target.value)}>
              {CHILDREN_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <SectionLabel>Stay Details</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Check-in Date">
            <DatePicker value={checkIn} onChange={handleCheckInChange} />
          </Field>
          <Field label="Check-in Time">
            <input
              type="time"
              className={inputClass}
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
            />
          </Field>
          <Field label="Check-out Date">
            <DatePicker value={checkOut} onChange={setCheckOut} />
          </Field>
          <Field label="Check-out Time">
            <input
              type="time"
              className={inputClass}
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
            />
          </Field>
          <Field label="Rate (per night)">
            <div className={tariffWrapClass}>
              <span className="text-navy-300 dark:text-navy-500">₹</span>
              <input
                type="number"
                min="0"
                step="100"
                required
                className="w-full bg-transparent focus:outline-none"
                value={tariff}
                onChange={(e) => setTariff(e.target.value)}
              />
            </div>
          </Field>
        </div>

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
            {roomsCount > 1 ? ` · ${roomsCount} rooms` : ''}
          </span>
          <span className="text-base font-semibold text-navy-600 dark:text-navy-50">{formatCurrency(total)}</span>
        </div>

        {isEdit && (
          <div className="grid grid-cols-3 gap-4 rounded-xl bg-surface-muted px-4 py-3">
            <DetailRow label="Total Amount" value={formatCurrency(total)} />
            <DetailRow label="Amount Paid" value={formatCurrency(amountPaid)} />
            <DetailRow label="Balance Due" value={formatCurrency(total - amountPaid)} />
          </div>
        )}
      </form>
    </Modal>
  )
}

export default ReservationModal
