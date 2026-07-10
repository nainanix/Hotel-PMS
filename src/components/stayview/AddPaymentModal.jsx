import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { formatCurrency } from '../../utils/format'

const tariffWrapClass =
  'flex items-center gap-1.5 rounded-lg border border-navy-100 bg-surface px-3 py-2 text-sm text-navy-600 focus-within:border-gold focus-within:ring-1 focus-within:ring-gold dark:border-navy-700 dark:text-navy-100'

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-navy-300 dark:text-navy-400">{label}</span>
      {children}
    </label>
  )
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-navy-300 dark:text-navy-400">{label}</p>
      <p className="mt-0.5 font-medium text-navy-600 dark:text-navy-50">{value}</p>
    </div>
  )
}

function AddPaymentModal({ reservation, guest, onClose, onSubmit }) {
  const amountPaid = reservation.amountPaid ?? 0
  const balanceDue = reservation.total - amountPaid
  const [amount, setAmount] = useState(balanceDue > 0 ? String(balanceDue) : '')

  const amountValue = Number(amount)
  const canSubmit = amountValue > 0

  return (
    <Modal
      title="Add Payment"
      onClose={onClose}
      maximizable={false}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!canSubmit} onClick={() => onSubmit(amountValue)}>
            Record Payment
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 text-sm">
        <p className="text-navy-500 dark:text-navy-300">
          Record a payment against <span className="font-medium text-navy-600 dark:text-navy-50">{guest?.name}</span>'s
          folio.
        </p>

        <div className="grid grid-cols-3 gap-4 rounded-xl bg-surface-muted p-4">
          <DetailRow label="Total Amount" value={formatCurrency(reservation.total)} />
          <DetailRow label="Amount Paid" value={formatCurrency(amountPaid)} />
          <DetailRow label="Balance Due" value={formatCurrency(balanceDue)} />
        </div>

        <Field label="Payment Amount">
          <div className={tariffWrapClass}>
            <span className="text-navy-300 dark:text-navy-500">₹</span>
            <input
              type="number"
              min="0"
              step="100"
              autoFocus
              className="w-full bg-transparent focus:outline-none"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </Field>
      </div>
    </Modal>
  )
}

export default AddPaymentModal
