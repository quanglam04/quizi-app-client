import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  createdAt: string;
}

export default function AdminBlogList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: posts, isLoading, error } = useQuery<BlogPost[]>({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      // Vì API public chỉ lấy published, admin có thể cần API riêng /blog/all
      // Tuy nhiên task_08.md ghi dùng GET /api/blog (chỉ lấy published - dùng tạm)
      const response = await api.get('/blog/admin/all');
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/blog/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast.success('Đã xóa bài viết');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Không thể xóa bài viết');
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      await api.patch(`/blog/${id}`, { isPublished });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    },
  });

  const handleDelete = (id: string, title: string) => {
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span className="text-white/80">Xóa "{title}"?</span>
          <div className="flex gap-2">
            <button
              onClick={() => { deleteMutation.mutate(id); toast.dismiss(t.id); }}
              className="px-3 py-1 bg-red-500 hover:bg-red-400 text-white text-xs rounded-lg transition-colors"
            >
              Xóa
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
          border: "1px solid rgba(248,113,113,0.3)",
          borderRadius: "12px",
          padding: "12px 16px",
        },
      },
    );
  };

  const handleToggle = (id: string, currentStatus: boolean) => {
    toggleMutation.mutate({ id, isPublished: !currentStatus });
  };

  if (isLoading) return <div className="text-center py-20 text-white/60">Đang tải danh sách bài viết...</div>;
  if (error) return <div className="text-center py-20 text-red-500">Đã có lỗi xảy ra.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Quản lý Blog</h1>
          <p className="text-white/40 text-sm mt-1">
            Viết và quản lý các bài chia sẻ kiến thức
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/blog/new/edit')}
          className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold hover:scale-105 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-sky-500/20"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
          Viết bài mới
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-white/40 text-xs font-bold uppercase tracking-widest">Tiêu đề</th>
                <th className="px-6 py-4 text-left text-white/40 text-xs font-bold uppercase tracking-widest">Slug</th>
                <th className="px-6 py-4 text-left text-white/40 text-xs font-bold uppercase tracking-widest">Trạng thái</th>
                <th className="px-6 py-4 text-left text-white/40 text-xs font-bold uppercase tracking-widest">Ngày tạo</th>
                <th className="px-6 py-4 text-right text-white/40 text-xs font-bold uppercase tracking-widest">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {posts?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/20 italic">Chưa có bài viết nào.</td>
                </tr>
              ) : (
                posts?.map((post) => (
                  <tr key={post.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors truncate max-w-xs">{post.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-[10px] text-white/40 font-mono">{post.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        post.isPublished 
                          ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
                          : 'bg-slate-700 border border-white/10 text-white/40'
                      }`}>
                        {post.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/40">
                      {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleToggle(post.id, post.isPublished)}
                          className={`text-xs font-bold transition-colors ${post.isPublished ? 'text-amber-400/60 hover:text-amber-400' : 'text-sky-400/60 hover:text-sky-400'}`}
                        >
                          {post.isPublished ? 'Draft' : 'Publish'}
                        </button>
                        <Link
                          to={`/admin/blog/${post.id}/edit`}
                          className="px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 text-xs font-bold hover:bg-sky-500 hover:text-white transition-all"
                        >
                          Sửa
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          className="text-red-400/40 hover:text-red-400 text-xs font-bold transition-colors p-1.5 hover:bg-red-500/10 rounded-lg"
                        >
                          Xóa
                        </button>
                      </div>
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
