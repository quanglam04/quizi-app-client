import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';

interface Option {
  id: string;
  content: string;
  order: number;
}

interface Question {
  id: string;
  content: string;
  type: 'single' | 'multiple';
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
        // Bắt đầu session
        const sessionRes = await api.post('/sessions/start', { examId });
        const sId = sessionRes.data.id;
        setSessionId(sId);

        // Lấy thông tin đề thi
        const examRes = await api.get(`/exams/${examId}`);
        const examData = examRes.data;
        setExam(examData);
        
        // Thiết lập thời gian (duration tính bằng phút)
        setTimeLeft(examData.duration * 60);
      } catch (err) {
        console.error('Failed to start exam:', err);
        toast.error('Không thể bắt đầu bài thi. Vui lòng thử lại.');
        navigate('/home');
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
            handleSubmit(true); // Tự động nộp bài khi hết giờ
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
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [submitting]);

  const handleSelectOption = (questionId: string, optionId: string, type: 'single' | 'multiple') => {
    if (type === 'single') {
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
      const formattedAnswers: { questionId: string; optionId: string | null }[] = [];

      exam?.questions.forEach((q) => {
        const ans = answers[q.id];
        if (q.type === 'single') {
          formattedAnswers.push({ questionId: q.id, optionId: (ans as string) || null });
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

      await api.post(`/sessions/${sessionId}/submit`, { answers: formattedAnswers });
      navigate(`/sessions/${sessionId}/result`, { replace: true });
    } catch (err) {
      console.error('Submit failed:', err);
      toast.error('Nộp bài thất bại. Vui lòng thử lại.');
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
              onClick={() => { performSubmit(); toast.dismiss(t.id); }}
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
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) return <div className="text-center py-20 text-white/60">Đang tải đề thi...</div>;
  if (!exam) return <div className="text-center py-20 text-white/60">Không tìm thấy đề thi.</div>;

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = exam.questions.length;

  return (
    <div className="flex flex-col h-[calc(100vh-160px)]">
      {/* Header cố định */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h1 className="text-white font-bold">{exam.title}</h1>
            <p className="text-white/40 text-sm">Tiến độ: {answeredCount}/{totalQuestions} câu</p>
          </div>

          <div className={`font-mono text-2xl font-black ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-sky-400'}`}>
            {formatTime(timeLeft)}
          </div>

          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-semibold hover:scale-105 transition-all disabled:opacity-50"
          >
            {submitting ? 'Đang nộp...' : 'Nộp bài'}
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-6 space-y-8 max-w-4xl mx-auto w-full">
        {exam.questions.sort((a, b) => a.order - b.order).map((q, idx) => (
          <div key={q.id} id={`question-${q.id}`} className="bg-slate-900/50 p-6 rounded-2xl border border-white/10 shadow-sm">
            <div className="flex items-start mb-6">
              <span className="flex-shrink-0 w-8 h-8 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full flex items-center justify-center font-bold mr-4">
                {idx + 1}
              </span>
              <div className="text-lg text-white font-medium pt-0.5">{q.content}</div>
            </div>

            <div className="ml-12 space-y-3">
              {q.options.sort((a, b) => a.order - b.order).map((opt) => {
                const isSelected = q.type === 'single' 
                  ? answers[q.id] === opt.id
                  : ((answers[q.id] as string[]) || []).includes(opt.id);

                return (
                  <label
                    key={opt.id}
                    className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                      isSelected 
                        ? 'bg-sky-500/15 border-sky-500/50' 
                        : 'bg-slate-800/50 border-white/10 hover:border-sky-500/50 hover:bg-slate-800'
                    }`}
                  >
                    <input
                      type={q.type === 'single' ? 'radio' : 'checkbox'}
                      name={`question-${q.id}`}
                      checked={isSelected}
                      onChange={() => handleSelectOption(q.id, opt.id, q.type)}
                      className="h-4 w-4 text-sky-500 focus:ring-sky-500 border-white/10 bg-slate-800"
                    />
                    <span className={`ml-3 transition-colors ${isSelected ? 'text-white' : 'text-white/70'}`}>{opt.content}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar at bottom */}
      <div className="bg-slate-900/95 backdrop-blur-md border-t border-white/10 p-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-4 overflow-x-auto">
          <div className="text-sm font-medium text-white/40 whitespace-nowrap">Câu hỏi:</div>
          <div className="flex gap-2">
            {exam.questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => document.getElementById(`question-${q.id}`)?.scrollIntoView({ behavior: 'smooth' })}
                className={`flex-shrink-0 w-8 h-8 rounded-lg text-xs font-medium border transition-all ${
                  answers[q.id] 
                    ? 'bg-sky-500 border-sky-500 text-white' 
                    : 'bg-slate-800 border-white/10 text-white/40 hover:border-sky-500/50'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
