import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import LoginPage      from './pages/LoginPage'
import RegisterPage   from './pages/RegisterPage'
import ExamListPage   from './pages/ExamListPage'
import ExamTakePage   from './pages/ExamTakePage'
import ExamResultPage from './pages/ExamResultPage'
import HistoryPage    from './pages/HistoryPage'
import BlogListPage   from './pages/BlogListPage'
import BlogPostPage   from './pages/BlogPostPage'

// Admin pages
import AdminExamList   from './pages/admin/ExamListPage'
import AdminExamEdit   from './pages/admin/ExamEditPage'
import AdminBlogList   from './pages/admin/BlogListPage'
import AdminBlogEdit   from './pages/admin/BlogEditPage'
import AdminUserList   from './pages/admin/UserListPage'

function LayoutWrapper() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth - No Layout */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* App with Layout */}
        <Route element={<LayoutWrapper />}>
          {/* Public */}
          <Route path="/blog"       element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />

          {/* Candidate */}
          <Route path="/" element={<ProtectedRoute><ExamListPage /></ProtectedRoute>} />
          <Route path="/exams/:id/take"   element={<ProtectedRoute><ExamTakePage /></ProtectedRoute>} />
          <Route path="/sessions/:id/result" element={<ProtectedRoute><ExamResultPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/exams"         element={<ProtectedRoute adminOnly><AdminExamList /></ProtectedRoute>} />
          <Route path="/admin/exams/:id"     element={<ProtectedRoute adminOnly><AdminExamEdit /></ProtectedRoute>} />
          <Route path="/admin/blog"          element={<ProtectedRoute adminOnly><AdminBlogList /></ProtectedRoute>} />
          <Route path="/admin/blog/:id/edit" element={<ProtectedRoute adminOnly><AdminBlogEdit /></ProtectedRoute>} />
          <Route path="/admin/users"         element={<ProtectedRoute adminOnly><AdminUserList /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
