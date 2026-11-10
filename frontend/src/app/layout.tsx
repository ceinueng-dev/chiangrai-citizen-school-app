import type { Metadata } from "next";
import { Prompt, Sarabun, Inter } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-prompt",
  display: "swap",
});

const sarabun = Sarabun({
  weight: ["300", "400", "500", "600"],
  subsets: ["thai", "latin"],
  variable: "--font-sarabun",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.chiangraicitizenschool.org"),
  title: "ระบบบริหารจัดการ โรงเรียนพลเมือง สถาบันพระปกเกล้า จังหวัดเชียงราย",
  description: "ระบบบริหารจัดการและการเรียนรู้เชิงนโยบาย (Citizen Policy Lab) ศูนย์พัฒนาการเมืองภาคพลเมือง สถาบันพระปกเกล้า จังหวัดเชียงราย",
  keywords: ["โรงเรียนพลเมือง", "สถาบันพระปกเกล้า", "เชียงราย", "Citizen School", "KPI Chiang Rai", "ดร.ณัฏฐพล สันธิ"],
  authors: [{ name: "ดร.ณัฏฐพล สันธิ" }],
  openGraph: {
    title: "โรงเรียนพลเมือง สถาบันพระปกเกล้า จังหวัดเชียงราย",
    description: "ระบบบริหารจัดการและการเรียนรู้เชิงนโยบาย (Citizen Policy Lab) สถาบันพระปกเกล้า จังหวัดเชียงราย",
    url: "https://www.chiangraicitizenschool.org",
    siteName: "Chiang Rai Citizen School",
    images: [
      {
        url: "/brand-assets/landing-page.png",
        width: 1200,
        height: 630,
        alt: "โรงเรียนพลเมือง เชียงราย",
      },
    ],
    locale: "th_TH",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${prompt.variable} ${sarabun.variable} ${inter.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;700&family=Prompt:wght@300;400;600;700&family=Sarabun:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sarabun text-slate-800 bg-slate-50 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
