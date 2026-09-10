import { useState } from 'react'
import api from '../api/axios'
import Modal from './Modal'
import { Input, Textarea, Select } from './form'
import ErrorMessage from './ErrorMessage'

export default function CompanyJobFormModal({ open, onClose, onSaved, categories }) {
  const [form, setForm] = useState({
    title: '',
    category: categories[0] || '',
    description: '',
    requirements: '',
    salaryMin: '',
    salaryMax: '',
    location: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/jobs', {
        title: form.title,
        category: form.category,
        description: form.description,
        requirements: form.requirements,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
        location: form.location,
      })
      setForm({
        title: '',
        category: categories[0] || '',
        description: '',
        requirements: '',
        salaryMin: '',
        salaryMax: '',
        location: '',
      })
      onSaved()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || "E'lon qo'shishda xatolik")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="➕ Yangi ish e'loni" width="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorMessage message={error} />}
        <Input
          label="Lavozim nomi"
          required
          placeholder="Masalan: Dasturchi (Python)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <Select
            label="Kategoriya"
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Tanlang...</option>
            {(categories.length ? categories : ['IT', 'Sotuv', 'Marketing', 'Ishlab chiqarish', 'Xizmat ko\'rsatish', 'Qurilish']).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
          <Input
            label="Joylashuv"
            required
            placeholder="Toshkent, Chilonzor"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>
        <Textarea
          label="Tavsif"
          required
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Ishning mohiyati, vazifalar..."
        />
        <Textarea
          label="Talablar"
          value={form.requirements}
          onChange={(e) => setForm({ ...form, requirements: e.target.value })}
          placeholder="Nomzodga qo'yiladigan talablar..."
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Maosh (min, so'm)"
            type="number"
            placeholder="3000000"
            value={form.salaryMin}
            onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
          />
          <Input
            label="Maosh (max, so'm)"
            type="number"
            placeholder="5000000"
            value={form.salaryMax}
            onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
          />
        </div>
        <button type="submit" disabled={loading} className="w-full btn-primary py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60">
          {loading ? 'Saqlanmoqda...' : "E'loni joylash"}
        </button>
      </form>
    </Modal>
  )
}