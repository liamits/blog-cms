import { Routes, Route } from 'react-router-dom'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardHome from '../components/dashboard/DashboardHome'
import PostsManagement from '../components/dashboard/PostsManagement'
import CategoriesManagement from '../components/dashboard/CategoriesManagement'

const DashboardPage = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="posts" element={<PostsManagement />} />
        <Route path="categories" element={<CategoriesManagement />} />
      </Routes>
    </DashboardLayout>
  )
}

export default DashboardPage