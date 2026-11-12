# Thư viện và nguồn thiết kế

## Có trong bản chạy

| Thành phần                                | Phiên bản                     | Repo                                         | Giấy phép đi kèm                       |
| ----------------------------------------- | ----------------------------- | -------------------------------------------- | -------------------------------------- |
| Tabler Core                               | 1.4.0                         | https://github.com/tabler/tabler             | `dist/vendor/TABLER-LICENSE.txt`       |
| Tabler Icons                              | 31 SVG outline đã chụp vào mã | https://github.com/tabler/tabler-icons       | `dist/vendor/TABLER-ICONS-LICENSE.txt` |
| FullCalendar standard bundle và locale vi | 6.1.19                        | https://github.com/fullcalendar/fullcalendar | `dist/vendor/FULLCALENDAR-LICENSE.txt` |
| Split.js                                  | 1.6.5                         | https://github.com/nathancahill/split        | `dist/vendor/SPLIT-LICENSE.txt`        |

Các bản phân phối và giấy phép được lưu trong repo, không cần CDN để tải các thư viện này khi chạy. Không dùng FullCalendar premium.

Font Be Vietnam Pro được tải từ Google Fonts trong `index.html`; có font sans-serif dự phòng khi mất mạng. Nếu muốn đóng gói font để offline, cần lấy đúng file và kèm giấy phép của font.

## Công cụ thiết kế đã tham khảo

[UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) được dùng để đọc hướng dẫn và tìm định hướng. Đây là công cụ hỗ trợ thiết kế, không phải dependency runtime; toàn bộ repo công cụ đó không được copy vào ứng dụng. Các lựa chọn cụ thể được ghi trong `DESIGN.md`.

## Chỉ dùng khi phát triển

- `fake-indexeddb` 6.2.4: mô phỏng IndexedDB cho kiểm thử.
- `linkedom` 0.18.12: DOM cho kiểm thử Node.
- `prettier` 3.6.2: định dạng mã.

Cài đúng phiên bản và dependency bắc cầu qua `npm ci` / `package-lock.json`. Giữ thông báo giấy phép tương ứng khi phân phối lại dependency.

Repo chưa áp đặt một giấy phép mới cho toàn bộ mã ứng dụng do người dùng sở hữu; giấy phép của các thành phần bên thứ ba vẫn áp dụng riêng.
