const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function ladeKatalog() {
  const code = fs.readFileSync(path.resolve(__dirname, '../js/blaetter-katalog.js'), 'utf8');
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(code, context);
  return context.window.TABBI_KATALOG;
}

test('TABBI_KATALOG enthält 5 Hessen-Lesestufen für Deutsch', () => {
  const katalog = ladeKatalog();
  assert.ok(Array.isArray(katalog), 'Katalog muss ein Array sein');

  for (let s = 1; s <= 5; s++) {
    const eintrag = katalog.find(e => e.id === `012_leseblatt_stufe_${s}`);
    assert.ok(eintrag, `Stufe ${s} muss im Katalog vorhanden sein`);
    assert.equal(eintrag.blattId, '012_leseblatt_silben_und_woerter');
    assert.equal(eintrag.url, `blaetter/012_leseblatt_silben_und_woerter.html?stufe=${s}`);
    assert.equal(eintrag.fach, 'deutsch', 'Fach muss deutsch sein');
    assert.equal(eintrag.istLeseblatt, true, 'Muss als istLeseblatt markiert sein');
  }
});

test('TABBI_KATALOG enthält freien Leseblatt-Generator für Deutsch', () => {
  const katalog = ladeKatalog();
  const gen = katalog.find(e => e.id === '012_leseblatt_generator');
  assert.ok(gen, 'Generator-Eintrag für Leseblätter muss existieren');
  assert.equal(gen.fach, 'deutsch');
});
