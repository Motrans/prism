// ============================================================
// 类型定义 - 代理订阅转换工具核心数据模型
// ============================================================

/** 支持的输出格式 */
export type OutputTarget = 'clash' | 'singbox' | 'surge';

/** 节点（代理）的通用表示 */
export interface ProxyNode {
  name: string;
  type: string;             // ss, ssr, vmess, vless, trojan, hysteria2, http, socks5, snell, tuic
  server: string;
  port: number;
  // 以下字段根据 type 不同而不同
  cipher?: string;
  password?: string;
  uuid?: string;
  plugin?: string;
  'plugin-opts'?: Record<string, string>;
  udp?: boolean;
  tfo?: boolean;
  'skip-cert-verify'?: boolean;
  sni?: string;
  alpn?: string[];
  ws?: boolean;
  'ws-opts'?: Record<string, unknown>;
  network?: string;
  [key: string]: unknown;
}

/** Clash 原始配置结构（解析后的） */
export interface ClashConfig {
  proxies: ProxyNode[];
  'proxy-groups'?: ProxyGroup[];
  rules?: string[];
  'rule-providers'?: Record<string, RuleProviderConfig>;
  // 其他可选字段
  port?: number;
  'mixed-port'?: number;
  'allow-lan'?: boolean;
  mode?: string;
  'log-level'?: string;
  dns?: Record<string, unknown>;
  hosts?: Record<string, string>;
  [key: string]: unknown;
}

/** 策略组 */
export interface ProxyGroup {
  name: string;
  type: string;             // select, url-test, fallback, load-balance
  proxies: string[];
  url?: string;
  interval?: number;
  tolerance?: number;
  lazy?: boolean;
}

/** 规则提供者配置 */
export interface RuleProviderConfig {
  type: string;              // http, file
  behavior: string;          // classical, ipcidr, domain
  url?: string;
  path?: string;
  interval?: number;
}

/** .ini 规则配置文件的解析结果 */
export interface ParsedIniConfig {
  rulesetEntries: RulesetEntry[];
  customProxyGroups: CustomProxyGroup[];
  enableRuleGenerator: boolean;
  overwriteOriginalRules: boolean;
}

/** ruleset 条目 */
export interface RulesetEntry {
  groupName: string;          // 如 "🚀 节点选择", "🎯 全球直连"
  url: string;                // 远程规则集 URL
  // 特殊值 "[]GEOIP,CN" / "[]FINAL" 标记
  isSpecial?: boolean;
  specialType?: string;       // "GEOIP" | "FINAL"
  specialValue?: string;      // "CN" 等
}

/** 自定义策略组 */
export interface CustomProxyGroup {
  name: string;
  groupType: string;          // select, url-test, fallback
  proxies: string[];          // 成员策略组/节点名
  url?: string;
  interval?: number;
}

/** 订阅转换请求参数 — 仅保留被生成器实际使用的参数 */
export interface ConversionParams {
  target: OutputTarget;
  url: string;
  config?: string;
  include?: string;
  exclude?: string;
  filename?: string;
  emoji?: boolean;
  append_type?: boolean;
  tfo?: boolean;
  udp?: boolean;
  sort?: boolean;
  scv?: boolean;
  expand?: boolean;
  tls13?: boolean;
}

/** 转换后的输出内容 */
export interface ConversionResult {
  content: string;
  contentType: string;
  filename?: string;
}

// ============================================================
// 默认参数值
// ============================================================
export const DEFAULT_PARAMS: ConversionParams = {
  target: 'clash',
  url: '',
  emoji: true,
  append_type: false,
  tfo: false,
  udp: false,
  sort: false,
  scv: false,
  expand: true,
  tls13: false,
};