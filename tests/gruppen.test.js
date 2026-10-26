'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const G = require('../js/tabbi-gruppen.js');

const ALLE_TYPEN = [
  'punkte', 'finger', 'wuerfel_tuerme', 'aquarium', 'strichlisten', 'buendeln', 'seifenblasen',
  'zahlenhaus', 'zahlenfreunde', 'nachbarn', 'rechnen', 'zwerg_riese', 'zahlenmauern'
];

function ladeKatalog() {
  const code = fs.readFileSync(path.join(ROOT, 'js', 'blaetter-katalog.js'), 'utf8');
  const window = {};
  vm.runInNewContext(code, { window });
  return window.TABBI_KATALOG;
}

test('Gruppen-IDs in fester Reihenfolge', () => {
  assert.deepStrictEqual(G.GRUPPEN.map((g) => g.id), ['mengen', 'zerlegen', 'ordnen', 'rechnen', 'zehner']);
});

test('jede Gruppe hat Titel und Icon', () => {
  G.GRUPPEN.forEach((g) => {
    assert.ok(g.titel && g.icon, g.id);
    assert.ok(Array.isArray(g.typen), g.id);
  });
});

test('jeder der 13 Typen liegt in genau einer Gruppe', () => {
  ALLE_TYPEN.forEach((typ) => {
    const treffer = G.GRUPPEN.filter((g) => g.typen.includes(typ));
    assert.strictEqual(treffer.length, 1, typ);
    assert.strictEqual(G.gruppeFuerTyp(typ), treffer[0].id, typ);
  });
  const summe = G.GRUPPEN.reduce((n, g) => n + g.typen.length, 0);
  assert.strictEqual(summe, ALLE_TYPEN.length);
});

test('gruppeFuerTyp und typenDerGruppe', () => {
  assert.strictEqual(G.gruppeFuerTyp('buendeln'), 'mengen');
  assert.strictEqual(G.gruppeFuerTyp('xyz'), null);
  assert.deepStrictEqual(G.typenDerGruppe('zerlegen'), ['zahlenhaus', 'zahlenfreunde']);
  assert.deepStrictEqual(G.typenDerGruppe('zehner'), []);
  assert.deepStrictEqual(G.typenDerGruppe('nope'), []);
});

test('maxZahlFuerTyp', () => {
  assert.strictEqual(G.maxZahlFuerTyp('strichlisten'), 8);
  assert.strictEqual(G.maxZahlFuerTyp('buendeln'), 8);
  ['zahlenfreunde', 'finger', 'wuerfel_tuerme', 'aquarium', 'seifenblasen'].forEach((t) =>
    assert.strictEqual(G.maxZahlFuerTyp(t), 10, t));
  ['zahlenhaus', 'nachbarn', 'punkte', 'rechnen', 'zahlenmauern', 'zwerg_riese'].forEach((t) =>
    assert.strictEqual(G.maxZahlFuerTyp(t), 20, t));
});

test('jeder Katalog-Eintrag hat eine gueltige Gruppe, Blatt 007 liegt in zehner', () => {
  const ids = G.GRUPPEN.map((g) => g.id);
  const katalog = ladeKatalog();
  assert.ok(katalog.length > 0);
  katalog.forEach((b) => assert.ok(ids.includes(b.gruppe), `${b.id}: ${b.gruppe}`));
  const b007 = katalog.filter((b) => b.blattId.startsWith('007_'));
  assert.ok(b007.length > 0);
  b007.forEach((b) => assert.strictEqual(b.gruppe, 'zehner'));
});
