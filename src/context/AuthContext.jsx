import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

const AuthContext = createContext(null)
const PENDING_SIGNUP_KEY = 'evotel-pending-signup'
const DEMO_SESSION_KEY = 'evotel-demo-session'

// No backend required — lets anyone explore the dashboard without a real
// Supabase project. Not a stand-in for real auth; just a working demo path.
const DEMO_CREDENTIALS = { username: 'test', password: 'test' }

function requireBackend() {
  if (!isSupabaseConfigured) {
    throw new Error("Backend isn't connected yet — use demo access (test / test) for now.")
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [demoSession, setDemoSession] = useState(() => localStorage.getItem(DEMO_SESSION_KEY) === '1')

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) {
      setProfile(null)
      return
    }

    let cancelled = false

    async function loadProfile() {
      let { data } = await supabase
        .from('profiles')
        .select('*, hotels(name)')
        .eq('id', session.user.id)
        .single()

      // First login after confirming email (or completing OAuth/phone
      // sign-up) — finish the sign-up we deferred because there was no
      // session yet to create the hotel/profile under.
      if (!data) {
        const pendingRaw = localStorage.getItem(PENDING_SIGNUP_KEY)
        const pending = pendingRaw ? JSON.parse(pendingRaw) : null
        const matches = pending && (!pending.email || pending.email === session.user.email)
        if (matches) {
          await supabase.rpc('create_hotel_and_profile', {
            hotel_name: pending.hotelName,
            admin_name: pending.adminName,
          })
          localStorage.removeItem(PENDING_SIGNUP_KEY)
          ;({ data } = await supabase
            .from('profiles')
            .select('*, hotels(name)')
            .eq('id', session.user.id)
            .single())
        }
      }

      if (!cancelled) setProfile(data)
    }

    loadProfile()
    return () => {
      cancelled = true
    }
  }, [session])

  async function signIn(email, password) {
    requireBackend()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp(email, password, hotelName, adminName) {
    requireBackend()
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) throw signUpError

    if (!data.session) {
      // Email confirmation required — stash the details so the first
      // sign-in after confirming can finish creating the hotel/profile.
      localStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify({ email, hotelName, adminName }))
      throw new Error('CONFIRM_EMAIL')
    }

    const { error: rpcError } = await supabase.rpc('create_hotel_and_profile', {
      hotel_name: hotelName,
      admin_name: adminName,
    })
    if (rpcError) throw rpcError
  }

  // OAuth redirects away from the app entirely, so there's no email to key
  // the pending sign-up on yet — stash it generically and let the profile
  // effect pick it up (matched unconditionally) once the session appears.
  async function signInWithGoogle(hotelName, adminName) {
    requireBackend()
    if (hotelName) {
      localStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify({ hotelName, adminName }))
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + window.location.pathname },
    })
    if (error) throw error
  }

  async function sendPhoneOtp(phone) {
    requireBackend()
    const { error } = await supabase.auth.signInWithOtp({ phone })
    if (error) throw error
  }

  async function verifyPhoneOtp(phone, token, hotelName, adminName) {
    requireBackend()
    const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' })
    if (error) throw error

    // Phone auth returns a session immediately (no confirmation step), so
    // the hotel/profile can be created right here for new sign-ups.
    if (hotelName) {
      const { error: rpcError } = await supabase.rpc('create_hotel_and_profile', {
        hotel_name: hotelName,
        admin_name: adminName,
      })
      if (rpcError) throw rpcError
    }
  }

  async function signInDemo(username, password) {
    if (username !== DEMO_CREDENTIALS.username || password !== DEMO_CREDENTIALS.password) {
      throw new Error('Invalid demo credentials — use "test" for both fields.')
    }
    localStorage.setItem(DEMO_SESSION_KEY, '1')
    setDemoSession(true)
  }

  async function signOut() {
    localStorage.removeItem(DEMO_SESSION_KEY)
    setDemoSession(false)
    if (!isSupabaseConfigured) return
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
        demoSession,
        isAuthenticated: Boolean(session) || demoSession,
        signIn,
        signUp,
        signInWithGoogle,
        sendPhoneOtp,
        verifyPhoneOtp,
        signInDemo,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
