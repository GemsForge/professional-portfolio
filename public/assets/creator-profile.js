/**
 * Adds experience story cards, URL-backed post views, and guided prototype
 * steps to the statically rendered social profile. Every highlight and tile is
 * a real link first, so the page still works without JavaScript.
 */
(() => {
  setUpHighlights();
  setUpAvatarGreeting();

  const grid = document.querySelector("#creator-post-grid");
  const dialog = document.querySelector("#post-dialog");
  const media = document.querySelector("#post-media");
  const storyHost = document.querySelector("#post-story");
  const stories = document.querySelector("#post-stories");
  // A second native dialog enlarges the current step without leaving the active walkthrough.
  const imageDialog = document.querySelector("#post-image-dialog");
  const enlargedImage = document.querySelector("#post-image-dialog-preview");
  const imageDialogTitle = document.querySelector("#post-image-dialog-title");
  const imageDialogClose = document.querySelector("[data-close-post-image]");
  if (!(grid instanceof HTMLElement) || !(dialog instanceof HTMLDialogElement) || !(media instanceof HTMLElement) || !(storyHost instanceof HTMLElement) || !(stories instanceof HTMLElement)) return;

  const posts = [...stories.querySelectorAll("[data-post-view]")];
  const walkthroughPositions = new Map();
  let activePost = null;
  let opener = null;
  let openedFromGrid = false;
  let imageOpener = null;

  /**
   * Sets the visible walkthrough step. A step with data-step-screenshot shows that real
   * app screen (crossfading in) and moves its hotspot to data-step-hotspot-x/y, or hides
   * it when the screenshot has none; other steps restore the illustration and its
   * hotspot. Arrows disable at each end, dots track progress, and `announce` reads the
   * new step to screen readers after a button press.
   */
  function setWalkthroughStep(story, nextIndex, { announce = false } = {}) {
    const steps = [...story.querySelectorAll("[data-walkthrough-step]")];
    if (!steps.length) return;
    const index = Math.max(0, Math.min(nextIndex, steps.length - 1));
    const step = steps[index];
    walkthroughPositions.set(story.dataset.postView, index);
    steps.forEach((item, stepIndex) => { item.hidden = stepIndex !== index; });
    const screenshot = step.dataset.stepScreenshot;
    const image = dialog.querySelector(".post-visual-stage img");
    const zoom = dialog.querySelector("[data-post-image-zoom]");
    if (image instanceof HTMLImageElement) {
      image.dataset.defaultSrc ??= image.getAttribute("src") ?? "";
      image.dataset.defaultAlt ??= image.alt;
      const nextSrc = screenshot ?? image.dataset.defaultSrc;
      if (image.getAttribute("src") !== nextSrc) {
        image.src = nextSrc;
        image.classList.remove("is-fading");
        void image.offsetWidth; // restart the crossfade animation
        image.classList.add("is-fading");
      }
      image.alt = screenshot ? step.dataset.stepScreenshotAlt ?? "" : image.dataset.defaultAlt;
      if (zoom instanceof HTMLButtonElement) zoom.setAttribute("aria-label", `Open walkthrough image, step ${index + 1}: ${step.querySelector("h4")?.textContent ?? ""} in the enlarged viewer`);
      image.closest(".post-main-visual")?.classList.toggle("is-step-screenshot", Boolean(screenshot));
      image.classList.remove("is-fading");
    }
    for (const hotspot of dialog.querySelectorAll("[data-visual-hotspot]")) {
      hotspot.dataset.defaultX ??= hotspot.style.getPropertyValue("--hotspot-x");
      hotspot.dataset.defaultY ??= hotspot.style.getPropertyValue("--hotspot-y");
      hotspot.dataset.defaultLabel ??= hotspot.dataset.hotspotLabel ?? "";
      const own = Number(hotspot.dataset.visualHotspot) === index;
      const onScreen = screenshot && step.dataset.stepHotspotX;
      const x = onScreen ? `${step.dataset.stepHotspotX}%` : hotspot.dataset.defaultX;
      const y = onScreen ? `${step.dataset.stepHotspotY}%` : hotspot.dataset.defaultY;
      const label = onScreen ? step.dataset.stepHotspotLabel ?? "" : hotspot.dataset.defaultLabel;
      hotspot.style.setProperty("--hotspot-x", x);
      hotspot.style.setProperty("--hotspot-y", y);
      hotspot.dataset.hotspotLabel = label;
      hotspot.setAttribute("aria-label", `Explore: ${label}`);
      hotspot.hidden = !own || Boolean(screenshot && !onScreen);
    }
    const previous = dialog.querySelector("[data-step-prev]");
    const next = dialog.querySelector("[data-step-next]");
    if (previous instanceof HTMLButtonElement && next instanceof HTMLButtonElement) {
      const focused = document.activeElement;
      previous.disabled = index === 0;
      next.disabled = index === steps.length - 1;
      // A disabled arrow is hidden; move focus to the other arrow instead of losing it.
      if (focused === next && next.disabled && !previous.disabled) previous.focus({ preventScroll: true });
      if (focused === previous && previous.disabled && !next.disabled) next.focus({ preventScroll: true });
    }
    dialog.querySelectorAll(".post-step-dots span").forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === index));
    const status = story.querySelector("[data-walkthrough-status]");
    if (status) status.textContent = "";
    const announcer = story.querySelector("[data-step-announce]");
    if (announcer && announce) announcer.textContent = `Step ${index + 1} of ${steps.length}: ${step.querySelector("h4")?.textContent ?? ""}`;
  }

  const uploadedScreens = new Map();

  /**
   * Loads a project's published attachments from the owner asset manager once per
   * project. Any failure (offline, no storage) resolves to an empty list, so the
   * built-in pictures stay in place.
   */
  function loadUploadedScreens(slug) {
    if (!uploadedScreens.has(slug)) {
      uploadedScreens.set(slug, fetch(`/api/media?project=${encodeURIComponent(slug)}`)
        .then((response) => (response.ok ? response.json() : {}))
        .then(({ attachments = [] }) => attachments)
        .catch(() => []));
    }
    return uploadedScreens.get(slug);
  }

  /**
   * Writes uploaded walkthrough screenshots onto the story's step items, overriding any
   * catalog screenshot for that step. Attachments arrive newest first, so the newest
   * published image wins a step. When every step has a screen, the section becomes an
   * "App tour" without the prototype disclaimer. Returns true when anything changed.
   */
  function applyUploadedScreens(story, attachments) {
    const steps = [...story.querySelectorAll("[data-walkthrough-step]")];
    const byStep = new Map();
    for (const item of attachments) {
      if (item.kind === "image" && item.placement && !byStep.has(item.placement.step)) byStep.set(item.placement.step, item);
    }
    if (!byStep.size) return false;
    steps.forEach((step, index) => {
      const item = byStep.get(index);
      if (!item) return;
      step.dataset.stepScreenshot = item.url;
      step.dataset.stepScreenshotAlt = item.alt;
      const marker = item.placement.marker;
      if (marker) {
        step.dataset.stepHotspotX = String(marker.x);
        step.dataset.stepHotspotY = String(marker.y);
        step.dataset.stepHotspotLabel = marker.label;
      } else {
        delete step.dataset.stepHotspotX;
        delete step.dataset.stepHotspotY;
        delete step.dataset.stepHotspotLabel;
      }
    });
    const withScreens = steps.filter((step) => step.dataset.stepScreenshot).length;
    const eyebrow = story.querySelector(".walkthrough .eyebrow");
    const disclaimer = story.querySelector(".walkthrough-disclaimer");
    if (withScreens === steps.length) {
      if (eyebrow) eyebrow.textContent = "App tour";
      disclaimer?.remove();
    } else if (disclaimer) {
      disclaimer.textContent = "Illustrated steps follow the documented project flow; screenshots come from the app.";
    }
    return true;
  }

  /** Moves the picture above the walkthrough on phones and back to the media column at wider sizes. */
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
    // Owner-uploaded step screenshots arrive asynchronously; re-render the current step if the post is still open.
    loadUploadedScreens(slug).then((attachments) => {
      if (activePost === post && applyUploadedScreens(post, attachments)) setWalkthroughStep(post, walkthroughPositions.get(slug) ?? 0);
    });
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

  /**
   * Opens a post and preserves the visitor's grid position. Opening from the grid adds
   * one history entry; moving between posts with Next/Previous replaces it, so Close
   * (history.back) always returns to the grid in a single step.
   */
  function navigateToPost(slug, trigger) {
    if (!posts.some((item) => item.dataset.postView === slug)) return;
    const browsing = dialog.open && location.hash.startsWith("#post/");
    if (!dialog.open) opener = trigger instanceof HTMLElement ? trigger : document.activeElement;
    if (browsing) {
      history.replaceState({ ...history.state, portfolioPost: openedFromGrid }, "", `#post/${slug}`);
    } else {
      openedFromGrid = true;
      history.pushState({ portfolioPost: true, portfolioScroll: window.scrollY }, "", `#post/${slug}`);
    }
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

  // Project tiles and the diagram post open project stories; highlight links are handled by setUpHighlights.
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
      setWalkthroughStep(activePost, current + (stepButton.matches("[data-step-next]") ? 1 : -1), { announce: true });
      return;
    }
    const zoomButton = target?.closest("[data-post-image-zoom]");
    if (zoomButton instanceof HTMLButtonElement && activePost) {
      const image = zoomButton.querySelector("img");
      if (image instanceof HTMLImageElement && imageDialog instanceof HTMLDialogElement && enlargedImage instanceof HTMLImageElement && imageDialogTitle instanceof HTMLElement) {
        const currentStep = activePost.querySelector("[data-walkthrough-step]:not([hidden]) h4")?.textContent;
        const postTitle = activePost.querySelector("h2")?.textContent;
        imageOpener = zoomButton;
        imageDialogTitle.textContent = [postTitle, currentStep].filter(Boolean).join(" · ") || "Walkthrough image";
        enlargedImage.src = image.currentSrc || image.src;
        enlargedImage.alt = image.alt;
        imageDialog.showModal();
        if (imageDialogClose instanceof HTMLButtonElement) imageDialogClose.focus({ preventScroll: true });
      }
      return;
    }
    if (target?.closest("[data-close-post-image]") && imageDialog instanceof HTMLDialogElement) imageDialog.close();
    const hotspot = target?.closest("[data-visual-hotspot]");
    if (hotspot && activePost) {
      const status = activePost.querySelector("[data-walkthrough-status]");
      if (status) status.textContent = `${hotspot.dataset.hotspotLabel}: ${hotspot.dataset.hotspotDetail}`;
    }
  });

  dialog.addEventListener("cancel", (event) => { event.preventDefault(); requestClose(); });
  dialog.addEventListener("click", (event) => { if (event.target === dialog) requestClose(); });
  imageDialog?.addEventListener("click", (event) => { if (event.target === imageDialog) imageDialog.close(); });
  imageDialog?.addEventListener("close", () => {
    if (imageOpener?.isConnected) imageOpener.focus({ preventScroll: true });
    imageOpener = null;
  });
  // popstate fires for Back/Forward and for fragment navigation, so it is the only history listener.
  window.addEventListener("popstate", syncHistory);
  window.addEventListener("resize", placePostVisual);
  syncHistory();
})();

/**
 * Upgrades experience highlight links into full-screen story cards. Stories
 * open in highlight order, Next wraps to the first story, and closing returns
 * focus to the element that opened the dialog.
 */
function setUpHighlights() {
  const dialog = document.querySelector("#highlight-dialog");
  if (!(dialog instanceof HTMLDialogElement)) return;
  const stories = [...dialog.querySelectorAll("[data-highlight-view]")];
  let opener = null;

  /** Shows one story and moves focus to its heading region. */
  function show(name) {
    const story = stories.find((item) => item.dataset.highlightView === name);
    if (!story) return false;
    for (const item of stories) item.hidden = item !== story;
    dialog.setAttribute("aria-labelledby", story.getAttribute("aria-labelledby") ?? "");
    if (!dialog.open) dialog.showModal();
    story.querySelector("[data-close-highlight]")?.focus({ preventScroll: true });
    return true;
  }

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const link = target?.closest("[data-highlight-link]");
    if (link instanceof HTMLAnchorElement && !dialog.open) {
      opener = link;
      if (show(link.dataset.highlightLink)) event.preventDefault();
      return;
    }
    if (target?.closest("[data-highlight-next]")) {
      const current = stories.findIndex((item) => !item.hidden);
      show(stories[(current + 1) % stories.length].dataset.highlightView);
      return;
    }
    if (target?.closest("[data-close-highlight]") || target === dialog) dialog.close();
  });

  dialog.addEventListener("close", () => {
    if (opener?.isConnected) opener.focus({ preventScroll: true });
    opener = null;
  });
}

/**
 * Decorative avatar greeting. A mouse hover (or a tap/pen press, which toggles it)
 * adds .is-greeting so CSS draws the ring, then types the tag's data-hello-text one
 * character at a time. Leaving resets it. With reduced motion the message appears at
 * once. The whole effect is aria-hidden; the photo keeps its own alt text.
 */
function setUpAvatarGreeting() {
  const ring = document.querySelector("[data-avatar-greeting]");
  const output = ring?.querySelector("[data-hello-text]");
  if (!(ring instanceof HTMLElement) || !(output instanceof HTMLElement)) return;
  const message = output.dataset.helloText ?? "";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let timer = 0;

  /** Writes the first `count` characters, then schedules the next one. */
  function type(count) {
    output.textContent = message.slice(0, count);
    if (count < message.length) timer = window.setTimeout(() => type(count + 1), 75);
  }

  function greet() {
    window.clearTimeout(timer);
    ring.classList.add("is-greeting");
    if (reducedMotion.matches) output.textContent = message;
    else timer = window.setTimeout(() => type(1), 300); // let the ring start drawing first
  }

  function reset() {
    window.clearTimeout(timer);
    ring.classList.remove("is-greeting");
    output.textContent = "";
  }

  ring.addEventListener("pointerenter", (event) => { if (event.pointerType === "mouse") greet(); });
  ring.addEventListener("pointerleave", (event) => { if (event.pointerType === "mouse") reset(); });
  ring.addEventListener("pointerup", (event) => {
    if (event.pointerType !== "mouse") (ring.classList.contains("is-greeting") ? reset : greet)();
  });
}
