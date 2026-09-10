import { useState } from 'react'
import api from '../api/axios'
import Modal from './Modal'
import { Input, Textarea } from './form'
import ErrorMessage from './ErrorMessage'

export default function ApplyModal({ open, onClose, job, onApplied }) {
  const [coverLetter, setCoverLetter] = useState('')
  const [cvFile, setCvFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      const payload = new FormData()
      payload.append('jobId', job.id || job._id)
      if (coverLetter.trim()) payload.append('coverLetter', coverLetter)
      if (cvFile) payload.append('cv', cvFile)

      await api.post('/apply', payload)
      setSuccess(true)
      setCoverLetter('')
      setCvFile(null)
      onApplied?.()
    } catch (err) {
      setError(err.response?.data?.message || 'Ariza yuborishda xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    setSuccess(false)
    setError('')
    setCoverLetter('')
    setCvFile(null)
  }

  return (
    <Modal open={open} onClose={handleClose} title="💼 Ariza berish">
      {success && (
        <div className="space-y-4 animate-scale-in">
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="font-semibold text-green-800">Arizangiz yuborildi!</h4>
            <p className="text-sm text-green-600 mt-1">
              "{job?.title}" — kompaniya ko'rib chiqayotganda javobni kuting.
            </p>
          </div>
          <button onClick={handleClose} className="w-full py-2.5 rounded-xl bg-slate-100 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors">
            Yopish
          </button>
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <ErrorMessage message={error} />}
          <div className="bg-primary-50 rounded-xl p-4">
            <p className="font-semibold text-slate-900">{job?.title}</p>
            <p className="text-sm text-slate-600">{job?.company?.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Havola xati (ixtiyoriy)</label>
            <Textarea
              rows={3}
              placeholder="Nega aynan shu ishga qiziqyapsiz?"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">CV yuklash (agar profilda bo'lmasa)</label>
            <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCvFile(e.target.files?.[0])} />
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60">
            {loading ? 'Yuborilmoqda...' : 'Arizani tasdiqlash'}
          </button>
        </form>
      )}
    </Modal>
  )
}