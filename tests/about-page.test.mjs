import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { inflateSync } from "node:zlib";
import { test } from "node:test";

const page = new URL("../static-source/about/index.html", import.meta.url);
const homePage = new URL("../static-source/index.html", import.meta.url);
const stylesheet = new URL("../static-source/assets/site.css", import.meta.url);
const portrait = new URL("../static-source/assets/profile-photo.jpg", import.meta.url);
const gemsforgeLogo = new URL("../static-source/assets/gemsforge-logo.png", import.meta.url);

async function readTransparentPngCorners(fileUrl) {
  const png = await readFile(fileUrl);
  assert.deepEqual(png.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

  let width;
  let height;
  let bitDepth;
  let colorType;
  let interlace;
  const imageData = [];
  for (let offset = 8; offset < png.length;) {
    const length = png.readUInt32BE(offset);
    const type = png.toString("ascii", offset + 4, offset + 8);
    const data = png.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === "IDAT") {
      imageData.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset += length + 12;
  }

  assert.equal(bitDepth, 8, "logo should use 8-bit PNG channels");
  assert.equal(colorType, 6, "logo should contain an RGBA alpha channel");
  assert.equal(interlace, 0, "logo should use a non-interlaced PNG");

  const stride = width * 4;
  const compressed = inflateSync(Buffer.concat(imageData));
  const alphaCorners = [];
  let cursor = 0;
  let previous = new Uint8Array(stride);
  for (let y = 0; y < height; y += 1) {
    const filter = compressed[cursor++];
    const row = Uint8Array.from(compressed.subarray(cursor, cursor + stride));
    cursor += stride;

    for (let index = 0; index < stride; index += 1) {
      const left = index >= 4 ? row[index - 4] : 0;
      const above = previous[index];
      const upperLeft = index >= 4 ? previous[index - 4] : 0;
      let predictor = 0;
      if (filter === 1) predictor = left;
      else if (filter === 2) predictor = above;
      else if (filter === 3) predictor = Math.floor((left + above) / 2);
      else if (filter === 4) {
        const estimate = left + above - upperLeft;
        const leftDistance = Math.abs(estimate - left);
        const aboveDistance = Math.abs(estimate - above);
        const upperLeftDistance = Math.abs(estimate - upperLeft);
        predictor = leftDistance <= aboveDistance && leftDistance <= upperLeftDistance
          ? left
          : aboveDistance <= upperLeftDistance ? above : upperLeft;
      } else {
        assert.equal(filter, 0, `unsupported PNG filter: ${filter}`);
      }
      row[index] = (row[index] + predictor) & 0xff;
    }

    if (y === 0 || y === height - 1) {
      alphaCorners.push(row[3], row[stride - 1]);
    }
    previous = row;
  }
  return alphaCorners;
}

test("About page presents the optimized profile photo accessibly", async () => {
  const [html, css, imageStats] = await Promise.all([
    readFile(page, "utf8"),
    readFile(stylesheet, "utf8"),
    stat(portrait),
  ]);

  assert.match(html, /<img[^>]*src="\/assets\/profile-photo\.jpg"[^>]*alt="Diamond Brown smiling at the camera\."/);
  assert.equal((html.match(/src="\/assets\/profile-photo\.jpg"/g) ?? []).length, 1, "About should show the portrait once");
  assert.match(html, /width="1200"\s+height="1200"/);
  const homeHtml = await readFile(homePage, "utf8");
  assert.match(homeHtml, /<div class="hero-art">[\s\S]*?role="img" aria-label="Abstract intersecting paths converge into a diamond, then emerge as aligned lines"/);
  assert.equal((homeHtml.match(/src="\/assets\/profile-photo\.jpg"/g) ?? []).length, 1, "Home should show the portrait once in the About section");
  assert.match(homeHtml, /<section id="about" class="dark"><div class="wrap about-grid"><div><img class="about-section-portrait" src="\/assets\/profile-photo\.jpg"/);
  assert.match(css, /\.about-hero\s*\{[^}]*display:grid/);
  assert.match(css, /\.about-section-portrait\s*\{[^}]*aspect-ratio:4\/5/);
  assert.match(css, /@media\s*\(max-width:\s*650px\)\s*\{\.about-hero\s*\{[^}]*grid-template-columns:1fr/);
  const contactPage = await readFile(new URL("../static-source/contact/index.html", import.meta.url), "utf8");
  assert.doesNotMatch(contactPage, /profile-photo\.jpg/);
  assert.ok(imageStats.size < 500_000, "profile photo should stay below 500 KB");
});

test("About page GemsForge mark preserves transparent edges on the dark section", async () => {
  const [html, css, alphaCorners] = await Promise.all([
    readFile(page, "utf8"),
    readFile(stylesheet, "utf8"),
    readTransparentPngCorners(gemsforgeLogo),
  ]);

  assert.match(html, /<img src="\/assets\/gemsforge-logo\.png" alt="GemsForge diamond logo"/);
  assert.ok(alphaCorners.every((alpha) => alpha === 0), "logo corners should be fully transparent");

  const logoRules = [...css.matchAll(/\.gems img\{([^}]*)\}/g)];
  assert.ok(logoRules.length > 0, "About logo should have an explicit image rule");
  const declarations = logoRules.at(-1)[1];
  assert.match(declarations, /background:transparent/);
  assert.match(declarations, /padding:0/);
  assert.match(declarations, /border-radius:0/);
});
