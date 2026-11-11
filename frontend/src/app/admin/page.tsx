'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Lock, 
  Mail, 
  ArrowLeft, 
  LayoutDashboard, 
  LogOut, 
  ShieldCheck, 
  Sparkles,
  Building2,
  Globe
} from 'lucide-react';

const LOGO_COLOR = '/brand-assets/LOGO-KPI-CR.png';

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedUser = window.localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/login', { email, password });
      const user = res.data.user;
      const token = res.data.token;

      window.localStorage.setItem('currentUser', JSON.stringify(user));
      window.localStorage.setItem('authToken', token);
      setCurrentUser(user);

      // Redirect directly into the Project Dashboard view
      window.location.href = '/#project';
    } catch (err: any) {
      setError(
        err.response?.data?.error || 
        'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบข้อมูลอีกครั้ง'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem('currentUser');
    window.localStorage.removeItem('authToken');
    setCurrentUser(null);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-[#091F16] via-[#0E2C1F] to-[#1A543B] text-white">
      {/* Top Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between border-b border-white/10 backdrop-blur-md">
        <a 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors p-1"
        >
          <ArrowLeft className="w-4 h-4 text-[#C9A860]" />
          <span>กลับสู่หน้าหลักสาธารณะ</span>
        </a>
        <div className="flex items-center gap-2 text-xs text-[#DFC27D]">
          <ShieldCheck className="w-4 h-4 text-[#C9A860]" />
          <span className="font-prompt">ระบบสารสนเทศภายใน • KPI Chiang Rai</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 relative overflow-hidden">
          {/* Top Decorative accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1A543B] via-[#C9A860] to-[#1A543B]" />

          {/* Institutional Branding */}
          <div className="text-center space-y-3 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#F9FBFA] p-2 mx-auto border border-slate-200 shadow-xs flex items-center justify-center">
              <img src={LOGO_COLOR} alt="สถาบันพระปกเกล้า" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1A543B] font-prompt block">
                ศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จ.เชียงราย
              </span>
              <h1 className="text-2xl font-bold font-prompt text-slate-900 mt-1">
                ระบบจัดการโครงการ (Admin)
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-light">
                สำหรับผู้ดูแลระบบและคณะกรรมการบริหารโครงการ
              </p>
            </div>
          </div>

          {/* Case 1: Already Authenticated */}
          {currentUser ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#EBF5F0] border border-[#C0E0CC] space-y-1 text-center">
                <div className="text-xs text-emerald-800 font-medium">เข้าสู่ระบบอยู่ในขณะนี้</div>
                <div className="text-base font-bold font-prompt text-[#1A543B]">
                  {currentUser.full_name || currentUser.email}
                </div>
                <div className="text-[11px] text-slate-500">
                  สิทธิ์การใช้งาน: <span className="font-semibold text-slate-700">{currentUser.role}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <a
                  href="/#project"
                  className="w-full flex items-center justify-center gap-2 bg-[#1A543B] hover:bg-[#13422E] text-white py-3 rounded-xl text-sm font-semibold font-prompt shadow-sm transition-all"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#C9A860]" />
                  <span>เข้าสู่หน้าต่าง Dashboard จัดการโครงการ</span>
                </a>

                <a
                  href="/"
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-xs font-semibold font-prompt transition-all"
                >
                  <Globe className="w-4 h-4 text-slate-500" />
                  <span>ดูหน้าเว็บไซต์สาธารณะ</span>
                </a>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 py-2.5 rounded-xl font-medium transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            </div>
          ) : (
            /* Case 2: Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 leading-relaxed">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 font-prompt">
                  อีเมลผู้ดูแลระบบ (Admin Email)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@crru.ac.th"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A543B]/20 focus:border-[#1A543B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 font-prompt">
                  รหัสผ่าน (Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A543B]/20 focus:border-[#1A543B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-[#1A543B] hover:bg-[#13422E] text-white py-3 rounded-xl text-sm font-semibold font-prompt shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>กำลังตรวจสอบสิทธิ์...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-[#C9A860]" />
                    <span>เข้าสู่ระบบบริหารจัดการ</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <a
                  href="/"
                  className="text-xs text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>กลับสู่หน้าแรกสาธารณะ</span>
                </a>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-400 border-t border-white/10">
        © 2569 ศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จังหวัดเชียงราย
      </footer>
    </div>
  );
}
