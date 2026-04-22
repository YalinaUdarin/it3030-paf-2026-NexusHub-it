import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationApi } from '../api'
import toast from 'react-hot-toast'
import { HiBell, HiCheck, HiTrash, HiCog } from 'react-icons/hi'
import { formatDistanceToNow } from 'date-fns'

const typeIcons = {
  BOOKING_APPROVED: '✅',
  BOOKING_REJECTED: '❌',
  BOOKING_CANCELLED: '🚫',
  TICKET_STATUS_CHANGED: '🔄',
  TICKET_ASSIGNED: '👤',
  TICKET_COMMENT_ADDED: '💬',
  TICKET_RESOLVED: '✔️',
}

const PREFERENCE_LABELS = [
  { key: 'bookingApproved', label: 'Booking Approved', icon: '✅', description: 'When your booking request is approved' },
  { key: 'bookingRejected', label: 'Booking Rejected', icon: '❌', description: 'When your booking request is rejected' },
  { key: 'bookingCancelled', label: 'Booking Cancelled', icon: '🚫', description: 'When a booking is cancelled' },
  { key: 'ticketStatusChanged', label: 'Ticket Status Changed', icon: '🔄', description: 'When your ticket status is updated' },
  { key: 'ticketAssigned', label: 'Ticket Assigned', icon: '👤', description: 'When a ticket is assigned to you' },
  { key: 'ticketCommentAdded', label: 'New Comment', icon: '💬', description: 'When someone comments on your ticket' },
  { key: 'ticketResolved', label: 'Ticket Resolved', icon: '✔️', description: 'When your ticket is resolved' },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState(null)
  const [savingPrefs, setSavingPrefs] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { fetchNotifications() }, [unreadOnly])
  useEffect(() => { fetchPreferences() }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const { data } = await notificationApi.getAll(unreadOnly)
      setNotifications(data)
    } finally { setLoading(false) }
  }

  const fetchPreferences = async () => {
    try {
      const { data } = await notificationApi.getPreferences()
      setPreferences(data)
    } catch {}
  }

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch { toast.error('Failed to mark as read') }
  }

  const handleMarkAll = async () => {
    try {
      await notificationApi.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      toast.success('All marked as read')
    } catch { toast.error('Failed') }
  }

  const handleDelete = async (id) => {
    try {
      await notificationApi.delete(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch { toast.error('Failed to delete') }
  }

  const handleClick = (n) => {
    if (!n.read) handleMarkRead(n.id)
    if (n.referenceType === 'BOOKING') navigate(`/bookings/${n.referenceId}`)
    else if (n.referenceType === 'TICKET') navigate(`/tickets/${n.referenceId}`)
  }

  const handlePreferenceToggle = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSavePreferences = async () => {
    setSavingPrefs(true)
    try {
      await notificationApi.updatePreferences(preferences)
      toast.success('Preferences saved!')
      setShowPreferences(false)
    } catch { toast.error('Failed to save preferences') }
    finally { setSavingPrefs(false) }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="max-w-2xl space-y-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm shadow-teal-500/20"
                 style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
              <HiBell className="text-white text-sm" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Notifications</h2>
          </div>
          <p className="text-xs text-slate-400 ml-9">
            {unreadCount > 0
              ? <><span className="font-semibold text-teal-600">{unreadCount}</span> unread notification{unreadCount !== 1 ? 's' : ''}</>
              : 'All caught up!'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Unread toggle */}
          <button
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              unreadOnly
                ? 'text-white border-transparent shadow-sm shadow-teal-500/20'
                : 'bg-white text-slate-500 border-slate-200 hover:border-teal-300 hover:text-teal-600'
            }`}
            style={unreadOnly ? { background: 'linear-gradient(135deg, #0d9488, #0891b2)' } : {}}
          >
            {unreadOnly ? 'Unread only' : 'All'}
          </button>

          {/* Mark all read */}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600 transition-all"
            >
              <HiCheck className="text-sm" /> Mark all read
            </button>
          )}

          {/* Preferences cog */}
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            title="Notification Preferences"
            className={`p-2 rounded-xl border transition-all ${
              showPreferences
                ? 'text-white border-transparent shadow-sm shadow-teal-500/20'
                : 'bg-white border-slate-200 text-slate-400 hover:border-teal-300 hover:text-teal-600'
            }`}
            style={showPreferences ? { background: 'linear-gradient(135deg, #0d9488, #0891b2)' } : {}}
          >
            <HiCog className="text-base" />
          </button>
        </div>
      </div>

      {/* Preferences Panel */}
      {showPreferences && preferences && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm shadow-slate-200/60 overflow-hidden">
          {/* Panel header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between"
               style={{ background: 'linear-gradient(135deg, #f0fdfa, #eff6ff)' }}>
            <div className="flex items-center gap-2">
              <HiCog className="text-teal-600 text-base" />
              <p className="text-sm font-bold text-slate-800">Notification Preferences</p>
            </div>
            <p className="text-xs text-slate-400">Toggle what you receive</p>
          </div>

          <div className="p-4 space-y-2">
            {PREFERENCE_LABELS.map(({ key, label, icon, description }) => (
              <div key={key}
                   className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{label}</p>
                    <p className="text-xs text-slate-400">{description}</p>
                  </div>
                </div>
                {/* Toggle switch */}
                <button
                  onClick={() => handlePreferenceToggle(key)}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                    preferences[key] ? '' : 'bg-slate-200'
                  }`}
                  style={preferences[key] ? { background: 'linear-gradient(135deg, #0d9488, #0891b2)' } : {}}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow ${
                    preferences[key] ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3 px-4 pb-4">
            <button
              onClick={() => setShowPreferences(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePreferences}
              disabled={savingPrefs}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 shadow-md shadow-teal-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}
            >
              {savingPrefs ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      )}

      {/* Notifications list */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-9 w-9 border-2 border-slate-100"
               style={{ borderTopColor: '#0d9488' }} />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-16">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #f0fdfa, #eff6ff)' }}>
            <HiBell className="text-2xl text-teal-400" />
          </div>
          <p className="font-semibold text-slate-700">You're all caught up!</p>
          <p className="text-slate-400 text-sm mt-1">No notifications to show</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              className={`group flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
                !n.read
                  ? 'bg-teal-50/40 border-teal-200 shadow-sm shadow-teal-100'
                  : 'bg-white border-slate-100 hover:border-slate-200'
              }`}
            >
              {/* Icon */}
              <div className="text-xl flex-shrink-0 mt-0.5">{typeIcons[n.type] || '🔔'}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${!n.read ? 'text-teal-900' : 'text-slate-800'}`}>
                    {n.title}
                  </p>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                          style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }} />
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1.5">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>

              {/* Delete */}
              <button
                onClick={e => { e.stopPropagation(); handleDelete(n.id) }}
                className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
              >
                <HiTrash className="text-base" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
