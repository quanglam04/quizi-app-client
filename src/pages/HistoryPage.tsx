import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

interface Session {
  sessionId: string;
  examId: string;
  examTitle: string;
  score: number | null;
  totalScore: number | null;
  startedAt: string;
  submittedAt: string | null;
}

export default function HistoryPage() {
  const {
    data: sessions,
    isLoading,
    error,
  } = useQuery<Session[]>({
    queryKey: ["sessions", "my"],
    queryFn: async () => {
      const response = await api.get("/sessions/my");
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Lịch sử làm bài</h1>

      {sessions?.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 italic">
            Bạn chưa thực hiện bài thi nào.
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Khám phá các đề thi ngay &rarr;
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
              {sessions
                ?.sort(
                  (a, b) =>
                    new Date(b.startedAt).getTime() -
                    new Date(a.startedAt).getTime(),
                )
                .map((session) => {
                  const isSubmitted = !!session.submittedAt;
                  const scorePercentage =
                    session.score && session.totalScore
                      ? Math.round((session.score / session.totalScore) * 100)
                      : null;

                  return (
                    <tr
                      key={session.sessionId}
                      className="hover:bg-gray-50 transition-colors"
                    >
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
                            <span className="ml-2 text-xs text-gray-500">
                              ({scorePercentage}%)
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
                            Xem kết quả
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
