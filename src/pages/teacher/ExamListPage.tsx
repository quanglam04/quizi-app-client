import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../../lib/api";
import { SkeletonTable } from "../../components/Skeleton";

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
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span className="text-white/80">Xóa "{title}"?</span>
          <div className="flex gap-2">
            <button
              onClick={() => { deleteMutation.mutate(id); toast.dismiss(t.id); }}
              className="px-3 py-1 bg-red-500 hover:bg-red-400 text-white text-xs rounded-lg transition-colors"
            >
              Xóa
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white/70 text-xs rounded-lg transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      ),
      {
        duration: 5000,
        style: {
          background: "#1e293b",
          border: "1px solid rgba(248,113,113,0.3)",
          borderRadius: "12px",
          padding: "12px 16px",
        },
      },
    );
  };

  const handleToggle = (id: string, currentStatus: boolean) => {
    toggleMutation.mutate({ id, isPublished: !currentStatus });
  };

  if (isLoading)
    return (
      <div className="p-6">
        <SkeletonTable rows={6} />
      </div>
    );
  if (error)
    return (
      <div className="text-center py-20 text-red-400">Đã có lỗi xảy ra.</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Quản lý đề thi của tôi</h1>
        <button
          onClick={() => navigate("/teacher/exams/new")}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
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

      <div className="bg-slate-900 rounded-2xl border border-white/10 overflow-hidden">
        <ul className="divide-y divide-white/5">
          {exams?.length === 0 ? (
            <li className="px-6 py-12 text-center text-white/30 italic">
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
                  className="hover:bg-white/5 transition-colors"
                >
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex-grow min-w-0 pr-4">
                      <div className="flex items-center flex-wrap gap-2">
                        <p className="text-sm font-bold text-sky-400 truncate">
                          {exam.title}
                        </p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            exam.isPublished
                              ? "bg-green-500/10 border border-green-500/30 text-green-400"
                              : "bg-white/5 border border-white/10 text-white/40"
                          }`}
                        >
                          {exam.isPublished ? "Published" : "Draft"}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            exam.visibility === 'public'
                              ? "bg-sky-500/10 border border-sky-500/30 text-sky-400"
                              : "bg-purple-500/10 border border-purple-500/30 text-purple-400"
                          }`}
                        >
                          {exam.visibility === 'public' ? "Công khai" : "Chỉ lớp"}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-white/40 space-x-4">
                        <div className="flex items-center">
                          <svg
                            className="flex-shrink-0 mr-1.5 h-4 w-4 text-white/20"
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
                            className="flex-shrink-0 mr-1.5 h-4 w-4 text-white/20"
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
                        className={`text-sm font-medium transition-colors ${exam.isPublished ? "text-orange-400 hover:text-orange-300" : "text-green-400 hover:text-green-300"}`}
                      >
                        {exam.isPublished ? "Hạ xuống Draft" : "Công khai"}
                      </button>
                      <Link
                        to={`/teacher/exams/${exam.id}`}
                        className="text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors"
                      >
                        Chỉnh sửa
                      </Link>
                      <button
                        onClick={() => handleDelete(exam.id, exam.title)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
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
