// ============================================================
// Clash (Mihomo) 配置生成器
// ============================================================

import type { ClashConfig, ProxyNode, ParsedIniConfig, ConversionParams } from '../utils/types';
import { expandPlaceholderProxies } from '../parsers/ini-parser';

/**
 * 生成 Clash 格式的 YAML 配置
 */
export function generateClashConfig(
  sourceConfig: ClashConfig,
  iniConfig: ParsedIniConfig,
  params: ConversionParams,
  ruleContents: Record<string, string[]>
): string {
  const lines: string[] = [];

  lines.push('# ====================================');
  lines.push('# Prism - 订阅转换工具');
  lines.push('# ====================================');
  lines.push('');

  // 预计算过滤后的节点列表（proxy-groups 展开需要，独立于段顺序）
  let allNodes = applyNodeFilters(sourceConfig.proxies, params);
  const seen = new Set<string>();
  allNodes = allNodes.filter(n => {
    const k = n.name;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const allNodeNames = allNodes.map(n => getNodeDisplayName(n, params));
  // 原始名 → 显示名 映射（保留原始 proxy-groups 时用于匹配）
  const nodeNameMap = new Map(allNodes.map((n, i) => [n.name, allNodeNames[i]]));

  // 按原始顺序迭代，遇到保留段直接内联输出
  const RESERVED_KEYS = new Set(['proxies', 'proxy-groups', 'rules', 'dns', 'hosts']);
  for (const [key, value] of Object.entries(sourceConfig)) {
    if (value === undefined || value === null) continue;

    if (!RESERVED_KEYS.has(key)) {
      emitYamlKeyValue(lines, key, value, 0);
      continue;
    }

    // --- proxies ---
    if (key === 'proxies') {
      lines.push('proxies:');
      for (const node of allNodes) {
        lines.push(formatClashProxy(node, params));
      }
      lines.push(`# 共 ${allNodes.length} 个代理节点`);
      continue;
    }

    // --- proxy-groups ---
    if (key === 'proxy-groups') {
      if (params.config) {
        lines.push('proxy-groups:');
        const groups = expandPlaceholderProxies(iniConfig.customProxyGroups, allNodeNames);
        for (const g of groups) {
          writeProxyGroup(lines, g.groupType || 'select', g.name, g.proxies, g.url, g.interval,
            allNodeNames, iniConfig.customProxyGroups.map(og => og.name), nodeNameMap);
        }
      } else if (Array.isArray(value) && value.length > 0) {
        lines.push('proxy-groups:');
        const groups = value as any[];
        for (const g of groups) {
          writeProxyGroup(lines, g.type || 'select', g.name, g.proxies, g.url, g.interval,
            allNodeNames, groups.map((og: any) => og.name), nodeNameMap);
        }
      }
      continue;
    }

    // --- rules ---
    if (key === 'rules') {
      if (iniConfig.rulesetEntries.length > 0) {
        if (params.expand !== false) {
          lines.push('rules:');
          for (const entry of iniConfig.rulesetEntries) {
            if (entry.isSpecial) {
              if (entry.specialType === 'GEOIP') {
                lines.push(`  - GEOSITE,${entry.specialValue},${entry.groupName}`);
              } else if (entry.specialType === 'FINAL') {
                lines.push(`  - MATCH,${entry.groupName}`);
              }
            } else {
              const content = ruleContents[entry.url];
              if (content && content.length > 0) {
                for (const rule of content) {
                  if (!rule || rule.startsWith('#')) continue;
                  if (rule.startsWith('URL-REGEX')) continue;
                  const parts = rule.split(',');
                  const last = parts[parts.length - 1]?.trim();
                  if (last === 'no-resolve' && parts.length >= 3) {
                    const base = parts.slice(0, -1).join(',');
                    lines.push(`  - ${base},${entry.groupName},no-resolve`);
                  } else {
                    lines.push(`  - ${rule},${entry.groupName}`);
                  }
                }
              } else {
                // 规则集下载失败，展开模式下跳过以避免引用不存在的 provider
                lines.push(`  # ⚠ 规则集下载失败: ${entry.groupName}`);
              }
            }
          }
        } else {
          lines.push('rule-providers:');
          for (const entry of iniConfig.rulesetEntries) {
            if (!entry.isSpecial && entry.url) {
              const pn = sanitizeProviderName(entry.groupName);
              lines.push(`  ${pn}:`);
              lines.push(`    type: http`);
              lines.push(`    behavior: domain`);
              lines.push(`    url: "${entry.url}"`);
              lines.push(`    interval: 86400`);
            }
          }
          lines.push('rules:');
          for (const entry of iniConfig.rulesetEntries) {
            if (entry.isSpecial) {
              if (entry.specialType === 'GEOIP') {
                lines.push(`  - GEOSITE,${entry.specialValue},${entry.groupName}`);
              } else if (entry.specialType === 'FINAL') {
                lines.push(`  - MATCH,${entry.groupName}`);
              }
            } else {
              const pn = sanitizeProviderName(entry.groupName);
              lines.push(`  - RULE-SET,${pn},${entry.groupName}`);
            }
          }
        }
      } else if (Array.isArray(value) && value.length > 0) {
        lines.push('rules:');
        for (const rule of value as string[]) {
          lines.push(`  - ${rule}`);
        }
      }
      continue;
    }

    // --- dns ---
    if (key === 'dns') {
      if (typeof value === 'object' && value !== null && Object.keys(value as object).length > 0) {
        lines.push('dns:');
        for (const [dk, dv] of Object.entries(value as Record<string, unknown>)) {
          emitYamlKeyValue(lines, dk, dv, 2);
        }
      }
      continue;
    }

    // --- hosts ---
    if (key === 'hosts') {
      const hosts = value as Record<string, unknown>;
      if (hosts && Object.keys(hosts).length > 0) {
        lines.push('hosts:');
        for (const [domain, ip] of Object.entries(hosts)) {
          if (typeof ip === 'string') {
            lines.push(`  '${domain}': ${ip}`);
          } else {
            emitYamlKeyValue(lines, `'${domain}'`, ip, 2);
          }
        }
      }
      continue;
    }
  }

  return lines.join('\n');
}

// ---- helper functions ----

function getNodeDisplayName(node: ProxyNode, params: ConversionParams): string {
  let name = node.name;
  if (params.emoji === false) {
    name = name.replace(/[\u{1F000}-\u{1FFFF}]/gu, '').trim();
  }
  if (params.append_type) name = `[${node.type.toUpperCase()}] ${name}`;
  return name;
}

function formatClashProxy(node: ProxyNode, params: ConversionParams): string {
  const kv: string[] = [];
  const name = getNodeDisplayName(node, params);

  kv.push(`name: "${esc(name)}"`);
  kv.push(`type: ${node.type}`);
  kv.push(`server: "${esc(node.server)}"`);
  kv.push(`port: ${node.port}`);

  if (node.cipher) kv.push(`cipher: ${node.cipher}`);
  if (node.password) kv.push(`password: "${esc(node.password)}"`);
  if (node.uuid) kv.push(`uuid: "${node.uuid}"`);

  if (node.plugin) {
    kv.push(`plugin: ${node.plugin}`);
    if (node['plugin-opts']) {
      const opts = Object.entries(node['plugin-opts'] as Record<string,string>)
        .map(([k, v]) => `${k}: "${esc(v)}"`).join(', ');
      kv.push(`plugin-opts: {${opts}}`);
    }
  }

  if (node.udp) kv.push('udp: true');
  if (node.tfo || params.tfo) kv.push('tfo: true');
  if (params.udp && !node.udp) kv.push('udp: true');
  if (node['skip-cert-verify'] || params.scv) kv.push('skip-cert-verify: true');

  if (node.sni) kv.push(`sni: "${esc(node.sni)}"`);
  if (node.alpn) {
    const arr = Array.isArray(node.alpn) ? node.alpn : String(node.alpn).split(/[,;]/).map((s:string)=>s.trim()).filter(Boolean);
    kv.push(`alpn: [${arr.map((a:string)=>`"${a}"`).join(', ')}]`);
  }

  if (params.tls13) kv.push('client-fingerprint: chrome');

  const skip = new Set(['name','type','server','port','cipher','password','uuid','plugin','plugin-opts','udp','tfo','skip-cert-verify','sni','alpn']);
  if (params.tls13) skip.add('client-fingerprint');
  for (const [k, v] of Object.entries(node)) {
    if (skip.has(k)) continue;
    if (typeof v === 'boolean') kv.push(`${k}: ${v}`);
    else if (typeof v === 'number') kv.push(`${k}: ${v}`);
    else if (typeof v === 'string') kv.push(`${k}: "${esc(v)}"`);
  }

  return `  - { ${kv.join(', ')} }`;
}

function applyNodeFilters(nodes: ProxyNode[], params: ConversionParams): ProxyNode[] {
  let f = [...nodes];
  if (params.include) { try { const r=new RegExp(params.include); f=f.filter(n=>r.test(n.name)); } catch {} }
  if (params.exclude) { try { const r=new RegExp(params.exclude); f=f.filter(n=>!r.test(n.name)); } catch {} }
  if (params.sort) f.sort((a, b) => a.name.localeCompare(b.name));
  return f;
}

function sanitizeProviderName(name: string): string {
  // 仅移除 YAML 有问题的字符，保留中文等 Unicode 字母
  return name.replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().replace(/\s+/g, '_') || 'provider';
}

function writeProxyGroup(
  lines: string[], groupType: string, name: string, proxies: string[],
  url: string | undefined, interval: number | undefined,
  allNodeNames: string[], groupNames: string[], nodeNameMap?: Map<string, string>
): void {
  let filtered = proxies.filter(p =>
    p === 'DIRECT' || p === 'REJECT' || p === 'REJECT-TLS' ||
    allNodeNames.includes(p) || groupNames.includes(p) ||
    (nodeNameMap && nodeNameMap.has(p))
  );
  if (filtered.length === 0) filtered = ['DIRECT'];
  // 将原始名映射为显示名，保证与 proxies 段一致
  if (nodeNameMap) filtered = filtered.map(p => nodeNameMap.get(p) || p);

  const parts: string[] = [];
  parts.push(`name: "${esc(name)}"`);
  parts.push(`type: ${groupType}`);
  parts.push(`proxies: [${filtered.map(p => `"${esc(p)}"`).join(', ')}]`);
  if ((groupType === 'url-test' || groupType === 'fallback') && url) {
    parts.push(`url: "${esc(url)}"`);
    parts.push(`interval: ${interval || 300}`);
  }
  lines.push(`  - { ${parts.join(', ')} }`);
}

function esc(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * YAML 键名安全化：以保留字符（*&!{}[]等）开头或含特殊字符时加引号
 */
function safeKey(key: string): string {
  if (/^[*&!{}[\]>|%@`"'?#-]/.test(key) || /[:#\s]/.test(key)) {
    return `"${esc(key)}"`;
  }
  return key;
}

/**
 * 递归输出 YAML 键值对 — 正确处理嵌套序列和映射
 */
function emitYamlKeyValue(lines: string[], key: string, value: unknown, indent: number): void {
  const pad = ' '.repeat(indent);
  const safe = safeKey(key);

  if (typeof value === 'string') {
    lines.push(`${pad}${safe}: "${esc(value)}"`);
  } else if (typeof value === 'boolean') {
    lines.push(`${pad}${safe}: ${value}`);
  } else if (typeof value === 'number') {
    lines.push(`${pad}${safe}: ${value}`);
  } else if (Array.isArray(value)) {
    lines.push(`${pad}${safe}:`);
    for (const item of value) {
      if (typeof item === 'string') {
        lines.push(`${pad}  - "${esc(item)}"`);
      } else if (typeof item === 'object' && item !== null) {
        const entries = Object.entries(item as Record<string, unknown>);
        if (entries.length > 0) {
          const [fk, fv] = entries[0];
          emitYamlKeyValue(lines, `- ${safeKey(fk)}`, fv, indent);
          for (let i = 1; i < entries.length; i++) {
            const [k, v] = entries[i];
            emitYamlKeyValue(lines, `  ${safeKey(k)}`, v, indent);
          }
        }
      } else {
        lines.push(`${pad}  - ${item}`);
      }
    }
  } else if (typeof value === 'object' && value !== null) {
    lines.push(`${pad}${safe}:`);
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      emitYamlKeyValue(lines, k, v, indent + 2);
    }
  } else {
    // fallback
    lines.push(`${pad}${safe}: ${value}`);
  }
}