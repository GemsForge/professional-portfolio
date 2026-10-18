import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const page = new URL("../static-source/contact/index.html", import.meta.url);
test("contact page stays text-led and does not duplicate the profile photo", async () => {
  const html = await readFile(page, "utf8");

  assert.match(html, /<h1>A useful conversation<br>starts here\.<\/h1>/);
  assert.match(html, /mailto:diamondbrown\.tech@gmail\.com/);
  assert.doesNotMatch(html, /profile-photo\.jpg|contact-portrait/);
});
