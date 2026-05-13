import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { SkeletonTable } from '../../components/Skeleton';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'candidate' | 'teacher';
  createdAt: string;
}

export default function AdminUserList() {
  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await api.get('/auth/users');
      return response.data;
    },
  });

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
      <div>
        <h1 className="text-3xl font-black text-white">Quản lý User</h1>
        <p className="text-white/40 mt-1">Quản lý tài khoản người dùng trên hệ thống</p>
      </div>

      <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5">
            <thead className="bg-slate-800/80">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-white/40 uppercase tracking-widest">Người dùng</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white/40 uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white/40 uppercase tracking-widest">Vai trò</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white/40 uppercase tracking-widest">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-white/20 italic">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/40 font-medium">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
