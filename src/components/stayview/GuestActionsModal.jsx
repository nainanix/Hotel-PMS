import { useState } from 'react'
import {
  Pencil,
  Wallet,
  CalendarPlus,
  ArrowLeftRight,
  Repeat,
  Ban,
  ListChecks,
  XCircle,
  Printer,
  Send,
  ChevronRight,
  ChevronLeft,
  IdCard,
  Receipt,
  FileText,
  Mail,
} from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

function ActionRow({ icon: Icon, label, description, onClick, tone = 'default' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface-muted"
    >
      <div
        className={[
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          tone === 'danger'
            ? 'bg-status-urgent/10 text-status-urgent'
            : 'bg-gold-50 text-gold-600 dark:bg-gold-500/10 dark:text-gold-400',
        ].join(' ')}
      >
        <Icon size={16} strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-navy-600 dark:text-navy-50">{label}</p>
        {description && <p className="text-xs text-navy-300 dark:text-navy-500">{description}</p>}
      </div>
      <ChevronRight size={16} strokeWidth={1.75} className="shrink-0 text-navy-200 dark:text-navy-600" />
    </button>
  )
}

function BackButton({ onClick, label = 'Back' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs font-medium text-navy-300 transition-colors hover:text-navy-600 dark:text-navy-500 dark:hover:text-navy-100"
    >
      <ChevronLeft size={14} strokeWidth={1.75} />
      {label}
    </button>
  )
}

function GuestActionsModal({ reservation, guest, room, onClose, onEdit, onAddPayment, onAddBooking, onRoomMove, onVoid }) {
  const [view, setView] = useState('main')
  const [comingSoonLabel, setComingSoonLabel] = useState('')

  function showComingSoon(label) {
    setComingSoonLabel(label)
    setView('comingSoon')
  }

  return (
    <Modal
      title={`${guest?.name ?? 'Guest'} · Room ${room?.number ?? '—'}`}
      onClose={onClose}
      maximizable={false}
      footer={
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      }
    >
      {view === 'main' && (
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between rounded-xl bg-surface-muted px-4 py-3">
            <div>
              <p className="font-medium text-navy-600 dark:text-navy-50">{guest?.name}</p>
              <p className="text-xs text-navy-300 dark:text-navy-500">Room {room?.number} · {room?.type}</p>
            </div>
            <Badge status={reservation.status} />
          </div>

          <div className="flex flex-col divide-y divide-navy-100 dark:divide-navy-700">
            <ActionRow icon={Pencil} label="Edit Reservation" description="Guest, stay, room, and rate details" onClick={onEdit} />
            <ActionRow icon={Wallet} label="Add Payment" description="Record a payment against this folio" onClick={onAddPayment} />
            <ActionRow icon={CalendarPlus} label="Amend Stay" description="Change arrival, departure, or nights" onClick={onEdit} />
            <ActionRow icon={CalendarPlus} label="Add New Booking" description="Create another reservation" onClick={onAddBooking} />
            <ActionRow icon={ArrowLeftRight} label="Room Move" description="Move this guest to a different room" onClick={onRoomMove} />
            <ActionRow icon={Repeat} label="Exchange Room" description="Swap rooms with another in-house guest" onClick={() => showComingSoon('Exchange Room')} />
            <ActionRow icon={Ban} label="Stop Room Move" description="Cancel a pending room move" onClick={() => showComingSoon('Stop Room Move')} />
            <ActionRow icon={ListChecks} label="Inclusions List" description="Packages and inclusions on this rate" onClick={() => showComingSoon('Inclusions List')} />
            <ActionRow icon={XCircle} label="Void Reservation" description="Cancel this booking" onClick={() => setView('voidConfirm')} tone="danger" />
            <ActionRow icon={Printer} label="Print & Send" description="Registration card, invoice, voucher" onClick={() => setView('printSend')} />
          </div>
        </div>
      )}

      {view === 'printSend' && (
        <div className="flex flex-col gap-4 text-sm">
          <BackButton onClick={() => setView('main')} />

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-navy-300 dark:text-navy-500">Print</p>
            <div className="flex flex-col divide-y divide-navy-100 rounded-xl border border-navy-100 dark:divide-navy-700 dark:border-navy-700">
              <ActionRow icon={IdCard} label="Print Guest Registration Card" onClick={() => showComingSoon('Print Guest Registration Card')} />
              <ActionRow icon={Receipt} label="Print Invoice" onClick={() => showComingSoon('Print Invoice')} />
              <ActionRow icon={FileText} label="Print Reservation Voucher" onClick={() => showComingSoon('Print Reservation Voucher')} />
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-navy-300 dark:text-navy-500">Send</p>
            <div className="flex flex-col divide-y divide-navy-100 rounded-xl border border-navy-100 dark:divide-navy-700 dark:border-navy-700">
              <ActionRow
                icon={Mail}
                label="Send Invoice"
                description={guest?.email ? `Email to ${guest.email}` : 'Email the invoice to the guest'}
                onClick={() => showComingSoon('Send Invoice')}
              />
            </div>
          </div>
        </div>
      )}

      {view === 'comingSoon' && (
        <div className="flex flex-col gap-4 text-sm">
          <BackButton onClick={() => setView(comingSoonLabel.startsWith('Print') || comingSoonLabel === 'Send Invoice' ? 'printSend' : 'main')} />
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Send size={22} strokeWidth={1.5} className="text-gold-500" />
            <p className="font-medium text-navy-600 dark:text-navy-50">{comingSoonLabel}</p>
            <p className="max-w-xs text-xs text-navy-300 dark:text-navy-500">
              This action isn't wired up yet — we'll connect it to real printing/email delivery later.
            </p>
          </div>
        </div>
      )}

      {view === 'voidConfirm' && (
        <div className="flex flex-col gap-4 text-sm">
          <BackButton onClick={() => setView('main')} />
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <XCircle size={22} strokeWidth={1.5} className="text-status-urgent" />
            <p className="font-medium text-navy-600 dark:text-navy-50">Void this reservation?</p>
            <p className="max-w-xs text-xs text-navy-300 dark:text-navy-500">
              {guest?.name}'s booking for Room {room?.number} will be cancelled. This can't be undone from here.
            </p>
          </div>
          <div className="flex justify-center gap-2">
            <Button variant="ghost" onClick={() => setView('main')}>Keep Reservation</Button>
            <Button variant="primary" onClick={onVoid} className="!bg-status-urgent hover:!bg-status-urgent/90">
              Void Reservation
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default GuestActionsModal
