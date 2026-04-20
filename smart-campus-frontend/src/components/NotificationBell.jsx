import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationApi } from '../api'
import { HiBell } from 'react-icons/hi'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationBell() {
  const [count, setCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const fetchCount = async () => {
    try {
      const { data } = await notificationApi.getCount()
      setCount(data.unreadCount)
    } catch {}
  }

  const handleOpen = async () => {
    setOpen(!open)
    if (!open) {
      try {
        const { data } = await notificationApi.getAll(true)
        setNotifications(data.slice(0, 5))
      } catch {}
    }
  }

  const handleMarkRead = async (id) => {
    await notificationApi.markAsRead(id)
    setNotifications(prev => prev.filter(n => n.id !== id))
    setCount(prev => Math.max(0, prev - 1))
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={handleOpen}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
        <HiBell className="text-xl" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
            <button onClick={() => { navigate('/notifications'); setOpen(false) }}
                    className="text-xs text-blue-600 hover:underline">View all</button>
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500">No unread notifications</div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
              {notifications.map(n => (
                <div key={n.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <button onClick={() => handleMarkRead(n.id)}
                            className="text-xs text-blue-500 hover:text-blue-700 whitespace-nowrap">
                      Mark read
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
