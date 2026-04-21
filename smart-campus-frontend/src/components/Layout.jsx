import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'
import {
  HiHome, HiOfficeBuilding, HiCalendar, HiTicket,
  HiBell, HiCog, HiLogout, HiShieldCheck, HiUsers
} from 'react-icons/hi'

const navItem = 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200'
const active = 'bg-teal-50 text-teal-700 font-semibold'
const inactive = 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/landing') }

  return (
    <div className="flex h-screen bg-slate-50" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col shadow-sm">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md shadow-teal-500/20"
                 style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
              <HiShieldCheck className="text-white text-lg" />
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-sm tracking-tight">NexusHub</p>
              <p className="text-xs text-slate-400">Campus Portal · SLIIT</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 mt-1">Main</p>

          <NavLink to="/" end className={({ isActive }) => `${navItem} ${isActive ? active : inactive}`}>
            <HiHome className="text-lg flex-shrink-0" /> Dashboard
          </NavLink>
          <NavLink to="/resources" className={({ isActive }) => `${navItem} ${isActive ? active : inactive}`}>
            <HiOfficeBuilding className="text-lg flex-shrink-0" /> Facilities & Assets
          </NavLink>
          <NavLink to="/bookings" className={({ isActive }) => `${navItem} ${isActive ? active : inactive}`}>
            <HiCalendar className="text-lg flex-shrink-0" /> My Bookings
          </NavLink>
          <NavLink to="/tickets" className={({ isActive }) => `${navItem} ${isActive ? active : inactive}`}>
            <HiTicket className="text-lg flex-shrink-0" /> Incident Tickets
          </NavLink>
          <NavLink to="/notifications" className={({ isActive }) => `${navItem} ${isActive ? active : inactive}`}>
            <HiBell className="text-lg flex-shrink-0" /> Notifications
          </NavLink>

          {isAdmin() && (
            <>
              <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 mt-4">Admin</p>
              <NavLink to="/admin" end className={({ isActive }) => `${navItem} ${isActive ? active : inactive}`}>
                <HiCog className="text-lg flex-shrink-0" /> Dashboard
              </NavLink>
              <NavLink to="/admin/resources" className={({ isActive }) => `${navItem} ${isActive ? active : inactive}`}>
                <HiOfficeBuilding className="text-lg flex-shrink-0" /> Manage Resources
              </NavLink>
              <NavLink to="/admin/bookings" className={({ isActive }) => `${navItem} ${isActive ? active : inactive}`}>
                <HiCalendar className="text-lg flex-shrink-0" /> Manage Bookings
              </NavLink>
              <NavLink to="/admin/tickets" className={({ isActive }) => `${navItem} ${isActive ? active : inactive}`}>
                <HiTicket className="text-lg flex-shrink-0" /> Manage Tickets
              </NavLink>
              <NavLink to="/admin/users" className={({ isActive }) => `${navItem} ${isActive ? active : inactive}`}>
                <HiUsers className="text-lg flex-shrink-0" /> Manage Users
              </NavLink>
            </>
          )}
        </nav>

        {/* User profile */}
        <div className="px-3 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1 bg-slate-50 rounded-xl">
            <img src={user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=0d9488&color=fff`}
                 alt={user?.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-teal-100" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.roles?.[0]}</p>
            </div>
          </div>
          <button onClick={handleLogout}
                  className={`${navItem} ${inactive} w-full text-slate-500 hover:text-red-500 hover:bg-red-50`}>
            <HiLogout className="text-lg flex-shrink-0" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full"
                 style={{ background: 'linear-gradient(to bottom, #0d9488, #0891b2)' }} />
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">SLIIT · Faculty of Computing</p>
              <h1 className="text-sm font-extrabold text-slate-800 leading-tight tracking-tight">NexusHub — Campus Operations Portal</h1>
            </div>
          </div>
          <NotificationBell />
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
