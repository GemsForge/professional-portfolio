import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { nextMode, themeLabel } from "../lib/theme-mode.mts";

const staticScript = await readFile("static-source/assets/theme.js", "utf8");
const component = await readFile("components/theme-toggle.tsx", "utf8");
const css = await readFile("static-source/assets/site.css", "utf8");

/**
 * Runs the static-page theme script against a minimal fake DOM and returns the
 * toggle it creates, so the test can click it like a visitor would.
 * @param {boolean} osDark - Whether the fake OS prefers dark.
 * @param {string | null} stored - Initial `gf-theme` value in fake storage.
 */
function runStaticToggle(osDark, stored = null) {
  const store = new Map(stored ? [["gf-theme", stored]] : []);
  const root = { dataset: {} };
  const links = { appendChild(button) { this.button = button; } };
  let onReady;
  const createElement = () => {
    const listeners = {};
    return {
      dataset: {}, attributes: {}, innerHTML: "",
      setAttribute(name, value) { this.attributes[name] = value; },
      addEventListener(type, listener) { listeners[type] = listener; },
      click() { listeners.click(); },
    };
  };
  vm.runInNewContext(staticScript, {
    document: {
      documentElement: root,
      addEventListener(type, listener) { onReady = listener; },
      querySelector: (selector) => (selector === ".sp-theme-toggle" ? null : links),
      createElement,
    },
    window: { matchMedia: () => ({ matches: osDark, addEventListener() {} }) },
    localStorage: {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => store.set(key, value),
      removeItem: (key) => store.delete(key),
    },
  });
  onReady();
  return { button: links.button, root, store };
}

for (const osDark of [false, true]) {
  const os = osDark ? "dark" : "light";

  test(`the theme cycle starts by flipping the visible theme on a ${os} OS`, () => {
    const opposite = osDark ? "light" : "dark";
    assert.equal(nextMode("system", osDark), opposite);
    assert.equal(nextMode(opposite, osDark), os);
    assert.equal(nextMode(os, osDark), "system");
    assert.equal(themeLabel("system", osDark), `Theme: System (${os}). Switch to ${opposite[0].toUpperCase()}${opposite.slice(1)}`);
  });

  test(`the static-page toggle matches the shared cycle on a ${os} OS`, () => {
    const { button, root, store } = runStaticToggle(osDark);
    let mode = "system";
    for (let step = 0; step < 4; step += 1) {
      assert.equal(button.dataset.themeMode, mode);
      assert.equal(button.attributes["aria-label"], themeLabel(mode, osDark));
      assert.equal(root.dataset.theme, mode === "system" ? undefined : mode);
      assert.equal(store.get("gf-theme"), mode === "system" ? undefined : mode);
      button.click();
      mode = nextMode(mode, osDark);
    }
  });
}

test("the static-page toggle starts from a stored choice", () => {
  const { button, root } = runStaticToggle(false, "dark");
  assert.equal(root.dataset.theme, "dark");
  assert.equal(button.dataset.themeMode, "dark");
});

test("the React toggle uses the shared rules and lets CSS pick the icon before hydration", () => {
  assert.match(component, /import \{ nextMode, themeLabel, type ThemeMode \} from "@\/lib\/theme-mode\.mts"/);
  for (const icon of ["system", "light", "dark"]) {
    assert.match(component, new RegExp(`<svg data-icon="${icon}"`));
  }
  assert.match(css, /\.sp-theme-toggle svg\[data-icon\]\{display:none\}/);
  assert.match(css, /:root:not\(\[data-theme="light"\]\):not\(\[data-theme="dark"\]\) \.sp-theme-toggle svg\[data-icon="system"\]/);
  assert.match(css, /:root\[data-theme="dark"\] \.sp-theme-toggle svg\[data-icon="dark"\]/);
});
