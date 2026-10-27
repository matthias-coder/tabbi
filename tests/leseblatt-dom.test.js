const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const htmlPath = path.resolve(__dirname, '../blaetter/012_leseblatt_silben_und_woerter.html');

test('012_leseblatt_silben_und_woerter.html existiert und ist wohlgeformt', () => {
  assert.ok(fs.existsSync(htmlPath), 'Datei blaetter/012_leseblatt_silben_und_woerter.html muss existieren');
  const content = fs.readFileSync(htmlPath, 'utf8');
  assert.ok(content.length > 500, 'Datei darf nicht leer sein');
  assert.ok(content.includes('<!DOCTYPE html>'), 'Muss ein HTML5-Dokument sein');
  assert.ok(content.includes('data-blatt-id="012_leseblatt_silben_und_woerter"'), 'Muss data-blatt-id haben');
});

test('Eiserne Grundregel: Keine verbotenen input-Elemente', () => {
  const content = fs.readFileSync(htmlPath, 'utf8');
  assert.ok(!content.includes('<input'), 'Darf keine <input>-Tags enthalten (Eiserne Grundregel)');
});

test('Referenziert korrekte CSS- und JS-Dateien', () => {
  const content = fs.readFileSync(htmlPath, 'utf8');
  assert.ok(content.includes('css/tabbi.css'), 'Muss css/tabbi.css einbinden');
  assert.ok(content.includes('js/tabbi-lesekorpus.js'), 'Muss js/tabbi-lesekorpus.js einbinden');
});

test('Enthält erforderliche DOM-Elemente für Druck und Vollbild-Karten', () => {
  const content = fs.readFileSync(htmlPath, 'utf8');
  assert.ok(content.includes('id="lese-karten-overlay"'), 'Muss #lese-karten-overlay enthalten');
  assert.ok(content.includes('id="silben-raster"'), 'Muss #silben-raster enthalten');
  assert.ok(content.includes('id="woerter-grid"'), 'Muss #woerter-grid enthalten');
  assert.ok(content.includes('id="btn-karten-starten"'), 'Muss Button zum Starten der Karten enthalten');
  assert.ok(content.includes('druck-kopf'), 'Muss druck-kopf enthalten');
});
