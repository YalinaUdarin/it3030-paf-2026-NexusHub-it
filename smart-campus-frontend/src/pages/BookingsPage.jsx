import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bookingApi } from '../api'
import StatusBadge from '../components/StatusBadge'
import toast from 'react-hot-toast'
import {
  HiCalendar, HiClock, HiUsers, HiBookmark,
  HiXCircle, HiPlus, HiOfficeBuilding
} from 'react-icons/hi'

const STATUSES = ['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

const statusConfig = {
  '': { label: 'All', color: '' },
  PENDING: { label: 'Pending', color: 'bg-amber-500' },
  APPROVED: { label: 'Approved', color: 'bg-emerald-500' },
  REJECTED: { label: 'Rejected', color: 'bg-red-500' },
  CANCELLED: { label: 'Cancelled', color: 'bg-slate-400' },
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => { fetchBookings() }, [filter])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const { data } = await bookingApi.getAll({ status: filter || undefined })
      setBookings(data)
    } finally { setLoading(false) }
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return
    try {
      await bookingApi.cancel(id)
      toast.success('Booking cancelled')
      fetchBookings()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900" style={{ letterSpacing: '-0.02em' }}>
            My Bookings
          </h2>
          <p className="text-slate-500 mt-1 text-sm">Track and manage your resource bookings</p>
        </div>
        <Link to="/resources" className="btn-primary flex items-center gap-2">
          <HiPlus /> New Booking
        </Link>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    filter === s
                      ? 'text-white shadow-sm'
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-teal-300 hover:text-teal-600'
                  }`}
                  style={filter === s ? { background: 'linear-gradient(135deg, #0d9488, #0891b2)' } : {}}>
            {s && filter !== s && (
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[s]?.color}`} />
            )}
            {statusConfig[s]?.label || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"/>
        </div>
      ) : bookings.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <HiCalendar className="text-3xl text-slate-400" />
          </div>
          <p className="font-semibold text-slate-600">No bookings found</p>
          <p className="text-sm text-slate-400 mt-1">Make your first booking by browsing resources</p>
          <Link to="/resources" className="btn-primary mt-4 inline-flex items-center gap-2">
            <HiOfficeBuilding /> Browse Resources
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => (
            <div key={b.id} className="card flex items-center justify-between hover:shadow-md transition-all group">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Icon */}
                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <HiOfficeBuilding className="text-xl text-teal-600" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors truncate">
                      {b.resourceName}
                    </h3>
                    <StatusBadge status={b.status} />
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <HiCalendar className="text-slate-300" />
                      {b.bookingDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <HiClock className="text-slate-300" />
                      {b.startTime} – {b.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <HiUsers className="text-slate-300" />
                      {b.expectedAttendees} attendees
                    </span>
                    <span className="flex items-center gap-1">
                      <HiBookmark className="text-slate-300" />
                      <span className="truncate max-w-48">{b.purpose}</span>
                    </span>
                  </div>

                  {/* Rejection reason */}
                  {b.rejectionReason && (
                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                      <HiXCircle /> {b.rejectionReason}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                <Link to={`/bookings/${b.id}`} className="btn-secondary text-xs px-3 py-1.5">
                  Details
                </Link>
                {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                  <button onClick={() => handleCancel(b.id)}
                          className="btn-danger text-xs px-3 py-1.5">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
