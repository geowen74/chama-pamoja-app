import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-purple-500/20 p-10 border border-white/50">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/40">
          <span className="text-3xl">👋</span>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-700 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">Welcome Back</h2>
        <p className="text-gray-500 mt-3">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 text-rose-600 px-5 py-4 rounded-2xl text-sm font-medium border border-rose-100/50 flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="label">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="you@example.com"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pr-12"
              placeholder="••••••••"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded-md border-gray-300 text-violet-600 focus:ring-violet-500 w-4 h-4" />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white font-semibold py-4 rounded-xl hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 transition-all duration-300 shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
        >
          {isLoading ? (
            <>
              <Loader2 size={22} className="animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <span className="ml-1">→</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-violet-600 hover:text-violet-700 font-semibold">
            Create one
          </Link>
        </p>
      </div>

      {/* Demo credentials */}
      <div className="mt-8 p-5 bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 rounded-2xl border border-violet-100/50">
        <p className="text-xs text-gray-600 text-center flex items-center justify-center gap-2">
          <span className="text-base">💡</span>
          <strong>Demo:</strong> Use any email and password to login
        </p>
      </div>
    </div>
  )
}
