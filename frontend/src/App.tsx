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
  LogOut
} from 'lucide-react';
import './App.css';

const normalizeApiOrigin = (value: string | undefined) => {
  const fallback = 'http://localhost:5001';
  if (!value) return fallback;

  const match = value.match(/https?:\/\/[^\s]+/);
  return (match?.[0] || fallback).replace(/\/+$/, '');
};

const API_ORIGIN = normalizeApiOrigin(import.meta.env.VITE_API_ORIGIN);
const API_BASE = `${API_ORIGIN}/api`;
const LOGO_COLOR = '/brand-assets/LOGO-KPI-CR.png';
const LOGO_MOURNING = '/brand-assets/LOGO-KPI-CR-WB.png';
const LANDING_HERO = '/brand-assets/landing-page.png';
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

type Tab = 'dashboard' | 'attendance' | 'activity' | 'policy' | 'reports' | 'about' | 'documents' | 'committee' | 'contact' | 'news' | 'users' | 'finance';
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

interface RoleDefinition {
  label: string;
  description: string;
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
  super_admin: ['dashboard', 'attendance', 'activity', 'reports', 'policy', 'committee', 'news', 'users', 'finance', 'documents', 'about', 'contact'],
  project_admin: ['dashboard', 'attendance', 'activity', 'reports', 'policy', 'committee', 'news', 'finance', 'documents', 'about', 'contact'],
  committee_member: ['dashboard', 'reports', 'committee', 'news', 'documents', 'about', 'contact'],
  staff_operator: ['dashboard', 'attendance', 'activity', 'reports', 'finance', 'documents', 'about', 'contact'],
  participant_learner: ['dashboard', 'news', 'documents', 'about', 'contact'],
  public_viewer: ['dashboard', 'news', 'about', 'contact'],
};

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showProject, setShowProject] = useState(() => window.location.hash === '#project');
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [budget, setBudget] = useState<BudgetCategory[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [documents, setDocuments] = useState<OfficialDocument[]>([]);
  const [detailedActivities, setDetailedActivities] = useState<Activity[]>([]);
  const [processTimeline, setProcessTimeline] = useState<ProcessTimelineItem[]>([]);
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMember[]>([]);
  const [newsUpdates, setNewsUpdates] = useState<NewsUpdate[]>([]);
  const [roleDefinitions, setRoleDefinitions] = useState<Record<UserRole, RoleDefinition> | null>(null);
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = window.localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentToken, setCurrentToken] = useState(() => window.localStorage.getItem('authToken') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleHashChange = () => setShowProject(window.location.hash === '#project');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const allowedTabs = roleAccess[currentUser.role] || [];
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0] || 'dashboard');
    }
  }, [activeTab, currentUser]);

  useEffect(() => {
    if (currentToken) {
      axios.defaults.headers.common.Authorization = `Bearer ${currentToken}`;
    } else {
      delete axios.defaults.headers.common.Authorization;
    }
  }, [currentToken]);

  // Form states
  const [selectedStudent, setSelectedStudent] = useState('');
  const [hours, setHours] = useState('');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDesc, setActivityDesc] = useState('');
  const [activityBudget, setActivityBudget] = useState('');
  const [parentActivityId, setParentActivityId] = useState('');
  const [logActivityId, setLogActivityId] = useState('');
  const [logDesc, setLogDesc] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  // Document form states
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<NonNullable<OfficialDocument['document_type']>>('official');
  const [docNumber, setDocNumber] = useState('');
  const [docDate, setDocDate] = useState('');
  const [docToAgency, setDocToAgency] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);

  // News form states
  const [newsTitle, setNewsTitle] = useState('');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsDate, setNewsDate] = useState(new Date().toISOString().split('T')[0]);
  const [newsStatus, setNewsStatus] = useState<NewsUpdate['status']>('published');
  const [newsShowOnLanding, setNewsShowOnLanding] = useState(true);
  const [newsImages, setNewsImages] = useState<File[]>([]);
  const [newsImagePreviews, setNewsImagePreviews] = useState<Array<{key: string; url: string}>>([]);
  const [editingNewsId, setEditingNewsId] = useState<number | null>(null);
  const [editingNewsTitle, setEditingNewsTitle] = useState('');
  const [editingNewsSummary, setEditingNewsSummary] = useState('');
  const [editingNewsDate, setEditingNewsDate] = useState('');
  const [editingNewsStatus, setEditingNewsStatus] = useState<NewsUpdate['status']>('published');
  const [editingNewsShowOnLanding, setEditingNewsShowOnLanding] = useState(false);
  const [editingNewsImages, setEditingNewsImages] = useState<File[]>([]);
  const [editingNewsImagePreviews, setEditingNewsImagePreviews] = useState<Array<{key: string; url: string}>>([]);

  // User & role form states
  const [userFullName, setUserFullName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userLine, setUserLine] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('committee_member');
  const [userPassword, setUserPassword] = useState('ChangeMe123!');
  const [userNotes, setUserNotes] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Committee profile form states
  const [editingCommitteeId, setEditingCommitteeId] = useState<number | null>(null);
  const [committeePhone, setCommitteePhone] = useState('');
  const [committeeEmail, setCommitteeEmail] = useState('');
  const [committeeLine, setCommitteeLine] = useState('');
  const [committeeBio, setCommitteeBio] = useState('');
  const [committeePhoto, setCommitteePhoto] = useState<File | null>(null);

  // Expense form states
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseCategoryId, setExpenseCategoryId] = useState('');
  const [expenseActivityId, setExpenseActivityId] = useState('');

  // Finance memo form states
  const [memoNumber, setMemoNumber] = useState('ศพม.ชร. ....../................');
  const [memoDate, setMemoDate] = useState('');
  const [memoSubject, setMemoSubject] = useState('ขออนุมัติยืมเงินรองจ่ายเพื่อดำเนินโครงการโรงเรียนพลเมือง เทศบาลตำบลบ้านดู่');
  const [memoTo, setMemoTo] = useState('ประธานศูนย์พัฒนาการเมืองภาคพลเมือง จังหวัดเชียงราย');
  const [memoRequester, setMemoRequester] = useState('ดร. ณัฏฐพล สันธิ');
  const [memoRequesterRole, setMemoRequesterRole] = useState('ผู้รับผิดชอบโครงการ');
  const [memoAmount, setMemoAmount] = useState('50000');
  const [memoTeachingBudget, setMemoTeachingBudget] = useState('47100');
  const [memoFieldBudget, setMemoFieldBudget] = useState('2900');
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const previews = newsImages.map((image, index) => ({
      key: `${image.name}-${image.lastModified}-${index}`,
      url: URL.createObjectURL(image),
    }));
    setNewsImagePreviews(previews);

    return () => previews.forEach(preview => URL.revokeObjectURL(preview.url));
  }, [newsImages]);

  useEffect(() => {
    const previews = editingNewsImages.map((image, index) => ({
      key: `${image.name}-${image.lastModified}-${index}`,
      url: URL.createObjectURL(image),
    }));
    setEditingNewsImagePreviews(previews);

    return () => previews.forEach(preview => URL.revokeObjectURL(preview.url));
  }, [editingNewsImages]);

  const loadAllData = async () => {
    try {
      const [dashRes, activitiesRes, timelineRes, committeeRes, newsRes, rolesRes] = await Promise.all([
        axios.get(`${API_BASE}/dashboard`),
        axios.get(`${API_BASE}/activities/detailed`),
        axios.get(`${API_BASE}/process_timeline`),
        axios.get(`${API_BASE}/committee`),
        axios.get(`${API_BASE}/news`),
        axios.get(`${API_BASE}/roles`)
      ]);
      const usersRes = currentUser?.role === 'super_admin'
        ? await axios.get(`${API_BASE}/users`)
        : { data: [] };
      setProjectInfo(dashRes.data.info);
      setBudget(dashRes.data.budget);
      setStudents(dashRes.data.students);
      setPolicies(dashRes.data.policies);
      setDocuments(dashRes.data.documents || []);
      setDetailedActivities(activitiesRes.data);
      setProcessTimeline(timelineRes.data);
      setCommitteeMembers(committeeRes.data);
      setNewsUpdates(newsRes.data);
      setRoleDefinitions(rolesRes.data);
      setAppUsers(usersRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !hours) return;
    try {
      await axios.post(`${API_BASE}/attendance`, {
        student_id: selectedStudent,
        hours: parseFloat(hours),
        date: new Date().toISOString().split('T')[0]
      });
      alert('บันทึกเวลาเรียนเรียบร้อยแล้ว!');
      setHours('');
      loadAllData();
    } catch {
      alert('เกิดข้อผิดพลาดในการบันทึกเวลาเรียน');
    }
  };

  const captureLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/activities`, {
        title: activityTitle,
        description: activityDesc,
        parent_id: parentActivityId ? parseInt(parentActivityId) : null,
        allocated_budget: parseFloat(activityBudget || '0')
      });
      alert('สร้างหัวข้อกิจกรรมเรียบร้อยแล้ว!');
      setActivityTitle('');
      setActivityDesc('');
      setActivityBudget('');
      setParentActivityId('');
      loadAllData();
    } catch {
      alert('เกิดข้อผิดพลาดในการสร้างกิจกรรม');
    }
  };

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('activity_id', logActivityId);
    formData.append('description', logDesc);
    if (photo) formData.append('photo', photo);
    if (location) {
      formData.append('latitude', location.lat.toString());
      formData.append('longitude', location.lng.toString());
    }

    try {
      await axios.post(`${API_BASE}/activity_logs`, formData);
      alert('บันทึกหลักฐานกิจกรรมเรียบร้อยแล้ว!');
      setLogActivityId('');
      setLogDesc('');
      setPhoto(null);
      setLocation(null);
      loadAllData();
    } catch {
      alert('เกิดข้อผิดพลาดในการบันทึกหลักฐาน');
    }
  };

  const handleDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', docTitle);
    formData.append('document_type', docType);
    formData.append('doc_number', docNumber);
    formData.append('date', docDate);
    formData.append('to_agency', docToAgency);
    if (docFile) formData.append('file', docFile);

    try {
      await axios.post(`${API_BASE}/documents`, formData);
      alert('บันทึกข้อมูลหนังสือเรียบร้อยแล้ว!');
      setDocTitle('');
      setDocType('official');
      setDocNumber('');
      setDocDate('');
      setDocToAgency('');
      setDocFile(null);
      loadAllData();
    } catch {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/login`, {
        email: loginEmail,
        password: loginPassword,
      });
      setCurrentUser(res.data.user);
      setCurrentToken(res.data.token);
      window.localStorage.setItem('currentUser', JSON.stringify(res.data.user));
      window.localStorage.setItem('authToken', res.data.token);
      axios.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
      if (res.data.user.role === 'super_admin') {
        const usersRes = await axios.get(`${API_BASE}/users`);
        setAppUsers(usersRes.data);
      } else {
        setAppUsers([]);
      }
      setLoginPassword('');
    } catch {
      alert('เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมล/รหัสผ่าน หรือสถานะบัญชี');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentToken('');
    window.localStorage.removeItem('currentUser');
    window.localStorage.removeItem('authToken');
    setShowProject(false);
    history.pushState('', document.title, window.location.pathname + window.location.search);
  };

  const handleDeleteDocument = async (id: number) => {
    if (!window.confirm('ต้องการลบรายการหนังสือนี้หรือไม่?')) return;

    try {
      await axios.delete(`${API_BASE}/documents/${id}`);
      loadAllData();
    } catch {
      alert('เกิดข้อผิดพลาดในการลบข้อมูลหนังสือ');
    }
  };

  const handleNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle) return;

    const formData = new FormData();
    formData.append('title', newsTitle);
    formData.append('summary', newsSummary);
    formData.append('event_date', newsDate);
    formData.append('status', newsStatus);
    formData.append('show_on_landing', newsShowOnLanding ? 'true' : 'false');
    newsImages.forEach(image => formData.append('images', image));

    try {
      await axios.post(`${API_BASE}/news`, formData);
      alert('บันทึกข่าวสารเรียบร้อยแล้ว!');
      setNewsTitle('');
      setNewsSummary('');
      setNewsDate(new Date().toISOString().split('T')[0]);
      setNewsStatus('published');
      setNewsShowOnLanding(true);
      setNewsImages([]);
      loadAllData();
    } catch {
      alert('เกิดข้อผิดพลาดในการบันทึกข่าวสาร');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFullName || !userEmail) return;

    try {
      await axios.post(`${API_BASE}/users`, {
        full_name: userFullName,
        email: userEmail,
        phone: userPhone,
        line_contact: userLine,
        role: userRole,
        status: 'active',
        password: userPassword,
        notes: userNotes,
      });
      alert('เพิ่มผู้ใช้เรียบร้อยแล้ว!');
      setUserFullName('');
      setUserEmail('');
      setUserPhone('');
      setUserLine('');
      setUserRole('committee_member');
      setUserPassword('ChangeMe123!');
      setUserNotes('');
      loadAllData();
    } catch {
      alert('เกิดข้อผิดพลาดในการเพิ่มผู้ใช้ อีเมลอาจซ้ำกับผู้ใช้เดิม');
    }
  };

  const updateUser = async (id: number, updates: Partial<Pick<AppUser, 'role' | 'status'>>) => {
    if (!currentToken) {
      alert('Session หมดอายุ กรุณาออกจากระบบแล้ว login ใหม่');
      handleLogout();
      return;
    }

    try {
      const res = await axios.patch(`${API_BASE}/users/${id}`, updates);
      setAppUsers(users => users.map(user => user.id === id ? res.data.user : user));
    } catch (err) {
      if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
        alert('Session หรือสิทธิ์ผู้ดูแลระบบไม่ถูกต้อง กรุณา logout แล้ว login ด้วยบัญชี Super Admin อีกครั้ง');
        handleLogout();
        return;
      }

      const message = axios.isAxiosError(err) ? err.response?.data?.error : '';
      alert(message || 'เกิดข้อผิดพลาดในการอัปเดตผู้ใช้');
    }
  };

  const addNewsImages = (files: FileList | File[]) => {
    const nextFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    setNewsImages(current => [...current, ...nextFiles].slice(0, 8));
  };

  const addEditingNewsImages = (files: FileList | File[]) => {
    const nextFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    setEditingNewsImages(current => [...current, ...nextFiles].slice(0, 8));
  };

  const getSignaturePoint = (event: SignaturePointerEvent) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const point = 'touches' in event ? event.touches[0] : event;
    if (!point) return null;

    return {
      x: ((point.clientX - rect.left) / rect.width) * canvas.width,
      y: ((point.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startSignature = (event: SignaturePointerEvent) => {
    event.preventDefault();
    const canvas = signatureCanvasRef.current;
    const point = getSignaturePoint(event);
    if (!canvas || !point) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.beginPath();
    context.moveTo(point.x, point.y);
    context.lineWidth = 2.2;
    context.lineCap = 'round';
    context.strokeStyle = '#111827';
    setIsSigning(true);
  };

  const drawSignature = (event: SignaturePointerEvent) => {
    if (!isSigning) return;
    event.preventDefault();
    const canvas = signatureCanvasRef.current;
    const point = getSignaturePoint(event);
    if (!canvas || !point) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.lineTo(point.x, point.y);
    context.stroke();
    setSignatureDataUrl(canvas.toDataURL('image/png'));
  };

  const finishSignature = () => {
    setIsSigning(false);
    const canvas = signatureCanvasRef.current;
    if (canvas) setSignatureDataUrl(canvas.toDataURL('image/png'));
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    const context = canvas?.getContext('2d');
    if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl('');
  };

  const handleSignatureUpload = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => setSignatureDataUrl(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const printFinanceMemo = () => {
    window.print();
  };

  const getNewsImages = (item: NewsUpdate) => {
    if (item.image_data_list) {
      try {
        const parsed = JSON.parse(item.image_data_list);
        if (Array.isArray(parsed)) return parsed.filter((image): image is string => typeof image === 'string');
      } catch {
        return item.image_data ? [item.image_data] : [];
      }
    }

    return item.image_data ? [item.image_data] : [];
  };

  const updateNews = async (id: number, updates: Partial<Pick<NewsUpdate, 'status' | 'show_on_landing'>>) => {
    try {
      await axios.patch(`${API_BASE}/news/${id}`, updates);
      setNewsUpdates(items => items.map(item => item.id === id ? { ...item, ...updates } : item));
    } catch {
      alert('เกิดข้อผิดพลาดในการอัปเดตข่าวสาร');
    }
  };

  const startEditNews = (item: NewsUpdate) => {
    setEditingNewsId(item.id);
    setEditingNewsTitle(item.title);
    setEditingNewsSummary(item.summary || '');
    setEditingNewsDate(item.event_date || new Date().toISOString().split('T')[0]);
    setEditingNewsStatus(item.status);
    setEditingNewsShowOnLanding(Number(item.show_on_landing) === 1);
    setEditingNewsImages([]);
  };

  const cancelEditNews = () => {
    setEditingNewsId(null);
    setEditingNewsTitle('');
    setEditingNewsSummary('');
    setEditingNewsDate('');
    setEditingNewsStatus('published');
    setEditingNewsShowOnLanding(false);
    setEditingNewsImages([]);
  };

  const handleEditNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNewsId || !editingNewsTitle) return;

    const formData = new FormData();
    formData.append('title', editingNewsTitle);
    formData.append('summary', editingNewsSummary);
    formData.append('event_date', editingNewsDate);
    formData.append('status', editingNewsStatus);
    formData.append('show_on_landing', editingNewsShowOnLanding ? '1' : '0');
    editingNewsImages.forEach(image => formData.append('images', image));

    try {
      await axios.patch(`${API_BASE}/news/${editingNewsId}`, formData);
      loadAllData();
      cancelEditNews();
    } catch {
      alert('เกิดข้อผิดพลาดในการแก้ไขข่าวสาร');
    }
  };

  const handleDeleteNews = async (id: number) => {
    if (!window.confirm('ต้องการลบข่าวนี้หรือไม่?')) return;

    try {
      await axios.delete(`${API_BASE}/news/${id}`);
      setNewsUpdates(items => items.filter(item => item.id !== id));
    } catch {
      alert('เกิดข้อผิดพลาดในการลบข่าวสาร');
    }
  };

  const startEditCommittee = (member: CommitteeMember) => {
    setEditingCommitteeId(member.id);
    setCommitteePhone(member.phone || '');
    setCommitteeEmail(member.email || '');
    setCommitteeLine(member.line_contact || '');
    setCommitteeBio(member.bio || '');
    setCommitteePhoto(null);
  };

  const cancelEditCommittee = () => {
    setEditingCommitteeId(null);
    setCommitteePhone('');
    setCommitteeEmail('');
    setCommitteeLine('');
    setCommitteeBio('');
    setCommitteePhoto(null);
  };

  const handleCommitteeProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCommitteeId) return;

    const formData = new FormData();
    formData.append('phone', committeePhone);
    formData.append('email', committeeEmail);
    formData.append('line_contact', committeeLine);
    formData.append('bio', committeeBio);
    if (committeePhoto) formData.append('photo', committeePhoto);

    try {
      await axios.patch(`${API_BASE}/committee/${editingCommitteeId}`, formData);
      alert('อัปเดตข้อมูลกรรมการเรียบร้อยแล้ว!');
      cancelEditCommittee();
      loadAllData();
    } catch {
      alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูลกรรมการ');
    }
  };

  const handleTimelineChange = async (id: number, field: 'start_month' | 'end_month', value: number) => {
    const current = processTimeline.find(item => item.id === id);
    if (!current) return;

    const next = {
      ...current,
      [field]: value,
    };

    if (next.start_month > next.end_month) {
      if (field === 'start_month') next.end_month = value;
      else next.start_month = value;
    }

    setProcessTimeline(items => items.map(item => item.id === id ? next : item));

    try {
      await axios.patch(`${API_BASE}/process_timeline/${id}`, {
        start_month: next.start_month,
        end_month: next.end_month,
      });
    } catch {
      alert('เกิดข้อผิดพลาดในการอัปเดตช่วงเวลากิจกรรม');
      loadAllData();
    }
  };

  const handleExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/expenses`, {
        category_id: parseInt(expenseCategoryId),
        activity_id: expenseActivityId ? parseInt(expenseActivityId) : null,
        amount: parseFloat(expenseAmount),
        description: expenseDesc,
        date: new Date().toISOString().split('T')[0]
      });
      alert('บันทึกค่าใช้จ่ายเรียบร้อยแล้ว!');
      setExpenseAmount('');
      setExpenseDesc('');
      setExpenseCategoryId('');
      setExpenseActivityId('');
      loadAllData();
    } catch {
      alert('เกิดข้อผิดพลาดในการบันทึกค่าใช้จ่าย');
    }
  };

  const updatePolicy = async (id: number, status: Policy['status']) => {
    try {
      await axios.patch(`${API_BASE}/policy/${id}`, { status });
      setPolicies(policies.map(p => p.id === id ? { ...p, status } : p));
      alert('อัปเดตสถานะนโยบายเรียบร้อยแล้ว!');
    } catch {
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  const flattenActivities = (activities: Activity[]): Activity[] => {
    let flat: Activity[] = [];
    activities.forEach(a => {
      flat.push(a);
      if (a.sub_activities && a.sub_activities.length > 0) {
        flat = flat.concat(flattenActivities(a.sub_activities));
      }
    });
    return flat;
  };

  const remainingHours = students.reduce((acc, s) => acc + Math.max(0, 45 - s.total_hours), 0);
  const expectedActivities = students.length > 0 ? Math.ceil(remainingHours / (students.length * 4)) : 0;
  const getDocumentTypeLabel = (type?: OfficialDocument['document_type']) => {
    switch (type) {
      case 'training_form':
        return 'แบบฟอร์มอบรม';
      case 'student_list':
        return 'รายชื่อผู้เรียน';
      case 'training_material':
        return 'เอกสารประกอบการอบรม';
      case 'financial_slip':
        return 'หลักฐานการเงิน / Transfer Slip';
      case 'report':
        return 'รายงาน/หลักฐานโครงการ';
      default:
        return 'หนังสือราชการ';
    }
  };
  const documentsByType = {
    official: documents.filter(doc => !doc.document_type || doc.document_type === 'official'),
    training_form: documents.filter(doc => doc.document_type === 'training_form'),
    student_list: documents.filter(doc => doc.document_type === 'student_list'),
    training_material: documents.filter(doc => doc.document_type === 'training_material'),
    financial_slip: documents.filter(doc => doc.document_type === 'financial_slip'),
    report: documents.filter(doc => doc.document_type === 'report'),
  };
  const committeeGroups = committeeMembers.reduce<Record<string, CommitteeMember[]>>((groups, member) => {
    if (!groups[member.group_name]) groups[member.group_name] = [];
    groups[member.group_name].push(member);
    return groups;
  }, {});
  const landingNews = newsUpdates
    .filter(item => item.status === 'published' && Number(item.show_on_landing) === 1)
    .slice(0, 6);
  const roleKeys = roleDefinitions ? Object.keys(roleDefinitions) as UserRole[] : [];
  const allowedTabs = currentUser ? roleAccess[currentUser.role] || [] : [];
  const canAccess = (tab: Tab) => currentUser?.role === 'super_admin' || allowedTabs.includes(tab);
  const memoAmountNumber = Number(memoAmount || 0);
  const memoTeachingBudgetNumber = Number(memoTeachingBudget || 0);
  const memoFieldBudgetNumber = Number(memoFieldBudget || 0);
  const memoPreview = `ส่วนราชการ: ศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จังหวัดเชียงราย
ที่: ${memoNumber}    วันที่: ${memoDate || '...........................................'}
เรื่อง: ${memoSubject}
เรียน: ${memoTo}

๑. ความเป็นมา
ตามที่สถาบันพระปกเกล้าได้อนุมัติโครงการ "${projectInfo?.name || 'โรงเรียนพลเมือง เทศบาลตำบลบ้านดู่ ตำบลบ้านดู่ อำเภอเมือง จังหวัดเชียงราย'}" ประจำปีงบประมาณ 2569 ซึ่งมีกำหนดการจัดการเรียนการสอนรวม 60 ชั่วโมง ในช่วงระหว่างวันที่ 23 พฤษภาคม ถึงวันที่ 7 มิถุนายน 2569 ณ มหาวิทยาลัยราชภัฏเชียงราย นั้น

๒. เหตุผลความจำเป็น
เพื่อให้การดำเนินกิจกรรมสร้างพลเมืองคุณภาพและการจัดทำข้อเสนอเชิงนโยบาย (Citizen Policy Lab) เป็นไปด้วยความคล่องตัว เนื่องจากมีค่าใช้จ่ายที่จำเป็นต้องจ่ายขาดเป็นเงินสดในพื้นที่ เช่น ค่าอาหารและอาหารว่างสำหรับผู้เข้าร่วมกิจกรรมไม่น้อยกว่า 30 คน ค่าวัสดุอุปกรณ์สำหรับกิจกรรมกลุ่ม รวมถึงค่าน้ำมันและค่าเดินทางในการประสานงานลงพื้นที่ ซึ่งไม่สามารถดำเนินการเบิกจ่ายผ่านระบบปกติได้ทันท่วงที

๓. ข้อพิจารณา/การขออนุมัติ
ในการนี้ ข้าพเจ้า ${memoRequester} ในฐานะ${memoRequesterRole} จึงขออนุมัติยืมเงินสำรองจ่ายล่วงหน้าจากงบประมาณโครงการ เป็นจำนวนเงินทั้งสิ้น ${memoAmountNumber.toLocaleString()} บาท (${memoAmountNumber === 50000 ? 'ห้าหมื่นบาทถ้วน' : '...........................................'}) โดยมีรายละเอียดประมาณการค่าใช้จ่ายตามแผนงบประมาณดังนี้:

ด้านจัดการเรียนการสอน: จำนวน ${memoTeachingBudgetNumber.toLocaleString()} บาท เช่น ค่าตอบแทนวิทยากร ค่าอาหารกลางวัน-อาหารว่าง ค่าวัสดุและสถานที่
ด้านการลงพื้นที่และประสานงาน: จำนวน ${memoFieldBudgetNumber.toLocaleString()} บาท เช่น ค่าอาหารในเวที Policy Lab และค่าน้ำมันประสานงาน
รวมเป็นเงินทั้งสิ้น ${(memoTeachingBudgetNumber + memoFieldBudgetNumber).toLocaleString()} บาท

ทั้งนี้ เมื่อการดำเนินโครงการเสร็จสิ้นลง ข้าพเจ้าจะดำเนินการรวบรวมหลักฐานการจ่ายเงินที่ถูกต้องตามระเบียบ เพื่อนำส่งล้างหนี้เงินยืมให้เสร็จสิ้นตามระยะเวลาที่สถาบันฯ กำหนดต่อไป

จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติ`;

  const renderActivityNode = (activity: Activity, depth = 0) => (
    <div key={activity.id} style={{ marginLeft: `${depth * 15}px`, borderLeft: depth > 0 ? '2px solid #e2e8f0' : 'none', paddingLeft: '10px', marginBottom: '1.5rem', background: depth === 0 ? 'white' : 'transparent', padding: depth === 0 ? '1rem' : '0 0 0 10px', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: depth === 0 ? '1.1rem' : '1rem', color: depth === 0 ? '#1e3a8a' : '#1e293b' }}>{activity.title}</div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>{activity.description}</div>
          
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ color: '#2563eb' }}><strong>งบ:</strong> ฿{activity.allocated_budget.toLocaleString()}</div>
            <div style={{ color: '#ef4444' }}><strong>จ่าย:</strong> ฿{activity.total_expense.toLocaleString()}</div>
            <div style={{ color: activity.allocated_budget - activity.total_expense < 0 ? '#ef4444' : '#22c55e' }}>
              <strong>เหลือ:</strong> ฿{(activity.allocated_budget - activity.total_expense).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {activity.expenses.length > 0 && (
        <div style={{ marginTop: '5px', fontSize: '0.75rem', background: '#fff1f2', padding: '8px', borderRadius: '6px', marginBottom: '8px' }}>
          <div style={{ fontWeight: 700, marginBottom: '4px', color: '#991b1b' }}>ค่าใช้จ่าย:</div>
          {activity.expenses.map((e, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #fecaca', padding: '2px 0' }}>
              <span>• {e.description} ({e.category_name})</span>
              <span>฿{e.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {activity.logs.length > 0 && (
        <div style={{ marginTop: '5px', background: '#f0f9ff', padding: '8px', borderRadius: '6px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.75rem', marginBottom: '6px', color: '#075985' }}>หลักฐาน:</div>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {activity.logs.map(log => (
              <div key={log.id} style={{ minWidth: '100px', maxWidth: '100px' }}>
                {log.photo_url && (
                  <img 
                    src={`${API_ORIGIN}${log.photo_url}`}
                    alt="Evidence" 
                    style={{ width: '100px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #bae6fd' }} 
                  />
                )}
                <div style={{ fontSize: '0.65rem', color: '#0369a1', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {log.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activity.sub_activities.map(sub => renderActivityNode(sub, depth + 1))}
    </div>
  );

  const openProject = () => {
    window.location.hash = 'project';
    setShowProject(true);
  };

  const openProjectTab = (tab: Tab) => {
    setActiveTab(tab);
    window.location.hash = 'project';
    setShowProject(true);
  };

  const openLandingPage = () => {
    history.pushState('', document.title, window.location.pathname + window.location.search);
    setShowProject(false);
  };

  if (!showProject) {
    return (
      <div className="landing-page">
        <img className="landing-hero" src={LANDING_HERO} alt="ศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จังหวัดเชียงราย" />
        {landingNews.length > 0 && (
          <section className="landing-news-section">
            <div className="landing-news-inner">
              <h2><Newspaper size={22} /> ข่าวสารล่าสุด</h2>
              <div className="landing-news-grid">
                {landingNews.map(item => (
                  <article className="landing-news-card" key={item.id}>
                    {getNewsImages(item)[0] && <img src={getNewsImages(item)[0]} alt={item.title} />}
                    <div className="landing-news-content">
                      <time>{item.event_date}</time>
                      <h3>{item.title}</h3>
                      <p>{item.summary}</p>
                    </div>
                  </article>
                ))}
              </div>
              <div className="landing-news-more">
                <button type="button" className="secondary" onClick={() => openProjectTab('news')}>
                  อ่านข่าวเพิ่มเติม
                </button>
              </div>
            </div>
          </section>
        )}
        <div className="landing-actions">
          <button type="button" className="landing-project-button" onClick={openProject}>
            เข้าสู่ระบบจัดการโครงการ
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="login-page">
        <form className="login-card" onSubmit={handleLogin}>
          <img className="login-logo" src={LOGO_MOURNING} alt="สถาบันพระปกเกล้า จังหวัดเชียงราย" />
          <h1>เข้าสู่ระบบจัดการโครงการ</h1>
          <p>กรุณาใช้อีเมลและรหัสผ่านที่ผู้ดูแลระบบกำหนดให้</p>
          <div className="form-group">
            <label>อีเมล</label>
            <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="name@example.com" />
          </div>
          <div className="form-group">
            <label>รหัสผ่าน</label>
            <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="รหัสผ่าน" />
          </div>
          <button type="submit"><Lock size={18} /> เข้าสู่ระบบ</button>
          <button type="button" className="secondary" onClick={openLandingPage}>กลับหน้าแรก</button>
        </form>
      </div>
    );
  }

  if (loading) return <div className="loading" style={{ textAlign: 'center', marginTop: '50px' }}>กำลังโหลดข้อมูลระบบ...</div>;

  const platformLogo = new Date().getMonth() >= 5 ? LOGO_COLOR : LOGO_MOURNING;

  return (
    <div className="app-container">
      <header>
        <div className="brand-header">
          <img className="brand-logo" src={platformLogo} alt="สถาบันพระปกเกล้า จังหวัดเชียงราย" />
          <h1>
            <span>ระบบบริหารจัดการ ศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จังหวัดเชียงราย</span>
            <span className="platform-subtitle">โครงการโรงเรียนพลเมือง ทต.บ้านดู่ ต.บ้านดู่ อ.เมือง จ.เชียงราย ประจำปี 2569</span>
          </h1>
        </div>
        <div className="session-pill">
          <span>{currentUser.full_name}</span>
          <button type="button" className="secondary" onClick={handleLogout} aria-label="ออกจากระบบ">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main>
        {activeTab === 'dashboard' && (
          <>
            <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: 'none' }}>
              <h2 className="section-title"><TrendingUp size={20} color="#2563eb" /> วิเคราะห์โครงการ</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="budget-item" style={{ background: 'rgba(255,255,255,0.6)' }}>
                  <div className="budget-label">ชั่วโมงที่เหลือ</div>
                  <div className="budget-value" style={{ color: '#2563eb' }}>
                    {remainingHours} ชม.
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>ถึงเกณฑ์จบ (45 ชม.)</div>
                </div>
                <div className="budget-item" style={{ background: 'rgba(255,255,255,0.6)' }}>
                  <div className="budget-label">กิจกรรมที่คาด</div>
                  <div className="budget-value" style={{ color: '#0f172a' }}>
                    {expectedActivities} ครั้ง
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>@ 4 ชม./ครั้ง</div>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="section-title"><BarChart3 size={20} color="#f59e0b" /> กระบวนการดำเนินกิจกรรม</h2>
              <div className="timeline-wrap">
                <div className="timeline-grid timeline-header">
                  <div className="timeline-activity-head">กิจกรรม</div>
                  {processMonths.map(month => (
                    <div key={month} className="timeline-month">{month}</div>
                  ))}
                </div>
                {processTimeline.map(item => (
                  <div key={item.id} className="timeline-grid timeline-row">
                    <div className="timeline-activity">
                      <span className="timeline-order">{item.activity_order}</span>
                      <div>
                        <div>{item.title}</div>
                        <div className="timeline-controls">
                          <select
                            value={item.start_month}
                            onChange={e => handleTimelineChange(item.id, 'start_month', Number(e.target.value))}
                            aria-label={`เดือนเริ่มต้น ${item.title}`}
                          >
                            {processMonths.map((month, index) => <option key={month} value={index}>{month}</option>)}
                          </select>
                          <span>ถึง</span>
                          <select
                            value={item.end_month}
                            onChange={e => handleTimelineChange(item.id, 'end_month', Number(e.target.value))}
                            aria-label={`เดือนสิ้นสุด ${item.title}`}
                          >
                            {processMonths.map((month, index) => <option key={month} value={index}>{month}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                    {processMonths.map((month, index) => {
                      const active = index >= item.start_month && index <= item.end_month;
                      return (
                        <div key={`${item.id}-${month}`} className={`timeline-cell ${active ? 'active' : ''}`}>
                          {active && <span className="timeline-dot" />}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2 className="section-title"><Wallet size={20} color="#2563eb" /> งบประมาณรายหมวด (50,000 บาท)</h2>
              <div className="budget-grid">
                {budget.map(cat => (
                  <div key={cat.id} className="budget-item">
                    <div className="budget-label" style={{ height: '3em', display: 'flex', alignItems: 'center' }}>
                      {cat.name}
                    </div>
                    <div className="budget-value" style={{ fontSize: '1rem' }}>{cat.spent_amount.toLocaleString()} / {cat.allocated_amount.toLocaleString()}</div>
                    <div className="progress-bar">
                      <div 
                        className={`progress-fill ${cat.spent_amount > cat.allocated_amount ? 'danger' : ''}`}
                        style={{ width: `${Math.min((cat.spent_amount / cat.allocated_amount) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2 className="section-title"><UserCheck size={20} color="#22c55e" /> ความคืบหน้าผู้เรียน</h2>
              {students.map(student => {
                const percent = (student.total_hours / 60) * 100;
                const isGraduated = student.total_hours >= 45;
                return (
                  <div key={student.id} className="student-row">
                    <div className="student-info">
                      <div className="student-name">{student.name}</div>
                      <div className="student-hours">{student.total_hours} / 60 ชม.</div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                    <div className={`grad-status ${isGraduated ? 'ok' : 'pending'}`}>
                      {isGraduated ? <CheckCircle2 size={24} /> : `อีก ${45 - student.total_hours} ชม.`}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === 'about' && projectInfo && (
          <>
            <div className="card" style={{ borderTop: '5px solid #2563eb' }}>
              <h2 className="section-title"><Info size={20} color="#2563eb" /> ข้อมูลโครงการ (Overview)</h2>
              <div style={{ fontSize: '0.9rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem', color: '#1e3a8a' }}>{projectInfo.name}</div>
                <div style={{ marginBottom: '0.25rem', whiteSpace: 'pre-line' }}><strong>วัตถุประสงค์:</strong> {'\n' + projectInfo.objective}</div>
                <div style={{ marginBottom: '0.25rem', whiteSpace: 'pre-line' }}><strong>หลักสูตร:</strong> {'\n' + projectInfo.curriculum}</div>
                <div style={{ marginBottom: '0.25rem' }}><strong>หน่วยงานที่รับผิดชอบ:</strong> {projectInfo.responsible_agency}</div>
                <div style={{ marginBottom: '0.25rem' }}><strong>ประธานศูนย์ฯ เชียงราย:</strong> {projectInfo.center_chair || 'ดร.อนงค์ศรี สิทธิอาษา'}</div>
                <div style={{ marginBottom: '0.25rem', whiteSpace: 'pre-line' }}><strong>ผู้รับผิดชอบโครงการ:</strong> {'\n' + projectInfo.manager}</div>
                <div style={{ marginBottom: '0.25rem' }}><strong>พื้นที่:</strong> {projectInfo.location}</div>
                <div style={{ marginBottom: '0.25rem', whiteSpace: 'pre-line' }}><strong>กลุ่มเป้าหมาย:</strong> {'\n' + projectInfo.target_group}</div>
                <div style={{ marginBottom: '0.25rem' }}><strong>เครือข่ายความร่วมมือ:</strong> {projectInfo.networking}</div>
                <div style={{ marginBottom: '0.25rem' }}><strong>ระยะเวลา:</strong> {projectInfo.duration}</div>
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #64748b', background: '#f8fafc' }}>
              <h2 className="section-title"><BookOpen size={20} color="#64748b" /> หลักการและเหตุผล (Rationale)</h2>
              <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6', textAlign: 'justify' }}>
                {projectInfo.rationale}
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #22c55e', background: '#f0fdf4' }}>
              <h2 className="section-title"><BarChart3 size={20} color="#22c55e" /> ผลที่คาดว่าจะได้รับ (Expected Outcome)</h2>
              <div style={{ fontSize: '0.85rem', color: '#166534', whiteSpace: 'pre-line' }}>
                {projectInfo.expected_outcome}
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #f59e0b', background: '#fffbeb' }}>
              <h2 className="section-title"><Award size={20} color="#f59e0b" /> เกณฑ์การจบหลักสูตร (Graduation Criteria)</h2>
              <div style={{ fontSize: '0.85rem', color: '#92400e', whiteSpace: 'pre-line' }}>
                {projectInfo.graduation_criteria}
              </div>
            </div>
          </>
        )}

        {activeTab === 'attendance' && (
          <div className="card">
            <h2 className="section-title"><Clock size={20} /> บันทึกเวลาเรียน</h2>
            <form onSubmit={handleAttendance}>
              <div className="form-group">
                <label>เลือกชื่อผู้เรียน</label>
                <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
                  <option value="">เลือกชื่อ...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>จำนวนชั่วโมง</label>
                <input type="number" step="0.5" value={hours} onChange={e => setHours(e.target.value)} placeholder="เช่น 4.5" />
              </div>
              <button type="submit">บันทึกเวลาเรียน</button>
            </form>
          </div>
        )}

        {activeTab === 'activity' && (
          <>
            <div className="card" style={{ borderLeft: '4px solid #2563eb' }}>
              <h2 className="section-title"><Camera size={20} color="#2563eb" /> 1. สร้างหัวข้อกิจกรรม/งาน</h2>
              <form onSubmit={handleCreateActivity}>
                <div className="form-group">
                  <label>หัวข้อกิจกรรม</label>
                  <input type="text" value={activityTitle} onChange={e => setActivityTitle(e.target.value)} placeholder="เช่น ประชุมคณะกรรมการครั้งที่ 1" />
                </div>
                <div className="form-group">
                  <label>งบประมาณที่ตั้งไว้ (บาท)</label>
                  <input type="number" value={activityBudget} onChange={e => setActivityBudget(e.target.value)} placeholder="เช่น 5000" />
                </div>
                <div className="form-group">
                  <label>กิจกรรมหลัก (ถ้าเป็นกิจกรรมย่อย)</label>
                  <select value={parentActivityId} onChange={e => setParentActivityId(e.target.value)}>
                    <option value="">นี่คือกิจกรรมหลัก</option>
                    {flattenActivities(detailedActivities).map(a => (
                      <option key={a.id} value={a.id}>{a.title}</option>
                    ))}
                  </select>
                </div>
                <button type="submit">สร้างหัวข้อกิจกรรม</button>
              </form>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #22c55e' }}>
              <h2 className="section-title"><Camera size={20} color="#22c55e" /> 2. บันทึกหลักฐาน (รูปภาพ/พิกัด)</h2>
              <form onSubmit={handleLogActivity}>
                <div className="form-group">
                  <label>กิจกรรมที่ดำเนินการ</label>
                  <select value={logActivityId} onChange={e => setLogActivityId(e.target.value)}>
                    <option value="">เลือกกิจกรรม...</option>
                    {flattenActivities(detailedActivities).map(a => (
                      <option key={a.id} value={a.id}>{a.title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>รายละเอียดสิ่งที่ทำ</label>
                  <textarea value={logDesc} onChange={e => setLogDesc(e.target.value)} placeholder="วันนี้ดำเนินการอะไรไปบ้าง?" rows={2}></textarea>
                </div>
                <div className="form-group">
                  <label>รูปภาพหลักฐาน</label>
                  <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} />
                </div>
                <div className="form-group">
                  <button type="button" className="secondary" onClick={captureLocation}>
                    <MapPin size={16} style={{ marginRight: '8px' }} />
                    {location ? `บันทึกพิกัดแล้ว (${location.lat.toFixed(4)})` : 'ระบุพิกัด GPS'}
                  </button>
                </div>
                <button type="submit" style={{ backgroundColor: '#22c55e' }}>ส่งหลักฐาน</button>
              </form>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
              <h2 className="section-title"><Wallet size={20} color="#ef4444" /> 3. บันทึกค่าใช้จ่าย</h2>
              <form onSubmit={handleExpense}>
                <div className="form-group">
                  <label>จำนวนเงิน (บาท)</label>
                  <input type="number" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} placeholder="เช่น 1500" />
                </div>
                <div className="form-group">
                  <label>รายละเอียด</label>
                  <input type="text" value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)} placeholder="ระบุตามใบเสร็จ" />
                </div>
                <div className="form-group">
                  <label>หมวดงบประมาณ</label>
                  <select value={expenseCategoryId} onChange={e => setExpenseCategoryId(e.target.value)}>
                    <option value="">เลือกหมวด...</option>
                    {budget.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>กิจกรรมที่เกี่ยวข้อง</label>
                  <select value={expenseActivityId} onChange={e => setExpenseActivityId(e.target.value)}>
                    <option value="">ค่าใช้จ่ายทั่วไป</option>
                    {flattenActivities(detailedActivities).map(a => (
                      <option key={a.id} value={a.id}>{a.title}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" style={{ backgroundColor: '#ef4444' }}>บันทึกค่าใช้จ่าย</button>
              </form>
            </div>
          </>
        )}

        {activeTab === 'reports' && (
          <div className="card">
            <h2 className="section-title"><FileText size={20} color="#2563eb" /> รายงานสรุป</h2>
            <div style={{ marginTop: '1rem' }}>
              {detailedActivities.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>ยังไม่มีข้อมูลกิจกรรม</div>
              ) : (
                detailedActivities.map(activity => renderActivityNode(activity))
              )}
            </div>
          </div>
        )}

        {activeTab === 'policy' && (
          <div className="card">
            <h2 className="section-title"><FileText size={20} /> สถานะนโยบาย Project Citizen</h2>
            <div style={{ marginTop: '1rem' }}>
              {policies.map(p => (
                <div key={p.id} className="card" style={{ margin: '0 0 1rem 0', padding: '1rem', borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{p.title}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>{p.description}</div>
                  <div className="form-group">
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {(['Drafting', 'Completed', 'Proposed'] as const).map(s => (
                        <button 
                          key={s} 
                          className={p.status === s ? '' : 'secondary'} 
                          style={{ flex: 1, minWidth: '80px', fontSize: '0.8rem', padding: '0.5rem' }}
                          onClick={() => updatePolicy(p.id, s)}
                        >
                          {s === 'Drafting' ? 'กำลังร่าง' : s === 'Completed' ? 'ร่างเสร็จแล้ว' : 'นำเสนอแล้ว'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'committee' && (
          <>
            <div className="card">
              <h2 className="section-title"><Users size={20} color="#2563eb" /> Profile คณะกรรมการศูนย์ฯ</h2>
              <div className="committee-summary">
                ใช้สำหรับจัดเก็บรูปประจำตัว เบอร์โทร อีเมล และ Line contact ของที่ปรึกษาและคณะกรรมการศูนย์พัฒนาการเมืองภาคพลเมืองฯ จังหวัดเชียงราย
              </div>
            </div>

            {Object.entries(committeeGroups).map(([groupName, members]) => (
              <div className="card" key={groupName}>
                <h2 className="section-title"><Users size={20} color="#64748b" /> {groupName}</h2>
                <div className="committee-grid">
                  {members.map(member => {
                    const isEditing = editingCommitteeId === member.id;
                    const memberPhoto = member.photo_data || (member.photo_url ? `${API_ORIGIN}${member.photo_url}` : null);
                    return (
                      <div className="committee-card" key={member.id}>
                        <div className="committee-card-header">
                          <div className="committee-avatar">
                            {memberPhoto ? (
                              <img src={memberPhoto} alt={member.full_name} />
                            ) : (
                              <Users size={28} />
                            )}
                          </div>
                          <div className="committee-identity">
                            <div className="committee-name">{member.full_name}</div>
                            <div className="committee-position">{member.position}</div>
                          </div>
                          <button
                            type="button"
                            className="secondary committee-edit-button"
                            onClick={() => startEditCommittee(member)}
                            aria-label={`แก้ไขข้อมูล ${member.full_name}`}
                          >
                            <Pencil size={16} />
                          </button>
                        </div>

                        <div className="committee-contact-list">
                          <div><Phone size={15} /> {member.phone || 'ยังไม่ได้ระบุเบอร์โทร'}</div>
                          <div><AtSign size={15} /> {member.email || 'ยังไม่ได้ระบุอีเมล'}</div>
                          <div><MessageCircle size={15} /> {member.line_contact || 'ยังไม่ได้ระบุ Line contact'}</div>
                        </div>
                        {member.bio && <div className="committee-bio">{member.bio}</div>}

                        {isEditing && (
                          <form className="committee-form" onSubmit={handleCommitteeProfile}>
                            <div className="form-group">
                              <label>อัปโหลดรูปประจำตัว</label>
                              <input type="file" accept="image/*" onChange={e => setCommitteePhoto(e.target.files?.[0] || null)} />
                            </div>
                            <div className="form-group">
                              <label>เบอร์โทร</label>
                              <input type="tel" value={committeePhone} onChange={e => setCommitteePhone(e.target.value)} placeholder="เช่น 08x-xxx-xxxx" />
                            </div>
                            <div className="form-group">
                              <label>อีเมล</label>
                              <input type="email" value={committeeEmail} onChange={e => setCommitteeEmail(e.target.value)} placeholder="name@example.com" />
                            </div>
                            <div className="form-group">
                              <label>Line contact</label>
                              <input type="text" value={committeeLine} onChange={e => setCommitteeLine(e.target.value)} placeholder="Line ID หรือ URL" />
                            </div>
                            <div className="form-group">
                              <label>หมายเหตุ/ข้อมูลแนะนำตัว</label>
                              <textarea rows={2} value={committeeBio} onChange={e => setCommitteeBio(e.target.value)} placeholder="เช่น หน่วยงาน บทบาท หรือความเชี่ยวชาญ" />
                            </div>
                            <div className="committee-form-actions">
                              <button type="submit">บันทึก Profile</button>
                              <button type="button" className="secondary" onClick={cancelEditCommittee}>ยกเลิก</button>
                            </div>
                          </form>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="card">
              <h2 className="section-title"><FileText size={20} color="#2563eb" /> เอกสารยืนยันการแต่งตั้งคณะกรรมการ</h2>
              <div className="committee-authority-note">
                ภาพเอกสารแนบนี้ใช้ประกอบการตรวจสอบอำนาจหน้าที่และรายชื่อคณะกรรมการศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จังหวัดเชียงราย
              </div>
              <div className="authority-doc-grid">
                {COMMITTEE_AUTHORITY_DOCUMENTS.map(doc => (
                  <figure className="authority-doc" key={doc.src}>
                    <a href={doc.src} target="_blank" rel="noreferrer" aria-label={`เปิด${doc.title}ขนาดเต็ม`}>
                      <img src={doc.src} alt={doc.title} />
                    </a>
                    <figcaption>
                      <span>{doc.title}</span>
                      <a href={doc.src} target="_blank" rel="noreferrer">เปิดภาพเต็ม</a>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'news' && (
          <>
            <div className="card">
              <h2 className="section-title"><Newspaper size={20} color="#2563eb" /> ข่าวสาร</h2>
              <form onSubmit={handleNews}>
                <div className="form-group">
                  <label>หัวข้อข่าว</label>
                  <input type="text" value={newsTitle} onChange={e => setNewsTitle(e.target.value)} placeholder="เช่น กิจกรรมประชาสัมพันธ์ชุมชนสดใสจัดดี" />
                </div>
                <div className="form-group">
                  <label>รายละเอียดสั้น</label>
                  <textarea rows={3} value={newsSummary} onChange={e => setNewsSummary(e.target.value)} placeholder="สรุปกิจกรรมหรือประเด็นสำคัญสำหรับแสดงบนหน้าแรก" />
                </div>
                <div className="news-form-grid">
                  <div className="form-group">
                    <label>วันที่ข่าว</label>
                    <input type="date" value={newsDate} onChange={e => setNewsDate(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>สถานะ</label>
                    <select value={newsStatus} onChange={e => setNewsStatus(e.target.value as NewsUpdate['status'])}>
                      <option value="published">เผยแพร่</option>
                      <option value="draft">แบบร่าง</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>รูปข่าว</label>
                  <div
                    className="news-dropzone"
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      addNewsImages(e.dataTransfer.files);
                    }}
                  >
                    <Newspaper size={28} />
                    <strong>ลากรูปมาวางที่นี่</strong>
                    <span>หรือเลือกหลายรูปจากเครื่อง สูงสุด 8 รูป</span>
                    <input type="file" accept="image/*" multiple onChange={e => e.target.files && addNewsImages(e.target.files)} />
                  </div>
                  {newsImages.length > 0 && (
                    <div className="news-upload-preview">
                      {newsImagePreviews.map((preview, index) => (
                        <div className="news-upload-thumb" key={preview.key}>
                          <img src={preview.url} alt={`รูปข่าว ${index + 1}`} />
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => setNewsImages(images => images.filter((_, imageIndex) => imageIndex !== index))}
                            aria-label={`ลบรูปข่าว ${index + 1}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <label className="checkbox-row">
                  <input type="checkbox" checked={newsShowOnLanding} onChange={e => setNewsShowOnLanding(e.target.checked)} />
                  <span>แสดงข่าวนี้บนหน้าแรก</span>
                </label>
                <button type="submit">บันทึกข่าวสาร</button>
              </form>
            </div>

            <div className="card">
              <h2 className="section-title"><FileText size={20} color="#64748b" /> ข่าวสารทั้งหมด</h2>
              {newsUpdates.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '1rem' }}>ยังไม่มีข่าวสาร</div>
              ) : (
                <div className="news-list">
                  {newsUpdates.map(item => (
                    <article className="news-item" key={item.id}>
                      <div className="news-gallery">
                        {getNewsImages(item).length > 0 ? (
                          getNewsImages(item).map((image, index) => (
                            <img key={`${item.id}-${index}`} src={image} alt={`${item.title} ${index + 1}`} />
                          ))
                        ) : (
                          <div className="news-placeholder"><Newspaper size={28} /></div>
                        )}
                      </div>
                      <div className="news-item-body">
                        <div className="news-meta">
                          <span>{item.event_date}</span>
                          <span className={`badge ${item.status === 'published' ? 'badge-completed' : 'badge-drafting'}`}>
                            {item.status === 'published' ? 'เผยแพร่' : 'แบบร่าง'}
                          </span>
                          {Number(item.show_on_landing) === 1 && <span className="badge badge-proposed">หน้าแรก</span>}
                        </div>
                        <h3>{item.title}</h3>
                        <p>{item.summary}</p>
                        {editingNewsId === item.id && (
                          <form className="news-edit-form" onSubmit={handleEditNews}>
                            <div className="form-group">
                              <label>หัวข้อข่าว</label>
                              <input type="text" value={editingNewsTitle} onChange={e => setEditingNewsTitle(e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label>รายละเอียดสั้น</label>
                              <textarea rows={3} value={editingNewsSummary} onChange={e => setEditingNewsSummary(e.target.value)} />
                            </div>
                            <div className="news-form-grid">
                              <div className="form-group">
                                <label>วันที่ข่าว</label>
                                <input type="date" value={editingNewsDate} onChange={e => setEditingNewsDate(e.target.value)} />
                              </div>
                              <div className="form-group">
                                <label>สถานะ</label>
                                <select value={editingNewsStatus} onChange={e => setEditingNewsStatus(e.target.value as NewsUpdate['status'])}>
                                  <option value="published">เผยแพร่</option>
                                  <option value="draft">แบบร่าง</option>
                                </select>
                              </div>
                            </div>
                            <label className="checkbox-row">
                              <input type="checkbox" checked={editingNewsShowOnLanding} onChange={e => setEditingNewsShowOnLanding(e.target.checked)} />
                              <span>แสดงข่าวนี้บนหน้าแรก</span>
                            </label>
                            <div className="form-group">
                              <label>รูปข่าว</label>
                              {editingNewsImages.length === 0 && getNewsImages(item).length > 0 && (
                                <div className="news-current-images">
                                  {getNewsImages(item).map((image, index) => (
                                    <img key={`${item.id}-current-${index}`} src={image} alt={`รูปข่าวเดิม ${index + 1}`} />
                                  ))}
                                </div>
                              )}
                              <div
                                className="news-dropzone compact"
                                onDragOver={e => e.preventDefault()}
                                onDrop={e => {
                                  e.preventDefault();
                                  addEditingNewsImages(e.dataTransfer.files);
                                }}
                              >
                                <Newspaper size={24} />
                                <strong>ลากรูปใหม่มาวางที่นี่</strong>
                                <span>ถ้าเลือกรูปใหม่ ระบบจะแทนที่รูปเดิม สูงสุด 8 รูป</span>
                                <input type="file" accept="image/*" multiple onChange={e => e.target.files && addEditingNewsImages(e.target.files)} />
                              </div>
                              {editingNewsImages.length > 0 && (
                                <div className="news-upload-preview">
                                  {editingNewsImagePreviews.map((preview, index) => (
                                    <div className="news-upload-thumb" key={preview.key}>
                                      <img src={preview.url} alt={`รูปข่าวใหม่ ${index + 1}`} />
                                      <button
                                        type="button"
                                        className="secondary"
                                        onClick={() => setEditingNewsImages(images => images.filter((_, imageIndex) => imageIndex !== index))}
                                        aria-label={`ลบรูปข่าวใหม่ ${index + 1}`}
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="news-edit-actions">
                              <button type="submit">บันทึกการแก้ไข</button>
                              <button type="button" className="secondary" onClick={cancelEditNews}>ยกเลิก</button>
                            </div>
                          </form>
                        )}
                        <div className="news-actions">
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => editingNewsId === item.id ? cancelEditNews() : startEditNews(item)}
                          >
                            <Pencil size={16} /> Edit
                          </button>
                          <button
                            type="button"
                            className={item.status === 'published' ? 'secondary' : ''}
                            onClick={() => updateNews(item.id, { status: item.status === 'published' ? 'draft' : 'published' })}
                          >
                            {item.status === 'published' ? 'เปลี่ยนเป็นร่าง' : 'เผยแพร่'}
                          </button>
                          <button
                            type="button"
                            className={Number(item.show_on_landing) === 1 ? 'secondary' : ''}
                            onClick={() => updateNews(item.id, { show_on_landing: Number(item.show_on_landing) === 1 ? 0 : 1 })}
                          >
                            {Number(item.show_on_landing) === 1 ? 'ซ่อนจากหน้าแรก' : 'แสดงหน้าแรก'}
                          </button>
                          <button type="button" className="secondary" onClick={() => handleDeleteNews(item.id)}>
                            <Trash2 size={16} /> ลบ
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <>
            <div className="card">
              <h2 className="section-title"><ShieldCheck size={20} color="#2563eb" /> สิทธิ์ผู้ใช้ในระบบ</h2>
              <div className="role-grid">
                {roleKeys.map(roleKey => (
                  <div className="role-card" key={roleKey}>
                    <div className="role-card-title">{roleDefinitions?.[roleKey].label}</div>
                    <div className="role-card-desc">{roleDefinitions?.[roleKey].description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2 className="section-title"><UserCog size={20} color="#2563eb" /> เพิ่มผู้ใช้ใหม่</h2>
              <form onSubmit={handleCreateUser}>
                <div className="user-form-grid">
                  <div className="form-group">
                    <label>ชื่อ-สกุล</label>
                    <input type="text" value={userFullName} onChange={e => setUserFullName(e.target.value)} placeholder="เช่น ดร.ณัฏฐพล สันธิ" />
                  </div>
                  <div className="form-group">
                    <label>อีเมล</label>
                    <input type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} placeholder="name@example.com" />
                  </div>
                </div>
                <div className="user-form-grid">
                  <div className="form-group">
                    <label>เบอร์โทร</label>
                    <input type="tel" value={userPhone} onChange={e => setUserPhone(e.target.value)} placeholder="08x-xxx-xxxx" />
                  </div>
                  <div className="form-group">
                    <label>Line contact</label>
                    <input type="text" value={userLine} onChange={e => setUserLine(e.target.value)} placeholder="Line ID หรือ URL" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select value={userRole} onChange={e => setUserRole(e.target.value as UserRole)}>
                    {roleKeys.map(roleKey => (
                      <option key={roleKey} value={roleKey}>{roleDefinitions?.[roleKey].label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Temporary password</label>
                  <input type="text" value={userPassword} onChange={e => setUserPassword(e.target.value)} placeholder="ตั้งรหัสผ่านเริ่มต้น" />
                </div>
                <div className="form-group">
                  <label>หมายเหตุ</label>
                  <textarea rows={2} value={userNotes} onChange={e => setUserNotes(e.target.value)} placeholder="เช่น หน่วยงาน ตำแหน่ง หรือขอบเขตหน้าที่" />
                </div>
                <button type="submit">เพิ่มผู้ใช้</button>
              </form>
            </div>

            <div className="card">
              <h2 className="section-title"><Users size={20} color="#64748b" /> รายชื่อผู้ใช้</h2>
              <div className="user-list">
                {appUsers.map(user => (
                  <article className="user-card" key={user.id}>
                    <div className="user-card-main">
                      <div className="user-avatar">{user.full_name.slice(0, 1)}</div>
                      <div>
                        <h3>{user.full_name}</h3>
                        <div className="user-contact">{user.email}</div>
                        <div className="user-contact">
                          {user.phone || 'ยังไม่ได้ระบุเบอร์โทร'} {user.line_contact ? `| Line: ${user.line_contact}` : ''}
                        </div>
                        {user.notes && <p>{user.notes}</p>}
                      </div>
                    </div>
                    <div className="user-controls">
                      <select value={user.role} onChange={e => updateUser(user.id, { role: e.target.value as UserRole })}>
                        {roleKeys.map(roleKey => (
                          <option key={roleKey} value={roleKey}>{roleDefinitions?.[roleKey].label}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className={user.status === 'active' ? '' : 'secondary'}
                        onClick={() => updateUser(user.id, { status: user.status === 'active' ? 'inactive' : 'active' })}
                      >
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'finance' && (
          <>
            <div className="card">
              <h2 className="section-title"><ClipboardList size={20} color="#2563eb" /> แบบฟอร์มขออนุมัติยืมเงินรองจ่าย</h2>
              <div className="finance-summary">
                ใช้ร่างบันทึกข้อความสำหรับยืมเงินรองจ่ายโครงการ และตรวจยอดประมาณการก่อนนำไปจัดทำเอกสารเสนออนุมัติ
              </div>
              <div className="finance-form-grid">
                <div className="form-group">
                  <label>เลขที่</label>
                  <input type="text" value={memoNumber} onChange={e => setMemoNumber(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>วันที่</label>
                  <input type="date" value={memoDate} onChange={e => setMemoDate(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>เรื่อง</label>
                <input type="text" value={memoSubject} onChange={e => setMemoSubject(e.target.value)} />
              </div>
              <div className="form-group">
                <label>เรียน</label>
                <input type="text" value={memoTo} onChange={e => setMemoTo(e.target.value)} />
              </div>
              <div className="finance-form-grid">
                <div className="form-group">
                  <label>ผู้ขออนุมัติ</label>
                  <input type="text" value={memoRequester} onChange={e => setMemoRequester(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>ตำแหน่ง/บทบาท</label>
                  <input type="text" value={memoRequesterRole} onChange={e => setMemoRequesterRole(e.target.value)} />
                </div>
              </div>
              <div className="finance-form-grid">
                <div className="form-group">
                  <label>จำนวนเงินที่ขอยืม</label>
                  <input type="number" value={memoAmount} onChange={e => setMemoAmount(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>ยอดรวมตามรายการ</label>
                  <input type="text" value={`${(memoTeachingBudgetNumber + memoFieldBudgetNumber).toLocaleString()} บาท`} readOnly />
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="section-title"><Wallet size={20} color="#f59e0b" /> รายละเอียดประมาณการค่าใช้จ่าย</h2>
              <div className="finance-form-grid">
                <div className="form-group">
                  <label>ด้านจัดการเรียนการสอน</label>
                  <input type="number" value={memoTeachingBudget} onChange={e => setMemoTeachingBudget(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>ด้านการลงพื้นที่และประสานงาน</label>
                  <input type="number" value={memoFieldBudget} onChange={e => setMemoFieldBudget(e.target.value)} />
                </div>
              </div>
              <div className={`finance-total ${memoAmountNumber === memoTeachingBudgetNumber + memoFieldBudgetNumber ? 'ok' : 'warning'}`}>
                <span>ตรวจยอด</span>
                <strong>
                  {(memoTeachingBudgetNumber + memoFieldBudgetNumber).toLocaleString()} / {memoAmountNumber.toLocaleString()} บาท
                </strong>
              </div>
            </div>

            <div className="card">
              <h2 className="section-title"><FileText size={20} color="#64748b" /> Preview บันทึกข้อความ</h2>
              <pre className="memo-preview">{memoPreview}</pre>
              <div className="memo-signature-preview">
                {signatureDataUrl && <img src={signatureDataUrl} alt="ลายเซ็นอิเล็กทรอนิกส์" />}
                <div>(ลงชื่อ)...........................................</div>
                <strong>({memoRequester})</strong>
                <span>{memoRequesterRole}</span>
              </div>
            </div>

            <div className="card no-print">
              <h2 className="section-title"><Pencil size={20} color="#2563eb" /> ลายเซ็นอิเล็กทรอนิกส์</h2>
              <div className="signature-pad-wrap">
                <canvas
                  ref={signatureCanvasRef}
                  className="signature-pad"
                  width={720}
                  height={220}
                  onMouseDown={startSignature}
                  onMouseMove={drawSignature}
                  onMouseUp={finishSignature}
                  onMouseLeave={finishSignature}
                  onTouchStart={startSignature}
                  onTouchMove={drawSignature}
                  onTouchEnd={finishSignature}
                />
              </div>
              <div className="signature-actions">
                <label className="signature-upload">
                  <input type="file" accept="image/*" onChange={e => handleSignatureUpload(e.target.files?.[0])} />
                  อัปโหลดรูปเซ็น
                </label>
                <button type="button" className="secondary" onClick={clearSignature}>ล้างลายเซ็น</button>
                <button type="button" onClick={printFinanceMemo}>พิมพ์ / Save PDF</button>
              </div>
            </div>

            <div className="finance-print-page">
              <div className="print-memo-text">{memoPreview}</div>
              <div className="print-signature-block">
                {signatureDataUrl && <img src={signatureDataUrl} alt="ลายเซ็นอิเล็กทรอนิกส์" />}
                <div>(ลงชื่อ)...........................................</div>
                <strong>({memoRequester})</strong>
                <span>{memoRequesterRole}</span>
              </div>
            </div>
          </>
        )}

        {activeTab === 'documents' && (
          <>
            <div className="card">
              <h2 className="section-title"><Mail size={20} color="#2563eb" /> บันทึกเอกสารโครงการ</h2>
              <form onSubmit={handleDocument}>
                <div className="form-group">
                  <label>ประเภทเอกสาร</label>
                  <select value={docType} onChange={e => setDocType(e.target.value as NonNullable<OfficialDocument['document_type']>)}>
                    <option value="official">หนังสือราชการ</option>
                    <option value="training_form">แบบฟอร์มอบรม</option>
                    <option value="student_list">รายชื่อผู้เรียน</option>
                    <option value="training_material">เอกสารประกอบการอบรม</option>
                    <option value="financial_slip">หลักฐานการเงิน / Transfer Slip</option>
                    <option value="report">รายงาน/หลักฐานโครงการ</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>ชื่อเอกสาร</label>
                  <input type="text" value={docTitle} onChange={e => setDocTitle(e.target.value)} placeholder="เช่น แบบรายชื่อ ลงทะเบียนเรียน" />
                </div>
                <div className="form-group">
                  <label>เลขที่หนังสือ</label>
                  <input type="text" value={docNumber} onChange={e => setDocNumber(e.target.value)} placeholder="เช่น ศพพ.ชร. 001/2569" />
                </div>
                <div className="form-group">
                  <label>วันที่ส่ง</label>
                  <input type="date" value={docDate} onChange={e => setDocDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>ส่งถึงหน่วยงาน</label>
                  <input type="text" value={docToAgency} onChange={e => setDocToAgency(e.target.value)} placeholder="เช่น เทศบาลตำบลบ้านดู่" />
                </div>
                <div className="form-group">
                  <label>แนบไฟล์หนังสือ</label>
                  <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={e => setDocFile(e.target.files?.[0] || null)} />
                </div>
                <button type="submit">บันทึกข้อมูลหนังสือ</button>
              </form>
            </div>

            {([
              ['official', 'หนังสือราชการที่ส่งแล้ว'],
              ['training_form', 'แบบฟอร์มอบรม'],
              ['student_list', 'รายชื่อผู้เรียน'],
              ['training_material', 'เอกสารประกอบการอบรม'],
              ['financial_slip', 'หลักฐานการเงิน / Transfer Slip'],
              ['report', 'รายงาน/หลักฐานโครงการ'],
            ] as const).map(([type, title]) => (
              <div className="card" key={type}>
                <h2 className="section-title"><FileText size={20} color="#64748b" /> {title}</h2>
                {documentsByType[type].length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '1rem' }}>ยังไม่มีรายการหนังสือ</div>
              ) : (
                  documentsByType[type].map(doc => (
                  <div key={doc.id} className="student-row" style={{ alignItems: 'flex-start' }}>
                    <div className="student-info">
                      <div className="student-name" style={{ fontSize: '0.9rem' }}>{doc.title}</div>
                      <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 700, marginTop: '0.15rem' }}>
                        {getDocumentTypeLabel(doc.document_type)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        <strong>เลขที่:</strong> {doc.doc_number} | <strong>วันที่:</strong> {doc.date}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        <strong>ถึง:</strong> {doc.to_agency}
                      </div>
                      {doc.file_url && (
                        <a
                          href={`${API_ORIGIN}${doc.file_url}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: 'inline-block', marginTop: '0.35rem', fontSize: '0.75rem', color: '#2563eb', fontWeight: 700 }}
                        >
                          เปิดไฟล์แนบ
                        </a>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
                      <div className="badge badge-proposed" style={{ fontSize: '0.65rem' }}>{doc.status}</div>
                      <button
                        type="button"
                        className="secondary"
                        style={{ width: 'auto', padding: '0.35rem 0.6rem', fontSize: '0.7rem' }}
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                ))
              )}
              </div>
            ))}
          </>
        )}

        {activeTab === 'contact' && (
          <div className="card contact-card">
            <h2 className="section-title"><MapPinned size={20} color="#2563eb" /> ติดต่อศูนย์</h2>
            <div className="contact-organization">
              ศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จังหวัดเชียงราย
            </div>
            <div className="contact-list">
              <div>
                <MapPin size={18} />
                <span>319 ม.5 ต.ท่าสาย อ.เมืองเชียงราย จ.เชียงราย 57000</span>
              </div>
              <div>
                <Phone size={18} />
                <a href="tel:0896416289">089-6416289</a>
              </div>
            </div>
            <div className="contact-actions">
              <a className="contact-call-button" href="tel:0896416289">โทรติดต่อศูนย์</a>
            </div>
          </div>
        )}
      </main>

      <nav className="bottom-nav">
        <div className="nav-item" onClick={openLandingPage}>
          <Home size={20} />
          <span>Home</span>
        </div>
        {canAccess('dashboard') && <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <LayoutDashboard size={20} />
          <span>แดชบอร์ด</span>
        </div>}
        {canAccess('attendance') && <div className={`nav-item ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>
          <UserCheck size={20} />
          <span>เช็คชื่อ</span>
        </div>}
        {canAccess('activity') && <div className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>
          <Camera size={20} />
          <span>บันทึกงาน</span>
        </div>}
        {canAccess('reports') && <div className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
          <TrendingUp size={20} />
          <span>รายงาน</span>
        </div>}
        {canAccess('policy') && <div className={`nav-item ${activeTab === 'policy' ? 'active' : ''}`} onClick={() => setActiveTab('policy')}>
          <FileText size={20} />
          <span>นโยบาย</span>
        </div>}
        {canAccess('committee') && <div className={`nav-item ${activeTab === 'committee' ? 'active' : ''}`} onClick={() => setActiveTab('committee')}>
          <Users size={20} />
          <span>กรรมการ</span>
        </div>}
        {canAccess('news') && <div className={`nav-item ${activeTab === 'news' ? 'active' : ''}`} onClick={() => setActiveTab('news')}>
          <Newspaper size={20} />
          <span>ข่าวสาร</span>
        </div>}
        {canAccess('users') && <div className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          <ShieldCheck size={20} />
          <span>ผู้ใช้</span>
        </div>}
        {canAccess('finance') && <div className={`nav-item ${activeTab === 'finance' ? 'active' : ''}`} onClick={() => setActiveTab('finance')}>
          <ClipboardList size={20} />
          <span>การเงิน</span>
        </div>}
        {canAccess('documents') && <div className={`nav-item ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>
          <Mail size={20} />
          <span>เอกสาร</span>
        </div>}
        {canAccess('about') && <div className={`nav-item ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>
          <BookOpen size={20} />
          <span>ข้อมูล</span>
        </div>}
        {canAccess('contact') && <div className={`nav-item ${activeTab === 'contact' ? 'active' : ''}`} onClick={() => setActiveTab('contact')}>
          <MapPinned size={20} />
          <span>ติดต่อศูนย์</span>
        </div>}
      </nav>
    </div>
  );
}

export default App;
