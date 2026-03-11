import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Users, Eye, TrendingUp, FileText, Zap, Target, Code } from 'lucide-react'

const LandingPage = () => {
  const [stats, setStats] = useState({
    posts: 0,
    views: 0,
    categories: 0
  })

  useEffect(() => {
    // Animate stats on load
    const animateStats = () => {
      const savedPosts = localStorage.getItem('blogPosts')
      let postsCount = 1
      
      if (savedPosts) {
        const posts = JSON.parse(savedPosts)
        postsCount = posts.length
      }

      // Animate counter
      let current = 0
      const increment = postsCount / 30
      const timer = setInterval(() => {
        current += increment
        if (current >= postsCount) {
          current = postsCount
          clearInterval(timer)
        }
        setStats(prev => ({
          ...prev,
          posts: Math.floor(current),
          views: Math.floor(current * 15),
          categories: Math.min(Math.floor(current / 2) + 1, 5)
        }))
      }, 50)
    }

    animateStats()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                Personal Blog
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-primary-500 transition-colors">Home</Link>
              <Link to="/blog" className="text-gray-700 hover:text-primary-500 transition-colors">Blog</Link>
              <Link to="#about" className="text-gray-700 hover:text-primary-500 transition-colors">About</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-white rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-12 h-12 bg-white rounded-full"></div>
          <div className="absolute bottom-40 right-10 w-24 h-24 bg-white rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Welcome to My Blog
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
              A place to share knowledge, experiences, and interesting stories about technology and life
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/blog" 
                className="btn btn-primary bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              >
                Explore Blog <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a 
                href="#about" 
                className="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 text-lg font-semibold"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Floating Icon */}
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block animate-bounce">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
              <FileText className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">About Me</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in">
              <p className="text-lg text-gray-600 mb-6">
                Hello! I'm a developer passionate about technology and sharing knowledge. On this blog, I'll write about:
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <Code className="w-5 h-5 text-primary-500 mr-3" />
                  Web and mobile development
                </li>
                <li className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-primary-500 mr-3" />
                  New technologies and trends
                </li>
                <li className="flex items-center">
                  <Users className="w-5 h-5 text-primary-500 mr-3" />
                  Work experiences
                </li>
                <li className="flex items-center">
                  <BookOpen className="w-5 h-5 text-primary-500 mr-3" />
                  Interesting stories in the IT industry
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl">
                <div className="text-3xl font-bold text-primary-600 mb-2">{stats.posts}</div>
                <div className="text-gray-600 font-medium">Posts</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600 mb-2">{stats.views}</div>
                <div className="text-gray-600 font-medium">Views</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                <div className="text-3xl font-bold text-orange-600 mb-2">{stats.categories}</div>
                <div className="text-gray-600 font-medium">Categories</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Read This Blog?</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Zap,
                title: "Practical Knowledge",
                description: "Share real experiences from completed projects"
              },
              {
                icon: TrendingUp,
                title: "Latest Tech",
                description: "Stay updated with the newest trends and technologies"
              },
              {
                icon: BookOpen,
                title: "Easy to Understand",
                description: "Written in an accessible way, suitable for all levels"
              },
              {
                icon: Target,
                title: "Hands-on Practice",
                description: "Includes code examples and specific practical guides"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Personal Blog</h3>
              <p className="text-gray-400">Sharing knowledge and experience about technology</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Links</h4>
              <ul className="space-y-2">
                <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">About</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <p className="text-gray-400">Email: contact@example.com</p>
              <p className="text-gray-400">GitHub: @yourname</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">&copy; 2026 Personal Blog. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage