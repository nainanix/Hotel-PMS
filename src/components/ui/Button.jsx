const VARIANT_STYLES = {
  primary: 'bg-gold text-navy-900 hover:bg-gold-400 focus:ring-gold-300',
  secondary: 'bg-navy text-white hover:bg-navy-700 focus:ring-navy-300 dark:bg-navy-700 dark:hover:bg-navy-600',
  ghost: 'bg-transparent text-navy-500 hover:bg-surface-muted focus:ring-navy-100 dark:text-navy-300 dark:hover:bg-navy-800',
}

function Button({ variant = 'primary', icon: Icon, children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={[
        'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-40',
        VARIANT_STYLES[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {Icon && <Icon size={16} strokeWidth={2} />}
      {children}
    </button>
  )
}

export default Button
