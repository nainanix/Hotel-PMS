import { useMemo, useState } from 'react'
import { Plus, PieChart, DollarSign, TrendingUp, Wallet } from 'lucide-react'
import Button from '../components/ui/Button'
import StatCard from '../components/ui/StatCard'
import StayViewGrid from '../components/stayview/StayViewGrid'
import MonthTabs from '../components/stayview/MonthTabs'
import ReservationModal from '../components/stayview/ReservationModal'
import { getKeyMetrics, getRooms, getGuests, addReservation } from '../data/api'
import { formatCurrency } from '../utils/format'

function StayView() {
  const now = new Date()
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const [refreshKey, setRefreshKey] = useState(0)
  const [modal, setModal] = useState(null) // { mode: 'create'|'view', prefill?, reservation? }

  const metrics = useMemo(
    () => getKeyMetrics(cursor.year, cursor.month),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cursor.year, cursor.month, refreshKey]
  )
  const rooms = getRooms()
  const guests = getGuests()

  function handleCreate(data) {
    addReservation(data)
    setRefreshKey((k) => k + 1)
    setModal(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end">
        <Button icon={Plus} onClick={() => setModal({ mode: 'create', prefill: {} })}>
          Create Reservation
        </Button>
      </div>

      <MonthTabs activeYear={cursor.year} activeMonth={cursor.month} onSelect={setCursor} />

      <StayViewGrid
        year={cursor.year}
        month={cursor.month}
        refreshKey={refreshKey}
        onCellClick={(room, dateISO) =>
          setModal({ mode: 'create', prefill: { roomId: room.id, checkIn: dateISO } })
        }
        onBlockClick={(reservation) => setModal({ mode: 'view', reservation })}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Occupancy" value={`${metrics.occupancyRate}%`} icon={PieChart} />
        <StatCard label="ADR" value={formatCurrency(metrics.adr)} icon={DollarSign} hint="Average Daily Rate" />
        <StatCard label="RevPAR" value={formatCurrency(metrics.revpar)} icon={TrendingUp} hint="Revenue per Available Room" />
        <StatCard label="Monthly Revenue" value={formatCurrency(metrics.monthlyRevenue)} icon={Wallet} />
      </div>

      {modal && (
        <ReservationModal
          mode={modal.mode}
          guests={guests}
          rooms={rooms}
          prefill={modal.prefill}
          reservation={modal.reservation}
          onClose={() => setModal(null)}
          onCreate={handleCreate}
        />
      )}
    </div>
  )
}

export default StayView
