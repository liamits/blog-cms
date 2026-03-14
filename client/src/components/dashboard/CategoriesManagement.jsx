const CategoriesManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
          <p className="text-gray-600">Organize your content with categories</p>
        </div>
        <button className="btn btn-primary">
          Add New Category
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Categories management coming soon...</p>
      </div>
    </div>
  )
}

export default CategoriesManagement