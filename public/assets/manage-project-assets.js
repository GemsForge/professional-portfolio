const stepButtons = [...document.querySelectorAll("[data-workspace-step]")];
const stepPanels = [...document.querySelectorAll("[data-workspace-panel]")];
const uploaderFrame = document.querySelector("#wiki-uploader-frame");
const uploaderUrl = "/admin/knowledge/uploader";

/** Shows one owner workflow and preserves the selected step in the page URL. */
function selectStep(stepName, updateUrl = true) {
  stepButtons.forEach((button) => {
    const selected = button.dataset.workspaceStep === stepName;
    if (selected) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  });
  stepPanels.forEach((panel) => {
    panel.hidden = panel.dataset.workspacePanel !== stepName;
  });

  if (stepName === "wiki-uploader" && !uploaderFrame.src) {
    const selectedFolder = new URLSearchParams(window.location.search).get("folder");
    const uploader = new URL(uploaderUrl, window.location.origin);
    if (selectedFolder) uploader.searchParams.set("folder", selectedFolder);
    uploaderFrame.src = uploader.toString();
  }

  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("step", stepName);
    window.history.replaceState({}, "", url);
  }
}

/** Accepts only resize messages from this page's own owner-gated uploader frame. */
window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin || event.source !== uploaderFrame.contentWindow) return;
  if (event.data?.type !== "knowledge-uploader-resize") return;

  const height = Number(event.data.height);
  if (!Number.isFinite(height)) return;
  uploaderFrame.style.height = `${Math.max(600, Math.min(height, 6000))}px`;
});

stepButtons.forEach((button) => {
  button.addEventListener("click", () => selectStep(button.dataset.workspaceStep));
});

const requestedStep = new URLSearchParams(window.location.search).get("step");
selectStep(requestedStep === "wiki-uploader" ? requestedStep : "project-assets", false);
