import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import useAuthStore from './store/useAuthStore'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import MyApplicationsPage from './pages/MyApplicationsPage'
import CompanyDashboardPage from './pages/CompanyDashboardPage'

function NavigateToRole() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'company' ? '/dashboard' : '/'} replace />
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute role="seeker">
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-applications"
            element={
              <ProtectedRoute role="seeker">
                <MyApplicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="company">
                <CompanyDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NavigateToRole />} />
        </Routes>
      </main>
    </div>
  )
}