import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuthStore } from "../lib/api";

const LandingPage = () => {
  const { token } = useAuthStore();

  if (token) {
    return <Navigate to="/home" replace />;
  }

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const heroRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--y", `${e.clientY - rect.top}px`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-sky-500/30 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10 sticky">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sky-400 text-2xl">✦</span>
              <span className="text-xl font-black tracking-tight text-white">
                QuizApp
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-sm font-medium text-white/70 hover:text-sky-400 transition-colors"
              >
                Tính năng
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-sm font-medium text-white/70 hover:text-sky-400 transition-colors"
              >
                Quy trình
              </button>
              <Link
                to="/blog"
                className="text-sm font-medium text-white/70 hover:text-sky-400 transition-colors"
              >
                Blog
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-medium text-white/70 hover:text-sky-400 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="bg-sky-500 hover:bg-sky-400 text-white px-5 py-2 rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-sky-500/25 flex items-center gap-2"
              >
                Bắt đầu <span className="text-lg">→</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative min-h-screen flex items-center pt-20 overflow-hidden"
        style={{ "--x": "50%", "--y": "50%" } as React.CSSProperties}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.07)_1px,_transparent_1px)] bg-[size:30px_30px]" />
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background:
              "radial-gradient(600px circle at var(--x) var(--y), rgba(56,189,248,0.12), transparent 70%)",
          }}
        />
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-500/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sky-600/15 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-sm animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              Nền tảng trắc nghiệm trực tuyến miễn phí
            </span>

            <h1
              className="text-5xl md:text-7xl font-black leading-[1.1] animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              Luyện thi thông minh
              <br />
              <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-500 bg-clip-text text-transparent">
                Kết quả vượt trội
              </span>
            </h1>

            <p
              className="text-white/60 text-lg md:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              Nền tảng trắc nghiệm trực tuyến dành cho học sinh, sinh viên và
              các tổ chức giáo dục — Làm bài, xem kết quả tức thì, theo dõi tiến
              độ học tập hiệu quả.
            </p>

            <div
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-up"
              style={{ animationDelay: "0.3s" }}
            >
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-xl shadow-sky-500/30 hover:shadow-sky-400/50 flex items-center justify-center gap-2"
              >
                Bắt đầu làm bài →
              </Link>
              <button
                onClick={() => scrollToSection("features")}
                className="w-full sm:w-auto px-8 py-4 border border-white/20 hover:border-sky-400/50 text-white/80 hover:text-sky-400 rounded-xl font-bold text-lg transition-all hover:bg-sky-500/10 backdrop-blur-sm"
              >
                Tìm hiểu thêm ↓
              </button>
            </div>
          </div>

          <div
            className="relative animate-fade-up lg:block hidden"
            style={{ animationDelay: "0.4s" }}
          >
            {/* Quiz Mockup Card */}
            <div className="animate-float animate-glow rounded-2xl overflow-hidden border border-white/10 bg-slate-800/80 backdrop-blur-xl shadow-2xl shadow-sky-500/20 max-w-md mx-auto">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-700/50 border-b border-white/10">
                <span className="text-white/60 text-sm">Câu 3 / 30</span>
                <span className="text-sky-400 font-mono font-bold">12:45</span>
              </div>

              <div className="p-6">
                <p className="text-white font-medium mb-6 text-lg">
                  API Gateway đóng vai trò gì trong microservices?
                </p>
                <div className="space-y-3">
                  {[
                    "Lưu trữ dữ liệu",
                    "Điểm vào duy nhất ✓",
                    "Thực thi logic",
                    "Quản lý schema",
                  ].map((opt, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-4 rounded-xl text-sm transition-all
                      ${
                        i === 1
                          ? "bg-sky-500/20 border border-sky-500/50 text-sky-300 font-bold"
                          : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                        ${i === 1 ? "border-sky-400 bg-sky-400" : "border-white/30"}`}
                      >
                        {i === 1 && (
                          <span className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </span>
                      {opt}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-8">
                  <button className="px-5 py-2 text-xs bg-white/10 text-white/60 rounded-lg hover:bg-white/20 transition-colors">
                    ← Trước
                  </button>
                  <button className="px-5 py-2 text-xs bg-sky-500 text-white rounded-lg hover:bg-sky-400 transition-all font-bold">
                    Tiếp →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-black text-white">
              Tại sao chọn <span className="text-sky-400">QuizApp</span>?
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              Chúng tôi cung cấp giải pháp luyện tập và đánh giá toàn diện cho
              mọi nhu cầu giáo dục.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "📝",
                title: "Ngân hàng câu hỏi",
                desc: "Hàng trăm câu hỏi biên soạn kỹ theo từng chủ đề",
              },
              {
                icon: "⚡",
                title: "Chấm điểm tức thì",
                desc: "Nộp bài xem ngay đáp án, giải thích chi tiết",
              },
              {
                icon: "📊",
                title: "Theo dõi tiến độ",
                desc: "Lịch sử làm bài, so sánh điểm qua các lần thi",
              },
              {
                icon: "🏫",
                title: "Quản lý lớp học",
                desc: "Giáo viên tạo lớp, giao đề cho từng nhóm học sinh",
              },
              {
                icon: "🔒",
                title: "Bảo mật & ổn định",
                desc: "Dữ liệu an toàn, hệ thống hoạt động 24/7",
              },
              {
                icon: "📱",
                title: "Mọi thiết bị",
                desc: "Làm bài trên điện thoại, máy tính đều mượt mà",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl bg-slate-800/50 border border-white/10 hover:-translate-y-2 hover:border-sky-500/50 hover:bg-slate-800 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 cursor-default group"
              >
                <div className="w-14 h-14 rounded-xl bg-sky-500/20 flex items-center justify-center text-3xl mb-6 group-hover:bg-sky-500/30 group-hover:scale-110 transition-all">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-sky-400 transition-colors">
                  {f.title}
                </h3>
                <p className="text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-sky-600/80 to-cyan-500/80 overflow-hidden relative backdrop-blur-sm">
        <div
          className="absolute top-0 left-0 w-full h-full opacity-10"
          style={{
            backgroundImage: "radial-gradient(white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "500+", label: "Câu hỏi" },
              { number: "50+", label: "Bộ đề thi" },
              { number: "1000+", label: "Lượt làm bài" },
              { number: "100%", label: "Miễn phí" },
            ].map((s, i) => (
              <div key={i} className="text-center group">
                <div className="text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                  {s.number}
                </div>
                <div className="text-sky-100 text-sm font-bold uppercase tracking-widest">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute inset-0 bg-slate-950/30" />
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-24 bg-slate-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl font-black text-white">
              Bắt đầu chỉ trong <span className="text-sky-400">3 bước</span>
            </h2>
            <p className="text-white/50">Đơn giản, nhanh chóng và hiệu quả.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-16 relative">
            {/* Connecting Lines (Desktop) */}
            <div className="absolute top-8 left-1/4 right-1/4 h-0.5 bg-sky-500/20 hidden md:block"></div>

            {[
              {
                step: "1",
                title: "Đăng nhập",
                desc: "Tạo tài khoản miễn phí hoặc đăng nhập với mã được cấp",
              },
              {
                step: "2",
                title: "Chọn đề thi",
                desc: "Browse đề theo chủ đề, lớp học hoặc do giáo viên giao",
              },
              {
                step: "3",
                title: "Làm bài & Kết quả",
                desc: "Nộp bài xem điểm, đáp án và giải thích chi tiết",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="relative flex flex-col items-center text-center group z-10"
              >
                <div className="w-20 h-20 rounded-2xl bg-sky-500/20 border-2 border-sky-500/50 flex items-center justify-center text-sky-400 font-black text-2xl mb-6 group-hover:bg-sky-500 group-hover:border-sky-400 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-lg shadow-sky-500/10">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-white/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For who Section */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white">
              Dành cho tất cả mọi người
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "👨‍🎓",
                title: "Học sinh / Sinh viên",
                desc: "Ôn luyện kiến thức, chuẩn bị cho kỳ thi với hàng trăm câu hỏi đa dạng.",
              },
              {
                icon: "👨‍🏫",
                title: "Giáo viên / Giảng viên",
                desc: "Tạo lớp học, biên soạn đề thi, theo dõi kết quả của từng học sinh dễ dàng.",
              },
              {
                icon: "🏢",
                title: "Tổ chức / Doanh nghiệp",
                desc: "Tổ chức kiểm tra nội bộ, đánh giá năng lực nhân viên hoặc ứng viên hiệu quả.",
              },
            ].map((p, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl relative bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 hover:border-sky-500/50 hover:-translate-y-2 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300"
              >
                <div className="text-4xl mb-6">{p.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{p.title}</h3>
                <p className="text-white/50 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-500">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-300/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1.5s" }}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Sẵn sàng bắt đầu chưa?
          </h2>
          <p className="text-sky-100 text-xl mb-10">
            Tham gia cùng hàng ngàn người dùng ngay hôm nay — hoàn toàn miễn
            phí.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-sky-600 rounded-2xl font-bold text-xl transition-all hover:scale-105 shadow-2xl hover:shadow-white/20"
          >
            Đăng ký miễn phí →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div className="space-y-4">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-sky-400 text-2xl">✦</span>
                <span className="text-xl font-black tracking-tight text-white">
                  QuizApp
                </span>
              </div>
              <p className="text-white/40 text-sm">
                © 2025 QuizApp. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-white/40 text-sm font-medium">
              <a href="#" className="hover:text-sky-400 transition-colors">
                Tính năng
              </a>
              <a href="#" className="hover:text-sky-400 transition-colors">
                Blog
              </a>
              <a href="#" className="hover:text-sky-400 transition-colors">
                Liên hệ
              </a>
              <a href="#" className="hover:text-sky-400 transition-colors">
                Điều khoản
              </a>
              <a href="#" className="hover:text-sky-400 transition-colors">
                Chính sách
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
