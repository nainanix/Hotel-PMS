import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import DatePicker from '../ui/DatePicker'
import { offsetISODate, addDays, parseISODate, toISODate } from '../../utils/dates'
import { hasReservationConflict } from '../../data/api'

const inputClass =
  'w-full rounded-lg border border-navy-100 bg-surface px-3 py-2 text-sm text-navy-600 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold dark:border-navy-700 dark:text-navy-100'

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-navy-300 dark:text-navy-400">{label}</span>
      {children}
    </label>
  )
}

function MaintenanceModal({ mode, rooms, prefill, period, onClose, onSave, onRemove }) {
  const isEdit = mode === 'edit'
  const [roomId, setRoomId] = useState(prefill?.roomId ?? period?.roomId ?? rooms[0]?.id ?? '')
  const initialStart = prefill?.startDate ?? period?.startDate ?? offsetISODate(0)
  const [startDate, setStartDate] = useState(initialStart)
  const [endDate, setEndDate] = useState(
    period?.endDate ?? toISODate(addDays(parseISODate(initialStart), 3))
  )
  const [note, setNote] = useState(period?.note ?? '')

  const room = rooms.find((r) => r.id === roomId)
  const validRange = roomId && startDate < endDate
  const conflict = validRange && hasReservationConflict(roomId, startDate, endDate, period?.id)
  const canSave = validRange && !conflict

  function handleSave(e) {
    e.preventDefault()
    if (!canSave) return
    onSave({ roomId, startDate, endDate, note })
  }

  return (
    <Modal
      title={isEdit ? 'Edit Maintenance' : 'Mark Under Maintenance'}
      onClose={onClose}
      maximizable={false}
      footer={
        <div className="flex w-full items-center justify-between">
          {isEdit ? (
            <button
              type="button"
              onClick={onRemove}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-status-urgent transition-colors hover:bg-status-urgent/10"
            >
              End Maintenance
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={!canSave}>
              {isEdit ? 'Save Changes' : 'Mark Under Maintenance'}
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSave} className="flex flex-col gap-4 text-sm">
        <Field label="Room">
          <select className={inputClass} value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                Room {r.number} · {r.type}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Start Date">
            <DatePicker value={startDate} onChange={setStartDate} />
          </Field>
          <Field label="End Date">
            <DatePicker value={endDate} onChange={setEndDate} />
          </Field>
        </div>

        <Field label="Note (optional)">
          <input
            type="text"
            className={inputClass}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason for maintenance"
          />
        </Field>

        {conflict && (
          <div className="flex items-start gap-2 rounded-xl bg-status-urgent/10 px-4 py-3 text-status-urgent">
            <AlertTriangle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />
            <p>
              Room {room?.number} already has a reservation or scheduled maintenance during part of this date
              range. Choose different dates or another room.
            </p>
          </div>
        )}
      </form>
    </Modal>
  )
}

export default MaintenanceModal
