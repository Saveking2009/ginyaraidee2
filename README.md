# 🌿 GINYARAIDEE — กินยาไรดี

> เพื่อนสุขภาพใจดี AI ที่อยู่ข้างคุณทุกวัน

---

## ✨ ฟีเจอร์

- 📊 **Dashboard** — แสดง BMI, BMR, วงแหวนแคลวันนี้
- 📸 **ถ่ายอาหาร** — AI วิเคราะห์แคล/โปรตีน/คาร์บ/ไขมันจากรูปจริง
- 💊 **ตู้ยา** — เพิ่มยา AI ดึงข้อมูลสรรพคุณให้ทันที
- 💬 **น้องไกด์** — แชท AI ที่ใจดี รู้ข้อมูลสุขภาพและสิ่งที่แพ้ของคุณ
- 🧠 **เช็คใจ** — คัดกรองสุขภาพจิตเบื้องต้น
- 🎯 **ภารกิจประจำวัน** — บันทึกสุขภาพจริงเพื่อรับแต้ม + streak 🔥
- 🐑 **น้องแกะมาสคอต** — ตั้งชื่อ เปลี่ยนสีขน ใส่ของประดับ ปลดล็อกด้วยแต้มภารกิจ
- 🔒 **Privacy Toggles** — เลือกซ่อน/แสดงข้อมูลส่วนตัวได้
- 📱 **PWA** — ติดตั้งบนมือถือได้เหมือนแอปจริง

---

## 🚀 Setup (ทำครั้งแรกครั้งเดียว)

### สิ่งที่ต้องมี

| เครื่องมือ | ดาวน์โหลด |
|-----------|-----------|
| Node.js 18+ | https://nodejs.org |
| Git | https://git-scm.com |
| Vercel CLI | `npm i -g vercel` |
| Anthropic API Key | https://console.anthropic.com/keys |

---

### 1. Clone โปรเจกต์

```bash
git clone https://github.com/YOUR_USERNAME/ginyaraidee.git
cd ginyaraidee
```

### 2. ติดตั้ง dependencies

```bash
npm install
```

### 3. ตั้งค่า API Key

```bash
cp .env.example .env.local
```

แล้วแก้ไฟล์ `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx   ← ใส่ key จริงของคุณ
```

### 4. รันในเครื่อง

```bash
# วิธีที่ 1: ใช้ Vercel CLI (แนะนำ — API proxy ทำงานด้วย)
vercel dev

# วิธีที่ 2: แค่ frontend (ถ้ายังไม่ติดตั้ง vercel)
npm run dev
```

เปิด http://localhost:5173 ในเบราว์เซอร์

---

## 📱 ทดสอบบนมือถือ (Local Network)

1. รัน `npm run dev` หรือ `vercel dev`
2. terminal จะบอก IP เช่น `Network: http://192.168.1.10:5173`
3. เปิดมือถือ (Wi-Fi เดียวกัน) → พิมพ์ URL นั้น
4. Safari/Chrome → กด **Share → Add to Home Screen** 🎉

---

## ☁️ Deploy ขึ้น Vercel (ฟรี!)

### ครั้งแรก (เชื่อม GitHub → Vercel)

```bash
vercel
```
ทำตาม prompt → เลือก "Link to GitHub repository" → เสร็จ!

### ตั้งค่า API Key บน Vercel

1. ไปที่ https://vercel.com/dashboard
2. เลือกโปรเจกต์ **ginyaraidee**
3. ไป **Settings → Environment Variables**
4. เพิ่ม:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-xxxxxx` (key จริงของคุณ)
   - **Environment:** Production + Preview + Development ✅

### (ทางเลือก) เปิดคลังความจำส่วนกลาง 🌍

ฟีเจอร์ "รวมการแก้แคลของผู้ใช้ทุกคน" ต้องมี Redis ฟรีจาก Upstash:

1. ใน Vercel Dashboard → โปรเจกต์ → แท็บ **Storage** → **Create Database** → เลือก **Upstash (Redis)** → Free plan
2. กด **Connect** เข้ากับโปรเจกต์ — Vercel จะใส่ env `KV_REST_API_URL` และ `KV_REST_API_TOKEN` ให้อัตโนมัติ
3. Redeploy 1 ครั้ง — เสร็จ!

ถ้ายังไม่ตั้งค่า แอปทำงานปกติทุกอย่าง (แค่ไม่มีข้อมูลรวมจากผู้ใช้คนอื่น)

### Deploy ครั้งต่อไป

```bash
# แค่ push ขึ้น GitHub → Vercel build ให้อัตโนมัติ!
git add .
git commit -m "update"
git push
```

---

## 📂 โครงสร้างโปรเจกต์

```
ginyaraidee/
├── api/
│   └── claude.js          ← Vercel serverless proxy (เก็บ API key ไว้ที่นี่)
├── public/
│   ├── manifest.json      ← PWA manifest
│   ├── sw.js              ← Service worker (offline support)
│   ├── icon.svg
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   ├── main.jsx           ← Entry point + SW registration + ErrorBoundary
│   ├── App.jsx            ← Root: state กลาง + persist + สลับหน้า
│   ├── theme.js           ← สีและ CSS กลาง
│   ├── utils.js           ← ฟังก์ชันคำนวณ / localStorage / streak
│   ├── api.js             ← เรียก Claude ผ่าน /api/claude (เช็ค error + timeout)
│   ├── data/
│   │   ├── foodDict.js    ← ฐานข้อมูลแคลอาหารไทย
│   │   └── personalities.js ← บุคลิก AI
│   ├── components/        ← หน้าจอละไฟล์
│   │   ├── Dashboard.jsx  ├── FoodLog.jsx  ├── HealthHub.jsx
│   │   ├── ChatScreen.jsx ├── MedicineCabinet.jsx ├── MentalHealth.jsx
│   │   ├── Profile.jsx    ├── DailyTasks.jsx (ภารกิจ 🎯) ├── Mascot.jsx (น้องแกะ 🐑)
│   │   ├── PrintModal.jsx ├── Onboarding.jsx ├── Nav.jsx └── LogoMark.jsx
│   └── index.css          ← Tailwind base styles
├── .env.example           ← ตัวอย่าง env (commit ได้)
├── .env.local             ← key จริง (ห้าม commit!)
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── vercel.json
```

---

## 🔐 ความปลอดภัย

- **API Key ไม่เคยถูก expose ให้ browser** — ทุก request วิ่งผ่าน `/api/claude` (Vercel serverless)
- **ข้อมูลผู้ใช้** เก็บใน localStorage บน device เท่านั้น ไม่มี backend เก็บ

---

## ⚠️ ข้อความสำคัญ

แอปนี้ให้คำแนะนำสุขภาพเบื้องต้นเท่านั้น **ไม่ใช่การวินิจฉัยทางการแพทย์**  
หากมีอาการรุนแรงหรือสงสัย กรุณาพบแพทย์

สายด่วนสุขภาพจิต: **1323**  
สายด่วนฉุกเฉินการแพทย์: **1669**

---

Made with 🌿 by GINYARAIDEE
