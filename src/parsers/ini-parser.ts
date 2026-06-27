// ============================================================
// INI 规则配置文件解析器
// 解析 subconverter 兼容的 .ini 外部配置格式
// ============================================================

import type { ParsedIniConfig, RulesetEntry, CustomProxyGroup } from '../utils/types';

/**
 * 解析外部配置 .ini 文件内容
 * @param content 原始 .ini 文件文本
 * @returns 解析后的结构化配置
 */
export function parseIniConfig(content: string): ParsedIniConfig {
  const lines = content.split('\n').map(line => line.trim());
  
  const rulesetEntries: RulesetEntry[] = [];
  const customProxyGroups: CustomProxyGroup[] = [];
  let enableRuleGenerator = false;
  let overwriteOriginalRules = false;

  for (const line of lines) {
    // 跳过空行和注释
    if (!line || line.startsWith(';') || line.startsWith('#') || line.startsWith('//')) {
      continue;
    }

    // 跳过节标题
    if (line.startsWith('[') && line.endsWith(']')) {
      continue;
    }

    // ruleset=分组名,规则URL 或 ruleset=分组名,[]特殊规则
    if (line.startsWith('ruleset=')) {
      const value = line.substring('ruleset='.length);
      const parsed = parseRulesetValue(value);
      if (parsed) {
        rulesetEntries.push(parsed);
      }
      continue;
    }

    // custom_proxy_group=组名`类型`成员列表`URL`间隔
    if (line.startsWith('custom_proxy_group=')) {
      const value = line.substring('custom_proxy_group='.length);
      const parsed = parseCustomProxyGroup(value);
      if (parsed) {
        customProxyGroups.push(parsed);
      }
      continue;
    }

    // enable_rule_generator=true/false
    if (line.startsWith('enable_rule_generator=')) {
      enableRuleGenerator = line.substring('enable_rule_generator='.length).toLowerCase() === 'true';
      continue;
    }

    // overwrite_original_rules=true/false
    if (line.startsWith('overwrite_original_rules=')) {
      overwriteOriginalRules = line.substring('overwrite_original_rules='.length).toLowerCase() === 'true';
      continue;
    }
  }

  return {
    rulesetEntries,
    customProxyGroups,
    enableRuleGenerator,
    overwriteOriginalRules,
  };
}

/**
 * 解析 ruleset 条目值
 * 格式：分组名,规则URL
 * 特殊：分组名,[]GEOIP,CN 或 分组名,[]FINAL
 */
function parseRulesetValue(value: string): RulesetEntry | null {
  const firstComma = value.indexOf(',');
  if (firstComma === -1) return null;

  const groupName = value.substring(0, firstComma).trim();
  const rest = value.substring(firstComma + 1).trim();

  // 检查是否为特殊规则标记
  if (rest.startsWith('[]')) {
    const specialPart = rest.substring(2);
    if (specialPart === 'FINAL') {
      return {
        groupName,
        url: rest,
        isSpecial: true,
        specialType: 'FINAL',
      };
    }
    if (specialPart.startsWith('GEOIP,')) {
      return {
        groupName,
        url: rest,
        isSpecial: true,
        specialType: 'GEOIP',
        specialValue: specialPart.substring('GEOIP,'.length),
      };
    }
  }

  return {
    groupName,
    url: rest, // 远程规则集 URL
  };
}

/**
 * 解析 custom_proxy_group 条目值
 * 格式：组名`类型`成员列表`测试URL`间隔
 * 示例：🚀 节点选择`select`[]DIRECT`.*
 * 成员以反引号分隔
 */
function parseCustomProxyGroup(value: string): CustomProxyGroup | null {
  const parts = value.split('`');
  if (parts.length < 3) return null;

  const name = parts[0].trim();
  const groupType = parts[1].trim().toLowerCase();
  
  // 收集所有代理条目（从 index 2 开始）
  // subconverter 格式：name`type`proxy1`proxy2`...`url`interval
  // URL 和 interval 在末尾（可选）
  const proxies: string[] = [];
  let url: string | undefined;
  let interval: number | undefined;

  for (let i = 2; i < parts.length; i++) {
    const token = parts[i].trim();
    if (!token) continue;

    // 检查是否为纯数字（interval）
    if (/^\d+$/.test(token) && i === parts.length - 1) {
      interval = parseInt(token, 10);
      continue;
    }

    // 检查是否为 URL（包含 :// 或以 http/https 开头）
    if (token.includes('://') || /^https?:/i.test(token)) {
      url = token;
      continue;
    }

    // 处理 [] 前缀（引用其他策略组）或直接代理名
    if (token.startsWith('[]')) {
      proxies.push(token.substring(2));
    } else if (token === '.*' || token.startsWith('.*')) {
      // 正则匹配所有节点（在 expandPlaceholderProxies 中处理）
      proxies.push(token);
    } else if (token === 'DIRECT' || token === 'REJECT' || token === 'REJECT-TLS') {
      proxies.push(token);
    } else {
      proxies.push(token);
    }
  }

  return {
    name,
    groupType,
    proxies,
    url: url || undefined,
    interval,
  };
}

/**
 * 将空 [] 代理占位符替换为实际节点列表
 * @param groups 自定义策略组列表
 * @param allProxyNames 所有代理节点名称的集合
 */
export function expandPlaceholderProxies(
  groups: CustomProxyGroup[],
  allProxyNames: string[]
): CustomProxyGroup[] {
  return groups.map(group => {
    const expanded = group.proxies.flatMap(proxy => {
      if (proxy === '.*') {
        // .* 正则匹配所有节点
        return allProxyNames;
      }
      if (proxy.startsWith('.*')) {
        // 带尾缀的正则，暂简化为全匹配
        return allProxyNames;
      }
      return [proxy];
    });
    return { ...group, proxies: expanded };
  });
}