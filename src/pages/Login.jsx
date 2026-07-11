import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { AlertTriangle, LogIn } from 'lucide-react'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

const inputClass =
  'w-full rounded-lg border border-navy-100 bg-surface px-3.5 py-2.5 text-sm text-navy-600 transition-colors focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold dark:border-navy-700 dark:text-navy-100'

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-navy-300 dark:text-navy-400">{label}</span>
      {children}
    </label>
  )
}

function Login() {
  const { isAuthenticated, loading, signIn, signInDemo } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && isAuthenticated) {
    return <Navigate to="/overview" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (email.trim() === 'test' && password === 'test') {
        await signInDemo(email.trim(), password)
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      // Keep backend implementation details (e.g. "backend isn't connected")
      // out of a guest-facing sign-in failure — a failed attempt just reads
      // as invalid credentials, same as any real sign-in page.
      setError(
        err.message && err.message !== "Backend isn't connected yet — use demo access (test / test) for now."
          ? err.message
          : 'Invalid email or password.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-display text-3xl tracking-[0.2em] text-white">EVOTEL</span>
          <p className="mt-2 text-sm text-navy-300">Property management, for your property.</p>
        </div>

        <div className="rounded-2xl border border-gold-500/10 bg-surface p-7 shadow-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gold-50 text-gold-600 dark:bg-gold-500/10 dark:text-gold-400">
              <LogIn size={18} strokeWidth={1.75} />
            </div>
            <h1 className="text-lg font-semibold text-navy-600 dark:text-navy-50">Welcome back</h1>
            <p className="mt-1 text-sm text-navy-300 dark:text-navy-500">Sign in to your property</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Email Address">
              <input
                type="text"
                required
                autoComplete="username"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@property.com"
              />
            </Field>

            <Field label="Password">
              <input
                type="password"
                required
                autoComplete="current-password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-status-urgent/10 px-4 py-3 text-sm text-status-urgent">
                <AlertTriangle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <Button type="submit" variant="primary" className="mt-1 w-full justify-center" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
