import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { toast } from 'react-hot-toast';
import { SkeletonTable } from '../../components/Skeleton';

interface Member {
  id: string;
  userId: string;
  status: 'approved' | 'pending';
  joinedAt: string;
  name: string;
  email: string;
}

interface ClassroomDetail {
  id: string;
  name: string;
  description: string | null;
  code: string;
  teacherId: string;
  createdAt: string;
  members: Member[];
}

interface AssignedExam {
  assignmentId: string;
  examId: string;
  examTitle: string;
  examDuration: number;
  isPublished: boolean;
  visibility: string;
  assignedAt: string;
}

interface TeacherExam {
  id: string;
  title: string;
  duration: number;
  isPublished: boolean;
  visibility: string;
}

interface LeaderboardEntry {
  userId: string;
  name: string;
  email: string;
  avgScore: number | null;
  examCount: number;
  rank: number | null;
}

const ClassroomDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'members' | 'exams' | 'leaderboard'>('members');
  const [selectedExamId, setSelectedExamId] = useState('');

  const queryClient = useQueryClient();

  // Queries
  const { data: classroom, isLoading: isLoadingClassroom } = useQuery<ClassroomDetail>({
    queryKey: ['classroom-detail', id],
    queryFn: async () => {
      const res = await api.get(`/classrooms/${id}`);
      return res.data;
    },
  });

  const { data: assignedExams, isLoading: isLoadingAssigned } = useQuery<AssignedExam[]>({
    queryKey: ['classroom-exams', id],
    queryFn: async () => {
      const res = await api.get(`/classrooms/${id}/exams`);
      return res.data;
    },
  });

  const { data: teacherExams } = useQuery<TeacherExam[]>({
    queryKey: ['teacher-exams'],
    queryFn: async () => {
      const res = await api.get('/exams/teacher/my');
      return res.data;
    },
  });

  const { data: leaderboard, isLoading: isLoadingLeaderboard } = useQuery<LeaderboardEntry[]>({
    queryKey: ['classroom-leaderboard', id],
    queryFn: async () => {
      const res = await api.get(`/classrooms/${id}/leaderboard`);
      return res.data;
    },
    enabled: activeTab === 'leaderboard',
  });

  // Mutations
  const updateMemberStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string, status: 'approved' | 'pending' }) => {
      await api.patch(`/classrooms/${id}/members/${userId}`, { status });
    },
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái thành viên');
      queryClient.invalidateQueries({ queryKey: ['classroom-detail', id] });
    },
  });

  const kickMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/classrooms/${id}/members/${userId}`);
    },
    onSuccess: () => {
      toast.success('Đã xóa thành viên khỏi lớp');
      queryClient.invalidateQueries({ queryKey: ['classroom-detail', id] });
    },
  });

  const assignExamMutation = useMutation({
    mutationFn: async (examId: string) => {
      await api.post(`/classrooms/${id}/exams/${examId}`);
    },
    onSuccess: () => {
      toast.success('Đã giao đề cho lớp');
      setSelectedExamId('');
      queryClient.invalidateQueries({ queryKey: ['classroom-exams', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Lỗi khi giao đề');
    }
  });

  const unassignExamMutation = useMutation({
    mutationFn: async (examId: string) => {
      await api.delete(`/classrooms/${id}/exams/${examId}`);
    },
    onSuccess: () => {
      toast.success('Đã bỏ giao đề');
      queryClient.invalidateQueries({ queryKey: ['classroom-exams', id] });
    },
  });

  if (isLoadingClassroom) return <div className="p-6"><SkeletonTable rows={5} /></div>;
  if (!classroom) return <div className="p-8 text-center text-red-400">Không tìm thấy lớp học</div>;

  const pendingMembers = classroom.members.filter(m => m.status === 'pending');
  const approvedMembers = classroom.members.filter(m => m.status === 'approved');

  const unassignedTeacherExams = teacherExams?.filter(
    te => !assignedExams?.some(ae => ae.examId === te.id)
  ) || [];

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Link to="/teacher/classrooms" className="text-sky-400 hover:text-sky-300 flex items-center gap-1 mb-4 text-sm font-medium transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại danh sách lớp
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{classroom.name}</h1>
            <p className="text-white/40 mt-1">{classroom.description || 'Không có mô tả'}</p>
          </div>
          <div className="bg-slate-900 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
            <span className="text-sm text-white/40 font-medium">Mã lớp:</span>
            <span className="text-xl font-mono font-bold text-sky-400 tracking-wider">{classroom.code}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-6">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'members'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-white/40 hover:text-white hover:border-white/20'
          }`}
        >
          Thành viên ({classroom.members.length})
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'exams'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-white/40 hover:text-white hover:border-white/20'
          }`}
        >
          Đề thi đã giao ({assignedExams?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'leaderboard'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-white/40 hover:text-white hover:border-white/20'
          }`}
        >
          🏆 Bảng xếp hạng
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'members' && (
        <div className="space-y-8">
          {/* Pending Requests */}
          {pendingMembers.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                Yêu cầu chờ duyệt ({pendingMembers.length})
              </h2>
              <div className="bg-slate-900 rounded-2xl border border-white/10 overflow-hidden">
                <table className="min-w-full divide-y divide-white/5">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Học sinh</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-white/40 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pendingMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{member.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/40">{member.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => updateMemberStatusMutation.mutate({ userId: member.userId, status: 'approved' })}
                            className="text-green-400 hover:text-green-300 mr-4 transition-colors"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => kickMemberMutation.mutate(member.userId)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            Từ chối
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Approved Members */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Danh sách học sinh ({approvedMembers.length})</h2>
            <div className="bg-slate-900 rounded-2xl border border-white/10 overflow-hidden">
              <table className="min-w-full divide-y divide-white/5">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Học sinh</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Ngày tham gia</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-white/40 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {approvedMembers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-white/30 italic">Chưa có học sinh nào trong lớp</td>
                    </tr>
                  ) : (
                    approvedMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{member.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/40">{member.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/40">
                          {new Date(member.joinedAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              const userId = member.userId;
                              toast(
                                (t) => (
                                  <div className="flex items-center gap-3">
                                    <span className="text-white/80">Kick "{member.name}"?</span>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => { kickMemberMutation.mutate(userId); toast.dismiss(t.id); }}
                                        className="px-3 py-1 bg-red-500 hover:bg-red-400 text-white text-xs rounded-lg transition-colors"
                                      >
                                        Kick
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
                                { duration: 5000, style: { background: "#1e293b", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "12px", padding: "12px 16px" } },
                              );
                            }}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            Kick
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'exams' && (
        <div className="space-y-8">
          {/* Assign New Exam */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-white/10">
            <h2 className="text-lg font-bold text-white mb-4">Giao đề thi mới</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (selectedExamId) assignExamMutation.mutate(selectedExamId);
              }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="flex-grow px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all duration-200"
              >
                <option value="">-- Chọn đề thi để giao --</option>
                {unassignedTeacherExams.map(exam => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title} ({exam.duration} phút)
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={!selectedExamId || assignExamMutation.isPending}
                className="bg-sky-500 hover:bg-sky-400 text-white px-6 py-2 rounded-xl font-medium disabled:opacity-50 transition-colors"
              >
                Giao đề
              </button>
            </form>
            {unassignedTeacherExams.length === 0 && (
              <p className="mt-2 text-sm text-white/40 italic">
                Tất cả đề thi của bạn đã được giao cho lớp này hoặc bạn chưa có đề thi nào.
              </p>
            )}
          </div>

          {/* Assigned Exams List */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Đề thi đã giao cho lớp</h2>
            <div className="bg-slate-900 rounded-2xl border border-white/10 overflow-hidden">
              <table className="min-w-full divide-y divide-white/5">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Tên đề</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Thời gian</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-white/40 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoadingAssigned ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-white/30">Đang tải danh sách đề...</td></tr>
                  ) : assignedExams?.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-white/30 italic">Chưa có đề thi nào được giao cho lớp này</td></tr>
                  ) : (
                    assignedExams?.map((exam) => (
                      <tr key={exam.assignmentId} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{exam.examTitle}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/40">{exam.examDuration} phút</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            exam.isPublished
                              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                              : 'bg-white/5 border border-white/10 text-white/40'
                          }`}>
                            {exam.isPublished ? 'Đã công khai' : 'Bản nháp'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              const examId = exam.examId;
                              toast(
                                (t) => (
                                  <div className="flex items-center gap-3">
                                    <span className="text-white/80">Bỏ giao "{exam.examTitle}"?</span>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => { unassignExamMutation.mutate(examId); toast.dismiss(t.id); }}
                                        className="px-3 py-1 bg-red-500 hover:bg-red-400 text-white text-xs rounded-lg transition-colors"
                                      >
                                        Bỏ giao
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
                                { duration: 5000, style: { background: "#1e293b", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "12px", padding: "12px 16px" } },
                              );
                            }}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            Bỏ giao
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Bảng xếp hạng lớp</h2>
            <p className="text-white/40 text-xs">
              Xếp theo điểm cao nhất trung bình tất cả đề
            </p>
          </div>

          {isLoadingLeaderboard ? (
            <div className="text-center py-20 bg-slate-900 rounded-2xl border border-white/10">
              <div className="animate-spin h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-white/40 text-sm">Đang tải bảng xếp hạng...</p>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-2xl border border-white/10 overflow-hidden">
              <table className="min-w-full divide-y divide-white/5">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white/40 uppercase tracking-widest w-16">
                      Hạng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white/40 uppercase tracking-widest">
                      Học sinh
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white/40 uppercase tracking-widest">
                      Số đề đã làm
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-white/40 uppercase tracking-widest">
                      Điểm TB
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leaderboard?.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-12 text-center text-white/30 italic"
                      >
                        Chưa có dữ liệu xếp hạng
                      </td>
                    </tr>
                  ) : (
                    leaderboard?.map((entry) => (
                      <tr
                        key={entry.userId}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {entry.rank === 1 ? (
                            <span className="text-xl">🥇</span>
                          ) : entry.rank === 2 ? (
                            <span className="text-xl">🥈</span>
                          ) : entry.rank === 3 ? (
                            <span className="text-xl">🥉</span>
                          ) : entry.rank ? (
                            <span className="text-sm font-bold text-white/40">
                              #{entry.rank}
                            </span>
                          ) : (
                            <span className="text-sm text-white/20">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-white">
                            {entry.name}
                          </div>
                          <div className="text-xs text-white/30">{entry.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/40">
                          {entry.examCount > 0 ? (
                            `${entry.examCount} đề`
                          ) : (
                            <span className="italic text-white/20">
                              Chưa làm bài
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {entry.avgScore !== null ? (
                            <span
                              className={`text-lg font-black ${
                                entry.avgScore >= 80
                                  ? 'text-green-400'
                                  : entry.avgScore >= 60
                                    ? 'text-sky-400'
                                    : 'text-red-400'
                              }`}
                            >
                              {entry.avgScore}%
                            </span>
                          ) : (
                            <span className="text-white/20 text-sm italic">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassroomDetailPage;
