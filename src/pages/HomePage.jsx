import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import JobCard from '../components/JobCard'
import ApplyModal from '../components/ApplyModal'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

const FALLBACK_CATEGORIES = ['IT', 'Sotuv', 'Marketing', 'Ishlab chiqarish', 'Xizmat ko\'rsatish', 'Qurilish']

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || '',
  })
  const [jobs, setJobs] = useState([])
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES)
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedJob, setSelectedJob] = useState(null)
  const [appliedJobs, setAppliedJobs] = useState([])

  const loadApplied = useCallback(async () => {
    try {
      const { data } = await api.get('/my-applications')
      const list = Array.isArray(data) ? data : data.applications || []
      const jobIds = list
        .filter((a) => a.status === 'pending' || a.status === 'accepted' || a.status === 'rejected' || a.status === 'registered')
        .map((a) => a.jobId || a.job?._id)
        .filter(Boolean)
      setAppliedJobs(jobIds)
    } catch {
      setAppliedJobs([])
    }
  }, [])

  const loadJobs = useCallback(async (f) => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (f.keyword) params.append('keyword', f.keyword)
      if (f.location) params.append('location', f.location)
      if (f.category) params.append('category', f.category)

      const query = params.toString()
      const { data } = await api.get(`/jobs${query ? `?${query}` : ''}`)
      setJobs(Array.isArray(data) ? data : data.jobs || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Ish e\'lonlarini yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMeta = useCallback(async () => {
    const [catRes, locRes] = await Promise.allSettled([
      api.get('/categories'),
      api.get('/locations'),
    ])
    if (catRes.status === 'fulfilled') {
      const c = catRes.value.data
      const list = Array.isArray(c) ? c : c.categories || []
      if (list.length) setCategories(list.map((x) => (typeof x === 'string' ? x : x.name)).filter(Boolean))
    }
    if (locRes.status === 'fulfilled' && locRes.value.data) {
      const l = locRes.value.data
      const list = Array.isArray(l) ? l : l.locations || []
      setLocations(list.map((x) => (typeof x === 'string' ? x : x.name)).filter(Boolean))
    }
  }, [])

  useEffect(() => {
    loadJobs(filters)
    loadMeta()
    loadApplied()
  }, [loadJobs, loadMeta, loadApplied])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = {}
    if (filters.keyword) params.keyword = filters.keyword
    if (filters.location) params.location = filters.location
    if (filters.category) params.category = filters.category
    setSearchParams(params)
    loadJobs(filters)
  }

  const handleApply = (job) => {
    loadApplied()
    loadJobs(filters)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 pb-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">O'zingizga mos ish toping</h1>
          <p className="text-primary-100 mt-1 text-sm sm:text-base">
            Minglab kompaniyalar andozalarini ko'ring va bir zumda ariza yuboring
          </p>

          {/* Search panel */}
          <form onSubmit={handleSearch} className="mt-6 bg-white rounded-2xl shadow-xl p-4 grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 animate-slide-up">
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 focus:bg-white text-sm transition-colors"
                placeholder="Kalit so'z (masalan, doiradar)"
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              />
            </div>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 focus:bg-white text-sm transition-colors"
                placeholder="Joylashuv"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </div>
            <select
              className="w-full px-4 py-3 rounded-xl bg-slate-50 focus:bg-white text-sm text-slate-600 transition-colors"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">Barcha kategoriyalar</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button type="submit" className="btn-primary px-6 py-3 rounded-xl text-sm font-semibold text-white">
              Qidirish
            </button>
          </form>

          {locations.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-primary-100">Mashhur:</span>
              {locations.slice(0, 4).map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setFilters({ ...filters, location: l })
                    setSearchParams(l ? { location: l } : {})
                    loadJobs({ ...filters, location: l })
                  }}
                  className="px-3 py-1 rounded-full bg-white/15 text-primary-50 text-xs font-medium hover:bg-white/25 transition-colors"
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Jobs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {loading ? 'Yuklanmoqda...' : `${jobs.length} ta vakansiya`}
          </h2>
          {(filters.keyword || filters.location || filters.category) && (
            <button
              onClick={() => {
                setFilters({ keyword: '', location: '', category: '' })
                setSearchParams({})
                loadJobs({ keyword: '', location: '', category: '' })
              }}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Filtrlarni tozalash
            </button>
          )}
        </div>

        {error && <ErrorMessage message={error} />}

        {loading ? (
          <LoadingSpinner text="Vakansiyalar yuklanmoqda..." />
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex w-16 h-16 rounded-full bg-slate-100 items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="font-medium text-slate-600">Hech qanday vakansiya topilmadi</p>
            <p className="text-sm text-slate-400">Qidiruv sozlamalarini o'zgartirib ko'ring</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => (
              <JobCard
                key={job.id || job._id}
                job={job}
                alreadyApplied={appliedJobs.includes(job.id || job._id)}
                onApply={() => setSelectedJob(job)}
              />
            ))}
          </div>
        )}
      </div>

      <ApplyModal
        open={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        job={selectedJob}
        onApplied={handleApply}
      />
    </div>
  )
}