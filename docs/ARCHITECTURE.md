# ARCHITECTURE RECORD: HUFLIT GPA Strategist

## 1. Context & Goals

Dự án được nâng cấp từ phiên bản legacy (HTML/JS/CSS thuần) lên hệ thống Frontend hiện đại dựa trên Next.js nhằm đảm bảo tính bảo trì, khả năng mở rộng và tái sử dụng mã (Clean Code). Yêu cầu quan trọng nhất là tính chính xác của các thuật toán tính GPA, vì vậy quy trình chuyển đổi áp dụng TDD (Test-Driven Development).
Dự án được triển khai trên nền tảng GitHub Pages thông qua tính năng Static Export của Next.js (miễn phí 100%).

## 2. Tech Stack

- **Framework:** Next.js 15 (App Router) + React 19.
- **Ngôn ngữ:** TypeScript.
- **Styling & UI Components:** Tailwind CSS (v4) + Shadcn UI + Lucide React.
- **Lưu trữ Dữ liệu (State & Database):**
  - `LocalStorage`: Dùng để lưu trữ lộ trình GPA, điểm số hiện tại của sinh viên mà không cần backend riêng.
  - `Zustand` hoặc `React Context`: Quản lý state toàn cục (nếu cần thiết cho các tab tính toán).
- **CMS / Dữ liệu bên thứ 3:** Notion API làm hệ thống CMS cho Tab Tin tức, dùng ISR/SSG để build ra file HTML tĩnh không cần server.
- **Kiểm thử (Testing):** Vitest (để đảm bảo 100% test coverage cho logic tính toán).
- **Triển khai (Deployment):** GitHub Actions -> GitHub Pages (với cấu hình Next.js `output: 'export'`).

## 3. Cấu trúc Thư mục (Directory Structure)

```
UI_enhanced/
├── src/
│   ├── app/                # Next.js App Router (Các trang chính)
│   │   ├── roadmap/        # Tab: Lộ trình GPA
│   │   ├── manual/         # Tab: Tính GPA thủ công
│   │   ├── subject/        # Tab: Tính điểm môn học
│   │   ├── scale/          # Tab: Thang điểm
│   │   └── news/           # Tab: Tin tức
│   ├── components/
│   │   ├── ui/             # Các component UI chung (Button, Table, Input của Shadcn)
│   │   ├── layout/         # Header, Footer, Sidebar, Navigation
│   │   └── features/       # Component có tính logic cao của từng Tab
│   ├── lib/
│   │   ├── gpa-engine.ts   # Core Logic chuyển đổi từ legacy/calculator.js
│   │   ├── notion.ts       # Service gọi Notion API
│   │   └── utils.ts        # Helper functions
│   ├── hooks/              # Custom React Hooks
│   ├── types/              # TypeScript Interfaces / Types
│   └── tests/              # Mã nguồn kiểm thử (Vitest)
└── public/                 # Ảnh, favicon, assets tĩnh
```

## 4. Quyết định Thiết kế (Architecture Decisions)

1. **Zero-Backend Architecture:** Việc loại bỏ hoàn toàn backend giúp tiết kiệm 100% chi phí. Dữ liệu tính toán của sinh viên mang tính cá nhân, lưu qua Storage trình duyệt là hoàn toàn phù hợp về mặt bảo mật và đủ đáp ứng nhu cầu.
2. **Notion làm CMS (Headless CMS):** Sử dụng kết hợp với Static Export (SSG) của Next.js để sinh ra trang tĩnh cho báo, nhưng do tính chất GitHub Pages static, ta có thể cài đặt fetch API từ Client Side (SWR/React Query) nếu Notion Database frequently updates, hoặc build mới trang thông qua Webhooks và GitHub Actions.
3. **Core Engine Tách Biệt:** Logic tính điểm (`gpa-engine.ts`) được tách khỏi giao diện (React Components). Module này là Pure Functions, nhận Input -> Output chuẩn, tuân theo quy tắc Testability (rất dễ test tự động).

## 5. UI/UX Guidelines (ui-ux-pro-max)

- Hướng thiết kế: Minimalist Professional, không lạm dụng hiệu ứng rườm rà.
- Màu sắc: Xanh HUFLIT làm chủ đạo nhưng sử dụng các sắc độ HSL tinh tế hơn.
- Animations: Chỉ dùng mico-interactions (hover effect, mượt chuyển tab).
- Tính năng Spreadsheets: Lợi dụng hệ thống thẻ Card và Table của Shadcn để làm trang tính điểm thủ công cho giống Excel.
