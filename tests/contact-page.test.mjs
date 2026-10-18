import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const page = new URL("../static-source/contact/index.html", import.meta.url);
test("contact page stays text-led and does not duplicate the profile photo", async () => {
  const html = await readFile(page, "utf8");

  assert.match(html, /<h1>A useful conversation<br>starts here\.<\/h1>/);
  assert.match(html, /mailto:diamondbrown\.tech@gmail\.com/);
  assert.match(html, /href="https:\/\/www\.linkedin\.com\/in\/diamond-brown\/"/);
  assert.match(html, /href="https:\/\/www\.upwork\.com\/freelancers\/~0197547516c060948d\?mp_source=share"/);
  assert.match(html, /href="https:\/\/github\.com\/GemsForge"/);
  assert.match(html, /src="\/assets\/social\/linkedin\.svg" alt="" aria-hidden="true"/);
  assert.match(html, /src="\/assets\/social\/upwork\.svg" alt="" aria-hidden="true"/);
  assert.match(html, /src="\/assets\/social\/github\.svg" alt="" aria-hidden="true"/);
  assert.match(html, /aria-label="View Diamond Brown on LinkedIn"/);
  assert.match(html, /aria-label="View Diamond Brown on Upwork"/);
  assert.match(html, /aria-label="View GemsForge on GitHub"/);
  assert.equal((html.match(/target="_blank" rel="noopener noreferrer" aria-label="View /g) ?? []).length, 3);
  assert.doesNotMatch(html, /profile-photo\.jpg|contact-portrait/);
});
