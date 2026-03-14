const PostsManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Posts Management</h1>
          <p className="text-gray-600">Create and manage your blog posts</p>
        </div>
        <button className="btn btn-primary">
          Add New Post
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Posts management coming soon...</p>
      </div>
    </div>
  )
}

export default PostsManagement