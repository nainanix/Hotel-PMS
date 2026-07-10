import { useMemo, useState } from 'react'
import { Plus, PieChart, IndianRupee, TrendingUp, Wallet } from 'lucide-react'
import Button from '../components/ui/Button'
import StatCard from '../components/ui/StatCard'
import StatDetailModal from '../components/ui/StatDetailModal'
import StayViewGrid from '../components/stayview/StayViewGrid'
import MonthTabs from '../components/stayview/MonthTabs'
import ReservationModal from '../components/stayview/ReservationModal'
import CellChoiceModal from '../components/stayview/CellChoiceModal'
import MaintenanceModal from '../components/stayview/MaintenanceModal'
import {
  getMonthlyMetrics,
  getRooms,
  getGuests,
  addReservation,
  addMaintenancePeriod,
  updateMaintenancePeriod,
  removeMaintenancePeriod,
  getOccupancyByDay,
  getRateBreakdownForMonth,
  getRevenueByRoomTypeForMonth,
} from '../data/api'
import { formatCurrency } from '../utils/format'

function StayView() {
  const now = new Date()
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const [refreshKey, setRefreshKey] = useState(0)
  const [modal, setModal] = useState(null)
  const [detail, setDetail] = useState(null)
  // modal shapes:
  //  { type: 'choice', room, dateISO }
  //  { type: 'reservation', mode: 'create'|'view', prefill?, reservation? }
  //  { type: 'maintenance', mode: 'create'|'edit', prefill?, period? }

  const metrics = useMemo(
    () => getMonthlyMetrics(cursor.year, cursor.month),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cursor.year, cursor.month, refreshKey]
  )
  const occupancyByDay = useMemo(
    () => getOccupancyByDay(cursor.year, cursor.month),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cursor.year, cursor.month, refreshKey]
  )
  const rooms = getRooms()
  const guests = getGuests()
  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  function refresh() {
    setRefreshKey((k) => k + 1)
  }

  function handleCreateReservation(data) {
    addReservation(data)
    refresh()
    setModal(null)
  }

  function handleSaveMaintenance(data) {
    if (modal?.mode === 'edit') {
      updateMaintenancePeriod(modal.period.id, data)
    } else {
      addMaintenancePeriod(data)
    }
    refresh()
    setModal(null)
  }

  function handleRemoveMaintenance() {
    if (modal?.period) removeMaintenancePeriod(modal.period.id)
    refresh()
    setModal(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end">
        <Button icon={Plus} onClick={() => setModal({ type: 'reservation', mode: 'create', prefill: {} })}>
          Create Reservation
        </Button>
      </div>

      <MonthTabs activeYear={cursor.year} activeMonth={cursor.month} onSelect={setCursor} />

      <StayViewGrid
        year={cursor.year}
        month={cursor.month}
        refreshKey={refreshKey}
        onCellClick={(room, dateISO) => setModal({ type: 'choice', room, dateISO })}
        onBlockClick={(reservation) => setModal({ type: 'reservation', mode: 'view', reservation })}
        onMaintenanceClick={(period) => setModal({ type: 'maintenance', mode: 'edit', period })}
      />

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

      {modal?.type === 'choice' && (
        <CellChoiceModal
          room={modal.room}
          dateISO={modal.dateISO}
          onClose={() => setModal(null)}
          onChooseReservation={() =>
            setModal({
              type: 'reservation',
              mode: 'create',
              prefill: { roomId: modal.room.id, checkIn: modal.dateISO },
            })
          }
          onChooseMaintenance={() =>
            setModal({
              type: 'maintenance',
              mode: 'create',
              prefill: { roomId: modal.room.id, startDate: modal.dateISO },
            })
          }
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
        />
      )}

      {modal?.type === 'maintenance' && (
        <MaintenanceModal
          mode={modal.mode}
          rooms={rooms}
          prefill={modal.prefill}
          period={modal.period}
          onClose={() => setModal(null)}
          onSave={handleSaveMaintenance}
          onRemove={handleRemoveMaintenance}
        />
      )}

      {detail === 'occupancy' && (
        <StatDetailModal
          title="Occupancy"
          value={`${metrics.occupancyRate}%`}
          hint={`Average daily occupancy, ${monthLabel}`}
          rows={occupancyByDay.map((d) => ({
            label: `Day ${d.day}`,
            sublabel: `${d.occupiedRooms} room${d.occupiedRooms === 1 ? '' : 's'} occupied`,
            value: `${d.rate}%`,
          }))}
          onClose={() => setDetail(null)}
        />
      )}

      {detail === 'adr' && (
        <StatDetailModal
          title="Average Daily Rate"
          value={formatCurrency(metrics.adr)}
          hint={`Mean nightly rate across bookings, ${monthLabel}`}
          rows={getRateBreakdownForMonth(cursor.year, cursor.month).map((r) => ({
            label: r.guestName,
            sublabel: `Room ${r.roomNumber}`,
            value: formatCurrency(r.rate),
          }))}
          emptyLabel="No bookings this month"
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
          rows={getRevenueByRoomTypeForMonth(cursor.year, cursor.month).map((r) => ({
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

export default StayView
