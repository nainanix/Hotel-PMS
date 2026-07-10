import { ROOMS } from './rooms'
import { GUESTS } from './guests'
import { RESERVATIONS } from './reservations'
import { NOTIFICATIONS } from './notifications'
import { MAINTENANCE_PERIODS } from './maintenance'
import { nightsBetween, offsetISODate, toISODate } from '../utils/dates'

// Mock API layer. Every page reads through these functions rather than the
// raw data files above — this is the seam a real backend/HTTP client would
// slot into later without touching page components.

const TODAY = offsetISODate(0)

const ACTIVE_STATUSES = new Set(['confirmed', 'pending', 'checked-in'])

function rangesOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB
}

function overlapsRange(reservation, startISO, endISO) {
  return rangesOverlap(reservation.checkIn, reservation.checkOut, startISO, endISO)
}

function isActiveToday(reservation) {
  return (
    reservation.status !== 'cancelled' &&
    reservation.checkIn <= TODAY &&
    reservation.checkOut > TODAY
  )
}

function isMaintenanceActiveToday(period) {
  return period.startDate <= TODAY && period.endDate > TODAY
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

// Appends a new guest to the in-memory store — used when a reservation is
// created for someone not already in the guest directory.
export function addGuest({ name, email = '', phone = '', status = 'New', lastStay = null }) {
  const guest = { id: `guest-${Date.now()}`, name, email, phone, status, lastStay }
  GUESTS.push(guest)
  return guest
}

export function getReservations() {
  return RESERVATIONS
}

export function getMaintenancePeriods() {
  return MAINTENANCE_PERIODS
}

export function getMaintenanceForDateRange(startISO, endISO) {
  return MAINTENANCE_PERIODS.filter((period) =>
    rangesOverlap(period.startDate, period.endDate, startISO, endISO)
  )
}

export function isRoomUnderMaintenance(roomId, dateISO = TODAY) {
  return MAINTENANCE_PERIODS.some(
    (period) => period.roomId === roomId && period.startDate <= dateISO && period.endDate > dateISO
  )
}

// True if roomId already has a non-cancelled reservation, or a scheduled
// maintenance period, overlapping the given date range. Used to block
// double-bookings (including booking over scheduled maintenance).
export function hasRoomConflict(roomId, checkIn, checkOut) {
  const reservationConflict = RESERVATIONS.some(
    (reservation) =>
      reservation.roomId === roomId &&
      reservation.status !== 'cancelled' &&
      overlapsRange(reservation, checkIn, checkOut)
  )
  if (reservationConflict) return true

  return MAINTENANCE_PERIODS.some(
    (period) => period.roomId === roomId && rangesOverlap(period.startDate, period.endDate, checkIn, checkOut)
  )
}

// True if roomId has a non-cancelled reservation overlapping the given
// range — used when scheduling maintenance, so an occupied room can't be
// taken out of service out from under a guest.
export function hasReservationConflict(roomId, startDate, endDate, excludeMaintenanceId) {
  const reservationConflict = RESERVATIONS.some(
    (reservation) =>
      reservation.roomId === roomId &&
      reservation.status !== 'cancelled' &&
      overlapsRange(reservation, startDate, endDate)
  )
  if (reservationConflict) return true

  return MAINTENANCE_PERIODS.some(
    (period) =>
      period.roomId === roomId &&
      period.id !== excludeMaintenanceId &&
      rangesOverlap(period.startDate, period.endDate, startDate, endDate)
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

export function addMaintenancePeriod({ roomId, startDate, endDate, note }) {
  const period = {
    id: `maint-${Date.now()}`,
    hotelId: 'hotel-1',
    roomId,
    startDate,
    endDate,
    note,
  }
  MAINTENANCE_PERIODS.push(period)
  return period
}

export function updateMaintenancePeriod(id, updates) {
  const period = MAINTENANCE_PERIODS.find((p) => p.id === id)
  if (!period) return null
  Object.assign(period, updates)
  return period
}

export function removeMaintenancePeriod(id) {
  const index = MAINTENANCE_PERIODS.findIndex((p) => p.id === id)
  if (index !== -1) MAINTENANCE_PERIODS.splice(index, 1)
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

// Rooms + reservations + maintenance periods scoped to a given month, with
// reservations already joined to guest display fields, for the Stay View grid.
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

  const maintenancePeriods = getMaintenanceForDateRange(startISO, endISO)

  return { rooms: ROOMS, reservations, maintenancePeriods }
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
      underMaintenance: isRoomUnderMaintenance(room.id),
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
  const maintenanceRoomIds = new Set(
    MAINTENANCE_PERIODS.filter(isMaintenanceActiveToday).map((period) => period.roomId)
  )
  const occupiedRooms = occupiedRoomIds.size
  const maintenanceRooms = maintenanceRoomIds.size
  const availableRooms = Math.max(ROOMS.length - occupiedRooms - maintenanceRooms, 0)

  return {
    totalRooms: ROOMS.length,
    occupiedRooms,
    availableRooms,
    maintenanceRooms,
    occupancyRate: Math.round((occupiedRooms / ROOMS.length) * 100),
  }
}

// Month-scoped KPIs, all derived from the same month so Occupancy/ADR/RevPAR/
// Monthly Revenue stay mathematically consistent with each other and with
// whichever month is currently being viewed (Overview's current month, or
// Stay View's browsed month):
//  - occupancyRate: mean of each day's occupied-room percentage in the month
//  - adr: mean nightly rate across every non-cancelled reservation touching
//    the month
//  - revpar: ADR × occupancy rate (standard RevPAR formula)
//  - monthlyRevenue: total booked revenue for reservations checking in
//    during the month
export function getMonthlyMetrics(year, month) {
  const dailyOccupancy = getOccupancyByDay(year, month)
  const occupancyRate = dailyOccupancy.length
    ? Math.round(dailyOccupancy.reduce((sum, d) => sum + d.rate, 0) / dailyOccupancy.length)
    : 0

  const monthStart = toISODate(new Date(year, month, 1))
  const monthEnd = toISODate(new Date(year, month + 1, 1))

  const overlapping = RESERVATIONS.filter(
    (reservation) => reservation.status !== 'cancelled' && overlapsRange(reservation, monthStart, monthEnd)
  )
  const nightlyRates = overlapping.map((reservation) => {
    const nights = nightsBetween(reservation.checkIn, reservation.checkOut) || 1
    return reservation.total / nights
  })
  const adr = nightlyRates.length ? nightlyRates.reduce((sum, rate) => sum + rate, 0) / nightlyRates.length : 0
  const revpar = adr * (occupancyRate / 100)

  const monthlyRevenue = RESERVATIONS.filter(
    (reservation) =>
      reservation.status !== 'cancelled' && reservation.checkIn >= monthStart && reservation.checkIn < monthEnd
  ).reduce((sum, reservation) => sum + reservation.total, 0)

  return {
    occupancyRate,
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

// Today's rooms split into occupied / available / under-maintenance, each
// joined with display fields — feeds the Occupancy detail popup on both
// Overview and Reservations.
export function getRoomStatusBreakdown() {
  const occupied = []
  const available = []
  const maintenance = []

  ROOMS.forEach((room) => {
    const activeReservation = RESERVATIONS.find(
      (reservation) => reservation.roomId === room.id && isActiveToday(reservation)
    )
    const activePeriod = MAINTENANCE_PERIODS.find(
      (period) => period.roomId === room.id && isMaintenanceActiveToday(period)
    )
    if (activeReservation) {
      occupied.push({
        roomNumber: room.number,
        roomType: room.type,
        guestName: getGuestById(activeReservation.guestId)?.name ?? 'Unknown guest',
      })
    } else if (activePeriod) {
      maintenance.push({ roomNumber: room.number, roomType: room.type, note: activePeriod.note })
    } else {
      available.push({ roomNumber: room.number, roomType: room.type })
    }
  })

  return { occupied, available, maintenance }
}

// Nightly rate for every non-cancelled reservation touching the given
// month — feeds the ADR detail popup on Overview and Stay View, matching how
// getMonthlyMetrics computes ADR for that same month.
export function getRateBreakdownForMonth(year, month) {
  const monthStart = toISODate(new Date(year, month, 1))
  const monthEnd = toISODate(new Date(year, month + 1, 1))
  return RESERVATIONS.filter(
    (reservation) => reservation.status !== 'cancelled' && overlapsRange(reservation, monthStart, monthEnd)
  ).map((reservation) => {
    const nights = nightsBetween(reservation.checkIn, reservation.checkOut) || 1
    return {
      roomNumber: getRoomById(reservation.roomId)?.number ?? '—',
      guestName: getGuestById(reservation.guestId)?.name ?? 'Unknown guest',
      rate: Math.round(reservation.total / nights),
    }
  })
}

// Nightly rate for every reservation in the active pipeline (confirmed,
// pending, or checked-in) — feeds the Avg Daily Rate detail popup on the
// Reservations page, matching how getReservationSummaryStats computes it.
export function getPipelineRateBreakdown() {
  return RESERVATIONS.filter((reservation) => ACTIVE_STATUSES.has(reservation.status)).map((reservation) => {
    const nights = nightsBetween(reservation.checkIn, reservation.checkOut) || 1
    return {
      roomNumber: getRoomById(reservation.roomId)?.number ?? '—',
      guestName: getGuestById(reservation.guestId)?.name ?? 'Unknown guest',
      status: reservation.status,
      rate: Math.round(reservation.total / nights),
    }
  })
}

// Reservations checking in today — feeds the Today's Check-ins detail popup.
export function getTodaysArrivalsList() {
  return RESERVATIONS.filter((reservation) => reservation.checkIn === TODAY && reservation.status !== 'cancelled').map(
    (reservation) => ({
      roomNumber: getRoomById(reservation.roomId)?.number ?? '—',
      guestName: getGuestById(reservation.guestId)?.name ?? 'Unknown guest',
      status: reservation.status,
    })
  )
}

// Reservations currently in-house — feeds the Active Stays detail popup.
export function getActiveStaysList() {
  return RESERVATIONS.filter(isActiveToday).map((reservation) => ({
    roomNumber: getRoomById(reservation.roomId)?.number ?? '—',
    guestName: getGuestById(reservation.guestId)?.name ?? 'Unknown guest',
    checkOut: reservation.checkOut,
  }))
}

// Booked revenue grouped by room type for a single month — feeds the
// Overview Monthly Revenue detail popup (month-scoped, unlike
// getRevenueByRoomType which is all-time).
export function getRevenueByRoomTypeForMonth(year, month) {
  const monthStart = toISODate(new Date(year, month, 1))
  const monthEnd = toISODate(new Date(year, month + 1, 1))
  const totals = new Map()
  RESERVATIONS.filter(
    (reservation) =>
      reservation.status !== 'cancelled' && reservation.checkIn >= monthStart && reservation.checkIn < monthEnd
  ).forEach((reservation) => {
    const room = getRoomById(reservation.roomId)
    if (!room) return
    totals.set(room.type, (totals.get(room.type) ?? 0) + reservation.total)
  })
  return Array.from(totals, ([type, revenue]) => ({ type, revenue }))
}

// Booking counts by status, all-time — feeds the Reports Total Bookings
// detail popup.
export function getBookingStatusBreakdown() {
  const totals = new Map()
  RESERVATIONS.forEach((reservation) => {
    totals.set(reservation.status, (totals.get(reservation.status) ?? 0) + 1)
  })
  return Array.from(totals, ([status, count]) => ({ status, count }))
}

// Average nightly rate by room type, all-time — feeds the Reports Avg Rate
// detail popup.
export function getAvgRateByRoomType() {
  const sums = new Map()
  const counts = new Map()
  RESERVATIONS.filter((reservation) => reservation.status !== 'cancelled').forEach((reservation) => {
    const room = getRoomById(reservation.roomId)
    if (!room) return
    const nights = nightsBetween(reservation.checkIn, reservation.checkOut) || 1
    sums.set(room.type, (sums.get(room.type) ?? 0) + reservation.total / nights)
    counts.set(room.type, (counts.get(room.type) ?? 0) + 1)
  })
  return Array.from(sums, ([type, sum]) => ({ type, rate: Math.round(sum / counts.get(type)) }))
}

// Completed (checked-out) stay counts by room type, all-time — feeds the
// Reports Completed Stays detail popup.
export function getCompletedStaysByRoomType() {
  const totals = new Map()
  RESERVATIONS.filter((reservation) => reservation.status === 'checked-out').forEach((reservation) => {
    const room = getRoomById(reservation.roomId)
    if (!room) return
    totals.set(room.type, (totals.get(room.type) ?? 0) + 1)
  })
  return Array.from(totals, ([type, count]) => ({ type, count }))
}

// Lightweight cross-entity search for the TopBar global search — matches
// guest name/email, booking ID/guest name, and room number/type, capped per
// category so the dropdown stays short.
export function searchAll(query, limit = 4) {
  const q = query.trim().toLowerCase()
  if (!q) return { guests: [], reservations: [], rooms: [] }

  const guests = GUESTS.filter(
    (guest) => guest.name.toLowerCase().includes(q) || guest.email.toLowerCase().includes(q)
  ).slice(0, limit)

  const reservations = getReservationsDetailed()
    .filter((reservation) => reservation.guestName.toLowerCase().includes(q) || reservation.id.toLowerCase().includes(q))
    .slice(0, limit)

  const rooms = ROOMS.filter(
    (room) => room.number.toLowerCase().includes(q) || room.type.toLowerCase().includes(q)
  ).slice(0, limit)

  return { guests, reservations, rooms }
}

// All-time analytics for the Reports page: lifetime revenue/bookings plus a
// month-by-month revenue trend across every reservation on record.
export function getHistoricalAnalytics() {
  const nonCancelled = RESERVATIONS.filter((reservation) => reservation.status !== 'cancelled')
  const completed = RESERVATIONS.filter((reservation) => reservation.status === 'checked-out')

  const totalRevenue = nonCancelled.reduce((sum, reservation) => sum + reservation.total, 0)
  const totalBookings = nonCancelled.length
  const avgRate = totalBookings
    ? nonCancelled.reduce((sum, reservation) => {
        const nights = nightsBetween(reservation.checkIn, reservation.checkOut) || 1
        return sum + reservation.total / nights
      }, 0) / totalBookings
    : 0

  const monthlyTotals = new Map()
  nonCancelled.forEach((reservation) => {
    const key = reservation.checkIn.slice(0, 7) // YYYY-MM
    monthlyTotals.set(key, (monthlyTotals.get(key) ?? 0) + reservation.total)
  })
  const revenueByMonth = Array.from(monthlyTotals, ([month, revenue]) => ({ month, revenue })).sort((a, b) =>
    a.month < b.month ? -1 : 1
  )

  return {
    totalRevenue: Math.round(totalRevenue),
    totalBookings,
    completedStays: completed.length,
    avgRate: Math.round(avgRate),
    revenueByMonth,
  }
}
