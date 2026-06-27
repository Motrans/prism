// ============================================================
// Prism - Cloudflare Worker 入口
// 代理订阅转换工具的完整后端
// ============================================================

import { Hono } from 'hono';
import type { Context } from 'hono';
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
        headers: { 'User-Agent': 'Prism/1.0' },
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
          headers: { 'User-Agent': 'Prism/1.0' },
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
                  headers: { 'User-Agent': 'Prism/1.0' },
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
    const extMap: Record<string, string> = { clash: '.yaml', singbox: '.json', surge: '.conf' };
    const ext = extMap[params.target] || '.yaml';

    // 决定订阅名称和下载文件名
    const baseFilename = params.filename || 'Prism';
    // 去掉用户可能误填的扩展名（保留纯名称）
    const cleanBase = baseFilename.replace(/\.(yaml|json|conf)$/i, '');
    // 下载用完整文件名
    const filename = cleanBase + ext;
    // ★ 订阅名称就是 cleanBase（不含扩展名），Clash Verge 读取 profile-title 或 Content-Disposition

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
    group: q['group'] || undefined,
    upload_path: q['upload_path'] || undefined,
    include: q['include'] || undefined,
    exclude: q['exclude'] || undefined,
    dev_id: q['dev_id'] || undefined,
    filename: q['filename'] || undefined,
    interval: q['interval'] ? parseInt(q['interval'], 10) : undefined,
    rename: q['rename'] || undefined,
    filter_script: q['filter_script'] || undefined,
    strict: parseBool(q['strict']) ?? DEFAULT_PARAMS.strict,
    upload: parseBool(q['upload']) ?? DEFAULT_PARAMS.upload,
    emoji: parseBool(q['emoji']) ?? DEFAULT_PARAMS.emoji,
    add_emoji: parseBool(q['add_emoji']) ?? DEFAULT_PARAMS.add_emoji,
    remove_emoji: parseBool(q['remove_emoji']) ?? DEFAULT_PARAMS.remove_emoji,
    append_type: parseBool(q['append_type']) ?? DEFAULT_PARAMS.append_type,
    tfo: parseBool(q['tfo']) ?? DEFAULT_PARAMS.tfo,
    udp: parseBool(q['udp']) ?? DEFAULT_PARAMS.udp,
    list: parseBool(q['list']) ?? DEFAULT_PARAMS.list,
    sort: parseBool(q['sort']) ?? DEFAULT_PARAMS.sort,
    sort_script: q['sort_script'] || undefined,
    script: parseBool(q['script']) ?? DEFAULT_PARAMS.script,
    insert: parseBool(q['insert']) ?? DEFAULT_PARAMS.insert,
    scv: parseBool(q['scv']) ?? DEFAULT_PARAMS.scv,
    fdn: parseBool(q['fdn']) ?? DEFAULT_PARAMS.fdn,
    expand: parseBool(q['expand']) ?? DEFAULT_PARAMS.expand,
    append_info: parseBool(q['append_info']) ?? DEFAULT_PARAMS.append_info,
    prepend: parseBool(q['prepend']) ?? DEFAULT_PARAMS.prepend,
    classic: parseBool(q['classic']) ?? DEFAULT_PARAMS.classic,
    tls13: parseBool(q['tls13']) ?? DEFAULT_PARAMS.tls13,
    new_name: parseBool(q['new_name']) ?? DEFAULT_PARAMS.new_name,
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