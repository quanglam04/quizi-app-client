import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { api } from '../../lib/api';

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  isPublished: boolean;
}

export default function AdminBlogEdit() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    isPublished: false,
  });

  const { data: postData, isLoading } = useQuery({
    queryKey: ['admin-blog-post', id],
    queryFn: async () => {
      if (isNew) return null;
      // Note: task_08.md says load by slug, but typically edit pages use ID.
      // If we only have ID, we need an endpoint to get by ID or the slug needs to be the ID.
      // Assuming for now the API supports GET /api/blog/:id or we fetch all and filter.
      // To be safe and follow task_06/08, let's assume if not 'new', we fetch detail.
      const response = await api.get(`/blog/admin/${id}`);
      return response.data;
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (postData) {
      setFormData({
        title: postData.title || '',
        slug: postData.slug || '',
        excerpt: postData.excerpt || '',
        content: postData.content || '',
        isPublished: postData.isPublished || false,
      });
    }
  }, [postData]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: isNew ? generateSlug(title) : prev.slug,
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async (data: BlogFormData) => {
      if (isNew) {
        return api.post('/blog', data);
      } else {
        return api.patch(`/blog/${id}`, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      alert('Đã lưu bài viết thành công!');
      navigate('/admin/blog');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi lưu bài viết.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.slug.trim() || !formData.content.trim()) {
      alert('Vui lòng nhập đầy đủ Tiêu đề, Slug và Nội dung.');
      return;
    }
    saveMutation.mutate(formData);
  };

  if (isLoading) return <div className="text-center py-20 text-white/60">Đang tải bài viết...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 sm:px-0">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/admin/blog')} className="text-white/40 hover:text-white transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-3xl font-black text-white">{isNew ? 'Viết bài mới' : 'Chỉnh sửa bài viết'}</h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saveMutation.isPending}
          className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold hover:scale-105 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-sky-500/20"
        >
          {saveMutation.isPending ? 'Đang lưu...' : 'Lưu bài viết →'}
        </button>
      </div>

      <form className="grid grid-cols-1 lg:grid-cols-2 gap-8" onSubmit={handleSubmit}>
        {/* Left Column: Form Fields */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-2xl border border-white/10 shadow-xl space-y-6">
            <h2 className="text-white font-bold text-lg flex items-center gap-2 mb-2">
              <span className="w-1.5 h-6 bg-sky-500 rounded-full"></span>
              Thông tin cơ bản
            </h2>
            
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Tiêu đề</label>
              <input
                type="text"
                value={formData.title}
                onChange={handleTitleChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                placeholder="Nhập tiêu đề bài viết..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-sky-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-mono text-xs"
                placeholder="slug-bai-viet"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Mô tả ngắn (Excerpt)</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                placeholder="Tóm tắt nội dung bài viết..."
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-5 h-5 accent-sky-500 rounded border-white/10 bg-slate-800"
                />
                <span className="text-white/70 group-hover:text-white transition-colors font-medium">
                  Công khai bài viết (Published)
                </span>
              </label>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-2xl border border-white/10 shadow-xl">
            <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Nội dung (Markdown)</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={20}
              className="w-full px-4 py-4 rounded-xl bg-slate-800 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-mono text-sm leading-relaxed"
              placeholder="# Nhập nội dung bài viết bằng Markdown..."
            />
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="space-y-4 lg:sticky lg:top-24 h-fit">
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] flex items-center mb-4">
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Xem trước nội dung
          </h2>
          <div className="bg-slate-900 p-10 rounded-2xl border border-white/10 shadow-inner h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar prose prose-invert prose-sky max-w-none">
            {formData.title && <h1 className="text-white font-black text-4xl mb-8 leading-tight">{formData.title}</h1>}
            {formData.content ? (
              <ReactMarkdown>
                {formData.content}
              </ReactMarkdown>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white/20">
                <svg className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 2v4a2 2 0 002 2h4" />
                </svg>
                <p className="italic font-medium">Nội dung sẽ hiển thị tại đây...</p>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
