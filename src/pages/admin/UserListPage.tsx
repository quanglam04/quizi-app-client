import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { SkeletonTable } from '../../components/Skeleton';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'candidate' | 'teacher';
  isActive: boolean;
  createdAt: string;
}

export default function AdminUserList() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await api.get('/auth/users');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; studentId: string }) => {
      const res = await api.post('/auth/users', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Đã tạo người dùng mới');
      setShowModal(false);
      setName('');
      setStudentId('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Có lỗi xảy ra');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (userId: string) => {
      setTogglingId(userId);
      const res = await api.patch(`/auth/users/${userId}/toggle`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(data.isActive ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản');
      setTogglingId(null);
    },
    onError: () => {
      toast.error('Có lỗi xảy ra');
      setTogglingId(null);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !studentId) return;
    createMutation.mutate({ name, studentId });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <SkeletonTable rows={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-400">
        Đã có lỗi xảy ra khi tải danh sách người dùng.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Quản lý User</h1>
          <p className="text-white/40 mt-1">Quản lý tài khoản người dùng trên hệ thống</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-105"
        >
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Thêm user
        </button>
      </div>

      <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5">
            <thead className="bg-slate-800/80">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-white/40 uppercase tracking-widest">Người dùng</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white/40 uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white/40 uppercase tracking-widest">Vai trò</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white/40 uppercase tracking-widest">Trạng thái</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white/40 uppercase tracking-widest">Ngày tạo</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white/40 uppercase tracking-widest">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/20 italic">
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              ) : (
                users?.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                        {user.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        user.role === 'admin' 
                          ? 'bg-purple-500/10 border border-purple-500/30 text-purple-400' 
                          : user.role === 'teacher'
                            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                            : 'bg-sky-500/10 border border-sky-500/30 text-sky-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          user.isActive
                            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                            : "bg-red-500/10 border border-red-500/30 text-red-400"
                        }`}
                      >
                        {user.isActive ? "Hoạt động" : "Đã khóa"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/40 font-medium">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => toggleMutation.mutate(user.id)}
                          disabled={togglingId === user.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-50 ${
                            user.isActive
                              ? "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
                              : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                          }`}
                        >
                          {togglingId === user.id ? "..." : user.isActive ? "Khóa" : "Mở khóa"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Thêm user mới</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Họ tên *</label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-sky-500/50 transition-colors"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Mã sinh viên *</label>
                <input
                  required
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-sky-500/50 transition-colors"
                  placeholder="sv001"
                />
                {studentId && (
                  <div className="mt-2 p-3 bg-white/5 rounded-lg text-xs text-white/40 space-y-1 border border-white/5">
                    <p>
                      Email:{" "}
                      <span className="text-sky-400 font-medium">
                        {studentId.toLowerCase()}@gmail.com
                      </span>
                    </p>
                    <p>
                      Mật khẩu:{" "}
                      <span className="text-sky-400 font-medium">{studentId.toUpperCase()}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="text-xs text-white/30 italic pt-2">
                * Role mặc định là Candidate. Admin/Teacher cần được cấp quyền sau.
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white rounded-xl font-bold transition-all hover:scale-[1.02]"
                >
                  {createMutation.isPending ? 'Đang tạo...' : 'Tạo user →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
