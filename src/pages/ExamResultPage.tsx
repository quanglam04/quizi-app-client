import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";

interface ResultDetail {
  questionId: string;
  questionContent: string;
  questionExplain: string | null;
  questionType: "single" | "multiple";
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

  const {
    data: result,
    isLoading,
    error,
  } = useQuery<ExamResult>({
    queryKey: ["sessions", sessionId, "result"],
    queryFn: async () => {
      const response = await api.get(`/sessions/${sessionId}/result`);
      return response.data;
    },
    enabled: !!sessionId,
  });

  if (isLoading)
    return (
      <div className="text-center py-20 text-white/60">Đang tải kết quả...</div>
    );
  if (error || !result)
    return (
      <div className="text-center py-20 text-red-400">
        Không tìm thấy kết quả cho phiên làm bài này.
      </div>
    );

  const { session, detail } = result;
  const groupedDetail = Object.values(
    detail.reduce(
      (acc, item) => {
        const key = item.questionId;
        if (!acc[key]) {
          acc[key] = {
            ...item,
            chosenOptionContent: item.chosenOptionContent
              ? [item.chosenOptionContent]
              : [],
          };
        } else {
          if (item.chosenOptionContent) {
            (acc[key].chosenOptionContent as string[]).push(
              item.chosenOptionContent,
            );
          }
          // isCorrect của câu MCQ: chỉ đúng khi tất cả row đều đúng
          if (!item.isCorrect) acc[key].isCorrect = false;
        }
        return acc;
      },
      {} as Record<string, any>,
    ),
  );
  const percentage = Math.round((session.score / session.totalScore) * 100);
  const isPassed = percentage >= 60;

  const started = new Date(session.startedAt);
  const submitted = new Date(session.submittedAt);
  const durationInSeconds = Math.floor(
    (submitted.getTime() - started.getTime()) / 1000,
  );
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = durationInSeconds % 60;

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-20">
      {/* Score Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-cyan-500"></div>

        <h1 className="text-xl font-bold text-white/60 mb-6">
          Kết quả bài thi
        </h1>

        <div className="text-7xl font-black mb-4 bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
          {session.score}/{session.totalScore}
        </div>

        <div
          className={`inline-flex px-6 py-2 rounded-full text-sm font-bold mt-2 ${
            isPassed
              ? "bg-green-500/20 border border-green-500/40 text-green-400"
              : "bg-red-500/20 border border-red-500/40 text-red-400"
          }`}
        >
          {isPassed ? "✓ VƯỢT QUA" : "✗ CHƯA ĐẠT"}
        </div>

        <div className="grid grid-cols-2 gap-8 mt-12 max-w-sm mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{percentage}%</div>
            <div className="text-white/40 text-xs mt-1 uppercase tracking-wider">
              Phần trăm
            </div>
          </div>
          <div className="text-center border-l border-white/10">
            <div className="text-2xl font-bold text-white">
              {minutes}m {seconds}s
            </div>
            <div className="text-white/40 text-xs mt-1 uppercase tracking-wider">
              Thời gian
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center gap-4">
          <Link
            to="/home"
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white/70 rounded-xl font-medium transition-all"
          >
            Về trang chủ
          </Link>
          <Link
            to="/history"
            className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-sky-500/20"
          >
            Xem lịch sử
          </Link>
        </div>
      </div>

      {/* Question Details */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-white px-2">
          Chi tiết bài làm
        </h2>
        {groupedDetail.map((item, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-2xl border transition-all duration-300 ${
              item.isCorrect
                ? "bg-green-500/5 border-green-500/20"
                : item.chosenOptionId
                  ? "bg-red-500/5 border-red-500/20"
                  : "bg-slate-900 border-white/10"
            }`}
          >
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-white/40">
                {idx + 1}
              </span>
              <div className="flex-grow">
                <p className="text-lg text-white font-medium mb-6 leading-relaxed">
                  {item.questionContent}
                </p>

                <div className="space-y-3 mb-6">
                  {/* Your Answer */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white/30 uppercase tracking-widest">
                        Bạn chọn
                      </span>
                      {(item.chosenOptionContent as string[]).length > 0 &&
                        (item.isCorrect ? (
                          <span className="text-xs font-bold text-green-400">
                            ĐÚNG ✓
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-red-400">
                            SAI ✗
                          </span>
                        ))}
                    </div>
                    {(item.chosenOptionContent as string[]).length > 0 ? (
                      <div
                        className={`flex flex-col gap-2 p-3 rounded-xl border ${
                          item.isCorrect
                            ? "bg-green-500/10 border-green-500/30"
                            : "bg-red-500/10 border-red-500/30"
                        }`}
                      >
                        {(item.chosenOptionContent as string[]).map(
                          (opt, i) => (
                            <div
                              key={i}
                              className={`flex items-center gap-2 text-sm font-medium ${
                                item.isCorrect
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              <span className="flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center text-[10px] font-black opacity-60 border-current">
                                {String.fromCharCode(65 + i)}
                              </span>
                              {opt}
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl border border-white/5 bg-white/5 text-white/30 italic text-sm">
                        Bỏ qua
                      </div>
                    )}
                  </div>

                  {/* Correct Answer if wrong */}
                  {!item.isCorrect && item.correctOptions?.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-sky-400/30 uppercase tracking-widest">
                        Đáp án đúng
                      </span>
                      <div className="flex flex-col gap-2 p-3 rounded-xl border border-sky-500/30 bg-sky-500/10">
                        {item.correctOptions
                          .sort((a: any, b: any) => a.order - b.order)
                          .map((opt: any, i: number) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 text-sm font-medium text-sky-400"
                            >
                              <span className="flex-shrink-0 w-5 h-5 rounded border border-sky-400/40 flex items-center justify-center text-[10px] font-black opacity-60">
                                {String.fromCharCode(65 + opt.order)}
                              </span>
                              {opt.content}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {item.questionExplain && (
                  <div className="bg-sky-500/5 border border-sky-500/10 p-4 rounded-xl">
                    <p className="text-xs font-bold text-sky-400 mb-2 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      GIẢI THÍCH
                    </p>
                    <p className="text-sm text-white/60 leading-relaxed italic">
                      {item.questionExplain}
                    </p>
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
