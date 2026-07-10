import { offsetISODate } from '../utils/dates'

// Mock reservations. Dates are generated relative to the real current date
// (via offsetISODate) so past/in-house/future spread stays realistic no
// matter when this app is run, rather than degrading into stale hardcoded
// dates. Status values: confirmed | pending | checked-in | checked-out | cancelled.
//
// Every `total` below is nights × the room type's nightly rate (Deluxe King
// Room = ₹6,500, Luxury Suite Room = ₹11,000 — the same rate card used in
// ReservationModal.jsx for new bookings), so ADR/RevPAR/revenue figures
// derived from these records reduce back to the same rate card exactly.
const r = (id, guestId, roomId, checkInOffset, checkOutOffset, status, total, createdAtOffset) => ({
  id,
  hotelId: 'hotel-1',
  guestId,
  roomId,
  checkIn: offsetISODate(checkInOffset),
  checkOut: offsetISODate(checkOutOffset),
  status,
  total,
  createdAt: offsetISODate(createdAtOffset),
})

export const RESERVATIONS = [
  // room-1 (101, Deluxe King Room · ₹6,500/night)
  r('res-1001', 'guest-1', 'room-1', -20, -16, 'checked-out', 26000, -35),
  r('res-1002', 'guest-5', 'room-1', -8, -4, 'checked-out', 26000, -18),
  r('res-1003', 'guest-9', 'room-1', -2, 2, 'checked-in', 26000, -12),
  r('res-1004', 'guest-3', 'room-1', 5, 9, 'confirmed', 26000, -5),
  r('res-1005', 'guest-7', 'room-1', 15, 18, 'confirmed', 19500, -6),

  // room-2 (102, Deluxe King Room · ₹6,500/night)
  r('res-1006', 'guest-2', 'room-2', -30, -25, 'checked-out', 32500, -45),
  r('res-1007', 'guest-6', 'room-2', -10, -6, 'checked-out', 26000, -20),
  r('res-1008', 'guest-11', 'room-2', 0, 4, 'checked-in', 26000, -9),
  r('res-1009', 'guest-4', 'room-2', 8, 11, 'confirmed', 19500, -4),
  r('res-1010', 'guest-12', 'room-2', 20, 24, 'pending', 26000, -3),

  // room-3 (103, Deluxe King Room · ₹6,500/night) — currently under maintenance
  r('res-1011', 'guest-8', 'room-3', -15, -11, 'checked-out', 26000, -25),
  r('res-1012', 'guest-10', 'room-3', 10, 13, 'confirmed', 19500, -6),
  r('res-1013', 'guest-1', 'room-3', 25, 28, 'confirmed', 19500, -10),

  // room-4 (104, Luxury Suite Room · ₹11,000/night)
  r('res-1014', 'guest-3', 'room-4', -25, -20, 'checked-out', 55000, -40),
  r('res-1015', 'guest-7', 'room-4', -8, -4, 'checked-out', 44000, -18),
  r('res-1016', 'guest-9', 'room-4', -3, 0, 'checked-in', 33000, -14),
  r('res-1017', 'guest-2', 'room-4', 3, 7, 'confirmed', 44000, -5),
  r('res-1018', 'guest-6', 'room-4', 12, 16, 'pending', 44000, -3),

  // room-5 (105, Luxury Suite Room · ₹11,000/night)
  r('res-1019', 'guest-4', 'room-5', -40, -35, 'checked-out', 55000, -55),
  r('res-1020', 'guest-8', 'room-5', -12, -7, 'checked-out', 55000, -22),
  r('res-1021', 'guest-1', 'room-5', -1, 3, 'checked-in', 44000, -16),
  r('res-1022', 'guest-5', 'room-5', 6, 10, 'confirmed', 44000, -7),
  r('res-1023', 'guest-11', 'room-5', 18, 21, 'cancelled', 33000, -8),
]
