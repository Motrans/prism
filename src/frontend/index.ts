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
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    display: flex; flex-direction: column; align-items: center;
    padding: 20px;
    background-image: radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 70%);
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
    color: var(--text); font-size: 0.9rem; outline: none;
    transition: border-color 0.2s;
  }
  .form-group input:focus, .form-group select:focus { border-color: var(--accent); }
  .form-row { display: flex; gap: 12px; }
  .form-row .form-group { flex: 1; }
  .mode-toggle {
    display: flex; gap: 4px; background: var(--bg);
    border: 1px solid var(--border); border-radius: var(--radius);
    padding: 3px; margin-bottom: 16px;
  }
  .mode-btn {
    flex: 1; padding: 8px 12px; border: none; border-radius: 6px;
    cursor: pointer; font-size: 0.85rem; font-weight: 500;
    background: transparent; color: var(--text-secondary);
    transition: all 0.2s;
  }
  .mode-btn.active { background: var(--accent); color: #fff; }
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
  footer { margin-top: 40px; padding: 20px; text-align: center; color: var(--text-secondary); font-size: 0.78rem; }
  #advanced { display: none; }
  #advanced.show { display: block; }
  .toggle-params {
    margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
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
</style>
</head>
<body>
<div class="container">
  <div class="logo">
    <h1>◆ Prism</h1>
    <p>代理订阅转换工具 · 多格式支持</p>
  </div>

  <div class="card">
    <div class="mode-toggle">
      <button class="mode-btn active" onclick="setMode('basic')" id="mode-basic">基础模式</button>
      <button class="mode-btn" onclick="setMode('advanced')" id="mode-advanced">进阶模式</button>
    </div>

    <div class="form-group">
      <label>原始订阅链接</label>
      <input type="url" id="url" placeholder="https://your-subscription-link.com/api/v1/..." required>
    </div>

    <div class="form-group">
      <label>规则配置</label>
      <select id="config-select" onchange="onConfigChange()">
        <option value="">默认（不更改规则配置）</option>
        <option value="https://gist.githubusercontent.com/Motrans/7aa9bf8aeb5b849c13301659881bfb65/raw/GFW-bypass-rules.ini">Prism 预设规则</option>
        <option value="__custom__">自定义</option>
      </select>
    </div>
    <div class="form-group" id="config-custom-group" style="display:none;">
      <label>自定义规则配置链接</label>
      <input type="url" id="config-custom" placeholder="https://.../GFW-bypass-rules.ini">
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>输出格式</label>
        <select id="target">
          <option value="clash">Clash / Mihomo (YAML)</option>
          <option value="singbox">sing-box (JSON) - 未验证可用性</option>
          <option value="surge">Surge (INI) - 未验证可用性</option>
        </select>
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
  <p>© 2026<span id="year-range"></span> Zhong Zhiyu. All rights reserved.</p>
</footer>

<script>
(function() {
  const currentYear = new Date().getFullYear();
  const el = document.getElementById('year-range');
  if (currentYear > 2026 && el) el.textContent = '~' + currentYear;
})();

function onConfigChange() {
  var val = document.getElementById('config-select').value;
  document.getElementById('config-custom-group').style.display = (val === '__custom__') ? 'block' : 'none';
}

function setMode(mode) {
  document.getElementById('advanced').classList.toggle('show', mode === 'advanced');
  document.getElementById('mode-basic').classList.toggle('active', mode === 'basic');
  document.getElementById('mode-advanced').classList.toggle('active', mode === 'advanced');
}

function generateSubscription() {
  const urlEl = document.getElementById('url');
  const url = urlEl.value.trim();
  if (!url) {
    showResult('⚠️ 请输入订阅链接');
    return;
  }

  const params = new URLSearchParams();
  params.set('target', document.getElementById('target').value);
  params.set('url', url);

  // 从下拉框获取规则配置
  var configVal = document.getElementById('config-select').value.trim();
  if (configVal === '__custom__') {
    configVal = document.getElementById('config-custom').value.trim();
  }
  if (configVal) params.set('config', configVal);

  // ★ 始终携带 filename 参数 —— Clash Verge 从 URL 参数读取订阅名称
  var filename = document.getElementById('filename').value.trim();
  if (!filename) filename = 'Prism';
  // 去掉可能误填的扩展名
  filename = filename.replace(/\.(yaml|json|conf)$/i, '');
  params.set('filename', filename);

  // Checkbox 参数
  ['emoji','tfo','udp','scv','sort','expand','append_type','tls13'].forEach(id => {
    const el = document.getElementById(id);
    if (el) params.set(id, el.checked ? 'true' : 'false');
  });

  const include = document.getElementById('include').value.trim();
  if (include) params.set('include', include);
  const exclude = document.getElementById('exclude').value.trim();
  if (exclude) params.set('exclude', exclude);

  const apiUrl = window.location.origin + '/sub?' + params.toString();

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
  const apiUrl = document.getElementById('result-url').value;
  const target = document.getElementById('target').value;
  const extMap = { clash: '.yaml', singbox: '.json', surge: '.conf' };
  const ext = extMap[target] || '.yaml';
  let name = document.getElementById('filename').value.trim();
  if (!name) name = 'Prism';
  name = name.replace(/\.(yaml|json|conf)$/i, '') + ext;
  try {
    const resp = await fetch(apiUrl);
    const blob = await resp.blob();
    const a = document.createElement('a');
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