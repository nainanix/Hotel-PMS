import { Plus, Wrench } from 'lucide-react'
import Modal from '../ui/Modal'
import { formatDateLong } from '../../utils/dates'

function ChoiceCard({ icon: Icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start gap-2 rounded-xl border border-navy-100 p-4 text-left transition-colors hover:border-gold hover:bg-gold-50 dark:border-navy-700 dark:hover:border-gold dark:hover:bg-gold-500/10"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-50 text-gold-600 dark:bg-gold-500/10 dark:text-gold-400">
        <Icon size={16} strokeWidth={1.75} />
      </div>
      <p className="font-medium text-navy-600 dark:text-navy-50">{title}</p>
      <p className="text-xs text-navy-300 dark:text-navy-500">{description}</p>
    </button>
  )
}

function CellChoiceModal({ room, dateISO, onClose, onChooseReservation, onChooseMaintenance }) {
  return (
    <Modal title={`Room ${room.number} · ${formatDateLong(dateISO)}`} onClose={onClose} maximizable={false}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ChoiceCard
          icon={Plus}
          title="Create Reservation"
          description="Book this room for a guest."
          onClick={onChooseReservation}
        />
        <ChoiceCard
          icon={Wrench}
          title="Mark Under Maintenance"
          description="Take this room out of service."
          onClick={onChooseMaintenance}
        />
      </div>
    </Modal>
  )
}

export default CellChoiceModal
