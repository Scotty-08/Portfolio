# Scott Gray Portfolio

Personal portfolio for Scott Gray, a computer engineering student at Iowa State. It is a static single-page site served by GitHub Pages, with no build step.

## Run locally

```sh
python -m http.server 4173 --bind 127.0.0.1
```

Then open http://127.0.0.1:4173.

## Structure

- `index.html` holds the page markup.
- `css/site.css` holds the Midnight Blue styles and `css/otter.css` holds the otter guide.
- `js/app.js` holds the router, the project data, the featured project cards and the interactive demos (maze solver, command palette, React props, WebSocket simulation, shopping cart).
- `js/otter.js` is the otter guide: a rule-based helper (not AI) that wanders the page and answers from the site's own content.
- `assets/` holds the headshot and the project screens.
- `about.html` (now sends visitors to the home page, where the intro lives), `contact.html`, `projects.html`, `project.html` and `screen-flows.html` only redirect old links to the matching view in `index.html`, and `work.html` sends visitors to the home page.
- `maze-solver-visualizer/` is the original standalone maze project.

Each project opens inside the site at `#project-<id>`, for example `#project-timepiece`.
