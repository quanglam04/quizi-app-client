import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { SkeletonCard } from '../components/Skeleton';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  createdAt: string;
}

export default function BlogListPage() {
  const { data: posts, isLoading, error } = useQuery<BlogPost[]>({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const response = await api.get('/blog');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-400">
        Đã có lỗi xảy ra khi tải danh sách bài viết. Vui lòng thử lại sau.
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-baseline md:justify-between border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black text-white">Blog ôn luyện</h1>
        <p className="mt-2 text-sm text-white/40 md:mt-0 italic">Chia sẻ kinh nghiệm và kiến thức thi cử</p>
      </div>

      {posts?.length === 0 ? (
        <div className="bg-slate-800/50 rounded-2xl border border-white/10 p-12 text-center text-white/40">
          Hiện tại chưa có bài viết nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts?.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="block p-8 rounded-2xl bg-slate-800/50 border border-white/10
              hover:-translate-y-1 hover:border-sky-500/40 hover:shadow-lg hover:shadow-sky-500/10
              transition-all duration-300 group"
            >
              <div className="flex flex-col gap-4">
                <time className="text-xs font-bold text-sky-400 uppercase tracking-widest">
                  {new Date(post.createdAt).toLocaleDateString('vi-VN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </time>
                
                <h2 className="text-2xl font-bold text-white group-hover:text-sky-400 transition-colors leading-tight">
                  {post.title}
                </h2>
                
                <p className="text-white/60 leading-relaxed line-clamp-2">
                  {post.excerpt || 'Đang cập nhật nội dung mô tả...'}
                </p>
                
                <div className="flex items-center gap-2 text-sky-400 text-sm font-bold mt-2">
                  Đọc bài viết 
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
