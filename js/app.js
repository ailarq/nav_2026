(function () {
  'use strict';

  const app = document.getElementById('app');
  const musicBtn = document.getElementById('musicBtn');
  let cfg = {};
  let data = {};
  let lang = 'en';
  let idx = 0; // current slide in an element

  // ---------- helpers ----------
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const t = o => (o && (o[lang] || o.en)) || '';
  const ui = k => t(data.ui[k]);
  const $ = (s, r) => (r || document).querySelector(s);

  // ---------- music ----------
  const audio = new Audio();
  audio.loop = true;
  let muted = store.get('golu_muted') === '1';

  function paintMusicBtn() {
    musicBtn.textContent = muted ? '🔇' : '🔊';
    const label = muted ? ui('unmute') : ui('mute');
    musicBtn.title = label;
    musicBtn.setAttribute('aria-label', label);
  }
  function tryPlay() {
    if (muted || !audio.src) return;
    audio.play().catch(() => {
      // Browsers block autoplay until the visitor interacts; retry on first touch.
      const retry = () => { tryPlay(); };
      document.addEventListener('pointerdown', retry, { once: true });
    });
  }
  musicBtn.addEventListener('click', () => {
    muted = !muted;
    store.set('golu_muted', muted ? '1' : '0');
    if (muted) audio.pause(); else tryPlay();
    paintMusicBtn();
  });
  audio.addEventListener('error', () => { musicBtn.classList.add('hidden'); });

  // ---------- language ----------
  function setLang(code) {
    lang = code;
    store.set('golu_lang', code);
    document.documentElement.lang = code;
    paintMusicBtn();
    render();
  }
  function langSelect() {
    return `<select class="lang-select" aria-label="${esc(ui('chooseLang'))}">` +
      data.languages.map(l =>
        `<option value="${l.code}"${l.code === lang ? ' selected' : ''}>${esc(l.label)}</option>`).join('') +
      '</select>';
  }
  function bindLangSelect() {
    const s = $('.lang-select');
    if (s) s.addEventListener('change', () => setLang(s.value));
  }

  // ---------- routing ----------
  function route() {
    const h = location.hash.replace(/^#\/?/, '');
    const parts = h.split('/');
    return { page: parts[0] || 'home', id: parts[1] || '' };
  }
  function render() {
    const r = route();
    window.scrollTo(0, 0);
    if (r.page === 'navaratri') return renderAbout();
    if (r.page === 'theme') return renderTheme();
    if (r.page === 'golu') return renderGolu(r.id);
    return renderLanding();
  }
  window.addEventListener('hashchange', () => { idx = 0; render(); });

  // ---------- colours ----------
  // One palette per visit/refresh (never the same one twice in a row), used on every page.
  // title = headings on the background, text = body text on the background, accent = small highlights.
  const PALETTES = [
    // dark
    { bg1: '#0b0b0b', bg2: '#1c1409', glow: 'rgba(232,163,23,.28)', title: '#f5c453', text: '#f4dca0', accent: '#f5c453' }, // black
    { bg1: '#4a0d16', bg2: '#7a1a28', glow: 'rgba(255,200,80,.30)', title: '#ffd36b', text: '#ffe9bd', accent: '#ffd36b' }, // maroon
    { bg1: '#0f2d1a', bg2: '#235a37', glow: 'rgba(255,214,102,.26)', title: '#ffd36b', text: '#e6f3d0', accent: '#ffd36b' }, // green
    { bg1: '#1a1445', bg2: '#33288a', glow: 'rgba(255,200,80,.26)', title: '#ffd36b', text: '#e8e4ff', accent: '#ffd36b' }, // indigo
    { bg1: '#06343a', bg2: '#0f6470', glow: 'rgba(255,214,102,.26)', title: '#ffd36b', text: '#d8f3f3', accent: '#ffd36b' }, // teal
    { bg1: '#3b0a3f', bg2: '#6a2072', glow: 'rgba(255,200,80,.28)', title: '#ffd36b', text: '#f6dcf8', accent: '#ffd36b' }, // plum
    { bg1: '#5a2208', bg2: '#964a14', glow: 'rgba(255,220,120,.30)', title: '#ffe08a', text: '#ffeccc', accent: '#ffe08a' }, // burnt orange
    // light (the earlier cream, turmeric and light-green looks)
    { bg1: '#fff6e0', bg2: '#fbe7b5', glow: 'rgba(255,255,255,.7)', title: '#6b1420', text: '#3a1a12', accent: '#2f5d3a' }, // cream
    { bg1: '#fde9b0', bg2: '#eebc4a', glow: 'rgba(255,255,255,.55)', title: '#6b1420', text: '#3a1a12', accent: '#2f5d3a' }, // turmeric
    { bg1: '#e6f3dc', bg2: '#bfdcae', glow: 'rgba(255,236,170,.75)', title: '#6b1420', text: '#2a1c12', accent: '#2f5d3a' }  // light green
  ];
  function pickPalette() {
    let last = Number(store.get('golu_palette'));
    let n;
    do { n = Math.floor(Math.random() * PALETTES.length); } while (n === last && PALETTES.length > 1);
    const want = Number(new URLSearchParams(location.search).get('palette')); // preview: ?palette=0..9
    if (Number.isInteger(want) && want >= 0 && want < PALETTES.length && new URLSearchParams(location.search).has('palette')) n = want;
    store.set('golu_palette', String(n));
    const p = PALETTES[n];
    const root = document.documentElement.style;
    root.setProperty('--p-bg1', p.bg1); root.setProperty('--p-bg2', p.bg2);
    root.setProperty('--p-glow', p.glow); root.setProperty('--p-title', p.title);
    root.setProperty('--p-text', p.text); root.setProperty('--p-accent', p.accent);
  }
  function renderLanding() {
    const mandala = `<svg class="mandala" viewBox="0 0 200 200" fill="none" stroke="#e8a317" stroke-width="1.2">
      ${[0, 30, 60, 90, 120, 150].map(a => `<ellipse cx="100" cy="100" rx="90" ry="30" transform="rotate(${a} 100 100)"/>`).join('')}
      <circle cx="100" cy="100" r="95"/><circle cx="100" cy="100" r="60"/><circle cx="100" cy="100" r="20"/></svg>`;
    app.innerHTML = `
      <div class="landing">
        <div class="kolam"></div>
        ${mandala}
        <div class="landing-body fade">
          <div class="diya">🪔</div>
          <h1>${esc(ui('welcome'))}</h1>
          <div class="by">${esc(ui('by'))} ${esc(data.author)}</div>
          <div class="lang-label">${esc(ui('chooseLang'))}</div>
          <div class="lang-pills">
            ${data.languages.map(l =>
              `<button class="pill${l.code === lang ? ' active' : ''}" data-lang="${l.code}">${esc(l.label)}</button>`).join('')}
          </div>
          <a class="btn" id="enter" href="#/navaratri">${esc(ui('enter'))}</a>
        </div>
        ${footer()}
        <div class="kolam"></div>
      </div>`;
    app.querySelectorAll('.pill').forEach(b =>
      b.addEventListener('click', () => setLang(b.dataset.lang)));
    $('#enter').addEventListener('click', () => tryPlay()); // click = user gesture, music may start
  }

  // ---------- tile icons ----------
  // Each theme tile shows either its emoji or a random photo from that section.
  // The choice is made once per page load so all tiles match (config.json: tileStyle, emojiChance).
  const tileIcons = {};
  function pickTileIcons() {
    const style = cfg.tileStyle || 'emoji';
    const chance = cfg.emojiChance == null ? 0.25 : cfg.emojiChance;
    const usePhotos = style === 'photo' || (style === 'mix' && Math.random() >= chance);
    if (!usePhotos) return;
    data.elements.forEach(e => {
      const imgs = (e.items || []).filter(m => (m.type || 'image') === 'image');
      if (imgs.length) tileIcons[e.id] = imgs[Math.floor(Math.random() * imgs.length)];
    });
  }
  function tileIcon(e) {
    const m = tileIcons[e.id];
    if (!m) return `<span class="ico">${e.icon}</span>`;
    const th = m.thumb || m.src.replace(/([^/]+)$/, 'thumbs/$1');
    return `<span class="ico ph"><img src="${esc(th)}" alt="" onerror="this.onerror=null;this.src='${esc(m.src)}'"></span>`;
  }

  // ---------- footer ----------
  function footer() {
    const f = data.footer;
    if (!f) return '';
    return `<footer class="site-footer">
      <div class="f-main">${f.name ? `<strong>${esc(f.name)}</strong>` : ''}${f.address ? `<span>${esc(f.address)}</span>` : ''}
        ${f.url ? `<a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.urlLabel || f.url)}</a>` : ''}</div>
      <div class="f-credit">${esc(f.credit)}</div>
    </footer>`;
  }

  // ---------- header ----------
  function topbar(showBack) {
    return `<header class="topbar">
      <span class="brand">🪔 ${esc(ui('brand'))}</span>
      ${showBack ? `<a href="#/theme">← ${esc(ui('back'))}</a>` : ''}
      ${langSelect()}
    </header><div class="kolam"></div>`;
  }

  // ---------- what is Navarathiri Golu ----------
  function renderAbout() {
    const a = data.about;
    const next = `<a class="btn" href="#/theme">${esc(ui('discoverTheme'))} →</a>`;
    app.innerHTML = `
      <div class="page theme-page">
        ${topbar(false)}
        <main class="about-wrap fade">
          <h1>${esc(t(a.title))}</h1>
          <div class="about-cta top">${next}</div>
          <div class="about-grid">
            <figure class="about-photo">
              <img src="${esc(a.image)}" alt="${esc(t(a.title))}">
            </figure>
            <div class="about-text">
              <p class="lead">${esc(t(a.intro))}</p>
              ${a.sections.map(sec => `
                <h2>${esc(t(sec.heading))}</h2>
                ${sec.paras.map(p => `<p>${esc(t(p))}</p>`).join('')}`).join('')}
            </div>
          </div>
          <div class="about-cta bottom">${next}</div>
        </main>
        ${footer()}
        <div class="kolam"></div>
      </div>`;
    bindLangSelect();
  }

  // ---------- theme ----------
  function renderTheme() {
    const th = data.theme;
    app.innerHTML = `
      <div class="page theme-page">
        ${topbar(false)}
        <main class="theme-wrap fade">
          <h1>${esc(t(th.title))}</h1>
          <div class="tag">${esc(t(th.tagline))}</div>
          <h2>${esc(t(th.whatIsHeading))}</h2>
          <p>${esc(t(th.whatIs))}</p>
          <div class="elements-row">
            ${data.elements.filter(e => !e.extra).map(e => `
              <a class="el-card" style="--c:${e.color}" href="#/golu/${e.id}">
                ${tileIcon(e)}
                <strong>${esc(t(e.name))}</strong>
                <small>${esc(t(e.sanskrit))}</small>
              </a>`).join('')}
          </div>
          <p>${esc(t(th.temples))}</p>
          <p>${esc(t(th.golu))}</p>
          <a class="btn" href="#/golu/${data.elements[0].id}">${esc(ui('explore'))}</a>
        </main>
        ${footer()}
        <div class="kolam"></div>
      </div>`;
    bindLangSelect();
  }

  // ---------- golu viewer ----------
  function renderGolu(id) {
    const galleryOn = cfg.showGallery !== false;
    const isGallery = id === 'gallery' && galleryOn;
    const el = data.elements.find(e => e.id === id) || (isGallery ? null : data.elements[0]);

    const nav = data.elements.map(e => `
      <a href="#/golu/${e.id}" style="--c:${e.color}"${el && el.id === e.id ? ' class="active"' : ''}>
        ${tileIcon(e)}
        <span class="txt">${esc(t(e.name))}<small>${esc(t(e.sanskrit))}</small></span>
      </a>`).join('') +
      (galleryOn ? `<div class="sep"></div>
      <a href="#/golu/gallery"${isGallery ? ' class="active"' : ''}>
        <span class="ico">🖼️</span><span class="txt">${esc(ui('gallery'))}</span>
      </a>` : '');

    app.innerHTML = `
      <div class="golu">
        ${topbar(true)}
        <div class="split">
          <nav class="side">${nav}</nav>
          <div class="divider" role="separator" aria-orientation="vertical" tabindex="0"></div>
          <main class="main fade" id="main"></main>
        </div>
        ${footer()}
      </div>`;
    bindLangSelect();
    initDivider();
    if (isGallery) renderGallery($('#main'));
    else renderElement($('#main'), el);
  }

  // The theme's story, in a card beside the pictures (below them on narrow screens). Open by default; visitors can fold it.
  function storyCard(el) {
    const st = el.storyText;
    return `<details class="story" open>
      <summary>📖 ${esc(ui('tale'))}: ${esc(t(el.tale.story))}</summary>
      <div class="story-body">
        ${st.blocks.map(b => {
          if (b.type === 'h') return `<h4>${esc(t(b.text))}</h4>`;
          if (b.type === 'ul') return `<ul>${b.items.map(i => `<li>${esc(t(i))}</li>`).join('')}</ul>`;
          if (b.type === 'quote') return `<blockquote>${esc(t(b.text))}</blockquote>`;
          return `<p>${esc(t(b.text))}</p>`;
        }).join('')}
      </div>
    </details>`;
  }

  function renderElement(main, el) {
    main.innerHTML = `
      <section class="intro" style="--c:${el.color}">
        <h2>${tileIcon(el)} ${esc(t(el.name))} <span class="sk">${esc(t(el.sanskrit))}</span></h2>
        <p>${esc(t(el.intro))}</p>
        ${el.tale ? `<div class="tale"><span>💛 ${esc(ui('emotion'))}: <strong>${esc(t(el.tale.emotion))}</strong></span><span>📖 ${esc(ui('tale'))}: <strong>${esc(t(el.tale.story))}</strong></span></div>` : ''}
        ${el.temple ? `<div class="temple">🛕 ${esc(ui('sacredTemple'))}: <strong>${esc(t(el.temple))}</strong></div>` : ''}
      </section>
      <div class="el-grid${el.storyText ? '' : ' solo'}" style="--c:${el.color}">
        <div class="viewer">
          <div class="stage" id="stage"></div>
          <p class="hint">${esc(ui('tapHint'))}</p>
          <section class="info" id="info"></section>
        </div>
        ${el.storyText ? storyCard(el) : ''}
      </div>`;
    showSlide(el, idx);

    const stage = $('#stage');
    let x0 = null;
    stage.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 50) showSlide(el, idx + (dx < 0 ? 1 : -1));
    });
    document.onkeydown = e => {
      if (e.key === 'ArrowRight') showSlide(el, idx + 1);
      if (e.key === 'ArrowLeft') showSlide(el, idx - 1);
    };
  }

  // small preview: images/x/name.jpg -> images/x/thumbs/name.jpg (falls back to the full file)
  function thumbOf(m) {
    if (m.type === 'video' || m.type === 'youtube') return '<span class="vid">▶</span>';
    const th = m.thumb || m.src.replace(/([^/]+)$/, 'thumbs/$1');
    return `<img loading="lazy" src="${esc(th)}" alt="" onerror="this.onerror=null;this.src='${esc(m.src)}'">`;
  }

  function showSlide(el, n) {
    const items = el.items;
    if (n < 0 || n >= items.length) return;
    idx = n;
    const it = items[n];
    const title = it.title === '@temple' ? t(el.temple) : (it.title ? t(it.title) : ui('placeholderTitle'));
    const story = it.story ? t(it.story) : ui('placeholderStory');

    let media;
    if (it.type === 'video') media = `<video src="${esc(it.src)}" controls playsinline${it.poster ? ` poster="${esc(it.poster)}"` : ''}></video>`;
    else if (it.type === 'youtube') media = `<iframe src="https://www.youtube-nocookie.com/embed/${esc(it.id)}" allowfullscreen loading="lazy" title="${esc(title)}"></iframe>`;
    else media = `<div class="bg" style="background-image:url('${esc(it.src)}')"></div><img src="${esc(it.src)}" alt="${esc(title)}">`;

    const zones = it.type === 'image' || !it.type
      ? '<div class="zone l" data-d="-1"></div><div class="zone r" data-d="1"></div>' : '';
    $('#stage').innerHTML = `${media}${zones}
      <button class="arrow l" data-d="-1" aria-label="Previous"${n === 0 ? ' disabled' : ''}>‹</button>
      <button class="arrow r" data-d="1" aria-label="Next"${n === items.length - 1 ? ' disabled' : ''}>›</button>`;
    $('#info').innerHTML = `
      <span class="counter">${n + 1} / ${items.length}</span>
      <h3>${esc(title)}</h3>
      <p>${esc(story)}</p>
      <div class="thumbs">${items.map((m, i) =>
        `<button class="${i === n ? 'on' : ''}" data-i="${i}" aria-label="${i + 1}">${thumbOf(m)}</button>`).join('')}</div>`;

    $('#stage').querySelectorAll('[data-d]').forEach(b =>
      b.addEventListener('click', () => showSlide(el, idx + Number(b.dataset.d))));
    $('#info').querySelectorAll('[data-i]').forEach(b =>
      b.addEventListener('click', () => showSlide(el, Number(b.dataset.i))));
    const strip = $('#info .thumbs'), on = $('#info .thumbs .on');
    if (strip && on) strip.scrollLeft = on.offsetLeft - (strip.clientWidth - on.clientWidth) / 2; // only the strip moves, not the page

    if (items[n + 1] && (items[n + 1].type || 'image') === 'image') new Image().src = items[n + 1].src; // preload next
  }

  // ---------- gallery ----------
  function renderGallery(main) {
    const years = (data.gallery.years || []).filter(y => y.items && y.items.length)
      .sort((a, b) => b.year - a.year);
    const flat = [];
    main.innerHTML = `<h2>🖼️ ${esc(ui('gallery'))}</h2>` + (years.length ? years.map(y => `
      <section class="gal-year">
        <h2>${y.year}</h2>
        <div class="grid">${y.items.map(it => {
          flat.push(it);
          return `<button data-i="${flat.length - 1}"><img loading="lazy" src="${esc(it.src)}" alt="${y.year}"></button>`;
        }).join('')}</div>
      </section>`).join('') : `<p class="empty">${esc(ui('galleryEmpty'))}</p>`);
    main.querySelectorAll('.grid button').forEach(b =>
      b.addEventListener('click', () => openLightbox(flat, Number(b.dataset.i))));
  }

  function openLightbox(list, i) {
    const box = document.createElement('div');
    box.className = 'lightbox';
    const paint = () => {
      const it = list[i];
      box.innerHTML = `<button class="close" aria-label="Close">×</button>
        <button class="arrow l" aria-label="Previous"${i === 0 ? ' disabled' : ''}>‹</button>
        <img src="${esc(it.src)}" alt="">
        ${it.caption ? `<div>${esc(t(it.caption))}</div>` : ''}
        <button class="arrow r" aria-label="Next"${i === list.length - 1 ? ' disabled' : ''}>›</button>`;
      $('.close', box).onclick = close;
      $('.arrow.l', box).onclick = () => { i--; paint(); };
      $('.arrow.r', box).onclick = () => { i++; paint(); };
    };
    const onKey = e => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight' && i < list.length - 1) { i++; paint(); }
      if (e.key === 'ArrowLeft' && i > 0) { i--; paint(); }
    };
    function close() { document.removeEventListener('keydown', onKey); box.remove(); }
    box.addEventListener('click', e => { if (e.target === box) close(); });
    document.addEventListener('keydown', onKey);
    paint();
    document.body.appendChild(box);
  }

  // ---------- resizable divider ----------
  function initDivider() {
    const root = document.documentElement;
    const saved = store.get('golu_side');
    if (saved) root.style.setProperty('--side', saved + 'px');
    const div = $('.divider');
    const split = $('.split');
    const setWidth = px => {
      const max = split.clientWidth * 0.6;
      const w = Math.max(150, Math.min(max, px));
      root.style.setProperty('--side', w + 'px');
      return w;
    };
    div.addEventListener('pointerdown', e => {
      div.setPointerCapture(e.pointerId);
      div.classList.add('drag');
      document.body.style.userSelect = 'none';
    });
    div.addEventListener('pointermove', e => {
      if (!div.hasPointerCapture(e.pointerId)) return;
      setWidth(e.clientX - split.getBoundingClientRect().left);
    });
    const end = e => {
      if (!div.classList.contains('drag')) return;
      div.classList.remove('drag');
      document.body.style.userSelect = '';
      store.set('golu_side', Math.round($('.side').getBoundingClientRect().width));
    };
    div.addEventListener('pointerup', end);
    div.addEventListener('pointercancel', end);
    div.addEventListener('keydown', e => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const w = setWidth($('.side').getBoundingClientRect().width + (e.key === 'ArrowRight' ? 20 : -20));
      store.set('golu_side', Math.round(w));
    });
  }

  // ---------- start ----------
  async function init() {
    try {
      [cfg, data] = await Promise.all([
        fetch('config.json', { cache: 'no-cache' }).then(r => r.json()),
        fetch('data/content.json', { cache: 'no-cache' }).then(r => r.json())
      ]);
    } catch (e) {
      app.textContent = 'Could not load site data. If you opened index.html directly, run a local web server instead (see README).';
      return;
    }
    const codes = data.languages.map(l => l.code);
    const fromUrl = new URLSearchParams(location.search).get('lang');
    lang = [fromUrl, store.get('golu_lang'), cfg.defaultLanguage, 'en'].find(c => c && codes.includes(c));
    document.documentElement.lang = lang;
    if (cfg.music) { audio.src = cfg.music; audio.volume = cfg.musicVolume == null ? 0.4 : cfg.musicVolume; }
    pickPalette();
    pickTileIcons();
    paintMusicBtn();
    tryPlay(); // autoplay is usually blocked, so this starts on the first tap
    render();
  }
  init();
})();
