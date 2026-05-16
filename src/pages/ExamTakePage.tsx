import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../lib/api";

interface Option {
  id: string;
  content: string;
  order: number;
}

interface Question {
  id: string;
  content: string;
  type: "single" | "multiple";
  order: number;
  options: Option[];
}

interface Exam {
  id: string;
  title: string;
  duration: number;
  questions: Question[];
}

export default function ExamTakePage() {
  const { id: examId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Khởi tạo session và lấy đề thi
  useEffect(() => {
    const initExam = async () => {
      try {
        setLoading(true);
        const sessionRes = await api.post("/sessions/start", { examId });
        const sId = sessionRes.data.id;
        setSessionId(sId);

        const examRes = await api.get(`/exams/${examId}`);
        const examData = examRes.data;
        setExam(examData);
        setTimeLeft(examData.duration * 60);
      } catch (err) {
        console.error("Failed to start exam:", err);
        toast.error("Không thể bắt đầu bài thi. Vui lòng thử lại.");
        navigate("/home");
      } finally {
        setLoading(false);
      }
    };

    initExam();
  }, [examId, navigate]);

  // 2. Đếm ngược thời gian
  useEffect(() => {
    if (timeLeft > 0 && !submitting) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, submitting]);

  // 3. Cảnh báo khi reload/rời trang
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!submitting) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [submitting]);

  useEffect(() => {
    // Mở fullscreen
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }

    // Thoát fullscreen khi rời trang
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  const handleSelectOption = (
    questionId: string,
    optionId: string,
    type: "single" | "multiple",
  ) => {
    if (type === "single") {
      setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    } else {
      setAnswers((prev) => {
        const current = (prev[questionId] as string[]) || [];
        const next = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
        return { ...prev, [questionId]: next };
      });
    }
  };

  const performSubmit = async () => {
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const formattedAnswers: {
        questionId: string;
        optionId: string | null;
      }[] = [];

      exam?.questions.forEach((q) => {
        const ans = answers[q.id];
        if (q.type === "single") {
          formattedAnswers.push({
            questionId: q.id,
            optionId: (ans as string) || null,
          });
        } else {
          const selectedOptions = (ans as string[]) || [];
          if (selectedOptions.length === 0) {
            formattedAnswers.push({ questionId: q.id, optionId: null });
          } else {
            selectedOptions.forEach((optId) => {
              formattedAnswers.push({ questionId: q.id, optionId: optId });
            });
          }
        }
      });

      await api.post(`/sessions/${sessionId}/submit`, {
        answers: formattedAnswers,
      });
      navigate(`/sessions/${sessionId}/result`, { replace: true });
    } catch (err) {
      console.error("Submit failed:", err);
      toast.error("Nộp bài thất bại. Vui lòng thử lại.");
      setSubmitting(false);
    }
  };

  const handleSubmit = (isAuto = false) => {
    if (isAuto) {
      performSubmit();
      return;
    }
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span className="text-white/80">Nộp bài ngay?</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                performSubmit();
                toast.dismiss(t.id);
              }}
              className="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-white text-xs rounded-lg transition-colors"
            >
              Nộp bài
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
          border: "1px solid rgba(56,189,248,0.3)",
          borderRadius: "12px",
          padding: "12px 16px",
        },
      },
    );
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-white/60">Đang tải đề thi...</p>
      </div>
    );
  }
  if (!exam) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-white/60">Không tìm thấy đề thi.</p>
      </div>
    );
  }

  const questions = [...exam.questions].sort((a, b) => a.order - b.order);
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* HEADER */}
      <header className="flex-shrink-0 bg-slate-900/95 backdrop-blur-md border-b border-white/10 px-6 py-3 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg">{exam.title}</h1>
            <p className="text-white/40 text-sm">
              Tiến độ: {answeredCount}/{questions.length} câu
            </p>
          </div>
          <div
            className={`font-mono text-3xl font-black tabular-nums ${timeLeft < 300 ? "text-red-400 animate-pulse" : "text-sky-400"}`}
          >
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-semibold hover:scale-105 transition-all duration-200 shadow-lg shadow-sky-500/30 disabled:opacity-50"
          >
            {submitting ? "Đang nộp..." : "Nộp bài"}
          </button>
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* MAIN — danh sách câu hỏi có thể scroll */}
        <main className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              id={`question-${idx + 1}`}
              className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 scroll-mt-4"
            >
              {/* Question header */}
              <div className="flex items-start gap-3 mb-5">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 font-bold text-sm">
                  {idx + 1}
                </span>
                <div className="flex-1 pt-1">
                  <div
                    className="text-white font-medium leading-relaxed pt-1 prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: q.content }}
                  />
                  <span
                    className={`inline-flex items-center mt-2 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${
                      q.type === "multiple"
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                        : "bg-sky-500/10 text-sky-400 border-sky-500/30"
                    }`}
                  >
                    {q.type === "multiple"
                      ? "Multiple choice"
                      : "Single choice"}
                  </span>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2 ml-11">
                {q.options
                  .sort((a, b) => a.order - b.order)
                  .map((opt) => {
                    const isSelected =
                      q.type === "single"
                        ? answers[q.id] === opt.id
                        : ((answers[q.id] as string[]) || []).includes(opt.id);

                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(q.id, opt.id, q.type)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150 border ${
                          isSelected
                            ? "bg-sky-500/20 border-sky-500/60 text-sky-300"
                            : "bg-slate-700/50 border-white/10 text-white/70 hover:border-white/30 hover:bg-slate-700"
                        }`}
                      >
                        <span
                          className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? "border-sky-400 bg-sky-400"
                              : "border-white/30"
                          }`}
                        >
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </span>
                        <span
                          className="text-sm"
                          dangerouslySetInnerHTML={{ __html: opt.content }}
                        />
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}

          <div className="h-6" />
        </main>

        {/* SIDEBAR — điều hướng câu hỏi */}
        <aside className="flex-shrink-0 w-64 bg-slate-900 border-l border-white/10 overflow-y-auto p-5">
          {/* Tiến độ */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/50 text-xs font-medium uppercase tracking-wider">
                Tiến độ
              </span>
              <span className="text-sky-400 text-sm font-bold">
                {answeredCount}/{questions.length}
              </span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-300"
                style={{
                  width: questions.length
                    ? `${(answeredCount / questions.length) * 100}%`
                    : "0%",
                }}
              />
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-4 text-xs text-white/40">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-sky-500" />
              Đã chọn
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-700 border border-white/20" />
              Chưa chọn
            </span>
          </div>

          {/* Grid câu hỏi — 5 cột */}
          <div className="grid grid-cols-5 gap-1.5">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    document
                      .getElementById(`question-${idx + 1}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`aspect-square rounded-lg text-xs font-semibold flex items-center justify-center transition-all duration-150 hover:scale-110 ${
                    isAnswered
                      ? "bg-sky-500 text-white shadow-sm shadow-sky-500/30"
                      : "bg-slate-700/80 border border-white/10 text-white/40 hover:border-white/30"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Nộp bài ở cuối sidebar */}
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="w-full mt-6 py-3 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-semibold hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-sky-500/20 text-sm disabled:opacity-50"
          >
            Nộp bài →
          </button>
        </aside>
      </div>
    </div>
  );
}
