import { useMemo, useState } from 'react'
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react'
import StatCard from '../components/ui/StatCard'
import StatDetailModal from '../components/ui/StatDetailModal'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { Table, Th, Td } from '../components/ui/Table'
import { getHousekeepingStatus } from '../data/api'
import { formatTime } from '../utils/format'

const STAFF_POOL = ['Maria Lopez', 'Tom Reyes', 'Grace Kim', 'Ivan Petrov']

const ACTION_LABEL = {
  dirty: 'Assign',
  'in-progress': 'Inspect',
  clean: 'Release',
}

function nextStatus(status) {
  if (status === 'dirty') return 'in-progress'
  if (status === 'in-progress') return 'clean'
  return 'clean'
}

function Housekeeping() {
  const [rooms, setRooms] = useState(() => getHousekeepingStatus())
  const [detail, setDetail] = useState(null)

  const byStatus = useMemo(
    () => ({
      dirty: rooms.filter((r) => r.housekeeping.status === 'dirty'),
      'in-progress': rooms.filter((r) => r.housekeeping.status === 'in-progress'),
      clean: rooms.filter((r) => r.housekeeping.status === 'clean'),
    }),
    [rooms]
  )

  function handleAction(roomId) {
    setRooms((prev) =>
      prev.map((room, i) => {
        if (room.id !== roomId) return room
        const status = room.housekeeping.status
        if (status === 'clean') return room
        const updated = nextStatus(status)
        return {
          ...room,
          housekeeping: {
            status: updated,
            assignedStaff:
              updated === 'in-progress' ? STAFF_POOL[i % STAFF_POOL.length] : room.housekeeping.assignedStaff,
            lastCleaned: updated === 'clean' ? new Date().toISOString() : room.housekeeping.lastCleaned,
          },
        }
      })
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Dirty"
          value={byStatus.dirty.length}
          icon={AlertCircle}
          onClick={() => setDetail('dirty')}
        />
        <StatCard
          label="In Progress"
          value={byStatus['in-progress'].length}
          icon={RefreshCw}
          onClick={() => setDetail('in-progress')}
        />
        <StatCard
          label="Clean"
          value={byStatus.clean.length}
          icon={Sparkles}
          onClick={() => setDetail('clean')}
        />
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Room</Th>
            <Th>Guest</Th>
            <Th>Status</Th>
            <Th>Staff Assigned</Th>
            <Th>Last Cleaned</Th>
            <Th className="text-right">Action</Th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id} className="hover:bg-surface-muted/60">
              <Td className="font-medium text-navy-600 dark:text-navy-50">
                {room.number}
                <span className="ml-1 text-xs font-normal text-navy-300 dark:text-navy-500">({room.type})</span>
                {room.underMaintenance && (
                  <span className="ml-2 text-xs font-normal text-navy-400 dark:text-navy-400">
                    Under maintenance
                  </span>
                )}
              </Td>
              <Td>{room.currentGuestName ?? <span className="text-navy-300 dark:text-navy-500">—</span>}</Td>
              <Td>
                <Badge status={room.housekeeping.status} />
              </Td>
              <Td>
                {room.housekeeping.assignedStaff ?? (
                  <span className="text-navy-300 dark:text-navy-500">Unassigned</span>
                )}
              </Td>
              <Td>
                {room.housekeeping.lastCleaned ? (
                  formatTime(room.housekeeping.lastCleaned)
                ) : (
                  <span className="text-navy-300 dark:text-navy-500">—</span>
                )}
              </Td>
              <Td className="text-right">
                {room.housekeeping.status === 'clean' ? (
                  <span className="text-xs text-navy-300 dark:text-navy-500">Released</span>
                ) : (
                  <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => handleAction(room.id)}>
                    {ACTION_LABEL[room.housekeeping.status]}
                  </Button>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      {detail === 'dirty' && (
        <StatDetailModal
          title="Dirty Rooms"
          value={byStatus.dirty.length}
          rows={byStatus.dirty.map((room) => ({
            label: `Room ${room.number}`,
            sublabel: room.type,
            value: room.currentGuestName ?? 'Vacant',
          }))}
          emptyLabel="No dirty rooms"
          onClose={() => setDetail(null)}
        />
      )}

      {detail === 'in-progress' && (
        <StatDetailModal
          title="Rooms In Progress"
          value={byStatus['in-progress'].length}
          rows={byStatus['in-progress'].map((room) => ({
            label: `Room ${room.number}`,
            sublabel: room.type,
            value: room.housekeeping.assignedStaff ?? 'Unassigned',
          }))}
          emptyLabel="No rooms in progress"
          onClose={() => setDetail(null)}
        />
      )}

      {detail === 'clean' && (
        <StatDetailModal
          title="Clean Rooms"
          value={byStatus.clean.length}
          rows={byStatus.clean.map((room) => ({
            label: `Room ${room.number}`,
            sublabel: room.type,
            value: room.housekeeping.lastCleaned ? formatTime(room.housekeeping.lastCleaned) : '—',
          }))}
          emptyLabel="No clean rooms"
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  )
}

export default Housekeeping
