const path = require('path');
const crypto = require('crypto');

const usePostgres = Boolean(process.env.DATABASE_URL);

const projectInfoSeed = [
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
];

const projectOwnershipInfo = {
  responsibleAgency: 'ศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จังหวัดเชียงราย',
  centerChair: 'ดร.อนงค์ศรี สิทธิอาษา',
  manager: 'อาจารย์ ดร. ณัฏฐพล สันธิ\n(ผู้ช่วยอธิการบดี มรภ.เชียงราย / เลขานุการศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จ.เชียงราย)\nโทร: 061-265-8765 | อีเมล: natthaphon.san@crru.ac.th'
};

const budgetCategories = [
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

const processTimelineSeed = [
  [1, 'ประชุมคณะกรรมการโครงการ ครั้งที่ 1', 0, 0],
  [2, 'สำรวจและคัดเลือกพื้นที่เป้าหมาย', 1, 1],
  [3, 'เตรียมหลักสูตรและประสานงาน', 2, 3],
  [4, 'จัดการเรียนรู้ หมวดที่ 1 (12 ชม.)', 4, 4],
  [5, 'จัดการเรียนรู้ หมวดที่ 2 (18 ชม.)', 4, 4],
  [6, 'จัดการเรียนรู้ หมวดที่ 3 / Project Citizen (30 ชม.)', 5, 5],
  [7, 'ถอดบทเรียนและสรุปผลผู้เรียน', 5, 5],
  [8, 'ติดตามและประเมินผล', 5, 6],
  [9, 'ประชุมคณะกรรมการ ครั้งที่ 2 และรายงานผล', 6, 6],
];

const committeeMembersSeed = [
  ['ที่ปรึกษาและคณะกรรมการบริหาร', 'ที่ปรึกษา', 'นายวรสฤษฎ์ ปิงเมือง', 1],
  ['ที่ปรึกษาและคณะกรรมการบริหาร', 'ที่ปรึกษา', 'ผศ.ดร.เด่นศักดิ์ สุริยะ', 2],
  ['ที่ปรึกษาและคณะกรรมการบริหาร', 'ประธานกรรมการ', 'ดร.อนงค์ศรี สิทธิอาษา', 3],
  ['ที่ปรึกษาและคณะกรรมการบริหาร', 'รองประธานกรรมการ', 'นายธเนศธรรม ไคร้ศรี', 4],
  ['ที่ปรึกษาและคณะกรรมการบริหาร', 'รองประธานกรรมการ', 'ดร.ณัฏฐพล สันธิ', 5],
  ['ที่ปรึกษาและคณะกรรมการบริหาร', 'เลขานุการและกรรมการ', 'นางสาวพรทิวา วงค์วิชัย', 6],
  ['ที่ปรึกษาและคณะกรรมการบริหาร', 'ผู้ช่วยเลขานุการและกรรมการ', 'นางนราพร ตาคำ', 7],
  ['คณะกรรมการ', 'ผู้แทนจากสถาบันพระปกเกล้าฯ', 'นายจักรกฤษ สิทธิโสติ', 8],
  ['คณะกรรมการ', 'กรรมการ', 'นายไกร ธรรมกาศ', 9],
  ['คณะกรรมการ', 'กรรมการ', 'นายเจษฎา สุทธิสาคร', 10],
  ['คณะกรรมการ', 'กรรมการ', 'นายพิเศษ ถาแหล่ง', 11],
  ['คณะกรรมการ', 'กรรมการ', 'ดร.ธีรวัฒน์ วังมณี', 12],
  ['คณะกรรมการ', 'กรรมการ', 'นางสาวอัยวรมณย์ ธีร์ตระกูล', 13],
  ['คณะกรรมการ', 'กรรมการ', 'นายวุฒิพงศ์ เพชรนิล', 14],
  ['คณะกรรมการ', 'กรรมการ', 'นางสาวกานต์พิชชา สุรีคุณาพงษ์', 15],
  ['คณะกรรมการ', 'กรรมการ', 'นายจุ่มพล สิทธิสาร', 16],
  ['คณะกรรมการ', 'กรรมการ', 'นายนิรันดร์ วัฒนกูล', 17],
  ['คณะกรรมการ', 'กรรมการ', 'นายกัณฑ์ สิทธิอาษา', 18],
  ['คณะกรรมการ', 'กรรมการ', 'นายอัจฉริยะ ผามั่ง', 19],
  ['คณะกรรมการ', 'กรรมการ', 'นายอภิชิต ศิริชัย', 20],
  ['คณะกรรมการ', 'กรรมการ', 'นางสาวดวงจิตร ยลเลอร์', 21],
  ['คณะกรรมการ', 'กรรมการ', 'นายวรฉัตรว์ แก้วรภัสทรัพย์', 22],
  ['คณะกรรมการ', 'กรรมการ', 'นายภาคภูมิ แก่นทอง', 23],
  ['คณะกรรมการ', 'กรรมการ', 'นายธนเดช จาตามหาอินทร์', 24],
  ['คณะกรรมการ', 'กรรมการ', 'นางกฤษณา ไวสุริยะ', 25],
  ['คณะกรรมการ', 'กรรมการ', 'นางพิมพ์ชนก ต๊ะศร', 26],
];

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

const userProfilesSeed = [
  ['ผู้ดูแลระบบศูนย์ฯ', 'admin@chiangrai-citizen-school.local', 'super_admin', 'ผู้ดูแลสูงสุดสำหรับตั้งค่าระบบและสิทธิ์ผู้ใช้'],
  ['ผู้ดูแลโครงการโรงเรียนพลเมือง', 'project-admin@chiangrai-citizen-school.local', 'project_admin', 'ผู้รับผิดชอบข้อมูลโครงการและการเผยแพร่เนื้อหา'],
  ['คณะกรรมการศูนย์ฯ', 'committee@chiangrai-citizen-school.local', 'committee_member', 'บัญชีต้นแบบสำหรับคณะกรรมการศูนย์ฯ'],
  ['เจ้าหน้าที่ปฏิบัติงาน', 'staff@chiangrai-citizen-school.local', 'staff_operator', 'บัญชีต้นแบบสำหรับงานเช็คชื่อ บันทึกกิจกรรม และเอกสาร'],
  ['ผู้เข้าอบรม / ผู้เรียน', 'learner@chiangrai-citizen-school.local', 'participant_learner', 'บัญชีต้นแบบสำหรับผู้เข้าร่วมอบรมของศูนย์ฯ'],
  ['ผู้ชมสาธารณะ', 'viewer@chiangrai-citizen-school.local', 'public_viewer', 'บัญชีต้นแบบสำหรับผู้ชมข้อมูลสาธารณะ']
];

const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => ({
  salt,
  hash: crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex')
});

const runAsync = (db, sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });

const getAsync = (db, sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

function createSqliteDatabase() {
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = path.resolve(__dirname, 'citizen_school.db');
  const db = new sqlite3.Database(dbPath);
  db.ready = initializeDatabase(db, 'sqlite');
  return db;
}

function toPostgresQuery(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

function createPostgresDatabase() {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  let initializing = true;
  let readyResolve;
  let readyReject;

  const db = {
    ready: new Promise((resolve, reject) => {
      readyResolve = resolve;
      readyReject = reject;
    }),
    serialize(fn) {
      fn();
    },
    async all(sql, params = [], cb) {
      if (typeof params === 'function') {
        cb = params;
        params = [];
      }

      try {
        if (!initializing) await db.ready;
        const result = await pool.query(toPostgresQuery(sql), params);
        if (cb) cb(null, result.rows);
      } catch (err) {
        if (cb) cb(err);
        else throw err;
      }
    },
    async get(sql, params = [], cb) {
      if (typeof params === 'function') {
        cb = params;
        params = [];
      }

      try {
        if (!initializing) await db.ready;
        const result = await pool.query(toPostgresQuery(sql), params);
        if (cb) cb(null, result.rows[0]);
      } catch (err) {
        if (cb) cb(err);
        else throw err;
      }
    },
    async run(sql, params = [], cb = () => {}) {
      if (typeof params === 'function') {
        cb = params;
        params = [];
      }

      try {
        if (!initializing) await db.ready;
        let query = toPostgresQuery(sql);
        const shouldReturnId = /^\s*insert\s+/i.test(query) && !/\sreturning\s+/i.test(query);
        if (shouldReturnId) query += ' RETURNING id';
        const result = await pool.query(query, params);
        cb.call({ lastID: result.rows[0]?.id }, null);
      } catch (err) {
        cb(err);
      }
    },
    prepare(sql) {
      return {
        run(params, cb) {
          return db.run(sql, params, cb);
        },
        finalize(cb) {
          if (cb) cb();
        }
      };
    }
  };

  initializeDatabase(db, 'postgres')
    .then(() => {
      initializing = false;
      readyResolve();
    })
    .catch((err) => {
      initializing = false;
      console.error('Database initialization failed:', err);
      readyReject(err);
    });

  return db;
}

async function initializeDatabase(db, type) {
  const autoId = type === 'postgres' ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
  const timestamp = type === 'postgres' ? 'TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP' : 'DATETIME DEFAULT CURRENT_TIMESTAMP';

  await runAsync(db, `CREATE TABLE IF NOT EXISTS students (
    id ${autoId},
    name TEXT NOT NULL,
    total_hours REAL DEFAULT 0
  )`);

  await runAsync(db, `CREATE TABLE IF NOT EXISTS attendance (
    id ${autoId},
    student_id INTEGER,
    date TEXT NOT NULL,
    hours_logged REAL NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id)
  )`);

  await runAsync(db, `CREATE TABLE IF NOT EXISTS budget_categories (
    id ${autoId},
    name TEXT NOT NULL,
    allocated_amount REAL NOT NULL,
    spent_amount REAL DEFAULT 0
  )`);

  await runAsync(db, `CREATE TABLE IF NOT EXISTS activities (
    id ${autoId},
    parent_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    allocated_budget REAL DEFAULT 0,
    FOREIGN KEY (parent_id) REFERENCES activities(id)
  )`);

  await runAsync(db, `CREATE TABLE IF NOT EXISTS activity_logs (
    id ${autoId},
    activity_id INTEGER,
    description TEXT,
    photo_url TEXT,
    latitude REAL,
    longitude REAL,
    timestamp ${timestamp},
    FOREIGN KEY (activity_id) REFERENCES activities(id)
  )`);

  await runAsync(db, `CREATE TABLE IF NOT EXISTS expenses (
    id ${autoId},
    category_id INTEGER,
    activity_id INTEGER,
    amount REAL NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES budget_categories(id),
    FOREIGN KEY (activity_id) REFERENCES activities(id)
  )`);

  await runAsync(db, `CREATE TABLE IF NOT EXISTS project_info (
    id ${autoId},
    name TEXT,
    rationale TEXT,
    objective TEXT,
    expected_outcome TEXT,
    graduation_criteria TEXT,
    curriculum TEXT,
    manager TEXT,
    center_chair TEXT,
    responsible_agency TEXT,
    location TEXT,
    target_group TEXT,
    networking TEXT,
    duration TEXT
  )`);

  await addColumnIfMissing(db, 'project_info', 'center_chair TEXT');

  await runAsync(db, `CREATE TABLE IF NOT EXISTS project_policies (
    id ${autoId},
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK(status IN ('Drafting', 'Completed', 'Proposed')) DEFAULT 'Drafting'
  )`);

  await runAsync(db, `CREATE TABLE IF NOT EXISTS official_documents (
    id ${autoId},
    title TEXT NOT NULL,
    document_type TEXT DEFAULT 'official',
    doc_number TEXT,
    date TEXT,
    to_agency TEXT,
    file_url TEXT,
    status TEXT DEFAULT 'ส่งแล้ว'
  )`);

  await addColumnIfMissing(db, 'official_documents', "document_type TEXT DEFAULT 'official'");
  await addColumnIfMissing(db, 'official_documents', 'file_url TEXT');

  await runAsync(db, `CREATE TABLE IF NOT EXISTS process_timeline (
    id ${autoId},
    activity_order INTEGER NOT NULL,
    title TEXT NOT NULL,
    start_month INTEGER NOT NULL DEFAULT 0,
    end_month INTEGER NOT NULL DEFAULT 0
  )`);

  await runAsync(db, `CREATE TABLE IF NOT EXISTS committee_members (
    id ${autoId},
    group_name TEXT NOT NULL,
    position TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    line_contact TEXT DEFAULT '',
    photo_url TEXT,
    photo_data TEXT,
    bio TEXT DEFAULT '',
    display_order INTEGER NOT NULL DEFAULT 0
  )`);

  await addColumnIfMissing(db, 'committee_members', 'photo_data TEXT');

  await runAsync(db, `CREATE TABLE IF NOT EXISTS news_updates (
    id ${autoId},
    title TEXT NOT NULL,
    summary TEXT,
    event_date TEXT,
    status TEXT CHECK(status IN ('draft', 'published')) DEFAULT 'draft',
    show_on_landing INTEGER DEFAULT 0,
    image_data TEXT,
    image_data_list TEXT,
    created_at ${timestamp}
  )`);

  await addColumnIfMissing(db, 'news_updates', 'image_data_list TEXT');

  await runAsync(db, `CREATE TABLE IF NOT EXISTS app_users (
    id ${autoId},
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT DEFAULT '',
    line_contact TEXT DEFAULT '',
    role TEXT CHECK(role IN ('super_admin', 'project_admin', 'committee_member', 'staff_operator', 'participant_learner', 'public_viewer')) DEFAULT 'public_viewer',
    status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
    password_hash TEXT,
    password_salt TEXT,
    notes TEXT DEFAULT '',
    created_at ${timestamp}
  )`);

  await addColumnIfMissing(db, 'app_users', "phone TEXT DEFAULT ''");
  await addColumnIfMissing(db, 'app_users', "line_contact TEXT DEFAULT ''");
  await addColumnIfMissing(db, 'app_users', 'password_hash TEXT');
  await addColumnIfMissing(db, 'app_users', 'password_salt TEXT');
  await addColumnIfMissing(db, 'app_users', "notes TEXT DEFAULT ''");
  await updateAppUsersRoleConstraint(db, type);

  await seedDatabase(db);
}

async function addColumnIfMissing(db, table, columnDefinition) {
  try {
    await runAsync(db, `ALTER TABLE ${table} ADD COLUMN ${columnDefinition}`);
  } catch (err) {
    const message = err?.message || '';
    if (!/duplicate column|already exists/i.test(message)) {
      throw err;
    }
  }
}

async function updateAppUsersRoleConstraint(db, type) {
  if (type === 'postgres') {
    await runAsync(db, 'ALTER TABLE app_users DROP CONSTRAINT IF EXISTS app_users_role_check');
    await runAsync(
      db,
      "ALTER TABLE app_users ADD CONSTRAINT app_users_role_check CHECK(role IN ('super_admin', 'project_admin', 'committee_member', 'staff_operator', 'participant_learner', 'public_viewer'))"
    );
    return;
  }

  const table = await getAsync(
    db,
    "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'app_users'"
  );

  if (!table?.sql || table.sql.includes('participant_learner')) return;

  await runAsync(db, 'ALTER TABLE app_users RENAME TO app_users_legacy');
  await runAsync(db, `CREATE TABLE app_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT DEFAULT '',
    line_contact TEXT DEFAULT '',
    role TEXT CHECK(role IN ('super_admin', 'project_admin', 'committee_member', 'staff_operator', 'participant_learner', 'public_viewer')) DEFAULT 'public_viewer',
    status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
    password_hash TEXT,
    password_salt TEXT,
    notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  await runAsync(
    db,
    `INSERT INTO app_users (id, full_name, email, phone, line_contact, role, status, password_hash, password_salt, notes, created_at)
     SELECT id, full_name, email, phone, line_contact, role, status, password_hash, password_salt, notes, created_at FROM app_users_legacy`
  );
  await runAsync(db, 'DROP TABLE app_users_legacy');
}

async function seedDatabase(db) {
  let row = await getAsync(db, 'SELECT COUNT(*) as count FROM project_info');
  if (Number(row?.count || 0) === 0) {
    await runAsync(
      db,
      `INSERT INTO project_info (
        name, rationale, objective, expected_outcome, graduation_criteria, curriculum,
        manager, responsible_agency, location, target_group, networking, duration
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      projectInfoSeed
    );
  }

  await runAsync(
    db,
    'UPDATE project_info SET responsible_agency = ?, center_chair = ?, manager = ? WHERE id = (SELECT id FROM project_info ORDER BY id LIMIT 1)',
    [
      projectOwnershipInfo.responsibleAgency,
      projectOwnershipInfo.centerChair,
      projectOwnershipInfo.manager
    ]
  );

  row = await getAsync(db, 'SELECT COUNT(*) as count FROM official_documents');
  if (Number(row?.count || 0) === 0) {
    await runAsync(db, 'INSERT INTO official_documents (title, doc_number, date, to_agency, status) VALUES (?, ?, ?, ?, ?)', [
      'ขอความอนุเคราะห์สถานที่จัดการเรียนการสอน',
      'ศพพ.ชร. 001/2569',
      '2026-01-15',
      'อธิการบดีมหาวิทยาลัยราชภัฏเชียงราย',
      'ส่งแล้ว'
    ]);
    await runAsync(db, 'INSERT INTO official_documents (title, doc_number, date, to_agency, status) VALUES (?, ?, ?, ?, ?)', [
      'เชิญประชุมคณะกรรมการโครงการ ครั้งที่ 1',
      'ศพพ.ชร. 002/2569',
      '2026-01-20',
      'คณะกรรมการโครงการโรงเรียนพลเมือง',
      'ส่งแล้ว'
    ]);
  }

  row = await getAsync(db, 'SELECT COUNT(*) as count FROM budget_categories');
  if (Number(row?.count || 0) === 0) {
    for (const category of budgetCategories) {
      await runAsync(db, 'INSERT INTO budget_categories (name, allocated_amount) VALUES (?, ?)', category);
    }
  }

  row = await getAsync(db, 'SELECT COUNT(*) as count FROM students');
  if (Number(row?.count || 0) === 0) {
    for (const name of ['สมชาย', 'สมศรี', 'อนันดา', 'บุญมี', 'กัญญา']) {
      await runAsync(db, 'INSERT INTO students (name) VALUES (?)', [name]);
    }
  }

  row = await getAsync(db, 'SELECT COUNT(*) as count FROM project_policies');
  if (Number(row?.count || 0) === 0) {
    await runAsync(db, 'INSERT INTO project_policies (title, description, status) VALUES (?, ?, ?)', [
      'พ.ร.บ. จัดการขยะระดับท้องถิ่น',
      'ผลักดันนโยบายการจัดการขยะอย่างยั่งยืนในพื้นที่เป้าหมาย',
      'Drafting'
    ]);
    await runAsync(db, 'INSERT INTO project_policies (title, description, status) VALUES (?, ?, ?)', [
      'พ.ร.บ. ความมั่นคงทางอาหาร',
      'ส่งเสริมเกษตรอินทรีย์และระบบอาหารปลอดภัยในชุมชน',
      'Drafting'
    ]);
  }

  row = await getAsync(db, 'SELECT COUNT(*) as count FROM activities');
  if (Number(row?.count || 0) === 0) {
    await seedActivities(db);
  }

  row = await getAsync(db, 'SELECT COUNT(*) as count FROM process_timeline');
  if (Number(row?.count || 0) === 0) {
    for (const item of processTimelineSeed) {
      await runAsync(db, 'INSERT INTO process_timeline (activity_order, title, start_month, end_month) VALUES (?, ?, ?, ?)', item);
    }
  }

  row = await getAsync(db, 'SELECT COUNT(*) as count FROM committee_members');
  if (Number(row?.count || 0) === 0) {
    for (const member of committeeMembersSeed) {
      await runAsync(
        db,
        'INSERT INTO committee_members (group_name, position, full_name, display_order) VALUES (?, ?, ?, ?)',
        member
      );
    }
  }

  for (const user of userProfilesSeed) {
    row = await getAsync(db, 'SELECT id FROM app_users WHERE email = ?', [user[1]]);
    if (!row) {
      const password = hashPassword('ChangeMe123!');
      await runAsync(
        db,
        'INSERT INTO app_users (full_name, email, role, password_hash, password_salt, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [user[0], user[1], user[2], password.hash, password.salt, user[3]]
      );
    }
  }

  row = await getAsync(db, 'SELECT COUNT(*) as count FROM app_users WHERE password_hash IS NULL OR password_salt IS NULL');
  if (Number(row?.count || 0) > 0) {
    const password = hashPassword('ChangeMe123!');
    await runAsync(
      db,
      'UPDATE app_users SET password_hash = ?, password_salt = ? WHERE password_hash IS NULL OR password_salt IS NULL',
      [password.hash, password.salt]
    );
  }
}

async function seedActivities(db) {
  const phase1 = await runAsync(db, "INSERT INTO activities (title, description, allocated_budget) VALUES ('ระยะที่ 1: การเตรียมการและวางแผน', 'ม.ค. - เม.ย. 2569', 4000)");
  await runAsync(db, "INSERT INTO activities (parent_id, title, description, allocated_budget) VALUES (?, 'ประชุมคณะกรรมการ ครั้งที่ 1', 'ม.ค. 2569', 500)", [phase1.lastID]);
  await runAsync(db, "INSERT INTO activities (parent_id, title, description, allocated_budget) VALUES (?, 'สำรวจพื้นที่เป้าหมาย', 'ก.พ. 2569', 3000)", [phase1.lastID]);
  await runAsync(db, "INSERT INTO activities (parent_id, title, description, allocated_budget) VALUES (?, 'ออกแบบหลักสูตร', 'มี.ค.-เม.ย. 2569', 500)", [phase1.lastID]);

  const phase2 = await runAsync(db, "INSERT INTO activities (title, description, allocated_budget) VALUES ('ระยะที่ 2: การจัดการเรียนรู้', 'พ.ค. - มิ.ย. 2569', 45000)");
  const category1 = await runAsync(db, "INSERT INTO activities (parent_id, title, description, allocated_budget) VALUES (?, 'หมวดที่ 1: วิชาแกนกลางหรือวิชาบังคับ (12 ชม.)', '23 - 25 พฤษภาคม 2569', 9200)", [phase2.lastID]);
  await runAsync(db, "INSERT INTO activities (parent_id, title, description) VALUES (?, '1.1 ปฐมนิเทศ และกิจกรรมแลกเปลี่ยน', 'ประธานศูนย์พัฒนาการเมืองภาคพลเมือง')", [category1.lastID]);
  await runAsync(db, "INSERT INTO activities (parent_id, title, description) VALUES (?, '1.2 บทนำโรงเรียนพลเมืองและความเป็นพลเมือง', 'วิทยากรจากคณะรัฐศาสตร์ฯ CRRU')", [category1.lastID]);
  await runAsync(db, "INSERT INTO activities (parent_id, title, description) VALUES (?, '1.3 สิทธิ หน้าที่ และความรับผิดชอบของพลเมือง', 'วิทยากรจากคณะรัฐศาสตร์ฯ CRRU')", [category1.lastID]);
  await runAsync(db, "INSERT INTO activities (parent_id, title, description) VALUES (?, '1.4 กฎหมายและนโยบายด้านภัยพิบัติ/สิ่งแวดล้อม', 'วิทยากรจากคณะนิติศาสตร์ CRRU')", [category1.lastID]);

  const category2 = await runAsync(db, "INSERT INTO activities (parent_id, title, description, allocated_budget) VALUES (?, 'หมวดที่ 2: วิชาท้องถิ่น (ท้องถิ่นของเรา) (18 ชม.)', '27 - 31 พฤษภาคม 2569', 13800)", [phase2.lastID]);
  await runAsync(db, "INSERT INTO activities (parent_id, title, description) VALUES (?, '2.1 บทบาท อปท. กับการจัดการภัยพิบัติ', 'วิทยากรจากคณะรัฐศาสตร์ฯ CRRU')", [category2.lastID]);
  await runAsync(db, "INSERT INTO activities (parent_id, title, description) VALUES (?, '2.2 การมีส่วนร่วมของประชาชนในระดับตำบล', 'วิทยากรจากคณะรัฐศาสตร์ฯ CRRU')", [category2.lastID]);
  await runAsync(db, "INSERT INTO activities (parent_id, title, description) VALUES (?, '2.3 สำรวจปัญหา จุดเสี่ยง และทุนทางสังคม', 'วิทยากรจากคณะรัฐศาสตร์ฯ CRRU')", [category2.lastID]);
  await runAsync(db, "INSERT INTO activities (parent_id, title, description) VALUES (?, '2.4 เวทีถอดบทเรียนและกำหนดประเด็น Project Citizen', 'วิทยากรจากคณะรัฐศาสตร์ฯ CRRU')", [category2.lastID]);

  const category3 = await runAsync(db, "INSERT INTO activities (parent_id, title, description, allocated_budget) VALUES (?, 'หมวดที่ 3: วิชาผู้นำพลเมืองเพื่อสร้างการเปลี่ยนแปลง (30 ชม.)', 'มิถุนายน 2569', 23000)", [phase2.lastID]);
  await runAsync(db, "INSERT INTO activities (parent_id, title, description) VALUES (?, '3.1 การพัฒนาทักษะผู้นำและการสื่อสารเชิงนโยบาย', 'วิทยากรจากคณะรัฐศาสตร์ฯ CRRU')", [category3.lastID]);
  await runAsync(db, "INSERT INTO activities (parent_id, title, description) VALUES (?, '3.2 กระบวนการ Project Citizen: วิเคราะห์และออกแบบ', 'วิทยากรจากคณะรัฐศาสตร์ฯ CRRU')", [category3.lastID]);
  await runAsync(db, "INSERT INTO activities (parent_id, title, description) VALUES (?, '3.4 Citizen Policy Lab และเวทีนำเสนอข้อเสนอ', 'วิทยากรจากคณะรัฐศาสตร์ฯ CRRU')", [category3.lastID]);
  await runAsync(db, "INSERT INTO activities (parent_id, title, description) VALUES (?, '3.5 การสะท้อนผลการเรียนรู้ของนักเรียน', 'วิทยากรจากคณะรัฐศาสตร์ฯ CRRU')", [category3.lastID]);

  const phase3 = await runAsync(db, "INSERT INTO activities (title, description, allocated_budget) VALUES ('ระยะที่ 3: สรุปผลและประเมินผล', 'มิถุนายน - กรกฎาคม 2569', 1000)");
  await runAsync(db, "INSERT INTO activities (parent_id, title, description) VALUES (?, 'ถอดบทเรียนและสรุปผลผู้เรียน', 'มิถุนายน 2569')", [phase3.lastID]);
  await runAsync(db, "INSERT INTO activities (parent_id, title, description) VALUES (?, 'ติดตามและประเมินผล', 'มิถุนายน - กรกฎาคม 2569')", [phase3.lastID]);
  await runAsync(db, "INSERT INTO activities (parent_id, title, description) VALUES (?, 'ประชุมคณะกรรมการ ครั้งที่ 2 และรายงานผล', 'กรกฎาคม 2569')", [phase3.lastID]);
}

module.exports = usePostgres ? createPostgresDatabase() : createSqliteDatabase();
