import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Phone, ArrowLeft } from 'lucide-react'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabaseClient'

const inputClass =
  'w-full rounded-lg border border-navy-100 bg-surface px-3 py-2.5 text-sm text-navy-600 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold dark:border-navy-700 dark:text-navy-100'

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-navy-300 dark:text-navy-400">{label}</span>
      {children}
    </label>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" className="shrink-0">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.617z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  )
}

function Login() {
  const { isAuthenticated, loading, signIn, signUp, signInWithGoogle, sendPhoneOtp, verifyPhoneOtp, signInDemo } =
    useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [inputMethod, setInputMethod] = useState('email') // 'email' | 'phone'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [hotelName, setHotelName] = useState('')
  const [adminName, setAdminName] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && isAuthenticated) {
    return <Navigate to="/overview" replace />
  }

  function resetMessages() {
    setError('')
    setNotice('')
  }

  function switchMode(next) {
    setMode(next)
    resetMessages()
    setInputMethod('email')
    setOtpSent(false)
  }

  function requireSignupDetails() {
    if (mode === 'signup' && (!hotelName.trim() || !adminName.trim())) {
      setError('Enter your property name and your name first.')
      return false
    }
    return true
  }

  async function handleEmailSubmit(e) {
    e.preventDefault()
    resetMessages()
    setSubmitting(true)
    try {
      if (mode === 'signin') {
        if (email.trim() === 'test' && password === 'test') {
          await signInDemo(email.trim(), password)
        } else {
          await signIn(email, password)
        }
      } else {
        await signUp(email, password, hotelName, adminName)
      }
    } catch (err) {
      if (err.message === 'CONFIRM_EMAIL') {
        setNotice('Account created — check your email to confirm it, then sign in below.')
        setMode('signin')
      } else {
        setError(err.message ?? 'Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogle() {
    resetMessages()
    if (!requireSignupDetails()) return
    setSubmitting(true)
    try {
      await signInWithGoogle(mode === 'signup' ? hotelName : undefined, mode === 'signup' ? adminName : undefined)
    } catch (err) {
      setError(err.message ?? "Google sign-in isn't available right now.")
      setSubmitting(false)
    }
  }

  async function handleSendOtp(e) {
    e.preventDefault()
    resetMessages()
    if (!requireSignupDetails()) return
    setSubmitting(true)
    try {
      await sendPhoneOtp(phone)
      setOtpSent(true)
      setNotice('Code sent — check your phone.')
    } catch (err) {
      setError(err.message ?? 'Could not send a code to that number.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault()
    resetMessages()
    setSubmitting(true)
    try {
      await verifyPhoneOtp(phone, otp, mode === 'signup' ? hotelName : undefined, mode === 'signup' ? adminName : undefined)
    } catch (err) {
      setError(err.message ?? "That code didn't work. Try again.")
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

        <div className="rounded-2xl border border-navy-100/10 bg-surface p-6 shadow-2xl">
          <div className="mb-5 flex gap-1 rounded-lg bg-surface-muted p-1">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={
                mode === 'signin'
                  ? 'flex-1 rounded-md bg-navy py-1.5 text-sm font-medium text-white dark:bg-gold dark:text-navy-900'
                  : 'flex-1 rounded-md py-1.5 text-sm font-medium text-navy-400 hover:text-navy-600'
              }
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={
                mode === 'signup'
                  ? 'flex-1 rounded-md bg-navy py-1.5 text-sm font-medium text-white dark:bg-gold dark:text-navy-900'
                  : 'flex-1 rounded-md py-1.5 text-sm font-medium text-navy-400 hover:text-navy-600'
              }
            >
              Create Account
            </button>
          </div>

          {!isSupabaseConfigured && (
            <div className="mb-4 flex items-start gap-2 rounded-xl bg-status-progress/10 px-4 py-3 text-sm text-status-progress">
              <AlertTriangle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />
              <p>
                Backend isn't connected yet — use <strong>demo access</strong> below (email or username field:{' '}
                <code>test</code>, password: <code>test</code>) to explore the dashboard.
              </p>
            </div>
          )}

          {mode === 'signup' && (
            <div className="mb-4 flex flex-col gap-4">
              <Field label="Property Name">
                <input
                  type="text"
                  required
                  className={inputClass}
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  placeholder="e.g. Harbor View Hotel"
                />
              </Field>
              <Field label="Your Name">
                <input
                  type="text"
                  required
                  className={inputClass}
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="e.g. Ariana Cole"
                />
              </Field>
            </div>
          )}

          {inputMethod === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
              <Field label={mode === 'signin' ? 'Email or Username' : 'Email'}>
                <input
                  type="text"
                  required
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={mode === 'signin' ? 'you@property.com or test' : 'you@property.com'}
                />
              </Field>

              <Field label="Password">
                <input
                  type="password"
                  required
                  minLength={4}
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

              {notice && (
                <div className="flex items-start gap-2 rounded-xl bg-status-confirmed/10 px-4 py-3 text-sm text-status-confirmed">
                  <CheckCircle2 size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />
                  <p>{notice}</p>
                </div>
              )}

              <Button type="submit" variant="primary" className="w-full justify-center" disabled={submitting}>
                {submitting ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </Button>

              <div className="flex items-center gap-3 text-xs text-navy-300 dark:text-navy-500">
                <span className="h-px flex-1 bg-navy-100 dark:bg-navy-700" />
                or continue with
                <span className="h-px flex-1 bg-navy-100 dark:bg-navy-700" />
              </div>

              <Button variant="ghost" className="w-full justify-center border border-navy-100 dark:border-navy-700" onClick={handleGoogle} disabled={submitting}>
                <GoogleIcon />
                Continue with Google
              </Button>

              <button
                type="button"
                onClick={() => {
                  setInputMethod('phone')
                  resetMessages()
                }}
                className="flex items-center justify-center gap-1.5 text-sm text-navy-400 transition-colors hover:text-gold-600 dark:hover:text-gold-400"
              >
                <Phone size={14} strokeWidth={1.75} />
                Use phone number instead
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => {
                  setInputMethod('email')
                  setOtpSent(false)
                  resetMessages()
                }}
                className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-navy-300 transition-colors hover:text-navy-600 dark:text-navy-500 dark:hover:text-navy-200"
              >
                <ArrowLeft size={12} strokeWidth={2} />
                Back
              </button>

              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                  <Field label="Phone Number">
                    <input
                      type="tel"
                      required
                      className={inputClass}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 555 010 2020"
                    />
                  </Field>

                  {error && (
                    <div className="flex items-start gap-2 rounded-xl bg-status-urgent/10 px-4 py-3 text-sm text-status-urgent">
                      <AlertTriangle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <Button type="submit" variant="primary" className="w-full justify-center" disabled={submitting}>
                    {submitting ? 'Sending…' : 'Send Code'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                  <Field label={`Code sent to ${phone}`}>
                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      className={inputClass}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                    />
                  </Field>

                  {error && (
                    <div className="flex items-start gap-2 rounded-xl bg-status-urgent/10 px-4 py-3 text-sm text-status-urgent">
                      <AlertTriangle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  {notice && (
                    <div className="flex items-start gap-2 rounded-xl bg-status-confirmed/10 px-4 py-3 text-sm text-status-confirmed">
                      <CheckCircle2 size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />
                      <p>{notice}</p>
                    </div>
                  )}

                  <Button type="submit" variant="primary" className="w-full justify-center" disabled={submitting}>
                    {submitting ? 'Verifying…' : 'Verify & Continue'}
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
