export default function JobCard({ job, onApply, alreadyApplied }) {
  const salaryText = job.salaryMin && job.salaryMax
    ? `${Number(job.salaryMin).toLocaleString('ru-RU')} – ${Number(job.salaryMax).toLocaleString('ru-RU')} so'm`
    : (job.salaryMin ? `${Number(job.salaryMin).toLocaleString('ru-RU')} so'm` : 'Muzokara asosida')

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden card-hover animate-fade-in">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg shrink-0">
              {(job.company?.name || 'C')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">{job.title}</h3>
              <p className="text-sm text-slate-500 truncate">{job.company?.name}</p>
            </div>
          </div>
          <span className="shrink-0 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-medium">
            {job.category}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {job.location}
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-primary-600">
            <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            {salaryText}
          </span>
        </div>

        <p className="mt-4 text-sm text-slate-600 line-clamp-3">{job.description}</p>

        <div className="flex items-center justify-between mt-5">
          <span className="text-xs text-slate-400">{job.postedDate || 'Yangi e\'lon'}</span>
          <button
            onClick={onApply}
            disabled={alreadyApplied}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              alreadyApplied
                ? 'bg-green-100 text-green-600 cursor-default'
                : 'btn-primary text-white'
            }`}
          >
            {alreadyApplied ? '✓ Ariza yuborilgan' : 'Ariza berish'}
          </button>
        </div>
      </div>
    </div>
  )
}