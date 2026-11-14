#!/usr/bin/env python3
"""
generate_poster.py
Generates the official launch poster for Chiang Rai Citizen School website.
Uses gpt-poster-flow hybrid compositing:
- GPT-generated text-free background
- Ultra-crisp Thai typography (Prompt, Kanit, Sarabun)
- 2x Retina DPI (2160x3840 px) Playwright rendering
"""

import asyncio
import base64
from pathlib import Path
from playwright.async_api import async_playwright

BASE_DIR = Path("/Users/natthaphon/chiangrai-citizen-school-app")
ASSETS_DIR = BASE_DIR / "frontend/public/brand-assets"
OUTPUT_DIR = ASSETS_DIR
ARTIFACT_DIR = Path("/Users/natthaphon/.gemini/antigravity-cli/brain/f6155b44-b3bb-4ea1-8c88-c90c86779be5")

def get_base64_data_uri(file_path: Path) -> str:
    mime = "image/png"
    if file_path.suffix.lower() in [".jpg", ".jpeg"]:
        mime = "image/jpeg"
    with open(file_path, "rb") as f:
        encoded = base64.b64encode(f.read()).decode("utf-8")
    return f"data:{mime};base64,{encoded}"

def build_poster_html() -> str:
    bg_uri = get_base64_data_uri(ASSETS_DIR / "website_launch_poster_bg.jpg")
    logo_uri = get_base64_data_uri(ASSETS_DIR / "LOGO-KPI-CR.png")
    qr_uri = get_base64_data_uri(ASSETS_DIR / "website_qr.png")
    cover_disaster = get_base64_data_uri(ASSETS_DIR / "policy_cover_disaster.png")
    cover_pm25 = get_base64_data_uri(ASSETS_DIR / "policy_cover_pm25.png")
    cover_waste = get_base64_data_uri(ASSETS_DIR / "policy_cover_waste.png")

    html = f"""<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Prompt:wght@300;400;500;600;700;800&family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      width: 1080px;
      height: 1920px;
      overflow: hidden;
      font-family: 'Prompt', sans-serif;
      background-color: #06140E;
    }}
    .poster-bg {{
      background-image: url('{bg_uri}');
      background-size: cover;
      background-position: center top;
    }}
    .text-glow-gold {{
      text-shadow: 0 0 25px rgba(245, 158, 11, 0.45), 0 2px 10px rgba(0, 0, 0, 0.9);
    }}
    .text-glow-white {{
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.95), 0 1px 4px rgba(0, 0, 0, 0.9);
    }}
    .gold-gradient-text {{
      background: linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #D97706 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }}
    .card-glass {{
      background: rgba(8, 28, 20, 0.82);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(245, 158, 11, 0.25);
    }}
  </style>
</head>
<body class="relative flex flex-col justify-between poster-bg">
  <!-- Atmospheric Scrim Gradients for Maximum Typography Contrast -->
  <div class="absolute inset-0 bg-gradient-to-b from-[#04100B]/90 via-[#04100B]/40 to-[#04100B]/95 pointer-events-none z-0"></div>

  <!-- Content Container -->
  <div class="relative z-10 flex flex-col justify-between h-full p-12">

    <!-- 1. HEADER ZONE -->
    <header class="flex flex-col items-center text-center">
      <!-- Top Pill & Partners -->
      <div class="flex items-center gap-4 bg-emerald-950/90 border border-amber-400/40 rounded-full px-6 py-2.5 shadow-2xl backdrop-blur-md">
        <div class="w-10 h-10 rounded-full bg-white p-1 shadow-md flex items-center justify-center shrink-0">
          <img src="{logo_uri}" alt="KPI Logo" class="w-full h-full object-contain" />
        </div>
        <div class="flex items-center gap-2 text-amber-300 font-semibold text-lg tracking-wide">
          <span>สถาบันพระปกเกล้า</span>
          <span class="text-amber-500/60">•</span>
          <span class="text-emerald-100">มรภ.เชียงราย (CLLI)</span>
          <span class="text-amber-500/60">•</span>
          <span class="text-emerald-100">ทต.บ้านดู่</span>
        </div>
      </div>

      <!-- Launch Badge -->
      <div class="mt-5 inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-base font-extrabold tracking-wider uppercase shadow-xl">
        <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.789l1.599.799L9 4.323V3a1 1 0 011-1z"/></svg>
        <span>OFFICIAL WEBSITE LAUNCH • เปิดตัวเว็บไซต์ใหม่</span>
      </div>

      <!-- Main Headline -->
      <h1 class="mt-4 text-5xl font-black text-white leading-tight tracking-tight text-glow-white" style="font-family: 'Prompt', 'Kanit', sans-serif;">
        โรงเรียนพลเมือง สถาบันพระปกเกล้า
      </h1>
      <div class="text-6xl font-black gold-gradient-text tracking-tight mt-1 text-glow-gold" style="font-family: 'Prompt', 'Kanit', sans-serif;">
        จังหวัดเชียงราย
      </div>

      <!-- Subheadline -->
      <p class="mt-3 text-2xl font-medium text-emerald-100/90 max-w-3xl leading-relaxed" style="font-family: 'Sarabun', 'Prompt', sans-serif;">
        แพลตฟอร์มการจัดการศึกษาพลเมืองและห้องปฏิบัติการนโยบายสาธารณะท้องถิ่น
      </p>
    </header>

    <!-- 2. MIDDLE SHOWCASE ZONE (3 KEY PILLARS) -->
    <main class="grid grid-cols-1 gap-4 my-auto">
      
      <!-- Card 1: นวัตกรพลเมือง รุ่นที่ 6 -->
      <div class="card-glass rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        <div class="flex items-start gap-4">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center font-black text-2xl shrink-0 shadow-lg">
            🎓
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-bold text-amber-300">ทำเนียบนวัตกรพลเมือง รุ่นที่ 6</h2>
              <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">สะสมหน่วยกิต 100%</span>
            </div>
            <p class="text-lg text-emerald-50/90 mt-1 leading-snug" style="font-family: 'Sarabun', sans-serif;">
              ผู้นำท้องถิ่นตำบลบ้านดู่ <span class="font-bold text-amber-300">40 ท่าน</span> ผ่านการอบรมเข้มข้น 30 ชม. เทียบโอนสะสมหน่วยกิตปริญญาตรี/โท ธรรมาภิบาลและการพัฒนาท้องถิ่น (CLLI มรภ.เชียงราย)
            </p>
            <div class="mt-2.5 flex items-center gap-2 text-sm text-amber-200/90 font-medium bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-500/20">
              <svg class="w-4 h-4 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
              <span>ระบบตรวจสอบวุฒิบัตรดิจิทัลรายบุคคล (Digital Certificate Verification) ป้องกันการปลอมแปลง</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 2: 3 ร่างข้อเสนอนโยบายสาธารณะฉบับสมบูรณ์ -->
      <div class="card-glass rounded-3xl p-5 shadow-2xl relative overflow-hidden border-amber-400/40">
        <div class="flex items-start gap-4">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-lg">
            📜
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-bold text-amber-300">3 ร่างข้อเสนอนโยบายสาธารณะท้องถิ่นตำบลบ้านดู่</h2>
              <span class="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-semibold">ฉบับสมบูรณ์ (Full PDF)</span>
            </div>
            
            <!-- 3 Mini Policies with Covers -->
            <div class="grid grid-cols-3 gap-3 mt-3">
              <!-- Policy 1 -->
              <div class="bg-emerald-950/60 p-2.5 rounded-2xl border border-emerald-500/30 flex flex-col items-center text-center">
                <img src="{cover_disaster}" alt="Policy 1" class="w-14 h-18 object-cover rounded shadow-md border border-amber-300/30 mb-1.5" />
                <div class="text-xs font-bold text-white line-clamp-1">1. น้ำท่วม & ดินถล่ม</div>
                <div class="text-[11px] text-amber-300 font-semibold">เตือนภัยล่วงหน้า 3.58 ลบ.</div>
              </div>
              <!-- Policy 2 -->
              <div class="bg-emerald-950/60 p-2.5 rounded-2xl border border-emerald-500/30 flex flex-col items-center text-center">
                <img src="{cover_pm25}" alt="Policy 2" class="w-14 h-18 object-cover rounded shadow-md border border-amber-300/30 mb-1.5" />
                <div class="text-xs font-bold text-white line-clamp-1">2. อากาศสะอาด PM 2.5</div>
                <div class="text-[11px] text-amber-300 font-semibold">ธนาคารชีวมวล 6.5 แสน บ.</div>
              </div>
              <!-- Policy 3 -->
              <div class="bg-emerald-950/60 p-2.5 rounded-2xl border border-emerald-500/30 flex flex-col items-center text-center">
                <img src="{cover_waste}" alt="Policy 3" class="w-14 h-18 object-cover rounded shadow-md border border-amber-300/30 mb-1.5" />
                <div class="text-xs font-bold text-white line-clamp-1">3. จัดการขยะครบวงจร</div>
                <div class="text-[11px] text-amber-300 font-semibold">ขยะทองคำ 1 ลบ./หมู่บ้าน</div>
              </div>
            </div>

            <div class="mt-2.5 flex items-center justify-between text-xs text-emerald-200 bg-emerald-950/70 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              <span class="flex items-center gap-1.5">
                <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                ดาวน์โหลดรูปเล่มเอกสารฉบับเต็มโดยตรง ปลอดภัย ไม่ผ่าน shorturl
              </span>
              <span class="text-amber-300 font-bold">25 - 32 หน้า/เล่ม</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 3: ธรรมาภิบาล ความโปร่งใส & คลังเอกสาร -->
      <div class="card-glass rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        <div class="flex items-start gap-4">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-700 text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-lg">
            🏛️
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-bold text-amber-300">คลังเอกสารทางการ & ความโปร่งใส</h2>
              <span class="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">Public Open Data</span>
            </div>
            <p class="text-lg text-emerald-50/90 mt-1 leading-snug" style="font-family: 'Sarabun', sans-serif;">
              รวมคำสั่งแต่งตั้งคณะกรรมการ, บันทึกข้อตกลงความร่วมมือ (MOU), และรายงานผลการดำเนินงานโครงการฉบับสมบูรณ์ (KPI Final Report) เปิดเผยโปร่งใส ตรวจสอบได้
            </p>
            <div class="mt-2.5 flex items-center gap-2 text-sm text-emerald-300 font-medium">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Citizen Policy Lab: พื้นที่เชื่อมโยงเสียงของประชาชนสู่นโยบายท้องถิ่นที่เป็นจริง</span>
            </div>
          </div>
        </div>
      </div>

    </main>

    <!-- 3. FOOTER / CALL TO ACTION ZONE -->
    <footer class="mt-auto">
      <div class="rounded-3xl p-6 bg-gradient-to-r from-stone-950/95 via-emerald-950/95 to-stone-950/95 border-2 border-amber-400 shadow-2xl flex items-center justify-between gap-6 backdrop-blur-xl">
        
        <!-- Left: URL & Text -->
        <div class="flex-1">
          <div class="flex items-center gap-2 text-amber-400 font-semibold text-lg uppercase tracking-wider">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
            <span>เยี่ยมชมเว็บไซต์ได้แล้ววันนี้</span>
          </div>
          <div class="text-4xl font-black text-white tracking-tight mt-1" style="font-family: 'Plus Jakarta Sans', sans-serif;">
            www.chiangraicitizenschool.org
          </div>
          <p class="text-base text-emerald-200/90 mt-1" style="font-family: 'Sarabun', sans-serif;">
            เข้าถึงได้จากทุกอุปกรณ์ ทั้งมือถือ แท็บเล็ต และคอมพิวเตอร์ (Responsive & Mobile-First)
          </p>
          <div class="mt-3 flex items-center gap-2 text-xs text-amber-300/80">
            <span>ศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จังหวัดเชียงราย</span>
          </div>
        </div>

        <!-- Right: High Resolution QR Code -->
        <div class="bg-white p-3 rounded-2xl shadow-2xl flex flex-col items-center shrink-0 border-2 border-amber-400">
          <img src="{qr_uri}" alt="Website QR Code" class="w-28 h-28 object-contain" />
          <span class="mt-1 text-[11px] font-bold text-stone-900 tracking-wider">สแกนเข้าเว็บไซต์</span>
        </div>

      </div>
    </footer>

  </div>
</body>
</html>
"""
    return html

async def main():
    html_content = build_poster_html()
    html_path = OUTPUT_DIR / "website_launch_poster.html"
    png_path = OUTPUT_DIR / "website_launch_poster.png"
    artifact_png = ARTIFACT_DIR / "website_launch_poster.png"

    html_path.write_text(html_content, encoding="utf-8")
    print(f"[OK] Wrote poster HTML to {html_path}")

    print("[INFO] Rendering poster via Playwright at 2x Retina scale (2160x3840)...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1080, "height": 1920},
            device_scale_factor=2,
        )
        page = await context.new_page()
        await page.goto(html_path.resolve().as_uri(), wait_until="networkidle")
        await page.evaluate("() => document.fonts.ready")
        await asyncio.sleep(1.0)

        # Screenshot PNG
        await page.screenshot(path=str(png_path), type="png", full_page=False)
        print(f"[SUCCESS] Saved high-res poster to {png_path}")

        # Also copy to artifact dir for instant user viewing
        await page.screenshot(path=str(artifact_png), type="png", full_page=False)
        print(f"[SUCCESS] Saved artifact poster to {artifact_png}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
