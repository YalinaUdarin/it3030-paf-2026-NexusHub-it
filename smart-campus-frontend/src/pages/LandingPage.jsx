import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  HiOfficeBuilding, HiCalendar, HiTicket, HiBell,
  HiShieldCheck, HiChevronRight, HiMenu, HiX,
  HiChevronLeft, HiArrowRight
} from 'react-icons/hi'

const slides = [
  {
    image: '/hero1.jpg',
    title: 'Campus Operations,',
    highlight: 'One Intelligent Hub',
    subtitle: 'Manage resources, bookings, maintenance tickets, and role-based operations through a secure campus portal.',
  },
  {
    image: '/hero2.jpg',
    title: 'Book Facilities',
    highlight: 'Instantly & Securely',
    subtitle: 'Reserve lecture halls, labs, meeting rooms and equipment with real-time conflict detection.',
  },
  {
    image: '/hero3.jpg',
    title: 'Report Incidents,',
    highlight: 'Track Resolutions',
    subtitle: 'Submit maintenance tickets with photo evidence and monitor every update from open to closed.',
  },
]

const features = [
  { icon: HiOfficeBuilding, title: 'Facilities & Assets', desc: 'Discover lecture halls, labs, rooms, and equipment with clear availability and metadata.' },
  { icon: HiCalendar, title: 'Booking Workflow', desc: 'Request, approve, and monitor bookings with conflict-free scheduling and status tracking.' },
  { icon: HiTicket, title: 'Maintenance Tickets', desc: 'Report incidents with attachments, assign technicians, and monitor full resolution timelines.' },
  { icon: HiBell, title: 'Live Notifications', desc: 'Get updates for booking decisions, ticket status changes, and comments in one panel.' },
]

const roles = [
  { title: 'Student', color: 'text-teal-600', bg: 'bg-teal-50 border-teal-100', desc: 'Book resources, report issues, and follow your requests in a simple personalized workspace.' },
  { title: 'Administrator', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', desc: 'Approve bookings, govern access, and keep campus operations reliable and auditable.' },
  { title: 'Technician', color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100', desc: 'Manage assigned incidents, update progress, and close tasks with clear resolution notes.' },
]

export default function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000)
    return () => clearInterval(timer)
  }, [])

  const prev = () => setCurrent(c => (c - 1 + slides.length) % slides.length)
  const next = () => setCurrent(c => (c + 1) % slides.length)

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow">
              <HiShieldCheck className="text-white text-sm" />
            </div>
            <span className={`font-extrabold text-lg tracking-tight transition-colors ${scrolled ? 'text-slate-900' : 'text-white'}`}>
              NexusHub
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Resources', 'About Us', 'Contact Us'].map(item => (
              <a key={item}
                 href={item === 'Features' ? '#features' : item === 'Resources' ? '/public/resources' : '#about'}
                 className={`text-sm font-medium transition-colors ${scrolled ? 'text-slate-600 hover:text-teal-600' : 'text-white/90 hover:text-white'}`}>
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login"
                  className={`text-sm font-semibold px-4 py-2 rounded-xl transition-colors ${scrolled ? 'text-slate-700 hover:text-teal-600' : 'text-white hover:text-white/80'}`}>
              Login
            </Link>
            <Link to="/register"
                  className="text-sm font-semibold text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-teal-500/30 hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
              Sign Up Free
            </Link>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)}
                  className={`md:hidden p-2 ${scrolled ? 'text-slate-600' : 'text-white'}`}>
            {menuOpen ? <HiX className="text-xl" /> : <HiMenu className="text-xl" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 px-6 py-4 space-y-3">
            <a href="#features" className="block text-sm font-medium text-slate-600">Features</a>
            <Link to="/public/resources" className="block text-sm font-medium text-slate-600">Resources</Link>
            <Link to="/login" className="block text-sm font-semibold text-teal-600">Login</Link>
            <Link to="/register" className="block text-sm font-semibold text-teal-600">Register</Link>
          </div>
        )}
      </nav>

      {/* Hero Carousel */}
      <div className="relative h-screen min-h-[600px] overflow-hidden">
        {slides.map((slide, i) => (
          <div key={i}
               className="absolute inset-0 transition-opacity duration-1000"
               style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}>
            {/* Background image */}
            <img src={slide.image} alt=""
                 className="w-full h-full object-cover"
                 style={{ filter: 'brightness(0.45)' }} />
          </div>
        ))}

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 z-10"
             style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.7) 100%)' }} />

        {/* Content */}
        <div className="absolute inset-0 z-20 flex items-center justify-center text-center px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs font-bold uppercase tracking-wider mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              SLIIT Faculty of Computing
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-white mb-4"
                style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              {slides[current].title}<br />
              <span style={{ background: 'linear-gradient(135deg, #2dd4bf, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {slides[current].highlight}
              </span>
            </h1>
            <p className="text-lg text-white/75 leading-relaxed mb-10 max-w-xl mx-auto">
              {slides[current].subtitle}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/register"
                    className="flex items-center gap-2 px-8 py-3.5 text-white font-bold rounded-2xl shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl text-sm"
                    style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                Get Started <HiChevronRight />
              </Link>
              <Link to="/public/resources"
                    className="flex items-center gap-2 px-8 py-3.5 bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white font-bold rounded-2xl border border-white/30 transition-all hover:-translate-y-1 text-sm">
                View Resources <HiArrowRight />
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel controls */}
        <button onClick={prev}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 text-white flex items-center justify-center transition-all">
          <HiChevronLeft />
        </button>
        <button onClick={next}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 text-white flex items-center justify-center transition-all">
          <HiChevronRight />
        </button>

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-white' : 'w-2 bg-white/40'}`} />
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-slate-900 py-8 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Active Resources', value: '50+' },
            { label: 'Bookings Managed', value: '1,200+' },
            { label: 'Incidents Resolved', value: '300+' },
            { label: 'Campus Users', value: '500+' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-extrabold text-white" style={{ letterSpacing: '-0.03em' }}>{value}</p>
              <p className="text-sm text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About section */}
      <section id="about" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-slate-50 to-teal-50/30 rounded-3xl border border-slate-100 p-8 lg:p-12">
            <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-3">About The Platform</p>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4" style={{ letterSpacing: '-0.02em' }}>
              Built for Modern Campus Operations
            </h2>
            <p className="text-slate-500 leading-relaxed max-w-3xl text-base">
              NexusHub is designed for transparent workflows, role-driven accountability, and reliable audit trails.
              From room bookings to incident resolution, every action is structured, trackable, and secure.
              Built for SLIIT Faculty of Computing.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6" style={{ background: '#f8fafc' }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-2">Platform Modules</p>
            <h2 className="text-4xl font-extrabold text-slate-900" style={{ letterSpacing: '-0.02em' }}>What You Can Do</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">Everything you need to manage campus facilities and operations in one place.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-slate-100 hover:border-teal-200 hover:shadow-lg transition-all p-6 group">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
                  <Icon className="text-2xl" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-2">Access Control</p>
            <h2 className="text-4xl font-extrabold text-slate-900" style={{ letterSpacing: '-0.02em' }}>Role-Based Experience</h2>
            <p className="text-slate-500 mt-3">Different views and capabilities for every type of user.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {roles.map(({ title, color, bg, desc }) => (
              <div key={title} className={`rounded-2xl border p-8 ${bg} transition-all hover:-translate-y-1 hover:shadow-md`}>
                <h3 className={`font-extrabold text-xl mb-3 ${color}`}>{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0d9488 100%)' }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Ready to get started?
          </h2>
          <p className="text-white/60 mb-8 text-lg">Join NexusHub and streamline your campus operations today.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register"
                  className="px-8 py-3.5 bg-white text-slate-900 font-bold rounded-2xl hover:-translate-y-0.5 transition-all shadow-xl text-sm">
              Create Free Account
            </Link>
            <Link to="/login"
                  className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/20 transition-all text-sm">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
              <HiShieldCheck className="text-white text-sm" />
            </div>
            <div>
              <p className="font-bold text-white">NexusHub</p>
              <p className="text-slate-400 text-xs">Smart Campus Operations Hub · SLIIT · Group 104</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#roles" className="hover:text-white transition-colors">Roles</a>
            <Link to="/public/resources" className="hover:text-white transition-colors">Resources</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
