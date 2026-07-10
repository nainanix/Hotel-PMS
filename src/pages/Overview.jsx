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
  getOccupancyByDay,
  getRevenueByRoomType,
  getBookingCountByRoomType,
  getGuestStatusBreakdown,
  getGuests,
  getUpcomingArrivals,
  getUpcomingDepartures,
  getRoomStatusBreakdown,
  getRateBreakdownForDate,
} from '../data/api'
import { formatCurrency } from '../utils/format'
import { formatDateLong, formatDateShort, offsetISODate, parseISODate } from '../utils/dates'

const STATUS_ORDER = ['VIP', 'Corporate', 'Returning', 'New']

function Overview() {
  const todayISO = offsetISODate(0)
  const [selectedDate, setSelectedDate] = useState(todayISO)
  const [detail, setDetail] = useState(null)

  const selected = parseISODate(selectedDate)
  const year = selected.getFullYear()
  const month = selected.getMonth()

  const metrics = useMemo(() => getDailyMetrics(selectedDate), [selectedDate])
  const occupancyByDay = useMemo(() => getOccupancyByDay(year, month), [year, month])
  const monthAvgOccupancy = occupancyByDay.length
    ? Math.round(occupancyByDay.reduce((sum, d) => sum + d.rate, 0) / occupancyByDay.length)
    : 0
  const revenueByRoomType = useMemo(() => getRevenueByRoomType(), [])
  const bookingCountByRoomType = useMemo(() => getBookingCountByRoomType(), [])
  const totalRevenueAllTime = revenueByRoomType.reduce((sum, r) => sum + r.revenue, 0)
  const guestMix = useMemo(() => getGuestStatusBreakdown(), [])
  const guests = useMemo(() => getGuests(), [])
  const guestsByStatus = useMemo(
    () =>
      [...guests].sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)),
    [guests]
  )
  const arrivals = useMemo(() => getUpcomingArrivals(5, selectedDate), [selectedDate])
  const departures = useMemo(() => getUpcomingDepartures(5, selectedDate), [selectedDate])
  const allArrivals = useMemo(() => getUpcomingArrivals(50, selectedDate), [selectedDate])
  const allDepartures = useMemo(() => getUpcomingDepartures(50, selectedDate), [selectedDate])

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
          label="Revenue"
          value={formatCurrency(metrics.dailyRevenue)}
          icon={Wallet}
          hint={selectedDate === todayISO ? 'Today' : dateLabel}
          onClick={() => setDetail('revenue')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Occupancy Trend"
          subtitle={monthLabel}
          className="lg:col-span-2"
          onClick={() => setDetail('trend')}
        >
          <OccupancyTrendChart data={occupancyByDay} highlightDateISO={selectedDate} />
        </ChartCard>
        <ChartCard title="Guest Mix" subtitle="By loyalty status" onClick={() => setDetail('guestMix')}>
          <GuestMixDonut data={guestMix} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Revenue by Room Type" subtitle="All bookings" onClick={() => setDetail('roomRevenue')}>
          <RevenueByRoomTypeChart data={revenueByRoomType} />
        </ChartCard>
        <ChartCard title="Upcoming Arrivals" onClick={() => setDetail('arrivals')}>
          <UpcomingList items={arrivals} dateField="checkIn" icon={LogIn} />
        </ChartCard>
        <ChartCard title="Upcoming Departures" onClick={() => setDetail('departures')}>
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
          title="Revenue"
          value={formatCurrency(metrics.dailyRevenue)}
          hint={`Nightly revenue across occupied rooms, ${dateLabel}`}
          rows={getRateBreakdownForDate(selectedDate).map((r) => ({
            label: r.guestName,
            sublabel: `Room ${r.roomNumber}`,
            value: formatCurrency(r.rate),
          }))}
          emptyLabel="No rooms occupied on this date"
          onClose={() => setDetail(null)}
        />
      )}

      {detail === 'trend' && (
        <StatDetailModal
          title="Occupancy Trend"
          value={`${monthAvgOccupancy}%`}
          hint={`Average daily occupancy, ${monthLabel}`}
          rows={occupancyByDay.map((d) => ({
            label: `Day ${d.day}`,
            sublabel: `${d.occupiedRooms} room${d.occupiedRooms === 1 ? '' : 's'} occupied`,
            value: `${d.rate}%`,
          }))}
          onClose={() => setDetail(null)}
        />
      )}

      {detail === 'guestMix' && (
        <StatDetailModal
          title="Guest Mix"
          value={guests.length}
          hint="By loyalty status"
          rows={guestsByStatus.map((g) => ({
            label: g.name,
            sublabel: g.status,
            value: g.lastStay ? `Last stay ${formatDateShort(g.lastStay)}` : 'No stays yet',
          }))}
          onClose={() => setDetail(null)}
        />
      )}

      {detail === 'roomRevenue' && (
        <StatDetailModal
          title="Revenue by Room Type"
          value={formatCurrency(totalRevenueAllTime)}
          hint="All bookings, all-time"
          rows={revenueByRoomType.map((r) => ({
            label: r.type,
            sublabel: `${bookingCountByRoomType.find((c) => c.type === r.type)?.count ?? 0} bookings`,
            value: formatCurrency(r.revenue),
          }))}
          onClose={() => setDetail(null)}
        />
      )}

      {detail === 'arrivals' && (
        <StatDetailModal
          title="Upcoming Arrivals"
          value={allArrivals.length}
          hint={`From ${dateLabel}`}
          rows={allArrivals.map((r) => ({
            label: r.guestName,
            sublabel: `Room ${r.roomNumber} · ${r.status.replace('-', ' ')}`,
            value: formatDateShort(r.checkIn),
          }))}
          emptyLabel="No upcoming arrivals"
          onClose={() => setDetail(null)}
        />
      )}

      {detail === 'departures' && (
        <StatDetailModal
          title="Upcoming Departures"
          value={allDepartures.length}
          hint={`From ${dateLabel}`}
          rows={allDepartures.map((r) => ({
            label: r.guestName,
            sublabel: `Room ${r.roomNumber} · ${r.status.replace('-', ' ')}`,
            value: formatDateShort(r.checkOut),
          }))}
          emptyLabel="No upcoming departures"
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  )
}

export default Overview
