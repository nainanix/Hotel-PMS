import { offsetISODate } from '../utils/dates'

// Mock maintenance periods — a room is "under maintenance" for whatever
// date range a period here covers, mirroring how reservations work rather
// than a permanent static flag on the room record. This lets maintenance
// be scheduled, edited, and ended just like a booking.
export const MAINTENANCE_PERIODS = [
  {
    id: 'maint-1',
    hotelId: 'hotel-1',
    roomId: 'room-3',
    startDate: offsetISODate(-5),
    endDate: offsetISODate(10),
    note: 'Plumbing repair',
  },
]
