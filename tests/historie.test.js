'use strict';
const test = require('node:test');
const assert = require('node:assert');

const H = require('../js/tabbi-historie.js');

const KEY = 'tabbi_historie_v1';

function mapStorage(initial) {
  const m = new Map(initial || []);
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    _map: m
  };
}

function quotaStorage(initial) {
  const s = mapStorage(initial);
  s.setItem = () => { throw Object.assign(new Error('x'), { name: 'QuotaExceededError' }); };
  return s;
}

function eintrag(titel) {
  return {
    titel: titel || 'Blatt A', fach: 'mathe', gruppen: ['zerlegen'], quelle: 'katalog',
    blattId: 'b1', url: 'blaetter/b1.html', html: null, layout: null,
    eingaben: { a: '3' }, loesungen: null, einstellungen: null
  };
}

test('fuegeHinzu dann holeAlle()[0].titel gleich', () => {
  const api = H.erzeuge(mapStorage());
  const r = api.fuegeHinzu(eintrag('Hallo'));
  assert.strictEqual(r.ok, true);
  assert.strictEqual(api.holeAlle()[0].titel, 'Hallo');
});

test('vergibt id h_<ms>_<rnd4> und ISO-abgeschlossenAm', () => {
  const api = H.erzeuge(mapStorage());
  const r = api.fuegeHinzu(eintrag());
  assert.match(r.eintrag.id, /^h_\d+_[a-z0-9]{4}$/);
  assert.strictEqual(new Date(r.eintrag.abgeschlossenAm).toISOString(), r.eintrag.abgeschlossenAm);
  assert.deepStrictEqual(api.hole(r.eintrag.id), r.eintrag);
});

test('zwei Eintraege: neuester zuerst', () => {
  const api = H.erzeuge(mapStorage());
  api.fuegeHinzu(eintrag('erst'));
  api.fuegeHinzu(eintrag('zweit'));
  assert.deepStrictEqual(api.holeAlle().map((e) => e.titel), ['zweit', 'erst']);
});

test('hole liefert null bei unbekannter id', () => {
  const api = H.erzeuge(mapStorage());
  api.fuegeHinzu(eintrag());
  assert.strictEqual(api.hole('gibt_es_nicht'), null);
});

test('Daten bleiben ueber neue Instanz auf demselben Speicher erhalten (Schluessel tabbi_historie_v1)', () => {
  const s = mapStorage();
  H.erzeuge(s).fuegeHinzu(eintrag('persist'));
  assert.ok(s._map.has(KEY));
  assert.strictEqual(H.erzeuge(s).holeAlle()[0].titel, 'persist');
});

test('setItem wirft QuotaExceededError: {ok:false, fehler:speicher}, Liste unveraendert', () => {
  const vorher = mapStorage();
  H.erzeuge(vorher).fuegeHinzu(eintrag('alt'));
  const s = quotaStorage([[KEY, vorher._map.get(KEY)]]);
  const api = H.erzeuge(s);
  const davor = api.holeAlle();
  const r = api.fuegeHinzu(eintrag('neu'));
  assert.deepStrictEqual(r, { ok: false, fehler: 'speicher' });
  assert.deepStrictEqual(api.holeAlle(), davor);
  assert.strictEqual(s._map.get(KEY), vorher._map.get(KEY));
  assert.strictEqual(api.holeAlle().length, 1);
});

test('setItem wirft auf leerem Speicher: holeAlle bleibt []', () => {
  const api = H.erzeuge(quotaStorage());
  assert.strictEqual(api.fuegeHinzu(eintrag()).ok, false);
  assert.deepStrictEqual(api.holeAlle(), []);
});

test('kaputtes JSON: holeAlle() deep-equals []', () => {
  const api = H.erzeuge(mapStorage([[KEY, 'kaputt']]));
  assert.deepStrictEqual(api.holeAlle(), []);
  assert.strictEqual(api.hole('x'), null);
});

test('kein Array im Speicher: holeAlle() ist []', () => {
  const api = H.erzeuge(mapStorage([[KEY, '{"a":1}']]));
  assert.deepStrictEqual(api.holeAlle(), []);
});

test('getItem wirft: holeAlle() ist []', () => {
  const api = H.erzeuge({ getItem: () => { throw new Error('x'); }, setItem: () => {} });
  assert.deepStrictEqual(api.holeAlle(), []);
});

test('fuegeHinzu auf kaputtem JSON beginnt neue Liste', () => {
  const api = H.erzeuge(mapStorage([[KEY, 'kaputt']]));
  assert.strictEqual(api.fuegeHinzu(eintrag('x')).ok, true);
  assert.strictEqual(api.holeAlle().length, 1);
});

test('Append-only: kein Loesch-API', () => {
  const api = H.erzeuge(mapStorage());
  const keys = Object.keys(api);
  assert.ok(!keys.some((k) => /^loesche/i.test(k)), keys.join(','));
  assert.ok(!keys.some((k) => /delete|clear|remove|leere/i.test(k)), keys.join(','));
  assert.deepStrictEqual(keys.sort(), ['fuegeHinzu', 'hole', 'holeAlle']);
});

test('fuegeHinzu mutiert uebergebenes Objekt nicht', () => {
  const api = H.erzeuge(mapStorage());
  const e = eintrag();
  api.fuegeHinzu(e);
  assert.strictEqual(e.id, undefined);
});
