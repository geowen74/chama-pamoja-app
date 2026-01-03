import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    groupOption: 'create' as 'create' | 'join',
    groupName: '',
    joinCode: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password) {
      setError('Please fill in all required fields')
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        groupName: formData.groupOption === 'create' ? formData.groupName : undefined,
        joinCode: formData.groupOption === 'join' ? formData.joinCode : undefined,
      })
      navigate('/dashboard')
    } catch {
      setError('Registration failed. Please try again.')
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-500 mt-2">Join or create a chama group</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-danger-50 text-danger-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="label">First Name</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              className="input"
              placeholder="John"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="label">Last Name</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              className="input"
              placeholder="Kamau"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="label">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="input"
            placeholder="you@example.com"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="phone" className="label">Phone Number</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            className="input"
            placeholder="+254712345678"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="label">Password</label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              className="input pr-10"
              placeholder="••••••••"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="label">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="input"
            placeholder="••••••••"
            disabled={isLoading}
          />
        </div>

        {/* Group option */}
        <div className="space-y-3 pt-2">
          <label className="label">Group Option</label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition ${
              formData.groupOption === 'create' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="groupOption"
                value="create"
                checked={formData.groupOption === 'create'}
                onChange={() => setFormData({ ...formData, groupOption: 'create' })}
                className="sr-only"
              />
              <span className="text-sm font-medium">Create New Group</span>
            </label>
            <label className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition ${
              formData.groupOption === 'join' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="groupOption"
                value="join"
                checked={formData.groupOption === 'join'}
                onChange={() => setFormData({ ...formData, groupOption: 'join' })}
                className="sr-only"
              />
              <span className="text-sm font-medium">Join Existing</span>
            </label>
          </div>
        </div>

        {formData.groupOption === 'create' ? (
          <div>
            <label htmlFor="groupName" className="label">Group Name</label>
            <input
              id="groupName"
              name="groupName"
              type="text"
              value={formData.groupName}
              onChange={handleChange}
              className="input"
              placeholder="Upendo Investment Group"
              disabled={isLoading}
            />
          </div>
        ) : (
          <div>
            <label htmlFor="joinCode" className="label">Join Code</label>
            <input
              id="joinCode"
              name="joinCode"
              type="text"
              value={formData.joinCode}
              onChange={handleChange}
              className="input"
              placeholder="Enter group invite code"
              disabled={isLoading}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn btn-primary flex items-center justify-center gap-2 py-3 mt-6"
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
