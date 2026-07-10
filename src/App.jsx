import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import {
  Tag,
  CalendarClock,
  Sun,
  ShieldAlert,
  Share2,
  Globe2,
  Scale,
  Globe,
  UserCircle,
  Heart,
  MessageSquare,
  Receipt,
  CreditCard,
  FileStack,
  Undo2,
  Users2,
  Wrench,
  ClipboardCheck,
  ListChecks,
  FileClock,
  AlertTriangle,
  Store,
  Lock,
  FileDown,
} from 'lucide-react'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/layout/Layout'
import RequireAuth from './components/layout/RequireAuth'
import Login from './pages/Login'
import Overview from './pages/Overview'
import StayView from './pages/StayView'
import Reservations from './pages/Reservations'
import GuestDatabase from './pages/GuestDatabase'
import Housekeeping from './pages/Housekeeping'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Placeholder from './pages/Placeholder'

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

                <Route
                  path="rates/plans"
                  element={
                    <Placeholder icon={Tag} title="Rate Plans" description="Build and manage nightly rate plans by room type and season." />
                  }
                />
                <Route
                  path="rates/availability"
                  element={
                    <Placeholder icon={CalendarClock} title="Availability Calendar" description="See room availability across dates at a glance." />
                  }
                />
                <Route
                  path="rates/seasonal-pricing"
                  element={
                    <Placeholder icon={Sun} title="Seasonal Pricing" description="Set peak, off-peak, and holiday pricing rules." />
                  }
                />
                <Route
                  path="rates/restrictions"
                  element={
                    <Placeholder icon={ShieldAlert} title="Rate Restrictions" description="Configure minimum stay, closeout, and booking restrictions." />
                  }
                />

                <Route
                  path="distribution/channel-manager"
                  element={
                    <Placeholder icon={Share2} title="Channel Manager" description="Push rates and availability to connected booking channels." />
                  }
                />
                <Route
                  path="distribution/ota-connections"
                  element={
                    <Placeholder icon={Globe2} title="OTA Connections" description="Manage connections to online travel agencies." />
                  }
                />
                <Route
                  path="distribution/rate-parity"
                  element={
                    <Placeholder icon={Scale} title="Rate Parity" description="Monitor rate consistency across all sales channels." />
                  }
                />
                <Route
                  path="distribution/booking-engine"
                  element={
                    <Placeholder icon={Globe} title="Booking Engine" description="Configure the direct-booking widget for your website." />
                  }
                />

                <Route path="guests/database" element={<GuestDatabase />} />
                <Route
                  path="guests/profiles"
                  element={
                    <Placeholder icon={UserCircle} title="Guest Profiles" description="Detailed guest history, preferences, and notes." />
                  }
                />
                <Route
                  path="guests/loyalty"
                  element={
                    <Placeholder icon={Heart} title="Loyalty Program" description="Track loyalty tiers, points, and member perks." />
                  }
                />
                <Route
                  path="guests/feedback"
                  element={
                    <Placeholder icon={MessageSquare} title="Feedback & Reviews" description="Collect and respond to guest feedback and reviews." />
                  }
                />

                <Route
                  path="cashiering/folios"
                  element={
                    <Placeholder icon={Receipt} title="Folios" description="View and manage guest folios and charges." />
                  }
                />
                <Route
                  path="cashiering/payments"
                  element={
                    <Placeholder icon={CreditCard} title="Payments" description="Record and reconcile guest payments." />
                  }
                />
                <Route
                  path="cashiering/invoices"
                  element={
                    <Placeholder icon={FileStack} title="Invoices" description="Generate and send guest and corporate invoices." />
                  }
                />
                <Route
                  path="cashiering/refunds"
                  element={
                    <Placeholder icon={Undo2} title="Refunds" description="Process and track refunds against guest folios." />
                  }
                />

                <Route path="housekeeping/room-status" element={<Housekeeping />} />
                <Route
                  path="housekeeping/staff-assignments"
                  element={
                    <Placeholder icon={Users2} title="Staff Assignments" description="Assign rooms to housekeeping staff for the day." />
                  }
                />
                <Route
                  path="housekeeping/maintenance-requests"
                  element={
                    <Placeholder icon={Wrench} title="Maintenance Requests" description="Log and track room maintenance requests." />
                  }
                />
                <Route
                  path="housekeeping/schedule"
                  element={
                    <Placeholder icon={ClipboardCheck} title="Cleaning Schedule" description="Plan cleaning schedules across all rooms." />
                  }
                />

                <Route
                  path="night-audit/checklist"
                  element={
                    <Placeholder icon={ListChecks} title="Audit Checklist" description="Run through the nightly audit checklist." />
                  }
                />
                <Route
                  path="night-audit/end-of-day"
                  element={
                    <Placeholder icon={FileClock} title="End of Day Report" description="Generate the end-of-day financial and occupancy report." />
                  }
                />
                <Route
                  path="night-audit/discrepancies"
                  element={
                    <Placeholder icon={AlertTriangle} title="Discrepancy Log" description="Review and resolve nightly audit discrepancies." />
                  }
                />

                <Route
                  path="b2b-marketplace"
                  element={
                    <Placeholder icon={Store} title="B2B Marketplace" description="Connect with travel partners and corporate accounts." />
                  }
                />
                <Route
                  path="net-locks"
                  element={
                    <Placeholder icon={Lock} title="Net Locks" description="Lock rates and inventory to prevent further changes." />
                  }
                />
                <Route path="reports" element={<Reports />} />
                <Route
                  path="exported-reports"
                  element={
                    <Placeholder icon={FileDown} title="Exported Reports" description="Download previously exported reports." />
                  }
                />

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
