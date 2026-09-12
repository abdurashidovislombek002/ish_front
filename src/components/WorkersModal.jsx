import Modal from './Modal'
import LoadingSpinner from './LoadingSpinner'

export default function WorkersModal({ open, onClose, workers, loading }) {
  return (
    <Modal open={open} onClose={onClose} title="🏢 Mening ishchilarim" width="max-w-2xl">
      {loading ? (
        <LoadingSpinner text="Ishchilar yuklanmoqda..." />
      ) : workers.length === 0 ? (
        <div className="text-center py-14">
          <div className="inline-flex w-14 h-14 rounded-full bg-primary-50 items-center justify-center mb-3">
            <svg className="w-7 h-7 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="font-medium text-slate-600">Hali ishchi yo'q</p>
          <p className="text-sm text-slate-400 mt-1">Nomzodlarni qabul qilganingizda shu yerda ko'rinadi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workers.map((w) => (
            <div key={w.id} className="bg-white rounded-2xl border border-slate-100 p-4 card-hover">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold shrink-0">
                    {(w.name || 'I')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-900 truncate">{w.name}</h4>
                    <p className="text-sm text-slate-500 truncate">{w.email}</p>
                  </div>
                </div>
                {w.jobTitle && (
                  <span className="shrink-0 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                    {w.jobTitle}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-600">
                {w.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h.372c.86 0 1.44.87 1.2 1.72l-.66 2.31a2 2 0 01-1.5 1.34 15 15 0 007.24 7.24 2 2 0 001.34-1.5l2.31-.66a2 2 0 001.72 1.2V19a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                    </svg>
                    {w.phone}
                  </span>
                )}
                {w.role && (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-primary-50 text-primary-600 text-xs font-semibold">
                      Rol: {w.role}
                    </span>
                  </span>
                )}
              </div>

              {w.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {w.skills.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs">{s}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}