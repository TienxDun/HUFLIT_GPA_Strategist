# Lộ Trình Đề Xuất & Nâng Cấp Hệ Thống Study Space (HUFLIT GPA Strategist)

> **Tài liệu lưu trữ các phân tích, đánh giá và định hướng phát triển tính năng cho phân hệ Study Space.**

---

## 1. 🔍 Đánh Giá Hệ Thống Hiện Tại

| Phân hệ | Thành phần & Trạng thái | Đánh giá |
| :--- | :--- | :--- |
| **Scenes (Hình nền)** | `SceneSelectorWidget.tsx` (Video 4K / Ảnh tĩnh phân loại chủ đề, Toàn màn hình, Zen Mode) | ⭐⭐⭐⭐⭐ Trực quan, đa dạng, trải nghiệm nhập vai tốt. |
| **Audio & Ambiance** | `StudyMusicPlayer.tsx`, `SoundMixerWidget.tsx` (Nhạc Mood Lofi/Jazz/Relax, Visualizer sóng nhạc, 15+ âm thanh môi trường) | ⭐⭐⭐⭐⭐ Chất lượng âm thanh tốt, bộ trộn độc lập mượt mà. |
| **Quản lý thời gian** | `StudyPomodoroWidget.tsx` (Clock 12h/24h, Pomodoro 3 chế độ, Stopwatch + Laps, Âm thanh chuông báo) | ⭐⭐⭐⭐☆ Hoạt động ổn định, cần bổ sung ghi nhận lịch sử/thống kê. |
| **Quản lý công việc** | `StudyTasksWidget.tsx` (Bảng Kanban đa bảng, Checklist, Hạn chót & cảnh báo thông minh, Tìm kiếm/Lọc) | ⭐⭐⭐⭐☆ Tính năng phong phú, cần liên kết trực tiếp với phiên học Pomodoro. |
| **Ghi chú học tập** | `StudyNotesWidget.tsx` (Rich Text Editor, Phân loại ghi chú, Tìm kiếm, Đổi theme Sáng/Tối) | ⭐⭐⭐⭐☆ Đầy đủ định dạng, hỗ trợ xuất file tiện lợi. |

---

## 2. 💡 Danh Mục Đề Xuất Tính Năng Mới

### 📊 Nhóm 1: Động Lực & Thống Kê (Motivation & Analytics)
- **1.1 Study Heatmap & Analytics**: Thống kê số phút tập trung mỗi ngày, biểu đồ tuần/tháng, ma trận nhiệt tương tự GitHub Heatmap.
- **1.2 Daily Streak Tracker**: Đếm chuỗi ngày học liên tục (ví dụ: 🔥 5 ngày liên tiếp).
- **1.3 Daily Focus Goal**: Đặt mục tiêu học tập theo ngày (ví dụ: 4 phiên = 100 phút) kèm vòng tròn tiến độ (Progress Ring).

### 🎯 Nhóm 2: Nâng Cao Hiệu Suất (Smart Productivity)
- **2.1 Task-tied Pomodoro Session**: Chọn 1 task cụ thể từ Kanban để tập trung, tự động đếm số quả cà chua 🍅 hoàn thành trên task đó.
- **2.2 Exam & Deadline Countdown Widget**: Widget ghim đếm ngược các mốc thi cử, nộp đồ án, thi chứng chỉ.
- **2.3 Box Breathing 4-7-8**: Hướng dẫn bài tập hít thở thư giãn trong giờ nghỉ (Short Break) giúp giảm căng thẳng.

### 🎨 Nhóm 3: Cá Nhân Hóa & Tiện Ích Mở Rộng (Personalization & Extensions)
- **3.1 Tích hợp Nhúng Âm Nhạc & Video (YouTube / Spotify Embed)**: Nhúng link YouTube Live (Lofi Girl, Chillhop...), Spotify Playlist/Track hoặc Stream tùy chỉnh kèm các kênh mẫu có sẵn.
- **3.2 Daily Motivational Quotes**: Câu nói truyền cảm hứng học tập ngẫu nhiên mỗi ngày.
- **3.3 Backup / Restore Data (JSON)**: Sao lưu và phục hồi dữ liệu Tasks, Notes, Cài đặt cá nhân.

---

## 3. 🚀 Thứ Tự Ưu Tiên Triển Khai (Roadmap)

1. **Giai đoạn 1 (Đang triển khai)**: Tích hợp Nhúng YouTube & Spotify Embed Player (Nguồn phát ngoài).
2. **Giai đoạn 2**: Study Analytics, Daily Streak & Daily Goal (Thống kê & Động lực).
3. **Giai đoạn 3**: Liên kết Pomodoro với Task Kanban & Exam Countdown Widget.
4. **Giai đoạn 4**: Box Breathing Exercise & Sao lưu dữ liệu JSON.
