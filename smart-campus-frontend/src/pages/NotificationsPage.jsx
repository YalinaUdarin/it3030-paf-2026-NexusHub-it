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
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-500 mt-1">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setUnreadOnly(!unreadOnly)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${unreadOnly ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}>
            {unreadOnly ? 'Unread only' : 'All'}
          </button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAll} className="btn-secondary flex items-center gap-1 text-sm">
              <HiCheck /> Mark all read
            </button>
          )}
          <button onClick={() => setShowPreferences(!showPreferences)}
                  className={`p-2 rounded-lg border transition-colors ${showPreferences ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  title="Notification Preferences">
            <HiCog className="text-lg" />
          </button>
        </div>
      </div>

      {/* Preferences Panel */}
      {showPreferences && preferences && (
        <div className="card border-blue-200 bg-blue-50/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <HiCog className="text-blue-600" /> Notification Preferences
            </h3>
            <p className="text-xs text-gray-500">Toggle which notifications you receive</p>
          </div>

          <div className="space-y-2">
            {PREFERENCE_LABELS.map(({ key, label, icon, description }) => (
              <div key={key}
                   className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-xs text-gray-400">{description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePreferenceToggle(key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${preferences[key] ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${preferences[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowPreferences(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSavePreferences} disabled={savingPrefs} className="btn-primary flex-1">
              {savingPrefs ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      )}

      {/* Notifications list */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"/>
        </div>
      ) : notifications.length === 0 ? (
        <div className="card text-center py-16">
          <HiBell className="text-5xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">You're all caught up!</p>
          <p className="text-gray-400 text-sm mt-1">No notifications to show</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id}
                 className={`card flex items-start gap-4 cursor-pointer hover:shadow-md transition-all ${!n.read ? 'border-blue-200 bg-blue-50/30' : ''}`}
                 onClick={() => handleClick(n)}>
              <div className="text-2xl flex-shrink-0 mt-0.5">{typeIcons[n.type] || '🔔'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium ${!n.read ? 'text-blue-900' : 'text-gray-900'}`}>{n.title}</p>
                  {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
                </div>
                <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>
              <button onClick={e => { e.stopPropagation(); handleDelete(n.id) }}
                      className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                <HiTrash />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
