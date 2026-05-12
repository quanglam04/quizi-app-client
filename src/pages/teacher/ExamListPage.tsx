import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

interface Exam {
  id: string;
  title: string;
  duration: number;
  isPublished: boolean;
  visibility: 'public' | 'class_only';
  createdAt: string;
}

export default function TeacherExamList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: exams,
    isLoading,
    error,
  } = useQuery<Exam[]>({
    queryKey: ["teacher-exams"],
    queryFn: async () => {
      const response = await api.get("/exams/teacher/my");
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/exams/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-exams"] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({
      id,
      isPublished,
    }: {
      id: string;
      isPublished: boolean;
    }) => {
      await api.patch(`/exams/${id}`, { isPublished });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-exams"] });
    },
  });

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đề thi "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggle = (id: string, currentStatus: boolean) => {
    toggleMutation.mutate({ id, isPublished: !currentStatus });
  };

  if (isLoading)
    return (
      <div className="text-center py-20">Đang tải danh sách đề thi...</div>
    );
  if (error)
    return (
      <div className="text-center py-20 text-red-500">Đã có lỗi xảy ra.</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đề thi của tôi</h1>
        <button
          onClick={() => navigate("/teacher/exams/new")}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <svg
            className="-ml-1 mr-2 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Tạo đề mới
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {exams?.length === 0 ? (
            <li className="px-6 py-12 text-center text-gray-500">
              Bạn chưa có đề thi nào. Hãy tạo mới!
            </li>
          ) : (
            exams
              ?.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )
              .map((exam) => (
                <li
                  key={exam.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex-grow min-w-0 pr-4">
                      <div className="flex items-center flex-wrap gap-2">
                        <p className="text-sm font-bold text-indigo-600 truncate">
                          {exam.title}
                        </p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            exam.isPublished
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {exam.isPublished ? "Published" : "Draft"}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            exam.visibility === 'public'
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {exam.visibility === 'public' ? "Công khai" : "Chỉ lớp"}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <svg
                            className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {exam.duration} phút
                        </div>
                        <div className="flex items-center">
                          <svg
                            className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {new Date(exam.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleToggle(exam.id, exam.isPublished)}
                        className={`text-sm font-medium ${exam.isPublished ? "text-orange-600 hover:text-orange-900" : "text-green-600 hover:text-green-900"}`}
                      >
                        {exam.isPublished ? "Hạ xuống Draft" : "Công khai"}
                      </button>
                      <Link
                        to={`/teacher/exams/${exam.id}`}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Chỉnh sửa
                      </Link>
                      <button
                        onClick={() => handleDelete(exam.id, exam.title)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </li>
              ))
          )}
        </ul>
      </div>
    </div>
  );
}
