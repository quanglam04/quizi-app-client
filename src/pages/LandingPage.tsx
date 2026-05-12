import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-indigo-500/30">
      {/* Navbar Landing Page */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                QuizApp
              </span>
            </div>
            <div>
              <Link
                to="/login"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/25"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Section 1 - Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950 via-slate-900 to-slate-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#4f46e5 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Nền tảng trắc nghiệm trực tuyến
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
              Luyện thi <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">thông minh</span><br />
              Kết quả vượt trội
            </h1>
            
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto lg:mx-0">
              Hệ thống trắc nghiệm trực tuyến dành cho sinh viên PTIT — 
              Làm bài, xem kết quả tức thì, theo dõi tiến độ học tập.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                Bắt đầu làm bài
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <button
                onClick={scrollToFeatures}
                className="w-full sm:w-auto px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-white border border-slate-700 rounded-xl font-bold text-lg transition-all"
              >
                Tìm hiểu thêm
              </button>
            </div>
          </div>

          <div className="flex-1 w-full max-w-2xl animate-fade-in delay-200">
            {/* Terminal Mockup */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
              <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-700">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                <div className="text-xs font-mono text-slate-500">quiz-app-session.sh</div>
                <div className="w-10"></div>
              </div>
              <div className="p-6 font-sans">
                <div className="flex justify-between items-center mb-6 text-sm text-indigo-400 font-mono">
                  <span>Câu 3/30</span>
                  <span>12:45</span>
                </div>
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-100">API Gateway đóng vai trò gì?</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 hover:bg-slate-700/50 transition-colors cursor-pointer">
                      <div className="w-5 h-5 rounded-full border-2 border-slate-600"></div>
                      <span className="text-slate-300">A. Lưu trữ dữ liệu</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-indigo-500/50 bg-indigo-500/10 transition-colors cursor-pointer relative overflow-hidden group">
                      <div className="w-5 h-5 rounded-full border-2 border-indigo-500 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                      </div>
                      <span className="text-indigo-100 font-medium">B. Điểm vào duy nhất</span>
                      <span className="ml-auto text-xs text-indigo-400 font-mono">selected</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 hover:bg-slate-700/50 transition-colors cursor-pointer">
                      <div className="w-5 h-5 rounded-full border-2 border-slate-600"></div>
                      <span className="text-slate-300">C. Thực thi logic</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 hover:bg-slate-700/50 transition-colors cursor-pointer">
                      <div className="w-5 h-5 rounded-full border-2 border-slate-600"></div>
                      <span className="text-slate-300">D. Quản lý schema</span>
                    </div>
                  </div>
                  <div className="flex justify-between pt-4">
                    <div className="px-4 py-2 bg-slate-700 rounded text-sm font-medium text-slate-400">Trước</div>
                    <div className="px-4 py-2 bg-indigo-600 rounded text-sm font-medium text-white">Tiếp theo</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 - Features */}
      <section id="features" className="py-24 bg-white text-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Tại sao chọn QuizApp?</h2>
          <div className="w-20 h-1 bg-indigo-600 mx-auto rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl border border-slate-100 bg-slate-50 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Ngân hàng câu hỏi phong phú</h3>
            <p className="text-slate-600 leading-relaxed">
              Hàng trăm câu hỏi được biên soạn kỹ lưỡng theo từng chủ đề, cập nhật thường xuyên.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-purple-100 bg-purple-50/30 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Chấm điểm tự động</h3>
            <p className="text-slate-600 leading-relaxed">
              Nộp bài xong xem ngay đáp án đúng/sai, giải thích chi tiết từng câu hỏi.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-blue-100 bg-blue-50/30 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Lịch sử làm bài</h3>
            <p className="text-slate-600 leading-relaxed">
              Xem lại toàn bộ lịch sử, so sánh điểm số qua các lần thi để biết mình tiến bộ thế nào.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 - Stats */}
      <section className="py-20 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-black">300+</div>
              <div className="text-indigo-100 font-medium">Sinh viên</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-black">10+</div>
              <div className="text-indigo-100 font-medium">Bộ đề thi</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-black">500+</div>
              <div className="text-indigo-100 font-medium">Câu hỏi</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-black">98%</div>
              <div className="text-indigo-100 font-medium">Hài lòng</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 - How it works */}
      <section className="py-24 bg-white text-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Bắt đầu chỉ trong 3 bước</h2>
            <div className="w-20 h-1 bg-indigo-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '1', title: 'Đăng nhập', desc: 'Dùng mã sinh viên để đăng nhập ngay' },
              { step: '2', title: 'Chọn đề thi', desc: 'Chọn chủ đề muốn ôn luyện' },
              { step: '3', title: 'Làm bài & Kết quả', desc: 'Nộp bài, xem đáp án chi tiết tức thì' },
            ].map((item, idx) => (
              <div key={idx} className="relative text-center space-y-4">
                <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto shadow-lg shadow-indigo-200">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 - Final CTA */}
      <section className="py-24 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Sẵn sàng bắt đầu chưa?</h2>
          <p className="text-slate-400 text-xl mb-10">Đăng nhập ngay để truy cập toàn bộ đề thi.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-indigo-600 hover:bg-slate-100 rounded-2xl font-bold text-xl transition-all hover:scale-105 shadow-2xl"
          >
            Đăng nhập ngay
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 border-t border-slate-800 text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>© 2025 QuizApp — PTIT</div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Liên hệ</a>
            <a href="#" className="hover:text-white transition-colors">Điều khoản</a>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
