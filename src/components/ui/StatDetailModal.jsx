import Modal from './Modal'
import Button from './Button'

function StatDetailModal({ title, value, hint, rows, emptyLabel, children, onClose }) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      maximizable={false}
      footer={
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Done
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 text-sm">
        {value !== undefined && (
          <div>
            <p className="text-3xl font-semibold text-navy-600 dark:text-navy-50">{value}</p>
            {hint && <p className="mt-0.5 text-xs text-navy-300 dark:text-navy-500">{hint}</p>}
          </div>
        )}

        {rows && rows.length > 0 && (
          <div className="flex flex-col divide-y divide-navy-100 rounded-xl border border-navy-100 dark:divide-navy-700 dark:border-navy-700">
            {rows.map((row, i) => (
              <div key={i} className="flex items-center justify-between gap-4 px-4 py-2.5">
                <div>
                  <p className="text-navy-500 dark:text-navy-300">{row.label}</p>
                  {row.sublabel && (
                    <p className="text-xs text-navy-300 dark:text-navy-500">{row.sublabel}</p>
                  )}
                </div>
                <span className="shrink-0 font-medium text-navy-600 dark:text-navy-50">{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {rows && rows.length === 0 && (
          <p className="py-4 text-center text-navy-300 dark:text-navy-500">{emptyLabel ?? 'Nothing to show'}</p>
        )}

        {children}
      </div>
    </Modal>
  )
}

export default StatDetailModal
