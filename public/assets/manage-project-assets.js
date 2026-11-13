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
  wikiMessage.style.color = isError ? "var(--error)" : "";
}

/** Matches the server rule: records saved before publishing existed have no flag and are live. */
const isLive = (resource) => resource.published !== false;
const folderLabel = (path) => wikiFolders.find(([value]) => value === path)?.[1] ?? path;
const publishedFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

/** Creates a text-only element so filenames and titles can never inject markup. */
function textElement(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

/** Builds an icon-only action button; the label names the action and reference for screen readers and tooltips. */
function iconButton(icon, label, className = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `ws-icon-btn ${className}`.trim();
  button.setAttribute("aria-label", label);
  button.title = label;
  button.innerHTML = icon;
  return button;
}
const EDIT_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
const DELETE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>';

/** Sends a multipart PATCH for one reference and returns the updated record. */
async function updateReference(id, fields) {
  const body = new FormData();
  Object.entries(fields).forEach(([key, value]) => body.append(key, value));
  const response = await fetch(`/api/knowledge/${encodeURIComponent(id)}`, { method: "PATCH", body, cache: "no-store" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not update this reference.");
  return data.resource;
}

/** Builds the inline edit row: rename, move to another folder, or replace the stored file. */
function editRow(resource, row) {
  const editRowElement = document.createElement("tr");
  editRowElement.className = "ws-edit-row";
  const cell = document.createElement("td");
  cell.colSpan = 4;
  const form = document.createElement("form");
  const prefix = `wiki-edit-${resource.id}`;
  form.innerHTML = `
    <div class="ws-form">
      <div class="ws-field"><label for="${prefix}-title">Title <b>· required</b></label><input id="${prefix}-title" name="title" required maxlength="160"></div>
      <div class="ws-field"><label for="${prefix}-folder">Library folder</label><select id="${prefix}-folder" name="folder" required></select></div>
      <div class="ws-field full"><label for="${prefix}-file">Replace reference file · optional</label><input id="${prefix}-file" name="file" type="file" accept=".pdf,.docx,.md,.markdown,.html,.htm,.txt,image/png,image/jpeg,image/webp,image/tiff"></div>
    </div>
    <div class="ws-edit-actions"><button class="ws-btn-gold" type="submit">Save changes</button><button class="ws-link-btn" type="button" data-cancel>Cancel</button></div>`;
  form.elements.title.value = resource.title;
  wikiFolders.forEach(([path, label]) => form.elements.folder.append(new Option(label, path)));
  form.elements.folder.value = resource.folder;
  // Escape backs out of the editor the same way Cancel does.
  form.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); form.querySelector("[data-cancel]").click(); }
  });
  form.querySelector("[data-cancel]").addEventListener("click", () => {
    editRowElement.remove();
    row.querySelector("[data-edit]").setAttribute("aria-expanded", "false");
    row.querySelector("[data-edit]").focus();
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const save = form.querySelector("button[type=submit]");
    save.disabled = true;
    try {
      const fields = { title: form.elements.title.value, folder: form.elements.folder.value };
      if (form.elements.file.files[0]) fields.file = form.elements.file.files[0];
      const updated = await updateReference(resource.id, fields);
      setWikiMessage(`${updated.title} saved.`);
      await loadWikiReferences();
    } catch (error) {
      setWikiMessage(error.message, true);
      save.disabled = false;
    }
  });
  cell.append(form);
  editRowElement.append(cell);
  return editRowElement;
}

/** Builds one saved-reference row with status, publish time, and inline Publish/Unpublish and Edit. */
function wikiRow(resource) {
  const live = isLive(resource);
  const row = document.createElement("tr");
  const name = document.createElement("td");
  // File type and folder ride under the name so the table needs only four columns.
  const meta = `${resource.filename.split(".").pop().toUpperCase()} · ${folderLabel(resource.folder)}`;
  name.append(textElement("strong", resource.filename), textElement("small", resource.title), textElement("small", meta, "ws-ref-meta"));
  const status = document.createElement("td");
  status.append(textElement("span", live ? "Live" : "Draft", `ws-chip ${live ? "pub" : "draft"}`));
  const published = document.createElement("td");
  // Legacy live records predate publish tracking, so their upload time stands in.
  const publishedAt = live ? resource.publishedAt ?? resource.createdAt : null;
  if (publishedAt) {
    const time = textElement("time", publishedFormat.format(new Date(publishedAt)));
    time.dateTime = publishedAt;
    published.append(time);
  } else published.append(textElement("span", "—", "muted"));

  const actions = document.createElement("td");
  const actionGroup = document.createElement("div");
  actionGroup.className = "ws-row-actions";
  const toggle = textElement("button", live ? "Unpublish" : "Publish", "ws-link-btn");
  toggle.type = "button";
  toggle.setAttribute("aria-label", `${live ? "Unpublish" : "Publish"} ${resource.title}`);
  toggle.addEventListener("click", async () => {
    toggle.disabled = true;
    try {
      const updated = await updateReference(resource.id, { published: String(!live) });
      setWikiMessage(`${updated.title} is now ${live ? "a draft" : "live in the Developer Wiki"}.`);
      await loadWikiReferences();
    } catch (error) {
      setWikiMessage(error.message, true);
      toggle.disabled = false;
    }
  });
  const edit = iconButton(EDIT_ICON, `Edit ${resource.title}`);
  edit.dataset.edit = "";
  edit.setAttribute("aria-expanded", "false");
  edit.addEventListener("click", () => {
    const open = row.nextElementSibling?.classList.contains("ws-edit-row");
    if (open) {
      row.nextElementSibling.remove();
      edit.setAttribute("aria-expanded", "false");
      return;
    }
    const panel = editRow(resource, row);
    row.after(panel);
    edit.setAttribute("aria-expanded", "true");
    panel.querySelector("input[name=title]").focus();
  });
  // Delete is permanent (record and file), so it swaps the actions for an inline confirmation first.
  const remove = iconButton(DELETE_ICON, `Delete ${resource.title}`, "ws-icon-danger");
  remove.addEventListener("click", () => {
    const confirmGroup = document.createElement("div");
    confirmGroup.className = "ws-row-actions";
    confirmGroup.setAttribute("role", "group");
    confirmGroup.setAttribute("aria-label", `Confirm deleting ${resource.title}`);
    const yes = textElement("button", "Delete permanently", "ws-link-btn ws-link-danger");
    yes.type = "button";
    const no = textElement("button", "Cancel", "ws-link-btn");
    no.type = "button";
    no.addEventListener("click", () => { confirmGroup.replaceWith(actionGroup); remove.focus(); });
    // Escape cancels the delete, never confirms it.
    confirmGroup.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !no.disabled) { event.preventDefault(); no.click(); }
    });
    yes.addEventListener("click", async () => {
      yes.disabled = no.disabled = true;
      try {
        const response = await fetch(`/api/knowledge/${encodeURIComponent(resource.id)}`, { method: "DELETE", cache: "no-store" });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not delete this reference.");
        setWikiMessage(`${resource.title} deleted.`);
        await loadWikiReferences();
      } catch (error) {
        setWikiMessage(error.message, true);
        yes.disabled = no.disabled = false;
      }
    });
    confirmGroup.append(yes, no);
    actionGroup.replaceWith(confirmGroup);
    no.focus();
  });
  actionGroup.append(toggle, edit, remove);
  actions.append(actionGroup);
  // Captions for the stacked card layout the table switches to in a narrow panel.
  [[status, "Status"], [published, "Published"]].forEach(([cell, label]) => { cell.dataset.label = label; });
  row.append(name, status, published, actions);
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
    // Drop the static "No references yet" row so a failed load never reads as an empty library.
    wikiRefsBody.replaceChildren();
    wikiRefsStatus.textContent = `Could not load saved references (${error.message}). Refresh to try again.`;
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
    setWikiMessage(`${data.resource?.title ?? "Reference"} saved as a draft. Publish it to show it in the Developer Wiki.`);
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
