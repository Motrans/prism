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
  const inPort = sourceConfig.port || sourceConfig['mixed-port'] || 2080;
  config.inbounds = [
    {
      type: 'mixed',
      tag: 'mixed-in',
      listen: '::',
      listen_port: inPort,
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
  const rules: unknown[] = [];

  if (params.config && iniConfig.rulesetEntries.length > 0) {
    // 展开 .* 占位符
    const expandedGroups = expandPlaceholderProxies(iniConfig.customProxyGroups, allNodeNames);

    // 生成 selector/urltest 出站组
    for (const group of expandedGroups) {
      const members = group.proxies.filter(p => allNodeNames.includes(p) || ['DIRECT', 'REJECT'].includes(p));
      if (members.length === 0) continue;
      const tag = group.name;
      if (group.groupType === 'url-test') {
        (outbounds as unknown[]).push({
          type: 'urltest',
          tag,
          outbounds: members,
          url: group.url || 'http://www.gstatic.com/generate_204',
          interval: group.interval ? `${group.interval}s` : '300s',
        });
      } else {
        (outbounds as unknown[]).push({
          type: 'selector',
          tag,
          outbounds: members.length > 1 ? members : [...members, 'DIRECT'],
          default: members[0],
        });
      }
    }

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
  } else {
    // 无外部 config 时，从原始订阅生成默认路由
    for (const rule of sourceConfig.rules || []) {
      const singboxRule = convertRuleToSingbox(rule);
      if (singboxRule) {
        const parts = rule.split(',');
        const target = parts.length >= 2 ? parts[parts.length - 1].trim() : 'DIRECT';
        rules.push({ ...singboxRule, outbound: target });
      }
    }
  }

  if (rules.length > 0) {
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
  // 优先使用源配置的 DNS，否则使用通用 DNS
  if (config.dns) return config.dns as Record<string, unknown>;

  return {
    servers: [
      { tag: 'remote', address: 'tls://1.1.1.1/dns-query' },
      { tag: 'remote-backup', address: 'tls://dns.google/dns-query' },
    ],
    rules: [
      { outbound: 'any', server: 'remote' },
    ],
  };
}