/** Opens Aura Logbook screen pairs in a large, pannable dialog and restores focus on close. */
const dialog = document.querySelector("#aura-image-dialog");
const preview = document.querySelector("#aura-image-dialog-preview");
const title = document.querySelector("#aura-image-dialog-title");
const closeButton = document.querySelector("[data-aura-image-close]");

if (dialog instanceof HTMLDialogElement && preview instanceof HTMLImageElement && title instanceof HTMLElement && closeButton instanceof HTMLButtonElement) {
  let lastTrigger;

  const openImage = (trigger) => {
    const source = trigger.dataset.imageSrc;
    if (!source) return;

    lastTrigger = trigger;
    title.textContent = trigger.dataset.imageTitle ?? "Aura Logbook screen";
    preview.src = source;
    preview.alt = trigger.dataset.imageAlt ?? "";
    dialog.showModal();
  };

  document.querySelectorAll("[data-aura-image-trigger]").forEach((trigger) => {
    if (trigger instanceof HTMLButtonElement) trigger.addEventListener("click", () => openImage(trigger));
  });

  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    if (lastTrigger instanceof HTMLElement && lastTrigger.isConnected) lastTrigger.focus();
  });
}
