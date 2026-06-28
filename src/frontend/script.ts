export const SCRIPT = `<script>
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

  function setThemeCookie(effective) {
    try {
      var maxAge = 31536000; // 1 年
      document.cookie = 'prism-theme=' + effective + '; path=/; SameSite=Lax; max-age=' + maxAge;
    } catch(e) {}
  }

  function applyTheme() {
    var effective = getEffectiveTheme();
    if (effective === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    setThemeCookie(effective);
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


// ========== 多语言支持 ==========
var I18N = {
  'zh-Hans': {
    title: 'Prism - 代理订阅转换',
    tagline: '代理订阅转换工具 · 多格式支持',
    modeBasic: '基础模式', modeAdvanced: '进阶模式',
    labelUrl: '原始订阅链接', labelConfig: '规则配置', labelCustomConfig: '自定义规则配置链接',
    optDefault: '默认（不更改规则配置）', optPreset: 'Prism 预设规则', optCustom: '自定义',
    labelTarget: '输出格式', optClash: 'Clash / Mihomo (YAML)', optSingbox: 'sing-box (JSON)', optSurge: 'Surge (INI)',
    labelFilename: '输出文件名（可选）', placeholderFilename: '留空则默认为 Prism',
    advancedParams: '进阶参数',
    toggleEmoji: '保留 Emoji', toggleTFO: 'TCP Fast Open', toggleUDP: 'UDP 强制开启',
    toggleSCV: '跳过证书验证', toggleSort: '节点排序', toggleExpand: '展开规则全文',
    toggleAppendType: '节点名加类型标记', toggleTLS13: 'TLS 1.3',
    labelInclude: '包含节点（正则）', placeholderInclude: '如 HK|JP|TW',
    labelExclude: '排除节点（正则）', placeholderExclude: '如 剩余|官网|到期',
    btnGenerate: '生成订阅链接', labelResult: '生成的订阅链接：',
    btnCopy: '复制链接', btnDownload: '下载配置',
    msgEnterUrl: '请输入订阅链接', msgGenerated: '订阅链接已生成',
    labelRename: '节点重命名（可选）', placeholderRename: '如 香港@HK|日本@JP', btnAddUrl: '添加订阅链接',
    msgCopied: '已复制到剪贴板', msgDownloadStarted: '下载已开始', msgDownloadFailed: '下载失败',
  },
  'en': {
    title: 'Prism - Proxy Subscription Converter', tagline: 'Cross-format proxy subscription converter',
    modeBasic: 'Basic', modeAdvanced: 'Advanced',
    labelUrl: 'Subscription URL', labelConfig: 'Rule Configuration', labelCustomConfig: 'Custom Rule Config URL',
    optDefault: 'Default (keep original rules)', optPreset: 'Prism Preset Rules', optCustom: 'Custom',
    labelTarget: 'Output Format', optClash: 'Clash / Mihomo (YAML)', optSingbox: 'sing-box (JSON)', optSurge: 'Surge (INI)',
    labelFilename: 'Output Filename (optional)', placeholderFilename: 'Empty for default: Prism',
    advancedParams: 'Advanced Parameters',
    toggleEmoji: 'Keep Emoji', toggleTFO: 'TCP Fast Open', toggleUDP: 'Force UDP',
    toggleSCV: 'Skip Certificate Verification', toggleSort: 'Sort Nodes', toggleExpand: 'Expand Rules',
    toggleAppendType: 'Append Type Tag to Node Name', toggleTLS13: 'TLS 1.3',
    labelInclude: 'Include Nodes (regex)', placeholderInclude: 'e.g. HK|JP|TW',
    labelExclude: 'Exclude Nodes (regex)', placeholderExclude: 'e.g. remaining|official|expired',
    btnGenerate: 'Generate Subscription', labelResult: 'Subscription URL:',
    btnCopy: 'Copy URL', btnDownload: 'Download Config',
    msgEnterUrl: 'Please enter a subscription URL', msgGenerated: 'Subscription URL generated',
    labelRename: 'Rename Nodes (optional)', placeholderRename: 'e.g. HK@HongKong|JP@Japan', btnAddUrl: 'Add Subscription',
    msgCopied: 'Copied to clipboard', msgDownloadStarted: 'Download started', msgDownloadFailed: 'Download failed',
  },
  'ar': {
    title: 'Prism - محول اشتراكات البروكسي',
    tagline: 'محول اشتراكات البروكسي متعدد الصيغ',
    modeBasic: 'أساسي', modeAdvanced: 'متقدم',
    labelUrl: 'رابط الاشتراك', labelConfig: 'إعداد القواعد', labelCustomConfig: 'رابط إعداد القواعد المخصص',
    optDefault: 'الافتراضي', optPreset: 'قواعد Prism المحددة مسبقًا', optCustom: 'مخصص',
    labelTarget: 'تنسيق الإخراج', optClash: 'Clash / Mihomo (YAML)', optSingbox: 'sing-box (JSON)', optSurge: 'Surge (INI)',
    labelFilename: 'اسم ملف الإخراج (اختياري)', placeholderFilename: 'اتركه فارغًا للافتراضي: Prism',
    advancedParams: 'المعلمات المتقدمة',
    toggleEmoji: 'الاحتفاظ بالرموز التعبيرية', toggleTFO: 'TCP Fast Open', toggleUDP: 'إجبار استخدام UDP',
    toggleSCV: 'تخطي التحقق من الشهادة', toggleSort: 'ترتيب الخوادم', toggleExpand: 'توسيع محتوى القواعد',
    toggleAppendType: 'إضافة وسم النوع', toggleTLS13: 'TLS 1.3',
    labelInclude: 'تضمين الخوادم (تعبير نمطي)', placeholderInclude: 'مثال HK|JP|TW',
    labelExclude: 'استبعاد الخوادم (تعبير نمطي)', placeholderExclude: 'مثال remaining|official|expired',
    btnGenerate: 'إنشاء رابط الاشتراك', labelResult: 'رابط الاشتراك:',
    btnCopy: 'نسخ الرابط', btnDownload: 'تنزيل التكوين',
    msgEnterUrl: 'يرجى إدخال رابط الاشتراك', msgGenerated: 'تم إنشاء رابط الاشتراك',
    labelRename: 'إعادة تسمية العقد (اختياري)', placeholderRename: 'مثال: HK@HongKong|JP@Japan', btnAddUrl: 'إضافة اشتراك',
    msgCopied: 'تم النسخ إلى الحافظة', msgDownloadStarted: 'بدأ التنزيل', msgDownloadFailed: 'فشل التنزيل',
  },
  'zh-Hant': {
    title: 'Prism - 代理訂閱轉換', tagline: '代理訂閱轉換工具 · 多格式支援',
    modeBasic: '基礎模式', modeAdvanced: '進階模式',
    labelUrl: '原始訂閱連結', labelConfig: '規則設定', labelCustomConfig: '自訂規則設定連結',
    optDefault: '預設（不更改規則設定）', optPreset: 'Prism 預設規則', optCustom: '自訂',
    labelTarget: '輸出格式', optClash: 'Clash / Mihomo (YAML)', optSingbox: 'sing-box (JSON)', optSurge: 'Surge (INI)',
    labelFilename: '輸出檔案名稱（可選）', placeholderFilename: '留空則預設為 Prism',
    advancedParams: '進階參數',
    toggleEmoji: '保留 Emoji', toggleTFO: 'TCP Fast Open', toggleUDP: 'UDP 強制開啟',
    toggleSCV: '跳過證書驗證', toggleSort: '節點排序', toggleExpand: '展開規則全文',
    toggleAppendType: '節點名稱加類型標記', toggleTLS13: 'TLS 1.3',
    labelInclude: '包含節點（正規）', placeholderInclude: '如 HK|JP|TW',
    labelExclude: '排除節點（正規）', placeholderExclude: '如 剩餘|官網|到期',
    btnGenerate: '生成訂閱連結', labelResult: '生成的訂閱連結：',
    btnCopy: '複製連結', btnDownload: '下載設定檔',
    msgEnterUrl: '請輸入訂閱連結', msgGenerated: '訂閱連結已生成',
    labelRename: '節點重命名（可選）', placeholderRename: '如 HK@HongKong|JP@Japan', btnAddUrl: '新增訂閱連結',
    msgCopied: '已複製到剪貼簿', msgDownloadStarted: '下載已開始', msgDownloadFailed: '下載失敗',
  },
  'ja': {
    title: 'Prism - プロキシサブスクリプション変換', tagline: 'マルチフォーマット対応 プロキシ変換ツール',
    modeBasic: '基本', modeAdvanced: '詳細',
    labelUrl: 'サブスクリプション URL', labelConfig: 'ルール設定', labelCustomConfig: 'カスタムルール設定 URL',
    optDefault: 'デフォルト（ルール設定を変更しない）', optPreset: 'Prism プリセットルール', optCustom: 'カスタム',
    labelTarget: '出力形式', optClash: 'Clash / Mihomo (YAML)', optSingbox: 'sing-box (JSON)', optSurge: 'Surge (INI)',
    labelFilename: '出力ファイル名（任意）', placeholderFilename: '未入力時は Prism',
    advancedParams: '詳細パラメータ',
    toggleEmoji: '絵文字を保持', toggleTFO: 'TCP Fast Open', toggleUDP: 'UDP を強制',
    toggleSCV: '証明書検証をスキップ', toggleSort: 'ノードを並べ替え', toggleExpand: 'ルールを展開',
    toggleAppendType: 'ノード名にタイプタグを追加', toggleTLS13: 'TLS 1.3',
    labelInclude: '含めるノード（正規表現）', placeholderInclude: '例: HK|JP|TW',
    labelExclude: '除外するノード（正規表現）', placeholderExclude: '例: 残量|公式サイト|期限切れ',
    btnGenerate: 'サブスクリプション URL を生成', labelResult: '生成された URL:',
    btnCopy: 'URL をコピー', btnDownload: '設定をダウンロード',
    msgEnterUrl: 'サブスクリプション URL を入力してください', msgGenerated: 'URL が生成されました',
    labelRename: 'ノード名変更（任意）', placeholderRename: '例: HK@HongKong|JP@Japan', btnAddUrl: 'サブスクリプションを追加',
    msgCopied: 'クリップボードにコピーしました', msgDownloadStarted: 'ダウンロードを開始しました', msgDownloadFailed: 'ダウンロードに失敗しました',
  },
  'ko': {
    title: 'Prism - 프록시 구독 변환', tagline: '멀티 포맷 프록시 구독 변환 도구',
    modeBasic: '기본', modeAdvanced: '고급',
    labelUrl: '구독 URL', labelConfig: '규칙 설정', labelCustomConfig: '사용자 지정 규칙 설정 URL',
    optDefault: '기본값 (규칙 설정을 변경하지 않음)', optPreset: 'Prism 사전 설정 규칙', optCustom: '사용자 지정',
    labelTarget: '출력 형식', optClash: 'Clash / Mihomo (YAML)', optSingbox: 'sing-box (JSON)', optSurge: 'Surge (INI)',
    labelFilename: '출력 파일명 (선택사항)', placeholderFilename: '비워두면 기본값: Prism',
    advancedParams: '고급 매개변수',
    toggleEmoji: '이모지 유지', toggleTFO: 'TCP Fast Open', toggleUDP: 'UDP 강제',
    toggleSCV: '인증서 검증 건너뛰기', toggleSort: '노드 정렬', toggleExpand: '규칙 확장',
    toggleAppendType: '노드명에 유형 태그 추가', toggleTLS13: 'TLS 1.3',
    labelInclude: '포함할 노드 (정규식)', placeholderInclude: '예: HK|JP|TW',
    labelExclude: '제외할 노드 (정규식)', placeholderExclude: '예: remaining|official|expired',
    btnGenerate: '구독 링크 생성', labelResult: '생성된 구독 URL:',
    btnCopy: 'URL 복사', btnDownload: '설정 다운로드',
    msgEnterUrl: '구독 URL을 입력하세요', msgGenerated: '구독 URL이 생성되었습니다',
    labelRename: '노드 이름 변경 (선택사항)', placeholderRename: '예: HK@HongKong|JP@Japan', btnAddUrl: '구독 추가',
    msgCopied: '클립보드에 복사되었습니다', msgDownloadStarted: '다운로드가 시작되었습니다', msgDownloadFailed: '다운로드 실패',
  },
  'ru': {
    title: 'Prism - Конвертер прокси-подписок', tagline: 'Конвертер прокси-подписок с поддержкой разных форматов',
    modeBasic: 'Базовый', modeAdvanced: 'Продвинутый',
    labelUrl: 'URL подписки', labelConfig: 'Конфигурация правил', labelCustomConfig: 'Пользовательский URL правил',
    optDefault: 'По умолчанию (не менять правила)', optPreset: 'Предустановленные правила Prism', optCustom: 'Пользовательский',
    labelTarget: 'Формат вывода', optClash: 'Clash / Mihomo (YAML)', optSingbox: 'sing-box (JSON)', optSurge: 'Surge (INI)',
    labelFilename: 'Имя выходного файла (необязательно)', placeholderFilename: 'По умолчанию: Prism',
    advancedParams: 'Дополнительные параметры',
    toggleEmoji: 'Сохранить эмодзи', toggleTFO: 'TCP Fast Open', toggleUDP: 'Принудительный UDP',
    toggleSCV: 'Пропустить проверку сертификата', toggleSort: 'Сортировать узлы', toggleExpand: 'Развернуть правила',
    toggleAppendType: 'Добавить метку типа к имени узла', toggleTLS13: 'TLS 1.3',
    labelInclude: 'Включить узлы (регулярное выражение)', placeholderInclude: 'напр. HK|JP|TW',
    labelExclude: 'Исключить узлы (регулярное выражение)', placeholderExclude: 'напр. remaining|official|expired',
    btnGenerate: 'Сгенерировать ссылку', labelResult: 'Сгенерированный URL подписки:',
    btnCopy: 'Копировать URL', btnDownload: 'Скачать конфигурацию',
    msgEnterUrl: 'Введите URL подписки', msgGenerated: 'Ссылка подписки создана',
    labelRename: 'Переименовать узлы (необязательно)', placeholderRename: 'напр. HK@HongKong|JP@Japan', btnAddUrl: 'Добавить подписку',
    msgCopied: 'Скопировано в буфер обмена', msgDownloadStarted: 'Загрузка началась', msgDownloadFailed: 'Ошибка загрузки',
  },
  'vi': {
    title: 'Prism - Chuyển đổi đăng ký proxy', tagline: 'Công cụ chuyển đổi đăng ký proxy đa định dạng',
    modeBasic: 'Cơ bản', modeAdvanced: 'Nâng cao',
    labelUrl: 'URL đăng ký', labelConfig: 'Cấu hình quy tắc', labelCustomConfig: 'URL cấu hình quy tắc tùy chỉnh',
    optDefault: 'Mặc định (không thay đổi quy tắc)', optPreset: 'Quy tắc cài sẵn Prism', optCustom: 'Tùy chỉnh',
    labelTarget: 'Định dạng đầu ra', optClash: 'Clash / Mihomo (YAML)', optSingbox: 'sing-box (JSON)', optSurge: 'Surge (INI)',
    labelFilename: 'Tên tệp đầu ra (tùy chọn)', placeholderFilename: 'Mặc định nếu để trống: Prism',
    advancedParams: 'Tham số nâng cao',
    toggleEmoji: 'Giữ Emoji', toggleTFO: 'TCP Fast Open', toggleUDP: 'Buộc UDP',
    toggleSCV: 'Bỏ qua xác minh chứng chỉ', toggleSort: 'Sắp xếp nút', toggleExpand: 'Mở rộng nội dung quy tắc',
    toggleAppendType: 'Thêm thẻ loại vào tên nút', toggleTLS13: 'TLS 1.3',
    labelInclude: 'Bao gồm nút (regex)', placeholderInclude: 'vd: HK|JP|TW',
    labelExclude: 'Loại trừ nút (regex)', placeholderExclude: 'vd: remaining|official|expired',
    btnGenerate: 'Tạo liên kết đăng ký', labelResult: 'URL đăng ký đã tạo:',
    btnCopy: 'Sao chép URL', btnDownload: 'Tải về cấu hình',
    msgEnterUrl: 'Vui lòng nhập URL đăng ký', msgGenerated: 'Đã tạo URL đăng ký',
    labelRename: 'Đổi tên nút (tùy chọn)', placeholderRename: 'vd: HK@HongKong|JP@Japan', btnAddUrl: 'Thêm đăng ký',
    msgCopied: 'Đã sao chép vào clipboard', msgDownloadStarted: 'Bắt đầu tải xuống', msgDownloadFailed: 'Tải xuống thất bại',
  },
  'fa': {
    title: 'Prism - مبدل اشتراک پروکسی', tagline: 'ابزار تبدیل اشتراک پروکسی چند فرمتی',
    modeBasic: 'پایه', modeAdvanced: 'پیشرفته',
    labelUrl: 'URL اشتراک', labelConfig: 'تنظیمات قوانین', labelCustomConfig: 'URL تنظیمات قوانین سفارشی',
    optDefault: 'پیش‌فرض (بدون تغییر قوانین)', optPreset: 'قوانین پیش‌فرض Prism', optCustom: 'سفارشی',
    labelTarget: 'فرمت خروجی', optClash: 'Clash / Mihomo (YAML)', optSingbox: 'sing-box (JSON)', optSurge: 'Surge (INI)',
    labelFilename: 'نام فایل خروجی (اختیاری)', placeholderFilename: 'پیش‌فرض: Prism',
    advancedParams: 'پارامترهای پیشرفته',
    toggleEmoji: 'حفظ ایموجی', toggleTFO: 'TCP Fast Open', toggleUDP: 'اجبار UDP',
    toggleSCV: 'رد شدن از تأیید گواهی', toggleSort: 'مرتب‌سازی سرورها', toggleExpand: 'گسترش محتوای قوانین',
    toggleAppendType: 'افزودن برچسب نوع به نام سرور', toggleTLS13: 'TLS 1.3',
    labelInclude: 'شامل سرورها (عبارت منظم)', placeholderInclude: 'مثال: HK|JP|TW',
    labelExclude: 'حذف سرورها (عبارت منظم)', placeholderExclude: 'مثال: remaining|official|expired',
    btnGenerate: 'ایجاد لینک اشتراک', labelResult: 'لینک اشتراک ایجاد شده:',
    btnCopy: 'کپی URL', btnDownload: 'دانلود پیکربندی',
    msgEnterUrl: 'لطفاً URL اشتراک را وارد کنید', msgGenerated: 'لینک اشتراک ایجاد شد',
    labelRename: 'تغییر نام سرور (اختیاری)', placeholderRename: 'مثال: HK@HongKong|JP@Japan', btnAddUrl: 'افزودن اشتراک',
    msgCopied: 'در کلیپ‌بورد کپی شد', msgDownloadStarted: 'دانلود آغاز شد', msgDownloadFailed: 'دانلود ناموفق بود',
  },

};

var LANG_KEY = 'prism-lang';
var currentLang;

function detectLanguage() {
  var stored;
  try { stored = localStorage.getItem(LANG_KEY); } catch(e) {}
  if (stored && I18N[stored]) return stored;
  var nav = navigator.language || '';
  if (nav.startsWith('zh')) return (nav.includes('Hant')||nav.includes('TW')||nav.includes('HK'))?'zh-Hant':'zh-Hans';
  if (nav.startsWith('ja')) return 'ja';
  if (nav.startsWith('ko')) return 'ko';
  if (nav.startsWith('ru')) return 'ru';
  if (nav.startsWith('vi')) return 'vi';
  if (nav.startsWith('ar')) return 'ar';
  if (nav.startsWith('fa')) return 'fa';
  if (nav.startsWith('en')) return 'en';
  return 'zh-Hans';
}

function t(key) {
  return (I18N[currentLang] && I18N[currentLang][key]) || (I18N['zh-Hans'][key]) || key;
}

function applyLanguage(lang) {
  currentLang = lang;
  try { localStorage.setItem(LANG_KEY, lang); } catch(e) {}

  document.documentElement.lang = lang;
  document.documentElement.dir = (lang === 'ar' || lang === 'fa') ? 'rtl' : 'ltr';
  document.title = I18N[lang].title;

  // data-i18n: replace last text node
  [].forEach.call(document.querySelectorAll('[data-i18n]'), function(el) {
    var k = el.getAttribute('data-i18n');
    if (!I18N[lang] || !I18N[lang][k]) return;
    var cn = el.childNodes;
    for (var i = cn.length - 1; i >= 0; i--) {
      if (cn[i].nodeType === 3) { cn[i].textContent = ' ' + I18N[lang][k]; break; }
    }
  });

  // data-i18n-placeholder
  [].forEach.call(document.querySelectorAll('[data-i18n-placeholder]'), function(el) {
    var k = el.getAttribute('data-i18n-placeholder');
    if (I18N[lang] && I18N[lang][k]) el.placeholder = I18N[lang][k];
  });

  // Update native selects
  var optSets = {config: ['optDefault','optPreset','optCustom'], target: ['optClash','optSingbox','optSurge']};
  for (var sid in optSets) {
    var s = document.getElementById(sid === 'config' ? 'config-select' : 'target');
    var keys = optSets[sid];
    if (s) for (var j = 0; j < keys.length; j++) {
      if (s.options[j]) s.options[j].textContent = I18N[lang][keys[j]];
    }
  }

  // Sync custom dropdown triggers
  [].forEach.call(document.querySelectorAll('.custom-select'), function(w) {
    var sel = w.querySelector('select');
    if (!sel) return;
    var tt = w.querySelector('.custom-select-trigger-text');
    var val = sel.value;
    [].forEach.call(w.querySelectorAll('.custom-select-option'), function(o) {
      if (o.getAttribute('data-value') === val && tt) tt.textContent = o.textContent;
    });
    if (w.id === 'lang-select-wrapper' && tt) {
      tt.textContent = {'zh-Hans':'简体中文','zh-Hant':'繁體中文','en':'English','ja':'日本語','ko':'한국어','ru':'Русский','vi':'Tiếng Việt','ar':'العربية','fa':'فارسی'}[lang] || '简体中文';
    }
  });

  // Refresh status message
  var st = document.getElementById('status');
  var sk = st && st.getAttribute('data-i18n-status');
  if (sk) st.textContent = t(sk);
}

currentLang = detectLanguage();
applyLanguage(currentLang);

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
  var urlEls = document.querySelectorAll('.url-input');
  var urls = [];
  urlEls.forEach(function(el) {
    var v = el.value.trim();
    if (v) urls.push(v);
  });
  if (urls.length === 0) {
    showResult('msgEnterUrl');
    return;
  }

  var params = new URLSearchParams();
  params.set('target', document.getElementById('target').value);
  params.set('url', urls.join('|'));

  var configVal = document.getElementById('config-select').value.trim();
  if (configVal === '__custom__') {
    configVal = document.getElementById('config-custom').value.trim();
  }
  if (configVal) params.set('config', configVal);

  var filename = document.getElementById('filename').value.trim();
  if (!filename) filename = 'Prism';
  filename = filename.replace(/\\.(yaml|json|conf)$/i, '');
  params.set('filename', filename);

  var defaults = { emoji: true, tfo: false, udp: false, scv: false, sort: false, expand: true, append_type: false, tls13: false };
  var isAdvanced = document.getElementById('advanced').classList.contains('show');
  ['emoji','tfo','udp','scv','sort','expand','append_type','tls13'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      var val = el.checked;
      if (isAdvanced || val !== defaults[id]) params.set(id, val ? 'true' : 'false');
    }
  });

  var include = document.getElementById('include').value.trim();
  if (include) params.set('include', include);
  var exclude = document.getElementById('exclude').value.trim();
  if (exclude) params.set('exclude', exclude);
  var rename = document.getElementById('rename').value.trim();
  if (rename) params.set('rename', rename);

  var apiUrl = window.location.origin + '/sub?' + params.toString();

  document.getElementById('result-url').value = apiUrl;
  document.getElementById('result-section').style.display = 'block';
  setStatus('msgGenerated');
}

function addUrlRow() {
  var container = document.getElementById('url-rows');
  var row = document.createElement('div');
  row.className = 'url-row';
  row.innerHTML = '<input type="url" class="url-input" required><button class="url-row-del" onclick="removeUrlRow(this)" title="删除">×</button>';
  container.appendChild(row);
  updateUrlDelButtons();
}

function removeUrlRow(btn) {
  var row = btn.parentElement;
  row.remove();
  updateUrlDelButtons();
}

function updateUrlDelButtons() {
  var rows = document.querySelectorAll('.url-row');
  // 仅剩一行时隐藏删除按钮
  rows.forEach(function(row, i) {
    var btn = row.querySelector('.url-row-del');
    if (btn) btn.style.display = rows.length <= 1 ? 'none' : '';
  });
}

function setStatus(key) {
  var el = document.getElementById('status');
  el.textContent = t(key);
  el.setAttribute('data-i18n-status', key);
}
function showResult(key) {
  setStatus(key);
  document.getElementById('result-section').style.display = 'block';
}

function copyUrl() {
  var el = document.getElementById('result-url');
  el.select();
  if (navigator.clipboard) {
    navigator.clipboard.writeText(el.value).then(function() {
      setStatus('msgCopied');
    });
  } else {
    document.execCommand('copy');
    setStatus('msgCopied');
  }
}

async function downloadConfig() {
  var apiUrl = document.getElementById('result-url').value;
  var target = document.getElementById('target').value;
  var extMap = { clash: '.yaml', singbox: '.json', surge: '.conf' };
  var ext = extMap[target] || '.yaml';
  var name = document.getElementById('filename').value.trim();
  if (!name) name = 'Prism';
  name = name.replace(/\\\\.(yaml|json|conf)$/i, '') + ext;
  try {
    var resp = await fetch(apiUrl);
    var blob = await resp.blob();
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
    setStatus('msgDownloadStarted');
  } catch(e) {
    setStatus('msgDownloadFailed');
  }
}
</script>`;
