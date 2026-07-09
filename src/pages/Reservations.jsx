import { useMemo, useState } from 'react'
import { CalendarCheck, BedDouble, DollarSign, PieChart } from 'lucide-react'
import StatCard from '../components/ui/StatCard'
import StatDetailModal from '../components/ui/StatDetailModal'
import OccupancyBreakdown from '../components/ui/OccupancyBreakdown'
import ViewToggle from '../components/ui/ViewToggle'
import Tabs from '../components/ui/Tabs'
import SearchInput from '../components/ui/SearchInput'
import Badge from '../components/ui/Badge'
import { Table, Th, Td } from '../components/ui/Table'
import ReservationCard from '../components/reservations/ReservationCard'
import {
  getReservationsDetailed,
  getReservationSummaryStats,
  getTodaysArrivalsList,
  getActiveStaysList,
  getPipelineRateBreakdown,
  getRoomStatusBreakdown,
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
  const [activeTab, setActiveTab] = useState('all')
  const [query, setQuery] = useState('')
  const [view, setView] = useState('list')
  const [detail, setDetail] = useState(null)

  const reservations = useMemo(() => getReservationsDetailed(), [])
  const stats = useMemo(() => getReservationSummaryStats(), [])

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
          icon={DollarSign}
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
              <tr key={reservation.id} className="hover:bg-surface-muted/60">
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
            <ReservationCard key={reservation.id} reservation={reservation} />
          ))}
        </div>
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
