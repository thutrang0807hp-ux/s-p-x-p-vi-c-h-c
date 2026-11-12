# Nhịp học — sắp xếp việc học

Ứng dụng web học nhiều môn, lưu hồ sơ tại máy, kết hợp ChatGPT đang có bằng cách chuyển ngữ cảnh và nhập tổng kết. Đây là mã đầy đủ của bản đang triển khai, gồm lịch sử các vòng giao diện trước.

**Bản chạy:** https://nhip-hoc-gia-su-demo.guidingpumpkin16.chatgpt.site

## Chạy trên máy

Yêu cầu Node.js 20 trở lên; nên dùng Node.js 22 hoặc 24.

```bash
git clone https://github.com/thutrang0807hp-ux/s-p-x-p-vi-c-h-c.git
cd s-p-x-p-vi-c-h-c
npm ci
npm start
```

Mở **http://127.0.0.1:3000**. Không cần API key, database server hay bước build. `npm ci` cài công cụ kiểm thử/định dạng; phần ứng dụng chạy trực tiếp từ `dist/`.

Trình duyệt phải hỗ trợ IndexedDB. Dùng HTTP trên localhost hoặc HTTPS để clipboard và các tính năng trình duyệt hoạt động thuận lợi; không mở `index.html` bằng `file://`.

## Có thể dùng ngay

- Nhiều môn học, thư viện chung, gắn một tài liệu vào nhiều môn.
- Tải và giữ bản gốc PDF, DOCX, PPTX, TXT, MD tại máy. Mỗi tệp tối đa **20 MB**, tổng tối đa **50 MB**. TXT/MD nhỏ có thể được lấy làm trích đoạn; các định dạng khác chưa được phân tích tự động.
- Ghi chú, bộ nhớ môn học và lịch sử tổng kết riêng cho từng môn.
- Lịch FullCalendar theo tuần/tháng/ngày; thêm/sửa/xóa buổi bổ sung, kéo/thay thời lượng và kiểm tra trùng lịch.
- Bàn học rộng, chế độ tập trung, ẩn gia sư, đổi cỡ chữ và kéo thanh chia trên màn hình rộng.
- **Học với ChatGPT:** tạo gói học có mục tiêu, ghi chú, điểm yếu và trích đoạn; sao chép/tải để dùng trong cuộc chat của bạn.
- Nhập JSON tổng kết có bước xem trước; kiểm tra mã môn, mã buổi và chống nhập trùng; cập nhật bộ nhớ và ghi chú. Phần trăm tiến độ chỉ thay đổi nếu người học tự xác nhận.
- Hồ sơ người học, xuất/khôi phục sao lưu gồm cả tệp gốc, hoàn tác lần khôi phục gần nhất.

## Phần còn là mẫu hoặc chưa làm

- Gia sư chat bên trong bàn học và quiz hiện dùng kịch bản/câu hỏi mẫu, **không gọi model AI**.
- Lộ trình 6 chặng và quan hệ giữa các sách là minh họa; chưa có AI đọc, đối chiếu nhiều sách để sinh lộ trình thật.
- Telegram là mô phỏng đổi lịch trong giao diện; **chưa gửi tin hay nhắc tự động**.
- Chưa nối Notion, Google Calendar, Ollama hoặc tài khoản/model AI; không có backend hay đăng nhập ứng dụng.
- Chưa có ngân hàng câu hỏi thật, thi theo chương/kỳ, sinh đề ngẫu nhiên hoặc tự phân phối quỹ thời gian các môn.
- Không có kiểm thử trực quan/end-to-end bằng trình duyệt trong môi trường tạo mã này.

## Một vòng học bằng ChatGPT

1. Vào môn học → **Học với ChatGPT**.
2. Chọn bài, thời gian, mục tiêu và nguồn. Thêm trích đoạn thật nếu cần.
3. Tạo gói → sao chép → mở ChatGPT và dán. Nếu cần toàn văn sách, tự đính kèm bản gốc trong cuộc chat đó.
4. Học, trao đổi và phản biện. Cuối buổi nhắn **“kết thúc buổi”**.
5. Sao chép JSON tổng kết → nhập lại app → kiểm tra bản xem trước → xác nhận lưu.

App không sử dụng lượt Plus bằng API, không tự đăng nhập ChatGPT, không yêu cầu cookie hay token phiên đăng nhập. Chuyển tài khoản ChatGPT không xóa hồ sơ trong app; cần chủ động mang gói ngữ cảnh vào cuộc chat mới.

## Dữ liệu nằm ở đâu?

- IndexedDB `nhiphoc-learning`, hai store `workspace` và `files`.
- localStorage `nhiphoc-v2` là bản phản chiếu trạng thái nhỏ, hỗ trợ khôi phục thay đổi mới nếu lần ghi IndexedDB chưa hoàn tất.
- Tất cả gắn với **origin**: đổi host, giao thức hoặc cổng sẽ là vùng lưu khác.
- Dữ liệu ở bản chạy trên Sites **không tự xuất hiện khi clone repo và chạy localhost**. Trước khi chuyển, mở bản cũ → **Hồ sơ & sao lưu → Xuất bản sao lưu**. Sau đó khôi phục tại địa chỉ mới.
- Xóa dữ liệu trình duyệt, dùng chế độ riêng tư hoặc mất máy có thể làm mất hồ sơ. Giữ tệp sao lưu ở nơi khác.
- Sao lưu chứa ghi chú và tài liệu, **không được ứng dụng mã hóa**. Không commit sao lưu cá nhân vào repo.
- Repo chỉ chứa mã và tài liệu mẫu, không có hồ sơ/tệp cá nhân lưu trong trình duyệt.

## Cấu trúc

```text
dist/                 # Mã nguồn đồng thời là bản static triển khai
  index.html          # Khung ứng dụng và thứ tự nạp script
  app.js              # Môn, nguồn, lộ trình mẫu, bàn học và lịch
  storage.js          # IndexedDB, kiểm tra schema, sao lưu/khôi phục
  bridge.js           # Hồ sơ, tệp gốc, gói ChatGPT, nhập tổng kết
  style.css           # Giao diện responsive
  vendor/             # Thư viện cố định phiên bản, SVG và giấy phép
tests/                # Kiểm thử logic, DOM và IndexedDB mô phỏng
scripts/serve.mjs     # Static server để chạy tại máy
docs/                 # Kiến trúc, giới hạn và việc cần làm tiếp
.openai/hosting.json   # Cấu hình liên kết Sites hiện tại
DESIGN.md             # Các quyết định thiết kế và nguồn thư viện
AGENTS.md             # Ghi chú cho tác nhân phát triển tiếp
```

Mã frontend hiện dùng các script toàn cục, chưa chia thành ES modules. Không di chuyển riêng từng script hoặc đổi thứ tự nạp mà không chạy kiểm thử.

## Kiểm tra và định dạng

```bash
npm run check
npm test
npm run format
```

Ba bộ kiểm thử gồm logic môn/tài liệu, lịch và vòng lưu hồ sơ/ChatGPT. `linkedom` mô phỏng DOM, `fake-indexeddb` mô phỏng IndexedDB; kết quả không thay thế kiểm thử thật trên Chrome/Safari/Firefox.

## Triển khai

Host thư mục **`dist/`** trên dịch vụ static có HTTPS. Không cần build và không cần đưa `node_modules/` lên host. Các tuyến điều hướng dùng hash (`#course/stats/bridge`) nên không cần cấu hình chuyển mọi URL về index.

`.openai/hosting.json` giữ ID của Site hiện tại, không chứa khóa bí mật. Khi tạo một Site hoàn toàn mới, phải đăng ký và dùng cấu hình của Site mới; không dùng ID cũ để vô tình cập nhật bản đang chạy.

Các font Google được nạp từ mạng. Thư viện giao diện, lịch và chia khung đã được lưu trong `dist/vendor/`.

## Tài liệu phát triển tiếp

- [Kiến trúc và schema](docs/ARCHITECTURE.md)
- [Lộ trình phát triển](docs/ROADMAP.md)
- [Thư viện và giấy phép](docs/THIRD_PARTY.md)
- [Ghi chú thiết kế](DESIGN.md)
