import { useState, useEffect } from 'react'
import { adminApi } from '../../api'
import toast from 'react-hot-toast'
import { HiX } from 'react-icons/hi'

const ALL_ROLES = ['USER', 'ADMIN', 'TECHNICIAN', 'MANAGER']
const roleColor = { USER: 'bg-gray-100 text-gray-700', ADMIN: 'bg-red-100 text-red-700', TECHNICIAN: 'bg-blue-100 text-blue-700', MANAGER: 'bg-purple-100 text-purple-700' }

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleModal, setRoleModal] = useState(null)
  const [selectedRoles, setSelectedRoles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data } = await adminApi.getUsers()
      setUsers(data)
    } finally { setLoading(false) }
  }

  const openRoleModal = (user) => {
    setRoleModal(user)
    setSelectedRoles([...user.roles])
  }

  const handleRoleToggle = (role) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    )
  }

  const handleSaveRoles = async () => {
    if (selectedRoles.length === 0) { toast.error('User must have at least one role'); return }
    setSubmitting(true)
    try {
      await adminApi.updateRoles(roleModal.id, selectedRoles)
      toast.success('Roles updated successfully')
      setRoleModal(null)
      fetchUsers()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update roles') }
    finally { setSubmitting(false) }
  }

  const handleToggleEnabled = async (user) => {
    try {
      await adminApi.toggleUser(user.id, !user.enabled)
      toast.success(`User ${user.enabled ? 'disabled' : 'enabled'}`)
      fetchUsers()
    } catch { toast.error('Failed to update user') }
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Manage Users</h2>
        <p className="text-gray-500 mt-1">Control user roles and access permissions</p>
      </div>

      {/* Search */}
      <div className="card">
        <input value={search} onChange={e => setSearch(e.target.value)}
               placeholder="Search by name or email..." className="input max-w-sm" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"/></div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['User', 'Email', 'Roles', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">No users found</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={u.picture || `https://ui-avatars.com/api/?name=${u.name}&size=32`}
                           alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                      <span className="font-medium text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {u.roles?.map(r => (
                        <span key={r} className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColor[r] || 'bg-gray-100 text-gray-700'}`}>{r}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openRoleModal(u)}
                              className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg font-medium transition-colors">
                        Edit Roles
                      </button>
                      <button onClick={() => handleToggleEnabled(u)}
                              className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${u.enabled ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                        {u.enabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Role edit modal */}
      {roleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Edit Roles</h3>
              <button onClick={() => setRoleModal(null)} className="text-gray-400 hover:text-gray-600"><HiX className="text-xl"/></button>
            </div>
            <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-xl">
              <img src={roleModal.picture || `https://ui-avatars.com/api/?name=${roleModal.name}`}
                   alt={roleModal.name} className="w-10 h-10 rounded-full" />
              <div>
                <p className="font-medium text-gray-900">{roleModal.name}</p>
                <p className="text-xs text-gray-500">{roleModal.email}</p>
              </div>
            </div>
            <div className="space-y-2 mb-6">
              {ALL_ROLES.map(role => (
                <label key={role} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{role}</p>
                    <p className="text-xs text-gray-500">
                      {{ USER: 'Basic access', ADMIN: 'Full system access', TECHNICIAN: 'Handle maintenance tickets', MANAGER: 'Manage team and reports' }[role]}
                    </p>
                  </div>
                  <input type="checkbox" checked={selectedRoles.includes(role)}
                         onChange={() => handleRoleToggle(role)}
                         className="w-4 h-4 text-blue-600 rounded" />
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRoleModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSaveRoles} disabled={submitting} className="btn-primary flex-1">
                {submitting ? 'Saving...' : 'Save Roles'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
