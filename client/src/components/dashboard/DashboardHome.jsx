import { useState, useEffect } from 'react'
import { FileText, Eye, Tags, CheckCircle } from 'lucide-react'
import { postsAPI, categoriesAPI } from '../../services/api'
import LoadingSpinner from '../ui/LoadingSpinner'

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalCategories: 0,
    publishedPosts: 0
  })
  const [recentPosts, setRecentPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [postsResponse, categoriesResponse] = await Promise.all([
        postsAPI.getAll({ limit: 100 }),
        categoriesAPI.getAll()
      ])

      const posts = postsResponse.data.posts || []
      const categories = categoriesResponse.data || []

      const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0)
      const publishedPosts = posts.filter(post => post.status === 'published').length

      setStats({
        totalPosts: posts.length,
        totalViews,
        totalCategories: categories.length,
        publishedPosts
      })

      setRecentPosts(posts.slice(0, 5))
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Posts',
      value: stats.totalPosts,
      icon: FileText,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Views',
      value: stats.totalViews,
      icon: Eye,
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Categories',
      value: stats.totalCategories,
      icon: Tags,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Published',
      value: stats.publishedPosts,
      icon: CheckCircle,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your blog.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-xl p-6 border border-gray-100`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Posts</h2>
        </div>
        <div className="p-6">
          {recentPosts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No posts yet. Create your first post!</p>
          ) : (
            <div className="space-y-4">
              {recentPosts.map(post => (
                <div key={post._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{post.title}</h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>By {post.author}</span>
                      <span>{post.category?.name || 'Uncategorized'}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        post.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : post.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {post.views || 0} views
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardHome