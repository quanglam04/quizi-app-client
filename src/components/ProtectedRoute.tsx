import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../lib/api'

export default function ProtectedRoute({
  children,
  allowedRoles,        // ['admin'] hoặc ['teacher'] hoặc ['admin', 'teacher']
}: {
  children: React.ReactNode
  allowedRoles?: Array<'admin' | 'teacher' | 'candidate'>
}) {
  const { user, token } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
