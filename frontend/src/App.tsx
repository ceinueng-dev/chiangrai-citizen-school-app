import React, { useState, useEffect } from 'react';
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
  Mail
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

type Tab = 'dashboard' | 'attendance' | 'activity' | 'policy' | 'reports' | 'about' | 'documents';

interface ProjectInfo {
  name: string;
  rationale: string;
  objective: string;
  expected_outcome: string;
  graduation_criteria: string;
  curriculum: string;
  manager: string;
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
  doc_number: string;
  date: string;
  to_agency: string;
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

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [budget, setBudget] = useState<BudgetCategory[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [documents, setDocuments] = useState<OfficialDocument[]>([]);
  const [detailedActivities, setDetailedActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

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
  const [docNumber, setDocNumber] = useState('');
  const [docDate, setDocDate] = useState('');
  const [docToAgency, setDocToAgency] = useState('');

  // Expense form states
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseCategoryId, setExpenseCategoryId] = useState('');
  const [expenseActivityId, setExpenseActivityId] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [dashRes, activitiesRes] = await Promise.all([
        axios.get(`${API_BASE}/dashboard`),
        axios.get(`${API_BASE}/activities/detailed`)
      ]);
      setProjectInfo(dashRes.data.info);
      setBudget(dashRes.data.budget);
      setStudents(dashRes.data.students);
      setPolicies(dashRes.data.policies);
      setDocuments(dashRes.data.documents || []);
      setDetailedActivities(activitiesRes.data);
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
    try {
      await axios.post(`${API_BASE}/documents`, {
        title: docTitle,
        doc_number: docNumber,
        date: docDate,
        to_agency: docToAgency
      });
      alert('บันทึกข้อมูลหนังสือเรียบร้อยแล้ว!');
      setDocTitle('');
      setDocNumber('');
      setDocDate('');
      setDocToAgency('');
      loadAllData();
    } catch {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
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

  if (loading) return <div className="loading" style={{ textAlign: 'center', marginTop: '50px' }}>กำลังโหลดข้อมูลโรงเรียนพลเมือง...</div>;

  return (
    <div className="app-container">
      <header>
        <h1>ระบบจัดการโรงเรียนพลเมือง</h1>
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
                <div style={{ marginBottom: '0.25rem' }}><strong>ผู้รับผิดชอบโครงการ:</strong> {projectInfo.manager}</div>
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

        {activeTab === 'documents' && (
          <>
            <div className="card">
              <h2 className="section-title"><Mail size={20} color="#2563eb" /> บันทึกการส่งหนังสือราชการ</h2>
              <form onSubmit={handleDocument}>
                <div className="form-group">
                  <label>เรื่อง (หัวข้อหนังสือ)</label>
                  <input type="text" value={docTitle} onChange={e => setDocTitle(e.target.value)} placeholder="เช่น ขอความอนุเคราะห์สถานที่" />
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
                <button type="submit">บันทึกข้อมูลหนังสือ</button>
              </form>
            </div>

            <div className="card">
              <h2 className="section-title"><FileText size={20} color="#64748b" /> รายการหนังสือราชการที่ส่งแล้ว</h2>
              {documents.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '1rem' }}>ยังไม่มีรายการหนังสือ</div>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} className="student-row" style={{ alignItems: 'flex-start' }}>
                    <div className="student-info">
                      <div className="student-name" style={{ fontSize: '0.9rem' }}>{doc.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        <strong>เลขที่:</strong> {doc.doc_number} | <strong>วันที่:</strong> {doc.date}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        <strong>ถึง:</strong> {doc.to_agency}
                      </div>
                    </div>
                    <div className="badge badge-proposed" style={{ fontSize: '0.65rem' }}>{doc.status}</div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>

      <nav className="bottom-nav">
        <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <LayoutDashboard size={20} />
          <span>แดชบอร์ด</span>
        </div>
        <div className={`nav-item ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>
          <UserCheck size={20} />
          <span>เช็คชื่อ</span>
        </div>
        <div className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>
          <Camera size={20} />
          <span>บันทึกงาน</span>
        </div>
        <div className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
          <TrendingUp size={20} />
          <span>รายงาน</span>
        </div>
        <div className={`nav-item ${activeTab === 'policy' ? 'active' : ''}`} onClick={() => setActiveTab('policy')}>
          <FileText size={20} />
          <span>นโยบาย</span>
        </div>
        <div className={`nav-item ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>
          <Mail size={20} />
          <span>หนังสือ</span>
        </div>
        <div className={`nav-item ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>
          <BookOpen size={20} />
          <span>ข้อมูล</span>
        </div>
      </nav>
    </div>
  );
}

export default App;
