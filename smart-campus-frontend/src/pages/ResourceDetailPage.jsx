import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { resourceApi, bookingApi } from '../api'
import StatusBadge from '../components/StatusBadge'
import ResourceCalendar from '../components/ResourceCalendar'
import toast from 'react-hot-toast'
import { HiArrowLeft, HiCalendar, HiLocationMarker, HiUsers } from 'react-icons/hi'

export default function ResourceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState({
    bookingDate: '', startTime: '', endTime: '', purpose: '', expectedAttendees: 1
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    resourceApi.getById(id)
      .then(({ data }) => setResource(data))
      .finally(() => setLoading(false))
  }, [id])

  const handleBook = async (e) => {
    e.preventDefault()
    if (!booking.bookingDate || !booking.startTime || !booking.endTime || !booking.purpose) {
      toast.error('Please fill in all required fields')
      return
    }
    if (booking.endTime <= booking.startTime) {
      toast.error('End time must be after start time')
      return
    }
    setSubmitting(true)
    try {
      await bookingApi.create({ ...booking, resourceId: id })
      toast.success('Booking request submitted! Awaiting approval.')
      navigate('/bookings')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally { setSubmitting(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"/>
    </div>
  )
  if (!resource) return (
    <div className="card text-center py-12 text-gray-500">Resource not found</div>
  )

  return (
    <div className="space-y-6 max-w-5xl">
      <button onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
        <HiArrowLeft /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - resource info + calendar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resource info */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{resource.name}</h2>
                <p className="text-gray-500 mt-1 flex items-center gap-1 text-sm">
                  <HiLocationMarker /> {resource.location}
                </p>
              </div>
              <StatusBadge status={resource.status} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Type</p>
                <p className="font-semibold text-gray-900">{resource.type?.replace('_', ' ')}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Capacity</p>
                <p className="font-semibold text-gray-900 flex items-center gap-1">
                  <HiUsers className="text-gray-400" /> {resource.capacity} people
                </p>
              </div>
            </div>

            {resource.description && (
              <p className="text-gray-600 mt-4 text-sm leading-relaxed">{resource.description}</p>
            )}

            {resource.availabilityWindows?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Regular Availability</p>
                <div className="flex flex-wrap gap-2">
                  {resource.availabilityWindows.map((w, i) => (
                    <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                      {w.dayOfWeek}: {w.startTime}–{w.endTime}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Availability Calendar */}
          <ResourceCalendar resourceId={id} />
        </div>

        {/* Right column - booking form */}
        <div className="card h-fit sticky top-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <HiCalendar className="text-blue-600" /> Request Booking
          </h3>

          {resource.status !== 'ACTIVE' ? (
            <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm">
              This resource is currently unavailable for booking.
            </div>
          ) : (
            <form onSubmit={handleBook} className="space-y-3">
              <div>
                <label className="label">Date *</label>
                <input
                  type="date"
                  value={booking.bookingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setBooking({ ...booking, bookingDate: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Start *</label>
                  <input
                    type="time"
                    value={booking.startTime}
                    onChange={e => setBooking({ ...booking, startTime: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">End *</label>
                  <input
                    type="time"
                    value={booking.endTime}
                    onChange={e => setBooking({ ...booking, endTime: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Purpose *</label>
                <textarea
                  value={booking.purpose}
                  onChange={e => setBooking({ ...booking, purpose: e.target.value })}
                  rows={3}
                  placeholder="Describe the purpose..."
                  className="input resize-none"
                  required
                />
              </div>
              <div>
                <label className="label">Expected Attendees</label>
                <input
                  type="number"
                  value={booking.expectedAttendees}
                  min={1}
                  max={resource.capacity}
                  onChange={e => setBooking({ ...booking, expectedAttendees: parseInt(e.target.value) })}
                  className="input"
                />
                <p className="text-xs text-gray-400 mt-1">Max capacity: {resource.capacity}</p>
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? 'Submitting...' : 'Submit Booking Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
