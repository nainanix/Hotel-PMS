import { useState } from 'react'
import WindowDots from './WindowDots'

function Modal({ title, onClose, children, footer, maximizable = true, defaultMaximized = false }) {
  const [minimized, setMinimized] = useState(false)
  const [maximized, setMaximized] = useState(defaultMaximized)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={[
          'w-full overflow-hidden rounded-2xl border border-navy-100/10 bg-surface shadow-2xl transition-[max-width] duration-200 dark:border-white/10',
          maximized ? 'max-w-3xl' : 'max-w-lg',
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-navy-100 bg-surface-muted px-4 py-3 dark:border-navy-700">
          <div className="flex w-16 shrink-0 items-center">
            <WindowDots
              onClose={onClose}
              onMinimize={() => setMinimized((m) => !m)}
              onMaximize={maximizable ? () => setMaximized((m) => !m) : undefined}
            />
          </div>
          <span className="flex-1 truncate text-center text-sm font-medium text-navy-500 dark:text-navy-200">{title}</span>
          <div className="w-16 shrink-0" />
        </div>

        {!minimized && (
          <>
            <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
            {footer && <div className="border-t border-navy-100 px-5 py-3 dark:border-navy-700">{footer}</div>}
          </>
        )}
      </div>
    </div>
  )
}

export default Modal
