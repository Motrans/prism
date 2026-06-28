# Prism

[English](../README.md) | [简体中文](README.zh-Hans.md) | [繁體中文](README.zh-Hant.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Русский](README.ru.md) | [Tiếng Việt](README.vi.md) | [العربية](README.ar.md) | [فارسی](README.fa.md)

ابزار تبدیل اشتراک پروکسی چند فرمتی، قابل استقرار بر روی Cloudflare Workers.

## فرمت‌های پشتیبانی‌شده

| فرمت | به‌عنوان منبع | به‌عنوان خروجی |
|------|:---:|:---:|
| Clash / Mihomo (YAML) | ✅ | ✅ |
| sing-box (JSON) | ⚠️ | ⚠️ |
| Surge (INI) | ⚠️ | ⚠️ |

> ⚠️ قابلیت ورودی و خروجی برای sing-box و Surge **هنوز تأیید نشده** و ممکن است مشکلات سازگاری داشته باشد.

## استقرار سریع

### روش ۱: Cloudflare Dashboard

1. این مخزن را در GitHub خود Fork کنید
2. وارد [Cloudflare Dashboard](https://dash.cloudflare.com) شوید و به **Workers & Pages** بروید
3. روی **ایجاد برنامه** → **Connect to GitHub** کلیک کنید
4. مخزن Fork شده را انتخاب کنید → **بعدی** → **استقرار**

### روش ۲: Wrangler CLI

```bash
git clone https://github.com/Motrans/prism.git
cd prism
npm install
npm run build
npx wrangler deploy
```

## ساختار پروژه

```
src/
├── worker.ts          # مسیریابی Worker + API تبدیل
├── frontend/
│   ├── index.ts       # نقطه ورود، مونتاژ HTML فرانت‌اند
│   ├── css.ts         # شیوه‌نامه (پالت خاکستری، RTL، واکنش‌گرا)
│   ├── body.ts        # بدنه HTML (فرم، کشویی‌ها، کنترلها)
│   └── script.ts      # اسکریپت سمت کلاینت (تم، i18n، کشویی)
├── parsers/
│   ├── ini-parser.ts  # تجزیه‌گر قوانین .ini
│   └── yaml-parser.ts # تجزیه‌گر اشتراک Clash YAML
├── generators/
│   ├── clash.ts       # خروجی Clash YAML
│   ├── singbox.ts     # خروجی sing-box JSON
│   └── surge.ts       # خروجی Surge INI
└── utils/
    └── types.ts       # تعاریف نوع + پارامترهای پیش‌فرض
```

## مجوز

MIT © 2026 Zhong Zhiyu. All rights reserved.
