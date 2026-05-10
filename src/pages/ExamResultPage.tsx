import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';

interface ResultDetail {
  questionContent: string;
  questionExplain: string | null;
  chosenOptionId: string | null;
  chosenOptionContent: string | null;
  correctOptionContent: string | null;
  isCorrect: boolean | null;
}

interface ExamResult {
  session: {
    id: string;
    examId: string;
    userId: string;
    startedAt: string;
    submittedAt: string;
    score: number;
    totalScore: number;
  };
  detail: ResultDetail[];
}

export default function ExamResultPage() {
  const { id: sessionId } = useParams<{ id: string }>();

  const { data: result, isLoading, error } = useQuery<ExamResult>({
    queryKey: ['sessions', sessionId, 'result'],
    queryFn: async () => {
      const response = await api.get(`/sessions/${sessionId}/result`);
      return response.data;
    },
    enabled: !!sessionId,
  });

  if (isLoading) return <div className="text-center py-20">Đang tải kết quả...</div>;
  if (error || !result) return <div className="text-center py-20 text-red-500">Không tìm thấy kết quả cho phiên làm bài này.</div>;

  const { session, detail } = result;
  const percentage = Math.round((session.score / session.totalScore) * 100);
  const isPassed = percentage >= 60;

  const started = new Date(session.startedAt);
  const submitted = new Date(session.submittedAt);
  const durationInSeconds = Math.floor((submitted.getTime() - started.getTime()) / 1000);
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = durationInSeconds % 60;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Score Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className={`h-2 ${isPassed ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Kết quả bài thi</h1>
          <div className="flex justify-center items-center space-x-8 mt-6">
            <div className="text-center">
              <div className="text-4xl font-extrabold text-indigo-600">
                {session.score}/{session.totalScore}
              </div>
              <div className="text-sm text-gray-500 mt-1">Số câu đúng</div>
            </div>
            <div className="h-12 w-px bg-gray-200"></div>
            <div className="text-center">
              <div className={`text-4xl font-extrabold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                {percentage}%
              </div>
              <div className="text-sm text-gray-500 mt-1">Phần trăm</div>
            </div>
            <div className="h-12 w-px bg-gray-200"></div>
            <div className="text-center">
              <span className={`inline-flex items-center px-4 py-1 rounded-full text-lg font-semibold ${
                isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isPassed ? 'Đạt' : 'Chưa đạt'}
              </span>
              <div className="text-sm text-gray-500 mt-1">Trạng thái</div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-gray-600 max-w-sm mx-auto">
            <div className="flex justify-between border-b pb-2">
              <span>Thời gian làm bài:</span>
              <span className="font-medium">{minutes} phút {seconds} giây</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Ngày thi:</span>
              <span className="font-medium">{new Date(session.submittedAt).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>

          <div className="mt-8 flex justify-center space-x-4">
            <Link
              to="/"
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Về trang chủ
            </Link>
            <Link
              to="/history"
              className="px-6 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
            >
              Xem lịch sử
            </Link>
          </div>
        </div>
      </div>

      {/* Question Details */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Chi tiết câu hỏi</h2>
        {detail.map((item, idx) => (
          <div key={idx} className={`bg-white p-6 rounded-lg border-l-4 shadow-sm ${
            item.isCorrect ? 'border-green-500' : item.chosenOptionId ? 'border-red-500' : 'border-gray-300'
          }`}>
            <div className="flex items-start">
              <span className="font-bold text-gray-500 mr-3">Câu {idx + 1}:</span>
              <div className="flex-grow">
                <p className="text-lg text-gray-800 font-medium mb-4">{item.questionContent}</p>
                
                <div className="space-y-2 mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500 mr-2">Bạn chọn:</span>
                    {item.chosenOptionContent ? (
                      <span className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${
                        item.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.chosenOptionContent}
                        {item.isCorrect ? (
                          <svg className="ml-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="ml-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Bỏ qua</span>
                    )}
                  </div>

                  {!item.isCorrect && item.correctOptionContent && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 mr-2">Đáp án đúng:</span>
                      <span className="inline-flex items-center px-3 py-1 rounded text-sm font-medium bg-green-100 text-green-800">
                        {item.correctOptionContent}
                        <svg className="ml-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    </div>
                  )}
                </div>

                {item.questionExplain && (
                  <div className="bg-blue-50 p-4 rounded-md">
                    <p className="text-sm font-semibold text-blue-800 mb-1 flex items-center">
                      <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Giải thích:
                    </p>
                    <p className="text-sm text-blue-700 leading-relaxed">{item.questionExplain}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
