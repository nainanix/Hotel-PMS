import { useMemo, useState } from 'react'
import { PieChart, IndianRupee, TrendingUp, Wallet, LogIn, LogOut, RotateCcw } from 'lucide-react'
import StatCard from '../components/ui/StatCard'
import StatDetailModal from '../components/ui/StatDetailModal'
import OccupancyBreakdown from '../components/ui/OccupancyBreakdown'
import DatePicker from '../components/ui/DatePicker'
import Button from '../components/ui/Button'
import ChartCard from '../components/overview/ChartCard'
import OccupancyTrendChart from '../components/overview/OccupancyTrendChart'
import RevenueByRoomTypeChart from '../components/overview/RevenueByRoomTypeChart'
import GuestMixDonut from '../components/overview/GuestMixDonut'
import UpcomingList from '../components/overview/UpcomingList'
import {
  getDailyMetrics,
  getMonthlyMetrics,
  getOccupancyByDay,
  getRevenueByRoomType,
  getRevenueByRoomTypeForMonth,
  getGuestStatusBreakdown,
  getUpcomingArrivals,
  getUpcomingDepartures,
  getRoomStatusBreakdown,
  getRateBreakdownForDate,
} from '../data/api'
import { formatCurrency } from '../utils/format'
import { formatDateLong, offsetISODate, parseISODate } from '../utils/dates'

function Overview() {
  const todayISO = offsetISODate(0)
  const [selectedDate, setSelectedDate] = useState(todayISO)
  const [detail, setDetail] = useState(null)

  const selected = parseISODate(selectedDate)
  const year = selected.getFullYear()
  const month = selected.getMonth()

  const dailyMetrics = useMemo(() => getDailyMetrics(selectedDate), [selectedDate])
  const monthlyMetrics = useMemo(() => getMonthlyMetrics(year, month), [year, month])
  const metrics = { ...dailyMetrics, monthlyRevenue: monthlyMetrics.monthlyRevenue }
  const occupancyByDay = useMemo(() => getOccupancyByDay(year, month), [year, month])
  const revenueByRoomType = useMemo(() => getRevenueByRoomType(), [])
  const guestMix = useMemo(() => getGuestStatusBreakdown(), [])
  const arrivals = useMemo(() => getUpcomingArrivals(5, selectedDate), [selectedDate])
  const departures = useMemo(() => getUpcomingDepartures(5, selectedDate), [selectedDate])

  const monthLabel = selected.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const dateLabel = formatDateLong(selectedDate)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {selectedDate !== todayISO && (
          <Button variant="ghost" icon={RotateCcw} onClick={() => setSelectedDate(todayISO)}>
            Today
          </Button>
        )}
        <DatePicker value={selectedDate} onChange={setSelectedDate} className="w-48" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Occupancy"
          value={`${metrics.occupancyRate}%`}
          icon={PieChart}
          hint={selectedDate === todayISO ? 'Today' : dateLabel}
          onClick={() => setDetail('occupancy')}
        />
        <StatCard
          label="ADR"
          value={formatCurrency(metrics.adr)}
          icon={IndianRupee}
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
          <OccupancyTrendChart data={occupancyByDay} highlightDateISO={selectedDate} />
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
          hint={`On ${dateLabel}, across all rooms`}
          onClose={() => setDetail(null)}
        >
          <OccupancyBreakdown breakdown={getRoomStatusBreakdown(selectedDate)} />
        </StatDetailModal>
      )}

      {detail === 'adr' && (
        <StatDetailModal
          title="Average Daily Rate"
          value={formatCurrency(metrics.adr)}
          hint={`Mean nightly rate across occupied rooms, ${dateLabel}`}
          rows={getRateBreakdownForDate(selectedDate).map((r) => ({
            label: r.guestName,
            sublabel: `Room ${r.roomNumber}`,
            value: formatCurrency(r.rate),
          }))}
          emptyLabel="No rooms occupied on this date"
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
