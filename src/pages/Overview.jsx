import { useMemo, useState } from 'react'
import { PieChart, DollarSign, TrendingUp, Wallet, LogIn, LogOut } from 'lucide-react'
import StatCard from '../components/ui/StatCard'
import StatDetailModal from '../components/ui/StatDetailModal'
import OccupancyBreakdown from '../components/ui/OccupancyBreakdown'
import ChartCard from '../components/overview/ChartCard'
import OccupancyTrendChart from '../components/overview/OccupancyTrendChart'
import RevenueByRoomTypeChart from '../components/overview/RevenueByRoomTypeChart'
import GuestMixDonut from '../components/overview/GuestMixDonut'
import UpcomingList from '../components/overview/UpcomingList'
import {
  getKeyMetrics,
  getOccupancyByDay,
  getRevenueByRoomType,
  getRevenueByRoomTypeForMonth,
  getGuestStatusBreakdown,
  getUpcomingArrivals,
  getUpcomingDepartures,
  getRoomStatusBreakdown,
  getActiveRateBreakdown,
} from '../data/api'
import { formatCurrency } from '../utils/format'

function Overview() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const [detail, setDetail] = useState(null)

  const metrics = useMemo(() => getKeyMetrics(year, month), [year, month])
  const occupancyByDay = useMemo(() => getOccupancyByDay(year, month), [year, month])
  const revenueByRoomType = useMemo(() => getRevenueByRoomType(), [])
  const guestMix = useMemo(() => getGuestStatusBreakdown(), [])
  const arrivals = useMemo(() => getUpcomingArrivals(5), [])
  const departures = useMemo(() => getUpcomingDepartures(5), [])

  const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Occupancy"
          value={`${metrics.occupancyRate}%`}
          icon={PieChart}
          onClick={() => setDetail('occupancy')}
        />
        <StatCard
          label="ADR"
          value={formatCurrency(metrics.adr)}
          icon={DollarSign}
          hint="Average Daily Rate"
          onClick={() => setDetail('adr')}
        />
        <StatCard
          label="RevPAR"
          value={formatCurrency(metrics.revpar)}
          icon={TrendingUp}
          hint="Revenue per Available Room"
          onClick={() => setDetail('revpar')}
        />
        <StatCard
          label="Monthly Revenue"
          value={formatCurrency(metrics.monthlyRevenue)}
          icon={Wallet}
          onClick={() => setDetail('revenue')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Occupancy Trend" subtitle={monthLabel} className="lg:col-span-2">
          <OccupancyTrendChart data={occupancyByDay} />
        </ChartCard>
        <ChartCard title="Guest Mix" subtitle="By loyalty status">
          <GuestMixDonut data={guestMix} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Revenue by Room Type" subtitle="All bookings">
          <RevenueByRoomTypeChart data={revenueByRoomType} />
        </ChartCard>
        <ChartCard title="Upcoming Arrivals">
          <UpcomingList items={arrivals} dateField="checkIn" icon={LogIn} />
        </ChartCard>
        <ChartCard title="Upcoming Departures">
          <UpcomingList items={departures} dateField="checkOut" icon={LogOut} />
        </ChartCard>
      </div>

      {detail === 'occupancy' && (
        <StatDetailModal
          title="Occupancy"
          value={`${metrics.occupancyRate}%`}
          hint="Today, across all rooms"
          onClose={() => setDetail(null)}
        >
          <OccupancyBreakdown breakdown={getRoomStatusBreakdown()} />
        </StatDetailModal>
      )}

      {detail === 'adr' && (
        <StatDetailModal
          title="Average Daily Rate"
          value={formatCurrency(metrics.adr)}
          hint="Mean nightly rate across occupied rooms today"
          rows={getActiveRateBreakdown().map((r) => ({
            label: r.guestName,
            sublabel: `Room ${r.roomNumber}`,
            value: formatCurrency(r.rate),
          }))}
          emptyLabel="No rooms currently occupied"
          onClose={() => setDetail(null)}
        />
      )}

      {detail === 'revpar' && (
        <StatDetailModal
          title="Revenue per Available Room"
          value={formatCurrency(metrics.revpar)}
          hint="RevPAR = ADR × Occupancy Rate"
          rows={[
            { label: 'Average Daily Rate', value: formatCurrency(metrics.adr) },
            { label: 'Occupancy Rate', value: `${metrics.occupancyRate}%` },
            { label: 'RevPAR', value: formatCurrency(metrics.revpar) },
          ]}
          onClose={() => setDetail(null)}
        />
      )}

      {detail === 'revenue' && (
        <StatDetailModal
          title="Monthly Revenue"
          value={formatCurrency(metrics.monthlyRevenue)}
          hint={monthLabel}
          rows={getRevenueByRoomTypeForMonth(year, month).map((r) => ({
            label: r.type,
            value: formatCurrency(r.revenue),
          }))}
          emptyLabel="No bookings this month"
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  )
}

export default Overview
