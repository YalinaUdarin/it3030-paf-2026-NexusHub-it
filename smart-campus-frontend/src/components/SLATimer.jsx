import { useState, useEffect } from 'react'
import { differenceInHours, differenceInMinutes, differenceInDays } from 'date-fns'

const SLA_LIMITS = {
  CRITICAL: 4,   // hours
  HIGH: 24,
  MEDIUM: 72,
  LOW: 168,
}

export default function SLATimer({ createdAt, priority, status }) {
  const [elapsed, setElapsed] = useState('')
  const [percentage, setPercentage] = useState(0)
  const [color, setColor] = useState('green')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const created = new Date(createdAt)
      const hoursElapsed = differenceInHours(now, created)
      const minutesElapsed = differenceInMinutes(now, created)
      const daysElapsed = differenceInDays(now, created)

      // Format elapsed time
      if (minutesElapsed < 60) {
        setElapsed(`${minutesElapsed}m`)
      } else if (hoursElapsed < 24) {
        setElapsed(`${hoursElapsed}h ${minutesElapsed % 60}m`)
      } else {
        setElapsed(`${daysElapsed}d ${hoursElapsed % 24}h`)
      }

      // Calculate SLA percentage
      const limit = SLA_LIMITS[priority] || 72
      const pct = Math.min((hoursElapsed / limit) * 100, 100)
      setPercentage(pct)

      // Color based on percentage
      if (pct < 50) setColor('green')
      else if (pct < 80) setColor('yellow')
      else setColor('red')
    }

    update()
    const interval = setInterval(update, 60000) // update every minute
    return () => clearInterval(interval)
  }, [createdAt, priority])

  const isResolved = ['RESOLVED', 'CLOSED', 'REJECTED'].includes(status)

  const colorMap = {
    green: { bar: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
    yellow: { bar: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    red: { bar: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
  }

  const c = colorMap[isResolved ? 'green' : color]
  const limit = SLA_LIMITS[priority] || 72

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">⏱ Response Window</span>
          {!isResolved && percentage >= 100 && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium animate-pulse">
              OVERDUE
            </span>
          )}
          {isResolved && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              RESOLVED
            </span>
          )}
        </div>
        <span className={`text-sm font-bold ${c.text}`}>{elapsed}</span>
      </div>

      {!isResolved && (
        <>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${c.bar}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>0h</span>
            <span>SLA: {limit}h for {priority}</span>
            <span>{limit}h</span>
          </div>
        </>
      )}

      {isResolved && (
        <p className="text-xs text-green-600 mt-1">
          Ticket resolved within Response Window ✓
        </p>
      )}
    </div>
  )
}