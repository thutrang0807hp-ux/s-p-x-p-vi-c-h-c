# Kiến trúc hiện tại

## Cách chạy

Ứng dụng là HTML/CSS/JavaScript thuần, chạy phía trình duyệt. Không có backend, server AI hay database cloud. `dist/` là mã nguồn và cũng là thư mục triển khai static. `scripts/serve.mjs` chỉ phục vụ tệp khi phát triển tại máy.

Thứ tự script trong `index.html`:

1. FullCalendar global và locale tiếng Việt.
2. Split.js.
3. `app.js`: dữ liệu mẫu, các hàm dùng chung, view, sự kiện và lịch.
4. `storage.js`: thay hàm lưu bằng IndexedDB và cung cấp các hàm kiểm tra dữ liệu.
5. `bridge.js`: hồ sơ, gói học, nhập tổng kết và khởi động qua `bootLearningApp()`.

Một số hàm toàn cục được thay thế có chủ ý trong script phía sau (ví dụ `save`, `sourceModal`, `upload`). Khi tách module, cần bỏ cơ chế này theo từng bước, giữ thứ tự khởi tạo và kiểm thử tương đương.

## Trạng thái

`state` chứa:

- `courses`: tên, mục tiêu, tiến độ, bài đang học, lịch chính, nguồn, ghi chú, hội thoại mẫu, bộ nhớ, gói học và các buổi đã nhập tổng kết.
- `files`: metadata nguồn, trích đoạn và cờ có bản gốc tại máy. Tệp nhị phân không nằm trong state JSON.
- `extraSessions`: các buổi bổ sung cho lịch FullCalendar.
- `learner`: tên và sở thích học.
- `tele`: hội thoại Telegram mô phỏng.
- `calendarVersion`, `schemaVersion`, `updatedAt`: thông tin phiên bản/thời điểm.

`getSessions()` kết hợp một buổi chính từ mỗi môn với `extraSessions`. Đổi buổi chính cập nhật ngày/giờ của môn; đổi buổi bổ sung cập nhật phần tử tương ứng. Kiểm tra trùng giờ dùng chung cho giao diện lịch và Telegram mô phỏng.

Dữ liệu lịch ban đầu cố định ở tuần **9–15/11/2026** để minh họa, không phải lịch đồng bộ với ngày hiện tại. Các hàm hiển thị “Hôm nay/Ngày mai” vẫn có giá trị mẫu cố định và cần thay khi phát triển thành sản phẩm thật.

## Lưu trữ

IndexedDB:

```text
Database: nhiphoc-learning
Version: 1
workspace:
  current  -> state hiện tại
  previous -> { data, files } trước lần khôi phục gần nhất
files:
  { id, name, blob }, keyPath = id
```

`save()` ghi bản nhỏ đồng bộ vào localStorage `nhiphoc-v2`, rồi xếp hàng ghi snapshot vào IndexedDB. Khi khởi động, app kiểm tra và chọn snapshot mới hơn giữa bản local và IndexedDB. Các bản gốc tải lên được commit cùng metadata trong một transaction.

Các giới hạn hiện tại:

- 20 MB mỗi tệp, tổng 50 MB tệp gốc.
- 100 môn, 1.000 nguồn trong hồ sơ nhập; tối đa 100 gói gần nhất/môn và 500 tổng kết/môn khi kiểm tra schema.
- Khôi phục qua UI giới hạn tệp sao lưu ở 75 MB.
- Mỗi trích đoạn lưu tối đa 20.000 ký tự; gói học chọn tối đa 20 nguồn, lấy tối đa 6.000 ký tự/nguồn và tổng 24.000 ký tự trích đoạn.

Chưa có xử lý xung đột giữa nhiều tab/máy, mã hóa dữ liệu hay đồng bộ cloud. Sao lưu là cách chuyển giữa các origin và thiết bị.

## Gói học ChatGPT

Mỗi gói có mã ổn định, ví dụ `packet-<uuid>`, môn đích, chủ đề, thời lượng, danh sách nguồn và nội dung prompt. Prompt bao gồm:

- Mục tiêu môn và buổi học.
- Sở thích người học.
- Bộ nhớ môn, ghi chú gần đây.
- Chỉ những trích đoạn đã chọn; phân biệt nguồn mẫu, tên nguồn và bản gốc chưa gửi.
- Hướng dẫn gia sư và schema tổng kết.

Không có request gửi prompt/tài liệu tới nhà cung cấp AI. Người học chủ động copy hoặc tải `.txt`, mở ChatGPT, dán và đính kèm tài liệu nếu cần.

## Tổng kết buổi học

Schema trả về từ ChatGPT:

```json
{
  "format": "nhiphoc-session",
  "version": 1,
  "packetId": "packet-EXAMPLE",
  "courseId": "stats",
  "lesson": "Biến cố và xác suất",
  "summary": "Những gì thực sự đã học trong buổi này",
  "mastered": ["Ý đã kiểm tra được"],
  "needsReview": ["Ý còn yếu"],
  "nextLesson": "Chủ đề buổi sau",
  "notes": "Ghi chú thêm",
  "minutesStudied": 30,
  "quiz": { "correct": 2, "total": 3 },
  "suggestedProgress": null
}
```

Mã trên chỉ minh họa, không phải tổng kết nhập được: ID phải khớp một gói có thật trong hồ sơ. `quiz` có thể là `null` nếu chưa kiểm tra.

Luồng nhập:

1. Phân tích JSON, cho phép khối Markdown ```json.
2. Kiểm tra version, môn đang mở, mã gói có thật, chưa nhập trùng, thời lượng và kết quả quiz hợp lệ.
3. Hiển thị nội dung để người học kiểm tra.
4. Sau xác nhận, thêm lịch sử, cập nhật bộ nhớ và tùy chọn thêm ghi chú.
5. Chỉ áp dụng phần trăm tiến độ khi người học đánh dấu xác nhận riêng.

App không xác thực độc lập chất lượng đánh giá của AI; tổng kết được người học xem và xác nhận.

## Sao lưu

Envelope `nhiphoc-backup`, version 1:

```json
{
  "format": "nhiphoc-backup",
  "version": 1,
  "createdAt": "ISO timestamp",
  "data": { "courses": [], "files": [], "learner": {} },
  "files": [
    {
      "id": "file-id",
      "name": "notes.md",
      "type": "text/markdown",
      "bytes": 10,
      "data": "base64"
    }
  ]
}
```

Cấu trúc `data` đầy đủ được kiểm tra bởi `checkedState()`. Khôi phục không áp dụng ngay khi chọn tệp: UI xem trước và xác nhận thay dữ liệu, sau đó thay workspace/files trong transaction và giữ bản trước đó để hoàn tác.

## Kiểm thử

- `core.test.cjs`: logic/view mẫu và tách dữ liệu theo môn.
- `calendar.test.cjs`: cấu hình lịch, thêm/xóa buổi, cập nhật, xung đột và điều khiển bàn học. FullCalendar/Split được thay bằng stub tại biên thư viện.
- `learning.test.cjs`: DOM qua linkedom, IndexedDB qua fake-indexeddb; prompt, form, nhập tổng kết, bảo vệ ID/trùng, tệp, sao lưu/khôi phục, reload và fallback.

Đây không phải browser E2E. Cần bổ sung Chrome/Safari/Firefox, clipboard, download, IndexedDB quota và kéo lịch/chia khung bằng chuột/cảm ứng trước khi xem là sản phẩm hoàn chỉnh.
