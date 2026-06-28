// ============================================================
// Prism 前端页面 (内联 HTML + CSS + JS)
// ============================================================

export const FRONTEND_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Prism - 代理订阅转换</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23a78bfa'/%3E%3Cstop offset='100%25' style='stop-color:%236366f1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpolygon points='32,4 60,32 32,60 4,32' fill='url(%23g)' stroke='%237c3aed' stroke-width='2'/%3E%3C/svg%3E" type="image/svg+xml">
<script>
(function(){
  try {
    var t = localStorage.getItem('prism-theme');
    if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  } catch(e) {}
})();
</script>
<style>
  :root {
    --bg: #0d1117;
    --card-bg: #161b22;
    --border: #30363d;
    --text: #c9d1d9;
    --text-secondary: #8b949e;
    --accent: #7c3aed;
    --accent-hover: #6d28d9;
    --accent-light: #a78bfa;
    --input-bg: #0d1117;
    --success: #238636;
    --radius: 8px;
    --shadow: 0 8px 24px rgba(0,0,0,0.4);
  }
  :root[data-theme="light"] {
    --bg: #ffffff;
    --card-bg: #f6f8fa;
    --border: #d0d7de;
    --text: #1f2328;
    --text-secondary: #57606a;
    --accent: #6d28d9;
    --accent-hover: #5b21b6;
    --accent-light: #7c3aed;
    --input-bg: #ffffff;
    --success: #1f883d;
    --shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
  html { scrollbar-gutter: stable; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    display: flex; flex-direction: column; align-items: center;
    padding: 20px;
    background-image: radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 70%);
    transition: background-color 0.3s, color 0.3s;
  }
  :root[data-theme="light"] body {
    background-image: radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.06) 0%, transparent 70%);
  }
  .container { width: 100%; max-width: 720px; margin-top: 40px; }
  .logo { text-align: center; margin-bottom: 8px; }
  .logo h1 {
    font-size: 2.2rem; font-weight: 700;
    background: linear-gradient(135deg, var(--accent-light), #6366f1);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .logo p { color: var(--text-secondary); font-size: 0.9rem; margin-top: 4px; }
  .card {
    background: var(--card-bg); border: 1px solid var(--border);
    border-radius: 12px; padding: 24px; margin-top: 20px;
    transition: background-color 0.3s, border-color 0.3s, color 0.3s;
  }
  .card-title {
    font-size: 1rem; font-weight: 600; margin-bottom: 16px;
    color: var(--text); display: flex; align-items: center; gap: 8px;
  }
  .card-title::before { content: ''; width: 3px; height: 18px; background: var(--accent); border-radius: 2px; }
  .form-group { margin-bottom: 14px; }
  .form-group label { display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 5px; font-weight: 500; }
  .form-group input, .form-group select {
    width: 100%; padding: 10px 12px; background: var(--input-bg);
    border: 1px solid var(--border); border-radius: var(--radius);
    color: var(--text); font-size: 0.9rem; line-height: 1.4; outline: none;
    transition: border-color 0.2s, background-color 0.3s, color 0.3s;
  }
  .form-group input:focus, .form-group select:focus { border-color: var(--accent); }
  #config-custom-group {
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    margin-bottom: 0;
    transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                opacity 0.3s ease,
                margin-bottom 0.3s ease;
  }
  #config-custom-group.show {
    max-height: 80px;
    opacity: 1;
    margin-bottom: 14px;
  }
  .form-row { display: flex; gap: 12px; }
  .form-row .form-group { flex: 1; }
  .mode-toggle {
    display: flex; gap: 4px; background: var(--bg);
    border: 1px solid var(--border); border-radius: var(--radius);
    padding: 3px; margin-bottom: 16px;
    position: relative;
  }
  .mode-indicator {
    position: absolute;
    top: 3px;
    left: 3px;
    width: calc(50% - 5px);
    height: calc(100% - 6px);
    background: var(--accent);
    border-radius: 6px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 0;
  }
  .mode-toggle.advanced .mode-indicator {
    transform: translateX(calc(100% + 4px));
  }
  .mode-btn {
    flex: 1; padding: 8px 12px; border: none; border-radius: 6px;
    cursor: pointer; font-size: 0.85rem; font-weight: 500;
    background: transparent; color: var(--text-secondary);
    transition: color 0.3s;
    position: relative; z-index: 1;
  }
  .mode-btn.active { color: #fff; }
  /* Bottom toolbar */
  .bottom-toolbar {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-bottom: 20px;
  }
  .toolbar-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: var(--card-bg);
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s, border-color 0.3s, color 0.3s;
    text-decoration: none;
    padding: 0;
  }
  .toolbar-btn:hover {
    border-color: var(--accent);
    color: var(--accent-light);
  }
  /* Custom select dropdown */
  .custom-select {
    position: relative;
    width: 100%;
    user-select: none;
  }
  .custom-select select {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  .custom-select-trigger {
    width: 100%;
    padding: 10px 32px 10px 12px;
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    font-size: 0.9rem;
    line-height: 1.4;
    cursor: pointer;
    position: relative;
    transition: border-color 0.2s, border-radius 0.15s, background-color 0.3s, color 0.3s;
    outline: none;
  }
  .custom-select-trigger:focus {
    border-color: var(--accent);
  }
  .custom-select.active .custom-select-trigger {
    border-color: var(--accent);
    border-radius: var(--radius) var(--radius) 0 0;
    border-bottom-color: transparent;
  }
  .custom-select-trigger-text {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .custom-select-arrow {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    transition: transform 0.15s ease;
    color: var(--text-secondary);
    pointer-events: none;
  }
  .custom-select.active .custom-select-arrow {
    transform: translateY(-50%) rotate(180deg);
  }
  .custom-select-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--card-bg);
    border: 1px solid var(--accent);
    border-top: 1px solid var(--border);
    border-radius: 0 0 12px 12px;
    box-shadow: var(--shadow);
    overflow: hidden;
    z-index: 100;
    transform: scaleY(0);
    opacity: 0;
    transform-origin: top center;
    transition: transform 0.15s ease, opacity 0.15s ease;
    pointer-events: none;
  }
  .custom-select.active .custom-select-dropdown {
    transform: scaleY(1);
    opacity: 1;
    pointer-events: auto;
  }
  .custom-select-option {
    padding: 10px 12px;
    cursor: pointer;
    color: var(--text);
    font-size: 0.9rem;
    border-bottom: 1px solid var(--border);
    transition: background-color 0.1s;
  }
  .custom-select-option:last-child {
    border-bottom: none;
  }
  .custom-select-option:hover {
    background: var(--bg);
  }
  .custom-select-option.selected {
    color: var(--accent-light);
    font-weight: 700;
  }
  .custom-select-option.highlighted {
    background: var(--bg);
  }
  /* Drop-up variant for near-bottom overflow */
  .custom-select.drop-up .custom-select-trigger {
    border-radius: 0 0 var(--radius) var(--radius);
    border-top-color: transparent;
    border-bottom-color: var(--accent);
  }
  .custom-select.drop-up .custom-select-dropdown {
    top: auto;
    bottom: 100%;
    border-radius: 12px 12px 0 0;
    border-bottom: 1px solid var(--border);
    border-top: 1px solid var(--accent);
    transform-origin: bottom center;
  }
  .btn-primary {
    width: 100%; padding: 12px; background: var(--accent);
    border: none; border-radius: var(--radius); color: #fff;
    font-size: 0.95rem; font-weight: 600; cursor: pointer;
    transition: background 0.2s; margin-top: 4px;
  }
  .btn-primary:hover { background: var(--accent-hover); }
  .result { margin-top: 20px; }
  .result-url {
    width: 100%; padding: 12px; background: var(--input-bg);
    border: 1px solid var(--border); border-radius: var(--radius);
    color: var(--accent-light); font-size: 0.8rem;
    word-break: break-all; font-family: monospace;
    min-height: 48px; resize: vertical;
  }
  .result-actions { display: flex; gap: 8px; margin-top: 10px; }
  .btn-sm {
    padding: 8px 16px; border: 1px solid var(--border);
    border-radius: var(--radius); cursor: pointer;
    font-size: 0.82rem; background: var(--card-bg); color: var(--text);
    transition: all 0.2s;
  }
  .btn-sm:hover { border-color: var(--accent); color: var(--accent-light); }
  .btn-sm.download { background: var(--success); border-color: var(--success); color: #fff; }
  .btn-sm.download:hover { opacity: 0.9; }
  .status { font-size: 0.82rem; margin-top: 8px; color: var(--text-secondary); min-height: 20px; }
  footer { margin-top: 0; padding: 20px; text-align: center; color: var(--text-secondary); font-size: 0.78rem; }
  #advanced {
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                opacity 0.3s ease;
  }
  #advanced.show {
    max-height: 400px;
    opacity: 1;
  }
  .toggle-params {
    margin-top: 12px; margin-bottom: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
  }
  .toggle-item { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--text-secondary); cursor: pointer; }
  .toggle-item input[type="checkbox"] { accent-color: var(--accent); width: 16px; height: 16px; }
  @media (max-width: 480px) {
    body { padding: 12px; }
    .container { margin-top: 20px; }
    .card { padding: 16px; }
    .form-row { flex-direction: column; gap: 0; }
    .toggle-params { grid-template-columns: 1fr; }
  }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
</style>
</head>
<body>
<div class="container">
  <div class="logo">
    <h1>◆ Prism</h1>
    <p>代理订阅转换工具 · 多格式支持</p>
  </div>

  <div class="card">
    <div class="mode-toggle" id="mode-toggle">
      <div class="mode-indicator"></div>
      <button class="mode-btn active" onclick="setMode('basic')" id="mode-basic">基础模式</button>
      <button class="mode-btn" onclick="setMode('advanced')" id="mode-advanced">进阶模式</button>
    </div>

    <div class="form-group">
      <label>原始订阅链接</label>
      <input type="url" id="url" required>
    </div>

    <div class="form-group">
      <label>规则配置</label>
      <div class="custom-select" id="config-select-wrapper">
        <div class="custom-select-trigger" tabindex="0" role="combobox" aria-expanded="false" aria-haspopup="listbox" aria-controls="config-select-listbox">
          <span class="custom-select-trigger-text">默认（不更改规则配置）</span>
          <svg class="custom-select-arrow" width="10" height="6" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="custom-select-dropdown" id="config-select-listbox" role="listbox">
          <div class="custom-select-option selected" data-value="" role="option" aria-selected="true">默认（不更改规则配置）</div>
          <div class="custom-select-option" data-value="https://gist.githubusercontent.com/Motrans/7aa9bf8aeb5b849c13301659881bfb65/raw/GFW-bypass-rules.ini" role="option" aria-selected="false">Prism 预设规则</div>
          <div class="custom-select-option" data-value="__custom__" role="option" aria-selected="false">自定义</div>
        </div>
        <select id="config-select" onchange="onConfigChange()">
          <option value="">默认（不更改规则配置）</option>
          <option value="https://gist.githubusercontent.com/Motrans/7aa9bf8aeb5b849c13301659881bfb65/raw/GFW-bypass-rules.ini">Prism 预设规则</option>
          <option value="__custom__">自定义</option>
        </select>
      </div>
    </div>
    <div class="form-group" id="config-custom-group">
      <label>自定义规则配置链接</label>
      <input type="url" id="config-custom">
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>输出格式</label>
        <div class="custom-select" id="target-wrapper">
          <div class="custom-select-trigger" tabindex="0" role="combobox" aria-expanded="false" aria-haspopup="listbox" aria-controls="target-listbox">
            <span class="custom-select-trigger-text">Clash / Mihomo (YAML)</span>
            <svg class="custom-select-arrow" width="10" height="6" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="custom-select-dropdown" id="target-listbox" role="listbox">
            <div class="custom-select-option selected" data-value="clash" role="option" aria-selected="true">Clash / Mihomo (YAML)</div>
            <div class="custom-select-option" data-value="singbox" role="option" aria-selected="false">sing-box (JSON)</div>
            <div class="custom-select-option" data-value="surge" role="option" aria-selected="false">Surge (INI)</div>
          </div>
          <select id="target">
            <option value="clash">Clash / Mihomo (YAML)</option>
            <option value="singbox">sing-box (JSON)</option>
            <option value="surge">Surge (INI)</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>输出文件名（可选）</label>
        <input type="text" id="filename" placeholder="留空则默认为 Prism">
      </div>
    </div>

    <div id="advanced">
      <div class="card-title">进阶参数</div>
      <div class="toggle-params">
        <label class="toggle-item"><input type="checkbox" id="emoji" checked> 保留 Emoji</label>
        <label class="toggle-item"><input type="checkbox" id="tfo"> TCP Fast Open</label>
        <label class="toggle-item"><input type="checkbox" id="udp"> UDP 强制开启</label>
        <label class="toggle-item"><input type="checkbox" id="scv"> 跳过证书验证</label>
        <label class="toggle-item"><input type="checkbox" id="sort"> 节点排序</label>
        <label class="toggle-item"><input type="checkbox" id="expand" checked> 展开规则全文</label>
        <label class="toggle-item"><input type="checkbox" id="append_type"> 节点名加类型标记</label>
        <label class="toggle-item"><input type="checkbox" id="tls13"> TLS 1.3</label>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>包含节点（正则）</label>
          <input type="text" id="include" placeholder="如 HK|JP|TW">
        </div>
        <div class="form-group">
          <label>排除节点（正则）</label>
          <input type="text" id="exclude" placeholder="如 剩余|官网|到期">
        </div>
      </div>
    </div>

    <button class="btn-primary" onclick="generateSubscription()">🔄 生成订阅链接</button>

    <div class="result" id="result-section" style="display:none;">
      <label style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;display:block;">生成的订阅链接：</label>
      <textarea class="result-url" id="result-url" readonly rows="3"></textarea>
      <div class="result-actions">
        <button class="btn-sm" onclick="copyUrl()">📋 复制链接</button>
        <button class="btn-sm download" id="btn-download" onclick="downloadConfig()">⬇ 下载配置</button>
      </div>
      <div class="status" id="status"></div>
    </div>
  </div>
</div>

<footer>
  <div class="bottom-toolbar">
    <button class="toolbar-btn" id="theme-toggle" title="切换主题" aria-label="切换主题">
      <span id="theme-icon" style="display:flex;align-items:center;justify-content:center"></span>
    </button>
    <a class="toolbar-btn" href="https://github.com/Motrans/prism" target="_blank" rel="noopener" title="GitHub" aria-label="GitHub">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
    </a>
  </div>
  <p>© 2026<span id="year-range"></span> Zhong Zhiyu. All rights reserved.</p>
</footer>

<script>
// ========== 主题管理器 ==========
(function() {
  var THEME_KEY = 'prism-theme';
  var themeToggle = document.getElementById('theme-toggle');
  var themeIcon = document.getElementById('theme-icon');
  var currentTheme;

  try {
    currentTheme = localStorage.getItem(THEME_KEY) || 'auto';
  } catch(e) {
    currentTheme = 'auto';
  }

  var mql = window.matchMedia('(prefers-color-scheme: light)');

  function getEffectiveTheme() {
    if (currentTheme === 'auto') {
      return mql.matches ? 'light' : 'dark';
    }
    return currentTheme;
  }

  var ICONS = {
    auto: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>',
    light: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
    dark: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
  };
  function updateIcon() {
    themeIcon.innerHTML = ICONS[currentTheme];
  }

  function applyTheme() {
    var effective = getEffectiveTheme();
    if (effective === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    updateIcon();
  }

  function cycleTheme() {
    if (currentTheme === 'auto') {
      currentTheme = 'light';
    } else if (currentTheme === 'light') {
      currentTheme = 'dark';
    } else {
      currentTheme = 'auto';
    }
    try {
      localStorage.setItem(THEME_KEY, currentTheme);
    } catch(e) {}
    applyTheme();
  }

  themeToggle.addEventListener('click', cycleTheme);

  mql.addEventListener('change', function() {
    if (currentTheme === 'auto') {
      applyTheme();
    }
  });

  applyTheme();
})();

// ========== 年份范围 ==========
(function() {
  var currentYear = new Date().getFullYear();
  var el = document.getElementById('year-range');
  if (currentYear > 2026 && el) el.textContent = '~' + currentYear;
})();

// ========== 自定义下拉框 ==========
(function() {
  function initCustomSelect(wrapper) {
    var select = wrapper.querySelector('select');
    var trigger = wrapper.querySelector('.custom-select-trigger');
    var dropdown = wrapper.querySelector('.custom-select-dropdown');
    var options = wrapper.querySelectorAll('.custom-select-option');
    var triggerText = wrapper.querySelector('.custom-select-trigger-text');

    function syncFromNative() {
      var val = select.value;
      options.forEach(function(opt) {
        var isSel = opt.getAttribute('data-value') === val;
        opt.classList.toggle('selected', isSel);
        opt.setAttribute('aria-selected', String(isSel));
        if (isSel) triggerText.textContent = opt.textContent;
      });
    }

    function closeAll() {
      document.querySelectorAll('.custom-select.active').forEach(function(w) {
        w.classList.remove('active');
        w.classList.remove('drop-up');
        w.querySelector('.custom-select-trigger').setAttribute('aria-expanded', 'false');
      });
    }

    function openDropdown() {
      closeAll();
      wrapper.classList.add('active');
      trigger.setAttribute('aria-expanded', 'true');
      var sel = dropdown.querySelector('.custom-select-option.selected');
      if (sel) sel.scrollIntoView({ block: 'nearest' });
      requestAnimationFrame(function() {
        var rect = dropdown.getBoundingClientRect();
        if (rect.bottom > window.innerHeight && rect.top > window.innerHeight / 2) {
          wrapper.classList.add('drop-up');
        }
      });
    }

    function closeDropdown() {
      wrapper.classList.remove('active');
      wrapper.classList.remove('drop-up');
      trigger.setAttribute('aria-expanded', 'false');
      options.forEach(function(o) { o.classList.remove('highlighted'); });
    }

    function selectOption(optionEl) {
      var val = optionEl.getAttribute('data-value');
      select.value = val;
      syncFromNative();
      closeDropdown();
      if (select.onchange) select.onchange.call(select);
    }

    function highlightOption(optionEl) {
      options.forEach(function(o) { o.classList.remove('highlighted'); });
      if (optionEl) {
        optionEl.classList.add('highlighted');
        optionEl.scrollIntoView({ block: 'nearest' });
      }
    }

    function getHighlightedIndex() {
      var found = -1;
      options.forEach(function(o, i) {
        if (o.classList.contains('highlighted')) found = i;
      });
      return found;
    }

    function getSelectedIndex() {
      var found = 0;
      options.forEach(function(o, i) {
        if (o.classList.contains('selected')) found = i;
      });
      return found;
    }

    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      if (wrapper.classList.contains('active')) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });

    options.forEach(function(opt) {
      opt.addEventListener('click', function(e) {
        e.stopPropagation();
        selectOption(opt);
      });
    });

    trigger.addEventListener('keydown', function(e) {
      var isOpen = wrapper.classList.contains('active');
      var opts = Array.from(options);
      var hlIdx = getHighlightedIndex();
      var key = e.key;

      switch (key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isOpen && hlIdx >= 0) {
            selectOption(opts[hlIdx]);
          } else if (isOpen) {
            selectOption(opts[getSelectedIndex()]);
          } else {
            openDropdown();
            highlightOption(opts[getSelectedIndex()]);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            openDropdown();
            highlightOption(opts[getSelectedIndex()]);
          } else {
            var nextIdx = hlIdx < opts.length - 1 ? hlIdx + 1 : hlIdx;
            highlightOption(opts[nextIdx]);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (!isOpen) {
            openDropdown();
            highlightOption(opts[getSelectedIndex()]);
          } else {
            var prevIdx = hlIdx > 0 ? hlIdx - 1 : 0;
            highlightOption(opts[prevIdx]);
          }
          break;
        case 'Escape':
          closeDropdown();
          trigger.focus();
          break;
        case 'Tab':
          closeDropdown();
          break;
        default:
          if (key.length === 1 && /[a-zA-Z一-鿿]/.test(key)) {
            var ch = key.toLowerCase();
            var match = opts.find(function(o) {
              return o.textContent.trim().toLowerCase().indexOf(ch) === 0;
            });
            if (match) highlightOption(match);
          }
      }
    });

    syncFromNative();
  }

  document.addEventListener('click', function(e) {
    if (!e.target.closest('.custom-select')) {
      document.querySelectorAll('.custom-select.active').forEach(function(w) {
        w.classList.remove('active');
        w.classList.remove('drop-up');
        w.querySelector('.custom-select-trigger').setAttribute('aria-expanded', 'false');
      });
    }
  });

  document.querySelectorAll('.custom-select').forEach(initCustomSelect);
})();

// ========== 现有业务函数 ==========
function onConfigChange() {
  var val = document.getElementById('config-select').value;
  document.getElementById('config-custom-group').classList.toggle('show', val === '__custom__');
}

function setMode(mode) {
  document.getElementById('advanced').classList.toggle('show', mode === 'advanced');
  document.getElementById('mode-toggle').classList.toggle('advanced', mode === 'advanced');
  document.getElementById('mode-basic').classList.toggle('active', mode === 'basic');
  document.getElementById('mode-advanced').classList.toggle('active', mode === 'advanced');
}

function generateSubscription() {
  var urlEl = document.getElementById('url');
  var url = urlEl.value.trim();
  if (!url) {
    showResult('⚠️ 请输入订阅链接');
    return;
  }

  var params = new URLSearchParams();
  params.set('target', document.getElementById('target').value);
  params.set('url', url);

  var configVal = document.getElementById('config-select').value.trim();
  if (configVal === '__custom__') {
    configVal = document.getElementById('config-custom').value.trim();
  }
  if (configVal) params.set('config', configVal);

  var filename = document.getElementById('filename').value.trim();
  if (!filename) filename = 'Prism';
  filename = filename.replace(/\.(yaml|json|conf)$/i, '');
  params.set('filename', filename);

  ['emoji','tfo','udp','scv','sort','expand','append_type','tls13'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) params.set(id, el.checked ? 'true' : 'false');
  });

  var include = document.getElementById('include').value.trim();
  if (include) params.set('include', include);
  var exclude = document.getElementById('exclude').value.trim();
  if (exclude) params.set('exclude', exclude);

  var apiUrl = window.location.origin + '/sub?' + params.toString();

  document.getElementById('result-url').value = apiUrl;
  document.getElementById('result-section').style.display = 'block';
  document.getElementById('status').textContent = '✅ 订阅链接已生成';
}

function showResult(msg) {
  document.getElementById('status').textContent = msg;
  document.getElementById('result-section').style.display = 'block';
}

function copyUrl() {
  var el = document.getElementById('result-url');
  el.select();
  if (navigator.clipboard) {
    navigator.clipboard.writeText(el.value).then(function() {
      document.getElementById('status').textContent = '📋 已复制到剪贴板';
    });
  } else {
    document.execCommand('copy');
    document.getElementById('status').textContent = '📋 已复制到剪贴板';
  }
}

async function downloadConfig() {
  var apiUrl = document.getElementById('result-url').value;
  var target = document.getElementById('target').value;
  var extMap = { clash: '.yaml', singbox: '.json', surge: '.conf' };
  var ext = extMap[target] || '.yaml';
  var name = document.getElementById('filename').value.trim();
  if (!name) name = 'Prism';
  name = name.replace(/\.(yaml|json|conf)$/i, '') + ext;
  try {
    var resp = await fetch(apiUrl);
    var blob = await resp.blob();
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
    document.getElementById('status').textContent = '⬇ 下载已开始';
  } catch(e) {
    document.getElementById('status').textContent = '⚠️ 下载失败';
  }
}
</script>
</body>
</html>`;