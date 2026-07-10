import { useMemo, useState } from 'react'
import { Wallet, ClipboardList, BedDouble, IndianRupee } from 'lucide-react'
import StatCard from '../components/ui/StatCard'
import StatDetailModal from '../components/ui/StatDetailModal'
import ChartCard from '../components/overview/ChartCard'
import RevenueTrendChart from '../components/reports/RevenueTrendChart'
import Tabs from '../components/ui/Tabs'
import SearchInput from '../components/ui/SearchInput'
import Badge from '../components/ui/Badge'
import { Table, Th, Td } from '../components/ui/Table'
import {
  getHistoricalAnalytics,
  getReservationsDetailed,
  getRevenueByRoomType,
  getBookingStatusBreakdown,
  getCompletedStaysByRoomType,
  getAvgRateByRoomType,
} from '../data/api'
import { formatCurrency } from '../utils/format'
import { formatDateShort } from '../utils/dates'

const FILTERS = {
  all: () => true,
  completed: (r) => r.status === 'checked-out',
  upcoming: (r) => r.status === 'confirmed' || r.status === 'pending' || r.status === 'checked-in',
  cancelled: (r) => r.status === 'cancelled',
}

function Reports() {
  const [activeTab, setActiveTab] = useState('all')
  const [query, setQuery] = useState('')
  const [detail, setDetail] = useState(null)

  const analytics = useMemo(() => getHistoricalAnalytics(), [])
  const bookings = useMemo(() => getReservationsDetailed(), [])

  const tabs = [
    { key: 'all', label: 'All', count: bookings.length },
    { key: 'completed', label: 'Completed', count: bookings.filter(FILTERS.completed).length },
    { key: 'upcoming', label: 'Upcoming', count: bookings.filter(FILTERS.upcoming).length },
    { key: 'cancelled', label: 'Cancelled', count: bookings.filter(FILTERS.cancelled).length },
  ]

  const filtered = bookings
    .filter(FILTERS[activeTab])
    .filter((b) => {
      const q = query.trim().toLowerCase()
      if (!q) return true
      return b.guestName.toLowerCase().includes(q) || b.id.toLowerCase().includes(q)
    })
    .sort((a, b) => (a.checkIn < b.checkIn ? 1 : -1))

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(analytics.totalRevenue)}
          icon={Wallet}
          hint="All-time"
          onClick={() => setDetail('revenue')}
        />
        <StatCard
          label="Total Bookings"
          value={analytics.totalBookings}
          icon={ClipboardList}
          onClick={() => setDetail('bookings')}
        />
        <StatCard
          label="Completed Stays"
          value={analytics.completedStays}
          icon={BedDouble}
          onClick={() => setDetail('completed')}
        />
        <StatCard
          label="Avg Rate"
          value={formatCurrency(analytics.avgRate)}
          icon={IndianRupee}
          hint="Per night"
          onClick={() => setDetail('rate')}
        />
      </div>

      <ChartCard title="Revenue Trend" subtitle="By month, all bookings on record">
        <RevenueTrendChart data={analytics.revenueByMonth} />
      </ChartCard>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
          <SearchInput value={query} onChange={setQuery} placeholder="Search guest or booking ID" className="w-72" />
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Booking ID</Th>
              <Th>Guest</Th>
              <Th>Room</Th>
              <Th>Dates</Th>
              <Th className="text-right">Nights</Th>
              <Th className="text-right">Rate / Night</Th>
              <Th className="text-right">Total</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((booking) => (
              <tr key={booking.id} className="hover:bg-surface-muted/60">
                <Td className="font-medium text-navy-600 dark:text-navy-50">{booking.id}</Td>
                <Td>{booking.guestName}</Td>
                <Td>
                  {booking.roomNumber}
                  <span className="ml-1 text-xs text-navy-300 dark:text-navy-500">({booking.roomType})</span>
                </Td>
                <Td>
                  {formatDateShort(booking.checkIn)} → {formatDateShort(booking.checkOut)}
                </Td>
                <Td className="text-right">{booking.nights}</Td>
                <Td className="text-right">{formatCurrency(booking.total / (booking.nights || 1))}</Td>
                <Td className="text-right font-medium text-navy-600 dark:text-navy-50">
                  {formatCurrency(booking.total)}
                </Td>
                <Td>
                  <Badge status={booking.status} />
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <Td className="py-8 text-center text-navy-300 dark:text-navy-500" colSpan={8}>
                  No bookings found.
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {detail === 'revenue' && (
        <StatDetailModal
          title="Total Revenue"
          value={formatCurrency(analytics.totalRevenue)}
          hint="All-time, by room type"
          rows={getRevenueByRoomType().map((r) => ({ label: r.type, value: formatCurrency(r.revenue) }))}
          onClose={() => setDetail(null)}
        />
      )}

      {detail === 'bookings' && (
        <StatDetailModal
          title="Total Bookings"
          value={analytics.totalBookings}
          hint="All-time, by status"
          rows={getBookingStatusBreakdown().map((r) => ({
            label: r.status.replace('-', ' '),
            value: r.count,
          }))}
          onClose={() => setDetail(null)}
        />
      )}

      {detail === 'completed' && (
        <StatDetailModal
          title="Completed Stays"
          value={analytics.completedStays}
          hint="All-time, by room type"
          rows={getCompletedStaysByRoomType().map((r) => ({ label: r.type, value: r.count }))}
          emptyLabel="No completed stays yet"
          onClose={() => setDetail(null)}
        />
      )}

      {detail === 'rate' && (
        <StatDetailModal
          title="Average Rate"
          value={formatCurrency(analytics.avgRate)}
          hint="All-time, by room type"
          rows={getAvgRateByRoomType().map((r) => ({ label: r.type, value: formatCurrency(r.rate) }))}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  )
}

export default Reports
