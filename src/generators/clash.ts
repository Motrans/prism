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

  copyBaseSettings(sourceConfig, lines);

  // ---- proxies ----
  lines.push('proxies:');
  let allNodes = applyNodeFilters(sourceConfig.proxies, params);
  // 最小限去重：相同 name 的节点只保留第一个（机场末尾常有重复提醒节点）
  const seen = new Set<string>();
  allNodes = allNodes.filter(n => {
    const key = n.name;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  const allNodeNames = allNodes.map(n => n.name);
  
  for (const node of allNodes) {
    lines.push(formatClashProxy(node, params));
  }
  lines.push('');
  lines.push(`# 共 ${allNodes.length} 个代理节点`);
  lines.push('');

  // ---- proxy-groups ----
  // ★ 简化逻辑：有外部 .ini 配置 → 替换；没有 → 原样保留
  lines.push('proxy-groups:');
  if (params.config) {
    // 有外部配置 → 使用外部自定义分组（展开 .* 占位符）
    const groups = expandPlaceholderProxies(iniConfig.customProxyGroups, allNodeNames);
    for (const g of groups) {
      const groupType = g.groupType || 'select';
      let proxies = g.proxies.filter(p =>
        p === 'DIRECT' || p === 'REJECT' || p === 'REJECT-TLS' ||
        allNodeNames.includes(p) || iniConfig.customProxyGroups.some(og => og.name === p)
      );
      if (proxies.length === 0) proxies = ['DIRECT'];
      lines.push(`  - name: "${g.name}"`);
      lines.push(`    type: ${groupType}`);
      lines.push(`    proxies:`);
      for (const proxy of proxies) {
        lines.push(`      - "${proxy}"`);
      }
      if ((groupType === 'url-test' || groupType === 'fallback') && g.url) {
        lines.push(`    url: "${g.url}"`);
        lines.push(`    interval: ${g.interval || 300}`);
      }
      lines.push('');
    }
  } else if (sourceConfig['proxy-groups'] && sourceConfig['proxy-groups'].length > 0) {
    // 无外部配置，原样保留原始分组（只展开 .* 占位符）
    const groups = sourceConfig['proxy-groups'];
    for (const g of groups) {
      const groupType = g.type || 'select';
      const expanded = g.proxies.flatMap(p => {
        if (p === '.*') return allNodeNames;
        return [p];
      });
      let proxies = expanded.filter(p =>
        p === 'DIRECT' || p === 'REJECT' || p === 'REJECT-TLS' ||
        allNodeNames.includes(p) || groups.some(og => og.name === p)
      );
      if (proxies.length === 0) proxies = ['DIRECT'];
      lines.push(`  - name: "${g.name}"`);
      lines.push(`    type: ${groupType}`);
      lines.push(`    proxies:`);
      for (const proxy of proxies) {
        lines.push(`      - "${proxy}"`);
      }
      if ((groupType === 'url-test' || groupType === 'fallback') && g.url) {
        lines.push(`    url: "${g.url}"`);
        lines.push(`    interval: ${g.interval || 300}`);
      }
      lines.push('');
    }
  }

  // ---- rules ----
  if (iniConfig.rulesetEntries.length > 0) {
    // 有外部配置 → 使用外部 rulesets
    lines.push('rules:');
    if (params.expand !== false) {
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
            lines.push(`  - RULE-SET,${sanitizeProviderName(entry.groupName)},${entry.groupName}`);
          }
        }
      }
    } else {
      // 非展开模式
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
  } else if (sourceConfig.rules && sourceConfig.rules.length > 0) {
    // 无外部配置 → 保留原始 rules
    lines.push('rules:');
    for (const rule of sourceConfig.rules) {
      lines.push(`  - ${rule}`);
    }
  }

  // dns / hosts
  if (sourceConfig.dns) {
    lines.push('');
    lines.push('dns:');
    for (const [key, value] of Object.entries(sourceConfig.dns)) {
      if (typeof value === 'boolean') lines.push(`  ${key}: ${value}`);
      else if (typeof value === 'string') lines.push(`  ${key}: "${value}"`);
      else lines.push(`  ${key}: ${JSON.stringify(value)}`);
    }
  }

  if (sourceConfig.hosts && Object.keys(sourceConfig.hosts).length > 0) {
    lines.push('');
    lines.push('hosts:');
    for (const [domain, ip] of Object.entries(sourceConfig.hosts)) {
      lines.push(`  '${domain}': ${ip}`);
    }
  }

  lines.push('');
  lines.push('unified-delay: true');

  return lines.join('\n');
}

// ---- helper functions ----

function copyBaseSettings(config: ClashConfig, lines: string[]): void {
  const keys = ['port','socks-port','mixed-port','redir-port','tproxy-port',
    'allow-lan','bind-address','mode','log-level',
    'external-controller','external-ui','secret',
    'keep-alive-interval'];
  for (const key of keys) {
    const value = (config as Record<string, unknown>)[key];
    if (value === undefined || value === null) continue;
    if (typeof value === 'boolean') lines.push(`${key}: ${value}`);
    else if (typeof value === 'string') lines.push(`${key}: "${value}"`);
    else lines.push(`${key}: ${value}`);
  }
}

function formatClashProxy(node: ProxyNode, params: ConversionParams): string {
  const kv: string[] = [];
  
  let name = node.name;
  if (params.emoji === false) {
    name = name.replace(/[\u{1F000}-\u{1FFFF}]/gu, '').trim();
  }
  if (params.append_type) name = `[${node.type.toUpperCase()}] ${name}`;
  
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
  return name.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_').toLowerCase() || 'provider';
}

function esc(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}