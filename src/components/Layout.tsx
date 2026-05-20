import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore, api } from "../lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [adminOpen, setAdminOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<{
    id: string;
    title: string;
    content: string;
    createdAt: string;
    isRead: boolean;
  } | null>(null);
  const queryClient = useQueryClient();

  // Chỉ fetch khi là candidate
  const { data: unreadData } = useQuery({
    queryKey: ["unread-count"],
    queryFn: async () => {
      const res = await api.get("/notifications/unread-count");
      return res.data as { count: number };
    },
    enabled: user?.role === "candidate",
    refetchInterval: 30000,
  });

  const { data: notifications } = useQuery({
    queryKey: ["notifications-my"],
    queryFn: async () => {
      const res = await api.get("/notifications/my");
      return res.data as {
        id: string;
        classroomId: string;
        title: string;
        content: string;
        createdAt: string;
        isRead: boolean;
      }[];
    },
    enabled: user?.role === "candidate" && notifOpen,
  });

  const readMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-my"] });
    },
  });

  const readAllMutation = useMutation({
    mutationFn: async () => {
      await api.post("/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-my"] });
    },
  });

  const unreadCount = unreadData?.count ?? 0;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/90 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link
                to="/home"
                className="flex items-center gap-2 font-black text-xl"
              >
                <span className="text-sky-400">✦</span>
                <span className="text-white">QuizApp</span>
              </Link>

              <div className="hidden sm:flex items-center gap-6">
                {user?.role === "candidate" && (
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

                {user?.role === "teacher" && (
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
                    <NavLink
                      to="/history"
                      className={({ isActive }) =>
                        `text-sm font-medium transition-colors duration-200
                        ${isActive ? "text-sky-400" : "text-white/60 hover:text-white"}`
                      }
                    >
                      Lịch sử thi
                    </NavLink>
                  </>
                )}

                {user?.role === "admin" && (
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
                          className={`w-4 h-4 transition-transform duration-200 ${adminOpen ? "rotate-180" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {adminOpen && (
                        <div className="absolute top-full left-0 w-full h-2" />
                      )}

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
                  {/* Bell icon — chỉ hiện với candidate */}
                  {user?.role === "candidate" && (
                    <div className="relative">
                      <button
                        onClick={() => setNotifOpen(!notifOpen)}
                        className="relative p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </button>

                      {/* Dropdown thông báo */}
                      {notifOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setNotifOpen(false)}
                          />
                          <div className="absolute right-0 top-[calc(100%+8px)] w-80 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl shadow-black/40 z-50 overflow-hidden">
                            {/* Header dropdown */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                              <span className="text-sm font-bold text-white">
                                Thông báo
                              </span>
                              {unreadCount > 0 && (
                                <button
                                  onClick={() => readAllMutation.mutate()}
                                  className="text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
                                >
                                  Đánh dấu tất cả đã đọc
                                </button>
                              )}
                            </div>

                            {/* Danh sách thông báo */}
                            <div className="max-h-96 overflow-y-auto">
                              {!notifications || notifications.length === 0 ? (
                                <div className="px-4 py-8 text-center text-white/30 text-sm italic">
                                  Không có thông báo nào
                                </div>
                              ) : (
                                notifications.map((notif) => (
                                  <div
                                    key={notif.id}
                                    onClick={() => {
                                      if (!notif.isRead)
                                        readMutation.mutate(notif.id);
                                      setSelectedNotif(notif);
                                      setNotifOpen(false);
                                    }}
                                    className={`px-4 py-3 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5 ${
                                      !notif.isRead ? "bg-sky-500/5" : ""
                                    }`}
                                  >
                                    <div className="flex items-start gap-2">
                                      {!notif.isRead && (
                                        <span className="flex-shrink-0 w-2 h-2 bg-sky-400 rounded-full mt-1.5" />
                                      )}
                                      <div
                                        className={!notif.isRead ? "" : "ml-4"}
                                      >
                                        <p
                                          className={`text-sm font-semibold ${notif.isRead ? "text-white/60" : "text-white"}`}
                                        >
                                          {notif.title}
                                        </p>
                                        <p className="text-xs text-white/40 mt-0.5 line-clamp-2">
                                          {notif.content}
                                        </p>
                                        <p className="text-[10px] text-white/20 mt-1">
                                          {new Date(
                                            notif.createdAt,
                                          ).toLocaleDateString("vi-VN", {
                                            day: "numeric",
                                            month: "short",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  <span className="text-sm text-white/60">
                    Chào, {user.name}
                  </span>
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

      {/* Modal xem chi tiết thông báo */}
      {selectedNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-white font-bold text-base">
                {selectedNotif.title}
              </h3>
              <button
                onClick={() => setSelectedNotif(null)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                {selectedNotif.content}
              </p>
              <p className="text-white/20 text-xs mt-4">
                {new Date(selectedNotif.createdAt).toLocaleDateString("vi-VN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="px-6 py-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedNotif(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white/70 hover:text-white rounded-xl text-sm font-medium transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
