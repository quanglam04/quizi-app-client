import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { toast } from 'react-hot-toast';

interface JoinedClassroom {
  classroomId: string;
  status: 'pending' | 'approved';
  joinedAt: string;
  name: string;
  description: string | null;
  code: string;
  teacherName: string;
}

const ClassroomPage = () => {
  const [code, setCode] = useState('');
  const queryClient = useQueryClient();

  const { data: classrooms, isLoading } = useQuery<JoinedClassroom[]>({
    queryKey: ['joined-classrooms'],
    queryFn: async () => {
      const res = await api.get('/classrooms/joined');
      return res.data;
    },
  });

  const joinMutation = useMutation({
    mutationFn: async (joinCode: string) => {
      const res = await api.post('/classrooms/join', { code: joinCode });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Tham gia lớp học thành công!');
      setCode('');
      queryClient.invalidateQueries({ queryKey: ['joined-classrooms'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Không thể tham gia lớp học. Vui lòng kiểm tra lại mã.');
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async (classroomId: string) => {
      await api.delete(`/classrooms/${classroomId}/leave`);
    },
    onSuccess: () => {
      toast.success('Đã rời lớp học');
      queryClient.invalidateQueries({ queryKey: ['joined-classrooms'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Lỗi khi rời lớp học');
    },
  });

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error('Mã lớp phải có đúng 6 ký tự');
      return;
    }
    joinMutation.mutate(code);
  };

  const handleLeave = (classroomId: string, className: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn rời lớp "${className}"?`)) {
      leaveMutation.mutate(classroomId);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white">Lớp học của tôi</h1>
        <p className="text-white/40 mt-1">Tham gia và quản lý các lớp học của bạn</p>
      </div>

      {/* Join Form Section */}
      <div className="bg-slate-900 rounded-2xl border border-white/10 p-8">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-sky-400">✦</span>
          Tham gia lớp học mới
        </h2>
        <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Nhập mã lớp (6 ký tự)"
            maxLength={6}
            className="flex-grow px-4 py-3 rounded-xl
              bg-slate-800 border border-white/10 text-white uppercase
              placeholder-white/20 tracking-[0.2em] font-mono
              focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500
              transition-all duration-200"
            required
          />
          <button
            type="submit"
            disabled={joinMutation.isPending || code.length !== 6}
            className="px-8 py-3 bg-sky-500 hover:bg-sky-400 text-white
              rounded-xl font-semibold hover:scale-105 transition-all duration-200
              disabled:opacity-50 shadow-lg shadow-sky-500/20"
          >
            {joinMutation.isPending ? 'Đang xử lý...' : 'Tham gia →'}
          </button>
        </form>
      </div>

      {/* Classrooms List Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          Lớp đang tham gia
          {classrooms && (
            <span className="text-xs font-medium bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/40">
              {classrooms.length}
            </span>
          )}
        </h2>
        
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {[1, 2].map(i => (
              <div key={i} className="h-40 bg-slate-800/50 rounded-2xl border border-white/10 animate-pulse" />
            ))}
          </div>
        ) : classrooms?.length === 0 ? (
          <div className="bg-slate-800/50 border border-white/10 rounded-2xl py-16 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white/20 text-2xl">?</span>
            </div>
            <p className="text-white/40 italic">
              Bạn chưa tham gia lớp học nào. Nhập mã lớp phía trên để bắt đầu.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {classrooms?.map((cls) => (
              <div 
                key={cls.classroomId} 
                className="p-6 rounded-2xl bg-slate-800/50 border border-white/10
                hover:border-sky-500/40 transition-all duration-300 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-white truncate group-hover:text-sky-400 transition-colors" title={cls.name}>
                      {cls.name}
                    </h3>
                    <p className="text-white/40 text-sm mt-1">GV: {cls.teacherName}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    cls.status === 'approved' 
                      ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
                      : 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                  }`}>
                    {cls.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-white/30 text-xs">Mã lớp:</span>
                  <code className="text-sky-400 text-xs font-mono bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                    {cls.code}
                  </code>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/5">
                  <button
                    onClick={() => handleLeave(cls.classroomId, cls.name)}
                    disabled={leaveMutation.isPending}
                    className="text-red-400/60 hover:text-red-400 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Rời lớp
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassroomPage;
