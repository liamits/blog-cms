import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, ArrowLeft, BookOpen, UserPlus } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useToast } from '../components/ui/Toaster'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const { login, register } = useAuth()
  const { success, error } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  
  const from = location.state?.from?.pathname || '/dashboard'

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm()

  const password = watch('password')

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      let result
      if (isLogin) {
        result = await login({
          username: data.username,
          password: data.password
        })
      } else {
        if (data.password !== data.confirmPassword) {
          error('Passwords do not match')
          setIsLoading(false)
          return
        }
        
        result = await register({
          username: data.username,
          email: data.email,
          password: data.password
        })
      }

      if (result.success) {
        success(isLogin ? 'Login successful!' : 'Account created successfully!')
        navigate(from, { replace: true })
      } else {
        error(result.error)
      }
    } catch (err) {
      error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    reset()
    setShowPassword(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-white rounded-full"></div>
        <div className="absolute bottom-40 right-10 w-24 h-24 bg-white rounded-full"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                {isLogin ? <BookOpen className="w-6 h-6 text-white" /> : <UserPlus className="w-6 h-6 text-white" />}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-600">
              {isLogin ? 'Sign in to your account' : 'Register new admin account'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username {!isLogin && 'or Email'}
              </label>
              <input
                type="text"
                {...registerField('username', { 
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Username must be at least 3 characters' }
                })}
                className="input"
                placeholder={isLogin ? "Enter your username or email" : "Enter your username"}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            {/* Email (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  {...registerField('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="input"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...registerField('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  className="input pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  {...registerField('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  className="input"
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            )}

            {/* Remember Me (Login only) */}
            {isLogin && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...registerField('rememberMe')}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label className="ml-2 text-sm text-gray-600">
                  Remember me
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={toggleMode}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {isLogin ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Back to Website */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage