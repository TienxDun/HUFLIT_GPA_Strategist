import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam",
});

export const viewport: Viewport = {
  themeColor: "#090d16",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "HUFLIT StudySpace - Không Gian Học Tập Tương Tác & Tập Trung",
  description:
    "Không gian học tập tương tác nhập vai với 50 bối cảnh Video 4K, 20 âm thanh môi trường thư giãn, danh sách nhạc Lo-fi/Jazz/Relax, Pomodoro timer, To-do list và ghi chú nhanh.",
  keywords: [
    "study space",
    "lofi study",
    "không gian học tập",
    "nhạc học bài",
    "âm thanh mưa",
    "pomodoro",
    "huflit",
  ],
  openGraph: {
    title: "HUFLIT StudySpace - Không Gian Học Tập Tương Tác",
    description:
      "Tập trung học tập hiệu quả với bối cảnh 4K, nhạc Lo-fi/Jazz và 20 âm thanh môi trường thư giãn.",
    type: "website",
  },
};

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
      <body className="min-h-full flex flex-col font-sans overflow-x-hidden bg-[#090d16] text-white">
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          duration={3000}
          offset={24}
        />
      </body>
    </html>
  );
}
