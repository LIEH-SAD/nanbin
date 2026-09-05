/* ============================================================
   Nanbin Studio - i18n engine
   Translations live in /language/<lang>.json as flat "id": "text" maps.
   Usage:
     data-i18n="id"            -> textContent
     data-i18n-html="id"       -> innerHTML (allows markup)
     data-i18n-content="id"    -> attributes like meta content
     data-i18n-attr="attr:id"  -> any element attribute (supports {i} placeholder via t())
   Dynamic content: call window.t(id, params) before/after re-render.
   ============================================================ */

'use strict';

/* ---- Available languages (file name = BCP-47 code) ---- */
var I18N_LANGS = [
  { code: 'zh-CN', name: '简体中文', htmlLang: 'zh-CN', match: ['zh-cn', 'zh-sg', 'zh-hans', 'zh'] },
  { code: 'zh-TW', name: '繁體中文', htmlLang: 'zh-TW', match: ['zh-tw', 'zh-hk', 'zh-mo', 'zh-hant'] },
  { code: 'en',    name: 'English',  htmlLang: 'en',    match: ['en'] },
  { code: 'ja',    name: '日本語',    htmlLang: 'ja',    match: ['ja'] },
  { code: 'ko',    name: '한국어',    htmlLang: 'ko',    match: ['ko'] },
  { code: 'es',    name: 'Español',  htmlLang: 'es',    match: ['es'] },
  { code: 'fr',    name: 'Français', htmlLang: 'fr',    match: ['fr'] },
  { code: 'de',    name: 'Deutsch',  htmlLang: 'de',    match: ['de'] },
  { code: 'ru',    name: 'Русский',  htmlLang: 'ru',    match: ['ru'] }
];

/* ---- State ---- */
var i18nLang = null;
var i18nDict = {};
var i18nReady = false; // true once any language file has loaded successfully

/* Translate: t('hero.slide.aria', { i: 2 }) */
window.t = function (id, params) {
  var text = i18nDict[id] !== undefined ? i18nDict[id] : id;
  if (params) {
    Object.keys(params).forEach(function (k) {
      text = text.replace(new RegExp('\\{' + k + '\\}', 'g'), params[k]);
    });
  }
  return text;
};

/* Apply translations to all statically marked elements */
function i18nApply() {
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    el.textContent = window.t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
    el.innerHTML = window.t(el.getAttribute('data-i18n-html'));
  });
  document.querySelectorAll('[data-i18n-content]').forEach(function (el) {
    el.setAttribute('content', window.t(el.getAttribute('data-i18n-content')));
  });
  document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
    var pair = el.getAttribute('data-i18n-attr').split(':');
    if (pair.length === 2) el.setAttribute(pair[0], window.t(pair[1]));
  });
  var meta = I18N_LANGS.find(function (l) { return l.code === i18nLang; });
  document.documentElement.lang = meta ? meta.htmlLang : i18nLang;
  document.title = window.t('site.title');
}

/* Detect language from the browser environment.
   Priority: saved choice -> navigator.languages prefixes -> default (zh-CN) */
function i18nDetect() {
  var saved = localStorage.getItem('lang');
  if (saved && I18N_LANGS.some(function (l) { return l.code === saved; })) return saved;

  var candidates = (navigator.languages && navigator.languages.length)
    ? Array.prototype.slice.call(navigator.languages)
    : [navigator.language || 'zh'];
  for (var c = 0; c < candidates.length; c++) {
    var tag = String(candidates[c]).toLowerCase();
    for (var i = 0; i < I18N_LANGS.length; i++) {
      var lang = I18N_LANGS[i];
      for (var m = 0; m < lang.match.length; m++) {
        if (tag === lang.match[m] || tag.indexOf(lang.match[m] + '-') === 0) return lang.code;
      }
    }
  }
  return 'zh-CN';
}

/* Load a language file, apply and notify listeners.
   Failure handling:
   - First load fails (e.g. dev server not running): still fire the event so the
     page renders with fallback ids instead of staying blank.
   - Switch fails after a successful load: keep the current language and dict,
     fire "i18n:error" only - no state change, no re-render. */
function i18nLoad(lang, eventName) {
  fetch('language/' + lang + '.json')
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (dict) {
      i18nLang = lang;
      i18nDict = dict;
      i18nReady = true;
      localStorage.setItem('lang', lang);
      i18nApply();
      i18nRenderSwitcher();
      document.dispatchEvent(new CustomEvent(eventName, { detail: { lang: lang } }));
    })
    .catch(function (err) {
      console.warn('[i18n] Could not load language/' + lang + '.json (' + err.message + '). ' +
        'Translation files must be served over HTTP (e.g. the dev preview server).');
      if (!i18nReady) {
        i18nLang = lang;
        document.dispatchEvent(new CustomEvent(eventName, { detail: { lang: lang } }));
      } else {
        document.dispatchEvent(new CustomEvent('i18n:error', { detail: { lang: lang } }));
      }
    });
}

/* ---- Language switcher: glass dropdown ---- */
function i18nRenderSwitcher() {
  var btn = document.getElementById('langButton');
  var menu = document.getElementById('langMenu');
  if (!btn || !menu) return;
  var current = I18N_LANGS.find(function (l) { return l.code === i18nLang; });
  btn.textContent = current ? current.name : 'Language';
  menu.innerHTML = I18N_LANGS.map(function (l) {
    return '<button type="button" role="menuitem" data-lang="' + l.code + '"' +
      (l.code === i18nLang ? ' class="active"' : '') + '>' + l.name + '</button>';
  }).join('');
}

function i18nInitSwitcher() {
  var wrap = document.getElementById('langSelect');
  var btn = document.getElementById('langButton');
  var menu = document.getElementById('langMenu');
  if (!wrap || !btn || !menu) return;

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
  menu.addEventListener('click', function (e) {
    var item = e.target.closest('[data-lang]');
    if (!item) return;
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    if (item.getAttribute('data-lang') !== i18nLang) i18nLoad(item.getAttribute('data-lang'), 'i18n:change');
  });
  // Close when clicking outside
  document.addEventListener('click', function (e) {
    if (!wrap.contains(e.target)) {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* Bootstrap: first load fires "i18n:ready", switches fire "i18n:change" */
document.addEventListener('DOMContentLoaded', function () {
  i18nInitSwitcher();
  i18nRenderSwitcher();
});
i18nLoad(i18nDetect(), 'i18n:ready');
