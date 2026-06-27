# Prism

跨格式代理订阅转换工具，可部署至 Cloudflare Workers。

## 支持格式

| 格式 | 作为源 | 作为输出 |
|------|:---:|:---:|
| Clash / Mihomo (YAML) | ✅ | ✅ |
| sing-box (JSON) | ⚠️ | ⚠️ |
| Surge (INI) | ⚠️ | ⚠️ |

> ⚠️ sing-box 与 Surge 的导入与转换功能**尚未验证可用性**，可能存在兼容性问题。

## 快速部署

### 方式一：Cloudflare Dashboard 网页端部署

1. Fork 本仓库到你的 GitHub
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)，进入 **Workers 和 Pages**
3. 点击 **创建应用程序** → **Continue with GitHub**
4. 选择你 Fork 的仓库 → **下一步** → **部署**

### 方式二：Wrangler CLI 部署

```bash
git clone https://github.com/Motrans/prism.git
cd prism
npm install
npm run build
npx wrangler deploy
```

## 项目结构

```
src/
├── worker.ts          # Worker 路由 + 转换 API
├── frontend/
│   └── index.ts       # 前端页面
├── parsers/
│   ├── ini-parser.ts  # .ini 规则配置解析
│   └── yaml-parser.ts # Clash YAML 订阅解析
├── generators/
│   ├── clash.ts       # Clash 格式输出
│   ├── singbox.ts     # sing-box 格式输出
│   └── surge.ts       # Surge 格式输出
└── utils/
    └── types.ts       # 类型定义 + 默认参数
```

## 许可

MIT © 2026 Zhong Zhiyu. All rights reserved.