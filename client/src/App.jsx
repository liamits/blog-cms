import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.jsx'

// Pages
import LandingPage from './pages/LandingPage'
import BlogPage from './pages/BlogPage'
import PostPage from './pages/PostPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import LoadingSpinner from './components/ui/LoadingSpinner'

function App() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/post/:id" element={<PostPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirects */}
        <Route path="/admin" element={<Navigate to="/login" replace />} />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App