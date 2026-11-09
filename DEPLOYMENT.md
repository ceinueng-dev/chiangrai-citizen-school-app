# คู่มือการ Deploy โรงเรียนพลเมืองเชียงราย (Zero-Cost Deployment Guide)

ระบบนี้ถูกออกแบบให้สามารถออนไลน์ได้บนคลาวด์มาตรฐานระดับโลก **โดยไม่มีค่าใช้จ่ายรายเดือน ($0 / เดือนตลอดชีพ)** ผ่าน 3 บริการฟรี:

| ส่วนประกอบ | ผู้ให้บริการ | แพลน | หน้าที่ |
| :--- | :--- | :--- | :--- |
| **Frontend** | [Vercel](https://vercel.com) | Hobby (Free) | React Vite SPA + Global Edge CDN โหลดไวพิเศษ |
| **Backend API** | [Render](https://render.com) | Free Web Service | Node.js Express 5.x API (Singapore Region) |
| **Database** | [Supabase](https://supabase.com) | Free Tier | PostgreSQL Database (พร้อม Auto-Seed ในตัว) |

---

## 📋 ขั้นตอนการ Deploy ทั้งหมด (ใช้เวลาประมาณ 5 นาที)

### ขั้นตอนที่ 1: เตรียมฐานข้อมูลบน Supabase (ใช้เวลา 1-2 นาที)
1. สมัคร/ล็อกอินที่ [supabase.com](https://supabase.com) ด้วยบัญชี GitHub
2. กด **New Project** 
   * **Name:** `chiangrai-citizen-school`
   * **Database Password:** ตั้งรหัสผ่านที่ปลอดภัย (จำรหัสผ่านนี้ไว้)
   * **Region:** เลือก `Singapore` (ใกล้ไทย โหลดเร็วที่สุด)
3. เมื่อสร้างเสร็จ ไปที่เมนู **Project Settings** (ไอคอนฟันเฟืองล่างซ้าย) $\rightarrow$ **Database**
4. เลื่อนลงมาที่หัวข้อ **Connection string** $\rightarrow$ เลือกแท็บ **URI**
5. ก๊อปปี้ค่า Connection string มาเก็บไว้ (นำรหัสผ่านที่คุณตั้งไว้แทนที่ตรง `[YOUR-PASSWORD]`)
   > ตัวอย่าง: `postgresql://postgres:MyPassword123@db.abcdefgh.supabase.co:5432/postgres`

*(หมายเหตุ: โค้ด backend มีระบบ Auto-Seed ในตัว เมื่อเชื่อมต่อครั้งแรก ระบบจะสร้างตารางและลงข้อมูลเริ่มต้นโครงการให้อัตโนมัติทันที ไม่ต้องรันสคริปต์ SQL เอง)*

---

### ขั้นตอนที่ 2: Deploy Backend API ขึ้น Render.com (ใช้เวลา 2 นาที)
1. สมัคร/ล็อกอินที่ [render.com](https://render.com) ด้วยบัญชี GitHub
2. กดปุ่ม **New +** ที่มุมขวาบน $\rightarrow$ เลือก **Blueprint** หรือ **Web Service**
   * *วิธีที่ง่ายที่สุด (Blueprint):* เลือกเชื่อมต่อกับ Repository `chiangrai-citizen-school-app` Render จะอ่านไฟล์ `render.yaml` ที่เตรียมไว้ให้อัตโนมัติ!
   * *หรือสร้างแบบ Web Service ปกติ:*
     * **Repository:** เลือก `chiangrai-citizen-school-app`
     * **Root Directory:** `backend`
     * **Runtime:** Node
     * **Build Command:** `npm install`
     * **Start Command:** `node server.js`
     * **Instance Type:** Free
3. ในส่วน **Environment Variables** เพิ่มค่า:
   * `DATABASE_URL` = (วางค่า Connection string จาก Supabase ที่ได้จากขั้นตอนที่ 1)
   * `PORT` = `5001`
4. กด **Create Web Service**
5. รอระบบ Build ประมาณ 1-2 นาที เมื่อเสร็จจะได้ URL ของ API เช่น:  
   `https://chiangrai-citizen-school-api.onrender.com` (ก๊อปปี้ URL นี้ไว้)

---

### ขั้นตอนที่ 3: Deploy Frontend ขึ้น Vercel (ใช้เวลา 1 นาที)
1. สมัคร/ล็อกอินที่ [vercel.com](https://vercel.com) ด้วยบัญชี GitHub
2. กดปุ่ม **Add New...** $\rightarrow$ **Project**
3. เลือก Import จาก Repository: **`chiangrai-citizen-school-app`**
4. ตั้งค่าโปรเจกต์:
   * **Framework Preset:** `Vite`
   * **Root Directory:** กด Edit แล้วเลือกโฟลเดอร์ **`frontend`**
5. ในส่วน **Environment Variables** เพิ่มตัวแปร:
   * `VITE_API_ORIGIN` = `https://chiangrai-citizen-school-api.onrender.com` (URL Backend จากขั้นตอนที่ 2)
6. กดปุ่ม **Deploy**
7. รอประมาณ 30-40 วินาที ระบบจะสร้างโดเมนให้อัตโนมัติ เช่น:  
   `https://chiangrai-citizen-school.vercel.app`

---

## 🔑 ข้อมูลบัญชีผู้ดูแลระบบเริ่มต้น (Default Super Admin)
หลังจาก Deploy สำเร็จ ระบบจะมีบัญชีเริ่มต้นสร้างไว้ให้อัตโนมัติ:
* **Username / Email:** `natthaphon.san@crru.ac.th`
* **Default Password:** `ChangeMe123!`  
*(แนะนำให้เข้าสู่ระบบแล้วเปลี่ยนรหัสผ่านในระบบทันที)*
