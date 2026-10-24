(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* toast */
  const toastEl = $('#toast'); let toastT;
  function toast(msg) { toastEl.textContent = msg; toastEl.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { toastEl.hidden = true; }, 2400); }

  /* ================= data ================= */
  const PROJECTS = [
    { id: 'focusup', cat: 'mobile', title: 'FocusUp', kind: 'Personal project, iOS app', desc: 'An iPhone app that turns tasks into quests and limits distracting apps. Built with my roommate and tested by about 15 people on TestFlight.', tags: ['SwiftUI', 'Screen Time API', 'Supabase', 'Canvas'],
      facts: [['Role', 'Co-developer'], ['Platform', 'iPhone, SwiftUI'], ['Backend', 'Supabase, PostgreSQL'], ['Status', 'Feasibility build on TestFlight'], ['Browser extension', 'Live on Edge Add-ons']],
      overview: ['FocusUp turns your to-do list into quests. Finish a quest to earn EXP and coins for a player you customize, and lock distracting apps until the work is done.', 'My roommate and I built it together. I worked on the SwiftUI screens and the Screen Time integration, and on the sign-in and friends data in Postgres. A Manifest V3 browser extension imports Canvas assignments through a REST API and turns them into quests.'],
      mine: [['Screens in SwiftUI', 'Home, Quests, Player and Friends are the four tabs. Each is a SwiftUI view driven by data from Supabase.'], ['Screen Time shields', 'Apple\'s Screen Time frameworks decide which apps can be blocked or limited. Access needs the user\'s approval, so the setup flow has a skip path.'], ['Accounts and friends', 'Sign in with Apple or email, plus friend requests, cheers and streaks stored in PostgreSQL.'], ['Canvas import', 'A Chrome-style extension (Manifest V3, JavaScript) reads assignments and sends them to the backend over REST. It is live on Edge Add-ons.']] },
    { id: 'timepiece', cat: 'backend', title: 'timePiece', kind: 'COM S 3090, Java backend', desc: 'A team Android app for browsing, favoriting and selling watches. I built the catalog backend and the WebSocket endpoints for live updates.', tags: ['Spring Boot', 'MariaDB / JPA', 'REST', 'WebSockets'],
      facts: [['Role', 'Backend developer'], ['Course', 'COM S 3090'], ['Stack', 'Spring Boot, MariaDB, JPA'], ['Live updates', 'WebSocket endpoints'], ['Process', 'SCRUM sprints, Figma, Git']],
      overview: ['timePiece is an Android app where people browse a watch catalog, save favorites and list their own watches for sale. A frontend teammate built the screens and I owned the backend.', 'My part was the catalog REST endpoints, the MariaDB model behind them, and WebSocket endpoints that push live price updates and sold-watch notifications to the app.'],
      mine: [['Catalog endpoints', 'Spring Boot REST endpoints for browsing and searching the catalog, deployed as a backend JAR on our team VM.'], ['Selling model', 'One catalog watch can have many individual listings, so a listing is its own record, separate from the catalog entry.'], ['Live updates', 'A WebSocket connection stays open so the server can send a price change or a "sold" notice the moment it happens.'], ['Teamwork', 'We ran SCRUM sprints and kept the catalog backend in step with the frontend developer building the catalog screen.']] },
    { id: 'jeopardy', cat: 'web', title: 'ISU Jeopardy', kind: 'COM S 3190, web game', desc: 'An Iowa State game with four categories, 16 questions and score tracking for two teams. It grew into a JSON-driven hub.', tags: ['JavaScript', 'JSON', 'localStorage'],
      facts: [['Role', 'Developer'], ['Course', 'COM S 3190'], ['Stack', 'HTML, CSS, JavaScript, JSON'], ['Saved data', 'Top 10 leaderboard in localStorage']],
      overview: ['A Jeopardy-style board for Iowa State trivia. Two teams take turns picking a category and a dollar value, and the score tracks as they play.', 'The game began as one board. I later moved the questions into JSON so a hub page could load different games by fetching their data and rendering it, and I kept a top 10 leaderboard in the browser.'],
      mine: [['Game logic', 'Turn order, scoring and which tiles are used are tracked in plain JavaScript objects.'], ['JSON-driven hub', 'The hub page fetches JSON and renders the available games and boards from it, so adding a game means adding data.'], ['Leaderboard', 'The top 10 scores are saved in localStorage and survive a page reload.']] },
    { id: 'maze-solver', cat: 'web', title: 'Maze Solver Visualizer', kind: 'HTML, CSS and JavaScript', desc: 'Build a maze, place the start and finish, and watch breadth-first search find the shortest route.', tags: ['Algorithms', 'BFS', 'Click events'],
      facts: [['Role', 'Solo project'], ['Grid', '16 rows by 24 columns'], ['Algorithm', 'Breadth-first search'], ['Stack', 'HTML, CSS, JavaScript']],
      overview: ['A grid you can edit with the mouse. Draw walls, move the start and finish, and the solver shows every cell it searched and the shortest path it found.', 'Breadth-first search explores outward one step at a time, so the first time it reaches the finish is guaranteed to be the shortest route. The home page maze uses the same idea.'],
      mine: [['Search', 'A queue holds the next cells to visit, and each cell remembers where it came from so the path can be traced back.'], ['Editing', 'Click and drag paint walls. Dragging the start or finish changes the route straight away.'], ['Stats', 'The page counts cells searched and path length so you can see what a wall costs.']] },
    { id: 'tree-cutter', cat: 'hardware', title: 'Autonomous Tree Cutter', kind: 'CPRE 288, embedded C', desc: 'A team robot where I configured sensors at the register level on an ARM Cortex-M4, wrote the C control logic and tested over UART.', tags: ['C', 'ARM Cortex-M4', 'UART', 'Sensors'],
      facts: [['Role', 'Control logic and testing'], ['Course', 'CPRE 288'], ['Chip', 'ARM Cortex-M4'], ['Language', 'C'], ['Debugging', 'UART output']],
      overview: ['A robot built by a small team to find and cut trees on its own. My work was in the code that reads the sensors and decides what the robot does next.', 'I set up the sensors by writing to their registers directly, wrote the C control logic, and used UART to print what the robot saw while it ran, then fixed what the hardware really did.'],
      mine: [['Register-level setup', 'Sensors are configured by setting bits in the Cortex-M4 peripheral registers, so you have to read the datasheet closely.'], ['Control logic', 'C code turns sensor readings into movement decisions.'], ['Testing', 'UART prints made it possible to compare what I expected with what the robot reported.']] },
    { id: 'react-cards', cat: 'learning', title: 'React User Cards', kind: 'COM S 3190, currently learning', desc: 'Activity 09 uses React, Vite and React-Bootstrap to show reusable cards with information passed in as props.', tags: ['React', 'Vite', 'Props', 'React-Bootstrap'],
      facts: [['Course', 'COM S 3190'], ['Tools', 'React, Vite, React-Bootstrap'], ['Idea', 'One component, many cards']],
      overview: ['In Activity 09, App.jsx passes a picture, name, salary, marital status and address into a reusable UserCard component built with React-Bootstrap.', 'It is a small project, and it is where React clicked for me: write the card once, describe each person as data, and let React draw the rest.'],
      mine: [['Components', 'UserCard is one function that returns the markup for a single person.'], ['Props', 'App.jsx holds an array of users and passes each one down as props.'], ['Bootstrap', 'React-Bootstrap supplies the card layout so I could focus on the data flow.']] },
    { id: 'robot-gui', cat: 'hardware', title: 'Robot Sensor Visualizer', kind: 'Python, embedded resume project', desc: 'A live Python GUI for a robot: a 180 degree polar plot of what the sensors see, with a switch between autonomous and manual control.', tags: ['Python', 'Matplotlib', 'Tkinter'],
      facts: [['Language', 'Python'], ['Plot', 'Matplotlib polar, 180 degrees'], ['Interface', 'Tkinter'], ['Modes', 'Autonomous and manual']],
      overview: ['A desktop tool that shows a robot\'s sensor sweep as a live polar plot, so you can see obstacles around it as the data arrives.', 'A Tkinter switch changes the robot between autonomous driving and manual control from the same window.'],
      mine: [['Live plot', 'Matplotlib redraws the 180 degree sweep as new readings come in.'], ['Control interface', 'Tkinter buttons send manual commands, and a switch hands control back to the robot.']] }
  ];
  const PBY = {}; PROJECTS.forEach((p) => { PBY[p.id] = p; });
  const FILTERS = [['all', 'All'], ['mobile', 'iOS'], ['backend', 'Backend'], ['web', 'Web'], ['hardware', 'Hardware'], ['learning', 'Learning']];
  const N_PROJ = PROJECTS.length;

  const PEEK = {
    'focusup': '<div class="pa-quest"><div>Problem set<i><b></b></i></div><div>Read chapter<i><b></b></i></div><div>Lab report<i><b></b></i></div></div>',
    'timepiece': '<div class="pa-flow"><span class="n">App</span><span class="w"></span><span class="n">Backend</span><span class="w"></span><span class="n">DB</span></div>',
    'jeopardy': '<div class="pa-board">' + Array.from({ length: 16 }, (_, i) => '<i style="animation-delay:' + (i * 0.19).toFixed(2) + 's">$' + (100 * (1 + (i >> 2))) + '</i>').join('') + '</div>',
    'maze-solver': (function () {
      const L = ['SppwEEEEwEEE', 'EwpwEwwEwEwE', 'EwppppwEEEwE', 'EwwwwpppppPF']; let o = '<div class="pa-grid">'; let n = 0;
      L.forEach((r) => r.split('').forEach((c) => { o += '<i class="' + (c === 'w' ? 'w' : (c === 'p' || c === 'P' || c === 'S' || c === 'F') ? 'p' : '') + '" style="animation-delay:' + ((n++) * 0.06).toFixed(2) + 's"></i>'; }));
      return o + '</div>';
    })(),
    'tree-cutter': '<div class="pa-bot"><svg viewBox="0 0 200 70" aria-hidden="true"><path d="M10 55 C 50 55, 50 15, 90 15 S 150 55, 190 20" stroke-width="2"/></svg></div>',
    'react-cards': '<div class="pa-cards"><b>UserCard</b><b>UserCard</b><b>UserCard</b></div>',
    'robot-gui': '<div class="pa-polar"><svg viewBox="0 0 200 105" aria-hidden="true"><path d="M10 100 A90 90 0 0 1 190 100 Z" fill="none" stroke="currentColor" opacity=".3"/><path d="M55 100 A45 45 0 0 1 145 100" fill="none" stroke="currentColor" opacity=".3"/><line x1="100" y1="100" x2="100" y2="14"/></svg></div>'
  };

  function discover() {}
  function renderTrail() {}

  /* ================= project rows ================= */
  function rowEl(p, withPeek) {
    const li = document.createElement('li'); li.dataset.cat = p.cat;
    li.innerHTML = '<button class="prow" type="button" data-id="' + p.id + '"><h3>' + esc(p.title) + '</h3><span class="open">Open project</span><span class="kind">' + esc(p.kind) + '</span><p class="desc">' + esc(p.desc) + '</p></button>';
    const b = $('.prow', li);
    b.addEventListener('click', () => go('p:' + p.id));
    if (withPeek) { ['mouseenter', 'focus'].forEach((ev) => b.addEventListener(ev, () => showPeek(p.id))); }
    return li;
  }
  const homeList = $('#homeList');
  PROJECTS.slice(0, 3).forEach((p) => homeList.appendChild(rowEl(p, false)));
  const projList = $('#projList'); let curFilter = 'all';
  PROJECTS.forEach((p) => projList.appendChild(rowEl(p, true)));
  function showPeek(id) {
    const p = PBY[id]; if (!p) return;
    $$('.prow', projList).forEach((r) => r.classList.toggle('hot', r.dataset.id === id));
    $('#peek').innerHTML = '<h4>' + esc(p.title) + '</h4><div class="peekart">' + PEEK[id] + '</div><p>' + esc(p.kind) + '</p><div class="tagrow">' + p.tags.map((t) => '<span class="tag">' + esc(t) + '</span>').join('') + '</div>';
  }
  const fEl = $('#filters');
  FILTERS.forEach((f) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn small'; b.textContent = f[1]; b.dataset.f = f[0]; b.setAttribute('aria-pressed', String(f[0] === 'all'));
    b.addEventListener('click', () => { curFilter = f[0]; applyFilter(); });
    fEl.appendChild(b);
  });
  function applyFilter() {
    let n = 0, first = null;
    $$('li', projList).forEach((li) => { const show = curFilter === 'all' || li.dataset.cat === curFilter; li.hidden = !show; if (show) { n++; if (!first) first = $('.prow', li).dataset.id; } });
    $$('.btn', fEl).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.f === curFilter)));
    $('#pCount').textContent = n + (n === 1 ? ' project' : ' projects') + ' shown';
    if (first) showPeek(first);
  }
  applyFilter(); renderTrail();

  /* ================= router ================= */
  const VIEWS = ['home', 'projects', 'work', 'about', 'contact', 'project'];
  let current = 'home';
  function show(view, projectId) {
    VIEWS.forEach((v) => { $('#v-' + v).hidden = v !== view; });
    const navKey = view === 'project' ? 'projects' : view;
    $$('[data-nav]').forEach((a) => { if (a.closest('.nav')) { if (a.dataset.nav === navKey) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); } });
    current = view;
    if (view === 'project') renderProject(projectId);
    $('#rail').classList.remove('open'); $('#menuBtn').setAttribute('aria-expanded', 'false');
  }
  function go(token, quiet) {
    let view = token, pid = null, scroll = null;
    if (token.indexOf('p:') === 0) { view = 'project'; pid = token.slice(2); }
    else if (token === 'learning') { view = 'home'; scroll = '#learning'; }
    if (view === 'project' && !PBY[pid]) { view = 'projects'; pid = null; }
    if (VIEWS.indexOf(view) === -1) view = 'home';
    show(view, pid);
    const hashTok = view === 'project' ? 'project-' + pid : (scroll ? 'learning' : view);
    if (!quiet) { try { history.replaceState(null, '', '#' + hashTok); } catch (e) { try { location.hash = hashTok; } catch (e2) {} } }
    if (scroll) { const el = $(scroll); if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' }); } else window.scrollTo(0, 0);
    if (view === 'home' && !scroll) heroVisible = true;
  }
  function tokenFromHash() {
    const h = (location.hash || '').replace('#', '');
    if (h.indexOf('project-') === 0) return 'p:' + h.slice(8);
    return h || 'home';
  }
  document.addEventListener('click', (e) => {
    const g = e.target.closest('[data-go]');
    if (g) { e.preventDefault(); go(g.dataset.go); return; }
    const a = e.target.closest('a[href^="#"]');
    if (a && a.getAttribute('href').length > 1 && !a.classList.contains('sr')) {
      e.preventDefault();
      const t = a.getAttribute('href').slice(1);
      go(t.indexOf('project-') === 0 ? 'p:' + t.slice(8) : t);
    }
  });
  addEventListener('hashchange', () => go(tokenFromHash(), true));
  $('#menuBtn').addEventListener('click', () => { const o = $('#rail').classList.toggle('open'); $('#menuBtn').setAttribute('aria-expanded', String(o)); });

  /* ================= hero maze ================= */
  const R = 16, C = 24, N = R * C, S = 7 * C + 4, E = 7 * C + 19;
  function neighbors(cur) {
    const r = Math.floor(cur / C), c = cur % C, nb = [];
    if (r > 0) nb.push(cur - C); if (r < R - 1) nb.push(cur + C); if (c > 0) nb.push(cur - 1); if (c < C - 1) nb.push(cur + 1);
    return nb;
  }
  function bfs(walls, s, e) {
    const prev = new Array(N).fill(-1), seen = new Array(N).fill(false), q = [s], order = [];
    seen[s] = true;
    for (let h = 0; h < q.length; h++) {
      const cur = q[h]; order.push(cur);
      if (cur === e) { const path = []; let p = cur; while (p !== -1) { path.unshift(p); p = prev[p]; } return { found: true, order, path }; }
      neighbors(cur).forEach((n) => { if (!seen[n] && !walls[n]) { seen[n] = true; prev[n] = cur; q.push(n); } });
    }
    return { found: false, order, path: [] };
  }
  const KIND = ['', ' wall', ' visited', ' path'];
  function buildGrid(el, startRef, endRef) {
    const cells = new Uint8Array(N), els = [];
    for (let i = 0; i < N; i++) {
      const b = document.createElement('button'); b.type = 'button'; b.dataset.i = i; b.className = 'cell';
      b.setAttribute('aria-label', 'Row ' + (Math.floor(i / C) + 1) + ', column ' + (i % C + 1));
      els.push(b); el.appendChild(b);
    }
    return { cells, els };
  }
  const mazeEl = $('#maze'); const G = buildGrid(mazeEl);
  G.els[S].classList.add('start'); G.els[S].textContent = 'S'; G.els[E].classList.add('end'); G.els[E].textContent = 'F';
  let sim = null, auto = true, heroVisible = true, curFound = true;
  function setCell(i, v) { if (G.cells[i] === v) return; G.cells[i] = v; if (i === S || i === E) return; G.els[i].className = 'cell' + KIND[v]; }
  const wallFlags = () => { const w = new Uint8Array(N); for (let i = 0; i < N; i++) w[i] = G.cells[i] === 1 ? 1 : 0; return w; };
  function status(t) { $('#mStatus').textContent = t + (auto ? '' : ' (paused)'); $('#mToggle').textContent = auto ? 'Pause' : 'Resume'; }
  let phaseText = 'Placing walls';
  function stage(t) { phaseText = t; status(t); }
  const stats = (v, p) => { $('#mVisited').textContent = v; $('#mPath').textContent = p; };
  function newMaze() {
    let walls = [];
    for (let tries = 0; tries < 40; tries++) {
      walls = []; const f = new Uint8Array(N);
      for (let i = 0; i < N; i++) if (i !== S && i !== E && Math.random() < 0.27) { walls.push(i); f[i] = 1; }
      if (bfs(f, S, E).found) break;
    }
    for (let a = walls.length - 1; a > 0; a--) { const j = Math.floor(Math.random() * (a + 1)); [walls[a], walls[j]] = [walls[j], walls[a]]; }
    for (let c = 0; c < N; c++) setCell(c, 0);
    sim = { phase: 'build', walls, shown: 0, vi: 0, pi: 0, hold: 0, result: null };
    stats(0, 0); stage('Placing walls');
  }
  function paintResult(res) { res.order.forEach((i) => { if (i !== S && i !== E) setCell(i, 2); }); res.path.forEach((i) => { if (i !== S && i !== E) setCell(i, 3); }); }
  function finishNow() {
    for (let c = 0; c < N; c++) setCell(c, 0);
    sim.walls.forEach((i) => setCell(i, 1));
    const res = bfs(wallFlags(), S, E); paintResult(res); sim.phase = 'idle'; stats(res.order.length, res.path.length);
    stage(res.found ? 'Shortest path found' : 'No path. Remove a wall');
  }
  function tick() {
    if (!auto || !sim || sim.phase === 'idle' || document.hidden || !heroVisible || current !== 'home') return;
    if (sim.phase === 'build') {
      for (let k = 0; k < 14 && sim.shown < sim.walls.length; k++) setCell(sim.walls[sim.shown++], 1);
      if (sim.shown >= sim.walls.length) { sim.result = bfs(wallFlags(), S, E); sim.phase = 'test'; stage('Searching, one ring of cells at a time'); }
    } else if (sim.phase === 'test') {
      const o = sim.result.order;
      for (let k = 0; k < 4 && sim.vi < o.length; k++) { const idx = o[sim.vi++]; if (idx !== S && idx !== E) setCell(idx, 2); }
      stats(sim.vi, 0);
      if (sim.vi >= o.length) { sim.phase = 'figure'; stage(sim.result.found ? 'Tracing the shortest path' : 'No path. Remove a wall'); }
    } else if (sim.phase === 'figure') {
      const p = sim.result.path;
      if (sim.pi < p.length) { const pi = p[sim.pi++]; if (pi !== S && pi !== E) setCell(pi, 3); stats(sim.result.order.length, sim.pi); } else sim.phase = 'hold';
    } else if (sim.phase === 'hold') { if (++sim.hold > 70) newMaze(); }
  }
  function userEdit(i, val) {
    for (let c = 0; c < N; c++) if (G.cells[c] >= 2) setCell(c, 0);
    setCell(i, val);
    const res = bfs(wallFlags(), S, E); paintResult(res);
    auto = false; if (sim) sim.phase = 'idle';
    stats(res.order.length, res.path.length); stage(res.found ? 'Shortest path found' : 'No path. Remove a wall');
  }
  let painting = false, paintVal = 1;
  mazeEl.addEventListener('pointerdown', (e) => { const b = e.target.closest('.cell'); if (!b) return; const i = +b.dataset.i; if (i === S || i === E) return; painting = true; paintVal = G.cells[i] === 1 ? 0 : 1; userEdit(i, paintVal); });
  mazeEl.addEventListener('pointerover', (e) => { if (!painting) return; const b = e.target.closest('.cell'); if (!b) return; const i = +b.dataset.i; if (i === S || i === E || G.cells[i] === paintVal) return; userEdit(i, paintVal); });
  mazeEl.addEventListener('click', (e) => { if (e.detail !== 0) return; const b = e.target.closest('.cell'); if (!b) return; const i = +b.dataset.i; if (i === S || i === E) return; userEdit(i, G.cells[i] === 1 ? 0 : 1); });
  addEventListener('pointerup', () => { painting = false; }); addEventListener('pointercancel', () => { painting = false; });
  function replay() { newMaze(); if (reduced) { finishNow(); auto = false; stage('Shortest path found'); return; } auto = true; stage(phaseText); }
  $('#mNew').addEventListener('click', replay);
  $('#mToggle').addEventListener('click', () => { if (auto) { auto = false; status(phaseText); return; } if (reduced || !sim || sim.phase === 'idle') { replay(); return; } auto = true; status(phaseText); });
  if ('IntersectionObserver' in window) new IntersectionObserver((en) => { heroVisible = en[0].isIntersecting; }).observe($('#mazePanel'));
  newMaze();
  if (reduced) { finishNow(); auto = false; status(phaseText); } else setInterval(tick, 34);

  /* ================= project detail ================= */
  let tabState = null;
  function renderProject(id) {
    const p = PBY[id]; if (!p) return;
    discover(id);
    $('#pdTitle').textContent = p.title; $('#pdKind').textContent = p.kind;
    $('#pdMain').innerHTML = p.overview.map((t) => '<p style="font-size:18px">' + esc(t) + '</p>').join('') +
      '<h2 style="font-size:28px;margin:30px 0 8px">What I did</h2>' + p.mine.map((m) => '<details><summary>' + esc(m[0]) + '</summary><p>' + esc(m[1]) + '</p></details>').join('');
    $('#pdFacts').innerHTML = p.facts.map((f) => '<div><dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd></div>').join('');
    const i = PROJECTS.indexOf(p), prev = PROJECTS[(i + N_PROJ - 1) % N_PROJ], next = PROJECTS[(i + 1) % N_PROJ];
    $('#pdNav').innerHTML = '<button class="btn" type="button" data-go="p:' + prev.id + '">Previous: ' + esc(prev.title) + '</button><button class="btn" type="button" data-go="p:' + next.id + '">Next: ' + esc(next.title) + '</button>';
    const tabs = TABS[id]; const tEl = $('#pdTabs'); tEl.innerHTML = '';
    tabs.forEach((t, n) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'btn small'; b.textContent = t.label; b.setAttribute('role', 'tab'); b.setAttribute('aria-pressed', String(n === 0));
      b.addEventListener('click', () => { $$('.btn', tEl).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); mountTab(t); });
      tEl.appendChild(b);
    });
    mountTab(tabs[0]);
  }
  function mountTab(t) { const s = $('#pdStage'); s.innerHTML = ''; if (tabState && tabState.stop) tabState.stop(); tabState = null; tabState = t.render(s) || null; }

  /* ---- shared mini builders ---- */
  const box = (label, sub, cls) => '<div class="st ' + (cls || '') + '"><b>' + esc(label) + '</b>' + (sub ? '<span>' + esc(sub) + '</span>' : '') + '</div>';
  const jn = '<div class="jn"></div>';

  /* FocusUp */
  function fuSetup(s) {
    const steps = [
      ['Open FocusUp', 'The app checks whether you are signed in.'], ['Sign in or create an account', 'Apple sign-in, or email and password. Returning players skip setup.'],
      ['Create your player', 'Choose a name and an avatar.'], ['Screen Time access', 'Allow it, or skip for now. Blocking apps needs approval.'],
      ['Notifications', 'Turn them on, or skip.'], ['Lock your first group', 'Pick apps and rules, or skip.'], ['Add your quests', 'At least one, with a priority and an optional deadline.'], ['Player reveal', 'You enter FocusUp and setup is marked complete.']
    ];
    let at = 0;
    s.innerHTML = '<p class="note" style="margin:0 0 14px">First launch, step by step. Press Next to walk through it.</p><div class="toolbar"><button class="btn small solid" id="fsNext" type="button">Next step</button><button class="btn small quiet" id="fsReset" type="button">Start over</button></div><div class="fl" id="fsList"></div><p class="note">If Screen Time is denied, you can continue without a group and turn the permission on later in iOS Settings.</p>';
    const list = $('#fsList', s);
    function draw() { list.innerHTML = steps.map((x, i) => (i ? jn : '') + box(x[0], x[1], i === at ? 'on' : '')).join(''); $('#fsNext', s).disabled = at >= steps.length - 1; }
    $('#fsNext', s).addEventListener('click', () => { at++; draw(); }); $('#fsReset', s).addEventListener('click', () => { at = 0; draw(); }); draw();
  }
  function fuMain(s) {
    const T = { Home: ['App groups, authorization, streak and log', 'Add or edit an app group, choose apps, pick Block or Limit and save the rule.'], Quests: ['Quest list and Canvas access', 'Create a quest with a title, priority and optional deadline, or import from Canvas.'], Player: ['Avatar, level, EXP, coins and cosmetics', 'Rename your player, equip companions and buy cosmetics.'], Friends: ['Requests, cheers and leaderboard', 'Add friends by username, accept or decline requests, and send a cheer.'] };
    let exp = 0;
    s.innerHTML = '<div class="toolbar" id="fmTabs"></div><div class="detail" style="margin-top:0;border:0;padding-top:0"><h4 id="fmH"></h4><p id="fmP"></p></div><div class="detail"><h4>Finish a quest</h4><p>See what each answer does.</p><div class="toolbar"><button class="btn small solid" data-q="done" type="button">Completed</button><button class="btn small" data-q="not" type="button">Not yet</button><button class="btn small" data-q="ab" type="button">Abandon a Canvas quest</button></div><p id="fmOut" aria-live="polite" style="font-weight:600"></p></div>';
    const tb = $('#fmTabs', s);
    Object.keys(T).forEach((k, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn small'; b.textContent = k; b.setAttribute('aria-pressed', String(i === 0)); b.addEventListener('click', () => pick(k)); tb.appendChild(b); });
    function pick(k) { $$('.btn', tb).forEach((b) => b.setAttribute('aria-pressed', String(b.textContent === k))); $('#fmH', s).textContent = k + ': ' + T[k][0]; $('#fmP', s).textContent = T[k][1]; }
    pick('Home');
    $$('[data-q]', s).forEach((b) => b.addEventListener('click', () => {
      const q = b.dataset.q;
      $('#fmOut', s).textContent = q === 'done' ? 'Saved. You earn EXP and coins, and your progress updates. (Example total: ' + (exp += 40) + ' EXP.)' : q === 'not' ? 'The quest stays pending.' : 'The quest stays open, you return to Home and any active shields are released.';
    }));
  }
  function fuConcept(s) {
    s.innerHTML = '<p class="note" style="margin:0 0 14px">Early concept screens, redrawn here. The real app has Home, Quests, Player and Friends tabs.</p><div class="phones"><div class="phone"><h5>Focus Session</h5><div class="big">25:00</div><div class="it">Study: Circuits</div><div class="go">Start</div></div><div class="phone"><h5>Today\'s plan</h5><div class="it">Calculus problem set<br>3:00 PM, 45 min</div><div class="it">Read: Digital Logic<br>5:00 PM, 30 min</div><div class="it">Lab report draft<br>7:30 PM, 60 min</div></div><div class="phone"><h5>This week</h5><div class="bars"><i style="height:40%"></i><i style="height:70%"></i><i style="height:55%"></i><i style="height:90%"></i><i style="height:35%"></i><i style="height:60%"></i><i style="height:20%"></i></div><div class="it">Total focus time<br><b>9 h 40 m</b></div></div></div>';
  }

  /* timePiece */
  function tpArch(s) {
    const D = {
      app: ['Android app', 'The frontend team built the screens: browse, favorite and sell watches. It talks to my backend over HTTP and one open socket.', 'GET the catalog, search it, save a favorite, create a listing.'],
      api: ['Backend (my part)', 'Spring Boot REST endpoints for the catalog, plus WebSocket endpoints that push live updates. Packaged as a JAR and deployed to the team VM.', '{"type":"price_update","watch":"Field Watch","price":170}\n{"type":"watch_sold","watch":"Pilot 40"}'],
      db: ['MariaDB', 'A shared schema for watches, users and listings, read and written through JPA. One catalog watch can have many listings.', 'catalog_watch 1 ---- * listing']
    };
    s.innerHTML = '<div class="arch"><button type="button" data-k="app" aria-pressed="false"><b>Android app</b><span>Frontend team</span></button><button type="button" data-k="api" aria-pressed="true"><b>Backend</b><span>My role</span></button><button type="button" data-k="db" aria-pressed="false"><b>MariaDB</b><span>Shared database</span></button></div><div class="detail" id="tpD"></div><p class="note">Message shapes are illustrative, not copied from the real server.</p>';
    function pick(k) { $$('.arch button', s).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === k))); $('#tpD', s).innerHTML = '<h4>' + D[k][0] + '</h4><p>' + esc(D[k][1]) + '</p><div class="code">' + esc(D[k][2]) + '</div>'; }
    $$('.arch button', s).forEach((b) => b.addEventListener('click', () => pick(b.dataset.k))); pick('api');
  }
  function tpFlow(s) {
    s.innerHTML = '<div class="fl">' + box('Sign in or sign up', 'Create an account or sign in') + jn + box('Catalog', 'Search plus a two-column watch grid') + jn +
      '<div class="br"><div><small>From the catalog</small>' + box('Profile', 'Your account') + '<div style="height:8px"></div>' + box('Favorites', 'Saved watches') + '<div style="height:8px"></div>' + box('Sell a watch', 'Find a catalog watch, set a price') + '<div style="height:8px"></div>' + box('Report', 'Report a user') + '</div><div><small>Roles</small>' + box('User', 'The default role') + '<div style="height:8px"></div>' + box('Admin', 'Add or edit catalog watches: name, price, picture') + '<div style="height:8px"></div>' + box('Moderator', 'Manage or delete accounts') + '</div></div></div><p class="note">A listing is separate from the catalog watch it is for. Watch detail popups and AR try-on were left for later.</p>';
  }
  function tpLive(s) {
    s.innerHTML = '<p>The live updates are the part I built that is easiest to feel. The simulator on the home page shows how a WebSocket push differs from asking again with HTTP.</p><p><button class="btn solid" type="button" id="tpGo">Open the WebSocket demo</button></p>';
    $('#tpGo', s).addEventListener('click', () => { go('learning'); pickSkill('websockets'); });
  }

  /* Jeopardy */
  function jeoDemo(s) {
    const CATS = ['Campus', 'Cyclones', 'STEM', 'Web'];
    const Q = [
      [['This tower\'s bells ring across central campus.', 'The Campanile'], ['Iowa State is in this city.', 'Ames'], ['Cardinal and this color make up the school colors.', 'Gold'], ['Iowa State was founded in this year.', '1858']],
      [['Cy, the mascot, is this kind of bird.', 'A cardinal'], ['Football is played at Jack Trice this.', 'Stadium'], ['Hilton Coliseum is nicknamed Hilton this.', 'Magic'], ['Iowa State plays in this conference.', 'The Big 12']],
      [['The digits 1 and 0 are called these.', 'Bits'], ['Eight bits make one of these.', 'A byte'], ['This search explores level by level, like my maze solver.', 'Breadth-first search'], ['This is the unit of electrical resistance.', 'The ohm']],
      [['The markup language for web pages.', 'HTML'], ['The language that styles pages.', 'CSS'], ['This data format uses curly braces and key-value pairs.', 'JSON'], ['This UI library builds pages from components.', 'React']]
    ];
    let score = [0, 0], turn = 0, used = {}, openQ = null;
    s.innerHTML = '<p class="note" style="margin:0 0 12px">A sample board with sample questions. The real game has its own 16.</p><div class="board" id="jb"></div><div class="scores" id="jsc"></div><div id="jq" class="detail" hidden aria-live="polite"></div>';
    const jb = $('#jb', s);
    function draw() {
      jb.innerHTML = '';
      CATS.forEach((c) => { const b = document.createElement('button'); b.className = 'cat'; b.textContent = c; b.tabIndex = -1; jb.appendChild(b); });
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        const k = c + ',' + r, b = document.createElement('button'); b.type = 'button'; b.textContent = used[k] ? '' : '$' + (r + 1) * 100; b.className = used[k] ? 'used' : ''; b.disabled = !!used[k];
        b.addEventListener('click', () => { openQ = { c, r }; showQ(); }); jb.appendChild(b);
      }
      $('#jsc', s).innerHTML = [0, 1].map((t) => '<div class="' + (turn === t ? 'cur' : '') + '">Team ' + (t + 1) + (turn === t ? ' (picking)' : '') + '<b>' + score[t] + '</b></div>').join('') + '<button class="btn small quiet" id="jrs" type="button">New game</button>';
      $('#jrs', s).addEventListener('click', () => { score = [0, 0]; turn = 0; used = {}; openQ = null; $('#jq', s).hidden = true; draw(); });
    }
    function showQ() {
      const q = Q[openQ.c][openQ.r], v = (openQ.r + 1) * 100, el = $('#jq', s); el.hidden = false;
      el.innerHTML = '<h4>' + esc(CATS[openQ.c]) + ' for $' + v + '</h4><p>' + esc(q[0]) + '</p><p id="jans" hidden style="font-weight:700">' + esc(q[1]) + '</p><div class="toolbar"><button class="btn small" id="jsh" type="button">Show answer</button><button class="btn small solid" data-r="1" type="button">Team ' + (turn + 1) + ' got it</button><button class="btn small" data-r="0" type="button">Missed</button></div>';
      $('#jsh', el).addEventListener('click', () => { $('#jans', el).hidden = false; });
      $$('[data-r]', el).forEach((b) => b.addEventListener('click', () => { if (b.dataset.r === '1') score[turn] += v; else score[turn] -= v; used[openQ.c + ',' + openQ.r] = 1; turn = 1 - turn; el.hidden = true; openQ = null; draw(); }));
    }
    draw();
  }

  /* Maze solver demo */
  function mazeDemo(s) {
    s.innerHTML = '<div class="toolbar" id="mdT"></div><div class="maze" id="mdG"></div><div class="mbar"><span class="grow" id="mdS">Pick a tool, then click or drag on the grid.</span><span>Cells searched <b id="mdV">0</b></span><span>Path length <b id="mdP">0</b></span></div>';
    const g = buildGrid($('#mdG', s)); let ds = 3 * C + 3, de = 12 * C + 20, tool = 'wall', down = false;
    const toolDefs = [['wall', 'Wall'], ['erase', 'Erase'], ['start', 'Start'], ['end', 'Finish']];
    const tb = $('#mdT', s);
    toolDefs.forEach((t) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn small'; b.textContent = t[1]; b.dataset.t = t[0]; b.setAttribute('aria-pressed', String(t[0] === 'wall')); b.addEventListener('click', () => { tool = t[0]; $$('[data-t]', tb).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); }); tb.appendChild(b); });
    [['Random walls', () => { for (let i = 0; i < N; i++) g.cells[i] = (i !== ds && i !== de && Math.random() < 0.25) ? 1 : 0; run(); }], ['Clear all', () => { g.cells.fill(0); run(); }]].forEach((a) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn small quiet'; b.textContent = a[0]; b.addEventListener('click', a[1]); tb.appendChild(b); });
    function run() {
      const w = new Uint8Array(N); for (let i = 0; i < N; i++) w[i] = g.cells[i] === 1 ? 1 : 0;
      const res = bfs(w, ds, de), seen = new Set(res.order), onp = new Set(res.path);
      for (let i = 0; i < N; i++) {
        let c = 'cell'; if (w[i]) c += ' wall'; else if (onp.has(i)) c += ' path'; else if (seen.has(i)) c += ' visited';
        if (i === ds) c += ' start'; if (i === de) c += ' end';
        g.els[i].className = c; g.els[i].textContent = i === ds ? 'S' : i === de ? 'F' : '';
      }
      $('#mdV', s).textContent = res.order.length; $('#mdP', s).textContent = res.path.length;
      $('#mdS', s).textContent = res.found ? 'Shortest path found: ' + (res.path.length - 1) + ' steps.' : 'No path. Remove a wall.';
    }
    function apply(i) {
      if (tool === 'start') { if (i !== de) { g.cells[i] = 0; ds = i; } } else if (tool === 'end') { if (i !== ds) { g.cells[i] = 0; de = i; } }
      else if (i !== ds && i !== de) g.cells[i] = tool === 'wall' ? 1 : 0;
      run();
    }
    const gr = $('#mdG', s);
    gr.addEventListener('pointerdown', (e) => { const b = e.target.closest('.cell'); if (!b) return; down = true; apply(+b.dataset.i); });
    gr.addEventListener('pointerover', (e) => { if (!down || tool === 'start' || tool === 'end') return; const b = e.target.closest('.cell'); if (b) apply(+b.dataset.i); });
    gr.addEventListener('click', (e) => { if (e.detail === 0) { const b = e.target.closest('.cell'); if (b) apply(+b.dataset.i); } });
    const up = () => { down = false; }; addEventListener('pointerup', up);
    for (let i = 0; i < N; i++) if ((i % C === 8 && Math.floor(i / C) < 11) || (i % C === 15 && Math.floor(i / C) > 4)) g.cells[i] = 1;
    run();
    return { stop() { removeEventListener('pointerup', up); } };
  }

  /* Tree cutter */
  function cutterDemo(s) {
    s.innerHTML = '<p class="note" style="margin:0 0 12px">Drag the slider to move an obstacle in front of the robot. The thresholds are examples for illustration, not my robot\'s real numbers.</p><label class="field" for="tcD" style="max-width:360px">Distance to obstacle: <span id="tcV">80</span> cm<input id="tcD" type="range" min="5" max="120" value="80"></label><div class="sweep" style="margin-top:12px"><svg viewBox="0 0 300 190" role="img" aria-label="Robot facing an obstacle"><line class="bgline" x1="20" y1="170" x2="280" y2="170"/><rect x="130" y="150" width="40" height="22" rx="3" fill="var(--red)"/><line class="beam" id="tcB" x1="150" y1="150" x2="150" y2="60"/><rect class="obs" id="tcO" x="135" y="50" width="30" height="12"/><text x="22" y="186">robot</text></svg></div><div class="detail"><h4 id="tcH"></h4><p id="tcP"></p></div>';
    const d = $('#tcD', s);
    function upd() {
      const v = +d.value; $('#tcV', s).textContent = v;
      const y = 150 - v * 1.05; $('#tcB', s).setAttribute('y2', y + 12); $('#tcO', s).setAttribute('y', y);
      const h = v > 60 ? ['Drive forward', 'Nothing close. Keep moving at full speed.'] : v > 25 ? ['Slow down and line up', 'Something is ahead. Reduce speed and adjust the heading.'] : ['Stop and turn', 'Too close. Stop, then turn away before moving again.'];
      $('#tcH', s).textContent = h[0]; $('#tcP', s).textContent = h[1];
    }
    d.addEventListener('input', upd); upd();
  }

  /* React cards */
  function cardsDemo(s) {
    const POOL = [['Maria Lopez', 82000, 'Single', '12 Elm St, Ames'], ['Devon Clark', 64500, 'Married', '88 Oak Ave, Des Moines'], ['Priya Nair', 91000, 'Single', '4 Lake Rd, Council Bluffs'], ['Tom Becker', 57000, 'Divorced', '210 Main St, Omaha']];
    let n = 2;
    s.innerHTML = '<div class="two"><div><div class="toolbar"><button class="btn small solid" id="rcAdd" type="button">Add a user</button><button class="btn small quiet" id="rcRm" type="button">Remove one</button></div><div id="rcL" style="display:grid;gap:10px"></div></div><div><div class="code" id="rcC"></div><p class="note">One UserCard function. The array decides how many cards exist.</p></div></div>';
    function draw() {
      $('#rcL', s).innerHTML = POOL.slice(0, n).map((u) => '<div class="ucard"><div class="av">' + u[0][0] + '</div><div><strong>' + esc(u[0]) + '</strong><p>Salary: $' + u[1].toLocaleString('en-US') + '</p><p>Marital status: ' + u[2] + '</p><p>' + esc(u[3]) + '</p></div></div>').join('');
      $('#rcC', s).textContent = 'const users = [\n' + POOL.slice(0, n).map((u) => '  { name: "' + u[0] + '", salary: ' + u[1] + ',\n    marital: "' + u[2] + '", address: "' + u[3] + '" }').join(',\n') + '\n];\n\n{users.map(u => <UserCard key={u.name} {...u} />)}';
      $('#rcAdd', s).disabled = n >= POOL.length; $('#rcRm', s).disabled = n <= 1;
    }
    $('#rcAdd', s).addEventListener('click', () => { n++; draw(); }); $('#rcRm', s).addEventListener('click', () => { n--; draw(); }); draw();
  }

  /* Robot GUI */
  function robotDemo(s) {
    s.innerHTML = '<p class="note" style="margin:0 0 12px">Simulated readings. The real tool plots live sensor data from the robot.</p><div class="toolbar"><button class="btn small solid" id="rgS" type="button">Run a sweep</button><button class="btn small" id="rgM" type="button" aria-pressed="false">Autonomous mode</button><button class="btn small quiet" data-c="Turn left" type="button">Left</button><button class="btn small quiet" data-c="Forward" type="button">Forward</button><button class="btn small quiet" data-c="Turn right" type="button">Right</button></div><div class="sweep"><svg viewBox="0 0 240 130" id="rgSvg" role="img" aria-label="Polar plot of sensor readings"><path class="bgline" d="M20 120 A100 100 0 0 1 220 120 Z"/><path class="bgline" d="M70 120 A50 50 0 0 1 170 120"/><line class="bgline" x1="120" y1="120" x2="120" y2="20"/><g id="rgD"></g><text x="14" y="128">0</text><text x="218" y="128">180</text></svg></div><div class="detail"><h4 id="rgH">Idle</h4><p id="rgP">Run a sweep to read the surroundings.</p></div>';
    let auto2 = false, pts = [];
    function sweep() {
      pts = []; const k = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < k; i++) pts.push({ a: 10 + Math.random() * 160, d: 20 + Math.random() * 80 });
      $('#rgD', s).innerHTML = pts.map((p) => { const r = p.a * Math.PI / 180, x = 120 - Math.cos(r) * p.d, y = 120 - Math.sin(r) * p.d; return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="4" fill="var(--red)"/>'; }).join('');
      const near = pts.slice().sort((a, b) => a.d - b.d)[0];
      if (auto2) { $('#rgH', s).textContent = 'Autonomous'; $('#rgP', s).textContent = 'Closest object: ' + near.d.toFixed(0) + ' cm at ' + near.a.toFixed(0) + ' degrees. ' + (near.d < 40 ? (near.a < 90 ? 'Turning left, away from it.' : 'Turning right, away from it.') : 'Path is clear. Driving forward.'); }
      else { $('#rgH', s).textContent = 'Manual'; $('#rgP', s).textContent = pts.length + ' objects found. Closest is ' + near.d.toFixed(0) + ' cm away. You choose the move.'; }
    }
    $('#rgS', s).addEventListener('click', sweep);
    $('#rgM', s).addEventListener('click', (e) => { auto2 = !auto2; e.currentTarget.setAttribute('aria-pressed', String(auto2)); e.currentTarget.textContent = auto2 ? 'Autonomous mode: on' : 'Autonomous mode'; if (pts.length) sweep(); });
    $$('[data-c]', s).forEach((b) => b.addEventListener('click', () => { if (auto2) { $('#rgH', s).textContent = 'Ignored'; $('#rgP', s).textContent = 'Autonomous mode is on. Turn it off to drive by hand.'; } else { $('#rgH', s).textContent = 'Sent: ' + b.dataset.c; $('#rgP', s).textContent = 'The command goes to the robot over the control interface.'; } }));
    sweep();
  }

  const TABS = {
    'focusup': [{ label: 'Setup flow', render: fuSetup }, { label: 'Everyday screens', render: fuMain }, { label: 'Concept screens', render: fuConcept }],
    'timepiece': [{ label: 'Architecture', render: tpArch }, { label: 'Screens and roles', render: tpFlow }, { label: 'Live updates', render: tpLive }],
    'jeopardy': [{ label: 'Play a sample board', render: jeoDemo }],
    'maze-solver': [{ label: 'Live demo', render: mazeDemo }],
    'tree-cutter': [{ label: 'Sensor decisions', render: cutterDemo }],
    'react-cards': [{ label: 'Cards from data', render: cardsDemo }],
    'robot-gui': [{ label: 'Polar plot', render: robotDemo }]
  };

  /* ================= learning ================= */
  const SKILLS = {
    react: { name: 'React', status: 'Currently learning', desc: 'I am learning React with Vite in Iowa State\'s COM S 3190 web development class, starting with reusable components and props.', ex: 'In Activity 09, App.jsx passes a picture, name, salary, marital status and address into reusable UserCard components built with React-Bootstrap.', go: 'p:react-cards', link: '#project-react-cards', text: 'Open the React project' },
    websockets: { name: 'WebSockets', status: 'Learning and using it in COM S 3090', desc: 'One connection stays open between the Android app and the backend, so the server can send an update the moment something changes instead of waiting for the app to ask.', ex: 'On timePiece, my endpoints push live price updates and sold-watch notifications. The demo is a simulation with example watches, not the real server.', go: 'p:timepiece', link: '#project-timepiece', text: 'Open timePiece' }
  };
  function pickSkill(id) {
    const k = SKILLS[id];
    $$('[data-skill]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.skill === id)));
    $('#dStatus').textContent = k.status; $('#dName').textContent = k.name; $('#dDesc').textContent = k.desc; $('#dEx').textContent = k.ex;
    const l = $('#dLink'); l.dataset.go = k.go; l.setAttribute('href', k.link); l.textContent = k.text;
    $('#demoReact').hidden = id !== 'react'; $('#demoWs').hidden = id !== 'websockets';
    $('#relReact').className = id === 'react' ? 'on' : 'off'; $('#relWs').className = id === 'websockets' ? 'on' : 'off';
  }
  $$('[data-skill]').forEach((b) => b.addEventListener('click', () => pickSkill(b.dataset.skill)));
  pickSkill('react');

  function drawCard() {
    const name = $('#rName').value || 'Name', sal = Number($('#rSalary').value) || 0, mar = $('#rMarital').value, adr = $('#rAddress').value || 'Address';
    $('#rAvatar').textContent = name.trim().charAt(0).toUpperCase() || '?';
    $('#uName').textContent = name; $('#uSalary').textContent = 'Salary: $' + sal.toLocaleString('en-US'); $('#uMarital').textContent = 'Marital status: ' + mar; $('#uAddress').textContent = adr;
    $('#rCode').textContent = '<UserCard\n  name="' + name + '"\n  salary={' + sal + '}\n  marital="' + mar + '"\n  address="' + adr + '" />';
  }
  ['#rName', '#rSalary', '#rMarital', '#rAddress'].forEach((q) => $(q).addEventListener('input', drawCard)); drawCard();

  const START = [{ n: 'Field Watch', p: 180, sold: false }, { n: 'Pilot 40', p: 240, sold: false }, { n: 'Diver 300', p: 320, sold: false }];
  let ws = { open: false, srv: [], app: [], log: [], pi: 0 }, lastNew = '';
  const copyList = (a) => a.map((w) => ({ n: w.n, p: w.p, sold: w.sold }));
  const wsPush = (arr) => { ws.log = arr.concat(ws.log).slice(0, 7); };
  function wsPulse() { const l = $('#wsLink'); l.classList.remove('send'); void l.offsetWidth; if (!reduced) l.classList.add('send'); }
  function wsList(el, arr, hot) { el.innerHTML = ''; arr.forEach((w) => { const li = document.createElement('li'); li.textContent = w.n + ': ' + (w.sold ? 'SOLD' : '$' + w.p); if (hot === w.n && !reduced) li.className = 'new'; el.appendChild(li); }); }
  const openW = () => ws.srv.filter((w) => !w.sold);
  function renderWs() {
    wsList($('#appList'), ws.app, lastNew); wsList($('#srvList'), ws.srv, '');
    $('#wsState').textContent = ws.open ? 'open' : 'closed'; $('#wsLink').classList.toggle('open', ws.open);
    $('#wsConn').textContent = ws.open ? 'Close connection' : 'Open connection';
    const left = openW().length; $('#wsAdd').disabled = left === 0; $('#wsSell').disabled = left <= 1;
    const lg = $('#wsLog'); lg.innerHTML = '';
    if (!ws.log.length) { const d = document.createElement('div'); d.textContent = 'Message log. Open the connection to start.'; lg.appendChild(d); }
    ws.log.forEach((m) => { const d = document.createElement('div'); d.textContent = m; lg.appendChild(d); });
  }
  function wsReset() { ws = { open: false, srv: copyList(START), app: copyList(START), log: [], pi: 0 }; lastNew = ''; renderWs(); }
  $('#wsConn').addEventListener('click', () => {
    lastNew = '';
    if (!ws.open) { ws.open = true; wsPulse(); ws.app = copyList(ws.srv); wsPush(['server to app: connected, staying open', 'app to server: open connection']); }
    else { ws.open = false; wsPush(['connection closed. The server can no longer push to the app.']); }
    renderWs();
  });
  $('#wsAdd').addEventListener('click', () => {
    const o = openW(); if (!o.length) return;
    const w = o[ws.pi++ % o.length]; w.p = Math.max(10, w.p - 10); lastNew = '';
    if (ws.open) { const a = ws.app.filter((x) => x.n === w.n)[0]; if (a) a.p = w.p; lastNew = w.n; wsPulse(); wsPush(['server to app: price_update "' + w.n + '" $' + w.p, 'server: price of "' + w.n + '" changed']); }
    else wsPush(['server: price of "' + w.n + '" changed to $' + w.p + '. The app was not told, so it still shows the old price.']);
    renderWs();
  });
  $('#wsSell').addEventListener('click', () => {
    const o = openW(); if (o.length <= 1) return;
    const w = o[o.length - 1]; w.sold = true; lastNew = '';
    if (ws.open) { const a = ws.app.filter((x) => x.n === w.n)[0]; if (a) a.sold = true; lastNew = w.n; wsPulse(); wsPush(['server to app: watch_sold "' + w.n + '"', 'server: "' + w.n + '" sold']); }
    else wsPush(['server: "' + w.n + '" sold. The app was not told, so it still shows it for sale.']);
    renderWs();
  });
  $('#wsRefresh').addEventListener('click', () => { ws.app = copyList(ws.srv); lastNew = ''; wsPulse(); wsPush(['server to app: 200 OK, ' + ws.srv.length + ' watches', 'app to server: GET /watches (the app had to ask)']); renderWs(); });
  $('#wsReset').addEventListener('click', wsReset); wsReset();

  /* ================= resume, contact ================= */
  const resDlg = $('#res');
  const RES = { software: { note: 'Software resume. Projects: TimePiece, focusUp and ISU Feud.', img: '#resImgSoftware' }, embedded: { note: 'Embedded resume. Projects: Autonomous Tree Cutter, focusUp and Robot Sensor Visualizer & Control Interface.', img: '#resImgEmbedded' } };
  function showResume(k) { Object.keys(RES).forEach((x) => { $(RES[x].img).hidden = x !== k; }); $$('.rtab').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.rtab === k))); $('#resNote').textContent = RES[k].note; $('.rscroll', resDlg).scrollTop = 0; }
  function openResume(k) { showResume(k || 'software'); if (!resDlg.open) resDlg.showModal(); }
  $$('[data-resume]').forEach((b) => b.addEventListener('click', () => openResume(b.dataset.resume)));
  $$('.rtab').forEach((b) => b.addEventListener('click', () => showResume(b.dataset.rtab)));
  $('#resClose').addEventListener('click', () => resDlg.close());
  resDlg.addEventListener('click', (e) => { if (e.target === resDlg) resDlg.close(); });
  $('#copyMail').addEventListener('click', () => {
    const done = () => toast('Email address copied');
    const fail = () => { const r = document.createRange(); r.selectNodeContents($('.mail')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); toast('Press Ctrl+C to copy the selected address'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText('grayscott07@outlook.com').then(done, fail); else fail();
  });

  /* ================= palette ================= */
  const pal = $('#pal'), palQ = $('#palQ'), palList = $('#palList'); let palActive = 0, palItems = [];
  const ITEMS = [
    { g: 'Pages', ic: 'H', label: 'Home', hint: '', k: 'home maze', run: () => go('home') },
    { g: 'Pages', ic: 'P', label: 'Projects', hint: '', k: 'projects work', run: () => go('projects') },
    { g: 'Pages', ic: 'L', label: 'What I\'m learning', hint: 'Home', k: 'learning react websockets', run: () => go('learning') },
    { g: 'Pages', ic: 'W', label: 'Work experience', hint: '', k: 'jobs menards mowing', run: () => go('work') },
    { g: 'Pages', ic: 'A', label: 'About me', hint: '', k: 'about bio guatemala', run: () => go('about') },
    { g: 'Pages', ic: 'C', label: 'Contact', hint: '', k: 'email phone', run: () => go('contact') }
  ];
  const KEYS = { focusup: 'swiftui iphone ios quests screen time supabase canvas', timepiece: 'java spring boot mariadb jpa android watches websockets rest', jeopardy: 'json game javascript trivia', 'maze-solver': 'bfs algorithm demo search', 'tree-cutter': 'robot c hardware cpre 288 arm uart', 'react-cards': 'react props vite', 'robot-gui': 'python matplotlib tkinter polar sensor' };
  PROJECTS.forEach((p) => ITEMS.push({ g: 'Projects', ic: p.title[0], label: p.title, hint: p.kind.split(',')[0], k: KEYS[p.id], run: () => go('p:' + p.id) }));
  ITEMS.push(
    { g: 'Actions', ic: 'S', label: 'View software resume', hint: '', k: 'resume cv software', run: () => openResume('software') },
    { g: 'Actions', ic: 'E', label: 'View embedded resume', hint: '', k: 'resume cv embedded firmware', run: () => openResume('embedded') },
    { g: 'Actions', ic: 'N', label: 'New maze on the home page', hint: '', k: 'shuffle replay', run: () => { go('home'); replay(); } },
    { g: 'Actions', ic: '@', label: 'Copy email address', hint: '', k: 'email mail', run: () => $('#copyMail').click() },
    { g: 'Actions', ic: 'G', label: 'Open GitHub profile', hint: 'github.com', k: 'github code', href: 'https://github.com/Scotty-08' }
  );
  const palFilter = () => { const q = palQ.value.trim().toLowerCase(); return ITEMS.filter((it) => !q || (it.label + ' ' + it.k + ' ' + it.g).toLowerCase().indexOf(q) !== -1); };
  function palRender() {
    palItems = palFilter(); if (palActive >= palItems.length) palActive = Math.max(0, palItems.length - 1);
    palList.innerHTML = '';
    if (!palItems.length) { const e = document.createElement('div'); e.className = 'empty'; e.textContent = 'No matches. Try "maze", "robot" or "contact".'; palList.appendChild(e); return; }
    let last = '';
    palItems.forEach((it, i) => {
      if (it.g !== last) { const h = document.createElement('div'); h.className = 'gh'; h.textContent = it.g; palList.appendChild(h); last = it.g; }
      const b = document.createElement('button'); b.type = 'button'; b.id = 'pi' + i; b.className = 'row' + (i === palActive ? ' on' : ''); b.setAttribute('role', 'option'); b.setAttribute('aria-selected', String(i === palActive));
      b.innerHTML = '<span class="ic"></span><span class="lb"></span><span class="hint"></span>';
      $('.ic', b).textContent = it.ic; $('.lb', b).textContent = it.label; $('.hint', b).textContent = it.hint;
      b.addEventListener('mouseenter', () => palSet(i, false)); b.addEventListener('click', () => palRun(it)); palList.appendChild(b);
    });
    palQ.setAttribute('aria-activedescendant', 'pi' + palActive);
  }
  function palSet(i, sc) { const rows = $$('.row', palList); if (!rows.length) return; rows.forEach((r, n) => { r.classList.toggle('on', n === i); r.setAttribute('aria-selected', String(n === i)); }); palActive = i; palQ.setAttribute('aria-activedescendant', 'pi' + i); if (sc) rows[i].scrollIntoView({ block: 'nearest' }); }
  function palRun(it) {
    pal.close();
    if (it.href) { const a = document.createElement('a'); a.href = it.href; a.target = '_blank'; a.rel = 'noopener noreferrer'; document.body.appendChild(a); a.click(); a.remove(); } else if (it.run) it.run();
  }
  function palOpen() { palQ.value = ''; palActive = 0; palRender(); if (!pal.open) pal.showModal(); palQ.focus(); }
  $('#openPal').addEventListener('click', palOpen);
  palQ.addEventListener('input', () => { palActive = 0; palRender(); });
  palQ.addEventListener('keydown', (e) => {
    const n = palItems.length;
    if (e.key === 'ArrowDown' && n) { e.preventDefault(); palSet((palActive + 1) % n, true); }
    else if (e.key === 'ArrowUp' && n) { e.preventDefault(); palSet((palActive + n - 1) % n, true); }
    else if (e.key === 'Enter' && n) { e.preventDefault(); palRun(palItems[palActive]); }
  });
  pal.addEventListener('click', (e) => { if (e.target === pal) pal.close(); });
  addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || '');
    if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); if (pal.open) pal.close(); else palOpen(); }
    else if (e.key === '/' && !typing && !pal.open) { e.preventDefault(); palOpen(); }
  });

  go(tokenFromHash(), true);
})();
