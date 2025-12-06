# HUFLIT GPA Strategist

**HUFLIT GPA Strategist** là một ứng dụng web tĩnh (Static Web App) giúp sinh viên trường Đại học Ngoại ngữ - Tin học TP.HCM (HUFLIT) tính toán, quản lý và lên chiến lược cải thiện điểm số GPA một cách hiệu quả và dễ dàng.

Ứng dụng được xây dựng với giao diện hiện đại, thân thiện, hoạt động mượt mà trên cả máy tính và điện thoại di động mà không cần cài đặt.

## 🚀 Tính Năng Cốt Lõi

### 1. 🎯 Lộ Trình GPA (Target GPA)
Tính toán điểm trung bình cần đạt cho các tín chỉ trong tương lai để đạt được GPA mục tiêu.
- **Logic "Đòn bẩy"**: Hỗ trợ tính toán trường hợp **Học cải thiện (Retake)**, tự động thay thế điểm cũ bằng điểm mới trong công thức tính.
- **Xử lý điểm F**: Tự động nhận diện môn rớt (F) để tính toán chính xác số tín chỉ cần tích lũy thêm mà không làm sai lệch GPA hiện tại.
- **Dự báo khả thi**: Phân tích mục tiêu có khả thi hay không (có vượt quá 4.0 hay không) và đưa ra gợi ý phân bổ điểm số (cần bao nhiêu điểm A, B+...).

### 2. 🧮 Tính GPA Thủ Công (Manual Calc)
Công cụ tính điểm chi tiết theo từng học kỳ, hoạt động như một file Excel thu nhỏ.
- **Quản lý học kỳ**: Thêm/Xóa học kỳ và môn học linh hoạt. Hiển thị **tổng số tín chỉ** của từng học kỳ ngay lập tức khi nhập liệu.
- **Xử lý Học lại**: Tự động trừ tín chỉ và điểm số của môn cũ khỏi tổng tích lũy khi chọn chế độ "Học lại".
- **Lưu trữ tự động**: Dữ liệu được lưu vào trình duyệt (LocalStorage), không bị mất khi tải lại trang.
- **Xếp loại tự động**: Hiển thị xếp loại (Xuất sắc, Giỏi, Khá...) theo quy chế tín chỉ.

### 3. 📝 Tính Điểm Môn Học (Course Grade)
Giúp sinh viên biết chính xác cần thi cuối kỳ bao nhiêu điểm để đạt mục tiêu môn học.
- **Tùy chọn tỷ lệ**: Hỗ trợ các tỷ lệ điểm quá trình/cuối kỳ phổ biến (30/70, 40/60, 50/50).
- **Trực quan hóa**: Hiển thị thanh tiến độ (Progress Bar) và màu sắc cảnh báo độ khó (Xanh: Dễ, Đỏ: Khó).
- **Cảnh báo Rớt**: Hiển thị trạng thái "Rớt" rõ ràng nếu điểm tổng kết dưới 4.0.

### 4. 📊 Tra Cứu Thang Điểm
Bảng tra cứu thang điểm tín chỉ chính thức của HUFLIT.
- Quy đổi từ Điểm chữ (A, B, C...) sang Thang điểm 10 và Thang điểm 4.0.

### 5. 📱 Giao Diện Mobile-First
- **Bottom Navigation**: Thanh điều hướng dưới cùng cho thiết bị di động, mang lại trải nghiệm giống ứng dụng Native (App-like experience).
- **Responsive**: Tối ưu hóa hiển thị cho mọi kích thước màn hình.

## 🛠️ Công Nghệ Sử Dụng

*   **Core**: HTML5, CSS3, Vanilla JavaScript (ES6+).
*   **UI Framework**: [Bootstrap 5.3](https://getbootstrap.com/) (Responsive Grid, Components).
*   **Icons**: [Bootstrap Icons](https://icons.getbootstrap.com/).
*   **Font**: [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts).
*   **Storage**: LocalStorage API (Lưu dữ liệu phía Client).

## 📂 Cấu Trúc Dự Án

```
GPA_Calculator/
├── index.html      # Giao diện chính (Layout, Tabs)
├── style.css       # Tùy chỉnh giao diện (Colors, Animations)
├── script.js       # Logic tính toán chính
├── constants.js    # Định nghĩa thang điểm (HUFLIT_GRADE_SCALE)
└── README.md       # Tài liệu dự án
```

## 📖 Hướng Dẫn Cài Đặt & Sử Dụng

Dự án là web tĩnh thuần túy, không cần cài đặt môi trường phức tạp (Node.js, Python, v.v.).

1.  **Tải về**: Clone repository hoặc tải file ZIP về máy.
2.  **Chạy**: Mở file `index.html` bằng trình duyệt web bất kỳ (Chrome, Edge, Firefox...).
3.  **Sử dụng**:
    *   Nhập dữ liệu vào các ô tương ứng.
    *   Dữ liệu sẽ tự động được lưu lại trên trình duyệt của bạn.

## 🤝 Đóng Góp

Mọi đóng góp, báo lỗi hoặc đề xuất tính năng mới đều được hoan nghênh! Vui lòng tạo [Issue](https://github.com/yourusername/GPA_Calculator/issues) hoặc gửi Pull Request.

---
*Dự án được phát triển nhằm hỗ trợ cộng đồng sinh viên HUFLIT.*
