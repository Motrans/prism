# Prism

[English](../README.md) | [简体中文](README.zh-Hans.md) | [繁體中文](README.zh-Hant.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Русский](README.ru.md) | [Tiếng Việt](README.vi.md) | [العربية](README.ar.md) | [فارسی](README.fa.md)

멀티 포맷 프록시 구독 변환 도구이며, Cloudflare Workers에 배포할 수 있습니다.

## 지원 형식

| 형식 | 입력 | 출력 |
|------|:---:|:---:|
| Clash / Mihomo (YAML) | ✅ | ✅ |
| sing-box (JSON) | ⚠️ | ⚠️ |
| Surge (INI) | ⚠️ | ⚠️ |

> ⚠️ sing-box 및 Surge의 임포트/익스포트 기능은 **아직 검증되지 않았으며**, 호환성 문제가 있을 수 있습니다.

## 빠른 배포

### 방법 1: Cloudflare Dashboard

1. 이 저장소를 GitHub에 Fork하세요
2. [Cloudflare Dashboard](https://dash.cloudflare.com)에 로그인하고 **Workers & Pages**로 이동하세요
3. **애플리케이션 만들기** → **Connect to GitHub**
4. Fork한 저장소를 선택 → **다음** → **배포**

### 방법 2: Wrangler CLI

```bash
git clone https://github.com/Motrans/prism.git
cd prism
npm install
npm run build
npx wrangler deploy
```

## 프로젝트 구조

```
src/
├── worker.ts          # Worker 라우팅 + 변환 API
├── frontend/
│   ├── index.ts       # 진입점, 프론트엔드 HTML 구성
│   ├── css.ts         # 스타일시트 (그레이스케일 팔레트, RTL, 반응형)
│   ├── body.ts        # HTML 본문 (폼, 드롭다운, 컨트롤)
│   └── script.ts      # 클라이언트 스크립트 (테마, i18n, 드롭다운)
├── parsers/
│   ├── ini-parser.ts  # .ini 규칙 설정 파서
│   └── yaml-parser.ts # Clash YAML 구독 파서
├── generators/
│   ├── clash.ts       # Clash YAML 출력
│   ├── singbox.ts     # sing-box JSON 출력
│   └── surge.ts       # Surge INI 출력
└── utils/
    └── types.ts       # 타입 정의 + 기본 매개변수
```

## 라이선스

MIT © 2026 Zhong Zhiyu. All rights reserved.
