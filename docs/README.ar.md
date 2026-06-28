# Prism

[English](../README.md) | [简体中文](README.zh-Hans.md) | [繁體中文](README.zh-Hant.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Русский](README.ru.md) | [Tiếng Việt](README.vi.md) | [العربية](README.ar.md) | [فارسی](README.fa.md)

أداة تحويل اشتراكات البروكسي متعددة الصيغ، قابلة للنشر على Cloudflare Workers.

## الصيغ المدعومة

| الصيغة | كمصدر | كمخرج |
|------|:---:|:---:|
| Clash / Mihomo (YAML) | ✅ | ✅ |
| sing-box (JSON) | ⚠️ | ⚠️ |
| Surge (INI) | ⚠️ | ⚠️ |

> ⚠️ وظائف الاستيراد والتصدير لـ sing-box و Surge **لم يتم التحقق منها بعد** وقد تحتوي على مشكلات توافق.

## النشر السريع

### الطريقة الأولى: Cloudflare Dashboard

1. قم بعمل Fork لهذا المستودع إلى حساب GitHub الخاص بك
2. سجّل الدخول إلى [Cloudflare Dashboard](https://dash.cloudflare.com) وانتقل إلى **Workers & Pages**
3. انقر على **إنشاء تطبيق** → **Connect to GitHub**
4. اختر المستودع الذي قمت بعمل Fork له → **التالي** → **نشر**

### الطريقة الثانية: Wrangler CLI

```bash
git clone https://github.com/Motrans/prism.git
cd prism
npm install
npm run build
npx wrangler deploy
```

## هيكل المشروع

```
src/
├── worker.ts          # توجيه Worker + API التحويل
├── frontend/
│   ├── index.ts       # نقطة الدخول، تجميع HTML الواجهة الأمامية
│   ├── css.ts         # ورقة الأنماط (لوحة ألوان رمادية، RTL، متجاوبة)
│   ├── body.ts        # هيكل HTML (نموذج، قوائم منسدلة، عناصر تحكم)
│   └── script.ts      # سكريبت العميل (السمة، i18n، القوائم المنسدلة)
├── parsers/
│   ├── ini-parser.ts  # محلل إعدادات القواعد .ini
│   └── yaml-parser.ts # محلل اشتراكات Clash YAML
├── generators/
│   ├── clash.ts       # مخرج Clash YAML
│   ├── singbox.ts     # مخرج sing-box JSON
│   └── surge.ts       # مخرج Surge INI
└── utils/
    └── types.ts       # تعريفات الأنواع + المعاملات الافتراضية
```

## الترخيص

MIT © 2026 Zhong Zhiyu. All rights reserved.
