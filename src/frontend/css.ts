export const HEAD = `<!DOCTYPE html>
<html lang="zh-Hans">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Prism - 代理订阅转换</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%2064%2064%27%3E%0A%20%20%3Cstyle%3E%0A%20%20%20%20polygon%20%7B%20fill%3A%20%23e5e5e5%3B%20stroke%3A%20%23737373%3B%20stroke-width%3A%202%3B%20%7D%0A%20%20%20%20%40media%20%28prefers-color-scheme%3A%20light%29%20%7B%0A%20%20%20%20%20%20polygon%20%7B%20fill%3A%20%23171717%3B%20stroke%3A%20%23a3a3a3%3B%20%7D%0A%20%20%20%20%7D%0A%20%20%3C%2Fstyle%3E%0A%20%20%3Cpolygon%20points%3D%2732%2C4%2060%2C32%2032%2C60%204%2C32%27%2F%3E%0A%3C%2Fsvg%3E" type="image/svg+xml">
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
    --bg: #0a0a0a;
    --card-bg: #1a1a1a;
    --border: #2e2e2e;
    --text: #e5e5e5;
    --text-secondary: #737373;
    --accent: #e5e5e5;
    --accent-hover: #ffffff;
    --accent-light: #a3a3a3;
    --input-bg: #0a0a0a;
    --success: #737373;
    --radius: 4px;
    --shadow: 0 1px 3px rgba(0,0,0,0.6);
  }
  :root[data-theme="light"] {
    --bg: #fafafa;
    --card-bg: #ffffff;
    --border: #e5e5e5;
    --text: #171717;
    --text-secondary: #737373;
    --accent: #171717;
    --accent-hover: #404040;
    --accent-light: #525252;
    --input-bg: #ffffff;
    --success: #737373;
    --shadow: 0 1px 3px rgba(0,0,0,0.06);
  }
  html { scrollbar-gutter: stable; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
  @font-face {
    font-family: 'HarmonyOS Sans SC';
    src: url(data:font/woff2;base64,d09GMgABAAAAAAO4AA8AAAAABzAAAANhAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGhYbgVQcKgZgAFwKg0CCdwE2AiQDIAsSAAQgBYMWByAXJBgSG8wFUZQvyoUwPxJjGzVbyMVWFhqpaRz5Kpzjeeow39/dqyWhVvA4XipYCAJYhQMS42T8xM7A7/IniwJMfWBFb/FMf1EMz/N/w/v+T6tOQElkcYBRViY7g+lAoOn+xLl8UTjwFhr5hGYVVOcbj3bTphR6/nuw8SdF+WsKvOCT0Zs3iJhi4cjtTfrLCsaAIqquCIYuBOK21OxiWNwNvbrAQoMdQ5BL6tEFRgiiKfqqsSOZiDMCYizSvivmgH0uiI6IoiCiKxqqqig2BFxLxOsAwO4jgCEgqqajKzqKKCK6qoKmiWDoiuxRqNM5ALT6V0cR9ct3KQe8kCU5EBgVMASowOd63CsyCEXX4wL9f4K2xBKBPNwhcIJHQcUaL1gTPIKpvqLrRL52nfVcjzMGDqDHN9gjtoMtYHPZzNsJCBB9xpye8w5+ATQARRHdpx+M29ksEzr2J167hmFXr5qYwESsmHiDDL+uHh5cJukrphMvYdhFk5pAwvTHNZxJLJpwFWDS9pY738izr+nPmTen7Is3uOWtYj+5asfXA8sWn8uQN5ZkDqQev36ZDL+x9vMq3mEyYR2G7Q85du0Sqlql5vw71WOj07tmZaV3JftV177dePdbXWyONjwsVxeTdRHNUf0CZG0y//EBAbJzQdRKcSUe2tT07By45E+cR0aAf0BW8telk/T3lz20OCk5WF9WH5QbkqRv74BxNiMfxA78SkNiyrKerRSnW3XpnK3V4XTWoPLG4oFpXXonHz4uc75oZbvaIjfZ3UUbGpXbJIsq7JrysnfC+TinFZa2I9/FpHnGBKrEoHcfgNg4CAfnsXt1Y/TPiK9b4B/6e7L336f/9v3/ZJAnUERPAaF+mxndTxhj4aMgfyk1+jHIQHlJjxN17YGonBSV28S6NRhBP6cUgMCynle8dAO8gUHFRh+qmPqhqns7mi2J6tj3895dm1i40VU3/fXQrlWbXqhAOoH0qHS9NehL0o5KJumjXRMJLb2BhgqVrZdmGlSCTjqhCttpPc0pSU+SHvqQUk9J16CHzrrqor88RagiDbroSaeTUIk6adCkY4OwVW9Hmz2KQ6r06rCn9pJFUHoaOndec7QOrBPUhXgQ3e1GoHQm5Plvxm9l7raRrRBSP1dJUC4cPPRRkjhXGgAAAA==) format('woff2');
    font-weight: 900;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'JetBrains Mono';
    src: url(data:font/woff2;base64,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) format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    display: flex; flex-direction: column; align-items: center;
    padding: 20px;
    transition: background-color 0.3s, color 0.3s;
  }
  .container { width: 100%; max-width: 720px; margin-top: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
  .header-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
  .header-btn {
    height: 36px; padding: 0 12px; border: 1px solid var(--border); border-radius: var(--radius);
    background: var(--card-bg); color: var(--text-secondary); cursor: pointer;
    display: flex; align-items: center; gap: 6px; font-size: 0.82rem;
    text-decoration: none; white-space: nowrap;
    transition: background-color 0.3s, border-color 0.3s, color 0.3s;
    line-height: 1.3;
  }
  .header-btn:hover { border-color: var(--accent); color: var(--text); }
  .lang-trigger { min-width: 110px; height: 36px; padding: 0 28px 0 10px; font-size: 0.82rem; line-height: 1.3; display: flex; align-items: center; gap: 6px; }
  .brand { margin-bottom: 0; flex-shrink: 0; padding-inline-start: 24px; }
  .brand h1 {
    font-family: 'HarmonyOS Sans SC', sans-serif;
    font-size: 2.2rem; font-weight: 900; color: var(--text);
    user-select: none; -webkit-user-select: none;
  }
  .brand p { color: var(--text-secondary); font-size: 0.9rem; margin-top: 4px; line-height: 1.3; }
  .card {
    background: var(--card-bg); border: 1px solid var(--border);
    border-radius: 6px; padding: 24px; margin-top: 20px;
    transition: background-color 0.3s, border-color 0.3s, color 0.3s;
  }
  .card-title {
    font-size: 1rem; font-weight: 600; margin-bottom: 16px;
    color: var(--text); display: flex; align-items: center; gap: 8px; line-height: 1.3;
  }
  .form-group { margin-bottom: 14px; }
  .form-group label { display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 5px; font-weight: 500; line-height: 1.3; }
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
    transition: background-color 0.3s, border-color 0.3s;
  }
  .mode-indicator {
    position: absolute;
    top: 3px;
    inset-inline-start: 3px;
    width: calc(50% - 5px);
    height: calc(100% - 6px);
    background: var(--accent);
    border-radius: 3px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 0;
  }
  .mode-toggle.advanced .mode-indicator {
    transform: translateX(calc(100% + 4px));
  }
  .mode-btn {
    flex: 1; padding: 8px 12px; border: none; border-radius: 3px;
    cursor: pointer; font-size: 0.85rem; font-weight: 500;
    background: transparent; color: var(--text-secondary); white-space: nowrap;
    line-height: 1.3;
    transition: color 0.3s;
    position: relative; z-index: 1;
  }
  .mode-btn.active { color: var(--bg); }
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
    border-radius: 0 0 6px 6px;
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
    font-size: 0.9rem; line-height: 1.3;
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
    border-radius: 6px 6px 0 0;
    border-bottom: 1px solid var(--border);
    border-top: 1px solid var(--accent);
    transform-origin: bottom center;
  }
  .btn-primary {
    width: 100%; padding: 12px; background: var(--accent);
    border: none; border-radius: var(--radius); color: var(--bg);
    font-size: 0.95rem; font-weight: 600; cursor: pointer; line-height: 1.3;
    transition: background 0.2s; margin-top: 4px;
  }
  .btn-primary:hover { background: var(--accent-hover); }
  .result { margin-top: 20px; }
  .result-url {
    width: 100%; padding: 8px 12px; background: var(--input-bg);
    border: 1px solid var(--border); border-radius: var(--radius);
    color: var(--accent-light); font-size: 0.8rem; line-height: 1.25;
    word-break: break-all; font-family: 'JetBrains Mono', monospace;
    min-height: 48px; resize: vertical;
  }
  .result-actions { display: flex; gap: 8px; margin-top: 10px; }
  .btn-sm {
    padding: 8px 16px; border: 1px solid var(--border);
    border-radius: var(--radius); cursor: pointer;
    font-size: 0.82rem; background: var(--card-bg); color: var(--text);
    line-height: 1.3; transition: all 0.2s;
  }
  .btn-sm:hover { border-color: var(--accent); color: var(--accent-light); }
  .btn-sm.download { background: var(--accent); border-color: var(--accent); color: var(--bg); }
  .btn-sm.download:hover { background: var(--accent-hover); border-color: var(--accent-hover); }
  .status { font-size: 0.82rem; margin-top: 8px; color: var(--text-secondary); min-height: 20px; line-height: 1.3; }
  footer { margin-top: 0; padding: 20px; text-align: center; color: var(--text-secondary); font-size: 0.78rem; line-height: 1.3; }
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
  .toggle-item { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--text-secondary); cursor: pointer; line-height: 1.3; }
  .toggle-item input[type="checkbox"] { accent-color: var(--accent); width: 16px; height: 16px; }
  @media (max-width: 480px) {
    body { padding: 12px; }
    .container { margin-top: 20px; }
    .card { padding: 16px; }
    .form-row { flex-direction: column; gap: 0; }
    .toggle-params { grid-template-columns: 1fr; }
    .header { flex-direction: column; align-items: center; gap: 12px; }
    .header-actions { width: 100%; justify-content: center; }
    .brand { text-align: center; padding-inline-start: 0; }
  }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  [dir="rtl"] .custom-select-trigger { padding: 10px 12px 10px 32px; }
  [dir="rtl"] .lang-trigger { padding: 0 10px 0 28px; }
  [dir="rtl"] .custom-select-arrow { right: auto; left: 12px; }
  [dir="rtl"] input, [dir="rtl"] textarea { direction: rtl; text-align: right; }
  [dir="rtl"] #url, [dir="rtl"] #config-custom, [dir="rtl"] #result-url { direction: ltr; text-align: left; }
  [dir="rtl"] .mode-toggle.advanced .mode-indicator { transform: translateX(calc(-100% - 4px)); }
</style>
</head>
`;
