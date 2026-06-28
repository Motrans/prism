# Prism

[English](../README.md) | [简体中文](README.zh-Hans.md) | [繁體中文](README.zh-Hant.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Русский](README.ru.md) | [Tiếng Việt](README.vi.md) | [العربية](README.ar.md) | [فارسی](README.fa.md)

跨格式代理訂閱轉換工具，可部署至 Cloudflare Workers。

## 支援格式

| 格式 | 作為來源 | 作為輸出 |
|------|:---:|:---:|
| Clash / Mihomo (YAML) | ✅ | ✅ |
| sing-box (JSON) | ⚠️ | ⚠️ |
| Surge (INI) | ⚠️ | ⚠️ |

> ⚠️ sing-box 與 Surge 的匯入與轉換功能**尚未經過驗證**，可能存有相容性問題。

## 快速部署

### 方式一：Cloudflare Dashboard 網頁端部署

1. Fork 本倉庫到你的 GitHub
2. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com)，進入 **Workers 和 Pages**
3. 點擊 **建立應用程式** → **Connect to GitHub**
4. 選擇你 Fork 的倉庫 → **下一步** → **部署**

### 方式二：Wrangler CLI 部署

```bash
git clone https://github.com/Motrans/prism.git
cd prism
npm install
npm run build
npx wrangler deploy
```

## 專案結構

```
src/
├── worker.ts          # Worker 路由 + 轉換 API
├── frontend/
│   ├── index.ts       # 入口，組裝前端 HTML
│   ├── css.ts         # 樣式表（灰階調色盤、RTL、響應式）
│   ├── body.ts        # HTML 主體（表單、下拉選單、控制項）
│   └── script.ts      # 用戶端腳本（主題、i18n、下拉選單）
├── parsers/
│   ├── ini-parser.ts  # .ini 規則設定解析
│   └── yaml-parser.ts # Clash YAML 訂閱解析
├── generators/
│   ├── clash.ts       # Clash YAML 輸出
│   ├── singbox.ts     # sing-box JSON 輸出
│   └── surge.ts       # Surge INI 輸出
└── utils/
    └── types.ts       # 型別定義 + 預設參數
```

## 授權

MIT © 2026 Zhong Zhiyu. All rights reserved.
