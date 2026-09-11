/* ============================================================================
   site-data.js — single source of truth for index.html and admin.html
   Load it BEFORE the main inline <script> of index.html.
   ============================================================================ */
(function (root) {
  'use strict';

  var CONFIG = {
    url:       'https://druoddpcdykwjtntffjc.supabase.co',
    anonKey:   'PASTE_THE_SAME_ANON_KEY_AS_IN_INDEX_HTML',  // index (9).html:1183
    table:     'site_content',
    rowId:     'main',
    cacheKey:  'siteData.cache.v1',
    timeoutMs: 6000
  };

  /* ---- TIER 1: baked-in defaults. Never leave this empty. --------------- */
  /* DATA-START */
  var DEFAULTS = {
    version: 1,
    updated_at: '2026-09-11',
    projects: {
      ecoro: {
        name: 'E-CORO', badge: 'EC', tagline: '', cover: '',
        description: '', progress: 65,
        wallet: 'PAC-78F9-99E2-ECORO-DEV-DONATE',
        metrics: { donated: '14,250 PAC', topDonator: '', topContributor: '', started: 'Jan 2026' },
        stats: [
          { label: 'Progress',     value: '65%' },
          { label: 'Donated',      value: '14,250 PAC' },
          { label: 'Started',      value: 'Jan 2026' },
          { label: 'Contributors', value: '12' }
        ],
        roadmap: [], needs: [], timeline: [], contributions: []
      },
      aimee: {
        name: 'AIMEE', badge: 'AI', tagline: '', cover: '',
        description: '', progress: 35,
        wallet: '',
        metrics: { donated: '8,400 PAC', topDonator: '', topContributor: '', started: 'Mar 2026' },
        stats: [
          { label: 'Progress',     value: '35%' },
          { label: 'Donated',      value: '8,400 PAC' },
          { label: 'Started',      value: 'Mar 2026' },
          { label: 'Contributors', value: '7' }
        ],
        roadmap: [], needs: [], timeline: [], contributions: []
      },
      march: {
        name: 'MARCH', badge: 'MA', tagline: '', cover: '',
        description: '', progress: 15,
        wallet: '',
        metrics: { donated: '3,150 PAC', topDonator: '', topContributor: '', started: 'Jun 2026' },
        stats: [
          { label: 'Progress',     value: '15%' },
          { label: 'Donated',      value: '3,150 PAC' },
          { label: 'Started',      value: 'Jun 2026' },
          { label: 'Contributors', value: '4' }
        ],
        roadmap: [], needs: [], timeline: [], contributions: []
      }
    }
  };
  /* DATA-END */

  /* ---- helpers ---------------------------------------------------------- */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function isPlain(v) {
    return v && typeof v === 'object' && !Array.isArray(v);
  }

  // remote values win, but anything missing falls back to the default
  function merge(base, over) {
    if (!isPlain(over)) return clone(base);
    var out = clone(base);
    Object.keys(over).forEach(function (k) {
      var a = out[k], b = over[k];
      if (b === undefined || b === null) return;
      out[k] = isPlain(a) && isPlain(b) ? merge(a, b) : clone(b);
    });
    return out;
  }

  function get(obj, path) {
    return String(path).split('.').reduce(function (o, k) {
      return (o === null || o === undefined) ? undefined : o[k];
    }, obj);
  }

  function set(obj, path, value) {
    var keys = String(path).split('.'), cur = obj;
    for (var i = 0; i < keys.length - 1; i++) {
      var k = keys[i];
      if (cur[k] === undefined || cur[k] === null) cur[k] = /^\d+$/.test(keys[i + 1]) ? [] : {};
      cur = cur[k];
    }
    cur[keys[keys.length - 1]] = value;
    return obj;
  }

  function readCache() {
    try {
      var raw = localStorage.getItem(CONFIG.cacheKey);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return (parsed && isPlain(parsed.projects)) ? parsed : null;
    } catch (e) { return null; }
  }

  function writeCache(data) {
    try { localStorage.setItem(CONFIG.cacheKey, JSON.stringify(data)); } catch (e) {}
  }

  /* ---- live state: Tier 1 merged with Tier 2 --------------------------- */
  var SITE = merge(DEFAULTS, readCache());
  var SOURCE = readCache() ? 'cache' : 'defaults';
  var listeners = [];

  // mutate in place so references held by index.html stay valid
  function applyData(next) {
    var merged = merge(DEFAULTS, next);
    Object.keys(SITE).forEach(function (k) { delete SITE[k]; });
    Object.keys(merged).forEach(function (k) { SITE[k] = merged[k]; });
    hydrate();
    listeners.forEach(function (fn) { try { fn(SITE, SOURCE); } catch (e) {} });
  }

  /* ---- TIER 3: remote fetch via plain REST (works even if the CDN fails) */
  function fetchRemote() {
    if (!CONFIG.anonKey || CONFIG.anonKey.indexOf('PASTE') === 0) {
      return Promise.reject(new Error('anon key not configured'));
    }
    var url = CONFIG.url + '/rest/v1/' + CONFIG.table +
              '?id=eq.' + encodeURIComponent(CONFIG.rowId) + '&select=data,updated_at';
    var timeout = new Promise(function (_, rej) {
      setTimeout(function () { rej(new Error('timeout')); }, CONFIG.timeoutMs);
    });
    return Promise.race([
      fetch(url, { headers: { apikey: CONFIG.anonKey, Authorization: 'Bearer ' + CONFIG.anonKey } })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (rows) {
          if (!rows || !rows.length || !isPlain(rows[0].data)) throw new Error('empty row');
          return rows[0].data;
        }),
      timeout
    ]);
  }

  function refresh() {
    return fetchRemote().then(function (data) {
      SOURCE = 'remote';
      writeCache(data);
      applyData(data);
      return data;
    }).catch(function (err) {
      // stay on defaults/cache — the page is already rendered and usable
      console.warn('[site-data] using ' + SOURCE + ':', err.message);
      return null;
    });
  }

  /* ---- tiny binding engine --------------------------------------------- */
  // scope = nearest [data-key] ancestor → SITE.projects[key]; otherwise SITE
  function scopeOf(el) {
    var host = el.closest('[data-key]');
    if (!host) return SITE;
    return get(SITE, 'projects.' + host.getAttribute('data-key')) || {};
  }

  function fmt(tpl, obj) {
    return String(tpl).replace(/\{([\w.]+)\}/g, function (_, p) {
      var v = get(obj, p);
      return (v === undefined || v === null) ? '' : v;
    });
  }

  function renderList(container) {
    var path  = container.getAttribute('data-list');
    var scope = scopeOf(container);
    var items = get(scope, path);
    if (!Array.isArray(items)) return;                 // nothing to do → keep markup
    var tpl = container.querySelector('[data-template]');
    if (!tpl) return;
    if (!tpl.__raw) tpl.__raw = tpl.cloneNode(true);
    Array.prototype.slice.call(container.children).forEach(function (c) {
      if (c !== tpl) c.remove();
    });
    tpl.style.display = 'none';
    items.forEach(function (item) {
      var node = tpl.__raw.cloneNode(true);
      node.removeAttribute('data-template');
      node.style.display = '';
      node.querySelectorAll('[data-slot]').forEach(function (slot) {
        var val = get(item, slot.getAttribute('data-slot'));
        if (val === undefined || val === null || val === '') {
          if (slot.hasAttribute('data-hide-empty')) { slot.remove(); return; }
          val = '';
        }
        slot.textContent = val;
      });
      container.appendChild(node);
    });
  }

  function hydrate(rootEl) {
    var r = rootEl || document;
    if (!r.querySelectorAll) return;
    r.querySelectorAll('[data-text]').forEach(function (el) {
      el.textContent = fmt(el.getAttribute('data-text'), scopeOf(el));
    });
    r.querySelectorAll('[data-bg]').forEach(function (el) {
      var u = fmt(el.getAttribute('data-bg'), scopeOf(el));
      if (u) el.style.backgroundImage = "url('" + u + "')";
    });
    r.querySelectorAll('[data-src]').forEach(function (el) {
      var u = fmt(el.getAttribute('data-src'), scopeOf(el));
      if (u) el.setAttribute('src', u);
    });
    r.querySelectorAll('[data-style]').forEach(function (el) {
      // data-style="height:{progress}%"  (any single declaration)
      var decl = fmt(el.getAttribute('data-style'), scopeOf(el)).split(':');
      if (decl.length === 2 && decl[1].trim()) el.style[decl[0].trim()] = decl[1].trim();
    });
    r.querySelectorAll('[data-attr]').forEach(function (el) {
      // data-attr="data-progress:{progress}"
      var pair = fmt(el.getAttribute('data-attr'), scopeOf(el)).split(':');
      if (pair.length === 2) el.setAttribute(pair[0].trim(), pair[1].trim());
    });
    r.querySelectorAll('[data-list]').forEach(renderList);
  }

  root.SiteData = {
    config: CONFIG,
    defaults: DEFAULTS,
    data: SITE,                       // live object, mutated in place
    get source() { return SOURCE; },
    hydrate: hydrate,
    refresh: refresh,
    fetchRemote: fetchRemote,
    applyData: applyData,
    clone: clone, get: get, set: set, merge: merge,
    onUpdate: function (fn) { listeners.push(fn); }
  };

  // render from defaults/cache immediately, then try the network
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { hydrate(); refresh(); });
  } else {
    hydrate(); refresh();
  }
})(window);
