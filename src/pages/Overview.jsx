import { useMemo } from 'react'
import { PieChart, DollarSign, TrendingUp, Wallet, LogIn, LogOut } from 'lucide-react'
import StatCard from '../components/ui/StatCard'
import ChartCard from '../components/overview/ChartCard'
import OccupancyTrendChart from '../components/overview/OccupancyTrendChart'
import RevenueByRoomTypeChart from '../components/overview/RevenueByRoomTypeChart'
import GuestMixDonut from '../components/overview/GuestMixDonut'
import UpcomingList from '../components/overview/UpcomingList'
import {
  getKeyMetrics,
  getOccupancyByDay,
  getRevenueByRoomType,
  getGuestStatusBreakdown,
  getUpcomingArrivals,
  getUpcomingDepartures,
} from '../data/api'
import { formatCurrency } from '../utils/format'

function Overview() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

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
        <StatCard label="Occupancy" value={`${metrics.occupancyRate}%`} icon={PieChart} />
        <StatCard label="ADR" value={formatCurrency(metrics.adr)} icon={DollarSign} hint="Average Daily Rate" />
        <StatCard
          label="RevPAR"
          value={formatCurrency(metrics.revpar)}
          icon={TrendingUp}
          hint="Revenue per Available Room"
        />
        <StatCard label="Monthly Revenue" value={formatCurrency(metrics.monthlyRevenue)} icon={Wallet} />
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
    </div>
  )
}

export default Overview
