import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HUFLIT StudySpace",
  description:
    "Không gian học tập tương tác nhập vai với 50 bối cảnh Video 4K, 20 âm thanh môi trường thư giãn, danh sách nhạc Lo-fi/Jazz/Relax, To-do list và ghi chú nhanh.",
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
    title: "HUFLIT StudySpace",
    description:
      "Tập trung học tập hiệu quả với bối cảnh 4K, nhạc Lo-fi/Jazz và 20 âm thanh môi trường thư giãn.",
    type: "website",
  },
};

export default function StudyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
