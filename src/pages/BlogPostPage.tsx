import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "../lib/api";

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

  const {
    data: post,
    isLoading,
    error,
  } = useQuery<BlogPost>({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const response = await api.get(`/blog/${slug}`);
      return response.data;
    },
    enabled: !!slug,
  });

  if (isLoading)
    return (
      <div className="text-center py-20 text-white/60">
        Đang tải bài viết...
      </div>
    );
  if (error || !post) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-black text-white mb-2">
          404 - Không tìm thấy bài viết
        </h2>
        <p className="text-white/40">
          Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ.
        </p>
        <Link
          to="/blog"
          className="mt-8 inline-flex items-center gap-2 text-sky-400 font-bold hover:text-sky-300 transition-colors"
        >
          <span>←</span> Quay lại danh sách Blog
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto py-12 px-4 sm:px-0 pb-32">
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-sm font-bold text-white/40 hover:text-sky-400 mb-12 transition-all"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        QUAY LẠI BLOG
      </Link>

      <header className="mb-12">
        <time className="text-xs font-bold text-sky-400 uppercase tracking-[0.2em] mb-4 block">
          {new Date(post.createdAt).toLocaleDateString("vi-VN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </time>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          {post.title}
        </h1>
        {post.updatedAt !== post.createdAt && (
          <p className="mt-4 text-xs text-white/30 italic">
            Cập nhật lần cuối:{" "}
            {new Date(post.updatedAt).toLocaleDateString("vi-VN")}
          </p>
        )}
      </header>

      {/* Markdown Content - Sử dụng prose dark */}
      <div
        className="
  prose prose-invert prose-sky
  max-w-none
  prose-headings:font-bold prose-headings:text-white
  prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
  prose-p:text-white/70 prose-p:leading-relaxed
  prose-strong:text-white
  prose-code:text-sky-400 prose-code:bg-sky-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
  prose-pre:bg-slate-800 prose-pre:border prose-pre:border-white/10
  prose-a:text-sky-400 hover:prose-a:text-sky-300
  prose-blockquote:border-l-sky-500 prose-blockquote:text-white/60
  prose-ul:text-white/70 prose-ol:text-white/70
  prose-li:marker:text-sky-500
  prose-table:text-white/70
  prose-th:text-white prose-th:bg-slate-800
  prose-td:border-white/10
  prose-hr:border-white/10
"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </div>

      <footer className="mt-20 pt-10 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-6">
        <p className="text-sm text-white/30 italic">
          Cảm ơn bạn đã theo dõi bài viết này.
        </p>
        <Link
          to="/blog"
          className="px-6 py-2.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl font-bold hover:bg-sky-500 hover:text-white transition-all duration-300"
        >
          Khám phá bài viết khác →
        </Link>
      </footer>
    </article>
  );
}
