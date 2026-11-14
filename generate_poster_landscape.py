#!/usr/bin/env python3
"""
generate_poster_landscape.py
Generates the updated official website launch poster in landscape format (1536x1024),
matching the dimensions and aesthetic of 'ขอบคุณสถาบันพระปกเกล้า.png'.
Includes:
- Official KPI transparent logo: KPI-LOGO-PNG-01.png
- Center President portrait: anongsri.jpg (ดร.อนงค์ศรี สิทธิอาษา)
- 3 Full Policy proposals with covers
- Digital Certificate verification & Cohort 6 alumni
- Direct QR Code to www.chiangraicitizenschool.org
- 2x Retina DPI rendering (3072x2048 px)
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
  <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Prompt:wght@300;400;500;600;700;800&family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
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
      background: linear-gradient(135deg, #FFFBEB 0%, #FDE68A 30%, #F59E0B 70%, #D97706 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }}
    .text-glow-gold {{
      filter: drop-shadow(0 0 16px rgba(245, 158, 11, 0.45));
    }}
    .text-glow-white {{
      text-shadow: 0 2px 12px rgba(0, 0, 0, 0.95);
    }}
    .card-glass {{
      background: rgba(6, 24, 17, 0.84);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }}
    .card-inner {{
      background: rgba(4, 18, 13, 0.65);
      border: 1px solid rgba(52, 211, 153, 0.2);
    }}
  </style>
</head>
<body class="relative flex flex-col justify-between poster-bg">
  <!-- Atmospheric Scrim Gradients -->
  <div class="absolute inset-0 bg-gradient-to-b from-[#030E0A]/92 via-[#030E0A]/55 to-[#030E0A]/95 pointer-events-none z-0"></div>

  <!-- Content Container -->
  <div class="relative z-10 flex flex-col justify-between h-full p-8">

    <!-- 1. HEADER ZONE -->
    <header class="flex items-center justify-between pb-3 border-b border-amber-400/25">
      
      <!-- Left: KPI Official Logo -->
      <div class="flex items-center gap-4 shrink-0">
        <div class="h-20 w-auto flex items-center justify-center p-1 bg-emerald-950/40 rounded-2xl border border-amber-400/30 shadow-lg">
          <img src="{kpi_logo_uri}" alt="King Prajadhipok's Institute Logo" class="h-full w-auto object-contain drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
        </div>
        <div class="text-left">
          <div class="text-xs uppercase tracking-widest text-amber-300 font-bold">King Prajadhipok's Institute</div>
          <div class="text-lg font-bold text-white tracking-wide leading-tight">สถาบันพระปกเกล้า</div>
          <div class="text-xs text-emerald-200/90 font-medium">ศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จังหวัดเชียงราย</div>
        </div>
      </div>

      <!-- Center: Main Title & Launch Badge -->
      <div class="flex flex-col items-center text-center flex-1 px-4">
        <div class="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-xs font-black tracking-widest uppercase shadow-md mb-1.5">
          <span>✦ OFFICIAL WEBSITE LAUNCH • เปิดตัวเว็บไซต์ใหม่อย่างเป็นทางการ ✦</span>
        </div>
        <h1 class="text-4xl font-black gold-gradient-text tracking-tight text-glow-gold leading-none" style="font-family: 'Prompt', 'Kanit', sans-serif;">
          โรงเรียนพลเมือง สถาบันพระปกเกล้า จังหวัดเชียงราย
        </h1>
        <p class="text-sm font-medium text-emerald-100/90 mt-1" style="font-family: 'Sarabun', 'Prompt', sans-serif;">
          แพลตฟอร์มการจัดการศึกษาพลเมืองและห้องปฏิบัติการนโยบายสาธารณะท้องถิ่น (Citizen Policy Lab)
        </p>
      </div>

      <!-- Right: Institutional Partners Badge -->
      <div class="flex items-center gap-2 shrink-0 bg-emerald-950/70 border border-amber-400/30 rounded-2xl px-4 py-2 shadow-lg">
        <div class="text-right">
          <div class="text-[11px] text-amber-300/80 font-bold uppercase tracking-wider">ความร่วมมือ 3 สถาบันหลัก</div>
          <div class="text-xs text-white font-semibold">สถาบันพระปกเกล้า (KPI)</div>
          <div class="text-xs text-emerald-200">มรภ.เชียงราย (CLLI) • ทต.บ้านดู่</div>
        </div>
      </div>

    </header>

    <!-- 2. MAIN 3-COLUMN CONTENT GRID -->
    <main class="grid grid-cols-12 gap-5 my-auto items-stretch h-[740px]">
      
      <!-- COLUMN 1 (Left, 3.5 cols): ดร.อนงค์ศรี สิทธิอาษา ประธานศูนย์ & คำขวัญขับเคลื่อน -->
      <div class="col-span-3 card-glass rounded-3xl p-5 shadow-2xl flex flex-col justify-between items-center text-center relative overflow-hidden">
        
        <!-- Top Badge -->
        <div class="w-full flex items-center justify-between pb-2 mb-2 border-b border-amber-400/20 text-xs font-semibold text-amber-300">
          <span>ผู้นำองค์กร & ภาคีเครือข่าย</span>
          <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">รุ่นที่ 6</span>
        </div>

        <!-- Portrait of Dr. Anongsri -->
        <div class="relative my-auto">
          <div class="w-40 h-48 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)] mx-auto relative group">
            <img src="{anongsri_uri}" alt="ดร.อนงค์ศรี สิทธิอาษา" class="w-full h-full object-cover object-top" />
            <div class="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent"></div>
          </div>
          <!-- Corner gold accents -->
          <div class="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-amber-300"></div>
          <div class="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-amber-300"></div>
        </div>

        <!-- Leader Name & Title -->
        <div class="mt-3">
          <h2 class="text-xl font-black text-amber-300 leading-snug" style="font-family: 'Prompt', 'Kanit', sans-serif;">
            ดร.อนงค์ศรี สิทธิอาษา
          </h2>
          <p class="text-xs font-bold text-white mt-0.5 leading-snug">
            ประธานศูนย์พัฒนาการเมืองภาคพลเมือง
          </p>
          <p class="text-[11px] text-emerald-200/90 leading-tight">
            สถาบันพระปกเกล้า จังหวัดเชียงราย
          </p>
        </div>

        <!-- Quote Box (Identical to ขอบคุณสถาบันพระปกเกล้า.png) -->
        <div class="w-full bg-gradient-to-b from-amber-950/50 to-emerald-950/60 border border-amber-500/30 rounded-2xl p-3 mt-3 shadow-inner text-center">
          <div class="text-xs text-amber-200 font-bold leading-relaxed" style="font-family: 'Prompt', sans-serif;">
            "พลเมืองเข้มแข็ง ท้องถิ่นเข้มแข็ง ประเทศชาติแข็งแรง"
          </div>
          <div class="text-[11px] text-emerald-100/90 mt-1 leading-normal" style="font-family: 'Sarabun', sans-serif;">
            "ร่วมพัฒนา ร่วมสร้าง ร่วมขับเคลื่อนภาคพลเมือง เพื่อการเปลี่ยนแปลงที่ยั่งยืน"
          </div>
        </div>

        <!-- Footnote Tag -->
        <div class="mt-2 text-[10px] text-amber-300/70">
          ศูนย์พัฒนาการเมืองภาคพลเมือง จ.เชียงราย
        </div>

      </div>

      <!-- COLUMN 2 (Center, 6 cols): นโยบายสาธารณะ 3 ฉบับ & ทำเนียบนวัตกรพลเมือง -->
      <div class="col-span-6 flex flex-col justify-between gap-4 h-full">
        
        <!-- CARD A: 3 ร่างข้อเสนอนโยบายสาธารณะท้องถิ่นตำบลบ้านดู่ (Full Proposals) -->
        <div class="card-glass rounded-3xl p-5 shadow-2xl flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-2 border-b border-amber-400/20">
              <div class="flex items-center gap-2.5">
                <span class="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center font-bold text-base shadow">📜</span>
                <h3 class="text-lg font-bold text-amber-300">3 ร่างข้อเสนอนโยบายสาธารณะท้องถิ่นตำบลบ้านดู่</h3>
              </div>
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-semibold">ฉบับสมบูรณ์ (Full PDF)</span>
            </div>

            <!-- 3 Policy Booklets Row -->
            <div class="grid grid-cols-3 gap-3.5 mt-3">
              
              <!-- Booklet 1: น้ำท่วม -->
              <div class="card-inner p-3 rounded-2xl flex flex-col items-center text-center hover:border-amber-400/40 transition">
                <img src="{cover_disaster}" alt="น้ำท่วมและดินถล่ม" class="w-16 h-22 object-cover rounded-md shadow-lg border border-amber-300/30 mb-2" />
                <div class="text-xs font-bold text-white line-clamp-1">1. น้ำท่วม & ดินถล่ม</div>
                <div class="text-[11px] text-amber-300 font-bold mt-0.5">เตือนภัย 3.58 ลบ.</div>
                <div class="text-[10px] text-emerald-200 mt-0.5">ฉบับเต็ม 27 หน้า</div>
              </div>

              <!-- Booklet 2: PM 2.5 -->
              <div class="card-inner p-3 rounded-2xl flex flex-col items-center text-center hover:border-amber-400/40 transition">
                <img src="{cover_pm25}" alt="PM 2.5 อากาศสะอาด" class="w-16 h-22 object-cover rounded-md shadow-lg border border-amber-300/30 mb-2" />
                <div class="text-xs font-bold text-white line-clamp-1">2. อากาศสะอาด PM 2.5</div>
                <div class="text-[11px] text-amber-300 font-bold mt-0.5">ชีวมวล Biochar 6.5 แสน</div>
                <div class="text-[10px] text-emerald-200 mt-0.5">ฉบับเต็ม 32 หน้า</div>
              </div>

              <!-- Booklet 3: ขยะทองคำ -->
              <div class="card-inner p-3 rounded-2xl flex flex-col items-center text-center hover:border-amber-400/40 transition">
                <img src="{cover_waste}" alt="จัดการขยะครบวงจร" class="w-16 h-22 object-cover rounded-md shadow-lg border border-amber-300/30 mb-2" />
                <div class="text-xs font-bold text-white line-clamp-1">3. จัดการขยะครบวงจร</div>
                <div class="text-[11px] text-amber-300 font-bold mt-0.5">ขยะทองคำ 1 ลบ./หมู่บ้าน</div>
                <div class="text-[10px] text-emerald-200 mt-0.5">ฉบับเต็ม 25 หน้า</div>
              </div>

            </div>
          </div>

          <!-- Direct Download Guarantee (Zero ShortURL) -->
          <div class="mt-3 flex items-center justify-between text-xs text-emerald-200 bg-emerald-950/80 px-3.5 py-2 rounded-xl border border-emerald-500/30">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
              <span>ดาวน์โหลดรูปเล่มเอกสารฉบับเต็มโดยตรง ปลอดภัย ไม่ผ่าน shorturl</span>
            </span>
            <span class="text-amber-300 font-bold text-[11px]">ดาวน์โหลดฟรีผ่านเว็บไซต์</span>
          </div>

        </div>

        <!-- CARD B: ทำเนียบนวัตกรพลเมือง รุ่นที่ 6 & คลังเอกสารราชการ -->
        <div class="card-glass rounded-3xl p-5 shadow-2xl flex-1 flex flex-col justify-between">
          <div class="flex items-center justify-between pb-2 border-b border-amber-400/20">
            <div class="flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-700 text-white flex items-center justify-center font-bold text-base shadow">🎓</span>
              <h3 class="text-lg font-bold text-amber-300">ทำเนียบนวัตกรพลเมือง รุ่นที่ 6 & คลังเอกสารราชการ</h3>
            </div>
            <span class="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-semibold">40 นวัตกรตำบลบ้านดู่</span>
          </div>

          <div class="grid grid-cols-2 gap-3 mt-3">
            <div class="card-inner p-3 rounded-2xl flex items-start gap-2.5">
              <span class="text-amber-400 text-lg shrink-0">🏛️</span>
              <div>
                <div class="text-xs font-bold text-white">สะสมหน่วยกิต CLLI 100%</div>
                <div class="text-[11px] text-emerald-100/80 leading-snug mt-0.5" style="font-family: 'Sarabun', sans-serif;">
                  ผู้นำท้องถิ่น 40 ท่าน เทียบโอนหน่วยกิตหลักสูตร ป.ตรี/ป.โท ธรรมาภิบาล มรภ.เชียงราย
                </div>
              </div>
            </div>

            <div class="card-inner p-3 rounded-2xl flex items-start gap-2.5">
              <span class="text-emerald-400 text-lg shrink-0">🔍</span>
              <div>
                <div class="text-xs font-bold text-white">ตรวจสอบวุฒิบัตรดิจิทัล</div>
                <div class="text-[11px] text-emerald-100/80 leading-snug mt-0.5" style="font-family: 'Sarabun', sans-serif;">
                  ระบบสืบค้นวุฒิบัตรดิจิทัลรายบุคคล ป้องกันการปลอมแปลง ตรวจสอบได้แบบเรียลไทม์
                </div>
              </div>
            </div>
          </div>

          <div class="mt-2.5 flex items-center justify-between text-xs text-amber-200/90 bg-amber-950/40 px-3.5 py-1.5 rounded-xl border border-amber-500/20">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>คลังคำสั่งแต่งตั้ง • บันทึกข้อตกลง MOU • รายงานสรุปผลวิจัยฉบับสมบูรณ์ (KPI Final Report)</span>
            </span>
          </div>

        </div>

      </div>

      <!-- COLUMN 3 (Right, 3 cols): ทางเข้าสู่เว็บไซต์ & QR Code -->
      <div class="col-span-3 card-glass rounded-3xl p-5 shadow-2xl flex flex-col justify-between items-center text-center relative overflow-hidden border-amber-400/50">
        
        <!-- Header -->
        <div class="w-full pb-2 border-b border-amber-400/20 text-center">
          <div class="inline-flex items-center gap-1.5 text-xs text-amber-300 font-bold uppercase tracking-wider">
            <span class="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>เยี่ยมชมเว็บไซต์ทางการ</span>
          </div>
        </div>

        <!-- Domain URL Big Callout -->
        <div class="my-auto w-full">
          <div class="text-xs text-emerald-200/80 mb-1">ช่องทางเข้าใช้งานหลัก</div>
          <div class="text-lg font-black text-white bg-emerald-950/90 py-2 px-2.5 rounded-xl border border-amber-400/40 shadow-inner font-mono tracking-tight break-all text-glow-white">
            www.chiangraicitizenschool.org
          </div>

          <!-- QR Code Container -->
          <div class="bg-white p-3 rounded-2xl border-2 border-amber-400 shadow-2xl inline-block mt-3">
            <img src="{qr_uri}" alt="Website QR Code" class="w-32 h-32 object-contain" />
            <div class="mt-1 text-[11px] font-black text-stone-900 tracking-wider">สแกนเข้าเว็บไซต์ทันที</div>
          </div>
        </div>

        <!-- Features Checklist -->
        <div class="w-full bg-emerald-950/60 rounded-2xl p-2.5 border border-emerald-500/20 text-left mt-2 space-y-1">
          <div class="flex items-center gap-1.5 text-[11px] text-emerald-100">
            <span class="text-amber-400 font-bold">✓</span>
            <span>Responsive ใช้งานได้ทั้งมือถือและแท็บเล็ต</span>
          </div>
          <div class="flex items-center gap-1.5 text-[11px] text-emerald-100">
            <span class="text-amber-400 font-bold">✓</span>
            <span>ดาวน์โหลดเอกสารนโยบายสาธารณะฉบับเต็ม</span>
          </div>
          <div class="flex items-center gap-1.5 text-[11px] text-emerald-100">
            <span class="text-amber-400 font-bold">✓</span>
            <span>ตรวจสอบวุฒิบัตรนวัตกรพลเมือง รุ่นที่ 6</span>
          </div>
        </div>

      </div>

    </main>

    <!-- 3. BOTTOM FOOTER BAR -->
    <footer class="pt-2 border-t border-amber-400/20 flex items-center justify-between text-xs text-emerald-200/80">
      <div>
        <span class="font-bold text-amber-300">ศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จังหวัดเชียงราย</span>
        <span class="mx-2">•</span>
        <span>มหาวิทยาลัยราชภัฏเชียงราย</span>
        <span class="mx-2">•</span>
        <span>เทศบาลตำบลบ้านดู่</span>
      </div>
      <div class="text-amber-300/90 font-medium italic">
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
