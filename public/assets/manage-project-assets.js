const stepButtons = [...document.querySelectorAll("[data-workspace-step]")];
const stepPanels = [...document.querySelectorAll("[data-workspace-panel]")];
const wikiForm = document.querySelector("#wiki-upload-form");
const wikiFolder = document.querySelector("#wiki-folder");
const wikiMessage = document.querySelector("#wiki-message");
const wikiRefsBody = document.querySelector("#wiki-refs-body");
const wikiRefsStatus = document.querySelector("#wiki-refs-status");

/** Library folders accepted by lib/knowledge-server.ts; keep values in sync with its FOLDERS set. */
const wikiFolders = [
  ["handbooks/architecture", "Architecture"],
  ["handbooks/backend", "Backend"],
  ["handbooks/data", "Data"],
  ["handbooks/codex", "Codex"],
  ["handbooks/project-management", "Project management"],
  ["handbooks/git", "Git and GitHub"],
  ["handbooks/quality", "Quality"],
  ["governance", "Governance and standards"],
  ["governance/templates/ci", "CI templates"],
  ["governance/templates/development", "Development templates"],
  ["delivery", "Delivery references"],
  ["assets/logos", "Tool and brand logos"],
];
let wikiLoaded = false;

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

  if (stepName === "wiki-uploader" && !wikiLoaded) {
    wikiLoaded = true;
    void loadWikiReferences();
  }

  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("step", stepName);
    window.history.replaceState({}, "", url);
  }
}

/** Writes a status line under the uploader heading; errors use the alert role. */
function setWikiMessage(text, isError = false) {
  wikiMessage.textContent = text;
  wikiMessage.setAttribute("role", isError ? "alert" : "status");
  wikiMessage.style.color = isError ? "#9b2c2c" : "";
}

/** Builds one saved-reference row with text nodes only, so filenames cannot inject markup. */
function wikiRow(resource) {
  const row = document.createElement("tr");
  const name = document.createElement("td");
  const file = document.createElement("strong");
  file.textContent = resource.filename;
  const title = document.createElement("small");
  title.textContent = resource.title;
  title.style.display = "block";
  name.append(file, title);
  const type = document.createElement("td");
  type.textContent = resource.contentType.replace("text/", "").replace("application/", "");
  const area = document.createElement("td");
  area.textContent = wikiFolders.find(([path]) => path === resource.folder)?.[1] ?? resource.folder;
  const status = document.createElement("td");
  const chip = document.createElement("span");
  chip.className = "ws-chip pub";
  chip.textContent = "Saved";
  status.append(chip);
  const actions = document.createElement("td");
  if (resource.contentType === "text/markdown" || resource.contentType === "text/html") {
    const view = document.createElement("a");
    view.href = `/knowledge/${encodeURIComponent(resource.id)}`;
    view.textContent = "View";
    actions.append(view, " · ");
  }
  const download = document.createElement("a");
  download.href = `/api/knowledge/${encodeURIComponent(resource.id)}`;
  download.textContent = "Download";
  actions.append(download);
  row.append(name, type, area, status, actions);
  return row;
}

/** Loads the owner's saved references into the table. */
async function loadWikiReferences() {
  wikiRefsStatus.textContent = "Loading saved references…";
  try {
    const response = await fetch("/api/knowledge", { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!response.ok) throw new Error("Could not load your references. Refresh the page and try again.");
    const { resources = [] } = await response.json();
    wikiRefsBody.replaceChildren(...resources.map(wikiRow));
    wikiRefsStatus.textContent = resources.length
      ? `${resources.length} saved ${resources.length === 1 ? "reference" : "references"}.`
      : "No references yet. Upload a file above to add your first entry.";
  } catch (error) {
    wikiRefsStatus.textContent = error.message;
  }
}

wikiFolders.forEach(([path, label]) => wikiFolder.append(new Option(label, path)));
const requestedFolder = new URLSearchParams(window.location.search).get("folder");
if (wikiFolders.some(([path]) => path === requestedFolder)) wikiFolder.value = requestedFolder;

/** Uploads through the owner API instead of the form's no-script fallback action. */
wikiForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = wikiForm.querySelector("button[type=submit]");
  button.disabled = true;
  setWikiMessage("Adding reference…");
  try {
    const response = await fetch("/api/knowledge", { method: "POST", body: new FormData(wikiForm), cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Could not save this reference.");
    wikiForm.reset();
    setWikiMessage(`${data.resource?.title ?? "Reference"} added to your Developer Wiki.`);
    await loadWikiReferences();
  } catch (error) {
    setWikiMessage(error.message, true);
  } finally {
    button.disabled = false;
  }
});

stepButtons.forEach((button) => {
  button.addEventListener("click", () => selectStep(button.dataset.workspaceStep));
});

const requestedStep = new URLSearchParams(window.location.search).get("step");
selectStep(requestedStep === "wiki-uploader" ? requestedStep : "project-assets", false);
