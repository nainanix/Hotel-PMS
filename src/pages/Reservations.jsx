import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CalendarCheck, BedDouble, IndianRupee, PieChart } from 'lucide-react'
import StatCard from '../components/ui/StatCard'
import StatDetailModal from '../components/ui/StatDetailModal'
import OccupancyBreakdown from '../components/ui/OccupancyBreakdown'
import ViewToggle from '../components/ui/ViewToggle'
import Tabs from '../components/ui/Tabs'
import SearchInput from '../components/ui/SearchInput'
import Badge from '../components/ui/Badge'
import { Table, Th, Td } from '../components/ui/Table'
import ReservationCard from '../components/reservations/ReservationCard'
import ReservationModal from '../components/stayview/ReservationModal'
import GuestActionsModal from '../components/stayview/GuestActionsModal'
import RoomMoveModal from '../components/stayview/RoomMoveModal'
import AddPaymentModal from '../components/stayview/AddPaymentModal'
import InvoiceModal from '../components/stayview/InvoiceModal'
import {
  getReservationsDetailed,
  getReservationSummaryStats,
  getTodaysArrivalsList,
  getActiveStaysList,
  getPipelineRateBreakdown,
  getRoomStatusBreakdown,
  getGuests,
  getGuestById,
  getRooms,
  getRoomById,
  addReservation,
  updateReservation,
  addPayment,
} from '../data/api'
import { formatDateShort, offsetISODate } from '../utils/dates'
import { formatCurrency } from '../utils/format'

const TODAY = offsetISODate(0)

const FILTERS = {
  all: () => true,
  arriving: (r) => r.checkIn === TODAY && r.status !== 'cancelled',
  'in-house': (r) => r.checkIn <= TODAY && r.checkOut > TODAY && r.status !== 'cancelled',
  departing: (r) => r.checkOut === TODAY && r.status !== 'cancelled',
}

function Reservations() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [query, setQuery] = useState('')
  const [view, setView] = useState('grid')
  const [detail, setDetail] = useState(null)
  const [modal, setModal] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  // modal shapes:
  //  { type: 'reservation', mode: 'view'|'edit'|'create', prefill?, reservation? }
  //  { type: 'guestActions', reservation }
  //  { type: 'roomMove', reservation }
  //  { type: 'addPayment', reservation }
  //  { type: 'invoice', reservation }

  const reservations = useMemo(
    () => getReservationsDetailed(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshKey]
  )
  const stats = useMemo(
    () => getReservationSummaryStats(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshKey]
  )
  const guests = getGuests()
  const rooms = getRooms()

  // Arriving from a notification like "New reservation" — jump straight to
  // that reservation's actions menu instead of leaving the user to hunt for
  // it in the list.
  useEffect(() => {
    const openReservationId = location.state?.openReservationId
    if (!openReservationId) return
    const reservation = reservations.find((r) => r.id === openReservationId)
    if (reservation) setModal({ type: 'guestActions', reservation })
    navigate(location.pathname, { replace: true, state: {} })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  function refresh() {
    setRefreshKey((k) => k + 1)
  }

  function handleCreateReservation(data) {
    addReservation(data)
    refresh()
    setModal(null)
  }

  function handleUpdateReservation(id, updates) {
    updateReservation(id, updates)
    refresh()
    setModal(null)
  }

  function handleVoidReservation() {
    if (modal?.reservation) updateReservation(modal.reservation.id, { status: 'cancelled' })
    refresh()
    setModal(null)
  }

  function handleRoomMove(newRoomId) {
    if (modal?.reservation) updateReservation(modal.reservation.id, { roomId: newRoomId })
    refresh()
    setModal(null)
  }

  function handleAddPayment(amount) {
    if (modal?.reservation) addPayment(modal.reservation.id, amount)
    refresh()
    setModal(null)
  }

  const tabs = [
    { key: 'all', label: 'All', count: reservations.length },
    { key: 'arriving', label: 'Arriving', count: reservations.filter(FILTERS.arriving).length },
    { key: 'in-house', label: 'In-House', count: reservations.filter(FILTERS['in-house']).length },
    { key: 'departing', label: 'Departing', count: reservations.filter(FILTERS.departing).length },
  ]

  const filtered = reservations
    .filter(FILTERS[activeTab])
    .filter((r) => {
      const q = query.trim().toLowerCase()
      if (!q) return true
      return r.guestName.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)
    })
    .sort((a, b) => (a.checkIn < b.checkIn ? -1 : 1))

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Today's Check-ins"
          value={stats.todaysCheckIns}
          icon={CalendarCheck}
          onClick={() => setDetail('checkins')}
        />
        <StatCard
          label="Active Stays"
          value={stats.activeStays}
          icon={BedDouble}
          onClick={() => setDetail('active')}
        />
        <StatCard
          label="Avg Daily Rate"
          value={formatCurrency(stats.avgDailyRate)}
          icon={IndianRupee}
          onClick={() => setDetail('adr')}
        />
        <StatCard
          label="Occupancy"
          value={`${stats.occupancyRate}%`}
          icon={PieChart}
          onClick={() => setDetail('occupancy')}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        <div className="flex items-center gap-3">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search guest or booking ID"
            className="w-72"
          />
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      {view === 'list' ? (
        <Table>
          <thead>
            <tr>
              <Th>Booking ID</Th>
              <Th>Guest</Th>
              <Th>Dates</Th>
              <Th>Room</Th>
              <Th>Status</Th>
              <Th className="text-right">Total</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((reservation) => (
              <tr
                key={reservation.id}
                onClick={() => setModal({ type: 'guestActions', reservation })}
                className="cursor-pointer hover:bg-surface-muted/60"
              >
                <Td className="font-medium text-navy-600 dark:text-navy-50">{reservation.id}</Td>
                <Td>{reservation.guestName}</Td>
                <Td>
                  {formatDateShort(reservation.checkIn)} → {formatDateShort(reservation.checkOut)}
                </Td>
                <Td>
                  {reservation.roomNumber}
                  <span className="ml-1 text-xs text-navy-300 dark:text-navy-500">({reservation.roomType})</span>
                </Td>
                <Td>
                  <Badge status={reservation.status} />
                </Td>
                <Td className="text-right font-medium text-navy-600 dark:text-navy-50">
                  {formatCurrency(reservation.total)}
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <Td className="py-8 text-center text-navy-300 dark:text-navy-500" colSpan={6}>
                  No reservations found.
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-navy-100 bg-surface py-8 text-center text-sm text-navy-300 dark:border-navy-700 dark:text-navy-500">
          No reservations found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onClick={() => setModal({ type: 'guestActions', reservation })}
            />
          ))}
        </div>
      )}

      {modal?.type === 'guestActions' && (
        <GuestActionsModal
          reservation={modal.reservation}
          guest={getGuestById(modal.reservation.guestId)}
          room={getRoomById(modal.reservation.roomId)}
          onClose={() => setModal(null)}
          onView={() => setModal({ type: 'reservation', mode: 'view', reservation: modal.reservation })}
          onEdit={() => setModal({ type: 'reservation', mode: 'edit', reservation: modal.reservation })}
          onAddPayment={() => setModal({ type: 'addPayment', reservation: modal.reservation })}
          onAddBooking={() => setModal({ type: 'reservation', mode: 'create', prefill: {} })}
          onRoomMove={() => setModal({ type: 'roomMove', reservation: modal.reservation })}
          onVoid={handleVoidReservation}
          onPrintInvoice={() => setModal({ type: 'invoice', reservation: modal.reservation })}
        />
      )}

      {modal?.type === 'reservation' && (
        <ReservationModal
          mode={modal.mode}
          guests={guests}
          rooms={rooms}
          prefill={modal.prefill}
          reservation={modal.reservation}
          onClose={() => setModal(null)}
          onCreate={handleCreateReservation}
          onUpdate={handleUpdateReservation}
        />
      )}

      {modal?.type === 'roomMove' && (
        <RoomMoveModal
          reservation={modal.reservation}
          guest={getGuestById(modal.reservation.guestId)}
          rooms={rooms}
          onClose={() => setModal(null)}
          onSubmit={handleRoomMove}
        />
      )}

      {modal?.type === 'addPayment' && (
        <AddPaymentModal
          reservation={modal.reservation}
          guest={getGuestById(modal.reservation.guestId)}
          onClose={() => setModal(null)}
          onSubmit={handleAddPayment}
        />
      )}

      {modal?.type === 'invoice' && (
        <InvoiceModal
          reservation={modal.reservation}
          guest={getGuestById(modal.reservation.guestId)}
          room={getRoomById(modal.reservation.roomId)}
          onClose={() => setModal(null)}
        />
      )}

      {detail === 'checkins' && (
        <StatDetailModal
          title="Today's Check-ins"
          value={stats.todaysCheckIns}
          rows={getTodaysArrivalsList().map((r) => ({
            label: r.guestName,
            sublabel: `Room ${r.roomNumber}`,
            value: r.status.replace('-', ' '),
          }))}
          emptyLabel="No arrivals today"
          onClose={() => setDetail(null)}
        />
      )}

      {detail === 'active' && (
        <StatDetailModal
          title="Active Stays"
          value={stats.activeStays}
          hint="Guests currently in-house"
          rows={getActiveStaysList().map((r) => ({
            label: r.guestName,
            sublabel: `Room ${r.roomNumber}`,
            value: `Until ${formatDateShort(r.checkOut)}`,
          }))}
          emptyLabel="No active stays"
          onClose={() => setDetail(null)}
        />
      )}

      {detail === 'adr' && (
        <StatDetailModal
          title="Average Daily Rate"
          value={formatCurrency(stats.avgDailyRate)}
          hint="Across confirmed, pending, and checked-in bookings"
          rows={getPipelineRateBreakdown().map((r) => ({
            label: r.guestName,
            sublabel: `Room ${r.roomNumber} · ${r.status.replace('-', ' ')}`,
            value: formatCurrency(r.rate),
          }))}
          emptyLabel="No active bookings"
          onClose={() => setDetail(null)}
        />
      )}

      {detail === 'occupancy' && (
        <StatDetailModal
          title="Occupancy"
          value={`${stats.occupancyRate}%`}
          hint="Today, across all rooms"
          onClose={() => setDetail(null)}
        >
          <OccupancyBreakdown breakdown={getRoomStatusBreakdown()} />
        </StatDetailModal>
      )}
    </div>
  )
}

export default Reservations
