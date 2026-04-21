import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { bookingApi } from '../api'
import StatusBadge from '../components/StatusBadge'
import { HiArrowLeft } from 'react-icons/hi'

export default function BookingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    bookingApi.getById(id).then(({ data }) => setBooking(data)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"/></div>
  if (!booking) return <div className="card text-center py-12 text-gray-500">Booking not found</div>

  const fields = [
    { label: 'Resource', value: booking.resourceName },
    { label: 'Date', value: booking.bookingDate },
    { label: 'Time', value: `${booking.startTime} – ${booking.endTime}` },
    { label: 'Purpose', value: booking.purpose },
    { label: 'Expected Attendees', value: booking.expectedAttendees },
    { label: 'Booked By', value: booking.userName },
    { label: 'Email', value: booking.userEmail },
    { label: 'Created', value: new Date(booking.createdAt).toLocaleString() },
    booking.approvedBy && { label: 'Reviewed By', value: booking.approvedBy },
    booking.rejectionReason && { label: 'Rejection Reason', value: booking.rejectionReason },
  ].filter(Boolean)

  return (
    <div className="max-w-2xl space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
        <HiArrowLeft /> Back
      </button>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
          <StatusBadge status={booking.status} />
        </div>
        <dl className="space-y-3">
          {fields.map(({ label, value }) => (
            <div key={label} className="flex gap-4 py-2 border-b border-gray-50">
              <dt className="text-sm text-gray-500 w-40 flex-shrink-0">{label}</dt>
              <dd className="text-sm font-medium text-gray-900">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
