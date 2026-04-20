import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { resourceApi } from '../api'
import { HiSearch, HiOfficeBuilding, HiLocationMarker, HiUsers, HiShieldCheck, HiArrowLeft, HiLockClosed } from 'react-icons/hi'

const TYPES = ['', 'LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT']

const typeConfig = {
  LECTURE_HALL: { icon: '🏛', label: 'Lecture Hall', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  LAB: { icon: '🔬', label: 'Laboratory', color: 'bg-teal-50 text-teal-600 border-teal-100' },
  MEETING_ROOM: { icon: '🤝', label: 'Meeting Room', color: 'bg-violet-50 text-violet-600 border-violet-100' },
  EQUIPMENT: { icon: '📹', label: 'Equipment', color: 'bg-amber-50 text-amber-600 border-amber-100' },
}

export default function PublicResourcesPage() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [type, setType] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => { fetchResources() }, [type])

  const fetchResources = async () => {
    setLoading(true)
    try {
      const { data } = await resourceApi.getAll({
        type: type || undefined,
        status: 'ACTIVE',
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
    <div className="min-h-screen" style={{
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      background: '#f8fafc'
    }}>
      {/* Top bar */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/landing" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-600 transition-colors">
              <HiArrowLeft /> Back
            </Link>
            <div className="w-px h-5 bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
                <HiShieldCheck className="text-white text-xs" />
              </div>
              <span className="font-extrabold text-slate-900 tracking-tight">NexusHub</span>
            </div>
            <span className="text-slate-300">·</span>
            <span className="text-sm font-semibold text-slate-600">Campus Resources</span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login"
                  className="text-sm font-semibold text-slate-600 hover:text-teal-600 px-4 py-2 rounded-xl transition-colors">
              Login
            </Link>
            <Link to="/register"
                  className="text-sm font-semibold text-white px-4 py-2 rounded-xl shadow-lg shadow-teal-500/20 transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
              Sign Up Free
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1">SLIIT Campus</p>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
            Available Facilities & Assets
          </h1>
          <p className="text-slate-500">Browse campus resources. <Link to="/login" className="text-teal-600 font-semibold hover:underline">Sign in</Link> to make a booking.</p>
        </div>

        {/* Search + Filter */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Search</label>
              <div className="relative">
                <HiSearch className="absolute left-3.5 top-3 text-slate-400 text-sm" />
                <input value={keyword} onChange={e => setKeyword(e.target.value)}
                       placeholder="Search by name or location..."
                       className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Type</label>
              <select value={type} onChange={e => setType(e.target.value)}
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all bg-white">
                {TYPES.map(t => (
                  <option key={t} value={t}>{t ? typeConfig[t]?.label : 'All Types'}</option>
                ))}
              </select>
            </div>
            <button type="submit"
                    className="px-5 py-2.5 text-white text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
              Search
            </button>
          </form>
        </div>

        {/* Type filter pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          {TYPES.map(t => (
            <button key={t} onClick={() => setType(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      type === t
                        ? 'text-white shadow-sm'
                        : 'bg-white text-slate-500 border border-slate-200 hover:border-teal-300'
                    }`}
                    style={type === t ? { background: 'linear-gradient(135deg, #0d9488, #0891b2)' } : {}}>
              {t ? typeConfig[t]?.label : 'All'}
            </button>
          ))}
        </div>

        {/* Resource grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"/>
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-20">
            <HiOfficeBuilding className="text-5xl text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No resources found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {resources.map(r => {
              const config = typeConfig[r.type] || { icon: '🏢', label: r.type, color: 'bg-slate-50 text-slate-600 border-slate-100' }
              return (
                <div key={r.id}
                     onClick={() => setSelected(r)}
                     className="bg-white rounded-2xl border border-slate-100 hover:border-teal-200 hover:shadow-lg transition-all cursor-pointer group p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl ${config.color}`}>
                      {config.icon}
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-600 border border-green-100">
                      ACTIVE
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors mb-1">{r.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mb-3">
                    <HiLocationMarker /> {r.location}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full">
                      {config.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                      <HiUsers className="text-slate-400" /> {r.capacity} seats
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Login prompt banner */}
        <div className="mt-12 rounded-3xl p-8 text-center"
             style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0d9488 100%)' }}>
          <HiLockClosed className="text-3xl text-white/60 mx-auto mb-3" />
          <h3 className="text-xl font-extrabold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
            Want to book a resource?
          </h3>
          <p className="text-white/60 text-sm mb-6">Create a free account or sign in to make booking requests.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/register"
                  className="px-6 py-2.5 bg-white text-slate-900 font-bold rounded-xl text-sm hover:-translate-y-0.5 transition-all shadow-lg">
              Create Account
            </Link>
            <Link to="/login"
                  className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 text-sm transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Resource detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
             onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-3xl ${typeConfig[selected.type]?.color || 'bg-slate-50'}`}>
                {typeConfig[selected.type]?.icon || '🏢'}
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-1">{selected.name}</h2>
            <p className="text-sm text-slate-400 flex items-center gap-1 mb-4">
              <HiLocationMarker /> {selected.location}
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400">Type</p>
                <p className="font-semibold text-slate-800 text-sm">{typeConfig[selected.type]?.label || selected.type}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400">Capacity</p>
                <p className="font-semibold text-slate-800 text-sm">{selected.capacity} people</p>
              </div>
            </div>
            {selected.description && (
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">{selected.description}</p>
            )}
            <div className="bg-teal-50 rounded-2xl p-4 text-center border border-teal-100">
              <p className="text-sm text-teal-700 font-medium mb-3">Sign in to book this resource</p>
              <div className="flex gap-2">
                <Link to="/login" className="flex-1 py-2 bg-white border border-teal-200 text-teal-600 font-semibold rounded-xl text-sm hover:bg-teal-50 transition-colors">
                  Login
                </Link>
                <Link to="/register"
                      className="flex-1 py-2 text-white font-semibold rounded-xl text-sm transition-all"
                      style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                  Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
