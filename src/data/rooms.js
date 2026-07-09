import { offsetISODate } from '../utils/dates'

// Mock room inventory for a single property. Structured with a hotelId on
// every record so a future multi-property backend can filter by property.
// Occupancy and maintenance state are not stored here — both are derived
// from reservations.js / maintenance.js so they stay consistent with the
// calendar instead of drifting out of sync with a separate static flag.
export const ROOMS = [
  { id: 'room-1', hotelId: 'hotel-1', number: '101', type: 'Deluxe King Room', housekeeping: { status: 'clean', assignedStaff: null, lastCleaned: `${offsetISODate(0)}T09:15:00` } },
  { id: 'room-2', hotelId: 'hotel-1', number: '102', type: 'Deluxe King Room', housekeeping: { status: 'dirty', assignedStaff: null, lastCleaned: `${offsetISODate(-1)}T15:00:00` } },
  { id: 'room-3', hotelId: 'hotel-1', number: '103', type: 'Deluxe King Room', housekeeping: { status: 'dirty', assignedStaff: null, lastCleaned: `${offsetISODate(-3)}T14:00:00` } },
  { id: 'room-4', hotelId: 'hotel-1', number: '104', type: 'Luxury Suite Room', housekeeping: { status: 'in-progress', assignedStaff: 'Maria Lopez', lastCleaned: `${offsetISODate(-1)}T11:30:00` } },
  { id: 'room-5', hotelId: 'hotel-1', number: '105', type: 'Luxury Suite Room', housekeeping: { status: 'clean', assignedStaff: null, lastCleaned: `${offsetISODate(0)}T10:00:00` } },
]
