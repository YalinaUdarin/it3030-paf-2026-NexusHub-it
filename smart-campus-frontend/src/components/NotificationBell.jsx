import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationApi } from '../api'
import { HiBell, HiCheck } from 'react-icons/hi'
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

  const handleMarkRead = async (id, e) => {
    e.stopPropagation()
    await notificationApi.markAsRead(id)
    setNotifications(prev => prev.filter(n => n.id !== id))
    setCount(prev => Math.max(0, prev - 1))
  }

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className={`relative p-2 rounded-xl border transition-all ${
          open
            ? 'text-white border-transparent shadow-md shadow-teal-500/20'
            : 'bg-white border-slate-200 text-slate-500 hover:border-teal-300 hover:text-teal-600'
        }`}
        style={open ? { background: 'linear-gradient(135deg, #0d9488, #0891b2)' } : {}}
      >
        <HiBell className="text-lg" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 text-white text-xs rounded-full w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center font-bold text-[10px] shadow-sm"
                style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100"
               style={{ background: 'linear-gradient(135deg, #f0fdfa, #eff6ff)' }}>
            <div className="flex items-center gap-2">
              <HiBell className="text-teal-600 text-sm" />
              <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
              {count > 0 && (
                <span className="text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                  {count}
                </span>
              )}
            </div>
            <button
              onClick={() => { navigate('/notifications'); setOpen(false) }}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
            >
              View all →
            </button>
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <HiBell className="text-2xl text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400 font-medium">No unread notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className="px-4 py-3 hover:bg-teal-50/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleMarkRead(n.id, e)}
                      title="Mark as read"
                      className="flex-shrink-0 mt-0.5 p-1 rounded-lg text-slate-300 hover:text-teal-600 hover:bg-teal-50 transition-all"
                    >
                      <HiCheck className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60">
            <button
              onClick={() => { navigate('/notifications'); setOpen(false) }}
              className="w-full py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-all"
            >
              Open Notifications Center
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
