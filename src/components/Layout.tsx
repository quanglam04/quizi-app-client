import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/api';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/90 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/home" className="flex items-center gap-2 font-black text-xl">
                <span className="text-sky-400">✦</span>
                <span className="text-white">QuizApp</span>
              </Link>
              
              <div className="hidden sm:flex items-center gap-6">
                {user?.role === 'candidate' && (
                  <>
                    <NavLink
                      to="/home"
                      className={({ isActive }) =>
                        `text-sm font-medium transition-colors duration-200
                        ${isActive ? "text-sky-400" : "text-white/60 hover:text-white"}`
                      }
                    >
                      Đề thi
                    </NavLink>
                    <NavLink
                      to="/classrooms"
                      className={({ isActive }) =>
                        `text-sm font-medium transition-colors duration-200
                        ${isActive ? "text-sky-400" : "text-white/60 hover:text-white"}`
                      }
                    >
                      Lớp học
                    </NavLink>
                    <NavLink
                      to="/blog"
                      className={({ isActive }) =>
                        `text-sm font-medium transition-colors duration-200
                        ${isActive ? "text-sky-400" : "text-white/60 hover:text-white"}`
                      }
                    >
                      Blog
                    </NavLink>
                    <NavLink
                      to="/history"
                      className={({ isActive }) =>
                        `text-sm font-medium transition-colors duration-200
                        ${isActive ? "text-sky-400" : "text-white/60 hover:text-white"}`
                      }
                    >
                      Lịch sử
                    </NavLink>
                  </>
                )}

                {user?.role === 'teacher' && (
                  <>
                    <NavLink
                      to="/teacher/classrooms"
                      className={({ isActive }) =>
                        `text-sm font-medium transition-colors duration-200
                        ${isActive ? "text-sky-400" : "text-white/60 hover:text-white"}`
                      }
                    >
                      Lớp học
                    </NavLink>
                    <NavLink
                      to="/teacher/exams"
                      className={({ isActive }) =>
                        `text-sm font-medium transition-colors duration-200
                        ${isActive ? "text-sky-400" : "text-white/60 hover:text-white"}`
                      }
                    >
                      Đề thi
                    </NavLink>
                    <NavLink
                      to="/blog"
                      className={({ isActive }) =>
                        `text-sm font-medium transition-colors duration-200
                        ${isActive ? "text-sky-400" : "text-white/60 hover:text-white"}`
                      }
                    >
                      Blog
                    </NavLink>
                  </>
                )}

                {user?.role === 'admin' && (
                  <>
                    <NavLink
                      to="/blog"
                      className={({ isActive }) =>
                        `text-sm font-medium transition-colors duration-200
                        ${isActive ? "text-sky-400" : "text-white/60 hover:text-white"}`
                      }
                    >
                      Blog
                    </NavLink>
                    <div className="relative flex items-center group">
                      <button className="text-white/60 group-hover:text-white inline-flex items-center text-sm font-medium transition-colors">
                        Admin
                        <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div className="absolute left-0 mt-40 w-48 rounded-xl shadow-xl bg-slate-900 border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 pointer-events-none group-hover:pointer-events-auto overflow-hidden">
                        <div className="py-1">
                          <Link
                            to="/admin/exams"
                            className="block px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-sky-400"
                          >
                            Quản lý đề thi
                          </Link>
                          <Link
                            to="/admin/blog"
                            className="block px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-sky-400"
                          >
                            Quản lý blog
                          </Link>
                          <Link
                            to="/admin/users"
                            className="block px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-sky-400"
                          >
                            Quản lý User
                          </Link>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-white/60">Chào, {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-1.5 rounded-lg text-sm
                    bg-sky-500/10 border border-sky-500/30 text-sky-400
                    hover:bg-sky-500 hover:text-white hover:border-sky-500
                    transition-all duration-200"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-1.5 rounded-lg text-sm
                  bg-sky-500 text-white font-medium
                  hover:bg-sky-400 hover:scale-105
                  transition-all duration-200"
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      <footer className="bg-slate-950 border-t border-white/10">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-white/40 text-sm">
            &copy; 2026 Quiz App. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
