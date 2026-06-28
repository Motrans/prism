# Prism

[English](../README.md) | [简体中文](README.zh-Hans.md) | [繁體中文](README.zh-Hant.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Русский](README.ru.md) | [Tiếng Việt](README.vi.md) | [العربية](README.ar.md) | [فارسی](README.fa.md)

マルチフォーマット対応プロキシサブスクリプション変換ツール。Cloudflare Workers にデプロイ可能です。

## 対応フォーマット

| フォーマット | 入力 | 出力 |
|------|:---:|:---:|
| Clash / Mihomo (YAML) | ✅ | ✅ |
| sing-box (JSON) | ⚠️ | ⚠️ |
| Surge (INI) | ⚠️ | ⚠️ |

> ⚠️ sing-box および Surge のインポート・エクスポート機能は**動作検証が未完了**であり、互換性の問題が発生する可能性があります。

## クイックデプロイ

### 方法 1: Cloudflare Dashboard

1. このリポジトリをあなたの GitHub に Fork する
2. [Cloudflare Dashboard](https://dash.cloudflare.com) にログインし、**Workers & Pages** を開く
3. **アプリケーションを作成** → **Connect to GitHub**
4. Fork したリポジトリを選択 → **次へ** → **デプロイ**

### 方法 2: Wrangler CLI

```bash
git clone https://github.com/Motrans/prism.git
cd prism
npm install
npm run build
npx wrangler deploy
```

## プロジェクト構成

```
src/
├── worker.ts          # Worker ルーティング + 変換 API
├── frontend/
│   ├── index.ts       # エントリポイント、フロントエンド HTML を組み立て
│   ├── css.ts         # スタイルシート（グレースケールパレット、RTL、レスポンシブ）
│   ├── body.ts        # HTML 本体（フォーム、ドロップダウン、コントロール）
│   └── script.ts      # クライアントスクリプト（テーマ、i18n、ドロップダウン）
├── parsers/
│   ├── ini-parser.ts  # .ini ルール設定パーサー
│   └── yaml-parser.ts # Clash YAML サブスクリプションパーサー
├── generators/
│   ├── clash.ts       # Clash YAML 出力
│   ├── singbox.ts     # sing-box JSON 出力
│   └── surge.ts       # Surge INI 出力
└── utils/
    └── types.ts       # 型定義 + デフォルトパラメータ
```

## ライセンス

MIT © 2026 Zhong Zhiyu. All rights reserved.
