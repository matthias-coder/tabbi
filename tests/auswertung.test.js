'use strict';
const test = require('node:test');
const assert = require('node:assert');

const A = require('../js/tabbi-auswertung.js');
const G = require('../js/tabbi-gruppen.js');

/* --------------------------------------------------------------------------
   Mini-DOM-Stub (kein jsdom): Knoten mit querySelectorAll/querySelector,
   getAttribute, classList.contains, textContent, closest, children.
   Selektoren: nur zusammengesetzte einfache Selektoren wie
   '.a', 'div.a.b', '[x]', '[x="y"]', '.a[x][y="z"]'.
   Schreibende DOM-Methoden protokollieren Zugriffe in SCHREIBZUGRIFFE.
   -------------------------------------------------------------------------- */
const SCHREIBZUGRIFFE = [];

function parseSelektor(sel) {
  const m = /^([a-z0-9]*)((?:\.[\w-]+|\[[\w-]+(?:="[^"]*")?\])*)$/i.exec(sel.trim());
  if (!m) throw new Error('Stub kann Selektor nicht: ' + sel);
  const teile = { tag: m[1] || null, klassen: [], attrs: [] };
  const re = /\.([\w-]+)|\[([\w-]+)(?:="([^"]*)")?\]/g;
  let t;
  while ((t = re.exec(m[2]))) {
    if (t[1]) teile.klassen.push(t[1]);
    else teile.attrs.push({ name: t[2], wert: t[3] });
  }
  return teile;
}

function passt(node, sel) {
  const s = parseSelektor(sel);
  if (s.tag && s.tag !== node.tag) return false;
  if (!s.klassen.every((k) => node._klassen.includes(k))) return false;
  return s.attrs.every((a) => {
    const v = node.getAttribute(a.name);
    return v !== null && (a.wert === undefined || v === a.wert);
  });
}

function h(sel, attrs, kinder) {
  const m = /^([a-z0-9]*)((?:\.[\w-]+)*)$/i.exec(sel);
  const node = {
    tag: m[1] || 'div',
    _klassen: m[2].split('.').filter(Boolean),
    _attrs: Object.assign({}, attrs || {}),
    _text: typeof kinder === 'string' ? kinder : '',
    children: [],
    parentNode: null,
    classList: { contains: (k) => node._klassen.includes(k) },
    getAttribute: (n) => (Object.prototype.hasOwnProperty.call(node._attrs, n) ? String(node._attrs[n]) : null),
    hasAttribute: (n) => Object.prototype.hasOwnProperty.call(node._attrs, n),
    get textContent() { return node._text + node.children.map((c) => c.textContent).join(''); },
    set textContent(v) { SCHREIBZUGRIFFE.push('textContent'); },
    get innerHTML() { return ''; },
    set innerHTML(v) { SCHREIBZUGRIFFE.push('innerHTML'); },
    setAttribute: (n) => { SCHREIBZUGRIFFE.push('setAttribute:' + n); },
    removeAttribute: (n) => { SCHREIBZUGRIFFE.push('removeAttribute:' + n); },
    matches: (s) => passt(node, s),
    querySelectorAll(s) {
      const out = [];
      (function lauf(n) { n.children.forEach((c) => { if (passt(c, s)) out.push(c); lauf(c); }); })(node);
      return out;
    },
    querySelector(s) { return node.querySelectorAll(s)[0] || null; },
    closest(s) {
      for (let n = node; n; n = n.parentNode) if (passt(n, s)) return n;
      return null;
    }
  };
  if (Array.isArray(kinder)) kinder.forEach((k) => { k.parentNode = node; node.children.push(k); });
  return node;
}

const L = (id) => h('.luecke', { 'data-id': id });
const V = (wert) => h('.vorgabe', {}, String(wert));
const main = (...kinder) => h('main', {}, kinder);
const mix = (typ, ...kinder) => h('.mix-aufgaben-block', { 'data-mix-typ': typ }, kinder);

// Nachbau von erstelleGleichungHTML: "3 + _ = 7"
function gleichung(formel, prefix) {
  let i = 0;
  return h('.gleichung-zeile', {}, formel.split(/\s+/).map((t) => {
    if (t === '_') return h('.gleichung-box', {}, [L(`${prefix}_l${++i}`)]);
    if (/^\d+$/.test(t)) return h('.gleichung-box', {}, [V(t)]);
    return h('span.gleichung-op', {}, t);
  }));
}

/* ============================== werteAus ================================= */

const HAUS = { luecken: { zh_r0_r: { soll: 3, gruppe: 'zerlegen' } }, striche: {}, verbindungen: {} };

test('werteAus: Zahlenhaus richtig', () => {
  const e = A.werteAus(HAUS, { luecken: { zh_r0_r: '3' } });
  assert.strictEqual(e.details.zh_r0_r, 'richtig');
  assert.strictEqual(e.gesamt, 1);
  assert.strictEqual(e.falsch, 0);
});

test('werteAus: Zahlenhaus falsch mit Sollwert', () => {
  const e = A.werteAus(HAUS, { luecken: { zh_r0_r: '4' } });
  assert.strictEqual(e.details.zh_r0_r, 'falsch');
  assert.strictEqual(e.soll.zh_r0_r, '3');
  assert.strictEqual(e.falsch, 1);
});

test('werteAus: leere Luecke ist leer und zaehlt nicht als falsch', () => {
  const e = A.werteAus(HAUS, { luecken: {} });
  assert.strictEqual(e.details.zh_r0_r, 'leer');
  assert.strictEqual(e.leer, 1);
  assert.strictEqual(e.falsch, 0);
  assert.strictEqual(e.gesamt, 1);
});

test('werteAus: regel summe – 6/4 bei Dach 10 beide richtig, 6/5 beide falsch', () => {
  const loes = { luecken: {
    a_l: { soll: null, gruppe: 'zerlegen', regel: 'summe', partner: 'a_r', summe: 10 },
    a_r: { soll: null, gruppe: 'zerlegen', regel: 'summe', partner: 'a_l', summe: 10 }
  } };
  const ok = A.werteAus(loes, { luecken: { a_l: '6', a_r: '4' } });
  assert.deepStrictEqual([ok.details.a_l, ok.details.a_r], ['richtig', 'richtig']);
  const nein = A.werteAus(loes, { luecken: { a_l: '6', a_r: '5' } });
  assert.deepStrictEqual([nein.details.a_l, nein.details.a_r], ['falsch', 'falsch']);
  assert.strictEqual(nein.falsch, 2);
  const halb = A.werteAus(loes, { luecken: { a_l: '6' } });
  assert.strictEqual(halb.details.a_r, 'leer');
  assert.strictEqual(halb.details.a_l, 'nicht-ausgewertet');
});

test('werteAus: soll null ist nicht-ausgewertet und nicht in gesamt', () => {
  const e = A.werteAus({ luecken: { x: { soll: null, gruppe: null } } }, { luecken: { x: '5' } });
  assert.strictEqual(e.details.x, 'nicht-ausgewertet');
  assert.strictEqual(e.gesamt, 0);
  assert.strictEqual(e.nichtAusgewertet, 1);
  assert.ok(!('x' in e.soll));
});

test('werteAus: loesungen === null liefert leeres Ergebnis ohne Exception', () => {
  const e = A.werteAus(null, { luecken: { a: '1' } });
  assert.deepStrictEqual(e, { gesamt: 0, falsch: 0, leer: 0, nichtAusgewertet: 0, proGruppe: {}, details: {}, soll: {} });
  assert.doesNotThrow(() => A.werteAus(HAUS, null));
});

test('werteAus: proGruppe zaehlt falsch je Gruppe', () => {
  const loes = { luecken: {
    a: { soll: 3, gruppe: 'zerlegen' }, b: { soll: 2, gruppe: 'zerlegen' },
    c: { soll: 5, gruppe: 'zerlegen' }, d: { soll: 9, gruppe: 'rechnen' }
  } };
  const e = A.werteAus(loes, { luecken: { a: '1', b: '2', d: '1' } });
  assert.deepStrictEqual(e.proGruppe.zerlegen, { gesamt: 3, falsch: 1, leer: 1 });
  assert.deepStrictEqual(e.proGruppe.rechnen, { gesamt: 1, falsch: 1, leer: 0 });
});

test('werteAus: Striche und Verbindungen', () => {
  const loes = {
    luecken: {},
    striche: { s0: 4, s1: 2, s2: 3 },
    verbindungen: { zo: '0:2,1:0,2:1', zo2: null },
    gruppen: { s0: 'mengen', s1: 'mengen', s2: 'mengen', zo: 'mengen', zo2: 'mengen' }
  };
  const e = A.werteAus(loes, { striche: { s0: 4, s1: 3 }, verbindungen: { zo: '2:1,0:2,1:0', zo2: '0:0' } });
  assert.strictEqual(e.details.s0, 'richtig');
  assert.strictEqual(e.details.s1, 'falsch');
  assert.strictEqual(e.soll.s1, '2');
  assert.strictEqual(e.details.s2, 'leer');
  assert.strictEqual(e.details.zo, 'richtig');
  assert.strictEqual(e.details.zo2, 'nicht-ausgewertet');
  assert.deepStrictEqual(e.proGruppe.mengen, { gesamt: 4, falsch: 1, leer: 1 });
  const f = A.werteAus(loes, { verbindungen: { zo: '0:2,1:1' } });
  assert.strictEqual(f.details.zo, 'falsch');
});

/* =========================== ermittleLoesungen =========================== */

test('ermittleLoesungen: Zahlenhaus (Builder) – Differenz und summe-Regel', () => {
  const root = main(mix('zahlenhaus',
    h('.zahlenhaus', { 'data-dach': '5', 'data-etagen': '2:_, _:4, _:_' }, [
      h('.wohnungen', {}, [
        h('.etage', {}, [V(2), L('p_r0_r')]),
        h('.etage', {}, [L('p_r1_l'), V(4)]),
        h('.etage', {}, [L('p_r2_l'), L('p_r2_r')])
      ])
    ])));
  const l = A.ermittleLoesungen(root, G.gruppeFuerTyp).luecken;
  assert.deepStrictEqual(l.p_r0_r, { soll: 3, gruppe: 'zerlegen' });
  assert.deepStrictEqual(l.p_r1_l, { soll: 1, gruppe: 'zerlegen' });
  assert.deepStrictEqual(l.p_r2_l, { soll: null, gruppe: 'zerlegen', regel: 'summe', partner: 'p_r2_r', summe: 5 });
  assert.strictEqual(l.p_r2_r.partner, 'p_r2_l');
});

test('ermittleLoesungen: Nachbarzahlen (Katalog, ohne Builder-Block)', () => {
  const root = main(h('.nachbarzahlen-grid', { 'data-baustein': 'nachbarzahlen', 'data-zahlen': '12,1' }, [
    h('.nachbar-trio', {}, [L('nb_0_0_v'), V(12), L('nb_0_0_n')]),
    h('.nachbar-trio', {}, [L('nb_0_1_v'), V(1), L('nb_0_1_n')])
  ]));
  const l = A.ermittleLoesungen(root, G.gruppeFuerTyp).luecken;
  assert.deepStrictEqual(l.nb_0_0_v, { soll: 11, gruppe: 'ordnen' });
  assert.strictEqual(l.nb_0_0_n.soll, 13);
  assert.strictEqual(l.nb_0_1_v.soll, 0);
  assert.strictEqual(l.nb_0_1_n.soll, 2);
});

test('ermittleLoesungen: Zahlenmauern inkl. fehlender Basissteine', () => {
  const stein = (x) => h('.mauer-stein', {}, [x]);
  const root = main(
    h('.m', { 'data-baustein': 'zahlenmauer', 'data-steine': '_; _,_; 3,4,5' }, [h('.zahlenmauer', {}, [
      h('.mauer-reihe', {}, [stein(L('a_r0_s0'))]),
      h('.mauer-reihe', {}, [stein(L('a_r1_s0')), stein(L('a_r1_s1'))]),
      h('.mauer-reihe', {}, [stein(V(3)), stein(V(4)), stein(V(5))])
    ])]),
    h('.m', { 'data-baustein': 'zahlenmauer', 'data-steine': '20; _,9; 7,_,5' }, [h('.zahlenmauer', {}, [
      h('.mauer-reihe', {}, [stein(V(20))]),
      h('.mauer-reihe', {}, [stein(L('b_r1_s0')), stein(V(9))]),
      h('.mauer-reihe', {}, [stein(V(7)), stein(L('b_r2_s1')), stein(V(5))])
    ])])
  );
  const l = A.ermittleLoesungen(root, G.gruppeFuerTyp).luecken;
  assert.deepStrictEqual(l.a_r1_s0, { soll: 7, gruppe: 'rechnen' });
  assert.strictEqual(l.a_r1_s1.soll, 9);
  assert.strictEqual(l.a_r0_s0.soll, 16);
  assert.strictEqual(l.b_r2_s1.soll, 4);
  assert.strictEqual(l.b_r1_s0.soll, 11);
});

test('ermittleLoesungen: Strichlisten – Luecke und Strichzahl = Anzahl Tiere', () => {
  const item = (id) => h('button.zaehl-item', { 'data-id': id });
  const spalte = (t) => h('.strichlisten-spalte', {}, [
    h('.striche-anzeige', { 'data-id': `p_sl_s_${t}`, 'data-anzahl': '0' }),
    h('.strichlisten-zahl-box', {}, [L(`p_sl_z_${t}`)])
  ]);
  const root = main(mix('strichlisten',
    h('.wimmelbild-box', {}, [item('p_sl_w_1_0'), item('p_sl_w_0_0'), item('p_sl_w_1_1'), item('p_sl_w_0_1'),
      item('p_sl_w_0_2'), item('p_sl_w_2_0')]),
    h('.strichlisten-tabelle', {}, [spalte(0), spalte(1), spalte(2)])));
  const loes = A.ermittleLoesungen(root, G.gruppeFuerTyp);
  assert.deepStrictEqual(loes.luecken.p_sl_z_0, { soll: 3, gruppe: 'mengen' });
  assert.strictEqual(loes.luecken.p_sl_z_1.soll, 2);
  assert.strictEqual(loes.luecken.p_sl_z_2.soll, 1);
  assert.deepStrictEqual(loes.striche, { p_sl_s_0: 3, p_sl_s_1: 2, p_sl_s_2: 1 });
  assert.strictEqual(loes.gruppen.p_sl_s_0, 'mengen');
});

test('ermittleLoesungen: Seifenblasen/Zuordnung – Paarung gleicher Zahlwerte', () => {
  const root = main(mix('seifenblasen',
    h('.zo', { 'data-baustein': 'zuordnung', 'data-links': 'F:L5,F:R3,W:6', 'data-rechts': '6,5,3' }, [
      h('.zuordnung-container', { 'data-id': 'p_zo_zo', 'data-verbindungen': '' })
    ])));
  const loes = A.ermittleLoesungen(root, G.gruppeFuerTyp);
  assert.deepStrictEqual(loes.verbindungen, { p_zo_zo: '0:1,1:2,2:0' });
  assert.strictEqual(loes.gruppen.p_zo_zo, 'mengen');
});

test('ermittleLoesungen: Zuordnung mit doppeltem Wert ist nicht eindeutig -> null', () => {
  const root = main(h('.zo', { 'data-baustein': 'zuordnung', 'data-links': '3,3', 'data-rechts': '3,3' }, [
    h('.zuordnung-container', { 'data-id': 'z_zo' })
  ]));
  assert.strictEqual(A.ermittleLoesungen(root, G.gruppeFuerTyp).verbindungen.z_zo, null);
});

test('ermittleLoesungen: Finger, Wuerfel, Punktebilder aus data-werte', () => {
  const karte = (id) => h('.zaehl-karte', {}, [h('.zaehl-luecke-box', {}, [L(id)])]);
  const root = main(
    h('.zaehl-karten-reihe', { 'data-baustein': 'finger', 'data-werte': 'L3,7,R5' }, [karte('f_0'), karte('f_1'), karte('f_2')]),
    h('.zaehl-karten-reihe', { 'data-baustein': 'wuerfel', 'data-werte': '4,6' }, [karte('w_0'), karte('w_1')]),
    h('.zaehl-karten-reihe', { 'data-baustein': 'tuerme', 'data-werte': '2' }, [karte('t_0')]),
    h('.pb', { 'data-baustein': 'punktebilder', 'data-werte': '8,0' }, [L('pb_0'), L('pb_1')])
  );
  const l = A.ermittleLoesungen(root, G.gruppeFuerTyp).luecken;
  assert.deepStrictEqual([l.f_0.soll, l.f_1.soll, l.f_2.soll], [3, 7, 5]);
  assert.strictEqual(l.f_0.gruppe, 'mengen');
  assert.deepStrictEqual([l.w_0.soll, l.w_1.soll, l.t_0.soll], [4, 6, 2]);
  assert.deepStrictEqual([l.pb_0.soll, l.pb_1.soll], [8, 0]);
});

test('ermittleLoesungen: Punkte > 10 (Zwanzigerfeld) – Z, E und 10 + E = n', () => {
  const kv = (farbe) => h('.kreis-vorgabe' + (farbe ? '.' + farbe : ''));
  const reihe = (blau, rot) => {
    const k = [];
    for (let i = 0; i < 10; i++) k.push(kv(i < blau ? 'blau' : i < blau + rot ? 'rot' : ''));
    return h('.zehnerstreifen', {}, k);
  };
  const zeile = (n, idx) => h('.zwanziger-aufgabe-zeile', {}, [
    h('.zwanzigerfeld', {}, [reihe(10, 0), reihe(0, n - 10)]),
    h('.stellenwert-tafel', {}, [
      h('.stellenwert-zelle', {}, [L(`p_ze_${idx}_z`)]),
      h('.stellenwert-zelle', {}, [L(`p_ze_${idx}_e`)])
    ]),
    gleichung('10 + _ = _', `p_zegl_${idx}`)
  ]);
  const l = A.ermittleLoesungen(main(mix('punkte', zeile(14, 0), zeile(20, 1))), G.gruppeFuerTyp).luecken;
  assert.deepStrictEqual([l.p_ze_0_z.soll, l.p_ze_0_e.soll, l.p_zegl_0_l1.soll, l.p_zegl_0_l2.soll], [1, 4, 4, 14]);
  assert.strictEqual(l.p_ze_0_z.gruppe, 'mengen');
  // 20: Stellenwert nicht eindeutig (1 Z + 10 E vs. 2 Z + 0 E) -> nicht ausgewertet
  assert.deepStrictEqual([l.p_ze_1_z.soll, l.p_ze_1_e.soll], [null, null]);
  assert.deepStrictEqual([l.p_zegl_1_l1.soll, l.p_zegl_1_l2.soll], [10, 20]);
});

test('ermittleLoesungen: Aquarium – Anzahl Tiere im Becken', () => {
  const root = main(mix('aquarium', h('.aquarium-aufgabe', {}, [
    h('.aquarium-becken', {}, [h('button.zaehl-item', { 'data-id': 'f0' }), h('button.zaehl-item', { 'data-id': 'f1' })]),
    h('.aquarium-antwort', {}, [L('p_aq_0_l')])
  ])));
  assert.deepStrictEqual(A.ermittleLoesungen(root, G.gruppeFuerTyp).luecken.p_aq_0_l, { soll: 2, gruppe: 'mengen' });
});

test('ermittleLoesungen: Rechnen und Zwerg/Riese aus gedruckten Operanden', () => {
  const root = main(
    mix('rechnen', gleichung('7 + 5 = _', 'g0'), gleichung('9 - 4 = _', 'g1'), gleichung('3 + _ = 10', 'g2')),
    h('.zwerg-riese-karte', {}, [gleichung('13 − 4 = _', 'zr')]),
    gleichung('10 = _ + _', 'halb')
  );
  const l = A.ermittleLoesungen(root, G.gruppeFuerTyp).luecken;
  assert.deepStrictEqual(l.g0_l1, { soll: 12, gruppe: 'rechnen' });
  assert.strictEqual(l.g1_l1.soll, 5);
  assert.strictEqual(l.g2_l1.soll, 7);
  assert.deepStrictEqual(l.zr_l1, { soll: 9, gruppe: 'rechnen' });
  assert.deepStrictEqual([l.halb_l1.soll, l.halb_l2.soll], [null, null]);
});

test('ermittleLoesungen: Zahlenfreunde – summe-Regel je Etage', () => {
  const root = main(h('.zahlenfreund-block', { 'data-dach': '4', 'data-etagen-anzahl': '2' }, [
    h('.zahlenhaus', {}, [h('.wohnungen', {}, [
      h('.etage', {}, [L('zf_r0_l'), L('zf_r0_r')]),
      h('.etage', {}, [L('zf_r1_l'), L('zf_r1_r')])
    ])])
  ]));
  const l = A.ermittleLoesungen(root, G.gruppeFuerTyp).luecken;
  assert.deepStrictEqual(l.zf_r1_r, { soll: null, gruppe: 'zerlegen', regel: 'summe', partner: 'zf_r1_l', summe: 4 });
});

test('ermittleLoesungen: jede Luecke hat einen Eintrag, statische ohne Daten -> soll null', () => {
  const root = main(mix('buendeln', L('static_a')), L('static_b'));
  const l = A.ermittleLoesungen(root, G.gruppeFuerTyp).luecken;
  assert.deepStrictEqual(l.static_a, { soll: null, gruppe: 'mengen' });
  assert.deepStrictEqual(l.static_b, { soll: null, gruppe: null });
});

test('ermittleLoesungen: schreibt nichts ins DOM und ist JSON-serialisierbar', () => {
  SCHREIBZUGRIFFE.length = 0;
  const root = main(
    h('.zahlenhaus', { 'data-dach': '3', 'data-etagen': '1:_' }, [h('.etage', {}, [V(1), L('x_r0_r')])]),
    gleichung('1 + 1 = _', 'g')
  );
  const loes = A.ermittleLoesungen(root, G.gruppeFuerTyp);
  assert.deepStrictEqual(SCHREIBZUGRIFFE, []);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(loes)), loes);
});

test('ermittleLoesungen: ohne root oder ohne gruppeFuerTyp keine Exception', () => {
  assert.deepStrictEqual(A.ermittleLoesungen(null).luecken, {});
  const l = A.ermittleLoesungen(main(gleichung('2 + 2 = _', 'q'))).luecken;
  assert.deepStrictEqual(l.q_l1, { soll: 4, gruppe: null });
});

/* ------------------- Texte der Lehrkraft-Auswertung (Task 10) ------------------- */

test('zusammenfassungsText: x von y falsch · z nicht bearbeitet', () => {
  assert.strictEqual(A.zusammenfassungsText({ gesamt: 12, falsch: 2, leer: 1 }), '2 von 12 falsch · 1 nicht bearbeitet');
  assert.strictEqual(A.zusammenfassungsText(null), '0 von 0 falsch · 0 nicht bearbeitet');
});

test('gruppenAufteilung: feste Gruppen-Reihenfolge, Titel aus TabbiGruppen, unbekannte hinten', () => {
  const zeilen = A.gruppenAufteilung(
    {
      rechnen: { gesamt: 4, falsch: 1, leer: 0 },
      xyz: { gesamt: 1, falsch: 0, leer: 1 },
      mengen: { gesamt: 3, falsch: 0, leer: 0 }
    },
    G.GRUPPEN
  );
  assert.deepStrictEqual(zeilen.map((z) => z.id), ['mengen', 'rechnen', 'xyz']);
  assert.strictEqual(zeilen[0].titel, 'Mengen erfassen & zählen');
  assert.strictEqual(zeilen[1].text, '1 von 4 falsch · 0 nicht bearbeitet');
  assert.strictEqual(zeilen[2].titel, 'xyz');
  assert.deepStrictEqual(A.gruppenAufteilung(null, G.GRUPPEN), []);
});

test('zuordnungSollText: Indizes auf angezeigte Zahlen abbilden, sortiert nach Bild', () => {
  assert.strictEqual(A.zuordnungSollText('1:0,0:2', ['3', '5', '7']), 'Bild 1 – 7 · Bild 2 – 3');
  assert.strictEqual(A.zuordnungSollText('0:4', []), 'Bild 1 – 5');
  assert.strictEqual(A.zuordnungSollText('', ['1']), 'Verbindungen');
  assert.strictEqual(A.zuordnungSollText(null), 'Verbindungen');
});
