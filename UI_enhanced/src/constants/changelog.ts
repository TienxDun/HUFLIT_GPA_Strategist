export type ChangeType = "feat" | "improve" | "fix";

export interface ChangeItem {
  type: ChangeType;
  description: string;
}

export interface ReleaseVersion {
  version: string;
  date: string;
  title: string;
  isLatest?: boolean;
  highlight?: string;
  changes: ChangeItem[];
}

export const CHANGELOG_DATA: ReleaseVersion[] = [
  {
    version: "v2.4.0",
    date: "07/09/2026",
    title: "Tối ưu hóa Thang điểm & Tích hợp Bản đồ chỉ đường",
    isLatest: true,
    highlight: "Nâng cấp giao diện dạng danh sách cân xứng và hỗ trợ mở Google Maps 4 cơ sở HUFLIT.",
    changes: [
      {
        type: "feat",
        description: "Tích hợp liên kết Google Maps chỉ đường trực tiếp cho 4 cơ sở: Sư Vạn Hạnh, Hóc Môn, Trường Sơn, Ba Gia."
      },
      {
        type: "improve",
        description: "Chuyển đổi bảng Ký hiệu Cơ sở & Mã phòng sang bố cục danh sách (List View) thẳng hàng, khắc phục lỗi cắt ngắn địa chỉ."
      },
      {
        type: "improve",
        description: "Tối ưu trải nghiệm Responsive trên điện thoại: tách 2 tầng thông minh, chạm ngón tay mở bản đồ dễ dàng."
      },
      {
        type: "feat",
        description: "Bổ sung hệ thống Nhật ký cập nhật phiên bản (Changelog) minh bạch lịch sử phát triển."
      }
    ]
  },
  {
    version: "v2.3.0",
    date: "05/09/2026",
    title: "Nâng cấp Thang điểm Rèn luyện & Thời gian biểu Tiết học",
    changes: [
      {
        type: "feat",
        description: "Bổ sung bảng Thời gian biểu chi tiết các ca học (Sáng, Chiều, Tối) chuẩn khung giờ HUFLIT."
      },
      {
        type: "improve",
        description: "Hoàn thiện bảng quy đổi chuẩn 3 thang điểm (Thang 10 ➔ Điểm chữ ➔ Thang 4) theo QĐ 476."
      },
      {
        type: "improve",
        description: "Cập nhật bảng đánh giá và xếp loại Điểm rèn luyện sinh viên."
      }
    ]
  },
  {
    version: "v2.2.0",
    date: "01/09/2026",
    title: "Hỗ trợ PWA Cài đặt Ứng dụng & Chế độ Ngoại tuyến",
    changes: [
      {
        type: "feat",
        description: "Hỗ trợ cài đặt PWA (Progressive Web App) lên màn hình chính điện thoại (iOS/Android) và máy tính."
      },
      {
        type: "feat",
        description: "Tích hợp Service Worker hỗ trợ mở ứng dụng nhanh chóng kể cả khi mất kết nối mạng."
      },
      {
        type: "improve",
        description: "Bổ sung hướng dẫn cài đặt chi tiết cho từng hệ điều hành."
      }
    ]
  },
  {
    version: "v2.1.0",
    date: "20/08/2026",
    title: "Mô phỏng Lộ trình Điểm số & Tính điểm Môn lẻ",
    changes: [
      {
        type: "feat",
        description: "Thêm tính năng Tính điểm Môn lẻ: dự đoán điểm thi cuối kỳ tối thiểu cần đạt để qua môn hoặc đạt điểm A/B/C."
      },
      {
        type: "feat",
        description: "Thêm tab Lộ trình: lập kế hoạch GPA mục tiêu các học kỳ còn lại và trực quan hóa biểu đồ tích lũy."
      },
      {
        type: "improve",
        description: "Bổ sung bộ đếm lượt truy cập và hộp thoại góp ý tính năng cộng đồng."
      }
    ]
  },
  {
    version: "v2.0.0",
    date: "10/08/2026",
    title: "Tái cấu trúc Giao diện UI Enhanced Hiện đại",
    changes: [
      {
        type: "feat",
        description: "Ra mắt giao diện HUFLIT GPA Strategist thế hệ mới với phong cách thiết kế hiện đại, mượt mà."
      },
      {
        type: "feat",
        description: "Tính điểm GPA học kỳ và tích lũy tự động, xếp loại tốt nghiệp và cảnh báo học vụ chính xác theo quy chế."
      },
      {
        type: "improve",
        description: "Tự động sao lưu dữ liệu vào LocalStorage, hỗ trợ Xuất/Nhập dữ liệu bảng điểm an toàn."
      }
    ]
  }
];

export const getLatestVersion = () => {
  return CHANGELOG_DATA[0] || {
    version: "v2.4.0",
    date: "07/09/2026",
    title: "Phiên bản hiện tại"
  };
};
