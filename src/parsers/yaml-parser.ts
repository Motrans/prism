// ============================================================
// YAML 订阅解析器 — 重写版
// 修复嵌套花括号解析 + inline proxy list 提取
// ============================================================

import type { ClashConfig, ProxyNode, ProxyGroup } from '../utils/types';

export function parseClashYaml(content: string): ClashConfig {
  const result: ClashConfig = {} as ClashConfig;
  const lines = content.split('\n');

  // ---- 提取其他顶级字段（先插入以保留原始段顺序） ----
  extractTopLevelFields(lines, result);
  // ---- 提取 proxies ----
  result.proxies = extractProxies(lines);
  // ---- 提取 proxy-groups ----
  result['proxy-groups'] = extractProxyGroups(lines);
  // ---- 提取 rules ----
  result.rules = extractRules(lines);

  return result;
}

/**
 * 提取代理节点 — 处理 inline JSON 格式，支持嵌套 {}
 */
function extractProxies(lines: string[]): ProxyNode[] {
  const proxies: ProxyNode[] = [];
  let inProxies = false;
  let braceBuf = '';

  for (const line of lines) {
    const trimmed = line.trim();

    // 检测 proxies: 开始
    if (!inProxies && (trimmed === 'proxies:' || trimmed.startsWith('proxies:'))) {
      inProxies = true;
      continue;
    }

    if (!inProxies) continue;

    // 检测下一个顶级 key（结束 proxies 块）
    if (trimmed.match(/^[a-z][\w-]*\s*:/) && !trimmed.startsWith('-') && !trimmed.startsWith(' ')) {
      // 先把残存的 buffer 处理完
      if (braceBuf.trim()) {
        const node = parseProxyBrace(braceBuf);
        if (node) proxies.push(node);
      }
      break;
    }

    if (trimmed.startsWith('-')) {
      // 先把残存的 buffer 处理完
      if (braceBuf.trim()) {
        const node = parseProxyBrace(braceBuf);
        if (node) proxies.push(node);
        braceBuf = '';
      }
      // 提取 - 后面的内容
      braceBuf = trimmed.substring(1).trim();
    } else if (trimmed && inProxies) {
      // 续行：有时 inline 格式折行
      braceBuf += ' ' + trimmed;
    } else if (!trimmed && braceBuf.trim()) {
      // 空行 — 把已有的 buffer 处理掉
      const node = parseProxyBrace(braceBuf);
      if (node) proxies.push(node);
      braceBuf = '';
    }
  }

  // 末尾残存
  if (braceBuf.trim()) {
    const node = parseProxyBrace(braceBuf);
    if (node) proxies.push(node);
  }

  return proxies;
}

/**
 * 解析单个 proxy brace 块 — 正确处理嵌套花括号
 */
function parseProxyBrace(raw: string): ProxyNode | null {
  let working = raw.trim();
  if (!working) return null;

  // 确保有花括号
  if (!working.startsWith('{')) working = '{' + working;
  // 找到匹配的闭合花括号
  const closingIdx = findMatchingBrace(working, 0);
  if (closingIdx > 0) {
    working = working.substring(0, closingIdx + 1);
  }

  // 尝试 JSON 解析
  try {
    const jsonSafe = simpleJsonify(working);
    return JSON.parse(jsonSafe) as ProxyNode;
  } catch {
    // 降级：手动提取
    return manualExtractProxy(working);
  }
}

/**
 * 找到匹配的闭合花括号位置
 */
function findMatchingBrace(str: string, start: number): number {
  let depth = 0;
  for (let i = start; i < str.length; i++) {
    if (str[i] === '{') depth++;
    else if (str[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * 提取 proxy-groups 块
 */
function extractProxyGroups(lines: string[]): ProxyGroup[] {
  const groups: ProxyGroup[] = [];
  let inSection = false;
  let currentGroup: Partial<ProxyGroup> | null = null;
  let proxyList: string[] = [];
  let collectingList = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!inSection && (trimmed === 'proxy-groups:' || trimmed.startsWith('proxy-groups:'))) {
      inSection = true;
      continue;
    }

    if (!inSection) continue;

    // 下一个顶级 key
    if (trimmed.match(/^[a-z][\w-]*\s*:/) && !trimmed.startsWith(' ') && !trimmed.startsWith('-')) {
      if (currentGroup) {
        groups.push({ ...currentGroup, proxies: proxyList } as ProxyGroup);
      }
      break;
    }

    if (trimmed.startsWith('- name:')) {
      if (currentGroup) {
        groups.push({ ...currentGroup, proxies: proxyList } as ProxyGroup);
      }
      currentGroup = {
        name: extractYamlValue(trimmed.substring('- name:'.length)),
        type: 'select',
        proxies: [],
      };
      proxyList = [];
      collectingList = false;
      continue;
    }

    if (trimmed.startsWith('- {')) {
      // 内联 JSON 格式 — 解析单个 proxy-group
      // 先把前面未保存的 currentGroup 收尾
      if (currentGroup) {
        groups.push({ ...currentGroup, proxies: proxyList } as ProxyGroup);
        currentGroup = null;
        proxyList = [];
        collectingList = false;
      }
      // ★ braceStr 已包含开头 '{'（trimmed 是 "- { name: ... }"，substring(2) 得到 "{ name: ... }"）
      const braceStr = trimmed.substring(2);
      const closingIdx = findMatchingBrace(braceStr, 0);
      const inline = closingIdx > 0 ? braceStr.substring(0, closingIdx + 1) : braceStr;
      try {
        const g = JSON.parse(simpleJsonify(inline)) as ProxyGroup;
        if (g.name) groups.push(g);
      } catch {
        // JSON 解析失败 → 手动提取（处理中文名无引号的情况）
        const parsed = parseInlineProxyGroup(inline);
        if (parsed) groups.push(parsed);
      }
      continue;
    }

    if (currentGroup) {
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx > 0) {
        const key = trimmed.substring(0, colonIdx).trim();
        const value = trimmed.substring(colonIdx + 1).trim();

        if (key === 'type') {
          currentGroup.type = value;
          collectingList = false;
        } else if (key === 'proxies') {
          if (value.startsWith('[') && value.endsWith(']')) {
            proxyList = parseProxiesList(value.slice(1, -1));
            collectingList = false;
          } else if (!value) {
            collectingList = true;
          }
        } else if (key === 'url') {
          currentGroup.url = extractYamlValue(value);
        } else if (key === 'interval') {
          currentGroup.interval = parseInt(value, 10);
        } else if (key === 'tolerance') {
          currentGroup.tolerance = parseInt(value, 10);
        } else if (key === 'lazy') {
          currentGroup.lazy = value === 'true';
        }
      } else if (collectingList && trimmed.startsWith('- ')) {
        proxyList.push(extractYamlValue(trimmed.substring(2)));
      }
    }
  }

  if (currentGroup) {
    groups.push({ ...currentGroup, proxies: proxyList } as ProxyGroup);
  }

  return groups;
}

/**
 * 提取 rules 块
 */
function extractRules(lines: string[]): string[] {
  const rules: string[] = [];
  let inSection = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!inSection && (trimmed === 'rules:' || trimmed.startsWith('rules:'))) {
      inSection = true;
      continue;
    }

    if (!inSection) continue;

    if (trimmed.match(/^[a-z][\w-]*\s*:/) && !trimmed.startsWith(' ') && !trimmed.startsWith('-')) {
      break;
    }

    if (trimmed.startsWith('- ')) {
      rules.push(trimmed.substring(2).trim());
    } else if (trimmed.startsWith('-')) {
      rules.push(trimmed.substring(1).trim());
    }
  }

  return rules;
}

/**
 * 提取顶级简单字段
 */
function extractTopLevelFields(lines: string[], config: ClashConfig): void {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('proxies:')
      || trimmed.startsWith('proxy-groups:') || trimmed.startsWith('rules:')
      || trimmed.startsWith('-') || line.startsWith(' ')) {
      continue;
    }

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx <= 0) continue;

    const key = trimmed.substring(0, colonIdx).trim();
    const rawVal = trimmed.substring(colonIdx + 1).trim();

    // 处理嵌套块：任意顶级键无内联值时，收集子块解析
    if (!rawVal || rawVal === '{}') {
      const blockLines: string[] = [];
      const baseIndent = line.length - line.trimStart().length + 2; // 嵌套缩进
      let j = i + 1;
      while (j < lines.length) {
        const nextLine = lines[j];
        const nextIndent = nextLine.length - nextLine.trimStart().length;
        if (nextIndent < baseIndent && nextLine.trim() !== '') break;
        if (nextIndent >= baseIndent || nextLine.trim() === '') {
          blockLines.push(nextLine);
        }
        j++;
      }
      if (key === 'hosts') {
        config.hosts = parseNestedDict(blockLines) as Record<string, string>;
      } else if (key === 'dns') {
        config.dns = parseNestedDict(blockLines);
      } else {
        // 未知顶级嵌套块（如 cfw-bypass）→ 通过 index signature 保留
        config[key] = parseNestedDict(blockLines);
      }
      continue;
    }

    if (!rawVal && line.endsWith(':')) continue; // 其他嵌套块跳过

    const value = extractYamlValue(rawVal);

    if (key === 'port' || key === 'socks-port' || key === 'mixed-port' || key === 'redir-port'
      || key === 'tproxy-port' || key === 'keep-alive-interval') {
      (config as Record<string, unknown>)[key] = parseInt(value, 10) || Number(value);
    } else if (value === 'true') {
      (config as Record<string, unknown>)[key] = true;
    } else if (value === 'false') {
      (config as Record<string, unknown>)[key] = false;
    } else if (value === 'null' || value === '~') {
      (config as Record<string, unknown>)[key] = null;
    } else {
      (config as Record<string, unknown>)[key] = value;
    }
  }
}

/**
 * 解析 YAML 嵌套块 — 支持映射、序列、简单值、内联流式语法
 * 返回类型取决于块结构：映射返回对象，序列返回数组
 */
function parseNestedDict(lines: string[]): unknown {
  // 计算基准缩进
  let baseIndent = Infinity;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const indent = line.length - line.trimStart().length;
    if (indent < baseIndent) baseIndent = indent;
  }
  if (!isFinite(baseIndent)) baseIndent = 0;

  // 判断顶级结构是序列还是映射
  const firstLine = lines.find(l => {
    const t = l.trim();
    return t && !t.startsWith('#');
  });
  if (firstLine && firstLine.trim().startsWith('- ')) {
    // 顶级序列（如 cfw-bypass 下的 IP 列表）
    const items: unknown[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      if (trimmed.startsWith('- ')) {
        const itemVal = extractYamlValue(trimmed.substring(2).trim());
        items.push(parseYamlFlow(itemVal));
      }
    }
    return items;
  }

  // 顶级映射
  const result: Record<string, unknown> = {};
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    const indent = line.length - line.trimStart().length;

    // 只处理基准缩进的行
    if (!trimmed || trimmed.startsWith('#') || indent !== baseIndent) {
      i++;
      continue;
    }

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx <= 0) {
      i++;
      continue;
    }

    const key = trimmed.substring(0, colonIdx).trim();
    const rawVal = trimmed.substring(colonIdx + 1).trim();

    if (rawVal) {
      // 有内联值 → 先提取标量，再尝试解析 YAML 流式语法
      const extracted = extractYamlValue(rawVal);
      result[key] = parseYamlFlow(extracted);
      i++;
    } else {
      // 无内联值 → 查看后续行决定是序列还是映射
      const subLines: string[] = [];
      let j = i + 1;
      while (j < lines.length) {
        const nextLine = lines[j];
        const nextTrimmed = nextLine.trim();
        const nextIndent = nextLine.length - nextLine.trimStart().length;
        if (!nextTrimmed || nextTrimmed.startsWith('#')) {
          // 空行 / 注释：属于当前块但跳过
          j++;
          continue;
        }
        if (nextIndent <= baseIndent) break; // 回到基准缩进，结束子块
        subLines.push(nextLine);
        j++;
      }

      if (subLines.length > 0) {
        const firstSub = subLines[0].trim();
        if (firstSub.startsWith('- ')) {
          // 映射下的序列值
          const items: unknown[] = [];
          for (const sl of subLines) {
            const st = sl.trim();
            if (st.startsWith('- ')) {
              const itemVal = extractYamlValue(st.substring(2).trim());
              items.push(parseYamlFlow(itemVal));
            }
          }
          result[key] = items;
        } else {
          // 嵌套映射
          result[key] = parseNestedDict(subLines);
        }
      } else {
        result[key] = '';
      }
      i = j;
    }
  }

  return result;
}

// ============================================================
// 工具函数
// ============================================================

function parseProxyBraceEntry(raw: string): ProxyNode | null {
  return parseProxyBrace(raw);
}

function parseProxiesList(content: string): string[] {
  return content.split(',').map(s => extractYamlValue(s.trim())).filter(Boolean);
}

function extractYamlValue(raw: string): string {
  let s = raw.trim();
  // 去掉引号
  if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
    s = s.slice(1, -1);
  }
  return s;
}

/**
 * 解析 YAML 内联流式语法：序列 [...] 和映射 {...}
 * 用于 DNS 段中 nameserver: ['...'] / nameserver-policy: {'*.d': [...]} 等格式
 */
function parseYamlFlow(raw: string): unknown {
  const s = raw.trim();
  if (s.startsWith('[') && s.endsWith(']')) {
    // 流式序列
    const inner = s.slice(1, -1).trim();
    if (!inner) return [];
    return splitYamlFlow(inner).map(item => {
      const v = extractYamlValue(item.trim());
      // 递归解析嵌套流式值
      return parseYamlFlow(v);
    });
  }
  if (s.startsWith('{') && s.endsWith('}')) {
    // 流式映射
    const inner = s.slice(1, -1).trim();
    if (!inner) return {};
    // 尝试 JSON 化后解析
    try {
      const jsonSafe = simpleJsonify(`{${inner}}`);
      return JSON.parse(jsonSafe);
    } catch {
      // 回退：手动拆分键值对
      const obj: Record<string, unknown> = {};
      const pairs = splitYamlFlow(inner);
      for (const pair of pairs) {
        const colonIdx = pair.indexOf(':');
        if (colonIdx <= 0) continue;
        const k = extractYamlValue(pair.substring(0, colonIdx).trim());
        const v = parseYamlFlow(extractYamlValue(pair.substring(colonIdx + 1).trim()));
        obj[k] = v;
      }
      return obj;
    }
  }
  // 标量：推断布尔/空/数字类型
  return coerceScalar(s);
}

/**
 * YAML 标量类型推断：true/false → boolean, null/~ → null, 数字 → number
 */
function coerceScalar(s: string): unknown {
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (s === 'null' || s === '~') return null;
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  return s;
}

/**
 * 按逗号拆分 YAML 流式内容，尊重嵌套括号和引号深度
 */
function splitYamlFlow(content: string): string[] {
  const result: string[] = [];
  let depth = 0;    // {} 嵌套深度
  let bracket = 0;  // [] 嵌套深度
  let inStr: string | null = null; // 当前引号类型 ' 或 "
  let current = '';

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];

    if (inStr) {
      current += ch;
      if (ch === inStr && content[i - 1] !== '\\') inStr = null;
      continue;
    }

    if (ch === "'" || ch === '"') {
      inStr = ch;
      current += ch;
      continue;
    }

    if (ch === '{') { depth++; current += ch; continue; }
    if (ch === '}') { depth--; current += ch; continue; }
    if (ch === '[') { bracket++; current += ch; continue; }
    if (ch === ']') { bracket--; current += ch; continue; }

    if (ch === ',' && depth === 0 && bracket === 0) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }

  if (current) result.push(current);
  return result;
}

function simpleJsonify(str: string): string {
  str = str.replace(/,\s*([}\]])/g, '$1');
  str = str.replace(/(\{|\,)\s*([a-zA-Z_][\w-]*)\s*:/g, '$1"$2":');
  str = str.replace(/'([^']*)'/g, '"$1"');
  return str;
}

function manualExtractProxy(str: string): ProxyNode | null {
  const node: Record<string, unknown> = {};
  let content = str.trim();
  if (content.startsWith('{')) content = content.slice(1);
  if (content.endsWith('}')) content = content.slice(0, -1);

  const pairs = splitTopLevel(content);
  for (const pair of pairs) {
    const colonIdx = pair.indexOf(':');
    if (colonIdx === -1) continue;

    const key = pair.substring(0, colonIdx).trim().replace(/^['"]|['"]$/g, '');
    let value: unknown = pair.substring(colonIdx + 1).trim();

    // 去掉引号包裹
    const maybeQuoted = value as string;
    if ((maybeQuoted.startsWith("'") && maybeQuoted.endsWith("'")) ||
        (maybeQuoted.startsWith('"') && maybeQuoted.endsWith('"'))) {
      value = maybeQuoted.slice(1, -1);
    }

    // 尝试解析 YAML 内联数组（如 alpn: [h2, http/1.1] 或 alpn: ["h2", "http/1.1"]）
    if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
      const inner = value.slice(1, -1).trim();
      if (inner) {
        // 按逗号分割，去除引号
        value = inner.split(',').map((s: string) => {
          let t = s.trim();
          if ((t.startsWith("'") && t.endsWith("'")) || (t.startsWith('"') && t.endsWith('"'))) {
            t = t.slice(1, -1);
          }
          return t;
        }).filter((s: string) => s.length > 0);
      } else {
        value = [];
      }
    }

    // 尝试解析 YAML 内联对象（如 plugin-opts: {mode: http, host: xxx}）
    if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
      const inner = value.slice(1, -1).trim();
      if (inner) {
        const subPairs = splitTopLevel(inner);
        const subObj: Record<string, unknown> = {};
        for (const sp of subPairs) {
          const scIdx = sp.indexOf(':');
          if (scIdx === -1) continue;
          const sk = sp.substring(0, scIdx).trim().replace(/^['"]|['"]$/g, '');
          let sv: unknown = sp.substring(scIdx + 1).trim();
          if (typeof sv === 'string') {
            if ((sv.startsWith("'") && sv.endsWith("'")) || (sv.startsWith('"') && sv.endsWith('"'))) {
              sv = sv.slice(1, -1);
            }
            if (sv === 'true') sv = true;
            else if (sv === 'false') sv = false;
            else if (typeof sv === 'string' && /^\d+$/.test(sv)) sv = parseInt(sv, 10);
          }
          subObj[sk] = sv;
        }
        value = subObj;
      } else {
        value = {};
      }
    }

    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    else if (/^\d+$/.test(value as string)) value = parseInt(value as string, 10);

    node[key] = value;
  }

  return node.name ? (node as unknown as ProxyNode) : null;
}

/**
 * 手动解析内联 proxy-group（处理中文名无引号等 JSON 无法直接解析的情况）
 */
function parseInlineProxyGroup(inline: string): ProxyGroup | null {
  let content = inline.trim();
  if (content.startsWith('{')) content = content.slice(1);
  if (content.endsWith('}')) content = content.slice(0, -1);

  const group: Partial<ProxyGroup> = { proxies: [] };
  const pairs = splitTopLevel(content);

  for (const pair of pairs) {
    const colonIdx = pair.indexOf(':');
    if (colonIdx === -1) continue;
    const key = pair.substring(0, colonIdx).trim().replace(/^['"]|['"]$/g, '');
    let value = pair.substring(colonIdx + 1).trim();

    // 去掉外层引号
    if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
      value = value.slice(1, -1);
    }

    if (key === 'name') {
      group.name = value;
    } else if (key === 'type') {
      group.type = value;
    } else if (key === 'proxies' && value.startsWith('[') && value.endsWith(']')) {
      // 解析 proxies 数组，元素可能是带或不带引号的中文/英文名
      const inner = value.slice(1, -1).trim();
      if (inner) {
        group.proxies = inner.split(',').map((s: string) => {
          let t = s.trim();
          if ((t.startsWith("'") && t.endsWith("'")) || (t.startsWith('"') && t.endsWith('"'))) {
            t = t.slice(1, -1);
          }
          return t;
        }).filter((s: string) => s.length > 0);
      }
    } else if (key === 'url') {
      group.url = value;
    } else if (key === 'interval') {
      group.interval = parseInt(value, 10) || undefined;
    } else if (key === 'tolerance') {
      group.tolerance = parseInt(value, 10) || undefined;
    } else if (key === 'lazy') {
      group.lazy = value === 'true';
    }
  }

  if (!group.name) return null;
  return group as ProxyGroup;
}

function splitTopLevel(content: string): string[] {
  const result: string[] = [];
  let depth = 0;
  let current = '';

  for (const ch of content) {
    if (ch === '{' || ch === '[') depth++;
    else if (ch === '}' || ch === ']') depth--;

    if (ch === ',' && depth === 0) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }

  if (current) result.push(current);
  return result;
}

export function extractProxyNames(config: ClashConfig): string[] {
  return config.proxies.map(p => p.name);
}