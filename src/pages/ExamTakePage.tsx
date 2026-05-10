import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
        alert('Không thể bắt đầu bài thi. Vui lòng thử lại.');
        navigate('/');
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

  const handleSubmit = async (isAuto = false) => {
    if (!isAuto && !window.confirm('Bạn có chắc chắn muốn nộp bài?')) return;
    
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      // Format answers theo yêu cầu API
      const formattedAnswers: { questionId: string; optionId: string | null }[] = [];
      
      exam?.questions.forEach((q) => {
        const ans = answers[q.id];
        if (q.type === 'single') {
          formattedAnswers.push({
            questionId: q.id,
            optionId: (ans as string) || null
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

      await api.post(`/sessions/${sessionId}/submit`, { answers: formattedAnswers });
      navigate(`/sessions/${sessionId}/result`, { replace: true });
    } catch (err) {
      console.error('Submit failed:', err);
      alert('Nộp bài thất bại. Vui lòng thử lại.');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) return <div className="text-center py-20">Đang tải đề thi...</div>;
  if (!exam) return <div className="text-center py-20">Không tìm thấy đề thi.</div>;

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = exam.questions.length;

  return (
    <div className="flex flex-col h-[calc(100vh-160px)]">
      {/* Fixed Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
          <p className="text-sm text-gray-500">Tiến độ: {answeredCount}/{totalQuestions} câu</p>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className={`text-2xl font-mono font-bold ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Đang nộp...' : 'Nộp bài'}
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-6 space-y-8">
        {exam.questions.sort((a, b) => a.order - b.order).map((q, idx) => (
          <div key={q.id} id={`question-${q.id}`} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-start mb-4">
              <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold mr-3">
                {idx + 1}
              </span>
              <div className="text-lg text-gray-800 font-medium pt-0.5">{q.content}</div>
            </div>

            <div className="ml-11 space-y-3">
              {q.options.sort((a, b) => a.order - b.order).map((opt) => {
                const isSelected = q.type === 'single' 
                  ? answers[q.id] === opt.id
                  : ((answers[q.id] as string[]) || []).includes(opt.id);

                return (
                  <label
                    key={opt.id}
                    className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
                      isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type={q.type === 'single' ? 'radio' : 'checkbox'}
                      name={`question-${q.id}`}
                      checked={isSelected}
                      onChange={() => handleSelectOption(q.id, opt.id, q.type)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-3 text-gray-700">{opt.content}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar at bottom */}
      <div className="bg-white border-t p-4 px-6 flex items-center space-x-4">
        <div className="text-sm font-medium text-gray-700 whitespace-nowrap">Câu hỏi:</div>
        <div className="flex flex-wrap gap-2">
          {exam.questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => document.getElementById(`question-${q.id}`)?.scrollIntoView({ behavior: 'smooth' })}
              className={`w-8 h-8 rounded text-xs font-medium border flex items-center justify-center ${
                answers[q.id] ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-gray-600'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
