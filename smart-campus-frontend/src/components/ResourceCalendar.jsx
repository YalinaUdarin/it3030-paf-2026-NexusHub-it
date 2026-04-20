import { useState, useEffect } from 'react'
import { bookingApi } from '../api'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, format, isSameMonth,
  isSameDay, isToday, isPast
} from 'date-fns'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function ResourceCalendar({ resourceId }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [bookings, setBookings] = useState([])
  const [selectedDay, setSelectedDay] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [currentMonth, resourceId])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const { data } = await bookingApi.getAll({ resourceId })
      // Only approved and pending bookings matter for availability
      setBookings(data.filter(b => ['APPROVED', 'PENDING'].includes(b.status)))
    } finally {
      setLoading(false)
    }
  }

  const getBookingsForDay = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return bookings.filter(b => b.bookingDate === dateStr)
  }

  const getDayStatus = (date) => {
    if (isPast(date) && !isToday(date)) return 'past'
    const dayBookings = getBookingsForDay(date)
    if (dayBookings.length === 0) return 'available'
    if (dayBookings.length >= 3) return 'full'
    return 'partial'
  }

  const renderCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const rows = []
    let days = []
    let day = startDate

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day
        const status = getDayStatus(cloneDay)
        const isSelected = selectedDay && isSameDay(cloneDay, selectedDay)
        const isCurrentMonth = isSameMonth(cloneDay, currentMonth)
        const todayClass = isToday(cloneDay) ? 'ring-2 ring-blue-500' : ''

        const statusStyles = {
          past: 'bg-gray-50 text-gray-300 cursor-not-allowed',
          available: 'bg-green-50 text-gray-700 hover:bg-green-100 cursor-pointer',
          partial: 'bg-yellow-50 text-gray-700 hover:bg-yellow-100 cursor-pointer',
          full: 'bg-red-50 text-gray-700 hover:bg-red-100 cursor-pointer',
        }

        days.push(
          <div
            key={day.toString()}
            onClick={() => status !== 'past' && isCurrentMonth && setSelectedDay(cloneDay)}
            className={`
              relative h-10 flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-all
              ${isCurrentMonth ? statusStyles[status] : 'text-gray-200 cursor-default'}
              ${isSelected ? 'ring-2 ring-blue-600 ring-offset-1' : ''}
              ${todayClass}
            `}
          >
            <span>{format(cloneDay, 'd')}</span>
            {isCurrentMonth && status !== 'past' && getBookingsForDay(cloneDay).length > 0 && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-current opacity-60" />
            )}
          </div>
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      )
      days = []
    }
    return rows
  }

  const selectedDayBookings = selectedDay ? getBookingsForDay(selectedDay) : []

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 mb-4">📅 Availability Calendar</h3>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-xs">
        {[
          { color: 'bg-green-200', label: 'Available' },
          { color: 'bg-yellow-200', label: 'Partially Booked' },
          { color: 'bg-red-200', label: 'Fully Booked' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${color}`} />
            <span className="text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
          ‹
        </button>
        <h4 className="font-semibold text-gray-900 text-sm">
          {format(currentMonth, 'MMMM yyyy')}
        </h4>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"/>
        </div>
      ) : (
        <div className="space-y-1">{renderCalendarDays()}</div>
      )}

      {/* Selected day bookings */}
      {selectedDay && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            {format(selectedDay, 'EEEE, MMMM d')}
          </h4>
          {selectedDayBookings.length === 0 ? (
            <p className="text-sm text-green-600 flex items-center gap-1">
              ✅ Fully available — no bookings on this day
            </p>
          ) : (
            <div className="space-y-2">
              {selectedDayBookings.map(b => (
                <div key={b.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-xs font-medium text-gray-900">
                      {b.startTime} – {b.endTime}
                    </p>
                    <p className="text-xs text-gray-500">{b.purpose}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    b.status === 'APPROVED'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
