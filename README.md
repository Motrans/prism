# Prism

[English](README.md) | [简体中文](docs/README.zh-Hans.md) | [繁體中文](docs/README.zh-Hant.md) | [日本語](docs/README.ja.md) | [한국어](docs/README.ko.md) | [Русский](docs/README.ru.md) | [Tiếng Việt](docs/README.vi.md) | [العربية](docs/README.ar.md) | [فارسی](docs/README.fa.md)

Cross-format proxy subscription converter, deployable to Cloudflare Workers.

## Supported Formats

| Format | As Source | As Output |
|--------|:---------:|:---------:|
| Clash / Mihomo (YAML) | ✅ | ✅ |
| sing-box (JSON) | ⚠️ | ⚠️ |
| Surge (INI) | ⚠️ | ⚠️ |

> ⚠️ sing-box and Surge import/export functionality **has not been verified** and may contain compatibility issues.

## Quick Deploy

### Option 1: Cloudflare Dashboard

1. Fork this repository to your GitHub
2. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com) and go to **Workers & Pages**
3. Click **Create application** → **Connect to GitHub**
4. Select your forked repository → **Next** → **Deploy**

### Option 2: Wrangler CLI

```bash
git clone https://github.com/Motrans/prism.git
cd prism
npm install
npm run build
npx wrangler deploy
```

## Project Structure

```
src/
├── worker.ts          # Worker routes + conversion API
├── frontend/
│   ├── index.ts       # Entry point, assembles frontend HTML
│   ├── css.ts         # Stylesheet (grayscale palette, RTL, responsive)
│   ├── body.ts        # HTML body (form, dropdowns, controls)
│   └── script.ts      # Client-side JS (theme, i18n, dropdown)
├── parsers/
│   ├── ini-parser.ts  # .ini rule config parser
│   └── yaml-parser.ts # Clash YAML subscription parser
├── generators/
│   ├── clash.ts       # Clash YAML output
│   ├── singbox.ts     # sing-box JSON output
│   └── surge.ts       # Surge INI output
└── utils/
    └── types.ts       # Type definitions + default parameters
```

## License

MIT © 2026 Zhong Zhiyu. All rights reserved.
