import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ticketApi, adminApi } from '../../api'
import StatusBadge from '../../components/StatusBadge'
import toast from 'react-hot-toast'
import { HiX } from 'react-icons/hi'
import { formatDistanceToNow } from 'date-fns'

const STATUSES = ['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']
const PRIORITIES = ['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const NEXT_STATUSES = { OPEN: ['IN_PROGRESS', 'REJECTED'], IN_PROGRESS: ['RESOLVED', 'REJECTED'], RESOLVED: ['CLOSED'] }
const priorityColor = { LOW: 'text-green-600', MEDIUM: 'text-yellow-600', HIGH: 'text-orange-600', CRITICAL: 'text-red-600' }

export default function AdminTickets() {
  const [tickets, setTickets] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [actionModal, setActionModal] = useState(null)
  const [actionForm, setActionForm] = useState({ status: '', resolutionNotes: '', rejectionReason: '', technicianId: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchData() }, [filterStatus, filterPriority])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [t, u] = await Promise.all([
        ticketApi.getAll({ status: filterStatus || undefined, priority: filterPriority || undefined }),
        adminApi.getUsers()
      ])
      setTickets(t.data)
      setTechnicians(u.data.filter(u => u.roles?.includes('TECHNICIAN') || u.roles?.includes('ADMIN')))
    } finally { setLoading(false) }
  }

  const handleStatusUpdate = async () => {
    setSubmitting(true)
    try {
      await ticketApi.updateStatus(actionModal.id, {
        status: actionForm.status,
        resolutionNotes: actionForm.resolutionNotes,
        rejectionReason: actionForm.rejectionReason,
      })
      toast.success('Ticket status updated')
      setActionModal(null)
      fetchData()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSubmitting(false) }
  }

  const handleAssign = async (ticketId, technicianId) => {
    if (!technicianId) return
    try {
      await ticketApi.assign(ticketId, technicianId)
      toast.success('Technician assigned')
      fetchData()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to assign') }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900" style={{letterSpacing:'-0.02em'}}>Manage Tickets</h2>
        <p className="text-slate-500 mt-1 text-sm">Assign technicians and update incident ticket statuses</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterStatus === s ? 'text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-teal-300 hover:text-teal-600'}`}
                    style={filterStatus === s ? { background: 'linear-gradient(135deg, #0d9488, #0891b2)' } : {}}>
              {s ? s.replace('_', ' ') : 'All Status'}
            </button>
          ))}
        </div>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
                className="border border-slate-200 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 focus:outline-none focus:ring-2 focus:border-teal-400 bg-white hover:border-teal-300 transition-all">
          {PRIORITIES.map(p => <option key={p} value={p}>{p || 'All Priorities'}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"/></div>
      ) : (
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <div className="card text-center py-12 text-gray-500">No tickets found</div>
          ) : tickets.map(t => (
            <div key={t.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Link to={`/tickets/${t.id}`} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">{t.title}</Link>
                    <StatusBadge status={t.status} />
                    <span className={`text-xs font-bold ${priorityColor[t.priority]}`}>● {t.priority}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{t.category?.replace('_',' ')} {t.location && `· 📍 ${t.location}`}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    By {t.reportedByName} · {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}
                    {t.assignedToName && ` · Assigned to: ${t.assignedToName}`}
                  </p>
                </div>

                <div className="flex flex-col gap-2 items-end flex-shrink-0">
                  {/* Assign technician */}
                  {(t.status === 'OPEN' || t.status === 'IN_PROGRESS') && (
                    <select onChange={e => handleAssign(t.id, e.target.value)} defaultValue=""
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44">
                      <option value="" disabled>{t.assignedToName ? `Reassign (${t.assignedToName})` : 'Assign Technician'}</option>
                      {technicians.map(tech => <option key={tech.id} value={tech.id}>{tech.name}</option>)}
                    </select>
                  )}

                  {/* Status action */}
                  {NEXT_STATUSES[t.status] && (
                    <div className="flex gap-1">
                      {NEXT_STATUSES[t.status].map(next => (
                        <button key={next}
                                onClick={() => { setActionModal({ id: t.id, currentStatus: t.status }); setActionForm({ status: next, resolutionNotes: '', rejectionReason: '', technicianId: '' }) }}
                                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${next === 'REJECTED' ? 'bg-red-50 text-red-600 hover:bg-red-100' : next === 'RESOLVED' || next === 'CLOSED' ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                          → {next.replace('_',' ')}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Update Ticket Status</h3>
              <button onClick={() => setActionModal(null)} className="text-gray-400 hover:text-gray-600"><HiX className="text-xl"/></button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Setting status to: <span className="font-semibold text-gray-900">{actionForm.status}</span></p>

            {actionForm.status === 'RESOLVED' && (
              <div className="mb-4">
                <label className="label">Resolution Notes *</label>
                <textarea value={actionForm.resolutionNotes} onChange={e => setActionForm({...actionForm, resolutionNotes: e.target.value})}
                          rows={3} placeholder="Describe how the issue was resolved..." className="input resize-none" />
              </div>
            )}
            {actionForm.status === 'REJECTED' && (
              <div className="mb-4">
                <label className="label">Rejection Reason *</label>
                <textarea value={actionForm.rejectionReason} onChange={e => setActionForm({...actionForm, rejectionReason: e.target.value})}
                          rows={3} placeholder="Reason for rejection..." className="input resize-none" />
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setActionModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleStatusUpdate} disabled={submitting} className="btn-primary flex-1">
                {submitting ? 'Updating...' : 'Confirm Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
