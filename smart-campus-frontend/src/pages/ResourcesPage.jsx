import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { resourceApi } from '../api'
import StatusBadge from '../components/StatusBadge'
import {
  HiSearch, HiAdjustments, HiOfficeBuilding, HiLocationMarker,
  HiUsers, HiDesktopComputer, HiBeaker, HiChatAlt2, HiVideoCamera
} from 'react-icons/hi'

const TYPES = ['', 'LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT']

const typeConfig = {
  LECTURE_HALL: {
    icon: HiOfficeBuilding,
    label: 'Lecture Hall',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    hoverBorder: 'hover:border-blue-200',
    hoverText: 'group-hover:text-blue-600',
  },
  LAB: {
    icon: HiBeaker,
    label: 'Laboratory',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    hoverBorder: 'hover:border-teal-200',
    hoverText: 'group-hover:text-teal-600',
  },
  MEETING_ROOM: {
    icon: HiChatAlt2,
    label: 'Meeting Room',
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    hoverBorder: 'hover:border-violet-200',
    hoverText: 'group-hover:text-violet-600',
  },
  EQUIPMENT: {
    icon: HiVideoCamera,
    label: 'Equipment',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    hoverBorder: 'hover:border-amber-200',
    hoverText: 'group-hover:text-amber-600',
  },
}

const fallbackConfig = {
  icon: HiDesktopComputer,
  label: 'Resource',
  iconBg: 'bg-slate-50',
  iconColor: 'text-slate-600',
  hoverBorder: 'hover:border-slate-200',
  hoverText: 'group-hover:text-slate-600',
}

export default function ResourcesPage() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [type, setType] = useState('')
  const [minCapacity, setMinCapacity] = useState('')

  useEffect(() => { fetchResources() }, [type, minCapacity])

  const fetchResources = async () => {
    setLoading(true)
    try {
      const { data } = await resourceApi.getAll({
        type: type || undefined,
        minCapacity: minCapacity || undefined,
        keyword: keyword || undefined,
      })
      setResources(data)
    } finally { setLoading(false) }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchResources()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900" style={{ letterSpacing: '-0.02em' }}>
          Facilities & Assets
        </h2>
        <p className="text-slate-500 mt-1 text-sm">Browse and book available campus resources</p>
      </div>

      {/* Search & Filter bar */}
      <div className="card">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <label className="label">Search</label>
            <div className="relative">
              <HiSearch className="absolute left-3.5 top-3 text-slate-400 text-sm" />
              <input value={keyword} onChange={e => setKeyword(e.target.value)}
                     placeholder="Search by name or location..."
                     className="input pl-9" />
            </div>
          </div>
          <div>
            <label className="label">Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="input w-40">
              {TYPES.map(t => (
                <option key={t} value={t}>
                  {t ? typeConfig[t]?.label : 'All Types'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Min Capacity</label>
            <input type="number" value={minCapacity}
                   onChange={e => setMinCapacity(e.target.value)}
                   placeholder="e.g. 20" className="input w-28" min="1" />
          </div>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <HiAdjustments /> Filter
          </button>
        </form>
      </div>

      {/* Type filter pills */}
      <div className="flex gap-2 flex-wrap">
        {TYPES.map(t => (
          <button key={t} onClick={() => setType(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    type === t
                      ? 'text-white shadow-sm'
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-teal-300 hover:text-teal-600'
                  }`}
                  style={type === t ? { background: 'linear-gradient(135deg, #0d9488, #0891b2)' } : {}}>
            {t ? typeConfig[t]?.label : 'All'}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"/>
        </div>
      ) : resources.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <HiOfficeBuilding className="text-3xl text-slate-400" />
          </div>
          <p className="font-semibold text-slate-600">No resources found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {resources.map(r => {
            const config = typeConfig[r.type] || fallbackConfig
            const Icon = config.icon
            return (
              <Link key={r.id} to={`/resources/${r.id}`}
                    className={`card ${config.hoverBorder} hover:shadow-md transition-all duration-200 group`}>
                {/* Icon + Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${config.iconBg} flex items-center justify-center`}>
                    <Icon className={`text-2xl ${config.iconColor}`} />
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                {/* Name */}
                <h3 className={`font-bold text-slate-900 ${config.hoverText} transition-colors mb-1`}>
                  {r.name}
                </h3>

                {/* Location */}
                <p className="text-xs text-slate-400 flex items-center gap-1 mb-3">
                  <HiLocationMarker className="flex-shrink-0" />
                  {r.location}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config.iconBg} ${config.iconColor}`}>
                    {config.label}
                  </span>
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <HiUsers className="text-slate-400" />
                    {r.capacity} seats
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
