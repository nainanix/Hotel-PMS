import { useState } from 'react'
import {
  Eye,
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
  ChevronLeft,
  IdCard,
  Receipt,
  FileText,
  Mail,
} from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

// Once a stay is closed out (checked out or cancelled) there's nothing left
// to move, amend, or void — those actions gray out. Viewing, paying an
// outstanding balance, printing records, and starting a fresh booking stay
// available regardless of status.
const CLOSED_STATUSES = new Set(['checked-out', 'cancelled'])

function ActionCard({ icon: Icon, label, description, onClick, tone = 'default', disabled = false }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={[
        'flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors',
        disabled
          ? 'cursor-not-allowed border-navy-100 opacity-50 dark:border-navy-700'
          : 'border-navy-100 hover:border-gold hover:bg-gold-50 dark:border-navy-700 dark:hover:border-gold dark:hover:bg-gold-500/10',
      ].join(' ')}
    >
      <div
        className={[
          'flex h-9 w-9 items-center justify-center rounded-full',
          tone === 'danger' && !disabled
            ? 'bg-status-urgent/10 text-status-urgent'
            : 'bg-gold-50 text-gold-600 dark:bg-gold-500/10 dark:text-gold-400',
        ].join(' ')}
      >
        <Icon size={16} strokeWidth={1.75} />
      </div>
      <p className="font-medium text-navy-600 dark:text-navy-50">{label}</p>
      {description && <p className="text-xs text-navy-300 dark:text-navy-500">{description}</p>}
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

function GuestActionsModal({
  reservation,
  guest,
  room,
  onClose,
  onView,
  onEdit,
  onAddPayment,
  onAddBooking,
  onRoomMove,
  onVoid,
  onPrintInvoice,
}) {
  const [view, setView] = useState('main')
  const [comingSoonLabel, setComingSoonLabel] = useState('')
  const [comingSoonOrigin, setComingSoonOrigin] = useState('main')

  const isClosed = CLOSED_STATUSES.has(reservation.status)

  function showComingSoon(label, origin = 'main') {
    setComingSoonLabel(label)
    setComingSoonOrigin(origin)
    setView('comingSoon')
  }

  return (
    <Modal
      title={`${guest?.name ?? 'Guest'} · Room ${room?.number ?? '—'}`}
      onClose={onClose}
      defaultMaximized
      footer={
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      }
    >
      {view === 'main' && (
        <div className="flex flex-col gap-5 text-sm">
          <div className="flex items-center justify-between rounded-xl bg-surface-muted px-4 py-3">
            <div>
              <p className="font-medium text-navy-600 dark:text-navy-50">{guest?.name}</p>
              <p className="text-xs text-navy-300 dark:text-navy-500">Room {room?.number} · {room?.type}</p>
            </div>
            <Badge status={reservation.status} />
          </div>

          {isClosed && (
            <p className="text-xs text-navy-300 dark:text-navy-500">
              This reservation is {reservation.status.replace('-', ' ')} — editing, room changes, and voiding are no
              longer available.
            </p>
          )}

          <div className="grid grid-cols-3 gap-3">
            <ActionCard icon={Eye} label="View Reservation" description="Full details for this booking" onClick={onView} />
            <ActionCard icon={Pencil} label="Edit Reservation" description="Guest, stay, room, and rate details" onClick={onEdit} disabled={isClosed} />
            <ActionCard icon={Wallet} label="Add Payment" description="Record a payment against this folio" onClick={onAddPayment} />
            <ActionCard icon={CalendarPlus} label="Amend Stay" description="Change arrival, departure, or nights" onClick={onEdit} disabled={isClosed} />
            <ActionCard icon={CalendarPlus} label="Add New Booking" description="Create another reservation" onClick={onAddBooking} />
            <ActionCard icon={ArrowLeftRight} label="Room Move" description="Move this guest to a different room" onClick={onRoomMove} disabled={isClosed} />
            <ActionCard icon={Printer} label="Print & Send" description="Registration card, invoice, voucher" onClick={() => setView('printSend')} />
          </div>

          <p className="text-xs font-semibold uppercase tracking-wide text-navy-300 dark:text-navy-500">
            More Actions
          </p>
          <div className="grid grid-cols-3 gap-3">
            <ActionCard
              icon={Repeat}
              label="Exchange Room"
              description="Swap rooms with another in-house guest"
              onClick={() => showComingSoon('Exchange Room', 'main')}
              disabled={isClosed}
            />
            <ActionCard
              icon={Ban}
              label="Stop Room Move"
              description="Cancel a pending room move"
              onClick={() => showComingSoon('Stop Room Move', 'main')}
              disabled={isClosed}
            />
            <ActionCard
              icon={ListChecks}
              label="Inclusions List"
              description="Packages and inclusions on this rate"
              onClick={() => showComingSoon('Inclusions List', 'main')}
            />
            <ActionCard
              icon={XCircle}
              label="Void Reservation"
              description="Cancel this booking"
              onClick={() => setView('voidConfirm')}
              tone="danger"
              disabled={isClosed}
            />
          </div>
        </div>
      )}

      {view === 'printSend' && (
        <div className="flex flex-col gap-4 text-sm">
          <BackButton onClick={() => setView('main')} />

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-navy-300 dark:text-navy-500">Print</p>
            <div className="grid grid-cols-3 gap-3">
              <ActionCard icon={IdCard} label="Print Guest Registration Card" onClick={() => showComingSoon('Print Guest Registration Card', 'printSend')} />
              <ActionCard icon={Receipt} label="Print Invoice" onClick={onPrintInvoice} />
              <ActionCard icon={FileText} label="Print Reservation Voucher" onClick={() => showComingSoon('Print Reservation Voucher', 'printSend')} />
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-navy-300 dark:text-navy-500">Send</p>
            <div className="grid grid-cols-3 gap-3">
              <ActionCard
                icon={Mail}
                label="Send Invoice"
                description={guest?.email ? `Email to ${guest.email}` : 'Email the invoice to the guest'}
                onClick={() => showComingSoon('Send Invoice', 'printSend')}
              />
            </div>
          </div>
        </div>
      )}

      {view === 'comingSoon' && (
        <div className="flex flex-col gap-4 text-sm">
          <BackButton onClick={() => setView(comingSoonOrigin)} />
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
