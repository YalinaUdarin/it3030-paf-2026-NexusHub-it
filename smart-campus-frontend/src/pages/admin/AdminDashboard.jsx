import { useState, useEffect } from 'react'
import { bookingApi, ticketApi, resourceApi, adminApi } from '../../api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, Legend, CartesianGrid
} from 'recharts'
import { HiUsers, HiOfficeBuilding, HiCalendar, HiTicket, HiClock, HiTrendingUp } from 'react-icons/hi'

const STATUS_COLORS = {
  PENDING: '#f59e0b',
  APPROVED: '#10b981',
  REJECTED: '#ef4444',
  CANCELLED: '#94a3b8',
}

const PRIORITY_COLORS = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
}

const TICKET_STATUS_COLORS = {
  'OPEN': '#3b82f6',
  'IN PROGRESS': '#8b5cf6',
  'RESOLVED': '#10b981',
  'CLOSED': '#94a3b8',
}

// Custom legend that won't get cut off
const CustomLegend = ({ data, colorMap }) => (
  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
    {data.map(d => (
      <div key={d.name} className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: colorMap[d.name] || '#94a3b8' }} />
        <span className="text-xs text-gray-500">{d.name}: <span className="font-semibold text-gray-700">{d.value}</span></span>
      </div>
    ))}
  </div>
)

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, resources: 0, bookings: [], tickets: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApi.getUsers(),
      resourceApi.getAll(),
      bookingApi.getAll(),
      ticketApi.getAll(),
    ]).then(([u, r, b, t]) => {
      setStats({ users: u.data.length, resources: r.data.length, bookings: b.data, tickets: t.data })
    }).finally(() => setLoading(false))
  }, [])

  const bookingStatusData = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(s => ({
    name: s, value: stats.bookings.filter(b => b.status === s).length
  })).filter(d => d.value > 0)

  const ticketStatusData = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => ({
    name: s.replace('_', ' '), value: stats.tickets.filter(t => t.status === s).length
  }))

  const ticketPriorityData = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => ({
    name: p, value: stats.tickets.filter(t => t.priority === p).length
  })).filter(d => d.value > 0)

  // Top resources
  const resourceBookingCount = {}
  stats.bookings.forEach(b => {
    if (b.resourceName) resourceBookingCount[b.resourceName] = (resourceBookingCount[b.resourceName] || 0) + 1
  })
  const topResources = Object.entries(resourceBookingCount)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([name, count]) => ({ name: name.length > 18 ? name.substring(0, 18) + '…' : name, bookings: count }))

  // Peak hours
  const hourCount = {}
  stats.bookings.forEach(b => {
    if (b.startTime) {
      const hour = b.startTime.substring(0, 2)
      hourCount[hour] = (hourCount[hour] || 0) + 1
    }
  })
  const peakHours = Array.from({ length: 10 }, (_, i) => {
    const hour = String(i + 8).padStart(2, '0')
    return { time: `${hour}:00`, bookings: hourCount[hour] || 0 }
  })

  const resolvedTickets = stats.tickets.filter(t => t.resolvedAt && t.createdAt)
  const avgResolutionHours = resolvedTickets.length > 0
    ? Math.round(resolvedTickets.reduce((sum, t) => sum + (new Date(t.resolvedAt) - new Date(t.createdAt)) / 3600000, 0) / resolvedTickets.length)
    : 0

  const approvalRate = stats.bookings.length > 0
    ? Math.round((stats.bookings.filter(b => b.status === 'APPROVED').length / stats.bookings.length) * 100)
    : 0

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"/>
    </div>
  )

  const summaryCards = [
    { label: 'Total Users', value: stats.users, icon: HiUsers, color: 'blue', sub: 'Registered accounts' },
    { label: 'Total Resources', value: stats.resources, icon: HiOfficeBuilding, color: 'green', sub: 'Facilities & assets' },
    { label: 'Total Bookings', value: stats.bookings.length, icon: HiCalendar, color: 'orange', sub: `${stats.bookings.filter(b => b.status === 'PENDING').length} pending` },
    { label: 'Total Tickets', value: stats.tickets.length, icon: HiTicket, color: 'purple', sub: `${stats.tickets.filter(t => t.status === 'OPEN').length} open` },
    { label: 'Avg Resolution', value: avgResolutionHours > 0 ? `${avgResolutionHours}h` : 'N/A', icon: HiClock, color: 'cyan', sub: 'Ticket resolution time' },
    { label: 'Approval Rate', value: `${approvalRate}%`, icon: HiTrendingUp, color: 'teal', sub: 'Booking approval rate' },
  ]

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600', purple: 'bg-purple-50 text-purple-600',
    cyan: 'bg-cyan-50 text-cyan-600', teal: 'bg-teal-50 text-teal-600',
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2">
          <p className="text-xs font-semibold text-gray-700">{label || payload[0].name}</p>
          <p className="text-sm font-bold text-gray-900">{payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-gray-500 mt-1">Campus operations overview and analytics</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {summaryCards.map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorMap[color]}`}>
              <Icon className="text-xl" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs font-semibold text-gray-600 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Row 1: Top Resources + Peak Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-1">Top Booked Resources</h3>
          <p className="text-xs text-gray-400 mb-4">Most frequently reserved facilities</p>
          {topResources.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-300 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topResources} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={110} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="bookings" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-1">Peak Booking Hours</h3>
          <p className="text-xs text-gray-400 mb-4">When resources are booked most often</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={peakHours} margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="bookings" radius={[6, 6, 0, 0]} barSize={20}>
                {peakHours.map((entry, i) => (
                  <Cell key={i} fill={entry.bookings > 0 ? '#10b981' : '#e2e8f0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Booking Status + Ticket Status + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Booking Status - horizontal bars instead of pie */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-1">Booking Status</h3>
          <p className="text-xs text-gray-400 mb-4">Distribution by approval state</p>
          {bookingStatusData.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-300 text-sm">No bookings yet</div>
          ) : (
            <div className="space-y-3">
              {bookingStatusData.map(d => {
                const total = bookingStatusData.reduce((s, x) => s + x.value, 0)
                const pct = Math.round((d.value / total) * 100)
                return (
                  <div key={d.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-600">{d.name}</span>
                      <span className="text-xs font-bold text-gray-800">{d.value} <span className="font-normal text-gray-400">({pct}%)</span></span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                           style={{ width: `${pct}%`, background: STATUS_COLORS[d.name] || '#94a3b8' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Ticket Status bar chart */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-1">Ticket Status</h3>
          <p className="text-xs text-gray-400 mb-4">Current state of all tickets</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ticketStatusData} margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={28}>
                {ticketStatusData.map((entry, i) => (
                  <Cell key={i} fill={TICKET_STATUS_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick stats */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-1">Quick Stats</h3>
          <p className="text-xs text-gray-400 mb-4">Items requiring attention</p>
          <div className="space-y-2">
            {[
              { label: 'Pending Bookings', value: stats.bookings.filter(b => b.status === 'PENDING').length, color: 'text-yellow-600', bg: 'bg-yellow-50' },
              { label: 'Open Tickets', value: stats.tickets.filter(t => t.status === 'OPEN').length, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Critical Tickets', value: stats.tickets.filter(t => t.priority === 'CRITICAL').length, color: 'text-red-600', bg: 'bg-red-50' },
              { label: 'In Progress', value: stats.tickets.filter(t => t.status === 'IN_PROGRESS').length, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Resolved Tickets', value: stats.tickets.filter(t => t.status === 'RESOLVED').length, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Approved Bookings', value: stats.bookings.filter(b => b.status === 'APPROVED').length, color: 'text-green-600', bg: 'bg-green-50' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`flex items-center justify-between px-3 py-2 rounded-xl ${bg}`}>
                <span className="text-xs font-medium text-gray-600">{label}</span>
                <span className={`text-sm font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
