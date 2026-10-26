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

test('fuegeHinzu auf kaputtem JSON: ok:false, Rohwert unveraendert, kein setItem', () => {
  const s = mapStorage([[KEY, 'kaputt']]);
  let setCalls = 0;
  const orig = s.setItem;
  s.setItem = (k, v) => { setCalls++; orig(k, v); };
  const api = H.erzeuge(s);
  assert.deepStrictEqual(api.fuegeHinzu(eintrag('x')), { ok: false, fehler: 'speicher' });
  assert.strictEqual(s._map.get(KEY), 'kaputt');
  assert.strictEqual(setCalls, 0);
});

test('fuegeHinzu wenn gespeicherter Wert kein Array ist: ok:false, unveraendert', () => {
  const s = mapStorage([[KEY, '{"a":1}']]);
  const r = H.erzeuge(s).fuegeHinzu(eintrag());
  assert.deepStrictEqual(r, { ok: false, fehler: 'speicher' });
  assert.strictEqual(s._map.get(KEY), '{"a":1}');
});

test('fuegeHinzu mit getItem das wirft: ok:false, kein setItem', () => {
  let setCalls = 0;
  const api = H.erzeuge({ getItem: () => { throw new Error('x'); }, setItem: () => { setCalls++; } });
  assert.deepStrictEqual(api.fuegeHinzu(eintrag()), { ok: false, fehler: 'speicher' });
  assert.strictEqual(setCalls, 0);
});

test('fuegeHinzu: fehlender Schluessel oder leerer String starten frische Liste', () => {
  assert.strictEqual(H.erzeuge(mapStorage()).fuegeHinzu(eintrag()).ok, true);
  const s = mapStorage([[KEY, '']]);
  const api = H.erzeuge(s);
  assert.strictEqual(api.fuegeHinzu(eintrag('x')).ok, true);
  assert.strictEqual(api.holeAlle().length, 1);
});

test('eigene id und abgeschlossenAm des Aufrufers werden ueberschrieben', () => {
  const api = H.erzeuge(mapStorage());
  const e = Object.assign(eintrag(), { id: 'fremd', abgeschlossenAm: '2000-01-01T00:00:00.000Z' });
  const r = api.fuegeHinzu(e);
  assert.match(r.eintrag.id, /^h_\d+_[a-z0-9]{4}$/);
  assert.notStrictEqual(r.eintrag.abgeschlossenAm, '2000-01-01T00:00:00.000Z');
  assert.ok(Date.now() - new Date(r.eintrag.abgeschlossenAm).getTime() < 5000);
  assert.strictEqual(api.holeAlle()[0].id, r.eintrag.id);
  assert.strictEqual(api.hole('fremd'), null);
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

/* ---------------------- reine Hilfsfunktionen ---------------------- */

const G = require('../js/tabbi-gruppen.js');

test('gruppenAusLoesungen: eindeutig, Reihenfolge des ersten Auftretens, Zusatz-Typen zuerst', () => {
  const loes = {
    luecken: { a: { soll: 3, gruppe: 'zerlegen' }, b: { soll: null, gruppe: null }, c: { soll: 1, gruppe: 'rechnen' } },
    striche: {}, verbindungen: {},
    gruppen: { s1: 'mengen', s2: 'zerlegen' }
  };
  assert.deepStrictEqual(H.gruppenAusLoesungen(loes, ['nachbarn'], G.gruppeFuerTyp), ['ordnen', 'zerlegen', 'rechnen', 'mengen']);
});

test('gruppenAusLoesungen: robust bei fehlenden Daten', () => {
  assert.deepStrictEqual(H.gruppenAusLoesungen(null, null, null), []);
  assert.deepStrictEqual(H.gruppenAusLoesungen({}, ['gibtsnicht'], G.gruppeFuerTyp), []);
});

test('formatiereDatum: TT.MM.JJJJ, ungueltig -> leer', () => {
  const d = new Date(2026, 2, 5, 10, 0, 0);
  assert.strictEqual(H.formatiereDatum(d.toISOString()), '05.03.2026');
  assert.strictEqual(H.formatiereDatum('quatsch'), '');
  assert.strictEqual(H.formatiereDatum(''), '');
});

test('blattUrl: entfernt Sitzungs-Parameter, behaelt Blatt-Parameter', () => {
  assert.strictEqual(H.blattUrl('001_a.html', ''), 'blaetter/001_a.html');
  assert.strictEqual(H.blattUrl('001_a.html', '?bereich=1-5&historie=h_1&fokus=1'), 'blaetter/001_a.html?bereich=1-5');
  assert.strictEqual(H.blattUrl('011_b.html', '?testId=test_1&print=1'), 'blaetter/011_b.html');
});

test('ansichtsUrl: haengt historie-Parameter korrekt an', () => {
  assert.strictEqual(H.ansichtsUrl({ id: 'h_1_ab', url: 'blaetter/001_a.html' }), 'blaetter/001_a.html?historie=h_1_ab');
  assert.strictEqual(H.ansichtsUrl({ id: 'h_2', url: 'blaetter/001_a.html?bereich=1-5&zahlen=2,3&tab=freunde' }), 'blaetter/001_a.html?historie=h_2');
  assert.strictEqual(H.ansichtsUrl(null), '');
});

test('zustandAusEinstellungen: uebernimmt gueltige Werte, validiert, null bei leer', () => {
  const ok = ['zahlenhaus', 'rechnen'];
  const z = H.zustandAusEinstellungen({ typen: ['zahlenhaus', 'xx'], bereich: '1-5', zahlen: null, anzahl: 'viel', praefix: 'Test: ' }, ok);
  assert.deepStrictEqual(z, { typen: ['zahlenhaus'], bereich: '1-5', zahlen: null, anzahl: 'viel', praefix: 'Test: ' });
  const z2 = H.zustandAusEinstellungen({ typen: ['rechnen'], bereich: 'x', zahlen: [2, 4, 99], anzahl: '?' }, ok);
  assert.deepStrictEqual(z2, { typen: ['rechnen'], bereich: '1-10', zahlen: [2, 4], anzahl: 'mittel', praefix: '' });
  assert.strictEqual(H.zustandAusEinstellungen({ typen: ['xx'] }, ok), null);
  assert.strictEqual(H.zustandAusEinstellungen(null, ok), null);
  assert.strictEqual(H.zustandAusEinstellungen(undefined, ok), null);
});
