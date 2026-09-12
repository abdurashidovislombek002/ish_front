import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import useAuthStore from '../store/useAuthStore'

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-primary-50 text-primary-600'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const links = user
    ? user.role === 'company_owner'
      ? [
          { to: '/dashboard', label: 'Dashboard' },
        ]
      : [
          { to: '/', label: 'Vakansiyalar' },
          { to: '/my-applications', label: 'Mening arizalarim' },
        ]
    : []

  return (
    <nav className="bg-white/90 backdrop-blur sticky top-0 z-40 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={user ? (user.role === 'company_owner' ? '/dashboard' : '/') : '/'} className="flex items-center gap-2 group">
            <span className="w-9 h-9 rounded-xl btn-primary flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform">IT</span>
            <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">IshTopish.uz</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={navLinkClass} end>
                {l.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                  {user.role === 'company_owner' ? '🏢 Kompaniya egasi' : '👤 Qidiruvchi'}
                </span>
                <span className="text-sm font-medium text-slate-700">{user.name || user.companyName || user.email}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Chiqish
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors">
                  Kirish
                </Link>
                <Link to="/register" className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold text-white">
                  Ro'yxatdan o'tish
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setOpen(!open)}>
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={navLinkClass} end onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {user ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{user.name || user.companyName || user.email}</span>
                  <button onClick={handleLogout} className="text-sm font-medium text-red-500">Chiqish</button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-center px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700" onClick={() => setOpen(false)}>
                    Kirish
                  </Link>
                  <Link to="/register" className="text-center btn-primary px-4 py-2 rounded-lg text-sm font-semibold text-white" onClick={() => setOpen(false)}>
                    Ro'yxatdan o'tish
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}