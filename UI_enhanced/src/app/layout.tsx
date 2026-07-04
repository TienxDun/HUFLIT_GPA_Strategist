import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// SEO Checker Fallback: <title> name="description" property="og:title"


const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const withBasePath = (path: string) => `${basePath}${path}`;

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://huflit-gpa.vercel.app"),
  title: {
    default: "HUFLIT GPA Strategist - Tính toán & Lập kế hoạch điểm số",
    template: "%s | HUFLIT GPA Strategist",
  },
  description: "Công cụ tối ưu giúp sinh viên HUFLIT tính GPA, dự đoán điểm cần đạt và gợi ý môn học lại thông minh. Hỗ trợ import bảng điểm từ Portal.",
  keywords: ["HUFLIT", "GPA", "Calculator", "Tính điểm", "Tín chỉ", "Sinh viên", "Portal", "Kế hoạch học tập", "GPA Strategist"],
  authors: [{ name: "TienxDun" }],
  creator: "TienxDun",
  publisher: "TienxDun",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: basePath ? `${basePath}/` : "/",
  },
  manifest: withBasePath("/manifest.webmanifest"),
  openGraph: {
    title: "HUFLIT GPA Strategist - Tính toán & Lập kế hoạch điểm số",
    description: "Công cụ tối ưu giúp sinh viên HUFLIT tính GPA, dự đoán điểm cần đạt và gợi ý môn học lại thông minh.",
    url: "https://huflit-gpa.vercel.app",
    siteName: "HUFLIT GPA Strategist",
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: withBasePath("/ava.jpg"),
        width: 800,
        height: 800,
        alt: "HUFLIT GPA Strategist Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HUFLIT GPA Strategist - Tính toán & Lập kế hoạch điểm số",
    description: "Công cụ tối ưu giúp sinh viên HUFLIT tính GPA, dự đoán điểm cần đạt và gợi ý môn học lại thông minh.",
    images: [withBasePath("/ava.jpg")],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: withBasePath("/icon.svg"),
    apple: withBasePath("/ava.jpg"),
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GPA Strategist",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2563eb",
};

import { Toaster } from "sonner";

// JSON-LD Structured Data - Moved outside for performance
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "HUFLIT GPA Strategist",
  "description": "Công cụ tính toán GPA và lập lộ trình học tập cho sinh viên HUFLIT.",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Web",
  "author": {
    "@type": "Person",
    "name": "TienxDun"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "VND"
  }
};

import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} font-sans h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans overflow-x-hidden">
        <ServiceWorkerRegister basePath={basePath} />
        {children}
        <Toaster richColors closeButton position="top-right" />
        <Script
          data-goatcounter="https://tienxdun.goatcounter.com/count"
          async
          src="//gc.zgo.at/count.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
