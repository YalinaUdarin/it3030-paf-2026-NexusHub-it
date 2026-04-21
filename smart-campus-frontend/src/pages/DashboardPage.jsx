import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { bookingApi, ticketApi, resourceApi } from '../api'
import StatusBadge from '../components/StatusBadge'
import { HiCalendar, HiTicket, HiOfficeBuilding, HiClock, HiArrowRight, HiSparkles } from 'react-icons/hi'
import { formatDistanceToNow } from 'date-fns'

const priorityColor = {
  LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444'
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [tickets, setTickets] = useState([])
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      bookingApi.getAll(),
      ticketApi.getAll(),
      resourceApi.getAll({ status: 'ACTIVE' }),
    ]).then(([b, t, r]) => {
      setBookings(b.data.slice(0, 5))
      setTickets(t.data.slice(0, 5))
      setResources(r.data)
    }).finally(() => setLoading(false))
  }, [])

  const stats = [
    {
      label: 'Active Resources', value: resources.length,
      icon: HiOfficeBuilding, gradient: 'from-blue-600 to-indigo-600',
      glow: 'shadow-blue-500/25', light: 'bg-blue-50 text-blue-600',
      sub: 'Available to book'
    },
    {
      label: 'My Bookings', value: bookings.length,
      icon: HiCalendar, gradient: 'from-violet-600 to-purple-600',
      glow: 'shadow-violet-500/25', light: 'bg-violet-50 text-violet-600',
      sub: `${bookings.filter(b => b.status === 'APPROVED').length} approved`
    },
    {
      label: 'Open Tickets', value: tickets.filter(t => t.status === 'OPEN').length,
      icon: HiTicket, gradient: 'from-pink-500 to-rose-500',
      glow: 'shadow-pink-500/25', light: 'bg-pink-50 text-pink-600',
      sub: 'Awaiting resolution'
    },
    {
      label: 'Pending Approval', value: bookings.filter(b => b.status === 'PENDING').length,
      icon: HiClock, gradient: 'from-amber-500 to-orange-500',
      glow: 'shadow-amber-500/25', light: 'bg-amber-50 text-amber-600',
      sub: 'Awaiting admin review'
    },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"/>
    </div>
  )

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Mesh background layer */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div style={{
          position: 'absolute', inset: 0,
          background: '#f1f5f9',
        }} />
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,70,226,0.15) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', top: '10%', right: '-5%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '0%', left: '30%',
          width: '700px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.10) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '10%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)',
        }} />
      </div>

      <div className="space-y-6 relative">
        {/* Welcome header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <HiSparkles className="text-white text-sm" />
              </div>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Smart Campus</span>
            </div>
            <h1 style={{ fontFamily: "'Cabinet Grotesk', 'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em' }}
                className="text-4xl font-extrabold text-slate-900">
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-slate-500 mt-1 text-base">Here's what's happening on campus today.</p>
          </div>

          {/* User avatar pill */}
          <div style={{
            background: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.5)',
            borderRadius: '9999px',
          }} className="flex items-center gap-3 px-4 py-2 shadow-sm">
            <img src={user?.picture || `https://ui-avatars.com/api/?name=${user?.name}`}
                 alt={user?.name} className="w-8 h-8 rounded-full" />
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-700">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.roles?.[0]}</p>
            </div>
          </div>
        </div>

        {/* KPI stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, gradient, glow, sub }) => (
            <div key={label}
                 style={{
                   background: 'rgba(255,255,255,0.72)',
                   backdropFilter: 'blur(28px)',
                   border: '1px solid rgba(255,255,255,0.5)',
                   borderRadius: '1.5rem',
                   transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                 }}
                 className={`p-5 shadow-lg ${glow} hover:-translate-y-1 hover:scale-[1.02] cursor-default`}>
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg ${glow}`}>
                <Icon className="text-white text-xl" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900" style={{ fontFamily: "'Cabinet Grotesk', 'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em' }}>
                {value}
              </p>
              <p className="text-sm font-semibold text-slate-700 mt-0.5">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* Recent Bookings - 7 cols */}
          <div style={{
            background: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.5)',
            borderRadius: '2rem',
          }} className="lg:col-span-7 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 style={{ fontFamily: "'Cabinet Grotesk', 'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' }}
                    className="text-lg font-bold text-slate-900">Recent Bookings</h3>
                <p className="text-xs text-slate-400 mt-0.5">Your latest resource reservations</p>
              </div>
              <Link to="/bookings"
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors">
                View all <HiArrowRight className="text-xs" />
              </Link>
            </div>

            {bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <HiCalendar className="text-4xl mb-2 opacity-30" />
                <p className="text-sm">No bookings yet</p>
                <Link to="/resources" className="mt-3 text-xs font-semibold text-indigo-600 hover:underline">Browse resources →</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {bookings.map(b => (
                  <Link key={b.id} to={`/bookings/${b.id}`}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-white/60 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-600">
                        <HiCalendar className="text-sm" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{b.resourceName}</p>
                        <p className="text-xs text-slate-400">{b.bookingDate} · {b.startTime}–{b.endTime}</p>
                      </div>
                    </div>
                    <StatusBadge status={b.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Tickets - 5 cols */}
          <div style={{
            background: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.5)',
            borderRadius: '2rem',
          }} className="lg:col-span-5 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 style={{ fontFamily: "'Cabinet Grotesk', 'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' }}
                    className="text-lg font-bold text-slate-900">Incident Tickets</h3>
                <p className="text-xs text-slate-400 mt-0.5">Active maintenance requests</p>
              </div>
              <Link to="/tickets"
                    className="flex items-center gap-1 text-xs font-semibold text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-full transition-colors">
                View all <HiArrowRight className="text-xs" />
              </Link>
            </div>

            {tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <HiTicket className="text-4xl mb-2 opacity-30" />
                <p className="text-sm">No tickets yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tickets.map(t => (
                  <Link key={t.id} to={`/tickets/${t.id}`}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-white/60 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                           style={{ background: `${priorityColor[t.priority]}20` }}>
                        <div className="w-2 h-2 rounded-full" style={{ background: priorityColor[t.priority] }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-pink-600 transition-colors truncate max-w-36">{t.title}</p>
                        <p className="text-xs text-slate-400">{formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}</p>
                      </div>
                    </div>
                    <StatusBadge status={t.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions banner */}
          <div style={{
            background: 'linear-gradient(135deg, #4f46e2 0%, #7c3aed 50%, #ec4899 100%)',
            borderRadius: '2rem',
          }} className="lg:col-span-12 p-6 shadow-xl shadow-indigo-500/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 style={{ fontFamily: "'Cabinet Grotesk', 'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' }}
                    className="text-xl font-bold text-white">Quick Actions</h3>
                <p className="text-indigo-200 text-sm mt-0.5">Get things done faster</p>
              </div>
              <div className="flex gap-3">
                <Link to="/resources"
                      className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold rounded-2xl transition-all border border-white/30 text-sm">
                  <HiOfficeBuilding /> Book a Resource
                </Link>
                <Link to="/tickets"
                      className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 hover:bg-white/90 font-semibold rounded-2xl transition-all text-sm shadow-lg">
                  <HiTicket /> Report Incident
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
