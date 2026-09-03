# Cải thiện bảo trì GPA Calculator

Ngày: 2026-09-04
Phạm vi: `src/`

## 1. Cây gọn

- `src/app/`: `page.tsx`, `layout.tsx`, `study/page.tsx`
- `src/components/features/`: `ManualTab.tsx`, `RoadmapTab.tsx`, `SubjectTab.tsx`, `ScaleTab.tsx`, `NewsTab.tsx` + `manual/`(9), `roadmap/`(7), `news/`(21), `scale/`(4), `subject/`(2), `community/`(4)
- `src/components/layout/`(9), `ui/`(16), `study/`(10)
- `src/hooks/`: `useManualGPA.ts`, `useRoadmapState.ts`, `useNewsState.ts`, `useSubjectCalculator.ts`, `useFeedback.ts`
- `src/lib/gpa/`: `constants.ts`, `types.ts`, `calculators.ts`, `parser.ts`, `generators.ts`, `graduation-calculator.ts`, `index.ts`
- `src/lib/`: `gpa-engine.ts`, `roadmap-utils.ts`, `share-utils.ts`, `utils.ts`, `utils/grade-utils.ts`, `api/news.ts`, `api/feedback.ts`
- `src/__tests__/unit/gpa/`(3), `study/`(3)
- `public/legacy/js/`: codebase JS cũ song song. `public/study/`: mp3/avif/mp4.

## 2. Trách nhiệm lớp

- `app`: shell tab (`manual|roadmap|subject|scale|news`), URL `?tab=` + `?s=` share, dynamic import 4 tab. Logic nặng `src/app/page.tsx:83-133`.
- `lib/gpa`: domain thuần. Tốt. Test phủ ở đây.
- `hooks`: state + `localStorage` + tính toán memo. Chứa logic nghiệp vụ lẫn.
- `features/*`: UI theo tab. `manual/` + `roadmap/` dày. `news/` chia 21 file nhỏ.
- `lib/api`: transport Google Apps Script. `news.ts` CRUD 2 sheet, `feedback.ts` CRUD feedback.
- `lib/*-utils`: status/share/màu grade rời rạc.

## 3. Trùng lặp logic

- `src/lib/gpa-engine.ts:1` shim re-export `./gpa`. Import lẫn `@/lib/gpa-engine` + `@/lib/gpa`. Xóa 1 đường.
- Logic môn cải thiện lặp 3 nơi: `graduation-calculator.ts:93-110`, `useRoadmapState.ts:247-279`, `generators.ts:122-152`. Cùng dedup theo `equivalentName||name`, lọc `gpa<3.0`.
- Tính thiếu điểm lặp 2 công thức: `calculators.ts:133-193` `calculateTargetResult` vs `graduation-calculator.ts:112-122` `requiredFutureGPA`.
- Parse prefix môn lặp: `parser.ts:28-37` vs `parser.ts:73-82`. Regex portal `Năm học...HK` ở `parser.ts:10`, semValue `year*10+hk` ở `parser.ts:111-118`, `getYear` ở `useManualGPA.ts:52-55`.
- Key storage rải string: `huflit-manual-gpa-state` ở `useManualGPA.ts:7` + `useRoadmapState.ts:16`, `huflit-manual-grad-total-credits` + `huflit-manual-grad-target-gpa` ở `GraduationGoalCard.tsx:62-63` + `useRoadmapState.ts:347,354`, `study_*` + `huflit_study_*` ở `src/app/study/page.tsx:90-120` + widgets study.
- Validate toast lặp: title>=5 + `startsWith("http")` ở `useNewsState.ts:110-118,146-154,217-225,255-263`; content>=10 ở `useFeedback.ts:31-34`.
- `apiPost` lặp: `api/news.ts:60-85` vs `submitFeedback` ở `api/feedback.ts:26-45`. `GOOGLE_SCRIPT_URL` hardcode 2 file.
- Map màu rải: `grade-utils.ts:5-12`, `roadmap-utils.ts:33-55`, `GRADUATION_TARGETS` `badgeColor` ở `graduation-calculator.ts:15-44`.

## 4. State hiện tại

- Không store global. Mỗi hook `useState` + `localStorage` debounce 300ms. Ví dụ `useManualGPA.ts:35-41`, `useRoadmapState.ts:104-112`.
- Cross-tab 1 chiều: `storage` event `MANUAL_STORAGE_KEY` ở `useRoadmapState.ts:115-123`. Cùng tab không đồng bộ, phải đọc trực tiếp `localStorage.getItem(MANUAL_STORAGE_KEY)` trong `useMemo` ở `useRoadmapState.ts:186-195,202-210,247-279` + biến `manualVersion`.
- Roadmap sync tay qua `syncFromManual()` ở `useRoadmapState.ts:281-388`. `page.tsx:147-150` truyền `InitialRoadmapData` manual->roadmap.
- Cache module-level ở `useNewsState.ts:20-21` `cacheNewsItems/cacheFanpageItems`. Stale khi remount, khó test.
- Không schema version, chỉ fallback `OLD_STORAGE_KEY` ở `useManualGPA.ts:8,18`.

## 5. Điểm nghẽn bảo trì

- `useRoadmapState.ts:80-99`: `loadSavedState()` chạy trong initializer render. Ghi đè khó đoán bởi effect `initialData` ở `:125-145`.
- `useRoadmapState.ts:186-279`: `localStorage` trong `useMemo`. Memo impure. Đổi tab cùng phiên không cập nhật nếu quên bump `manualVersion`.
- `useRoadmapState.ts:390-423` + `share-utils.ts:115`: ID bằng `Math.random().toString()`. Trùng key, mất ổn định khi share.
- `calculators.ts:74-103`: nhánh retake F/không-F bất đối xứng. `oldGrade` mặc định `'D'` do `parser.ts:62` gán sẵn. Sửa 1 nơi quên nơi kia.
- `calculators.ts:107`: magic `0.8/1.0` cảnh báo. `parser.ts:55,95`: magic `credits<20`.
- `parser.ts:10,20`: regex phụ thuộc format portal. Hỏng lặng lẽ, trả `[]`, toast chung chung ở `useManualGPA.ts:182`.
- `page.tsx:83-133`: effect làm 3 việc: decode share + init tab + preload. Preload thiếu `NewsTab` ở `:124-128`, delay `setTimeout 1500` cứng.
- `share-utils.ts:23-27`: clamp credits 255, mất `exactPoints`. Decode v3/v4 ở `:87-96` giữ mãi.
- `api/news.ts:53-58`: `t=${Date.now()}` phá cache HTTP. Không timeout/abort.
- `api/news.ts:76-84`: fallback `no-cors` luôn `return true`. Ghi fail vẫn toast success.
- `ManualTab.tsx:29-48` + `RoadmapTab.tsx:20-22`: hook trả object lớn, component re-render rộng. `useManualGPA` trả 15 field, `useRoadmapState` trả `state/actions/computed`.
- `news/` 21 file cho CRUD đơn: `CardMeta`, `SectionTitle`, `EmptyState`, `SearchField`, `FormFields`, `NewsForms`, `NewsFormModal`... Prop drilling, khó tìm luồng.
- `public/legacy/` giữ nguyên `core/calculator.js`, `state/store.js`, `ui/renderers.js`. Sửa công thức phải sửa 2 codebase.

## 6. Cảnh báo bảo mật

Mật khẩu admin đang được kiểm tra hoàn toàn ở phía client tại `src/hooks/useNewsState.ts:93-101` với chuỗi so sánh trực tiếp. Bất kỳ ai cũng có thể đọc mã nguồn trong trình duyệt và bỏ qua bước kiểm tra này để gọi API ghi dữ liệu. Mọi thao tác ghi lên Google Sheet hiện tại cũng không có xác thực thực sự ở phía server. Vì vậy, không nên dùng cơ chế này để bảo vệ dữ liệu quan trọng. Nếu cần phân quyền quản trị, bạn phải chuyển việc kiểm tra mật khẩu và xác thực các yêu cầu ghi ra phía server (ví dụ: trong Google Apps Script hoặc một API backend riêng).

## 7. Top 5 refactor ưu tiên

1. Gom key + đọc/ghi storage 1 module `lib/storage.ts`. Xóa string rời, xóa đọc trong `useMemo`. Lý do: coupling manual-roadmap hiện qua string.
2. Gom logic cải thiện 1 hàm `getImprovableCourses(semesters)` trong `lib/gpa`. Dùng chung cho `graduation-calculator`, `useRoadmapState`, `generators`. Xóa ~60 dòng lặp.
3. Sửa API client chung: 1 `apiPost`, timeout/abort, bỏ `no-cors return true`, env URL. Lý do: success giả + URL hardcode.
4. Xóa `gpa-engine.ts`, chuẩn import `@/lib/gpa`. Xóa `public/legacy/` hoặc đóng băng ghi rõ. Lý do: 2 nguồn sự thật công thức GPA.
5. Tách effect `page.tsx`: hook `useTabFromUrl()` + `useSharedRoadmap()` + preload `requestIdleCallback` đủ 5 tab. Lý do: effect đa trách nhiệm, dễ regress share URL.
