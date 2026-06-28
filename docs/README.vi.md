# Prism

[English](../README.md) | [简体中文](README.zh-Hans.md) | [繁體中文](README.zh-Hant.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Русский](README.ru.md) | [Tiếng Việt](README.vi.md) | [العربية](README.ar.md) | [فارسی](README.fa.md)

Công cụ chuyển đổi đăng ký proxy đa định dạng, có thể triển khai trên Cloudflare Workers.

## Định dạng được hỗ trợ

| Định dạng | Nguồn | Đầu ra |
|------|:---:|:---:|
| Clash / Mihomo (YAML) | ✅ | ✅ |
| sing-box (JSON) | ⚠️ | ⚠️ |
| Surge (INI) | ⚠️ | ⚠️ |

> ⚠️ Chức năng nhập và xuất đối với sing-box và Surge **chưa được kiểm chứng** và có thể gặp vấn đề tương thích.

## Triển khai nhanh

### Cách 1: Cloudflare Dashboard

1. Fork kho lưu trữ này về GitHub của bạn
2. Đăng nhập vào [Cloudflare Dashboard](https://dash.cloudflare.com), vào mục **Workers & Pages**
3. Nhấn **Tạo ứng dụng** → **Connect to GitHub**
4. Chọn kho lưu trữ đã fork → **Tiếp theo** → **Triển khai**

### Cách 2: Wrangler CLI

```bash
git clone https://github.com/Motrans/prism.git
cd prism
npm install
npm run build
npx wrangler deploy
```

## Cấu trúc dự án

```
src/
├── worker.ts          # Định tuyến Worker + API chuyển đổi
├── frontend/
│   ├── index.ts       # Điểm vào, lắp ráp HTML giao diện
│   ├── css.ts         # Bảng định kiểu (bảng màu xám, RTL, đáp ứng)
│   ├── body.ts        # HTML (biểu mẫu, danh sách thả xuống, điều khiển)
│   └── script.ts      # Script phía máy khách (chủ đề, i18n, danh sách thả xuống)
├── parsers/
│   ├── ini-parser.ts  # Trình phân tích cú pháp .ini
│   └── yaml-parser.ts # Trình phân tích cú pháp đăng ký Clash YAML
├── generators/
│   ├── clash.ts       # Đầu ra Clash YAML
│   ├── singbox.ts     # Đầu ra sing-box JSON
│   └── surge.ts       # Đầu ra Surge INI
└── utils/
    └── types.ts       # Định nghĩa kiểu + tham số mặc định
```

## Giấy phép

MIT © 2026 Zhong Zhiyu. All rights reserved.
