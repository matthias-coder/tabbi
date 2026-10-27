const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const G = require('../js/tabbi-gruppen.js');

function ladeKatalog() {
  const code = fs.readFileSync(path.resolve(__dirname, '../js/blaetter-katalog.js'), 'utf8');
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(code, context);
  return context.window.TABBI_KATALOG;
}

test('Gruppen-IDs in fester Reihenfolge', () => {
  assert.deepStrictEqual(
    G.GRUPPEN.map((g) => g.id),
    ['mengen', 'zerlegen', 'ordnen', 'rechnen', 'zehner']
  );
});

test('jede Gruppe hat Titel und Icon', () => {
  G.GRUPPEN.forEach((g) => {
    assert.ok(g.titel && g.titel.length > 0);
    assert.ok(g.icon && g.icon.length > 0);
  });
});

test('jeder der 13 Typen liegt in genau einer Gruppe', () => {
  const alle = [
    'punkte', 'finger', 'wuerfel_tuerme', 'aquarium', 'strichlisten', 'buendeln', 'seifenblasen',
    'zahlenhaus', 'zahlenfreunde',
    'nachbarn',
    'rechnen', 'zwerg_riese', 'zahlenmauern'
  ];
  const gesammelt = [];
  G.GRUPPEN.forEach((g) => g.typen.forEach((t) => gesammelt.push(t)));
  assert.strictEqual(gesammelt.length, 13);
  alle.forEach((t) => {
    assert.strictEqual(gesammelt.filter((x) => x === t).length, 1, t);
  });
});

test('gruppeFuerTyp und typenDerGruppe', () => {
  assert.strictEqual(G.gruppeFuerTyp('buendeln'), 'mengen');
  assert.strictEqual(G.gruppeFuerTyp('zahlenhaus'), 'zerlegen');
  assert.strictEqual(G.gruppeFuerTyp('nachbarn'), 'ordnen');
  assert.strictEqual(G.gruppeFuerTyp('zahlenmauern'), 'rechnen');
  assert.strictEqual(G.gruppeFuerTyp('unbekannt'), null);
  assert.deepStrictEqual(G.typenDerGruppe('zerlegen'), ['zahlenhaus', 'zahlenfreunde']);
  assert.deepStrictEqual(G.typenDerGruppe('zehner'), []);
  assert.deepStrictEqual(G.typenDerGruppe('unbekannt'), []);
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
  katalog
    .filter((b) => (b.fach || 'mathe') !== 'deutsch')
    .forEach((b) => assert.ok(ids.includes(b.gruppe), b.id + ': ' + b.gruppe));
  const b007 = katalog.filter((b) => b.blattId.startsWith('007_'));
  assert.ok(b007.length > 0);
  b007.forEach((b) => assert.strictEqual(b.gruppe, 'zehner'));
});
