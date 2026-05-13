import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api, useAuthStore } from "../lib/api";

interface Session {
  sessionId: string;
  examId: string;
  examTitle: string;
  score: number | null;
  totalScore: number | null;
  startedAt: string;
  submittedAt: string | null;
  // Admin / Teacher specific fields
  userId?: string;
  userName?: string;
  userEmail?: string;
}

export default function HistoryPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "teacher";
  const [searchTerm, setSearchTerm] = useState("");
  const [examFilter, setExamFilter] = useState("");

  const { data: sessions, isLoading, error } = useQuery<Session[]>({
    queryKey: isAdmin
      ? ["admin-sessions"]
      : isTeacher
        ? ["teacher-sessions"]
        : ["sessions", "my"],
    queryFn: async () => {
      if (isAdmin) return api.get("/sessions/admin/all").then((r) => r.data);
      if (isTeacher) return api.get("/sessions/teacher/my").then((r) => r.data);
      return api.get("/sessions/my").then((r) => r.data);
    },
  });

  if (isLoading)
    return <div className="text-center py-20 text-white/60">Đang tải lịch sử...</div>;
  if (error)
    return (
      <div className="text-center py-20 text-red-400">
        Đã có lỗi xảy ra khi tải lịch sử làm bài.
      </div>
    );

  const getStudentId = (email: string) => email.split("@")[0].toUpperCase();

  // Danh sách đề thi duy nhất để filter (teacher)
  const examTitles = isTeacher
    ? [...new Set(sessions?.map((s) => s.examTitle) ?? [])]
    : [];

  const filteredSessions = sessions
    ?.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .filter((s) => {
      if (!isAdmin && !isTeacher) return true;
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        !search ||
        s.userName?.toLowerCase().includes(search) ||
        s.examTitle.toLowerCase().includes(search) ||
        s.userEmail?.toLowerCase().includes(search);
      const matchesExam = !examFilter || s.examTitle === examFilter;
      return matchesSearch && matchesExam;
    });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">
            {isAdmin
              ? "Quản lý lịch sử thi"
              : isTeacher
                ? "Lịch sử thi của học sinh"
                : "Lịch sử làm bài"}
          </h1>
          <p className="text-white/40 mt-1">
            {isAdmin
              ? "Theo dõi kết quả thi của tất cả thí sinh"
              : isTeacher
                ? "Kết quả làm bài trên các đề thi của bạn"
                : "Xem lại quá trình luyện tập của bạn"}
          </p>
        </div>

        {/* Search + Filter cho admin & teacher */}
        {(isAdmin || isTeacher) && (
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Tìm học sinh hoặc đề thi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all duration-200"
              />
              <div className="absolute left-4 top-3 text-white/30">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Exam filter (teacher only) */}
            {isTeacher && examTitles.length > 0 && (
              <select
                value={examFilter}
                onChange={(e) => setExamFilter(e.target.value)}
                className="px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-sky-500 transition-all duration-200 text-sm"
              >
                <option value="">Tất cả đề thi</option>
                {examTitles.map((title) => (
                  <option key={title} value={title}>{title}</option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {filteredSessions?.length === 0 ? (
        <div className="bg-slate-800/50 rounded-2xl border border-white/10 p-12 text-center">
          <p className="text-white/40 italic">
            {searchTerm || examFilter
              ? "Không tìm thấy kết quả phù hợp."
              : "Chưa có dữ liệu lịch sử thi."}
          </p>
          {!isAdmin && !isTeacher && !searchTerm && (
            <Link
              to="/home"
              className="mt-4 inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-medium"
            >
              Khám phá các đề thi ngay <span className="text-lg">→</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5">
              <thead className="bg-slate-800/80">
                <tr>
                  {(isAdmin || isTeacher) && (
                    <>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white/40 uppercase tracking-widest">
                        Học sinh
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white/40 uppercase tracking-widest">
                        Mã SV
                      </th>
                    </>
                  )}
                  <th className="px-6 py-4 text-left text-xs font-bold text-white/40 uppercase tracking-widest">
                    Đề thi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white/40 uppercase tracking-widest">
                    Điểm số
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white/40 uppercase tracking-widest">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white/40 uppercase tracking-widest">
                    Thời gian
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-white/40 uppercase tracking-widest">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSessions?.map((session) => {
                  const isSubmitted = !!session.submittedAt;

                  return (
                    <tr
                      key={session.sessionId}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      {(isAdmin || isTeacher) && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                              {session.userName}
                            </div>
                            <div className="text-xs text-white/40">{session.userEmail}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
                              {session.userEmail ? getStudentId(session.userEmail) : "N/A"}
                            </span>
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white group-hover:text-sky-400 transition-colors">
                          {session.examTitle}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isSubmitted ? (
                          <span className="font-black text-sky-400 text-sm">
                            {session.score}/{session.totalScore}
                          </span>
                        ) : (
                          <span className="text-sm text-white/20">--</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            isSubmitted
                              ? "bg-green-500/10 border border-green-500/30 text-green-400"
                              : "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                          }`}
                        >
                          {isSubmitted ? "Đã nộp" : "Chưa nộp"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/40">
                        <div className="font-medium text-white/60">
                          {new Date(session.startedAt).toLocaleDateString("vi-VN")}
                        </div>
                        <div className="text-xs">
                          {new Date(session.startedAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {isSubmitted && (
                          <Link
                            to={`/sessions/${session.sessionId}/result`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-white transition-all duration-200"
                          >
                            Xem chi tiết
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
