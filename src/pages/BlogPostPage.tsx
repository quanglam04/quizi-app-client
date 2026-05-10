import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { api } from '../lib/api';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const response = await api.get(`/blog/${slug}`);
      return response.data;
    },
    enabled: !!slug,
  });

  if (isLoading) return <div className="text-center py-20">Đang tải bài viết...</div>;
  if (error || !post) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800">404 - Không tìm thấy bài viết</h2>
        <p className="text-gray-600 mt-2">Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ.</p>
        <Link to="/blog" className="mt-6 inline-block text-indigo-600 font-medium hover:underline">
          &larr; Quay lại danh sách Blog
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto py-8">
      <Link to="/blog" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 mb-8 transition-colors">
        <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Quay lại Blog
      </Link>

      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
          {post.title}
        </h1>
        <div className="flex items-center text-sm text-gray-500">
          <time dateTime={post.createdAt}>
            Ngày đăng: {new Date(post.createdAt).toLocaleDateString('vi-VN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </time>
          {post.updatedAt !== post.createdAt && (
            <span className="ml-4 italic">
              (Cập nhật: {new Date(post.updatedAt).toLocaleDateString('vi-VN')})
            </span>
          )}
        </div>
      </header>

      {/* Markdown Content */}
      <div className="markdown-content bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4">{children}</h1>,
            h2: ({ children }) => <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{children}</h2>,
            h3: ({ children }) => <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">{children}</h3>,
            p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-700">{children}</ol>,
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-indigo-200 pl-4 italic text-gray-600 my-6">
                {children}
              </blockquote>
            ),
            code: ({ children }) => (
              <code className="bg-gray-100 rounded px-1.5 py-0.5 text-sm font-mono text-indigo-600">
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-6 font-mono text-sm leading-relaxed">
                {children}
              </pre>
            ),
            a: ({ children, href }) => (
              <a href={href} className="text-indigo-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      <footer className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Cảm ơn bạn đã đọc bài viết này.
          </p>
          <Link to="/blog" className="text-indigo-600 font-medium hover:underline">
            Khám phá các bài viết khác &rarr;
          </Link>
        </div>
      </footer>
    </article>
  );
}
