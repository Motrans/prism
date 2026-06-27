// ============================================================
// sing-box 配置生成器
// 将 Clash 代理节点 + 规则配置转换为 sing-box JSON 格式
// ============================================================

import type { ClashConfig, ProxyNode, ParsedIniConfig, ConversionParams } from '../utils/types';
import { expandPlaceholderProxies } from '../parsers/ini-parser';

/**
 * sing-box outbound 类型映射
 */
const SINGBOX_TYPE_MAP: Record<string, string> = {
  ss: 'shadowsocks',
  ssr: 'shadowsocksr',
  vmess: 'vmess',
  vless: 'vless',
  trojan: 'trojan',
  hysteria2: 'hysteria2',
  http: 'http',
  socks5: 'socks',
  snell: 'snell',
  tuic: 'tuic',
};

/**
 * 生成 sing-box 格式的 JSON 配置
 */
export function generateSingboxConfig(
  sourceConfig: ClashConfig,
  iniConfig: ParsedIniConfig,
  params: ConversionParams,
  ruleContents: Record<string, string[]>
): string {
  const config: Record<string, unknown> = {
    log: { level: 'info' },
    dns: convertSingboxDns(sourceConfig),
  };

  // ---- Inbounds ----
  config.inbounds = [
    {
      type: 'mixed',
      tag: 'mixed-in',
      listen: '::',
      listen_port: 2080,
    },
  ];

  // ---- Outbounds ----
  const allNodes = applySingboxNodeFilters(sourceConfig.proxies, params);
  const allNodeNames = allNodes.map(n => n.name);
  
  const outbounds: unknown[] = [];
  
  // 直连 outbound
  outbounds.push({ type: 'direct', tag: 'DIRECT' });
  // 拒绝 outbound
  outbounds.push({ type: 'block', tag: 'REJECT' });
  
  // 代理节点 outbounds
  for (const node of allNodes) {
    const outbound = convertNodeToSingboxOutbound(node, params);
    if (outbound) {
      outbounds.push(outbound);
    }
  }
  
  config.outbounds = outbounds;

  // ---- Routes ----
  // ★ sing-box 本身不能直接解析 Clash 规则，所以只在有外部 .ini 配置时才生成路由
  if (params.config && iniConfig.rulesetEntries.length > 0) {
    expandPlaceholderProxies(iniConfig.customProxyGroups, allNodeNames); // 展开占位符
    const rules: unknown[] = [];

    for (const entry of iniConfig.rulesetEntries) {
      if (entry.isSpecial && entry.specialType === 'FINAL') {
        rules.push({ outbound: entry.groupName });
        continue;
      }
      if (entry.isSpecial && entry.specialType === 'GEOIP') {
        rules.push({ geoip: entry.specialValue?.toLowerCase(), outbound: entry.groupName });
        continue;
      }
      const content = ruleContents[entry.url];
      if (content && content.length > 0) {
        for (const rule of content) {
          const singboxRule = convertRuleToSingbox(rule);
          if (singboxRule) {
            rules.push({ ...singboxRule, outbound: entry.groupName });
          }
        }
      }
    }

    config.route = { rules, auto_detect_interface: true };
  }

  return JSON.stringify(config, null, 2);
}

/**
 * 转换 Clash 代理节点为 sing-box outbound
 */
function convertNodeToSingboxOutbound(node: ProxyNode, params: ConversionParams): unknown | null {
  const singboxType = SINGBOX_TYPE_MAP[node.type];
  if (!singboxType) return null;

  let displayName = node.name;
  if (params.emoji === false) {
    displayName = displayName.replace(/[\u{1F000}-\u{1FFFF}]/gu, '').trim();
  }
  if (params.append_type) {
    displayName = `[${node.type.toUpperCase()}] ${displayName}`;
  }

  const outbound: Record<string, unknown> = {
    type: singboxType,
    tag: displayName,
    server: node.server,
    server_port: node.port,
  };

  // 协议特定字段
  switch (node.type) {
    case 'ss':
      outbound.method = node.cipher || 'aes-128-gcm';
      outbound.password = node.password || '';
      if (node.plugin === 'obfs' && node['plugin-opts']) {
        const opts = node['plugin-opts'];
        outbound.plugin = 'obfs-local';
        outbound.plugin_opts = `${opts.mode || 'http'};obfs-host=${opts.host || ''}`;
      }
      break;
    case 'trojan':
      outbound.password = node.password || '';
      break;
    case 'vmess':
    case 'vless':
      outbound.uuid = node.uuid || '';
      break;
  }

  // TLS
  if (params.scv || node['skip-cert-verify']) {
    (outbound.tls as Record<string, unknown> || (outbound.tls = {}))['insecure'] = true;
  }
  if (node.sni) {
    (outbound.tls as Record<string, unknown> || (outbound.tls = {}))['server_name'] = node.sni;
  }

  return outbound;
}

/**
 * 应用 sing-box 节点过滤
 */
function applySingboxNodeFilters(nodes: ProxyNode[], params: ConversionParams): ProxyNode[] {
  let filtered = [...nodes];

  if (params.include) {
    try {
      const regex = new RegExp(params.include);
      filtered = filtered.filter(n => regex.test(n.name));
    } catch { /* skip */ }
  }
  if (params.exclude) {
    try {
      const regex = new RegExp(params.exclude);
      filtered = filtered.filter(n => !regex.test(n.name));
    } catch { /* skip */ }
  }
  if (params.sort) {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  return filtered;
}

/**
 * 转换 Clash 规则为 sing-box 规则
 */
function convertRuleToSingbox(rule: string): Record<string, unknown> | null {
  const parts = rule.split(',');
  if (parts.length < 2) return null;

  const ruleType = parts[0].trim();
  const value = parts.slice(1).join(',').trim();

  switch (ruleType) {
    case 'DOMAIN-SUFFIX':
      return { domain_suffix: value };
    case 'DOMAIN':
      return { domain: value };
    case 'DOMAIN-KEYWORD':
      return { domain_keyword: value };
    case 'DOMAIN-REGEX':
      return { domain_regex: value };
    case 'IP-CIDR':
      return { ip_cidr: value };
    case 'IP-CIDR6':
      return { ip_cidr: value };
    case 'GEOIP':
      return { geoip: value.toLowerCase() };
    case 'PROCESS-NAME':
      return { process_name: value };
    default:
      return null;
  }
}

/**
 * 转换 Clash DNS 为 sing-box DNS
 */
function convertSingboxDns(config: ClashConfig): Record<string, unknown> {
  const dns: Record<string, unknown> = {
    servers: [
      { tag: 'local', address: 'https://doh.pub/dns-query', detour: 'DIRECT' },
      { tag: 'remote', address: 'https://1.1.1.1/dns-query' },
    ],
    rules: [
      { outbound: 'any', server: 'local' },
      { rule_set: 'geosite-cn', server: 'local' },
    ],
  };
  return dns;
}