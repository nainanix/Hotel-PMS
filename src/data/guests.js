import { offsetISODate } from '../utils/dates'

// Mock guest directory. `lastStay` is null for guests who have not
// completed a stay yet (their only history is an upcoming reservation).
export const GUESTS = [
  { id: 'guest-1', name: 'Jordan Ellis', email: 'jordan.ellis@example.com', phone: '(555) 201-3841', status: 'VIP', lastStay: offsetISODate(-14) },
  { id: 'guest-2', name: 'Priya Nandan', email: 'priya.nandan@example.com', phone: '(555) 340-1187', status: 'Returning', lastStay: offsetISODate(-40) },
  { id: 'guest-3', name: 'Marcus Webb', email: 'marcus.webb@example.com', phone: '(555) 552-9023', status: 'Corporate', lastStay: offsetISODate(-7) },
  { id: 'guest-4', name: 'Elena Vasquez', email: 'elena.vasquez@example.com', phone: '(555) 118-4420', status: 'VIP', lastStay: offsetISODate(-3) },
  { id: 'guest-5', name: 'Samuel Cho', email: 'samuel.cho@example.com', phone: '(555) 774-6612', status: 'Returning', lastStay: offsetISODate(-60) },
  { id: 'guest-6', name: 'Olivia Bennett', email: 'olivia.bennett@example.com', phone: '(555) 903-2256', status: 'New', lastStay: null },
  { id: 'guest-7', name: 'Rachel Kim', email: 'rachel.kim@example.com', phone: '(555) 441-8890', status: 'Corporate', lastStay: offsetISODate(-21) },
  { id: 'guest-8', name: 'David Okafor', email: 'david.okafor@example.com', phone: '(555) 662-1145', status: 'Returning', lastStay: offsetISODate(-90) },
  { id: 'guest-9', name: 'Sofia Moretti', email: 'sofia.moretti@example.com', phone: '(555) 287-6634', status: 'VIP', lastStay: offsetISODate(-1) },
  { id: 'guest-10', name: 'Liam Fitzgerald', email: 'liam.fitzgerald@example.com', phone: '(555) 809-3372', status: 'New', lastStay: null },
  { id: 'guest-11', name: 'Amara Osei', email: 'amara.osei@example.com', phone: '(555) 526-7741', status: 'Corporate', lastStay: offsetISODate(-30) },
  { id: 'guest-12', name: 'Noah Bergström', email: 'noah.bergstrom@example.com', phone: '(555) 175-9902', status: 'Returning', lastStay: offsetISODate(-50) },
]
