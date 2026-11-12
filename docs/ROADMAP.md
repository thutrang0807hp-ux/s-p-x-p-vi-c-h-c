# Phát triển tiếp

## Mục tiêu sản phẩm

Gia sư đồng hành cho nhiều môn: lập lộ trình từ nhiều nguồn, trao đổi/ phản biện, kiểm tra kiến thức, giữ hồ sơ và điều chỉnh lịch linh hoạt. Ưu tiên chi phí thấp bằng ChatGPT đang có; giữ dữ liệu học độc lập với tài khoản/model AI.

## Việc nên làm tiếp

### 1. Hoàn thiện nền tảng và kiểm thử trên máy thật

- Tách script toàn cục thành module, giữ các schema/migration tương thích.
- Rà giao diện ở màn hình nhỏ/lớn, bàn phím, độ tương phản; kiểm thử browser thật.
- Bổ sung lỗi/quota, xóa tệp gốc để giải phóng dung lượng, sao lưu lớn và xung đột nhiều tab.
- Thay ngày giờ minh họa cố định bằng lịch thực và tùy chọn múi giờ.
- Cân nhắc PWA nếu cần dùng offline. Hiện chưa có service worker và font còn tải từ Google.

### 2. Ngân hàng câu hỏi và kiểm tra thật

- Lưu câu hỏi, đáp án, giải thích, nguồn và chương/bài theo môn.
- Nhập câu hỏi do người học cùng ChatGPT tạo, duyệt trước khi dùng.
- Thi theo bài/chương/kỳ; ngẫu nhiên có phạm vi, tránh lặp; ôn điểm yếu.
- Lịch sử từng lần làm, độ chắc kiến thức và lịch ôn; không chỉ dựa vào phần trăm AI tự đánh giá.

### 3. Telegram nhắc lịch thật

- Backend/scheduler và bot với khóa đặt trong secret phía server.
- Bắt đầu bằng nút: học ngay, hoãn 30 phút, sang mai, chọn giờ.
- Đồng bộ với lịch chung, kiểm tra xung đột; sau đó mới cân nhắc hiểu ngôn ngữ tự do bằng AI.
- Không đưa bot token vào frontend hoặc repo.

### 4. Notion tùy chọn

- Xuất ghi chú, tổng kết và kế hoạch một chiều trước.
- Sau khi dùng ổn mới nhập nội dung và đồng bộ hai chiều có xử lý xung đột.
- Hồ sơ cốt lõi vẫn phải dùng được khi không có Notion.

### 5. Tài liệu và lộ trình nhiều sách

- Trích xuất PDF/DOCX/PPTX, giữ số trang và nguồn.
- Chọn sách chính, phát hiện nội dung trùng/bổ sung, bản đề xuất cho người học duyệt.
- Không khẳng định đã đọc/so sánh sách chỉ từ tên tệp.

### 6. Quỹ thời gian và kết nối model

- Quỹ thời gian chung, ưu tiên và hạn của từng môn; cảnh báo kế hoạch vượt thời gian khả dụng.
- Nếu cần tích hợp AI trong app: model tại máy hoặc API do người dùng cấu hình, có đo chi phí.
- Chỉ dùng cơ chế đăng nhập/thuê bao chính thức nếu nhà cung cấp hỗ trợ đúng trường hợp; không thu cookie hay token phiên ChatGPT.
- Nếu thêm tài khoản/cloud sync, cần thiết kế quyền sở hữu dữ liệu, sao lưu, migration và xuất/nhập trước.

## Chưa có cam kết về dịch vụ ngoài

Repo chưa nối hay cấu hình tài khoản Notion, Telegram, Google Calendar hoặc AI. UI có lịch giống ứng dụng calendar nhưng không phải tích hợp tài khoản Google. Bản Sites hiện tại là ứng dụng static giữ dữ liệu trong trình duyệt.
