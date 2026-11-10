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
    { id: 'timepiece', cat: 'android', title: 'timePiece', kind: 'Java backend, Android app', desc: 'A team Android app for browsing, favoriting and selling watches. I built the catalog backend and the WebSocket endpoints for live updates.', tags: ['Spring Boot', 'MariaDB / JPA', 'REST', 'WebSockets'],
      facts: [['Role', 'Backend developer'], ['Course', 'COM S 3090'], ['Stack', 'Spring Boot, MariaDB, JPA'], ['Live updates', 'WebSocket endpoints'], ['Process', 'SCRUM sprints, Figma, Git']],
      overview: ['timePiece is an Android app where people browse a watch catalog, save favorites and list their own watches for sale. A frontend teammate built the screens and I owned the backend.', 'My part was the catalog REST endpoints, the MariaDB model behind them, and WebSocket endpoints that push live price updates and sold-watch notifications to the app.'],
      mine: [['Catalog endpoints', 'Spring Boot REST endpoints for browsing and searching the catalog, deployed as a backend JAR on our team VM.'], ['Selling model', 'One catalog watch can have many individual listings, so a listing is its own record, separate from the catalog entry.'], ['Live updates', 'A WebSocket connection stays open so the server can send a price change or a "sold" notice the moment it happens.'], ['Teamwork', 'We ran SCRUM sprints and kept the catalog backend in step with the frontend developer building the catalog screen.']] },
    { id: 'courseflow', cat: 'web', title: 'CourseFlow', kind: 'Web app, React', desc: 'A planner for Iowa State CPR E students. Add courses to a cart, place them in semesters, check prerequisites and see what each semester costs.', tags: ['React', 'Vite', 'JavaScript', 'GitHub Pages'],
      facts: [['Live site', 'scotty-08.github.io/CourseFlow', 'https://scotty-08.github.io/CourseFlow/'], ['Source code', 'Scotty-08/CourseFlow on GitHub', 'https://github.com/Scotty-08/CourseFlow'], ['Role', 'Solo project'], ['Built with', 'React, Vite, JavaScript'], ['Hosting', 'GitHub Pages, deployed by GitHub Actions'], ['Payments', 'Demo checkout only, no real charges']],
      overview: ['CourseFlow is a place for CPR E students to plan the semesters ahead. Add courses to a cart, move them into a semester, and see what that semester will cost before you pay.', 'It started as a class web app and grew into a full planner. Prerequisites show up as warnings, a suggested plan fills the semesters for you, and a small assistant answers questions about your plan.'],
      mine: [['Cart and semester planner', 'Courses go into a cart, then into a semester with a year. One reducer holds the cart and the plan, so every page stays in step.'], ['Pricing rule', 'Each credit costs $399 and a semester over 12 credits is capped at $8,000. The numbers live in one config file and the pricing logic has unit tests.'], ['Advisory prerequisites', 'The planner warns when a course is placed before something it needs, but it never blocks you.'], ['Suggested plan', 'A generator fills semesters aiming for about 15 credits each and never goes past 17.'], ['Checkout and receipt', 'Each semester has a demo checkout and a receipt. No real payments are taken.'], ['Rule-based assistant', 'A small helper answers plan questions by matching keywords. It is not an AI model, and the page says so.'], ['Tests and deploy', 'Unit tests run on the logic, and GitHub Actions tests, builds and publishes the site to GitHub Pages on every push.']] },
    { id: 'jeopardy', cat: 'web', title: 'ISU Jeopardy', kind: 'COM S 3190, web game', desc: 'An Iowa State game with four categories, 16 questions and score tracking for two teams. It grew into a JSON-driven hub.', tags: ['JavaScript', 'JSON', 'localStorage'],
      facts: [['Role', 'Developer'], ['Course', 'COM S 3190'], ['Stack', 'HTML, CSS, JavaScript, JSON'], ['Saved data', 'Top 10 leaderboard in localStorage']],
      overview: ['A Jeopardy-style board for Iowa State trivia. Two teams take turns picking a category and a dollar value, and the score tracks as they play.', 'The game began as one board. I later moved the questions into JSON so a hub page could load different games by fetching their data and rendering it, and I kept a top 10 leaderboard in the browser.'],
      mine: [['Game logic', 'Turn order, scoring and which tiles are used are tracked in plain JavaScript objects.'], ['JSON-driven hub', 'The hub page fetches JSON and renders the available games and boards from it, so adding a game means adding data.'], ['Leaderboard', 'The top 10 scores are saved in localStorage and survive a page reload.']] },
    { id: 'maze-solver', cat: 'web', title: 'Maze Solver Visualizer', kind: 'HTML, CSS and JavaScript', desc: 'Build a maze, place the start and finish, and watch breadth-first search find the shortest route.', tags: ['Algorithms', 'BFS', 'Click events'],
      facts: [['Live site', 'Open the visualizer', 'maze-solver-visualizer/'], ['Role', 'Solo project'], ['Grid', '16 rows by 24 columns'], ['Algorithm', 'Breadth-first search'], ['Stack', 'HTML, CSS, JavaScript']],
      overview: ['A grid you can edit with the mouse. Draw walls, move the start and finish, and the solver shows every cell it searched and the shortest path it found.', 'Breadth-first search explores outward one step at a time, so the first time it reaches the finish is guaranteed to be the shortest route. The home page maze uses the same idea.'],
      mine: [['Search', 'A queue holds the next cells to visit, and each cell remembers where it came from so the path can be traced back.'], ['Editing', 'Click and drag paint walls. Dragging the start or finish changes the route straight away.'], ['Stats', 'The page counts cells searched and path length so you can see what a wall costs.']] },
    { id: 'tree-cutter', cat: 'hardware', title: 'Autonomous Tree Cutter', kind: 'CPRE 288, embedded C', desc: 'A team robot where I configured sensors at the register level on an ARM Cortex-M4, wrote the C control logic and tested over UART.', tags: ['C', 'ARM Cortex-M4', 'UART', 'Sensors'],
      facts: [['Role', 'Control logic and testing'], ['Course', 'CPRE 288'], ['Chip', 'ARM Cortex-M4'], ['Language', 'C'], ['Debugging', 'UART output']],
      overview: ['A robot built by a small team to find and cut trees on its own. My work was in the code that reads the sensors and decides what the robot does next.', 'I set up the sensors by writing to their registers directly, wrote the C control logic, and used UART to print what the robot saw while it ran, then fixed what the hardware really did.'],
      mine: [['Register-level setup', 'Sensors are configured by setting bits in the Cortex-M4 peripheral registers, so you have to read the datasheet closely.'], ['Control logic', 'C code turns sensor readings into movement decisions.'], ['Testing', 'UART prints made it possible to compare what I expected with what the robot reported.']] },
    { id: 'react-cards', cat: 'web', title: 'React User Cards', kind: 'COM S 3190, currently learning', desc: 'Activity 09 uses React, Vite and React-Bootstrap to show reusable cards with information passed in as props.', tags: ['React', 'Vite', 'Props', 'React-Bootstrap'],
      facts: [['Course', 'COM S 3190'], ['Tools', 'React, Vite, React-Bootstrap'], ['Idea', 'One component, many cards']],
      overview: ['In Activity 09, App.jsx passes a picture, name, salary, marital status and address into a reusable UserCard component built with React-Bootstrap.', 'It is a small project, and it is where React clicked for me: write the card once, describe each person as data, and let React draw the rest.'],
      mine: [['Components', 'UserCard is one function that returns the markup for a single person.'], ['Props', 'App.jsx holds an array of users and passes each one down as props.'], ['Bootstrap', 'React-Bootstrap supplies the card layout so I could focus on the data flow.']] },
    { id: 'react-cart', cat: 'web', title: 'React Shopping Cart', kind: 'Class activity, React', desc: 'A small store in React and Bootstrap. Add and remove products, and the cart groups repeats with a quantity and keeps a running total.', tags: ['React', 'useState', 'useEffect', 'Bootstrap', 'JSON'],
      facts: [['Tools', 'React, Vite, Bootstrap'], ['Data', '20 products from a JSON file'], ['Hooks', 'useState and useEffect'], ['Source code', 'Scotty-08/Shopping-Cart on GitHub', 'https://github.com/Scotty-08/Shopping-Cart']],
      overview: ['A class activity where I built a store in React. Twenty products load from a JSON file, and each one has a plus and a minus button.', 'The cart groups repeated items into one line with a quantity, shows how many of each item is in the cart, and updates the order total whenever the cart changes. I started with a plain list and then rebuilt the layout with Bootstrap.'],
      mine: [['State with useState', 'The cart is one array in state. Adding an item copies the array and appends it, so React sees a new value and redraws.'], ['Total with useEffect', 'An effect runs whenever the cart changes and adds up the prices into the order total.'], ['Grouping with reduce', 'reduce turns the flat cart into one entry per product with a quantity, so two jackets show as one line, times 2.'], ['Removing one copy', 'The minus button finds the first matching item and splices out a single copy, so the rest stay in the cart.'], ['Two versions', 'shopping.jsx is the first plain version. ShoppingBootstrap.jsx is the finished store layout.']] },
    { id: 'robot-gui', cat: 'hardware', title: 'Robot Sensor Visualizer', kind: 'Python, embedded resume project', desc: 'A live Python GUI for a robot: a 180 degree polar plot of what the sensors see, with a switch between autonomous and manual control.', tags: ['Python', 'Matplotlib', 'Tkinter'],
      facts: [['Language', 'Python'], ['Plot', 'Matplotlib polar, 180 degrees'], ['Interface', 'Tkinter'], ['Modes', 'Autonomous and manual']],
      overview: ['A desktop tool that shows a robot\'s sensor sweep as a live polar plot, so you can see obstacles around it as the data arrives.', 'A Tkinter switch changes the robot between autonomous driving and manual control from the same window.'],
      mine: [['Live plot', 'Matplotlib redraws the 180 degree sweep as new readings come in.'], ['Control interface', 'Tkinter buttons send manual commands, and a switch hands control back to the robot.']] }
  ];
  const PBY = {}; PROJECTS.forEach((p) => { PBY[p.id] = p; });
  const FILTERS = [['all', 'All'], ['mobile', 'iOS'], ['android', 'Android'], ['web', 'Web'], ['hardware', 'Hardware']];
  const N_PROJ = PROJECTS.length;

  function phoneShow(slides, w, h, bare) {
    const n = slides.length, slot = 2.8, dur = (n * slot).toFixed(1) + 's';
    const sty = (i) => ' style="animation-duration:' + dur + ';animation-delay:' + (i * slot).toFixed(1) + 's"';
    return '<div class="pv pv' + n + '"><div class="pvphone' + (bare ? ' bare' : '') + '" style="aspect-ratio:' + w + '/' + h + '">' +
      slides.map((x, i) => '<img src="assets/' + x[0] + '.webp" width="' + w + '" height="' + h + '" alt="' + esc(x[2]) + '"' + sty(i) + '>').join('') +
      '</div><div class="pvcap" aria-hidden="true">' + slides.map((x, i) => '<span' + sty(i) + '>' + esc(x[1]) + '</span>').join('') + '</div></div>';
  }
  const miniBar = '<div class="pkbar"><i></i><i></i><i></i><span>localhost:5173</span></div>';
  function miniCards() {
    const U = [['Maria Lopez', '82,000', 'Single', 'Ames', 'squidward'], ['Devon Clark', '64,500', 'Married', 'Des Moines', 'success'], ['Priya Nair', '91,000', 'Single', 'Omaha', 'chain']];
    return '<div class="minibox"><div class="mini">' + miniBar + '<div class="mview mcards">' + U.map((u, i) =>
      '<div class="mc" style="animation-delay:' + (i * 0.4).toFixed(1) + 's"><img class="mpic" src="assets/card-' + u[4] + '.webp" width="360" height="288" alt=""><div class="mtx"><b>' + esc(u[0]) + '</b><span>$' + u[1] + '</span><span>' + u[2] + '</span><span>' + esc(u[3]) + '</span></div></div>').join('') +
      '</div></div><div class="mcap">One UserCard, passed props for each person</div></div>';
  }
  function miniCart() {
    const px = (id, f) => 'https://images.pexels.com/photos/' + id + '/pexels-photo-' + id + '.jpeg?auto=compress&cs=tinysrgb&w=96';
    const R = [['Long sleeve Jacket', 'women', '$150', px(2584269), '<em class="pkj0">0</em><em class="pkj1">1</em>', 'pktapb'], ['Jacket with wollen hat', 'women', '$65', px(2681751), '<em class="pkz">0</em>', ''], ['Compact fashion t-shirt', 'women', '$55.99', px(2752045), '<em class="pkz">0</em>', ''], ['Blue jins', 'women', '$50', px(1485031), '<em class="pkt0">0</em><em class="pkq1">1</em><em class="pkq2">2</em>', 'pktapa']];
    return '<div class="minibox"><div class="mini">' + miniBar + '<div class="mview mshop"><div class="mlist">' + R.map((r) =>
      '<div class="pkrow"><img class="pkt" src="' + r[3] + '" alt="" width="48" height="48"><span class="pkx"><b>' + r[0] + '</b><small>' + r[1] + '</small></span><span class="pkctl"><span class="pkbtn">-</span><span class="pkn">' + r[4] + '</span><span class="pkbtn ' + r[5] + '">+</span></span><span class="pkpr">' + r[2] + '</span></div>').join('') +
      '</div><div class="mcart"><h5>Items in cart</h5><p class="pkmut">Products selected <span class="pksl"><em class="pkt0">0</em><em class="pkt1">1</em><em class="pkt2">2</em><em class="pkt3">3</em></span></p><div class="pkcl pkcl0">Nothing here yet</div>' +
      '<div class="pkcl pkcl1"><img class="pkt" src="' + px(1485031) + '" alt="" width="40" height="40"><span class="pkx"><b>Blue jins</b><small>$50 x <span class="pkqw"><em class="pkq1">1</em><em class="pkq2">2</em></span></small></span></div>' +
      '<div class="pkcl pkcl2"><img class="pkt" src="' + px(2584269) + '" alt="" width="40" height="40"><span class="pkx"><b>Long sleeve Jacket</b><small>$150 x 1</small></span></div>' +
      '<div class="pktot">Order total <span class="pktv"><em class="pkt0">$0</em><em class="pkt1">$50</em><em class="pkt2">$200</em><em class="pkt3">$250</em></span></div></div></div></div>' +
      '<div class="mcap">Repeats group with a quantity, total updates</div></div>';
  }
  const PEEK = {
    'focusup': phoneShow([['focusup-concept-lock', 'Apps stay locked', 'FocusUp lock screen concept'], ['focusup-concept-quests', 'Every task is a quest', 'FocusUp quest list concept']], 444, 864, true),
    'timepiece': phoneShow([['timepiece-home', 'Home', 'timePiece home screen'], ['timepiece-catalog', 'Browse the catalog', 'timePiece watch catalog'], ['timepiece-details', 'Compare prices by condition', 'timePiece watch details']], 648, 1436),
    'courseflow': '<div class="minibox"><div class="mini"><div class="pkbar"><i></i><i></i><i></i><span>scotty-08.github.io/CourseFlow</span></div><div class="cfview"><img src="assets/courseflow-planner.webp" width="1200" height="806" alt="CourseFlow semester planner"></div></div></div>',
    'jeopardy': '<div class="pa-board">' + Array.from({ length: 16 }, (_, i) => '<i style="animation-delay:' + (i * 0.19).toFixed(2) + 's">$' + (100 * (1 + (i >> 2))) + '</i>').join('') + '</div>',
    'maze-solver': (function () {
      const L = ['SppwEEEEwEEE', 'EwpwEwwEwEwE', 'EwppppwEEEwE', 'EwwwwpppppPF']; let o = '<div class="pa-grid">'; let n = 0;
      L.forEach((r) => r.split('').forEach((c) => { o += '<i class="' + (c === 'w' ? 'w' : (c === 'p' || c === 'P' || c === 'S' || c === 'F') ? 'p' : '') + '" style="animation-delay:' + ((n++) * 0.06).toFixed(2) + 's"></i>'; }));
      return o + '</div>';
    })(),
    'tree-cutter': '<div class="pa-bot"><svg viewBox="0 0 200 70" aria-hidden="true"><path d="M10 55 C 50 55, 50 15, 90 15 S 150 55, 190 20" stroke-width="2"/></svg></div>',
    'react-cards': miniCards(),
    'react-cart': miniCart(),
    'robot-gui': '<div class="pa-polar"><svg viewBox="0 0 200 105" aria-hidden="true"><path d="M10 100 A90 90 0 0 1 190 100 Z" fill="none" stroke="currentColor" opacity=".3"/><path d="M55 100 A45 45 0 0 1 145 100" fill="none" stroke="currentColor" opacity=".3"/><line x1="100" y1="100" x2="100" y2="14"/></svg></div>'
  };

  function discover() {}
  function renderTrail() {}

  /* ================= project rows ================= */
  function viewHtml(id) {
    const A = 'assets/', fig = (f, w, h, cap, alt, cls) => '<figure class="vfig ' + (cls || '') + '"><img src="' + A + f + '.webp" width="' + w + '" height="' + h + '" alt="' + esc(alt) + '"><figcaption>' + esc(cap) + '</figcaption></figure>';
    if (id === 'focusup') return '<div class="vgal">' + fig('focusup-concept-lock', 444, 864, 'Lock screen', 'FocusUp lock screen concept') + fig('focusup-concept-quests', 444, 864, 'Quest log', 'FocusUp quest log concept') + '</div>';
    if (id === 'timepiece') return '<div class="vgal">' + fig('timepiece-home', 420, 931, 'Home', 'timePiece home screen', 'vph') + fig('timepiece-catalog', 420, 931, 'Catalog', 'timePiece watch catalog', 'vph') + fig('timepiece-details', 420, 931, 'Watch details', 'timePiece watch details', 'vph') + '</div>';
    if (id === 'react-cards' || id === 'react-cart') return '<div class="vmini">' + PEEK[id] + '</div>';
    return '<div class="vart">' + PEEK[id] + '</div>';
  }
  function rowEl(p, withPeek) {
    const li = document.createElement('li'); li.dataset.cat = p.cat;
    li.innerHTML = '<button class="prow" type="button" data-id="' + p.id + '"><h3>' + esc(p.title) + '</h3><span class="open">Open project</span><span class="kind">' + esc(p.kind) + '</span><p class="desc">' + esc(p.desc) + '</p><div class="pvthumb" aria-hidden="true">' + PEEK[p.id] + '</div></button>';
    const b = $('.prow', li); b.classList.add(withPeek ? 'hasvm' : 'hasv');
    b.addEventListener('click', () => go('p:' + p.id));
    if (withPeek) { ['mouseenter', 'focus'].forEach((ev) => b.addEventListener(ev, () => showPeek(p.id))); }
    return li;
  }
  /* ================= featured project cards (home) ================= */
  function ftSlides(slides) {
    const n = slides.length, slot = 3, dur = n * slot;
    const st = (i) => ' style="animation-duration:' + dur + 's;animation-delay:' + (i * slot) + 's"';
    return '<div class="ft-cap" aria-hidden="true">' + slides.map((x, i) => '<span class="ft' + n + '"' + st(i) + '>' + esc(x[1]) + '</span>').join('') + '</div>' +
      '<div class="ft-pvp">' + slides.map((x, i) => '<img class="ft' + n + '" src="assets/' + x[0] + '.webp" width="' + x[3] + '" height="' + x[4] + '" alt="' + esc(x[2]) + '"' + st(i) + '>').join('') + '</div>';
  }
  function ftMaze() {
    const rows = ['S..#....#..', '##.#.##.#.#', '.....#.....', '.#####.###.', '.......#...', '######.#.##', '..........E'];
    const H = rows.length, W = rows[0].length, key = (r, c) => r * W + c;
    let start, end;
    rows.forEach((row, r) => row.split('').forEach((ch, c) => { if (ch === 'S') start = [r, c]; if (ch === 'E') end = [r, c]; }));
    const prev = {}, seen = {}, order = [], q = [start]; seen[key(start[0], start[1])] = true;
    while (q.length) {
      const cur = q.shift(); order.push(cur);
      if (cur[0] === end[0] && cur[1] === end[1]) break;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach((d) => {
        const nr = cur[0] + d[0], nc = cur[1] + d[1];
        if (nr < 0 || nc < 0 || nr >= H || nc >= W || rows[nr][nc] === '#' || seen[key(nr, nc)]) return;
        seen[key(nr, nc)] = true; prev[key(nr, nc)] = cur; q.push([nr, nc]);
      });
    }
    const vi = {}; order.forEach((p, i) => { vi[key(p[0], p[1])] = i; });
    const pi = {}; const path = []; let step = prev[key(end[0], end[1])];
    while (step && !(step[0] === start[0] && step[1] === start[1])) { path.unshift(step); step = prev[key(step[0], step[1])]; }
    path.forEach((p, i) => { pi[key(p[0], p[1])] = i; });
    const span = order.length * 0.07; let out = '';
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
      const ch = rows[r][c], k = key(r, c); let cls = '', sty = '';
      if (ch === '#') cls = ' w'; else if (ch === 'S') cls = ' s'; else if (ch === 'E') cls = ' e';
      else if (pi[k] !== undefined) { cls = ' p'; sty = ' style="animation-delay:' + (span + 0.3 + pi[k] * 0.12).toFixed(2) + 's"'; }
      else if (vi[k] !== undefined) { cls = ' v'; sty = ' style="animation-delay:' + (vi[k] * 0.07).toFixed(2) + 's"'; }
      out += '<i class="ft-cell' + cls + '"' + sty + '></i>';
    }
    return '<div class="ft-win"><div class="ft-bar"><i></i><i></i><i></i><span>maze solver, breadth-first search</span></div><div class="ft-maze">' + out + '</div></div>';
  }
  const FEATURED = {
    focusup: { stage: () => ftSlides([['focusup-concept-lock', 'Apps stay locked', 'FocusUp lock screen', 444, 864], ['focusup-concept-quests', 'Every task is a quest', 'FocusUp quest log', 444, 864]]) },
    timepiece: { stage: () => ftSlides([['timepiece-home', 'Home', 'timePiece home screen', 420, 931], ['timepiece-catalog', 'Browse the catalog', 'timePiece watch catalog', 420, 931], ['timepiece-details', 'Compare prices by condition', 'timePiece watch details', 420, 931]]) },
    courseflow: { live: 'https://scotty-08.github.io/CourseFlow/', stage: () => '<div class="ft-win"><div class="ft-bar"><i></i><i></i><i></i><span>scotty-08.github.io/CourseFlow</span></div><div class="ft-pan"><img src="assets/courseflow-planner.webp" width="1200" height="806" alt="CourseFlow semester planner"></div></div>' },
    'maze-solver': { live: 'maze-solver-visualizer/', stage: ftMaze }
  };
  (function buildFeatured() {
    const host = $('#featList'); if (!host) return;
    Object.keys(FEATURED).forEach((id) => {
      const p = PBY[id], f = FEATURED[id], art = document.createElement('article'); art.className = 'ft-card';
      art.innerHTML = (f.live ? '<span class="ft-live">live site</span>' : '') +
        '<div class="ft-stage" role="img" aria-label="' + esc(p.title) + ' preview">' + f.stage() + '</div>' +
        '<div class="ft-body"><span class="ft-kind">' + esc(p.kind) + '</span><h3>' + esc(p.title) + '</h3><p>' + esc(p.desc) + '</p>' +
        '<div class="ft-tags">' + p.tags.slice(0, 3).map((t) => '<span class="tag">' + esc(t) + '</span>').join('') + '</div>' +
        '<div class="ft-acts">' + (f.live ? '<a class="btn small solid" href="' + esc(f.live) + '" target="_blank" rel="noopener noreferrer">Live site &#8599;</a><button class="btn small" type="button" data-go="p:' + id + '">Details</button>' : '<button class="btn small solid" type="button" data-go="p:' + id + '">See details</button>') + '</div></div>';
      host.appendChild(art);
    });
    const more = document.createElement('article'); more.className = 'ft-card ft-more';
    more.innerHTML = '<span class="ft-kind">' + (N_PROJ - Object.keys(FEATURED).length) + ' more</span><h3>See more projects</h3><p>ISU Jeopardy, the React cards and shopping cart, plus the tree-cutter robot and its Python control GUI.</p><div class="ft-acts"><button class="btn solid" type="button" data-go="projects">All ' + N_PROJ + ' projects &rarr;</button></div>';
    host.appendChild(more);
  })();

  const projList = $('#projList'); let curFilter = 'all';
  PROJECTS.forEach((p) => projList.appendChild(rowEl(p, true)));
  ['focusup-concept-lock', 'focusup-concept-quests', 'timepiece-home', 'timepiece-catalog', 'timepiece-details'].forEach((f) => { new Image().src = 'assets/' + f + '.webp'; });
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
  const VIEWS = ['home', 'projects', 'work', 'contact', 'project'];
  const SCROLL_TO = { learning: '#learning', skills: '#skills', build: '#build', featured: '#featured' };
  let current = 'home';
  function show(view, projectId, navHint) {
    VIEWS.forEach((v) => { $('#v-' + v).hidden = v !== view; });
    const navKey = navHint || (view === 'project' ? 'projects' : view);
    $$('[data-nav]').forEach((a) => { if (a.closest('.nav')) { if (a.dataset.nav === navKey) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); } });
    current = view;
    if (view === 'project') renderProject(projectId);
  }
  /* ================= project intro pop-up ================= */
  const INTRO = { focusup: true };
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let introTimer = 0;
  function closeIntro() {
    const d = $('#intro'); if (!d || !d.open) return;
    clearTimeout(introTimer);
    d.classList.add('out');
    setTimeout(() => { d.classList.remove('out'); if (d.open) d.close(); }, 220);
  }
  function playIntro(id) {
    const d = $('#intro'), v = $('#introVideo');
    if (!INTRO[id] || !d || !v || d.open || reduceMotion.matches || typeof d.showModal !== 'function') return;
    try { v.currentTime = 0; } catch (e) {}
    d.showModal();
    const p = v.play();
    if (p && p.catch) p.catch(closeIntro);
    clearTimeout(introTimer);
    introTimer = setTimeout(closeIntro, 5000);
  }
  (function () {
    const d = $('#intro'), v = $('#introVideo'); if (!d || !v) return;
    v.addEventListener('ended', () => { clearTimeout(introTimer); introTimer = setTimeout(closeIntro, 450); });
    v.addEventListener('error', closeIntro);
    $('#introSkip').addEventListener('click', closeIntro);
    d.addEventListener('click', (e) => { if (e.target === d) closeIntro(); });
    d.addEventListener('close', () => { clearTimeout(introTimer); d.classList.remove('out'); try { v.pause(); } catch (e) {} });
  })();

  function go(token, quiet) {
    let view = token, pid = null, scroll = null;
    if (token.indexOf('p:') === 0) { view = 'project'; pid = token.slice(2); }
    else if (SCROLL_TO[token]) { view = 'home'; scroll = SCROLL_TO[token]; }
    else if (token === 'about') { view = 'home'; token = 'home'; }
    if (view === 'project' && !PBY[pid]) { view = 'projects'; pid = null; }
    if (VIEWS.indexOf(view) === -1) view = 'home';
    show(view, pid, scroll && token === 'skills' ? 'skills' : null);
    const hashTok = view === 'project' ? 'project-' + pid : (scroll ? token : view);
    if (!quiet) { try { history.replaceState(null, '', '#' + hashTok); } catch (e) { try { location.hash = hashTok; } catch (e2) {} } }
    if (scroll) { const el = $(scroll); if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' }); } else window.scrollTo(0, 0);
    if (view === 'project' && !quiet) playIntro(pid);
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

  /* ================= hero maze ================= */
  const R = 16, C = 24, N = R * C;
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

  /* ================= project detail ================= */
  let tabState = null;
  function renderProject(id) {
    const p = PBY[id]; if (!p) return;
    discover(id);
    $('#pdTitle').textContent = p.title; $('#pdKind').textContent = p.kind;
    $('#pdView').innerHTML = '<div class="vlabel">A quick look</div>' + viewHtml(id);
    $('#pdMain').innerHTML = p.overview.map((t) => '<p style="font-size:18px">' + esc(t) + '</p>').join('') +
      '<h2 style="font-size:28px;margin:30px 0 8px">What I did</h2>' + p.mine.map((m) => '<details><summary>' + esc(m[0]) + '</summary><p>' + esc(m[1]) + '</p></details>').join('');
    $('#pdFacts').innerHTML = p.facts.map((f) => '<div><dt>' + esc(f[0]) + '</dt><dd>' + (f[2] ? '<a href="' + esc(f[2]) + '" target="_blank" rel="noopener noreferrer">' + esc(f[1]) + '</a>' : esc(f[1])) + '</dd></div>').join('');
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
    const A = 'assets/focusup-concept-';
    const S = [
      ['lock', 'phone', 444, 864, 'Lock the apps that pull you off track.', 'The screen you see when you open a blocked app. It names the quest to finish and offers Open Quests or Give up.', 'FocusUp lock screen asking you to finish the quest Finish lab report, with an Open Quests button and a Give up link.'],
      ['quests', 'phone', 444, 864, 'Clear a quest to unlock them.', 'Checking off a quest unlocks your apps. Finished quests clear themselves after a day.', 'Quest log with one cleared quest and two open ones, and an Apps unlocked banner at the bottom.'],
      ['companions', 'wide', 1320, 820, 'Level up. Unlock companions.', 'You start as yourself, then earn companions, cloaks and extras as you level up.', 'Grid of ten hooded character avatars, most of them locked until a level or coin goal.'],
      ['canvas', 'wide', 1480, 840, 'Canvas assignments become quests.', 'A browser extension imports Canvas assignments as quests and skips work you already submitted.', 'A Canvas page with the FocusUp extension popup, and an arrow to three imported quests.']
    ];
    s.innerHTML = '<p class="note" style="margin:0 0 16px">Concept screens from the FocusUp tester intro video. The real app has Home, Quests, Player and Friends tabs.</p><div class="shots">' + S.map((x) => '<figure class="shot ' + x[1] + '"><img src="' + A + x[0] + '.webp" width="' + x[2] + '" height="' + x[3] + '" loading="lazy" alt="' + esc(x[6]) + '"><figcaption>' + (x[1] === 'phone' ? '<b>' + esc(x[4]) + '</b>' : '') + esc(x[5]) + '</figcaption></figure>').join('') + '</div>';
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
    s.innerHTML = '<p style="margin:0 0 12px">The live updates are the part I built that is easiest to feel. This simulation, with example watches and not the real server, shows how a WebSocket push differs from the app asking again over HTTP. Open the connection, then change something on the server.</p>' +
      '<div class="toolbar"><button class="btn small" id="wsConn" type="button">Open connection</button><button class="btn small quiet" id="wsAdd" type="button">Server: drop a price</button><button class="btn small quiet" id="wsSell" type="button">Server: sell a watch</button><button class="btn small quiet" id="wsRefresh" type="button">App: refresh (HTTP)</button><button class="btn small quiet" id="wsReset" type="button">Reset</button></div>' +
      '<div class="wsgrid"><div class="wsbox"><h5>Android app</h5><ul id="appList"></ul></div><div class="wslink" id="wsLink"><span>socket <b id="wsState">closed</b></span></div><div class="wsbox"><h5>Backend</h5><ul id="srvList"></ul></div></div><div class="wslog" id="wsLog" aria-live="polite"></div>';
    const START = [{ n: 'Field Watch', p: 180, sold: false }, { n: 'Pilot 40', p: 240, sold: false }, { n: 'Diver 300', p: 320, sold: false }];
    let ws = { open: false, srv: [], app: [], log: [], pi: 0 }, lastNew = '';
    const copyList = (a) => a.map((w) => ({ n: w.n, p: w.p, sold: w.sold }));
    const wsPush = (arr) => { ws.log = arr.concat(ws.log).slice(0, 7); };
    function wsPulse() { const l = $('#wsLink', s); l.classList.remove('send'); void l.offsetWidth; if (!reduced) l.classList.add('send'); }
    function wsList(el, arr, hot) { el.innerHTML = ''; arr.forEach((w) => { const li = document.createElement('li'); li.textContent = w.n + ': ' + (w.sold ? 'SOLD' : '$' + w.p); if (hot === w.n && !reduced) li.className = 'new'; el.appendChild(li); }); }
    const openW = () => ws.srv.filter((w) => !w.sold);
    function renderWs() {
      wsList($('#appList', s), ws.app, lastNew); wsList($('#srvList', s), ws.srv, '');
      $('#wsState', s).textContent = ws.open ? 'open' : 'closed'; $('#wsLink', s).classList.toggle('open', ws.open);
      $('#wsConn', s).textContent = ws.open ? 'Close connection' : 'Open connection';
      const left = openW().length; $('#wsAdd', s).disabled = left === 0; $('#wsSell', s).disabled = left <= 1;
      const lg = $('#wsLog', s); lg.innerHTML = '';
      if (!ws.log.length) { const d = document.createElement('div'); d.textContent = 'Message log. Open the connection to start.'; lg.appendChild(d); }
      ws.log.forEach((m) => { const d = document.createElement('div'); d.textContent = m; lg.appendChild(d); });
    }
    function wsReset() { ws = { open: false, srv: copyList(START), app: copyList(START), log: [], pi: 0 }; lastNew = ''; renderWs(); }
    $('#wsConn', s).addEventListener('click', () => {
      lastNew = '';
      if (!ws.open) { ws.open = true; wsPulse(); ws.app = copyList(ws.srv); wsPush(['server to app: connected, staying open', 'app to server: open connection']); }
      else { ws.open = false; wsPush(['connection closed. The server can no longer push to the app.']); }
      renderWs();
    });
    $('#wsAdd', s).addEventListener('click', () => {
      const o = openW(); if (!o.length) return;
      const w = o[ws.pi++ % o.length]; w.p = Math.max(10, w.p - 10); lastNew = '';
      if (ws.open) { const a = ws.app.filter((x) => x.n === w.n)[0]; if (a) a.p = w.p; lastNew = w.n; wsPulse(); wsPush(['server to app: price_update "' + w.n + '" $' + w.p, 'server: price of "' + w.n + '" changed']); }
      else wsPush(['server: price of "' + w.n + '" changed to $' + w.p + '. The app was not told, so it still shows the old price.']);
      renderWs();
    });
    $('#wsSell', s).addEventListener('click', () => {
      const o = openW(); if (o.length <= 1) return;
      const w = o[o.length - 1]; w.sold = true; lastNew = '';
      if (ws.open) { const a = ws.app.filter((x) => x.n === w.n)[0]; if (a) a.sold = true; lastNew = w.n; wsPulse(); wsPush(['server to app: watch_sold "' + w.n + '"', 'server: "' + w.n + '" sold']); }
      else wsPush(['server: "' + w.n + '" sold. The app was not told, so it still shows it for sale.']);
      renderWs();
    });
    $('#wsRefresh', s).addEventListener('click', () => { ws.app = copyList(ws.srv); lastNew = ''; wsPulse(); wsPush(['server to app: 200 OK, ' + ws.srv.length + ' watches', 'app to server: GET /watches (the app had to ask)']); renderWs(); });
    $('#wsReset', s).addEventListener('click', wsReset); wsReset();
  }

  /* CourseFlow */
  function cfScreens(s) {
    const S = [['home', 'Home', 'Browse the CPR E catalog and add courses to your cart.', 'CourseFlow home page with the course catalog'], ['planner', 'Semester planner', 'Place courses in semesters and watch the credits and cost update.', 'CourseFlow semester planner with a credit meter and cost'], ['assistant', 'Assistant', 'A rule-based helper answers questions about your plan.', 'CourseFlow rule-based assistant open over the planner']];
    s.innerHTML = '<p class="note" style="margin:0 0 16px">Screens from the live site. <a href="https://scotty-08.github.io/CourseFlow/" target="_blank" rel="noopener noreferrer">Open it yourself</a>.</p><div class="shots">' + S.map((x) => '<figure class="shot wide"><img src="assets/courseflow-' + x[0] + '.webp" width="1200" height="806" loading="lazy" alt="' + esc(x[3]) + '"><figcaption><b>' + esc(x[1]) + '</b>' + esc(x[2]) + '</figcaption></figure>').join('') + '</div>';
  }
  function cfPrice(s) {
    s.innerHTML = '<p class="note" style="margin:0 0 12px">CourseFlow\'s pricing rule: $399 per credit. A semester over 12 credits never costs more than $8,000.</p><label class="field" for="cfC" style="max-width:360px">Credits this semester: <span id="cfV">15</span><input id="cfC" type="range" min="1" max="24" value="15"></label><div class="detail"><h4 id="cfT"></h4><p id="cfP"></p></div>';
    const d = $('#cfC', s);
    function upd() {
      const c = +d.value, sub = c * 399, over = c > 12, total = over ? Math.min(sub, 8000) : sub, capped = over && total !== sub;
      $('#cfV', s).textContent = c;
      $('#cfT', s).textContent = '$' + total.toLocaleString('en-US');
      $('#cfP', s).textContent = c + ' credits x $399 = $' + sub.toLocaleString('en-US') + '. ' + (capped ? 'Over 12 credits, so the $8,000 cap applies and you save $' + (sub - total).toLocaleString('en-US') + '.' : over ? 'Over 12 credits, but the $8,000 cap does not bind until about 21 credits.' : 'At or under 12 credits you pay the plain total.');
    }
    d.addEventListener('input', upd); upd();
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
    const POOL = [['Maria Lopez', 82000, 'Single', '12 Elm St, Ames', 'squidward'], ['Devon Clark', 64500, 'Married', '88 Oak Ave, Des Moines', 'success'], ['Priya Nair', 91000, 'Single', '4 Lake Rd, Council Bluffs', 'chain'], ['Tom Becker', 57000, 'Divorced', '210 Main St, Omaha', 'googly']];
    let n = 2;
    s.innerHTML = '<div class="two"><div><div class="toolbar"><button class="btn small solid" id="rcAdd" type="button">Add a user</button><button class="btn small quiet" id="rcRm" type="button">Remove one</button></div><div id="rcL" style="display:grid;gap:10px"></div></div><div><div class="code" id="rcC"></div><p class="note">One UserCard function. The array decides how many cards exist.</p></div></div>';
    function draw() {
      $('#rcL', s).innerHTML = POOL.slice(0, n).map((u) => '<div class="ucard"><img class="av" src="assets/card-' + u[4] + '.webp" width="56" height="56" alt=""><div><strong>' + esc(u[0]) + '</strong><p>Salary: $' + u[1].toLocaleString('en-US') + '</p><p>Marital status: ' + u[2] + '</p><p>' + esc(u[3]) + '</p></div></div>').join('');
      $('#rcC', s).textContent = 'const users = [\n' + POOL.slice(0, n).map((u) => '  { name: "' + u[0] + '", picture: "' + u[4] + '.webp",\n    salary: ' + u[1] + ', marital: "' + u[2] + '",\n    address: "' + u[3] + '" }').join(',\n') + '\n];\n\n{users.map(u => <UserCard key={u.name} {...u} />)}';
      $('#rcAdd', s).disabled = n >= POOL.length; $('#rcRm', s).disabled = n <= 1;
    }
    $('#rcAdd', s).addEventListener('click', () => { n++; draw(); }); $('#rcRm', s).addEventListener('click', () => { n--; draw(); }); draw();
  }


  /* React shopping cart */
  const SHOP = [[1,"Long sleeve Jacket","women",150,"2584269/pexels-photo-2584269.jpeg"],[2,"Jacket with wollen hat","women",65,"2681751/pexels-photo-2681751.jpeg"],[3,"Compact fashion t-shirt","women",55.99,"2752045/pexels-photo-2752045.jpeg"],[4,"Blue jins","women",50,"1485031/pexels-photo-1485031.jpeg"],[5,"Skirts with full setup","women",695,"1631181/pexels-photo-1631181.jpeg"],[6,"Yellow Hoody","men",180,"1183266/pexels-photo-1183266.jpeg"],[7,"Black t-shirt for women","women",20,"2010812/pexels-photo-2010812.jpeg"],[8,"Gouwn with Red velvet","women",350,"2233703/pexels-photo-2233703.jpeg"],[9,"Pink beauty","women",100,"2065195/pexels-photo-2065195.jpeg"],[10,"Jean's stylish Jacket","men",245,"1040945/pexels-photo-1040945.jpeg"],[11,"Jamdani Saree","women",800,"3363204/pexels-photo-3363204.jpeg"],[12,"Black Jacket","men",140,"983497/pexels-photo-983497.jpeg"],[13,"Black top with jeans","women",120,"3672825/pexels-photo-3672825.jpeg"],[14,"Clothes with bag","kids",50,"36029/aroni-arsa-children-little.jpg"],[15,"Stylish jeans in lightblue","women",100,"2738792/pexels-photo-2738792.jpeg"],[16,"Unknown horizon","men",350,"2866077/pexels-photo-2866077.jpeg"],[17,"Light tops","women",120,"2010925/pexels-photo-2010925.jpeg"],[18,"Khakhi jeans","women",190,"3054973/pexels-photo-3054973.jpeg"],[19,"Black full sleeve","women",170,"2693849/pexels-photo-2693849.jpeg"],[20,"Formal for Men","men",490,"1043474/pexels-photo-1043474.jpeg"]];
  const shopImg = (u) => (u.indexOf('http') === 0 ? u : 'https://images.pexels.com/photos/' + u + '?auto=compress&cs=tinysrgb&w=120');
  function cartDemo(s) {
    let cat = 'all', cart = [];
    const items = SHOP.map((r) => ({ _id: r[0], title: r[1], category: r[2], price: r[3], image: shopImg(r[4]) }));
    s.innerHTML = '<p class="note" style="margin:0 0 12px">Real products from the project\'s JSON file. The cart logic follows my React code.</p><div class="toolbar" id="scF"></div><div class="shop"><div class="shoplist" id="scL"></div><aside class="shopcart"><h4>Items in cart</h4><p class="note" style="margin:4px 0 10px" id="scN"></p><div id="scC"></div><p class="shoptotal"><span>Order total</span><b id="scT"></b></p><button class="btn small quiet" id="scX" type="button">Empty cart</button></aside></div>';
    const fb = $('#scF', s);
    ['all', 'women', 'men', 'kids'].forEach((c) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn small'; b.textContent = c === 'all' ? 'All' : c[0].toUpperCase() + c.slice(1); b.setAttribute('aria-pressed', String(c === 'all')); b.addEventListener('click', () => { cat = c; $$('.btn', fb).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw(); }); fb.appendChild(b); });
    const count = (id) => cart.filter((c) => c._id === id).length;
    function draw() {
      $('#scL', s).innerHTML = items.filter((it) => cat === 'all' || it.category === cat).map((it) =>
        '<div class="shoprow"><img src="' + esc(it.image) + '" alt="" loading="lazy" width="48" height="48"><div class="si"><b>' + esc(it.title) + '</b><span>' + esc(it.category) + '</span></div><div class="sq"><button class="btn small quiet" type="button" data-m="' + it._id + '" aria-label="Remove one ' + esc(it.title) + '">-</button><output>' + count(it._id) + '</output><button class="btn small" type="button" data-p="' + it._id + '" aria-label="Add ' + esc(it.title) + '">+</button></div><div class="sp">$' + it.price + '</div></div>').join('');
      $$('[data-p]', s).forEach((b) => b.addEventListener('click', () => { cart = cart.concat(items.filter((x) => x._id === +b.dataset.p)); draw(); }));
      $$('[data-m]', s).forEach((b) => b.addEventListener('click', () => { const i = cart.findIndex((x) => x._id === +b.dataset.m); if (i !== -1) { cart = cart.slice(); cart.splice(i, 1); draw(); } }));
      const grouped = cart.reduce((g, el) => { const f = g.find((x) => x._id === el._id); if (f) f.quantity += 1; else g.push(Object.assign({}, el, { quantity: 1 })); return g; }, []);
      $('#scC', s).innerHTML = grouped.length ? grouped.map((g) => '<div class="cartline"><img src="' + esc(g.image) + '" alt="" width="40" height="40"><div><div>' + esc(g.title) + '</div><small>$' + g.price + ' x ' + g.quantity + '</small></div></div>').join('') : '<p class="note" style="margin:0">Nothing here yet. Press + on a product.</p>';
      const total = cart.reduce((t, c) => t + c.price, 0);
      $('#scT', s).textContent = '$' + (Math.round(total * 100) / 100);
      $('#scN', s).textContent = 'Products selected ' + cart.length;
    }
    $('#scX', s).addEventListener('click', () => { cart = []; draw(); });
    cart = items.filter((x) => x._id === 6).concat(items.filter((x) => x._id === 4), items.filter((x) => x._id === 6));
    draw();
  }
  function cartCode(s) {
    const blocks = [
      ['Cart state', 'A flat array holds every item added. The total lives in its own state.', 'const [cart, setCart] = useState([]);\nconst [cartTotal, setCartTotal] = useState(0);\n\nconst addToCart = (el) => {\n  setCart([...cart, el]);\n};'],
      ['Group repeats with reduce', 'One entry per product, with a quantity that goes up each time it appears.', 'const groupedCart = cart.reduce((grouped, el) => {\n  const existingItem = grouped.find((c) => c._id === el._id);\n  if (existingItem) {\n    existingItem.quantity += 1;\n  } else {\n    grouped.push({ ...el, quantity: 1 });\n  }\n  return grouped;\n}, []);'],
      ['Remove one copy', 'findIndex and splice take out a single item, not every copy.', 'const removeFromCart = (el) => {\n  const itemIndex = cart.findIndex((c) => c._id === el._id);\n  if (itemIndex !== -1) {\n    const updatedCart = [...cart];\n    updatedCart.splice(itemIndex, 1);\n    setCart(updatedCart);\n  }\n};'],
      ['Total with useEffect', 'Runs after every change to the cart and adds up the prices.', 'useEffect(() => {\n  total();\n}, [cart]);\n\nconst total = () => {\n  let totalVal = 0;\n  for (let i = 0; i < cart.length; i++) {\n    totalVal += cart[i].price;\n  }\n  setCartTotal(totalVal);\n};']
    ];
    s.innerHTML = '<p class="note" style="margin:0 0 6px">From ShoppingBootstrap.jsx.</p>' + blocks.map((b) => '<div class="detail"><h4>' + esc(b[0]) + '</h4><p>' + esc(b[1]) + '</p><div class="code">' + esc(b[2]) + '</div></div>').join('');
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
    'courseflow': [{ label: 'Screens', render: cfScreens }, { label: 'Price a semester', render: cfPrice }],
    'jeopardy': [{ label: 'Play a sample board', render: jeoDemo }],
    'maze-solver': [{ label: 'Live demo', render: mazeDemo }],
    'tree-cutter': [{ label: 'Sensor decisions', render: cutterDemo }],
    'react-cards': [{ label: 'Cards from data', render: cardsDemo }],
    'react-cart': [{ label: 'Try the cart', render: cartDemo }, { label: 'The React code', render: cartCode }],
    'robot-gui': [{ label: 'Polar plot', render: robotDemo }]
  };

  /* ================= learning ================= */
  const SKILLS = {
    react: { name: 'React', status: 'Currently learning', desc: 'I am learning React with Vite in Iowa State\'s COM S 3190 web development class, starting with reusable components and props and moving on to state and hooks.', ex: 'I started with reusable UserCard components that take props. My most recent project is a shopping cart that keeps its items in state, groups repeats with reduce and updates the total with useEffect.', go: 'p:react-cart', link: '#project-react-cart', text: 'Open the shopping cart project' },
  };
  function pickSkill(id) {
    const k = SKILLS[id];
    $$('[data-skill]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.skill === id)));
    $('#dStatus').textContent = k.status; $('#dName').textContent = k.name; $('#dDesc').textContent = k.desc; $('#dEx').textContent = k.ex;
    const l = $('#dLink'); l.dataset.go = k.go; l.setAttribute('href', k.link); l.textContent = k.text;
  }
  pickSkill('react');
  let cartMounted = false;
  function pickDemo(id) {
    $$('[data-demo]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.demo === id)));
    $('#demoReact').hidden = id !== 'cards'; $('#demoCart').hidden = id !== 'cart';
    if (id === 'cart' && !cartMounted) { cartMounted = true; cartDemo($('#demoCart')); }
    const l = $('#dLink');
    l.dataset.go = id === 'cart' ? 'p:react-cart' : 'p:react-cards'; l.setAttribute('href', id === 'cart' ? '#project-react-cart' : '#project-react-cards'); l.textContent = id === 'cart' ? 'Open the shopping cart project' : 'Open the user cards project';
  }
  $$('[data-demo]').forEach((b) => b.addEventListener('click', () => pickDemo(b.dataset.demo)));
  pickDemo('cards');

  function drawCard() {
    const name = $('#rName').value || 'Name', sal = Number($('#rSalary').value) || 0, mar = $('#rMarital').value, adr = $('#rAddress').value || 'Address';
    $('#rAvatar').textContent = name.trim().charAt(0).toUpperCase() || '?';
    $('#uName').textContent = name; $('#uSalary').textContent = 'Salary: $' + sal.toLocaleString('en-US'); $('#uMarital').textContent = 'Marital status: ' + mar; $('#uAddress').textContent = adr;
    $('#rCode').textContent = '<UserCard\n  name="' + name + '"\n  salary={' + sal + '}\n  marital="' + mar + '"\n  address="' + adr + '" />';
  }
  ['#rName', '#rSalary', '#rMarital', '#rAddress'].forEach((q) => $(q).addEventListener('input', drawCard)); drawCard();

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
    { g: 'Pages', ic: 'H', label: 'Home', hint: 'My story', k: 'home about story bio guatemala', run: () => go('home') },
    { g: 'Pages', ic: 'P', label: 'Projects', hint: '', k: 'projects work', run: () => go('projects') },
    { g: 'Pages', ic: 'S', label: 'Skills', hint: 'Home', k: 'skills languages tools', run: () => go('skills') },
    { g: 'Pages', ic: 'L', label: 'What I\'m learning', hint: 'Home', k: 'learning react', run: () => go('learning') },
    { g: 'Pages', ic: 'W', label: 'Work experience', hint: '', k: 'jobs menards mowing', run: () => go('work') },
    { g: 'Pages', ic: 'C', label: 'Contact', hint: '', k: 'email phone', run: () => go('contact') }
  ];
  const KEYS = { courseflow: 'react vite planner courses semester prerequisites tuition live site github pages', focusup: 'swiftui iphone ios quests screen time supabase canvas', timepiece: 'java spring boot mariadb jpa android watches websockets rest', jeopardy: 'json game javascript trivia', 'maze-solver': 'bfs algorithm demo search', 'tree-cutter': 'robot c hardware cpre 288 arm uart', 'react-cards': 'react props vite', 'react-cart': 'react shopping cart store hooks usestate useeffect bootstrap json', 'robot-gui': 'python matplotlib tkinter polar sensor' };
  PROJECTS.forEach((p) => ITEMS.push({ g: 'Projects', ic: p.title[0], label: p.title, hint: p.kind.split(',')[0], k: KEYS[p.id], run: () => go('p:' + p.id) }));
  ITEMS.push(
    { g: 'Actions', ic: 'S', label: 'View software resume', hint: '', k: 'resume cv software', run: () => openResume('software') },
    { g: 'Actions', ic: 'E', label: 'View embedded resume', hint: '', k: 'resume cv embedded firmware', run: () => openResume('embedded') },
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

  window.SiteApi = { go: go, openResume: openResume, PROJECTS: PROJECTS };
  go(tokenFromHash(), true);
})();
