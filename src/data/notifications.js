import { offsetISODate } from '../utils/dates'

// Mock notification feed. hotelId ties each entry to a property, matching
// the pattern used by rooms/guests/reservations for a future API swap.
export const NOTIFICATIONS = [
  {
    id: 'notif-1',
    hotelId: 'hotel-1',
    title: 'New reservation',
    description: 'Jordan Ellis booked Room 105 for 4 nights.',
    date: offsetISODate(0),
    read: false,
    type: 'reservation',
    reservationId: 'res-1021',
  },
  {
    id: 'notif-2',
    hotelId: 'hotel-1',
    title: 'Room ready',
    description: 'Room 101 has been cleaned and inspected.',
    date: offsetISODate(0),
    read: false,
    type: 'housekeeping',
    roomId: 'room-1',
  },
  {
    id: 'notif-3',
    hotelId: 'hotel-1',
    title: 'Maintenance update',
    description: 'Room 103 remains under maintenance.',
    date: offsetISODate(-1),
    read: true,
    type: 'housekeeping',
    roomId: 'room-3',
  },
]
