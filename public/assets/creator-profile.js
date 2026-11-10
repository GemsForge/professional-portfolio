/**
 * Adds filtering, URL-backed post views, and guided prototype steps to the
 * statically rendered creator profile while keeping case-study links usable.
 */
(() => {
  const grid = document.querySelector("#creator-post-grid");
  const profileHeader = document.querySelector(".profile-header");
  const creatorTopbar = document.querySelector(".creator-topbar");

  // Reveal the compact navigation only after the full profile header has left the viewport.
  if (profileHeader && creatorTopbar && "IntersectionObserver" in window) {
    document.body.classList.add("creator-nav-ready");
    const profileObserver = new IntersectionObserver(([entry]) => {
      document.body.classList.toggle("creator-nav-visible", !entry.isIntersecting && entry.boundingClientRect.bottom <= 74);
    }, { rootMargin: "-74px 0px 0px 0px", threshold: 0 });
    profileObserver.observe(profileHeader);
  }
  const dialog = document.querySelector("#post-dialog");
  const media = document.querySelector("#post-media");
  const storyHost = document.querySelector("#post-story");
  const stories = document.querySelector("#post-stories");
  if (!(grid instanceof HTMLElement) || !(dialog instanceof HTMLDialogElement) || !(media instanceof HTMLElement) || !(storyHost instanceof HTMLElement) || !(stories instanceof HTMLElement)) return;

  const posts = [...stories.querySelectorAll("[data-post-view]")];
  const walkthroughPositions = new Map();
  let activePost = null;
  let opener = null;
  let openedFromGrid = false;

  /** Sets the visible walkthrough step and its matching image hotspot. */
  function setWalkthroughStep(story, nextIndex) {
    const steps = [...story.querySelectorAll("[data-walkthrough-step]")];
    if (!steps.length) return;
    const index = Math.max(0, Math.min(nextIndex, steps.length - 1));
    walkthroughPositions.set(story.dataset.postView, index);
    steps.forEach((step, stepIndex) => { step.hidden = stepIndex !== index; });
    const counter = story.querySelector("[data-step-counter]");
    if (counter) counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(steps.length).padStart(2, "0")}`;
    for (const hotspot of dialog.querySelectorAll("[data-visual-hotspot]")) hotspot.hidden = Number(hotspot.dataset.visualHotspot) !== index;
    const controls = story.querySelector(".walkthrough-controls");
    if (controls) controls.hidden = false;
  }

  /** Moves the current image after Tech on phones and restores the desktop media column at wider sizes. */
  function placePostVisual() {
    if (!activePost) return;
    const visual = dialog.querySelector(".post-main-visual");
    const mobileSlot = activePost.querySelector("[data-mobile-visual]");
    if (!visual || !mobileSlot) return;
    if (window.matchMedia("(max-width: 650px)").matches) mobileSlot.append(visual);
    else media.append(visual);
  }

  /** Opens the selected generated post and prepares its evidence image. */
  function renderPost(slug, { focus = true } = {}) {
    const post = posts.find((item) => item.dataset.postView === slug);
    if (!post) return false;
    if (activePost) {
      activePost.hidden = true;
      stories.append(activePost);
    }
    activePost = post;
    activePost.hidden = false;
    storyHost.replaceChildren(activePost);
    media.replaceChildren(activePost.querySelector(".post-visual-template").content.cloneNode(true));
    placePostVisual();
    const heading = activePost.querySelector("h2[id]");
    if (heading) dialog.setAttribute("aria-labelledby", heading.id);
    if (!dialog.open) dialog.showModal();
    const position = walkthroughPositions.get(slug) ?? 0;
    setWalkthroughStep(activePost, position);
    if (focus) activePost.focus({ preventScroll: true });
    return true;
  }

  /** Returns the open post to the grid and restores the visitor's scroll position. */
  function finishClose(state = history.state) {
    if (dialog.open) dialog.close();
    if (activePost) {
      activePost.hidden = true;
      stories.append(activePost);
    }
    activePost = null;
    media.replaceChildren();
    if (typeof state?.portfolioScroll === "number") window.scrollTo({ top: state.portfolioScroll, behavior: "instant" });
    if (opener?.isConnected) opener.focus({ preventScroll: true });
    opener = null;
    openedFromGrid = false;
  }

  /** Closes an in-app post through history so Back and Forward remain coherent. */
  function requestClose() {
    if (openedFromGrid && location.hash.startsWith("#post/")) {
      history.back();
      return;
    }
    if (location.hash.startsWith("#post/")) history.replaceState({ ...history.state }, "", `${location.pathname}${location.search}`);
    finishClose(history.state);
  }

  /** Opens a post with a history entry and preserves the visitor's grid position. */
  function navigateToPost(slug, trigger) {
    if (!posts.some((item) => item.dataset.postView === slug)) return;
    if (!dialog.open) opener = trigger instanceof HTMLElement ? trigger : document.activeElement;
    openedFromGrid = true;
    history.pushState({ portfolioPost: true, portfolioScroll: window.scrollY }, "", `#post/${slug}`);
    renderPost(slug);
  }

  /** Opens a direct post URL or closes the viewer after a Back navigation. */
  function syncHistory() {
    const match = location.hash.match(/^#post\/([^/?#]+)/);
    if (match) {
      const slug = decodeURIComponent(match[1]);
      openedFromGrid = Boolean(history.state?.portfolioPost);
      renderPost(slug);
      return;
    }
    if (dialog.open) finishClose(history.state);
  }

  // Featured tiles are all projects; grid clicks open stories without category or filter state.
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const link = target?.closest("[data-post-link]");
    if (link instanceof HTMLAnchorElement) {
      event.preventDefault();
      navigateToPost(link.dataset.postLink, link);
    }

    const nextButton = target?.closest("[data-adjacent-post]");
    if (nextButton && activePost) {
      const current = posts.indexOf(activePost);
      const offset = nextButton.dataset.adjacentPost === "next" ? 1 : -1;
      const target = posts[(current + offset + posts.length) % posts.length];
      navigateToPost(target.dataset.postView, nextButton);
      return;
    }
    if (target?.closest("[data-close-post]")) requestClose();

    const stepButton = target?.closest("[data-step-prev], [data-step-next]");
    if (stepButton && activePost) {
      const current = walkthroughPositions.get(activePost.dataset.postView) ?? 0;
      setWalkthroughStep(activePost, current + (stepButton.matches("[data-step-next]") ? 1 : -1));
      return;
    }
    const hotspot = target?.closest("[data-visual-hotspot]");
    if (hotspot && activePost) {
      const status = activePost.querySelector("[data-walkthrough-status]");
      if (status) status.textContent = `${hotspot.dataset.hotspotLabel}: ${hotspot.dataset.hotspotDetail}`;
    }
  });

  dialog.addEventListener("cancel", (event) => { event.preventDefault(); requestClose(); });
  dialog.addEventListener("click", (event) => { if (event.target === dialog) requestClose(); });
  window.addEventListener("popstate", syncHistory);
  window.addEventListener("hashchange", syncHistory);
  window.addEventListener("resize", placePostVisual);
  syncHistory();
})();
