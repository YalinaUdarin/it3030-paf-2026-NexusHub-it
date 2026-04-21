import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function AuthCallback() {
  const [params] = useSearchParams()
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    if (token) {
      login(token)
      toast.success('Successfully signed in!')
      navigate('/', { replace: true })
    } else {
      toast.error('Authentication failed. Please try again.')
      navigate('/login', { replace: true })
    }
  }, [])

  return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
        <p className="text-white font-medium">Completing sign in...</p>
      </div>
    </div>
  )
}
