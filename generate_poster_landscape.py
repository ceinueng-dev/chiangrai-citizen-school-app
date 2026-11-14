#!/usr/bin/env python3
"""
generate_poster_landscape.py - Maximum Readability & Zero Wasted Space Edition:
- Extra-large typography: titles, body text, badges, and numbers significantly enlarged for maximum readability
- Tight, balanced grid filling 100% of the 1536x1024 canvas with no awkward gaps
- 2x Retina rendering (3072x2048 px)
"""

import asyncio
import base64
from pathlib import Path
from playwright.async_api import async_playwright

BASE_DIR = Path("/Users/natthaphon/chiangrai-citizen-school-app")
ASSETS_DIR = BASE_DIR / "frontend/public/brand-assets"
ARTIFACT_DIR = Path("/Users/natthaphon/.gemini/antigravity-cli/brain/f6155b44-b3bb-4ea1-8c88-c90c86779be5")

def get_base64_data_uri(file_path: Path) -> str:
    mime = "image/png"
    if file_path.suffix.lower() in [".jpg", ".jpeg"]:
        mime = "image/jpeg"
    with open(file_path, "rb") as f:
        encoded = base64.b64encode(f.read()).decode("utf-8")
    return f"data:{mime};base64,{encoded}"

def build_landscape_html() -> str:
    bg_uri = get_base64_data_uri(ASSETS_DIR / "website_launch_poster_landscape_bg.jpg")
    kpi_logo_uri = get_base64_data_uri(ASSETS_DIR / "KPI-LOGO-optimized.png")
    anongsri_uri = get_base64_data_uri(ASSETS_DIR / "anongsri.jpg")
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
  <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Prompt:wght@400;500;600;700;800;900&family=Sarabun:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      width: 1536px;
      height: 1024px;
      overflow: hidden;
      font-family: 'Prompt', sans-serif;
      background-color: #04100B;
    }}
    .poster-bg {{
      background-image: url('{bg_uri}');
      background-size: cover;
      background-position: center;
    }}
    .gold-gradient-text {{
      background: linear-gradient(135deg, #FFFDF0 0%, #FDE68A 25%, #F59E0B 70%, #D97706 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }}
    .text-glow-gold {{
      filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.55));
    }}
    .text-glow-white {{
      text-shadow: 0 2px 14px rgba(0, 0, 0, 0.95);
    }}
    .card-glass {{
      background: rgba(5, 22, 15, 0.90);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1.5px solid rgba(245, 158, 11, 0.38);
    }}
    .card-inner {{
      background: rgba(3, 16, 11, 0.80);
      border: 1px solid rgba(52, 211, 153, 0.3);
    }}
  </style>
</head>
<body class="relative flex flex-col justify-between poster-bg p-6">
  <!-- Atmospheric Scrim Gradients -->
  <div class="absolute inset-0 bg-gradient-to-b from-[#020A07]/92 via-[#020A07]/60 to-[#020A07]/95 pointer-events-none z-0"></div>

  <!-- Content Container -->
  <div class="relative z-10 flex flex-col justify-between h-full">

    <!-- 1. HEADER ZONE (Height ~ 130px) -->
    <header class="flex items-center justify-between pb-3 border-b-2 border-amber-400/35">
      
      <!-- Left: KPI Official Logo & Institute Name -->
      <div class="flex items-center gap-4 shrink-0">
        <div class="h-24 w-auto flex items-center justify-center p-1.5 bg-emerald-950/70 rounded-2xl border-1.5 border-amber-400/50 shadow-xl">
          <img src="{kpi_logo_uri}" alt="KPI Logo" class="h-full w-auto object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]" />
        </div>
        <div class="text-left">
          <div class="text-xs uppercase tracking-widest text-amber-300 font-extrabold">King Prajadhipok's Institute</div>
          <div class="text-2xl font-black text-white tracking-wide leading-tight">สถาบันพระปกเกล้า</div>
          <div class="text-sm text-emerald-200 font-bold">ศูนย์พัฒนาการเมืองภาคพลเมือง จังหวัดเชียงราย</div>
        </div>
      </div>

      <!-- Center: Main Headline & Official Launch Pill -->
      <div class="flex flex-col items-center text-center flex-1 px-4">
        <div class="inline-flex items-center gap-2 px-6 py-1 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 text-xs font-black tracking-widest uppercase shadow-lg mb-1">
          <span>✦ OFFICIAL WEBSITE LAUNCH • เปิดตัวเว็บไซต์ใหม่อย่างเป็นทางการ ✦</span>
        </div>
        <h1 class="text-[40px] font-black gold-gradient-text tracking-tight text-glow-gold leading-tight" style="font-family: 'Prompt', 'Kanit', sans-serif;">
          โรงเรียนพลเมือง สถาบันพระปกเกล้า จังหวัดเชียงราย
        </h1>
        <p class="text-lg font-bold text-emerald-100/95 tracking-wide" style="font-family: 'Sarabun', 'Prompt', sans-serif;">
          แพลตฟอร์มการจัดการศึกษาพลเมืองและห้องปฏิบัติการนโยบายสาธารณะท้องถิ่น (Citizen Policy Lab)
        </p>
      </div>

      <!-- Right: Institutional Partners Badge -->
      <div class="flex items-center gap-3 shrink-0 bg-emerald-950/90 border-1.5 border-amber-400/40 rounded-2xl px-5 py-2.5 shadow-xl">
        <div class="text-right">
          <div class="text-xs text-amber-300 font-extrabold uppercase tracking-wider">ความร่วมมือ 3 สถาบันหลัก</div>
          <div class="text-base text-white font-black">สถาบันพระปกเกล้า (KPI)</div>
          <div class="text-sm text-emerald-200 font-bold">มรภ.เชียงราย (CLLI) • ทต.บ้านดู่</div>
        </div>
      </div>

    </header>

    <!-- 2. MAIN 3-COLUMN CONTENT GRID (Height ~ 795px) -->
    <main class="grid grid-cols-12 gap-4 my-2.5 items-stretch flex-1">
      
      <!-- COLUMN 1 (Left, 3 cols): ท่านประธานศูนย์ & คำขวัญขับเคลื่อน -->
      <div class="col-span-3 card-glass rounded-3xl p-5 shadow-2xl flex flex-col justify-between items-center text-center relative overflow-hidden border-amber-400/40">
        
        <!-- Top Pill Tag -->
        <div class="w-full flex items-center justify-between pb-2 border-b border-amber-400/25 text-xs font-black text-amber-300">
          <span class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            ผู้นำองค์กร & ภาคีเครือข่าย
          </span>
          <span class="px-3 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-400/40 text-xs font-black">รุ่นที่ 6</span>
        </div>

        <!-- Portrait of Dr. Anongsri (Enlarged frame) -->
        <div class="relative my-2">
          <div class="w-52 h-64 rounded-3xl overflow-hidden border-2 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.4)] mx-auto relative">
            <img src="{anongsri_uri}" alt="ดร.อนงค์ศรี สิทธิอาษา" class="w-full h-full object-cover object-top" />
            <div class="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-transparent to-transparent"></div>
          </div>
          <!-- Corner gold accents -->
          <div class="absolute -top-1.5 -left-1.5 w-5 h-5 border-t-2 border-l-2 border-amber-300"></div>
          <div class="absolute -bottom-1.5 -right-1.5 w-5 h-5 border-b-2 border-r-2 border-amber-300"></div>
        </div>

        <!-- Leader Name & Title (Significantly enlarged) -->
        <div class="w-full">
          <h2 class="text-[26px] font-black text-amber-300 leading-tight" style="font-family: 'Prompt', 'Kanit', sans-serif;">
            ดร.อนงค์ศรี สิทธิอาษา
          </h2>
          <div class="text-lg font-black text-white mt-1 leading-snug">
            ประธานศูนย์พัฒนาการเมืองภาคพลเมือง
          </div>
          <div class="text-base text-emerald-200 font-bold mt-0.5">
            สถาบันพระปกเกล้า จังหวัดเชียงราย
          </div>
        </div>

        <!-- Quote Box (Enlarged typography) -->
        <div class="w-full bg-gradient-to-b from-amber-950/70 to-emerald-950/80 border border-amber-500/40 rounded-2xl p-4 shadow-inner text-center">
          <div class="text-base text-amber-200 font-black leading-snug" style="font-family: 'Prompt', sans-serif;">
            "พลเมืองเข้มแข็ง ท้องถิ่นเข้มแข็ง ประเทศชาติแข็งแรง"
          </div>
          <div class="text-sm text-emerald-100 font-semibold mt-1.5 leading-relaxed" style="font-family: 'Sarabun', sans-serif;">
            "ร่วมพัฒนา ร่วมสร้าง ร่วมขับเคลื่อนภาคพลเมือง เพื่อการเปลี่ยนแปลงที่ยั่งยืน"
          </div>
        </div>

        <!-- Bottom Tag -->
        <div class="text-xs text-amber-300/80 font-bold">
          ศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จังหวัดเชียงราย
        </div>

      </div>

      <!-- COLUMN 2 (Center, 6 cols): 3 ร่างนโยบาย & นวัตกรพลเมือง -->
      <div class="col-span-6 flex flex-col justify-between gap-3.5 h-full">
        
        <!-- CARD A (Top): 3 ร่างข้อเสนอนโยบายสาธารณะท้องถิ่นตำบลบ้านดู่ -->
        <div class="card-glass rounded-3xl p-5 shadow-2xl flex-1 flex flex-col justify-between border-amber-400/40">
          <div>
            <!-- Card Header -->
            <div class="flex items-center justify-between pb-2 border-b border-amber-400/25">
              <div class="flex items-center gap-3">
                <span class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center font-black text-xl shadow-md">📜</span>
                <h3 class="text-2xl font-black text-amber-300">3 ร่างข้อเสนอนโยบายสาธารณะท้องถิ่นตำบลบ้านดู่</h3>
              </div>
              <span class="px-3.5 py-1 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 text-xs font-black">ฉบับสมบูรณ์ (Full PDF)</span>
            </div>

            <!-- 3 Policy Booklets Row (Enlarged covers & high-contrast text) -->
            <div class="grid grid-cols-3 gap-3.5 mt-2.5">
              
              <!-- Booklet 1: น้ำท่วม -->
              <div class="card-inner p-3 rounded-2xl flex flex-col items-center text-center shadow-lg">
                <img src="{cover_disaster}" alt="น้ำท่วมและดินถล่ม" class="w-24 h-32 object-cover rounded-lg shadow-xl border border-amber-300/40 mb-2" />
                <div class="text-base font-black text-white line-clamp-1">1. น้ำท่วม & ดินถล่ม</div>
                <div class="text-sm text-amber-300 font-black mt-0.5">เตือนภัย 3.58 ลบ.</div>
                <div class="text-xs text-emerald-200 font-bold mt-0.5">เอกสารฉบับเต็ม 27 หน้า</div>
              </div>

              <!-- Booklet 2: PM 2.5 -->
              <div class="card-inner p-3 rounded-2xl flex flex-col items-center text-center shadow-lg">
                <img src="{cover_pm25}" alt="PM 2.5 อากาศสะอาด" class="w-24 h-32 object-cover rounded-lg shadow-xl border border-amber-300/40 mb-2" />
                <div class="text-base font-black text-white line-clamp-1">2. อากาศสะอาด PM 2.5</div>
                <div class="text-sm text-amber-300 font-black mt-0.5">ชีวมวล Biochar 6.5 แสน บ.</div>
                <div class="text-xs text-emerald-200 font-bold mt-0.5">เอกสารฉบับเต็ม 32 หน้า</div>
              </div>

              <!-- Booklet 3: ขยะทองคำ -->
              <div class="card-inner p-3 rounded-2xl flex flex-col items-center text-center shadow-lg">
                <img src="{cover_waste}" alt="จัดการขยะครบวงจร" class="w-24 h-32 object-cover rounded-lg shadow-xl border border-amber-300/40 mb-2" />
                <div class="text-base font-black text-white line-clamp-1">3. จัดการขยะครบวงจร</div>
                <div class="text-sm text-amber-300 font-black mt-0.5">ขยะทองคำ 1 ลบ./หมู่บ้าน</div>
                <div class="text-xs text-emerald-200 font-bold mt-0.5">เอกสารฉบับเต็ม 25 หน้า</div>
              </div>

            </div>
          </div>

          <!-- Direct Download Guarantee (Zero ShortURL) -->
          <div class="mt-2.5 flex items-center justify-between text-base text-emerald-100 bg-emerald-950/95 px-4 py-2.5 rounded-xl border border-emerald-500/40 shadow-inner">
            <span class="flex items-center gap-2.5 font-bold">
              <svg class="w-6 h-6 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
              <span>ดาวน์โหลดรูปเล่มเอกสารฉบับเต็มโดยตรง ปลอดภัย ไม่ผ่าน shorturl</span>
            </span>
            <span class="text-amber-300 font-black text-xs bg-amber-950/80 px-3 py-1.5 rounded-lg border border-amber-500/30">ดาวน์โหลดฟรี 100%</span>
          </div>

        </div>

        <!-- CARD B (Bottom): ทำเนียบนวัตกรพลเมือง รุ่นที่ 6 & คลังเอกสารราชการ -->
        <div class="card-glass rounded-3xl p-5 shadow-2xl flex-1 flex flex-col justify-between border-amber-400/40">
          <div>
            <!-- Card Header -->
            <div class="flex items-center justify-between pb-2 border-b border-amber-400/25">
              <div class="flex items-center gap-3">
                <span class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-700 text-white flex items-center justify-center font-black text-xl shadow-md">🎓</span>
                <h3 class="text-2xl font-black text-amber-300">ทำเนียบนวัตกรพลเมือง รุ่นที่ 6 & คลังเอกสารราชการ</h3>
              </div>
              <span class="px-3.5 py-1 rounded-full bg-blue-500/25 text-blue-300 border border-blue-400/40 text-xs font-black">40 นวัตกรตำบลบ้านดู่</span>
            </div>

            <!-- 2 Feature Panels (Enlarged fonts) -->
            <div class="grid grid-cols-2 gap-3.5 mt-2.5">
              <div class="card-inner p-4 rounded-2xl flex items-start gap-3.5">
                <span class="text-amber-400 text-3xl shrink-0">🏛️</span>
                <div>
                  <div class="text-lg font-black text-white">สะสมหน่วยกิต CLLI 100%</div>
                  <div class="text-sm text-emerald-100 font-medium leading-relaxed mt-1" style="font-family: 'Sarabun', sans-serif;">
                    ผู้นำชุมชน 40 ท่าน อบรมเข้มข้น 30 ชม. เทียบโอนสะสมหน่วยกิต ป.ตรี/ป.โท ธรรมาภิบาลและการพัฒนาท้องถิ่น มรภ.เชียงราย
                  </div>
                </div>
              </div>

              <div class="card-inner p-4 rounded-2xl flex items-start gap-3.5">
                <span class="text-emerald-400 text-3xl shrink-0">🔍</span>
                <div>
                  <div class="text-lg font-black text-white">ตรวจสอบวุฒิบัตรดิจิทัล</div>
                  <div class="text-sm text-emerald-100 font-medium leading-relaxed mt-1" style="font-family: 'Sarabun', sans-serif;">
                    ระบบสืบค้นและตรวจสอบวุฒิบัตรดิจิทัลรายบุคคล ป้องกันการปลอมแปลง ตรวจสอบสถานะการจบหลักสูตรได้ทันทีแบบเรียลไทม์
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Documents Banner -->
          <div class="mt-2.5 flex items-center justify-between text-sm text-amber-200/95 bg-amber-950/60 px-4 py-2 rounded-xl border border-amber-500/30">
            <span class="flex items-center gap-2 font-bold">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
              <span>คลังคำสั่งแต่งตั้ง • บันทึกข้อตกลงความร่วมมือ (MOU) • รายงานสรุปผลโครงการ (KPI Final Report)</span>
            </span>
            <span class="text-emerald-300 font-black text-xs">Public Open Data</span>
          </div>

        </div>

      </div>

      <!-- COLUMN 3 (Right, 3 cols): ทางเข้าสู่เว็บไซต์ & QR Code -->
      <div class="col-span-3 card-glass rounded-3xl p-5 shadow-2xl flex flex-col justify-between items-center text-center relative overflow-hidden border-amber-400/50">
        
        <!-- Header Pill -->
        <div class="w-full pb-2 border-b border-amber-400/25 text-center">
          <div class="inline-flex items-center gap-2 text-sm text-amber-300 font-black uppercase tracking-wider">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
            <span>เยี่ยมชมเว็บไซต์ทางการ</span>
          </div>
        </div>

        <!-- Domain URL Big Callout -->
        <div class="w-full my-auto">
          <div class="text-xs text-emerald-200 font-semibold mb-1">ช่องทางเข้าใช้งานหลักของโรงเรียนพลเมือง</div>
          <div class="text-xl font-black text-white bg-emerald-950 py-2.5 px-3 rounded-2xl border-2 border-amber-400/60 shadow-xl font-mono tracking-tight break-all text-glow-white">
            www.chiangraicitizenschool.org
          </div>

          <!-- Big High-Resolution QR Code -->
          <div class="bg-white p-4 rounded-3xl border-2 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.35)] inline-block mt-3">
            <img src="{qr_uri}" alt="Website QR Code" class="w-44 h-44 object-contain mx-auto" />
            <div class="mt-2 text-base font-black text-stone-950 tracking-wider">สแกน QR Code เข้าสู่เว็บไซต์</div>
          </div>
        </div>

        <!-- Features Checklist (Enlarged fonts) -->
        <div class="w-full bg-emerald-950/90 rounded-2xl p-3.5 border border-emerald-500/35 text-left mt-2 space-y-2">
          <div class="flex items-center gap-2 text-sm font-bold text-emerald-100">
            <span class="text-amber-400 font-black text-base">✓</span>
            <span>Responsive เข้าถึงได้ทั้งมือถือและแท็บเล็ต</span>
          </div>
          <div class="flex items-center gap-2 text-sm font-bold text-emerald-100">
            <span class="text-amber-400 font-black text-base">✓</span>
            <span>ดาวน์โหลดเอกสารนโยบายสาธารณะฉบับเต็ม</span>
          </div>
          <div class="flex items-center gap-2 text-sm font-bold text-emerald-100">
            <span class="text-amber-400 font-black text-base">✓</span>
            <span>ตรวจสอบวุฒิบัตรดิจิทัลนวัตกรพลเมือง 40 ท่าน</span>
          </div>
        </div>

      </div>

    </main>

    <!-- 3. BOTTOM FOOTER BAR (Height ~ 35px) -->
    <footer class="pt-2 border-t border-amber-400/25 flex items-center justify-between text-sm text-emerald-200/90">
      <div class="font-bold">
        <span class="text-amber-300">ศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จังหวัดเชียงราย</span>
        <span class="mx-2 text-amber-400/60">•</span>
        <span>มหาวิทยาลัยราชภัฏเชียงราย (CLLI)</span>
        <span class="mx-2 text-amber-400/60">•</span>
        <span>เทศบาลตำบลบ้านดู่</span>
      </div>
      <div class="text-amber-300 font-black italic tracking-wide">
        "พลเมืองเข้มแข็ง ท้องถิ่นเข้มแข็ง ประเทศชาติแข็งแรง"
      </div>
    </footer>

  </div>
</body>
</html>
"""
    return html

async def main():
    html_content = build_landscape_html()
    html_path = ASSETS_DIR / "website_launch_poster.html"
    png_path = ASSETS_DIR / "website_launch_poster.png"
    pdf_path = ASSETS_DIR / "website_launch_poster.pdf"
    artifact_png = ARTIFACT_DIR / "website_launch_poster.png"
    artifact_pdf = ARTIFACT_DIR / "website_launch_poster.pdf"

    html_path.write_text(html_content, encoding="utf-8")
    print(f"[OK] Wrote landscape poster HTML to {html_path}")

    print("[INFO] Rendering landscape poster via Playwright at 2x Retina scale (3072x2048)...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1536, "height": 1024},
            device_scale_factor=2,
        )
        page = await context.new_page()
        await page.goto(html_path.resolve().as_uri(), wait_until="networkidle")
        await page.evaluate("() => document.fonts.ready")
        await asyncio.sleep(1.0)

        # PNG Screenshot (2x scale = 3072x2048)
        await page.screenshot(path=str(png_path), type="png", full_page=False)
        print(f"[SUCCESS] Saved high-res poster PNG to {png_path}")

        # PDF Export
        await page.pdf(path=str(pdf_path), width="1536px", height="1024px", print_background=True)
        print(f"[SUCCESS] Saved vector poster PDF to {pdf_path}")

        # Artifact copies
        await page.screenshot(path=str(artifact_png), type="png", full_page=False)
        await page.pdf(path=str(artifact_pdf), width="1536px", height="1024px", print_background=True)
        print(f"[SUCCESS] Saved artifact copies")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
