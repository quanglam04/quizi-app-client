import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { SkeletonCard } from '../components/Skeleton';

interface Exam {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  isPublished: boolean;
  createdAt: string;
}

export default function ExamListPage() {
  const navigate = useNavigate();

  const { data: exams, isLoading, error } = useQuery<Exam[]>({
    queryKey: ['exams'],
    queryFn: async () => {
      const response = await api.get('/exams');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400">Đã có lỗi xảy ra khi tải danh sách đề thi. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">Đề thi</h1>
        <p className="text-white/40 mt-1">Chọn đề thi để bắt đầu luyện tập</p>
      </div>

      {exams?.length === 0 ? (
        <div className="bg-slate-800/50 rounded-2xl border border-white/10 p-12 text-center">
          <p className="text-white/40 italic">Hiện tại chưa có đề thi nào khả dụng.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams?.map((exam) => (
            <div
              key={exam.id}
              className="p-6 rounded-2xl bg-slate-800/50 border border-white/10
              hover:-translate-y-1 hover:border-sky-500/40 hover:shadow-lg hover:shadow-sky-500/10
              transition-all duration-300 group flex flex-col"
            >
              <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-sky-400 transition-colors truncate" title={exam.title}>
                {exam.title}
              </h3>
              <p className="text-white/40 text-sm mb-6 line-clamp-3 flex-grow">
                {exam.description || 'Không có mô tả cho đề thi này.'}
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <span className="flex items-center gap-1.5 text-white/40 text-sm">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {exam.duration} phút
                </span>
                <button
                  onClick={() => navigate(`/exams/${exam.id}/take`)}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-sm
                  rounded-lg font-medium hover:scale-105 transition-all duration-200"
                >
                  Làm bài →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
