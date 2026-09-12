import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useAuthStore from '../store/useAuthStore'
import { Input, Select, FileInput } from '../components/form'
import ErrorMessage from '../components/ErrorMessage'
import LoadingSpinner from '../components/LoadingSpinner'

const skillSuggestions = [
  'Sotuv', 'Marketing', 'IT', 'Dasturlash', 'Hisob-kitob',
  'Haydovchilik', 'Tikuvchilik', 'Pazandachilik', 'Qurilish',
  'O\'chirish', 'Bog\'bonlik', 'Sartaroshlik', 'Ta\'mirlash', 'Boshqa',
]

export default function RegisterPage() {
  const { register, loading, error, clearError } = useAuthStore()
  const navigate = useNavigate()
  const [step, setStep] = useState('type')
  const [role, setRole] = useState('')
  const [companies, setCompanies] = useState([])
  const [companyMode, setCompanyMode] = useState('select')
  const [companiesLoading, setCompaniesLoading] = useState(false)

  const [seekForm, setSeekForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    skills: [],
  })
  const [skillInput, setSkillInput] = useState('')

  const [companyForm, setCompanyForm] = useState({
    ownerName: '',
    companyId: '',
    companyName: '',
    industry: '',
    address: '',
    email: '',
    password: '',
  })

  const loadCompanies = async () => {
    if (companies.length) return
    setCompaniesLoading(true)
    try {
      const { data } = await api.get('/companies')
      setCompanies(Array.isArray(data) ? data : data?.companies || [])
    } catch {
      setCompanies([])
    } finally {
      setCompaniesLoading(false)
    }
  }

  const selectType = (t) => {
    setRole(t)
    clearError()
    setStep('form')
    if (t === 'company') loadCompanies()
  }

  const toggleSkill = (skill) => {
    setSeekForm((f) => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter((s) => s !== skill)
        : [...f.skills, skill],
    }))
  }

  const handleSubmitSeeker = async (e) => {
    e.preventDefault()
    clearError()
    try {
      const payload = new FormData()
      if (seekForm.cv) payload.append('cv', seekForm.cv)
      payload.append('role', 'seeker')
      payload.append('name', `${seekForm.firstName} ${seekForm.lastName}`.trim())
      payload.append('firstName', seekForm.firstName)
      payload.append('lastName', seekForm.lastName)
      payload.append('phone', seekForm.phone)
      payload.append('email', seekForm.email)
      payload.append('password', seekForm.password)
      payload.append('skills', JSON.stringify(seekForm.skills))

      await register(payload)
      navigate('/', { replace: true })
    } catch (err) {}
  }

  const handleSubmitCompany = async (e) => {
    e.preventDefault()
    clearError()
    try {
      const payload = {
        role: 'company_owner',
        name: companyForm.ownerName.trim(),
        email: companyForm.email,
        password: companyForm.password,
        companyId: companyMode === 'select' ? companyForm.companyId : null,
        company: companyMode === 'create' ? {
          name: companyForm.companyName,
          industry: companyForm.industry,
          address: companyForm.address,
        } : null,
      }
      await register(payload)
      navigate('/dashboard', { replace: true })
    } catch (err) {}
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-slate-50 to-primary-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <span className="inline-flex w-14 h-14 rounded-2xl btn-primary items-center justify-center text-white font-bold text-2xl mb-3">IT</span>
          <h1 className="text-2xl font-bold text-slate-900">Ro'yxatdan o'tish</h1>
          <p className="text-sm text-slate-500 mt-1">Hisob yarating va ish toping yoki xodim qidiring</p>
        </div>

        {step === 'type' && (
          <div className="grid sm:grid-cols-2 gap-4 animate-slide-up max-w-lg mx-auto">
            <button
              onClick={() => selectType('seeker')}
              className="group bg-white rounded-2xl shadow-lg p-8 text-left hover:shadow-xl transition-all card-hover border-2 border-transparent hover:border-primary-500"
            >
              <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Ish qidiruvchiman</h3>
              <p className="text-sm text-slate-500">Ish qidiryabman, CV joylash, ariza berish</p>
            </button>

            <button
              onClick={() => selectType('company')}
              className="group bg-white rounded-2xl shadow-lg p-8 text-left hover:shadow-xl transition-all card-hover border-2 border-transparent hover:border-primary-500"
            >
              <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Kompaniya egasiman</h3>
              <p className="text-sm text-slate-500">E'lon joylash, nomzodlarni qabul qilish</p>
            </button>
          </div>
        )}

        {step === 'form' && role === 'seeker' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-slide-up">
            <button onClick={() => setStep('type')} className="text-sm text-slate-500 hover:text-slate-700 mb-4 flex items-center gap-1">
              ← Orqaga
            </button>
            <form onSubmit={handleSubmitSeeker} className="space-y-5">
              {error && <ErrorMessage message={error} />}
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Ism" name="firstName" required placeholder="Ismingiz" value={seekForm.firstName} onChange={(e) => setSeekForm({ ...seekForm, firstName: e.target.value })} />
                <Input label="Familiya" name="lastName" required placeholder="Familiyangiz" value={seekForm.lastName} onChange={(e) => setSeekForm({ ...seekForm, lastName: e.target.value })} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Telefon" name="phone" required placeholder="+998 90 123 45 67" value={seekForm.phone} onChange={(e) => setSeekForm({ ...seekForm, phone: e.target.value })} />
                <Input label="Email" name="email" type="email" required placeholder="siz@example.com" value={seekForm.email} onChange={(e) => setSeekForm({ ...seekForm, email: e.target.value })} />
              </div>
              <Input label="Parol" name="password" type="password" required placeholder="••••••••" value={seekForm.password} onChange={(e) => setSeekForm({ ...seekForm, password: e.target.value })} />
              <FileInput
                label="CV/Rezyume (ixtiyoriy)"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setSeekForm({ ...seekForm, cv: e.target.files?.[0] })}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Ko'nikmalar (skills)</label>
                <div className="flex flex-wrap gap-2">
                  {skillSuggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSkill(s)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        seekForm.skills.includes(s)
                          ? 'bg-primary-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-primary-50 hover:text-primary-600'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                    placeholder="Yangi ko'nikma qo'shish..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const s = skillInput.trim()
                      if (s && !seekForm.skills.includes(s)) {
                        setSeekForm((f) => ({ ...f, skills: [...f.skills, s] }))
                      }
                      setSkillInput('')
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-sm font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  >
                    +
                  </button>
                </div>
                {seekForm.skills.length > 0 && (
                  <div className="pt-1 flex flex-wrap gap-1.5">
                    {seekForm.skills.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-medium">
                        {s}
                        <button type="button" onClick={() => toggleSkill(s)} className="hover:text-primary-800">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading} className="w-full btn-primary py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60">
                {loading ? 'Ro\'yxatdan o\'tilmoqda...' : 'Ro\'yxatdan o\'tish'}
              </button>
            </form>
          </div>
        )}

        {step === 'form' && role === 'company' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-slide-up">
            <button onClick={() => setStep('type')} className="text-sm text-slate-500 hover:text-slate-700 mb-4 flex items-center gap-1">
              ← Orqaga
            </button>
            <form onSubmit={handleSubmitCompany} className="space-y-5">
              {error && <ErrorMessage message={error} />}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-slate-700">Kompaniya ma'lumoti</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCompanyMode('select')}
                    className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-colors ${
                      companyMode === 'select'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    Mavjud kompaniyadan tanlash
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompanyMode('create')}
                    className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-colors ${
                      companyMode === 'create'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    Yangi kompaniya yaratish
                  </button>
                </div>
              </div>

              {companyMode === 'select' && (
                <div className="animate-fade-in">
                  {companiesLoading ? (
                    <LoadingSpinner text="Kompaniyalar yuklanmoqda..." />
                  ) : companies.length === 0 ? (
                    <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-500">
                      Kompaniyalar topilmadi. Yangi kompaniya yarating.
                    </div>
                  ) : (
                    <Select
                      label="Kompaniyani tanlang"
                      value={companyForm.companyId}
                      required
                      onChange={(e) => setCompanyForm({ ...companyForm, companyId: e.target.value })}
                    >
                      <option value="">Tanlang...</option>
                      {companies.map((c) => (
                        <option key={c.id || c._id} value={c.id || c._id}>
                          {c.name} {c.industry ? `— ${c.industry}` : ''}
                        </option>
                      ))}
                    </Select>
                  )}
                </div>
              )}

              {companyMode === 'create' && (
                <div className="space-y-4 animate-fade-in">
                  <Input label="Kompaniya nomi" required placeholder="Masalan: Teka Mebel" value={companyForm.companyName} onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })} />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="Sohasi" required placeholder="Masalan: Mebel ishlab chiqarish" value={companyForm.industry} onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })} />
                    <Input label="Manzili" required placeholder="Masalan: Toshkent, Chilonzor" value={companyForm.address} onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })} />
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Ism" name="ownerName" required placeholder="Eganing ismi" value={companyForm.ownerName} onChange={(e) => setCompanyForm({ ...companyForm, ownerName: e.target.value })} />
                <Input label="Email" type="email" required placeholder="kompaniya@example.com" value={companyForm.email} onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })} />
              </div>
              <Input label="Parol" type="password" name="password" required placeholder="••••••••" value={companyForm.password} onChange={(e) => setCompanyForm({ ...companyForm, password: e.target.value })} />

              <button type="submit" disabled={loading} className="w-full btn-primary py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60">
                {loading ? 'Ro\'yxatdan o\'tilmoqda...' : 'Ro\'yxatdan o\'tish'}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-sm text-slate-500 mt-6">
          Hisobingiz bormi?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
            Kirish
          </Link>
        </p>
        </div>
      </div>
  )
}