import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api'
import toast from 'react-hot-toast'
import { HiShieldCheck, HiMail, HiLockClosed, HiUser, HiEye, HiEyeOff } from 'react-icons/hi'
import { FcGoogle } from 'react-icons/fc'

export default function RegisterPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  const handleRegister = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const { data } = await authApi.register(form.name, form.email, form.password)
      login(data.token)
      toast.success(`Welcome to NexusHub, ${data.name}!`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = authApi.getGoogleLoginUrl()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      background: 'linear-gradient(135deg, #e8f5f0 0%, #f0f9ff 40%, #e8f4fd 70%, #f0fdf4 100%)'
    }}>
      <div className="w-full max-w-md">
        <Link to="/landing" className="flex items-center gap-1 text-xs font-semibold text-teal-600 uppercase tracking-widest mb-6 hover:text-teal-700 transition-colors">
          ← Back to Home
        </Link>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-white/80 p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow">
                <HiShieldCheck className="text-white text-sm" />
              </div>
              <span className="font-extrabold text-slate-900 tracking-tight">NexusHub</span>
            </div>
            <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1">Create Account</p>
            <h1 className="text-2xl font-extrabold text-slate-900" style={{ letterSpacing: '-0.02em' }}>
              Join the campus portal
            </h1>
            <p className="text-sm text-slate-400 mt-1">Create your account to get started</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-2xl">
            <Link to="/login" className="flex-1 py-2 text-center text-sm font-semibold text-slate-500 rounded-xl hover:text-slate-700 transition-colors">
              Login
            </Link>
            <div className="flex-1 py-2 text-center text-sm font-bold text-white rounded-xl shadow"
                 style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
              Register
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
              <div className="relative">
                <HiUser className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
                <input type="text" value={form.name}
                       onChange={e => setForm({ ...form, name: e.target.value })}
                       placeholder="Your full name"
                       className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
                       required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
              <div className="relative">
                <HiMail className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
                <input type="email" value={form.email}
                       onChange={e => setForm({ ...form, email: e.target.value })}
                       placeholder="you@sliit.lk"
                       className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
                       required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
                <input type={showPassword ? 'text' : 'password'} value={form.password}
                       onChange={e => setForm({ ...form, password: e.target.value })}
                       placeholder="Min. 6 characters"
                       className="w-full pl-9 pr-10 py-3 rounded-xl border border-gray-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
                       required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600">
                  {showPassword ? <HiEyeOff className="text-sm" /> : <HiEye className="text-sm" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
                <input type="password" value={form.confirmPassword}
                       onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                       placeholder="Repeat your password"
                       className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
                       required />
              </div>
            </div>

            <button type="submit" disabled={loading}
                    className="w-full py-3 text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-teal-500/20 disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs font-medium text-slate-400">OR</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <button onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-gray-200 hover:border-teal-300 hover:bg-teal-50/30 text-slate-700 font-semibold rounded-xl transition-all text-sm">
            <FcGoogle className="text-lg" />
            Continue with Google
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          IT3030 PAF · Group 104 · SLIIT Faculty of Computing
        </p>
      </div>
    </div>
  )
}
