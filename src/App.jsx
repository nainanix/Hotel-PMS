import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/layout/Layout'
import RequireAuth from './components/layout/RequireAuth'
import Login from './pages/Login'
import Overview from './pages/Overview'
import StayView from './pages/StayView'
import Reservations from './pages/Reservations'
import Rates from './pages/Rates'
import GuestDatabase from './pages/GuestDatabase'
import Housekeeping from './pages/Housekeeping'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route index element={<Navigate to="/login" replace />} />
            <Route path="login" element={<Login />} />
            <Route element={<RequireAuth />}>
              <Route element={<Layout />}>
                <Route path="overview" element={<Overview />} />
                <Route path="stay-view" element={<StayView />} />
                <Route path="reservations" element={<Reservations />} />
                <Route path="rates" element={<Rates />} />
                <Route path="guests" element={<GuestDatabase />} />
                <Route path="housekeeping" element={<Housekeeping />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
