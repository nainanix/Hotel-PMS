import { ROOMS } from './rooms'
import { GUESTS } from './guests'
import { RESERVATIONS } from './reservations'
import { NOTIFICATIONS } from './notifications'
import { nightsBetween, offsetISODate, toISODate } from '../utils/dates'

// Mock API layer. Every page reads through these functions rather than the
// raw data files above — this is the seam a real backend/HTTP client would
// slot into later without touching page components.

const TODAY = offsetISODate(0)

const ACTIVE_STATUSES = new Set(['confirmed', 'pending', 'checked-in'])

function overlapsRange(reservation, startISO, endISO) {
  return reservation.checkIn < endISO && reservation.checkOut > startISO
}

function isActiveToday(reservation) {
  return (
    reservation.status !== 'cancelled' &&
    reservation.checkIn <= TODAY &&
    reservation.checkOut > TODAY
  )
}

export function getNotifications() {
  return NOTIFICATIONS
}

export function getRooms() {
  return ROOMS
}

export function getRoomById(roomId) {
  return ROOMS.find((room) => room.id === roomId)
}

export function getGuests() {
  return GUESTS
}

export function getGuestById(guestId) {
  return GUESTS.find((guest) => guest.id === guestId)
}

export function getReservations() {
  return RESERVATIONS
}

// Appends a new reservation to the in-memory store. Stands in for a POST to
// a real reservations endpoint — callers should re-fetch (e.g. bump a state
// key) after calling this so views relying on getStayViewData/etc. re-render.
export function addReservation({ guestId, roomId, checkIn, checkOut, status, total }) {
  const reservation = {
    id: `res-${Date.now()}`,
    hotelId: 'hotel-1',
    guestId,
    roomId,
    checkIn,
    checkOut,
    status,
    total,
    createdAt: offsetISODate(0),
  }
  RESERVATIONS.push(reservation)
  return reservation
}

export function getReservationsByStatus(status) {
  return RESERVATIONS.filter((reservation) => reservation.status === status)
}

export function getReservationsForRoom(roomId) {
  return RESERVATIONS.filter((reservation) => reservation.roomId === roomId)
}

export function getReservationsForDateRange(startISO, endISO) {
  return RESERVATIONS.filter((reservation) => overlapsRange(reservation, startISO, endISO))
}

// Reservations joined with guest name and room details, for table/list views.
export function getReservationsDetailed() {
  return RESERVATIONS.map((reservation) => {
    const guest = getGuestById(reservation.guestId)
    const room = getRoomById(reservation.roomId)
    return {
      ...reservation,
      guestName: guest?.name ?? 'Unknown guest',
      roomNumber: room?.number ?? '—',
      roomType: room?.type ?? '—',
      nights: nightsBetween(reservation.checkIn, reservation.checkOut),
    }
  })
}

// Rooms + reservations scoped to a given month, with reservations already
// joined to guest/room display fields for the Stay View grid.
export function getStayViewData(year, month) {
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 1)
  const startISO = toISODate(monthStart)
  const endISO = toISODate(monthEnd)

  const reservations = getReservationsForDateRange(startISO, endISO)
    .filter((reservation) => reservation.status !== 'cancelled')
    .map((reservation) => {
      const guest = getGuestById(reservation.guestId)
      return { ...reservation, guestName: guest?.name ?? 'Unknown guest' }
    })

  return { rooms: ROOMS, reservations }
}

// Rooms joined with their current occupant (if any) and housekeeping info,
// for the Housekeeping screen.
export function getHousekeepingStatus() {
  return ROOMS.map((room) => {
    const activeReservation = RESERVATIONS.find(
      (reservation) => reservation.roomId === room.id && isActiveToday(reservation)
    )
    const guest = activeReservation ? getGuestById(activeReservation.guestId) : null
    return {
      ...room,
      currentGuestName: guest?.name ?? null,
      currentReservationStatus: activeReservation?.status ?? null,
    }
  })
}

// Guests joined with whether they currently have an active in-house stay.
export function getGuestsWithResidenceStatus() {
  return GUESTS.map((guest) => {
    const inResidence = RESERVATIONS.some(
      (reservation) => reservation.guestId === guest.id && isActiveToday(reservation)
    )
    return { ...guest, inResidence }
  })
}

export function getOccupancyStats() {
  const occupiedRoomIds = new Set(
    RESERVATIONS.filter(isActiveToday).map((reservation) => reservation.roomId)
  )
  const maintenanceRooms = ROOMS.filter((room) => room.occupancyStatus === 'maintenance').length
  const occupiedRooms = occupiedRoomIds.size
  const availableRooms = ROOMS.length - occupiedRooms - maintenanceRooms

  return {
    totalRooms: ROOMS.length,
    occupiedRooms,
    availableRooms,
    maintenanceRooms,
    occupancyRate: Math.round((occupiedRooms / ROOMS.length) * 100),
  }
}

export function getReservationSummaryStats() {
  const todaysCheckIns = RESERVATIONS.filter(
    (reservation) => reservation.checkIn === TODAY && reservation.status !== 'cancelled'
  ).length

  const activeStays = RESERVATIONS.filter(isActiveToday).length

  const pipeline = RESERVATIONS.filter((reservation) => ACTIVE_STATUSES.has(reservation.status))
  const avgDailyRate = pipeline.length
    ? pipeline.reduce((sum, reservation) => {
        const nights = nightsBetween(reservation.checkIn, reservation.checkOut) || 1
        return sum + reservation.total / nights
      }, 0) / pipeline.length
    : 0

  const { occupancyRate } = getOccupancyStats()

  return {
    todaysCheckIns,
    activeStays,
    avgDailyRate: Math.round(avgDailyRate),
    occupancyRate,
  }
}
