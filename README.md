# Scott Gray Portfolio

An update of the existing GitHub Pages portfolio. It keeps the original
blue-and-white design, family photos, personal story, work history, and maze demo.

## Preview locally

From this folder, run:

```sh
python -m http.server 4173 --bind 127.0.0.1
```

Then open http://127.0.0.1:4173. Use a server rather than double-clicking
index.html so the browser can fetch learning.json.

## What changed

- Home: six project cards with category filters, JSON-powered skill explorer,
  and links to GitHub and contact information.
- Projects: ISU Jeopardy and Activity 09 descriptions with expandable details.
  The existing maze and robot projects remain.
- timePiece: backend role confirmed by Scott, catalog/database/deployment
  contributions, a backend filter, and an SVG architecture diagram.
- Contact: real GitHub link and a copy-email button with success/failure feedback.
- Every page: GitHub navigation, consistent footer, skip link, keyboard focus,
  and a small-screen menu that closes with Escape.

The original Jeopardy and React assignment source files were not supplied.
Those sections describe the work provided by Scott; they do not pretend to be
working versions of those assignments. React is labeled as currently learning.
The existing maze source is unchanged.

## How the new code works

1. HTML defines the cards, buttons, and content areas.
2. CSS extends the existing design and adjusts layout for small screens.
3. portfolio.js listens for clicks. A filter compares its data-filter value
   with each card's data-category and sets the card's hidden property.
4. learning.json stores an array of skill objects. JavaScript loads the array
   with fetch, finds the selected skill, and updates textContent on the page.
5. Native HTML details/summary elements provide expandable project notes
   without additional JavaScript.

No framework or build step is needed. The site remains plain HTML/CSS/JS.


## Source

Retrieved from Scotty-08/Portfolio at main revision
3cede02b0734120687fa77001e06cb281a922c46 using the GitHub connection.
This local working copy has its origin set to the existing GitHub repository.
Review the changes before copying them to an existing checkout or publishing.

## FocusUp and screen flows

FocusUp is credited as co-developed with Scott's roommate. The provided local
portfolio brief supplies contribution and TestFlight/submission history; the
current public SwiftUI source supplies the screen navigation.

screen-flows.html contains FocusUp setup and everyday flows plus the
handoff-based timePiece flow. assets/app-screen-flows.drawio has the same three
editable diagrams. SVG exports are beside it.

The three FocusUp concept SVGs were extracted from the supplied
focusup-portfolio-section.html and labeled as concepts with illustrative data.
No placeholder store links or unprovided private GitLab links were added.


## Interactive exploration

Project discovery progress is saved in localStorage on the visitor browser.
Cards and sections animate with reduced-motion support. The timePiece diagram
uses keyboard-accessible buttons to explain the app, backend, and database.
