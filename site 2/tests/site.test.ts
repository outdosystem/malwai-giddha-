import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const logic = require('../assets/js/logic.js') as {
  getWrappedIndex: (current: number, delta: number, total: number) => number;
  matchesGalleryCategory: (itemCategory: string, activeFilter: string) => boolean;
  validateEnquiryFields: (fields: Record<string, string>) => {
    valid: boolean;
    errors: Array<{ field: string; message: string }>;
  };
};

const ROOT = path.resolve(import.meta.dirname, '..');

const HTML_PAGES = [
  'index.html',
  'about.html',
  'services.html',
  'gallery.html',
  'contact.html',
  'cities.html',
  'cities/ludhiana.html',
  'cities/patiala.html',
  'cities/bathinda.html',
  'cities/sangrur.html',
  'cities/moga.html',
  'cities/amritsar.html',
];

test('getWrappedIndex wraps slides cleanly in both directions', () => {
  assert.equal(logic.getWrappedIndex(0, -1, 4), 3);
  assert.equal(logic.getWrappedIndex(3, 1, 4), 0);
  assert.equal(logic.getWrappedIndex(1, 1, 4), 2);
  assert.equal(logic.getWrappedIndex(0, 1, 0), 0);
});

test('matchesGalleryCategory handles single and multi-category filters', () => {
  assert.equal(logic.matchesGalleryCategory('performances', 'all'), true);
  assert.equal(logic.matchesGalleryCategory('festivals performances', 'festivals'), true);
  assert.equal(logic.matchesGalleryCategory('festivals performances', 'performances'), true);
  assert.equal(logic.matchesGalleryCategory('weddings', 'instruments'), false);
  assert.equal(logic.matchesGalleryCategory('', 'weddings'), false);
});

test('validateEnquiryFields validates required fields and rejects malformed inputs', () => {
  const invalid = logic.validateEnquiryFields({
    fullName: 'A',
    phone: '123',
    email: 'not-an-email',
    city: '',
    eventType: '',
    eventDate: '',
  });
  assert.equal(invalid.valid, false);
  assert.equal(invalid.errors.length, 6);

  const valid = logic.validateEnquiryFields({
    fullName: 'Gurpreet Singh',
    phone: '+91 98123 45678',
    email: 'gurpreet@example.com',
    city: 'Patiala',
    eventType: 'Wedding Performance',
    eventDate: '2026-12-15',
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.errors.length, 0);
});

test('all 12 HTML pages exist, have unique SEO titles/descriptions, valid JSON-LD, and zero prohibited libs', () => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();

  for (const relPath of HTML_PAGES) {
    const fullPath = path.join(ROOT, relPath);
    assert.equal(fs.existsSync(fullPath), true, `Missing HTML page: ${relPath}`);

    const html = fs.readFileSync(fullPath, 'utf8');

    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    assert.ok(titleMatch && titleMatch[1].trim().length > 10, `Missing <title> in ${relPath}`);
    assert.equal(titles.has(titleMatch[1].trim()), false, `Duplicate <title> in ${relPath}`);
    titles.add(titleMatch[1].trim());

    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    assert.ok(descMatch && descMatch[1].trim().length > 30, `Missing meta description in ${relPath}`);
    assert.equal(descriptions.has(descMatch[1].trim()), false, `Duplicate meta description in ${relPath}`);
    descriptions.add(descMatch[1].trim());

    assert.match(html, /<link\s+rel="canonical"/i, `Missing canonical tag in ${relPath}`);

    const ldMatch = html.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i);
    assert.ok(ldMatch, `Missing JSON-LD structured data in ${relPath}`);
    assert.doesNotThrow(() => JSON.parse(ldMatch[1]), `Invalid JSON-LD in ${relPath}`);

    assert.doesNotMatch(html.toLowerCase(), /jquery|tailwindcss|reactjs|angular\.js|vue\.js/, `Prohibited library found in ${relPath}`);

    const imgMatches = [...html.matchAll(/<img[^>]+src="(\/[^"]+)"/gi)];
    for (const m of imgMatches) {
      const imgFile = path.join(ROOT, m[1].slice(1));
      assert.equal(fs.existsSync(imgFile), true, `Broken local image path ${m[1]} in ${relPath}`);
    }

    const hrefMatches = [...html.matchAll(/href="(\/[^"#?]+\.html)/gi)];
    for (const m of hrefMatches) {
      const targetFile = path.join(ROOT, m[1].slice(1));
      assert.equal(fs.existsSync(targetFile), true, `Broken internal link ${m[1]} in ${relPath}`);
    }

    assert.match(html, /id="backToTopBtn"/, `Missing #backToTopBtn in ${relPath}`);
    assert.match(html, /class="phulkari-ribbon-divider"/, `Missing .phulkari-ribbon-divider in ${relPath}`);
    assert.match(html, /Our Services<\/h3>/, `Missing consistent 4-column footer Services column in ${relPath}`);
    assert.match(html, /id="privacyPolicyModal"/, `Missing #privacyPolicyModal in ${relPath}`);
    assert.match(html, /id="termsModal"/, `Missing #termsModal in ${relPath}`);
    assert.doesNotMatch(html, /service-luxury-card|feature-point-icon/, `Stale pre-redesign class found in ${relPath}`);
  }
});

test('homepage and gallery satisfy redesign structure requirements', () => {
  const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.match(indexHtml, /Celebrate the Spirit of Punjab – Malwai Giddha/);
  assert.match(indexHtml, /Bring the Colours of Punjab to Your Celebration/);
  assert.match(indexHtml, /id="galleryFilterBar"/);
  assert.match(indexHtml, /id="galleryGrid"/);
  assert.match(indexHtml, /id="galleryLightboxModal"/);
  assert.match(indexHtml, /modal-fullscreen/);
  assert.match(indexHtml, /class="editorial-dropcap/);
  assert.match(indexHtml, /class="service-spotlight-panel"/);
  assert.match(indexHtml, /class="feature-point-num"/);

  const galleryHtml = fs.readFileSync(path.join(ROOT, 'gallery.html'), 'utf8');
  assert.match(galleryHtml, /id="galleryFilterBar"/);
  assert.match(galleryHtml, /id="galleryGrid"/);
  assert.match(galleryHtml, /modal-fullscreen/);
});

