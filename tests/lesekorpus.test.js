const test = require('node:test');
const assert = require('node:assert/strict');

// Das Modul per require laden
const TabbiLesekorpus = require('../js/tabbi-lesekorpus.js');

test('TabbiLesekorpus: STUFEN ist definiert mit 5 Stufen', () => {
  assert.ok(Array.isArray(TabbiLesekorpus.STUFEN), 'STUFEN muss ein Array sein');
  assert.equal(TabbiLesekorpus.STUFEN.length, 5, 'Es müssen genau 5 Stufen definiert sein');
  
  // Stufe 1: M, L, S + Vokale
  const stufe1 = TabbiLesekorpus.STUFEN.find(s => s.id === 1);
  assert.ok(stufe1, 'Stufe 1 muss existieren');
  assert.deepEqual(stufe1.vokale, ['A', 'E', 'I', 'O', 'U']);
  assert.ok(stufe1.konsonanten.includes('M'));
  assert.ok(stufe1.konsonanten.includes('L'));
  assert.ok(stufe1.konsonanten.includes('S'));
});

test('erzeugeSilben: erzeugt gültige Silbenpaare aus Buchstabenpool', () => {
  const pool = ['A', 'E', 'M', 'L'];
  const silben = TabbiLesekorpus.erzeugeSilben(pool);
  
  assert.ok(Array.isArray(silben), 'Muss ein Array sein');
  assert.ok(silben.length > 0, 'Silbenliste darf nicht leer sein');
  
  // Silben wie Ma, Me, La, Le, am, em, al, el
  assert.ok(silben.includes('Ma'));
  assert.ok(silben.includes('Me'));
  assert.ok(silben.includes('La'));
  assert.ok(silben.includes('am'));
  
  // Keine Buchstaben außerhalb des Pools
  assert.ok(!silben.some(s => s.toLowerCase().includes('s')), 'Darf kein S enthalten');
  assert.ok(!silben.some(s => s.toLowerCase().includes('o')), 'Darf kein O enthalten');
});

test('filtereWoerter: liefert nur Wörter aus dem erlaubten Buchstabenpool', () => {
  const poolStufe1 = ['A', 'E', 'I', 'O', 'U', 'M', 'L', 'S'];
  const woerter = TabbiLesekorpus.filtereWoerter(poolStufe1, 2);
  
  assert.ok(Array.isArray(woerter), 'Muss ein Array sein');
  assert.ok(woerter.length >= 5, 'Muss mindestens 5 Wörter für Stufe 1 finden');
  
  // Jedes Wort muss ein Objekt mit text und silben-Array sein
  for (const w of woerter) {
    assert.ok(w.text, 'Wort muss Text-Eigenschaft haben');
    assert.ok(Array.isArray(w.silben), 'Wort muss silben-Array haben');
    assert.equal(w.silben.join(''), w.text, 'Silben zusammengefügt müssen Worttext ergeben');
    
    // Buchstaben prüfen
    for (const b of w.text.toUpperCase()) {
      assert.ok(poolStufe1.includes(b), `Buchstabe ${b} in ${w.text} ist nicht im Pool`);
    }
  }

  const texte = woerter.map(w => w.text);
  assert.ok(texte.includes('Mama') || texte.includes('Lama') || texte.includes('Limo'));
  assert.ok(!texte.includes('Tor'), 'Tor darf nicht in Stufe 1 enthalten sein');
});

test('Fallback: Leerer oder ungültiger Pool fällt auf Stufe 1 zurück', () => {
  const fallbackSilben = TabbiLesekorpus.erzeugeSilben([]);
  assert.ok(fallbackSilben.length > 0, 'Leerer Pool muss Fallback-Silben liefern');
  
  const fallbackWoerter = TabbiLesekorpus.filtereWoerter(null, 2);
  assert.ok(fallbackWoerter.length > 0, 'Null-Pool muss Fallback-Wörter liefern');
});

test('silbiereWort: liefert HTML mit zweifarbigen Silben-Spans', () => {
  const wortObjekt = { text: 'Tomate', silben: ['To', 'ma', 'te'] };
  const html = TabbiLesekorpus.silbiereWortHTML(wortObjekt, true);
  
  assert.ok(html.includes('silbe-blau'), 'Erste Silbe muss silbe-blau haben');
  assert.ok(html.includes('silbe-rot'), 'Zweite Silbe muss silbe-rot haben');
  assert.ok(html.includes('To'), 'Silbentext To muss enthalten sein');
  assert.ok(html.includes('ma'), 'Silbentext ma muss enthalten sein');
  assert.ok(html.includes('te'), 'Silbentext te muss enthalten sein');
});
