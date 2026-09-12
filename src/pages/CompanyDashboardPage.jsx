import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import useAuthStore from '../store/useAuthStore'
import CompanyJobFormModal from '../components/CompanyJobFormModal'
import WorkersModal from '../components/WorkersModal'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

const CV_BASE = '/uploads/cvs/'

const emptyJob = {
  id: null,
  applications: [],
  computedRole: null,
}

export default function CompanyDashboardPage() {
  const { user, logout } = useAuthStore()
  const [jobs, setJobs] = useState([])
  const [roles, setRoles] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [selectedJob, setSelectedJob] = useState(emptyJob)
  const [loading, setLoading] = useState(true)
  const [workersCount, setWorkersCount] = useState(0)
  const [workers, setWorkers] = useState([])
  const [workersLoading, setWorkersLoading] = useState(false)
  const [showWorkers, setShowWorkers] = useState(false)
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [roleSelections, setRoleSelections] = useState({})
  const [successMsg, setSuccessMsg] = useState('')

  const loadJobs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/my-jobs')
      setJobs(Array.isArray(data) ? data : data.jobs || [])
    } catch (err) {
      setError(err.response?.data?.message || "E'lonlarni yuklashda xatolik")
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMeta = useCallback(async () => {
    const [rolesRes, catRes, workersRes] = await Promise.allSettled([
      api.get('/roles'),
      api.get('/categories'),
      api.get('/my-workers'),
    ])
    if (rolesRes.status === 'fulfilled') {
      const r = rolesRes.value.data
      setRoles(Array.isArray(r) ? r : r.roles || [])
    }
    if (catRes.status === 'fulfilled') {
      const c = catRes.value.data
      const list = Array.isArray(c) ? c : c.categories || []
      setCategories(list.map((x) => (typeof x === 'string' ? x : x.name)).filter(Boolean))
    }
    if (workersRes.status === 'fulfilled') {
      const w = workersRes.value.data
      setWorkersCount(Number(w?.count || 0))
      setWorkers(Array.isArray(w?.workers) ? w.workers : [])
    }
  }, [])

  useEffect(() => {
    loadJobs()
    loadMeta()
  }, [loadJobs, loadMeta])

  const loadApplications = useCallback(
    async (job) => {
      if (!job) return
      setApplicationsLoading(true)
      setActionError('')
      try {
        const { data } = await api.get(`/applications?jobId=${job.id || job._id}`)
        const applications = Array.isArray(data) ? data : data.applications || []
        setSelectedJob({ ...job, applications })
        setSelectedJobId(job.id || job._id)
      } catch (err) {
        setActionError(err.response?.data?.message || 'Arizalarni yuklashda xatolik')
      } finally {
        setApplicationsLoading(false)
      }
    },
    []
  )

  const handleSelectJob = (job) => {
    if (selectedJobId === (job.id || job._id)) {
      setSelectedJob(emptyJob)
      setSelectedJobId(null)
      return
    }
    loadApplications(job)
  }

  const handleRoleChange = async (applicationId, roleName) => {
    setRoleSelections((prev) => ({ ...prev, [applicationId]: roleName }))
  }

  const handleRoleApply = async (applicationId) => {
    const roleName = roleSelections[applicationId]
    if (!roleName) return
    setActionError('')
    try {
      await api.post(`/applications/${applicationId}/role`, { role: roleName })
      setSuccessMsg('Rol muvaffaqiyatli tayinlandi')
      setTimeout(() => setSuccessMsg(''), 3000)
      loadApplications(selectedJob)
    } catch (err) {
      setActionError(err.response?.data?.message || 'Rol tayinlashda xatolik')
    }
  }

  const handleStatus = async (applicationId, status) => {
    setActionError('')
    setSuccessMsg('')
    try {
      await api.post(`/applications/${applicationId}/${status}`)
      setSuccessMsg(status === 'accept' ? 'Nomzod qabul qilindi' : 'Nomzod rad etildi')
      setTimeout(() => setSuccessMsg(''), 3000)
      loadApplications(selectedJob)
      loadJobs()
    } catch (err) {
      setActionError(err.response?.data?.message || 'Amal bajarilmadi')
    }
  }

  const totalApplications = jobs.reduce(
    (sum, j) => sum + (Number(j.applicationsCount || j.applications?.length || 0)),
    0
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-xl">
                {(user?.companyName || 'C')[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {user?.companyName || 'Kompaniya paneli'}
                </h1>
                <p className="text-primary-100 text-sm">
                  {jobs.length} ta e'lon • {totalApplications} ta ariza • {workersCount} ta ishchi
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowWorkers(true)
                  setWorkersLoading(true)
                  api.get('/my-workers')
                    .then(({ data }) => {
                      setWorkers(Array.isArray(data?.workers) ? data.workers : [])
                      setWorkersCount(Number(data?.count || 0))
                    })
                    .catch(() => setWorkers([]))
                    .finally(() => setWorkersLoading(false))
                }}
                className="bg-white/20 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-white/30 transition-colors"
              >
                👥 Ishchilar ({workersCount})
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="bg-white text-primary-600 font-semibold px-5 py-2.5 rounded-xl text-sm hover:shadow-lg transition-shadow"
              >
                ➕ Yangi e'lon
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid sm:grid-cols-3 gap-4 -mt-6 mb-8 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-3xl font-bold text-primary-600">{jobs.length}</p>
            <p className="text-sm text-slate-500 mt-1">Ta e'lon</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-3xl font-bold text-amber-500">{totalApplications}</p>
            <p className="text-sm text-slate-500 mt-1">Ta ariza</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-3xl font-bold text-green-600">{workersCount}</p>
            <p className="text-sm text-slate-500 mt-1">Ta ishchi</p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 animate-fade-in flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            {successMsg}
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-8">
          {/* Jobs list */}
          <div>
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center justify-between">
              <span>Ish e'lonlarim</span>
              <span className="text-xs font-normal text-slate-400">{jobs.length} ta</span>
            </h2>

            {error && <ErrorMessage message={error} />}

            {loading ? (
              <LoadingSpinner text="E'lonlar yuklanmoqda..." />
            ) : jobs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                <p className="font-medium text-slate-600">Hali e'lon joylagan emassiz</p>
                <button onClick={() => setShowForm(true)} className="mt-4 btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold text-white">
                  Birinchi e'lonni joylash
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => {
                  const appCount = Number(job.applicationsCount || job.applications?.length || 0)
                  const isSelected = selectedJobId === (job.id || job._id)
                  return (
                    <div
                      key={job.id || job._id}
                      onClick={() => handleSelectJob(job)}
                      className={`bg-white rounded-2xl p-5 shadow-sm cursor-pointer transition-all card-hover border-2 ${
                        isSelected ? 'border-primary-500 shadow-lg' : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold text-slate-900">{job.title}</h3>
                        {appCount > 0 && (
                          <span className="shrink-0 px-2.5 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-semibold">
                            {appCount} ta ariza
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-500">
                        {job.location && <span>📍 {job.location}</span>}
                        {job.category && <span className="px-2 py-0.5 rounded-full bg-slate-100">{job.category}</span>}
                        {job.salaryMin && (
                          <span className="font-medium text-primary-600">
                            💰 {Number(job.salaryMin).toLocaleString('ru-RU')}{job.salaryMax ? ` – ${Number(job.salaryMax).toLocaleString('ru-RU')}` : ''} so'm
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Applications for selected job */}
          <div>
            {actionError && <ErrorMessage message={actionError} />}

            {!selectedJob.id ? (
              <div className="bg-white rounded-2xl shadow-sm p-10 text-center h-full flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
                <p className="font-medium text-slate-600">Nomzodlarni ko'rish uchun e'lon tanlang</p>
                <p className="text-sm text-slate-400 mt-1">Chapdagi ro'yxatdan ish e'lonini bosing</p>
              </div>
            ) : applicationsLoading ? (
              <LoadingSpinner text="Arizalar yuklanmoqda..." />
            ) : selectedJob.applications.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                <p className="font-medium text-slate-600">Bu e'longa hali ariza kelmagan</p>
                <p className="text-sm text-slate-400 mt-1">Nomzodlar ariza yuborganda shu yerda ko'rinadi</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="font-semibold text-slate-900">
                  Nomzodlar — <span className="text-primary-600">{selectedJob.title}</span>
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    {selectedJob.applications.length} ta ariza
                  </span>
                </h2>
                {selectedJob.applications.map((app) => (
                  <ApplicationCard
                    key={app.id || app._id}
                    app={app}
                    roles={roles}
                    roleValue={roleSelections[app.id || app._id] || app.role || ''}
                    onRoleChange={handleRoleChange}
                    onRoleApply={handleRoleApply}
                    onStatusChange={handleStatus}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CompanyJobFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onSaved={loadJobs}
        categories={categories}
      />

      <WorkersModal
        open={showWorkers}
        onClose={() => setShowWorkers(false)}
        workers={workers}
        loading={workersLoading}
      />
    </div>
  )
}

function ApplicationCard({ app, roles, roleValue, onRoleChange, onRoleApply, onStatusChange }) {
  const applicant = app.applicant || app.seeker || {}
  const name = applicant.name || `${applicant.firstName || ''} ${applicant.lastName || ''}`.trim() || 'Noma\'lum nomzod'
  const status = app.status

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden card-hover animate-fade-in">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-bold shrink-0">
              {name[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-slate-900 truncate">{name}</h4>
              <p className="text-sm text-slate-500 truncate">{applicant.email}</p>
            </div>
          </div>
          <span className={`shrink-0 px-2.5 py-1 rounded-full border text-xs font-medium ${
            status === 'accepted' || status === 'approved'
              ? 'bg-green-50 text-green-600 border-green-200'
              : status === 'rejected'
                ? 'bg-red-50 text-red-600 border-red-200'
                : 'bg-amber-50 text-amber-600 border-amber-200'
          }`}>
            {status === 'accepted' || status === 'approved' ? 'Qabul qilindi' : status === 'rejected' ? 'Rad etildi' : 'Kutilmoqda'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-600">
          {applicant.phone && (
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h.372c.86 0 1.44.87 1.2 1.72l-.66 2.31a2 2 0 01-1.5 1.34 15 15 0 007.24 7.24 2 2 0 001.34-1.5l2.31-.66a2 2 0 001.72 1.2V19a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
              </svg>
              {applicant.phone}
            </span>
          )}
          {app.cvUrl && (
            <a
              href={CV_BASE + app.cvUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CV ni ko'rish
            </a>
          )}
        </div>

        {applicant.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {applicant.skills.map((s) => (
              <span key={s} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs">{s}</span>
            ))}
          </div>
        )}

        {app.coverLetter && (
          <div className="mt-3 bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
            {app.coverLetter}
          </div>
        )}

        {app.role && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-50 text-xs">
            <span className="font-medium text-slate-500">Rol:</span>
            <span className="font-semibold text-primary-700">{app.role}</span>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          <div className="flex gap-2">
            <select
              disabled={status === 'rejected'}
              value={roleValue}
              onChange={(e) => onRoleChange(app.id || app._id, e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white"
            >
              <option value="">
                {roles.length ? 'Rol tanlang...' : 'Rollar yuklanmoqda...'}
              </option>
              {roles.map((r) => {
                const label = typeof r === 'string' ? r : r.name
                return <option key={label} value={label}>{label}</option>
              })}
            </select>
            <button
              onClick={() => onRoleApply(app.id || app._id)}
              disabled={!roleValue || status === 'rejected'}
              className="px-4 py-2 rounded-xl bg-primary-50 text-primary-600 text-sm font-semibold hover:bg-primary-100 disabled:opacity-40 transition-colors"
            >
              🏷 Rol qo'yish
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onStatusChange(app.id || app._id, 'accept')}
              disabled={status === 'accepted' || status === 'approved' || status === 'rejected'}
              className="flex-1 py-2 rounded-xl bg-green-50 text-green-600 text-sm font-semibold hover:bg-green-100 disabled:opacity-40 transition-colors"
            >
              ✓ Qabul qilish
            </button>
            <button
              onClick={() => onStatusChange(app.id || app._id, 'reject')}
              disabled={status === 'rejected'}
              className="flex-1 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 disabled:opacity-40 transition-colors"
            >
              ✕ Rad etish
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}