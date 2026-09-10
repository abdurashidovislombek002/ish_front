import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-600 border-amber-200',
  accepted: 'bg-green-50 text-green-600 border-green-200',
  approved: 'bg-green-50 text-green-600 border-green-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
  registered: 'bg-blue-50 text-blue-600 border-blue-200',
}

const STATUS_LABELS = {
  pending: 'Kutilmoqda',
  accepted: 'Qabul qilindi',
  approved: 'Qabul qilindi',
  rejected: 'Rad etildi',
  registered: "Ro'yxatga olindi",
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/my-applications')
      setApplications(Array.isArray(data) ? data : data.applications || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Arizalaringizni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const statusClass = (s) => STATUS_STYLES[s] || 'bg-slate-50 text-slate-600 border-slate-200'
  const statusLabel = (s) => STATUS_LABELS[s] || s

  const activeCount = applications.filter(
    (a) => a.status === 'pending' || a.status === 'registered'
  ).length

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Mening arizalarim</h1>
          <p className="text-primary-100 mt-1">
            {applications.length} ta ariza {activeCount > 0 && `• ${activeCount} tasi kun-mos`}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <ErrorMessage message={error} />}

        {loading ? (
          <LoadingSpinner text="Arizalar yuklanmoqda..." />
        ) : applications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="inline-flex w-16 h-16 rounded-full bg-primary-50 items-center justify-center mb-4">
              <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="font-medium text-slate-600">Hali ariza yubormagansiz</p>
            <p className="text-sm text-slate-400 mt-1">Vakansiyalar sahifasidan ish tanlab ariza yuboring</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const job = app.job || {}
              const company = job.company || app.company || {}
              return (
                <div key={app.id || app._id} className="bg-white rounded-2xl shadow-md overflow-hidden card-hover">
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold shrink-0">
                          {(company.name || 'C')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">{job.title || 'Vakansiya'}</h3>
                          <p className="text-sm text-slate-500 truncate">{company.name}</p>
                        </div>
                      </div>
                      <span className={`shrink-0 px-3 py-1 rounded-full border text-xs font-medium ${statusClass(app.status)}`}>
                        {statusLabel(app.status)}
                      </span>
                    </div>

                    {app.role && (
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-50 text-xs">
                        <span className="font-medium text-slate-500">Tayinlangan rol:</span>
                        <span className="font-semibold text-primary-700">{app.role}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-400">
                      {job.location && (
                        <span className="inline-flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {job.location}
                        </span>
                      )}
                      <span>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('uz-UZ') : ''}</span>
                    </div>

                    {app.coverLetter && (
                      <div className="mt-3 bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
                        {app.coverLetter}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}