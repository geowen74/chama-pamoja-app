import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Layouts
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard'
import Members from './pages/members/Members'
import MemberDetails from './pages/members/MemberDetails'
import Contributions from './pages/contributions/Contributions'
import ContributionDetails from './pages/contributions/ContributionDetails'
import Loans from './pages/loans/Loans'
import LoanDetails from './pages/loans/LoanDetails'
import LoanApplication from './pages/loans/LoanApplication'
import Meetings from './pages/meetings/Meetings'
import Expenses from './pages/expenses/Expenses'
import Fines from './pages/fines/Fines'
import Projects from './pages/projects/Projects'
import Reports from './pages/reports/Reports'
import Settings from './pages/settings/Settings'
import AdminSettings from './pages/admin/AdminSettings'

// Governance Pages
import GroupMembers from './pages/governance/GroupMembers'
import BoardResolutions from './pages/governance/BoardResolutions'
import ActionPlan from './pages/governance/ActionPlan'

// Finance Pages
import Reconciliation from './pages/finance/Reconciliation'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>
        
        {/* Dashboard Routes */}
        <Route element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/members/:id" element={<MemberDetails />} />
          <Route path="/contributions" element={<Contributions />} />
          <Route path="/contributions/:id" element={<ContributionDetails />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/loans/apply" element={<LoanApplication />} />
          <Route path="/loans/:id" element={<LoanDetails />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/fines" element={<Fines />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<AdminSettings />} />
          {/* Governance Routes */}
          <Route path="/governance/members" element={<GroupMembers />} />
          <Route path="/governance/meetings" element={<Meetings />} />
          <Route path="/governance/resolutions" element={<BoardResolutions />} />
          <Route path="/governance/action-plan" element={<ActionPlan />} />
          {/* Finance Routes */}
          <Route path="/finance/reconciliation" element={<Reconciliation />} />
        </Route>
        
        {/* Redirect root to dashboard or login */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App
