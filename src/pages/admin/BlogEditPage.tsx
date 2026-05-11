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

  if (isLoading) return <div className="text-center py-20">Đang tải bài viết...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/admin/blog')} className="text-gray-400 hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{isNew ? 'Viết bài mới' : 'Chỉnh sửa bài viết'}</h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saveMutation.isPending}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {saveMutation.isPending ? 'Đang lưu...' : 'Lưu bài viết'}
        </button>
      </div>

      <form className="grid grid-cols-1 lg:grid-cols-2 gap-8" onSubmit={handleSubmit}>
        {/* Left Column: Form Fields */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
              <input
                type="text"
                value={formData.title}
                onChange={handleTitleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Nhập tiêu đề bài viết..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono text-xs"
                placeholder="slug-bai-viet"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mô tả ngắn (Excerpt)</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={2}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Tóm tắt nội dung bài viết..."
              />
            </div>

            <div className="flex items-center">
              <input
                id="isPublished"
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900 font-medium">
                Công khai bài viết (Published)
              </label>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung (Markdown)</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={20}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
              placeholder="# Nhập nội dung bài viết bằng Markdown..."
            />
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-700 flex items-center">
            <svg className="mr-2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </h2>
          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-inner h-[calc(100vh-250px)] overflow-y-auto prose prose-indigo max-w-none">
            {formData.title && <h1 className="text-3xl font-bold mb-6">{formData.title}</h1>}
            {formData.content ? (
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-bold mt-6 mb-3">{children}</h2>,
                  p: ({ children }) => <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>,
                  code: ({ children }) => <code className="bg-gray-100 rounded px-1 text-sm font-mono text-indigo-600">{children}</code>,
                }}
              >
                {formData.content}
              </ReactMarkdown>
            ) : (
              <p className="text-gray-400 italic">Chưa có nội dung để hiển thị preview...</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
