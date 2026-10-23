// One page, different data: ?id=focusup selects the project from projects.json.
(() => {
  let projects = [];
  let current;
  let views = [];
  const content = document.querySelector('#project-content');
  const loading = document.querySelector('#project-loading');
  const errorPanel = document.querySelector('#project-error');
  const dialog = document.querySelector('#visual-dialog');
  const visualImage = document.querySelector('#visual-image');
  let zoom = 100;

  function setView(view, updateUrl = true) {
    if (!views.includes(view)) view = 'overview';
    document.querySelectorAll('.project-view').forEach(panel => { panel.hidden = panel.id !== `view-${view}`; });
    document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view)));
    if (view === 'demo' && !document.querySelector('#view-demo iframe')) {
      const frame = document.createElement('iframe');
      frame.src = 'maze-solver-visualizer/index.html';
      frame.title = 'Interactive Maze Solver Visualizer';
      document.querySelector('#view-demo').append(frame);
    }
    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set('view', view);
      history.pushState(null, '', url);
    }
    const panel = document.querySelector(`#view-${view}`);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      panel.animate([{ opacity: .3, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 260 });
    }
  }
  function openVisual(item) {
    zoom = 100;
    visualImage.src = item.src;
    visualImage.alt = item.description || item.title;
    document.querySelector('#visual-dialog-title').textContent = item.title;
    updateZoom();
    dialog.showModal();
    document.querySelector('#close-visual').focus();
  }
  function updateZoom() {
    visualImage.style.width = `${zoom}%`;
    document.querySelector('#zoom-value').textContent = `${zoom}%`;
    document.querySelector('#zoom-out').disabled = zoom <= 50;
    document.querySelector('#zoom-in').disabled = zoom >= 250;
  }
  document.querySelector('#zoom-in').addEventListener('click', () => { zoom = Math.min(250, zoom + 25); updateZoom(); });
  document.querySelector('#zoom-out').addEventListener('click', () => { zoom = Math.max(50, zoom - 25); updateZoom(); });
  document.querySelector('#close-visual').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

  function renderScreens() {
    const panel = document.querySelector('#view-screens');
    panel.innerHTML = '<div class="screen-intro"><h2>Follow the screens.</h2><p class="screen-note"></p></div><div class="flow-preview-grid"></div>';
    panel.querySelector('.screen-note').textContent = current.flowNote || '';
    current.flows.forEach(item => {
      const card = document.createElement('article');
      card.className = 'flow-preview-card';
      const img = document.createElement('img'); img.src = item.src; img.alt = item.description;
      const heading = document.createElement('h3'); heading.textContent = item.title;
      const description = document.createElement('p'); description.textContent = item.description;
      const button = document.createElement('button'); button.type = 'button'; button.className = 'primary-link'; button.textContent = 'Open & zoom'; button.addEventListener('click', () => openVisual(item));
      card.append(img, heading, description, button);
      panel.querySelector('.flow-preview-grid').append(card);
    });
    if (current.concepts.length) {
      const gallery = document.createElement('section');
      gallery.className = 'concept-browser';
      gallery.innerHTML = '<div><p class="eyebrow">Early visual concepts</p><h2>From the first idea.</h2><p>Original concept mockups with illustrative tasks and numbers. Select a screen to preview it.</p><div class="concept-choices" role="group" aria-label="Choose a concept screen"></div></div><figure><img alt="" /><figcaption></figcaption></figure>';
      current.concepts.forEach((item, index) => {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = item.title;
        button.setAttribute('aria-pressed', String(index === 0));
        button.addEventListener('click', () => {
          gallery.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
          gallery.querySelector('img').src = item.src;
          gallery.querySelector('img').alt = item.title + ' — early concept, not a current app screenshot';
          gallery.querySelector('figcaption').textContent = item.title;
        });
        gallery.querySelector('.concept-choices').append(button);
        if (index === 0) button.click();
      });
      panel.append(gallery);
    }
  }
  function render() {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    current = projects.find(project => project.id === id);
    if (!current) {
      errorPanel.hidden = false;
      loading.hidden = true;
      content.hidden = true;
      document.querySelector('#project-error-copy').textContent = 'Choose one of the project cards to open its details.';
      document.querySelector('#retry-project').hidden = true;
      return;
    }
    errorPanel.hidden = true;
    document.title = `${current.title} | Scott Gray`;
    document.querySelector('#detail-title').textContent = current.title;
    // These HTML fragments are maintained in our own JSON, never taken from URL input.
    document.querySelector('#detail-eyebrow').innerHTML = current.eyebrow;
    const index = projects.indexOf(current);
    document.querySelector('#project-position').textContent = `Project ${String(index + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`;
    const overview = document.querySelector('#view-overview');
    overview.innerHTML = `<section class="project-detail" id="${current.id}"><div class="project-copy">${current.overviewHtml}</div>${current.visualHtml}</section>`;
    const copy = overview.querySelector('.project-copy');
    current.notes.forEach(note => {
      const details = document.createElement('details'); details.className = 'project-notes';
      const summary = document.createElement('summary'); summary.textContent = note.title;
      details.append(summary);
      const body = document.createElement('div'); body.innerHTML = note.html;
      details.append(body); copy.append(details);
    });
    views = ['overview'];
    if (current.flows.length || current.concepts.length) views.push('screens');
    if (current.demo) views.push('demo');
    const switches = document.querySelector('#project-views'); switches.replaceChildren();
    views.forEach(view => {
      const button = document.createElement('button'); button.type = 'button'; button.dataset.view = view;
      button.textContent = { overview:'Overview & my work', screens:'Screens & flows', demo:'Live demo' }[view];
      button.setAttribute('aria-controls', `view-${view}`);
      button.addEventListener('click', () => setView(view)); switches.append(button);
    });
    document.querySelector('#view-screens').replaceChildren();
    if (views.includes('screens')) renderScreens();
    document.querySelector('#view-demo').innerHTML = '<p class="small-copy">Choose a tool, draw on the grid, and run the solver. <a class="text-link" href="maze-solver-visualizer/index.html" target="_blank" rel="noopener noreferrer">Open full-size demo ↗</a></p>';
    const previous = projects[(index + projects.length - 1) % projects.length];
    const next = projects[(index + 1) % projects.length];
    for (const [selector, project, prefix] of [['#previous-project',previous,'← '],['#next-project',next,'Next: ']]) {
      const link = document.querySelector(selector); link.href = `project.html?id=${project.id}`; link.textContent = prefix + project.title;
    }
    loading.hidden = true; content.hidden = false;
    setView(params.get('view') || 'overview', false);
    initializeArchitecture();
    discoverProject(current.id);
    overview.querySelectorAll('[data-open-view]').forEach(button => button.addEventListener('click', () => setView(button.dataset.openView)));
  }
  async function load() {
    loading.hidden = false; errorPanel.hidden = true;
    try {
      const response = await fetch('projects.json?v=4');
      if (!response.ok) throw new Error('Project data unavailable');
      projects = await response.json();
      render();
    } catch (error) {
      loading.hidden = true; content.hidden = true; errorPanel.hidden = false;
      document.querySelector('#project-error-copy').textContent = 'The project information did not load. Try again or return to the project cards.';
      document.querySelector('#retry-project').hidden = false;
    }
  }
  document.querySelector('#retry-project').addEventListener('click', load);
  window.addEventListener('popstate', () => { if (projects.length) render(); });
  load();
})();
