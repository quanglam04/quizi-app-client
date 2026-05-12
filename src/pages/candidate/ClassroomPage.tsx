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
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Lớp học của tôi</h1>

      {/* Section 1 - Join Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Tham gia lớp học</h2>
        <form onSubmit={handleJoin} className="flex gap-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Nhập mã lớp (6 ký tự)"
            maxLength={6}
            className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-mono"
            required
          />
          <button
            type="submit"
            disabled={joinMutation.isPending || code.length !== 6}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 font-medium transition-colors"
          >
            {joinMutation.isPending ? 'Đang xử lý...' : 'Tham gia'}
          </button>
        </form>
      </div>

      {/* Section 2 - Joined Classrooms List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Lớp đang tham gia</h2>
        
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Đang tải danh sách...</div>
        ) : classrooms?.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg py-12 text-center text-gray-500">
            Bạn chưa tham gia lớp học nào. Nhập mã lớp phía trên để tham gia.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {classrooms?.map((cls) => (
              <div key={cls.classroomId} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900 truncate pr-2" title={cls.name}>
                    {cls.name}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    cls.status === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {cls.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-1">
                  <span className="font-medium text-gray-500">GV:</span> {cls.teacherName}
                </p>
                <p className="text-gray-400 text-xs font-mono mb-4">
                  Mã lớp: {cls.code}
                </p>

                <div className="flex justify-end pt-2 border-t border-gray-50">
                  <button
                    onClick={() => handleLeave(cls.classroomId, cls.name)}
                    disabled={leaveMutation.isPending}
                    className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                  >
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
