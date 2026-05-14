const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5001;
const uploadsDir = path.join(__dirname, 'uploads');

fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Multer setup for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

const userRoles = {
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

const validRoles = Object.keys(userRoles);
const validStatuses = ['active', 'inactive'];
const authSecret = process.env.AUTH_SECRET || 'chiangrai-citizen-school-dev-secret';

const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => ({
  salt,
  hash: crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex')
});

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password_hash, password_salt, ...safeUser } = user;
  return safeUser;
};

const signToken = (user) => {
  const payload = Buffer.from(JSON.stringify({
    id: user.id,
    role: user.role,
    status: user.status,
    email: user.email,
    exp: Date.now() + (1000 * 60 * 60 * 12)
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', authSecret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
};

const verifyToken = (token) => {
  if (!token || !token.includes('.')) return null;
  const [payload, signature] = token.split('.');
  const expected = crypto.createHmac('sha256', authSecret).update(payload).digest('base64url');
  if (Buffer.byteLength(signature) !== Buffer.byteLength(expected)) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (session.exp < Date.now() || session.status !== 'active') return null;
  return session;
};

const requireRoles = (...roles) => (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  const session = verifyToken(token);
  if (!session) return res.status(401).json({ error: 'Authentication required' });
  if (session.role !== 'super_admin' && !roles.includes(session.role)) {
    return res.status(403).json({ error: 'Insufficient permission' });
  }
  req.user = session;
  next();
};

// --- Dashboard API ---
app.get('/api/dashboard', (req, res) => {
  const dashboard = {};

  db.get("SELECT * FROM project_info LIMIT 1", (err, info) => {
    if (err) return res.status(500).json({ error: err.message });
    dashboard.info = info;

    db.all("SELECT * FROM budget_categories", (err, categories) => {
      if (err) return res.status(500).json({ error: err.message });
      dashboard.budget = categories;

      db.all("SELECT * FROM students", (err, students) => {
        if (err) return res.status(500).json({ error: err.message });
        dashboard.students = students;

        db.all("SELECT * FROM project_policies", (err, policies) => {
          if (err) return res.status(500).json({ error: err.message });
          dashboard.policies = policies;
          
          db.all("SELECT * FROM official_documents ORDER BY date DESC", (err, docs) => {
            if (err) return res.status(500).json({ error: err.message });
            dashboard.documents = docs;
            res.json(dashboard);
          });
        });
      });
    });
  });
});

// --- Users & Roles ---
app.get('/api/roles', (req, res) => {
  res.json(userRoles);
});

app.get('/api/users', requireRoles('super_admin'), (req, res) => {
  db.all("SELECT id, full_name, email, phone, line_contact, role, status, notes, created_at FROM app_users ORDER BY status ASC, role ASC, full_name ASC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  db.get("SELECT * FROM app_users WHERE lower(email) = lower(?)", [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user || user.status !== 'active' || !user.password_hash || !user.password_salt) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const candidate = hashPassword(password, user.password_salt).hash;
    const valid = crypto.timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(user.password_hash, 'hex'));
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    res.json({ user: sanitizeUser(user), token: signToken(user) });
  });
});

app.post('/api/users', requireRoles('super_admin'), (req, res) => {
  const { full_name, email, phone, line_contact, role, status, password, notes } = req.body;
  const normalizedRole = validRoles.includes(role) ? role : 'public_viewer';
  const normalizedStatus = validStatuses.includes(status) ? status : 'active';

  if (!full_name || !email) {
    return res.status(400).json({ error: 'Full name and email are required' });
  }

  const passwordData = hashPassword(password || 'ChangeMe123!');
  db.run(
    "INSERT INTO app_users (full_name, email, phone, line_contact, role, status, password_hash, password_salt, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [full_name, email, phone || '', line_contact || '', normalizedRole, normalizedStatus, passwordData.hash, passwordData.salt, notes || ''],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'User created', id: this.lastID });
    }
  );
});

app.patch('/api/users/:id', requireRoles('super_admin'), (req, res) => {
  const { full_name, email, phone, line_contact, role, status, password, notes } = req.body;
  const updates = [];
  const params = [];
  const userId = Number(req.params.id);

  if (status === 'inactive' && req.user?.id === userId) {
    return res.status(400).json({ error: 'You cannot deactivate your own active admin session' });
  }

  if (full_name !== undefined) {
    updates.push('full_name = ?');
    params.push(full_name);
  }
  if (email !== undefined) {
    updates.push('email = ?');
    params.push(email);
  }
  if (phone !== undefined) {
    updates.push('phone = ?');
    params.push(phone);
  }
  if (line_contact !== undefined) {
    updates.push('line_contact = ?');
    params.push(line_contact);
  }
  if (validRoles.includes(role)) {
    updates.push('role = ?');
    params.push(role);
  }
  if (validStatuses.includes(status)) {
    updates.push('status = ?');
    params.push(status);
  }
  if (password !== undefined && password !== '') {
    const passwordData = hashPassword(password);
    updates.push('password_hash = ?');
    params.push(passwordData.hash);
    updates.push('password_salt = ?');
    params.push(passwordData.salt);
  }
  if (notes !== undefined) {
    updates.push('notes = ?');
    params.push(notes);
  }

  if (updates.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

  params.push(userId);
  db.run(`UPDATE app_users SET ${updates.join(', ')} WHERE id = ?`, params, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    db.get(
      "SELECT id, full_name, email, phone, line_contact, role, status, notes, created_at FROM app_users WHERE id = ?",
      [userId],
      (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User updated', user });
      }
    );
  });
});

// --- Official Documents ---
app.get('/api/documents', (req, res) => {
  db.all("SELECT * FROM official_documents ORDER BY date DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/documents', requireRoles('project_admin', 'staff_operator'), upload.single('file'), (req, res) => {
  const { title, document_type, doc_number, date, to_agency, status } = req.body;
  const file_url = req.file ? `/uploads/${req.file.filename}` : null;

  db.run("INSERT INTO official_documents (title, document_type, doc_number, date, to_agency, file_url, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [title, document_type || 'official', doc_number, date, to_agency, file_url, status || 'ส่งแล้ว'],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Document logged', id: this.lastID });
    }
  );
});

app.delete('/api/documents/:id', requireRoles('project_admin', 'staff_operator'), (req, res) => {
  db.get("SELECT file_url FROM official_documents WHERE id = ?", [req.params.id], (err, doc) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    db.run("DELETE FROM official_documents WHERE id = ?", [req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });

      if (doc.file_url) {
        const filePath = path.join(__dirname, doc.file_url);
        fs.unlink(filePath, () => {});
      }

      res.json({ message: 'Document deleted' });
    });
  });
});

// --- Process Timeline ---
app.get('/api/process_timeline', (req, res) => {
  db.all("SELECT * FROM process_timeline ORDER BY activity_order ASC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.patch('/api/process_timeline/:id', requireRoles('project_admin'), (req, res) => {
  const { start_month, end_month } = req.body;
  const start = Math.max(0, Math.min(6, Number(start_month)));
  const end = Math.max(start, Math.min(6, Number(end_month)));

  db.run(
    "UPDATE process_timeline SET start_month = ?, end_month = ? WHERE id = ?",
    [start, end, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Timeline updated' });
    }
  );
});

// --- Committee Profiles ---
app.get('/api/committee', (req, res) => {
  db.all("SELECT * FROM committee_members ORDER BY display_order ASC, id ASC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.patch('/api/committee/:id', requireRoles('project_admin', 'committee_member'), upload.single('photo'), (req, res) => {
  const { phone, email, line_contact, bio } = req.body;
  const photo_url = req.file ? `/uploads/${req.file.filename}` : null;
  const photo_data = req.file
    ? `data:${req.file.mimetype};base64,${fs.readFileSync(req.file.path).toString('base64')}`
    : null;

  db.get("SELECT photo_url FROM committee_members WHERE id = ?", [req.params.id], (err, member) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!member) return res.status(404).json({ error: 'Committee member not found' });

    const params = [
      phone || '',
      email || '',
      line_contact || '',
      bio || '',
    ];
    let sql = "UPDATE committee_members SET phone = ?, email = ?, line_contact = ?, bio = ?";

    if (photo_url) {
      sql += ", photo_url = ?, photo_data = ?";
      params.push(photo_url, photo_data);
    }

    sql += " WHERE id = ?";
    params.push(req.params.id);

    db.run(sql, params, (err) => {
      if (err) return res.status(500).json({ error: err.message });

      if (photo_url && member.photo_url) {
        const oldFilePath = path.join(__dirname, member.photo_url);
        fs.unlink(oldFilePath, () => {});
      }

      res.json({ message: 'Committee profile updated', photo_url: photo_url || member.photo_url });
    });
  });
});

// --- News Updates ---
app.get('/api/news', (req, res) => {
  const filters = [];
  const params = [];

  if (req.query.status) {
    filters.push('status = ?');
    params.push(req.query.status);
  }

  if (req.query.landing === 'true') {
    filters.push('show_on_landing = ?');
    params.push(1);
  }

  const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
  db.all(`SELECT * FROM news_updates ${where} ORDER BY event_date DESC, created_at DESC, id DESC`, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/news', requireRoles('project_admin', 'committee_member'), upload.array('images', 8), (req, res) => {
  const { title, summary, event_date, status, show_on_landing } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const images = (req.files || []).map(file =>
    `data:${file.mimetype};base64,${fs.readFileSync(file.path).toString('base64')}`
  );
  const image_data = images[0] || null;
  const image_data_list = images.length > 0 ? JSON.stringify(images) : null;

  db.run(
    "INSERT INTO news_updates (title, summary, event_date, status, show_on_landing, image_data, image_data_list) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      title,
      summary || '',
      event_date || new Date().toISOString().split('T')[0],
      status === 'published' ? 'published' : 'draft',
      show_on_landing === 'true' || show_on_landing === '1' ? 1 : 0,
      image_data,
      image_data_list
    ],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'News update created', id: this.lastID });
    }
  );
});

app.patch('/api/news/:id', requireRoles('project_admin', 'committee_member'), upload.array('images', 8), (req, res) => {
  const { title, summary, event_date, status, show_on_landing } = req.body;
  const updates = [];
  const params = [];
  const images = (req.files || []).map(file =>
    `data:${file.mimetype};base64,${fs.readFileSync(file.path).toString('base64')}`
  );

  if (title !== undefined) {
    if (!title) return res.status(400).json({ error: 'Title is required' });
    updates.push('title = ?');
    params.push(title);
  }

  if (summary !== undefined) {
    updates.push('summary = ?');
    params.push(summary || '');
  }

  if (event_date !== undefined) {
    updates.push('event_date = ?');
    params.push(event_date || new Date().toISOString().split('T')[0]);
  }

  if (status === 'draft' || status === 'published') {
    updates.push('status = ?');
    params.push(status);
  }

  if (show_on_landing !== undefined) {
    updates.push('show_on_landing = ?');
    params.push(show_on_landing === true || show_on_landing === 1 || show_on_landing === '1' ? 1 : 0);
  }

  if (images.length > 0) {
    updates.push('image_data = ?');
    params.push(images[0]);
    updates.push('image_data_list = ?');
    params.push(JSON.stringify(images));
  }

  if (updates.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

  params.push(req.params.id);
  db.run(`UPDATE news_updates SET ${updates.join(', ')} WHERE id = ?`, params, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'News update changed' });
  });
});

app.delete('/api/news/:id', requireRoles('project_admin', 'committee_member'), (req, res) => {
  db.run("DELETE FROM news_updates WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'News update deleted' });
  });
});

// --- Students & Attendance ---
app.get('/api/students', (req, res) => {
  db.all("SELECT * FROM students", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/attendance', requireRoles('project_admin', 'staff_operator'), (req, res) => {
  const { student_id, hours, date } = req.body;
  if (!student_id || !hours || !date) return res.status(400).json({ error: 'Missing fields' });

  db.run("INSERT INTO attendance (student_id, date, hours_logged) VALUES (?, ?, ?)", 
    [student_id, date, hours], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      // Update student total hours
      db.run("UPDATE students SET total_hours = total_hours + ? WHERE id = ?", [hours, student_id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Attendance logged', id: this.lastID });
      });
    }
  );
});

// --- Budget & Expenses ---
app.post('/api/expenses', requireRoles('project_admin', 'staff_operator'), (req, res) => {
  const { category_id, activity_id, amount, description, date } = req.body;
  
  db.run("INSERT INTO expenses (category_id, activity_id, amount, description, date) VALUES (?, ?, ?, ?, ?)",
    [category_id, activity_id, amount, description, date],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });

      // Update spent amount in category
      db.run("UPDATE budget_categories SET spent_amount = spent_amount + ? WHERE id = ?", [amount, category_id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Expense added', id: this.lastID });
      });
    }
  );
});

// --- Activities & Photos ---
app.get('/api/activities', (req, res) => {
  db.all("SELECT * FROM activities", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/activities/detailed', (req, res) => {
  const query = `
    SELECT 
      a.*, 
      e.amount as expense_amount, e.description as expense_desc, e.category_id, c.name as category_name,
      l.id as log_id, l.description as log_desc, l.photo_url, l.latitude, l.longitude, l.timestamp as log_time
    FROM activities a
    LEFT JOIN expenses e ON a.id = e.activity_id
    LEFT JOIN budget_categories c ON e.category_id = c.id
    LEFT JOIN activity_logs l ON a.id = l.activity_id
  `;

  db.all(query, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const activitiesMap = {};
    rows.forEach(row => {
      if (!activitiesMap[row.id]) {
        activitiesMap[row.id] = {
          id: row.id,
          parent_id: row.parent_id,
          title: row.title,
          description: row.description,
          allocated_budget: row.allocated_budget || 0,
          expenses: [],
          logs: [],
          sub_activities: [],
          total_expense: 0
        };
      }

      // Add unique expenses
      if (row.expense_amount && !activitiesMap[row.id].expenses.find(e => e.description === row.expense_desc && e.amount === row.expense_amount)) {
        activitiesMap[row.id].expenses.push({
          amount: row.expense_amount,
          description: row.expense_desc,
          category_id: row.category_id,
          category_name: row.category_name
        });
        activitiesMap[row.id].total_expense += row.expense_amount;
      }

      // Add unique logs
      if (row.log_id && !activitiesMap[row.id].logs.find(l => l.id === row.log_id)) {
        activitiesMap[row.id].logs.push({
          id: row.log_id,
          description: row.log_desc,
          photo_url: row.photo_url,
          latitude: row.latitude,
          longitude: row.longitude,
          timestamp: row.log_time
        });
      }
    });

    const rootActivities = [];
    Object.values(activitiesMap).forEach(activity => {
      if (activity.parent_id) {
        if (activitiesMap[activity.parent_id]) {
          activitiesMap[activity.parent_id].sub_activities.push(activity);
        }
      } else {
        rootActivities.push(activity);
      }
    });

    res.json(rootActivities);
  });
});

app.post('/api/activities', requireRoles('project_admin', 'staff_operator'), (req, res) => {
  const { title, description, parent_id, allocated_budget } = req.body;
  db.run("INSERT INTO activities (title, description, parent_id, allocated_budget) VALUES (?, ?, ?, ?)",
    [title, description, parent_id, allocated_budget || 0],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Activity created', id: this.lastID });
    }
  );
});

app.post('/api/activity_logs', requireRoles('project_admin', 'staff_operator'), upload.single('photo'), (req, res) => {
  const { activity_id, description, latitude, longitude } = req.body;
  const photo_url = req.file ? `/uploads/${req.file.filename}` : null;

  db.run("INSERT INTO activity_logs (activity_id, description, photo_url, latitude, longitude) VALUES (?, ?, ?, ?, ?)",
    [activity_id, description, photo_url, latitude, longitude],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Log recorded', id: this.lastID });
    }
  );
});

// --- Project Policy ---
app.patch('/api/policy/:id', requireRoles('project_admin'), (req, res) => {
  const { status } = req.body;
  db.run("UPDATE project_policies SET status = ? WHERE id = ?", [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Policy updated' });
  });
});

db.ready
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Unable to start server because database initialization failed:', err);
    process.exit(1);
  });
