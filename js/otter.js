(function () {
  'use strict';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var api = window.SiteApi; if (!api) return;
  var PROJ = api.PROJECTS;
  var NS = 'http://www.w3.org/2000/svg';

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }

  /* ---------- the otter (original drawing, inline SVG) ---------- */
  var OTTER_SVG = '<svg class="ot-fx" viewBox="0 0 120 120" aria-hidden="true" focusable="false">' +
    '<path d="M80 104 Q116 108 110 78" fill="none" stroke="#6b4423" stroke-width="10" stroke-linecap="round"/>' +
    '<ellipse cx="60" cy="84" rx="26" ry="29" fill="#8a5a35"/><ellipse cx="60" cy="88" rx="16" ry="21" fill="#e0bf98"/>' +
    '<ellipse cx="38" cy="86" rx="7" ry="13" fill="#8a5a35" transform="rotate(12 38 86)"/><ellipse cx="82" cy="86" rx="7" ry="13" fill="#8a5a35" transform="rotate(-12 82 86)"/>' +
    '<ellipse cx="47" cy="111" rx="10" ry="5" fill="#6b4423"/><ellipse cx="73" cy="111" rx="10" ry="5" fill="#6b4423"/>' +
    '<circle cx="40" cy="25" r="7" fill="#8a5a35"/><circle cx="80" cy="25" r="7" fill="#8a5a35"/><circle cx="40" cy="25" r="3.2" fill="#e0bf98"/><circle cx="80" cy="25" r="3.2" fill="#e0bf98"/>' +
    '<circle cx="60" cy="43" r="25" fill="#8a5a35"/><ellipse cx="60" cy="52" rx="16" ry="12" fill="#e0bf98"/><ellipse cx="60" cy="47" rx="5.5" ry="3.8" fill="#2a1a10"/>' +
    '<path d="M60 50.5 v4 M53.5 56 Q60 60.5 66.5 56" fill="none" stroke="#2a1a10" stroke-width="1.8" stroke-linecap="round"/>' +
    '<circle cx="49.5" cy="38" r="3.4" fill="#1a1008"/><circle cx="70.5" cy="38" r="3.4" fill="#1a1008"/><circle cx="50.6" cy="36.8" r="1.1" fill="#fff"/><circle cx="71.6" cy="36.8" r="1.1" fill="#fff"/>' +
    '<path d="M46 51 L34 48 M46 54 L34 56 M74 51 L86 48 M74 54 L86 56" stroke="#e0bf98" stroke-width="1.3" stroke-linecap="round" fill="none"/></svg>';

  /* ---------- DOM ---------- */
  var btn = el('button', 'ot'); btn.type = 'button'; btn.id = 'otter';
  btn.setAttribute('aria-label', 'Ask the otter guide what to see'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'otPanel');
  btn.innerHTML = '<span class="ot-flip"><span class="ot-bob">' + OTTER_SVG + '</span></span>';
  var flip = btn.firstChild;
  var bub = el('div', 'ot-bub', 'What are you here to see? Click me.'); bub.hidden = true; bub.setAttribute('aria-hidden', 'true');

  var panel = el('div', 'ot-panel'); panel.id = 'otPanel'; panel.hidden = true; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Otter guide');
  var head = el('div', 'ot-head');
  head.appendChild(el('i', 'ot-dot')); head.appendChild(el('b', '', '>_ otter guide')); head.appendChild(el('span', 'ot-tag', 'rule-based, not AI'));
  var close = el('button', 'ot-x', '×'); close.type = 'button'; close.setAttribute('aria-label', 'Close the otter guide'); head.appendChild(close);
  var scroll = el('div', 'ot-scroll'), msgs = el('div', 'ot-msgs'); msgs.setAttribute('aria-live', 'polite'); scroll.appendChild(msgs);
  var chips = el('div', 'ot-chips');
  var bar = el('form', 'ot-bar'); bar.setAttribute('autocomplete', 'off');
  var input = el('input', 'ot-in'); input.type = 'text'; input.placeholder = 'Type a topic, like android or react'; input.setAttribute('aria-label', 'Type what you want to see');
  var send = el('button', 'ot-send', 'Send'); send.type = 'submit'; bar.appendChild(input); bar.appendChild(send);
  var note = el('div', 'ot-note', 'Answers come from this site’s own content.');
  [head, scroll, chips, bar, note].forEach(function (n) { panel.appendChild(n); });
  document.body.appendChild(panel); document.body.appendChild(bub); document.body.appendChild(btn);

  /* ---------- answers, built from the real project data ---------- */
  function liveList() {
    var out = [];
    PROJ.forEach(function (p) { (p.facts || []).forEach(function (f) { if (f[0] === 'Live site') out.push(p.title); }); });
    return out;
  }
  var A = {
    projects: { text: PROJ.length + ' projects: web apps, an iOS app, an Android app, plus two robot projects from class. ' + liveList().join(' and ') + ' have live sites.', go: [['See featured projects', function () { api.go('featured'); }], ['All projects', function () { api.go('projects'); }]] },
    skills: { text: 'Java, JavaScript, Swift, Python and C, plus React, SwiftUI, Spring Boot, MariaDB and Supabase. I am going deeper on React right now.', go: [['See skills', function () { api.go('skills'); }]] },
    story: { text: 'Scott was adopted from Guatemala and grew up in Council Bluffs. After his dad fell from a zipline, robotics-assisted therapy at Madonna Rehabilitation Hospital helped him recover. That is why he wants to build tech that helps people heal.', go: [['Back to the intro', function () { api.go('home'); }]] },
    live: { text: 'Three live web apps: CourseFlow, a CPR E course planner, Maze Solver, a breadth-first search visualizer, and the ISU Game Hub with five Iowa State games.', go: [['Open CourseFlow', function () { api.go('p:courseflow'); }], ['Open Maze Solver', function () { api.go('p:maze-solver'); }], ['Open Game Hub', function () { api.go('p:jeopardy'); }]] },
    ios: { text: 'FocusUp is an iOS app built with SwiftUI and the Screen Time API, with Supabase behind it. About 15 people tested it on TestFlight.', go: [['See FocusUp', function () { api.go('p:focusup'); }]] },
    android: { text: 'timePiece is an Android team app for browsing, favoriting and selling watches. Scott built the catalog backend and the WebSocket endpoints in Spring Boot.', go: [['See timePiece', function () { api.go('p:timepiece'); }]] },
    contact: { text: 'Email grayscott07@outlook.com or find Scott on GitHub as Scotty-08.', go: [['Go to contact', function () { api.go('contact'); }]] },
    learning: { text: 'Right now Scott is learning React. There are two demos on the home page: user cards and a shopping cart.', go: [['See what I’m learning', function () { api.go('learning'); }]] },
    bot: { text: 'I am an otter, not an AI. I match keywords and answer from what is already on this site, so I only know a few topics.' },
    work: { text: 'Scott is a courtesy patrol and cashier at Menards in Council Bluffs, Iowa, and has been since April 2024. He runs the register and walks the lot and floor so customers get help without asking twice. Before that he was a landscaper on a crew at J&A Mowing, from March 2022 to June 2024, mowing, trimming and edging residential lawns. For his technical work, check out the projects.', go: [['See projects', function () { api.go('projects'); }]] },
    none: { text: 'I only know a few topics. Try projects, skills, story, iOS, Android, work or contact, or pick a chip below.' }
  };
  function match(q) {
    var s = q.toLowerCase();
    function has(words) { return words.some(function (w) { return s.indexOf(w) !== -1; }); }
    if (has(['are you ai', 'chatgpt', 'are you a bot', 'are you real', 'otter'])) return 'bot';
    if (has(['live', 'website', 'web app', 'webapp', 'demo', 'link', 'course', 'maze', 'game', 'jeopardy', 'hub'])) return 'live';
    if (has(['android', 'timepiece', 'watch', 'backend', 'spring'])) return 'android';
    if (has(['ios', 'swift', 'focusup', 'iphone', 'testflight'])) return 'ios';
    if (has(['learning', 'react'])) return 'learning';
    if (has(['project', 'built', 'portfolio'])) return 'projects';
    if (has(['skill', 'java', 'python', 'tech', 'stack', 'language'])) return 'skills';
    if (has(['job', 'work experience', 'experience', 'employ', 'menards', 'mowing', 'landscap', 'cashier', 'work history', 'you work', 'worked at', 'works at', 'part-time', 'part time'])) return 'work';
    if (has(['story', 'about', 'who', 'why', 'guatemala', 'heal', 'background'])) return 'story';
    if (has(['contact', 'hire', 'intern', 'email', 'reach', 'github', 'linkedin', 'phone'])) return 'contact';
    return 'none';
  }

  function say(who, text, actions) {
    var m = el('div', 'ot-m ' + who);
    m.appendChild(document.createTextNode(text));
    (actions || []).forEach(function (a) {
      var b = el('button', 'ot-go', a[0] + ' →'); b.type = 'button';
      b.addEventListener('click', function () { a[1](); setOpen(false, true); });
      m.appendChild(b);
    });
    msgs.appendChild(m);
  }
  function ask(label, topic) { var a = A[topic] || A.none; say('me', label); say('bot', a.text, a.go); }
  say('bot', 'Hi, I am the portfolio otter. I am a small helper, not an AI. What are you interested in seeing?');
  [['My projects', 'projects'], ['My skills', 'skills'], ['My story', 'story'], ['iOS app', 'ios'], ['Android app', 'android'], ['Live web apps', 'live'], ['Work experience', 'work'], ['Contact', 'contact']].forEach(function (d) {
    var c = el('button', 'ot-chip', d[0]); c.type = 'button'; c.addEventListener('click', function () { ask(d[0], d[1]); }); chips.appendChild(c);
  });
  bar.addEventListener('submit', function (e) { e.preventDefault(); var q = input.value.trim(); if (!q) return; ask(q, match(q)); input.value = ''; });

  /* ---------- position and wandering ---------- */
  var timer = 0, bubTimer = 0, open = false, hovering = false, pos = { x: 0, y: 0 }, atHome = true;
  function size() { return innerWidth < 700 ? 84 : 104; }
  function home() { return { x: innerWidth - size() - 20, y: innerHeight - size() - 20 }; }
  function spots() {
    var s = size(), w = innerWidth, h = innerHeight;
    function p(fx, fy) { return { x: Math.max(8, Math.min(w - s - 8, Math.round(w * fx - s / 2))), y: Math.max(76, Math.min(h - s - 8, Math.round(h * fy - s / 2))) }; }
    return [p(.78, .9), p(.55, .88), p(.9, .62), p(.82, .38), p(.62, .6), p(.3, .85)];
  }
  function place(p) {
    var dir = p.x < pos.x ? 1 : -1;
    btn.style.left = p.x + 'px'; btn.style.top = p.y + 'px';
    flip.style.transform = dir === -1 ? 'scaleX(-1)' : '';
    if (p.x !== pos.x || p.y !== pos.y) { btn.classList.add('mv'); setTimeout(function () { btn.classList.remove('mv'); }, 1600); }
    pos = p; var h = home(); atHome = p.x === h.x && p.y === h.y;
    bub.hidden = true;
  }
  function jump(p) { var t = btn.style.transition; btn.style.transition = 'none'; btn.style.left = p.x + 'px'; btn.style.top = p.y + 'px'; pos = p; var h = home(); atHome = p.x === h.x && p.y === h.y; void btn.offsetWidth; btn.style.transition = t; }
  function tick() {
    if (open || hovering || document.hidden) { timer = setTimeout(tick, 3000); return; }
    if (atHome) { var sp = spots(); place(sp[Math.floor(Math.random() * sp.length)]); timer = setTimeout(tick, 4200); }
    else { place(home()); timer = setTimeout(tick, 6500); }
  }
  btn.addEventListener('pointerenter', function () { hovering = true; });
  btn.addEventListener('pointerleave', function () { hovering = false; });
  btn.addEventListener('focus', function () { hovering = true; });
  btn.addEventListener('blur', function () { hovering = false; });
  addEventListener('resize', function () { if (atHome || open) jump(home()); else place(home()); });

  function showBubble() {
    if (open || !atHome) return;
    bub.style.left = Math.max(8, pos.x - 224) + 'px'; bub.style.top = (pos.y + 6) + 'px'; bub.hidden = false;
    clearTimeout(bubTimer); bubTimer = setTimeout(function () { bub.hidden = true; }, 9000);
  }

  function setOpen(v, keepFocus) {
    open = v; panel.hidden = !v; btn.setAttribute('aria-expanded', String(v)); bub.hidden = true;
    if (v) { if (!atHome) place(home()); setTimeout(function () { input.focus(); }, 60); }
    else if (!keepFocus) btn.focus();
  }
  btn.addEventListener('click', function () { setOpen(!open); });
  close.addEventListener('click', function () { setOpen(false); });
  panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); } });

  jump(home());
  if (!reduced) { timer = setTimeout(tick, 5200); setTimeout(showBubble, 2500); }
})();
