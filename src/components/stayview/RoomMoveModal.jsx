import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { hasRoomConflict } from '../../data/api'

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

function RoomMoveModal({ reservation, guest, rooms, onClose, onSubmit }) {
  const currentRoom = rooms.find((r) => r.id === reservation.roomId)
  const [newRoomId, setNewRoomId] = useState('')

  const otherRooms = rooms.filter((r) => r.id !== reservation.roomId)
  const newRoom = rooms.find((r) => r.id === newRoomId)
  const conflict = newRoomId
    ? hasRoomConflict(newRoomId, reservation.checkIn, reservation.checkOut, reservation.id)
    : false
  const canSubmit = newRoomId && !conflict

  return (
    <Modal
      title="Room Move"
      onClose={onClose}
      maximizable={false}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!canSubmit} onClick={() => onSubmit(newRoomId)}>
            Move Room
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 text-sm">
        <p className="text-navy-500 dark:text-navy-300">
          Move <span className="font-medium text-navy-600 dark:text-navy-50">{guest?.name}</span> from Room{' '}
          {currentRoom?.number} ({currentRoom?.type}) to a different room, keeping the same dates.
        </p>

        <Field label="New Room">
          <select className={inputClass} value={newRoomId} onChange={(e) => setNewRoomId(e.target.value)}>
            <option value="" disabled>
              Select a room
            </option>
            {otherRooms.map((r) => (
              <option key={r.id} value={r.id}>
                Room {r.number} · {r.type}
              </option>
            ))}
          </select>
        </Field>

        {conflict && (
          <div className="flex items-start gap-2 rounded-xl bg-status-urgent/10 px-4 py-3 text-status-urgent">
            <AlertTriangle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />
            <p>
              Room {newRoom?.number} is unavailable for this stay's dates — already booked or under maintenance.
              Choose a different room.
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default RoomMoveModal
