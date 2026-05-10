import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

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
      <div className="space-y-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Blog ôn luyện</h1>
        <div className="grid grid-cols-1 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Đã có lỗi xảy ra khi tải danh sách bài viết. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-baseline md:justify-between border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-extrabold text-gray-900">Blog ôn luyện</h1>
        <p className="mt-2 text-sm text-gray-500 md:mt-0">Chia sẻ kinh nghiệm và kiến thức thi cử</p>
      </div>

      {posts?.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center text-gray-500">
          Hiện tại chưa có bài viết nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10">
          {posts?.map((post) => (
            <article key={post.id} className="group relative flex flex-col items-start">
              <h2 className="text-2xl font-bold tracking-tight text-gray-800 group-hover:text-indigo-600 transition-colors">
                <Link to={`/blog/${post.slug}`}>
                  <span className="absolute -inset-x-4 -inset-y-6 z-20 sm:-inset-x-6 sm:rounded-2xl"></span>
                  <span className="relative z-10">{post.title}</span>
                </Link>
              </h2>
              <time className="relative z-10 order-first mb-3 flex items-center text-sm text-gray-400 pl-3.5">
                <span className="absolute inset-y-0 left-0 flex items-center" aria-hidden="true">
                  <span className="h-4 w-0.5 rounded-full bg-gray-200"></span>
                </span>
                {new Date(post.createdAt).toLocaleDateString('vi-VN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </time>
              <p className="relative z-10 mt-2 text-sm text-gray-600 leading-relaxed">
                {post.excerpt || 'Đang cập nhật nội dung mô tả...'}
              </p>
              <div className="relative z-10 mt-4 flex items-center text-sm font-medium text-indigo-600">
                Đọc bài viết
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
