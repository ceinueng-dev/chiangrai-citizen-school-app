'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  LayoutDashboard,
  UserCheck,
  Camera,
  FileText,
  Wallet,
  MapPin,
  CheckCircle2,
  Clock,
  TrendingUp,
  Info,
  BookOpen,
  Award,
  BarChart3,
  Mail,
  Users,
  Phone,
  AtSign,
  MessageCircle,
  Pencil,
  Home,
  MapPinned,
  Newspaper,
  Trash2,
  ShieldCheck,
  UserCog,
  ClipboardList,
  Lock,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ExternalLink,
  ChevronRight,
  Printer,
  Calendar,
  AlertCircle,
  Eye,
  Plus,
  RefreshCw,
  Search,
  Check,
  Compass,
  GraduationCap,
  Building2,
  Target,
  Layers,
  FolderOpen,
  ArrowUpRight,
  Download,
  FileCheck2,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

const API_BASE = '/api';
const LOGO_COLOR = '/brand-assets/LOGO-KPI-CR.png';
const LOGO_MOURNING = '/brand-assets/LOGO-KPI-CR-WB.png';
const LANDING_HERO = '/brand-assets/landing-page.png';

const formatBuddhistDate = (dateValue: string) => {
  const match = dateValue?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return dateValue;
  const year = Number(match[1]);
  const buddhistYear = year >= 2400 ? year : year + 543;
  return `${match[3]}-${match[2]}-${buddhistYear}`;
};

const getErrorMessage = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const apiMessage = err.response?.data?.error;
    if (status === 401) return 'Session หมดอายุ กรุณาออกจากระบบแล้วเข้าสู่ระบบใหม่';
    if (status === 403) return 'บัญชีนี้ยังไม่มีสิทธิ์ดำเนินการนี้ กรุณาตรวจสอบ role ในเมนูผู้ใช้';
    if (status === 413) return 'ไฟล์รูปมีขนาดใหญ่เกินไป กรุณาลดจำนวนรูปหรือลองเลือกรูปใหม่';
    if (typeof apiMessage === 'string') return apiMessage;
    if (typeof err.response?.data === 'string') return err.response.data;
    if (status) return `${fallback} (HTTP ${status})`;
    if (err.message) return `${fallback}: ${err.message}`;
  }
  return fallback;
};

const compressImageForUpload = (file: File) =>
  new Promise<File>((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const maxSide = 1400;
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');

      if (!context) {
        resolve(file);
        return;
      }

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      canvas.toBlob(
        blob => {
          if (!blob) {
            resolve(file);
            return;
          }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
        },
        'image/jpeg',
        0.82
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    image.src = objectUrl;
  });

const COMMITTEE_AUTHORITY_DOCUMENTS = [
  {
    title: 'หนังสือนำส่งรายชื่อทบทวนกรรมการ',
    src: '/committee-documents/committee-authority-1.jpg',
  },
  {
    title: 'บัญชีรายชื่อคณะกรรมการศูนย์ฯ',
    src: '/committee-documents/committee-authority-2.jpg',
  },
];

type Tab = 'dashboard' | 'attendance' | 'activity' | 'policy' | 'reports' | 'about' | 'documents' | 'committee' | 'contact' | 'newsFeed' | 'news' | 'users' | 'finance';
type UserRole = 'super_admin' | 'project_admin' | 'committee_member' | 'staff_operator' | 'participant_learner' | 'public_viewer';
type UserStatus = 'active' | 'inactive';

interface ProjectInfo {
  name: string;
  rationale: string;
  objective: string;
  expected_outcome: string;
  graduation_criteria: string;
  curriculum: string;
  manager: string;
  center_chair?: string;
  responsible_agency: string;
  location: string;
  target_group: string;
  networking: string;
  duration: string;
}

interface BudgetCategory {
  id: number;
  name: string;
  allocated_amount: number;
  spent_amount: number;
}

interface Student {
  id: number;
  name: string;
  total_hours: number;
}

interface Policy {
  id: number;
  title: string;
  description: string;
  status: 'Drafting' | 'Completed' | 'Proposed';
}

interface OfficialDocument {
  id: number;
  title: string;
  document_type?: 'official' | 'training_form' | 'student_list' | 'training_material' | 'financial_slip' | 'report';
  doc_number: string;
  date: string;
  to_agency: string;
  file_url: string | null;
  status: string;
}

interface Expense {
  amount: number;
  description: string;
  category_id: number;
  category_name: string;
}

interface ActivityLog {
  id: number;
  description: string;
  photo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
}

interface Activity {
  id: number;
  parent_id: number | null;
  title: string;
  description: string;
  allocated_budget: number;
  expenses: Expense[];
  logs: ActivityLog[];
  sub_activities: Activity[];
  total_expense: number;
}

interface ProcessTimelineItem {
  id: number;
  activity_order: number;
  title: string;
  start_month: number;
  end_month: number;
}

interface CommitteeMember {
  id: number;
  group_name: string;
  position: string;
  full_name: string;
  phone: string;
  email: string;
  line_contact: string;
  photo_url: string | null;
  photo_data?: string | null;
  bio: string;
  display_order: number;
}

interface NewsUpdate {
  id: number;
  title: string;
  summary: string;
  event_date: string;
  status: 'draft' | 'published';
  show_on_landing: number;
  image_data: string | null;
  image_data_list?: string | null;
  created_at: string;
}

interface AppUser {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  line_contact: string;
  role: UserRole;
  status: UserStatus;
  notes: string;
  created_at: string;
}

const processMonths = ['ม.ค.69', 'ก.พ.69', 'มี.ค.69', 'เม.ย.69', 'พ.ค.69', 'มิ.ย.69', 'ก.ค.69'];
type SignaturePointerEvent = React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>;

const roleAccess: Record<UserRole, Tab[]> = {
  super_admin: ['dashboard', 'attendance', 'activity', 'reports', 'policy', 'committee', 'newsFeed', 'news', 'users', 'finance', 'documents', 'about', 'contact'],
  project_admin: ['dashboard', 'attendance', 'activity', 'reports', 'policy', 'committee', 'newsFeed', 'news', 'finance', 'documents', 'about', 'contact'],
  committee_member: ['dashboard', 'reports', 'committee', 'newsFeed', 'news', 'documents', 'about', 'contact'],
  staff_operator: ['dashboard', 'attendance', 'activity', 'reports', 'newsFeed', 'news', 'finance', 'documents', 'about', 'contact'],
  participant_learner: ['dashboard', 'newsFeed', 'documents', 'about', 'contact'],
  public_viewer: ['dashboard', 'newsFeed', 'about', 'contact'],
};

export default function HomeApp() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showProject, setShowProject] = useState(false);
  const [showAllNews, setShowAllNews] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsUpdate | null>(null);

  // Data states
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [budget, setBudget] = useState<BudgetCategory[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [documents, setDocuments] = useState<OfficialDocument[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [timeline, setTimeline] = useState<ProcessTimelineItem[]>([]);
  const [committee, setCommittee] = useState<CommitteeMember[]>([]);
  const [news, setNews] = useState<NewsUpdate[]>([]);
  const [roleDefinitions, setRoleDefinitions] = useState<Record<string, any>>({});
  const [users, setUsers] = useState<AppUser[]>([]);

  // Auth states
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [authToken, setAuthToken] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regLine, setRegLine] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regNotes, setRegNotes] = useState('');

  // News creation / edit state
  const [newsTitle, setNewsTitle] = useState('');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsDate, setNewsDate] = useState('');
  const [newsStatus, setNewsStatus] = useState<'draft' | 'published'>('published');
  const [newsShowOnLanding, setNewsShowOnLanding] = useState(true);
  const [newsImages, setNewsImages] = useState<File[]>([]);
  const [editingNewsId, setEditingNewsId] = useState<number | null>(null);
  const [editingNewsTitle, setEditingNewsTitle] = useState('');
  const [editingNewsSummary, setEditingNewsSummary] = useState('');
  const [editingNewsDate, setEditingNewsDate] = useState('');
  const [editingNewsStatus, setEditingNewsStatus] = useState<'draft' | 'published'>('published');
  const [editingNewsShowOnLanding, setEditingNewsShowOnLanding] = useState(true);
  const [editingNewsImages, setEditingNewsImages] = useState<File[]>([]);

  // Attendance & expense forms
  const [selectedStudent, setSelectedStudent] = useState('');
  const [attendanceHours, setAttendanceHours] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseActivity, setExpenseActivity] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');

  // Finance Memo State
  const [memoProjectName, setMemoProjectName] = useState('โครงการโรงเรียนพลเมืองตำบลบ้านดู่');
  const [memoFiscalYear, setMemoFiscalYear] = useState('2569');
  const [memoDuration, setMemoDuration] = useState('มกราคม - กรกฎาคม 2569');
  const [memoAmount, setMemoAmount] = useState('50000');
  const [memoBookNumber, setMemoBookNumber] = useState('ศพพ.ชร. 001/2569');
  const [memoDate, setMemoDate] = useState('');
  const [memoSigner, setMemoSigner] = useState('อาจารย์ ดร. ณัฏฐพล สันธิ');
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  // Frontpage interactive states
  const [landingCommitteeFilter, setLandingCommitteeFilter] = useState<'all' | 'exec_advisor' | 'vice' | 'members'>('all');
  const [landingActiveModule, setLandingActiveModule] = useState<number>(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setNewsDate(today);
    setMemoDate(today);

    const handleHash = () => {
      setShowProject(window.location.hash === '#project');
      setShowAllNews(window.location.hash === '#news');
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    const savedUser = window.localStorage.getItem('currentUser');
    const savedToken = window.localStorage.getItem('authToken');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    if (savedToken) setAuthToken(savedToken);
  }, []);

  useEffect(() => {
    if (authToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [authToken]);

  const loadAllData = async () => {
    try {
      const [dashRes, actRes, timeRes, commRes, newsRes, rolesRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/dashboard`),
        axios.get(`${API_BASE}/activities/detailed`),
        axios.get(`${API_BASE}/process_timeline`),
        axios.get(`${API_BASE}/committee`),
        axios.get(`${API_BASE}/news`),
        axios.get(`${API_BASE}/roles`)
      ]);

      if (dashRes.status === 'fulfilled') {
        const d = dashRes.value.data;
        setProjectInfo(d.info);
        setBudget(d.budget || []);
        setStudents(d.students || []);
        setPolicies(d.policies || []);
        setDocuments(d.documents || []);
      }
      if (actRes.status === 'fulfilled') setActivities(actRes.value.data || []);
      if (timeRes.status === 'fulfilled') setTimeline(timeRes.value.data || []);
      if (commRes.status === 'fulfilled') setCommittee(commRes.value.data || []);
      if (newsRes.status === 'fulfilled') setNews(newsRes.value.data || []);
      if (rolesRes.status === 'fulfilled') setRoleDefinitions(rolesRes.value.data || {});

      if (currentUser?.role === 'super_admin') {
        try {
          const userRes = await axios.get(`${API_BASE}/users`);
          setUsers(userRes.data || []);
        } catch (e) {
          console.error(e);
        }
      }
    } catch (err) {
      console.error('Failed loading data:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [currentUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/login`, {
        email: loginEmail,
        password: loginPassword
      });
      setCurrentUser(res.data.user);
      setAuthToken(res.data.token);
      window.localStorage.setItem('currentUser', JSON.stringify(res.data.user));
      window.localStorage.setItem('authToken', res.data.token);
      setLoginModalOpen(false);
      setLoginEmail('');
      setLoginPassword('');
      setShowProject(true);
      window.location.hash = '#project';
    } catch (err: any) {
      alert(getErrorMessage(err, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'));
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken('');
    window.localStorage.removeItem('currentUser');
    window.localStorage.removeItem('authToken');
    setShowProject(false);
    window.location.hash = '';
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/register`, {
        full_name: regFullName,
        email: regEmail,
        phone: regPhone,
        line_contact: regLine,
        password: regPassword,
        notes: regNotes
      });
      alert('ส่งคำขอลงทะเบียนสำเร็จ กรุณารอผู้ดูแลระบบอนุมัติการใช้งาน');
      setRegisterModalOpen(false);
      setRegFullName('');
      setRegEmail('');
      setRegPhone('');
      setRegLine('');
      setRegPassword('');
      setRegNotes('');
    } catch (err) {
      alert(getErrorMessage(err, 'เกิดข้อผิดพลาดในการลงทะเบียน'));
    }
  };

  const canAccess = (tab: Tab) => {
    if (!currentUser) return ['dashboard', 'about', 'contact', 'newsFeed'].includes(tab);
    if (currentUser.role === 'super_admin') return true;
    return (roleAccess[currentUser.role] || []).includes(tab);
  };

  // News Management Actions
  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim()) return alert('กรุณากรอกหัวข้อข่าว');
    const formData = new FormData();
    formData.append('title', newsTitle);
    formData.append('summary', newsSummary);
    formData.append('event_date', newsDate);
    formData.append('status', newsStatus);
    formData.append('show_on_landing', newsShowOnLanding ? '1' : '0');

    try {
      const compressedImages = await Promise.all(newsImages.map(img => compressImageForUpload(img)));
      compressedImages.forEach(img => formData.append('images', img));
      await axios.post(`${API_BASE}/news`, formData);
      alert('บันทึกข่าวสารสำเร็จ!');
      setNewsTitle('');
      setNewsSummary('');
      setNewsImages([]);
      loadAllData();
    } catch (err) {
      alert(getErrorMessage(err, 'เกิดข้อผิดพลาดในการบันทึกข่าวสาร'));
    }
  };

  const handleDeleteNews = async (id: number) => {
    if (!confirm('ยืนยันการลบข่าวสารนี้?')) return;
    try {
      await axios.delete(`${API_BASE}/news/${id}`);
      loadAllData();
    } catch (err) {
      alert(getErrorMessage(err, 'เกิดข้อผิดพลาดในการลบข่าว'));
    }
  };

  // Attendance Action
  const handleAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !attendanceHours) return alert('กรุณาเลือกผู้เรียนและจำนวนชั่วโมง');
    try {
      await axios.post(`${API_BASE}/attendance`, {
        student_id: parseInt(selectedStudent),
        hours: parseFloat(attendanceHours),
        date: new Date().toISOString().split('T')[0]
      });
      alert('บันทึกเวลาเรียนสำเร็จ!');
      setAttendanceHours('');
      loadAllData();
    } catch (err) {
      alert(getErrorMessage(err, 'เกิดข้อผิดพลาดในการบันทึกเวลาเรียน'));
    }
  };

  // Expense Action
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseCategory || !expenseAmount) return alert('กรุณากรอกข้อมูลค่าใช้จ่ายให้ครบถ้วน');
    try {
      await axios.post(`${API_BASE}/expenses`, {
        category_id: parseInt(expenseCategory),
        activity_id: expenseActivity ? parseInt(expenseActivity) : null,
        amount: parseFloat(expenseAmount),
        description: expenseDesc,
        date: new Date().toISOString().split('T')[0]
      });
      alert('บันทึกค่าใช้จ่ายสำเร็จ!');
      setExpenseAmount('');
      setExpenseDesc('');
      loadAllData();
    } catch (err) {
      alert(getErrorMessage(err, 'เกิดข้อผิดพลาดในการบันทึกค่าใช้จ่าย'));
    }
  };

  // Signature canvas handlers
  const startDrawing = (e: SignaturePointerEvent) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsSigning(true);
  };

  const draw = (e: SignaturePointerEvent) => {
    if (!isSigning) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isSigning) return;
    setIsSigning(false);
    if (signatureCanvasRef.current) {
      setSignatureData(signatureCanvasRef.current.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  const publishedNews = news.filter(n => n.status === 'published');
  const landingNews = publishedNews.filter(n => n.show_on_landing === 1);
  const displayNews = landingNews.length > 0 ? landingNews : publishedNews;

  // Filtered committee for landing page
  const filteredCommittee = committee.filter(m => {
    if (landingCommitteeFilter === 'all') return true;
    if (landingCommitteeFilter === 'exec_advisor') {
      return (m.position.includes('ประธาน') && !m.position.includes('รองประธาน')) || m.position.includes('ที่ปรึกษา');
    }
    if (landingCommitteeFilter === 'vice') {
      return m.position.includes('รองประธาน');
    }
    if (landingCommitteeFilter === 'members') {
      return (m.position.includes('กรรมการ') || m.position.includes('เลขานุการ')) && !m.position.includes('รองประธาน') && !m.position.includes('ที่ปรึกษา') && m.position !== 'ประธานกรรมการ';
    }
    return true;
  });

  // Render Public Landing Page
  if (!showProject) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
        {/* Top Civic Navigation Bar */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={LOGO_COLOR} alt="สถาบันพระปกเกล้า" className="h-14 w-auto object-contain drop-shadow-xs" />
              <div className="border-l-2 border-[#1A543B]/20 pl-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#1A543B] block font-prompt">
                  ศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า
                </span>
                <span className="text-base font-bold text-slate-900 font-prompt">
                  จังหวัดเชียงราย
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-5 text-xs font-medium text-slate-600">
              <a href="#about-section" className="hover:text-[#1A543B] transition-colors">เกี่ยวกับโครงการ</a>
              <a href="#objectives-section" className="hover:text-[#1A543B] transition-colors">วัตถุประสงค์</a>
              <a href="#curriculum-section" className="hover:text-[#1A543B] transition-colors">หลักสูตร 60 ชม.</a>
              <a href="#timeline-section" className="hover:text-[#1A543B] transition-colors">แผนงาน 2569</a>
              <a href="#policy-section" className="hover:text-[#1A543B] transition-colors">Policy Lab</a>
              <a href="#budget-section" className="hover:text-[#1A543B] transition-colors">งบประมาณ</a>
              <a href="#committee-section" className="hover:text-[#1A543B] transition-colors">คณะกรรมการ</a>
              <a href="#documents-section" className="hover:text-[#1A543B] transition-colors">เอกสาร & ข่าว</a>
              <a href="#contact-section" className="hover:text-[#1A543B] transition-colors">ติดต่อ</a>
            </nav>

            <div className="flex items-center gap-2">
              {currentUser ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setShowProject(true);
                      window.location.hash = '#project';
                    }}
                    className="inline-flex items-center gap-1.5 bg-[#1A543B] hover:bg-[#13422E] text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs hover:shadow-sm transition-all"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#C9A860]" />
                    <span>เข้าสู่แดชบอร์ด</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    title="ออกจากระบบ"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setLoginModalOpen(true)}
                    className="inline-flex items-center gap-1.5 bg-[#1A543B] hover:bg-[#13422E] text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs hover:shadow-sm transition-all"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#C9A860]" />
                    เข้าสู่ระบบ
                  </button>
                  <button
                    onClick={() => setRegisterModalOpen(true)}
                    className="hidden sm:inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                  >
                    ลงทะเบียน
                  </button>
                </>
              )}

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1 text-sm font-medium text-slate-700 shadow-lg">
              {currentUser ? (
                <div className="py-2 px-3 mb-2 rounded-lg bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setShowProject(true);
                      setMobileMenuOpen(false);
                      window.location.hash = '#project';
                    }}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#1A543B]"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#C9A860]" />
                    <span>เข้าสู่แดชบอร์ด ({currentUser.full_name})</span>
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              ) : (
                <div className="py-2 px-3 mb-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setLoginModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 bg-[#1A543B] text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                  >
                    <Lock className="w-3 h-3 text-[#C9A860]" /> เข้าสู่ระบบ
                  </button>
                  <button
                    onClick={() => {
                      setRegisterModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs text-slate-600 hover:text-slate-900 px-2 py-1.5"
                  >
                    ลงทะเบียน
                  </button>
                </div>
              )}
              <a
                href="#about-section"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg hover:bg-slate-50 hover:text-[#1A543B]"
              >
                เกี่ยวกับโครงการ
              </a>
              <a
                href="#objectives-section"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg hover:bg-slate-50 hover:text-[#1A543B]"
              >
                วัตถุประสงค์ 4 ข้อ
              </a>
              <a
                href="#curriculum-section"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg hover:bg-slate-50 hover:text-[#1A543B]"
              >
                โครงสร้างหลักสูตร 60 ชม.
              </a>
              <a
                href="#timeline-section"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg hover:bg-slate-50 hover:text-[#1A543B]"
              >
                แผนงานกระบวนการดำเนินงาน 2569
              </a>
              <a
                href="#policy-section"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg hover:bg-slate-50 hover:text-[#1A543B]"
              >
                ห้องทดลองนโยบาย (Policy Lab)
              </a>
              <a
                href="#budget-section"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg hover:bg-slate-50 hover:text-[#1A543B]"
              >
                ความโปร่งใสด้านงบประมาณ
              </a>
              <a
                href="#documents-section"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg hover:bg-slate-50 hover:text-[#1A543B]"
              >
                คลังเอกสาร & คำสั่งแต่งตั้ง
              </a>
              <a
                href="#news-section"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg hover:bg-slate-50 hover:text-[#1A543B]"
              >
                ข่าวสารและกิจกรรมล่าสุด
              </a>
              <a
                href="#committee-section"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg hover:bg-slate-50 hover:text-[#1A543B]"
              >
                ทำเนียบคณะกรรมการ 26 ท่าน
              </a>
              <a
                href="#contact-section"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg hover:bg-slate-50 hover:text-[#1A543B]"
              >
                ศูนย์ประสานงานและการติดต่อ
              </a>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#091F16] via-[#0E2C1F] to-[#1A543B] text-white py-16 md:py-24">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-[#DFC27D] border border-[#C9A860]/30">
                  <Award className="w-3.5 h-3.5 text-[#C9A860]" />
                  สถาบันพระปกเกล้า (KPI)
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/20">
                  <Building2 className="w-3.5 h-3.5 text-[#C9A860]" />
                  เทศบาลตำบลบ้านดู่
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/20">
                  <GraduationCap className="w-3.5 h-3.5 text-[#88C6AB]" />
                  มหาวิทยาลัยราชภัฏเชียงราย
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-prompt leading-tight">
                โรงเรียนพลเมือง <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E8D19B] via-[#C9A860] to-white">
                  ตำบลบ้านดู่ จังหวัดเชียงราย
                </span>
              </h1>
              
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-light">
                พื้นที่การเรียนรู้เชิงนโยบาย (Citizen Policy Lab) เพื่อบ่มเพาะความเป็นพลเมืองตื่นรู้ (Active Citizen) 
                เสริมสร้างทักษะการมีส่วนร่วมในกระบวนการ Project Citizen 
                และร่วมผลักดันข้อเสนอนโยบายสาธารณะท้องถิ่นเพื่อการจัดการภัยพิบัติและสิ่งแวดล้อมอย่างยั่งยืน
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#curriculum-section"
                  className="bg-[#C9A860] hover:bg-[#B8964C] text-[#0E291D] font-bold font-semibold px-5 py-3 rounded-xl shadow-lg shadow-[#C9A860]/25 transition-all flex items-center gap-2 text-sm sm:text-base font-prompt"
                >
                  <BookOpen className="w-4 h-4" />
                  ดูโครงสร้างหลักสูตร 60 ชม.
                </a>
                <a
                  href="#timeline-section"
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-3 rounded-xl backdrop-blur-sm transition-all text-sm sm:text-base font-prompt inline-flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-[#DFC27D]" />
                  แผนการดำเนินงาน 2569
                </a>
                <a
                  href="#budget-section"
                  className="bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10 px-4 py-3 rounded-xl backdrop-blur-sm transition-all text-xs sm:text-sm font-prompt inline-flex items-center gap-1.5"
                >
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  งบประมาณโปร่งใส
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="relative rounded-3xl p-3 bg-gradient-to-tr from-[#C9A860]/30 via-[#1A543B]/25 to-transparent shadow-2xl border border-white/10 max-w-md w-full">
                <img
                  src={LANDING_HERO}
                  alt="โรงเรียนพลเมืองเชียงราย"
                  className="rounded-2xl w-full h-auto object-cover shadow-inner"
                />
                <div className="absolute -bottom-4 -left-4 bg-white text-slate-900 rounded-2xl p-4 shadow-xl border border-slate-100 flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#0E291D] text-[#C9A860] flex items-center justify-center font-bold text-xl font-prompt shadow-sm">
                    60
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">เกณฑ์หลักสูตรมาตรฐาน</div>
                    <div className="text-sm font-bold text-slate-900 font-prompt">ชั่วโมงการเรียนรู้พลเมือง</div>
                  </div>
                </div>
                <div className="absolute -top-3 -right-3 bg-[#C9A860] text-[#0E291D] rounded-xl px-3 py-1.5 text-xs font-bold font-prompt shadow-md flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> รุ่นที่ 1 / 2569
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5 Metric Highlights */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EBF5F0] text-[#1A543B] flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-bold font-prompt text-slate-900">60 ชม.</div>
                  <div className="text-xs text-slate-500 truncate">3 หมวดวิชาหลักสูตร</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-bold font-prompt text-slate-900">30+ คน</div>
                  <div className="text-xs text-slate-500 truncate">กลุ่มเป้าหมายผู้เรียน</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#8F702B] flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-bold font-prompt text-slate-900">2 ประเด็น</div>
                  <div className="text-xs text-slate-500 truncate">นโยบายสาธารณะท้องถิ่น</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EBF5F0] text-[#1A543B] flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-bold font-prompt text-slate-900">50,000 บ.</div>
                  <div className="text-xs text-slate-500 truncate">งบประมาณโปร่งใส 100%</div>
                </div>
              </div>
            </div>

            <div className="col-span-2 md:col-span-1 bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FBF6EA] text-[#8F702B] flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-[#C9A860]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-bold font-prompt text-slate-900">26 ท่าน</div>
                  <div className="text-xs text-slate-500 truncate">คณะกรรมการศูนย์ฯ เชียงราย</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: ABOUT & OBJECTIVES (Liberated from DB) */}
        <section id="about-section" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Project Rationale */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EBF5F0] text-[#1A543B] mb-2">
                  <BookOpen className="w-3.5 h-3.5 text-[#1E6144]" />
                  หลักการและเหตุผลของโครงการ
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-prompt">
                  ทำไมเชียงรายต้องมีโรงเรียนพลเมือง?
                </h2>
              </div>

              <div className="text-sm text-slate-700 leading-relaxed font-light text-justify space-y-4">
                <p>
                  การพัฒนาประชาธิปไตยในระดับท้องถิ่นจำเป็นต้องอาศัย <strong className="font-semibold text-slate-900">“พลเมืองที่มีคุณภาพ”</strong> ซึ่งมีความรู้ ความเข้าใจ และทักษะในการมีส่วนร่วมเชิงนโยบายและการกำหนดทิศทางการพัฒนาชุมชนของตนเอง
                </p>
                <p>
                  จังหวัดเชียงรายเป็นพื้นที่ที่ประสบปัญหาภัยพิบัติและปัญหาสิ่งแวดล้อมซ้ำซาก เช่น <strong className="font-semibold text-slate-900">น้ำท่วม ดินถล่ม และวิกฤตหมอกควันไฟป่า (PM2.5)</strong> ส่งผลกระทบต่อคุณภาพชีวิต ทรัพยากรธรรมชาติ และความมั่นคงของชุมชนในระดับตำบลอย่างต่อเนื่อง
                </p>
                <p>
                  สถาบันพระปกเกล้าได้พัฒนาหลักสูตรโรงเรียนพลเมือง 60 ชั่วโมง เพื่อส่งเสริมการจัดการศึกษาพลเมือง (Civic Education) ให้ประชาชนมีสมรรถนะในการวิเคราะห์ปัญหา นำเสนอทางออกเชิงนโยบายสาธารณะ (Public Policy) และขับเคลื่อนกระบวนการประชาธิปไตยแบบมีส่วนร่วมในพื้นที่ตำบลบ้านดู่ได้อย่างเป็นรูปธรรม
                </p>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-500 font-medium">หน่วยงานรับผิดชอบหลัก</div>
                  <div className="font-bold text-slate-900 mt-0.5">{projectInfo?.responsible_agency || 'ศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จ.เชียงราย'}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-500 font-medium">พื้นที่เป้าหมายการดำเนินงาน</div>
                  <div className="font-bold text-slate-900 mt-0.5">{projectInfo?.location || 'มหาวิทยาลัยราชภัฏเชียงราย / เทศบาลตำบลบ้านดู่'}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-500 font-medium">ประธานศูนย์ฯ เชียงราย</div>
                  <div className="font-bold text-[#1A543B] mt-0.5">{projectInfo?.center_chair || 'ดร.อนงค์ศรี สิทธิอาษา'}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-500 font-medium">ผู้รับผิดชอบและประสานงานโครงการ</div>
                  <div className="font-bold text-[#1A543B] mt-0.5">อาจารย์ ดร. ณัฏฐพล สันธิ</div>
                </div>
              </div>
            </div>

            {/* Right: Objectives & Graduation Criteria */}
            <div id="objectives-section" className="lg:col-span-5 space-y-6">
              {/* Objectives Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 mb-2">
                    <Compass className="w-3.5 h-3.5 text-emerald-600" />
                    Project Objectives
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 font-prompt">
                    4 วัตถุประสงค์หลักของโครงการ
                  </h3>
                </div>

                <div className="space-y-3.5 text-xs sm:text-sm">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-7 h-7 rounded-lg bg-[#D4EADB] text-[#1A543B] flex items-center justify-center font-bold flex-shrink-0 text-xs">
                      1
                    </div>
                    <div className="text-slate-700 leading-relaxed">
                      ส่งเสริมความรู้ ความเข้าใจในหลักการประชาธิปไตย สิทธิ หน้าที่ และความรับผิดชอบของพลเมือง (<strong className="font-semibold text-slate-900">Active Citizen</strong>)
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold flex-shrink-0 text-xs">
                      2
                    </div>
                    <div className="text-slate-700 leading-relaxed">
                      เสริมสร้างทักษะการสำรวจและวิเคราะห์ปัญหาชุมชน การมีส่วนร่วมในกระบวนการจัดทำนโยบายสาธารณะระดับท้องถิ่น
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-[#634D2E] flex items-center justify-center font-bold flex-shrink-0 text-xs">
                      3
                    </div>
                    <div className="text-slate-700 leading-relaxed">
                      จัดทำข้อเสนอนโยบายสาธารณะ (<strong className="font-semibold text-slate-900">Policy Proposal / Policy Lab</strong>) ด้านภัยพิบัติ-สิ่งแวดล้อมเพื่อแก้ปัญหาจริงในตำบลบ้านดู่
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-7 h-7 rounded-lg bg-[#F5EDD8] text-[#8F702B] flex items-center justify-center font-bold flex-shrink-0 text-xs">
                      4
                    </div>
                    <div className="text-slate-700 leading-relaxed">
                      สร้างเครือข่ายความร่วมมือระหว่างภาคประชาชน องค์กรปกครองส่วนท้องถิ่น และสถาบันการศึกษา
                    </div>
                  </div>
                </div>
              </div>

              {/* Graduation Criteria Callout */}
              <div className="bg-gradient-to-br from-[#FBF6EA] to-[#F5EDD8] rounded-3xl p-6 border border-[#DFCBA0] shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-[#634D2E] font-bold font-prompt text-base">
                  <Award className="w-5 h-5 text-[#A6853A]" />
                  เกณฑ์สำเร็จหลักสูตร & ได้รับวุฒิบัตร
                </div>
                <ul className="text-xs text-[#372815] space-y-2 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>มีเวลาเข้าร่วมกิจกรรมการเรียนรู้ไม่น้อยกว่า <strong>ร้อยละ 75 (45 ชั่วโมง จาก 60 ชั่วโมง)</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>มีส่วนร่วมในการลงพื้นที่สำรวจข้อมูลและจัดทำโครงงานนโยบายสาธารณะ <strong>(Project Citizen)</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>ร่วมนำเสนอผลงานในเวที <strong>Citizen Policy Lab</strong> และรับวุฒิบัตรรับรองจากสถาบันพระปกเกล้า</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: 60-HOUR CURRICULUM STRUCTURE (Liberated from DB) */}
        <section id="curriculum-section" className="bg-slate-100/80 py-16 border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-semibold text-[#1A543B] uppercase tracking-wider font-prompt bg-[#EBF5F0] px-3 py-1 rounded-full border border-[#C0E0CC]">
                Curriculum Blueprint
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-prompt">
                โครงสร้างหลักสูตรโรงเรียนพลเมือง 60 ชั่วโมง
              </h2>
              <p className="text-sm text-slate-600">
                หลักสูตรมาตรฐานสถาบันพระปกเกล้า ออกแบบเพื่อสร้างนักวิเคราะห์และขับเคลื่อนนโยบายสาธารณะท้องถิ่นอย่างเป็นระบบ
              </p>
            </div>

            {/* 3 Module Switcher Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Module 1 */}
              <div 
                onClick={() => setLandingActiveModule(1)}
                className={`cursor-pointer rounded-3xl p-6 sm:p-7 border transition-all ${
                  landingActiveModule === 1 
                    ? 'bg-white border-[#1A543B] shadow-lg ring-2 ring-[#1A543B]/20' 
                    : 'bg-white/80 hover:bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#EBF5F0] text-[#1A543B] flex items-center justify-center font-bold text-lg font-prompt">
                    01
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#D4EADB] text-[#13422E]">
                    12 ชั่วโมง
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-prompt mb-2">
                  หมวดที่ 1: วิชาแกนกลางหรือวิชาบังคับ
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-light mb-4">
                  สร้างความรู้พื้นฐานเรื่องคุณค่าประชาธิปไตย สิทธิ หน้าที่ ความรับผิดชอบ และกฎหมายด้านสิ่งแวดล้อม
                </p>
                <div className="text-xs font-semibold text-[#1A543B] flex items-center gap-1">
                  <span>ดูรายละเอียด 4 รายวิชา</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Module 2 */}
              <div 
                onClick={() => setLandingActiveModule(2)}
                className={`cursor-pointer rounded-3xl p-6 sm:p-7 border transition-all ${
                  landingActiveModule === 2 
                    ? 'bg-white border-[#C9A860] shadow-lg ring-2 ring-[#C9A860]/20' 
                    : 'bg-white/80 hover:bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#634D2E] flex items-center justify-center font-bold text-lg font-prompt">
                    02
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-[#8F702B]">
                    18 ชั่วโมง
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-prompt mb-2">
                  หมวดที่ 2: วิชาท้องถิ่น (ท้องถิ่นของเรา)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-light mb-4">
                  บทบาท อปท. การมีส่วนร่วมระดับตำบล การสำรวจจุดเสี่ยงภัยพิบัติ และการถอดบทเรียนทุนชุมชน
                </p>
                <div className="text-xs font-semibold text-[#8F702B] flex items-center gap-1">
                  <span>ดูรายละเอียด 4 รายวิชา</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Module 3 */}
              <div 
                onClick={() => setLandingActiveModule(3)}
                className={`cursor-pointer rounded-3xl p-6 sm:p-7 border transition-all ${
                  landingActiveModule === 3 
                    ? 'bg-white border-emerald-500 shadow-lg ring-2 ring-emerald-500/20' 
                    : 'bg-white/80 hover:bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-900 flex items-center justify-center font-bold text-lg font-prompt">
                    03
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    30 ชั่วโมง
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-prompt mb-2">
                  หมวดที่ 3: ผู้นำพลเมือง & Policy Lab
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-light mb-4">
                  ปฏิบัติการ Project Citizen ลงพื้นที่จริง (Policy Lab) จัดทำร่างข้อเสนอนโยบาย และเวทีนำเสนอต่อท้องถิ่น
                </p>
                <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                  <span>ดูรายละเอียด 4 รายวิชา</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Detailed Module Content Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              {landingActiveModule === 1 && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 font-prompt">
                        หมวดที่ 1: วิชาแกนกลางหรือวิชาบังคับ (12 ชั่วโมง)
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">ช่วงเวลาการจัด: 23 - 25 พฤษภาคม 2569 | วิทยากรผู้ทรงคุณวุฒิ CRRU & สถาบันพระปกเกล้า</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-[#EBF5F0] text-[#1A543B] rounded-full w-fit">
                      พื้นฐานพลเมืองตื่นรู้
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="text-xs font-bold text-[#1A543B]">วิชาที่ 1.1</div>
                      <div className="text-sm font-bold text-slate-900 font-prompt">ปฐมนิเทศ และกิจกรรมแลกเปลี่ยนเรียนรู้</div>
                      <p className="text-xs text-slate-600 font-light leading-relaxed">
                        เปิดเวทีแนะนำผู้เรียน ชี้แจงเป้าหมายหลักสูตร 60 ชั่วโมง และสร้างสัญญาประชาคมการเรียนรู้ร่วมกัน
                      </p>
                      <div className="text-[11px] text-slate-500 pt-1">วิทยากร: ประธานศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จ.เชียงราย</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="text-xs font-bold text-[#1A543B]">วิชาที่ 1.2</div>
                      <div className="text-sm font-bold text-slate-900 font-prompt">บทนำโรงเรียนพลเมืองและความเป็นพลเมือง</div>
                      <p className="text-xs text-slate-600 font-light leading-relaxed">
                        แนวคิดความเป็นพลเมืองในระบอบประชาธิปไตย วัฒนธรรมทางการเมือง และบทบาทพลเมืองในการสร้างการเปลี่ยนแปลง
                      </p>
                      <div className="text-[11px] text-slate-500 pt-1">วิทยากร: คณาจารย์คณะรัฐศาสตร์และรัฐประศาสนศาสตร์ มรภ.เชียงราย</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="text-xs font-bold text-[#1A543B]">วิชาที่ 1.3</div>
                      <div className="text-sm font-bold text-slate-900 font-prompt">สิทธิ หน้าที่ และความรับผิดชอบของพลเมือง</div>
                      <p className="text-xs text-slate-600 font-light leading-relaxed">
                        สิทธิขั้นพื้นฐานตามรัฐธรรมนูญ หน้าที่พลเมือง และการพิทักษ์ผลประโยชน์สาธารณะของชุมชน
                      </p>
                      <div className="text-[11px] text-slate-500 pt-1">วิทยากร: คณาจารย์คณะรัฐศาสตร์และรัฐประศาสนศาสตร์ มรภ.เชียงราย</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="text-xs font-bold text-[#1A543B]">วิชาที่ 1.4</div>
                      <div className="text-sm font-bold text-slate-900 font-prompt">กฎหมายและนโยบายด้านภัยพิบัติและสิ่งแวดล้อม</div>
                      <p className="text-xs text-slate-600 font-light leading-relaxed">
                        พ.ร.บ. ป้องกันและบรรเทาสาธารณภัย กฎหมายสิ่งแวดล้อม และสิทธิชุมชนในการจัดการทรัพยากร
                      </p>
                      <div className="text-[11px] text-slate-500 pt-1">วิทยากร: คณาจารย์คณะนิติศาสตร์ มรภ.เชียงราย</div>
                    </div>
                  </div>
                </div>
              )}

              {landingActiveModule === 2 && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 font-prompt">
                        หมวดที่ 2: วิชาท้องถิ่น (ท้องถิ่นของเรา) (18 ชั่วโมง)
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">ช่วงเวลาการจัด: 27 - 31 พฤษภาคม 2569 | สำรวจและวิเคราะห์บริบทตำบลบ้านดู่</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-[#634D2E] rounded-full w-fit">
                      วิเคราะห์ปัญหาชุมชนจริง
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="text-xs font-bold text-[#8F702B]">วิชาที่ 2.1</div>
                      <div className="text-sm font-bold text-slate-900 font-prompt">บทบาท อปท. กับการจัดการภัยพิบัติและสิ่งแวดล้อม</div>
                      <p className="text-xs text-slate-600 font-light leading-relaxed">
                        อำนาจหน้าที่ของเทศบาลตำบลบ้านดู่ กลไกแผนพัฒนาท้องถิ่น และการจัดสรรงบประมาณเพื่อสาธารณะ
                      </p>
                      <div className="text-[11px] text-slate-500 pt-1">วิทยากร: ผู้ทรงคุณวุฒิ อปท. และคณะรัฐศาสตร์ฯ มรภ.เชียงราย</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="text-xs font-bold text-[#8F702B]">วิชาที่ 2.2</div>
                      <div className="text-sm font-bold text-slate-900 font-prompt">การมีส่วนร่วมของประชาชนในระดับตำบล</div>
                      <p className="text-xs text-slate-600 font-light leading-relaxed">
                        เครื่องมือและกระบวนการมีส่วนร่วมของภาคประชาชน ประชาคมหมู่บ้าน และการเสนอร่างข้อบัญญัติท้องถิ่น
                      </p>
                      <div className="text-[11px] text-slate-500 pt-1">วิทยากร: คณาจารย์คณะรัฐศาสตร์และรัฐประศาสนศาสตร์ มรภ.เชียงราย</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="text-xs font-bold text-[#8F702B]">วิชาที่ 2.3</div>
                      <div className="text-sm font-bold text-slate-900 font-prompt">สำรวจปัญหา จุดเสี่ยง และทุนทางสังคมของตำบลบ้านดู่</div>
                      <p className="text-xs text-slate-600 font-light leading-relaxed">
                        จัดทำแผนที่จุดเสี่ยงภัยน้ำท่วม/หมอกควัน การสำรวจข้อมูลภาคสนาม และวิเคราะห์ทุนชุมชนบ้านดู่
                      </p>
                      <div className="text-[11px] text-slate-500 pt-1">วิทยากร: ทีมวิทยากรกระบวนการศูนย์พัฒนาการเมืองภาคพลเมือง</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="text-xs font-bold text-[#8F702B]">วิชาที่ 2.4</div>
                      <div className="text-sm font-bold text-slate-900 font-prompt">เวทีถอดบทเรียนและคัดเลือกประเด็น Project Citizen</div>
                      <p className="text-xs text-slate-600 font-light leading-relaxed">
                        ระดมความคิดเห็นเพื่อคัดเลือกประเด็นปัญหาเร่งด่วน 2 เรื่องเข้าสู่ห้องทดลองนโยบายสาธารณะ
                      </p>
                      <div className="text-[11px] text-slate-500 pt-1">วิทยากร: คณาจารย์และวิทยากรกระบวนการร่วม</div>
                    </div>
                  </div>
                </div>
              )}

              {landingActiveModule === 3 && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 font-prompt">
                        หมวดที่ 3: ผู้นำพลเมืองเพื่อสร้างการเปลี่ยนแปลง & Policy Lab (30 ชั่วโมง)
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">ช่วงเวลาการจัด: มิถุนายน 2569 | หัวใจสำคัญของกระบวนการ Project Citizen</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-900 rounded-full w-fit">
                      ลงมือปฏิบัติจริงสู่ผลลัพธ์
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="text-xs font-bold text-emerald-800">วิชาที่ 3.1</div>
                      <div className="text-sm font-bold text-slate-900 font-prompt">การพัฒนาทักษะภาวะผู้นำและการสื่อสารสาธารณะ</div>
                      <p className="text-xs text-slate-600 font-light leading-relaxed">
                        ทักษะการเจรจาต่อรอง การสื่อสารนโยบายต่อสาธารณะ และการสร้างความร่วมมือข้ามภาคส่วน
                      </p>
                      <div className="text-[11px] text-slate-500 pt-1">วิทยากร: คณาจารย์คณะรัฐศาสตร์และรัฐประศาสนศาสตร์ มรภ.เชียงราย</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="text-xs font-bold text-emerald-800">วิชาที่ 3.2</div>
                      <div className="text-sm font-bold text-slate-900 font-prompt">กระบวนการ Project Citizen: วิเคราะห์และออกแบบนโยบาย</div>
                      <p className="text-xs text-slate-600 font-light leading-relaxed">
                        การวิเคราะห์นโยบายเดิม ประเมินทางเลือกนโยบายใหม่ และยกร่างข้อเสนอเชิงนโยบายระดับตำบล
                      </p>
                      <div className="text-[11px] text-slate-500 pt-1">วิทยากร: คณาจารย์คณะรัฐศาสตร์และวิทยากรกระบวนการ</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="text-xs font-bold text-emerald-800">วิชาที่ 3.3</div>
                      <div className="text-sm font-bold text-slate-900 font-prompt">Citizen Policy Lab: ลงพื้นที่ปฏิบัติการจริงและจัดทำร่าง</div>
                      <p className="text-xs text-slate-600 font-light leading-relaxed">
                        ทดลองปฏิบัติการในชุมชนเป้าหมาย ตรวจสอบความถูกต้องของข้อมูล และปรับปรุงร่างข้อบัญญัติท้องถิ่น
                      </p>
                      <div className="text-[11px] text-slate-500 pt-1">วิทยากร: ทีมที่ปรึกษาและวิทยากรพี่เลี้ยงประจำกลุ่ม</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="text-xs font-bold text-emerald-800">วิชาที่ 3.4</div>
                      <div className="text-sm font-bold text-slate-900 font-prompt">เวทีนำเสนอข้อเสนอนโยบายต่อ อปท. และการสะท้อนผล</div>
                      <p className="text-xs text-slate-600 font-light leading-relaxed">
                        เวทีสาธารณะนำเสนอข้อเสนอต่อนายกเทศมนตรีและสภาเทศบาลตำบลบ้านดู่ พร้อมถอดบทเรียนผู้เรียน
                      </p>
                      <div className="text-[11px] text-slate-500 pt-1">วิทยากร: คณะกรรมการศูนย์ฯ เชียงราย และผู้บริหารเทศบาลตำบลบ้านดู่</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 3: PROJECT PROCESS TIMELINE & ROADMAP (Liberated from DB) */}
        <section id="timeline-section" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-semibold text-[#1A543B] uppercase tracking-wider font-prompt bg-[#EBF5F0] px-3 py-1 rounded-full border border-[#C0E0CC]">
              Project Process Roadmap 2569
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-prompt">
              แผนงานกระบวนการดำเนินโครงการ 6 เดือน
            </h2>
            <p className="text-sm text-slate-600">
              เส้นทางการเรียนรู้และการปฏิบัติงานจริงตั้งแต่การเตรียมการจนถึงการขับเคลื่อนข้อเสนอนโยบายสู่เทศบาล (มกราคม - กรกฎาคม 2569)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-xl bg-[#1A543B] text-white flex items-center justify-center font-bold text-xs font-prompt">
                    1
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#EBF5F0] text-[#13422E]">
                    ม.ค. - เม.ย. 69
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm font-prompt mb-1.5">
                  การเตรียมการ & วางแผน
                </h3>
                <p className="text-xs text-slate-600 font-light leading-relaxed">
                  ประชุมคณะกรรมการ ครั้งที่ 1, สำรวจพื้นที่ตำบลบ้านดู่ และประสานงานภาคี 3 สถาบัน
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ดำเนินการแล้ว
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-xl bg-[#1A543B] text-white flex items-center justify-center font-bold text-xs font-prompt">
                    2
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#EBF5F0] text-[#13422E]">
                    พ.ค. 69
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm font-prompt mb-1.5">
                  จัดการเรียนรู้ หมวด 1 & 2
                </h3>
                <p className="text-xs text-slate-600 font-light leading-relaxed">
                  อบรมพื้นฐานความเป็นพลเมือง (12 ชม.) และวิเคราะห์ปัญหาท้องถิ่นบ้านดู่ (18 ชม.) รวม 30 ชม.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-[#13422E] font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#1E6144]" /> แผนตามกำหนดการ
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs font-prompt">
                    3
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-[#634D2E]">
                    มิ.ย. 69
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm font-prompt mb-1.5">
                  Project Citizen & Policy Lab
                </h3>
                <p className="text-xs text-slate-600 font-light leading-relaxed">
                  ลงพื้นที่ปฏิบัติการจริง 30 ชม. และจัดทำร่างข้อเสนอนโยบายสาธารณะ 2 ประเด็น
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-[#8F702B] font-medium flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-[#A6853A]" /> หมวดวิชาหลัก
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-xl bg-[#1A543B] text-white flex items-center justify-center font-bold text-xs font-prompt">
                    4
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#EBF5F0] text-[#13422E]">
                    มิ.ย. - ก.ค. 69
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm font-prompt mb-1.5">
                  เวทีนำเสนอนโยบาย & ถอดบทเรียน
                </h3>
                <p className="text-xs text-slate-600 font-light leading-relaxed">
                  เวทีเสนอนโยบายต่อผู้บริหารเทศบาลตำบลบ้านดู่ และถอดบทเรียนพัฒนาการผู้เรียน
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-[#13422E] font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#1E6144]" /> เวทีสาธารณะ
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs font-prompt">
                    5
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900">
                    ก.ค. 69
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm font-prompt mb-1.5">
                  รายงานผล & มอบวุฒิบัตร
                </h3>
                <p className="text-xs text-slate-600 font-light leading-relaxed">
                  ประชุมคณะกรรมการ ครั้งที่ 2, ส่งรายงานสถาบันพระปกเกล้า และพิธีมอบวุฒิบัตร
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-emerald-600" /> สำเร็จหลักสูตร
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: CITIZEN POLICY LAB SHOWCASE (Liberated from DB) */}
        <section id="policy-section" className="bg-[#0A2017] text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-[#DFC27D] border border-[#C9A860]/30 mb-2">
                  <Target className="w-3.5 h-3.5 text-[#C9A860]" />
                  Citizen Policy Lab
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold font-prompt text-white">
                  2 ประเด็นข้อเสนอนโยบายสาธารณะเพื่อตำบลบ้านดู่
                </h2>
                <p className="text-slate-300 text-sm mt-1 max-w-2xl font-light">
                  ผลผลิตเชิงรูปธรรมจากห้องทดลองนโยบายของพลเมือง เพื่อยกระดับคุณภาพชีวิตและการจัดการสิ่งแวดล้อมชุมชน
                </p>
              </div>
              <div className="text-xs text-slate-400">
                ขับเคลื่อนสู่การประกาศใช้จริงโดยสภาเทศบาลตำบลบ้านดู่
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Policy 1 */}
              <div className="bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-xl space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#EBF5F0]0/10 rounded-full blur-2xl" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#DFC27D] uppercase tracking-wider font-prompt">
                    ประเด็นนโยบายที่ 1
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-[#DFC27D] border border-amber-400/30">
                    สถานะ: Policy Lab Drafting
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white font-prompt">
                  ระบบจัดการภัยพิบัติและเตือนภัยชุมชน (น้ำท่วม ดินถล่ม หมอกควัน)
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                  ข้อเสนอเชิงนโยบายระดับตำบลในการบริหารจัดการลุ่มน้ำ ระบบเฝ้าระวังเตือนภัยล่วงหน้าเชิงรุก 
                  และการจัดตั้งศูนย์ปฏิบัติการพลเมืองรับมือวิกฤตสิ่งแวดล้อม (หมอกควัน PM2.5 และอุทกภัย) ร่วมกับเทศบาลตำบลบ้านดู่
                </p>
                <div className="pt-4 border-t border-slate-700/60 grid grid-cols-2 gap-3 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[11px]">พื้นที่เป้าหมาย</span>
                    <strong className="text-white">ลุ่มน้ำและจุดเสี่ยง ต.บ้านดู่</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">กลไกผลักดัน</span>
                    <strong className="text-white">แผนบริหารจัดการภัยพิบัติท้องถิ่น</strong>
                  </div>
                </div>
              </div>

              {/* Policy 2 */}
              <div className="bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-xl space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-prompt">
                    ประเด็นนโยบายที่ 2
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    สถานะ: Policy Lab Drafting
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white font-prompt">
                  ร่างข้อบัญญัติท้องถิ่นการจัดการขยะและความมั่นคงทางอาหารชุมชน
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                  ผลักดันร่างข้อบัญญัติเทศบาลตำบลบ้านดู่ว่าด้วยการคัดแยกขยะต้นทาง การลดขยะอินทรีย์สู่ปุ๋ยชีวภาพ 
                  และการจัดตั้งพื้นที่ความมั่นคงทางอาหารชุมชนเพื่อสุขภาพและเศรษฐกิจฐานรากที่ยั่งยืน
                </p>
                <div className="pt-4 border-t border-slate-700/60 grid grid-cols-2 gap-3 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[11px]">พื้นที่เป้าหมาย</span>
                    <strong className="text-white">ชุมชนและครัวเรือน ต.บ้านดู่</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">กลไกผลักดัน</span>
                    <strong className="text-white">ร่างข้อบัญญัติเทศบาลตำบลบ้านดู่</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: BUDGET TRANSPARENCY (Liberated from DB - 50,000 THB) */}
        <section id="budget-section" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-100 pb-6 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 mb-2">
                  <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                  Civic Budget Transparency
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-prompt">
                  ความโปร่งใสด้านงบประมาณดำเนินโครงการ
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  ศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จ.เชียงราย เปิดเผยงบประมาณ 12 หมวดรายการต่อสาธารณะ
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-right flex-shrink-0">
                <div className="text-xs text-slate-500 font-medium">งบประมาณสนับสนุนทั้งหมด</div>
                <div className="text-2xl font-extrabold text-emerald-700 font-prompt">50,000 บาท</div>
                <div className="text-[11px] text-slate-400">ระเบียบสถาบันพระปกเกล้า</div>
              </div>
            </div>

            {/* 12 Budget Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {budget.map((item) => (
                <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5 flex flex-col justify-between">
                  <div className="text-xs font-medium text-slate-700 leading-snug line-clamp-2">
                    {item.name}
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-[11px] text-slate-400">จัดสรร:</span>
                      <span className="text-sm font-bold text-slate-900 font-prompt">
                        {item.allocated_amount.toLocaleString()} บ.
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div 
                        className="bg-emerald-600 h-full rounded-full" 
                        style={{ width: `${Math.min(100, Math.max(10, (item.allocated_amount / 50000) * 100 * 2))}%` }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>ทุกรายการค่าใช้จ่ายสามารถตรวจสอบเอกสารทางการและใบสำคัญคู่จ่ายได้ผ่านระบบบริหารการเงินโครงการ</span>
              </div>
              <span className="font-bold hidden sm:inline">100% Open Data</span>
            </div>
          </div>
        </section>

        {/* SECTION 6: OFFICIAL DOCUMENTS & ORDERS (Liberated from DB) */}
        <section id="documents-section" className="bg-slate-100/70 py-16 border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-semibold text-[#1A543B] uppercase tracking-wider font-prompt bg-[#EBF5F0] px-3 py-1 rounded-full border border-[#C0E0CC]">
                Official Archives
              </span>
              <h2 className="text-3xl font-bold text-slate-900 font-prompt">
                คลังเอกสารทางการและคำสั่งแต่งตั้ง
              </h2>
              <p className="text-sm text-slate-600">
                เอกสารราชการ คำสั่งแต่งตั้งคณะกรรมการ และหนังสือประสานงานโครงการ
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Authority Document 1 */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#EBF5F0] text-[#1A543B] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm font-prompt leading-snug">
                    หนังสือนำส่งรายชื่อทบทวนกรรมการศูนย์ฯ
                  </h3>
                  <p className="text-[11px] text-slate-500 font-light">
                    หนังสือเสนอแต่งตั้งคณะกรรมการศูนย์พัฒนาการเมืองภาคพลเมือง จ.เชียงราย
                  </p>
                </div>
                <a
                  href="/committee-documents/committee-authority-1.jpg"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between text-xs font-semibold text-[#1A543B] hover:text-[#1A543B] pt-2 border-t border-slate-100"
                >
                  <span>เปิดดูเอกสารฉบับจริง</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Authority Document 2 */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#EBF5F0] text-[#1A543B] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm font-prompt leading-snug">
                    บัญชีรายชื่อคณะกรรมการศูนย์ฯ เชียงราย
                  </h3>
                  <p className="text-[11px] text-slate-500 font-light">
                    บัญชีแนบท้ายคำสั่งแต่งตั้งคณะกรรมการ 26 ท่าน สถาบันพระปกเกล้า
                  </p>
                </div>
                <a
                  href="/committee-documents/committee-authority-2.jpg"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between text-xs font-semibold text-[#1A543B] hover:text-[#1A543B] pt-2 border-t border-slate-100"
                >
                  <span>เปิดดูเอกสารฉบับจริง</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Official Project Document 1 */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#EBF5F0] text-[#1A543B] flex items-center justify-center">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm font-prompt leading-snug">
                    หนังสือขอความอนุเคราะห์สถานที่ CRRU
                  </h3>
                  <div className="text-[11px] text-slate-500">เลขที่: ศพพ.ชร. 001/2569</div>
                  <p className="text-[11px] text-slate-500 font-light">
                    เรียน อธิการบดีมหาวิทยาลัยราชภัฏเชียงราย เพื่อขอใช้ห้องจัดอบรม
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold">ส่งแล้ว</span>
                  <span className="text-slate-400 text-[11px]">15 ม.ค. 2569</span>
                </div>
              </div>

              {/* Official Project Document 2 */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#EBF5F0] text-[#1A543B] flex items-center justify-center">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm font-prompt leading-snug">
                    หนังสือเชิญประชุมคณะกรรมการ ครั้งที่ 1
                  </h3>
                  <div className="text-[11px] text-slate-500">เลขที่: ศพพ.ชร. 002/2569</div>
                  <p className="text-[11px] text-slate-500 font-light">
                    เชิญประชุมวางแผนและกำหนดกรอบแนวทางโครงการโรงเรียนพลเมือง
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold">ส่งแล้ว</span>
                  <span className="text-slate-400 text-[11px]">20 ม.ค. 2569</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: NEWS & UPDATES */}
        <section id="news-section" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-slate-200 gap-4">
            <div>
              <div className="text-xs font-semibold text-[#1A543B] uppercase tracking-wider font-prompt">
                News & Announcements
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-prompt">
                ข่าวสารและกิจกรรมประชาสัมพันธ์ล่าสุด
              </h2>
            </div>
            {publishedNews.length > 3 && (
              <button
                onClick={() => {
                  setShowProject(true);
                  setActiveTab('newsFeed');
                  window.location.hash = '#project';
                }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1A543B] hover:text-[#1A543B]"
              >
                ดูข่าวทั้งหมด ({publishedNews.length}) <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {displayNews.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 max-w-xl mx-auto">
              <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800 font-prompt">ยังไม่มีข่าวสารเผยแพร่ในขณะนี้</h3>
              <p className="text-sm text-slate-500 mt-1">
                เจ้าหน้าที่สามารถเข้าสู่ระบบแดชบอร์ดเพื่อเพิ่มข่าวสารกิจกรรมโครงการได้ทันที
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayNews.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedNews(item)}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col group"
                >
                  <div className="aspect-video bg-slate-100 overflow-hidden relative">
                    {item.image_data ? (
                      <img
                        src={item.image_data}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                        <Newspaper className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-[#1A543B]/90 text-white text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-xs flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#DFC27D]" />
                      {formatBuddhistDate(item.event_date)}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base font-prompt group-hover:text-[#1A543B] line-clamp-2 transition-colors">
                        {item.title}
                      </h3>
                      {item.summary && (
                        <p className="text-sm text-slate-600 mt-2 line-clamp-3 font-light leading-relaxed">
                          {item.summary}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-[#1A543B]">
                      <span>อ่านรายละเอียด</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 8: COMMITTEE SHOWCASE (Liberated all 26 members with filters) */}
        <section id="committee-section" className="bg-slate-100/60 py-16 border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-semibold text-[#1A543B] uppercase tracking-wider font-prompt bg-[#EBF5F0] px-3 py-1 rounded-full border border-[#C0E0CC]">
                Leadership & Governance
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-prompt">
                ทำเนียบคณะกรรมการศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จ.เชียงราย
              </h2>
              <p className="text-sm text-slate-600">
                ผู้ทรงคุณวุฒิ คณาจารย์ ผู้นำท้องถิ่น และคณะกรรมการ 26 ท่าน ผู้ร่วมขับเคลื่อนโครงการโรงเรียนพลเมือง
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setLandingCommitteeFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  landingCommitteeFilter === 'all'
                    ? 'bg-[#1A543B] text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                ทั้งหมด (26 ท่าน)
              </button>
              <button
                onClick={() => setLandingCommitteeFilter('exec_advisor')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  landingCommitteeFilter === 'exec_advisor'
                    ? 'bg-[#1A543B] text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                ประธานและที่ปรึกษา
              </button>
              <button
                onClick={() => setLandingCommitteeFilter('vice')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  landingCommitteeFilter === 'vice'
                    ? 'bg-[#1A543B] text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                รองประธานกรรมการ
              </button>
              <button
                onClick={() => setLandingCommitteeFilter('members')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  landingCommitteeFilter === 'members'
                    ? 'bg-[#1A543B] text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                กรรมการและเลขานุการ
              </button>
            </div>

            {/* Committee Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredCommittee.map((member) => (
                <div key={member.id} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                    {member.photo_data ? (
                      <img src={member.photo_data} alt={member.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold font-prompt bg-[#EBF5F0]/50 text-[#1A543B]">
                        {member.full_name.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold text-[#1A543B] truncate">
                      {member.position}
                    </div>
                    <div className="text-sm font-bold text-slate-900 truncate font-prompt">
                      {member.full_name}
                    </div>
                    {member.phone && (
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {member.phone}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 9: 3 STRATEGIC PARTNERS (Pillars of Collaboration) */}
        <section id="partners-section" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-semibold text-[#1A543B] uppercase tracking-wider font-prompt bg-[#EBF5F0] px-3 py-1 rounded-full border border-[#C0E0CC]">
              Strategic Collaboration
            </span>
            <h2 className="text-3xl font-bold text-slate-900 font-prompt">
              ภาคีเครือข่ายความร่วมมือ 3 เสาหลัก
            </h2>
            <p className="text-sm text-slate-600">
              การผสานพลังทางวิชาการ ท้องถิ่น และสถาบันพัฒนาการเมืองเพื่อสร้างผลลัพธ์ที่ยั่งยืน
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF5F0] text-[#1A543B] flex items-center justify-center font-bold">
                <Award className="w-6 h-6 text-[#1A543B]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-prompt">
                สถาบันพระปกเกล้า (KPI)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-light">
                องค์กรสนับสนุนวิชาการ มาตรฐานหลักสูตรโรงเรียนพลเมือง งบประมาณดำเนินโครงการ และการมอบวุฒิบัตรรับรองแก่ผู้สำเร็จการศึกษา
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FBF6EA] text-[#8F702B] flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6 text-[#C9A860]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-prompt">
                เทศบาลตำบลบ้านดู่
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-light">
                องค์กรปกครองส่วนท้องถิ่นพื้นที่เป้าหมาย ร่วมระบุปัญหา จุดเสี่ยงภัยพิบัติ และรองรับข้อเสนอนโยบายสาธารณะสู่การปฏิบัติจริง
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-900 flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-prompt">
                มหาวิทยาลัยราชภัฏเชียงราย (CRRU)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-light">
                สถาบันการศึกษาเพื่อการพัฒนาท้องถิ่น สนับสนุนคณาจารย์จากคณะรัฐศาสตร์ฯ และคณะนิติศาสตร์ ตลอดจนอาคารสถานที่และห้องปฏิบัติการ
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 10: CONTACT & COORDINATOR HUB */}
        <section id="contact-section" className="bg-[#0A2017] text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/20">
                <MapPin className="w-3.5 h-3.5 text-[#C9A860]" />
                Civic Center Headquarters
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-prompt text-white">
                ศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จังหวัดเชียงราย
              </h2>
              <div className="space-y-3 text-xs sm:text-sm text-slate-300 font-light">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#C9A860] mt-0.5 flex-shrink-0" />
                  <span>319 หมู่ที่ 5 ตำบลท่าสาย อำเภอเมืองเชียงราย จังหวัดเชียงราย 57000</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#C9A860] flex-shrink-0" />
                  <span>โทรศัพท์ประสานงาน: <a href="tel:0986416289" className="text-white font-semibold hover:underline">098-6416289</a></span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#C9A860] flex-shrink-0" />
                  <span>อีเมลติดต่อ: <a href="mailto:natthaphon.san@crru.ac.th" className="text-white font-semibold hover:underline">natthaphon.san@crru.ac.th</a></span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-800 rounded-3xl p-6 border border-slate-700 space-y-4">
              <div className="text-xs font-bold text-[#C9A860] uppercase tracking-wider font-prompt">
                ผู้ประสานงานหลักของโครงการ
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-prompt">อาจารย์ ดร. ณัฏฐพล สันธิ</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed font-light">
                  ผู้ช่วยอธิการบดี มหาวิทยาลัยราชภัฏเชียงราย <br />
                  รองประธานและเลขานุการศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จ.เชียงราย
                </p>
              </div>
              <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">โทร: 061-265-8765</span>
                <a
                  href="mailto:natthaphon.san@crru.ac.th"
                  className="bg-[#C9A860] hover:bg-[#B8964C] text-[#0E291D] font-bold font-bold px-3 py-1.5 rounded-lg transition-colors font-prompt"
                >
                  ส่งอีเมลติดต่อ
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Civic Footer */}
        <footer className="mt-auto bg-[#071710] text-slate-300 py-12 border-t border-[#1A543B]/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center shadow-md border border-[#C9A860]/40 flex-shrink-0">
                  <img src={LOGO_COLOR} alt="ตราสัญลักษณ์ สถาบันพระปกเกล้า" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base font-prompt">
                    ศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จังหวัดเชียงราย
                  </h3>
                  <p className="text-xs text-slate-300">
                    Chiang Rai Civic Political Development Center, King Prajadhipok's Institute
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                319 ม.5 ต.ท่าสาย อ.เมืองเชียงราย จ.เชียงราย 57000 <br />
                โทรศัพท์: <a href="tel:0986416289" className="text-[#C9A860] hover:underline">098-6416289</a> | 
                อีเมล: <a href="mailto:natthaphon.san@crru.ac.th" className="text-[#C9A860] hover:underline">natthaphon.san@crru.ac.th</a>
              </p>
            </div>

            <div className="md:col-span-3 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-white font-prompt">เมนูหน้าแรก</div>
              <ul className="text-xs space-y-1.5">
                <li><a href="#about-section" className="hover:text-white transition-colors">หลักการและเหตุผล</a></li>
                <li><a href="#objectives-section" className="hover:text-white transition-colors">วัตถุประสงค์ 4 ข้อ</a></li>
                <li><a href="#curriculum-section" className="hover:text-white transition-colors">โครงสร้างหลักสูตร 60 ชม.</a></li>
                <li><a href="#timeline-section" className="hover:text-white transition-colors">แผนงานกระบวนการ 2569</a></li>
                <li><a href="#policy-section" className="hover:text-white transition-colors">Citizen Policy Lab</a></li>
                <li><a href="#budget-section" className="hover:text-white transition-colors">ความโปร่งใสงบประมาณ</a></li>
                <li><a href="#documents-section" className="hover:text-white transition-colors">คลังเอกสารทางการ</a></li>
                <li><a href="#committee-section" className="hover:text-white transition-colors">ทำเนียบคณะกรรมการ 26 ท่าน</a></li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-white font-prompt">ผู้ดูแลและพัฒนาเทคโนโลยี</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                ระบบบริหารจัดการโรงเรียนพลเมืองและศูนย์ข้อมูล <br />
                พัฒนาโดย <span className="text-white font-medium">ดร.ณัฏฐพล สันธิ</span> <br />
                (รองประธานศูนย์พัฒนาการเมืองภาคพลเมืองฯ เชียงราย)
              </p>
              <div className="pt-2 text-[11px] text-slate-500">
                สถาปัตยกรรมคลาวด์ Next.js 15 Serverless บน Vercel Edge & Cloud PostgreSQL
              </div>
            </div>
          </div>
        </footer>

        {/* News Detail Modal */}
        {selectedNews && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-[#1A543B] bg-[#EBF5F0] px-2.5 py-0.5 rounded-full inline-block">
                    วันที่จัดกิจกรรม: {formatBuddhistDate(selectedNews.event_date)}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 font-prompt">
                    {selectedNews.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedNews(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {selectedNews.image_data && (
                <div className="rounded-2xl overflow-hidden max-h-80 bg-slate-100">
                  <img src={selectedNews.image_data} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-light">
                {selectedNews.summary || 'ไม่มีรายละเอียดเพิ่มเติม'}
              </p>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedNews(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium px-4 py-2 rounded-xl"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Login Modal */}
        {loginModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
              <div className="text-center space-y-2">
                <img src={LOGO_COLOR} alt="" className="h-12 w-auto mx-auto object-contain" />
                <h3 className="text-xl font-bold text-slate-900 font-prompt">เข้าสู่ระบบจัดการโรงเรียนพลเมือง</h3>
                <p className="text-xs text-slate-500">สำหรับคณะกรรมการ ผู้ดูแลโครงการ และเจ้าหน้าที่</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">อีเมลผู้ใช้งาน</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="example@crru.ac.th"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A543B]/20 focus:border-[#1A543B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">รหัสผ่าน</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A543B]/20 focus:border-[#1A543B]"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-[#1A543B] hover:bg-[#13422E] text-white font-medium py-2.5 rounded-xl text-sm shadow-sm transition-all"
                  >
                    เข้าสู่ระบบ
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Register Modal */}
        {registerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-slate-900 font-prompt">ลงทะเบียนเข้าใช้งาน</h3>
                <p className="text-xs text-slate-500">สำหรับผู้เรียน หรือผู้มีส่วนร่วมในโครงการ</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อ - นามสกุล *</label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="นายสมชาย ใจดี"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">อีเมล *</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="somchai@gmail.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="081-234-5678"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">LINE ID</label>
                    <input
                      type="text"
                      value={regLine}
                      onChange={(e) => setRegLine(e.target.value)}
                      placeholder="somchai_line"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">รหัสผ่าน (อย่างน้อย 8 ตัวอักษร) *</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">หน่วยงาน / ชุมชน / หมายเหตุ</label>
                  <textarea
                    rows={2}
                    value={regNotes}
                    onChange={(e) => setRegNotes(e.target.value)}
                    placeholder="เช่น ผู้แทนกลุ่มอาชีพ ต.บ้านดู่"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-[#1A543B] hover:bg-[#13422E] text-white font-medium py-2.5 rounded-xl text-sm shadow-sm transition-all"
                  >
                    ส่งคำขอลงทะเบียน
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegisterModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // Internal Dashboard View (Logged in or viewing project portal)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800">
      {/* Top Header */}
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs h-16 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
          </button>
          <img src={LOGO_COLOR} alt="" className="h-9 w-auto object-contain" />
          <div className="border-l border-slate-200 pl-3 hidden sm:block">
            <span className="text-xs font-semibold text-[#1A543B] block font-prompt">
              ระบบบริหารจัดการโรงเรียนพลเมือง
            </span>
            <span className="text-[11px] text-slate-500 block">
              ศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จ.เชียงราย
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowProject(false);
              window.location.hash = '';
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl"
          >
            <Home className="w-3.5 h-3.5" /> หน้าแรก
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-900">{currentUser.full_name}</div>
                <div className="text-[10px] text-[#1A543B] font-semibold uppercase">{currentUser.role}</div>
              </div>
              <button
                onClick={handleLogout}
                title="ออกจากระบบ"
                className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setLoginModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-[#1A543B] text-white text-xs px-3.5 py-1.5 rounded-xl font-medium shadow-xs"
            >
              <Lock className="w-3.5 h-3.5 text-[#C9A860]" /> เข้าสู่ระบบ
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Sidebar */}
        <aside
          className={`no-print bg-white border-r border-slate-200 transition-all duration-300 flex flex-col ${
            isSidebarOpen ? 'w-64' : 'w-16'
          }`}
        >
          <div className="p-3 space-y-1 overflow-y-auto flex-1">
            {[
              { id: 'dashboard', label: 'แดชบอร์ดโครงการ', icon: LayoutDashboard },
              { id: 'attendance', label: 'เช็คชื่อผู้เรียน (60 ชม.)', icon: UserCheck },
              { id: 'activity', label: 'บันทึกกิจกรรม & แผนที่', icon: Camera },
              { id: 'reports', label: 'รายงานผล & สรุปผลลัพธ์', icon: BarChart3 },
              { id: 'policy', label: 'นโยบายสาธารณะ 2 ร่าง', icon: Award },
              { id: 'committee', label: 'ทำเนียบคณะกรรมการ (26)', icon: Users },
              { id: 'newsFeed', label: 'ข่าวสารโครงการทั้งหมด', icon: Newspaper },
              { id: 'news', label: 'จัดการข่าวสาร & อัปโหลด', icon: Pencil },
              { id: 'users', label: 'จัดการผู้ใช้งานระบบ', icon: UserCog },
              { id: 'finance', label: 'หนังสือขออนุมัติงบ (Memo)', icon: Wallet },
              { id: 'documents', label: 'คลังเอกสาร & สลิปการเงิน', icon: FileText },
              { id: 'about', label: 'เกี่ยวกับโครงการ', icon: Info },
              { id: 'contact', label: 'ข้อมูลติดต่อศูนย์ฯ', icon: Phone },
            ].map((tabItem) => {
              const TabIcon = tabItem.icon;
              const isAllowed = canAccess(tabItem.id as Tab);
              if (!isAllowed) return null;

              const isSelected = activeTab === tabItem.id;
              return (
                <button
                  key={tabItem.id}
                  onClick={() => setActiveTab(tabItem.id as Tab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-[#1A543B] text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  title={tabItem.label}
                >
                  <TabIcon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-[#C9A860]' : 'text-slate-500'}`} />
                  {isSidebarOpen && <span className="truncate">{tabItem.label}</span>}
                </button>
              );
            })}
          </div>

          {isSidebarOpen && (
            <div className="p-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
              โรงเรียนพลเมือง จ.เชียงราย v2.0
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Dashboard Overview */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                  <h2 className="text-xl font-bold text-slate-900 font-prompt">
                    {projectInfo?.name || 'โรงเรียนพลเมือง เทศบาลตำบลบ้านดู่ อำเภอเมือง จังหวัดเชียงราย'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    หน่วยงานรับผิดชอบ: {projectInfo?.responsible_agency || 'ศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จังหวัดเชียงราย'}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-xs text-slate-500">ระยะเวลาดำเนินโครงการ</div>
                      <div className="text-base font-bold text-slate-900 mt-1">{projectInfo?.duration || 'มกราคม - กรกฎาคม 2569'}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-xs text-slate-500">ผู้รับผิดชอบโครงการ</div>
                      <div className="text-base font-bold text-slate-900 mt-1">อาจารย์ ดร. ณัฏฐพล สันธิ</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-xs text-slate-500">งบประมาณรวม</div>
                      <div className="text-base font-bold text-emerald-700 mt-1">50,000 บาท (ถ้วน)</div>
                    </div>
                  </div>
                </div>

                {/* Budget Categories breakdown */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                  <h3 className="text-lg font-bold text-slate-900 font-prompt mb-4 flex items-center justify-between">
                    <span>งบประมาณดำเนินโครงการ 12 หมวด</span>
                    <span className="text-xs font-normal text-slate-500">รวม 50,000 บาท</span>
                  </h3>
                  <div className="divide-y divide-slate-100">
                    {budget.map((b) => (
                      <div key={b.id} className="py-2.5 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-800">{b.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-slate-500">ใช้ไป {b.spent_amount.toLocaleString()} บ.</span>
                          <span className="font-bold text-slate-900 w-24 text-right">
                            {b.allocated_amount.toLocaleString()} บาท
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Attendance Tab */}
            {activeTab === 'attendance' && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-prompt">เช็คชื่อผู้เรียน (เกณฑ์ 60 ชั่วโมง)</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    เกณฑ์สำเร็จหลักสูตร: ต้องมีเวลาเรียนไม่น้อยกว่า 75% (45 ชั่วโมง จาก 60 ชั่วโมง)
                  </p>
                </div>

                {canAccess('attendance') && currentUser && ['super_admin', 'project_admin', 'staff_operator'].includes(currentUser.role) && (
                  <form onSubmit={handleAttendance} className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">เลือกผู้เรียน</label>
                      <select
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                      >
                        <option value="">-- เลือกผู้เรียน --</option>
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>{s.name} (ปัจจุบัน: {s.total_hours} ชม.)</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">จำนวนชั่วโมงที่เข้าร่วม</label>
                      <input
                        type="number"
                        step="0.5"
                        value={attendanceHours}
                        onChange={(e) => setAttendanceHours(e.target.value)}
                        placeholder="เช่น 3 หรือ 6"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <button type="submit" className="w-full bg-[#1A543B] hover:bg-[#13422E] text-white py-2 rounded-lg text-xs font-medium">
                        บันทึกเวลาเรียน
                      </button>
                    </div>
                  </form>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">ลำดับ</th>
                        <th className="py-3 px-4">ชื่อ - นามสกุล</th>
                        <th className="py-3 px-4">ชั่วโมงสะสม</th>
                        <th className="py-3 px-4">ความคืบหน้า (45 ชม.)</th>
                        <th className="py-3 px-4">สถานะเกณฑ์</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((student, idx) => {
                        const progress = Math.min(100, Math.round((student.total_hours / 45) * 100));
                        const isPassed = student.total_hours >= 45;
                        return (
                          <tr key={student.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 text-slate-500">{idx + 1}</td>
                            <td className="py-3 px-4 font-semibold text-slate-900">{student.name}</td>
                            <td className="py-3 px-4">{student.total_hours} / 60 ชม.</td>
                            <td className="py-3 px-4">
                              <div className="w-32 bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${isPassed ? 'bg-emerald-500' : 'bg-[#1A543B]'}`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {isPassed ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                  <CheckCircle2 className="w-3 h-3" /> ผ่านเกณฑ์ 75%
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-[#8F702B]">
                                  ขาดอีก {Math.max(0, 45 - student.total_hours)} ชม.
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* News Management Tab */}
            {activeTab === 'news' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                  <h2 className="text-xl font-bold text-slate-900 font-prompt">เพิ่มข่าวสารและกิจกรรมใหม่</h2>
                  <p className="text-xs text-slate-500">
                    รูปภาพจะถูกบีบอัดความละเอียดอัตโนมัติก่อนอัปโหลดเพื่อความรวดเร็วและประหยัดพื้นที่คลาวด์
                  </p>

                  <form onSubmit={handleCreateNews} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">หัวข้อข่าว *</label>
                      <input
                        type="text"
                        required
                        value={newsTitle}
                        onChange={(e) => setNewsTitle(e.target.value)}
                        placeholder="เช่น ประชุมชี้แจงโครงการโรงเรียนพลเมือง ต.บ้านดู่ ครั้งที่ 1"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">รายละเอียดข่าว</label>
                      <textarea
                        rows={4}
                        value={newsSummary}
                        onChange={(e) => setNewsSummary(e.target.value)}
                        placeholder="พิมพ์เนื้อหาข่าว หรือกิจกรรมที่ดำเนินการ..."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">วันที่จัดกิจกรรม</label>
                        <input
                          type="date"
                          value={newsDate}
                          onChange={(e) => setNewsDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">สถานะ</label>
                        <select
                          value={newsStatus}
                          onChange={(e) => setNewsStatus(e.target.value as 'draft' | 'published')}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                        >
                          <option value="published">เผยแพร่ทันที</option>
                          <option value="draft">บันทึกแบบร่าง</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <input
                          type="checkbox"
                          id="landingCheck"
                          checked={newsShowOnLanding}
                          onChange={(e) => setNewsShowOnLanding(e.target.checked)}
                          className="w-4 h-4 rounded text-[#1E6144]"
                        />
                        <label htmlFor="landingCheck" className="text-xs font-medium text-slate-700">
                          แสดงบนหน้าแรก (Landing Page)
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">อัปโหลดรูปภาพข่าว</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => setNewsImages(Array.from(e.target.files || []))}
                        className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#EBF5F0] file:text-[#1A543B] hover:file:bg-[#D4EADB]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-[#1A543B] hover:bg-[#13422E] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs"
                    >
                      บันทึกและเผยแพร่ข่าว
                    </button>
                  </form>
                </div>

                {/* List of existing news */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 font-prompt">รายการข่าวสารทั้งหมด ({news.length})</h3>
                  <div className="divide-y divide-slate-100">
                    {news.map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              item.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {item.status === 'published' ? 'เผยแพร่' : 'แบบร่าง'}
                            </span>
                            {item.show_on_landing === 1 && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-[#8F702B]">
                                แสดงหน้าแรก
                              </span>
                            )}
                            <span className="text-[11px] text-slate-400">{formatBuddhistDate(item.event_date)}</span>
                          </div>
                          <div className="font-bold text-slate-900 text-xs mt-1 truncate">{item.title}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteNews(item.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
                            title="ลบข่าว"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* News Feed Tab (Read Only for all users) */}
            {activeTab === 'newsFeed' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                  <h2 className="text-xl font-bold text-slate-900 font-prompt mb-4">ข่าวสารและกิจกรรมโครงการ</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {publishedNews.map((item) => (
                      <div key={item.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                        {item.image_data && (
                          <div className="aspect-video rounded-lg overflow-hidden bg-slate-200">
                            <img src={item.image_data} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="text-xs font-semibold text-[#1A543B]">{formatBuddhistDate(item.event_date)}</div>
                        <h3 className="font-bold text-slate-900 text-sm font-prompt">{item.title}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed font-light">{item.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab (Super Admin Only) */}
            {activeTab === 'users' && currentUser?.role === 'super_admin' && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-prompt">จัดการผู้ใช้งานและสิทธิ์ระบบ</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    กำหนดบทบาท (Roles) ทั้ง 6 ระดับ และเปิด/ปิดการเข้าถึงของผู้ใช้งาน
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">ชื่อ - นามสกุล</th>
                        <th className="py-3 px-4">อีเมล</th>
                        <th className="py-3 px-4">บทบาท (Role)</th>
                        <th className="py-3 px-4">สถานะ</th>
                        <th className="py-3 px-4">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-semibold text-slate-900">{u.full_name}</td>
                          <td className="py-3 px-4 text-slate-600">{u.email}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EBF5F0] text-[#13422E]">
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {u.status === 'active' ? 'อนุมัติแล้ว' : 'ระงับ/รออนุมัติ'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {u.id !== currentUser.id && (
                              <button
                                onClick={async () => {
                                  const newStatus = u.status === 'active' ? 'inactive' : 'active';
                                  await axios.patch(`${API_BASE}/users/${u.id}`, { status: newStatus });
                                  loadAllData();
                                }}
                                className="text-[#1A543B] hover:underline text-[11px] font-medium"
                              >
                                {u.status === 'active' ? 'ระงับใช้งาน' : 'อนุมัติเข้าใช้งาน'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Committee Tab */}
            {activeTab === 'committee' && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-prompt">
                    ทำเนียบคณะกรรมการศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จ.เชียงราย
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    รายชื่อคณะกรรมการ 26 ท่าน พร้อมข้อมูลการติดต่อและเอกสารแต่งตั้ง
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {committee.map((m) => (
                    <div key={m.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden flex-shrink-0">
                        {m.photo_data ? (
                          <img src={m.photo_data} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">
                            {m.full_name.slice(0, 1)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-[#1A543B] truncate">{m.position}</div>
                        <div className="text-sm font-bold text-slate-900 font-prompt truncate">{m.full_name}</div>
                        {m.phone && <div className="text-xs text-slate-500">{m.phone}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Policy Tab */}
            {activeTab === 'policy' && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-prompt">ร่างข้อเสนอนโยบายสาธารณะ 2 ประเด็น</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    ผลลัพธ์เชิงนโยบายระดับตำบลบ้านดู่ ขับเคลื่อนผ่านกระบวนการ Project Citizen
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {policies.map((p) => (
                    <div key={p.id} className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1A543B]">ฉบับที่ {p.id}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-[#8F702B]">
                          สถานะ: {p.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 font-prompt">{p.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed font-light">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Finance Memo Tab */}
            {activeTab === 'finance' && (
              <div className="space-y-6">
                <div className="no-print bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 font-prompt">
                        หนังสือขออนุมัติยืมเงินโครงการ (Advance Memo)
                      </h2>
                      <p className="text-xs text-slate-500">
                        กรอกข้อมูลโครงการและลงลายมือชื่อดิจิทัลเพื่อพิมพ์เอกสารราชการตามระเบียบ
                      </p>
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="bg-[#1A543B] hover:bg-[#13422E] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      <Printer className="w-4 h-4" /> พิมพ์บันทึกข้อความ (PDF)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">เลขที่หนังสือ</label>
                      <input
                        type="text"
                        value={memoBookNumber}
                        onChange={(e) => setMemoBookNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">วันที่ในหนังสือ</label>
                      <input
                        type="date"
                        value={memoDate}
                        onChange={(e) => setMemoDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">จำนวนเงินที่ขอยืม (บาท)</label>
                      <input
                        type="number"
                        value={memoAmount}
                        onChange={(e) => setMemoAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>

                  {/* Digital Signature Pad */}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ลงลายมือชื่อผู้ยืมเงิน (เซ็นด้วยเมาส์หรือนิ้วสัมผัส)
                    </label>
                    <div className="border border-slate-300 rounded-xl overflow-hidden bg-slate-50 w-full max-w-sm">
                      <canvas
                        ref={signatureCanvasRef}
                        width={380}
                        height={120}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="bg-white w-full cursor-crosshair"
                      />
                      <div className="p-2 bg-slate-100 flex justify-end">
                        <button
                          type="button"
                          onClick={clearSignature}
                          className="text-[11px] text-slate-600 hover:text-rose-600 font-medium"
                        >
                          ล้างลายเซ็น
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Printable Official Memo Sheet */}
                <div className="memo-sheet bg-white p-8 sm:p-12 rounded-2xl border border-slate-300 shadow-lg text-slate-900 font-sarabun max-w-3xl mx-auto space-y-6 text-sm leading-relaxed">
                  <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                    <img src={LOGO_COLOR} alt="" className="h-16 w-auto object-contain" />
                    <div className="text-right">
                      <h3 className="text-2xl font-bold font-prompt text-slate-900">บันทึกข้อความ</h3>
                      <p className="text-xs text-slate-600 mt-0.5">ส่วนราชการ: ศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จ.เชียงราย</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div><strong>ที่:</strong> {memoBookNumber}</div>
                    <div className="text-right"><strong>วันที่:</strong> {formatBuddhistDate(memoDate)}</div>
                    <div className="col-span-2"><strong>เรื่อง:</strong> ขออนุมัติยืมเงินทดรองจ่ายเพื่อดำเนินงาน{memoProjectName}</div>
                    <div className="col-span-2"><strong>เรียน:</strong> ประธานศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จังหวัดเชียงราย</div>
                  </div>

                  <div className="space-y-3 text-xs leading-relaxed text-justify">
                    <p className="indent-8">
                      ตามที่ ศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จังหวัดเชียงราย ได้รับอนุมัติให้ดำเนินงาน{' '}
                      <strong>{memoProjectName}</strong> ประจำปีงบประมาณ พ.ศ. {memoFiscalYear} ในวงเงินงบประมาณทั้งสิ้น{' '}
                      <strong>{Number(memoAmount).toLocaleString()} บาท (ห้าหมื่นบาทถ้วน)</strong> นั้น
                    </p>
                    <p className="indent-8">
                      เพื่อให้การดำเนินโครงการดังกล่าวเป็นไปด้วยความเรียบร้อยและมีประสิทธิภาพ ข้าพเจ้า {memoSigner} ในฐานะผู้รับผิดชอบโครงการ 
                      จึงมีความประสงค์ขอยืมเงินทดรองจ่ายจำนวน <strong>{Number(memoAmount).toLocaleString()} บาท</strong> เพื่อนำไปใช้เป็นค่าใช้จ่ายในการจัดการเรียนการสอน 
                      ค่าอาหาร ค่าตอบแทนวิทยากร และค่าวัสดุอุปกรณ์ตามแผนงานโครงการต่อไป
                    </p>
                    <p className="indent-8">
                      จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติ
                    </p>
                  </div>

                  <div className="pt-8 flex justify-end">
                    <div className="text-center w-64 space-y-2">
                      <div className="h-16 flex items-center justify-center">
                        {signatureData ? (
                          <img src={signatureData} alt="ลายเซ็น" className="max-h-16 object-contain mx-auto" />
                        ) : (
                          <div className="text-slate-300 text-xs italic">(ลงชื่อ)</div>
                        )}
                      </div>
                      <div className="text-xs font-semibold">({memoSigner})</div>
                      <div className="text-[11px] text-slate-500">ผู้รับผิดชอบโครงการโรงเรียนพลเมือง</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-prompt">คลังเอกสารโครงการและหลักฐานราชการ</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    หนังสือนำส่ง แบบฟอร์มการอบรม รายชื่อผู้เรียน และเอกสารแต่งตั้งกรรมการ
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {COMMITTEE_AUTHORITY_DOCUMENTS.map((doc, i) => (
                    <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[#1A543B]" />
                        <span className="text-xs font-bold text-slate-800">{doc.title}</span>
                      </div>
                      <a
                        href={doc.src}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#1A543B] hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        เปิดดู <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 font-prompt">หลักการและเหตุผลของโครงการ</h2>
                <div className="text-sm text-slate-700 leading-relaxed space-y-4 whitespace-pre-line font-light text-justify">
                  {projectInfo?.rationale}
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 font-prompt mb-2">วัตถุประสงค์</h3>
                  <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {projectInfo?.objective}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 max-w-2xl mx-auto">
                <div className="text-center space-y-2">
                  <img src={LOGO_COLOR} alt="" className="h-14 w-auto mx-auto object-contain" />
                  <h2 className="text-2xl font-bold text-slate-900 font-prompt">ข้อมูลการติดต่อศูนย์พัฒนาการเมืองภาคพลเมือง</h2>
                  <p className="text-xs text-slate-500">สถาบันพระปกเกล้า จังหวัดเชียงราย</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#1A543B] mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>ที่ทำการศูนย์ฯ:</strong> 319 หมู่ที่ 5 ตำบลท่าสาย อำเภอเมืองเชียงราย จังหวัดเชียงราย 57000
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#1A543B] flex-shrink-0" />
                    <div>
                      <strong>เบอร์โทรศัพท์ติดต่อศูนย์:</strong>{' '}
                      <a href="tel:0986416289" className="text-[#1A543B] font-bold hover:underline">
                        098-6416289
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[#1A543B] flex-shrink-0" />
                    <div>
                      <strong>อีเมลประสานงาน:</strong>{' '}
                      <a href="mailto:natthaphon.san@crru.ac.th" className="text-[#1A543B] font-bold hover:underline">
                        natthaphon.san@crru.ac.th
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-[#1A543B] mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>ผู้ประสานงานหลัก:</strong> อาจารย์ ดร. ณัฏฐพล สันธิ <br />
                      (ผู้ช่วยอธิการบดี มหาวิทยาลัยราชภัฏเชียงราย / รองประธานและเลขานุการศูนย์ฯ เชียงราย)
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
