/**
 * Progressive enhancements for redesigned project pages (#131).
 *
 * Each feature looks for its own markup and does nothing when it is absent, so
 * one script serves both the Projects index and case-study pages. Without
 * JavaScript every project card, screenshot, and section link stays visible.
 */
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /**
   * Story-highlight filters on the Projects index. Rings are revealed only
   * when this script runs; each one shows the cards whose data-filter matches
   * its data-filter value ("all" shows everything) and announces the result.
   */
  function setUpFilters() {
    const group = document.querySelector("[data-project-filters]");
    const cards = [...document.querySelectorAll(".rd-grid [data-filter]")];
    if (!group || !cards.length) return;
    const rings = [...group.querySelectorAll("[data-filter-value]")];
    const status = document.querySelector("[data-filter-status]");
    // Counts are derived from the rendered cards so they never drift from the catalog.
    for (const ring of rings) {
      const value = ring.dataset.filterValue;
      const count = value === "all" ? cards.length : cards.filter((card) => card.dataset.filter === value).length;
      const counter = ring.querySelector("[data-filter-count]");
      if (counter) counter.textContent = String(count);
      if (!count) ring.hidden = true;
    }
    group.hidden = false;
    group.addEventListener("click", (event) => {
      const ring = event.target.closest("[data-filter-value]");
      if (!ring) return;
      const value = ring.dataset.filterValue;
      for (const other of rings) other.setAttribute("aria-pressed", String(other === ring));
      let shown = 0;
      for (const card of cards) {
        card.hidden = !(value === "all" || card.dataset.filter === value);
        if (!card.hidden) shown += 1;
      }
      if (status) status.textContent = `Showing ${shown} ${shown === 1 ? "project" : "projects"}.`;
    });
  }

  /**
   * Story-style screen carousel in a case-study hero. Slides come from the
   * data-story-slide list; progress bars double as direct slide buttons. Auto
   * advance never starts under reduced motion and can always be paused, which
   * keeps moving content within WCAG 2.2.2.
   */
  function setUpStory() {
    const story = document.querySelector("[data-story]");
    if (!story) return;
    const slides = [...story.querySelectorAll("[data-story-slide]")].map((item) => ({
      src: item.dataset.src,
      alt: item.dataset.alt,
      title: item.dataset.title,
      detail: item.dataset.detail,
    }));
    const image = story.querySelector("[data-story-image]");
    const caption = story.querySelector("[data-story-caption]");
    const bars = story.querySelector("[data-story-bars]");
    const toggle = story.querySelector("[data-story-toggle]");
    if (slides.length < 2 || !image || !caption || !bars || !toggle) return;
    const duration = 4500;
    story.style.setProperty("--rd-story-ms", `${duration}ms`);
    let index = 0;
    let timer;
    let playing = !reduceMotion;

    const buttons = slides.map((slide, slideIndex) => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", `Show screen ${slideIndex + 1} of ${slides.length}: ${slide.title}`);
      button.addEventListener("click", () => show(slideIndex));
      bars.append(button);
      return button;
    });

    function schedule() {
      window.clearTimeout(timer);
      if (playing) timer = window.setTimeout(() => show(index + 1), duration);
    }

    function show(next) {
      index = (next + slides.length) % slides.length;
      const slide = slides[index];
      image.src = slide.src;
      image.alt = slide.alt;
      caption.innerHTML = "";
      const title = document.createElement("strong");
      title.textContent = slide.title;
      caption.append(title, ` · ${slide.detail}`);
      // Clear the current marker and force a reflow so the progress animation restarts.
      buttons.forEach((button) => button.setAttribute("aria-current", "false"));
      void bars.offsetWidth;
      buttons.forEach((button, buttonIndex) => {
        button.classList.toggle("is-done", buttonIndex < index);
        button.setAttribute("aria-current", String(buttonIndex === index));
      });
      schedule();
    }

    function setPlaying(value) {
      playing = value;
      story.dataset.playing = String(playing);
      toggle.textContent = playing ? "Pause" : "Play";
      toggle.setAttribute("aria-pressed", String(!playing));
      schedule();
    }

    toggle.hidden = false;
    toggle.addEventListener("click", () => setPlaying(!playing));
    // Keyboard or pointer focus inside the carousel pauses it so readers are not rushed.
    story.addEventListener("focusin", () => { if (playing) setPlaying(false); });
    setPlaying(playing);
    show(0);
  }

  /** Marks the case-study rail link whose section is currently in view. */
  function setUpRail() {
    const links = [...document.querySelectorAll(".case-nav a[href^='#']")];
    if (!links.length || !("IntersectionObserver" in window)) return;
    const byId = new Map(links.map((link) => [link.getAttribute("href").slice(1), link]));
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const link of links) link.classList.toggle("is-current", link === byId.get(entry.target.id));
      }
    }, { rootMargin: "-30% 0px -60% 0px" });
    for (const id of byId.keys()) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
  }

  setUpFilters();
  setUpStory();
  setUpRail();
})();
