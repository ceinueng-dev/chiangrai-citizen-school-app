const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'citizen_school.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Students table
  db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    total_hours REAL DEFAULT 0
  )`);

  // Attendance table
  db.run(`CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    date TEXT NOT NULL,
    hours_logged REAL NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id)
  )`);

  // Budget Categories table
  db.run(`CREATE TABLE IF NOT EXISTS budget_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    allocated_amount REAL NOT NULL,
    spent_amount REAL DEFAULT 0
  )`);

  // Activities table (Tasks/Roadmap)
  db.run(`CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    allocated_budget REAL DEFAULT 0,
    FOREIGN KEY (parent_id) REFERENCES activities(id)
  )`);

  // Activity Logs table (Evidence/Photos)
  db.run(`CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_id INTEGER,
    description TEXT,
    photo_url TEXT,
    latitude REAL,
    longitude REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(id)
  )`);

  // Expenses table
  db.run(`CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    activity_id INTEGER,
    amount REAL NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES budget_categories(id),
    FOREIGN KEY (activity_id) REFERENCES activities(id)
  )`);

  // Project Info table (General Metadata)
  db.run(`CREATE TABLE IF NOT EXISTS project_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    rationale TEXT,
    objective TEXT,
    expected_outcome TEXT,
    graduation_criteria TEXT,
    curriculum TEXT,
    manager TEXT,
    responsible_agency TEXT,
    location TEXT,
    target_group TEXT,
    networking TEXT,
    duration TEXT
  )`);

  // Migration for existing project_info
  db.serialize(() => {
    db.run("ALTER TABLE project_info ADD COLUMN rationale TEXT", (err) => {});
    db.run("ALTER TABLE project_info ADD COLUMN networking TEXT", (err) => {});
    db.run("ALTER TABLE project_info ADD COLUMN curriculum TEXT", (err) => {});
    db.run("ALTER TABLE project_info ADD COLUMN manager TEXT", (err) => {});
    db.run("ALTER TABLE project_info ADD COLUMN responsible_agency TEXT", (err) => {});
    db.run("ALTER TABLE project_info ADD COLUMN expected_outcome TEXT", (err) => {});
    db.run("ALTER TABLE project_info ADD COLUMN graduation_criteria TEXT", (err) => {});
  });

  // Project Policy table
  db.run(`CREATE TABLE IF NOT EXISTS project_policies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK(status IN ('Drafting', 'Completed', 'Proposed')) DEFAULT 'Drafting'
  )`);

  // Official Documents table
  db.run(`CREATE TABLE IF NOT EXISTS official_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    doc_number TEXT,
    date TEXT,
    to_agency TEXT,
    status TEXT DEFAULT 'ส่งแล้ว'
  )`);

  // Seed initial project info
  db.get("SELECT COUNT(*) as count FROM project_info", (err, row) => {
    if (row && row.count === 0) {
      db.run(`INSERT INTO project_info (name, rationale, objective, expected_outcome, graduation_criteria, curriculum, manager, responsible_agency, location, target_group, networking, duration) VALUES (
        'โรงเรียนพลเมือง เทศบาลตำบลบ้านดู่ ตำบลบ้านดู่ อำเภอเมือง จังหวัดเชียงราย',
        'การพัฒนาประชาธิปไตยในระดับท้องถิ่นจำเป็นต้องอาศัย “พลเมืองที่มีคุณภาพ” ซึ่งมีความรู้ ความเข้าใจ และทักษะในการมีส่วนร่วมเชิงนโยบายและการกำหนดทิศทางการพัฒนาชุมชนของตนเอง จังหวัดเชียงรายเป็นพื้นที่ที่ประสบปัญหาภัยพิบัติและปัญหาสิ่งแวดล้อมซ้ำซาก เช่น น้ำท่วม ดินถล่ม และหมอกควัน ส่งผลกระทบต่อคุณภาพชีวิต ทยากรธรรมชาติ และความมั่นคงของชุมชนในระดับตำบลอย่างต่อเนื่อง สถาบันพระปกเกล้าได้พัฒนาหลักสูตรโรงเรียนพลเมือง 60 ชั่วโมง เพื่อส่งเสริมการจัดการศึกษาพลเมือง (Civic Education) ที่มุ่งสร้าง “พลเมืองที่มีส่วนร่วมอย่างกระตือรือร้น (Active Citizen)” และ “ผู้นำการเปลี่ยนแปลง (Change Leader)” ผ่านกระบวนการเรียนรู้แบบมีส่วนร่วม การลงมือปฏิบัติจริง และกระบวนการ Project Citizen ในระดับท้องถิ่น โครงการโรงเรียนพลเมืองตำบลบ้านดู่ จึงมุ่งใช้พื้นที่ตำบลเป็นฐานการเรียนรู้เชิงนโยบาย (Citizen Policy Lab) เพื่อพัฒนาศักยภาพพลเมืองด้านการจัดการภัยพิบัติและสิ่งแวดล้อม ส่งเสริมการมีส่วนร่วมของประชาชนในการกำหนดนโยบายสาธารณะ และจัดทำข้อเสนอเชิงนโยบายหรือร่างข้อบัญญัติท้องถิ่นที่สามารถเชื่อมโยงและขยายผลสู่ระดับอำเภอและจังหวัดเชียงรายได้อย่างเป็นระบบและยั่งยืน',
        '1. เพื่อพัฒนาความรู้ ความเข้าใจ และทัศนคติด้านความเป็นพลเมืองในระบอบประชาธิปไตย ให้แก่ผู้นำชุมชนและประชาชนในตำบลบ้านดู่ ผ่านกระบวนการจัดการศึกษาพลเมืองตามหลักสูตรโรงเรียนพลเมือง\n2. เพื่อพัฒนาทักษะการมีส่วนร่วมเชิงนโยบาย (Civic Skills) ของผู้เข้าร่วมโครงการ ผ่านกระบวนการ Project Citizen ในการวิเคราะห์ปัญหาภัยพิบัติและสิ่งแวดล้อมในระดับตำบล\n3. เพื่อส่งเสริมการเกิดผู้นำการเปลี่ยนแปลง (Change Leader) และเครือข่ายพลเมือง ที่สามารถทำงานร่วมกับองค์กรปกครองส่วนท้องถิ่นในการจัดทำข้อเสนอเชิงนโยบายหรือร่างข้อบัญญัติท้องถิ่น\n4. เพื่อสร้างต้นแบบกระบวนการเรียนรู้เชิงนโยบายระดับตำบล ที่สามารถขยายผลและเชื่อมโยงสู่การพัฒนานโยบายในระดับอำเภอและจังหวัดเชียงราย',
        '1. ผู้เข้าร่วมโครงการไม่น้อยกว่า 30 คน ผ่านการเรียนรู้ตามหลักสูตรโรงเรียนพลเมืองครบ 60 ชั่วโมง และมีพัฒนาการด้านความรู้ ทักษะ และทัศนคติความเป็นพลเมืองอย่างชัดเจน\n2. เกิดผู้นำพลเมืองและเครือข่าย Active Citizen ในระดับตำบล ที่มีศักยภาพในการขับเคลื่อนประเด็นสาธารณะด้านการจัดการภัยพิบัติและสิ่งแวดล้อม\n3. มีข้อเสนอเชิงนโยบายหรือร่างข้อบัญญัติท้องถิ่นด้านการจัดการภัยพิบัติและสิ่งแวดล้อมอย่างน้อย 1 ฉบับ เสนอต่อองค์กรปกครองส่วนท้องถิ่น\n4. เกิดต้นแบบ Citizen Policy Lab ระดับตำบล ที่สามารถขยายผลสู่พื้นที่อื่นของจังหวัดเชียงราย',
        '1. จำนวนนักเรียนไม่ต่ำกว่า 30 คน\n2. เวลาเรียนไม่ต่ำกว่า 75% (ไม่น้อยกว่า 45 ชม. จาก 60 ชม.)\n3. ขับเคลื่อนนโยบายสาธารณะอย่างน้อย 1 ประเด็น (การจัดการขยะ หรือ เกษตรอินทรีย์/ความมั่นคงทางอาหาร)\n4. จัดกิจกรรมรณรงค์การเลือกตั้งระดับชาติใน 5 หน่วยเลือกตั้ง\n5. เข้าร่วมกิจกรรมและงานกลุ่มไม่น้อยกว่า 80% ของหลักสูตร\n6. จัดทำผลงาน Project Citizen หรือกิจกรรมถอดบทเรียน\n7. ผ่านการประเมินโดยทีมวิทยากรและคณะทำงาน',
        'หลักสูตรโรงเรียนพลเมือง 60 ชั่วโมง (3 หมวดการเรียนรู้)\nสถานที่: มหาวิทยาลัยราชภัฏเชียงราย\n(เกณฑ์จบหลักสูตร: เวลาเรียนไม่น้อยกว่า 75% หรือ 45 ชม.)',
        'อาจารย์ ดร. ณัฏฐพล สันธิ\n(ผู้ช่วยอธิการบดี มรภ.เชียงราย / เลขานุการศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จ.เชียงราย)\nโทร: 061-265-8765 | อีเมล: natthaphon.san@crru.ac.th',
        'ศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จังหวัดเชียงราย',
        'มหาวิทยาลัยราชภัฏเชียงราย / เทศบาลตำบลบ้านดู่ จังหวัดเชียงราย',
        'ผู้เข้าร่วมโครงการจำนวนไม่น้อยกว่า 30 คน ประกอบด้วย\n• ผู้นำท้องถิ่น/ผู้นำชุมชน\n• สมาชิกกลุ่มอาชีพและเครือข่ายชุมชน\n• ประชาชนทั่วไปในตำบลบ้านดู่\n(เป็นไปตามสัดส่วนและคุณสมบัติที่หลักสูตรโรงเรียนพลเมืองกำหนด)',
        'มหาวิทยาลัยราชภัฏเชียงราย (CRRU) (คณะรัฐศาสตร์และรัฐประศาสนศาสตร์/คณะนิติศาสตร์)',
        'มกราคม - กรกฎาคม 2569'
      )`);
    }
  });

  // Seed example documents
  db.get("SELECT COUNT(*) as count FROM official_documents", (err, row) => {
    if (row && row.count === 0) {
      db.run("INSERT INTO official_documents (title, doc_number, date, to_agency, status) VALUES ('ขอความอนุเคราะห์สถานที่จัดการเรียนการสอน', 'ศพพ.ชร. 001/2569', '2026-01-15', 'อธิการบดีมหาวิทยาลัยราชภัฏเชียงราย', 'ส่งแล้ว')");
      db.run("INSERT INTO official_documents (title, doc_number, date, to_agency, status) VALUES ('เชิญประชุมคณะกรรมการโครงการ ครั้งที่ 1', 'ศพพ.ชร. 002/2569', '2026-01-20', 'คณะกรรมการโครงการโรงเรียนพลเมือง', 'ส่งแล้ว')");
    }
  });

  // Seed initial budget categories
  db.get("SELECT COUNT(*) as count FROM budget_categories", (err, row) => {
    if (row && row.count === 0) {
      const categories = [
        ['ค่าตอบแทนวิทยากรบรรยาย', 8000],
        ['ค่าตอบแทนวิทยากรกระบวนการ', 8000],
        ['ค่าตอบแทนผู้ปฏิบัติงาน', 3200],
        ['ค่าอาหารกลางวัน (จัดการเรียนการสอน)', 16800],
        ['ค่าอาหารว่าง (จัดการเรียนการสอน)', 7200],
        ['ค่าเอกสาร/สื่อการเรียนรู้', 900],
        ['ค่าสถานที่/เครื่องเสียง', 1000],
        ['ค่าวัสดุอุปกรณ์ (กิจกรรมกลุ่ม)', 1000],
        ['ค่าใช้จ่ายเบ็ดเตล็ด (นำเสนอผลงาน)', 1000],
        ['ค่าอาหารกลางวัน (ลงพื้นที่)', 1400],
        ['ค่าอาหารว่าง (เวที Policy Lab)', 600],
        ['ค่าน้ำมัน/เดินทาง (เหมาจ่าย)', 900]
      ];
      const stmt = db.prepare("INSERT INTO budget_categories (name, allocated_amount) VALUES (?, ?)");
      categories.forEach(cat => stmt.run(cat));
      stmt.finalize();
    }
  });

  // Seed sample students
  db.get("SELECT COUNT(*) as count FROM students", (err, row) => {
    if (row && row.count === 0) {
      const students = ['สมชาย', 'สมศรี', 'อนันดา', 'บุญมี', 'กัญญา'];
      const stmt = db.prepare("INSERT INTO students (name) VALUES (?)");
      students.forEach(name => stmt.run(name));
      stmt.finalize();
    }
  });

  // Seed initial policies
  db.get("SELECT COUNT(*) as count FROM project_policies", (err, row) => {
    if (row && row.count === 0) {
      db.run("INSERT INTO project_policies (title, description, status) VALUES ('พ.ร.บ. จัดการขยะระดับท้องถิ่น', 'ผลักดันนโยบายการจัดการขยะอย่างยั่งยืนในพื้นที่เป้าหมาย', 'Drafting')");
      db.run("INSERT INTO project_policies (title, description, status) VALUES ('พ.ร.บ. ความมั่นคงทางอาหาร', 'ส่งเสริมเกษตรอินทรีย์และระบบอาหารปลอดภัยในชุมชน', 'Drafting')");
    }
  });

  // Seed example activities and sub-activities
  db.get("SELECT COUNT(*) as count FROM activities", (err, row) => {
    if (row && row.count === 0) {
      // Phase 1: Preparation (Allocated: 4,000 THB for Fieldwork)
      db.run("INSERT INTO activities (title, description, allocated_budget) VALUES ('ระยะที่ 1: การเตรียมการและวางแผน', 'ม.ค. - เม.ย. 2569', 4000)", function(err) {
        const pId = this.lastID;
        db.run("INSERT INTO activities (parent_id, title, description, allocated_budget) VALUES (?, 'ประชุมคณะกรรมการ ครั้งที่ 1', 'ม.ค. 2569', 500)", [pId]);
        db.run("INSERT INTO activities (parent_id, title, description, allocated_budget) VALUES (?, 'สำรวจพื้นที่เป้าหมาย', 'ก.พ. 2569', 3000)", [pId]);
        db.run("INSERT INTO activities (parent_id, title, description, allocated_budget) VALUES (?, 'ออกแบบหลักสูตร', 'มี.ค.-เม.ย. 2569', 500)", [pId]);
      });

      // Phase 2: Learning Management
      db.run("INSERT INTO activities (title, description, allocated_budget) VALUES ('ระยะที่ 2: การจัดการเรียนรู้', 'พ.ค. - มิ.ย. 2569', 45000)", function(err) {
        const pId = this.lastID;
        // Category 1: 12h
        db.run("INSERT INTO activities (parent_id, title, description, allocated_budget) VALUES (?, 'หมวดที่ 1: วิชาแกนกลางหรือวิชาบังคับ (12 ชม.)', '23 - 25 พฤษภาคม 2569', 9200)", [pId], function(err) {
            const subId = this.lastID;
            db.run("INSERT INTO activities (parent_id, title, description) VALUES (?, '1.1 ปฐมนิเทศ และกิจกรรมแลกเปลี่ยน', 'ประธานศูนย์พัฒนาการเมืองภาคพลเมือง')", [subId]);
            db.run("INSERT INTO activities (parent_id, title, description) VALUES (?, '1.2 บทนำโรงเรียนพลเมืองและความเป็นพลเมือง', 'วิทยากรจากคณะรัฐศาสตร์ฯ CRRU')", [subId]);
            db.run("INSERT INTO activities (parent_id, title, description) VALUES (?, '1.3 สิทธิ หน้าที่ และความรับผิดชอบของพลเมือง', 'วิทยากรจากคณะรัฐศาสตร์ฯ CRRU')", [subId]);
            db.run("INSERT INTO activities (parent_id, title, description) VALUES (?, '1.4 กฎหมายและนโยบายด้านภัยพิบัติ/สิ่งแวดล้อม', 'วิทยากรจากคณะนิติศาสตร์ CRRU')", [subId]);
        });
        // Category 2: 18h
        db.run("INSERT INTO activities (parent_id, title, description, allocated_budget) VALUES (?, 'หมวดที่ 2: วิชาท้องถิ่น (ท้องถิ่นของเรา) (18 ชม.)', '27 - 31 พฤษภาคม 2569', 13800)", [pId], function(err) {
            const subId = this.lastID;
            db.run("INSERT INTO activities (parent_id, title, description) VALUES (?, '2.1 บทบาท อปท. กับการจัดการภัยพิบัติ', 'วิทยากรจากคณะรัฐศาสตร์ฯ CRRU')", [subId]);
            db.run("INSERT INTO activities (parent_id, title, description) VALUES (?, '2.2 การมีส่วนร่วมของประชาชนในระดับตำบล', 'วิทยากรจากคณะรัฐศาสตร์ฯ CRRU')", [subId]);
            db.run("INSERT INTO activities (parent_id, title, description) VALUES (?, '2.3 สำรวจปัญหา จุดเสี่ยง และทุนทางสังคม', 'วิทยากรจากคณะรัฐศาสตร์ฯ CRRU')", [subId]);
            db.run("INSERT INTO activities (parent_id, title, description) VALUES (?, '2.4 เวทีถอดบทเรียนและกำหนดประเด็น Project Citizen', 'วิทยากรจากคณะรัฐศาสตร์ฯ CRRU')", [subId]);
        });
        // Category 3: 30h
        db.run("INSERT INTO activities (parent_id, title, description, allocated_budget) VALUES (?, 'หมวดที่ 3: วิชาผู้นำพลเมืองเพื่อสร้างการเปลี่ยนแปลง (30 ชม.)', 'มิถุนายน 2569', 23000)", [pId], function(err) {
            const subId = this.lastID;
            db.run("INSERT INTO activities (parent_id, title, description) VALUES (?, '3.1 การพัฒนาทักษะผู้นำและการสื่อสารเชิงนโยบาย', 'วิทยากรจากคณะรัฐศาสตร์ฯ CRRU')", [subId]);
            db.run("INSERT INTO activities (parent_id, title, description) VALUES (?, '3.2 กระบวนการ Project Citizen: วิเคราะห์และออกแบบ', 'วิทยากรจากคณะรัฐศาสตร์ฯ CRRU')", [subId]);
            db.run("INSERT INTO activities (parent_id, title, description) VALUES (?, '3.4 Citizen Policy Lab และเวทีนำเสนอข้อเสนอ', 'วิทยากรจากคณะรัฐศาสตร์ฯ CRRU')", [subId]);
            db.run("INSERT INTO activities (parent_id, title, description) VALUES (?, '3.5 การสะท้อนผลการเรียนรู้ของนักเรียน', 'วิทยากรจากคณะรัฐศาสตร์ฯ CRRU')", [subId]);
        });
      });

      // Phase 3: Evaluation & Wrap-up
      db.run("INSERT INTO activities (title, description, allocated_budget) VALUES ('ระยะที่ 3: สรุปผลและประเมินผล', 'มิถุนายน - กรกฎาคม 2569', 1000)", function(err) {
        const pId = this.lastID;
        db.run("INSERT INTO activities (parent_id, title, description) VALUES (?, 'ถอดบทเรียนและสรุปผลผู้เรียน', 'มิถุนายน 2569')", [pId]);
        db.run("INSERT INTO activities (parent_id, title, description) VALUES (?, 'ติดตามและประเมินผล', 'มิถุนายน - กรกฎาคม 2569')", [pId]);
        db.run("INSERT INTO activities (parent_id, title, description) VALUES (?, 'ประชุมคณะกรรมการ ครั้งที่ 2 และรายงานผล', 'กรกฎาคม 2569')", [pId]);
      });
    }
  });
});

module.exports = db;
