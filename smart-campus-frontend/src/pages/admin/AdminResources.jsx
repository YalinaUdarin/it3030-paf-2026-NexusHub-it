import { useState, useEffect } from 'react'
import { resourceApi } from '../../api'
import StatusBadge from '../../components/StatusBadge'
import toast from 'react-hot-toast'
import { HiPlus, HiPencil, HiTrash, HiX } from 'react-icons/hi'

const TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT']
const STATUSES = ['ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE']
const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

const empty = { name: '', type: 'LECTURE_HALL', capacity: 1, location: '', description: '', status: 'ACTIVE', availabilityWindows: [] }

export default function AdminResources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'create' | 'edit'
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [filterType, setFilterType] = useState('')

  useEffect(() => { fetchResources() }, [filterType])

  const fetchResources = async () => {
    setLoading(true)
    try {
      const { data } = await resourceApi.getAll({ type: filterType || undefined })
      setResources(data)
    } finally { setLoading(false) }
  }

  const openCreate = () => { setForm(empty); setEditId(null); setModal('create') }
  const openEdit = (r) => {
    setForm({ name: r.name, type: r.type, capacity: r.capacity, location: r.location, description: r.description || '', status: r.status, availabilityWindows: r.availabilityWindows || [] })
    setEditId(r.id)
    setModal('edit')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (modal === 'create') {
        await resourceApi.create(form)
        toast.success('Resource created successfully')
      } else {
        await resourceApi.update(editId, form)
        toast.success('Resource updated successfully')
      }
      setModal(null)
      fetchResources()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this resource? This cannot be undone.')) return
    try {
      await resourceApi.delete(id)
      toast.success('Resource deleted')
      fetchResources()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await resourceApi.updateStatus(id, status)
      toast.success('Status updated')
      fetchResources()
    } catch { toast.error('Failed to update status') }
  }

  const addWindow = () => setForm(f => ({ ...f, availabilityWindows: [...f.availabilityWindows, { dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '17:00' }] }))
  const removeWindow = (i) => setForm(f => ({ ...f, availabilityWindows: f.availabilityWindows.filter((_, idx) => idx !== i) }))
  const updateWindow = (i, field, value) => setForm(f => ({
    ...f,
    availabilityWindows: f.availabilityWindows.map((w, idx) => idx === i ? { ...w, [field]: value } : w)
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900" style={{letterSpacing:'-0.02em'}}>Manage Resources</h2>
          <p className="text-slate-500 mt-1 text-sm">Create and manage campus facilities and assets</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <HiPlus /> Add Resource
        </button>
      </div>

      {/* Filter by type */}
      <div className="flex gap-2 flex-wrap">
        {['', ...TYPES].map(t => (
          <button key={t} onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterType === t ? 'text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-teal-300 hover:text-teal-600'}`}
                  style={filterType === t ? { background: 'linear-gradient(135deg, #0d9488, #0891b2)' } : {}}>
            {t || 'All Types'}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"/></div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Name', 'Type', 'Location', 'Capacity', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {resources.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">No resources found</td></tr>
              ) : resources.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                  <td className="px-4 py-3 text-gray-600">{r.type?.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-gray-600">{r.location}</td>
                  <td className="px-4 py-3 text-gray-600">{r.capacity}</td>
                  <td className="px-4 py-3">
                    <select value={r.status} onChange={e => handleStatusChange(r.id, e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500">
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(r)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><HiPencil /></button>
                      <button onClick={() => handleDelete(r.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><HiTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="font-bold text-gray-900 text-lg">{modal === 'create' ? 'Add New Resource' : 'Edit Resource'}</h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><HiX className="text-xl"/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Name *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" required placeholder="e.g. Lab A201" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Type *</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input">
                    {TYPES.map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Capacity *</label>
                  <input type="number" min={1} value={form.capacity} onChange={e => setForm({...form, capacity: parseInt(e.target.value)})} className="input" required />
                </div>
              </div>
              <div>
                <label className="label">Location *</label>
                <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="input" required placeholder="e.g. Block A, Floor 2" />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="input resize-none" placeholder="Optional description..." />
              </div>
              <div>
                <label className="label">Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Availability windows */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0">Availability Windows</label>
                  <button type="button" onClick={addWindow} className="text-xs text-blue-600 hover:underline">+ Add Window</button>
                </div>
                {form.availabilityWindows.map((w, i) => (
                  <div key={i} className="flex gap-2 mb-2 items-center">
                    <select value={w.dayOfWeek} onChange={e => updateWindow(i, 'dayOfWeek', e.target.value)} className="input flex-1 text-xs">
                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <input type="time" value={w.startTime} onChange={e => updateWindow(i, 'startTime', e.target.value)} className="input w-24 text-xs" />
                    <span className="text-gray-400 text-xs">to</span>
                    <input type="time" value={w.endTime} onChange={e => updateWindow(i, 'endTime', e.target.value)} className="input w-24 text-xs" />
                    <button type="button" onClick={() => removeWindow(i)} className="text-red-400 hover:text-red-600"><HiX /></button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? 'Saving...' : modal === 'create' ? 'Create Resource' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
