import { useState, useEffect, useMemo } from 'react'
import { Plus, Pencil, Trash2, X, Eye, FileText, Search, Filter } from 'lucide-react'
import { postsAPI, categoriesAPI } from '../../services/api'
import { useToast } from '../ui/Toaster'
import { useAuth } from '../../hooks/useAuth.jsx'
import LoadingSpinner from '../ui/LoadingSpinner'

const STATUS_COLORS = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-yellow-100 text-yellow-700',
  archived: 'bg-gray-100 text-gray-600'
}

// ── Modal Form ──────────────────────────────────────────────
const PostModal = ({ post, categories, onClose, onSaved }) => {
  const { success, error } = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: post?.title || '',
    content: post?.content || '',
    author: post?.author || user?.username || '',
    category: post?.category?._id || post?.category || '',
    tags: post?.tags?.join(', ') || '',
    status: post?.status || 'draft',
    featured: post?.featured || false
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim() || !form.category) {
      error('Title, content and category are required')
      return
    }
    setLoading(true)
    try {
      if (post) {
        await postsAPI.update(post._id, form)
        success('Post updated!')
      } else {
        await postsAPI.create(form)
        success('Post created!')
      }
      onSaved()
      onClose()
    } catch (err) {
      error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">
            {post ? 'Edit Post' : 'New Post'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              className="input"
              placeholder="Post title"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              required
            />
          </div>

          {/* Author + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
              <input
                type="text"
                className="input"
                value={form.author}
                onChange={e => set('author', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                className="input"
                value={form.category}
                onChange={e => set('category', e.target.value)}
                required
              >
                <option value="">Select category</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
            <textarea
              className="textarea"
              placeholder="Write your post content here..."
              rows={10}
              value={form.content}
              onChange={e => set('content', e.target.value)}
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <input
              type="text"
              className="input"
              placeholder="tag1, tag2, tag3"
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">Separate tags with commas</p>
          </div>

          {/* Status + Featured */}
          <div className="flex items-center gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="input w-auto"
                value={form.status}
                onChange={e => set('status', e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer mt-5">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={e => set('featured', e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Featured post</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              {loading ? <LoadingSpinner size="sm" /> : (post ? 'Update' : 'Publish')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────
const PostsManagement = () => {
  const { error } = useToast()
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  // Filters
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const fetchData = async () => {
    try {
      const [postsRes, catsRes] = await Promise.all([
        postsAPI.getAll({ limit: 200 }),
        categoriesAPI.getAll()
      ])
      setPosts(postsRes.data.posts)
      setCategories(catsRes.data)
    } catch {
      error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // Filter logic (client-side)
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchSearch = !search ||
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.author.toLowerCase().includes(search.toLowerCase())

      const matchCategory = !filterCategory || post.category?._id === filterCategory

      const postDate = new Date(post.createdAt)
      const matchFrom = !filterDateFrom || postDate >= new Date(filterDateFrom)
      const matchTo = !filterDateTo || postDate <= new Date(filterDateTo + 'T23:59:59')

      return matchSearch && matchCategory && matchFrom && matchTo
    })
  }, [posts, search, filterCategory, filterDateFrom, filterDateTo])

  const hasFilter = search || filterCategory || filterDateFrom || filterDateTo

  const clearFilters = () => {
    setSearch('')
    setFilterCategory('')
    setFilterDateFrom('')
    setFilterDateTo('')
    setCurrentPage(1)
  }

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1) }, [search, filterCategory, filterDateFrom, filterDateTo])

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / pageSize)
  const pagedPosts = filteredPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleEdit = (post) => { setEditTarget(post); setModalOpen(true) }
  const handleAdd = () => { setEditTarget(null); setModalOpen(true) }

  const handleDelete = async (id) => {
    try {
      await postsAPI.delete(id)
      fetchData()
    } catch {
      error('Delete failed')
    } finally {
      setDeleteId(null)
    }
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
          <p className="text-gray-500 text-sm">
            {filteredPosts.length}{hasFilter ? ` / ${posts.length}` : ''} posts
          </p>
        </div>
        <button onClick={handleAdd} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Search by title */}
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Tìm theo tên</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tên bài viết, tác giả..."
                className="input pl-9 py-2 text-sm"
              />
            </div>
          </div>

          {/* Filter by category */}
          <div className="min-w-[160px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Danh mục</label>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="input py-2 text-sm"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Filter by date from */}
          <div className="min-w-[140px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Từ ngày</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={e => setFilterDateFrom(e.target.value)}
              className="input py-2 text-sm"
            />
          </div>

          {/* Filter by date to */}
          <div className="min-w-[140px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Đến ngày</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={e => setFilterDateTo(e.target.value)}
              className="input py-2 text-sm"
            />
          </div>

          {/* Clear */}
          {hasFilter && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
            >
              <X className="w-4 h-4" /> Xóa filter
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">{hasFilter ? 'Không tìm thấy bài viết phù hợp' : 'No posts yet'}</p>
          {!hasFilter && (
            <button onClick={handleAdd} className="btn btn-primary">
              <Plus className="w-4 h-4 mr-2" /> Create first post
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Category</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Views</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagedPosts.map(post => (
                <tr key={post._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 line-clamp-1 max-w-xs">{post.title}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{post.author}</div>
                  </td>
                  <td className="px-6 py-4">
                    {post.category ? (
                      <span className="px-2 py-1 text-xs font-medium text-white rounded-full"
                        style={{ backgroundColor: post.category.color }}>
                        {post.category.name}
                      </span>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${STATUS_COLORS[post.status]}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(post.createdAt)}</td>
                  <td className="px-6 py-4 text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> {post.views || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => handleEdit(post)}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(post._id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredPosts.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Hiển thị</span>
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1) }}
              className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {[10, 20, 30, 40, 50, 100].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span>/ trang &nbsp;·&nbsp; {filteredPosts.length} bài</span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ‹
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, idx) =>
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        currentPage === p
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-200 bg-white hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )
              }

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ›
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <PostModal
          post={editTarget}
          categories={categories}
          onClose={() => setModalOpen(false)}
          onSaved={fetchData}
        />
      )}

      {/* Confirm Delete */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Post?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="btn btn-danger flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PostsManagement
