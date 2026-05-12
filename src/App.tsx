import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import LoginPage      from './pages/LoginPage'
import RegisterPage   from './pages/RegisterPage'
import LandingPage    from './pages/LandingPage'
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

// Teacher pages
import ClassroomListPage   from './pages/teacher/ClassroomListPage'
import ClassroomDetailPage from './pages/teacher/ClassroomDetailPage'
import TeacherExamList     from './pages/teacher/ExamListPage'
import TeacherExamEdit     from './pages/teacher/ExamEditPage'

// Candidate pages
import CandidateClassroom  from './pages/candidate/ClassroomPage'
import { useAuthStore } from './lib/api'

function LayoutWrapper() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

function LandingOrHome() {
  const { token } = useAuthStore()
  if (token) return <Navigate to="/home" replace />
  return <LandingPage />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing */}
        <Route path="/" element={<LandingOrHome />} />

        {/* Auth - No Layout */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* App with Layout */}
        <Route element={<LayoutWrapper />}>
          {/* Public */}
          <Route path="/blog"       element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />

          {/* Candidate */}
          <Route path="/home" element={<ProtectedRoute><ExamListPage /></ProtectedRoute>} />
          <Route path="/exams/:id/take"   element={<ProtectedRoute><ExamTakePage /></ProtectedRoute>} />
          <Route path="/sessions/:id/result" element={<ProtectedRoute><ExamResultPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/classrooms" element={<ProtectedRoute><CandidateClassroom /></ProtectedRoute>} />

          {/* Teacher */}
          <Route path="/teacher/classrooms"
            element={<ProtectedRoute allowedRoles={['teacher']}><ClassroomListPage /></ProtectedRoute>} />
          <Route path="/teacher/classrooms/:id"
            element={<ProtectedRoute allowedRoles={['teacher']}><ClassroomDetailPage /></ProtectedRoute>} />
          <Route path="/teacher/exams"
            element={<ProtectedRoute allowedRoles={['teacher']}><TeacherExamList /></ProtectedRoute>} />
          <Route path="/teacher/exams/:id"
            element={<ProtectedRoute allowedRoles={['teacher']}><TeacherExamEdit /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/exams"         element={<ProtectedRoute allowedRoles={['admin']}><AdminExamList /></ProtectedRoute>} />
          <Route path="/admin/exams/:id"     element={<ProtectedRoute allowedRoles={['admin']}><AdminExamEdit /></ProtectedRoute>} />
          <Route path="/admin/blog"          element={<ProtectedRoute allowedRoles={['admin']}><AdminBlogList /></ProtectedRoute>} />
          <Route path="/admin/blog/:id/edit" element={<ProtectedRoute allowedRoles={['admin']}><AdminBlogEdit /></ProtectedRoute>} />
          <Route path="/admin/users"         element={<ProtectedRoute allowedRoles={['admin']}><AdminUserList /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
