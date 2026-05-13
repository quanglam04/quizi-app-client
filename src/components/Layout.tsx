import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/api';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [adminOpen, setAdminOpen] = useState(false);

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
                    <div
                      className="relative"
                      onMouseEnter={() => setAdminOpen(true)}
                      onMouseLeave={() => setAdminOpen(false)}
                    >
                      <button className="flex items-center gap-1 text-sm font-medium text-white/60 hover:text-white transition-colors duration-200 py-2">
                        Admin
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${adminOpen ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {adminOpen && <div className="absolute top-full left-0 w-full h-2" />}

                      {adminOpen && (
                        <div className="absolute top-[calc(100%+4px)] left-0 w-52 bg-slate-800 border border-white/10 rounded-xl shadow-xl shadow-black/30 overflow-hidden z-50 py-1">
                          <Link
                            to="/admin/exams"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors duration-150"
                          >
                            📝 Quản lý đề thi
                          </Link>
                          <Link
                            to="/admin/blog"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors duration-150"
                          >
                            ✍️ Quản lý blog
                          </Link>
                          <Link
                            to="/admin/users"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors duration-150"
                          >
                            👥 Quản lý user
                          </Link>
                        </div>
                      )}
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
