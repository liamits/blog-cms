import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { categoriesAPI } from '../../services/api'
import { useToast } from '../ui/Toaster'
import LoadingSpinner from '../ui/LoadingSpinner'

const DEFAULT_COLORS = [
  '#3498db', '#e74c3c', '#2ecc71', '#f39c12',
  '#9b59b6', '#1abc9c', '#e67e22', '#e91e63'
]

const CategoryModal = ({ category, onClose, onSaved }) => {
  const { success, error } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: category?.name || '',
    description: category?.description || '',
    color: category?.color || '#3498db'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    try {
      if (category) {
        await categoriesAPI.update(category._id, form)
        success('Category updated!')
      } else {
        await categoriesAPI.create(form)
        success('Category created!')
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {category ? 'Edit Category' : 'Add New Category'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              className="input"
              placeholder="Category name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="textarea"
              placeholder="Short description (optional)"
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {DEFAULT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: c, borderColor: form.color === c ? '#1f2937' : 'transparent' }}
                >
                  {form.color === c && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
              <input
                type="color"
                value={form.color}
                onChange={e => setForm({ ...form, color: e.target.value })}
                className="w-8 h-8 rounded-full cursor-pointer border border-gray-300"
                title="Custom color"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              {loading ? <LoadingSpinner size="sm" /> : (category ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const CategoriesManagement = () => {
  const { success, error } = useToast()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const fetchCategories = async () => {
    try {
      const res = await categoriesAPI.getAll()
      setCategories(res.data)
    } catch {
      error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const handleEdit = (cat) => {
    setEditTarget(cat)
    setModalOpen(true)
  }

  const handleAdd = () => {
    setEditTarget(null)
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await categoriesAPI.delete(id)
      success('Category deleted!')
      fetchCategories()
    } catch (err) {
      error(err.response?.data?.message || 'Delete failed')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm">{categories.length} categories total</p>
        </div>
        <button onClick={handleAdd} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 mb-4">No categories yet</p>
          <button onClick={handleAdd} className="btn btn-primary">
            <Plus className="w-4 h-4 mr-2" /> Create first category
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat._id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <div>
                  <p className="font-semibold text-gray-900">{cat.name}</p>
                  {cat.description && (
                    <p className="text-sm text-gray-500 line-clamp-1">{cat.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">/{cat.slug}</p>
                </div>
              </div>
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => handleEdit(cat)}
                  className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteId(cat._id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add/Edit */}
      {modalOpen && (
        <CategoryModal
          category={editTarget}
          onClose={() => setModalOpen(false)}
          onSaved={fetchCategories}
        />
      )}

      {/* Confirm Delete */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Category?</h3>
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

export default CategoriesManagement
