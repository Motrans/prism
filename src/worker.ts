// ============================================================
// Prism - Cloudflare Worker 入口
// 代理订阅转换工具的完整后端
// ============================================================

import { Hono } from 'hono';
import type { Context } from 'hono';
import { getCookie } from 'hono/cookie';
import { parseClashYaml } from './parsers/yaml-parser';
import { parseIniConfig } from './parsers/ini-parser';
import { generateClashConfig } from './generators/clash';
import { generateSingboxConfig } from './generators/singbox';
import { generateSurgeConfig } from './generators/surge';
import type { ConversionParams, OutputTarget, ParsedIniConfig, RulesetEntry } from './utils/types';
import { DEFAULT_PARAMS } from './utils/types';
import { FRONTEND_HTML } from './frontend/index';

const app = new Hono();

// ============================================================
// 路由：前端页面
// ============================================================
app.get('/', (c: Context) => {
  const theme = getCookie(c, 'prism-theme');
  if (theme === 'light' || theme === 'dark') {
    const html = FRONTEND_HTML.replace(
      '<html lang="zh-CN">',
      `<html lang="zh-CN" data-theme="${theme}">`
    );
    return c.html(html);
  }
  return c.html(FRONTEND_HTML);
});

// ============================================================
// 路由：订阅转换 API
// GET /sub?target=clash&url=...&config=...
// ============================================================
app.get('/sub', async (c: Context) => {
  try {
    const params = parseQueryParams(c);

    if (!params.url) {
      return c.text('错误：缺少 url 参数（原始订阅链接）', 400);
    }

    // 获取原始订阅内容，同时捕获原始订阅的流量/到期信息头
    let sourceContent: string;
    let upstreamUserInfo: string | null = null;
    try {
      const response = await fetch(params.url, {
        headers: { 'User-Agent': 'clash-verge/2.0' },
      });
      if (!response.ok) {
        return c.text(`错误：无法下载订阅链接，HTTP ${response.status}`, 502);
      }
      upstreamUserInfo = response.headers.get('subscription-userinfo');
      sourceContent = await response.text();
    } catch (err) {
      return c.text(`错误：下载订阅链接失败 - ${(err as Error).message}`, 502);
    }

    // 解析原始订阅
    let sourceConfig;
    try {
      sourceConfig = parseClashYaml(sourceContent);
    } catch (err) {
      return c.text(`错误：解析订阅内容失败 - ${(err as Error).message}`, 400);
    }

    if (!sourceConfig.proxies || sourceConfig.proxies.length === 0) {
      return c.text('错误：订阅中未找到代理节点', 400);
    }

    // 获取外部规则配置
    let iniConfig: ParsedIniConfig = createDefaultIniConfig();
    const ruleContents: Record<string, string[]> = {};

    if (params.config) {
      try {
        const configResponse = await fetch(params.config, {
          headers: { 'User-Agent': 'clash-verge/2.0' },
        });
        if (configResponse.ok) {
          const iniContent = await configResponse.text();
          iniConfig = parseIniConfig(iniContent);

          // 并行下载所有远程规则集
          const downloadPromises = iniConfig.rulesetEntries
            .filter((entry: RulesetEntry) => !entry.isSpecial && entry.url)
            .map(async (entry: RulesetEntry) => {
              try {
                const ruleResponse = await fetch(entry.url, {
                  headers: { 'User-Agent': 'clash-verge/2.0' },
                });
                if (ruleResponse.ok) {
                  const text = await ruleResponse.text();
                  return {
                    url: entry.url,
                    lines: text.split('\n')
                      .map((l: string) => l.trim())
                      .filter((l: string) => l && !l.startsWith('#') && !l.startsWith(';')),
                  };
                }
              } catch { /* 单个规则集下载失败不阻塞 */ }
              return { url: entry.url, lines: [] as string[] };
            });

          const results = await Promise.all(downloadPromises);
          for (const { url, lines } of results) {
            ruleContents[url] = lines;
          }
        }
      } catch (err) {
        console.error('下载规则配置失败:', (err as Error).message);
      }
    }

    // 生成目标格式
    let output: string;
    let contentType: string;
    // 决定订阅名称
    const cleanBase = (params.filename || "Prism").replace(/\.(yaml|json|conf)$/i, "");
    // ★ 订阅名称不含扩展名，Clash Verge 读取 profile-title 或 Content-Disposition

    switch (params.target) {
      case 'clash':
        output = generateClashConfig(sourceConfig, iniConfig, params, ruleContents);
        contentType = 'text/yaml; charset=utf-8';
        break;

      case 'singbox':
        output = generateSingboxConfig(sourceConfig, iniConfig, params, ruleContents);
        contentType = 'application/json; charset=utf-8';
        break;

      case 'surge':
        output = generateSurgeConfig(sourceConfig, iniConfig, params, ruleContents);
        contentType = 'text/plain; charset=utf-8';
        break;

      default:
        return c.text('错误：不支持的 target 类型', 400);
    }

    // 构建订阅信息头: 优先透传上游的，否则给占位数据
    const userInfoHeader = upstreamUserInfo && upstreamUserInfo.trim() !== ''
      ? upstreamUserInfo
      : 'upload=0; download=0; total=0; expire=0';

    return new Response(output, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename=${cleanBase}`,
        'Access-Control-Allow-Origin': '*',
        'subscription-userinfo': userInfoHeader,
        'profile-update-interval': '24',
        'profile-title': cleanBase,
      },
    });
  } catch (err) {
    console.error('转换异常:', (err as Error).message);
    return c.text(`内部错误：${(err as Error).message}`, 500);
  }
});

// CORS 预检
app.options('/sub', (c: Context) => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
});

// ============================================================
// 参数解析
// ============================================================
function parseQueryParams(c: Context): ConversionParams {
  const q = c.req.query() as Record<string, string>;
  return {
    target: (q['target'] as OutputTarget) || DEFAULT_PARAMS.target,
    url: q['url'] || DEFAULT_PARAMS.url,
    config: q['config'] || undefined,
    include: q['include'] || undefined,
    exclude: q['exclude'] || undefined,
    filename: q['filename'] || undefined,
    emoji: parseBool(q['emoji']) ?? DEFAULT_PARAMS.emoji,
    append_type: parseBool(q['append_type']) ?? DEFAULT_PARAMS.append_type,
    tfo: parseBool(q['tfo']) ?? DEFAULT_PARAMS.tfo,
    udp: parseBool(q['udp']) ?? DEFAULT_PARAMS.udp,
    sort: parseBool(q['sort']) ?? DEFAULT_PARAMS.sort,
    scv: parseBool(q['scv']) ?? DEFAULT_PARAMS.scv,
    expand: parseBool(q['expand']) ?? DEFAULT_PARAMS.expand,
    tls13: parseBool(q['tls13']) ?? DEFAULT_PARAMS.tls13,
  };
}

function parseBool(value: string | undefined): boolean | undefined {
  if (value === undefined || value === null) return undefined;
  const lower = value.toLowerCase();
  if (lower === 'true' || lower === '1') return true;
  if (lower === 'false' || lower === '0') return false;
  return undefined;
}

function createDefaultIniConfig(): ParsedIniConfig {
  return {
    rulesetEntries: [],
    customProxyGroups: [
      {
        name: '🚀 节点选择',
        groupType: 'select',
        proxies: ['.*'],
      },
    ],
    enableRuleGenerator: false,
    overwriteOriginalRules: false,
  };
}

export default app;