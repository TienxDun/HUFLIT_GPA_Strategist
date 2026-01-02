# Architecture Documentation - HUFLIT GPA Strategist

Tài liệu này mô tả kiến trúc kỹ thuật của dự án để hỗ trợ việc bảo trì và phát triển tính năng mới.

## 1. Tổng quan Kiến trúc (Architecture Overview)

Dự án được xây dựng dựa trên **Vanilla JavaScript** với mô hình **ES Modules**. Không sử dụng framework frontend (React, Vue, Angular) để đảm bảo tốc độ tải trang nhanh và dễ dàng triển khai.

### Mô hình thiết kế (Design Pattern)
- **Modularization**: Code được chia nhỏ thành các module theo chức năng (`core`, `state`, `ui`).
- **Observer Pattern**: Quản lý state tập trung trong `store.js`. Khi state thay đổi, các listener (UI renderers) sẽ tự động cập nhật.
- **Separation of Concerns**: Tách biệt logic tính toán (`calculator.js`), quản lý dữ liệu (`store.js`) và xử lý giao diện (`events.js`, `renderers.js`).

## 2. Cấu trúc Thư mục (Directory Structure)

```
/
├── index.html              # Giao diện chính (Single Page)
├── style.css               # Custom Styles (bổ sung cho Bootstrap)
├── js/
│   ├── main.js             # Entry point: Khởi tạo ứng dụng
│   ├── core/               # Business Logic & Constants
│   │   ├── constants.js    # Hằng số (Thang điểm, Config)
│   │   ├── calculator.js   # Các hàm tính toán thuần túy (Pure Functions)
│   │   └── utils.js        # Hàm tiện ích (Parser, Format)
│   ├── state/              # State Management
│   │   └── store.js        # Central Store & Observer logic
│   └── ui/                 # User Interface Logic
│       ├── events.js       # Event Listeners & Controller Logic
│       ├── renderers.js    # DOM Manipulation & HTML Generation
│       └── effects.js      # Visual Effects (Snow, Tree)
└── assets/                 # Static Resources
```

## 3. Chi tiết từng Module chức năng (Tabs)

### Tab 1: Lộ trình GPA (Target GPA)
*Mục tiêu: Dự báo điểm số cần đạt để đạt GPA mục tiêu.*

- **DOM Container**: `#pills-target`
- **Controller**: `initTargetGPATab` (trong `js/ui/events.js`)
- **State**: `targetState` (trong `js/state/store.js`)
    - `currentGpa`, `currentCredits`, `targetGpa`, `newCredits`, `isRetake`, `retakes`
- **Logic tính toán**: 
    - `calculateTargetResult` (trong `js/core/calculator.js`): Tính GPA cần đạt.
    - `generateGradeCombinations` (trong `js/core/calculator.js`): Tạo các tổ hợp điểm số khả thi (ví dụ: 2 môn A, 1 môn B).
    - `generateRetakeSuggestions` (trong `js/core/calculator.js`): Gợi ý môn học lại nếu mục tiêu không khả thi.
- **Luồng dữ liệu**:
    1. User nhập liệu -> Event Listener (`events.js`)
    2. Cập nhật `targetState` (`store.js`)
    3. Gọi `calculateTargetResult` (`calculator.js`)
    4. Nếu khả thi -> Gọi `generateGradeCombinations` -> Render danh sách tổ hợp.
    5. Nếu không khả thi -> Gọi `generateRetakeSuggestions` -> Render gợi ý học lại.
    6. Render kết quả chi tiết ra `#target-result-container`.

### Tab 2: Tính GPA Thủ công (Manual Calculation)
*Mục tiêu: Quản lý chi tiết từng học kỳ, môn học và import từ Portal.*

- **DOM Container**: `#pills-manual`
- **Controller**: `initManualCalcTab` (trong `js/ui/events.js`)
- **State**: `manualState` (trong `js/state/store.js`)
    - `semesters`: Array các học kỳ.
    - `initialGpa`, `initialCredits`: Dữ liệu nền tảng.
- **Logic tính toán**: `calculateManualGPA` (trong `js/core/calculator.js`)
- **Tính năng Import**:
    - Input: Text copy từ Portal.
    - Parser: `parsePortalText` (trong `js/core/utils.js`) - Sử dụng Regex để trích xuất dữ liệu.
- **Rendering**: `renderManualSemesters` (trong `js/ui/renderers.js`) - Render lại toàn bộ danh sách khi state thay đổi.

### Tab 3: Tính điểm Môn học (Course Grade)
*Mục tiêu: Tính điểm thi cuối kỳ cần đạt dựa trên điểm quá trình.*

- **DOM Container**: `#pills-course`
- **Controller**: `initCourseGradeTab` (trong `js/ui/events.js`)
- **State**: LocalStorage `courseGradeState` (Lưu cục bộ, không qua Store chung).
- **Logic**: Tính toán trực tiếp trong `events.js` do logic đơn giản.
- **UI Elements**:
    - Input: `#process-score-input`
    - Output: `#course-grade-results`

### Tab 4: Thang điểm (Grade Scale)
*Mục tiêu: Tra cứu thang điểm.*

- **DOM Container**: `#pills-scale`
- **Controller**: `initGradeScaleTab` (trong `js/ui/renderers.js`)
- **Data**: `GRADE_SCALE` (trong `js/core/constants.js`)
- **Logic**: Render bảng tĩnh từ dữ liệu hằng số.

## 4. Quy tắc phát triển (Development Guidelines)

1.  **Thêm tính năng mới**:
    - Nếu liên quan đến dữ liệu toàn cục: Thêm vào `js/state/store.js`.
    - Nếu là logic tính toán phức tạp: Thêm vào `js/core/calculator.js`.
    - Nếu là xử lý sự kiện UI: Thêm vào `js/ui/events.js`.
    - Nếu là render HTML phức tạp: Thêm vào `js/ui/renderers.js`.

2.  **Naming Convention**:
    - Function: camelCase (ví dụ: `calculateGPA`).
    - DOM ID: kebab-case (ví dụ: `process-score-input`).
    - Constant: UPPER_SNAKE_CASE (ví dụ: `GRADE_SCALE`).

3.  **State Updates**:
    - Luôn sử dụng các hàm setter từ `store.js` (ví dụ: `setManualState`) để đảm bảo UI được cập nhật tự động qua Observer.
