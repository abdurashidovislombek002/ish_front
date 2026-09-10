import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import { Input } from '../components/form'
import ErrorMessage from '../components/ErrorMessage'

export default function LoginPage() {
  const { login, loading, error, clearError } = useAuthStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    try {
      const user = await login(form.email, form.password)
      navigate(user.role === 'company' ? '/dashboard' : '/', { replace: true })
    } catch (err) {
      // error store'da saqlanadi
    }
  }

  const handleChange = (e) => {
    clearError()
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-slate-50 to-primary-100 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-slide-up">
          <span className="inline-flex w-14 h-14 rounded-2xl btn-primary items-center justify-center text-white font-bold text-2xl mb-3">IT</span>
          <h1 className="text-2xl font-bold text-slate-900">Xush kelibsiz!</h1>
          <p className="text-sm text-slate-500 mt-1">Hisobingizga kiring</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <ErrorMessage message={error} />}
            <Input
              label="Email"
              name="email"
              type="email"
              required
              placeholder="siz@example.com"
              value={form.email}
              onChange={handleChange}
            />
            <Input
              label="Parol"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Kutilmoqda...' : 'Kirish'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Hisobingiz yo'qmi?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
              Ro'yxatdan o'ting
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}