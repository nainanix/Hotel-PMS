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

// True if roomId already has a non-cancelled reservation overlapping the
// given date range. Used to block double-bookings before they're created.
export function hasRoomConflict(roomId, checkIn, checkOut) {
  return RESERVATIONS.some(
    (reservation) =>
      reservation.roomId === roomId &&
      reservation.status !== 'cancelled' &&
      overlapsRange(reservation, checkIn, checkOut)
  )
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

// Today's ADR (Average Daily Rate) — mean nightly rate across rooms
// currently occupied. RevPAR (Revenue Per Available Room) follows the
// standard formula: ADR × occupancy rate, expressed here as total nightly
// revenue today spread across every room in inventory, occupied or not.
export function getKeyMetrics(year, month) {
  const activeReservations = RESERVATIONS.filter(isActiveToday)
  const nightlyRevenueToday = activeReservations.reduce((sum, reservation) => {
    const nights = nightsBetween(reservation.checkIn, reservation.checkOut) || 1
    return sum + reservation.total / nights
  }, 0)

  const adr = activeReservations.length ? nightlyRevenueToday / activeReservations.length : 0
  const revpar = ROOMS.length ? nightlyRevenueToday / ROOMS.length : 0

  const monthStart = toISODate(new Date(year, month, 1))
  const monthEnd = toISODate(new Date(year, month + 1, 1))
  const monthlyRevenue = RESERVATIONS.filter(
    (reservation) =>
      reservation.status !== 'cancelled' && reservation.checkIn >= monthStart && reservation.checkIn < monthEnd
  ).reduce((sum, reservation) => sum + reservation.total, 0)

  return {
    occupancyRate: getOccupancyStats().occupancyRate,
    adr: Math.round(adr),
    revpar: Math.round(revpar),
    monthlyRevenue: Math.round(monthlyRevenue),
  }
}

// Occupied-room count for each day of the given month — feeds the Overview
// occupancy trend chart.
export function getOccupancyByDay(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => {
    const dateISO = toISODate(new Date(year, month, i + 1))
    const occupiedRooms = new Set(
      RESERVATIONS.filter(
        (reservation) =>
          reservation.status !== 'cancelled' &&
          reservation.checkIn <= dateISO &&
          reservation.checkOut > dateISO
      ).map((reservation) => reservation.roomId)
    ).size
    return {
      day: i + 1,
      dateISO,
      occupiedRooms,
      rate: ROOMS.length ? Math.round((occupiedRooms / ROOMS.length) * 100) : 0,
    }
  })
}

// Total booked revenue grouped by room type, across all non-cancelled
// reservations — feeds the Overview revenue-by-room-type chart.
export function getRevenueByRoomType() {
  const totals = new Map()
  RESERVATIONS.filter((reservation) => reservation.status !== 'cancelled').forEach((reservation) => {
    const room = getRoomById(reservation.roomId)
    if (!room) return
    totals.set(room.type, (totals.get(room.type) ?? 0) + reservation.total)
  })
  return Array.from(totals, ([type, revenue]) => ({ type, revenue }))
}

// Guest count by status (VIP / Returning / Corporate / New) — feeds the
// Overview guest-mix chart.
export function getGuestStatusBreakdown() {
  const totals = new Map()
  GUESTS.forEach((guest) => {
    totals.set(guest.status, (totals.get(guest.status) ?? 0) + 1)
  })
  return Array.from(totals, ([status, count]) => ({ status, count }))
}

// Next `limit` upcoming arrivals (check-in today or later), joined with
// guest/room display fields, soonest first.
export function getUpcomingArrivals(limit = 5) {
  return RESERVATIONS.filter(
    (reservation) => reservation.status !== 'cancelled' && reservation.checkIn >= TODAY
  )
    .sort((a, b) => (a.checkIn < b.checkIn ? -1 : 1))
    .slice(0, limit)
    .map((reservation) => ({
      ...reservation,
      guestName: getGuestById(reservation.guestId)?.name ?? 'Unknown guest',
      roomNumber: getRoomById(reservation.roomId)?.number ?? '—',
    }))
}

// Next `limit` upcoming departures (check-out today or later), same shape
// as getUpcomingArrivals.
export function getUpcomingDepartures(limit = 5) {
  return RESERVATIONS.filter(
    (reservation) => reservation.status !== 'cancelled' && reservation.checkOut >= TODAY
  )
    .sort((a, b) => (a.checkOut < b.checkOut ? -1 : 1))
    .slice(0, limit)
    .map((reservation) => ({
      ...reservation,
      guestName: getGuestById(reservation.guestId)?.name ?? 'Unknown guest',
      roomNumber: getRoomById(reservation.roomId)?.number ?? '—',
    }))
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
