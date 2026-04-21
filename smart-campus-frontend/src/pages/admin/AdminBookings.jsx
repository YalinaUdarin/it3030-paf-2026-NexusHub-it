import { useState, useEffect } from 'react'
import { bookingApi } from '../../api'
import StatusBadge from '../../components/StatusBadge'
import toast from 'react-hot-toast'
import { HiCheck, HiX } from 'react-icons/hi'

const STATUSES = ['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('PENDING')
  const [rejectModal, setRejectModal] = useState(null)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchBookings() }, [filter])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const { data } = await bookingApi.getAll({ status: filter || undefined })
      setBookings(data)
    } finally { setLoading(false) }
  }

  const handleApprove = async (id) => {
    try {
      await bookingApi.approve(id)
      toast.success('Booking approved')
      fetchBookings()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleReject = async () => {
    if (!reason.trim()) { toast.error('Please provide a rejection reason'); return }
    setSubmitting(true)
    try {
      await bookingApi.reject(rejectModal, reason)
      toast.success('Booking rejected')
      setRejectModal(null)
      setReason('')
      fetchBookings()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900" style={{letterSpacing:'-0.02em'}}>Manage Bookings</h2>
        <p className="text-slate-500 mt-1 text-sm">Review and approve booking requests</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === s ? 'text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-teal-300 hover:text-teal-600'}`}
                  style={filter === s ? { background: 'linear-gradient(135deg, #0d9488, #0891b2)' } : {}}>
            {s || 'All'} {s === 'PENDING' && bookings.filter(b => b.status === 'PENDING').length > 0 && filter !== 'PENDING' ? '' : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"/></div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Resource', 'Requested By', 'Date & Time', 'Purpose', 'Attendees', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">No bookings found</td></tr>
              ) : bookings.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{b.resourceName}</td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900 font-medium">{b.userName}</p>
                    <p className="text-xs text-gray-500">{b.userEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    <p>{b.bookingDate}</p>
                    <p className="text-xs text-gray-500">{b.startTime} – {b.endTime}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-40 truncate">{b.purpose}</td>
                  <td className="px-4 py-3 text-gray-600 text-center">{b.expectedAttendees}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3">
                    {b.status === 'PENDING' && (
                      <div className="flex gap-1">
                        <button onClick={() => handleApprove(b.id)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                          <HiCheck className="text-lg" />
                        </button>
                        <button onClick={() => { setRejectModal(b.id); setReason('') }}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                          <HiX className="text-lg" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Reject Booking</h3>
            <p className="text-sm text-gray-600 mb-4">Please provide a reason for rejection. This will be visible to the user.</p>
            <textarea value={reason} onChange={e => setReason(e.target.value)}
                      rows={4} placeholder="e.g. Resource is reserved for maintenance during this period..."
                      className="input resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleReject} disabled={submitting} className="btn-danger flex-1">
                {submitting ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
