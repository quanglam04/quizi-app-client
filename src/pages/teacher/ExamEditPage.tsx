import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as XLSX from "xlsx";
import { api } from "../../lib/api";

const examSchema = z.object({
  title: z.string().min(1, "Tên đề thi không được để trống"),
  description: z.string().optional(),
  duration: z.coerce.number().min(1, "Thời gian phải ít nhất 1 phút"),
  isPublished: z.boolean().default(false),
  visibility: z.enum(['public', 'class_only']).default('public'),
});

type ExamForm = z.infer<typeof examSchema>;

interface Option {
  id?: string;
  content: string;
  order: number;
  isCorrect: boolean;
}

interface Question {
  id?: string;
  content: string;
  type: "single" | "multiple";
  order: number;
  explain: string | null;
  options: Option[];
}

export default function TeacherExamEdit() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestionIdx, setEditingQuestionIdx] = useState<number | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExamForm>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      isPublished: false,
      visibility: 'public',
    },
  });

  const { data: examData, isLoading } = useQuery({
    queryKey: ["teacher-exams", id],
    queryFn: async () => {
      if (isNew) return null;
      const response = await api.get(`/exams/${id}`);
      return response.data;
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (examData) {
      reset({
        title: examData.title,
        description: examData.description || "",
        duration: examData.duration,
        isPublished: examData.isPublished,
        visibility: examData.visibility || 'public',
      });
      setQuestions(examData.questions || []);
    }
  }, [examData, reset]);

  // Mutation: Lưu thông tin đề thi
  const saveExamMutation = useMutation({
    mutationFn: async (data: ExamForm) => {
      if (isNew) {
        const res = await api.post("/exams", data);
        return res.data;
      } else {
        const res = await api.patch(`/exams/${id}`, data);
        return res.data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["teacher-exams"] });
      if (isNew) {
        navigate(`/teacher/exams/${data.id}`, { replace: true });
      }
      alert("Đã lưu đề thi thành công!");
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Có lỗi xảy ra khi lưu đề thi.");
    },
  });

  // Mutation: Thêm câu hỏi thủ công
  const addQuestionMutation = useMutation({
    mutationFn: async (newQuestion: Question) => {
      const response = await api.post(`/exams/${id}/questions`, newQuestion);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-exams", id] });
      setShowQuestionForm(false);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Thêm câu hỏi thất bại");
    },
  });

  // Mutation: Import Excel (Bulk)
  const bulkImportMutation = useMutation({
    mutationFn: async (importedQuestions: Question[]) => {
      const BATCH_SIZE = 10;
      const results = [];

      // Chia thành các batch 10 câu
      for (let i = 0; i < importedQuestions.length; i += BATCH_SIZE) {
        const batch = importedQuestions.slice(i, i + BATCH_SIZE);
        const response = await api.post(`/exams/${id}/questions/bulk`, {
          questions: batch,
        });
        results.push(...response.data);
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-exams", id] });
      alert("Đã import câu hỏi thành công!");
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || "Import thất bại");
    },
  });

  // Mutation: Xóa câu hỏi
  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      await api.delete(`/questions/${questionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-exams", id] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Xóa câu hỏi thất bại");
    },
  });

  const handleSaveExam = (data: ExamForm) => {
    saveExamMutation.mutate(data);
  };

  const handleAddQuestion = (newQuestion: Question) => {
    if (isNew) {
      alert("Vui lòng lưu đề thi trước khi thêm câu hỏi.");
      return;
    }

    if (editingQuestionIdx !== null) {
      alert(
        "Tính năng sửa câu hỏi đang được cập nhật. Vui lòng xóa và thêm lại.",
      );
    } else {
      addQuestionMutation.mutate({
        ...newQuestion,
        order: questions.length + 1,
      });
    }
  };

  const removeQuestion = (idx: number) => {
    const question = questions[idx];
    if (!question.id) {
      alert("Câu hỏi chưa được lưu trên hệ thống.");
      return;
    }

    if (window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này khỏi đề thi?")) {
      deleteQuestionMutation.mutate(question.id);
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        STT: 1,
        "Câu hỏi": "Thủ đô của Việt Nam là gì?",
        A: "Hà Nội",
        B: "TP. Hồ Chí Minh",
        C: "Đà Nẵng",
        D: "Huế",
        "Dap an dung": "A",
        "Giai thich": "Hà Nội là thủ đô của Việt Nam.",
      },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions");
    XLSX.writeFile(wb, "Quiz_Template.xlsx");
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isNew) {
      alert("Vui lòng lưu đề thi trước khi import câu hỏi.");
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data: any[] = XLSX.utils.sheet_to_json(ws);

      const importedQuestions: Question[] = data.map((row) => {
        const options: Option[] = [
          {
            content: String(row["A"] || ""),
            order: 0,
            isCorrect: row["Dap an dung"] === "A",
          },
          {
            content: String(row["B"] || ""),
            order: 1,
            isCorrect: row["Dap an dung"] === "B",
          },
          {
            content: String(row["C"] || ""),
            order: 2,
            isCorrect: row["Dap an dung"] === "C",
          },
          {
            content: String(row["D"] || ""),
            order: 3,
            isCorrect: row["Dap an dung"] === "D",
          },
        ];
        return {
          content: String(row["Câu hỏi"] || ""),
          type: "single",
          order: Number(row["STT"]) || questions.length + 1,
          explain: row["Giai thich"] || undefined,
          options,
        };
      });

      if (
        window.confirm(
          `Tìm thấy ${importedQuestions.length} câu hỏi. Bạn có muốn import ngay?`,
        )
      ) {
        bulkImportMutation.mutate(importedQuestions);
      }
      e.target.value = "";
    };
    reader.readAsBinaryString(file);
  };

  if (isLoading)
    return <div className="text-center py-20">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/teacher/exams")}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? "Tạo đề thi mới" : "Chỉnh sửa đề thi"}
          </h1>
        </div>
        <button
          onClick={handleSubmit(handleSaveExam)}
          disabled={saveExamMutation.isPending}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {saveExamMutation.isPending ? "Đang lưu..." : "Lưu thông tin đề"}
        </button>
      </div>

      {/* Section 1: Thông tin đề thi */}
      <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2 mb-4">
          Thông tin chung
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Tên đề thi
            </label>
            <input
              type="text"
              {...register("title")}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">
                {errors.title.message}
              </p>
            )}
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Mô tả
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Thời gian làm bài (phút)
            </label>
            <input
              type="number"
              {...register("duration")}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {errors.duration && (
              <p className="mt-1 text-xs text-red-500">
                {errors.duration.message}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Chế độ hiển thị
            </label>
            <select 
              {...register('visibility')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="public">Công khai — tất cả mọi người thấy</option>
              <option value="class_only">Chỉ lớp được giao — học sinh phải thuộc lớp</option>
            </select>
          </div>

          <div className="flex items-center h-full pt-6">
            <input
              id="isPublished"
              type="checkbox"
              {...register("isPublished")}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isPublished"
              className="ml-2 block text-sm text-gray-900 font-medium"
            >
              Công khai đề thi (Published)
            </label>
          </div>
        </div>
      </section>

      {/* Section 2: Danh sách câu hỏi */}
      <section
        className={`space-y-4 ${isNew ? "opacity-50 pointer-events-none" : ""}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Danh sách câu hỏi ({questions.length})
            </h2>
            {isNew && (
              <p className="text-xs text-orange-600 font-medium">
                Lưu đề thi trước khi quản lý câu hỏi
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
            >
              Tải template Excel
            </button>
            <label className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
              Import Excel
              <input
                type="file"
                className="hidden"
                accept=".xlsx, .xls"
                onChange={handleImportExcel}
              />
            </label>
            <button
              onClick={() => {
                setEditingQuestionIdx(null);
                setShowQuestionForm(true);
              }}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Thêm câu hỏi
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {addQuestionMutation.isPending ||
          bulkImportMutation.isPending ||
          deleteQuestionMutation.isPending ? (
            <div className="text-center py-10 text-gray-500">Đang xử lý...</div>
          ) : questions.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 italic">
              Chưa có câu hỏi nào.
            </div>
          ) : (
            questions
              .sort((a, b) => a.order - b.order)
              .map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-start justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-indigo-600">
                        Câu {q.order}:
                      </span>
                      <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded uppercase">
                        {q.type}
                      </span>
                    </div>
                    <p className="text-gray-800">{q.content}</p>
                    <div className="mt-2 space-y-1">
                      {q.options
                        .sort((a, b) => a.order - b.order)
                        .map((opt, oIdx) => (
                          <div
                            key={opt.id || oIdx}
                            className={`text-sm flex items-center gap-1 ${
                              opt.isCorrect
                                ? "text-green-600 font-semibold"
                                : "text-gray-500"
                            }`}
                          >
                            <span>{String.fromCharCode(65 + oIdx)}.</span>
                            <span>{opt.content}</span>
                            {opt.isCorrect && (
                              <span className="ml-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                ✓ Đúng
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => removeQuestion(idx)}
                      className="text-red-600 hover:text-red-900 text-xs font-medium"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </section>

      {/* Modal Question Form */}
      {showQuestionForm && (
        <QuestionFormModal
          onClose={() => setShowQuestionForm(false)}
          onSubmit={handleAddQuestion}
          loading={addQuestionMutation.isPending}
        />
      )}
    </div>
  );
}

function QuestionFormModal({
  onClose,
  onSubmit,
  loading,
}: {
  onClose: () => void;
  onSubmit: (q: Question) => void;
  loading: boolean;
}) {
  const [content, setContent] = useState("");
  const [type, setType] = useState<"single" | "multiple">("single");
  const [explain, setExplain] = useState("");
  const [options, setOptions] = useState<Option[]>([
    { content: "", order: 0, isCorrect: false },
    { content: "", order: 1, isCorrect: false },
    { content: "", order: 2, isCorrect: false },
    { content: "", order: 3, isCorrect: false },
  ]);

  const handleToggleCorrect = (idx: number) => {
    if (type === "single") {
      setOptions(options.map((opt, i) => ({ ...opt, isCorrect: i === idx })));
    } else {
      setOptions(
        options.map((opt, i) =>
          i === idx ? { ...opt, isCorrect: !opt.isCorrect } : opt,
        ),
      );
    }
  };

  const handleSave = () => {
    if (!content.trim()) return alert("Nội dung câu hỏi không được rỗng");
    if (options.some((o) => !o.content.trim()))
      return alert("Vui lòng nhập đầy đủ các lựa chọn");
    if (!options.some((o) => o.isCorrect))
      return alert("Phải có ít nhất 1 đáp án đúng");

    onSubmit({
      content,
      type,
      explain: explain || null,
      options,
      order: 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-gray-900">Thêm câu hỏi mới</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nội dung câu hỏi
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
              placeholder="Nhập câu hỏi..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại câu hỏi
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "single" | "multiple")}
              className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
            >
              <option value="single">Single Choice</option>
              <option value="multiple">Multiple Choice</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Các phương án trả lời
            </label>
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center space-x-3">
                <input
                  type={type === "single" ? "radio" : "checkbox"}
                  checked={opt.isCorrect}
                  onChange={() => handleToggleCorrect(idx)}
                  className="h-5 w-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={opt.content}
                  onChange={(e) => {
                    const next = [...options];
                    next[idx].content = e.target.value;
                    setOptions(next);
                  }}
                  className="flex-grow border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                  placeholder={`Đáp án ${String.fromCharCode(65 + idx)}`}
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giải thích (Optional)
            </label>
            <textarea
              value={explain}
              onChange={(e) => setExplain(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
              placeholder="Giải thích..."
            />
          </div>
        </div>
        <div className="p-6 border-t flex justify-end space-x-3 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-white"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "Xác nhận"}
          </button>
        </div>
      </div>
    </div>
  );
}
