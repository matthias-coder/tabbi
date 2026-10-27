/* ==========================================================================
   TABBI: Tipp-ArbeitsBlätter-Bibliothek – Lesekorpus & Silben-Logik
   ==========================================================================
   Didaktischer Datenkorpus für den Lese-Anfangsunterricht Klasse 1 (Hessen).
   Alle Wörter sind vorsilbiert als Array hinterlegt.
   ========================================================================== */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TabbiLesekorpus = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // 1. Die 5 Lesestufen nach dem hessischen Fibel-Verlauf
  const STUFEN = [
    {
      id: 1,
      titel: 'Stufe 1: Erste Laute (M, L, S + Vokale)',
      vokale: ['A', 'E', 'I', 'O', 'U'],
      konsonanten: ['M', 'L', 'S'],
      neueBuchstaben: ['A', 'E', 'I', 'O', 'U', 'M', 'L', 'S']
    },
    {
      id: 2,
      titel: 'Stufe 2: Erweiterter Konsonantenkreis (+ R, N, T)',
      vokale: ['A', 'E', 'I', 'O', 'U'],
      konsonanten: ['M', 'L', 'S', 'R', 'N', 'T'],
      neueBuchstaben: ['R', 'N', 'T']
    },
    {
      id: 3,
      titel: 'Stufe 3: Plosive & Weichlaute (+ D, B, P, W)',
      vokale: ['A', 'E', 'I', 'O', 'U'],
      konsonanten: ['M', 'L', 'S', 'R', 'N', 'T', 'D', 'B', 'P', 'W'],
      neueBuchstaben: ['D', 'B', 'P', 'W']
    },
    {
      id: 4,
      titel: 'Stufe 4: Reibe- & Zischlaute (+ F, K, G, Z)',
      vokale: ['A', 'E', 'I', 'O', 'U'],
      konsonanten: ['M', 'L', 'S', 'R', 'N', 'T', 'D', 'B', 'P', 'W', 'F', 'K', 'G', 'Z'],
      neueBuchstaben: ['F', 'K', 'G', 'Z']
    },
    {
      id: 5,
      titel: 'Stufe 5: Zwielaute & Verbindungen (+ EI, AU, EU, CH, SCH, ST, SP)',
      vokale: ['A', 'E', 'I', 'O', 'U', 'Ä', 'Ö', 'Ü'],
      konsonanten: [
        'M', 'L', 'S', 'R', 'N', 'T', 'D', 'B', 'P', 'W', 'F', 'K', 'G', 'Z',
        'CH', 'SCH', 'ST', 'SP'
      ],
      neueBuchstaben: ['EI', 'AU', 'EU', 'CH', 'SCH', 'ST', 'SP', 'J', 'H']
    }
  ];

  // 2. Fibel-Wortschatz (Grundwortschatz Klasse 1), stets als vorsilbierte Arrays
  const WOERTER_KORPUS = [
    // --- STUFE 1 (A, E, I, O, U, M, L, S) ---
    { text: 'Mama', silben: ['Ma', 'ma'] },
    { text: 'Lama', silben: ['La', 'ma'] },
    { text: 'Limo', silben: ['Li', 'mo'] },
    { text: 'Lela', silben: ['Le', 'la'] },
    { text: 'Mimi', silben: ['Mi', 'mi'] },
    { text: 'Oma', silben: ['O', 'ma'] },
    { text: 'Omi', silben: ['O', 'mi'] },
    { text: 'Esel', silben: ['E', 'sel'] },
    { text: 'Salsa', silben: ['Sal', 'sa'] },
    { text: 'Solo', silben: ['So', 'lo'] },
    { text: 'Mila', silben: ['Mi', 'la'] },
    { text: 'Lisa', silben: ['Li', 'sa'] },
    { text: 'Sami', silben: ['Sa', 'mi'] },
    { text: 'Melone', silben: ['Me', 'lo', 'ne'] },
    { text: 'Salomo', silben: ['Sa', 'lo', 'mo'] },

    // --- STUFE 2 (+ R, N, T) ---
    { text: 'Name', silben: ['Na', 'me'] },
    { text: 'Nase', silben: ['Na', 'se'] },
    { text: 'Tanne', silben: ['Tan', 'ne'] },
    { text: 'Rabe', silben: ['Ra', 'be'] },
    { text: 'Tor', silben: ['Tor'] },
    { text: 'Tomate', silben: ['To', 'ma', 'te'] },
    { text: 'Salat', silben: ['Sa', 'lat'] },
    { text: 'Nest', silben: ['Nest'] },
    { text: 'Rast', silben: ['Rast'] },
    { text: 'Rente', silben: ['Ren', 'te'] },
    { text: 'Riese', silben: ['Rie', 'se'] },
    { text: 'Tinte', silben: ['Tin', 'te'] },
    { text: 'Taste', silben: ['Tas', 'te'] },
    { text: 'Ente', silben: ['En', 'te'] },
    { text: 'Rose', silben: ['Ro', 'se'] },
    { text: 'Tante', silben: ['Tan', 'te'] },
    { text: 'Ast', silben: ['Ast'] },
    { text: 'Roller', silben: ['Rol', 'ler'] },

    // --- STUFE 3 (+ D, B, P, W) ---
    { text: 'Dose', silben: ['Do', 'se'] },
    { text: 'Dame', silben: ['Da', 'me'] },
    { text: 'Blume', silben: ['Blu', 'me'] },
    { text: 'Baum', silben: ['Baum'] },
    { text: 'Wal', silben: ['Wal'] },
    { text: 'Wind', silben: ['Wind'] },
    { text: 'Pinsel', silben: ['Pin', 'sel'] },
    { text: 'Post', silben: ['Post'] },
    { text: 'Butter', silben: ['But', 'ter'] },
    { text: 'Brot', silben: ['Brot'] },
    { text: 'Wolke', silben: ['Wol', 'ke'] },
    { text: 'Wiese', silben: ['Wie', 'se'] },
    { text: 'Pudel', silben: ['Pu', 'del'] },
    { text: 'Boden', silben: ['Bo', 'den'] },
    { text: 'Baden', silben: ['Ba', 'den'] },

    // --- STUFE 4 (+ F, K, G, Z) ---
    { text: 'Fisch', silben: ['Fisch'] },
    { text: 'Frosch', silben: ['Frosch'] },
    { text: 'Kiste', silben: ['Kis', 'te'] },
    { text: 'Katze', silben: ['Kat', 'ze'] },
    { text: 'Gans', silben: ['Gans'] },
    { text: 'Garten', silben: ['Gar', 'ten'] },
    { text: 'Zaun', silben: ['Zaun'] },
    { text: 'Zelt', silben: ['Zelt'] },
    { text: 'Fenster', silben: ['Fens', 'ter'] },
    { text: 'Koffer', silben: ['Kof', 'fer'] },
    { text: 'Gurke', silben: ['Gur', 'ke'] },
    { text: 'Zebra', silben: ['Ze', 'bra'] },
    { text: 'Kugel', silben: ['Ku', 'gel'] },
    { text: 'Zitrone', silben: ['Zi', 'tro', 'ne'] },

    // --- STUFE 5 (+ EI, AU, EU, CH, SCH, ST, SP, H) ---
    { text: 'Eimer', silben: ['Ei', 'mer'] },
    { text: 'Auto', silben: ['Au', 'to'] },
    { text: 'Eule', silben: ['Eu', 'le'] },
    { text: 'Buch', silben: ['Buch'] },
    { text: 'Milch', silben: ['Milch'] },
    { text: 'Schule', silben: ['Schu', 'le'] },
    { text: 'Stein', silben: ['Stein'] },
    { text: 'Stern', silben: ['Stern'] },
    { text: 'Eis', silben: ['Eis'] },
    { text: 'Maus', silben: ['Maus'] },
    { text: 'Bauch', silben: ['Bauch'] },
    { text: 'Tasche', silben: ['Ta', 'sche'] },
    { text: 'Schaf', silben: ['Schaf'] },
    { text: 'Seil', silben: ['Seil'] },
    { text: 'Reise', silben: ['Rei', 'se'] },
    { text: 'Haus', silben: ['Haus'] }
  ];

  /**
   * Bereinigt und normalisiert den Buchstaben-Pool.
   */
  function normalisierePool(pool) {
    if (!pool || !Array.isArray(pool) || pool.length === 0) {
      return ['A', 'E', 'I', 'O', 'U', 'M', 'L', 'S'];
    }
    return pool.map(b => String(b).trim().toUpperCase()).filter(Boolean);
  }

  /**
   * Erzeugt Silben (Konsonant-Vokal und Vokal-Konsonant) aus dem aktuellen Pool.
   */
  function erzeugeSilben(pool) {
    const p = normalisierePool(pool);
    const alleVokale = ['A', 'E', 'I', 'O', 'U', 'Ä', 'Ö', 'Ü'];
    const vokale = p.filter(b => alleVokale.includes(b));
    const konsonanten = p.filter(b => !alleVokale.includes(b));

    const silben = [];

    // Fallback: Mindestens 1 Vokal und 1 Konsonant nötig
    const vListe = vokale.length > 0 ? vokale : ['A', 'E', 'I', 'O', 'U'];
    const kListe = konsonanten.length > 0 ? konsonanten : ['M', 'L', 'S'];

    // 1. Konsonant + Vokal (z. B. Ma, Me, Mi, Mo, Mu)
    for (const k of kListe) {
      for (const v of vListe) {
        // Großer Anfangsbuchstabe, kleiner Vokal
        const s = k.charAt(0).toUpperCase() + k.slice(1).toLowerCase() + v.toLowerCase();
        if (!silben.includes(s)) silben.push(s);
      }
    }

    // 2. Vokal + Konsonant (z. B. am, em, im, om, um, al, el...)
    for (const v of vListe) {
      for (const k of kListe) {
        // Bei Einzellauten einfache Kombinationen
        if (k.length === 1) {
          const s = v.toLowerCase() + k.toLowerCase();
          if (!silben.includes(s)) silben.push(s);
        }
      }
    }

    return silben;
  }

  /**
   * Prüft, ob ein Wort nur aus Buchstaben des Pools besteht.
   */
  function wortPasstInPool(wort, pool) {
    const textUpper = wort.text.toUpperCase();
    const poolSet = new Set(pool);

    // Spezialfälle für Mehrfachlaute wie SCH, CH, EI, AU, EU, ST, SP abfedern
    let rest = textUpper;
    const mehrfachlaute = ['SCH', 'ST', 'SP', 'CH', 'EI', 'AU', 'EU'];
    for (const ml of mehrfachlaute) {
      if (poolSet.has(ml)) {
        rest = rest.split(ml).join('');
      }
    }

    // Prüfen, ob alle verbleibenden Einzelbuchstaben im Pool sind
    for (let i = 0; i < rest.length; i++) {
      const char = rest.charAt(i);
      if (!poolSet.has(char)) return false;
    }
    return true;
  }

  /**
   * Filtert passende Wörter aus dem Korpus nach Buchstabenpool und Schwierigkeitsgrad.
   * Schwierigkeit 2 = 2-silbige Wörter
   * Schwierigkeit 3 = bis zu 3-silbige Wörter
   */
  function filtereWoerter(pool, schwierigkeit) {
    const p = normalisierePool(pool);
    const grad = Number(schwierigkeit) || 2;

    const passende = WOERTER_KORPUS.filter(w => {
      if (!wortPasstInPool(w, p)) return false;
      if (grad === 2) {
        return w.silben.length === 2;
      }
      if (grad >= 3) {
        return w.silben.length >= 2 && w.silben.length <= 3;
      }
      return true;
    });

    return passende;
  }

  /**
   * Liefert das HTML für ein Wort, optional mit zweifarbigen Silben (blau/rot).
   */
  function silbiereWortHTML(wortObjekt, zweifarbig) {
    if (!wortObjekt || !wortObjekt.silben) return '';
    if (!zweifarbig) return wortObjekt.text;

    return wortObjekt.silben
      .map((s, index) => {
        const farbKlasse = index % 2 === 0 ? 'silbe-blau' : 'silbe-rot';
        return `<span class="${farbKlasse}">${s}</span>`;
      })
      .join('');
  }

  /**
   * Ermittelt die Lesestufe (1–5) anhand der enthaltenen Buchstaben.
   */
  function ermittleStufe(pool) {
    const p = normalisierePool(pool);
    for (let i = STUFEN.length - 1; i >= 0; i--) {
      const stufe = STUFEN[i];
      if (stufe.neueBuchstaben.some(b => p.includes(b))) {
        return stufe.id;
      }
    }
    return 1;
  }

  return {
    STUFEN,
    WOERTER_KORPUS,
    normalisierePool,
    erzeugeSilben,
    filtereWoerter,
    silbiereWortHTML,
    ermittleStufe
  };
});
