// ============================================================
// Surge 配置生成器
// 将 Clash 代理节点 + 规则配置转换为 Surge INI 格式
// ============================================================

import type { ClashConfig, ProxyNode, ParsedIniConfig, ConversionParams } from '../utils/types';
import { expandPlaceholderProxies } from '../parsers/ini-parser';

/**
 * 生成 Surge INI 格式的配置
 */
export function generateSurgeConfig(
  sourceConfig: ClashConfig,
  iniConfig: ParsedIniConfig,
  params: ConversionParams,
  ruleContents: Record<string, string[]>
): string {
  const lines: string[] = [];

  // ---- 头部注释 ----
  lines.push('# ====================================');
  lines.push('# Prism - 订阅转换工具 (Surge)');
  lines.push('# ====================================');
  lines.push('');

  // ---- General 设置 ----
  lines.push('[General]');
  if (sourceConfig['log-level']) {
    lines.push(`loglevel = ${sourceConfig['log-level']}`);
  }
  if (sourceConfig['external-controller']) {
    lines.push(`external-controller-access = ${sourceConfig['external-controller']}`);
  }
  lines.push('');

  // ---- Proxy 节点 ----
  lines.push('[Proxy]');
  const allNodes = applySurgeNodeFilters(sourceConfig.proxies, params);

  for (const node of allNodes) {
    const surgeProxy = convertNodeToSurgeProxy(node, params);
    if (surgeProxy) {
      lines.push(surgeProxy);
    }
  }
  lines.push('');

  // ---- Proxy Group 策略组 ----
  const allNodeNames = allNodes.map(n => n.name);

  if (params.config && iniConfig.customProxyGroups.length > 0) {
    const groups = expandPlaceholderProxies(iniConfig.customProxyGroups, allNodeNames);
    lines.push('[Proxy Group]');
    for (const group of groups) {
      const groupType = mapSurgeGroupType(group.groupType);
      const validProxies = group.proxies.filter(p =>
        p === 'DIRECT' || p === 'REJECT' || p === 'REJECT-TLS' ||
        allNodeNames.includes(p) || groups.some(g => g.name === p)
      );
      const proxyStr = validProxies.join(', ');
      if ((group.groupType === 'url-test' || group.groupType === 'fallback') && group.url) {
        lines.push(`${group.name} = ${groupType}, ${proxyStr}, url = ${group.url}, interval = ${group.interval || 300}`);
      } else {
        lines.push(`${group.name} = ${groupType}, ${proxyStr}`);
      }
    }
    lines.push('');
  } else if (sourceConfig['proxy-groups'] && sourceConfig['proxy-groups'].length > 0) {
    // 无外部 config 时，从原始订阅生成策略组
    lines.push('[Proxy Group]');
    for (const group of sourceConfig['proxy-groups']) {
      const groupType = mapSurgeGroupType(group.type || 'select');
      const proxies = (group.proxies || []).join(', ');
      if (!proxies) continue;
      lines.push(`${group.name} = ${groupType}, ${proxies}`);
    }
    lines.push('');
  }

  // ---- Rule 规则 ----
  if (params.config && iniConfig.rulesetEntries.length > 0) {
    lines.push('[Rule]');
    for (const entry of iniConfig.rulesetEntries) {
      if (entry.isSpecial) {
        if (entry.specialType === 'GEOIP' && entry.specialValue) {
          lines.push(`GEOIP,${entry.specialValue},${entry.groupName}`);
        } else if (entry.specialType === 'FINAL') {
          lines.push(`FINAL,${entry.groupName}`);
        }
      } else {
        const content = ruleContents[entry.url];
        if (content) {
          for (const rule of content) {
            if (!rule || rule.startsWith('#')) continue;
            const converted = convertRuleToSurge(rule);
            if (converted) {
              lines.push(`${converted},${entry.groupName}`);
            }
          }
        }
      }
    }
    lines.push('');
  } else if (sourceConfig.rules && sourceConfig.rules.length > 0) {
    // 无外部 config 时，从原始订阅生成规则
    lines.push('[Rule]');
    for (const rule of sourceConfig.rules) {
      if (!rule || rule.startsWith('#')) continue;
      const converted = convertRuleToSurge(rule);
      if (converted) {
        const parts = rule.split(',');
        const target = parts.length >= 2 ? parts[parts.length - 1].trim() : 'DIRECT';
        lines.push(`${converted},${target}`);
      }
    }
    lines.push('');
  }

  // ---- URL Rewrite ----
  lines.push('[URL Rewrite]');
  lines.push('# 无特定的 URL Rewrite 规则');
  lines.push('');

  // ---- MITM ----
  lines.push('[MITM]');
  lines.push('# 未启用 MITM');
  lines.push('');

  return lines.join('\n');
}

/**
 * 节点过滤
 */
function applySurgeNodeFilters(nodes: ProxyNode[], params: ConversionParams): ProxyNode[] {
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
 * Surge 代理格式：
 * 对于 SS:  name = ss, server, port, encrypt-method, password
 * 对于 VMess: name = vmess, server, port, username=UUID, ws=true, ...
 */
function convertNodeToSurgeProxy(node: ProxyNode, params: ConversionParams): string | null {
  let displayName = node.name;
  if (params.emoji === false) {
    displayName = displayName.replace(/[\u{1F000}-\u{1FFFF}]/gu, '').trim();
  }
  if (params.append_type) {
    displayName = `[${node.type.toUpperCase()}] ${displayName}`;
  }

  // 转义名称中的逗号和等号
  const safeName = displayName.replace(/[,=]/g, '\\$&');

  switch (node.type) {
    case 'ss': {
      const obfs = node.plugin === 'obfs' && node['plugin-opts'] 
        ? `, obfs=${node['plugin-opts'].mode || 'http'}, obfs-host=${node['plugin-opts'].host || ''}` 
        : '';
      let extra = '';
      if (params.tfo) extra += ', tfo=true';
      if (params.udp || node.udp) extra += ', udp-relay=true';
      return `${safeName} = ss, ${node.server}, ${node.port}, encrypt-method=${node.cipher || 'aes-128-gcm'}, password=${node.password || ''}${obfs}${extra}`;
    }

    case 'trojan': {
      let extra = '';
      if (node.sni) extra += `, sni=${node.sni}`;
      if (params.scv || node['skip-cert-verify']) extra += ', skip-cert-verify=true';
      if (params.tfo) extra += ', tfo=true';
      if (params.udp || node.udp) extra += ', udp-relay=true';
      return `${safeName} = trojan, ${node.server}, ${node.port}, password=${node.password || ''}${extra}`;
    }

    case 'vmess': {
      let extra = '';
      // 根据 network 决定传输参数
      if (node.network === 'ws') {
        extra += ', ws=true';
        if (node['ws-opts']?.path) extra += `, ws-path=${node['ws-opts'].path}`;
        if (node['ws-opts']?.headers && (node['ws-opts'].headers as Record<string, unknown>)['Host']) extra += `, sni=${(node['ws-opts'].headers as Record<string, unknown>)['Host']}`;
      } else if (node.network === 'grpc') {
        // Surge 不原生支持 gRPC，跳过传输相关参数
        extra += ', tls=true';
      } else if (node.network === 'h2') {
        extra += ', tls=true';
      }
      if (node.tls && node.network !== 'ws') extra += ', tls=true';
      if (params.tfo) extra += ', tfo=true';
      if (params.udp || node.udp) extra += ', udp-relay=true';
      return `${safeName} = vmess, ${node.server}, ${node.port}, username=${node.uuid || ''}${extra}`;
    }

    case 'vless': {
      let extra = '';
      if (params.tfo) extra += ', tfo=true';
      if (params.udp || node.udp) extra += ', udp-relay=true';
      return `${safeName} = vless, ${node.server}, ${node.port}, username=${node.uuid || ''}${extra}`;
    }

    case 'http':
      return `${safeName} = http, ${node.server}, ${node.port}${node.username ? `, username=${node.username}` : ''}${node.password ? `, password=${node.password}` : ''}`;

    case 'socks5':
      return `${safeName} = socks5, ${node.server}, ${node.port}${node.username ? `, username=${node.username}` : ''}${node.password ? `, password=${node.password}` : ''}`;

    default:
      // 不支持的节点类型（ssr/hysteria2/snell/tuic 等），跳过
      console.warn(`[Surge] 不支持的节点类型: ${node.type} (${node.name})，已跳过`);
      return null;
  }
}

/**
 * Surge 策略组类型映射
 */
function mapSurgeGroupType(groupType: string): string {
  switch (groupType) {
    case 'url-test': return 'url-test';
    case 'fallback': return 'fallback';
    case 'load-balance': return 'load-balance';
    default: return 'select';
  }
}

/**
 * 转换 Clash 规则为 Surge 规则
 */
function convertRuleToSurge(rule: string): string | null {
  const parts = rule.split(',');
  if (parts.length < 2) return null;

  const ruleType = parts[0].trim().toUpperCase();
  const value = parts.slice(1).join(',').trim();

  switch (ruleType) {
    case 'DOMAIN-SUFFIX':
      return `DOMAIN-SUFFIX,${value}`;
    case 'DOMAIN':
      return `DOMAIN,${value}`;
    case 'DOMAIN-KEYWORD':
      return `DOMAIN-KEYWORD,${value}`;
    case 'IP-CIDR':
      return `IP-CIDR,${value}`;
    case 'IP-CIDR6':
      return `IP-CIDR6,${value}`;
    case 'GEOIP':
      return `GEOIP,${value}`;
    case 'PROCESS-NAME':
      return `PROCESS-NAME,${value}`;
    case 'USER-AGENT':
      return `USER-AGENT,${value}`;
    default:
      return null;
  }
}