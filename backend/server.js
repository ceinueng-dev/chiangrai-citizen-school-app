const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

// --- Official Documents ---
app.get('/api/documents', (req, res) => {
  db.all("SELECT * FROM official_documents ORDER BY date DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/documents', (req, res) => {
  const { title, doc_number, date, to_agency, status } = req.body;
  db.run("INSERT INTO official_documents (title, doc_number, date, to_agency, status) VALUES (?, ?, ?, ?, ?)",
    [title, doc_number, date, to_agency, status || 'ส่งแล้ว'],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Document logged', id: this.lastID });
    }
  );
});

// --- Students & Attendance ---
app.get('/api/students', (req, res) => {
  db.all("SELECT * FROM students", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/attendance', (req, res) => {
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
app.post('/api/expenses', (req, res) => {
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

app.post('/api/activities', (req, res) => {
  const { title, description, parent_id, allocated_budget } = req.body;
  db.run("INSERT INTO activities (title, description, parent_id, allocated_budget) VALUES (?, ?, ?, ?)",
    [title, description, parent_id, allocated_budget || 0],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Activity created', id: this.lastID });
    }
  );
});

app.post('/api/activity_logs', upload.single('photo'), (req, res) => {
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
app.patch('/api/policy/:id', (req, res) => {
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
