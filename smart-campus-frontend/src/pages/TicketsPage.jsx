import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ticketApi } from '../api'
import StatusBadge from '../components/StatusBadge'
import toast from 'react-hot-toast'
import { HiTicket, HiX } from 'react-icons/hi'
import { formatDistanceToNow } from 'date-fns'

const CATEGORIES = ['ELECTRICAL', 'PLUMBING', 'IT_EQUIPMENT', 'HVAC', 'FURNITURE', 'SAFETY', 'OTHER']
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const priorityColor = { LOW: 'text-green-600', MEDIUM: 'text-yellow-600', HIGH: 'text-orange-600', CRITICAL: 'text-red-600' }

export default function TicketsPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState({ title: '', description: '', category: 'IT_EQUIPMENT', priority: 'MEDIUM', location: '', contactPhone: '' })
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchTickets() }, [filter])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const { data } = await ticketApi.getAll({ status: filter || undefined })
      setTickets(data)
    } finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (files.length > 3) { toast.error('Max 3 attachments'); return }
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('ticket', new Blob([JSON.stringify(form)], { type: 'application/json' }))
      files.forEach(f => fd.append('attachments', f))
      await ticketApi.create(fd)
      toast.success('Ticket submitted successfully!')
      setShowForm(false)
      setForm({ title: '', description: '', category: 'IT_EQUIPMENT', priority: 'MEDIUM', location: '', contactPhone: '' })
      setFiles([])
      fetchTickets()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit ticket')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900" style={{letterSpacing:'-0.02em'}}>Incident Tickets</h2>
          <p className="text-slate-500 mt-1 text-sm">Report and track maintenance issues</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">+ Report Incident</button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === s ? 'text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-teal-300 hover:text-teal-600'}`}
                  style={filter === s ? { background: 'linear-gradient(135deg, #0d9488, #0891b2)' } : {}}>
            {s ? s.replace('_', ' ') : 'All'}
          </button>
        ))}
      </div>

      {/* Create ticket modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="font-bold text-gray-900 text-lg">Report Incident</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><HiX className="text-xl"/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Title *</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                       placeholder="Brief description of the issue" className="input" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Category *</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Priority *</label>
                  <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="input">
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Location</label>
                <input value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                       placeholder="e.g. Building A, Room 204" className="input" />
              </div>
              <div>
                <label className="label">Description *</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                          rows={4} placeholder="Describe the issue in detail..." className="input resize-none" required />
              </div>
              <div>
                <label className="label">Contact Phone</label>
                <input value={form.contactPhone} onChange={e => setForm({...form, contactPhone: e.target.value})}
                       placeholder="+94 77 000 0000" className="input" />
              </div>
              <div>
                <label className="label">Attachments (max 3 images)</label>
                <input type="file" accept="image/*" multiple
                       onChange={e => setFiles(Array.from(e.target.files).slice(0, 3))}
                       className="input" />
                {files.length > 0 && <p className="text-xs text-gray-500 mt-1">{files.length} file(s) selected</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tickets list */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"/></div>
      ) : tickets.length === 0 ? (
        <div className="card text-center py-12">
          <HiTicket className="text-5xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No tickets found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(t => (
            <Link key={t.id} to={`/tickets/${t.id}`} className="card flex items-start justify-between hover:shadow-md transition-shadow">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{t.title}</h3>
                  <StatusBadge status={t.status} />
                  <span className={`text-xs font-semibold ${priorityColor[t.priority]}`}>● {t.priority}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{t.category?.replace('_', ' ')} {t.location && `· 📍 ${t.location}`}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}</p>
              </div>
              <span className="text-xs text-gray-400 ml-4 whitespace-nowrap">{t.comments?.length || 0} comments</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
