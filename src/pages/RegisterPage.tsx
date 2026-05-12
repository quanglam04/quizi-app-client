import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { api, useAuthStore } from '../lib/api';

const registerSchema = z.object({
  name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string(),
  role: z.enum(['candidate', 'teacher']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login, token } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      navigate('/home', { replace: true });
    }
  }, [token, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'candidate',
    }
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      const { user, token } = response.data;
      login(user, token);
      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-950">
      {/* Left panel (gradient bg) - Hidden on mobile */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 relative overflow-hidden p-12">
        {/* Orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-sky-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Logo */}
        <div className="relative z-10 text-center">
          <div className="text-5xl font-black text-white mb-4">
            ✦{" "}
            <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
              QuizApp
            </span>
          </div>
          <p className="text-white/60 text-lg">
            Khám phá kiến thức,<br />vươn tới tầm cao mới
          </p>

          {/* Mini stats */}
          <div className="flex gap-8 mt-12 justify-center">
            {[
              ["500+", "Câu hỏi"],
              ["50+", "Đề thi"],
              ["1000+", "Lượt thi"],
            ].map(([n, l], idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl font-bold text-sky-400">{n}</div>
                <div className="text-white/40 text-xs mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel (form card) */}
      <div className="flex flex-col justify-center items-center p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md my-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-3xl font-black text-white">
              ✦ <span className="text-sky-400">QuizApp</span>
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Đăng ký tài khoản</h2>
          <p className="text-white/40 mb-8">Bắt đầu hành trình của bạn ngay hôm nay</p>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Họ tên
              </label>
              <input
                type="text"
                {...register('name')}
                placeholder="Nguyễn Văn A"
                className={`w-full px-4 py-3 rounded-xl bg-slate-800 border ${
                  errors.name ? 'border-red-500' : 'border-white/10'
                } text-white placeholder-white/20 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all duration-200`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Email
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="email@example.com"
                className={`w-full px-4 py-3 rounded-xl bg-slate-800 border ${
                  errors.email ? 'border-red-500' : 'border-white/10'
                } text-white placeholder-white/20 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all duration-200`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 rounded-xl bg-slate-800 border ${
                    errors.password ? 'border-red-500' : 'border-white/10'
                  } text-white placeholder-white/20 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all duration-200`}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Xác nhận
                </label>
                <input
                  type="password"
                  {...register('confirmPassword')}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 rounded-xl bg-slate-800 border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-white/10'
                  } text-white placeholder-white/20 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all duration-200`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Vai trò
              </label>
              <select
                {...register('role')}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all duration-200"
              >
                <option value="candidate">Học sinh / Sinh viên</option>
                <option value="teacher">Giáo viên</option>
              </select>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl hover:scale-[1.02] hover:shadow-lg hover:shadow-sky-500/30 transition-all duration-300 mt-2 disabled:opacity-50"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký →'}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-8">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-sky-400 hover:text-sky-300 font-medium"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
