import { Printer } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { nightsBetween, formatDateLong } from '../../utils/dates'
import { formatCurrency } from '../../utils/format'

const PROPERTY_LOCATION = 'EVOTEL Downtown'

function LineLabel({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-navy-300 dark:text-navy-500">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  )
}

function InvoiceModal({ reservation, guest, room, onClose }) {
  const nights = nightsBetween(reservation.checkIn, reservation.checkOut) || 1
  const rate = Math.round(reservation.total / nights)
  const amountPaid = reservation.amountPaid ?? 0
  const balanceDue = reservation.total - amountPaid
  const invoiceNumber = `INV-${reservation.id.replace('res-', '')}`
  const invoiceDate = formatDateLong(new Date().toISOString().slice(0, 10))

  return (
    <Modal
      title="Invoice"
      onClose={onClose}
      defaultMaximized
      footer={
        <div className="no-print flex justify-between">
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button variant="primary" icon={Printer} onClick={() => window.print()}>
            Print / Save as PDF
          </Button>
        </div>
      }
    >
      <div className="print-area text-sm text-navy-600 dark:text-navy-50">
        <div className="flex items-start justify-between border-b border-navy-100 pb-6 dark:border-navy-700">
          <div>
            <p className="font-display text-2xl tracking-[0.15em]">EVOTEL</p>
            <p className="mt-1 text-navy-300 dark:text-navy-500">{PROPERTY_LOCATION}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">INVOICE</p>
            <p className="text-navy-300 dark:text-navy-500">{invoiceNumber}</p>
            <p className="text-navy-300 dark:text-navy-500">{invoiceDate}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          <LineLabel label="Billed To">
            <p className="font-medium">{guest?.name ?? 'Unknown guest'}</p>
            {guest?.phone && <p className="text-navy-300 dark:text-navy-500">{guest.phone}</p>}
            {guest?.email && <p className="text-navy-300 dark:text-navy-500">{guest.email}</p>}
          </LineLabel>
          <LineLabel label="Reservation">
            <p>Reservation No. {reservation.id}</p>
            <p className="text-navy-300 dark:text-navy-500">
              Room {room?.number} · {room?.type}
            </p>
            <Badge status={reservation.status} />
          </LineLabel>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-6">
          <LineLabel label="Check-in">{formatDateLong(reservation.checkIn)}</LineLabel>
          <LineLabel label="Check-out">{formatDateLong(reservation.checkOut)}</LineLabel>
          <LineLabel label="Nights">{nights}</LineLabel>
        </div>

        <table className="mt-8 w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-navy-100 dark:border-navy-700">
              <th className="pb-2 font-semibold">Description</th>
              <th className="pb-2 text-right font-semibold">Nights</th>
              <th className="pb-2 text-right font-semibold">Rate</th>
              <th className="pb-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-navy-100 dark:border-navy-700">
              <td className="py-3">
                {room?.type} — Room {room?.number}
              </td>
              <td className="py-3 text-right">{nights}</td>
              <td className="py-3 text-right">{formatCurrency(rate)}</td>
              <td className="py-3 text-right">{formatCurrency(reservation.total)}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <div className="flex w-64 flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-navy-300 dark:text-navy-500">Subtotal</span>
              <span>{formatCurrency(reservation.total)}</span>
            </div>
            <div className="flex justify-between border-t border-navy-100 pt-2 text-base font-semibold dark:border-navy-700">
              <span>Total</span>
              <span>{formatCurrency(reservation.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-300 dark:text-navy-500">Amount Paid</span>
              <span>{formatCurrency(amountPaid)}</span>
            </div>
            <div className="flex justify-between font-semibold text-gold-600 dark:text-gold-400">
              <span>Balance Due</span>
              <span>{formatCurrency(balanceDue)}</span>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-navy-300 dark:text-navy-500">
          Thank you for staying with {PROPERTY_LOCATION}.
        </p>
      </div>
    </Modal>
  )
}

export default InvoiceModal
