import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface Classroom {
  id: string;
  name: string;
  description: string | null;
  code: string;
  teacherId: string;
  createdAt: string;
  _count?: {
    members: number;
  };
}

const ClassroomListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDescription, setNewClassDescription] = useState('');
  const [createdClassCode, setCreatedClassCode] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  const { data: classrooms, isLoading } = useQuery<Classroom[]>({
    queryKey: ['teacher-classrooms'],
    queryFn: async () => {
      const res = await api.get('/classrooms/my');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string, description?: string }) => {
      const res = await api.post('/classrooms', data);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('Tạo lớp học thành công!');
      setCreatedClassCode(data.code);
      queryClient.invalidateQueries({ queryKey: ['teacher-classrooms'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Lỗi khi tạo lớp học');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/classrooms/${id}`);
    },
    onSuccess: () => {
      toast.success('Đã xóa lớp học');
      queryClient.invalidateQueries({ queryKey: ['teacher-classrooms'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Lỗi khi xóa lớp học');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name: newClassName, description: newClassDescription });
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa lớp "${name}"? Thao tác này không thể hoàn tác.`)) {
      deleteMutation.mutate(id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCreatedClassCode(null);
    setNewClassName('');
    setNewClassDescription('');
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Lớp học của tôi</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tạo lớp mới
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Đang tải danh sách lớp...</div>
      ) : classrooms?.length === 0 ? (
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-500 mb-4">Bạn chưa có lớp học nào.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-indigo-600 font-medium hover:underline"
          >
            Tạo lớp đầu tiên ngay
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classrooms?.map((cls) => (
            <div key={cls.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="p-5 flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-2 truncate" title={cls.name}>
                  {cls.name}
                </h3>
                <div className="bg-gray-50 px-3 py-2 rounded-md mb-4 inline-block">
                  <span className="text-xs text-gray-500 uppercase font-semibold block mb-1">Mã lớp</span>
                  <span className="text-lg font-mono font-bold text-indigo-600 tracking-wider">{cls.code}</span>
                </div>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">
                  {cls.description || 'Không có mô tả'}
                </p>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {cls._count?.members || 0} thành viên
                </div>
              </div>
              <div className="px-5 py-4 bg-gray-50 flex justify-between items-center">
                <Link
                  to={`/teacher/classrooms/${cls.id}`}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm"
                >
                  Quản lý
                </Link>
                <button
                  onClick={() => handleDelete(cls.id, cls.name)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal tạo lớp */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {createdClassCode ? 'Lớp học đã được tạo' : 'Tạo lớp học mới'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {createdClassCode ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">Gửi mã này cho học sinh để tham gia vào lớp:</p>
                  <div className="bg-indigo-50 p-6 rounded-lg border-2 border-indigo-200 mb-6">
                    <span className="text-4xl font-mono font-black text-indigo-700 tracking-widest">
                      {createdClassCode}
                    </span>
                  </div>
                  <button
                    onClick={closeModal}
                    className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 font-medium"
                  >
                    Xong
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreate}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tên lớp học *</label>
                      <input
                        type="text"
                        required
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        placeholder="VD: Toán 12 - Lớp A1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả (không bắt buộc)</label>
                      <textarea
                        value={newClassDescription}
                        onChange={(e) => setNewClassDescription(e.target.value)}
                        rows={3}
                        placeholder="Mô tả ngắn gọn về lớp học..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      ></textarea>
                    </div>
                  </div>
                  <div className="mt-8 flex gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50"
                    >
                      {createMutation.isPending ? 'Đang tạo...' : 'Tạo lớp'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomListPage;
