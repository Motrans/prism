export const BODY = `<body>
<div class="container">
  <div class="header">
    <div class="brand">
      <h1>◆ Prism</h1>
      <p data-i18n="tagline">代理订阅转换工具 · 多格式支持</p>
    </div>
    <div class="header-actions">
      <button class="header-btn" id="theme-toggle" title="切换主题">
        <span id="theme-icon" style="display:flex;align-items:center;justify-content:center"></span>
      </button>
      <a class="header-btn" href="https://github.com/Motrans/prism" target="_blank" rel="noopener" title="GitHub" aria-label="GitHub">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
      </a>
      <div class="custom-select" id="lang-select-wrapper" style="width:auto">
        <div class="custom-select-trigger lang-trigger" tabindex="0" role="combobox" aria-expanded="false" aria-haspopup="listbox">
          <span class="custom-select-trigger-text">简体中文</span>
          <svg class="custom-select-arrow" width="10" height="6" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="custom-select-dropdown" role="listbox">
          <div class="custom-select-option selected" data-value="zh-Hans" role="option">简体中文</div>
          <div class="custom-select-option" data-value="zh-Hant" role="option">繁體中文</div>
          <div class="custom-select-option" data-value="en" role="option">English</div>
          <div class="custom-select-option" data-value="ja" role="option">日本語</div>
          <div class="custom-select-option" data-value="ko" role="option">한국어</div>
          <div class="custom-select-option" data-value="ru" role="option">Русский</div>
          <div class="custom-select-option" data-value="vi" role="option">Tiếng Việt</div>
          <div class="custom-select-option" data-value="ar" role="option">العربية</div>
          <div class="custom-select-option" data-value="fa" role="option">فارسی</div>
        </div>
        <select onchange="applyLanguage(this.value)" style="display:none">
          <option value="zh-Hans">简体中文</option>
          <option value="zh-Hant">繁體中文</option>
          <option value="en">English</option>
          <option value="ja">日本語</option>
          <option value="ko">한국어</option>
          <option value="ru">Русский</option>
          <option value="vi">Tiếng Việt</option>
          <option value="ar">العربية</option>
          <option value="fa">فارسی</option>
        </select>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="mode-toggle" id="mode-toggle">
      <div class="mode-indicator"></div>
      <button class="mode-btn active" onclick="setMode('basic')" id="mode-basic" data-i18n="modeBasic">基础模式</button>
      <button class="mode-btn" onclick="setMode('advanced')" id="mode-advanced" data-i18n="modeAdvanced">进阶模式</button>
    </div>

    <div class="form-group">
      <label data-i18n="labelUrl">原始订阅链接</label>
      <input type="url" id="url" required>
    </div>

    <div class="form-group">
      <label data-i18n="labelConfig">规则配置</label>
      <div class="custom-select" id="config-select-wrapper">
        <div class="custom-select-trigger" tabindex="0" role="combobox" aria-expanded="false" aria-haspopup="listbox" aria-controls="config-select-listbox">
          <span class="custom-select-trigger-text" data-i18n="optDefault">默认（不更改规则配置）</span>
          <svg class="custom-select-arrow" width="10" height="6" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="custom-select-dropdown" id="config-select-listbox" role="listbox">
          <div class="custom-select-option selected" data-value="" role="option" aria-selected="true" data-i18n="optDefault">默认（不更改规则配置）</div>
          <div class="custom-select-option" data-value="https://gist.githubusercontent.com/Motrans/7aa9bf8aeb5b849c13301659881bfb65/raw/GFW-bypass-rules.ini" role="option" aria-selected="false" data-i18n="optPreset">Prism 预设规则</div>
          <div class="custom-select-option" data-value="__custom__" role="option" aria-selected="false" data-i18n="optCustom">自定义</div>
        </div>
        <select id="config-select" onchange="onConfigChange()">
          <option value="" data-i18n="optDefault">默认（不更改规则配置）</option>
          <option value="https://gist.githubusercontent.com/Motrans/7aa9bf8aeb5b849c13301659881bfb65/raw/GFW-bypass-rules.ini" data-i18n="optPreset">Prism 预设规则</option>
          <option value="__custom__" data-i18n="optCustom">自定义</option>
        </select>
      </div>
    </div>
    <div class="form-group" id="config-custom-group">
      <label data-i18n="labelCustomConfig">自定义规则配置链接</label>
      <input type="url" id="config-custom">
    </div>

    <div class="form-row">
      <div class="form-group">
        <label data-i18n="labelTarget">输出格式</label>
        <div class="custom-select" id="target-wrapper">
          <div class="custom-select-trigger" tabindex="0" role="combobox" aria-expanded="false" aria-haspopup="listbox" aria-controls="target-listbox">
            <span class="custom-select-trigger-text" data-i18n="optClash">Clash / Mihomo (YAML)</span>
            <svg class="custom-select-arrow" width="10" height="6" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="custom-select-dropdown" id="target-listbox" role="listbox">
            <div class="custom-select-option selected" data-value="clash" role="option" aria-selected="true" data-i18n="optClash">Clash / Mihomo (YAML)</div>
            <div class="custom-select-option" data-value="singbox" role="option" aria-selected="false" data-i18n="optSingbox">sing-box (JSON)</div>
            <div class="custom-select-option" data-value="surge" role="option" aria-selected="false" data-i18n="optSurge">Surge (INI)</div>
          </div>
          <select id="target">
            <option value="clash" data-i18n="optClash">Clash / Mihomo (YAML)</option>
            <option value="singbox" data-i18n="optSingbox">sing-box (JSON)</option>
            <option value="surge" data-i18n="optSurge">Surge (INI)</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label data-i18n="labelFilename">输出文件名（可选）</label>
        <input type="text" id="filename" data-i18n-placeholder="placeholderFilename" placeholder="留空则默认为 Prism">
      </div>
    </div>

    <div id="advanced">
      <div class="card-title" data-i18n="advancedParams">进阶参数</div>
      <div class="toggle-params">
        <label class="toggle-item" data-i18n="toggleEmoji"><input type="checkbox" id="emoji" checked> 保留 Emoji</label>
        <label class="toggle-item" data-i18n="toggleTFO"><input type="checkbox" id="tfo"> TCP Fast Open</label>
        <label class="toggle-item" data-i18n="toggleUDP"><input type="checkbox" id="udp"> UDP 强制开启</label>
        <label class="toggle-item" data-i18n="toggleSCV"><input type="checkbox" id="scv"> 跳过证书验证</label>
        <label class="toggle-item" data-i18n="toggleSort"><input type="checkbox" id="sort"> 节点排序</label>
        <label class="toggle-item" data-i18n="toggleExpand"><input type="checkbox" id="expand" checked> 展开规则全文</label>
        <label class="toggle-item" data-i18n="toggleAppendType"><input type="checkbox" id="append_type"> 节点名加类型标记</label>
        <label class="toggle-item" data-i18n="toggleTLS13"><input type="checkbox" id="tls13"> TLS 1.3</label>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label data-i18n="labelInclude">包含节点（正则）</label>
          <input type="text" id="include" data-i18n-placeholder="placeholderInclude" placeholder="如 HK|JP|TW">
        </div>
        <div class="form-group">
          <label data-i18n="labelExclude">排除节点（正则）</label>
          <input type="text" id="exclude" data-i18n-placeholder="placeholderExclude" placeholder="如 剩余|官网|到期">
        </div>
      </div>
    </div>

    <button class="btn-primary" onclick="generateSubscription()" data-i18n="btnGenerate">生成订阅链接</button>

    <div class="result" id="result-section" style="display:none;">
      <label style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px;display:block;" data-i18n="labelResult">生成的订阅链接：</label>
      <textarea class="result-url" id="result-url" readonly rows="3"></textarea>
      <div class="result-actions">
        <button class="btn-sm" onclick="copyUrl()" data-i18n="btnCopy">复制链接</button>
        <button class="btn-sm download" id="btn-download" onclick="downloadConfig()" data-i18n="btnDownload">下载配置</button>
      </div>
      <div class="status" id="status"></div>
    </div>
  </div>
</div>

<footer>
  <p dir="ltr">© 2026<span id="year-range"></span> Zhong Zhiyu. All rights reserved.</p>
</footer>

`;
