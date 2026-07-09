import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/layout/Layout'
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
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="stay-view" element={<StayView />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="rates" element={<Rates />} />
            <Route path="guests" element={<GuestDatabase />} />
            <Route path="housekeeping" element={<Housekeeping />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </HashRouter>
    </ThemeProvider>
  )
}

export default App
