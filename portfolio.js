// The same script works on every page. Each feature first checks for its HTML.
const filterButtons = document.querySelectorAll("[data-filter]");
const projectCards = document.querySelectorAll("[data-category]");
const projectCount = document.querySelector("#project-count");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selected = button.dataset.filter;
    let visibleCount = 0;

    projectCards.forEach((card) => {
      const matches = selected === "all" || card.dataset.category === selected;
      card.hidden = !matches;
      if (matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        card.animate([{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 320 });
      }
      if (matches) visibleCount += 1;
    });

    filterButtons.forEach((filter) => {
      filter.setAttribute("aria-pressed", String(filter === button));
    });
    projectCount.textContent = `${visibleCount} project${visibleCount === 1 ? "" : "s"} shown`;
  });
});

const skillButtons = document.querySelectorAll("[data-skill]");
const skillPanel = document.querySelector("#skill-panel");

// JSON holds the content; this function puts one selected skill into the page.
function showSkill(skill) {
  document.querySelector("#skill-status").textContent = skill.status;
  document.querySelector("#skill-title").textContent = skill.name;
  document.querySelector("#skill-description").textContent = skill.description;
  document.querySelector("#skill-example").textContent = skill.example;
  const link = document.querySelector("#skill-project");
  link.textContent = skill.project + " →";
  link.href = skill.href;
  skillButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.skill === skill.id));
  });
}

async function loadSkills() {
  try {
    const response = await fetch("learning.json");
    if (!response.ok) throw new Error("Could not load skill content.");
    const skills = await response.json();
    skillButtons.forEach((button) => {
      button.disabled = false;
      button.addEventListener("click", () => {
        const skill = skills.find((item) => item.id === button.dataset.skill);
        if (skill) showSkill(skill);
      });
    });
  } catch (error) {
    // The first description stays readable even if the JSON request fails.
    document.querySelector("#skill-load-status").textContent =
      "The skill explorer could not load. You can still read about my work on the Projects page.";
  }
}
if (skillPanel) loadSkills();

// Keep exploration progress on this browser, even when visiting another page.
const projectIds = ["focusup", "timepiece", "jeopardy", "maze-solver", "tree-cutter", "react-cards"];
let explored = new Set();
try {
  const saved = JSON.parse(localStorage.getItem("scott-projects-explored") || "[]");
  if (Array.isArray(saved)) explored = new Set(saved.filter((id) => projectIds.includes(id)));
} catch (error) { /* Progress still works for this page if storage is unavailable. */ }

function renderExploration() {
  document.querySelectorAll(".exploration-panel").forEach((panel) => {
    panel.hidden = false;
    panel.querySelector("progress").value = explored.size;
    panel.querySelector(".exploration-count").textContent = `Projects explored: ${explored.size}/6`;
    panel.querySelector(".exploration-badge").textContent = explored.size === 6 ? "All projects discovered!" : explored.size >= 3 ? "Project explorer" : "Curious visitor";
    panel.querySelector(".exploration-message").textContent = explored.size === 6 ? "You have explored the whole collection. Thanks for taking a look!" : "Open project details to fill your discovery trail. Saved on this browser.";
  });
  projectCards.forEach((card) => {
    const link = card.querySelector('a[href*="projects.html#"]');
    if (!link) return;
    const visited = explored.has(link.hash.slice(1));
    card.classList.toggle("is-explored", visited);
    let badge = card.querySelector(".discovery-label");
    if (visited && !badge) {
      badge = document.createElement("span");
      badge.className = "discovery-label";
      badge.textContent = "Explored ✓";
      card.append(badge);
    }
  });
}
function discoverProject(id) {
  if (!projectIds.includes(id) || explored.has(id)) return;
  explored.add(id);
  try { localStorage.setItem("scott-projects-explored", JSON.stringify([...explored])); } catch (error) {}
  renderExploration();
}
renderExploration();
function refreshExploration() {
  try {
    const saved = JSON.parse(localStorage.getItem("scott-projects-explored") || "[]");
    if (Array.isArray(saved)) saved.filter((id) => projectIds.includes(id)).forEach((id) => explored.add(id));
  } catch (error) {}
  renderExploration();
}
window.addEventListener("pageshow", refreshExploration);
window.addEventListener("storage", refreshExploration);
if (document.querySelector(".project-detail")) {
  discoverProject(location.hash.slice(1));
  window.addEventListener("hashchange", () => discoverProject(location.hash.slice(1)));
  // Count a project when its title comes into view, including on long sections.
  if ("IntersectionObserver" in window) {
    const projectObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) discoverProject(entry.target.closest(".project-detail").id);
      });
    }, { threshold: 1, rootMargin: "-80px 0px -15% 0px" });
    document.querySelectorAll(".project-detail h2").forEach((title) => projectObserver.observe(title));
  }
}

const architectureCopy = {
  app: "The Android app displays the watches and sends requests to the backend. The frontend teammates built the app interface in Java using Android Studio.",
  backend: "The Java backend receives requests from the app. I built the watch catalog endpoints and helped deploy the backend JAR to our team VM.",
  database: "MariaDB stores the watch catalog and user data. The backend reads and writes this shared data so the Android app can use it."
};
document.querySelectorAll(".architecture-hotspots, .architecture-explorer").forEach((element) => { element.hidden = false; });
document.querySelectorAll("[data-architecture]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-architecture]").forEach((step) => step.setAttribute("aria-pressed", String(step === button)));
    document.querySelector("#architecture-explanation").textContent = architectureCopy[button.dataset.architecture];
  });
});

// Animate sections once as they arrive. Content remains visible without JavaScript.
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.animate([{ opacity: 0.35, transform: "translateY(18px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 550, easing: "ease-out" });
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06 });
  document.querySelectorAll(".section, .project-detail, .hero-copy").forEach((section) => revealObserver.observe(section));
}

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#main-navigation");
if (menuButton && navigation) {
  menuButton.hidden = false;
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(isOpen));
    navigation.classList.toggle("menu-open", isOpen);
  });
  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      menuButton.setAttribute("aria-expanded", "false");
      navigation.classList.remove("menu-open");
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
      menuButton.setAttribute("aria-expanded", "false");
      navigation.classList.remove("menu-open");
      menuButton.focus();
    }
  });
}

const copyButton = document.querySelector("#copy-email");
if (copyButton) {
  copyButton.hidden = false;
  copyButton.addEventListener("click", async () => {
    const status = document.querySelector("#copy-status");
    try {
      await navigator.clipboard.writeText("grayscott07@outlook.com");
      status.textContent = "Email address copied.";
    } catch (error) {
      status.textContent = "Copy is unavailable here. Email: grayscott07@outlook.com";
    }
  });
}
