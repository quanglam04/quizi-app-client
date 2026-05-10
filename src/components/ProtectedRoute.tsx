import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../lib/api'

export default function ProtectedRoute({ children, adminOnly = false }: {
  children: React.ReactNode
  adminOnly?: boolean
}) {
  const { user, token } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}
