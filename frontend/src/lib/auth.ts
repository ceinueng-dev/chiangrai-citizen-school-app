import crypto from 'crypto';

export interface UserSession {
  id: number;
  role: string;
  status: string;
  email: string;
  exp: number;
}

export const userRoles: Record<string, { label: string; description: string }> = {
  super_admin: {
    label: 'Super Admin',
    description: 'ผู้ดูแลสูงสุด จัดการผู้ใช้ บทบาท และการตั้งค่าระบบ'
  },
  project_admin: {
    label: 'Project Admin',
    description: 'ผู้ดูแลโครงการ จัดการข้อมูลโครงการ ข่าว เอกสาร กิจกรรม และคณะกรรมการ'
  },
  committee_member: {
    label: 'Committee Member',
    description: 'คณะกรรมการ เพิ่มข่าวสารและแก้ไข profile ของตนเอง'
  },
  staff_operator: {
    label: 'Staff / Operator',
    description: 'เจ้าหน้าที่ปฏิบัติงาน เช็คชื่อ บันทึกกิจกรรม เอกสาร และค่าใช้จ่าย'
  },
  participant_learner: {
    label: 'Participant / Learner',
    description: 'ผู้เข้าร่วมอบรม ดูเอกสาร ข่าวสาร ตารางกิจกรรม และข้อมูลการเรียนรู้ของตนเอง'
  },
  public_viewer: {
    label: 'Public Viewer',
    description: 'ผู้ชมทั่วไป เข้าดูข้อมูลสาธารณะที่เผยแพร่แล้ว'
  }
};

export const validRoles = Object.keys(userRoles);
export const validStatuses = ['active', 'inactive'];

const authSecret = process.env.AUTH_SECRET || 'chiangrai-citizen-school-dev-secret';

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')) {
  return {
    salt,
    hash: crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex')
  };
}

export function sanitizeUser(user: any) {
  if (!user) return null;
  const { password_hash, password_salt, ...safeUser } = user;
  return safeUser;
}

export function signToken(user: { id: number; role: string; status: string; email: string }) {
  const payload = Buffer.from(JSON.stringify({
    id: user.id,
    role: user.role,
    status: user.status,
    email: user.email,
    exp: Date.now() + (1000 * 60 * 60 * 24 * 7) // 7 days token
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', authSecret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifyToken(token?: string | null): UserSession | null {
  if (!token || !token.includes('.')) return null;
  const [payload, signature] = token.split('.');
  const expected = crypto.createHmac('sha256', authSecret).update(payload).digest('base64url');
  if (Buffer.byteLength(signature) !== Buffer.byteLength(expected)) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as UserSession;
    if (session.exp < Date.now() || session.status !== 'active') return null;
    return session;
  } catch {
    return null;
  }
}

export function verifyAuth(request: Request, ...allowedRoles: string[]): { user: UserSession | null; errorResponse?: Response } {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const session = verifyToken(token);

  if (!session) {
    return {
      user: null,
      errorResponse: Response.json({ error: 'Authentication required' }, { status: 401 })
    };
  }

  if (session.role !== 'super_admin' && allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    return {
      user: null,
      errorResponse: Response.json({ error: 'Insufficient permission' }, { status: 403 })
    };
  }

  return { user: session };
}
