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
  // Admin specific fields
  userId?: string;
  userName?: string;
  userEmail?: string;
}

export default function HistoryPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: sessions,
    isLoading,
    error,
  } = useQuery<Session[]>({
    queryKey: isAdmin ? ["admin-sessions"] : ["sessions", "my"],
    queryFn: async () => {
      const response = isAdmin 
        ? await api.get("/sessions/admin/all")
        : await api.get("/sessions/my");
      return response.data;
    },
  });

  if (isLoading)
    return <div className="text-center py-20">Đang tải lịch sử...</div>;
  if (error)
    return (
      <div className="text-center py-20 text-red-500">
        Đã có lỗi xảy ra khi tải lịch sử làm bài.
      </div>
    );

  const getStudentId = (email: string) => {
    return email.split("@")[0].toUpperCase();
  };

  const filteredSessions = sessions
    ?.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .filter((s) => {
      if (!isAdmin) return true;
      const search = searchTerm.toLowerCase();
      return (
        s.userName?.toLowerCase().includes(search) ||
        s.examTitle.toLowerCase().includes(search) ||
        s.userEmail?.toLowerCase().includes(search)
      );
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {isAdmin ? "Quản lý lịch sử thi" : "Lịch sử làm bài"}
        </h1>
        
        {isAdmin && (
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Tìm sinh viên hoặc đề thi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {filteredSessions?.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 italic">
            {searchTerm ? "Không tìm thấy kết quả phù hợp." : "Chưa có dữ liệu lịch sử thi."}
          </p>
          {!isAdmin && !searchTerm && (
            <Link
              to="/"
              className="mt-4 inline-flex text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Khám phá các đề thi ngay &rarr;
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {isAdmin && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sinh viên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã SV
                    </th>
                  </>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đề thi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Điểm số
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSessions?.map((session) => {
                const isSubmitted = !!session.submittedAt;

                return (
                  <tr
                    key={session.sessionId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {isAdmin && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{session.userName}</div>
                          <div className="text-xs text-gray-500">{session.userEmail}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs font-mono font-bold text-gray-600">
                            {session.userEmail ? getStudentId(session.userEmail) : "N/A"}
                          </span>
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {session.examTitle}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isSubmitted ? (
                        <div className="text-sm text-gray-900">
                          <span className="font-bold text-indigo-600">
                            {session.score}/{session.totalScore}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isSubmitted
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {isSubmitted ? "Đã nộp" : "Chưa nộp"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        {new Date(session.startedAt).toLocaleDateString(
                          "vi-VN",
                        )}
                      </div>
                      <div className="text-xs">
                        {new Date(session.startedAt).toLocaleTimeString(
                          "vi-VN",
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {isSubmitted && (
                        <Link
                          to={`/sessions/${session.sessionId}/result`}
                          className="text-indigo-600 hover:text-indigo-900"
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
      )}
    </div>
  );
}
