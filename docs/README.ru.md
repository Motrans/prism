# Prism

[English](../README.md) | [简体中文](README.zh-Hans.md) | [繁體中文](README.zh-Hant.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Русский](README.ru.md) | [Tiếng Việt](README.vi.md) | [العربية](README.ar.md) | [فارسی](README.fa.md)

Конвертер прокси-подписок с поддержкой разных форматов, разворачиваемый на Cloudflare Workers.

## Поддерживаемые форматы

| Формат | Источник | Вывод |
|------|:---:|:---:|
| Clash / Mihomo (YAML) | ✅ | ✅ |
| sing-box (JSON) | ⚠️ | ⚠️ |
| Surge (INI) | ⚠️ | ⚠️ |

> ⚠️ Функции импорта и экспорта для sing-box и Surge **не были проверены** и могут содержать проблемы совместимости.

## Быстрое развёртывание

### Способ 1: Cloudflare Dashboard

1. Форкните этот репозиторий на GitHub
2. Войдите в [Cloudflare Dashboard](https://dash.cloudflare.com) и перейдите в **Workers & Pages**
3. Нажмите **Создать приложение** → **Connect to GitHub**
4. Выберите форкнутый репозиторий → **Далее** → **Развернуть**

### Способ 2: Wrangler CLI

```bash
git clone https://github.com/Motrans/prism.git
cd prism
npm install
npm run build
npx wrangler deploy
```

## Структура проекта

```
src/
├── worker.ts          # Маршруты Worker + API конвертации
├── frontend/
│   ├── index.ts       # Точка входа, сборка фронтенд HTML
│   ├── css.ts         # Таблица стилей (серая палитра, RTL, адаптивная вёрстка)
│   ├── body.ts        # HTML (форма, выпадающие списки, элементы управления)
│   └── script.ts      # Клиентский скрипт (тема, i18n, выпадающие списки)
├── parsers/
│   ├── ini-parser.ts  # Парсер .ini конфигурации правил
│   └── yaml-parser.ts # Парсер Clash YAML подписок
├── generators/
│   ├── clash.ts       # Вывод в Clash YAML
│   ├── singbox.ts     # Вывод в sing-box JSON
│   └── surge.ts       # Вывод в Surge INI
└── utils/
    └── types.ts       # Определения типов + параметры по умолчанию
```

## Лицензия

MIT © 2026 Zhong Zhiyu. All rights reserved.
