/* ==========================================================================
   TABBI: Loesungen & Auswertung (js/tabbi-auswertung.js)
   Nur fuer die Lehrkraft-Auswertung. Reines Modul ohne Seiteneffekte:
   - ermittleLoesungen(rootEl, gruppeFuerTyp) liest die gerenderten Bausteine
     und ihre Daten-Attribute (bzw. gedruckte Vorgaben) und leitet daraus die
     Sollwerte ab. Es schreibt NICHTS ins DOM.
   - werteAus(loesungen, eingaben) vergleicht die gespeicherten Eingaben
     (Shape von TabbiBlatt#speichereStand) mit den Loesungen.
   Nur Eindeutiges wird bewertet; alles andere ist soll:null ("nicht ausgewertet").
   Verwendete DOM-API (bewusst klein, damit Node-Tests mit Stub laufen):
   querySelectorAll/querySelector mit einfachen Selektoren, getAttribute,
   classList.contains, textContent, closest, children.
   ========================================================================== */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TabbiAuswertung = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ------------------------------ Hilfen ---------------------------------- */

  function alle(el, sel) {
    // Per Bereichsfilter ausgeblendete Aufgaben (.aufgabe-versteckt) zählen nicht mit
    return Array.prototype.slice.call(el.querySelectorAll(sel)).filter(function (x) {
      return !(x.closest && x.closest('.aufgabe-versteckt'));
    });
  }

  function attr(el, name) {
    var v = el && el.getAttribute ? el.getAttribute(name) : null;
    return v === null || v === undefined ? null : String(v);
  }

  // Nicht-negative Ganzzahl aus Text, sonst null
  function zahl(s) {
    var t = String(s === null || s === undefined ? '' : s).trim();
    return /^\d+$/.test(t) ? parseInt(t, 10) : null;
  }

  function liste(s) {
    return String(s || '').split(',').map(function (t) { return t.trim(); }).filter(Boolean);
  }

  // Zahlwert eines Symbol-Specs: "L3", "R5", "7", "F:L3", "W:6", "T:2"
  function specWert(spec) {
    var m = /^(?:[FWT]:)?[LR]?(\d+)$/i.exec(String(spec).trim());
    return m ? parseInt(m[1], 10) : null;
  }

  function gueltigerSoll(n) {
    return typeof n === 'number' && isFinite(n) && n >= 0 && Math.floor(n) === n ? n : null;
  }

  /* ---------------------------- Gleichungen -------------------------------- */

  // Liest eine .gleichung-zeile (erstelleGleichungHTML) als Token-Liste.
  // Unbekannte Kinder (z. B. "<"-Spans ohne Klasse) -> null.
  function gleichungTokens(zeile) {
    var tokens = [];
    var kinder = Array.prototype.slice.call(zeile.children || []);
    for (var i = 0; i < kinder.length; i++) {
      var k = kinder[i];
      if (k.classList.contains('gleichung-box')) {
        var l = k.querySelector('.luecke');
        if (l) { tokens.push({ art: 'luecke', el: l }); continue; }
        var v = k.querySelector('.vorgabe');
        var w = v ? zahl(v.textContent) : null;
        if (w === null) return null;
        tokens.push({ art: 'zahl', wert: w });
      } else if (k.classList.contains('gleichung-op')) {
        var op = String(k.textContent).trim();
        if (op === '−') op = '-';
        if (op !== '+' && op !== '-' && op !== '=') return null;
        tokens.push({ art: 'op', op: op });
      } else {
        return null;
      }
    }
    return tokens;
  }

  // Loest "a ± b ± ... = c ± ..." mit genau EINER Luecke. -> { el, wert } oder null
  function loeseGleichung(tokens) {
    if (!tokens) return null;
    var seite = 1, vorz = 1, erwarteTerm = true, summe = 0, koeff = 0, luecke = null, gleich = 0;
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (erwarteTerm) {
        if (t.art === 'zahl') summe += seite * vorz * t.wert;
        else if (t.art === 'luecke') {
          if (luecke) return null;
          luecke = t.el;
          koeff += seite * vorz;
        } else return null;
        erwarteTerm = false;
      } else {
        if (t.art !== 'op') return null;
        if (t.op === '=') {
          if (++gleich > 1) return null;
          seite = -1;
          vorz = 1;
        } else vorz = t.op === '-' ? -1 : 1;
        erwarteTerm = true;
      }
    }
    if (erwarteTerm || gleich !== 1 || !luecke || koeff === 0) return null;
    var wert = gueltigerSoll(-summe / koeff);
    return wert === null ? null : { el: luecke, wert: wert };
  }

  /* ---------------------------- Zahlenmauer -------------------------------- */

  // "_; _,_; 3,4,5" -> Matrix mit allen ableitbaren Werten (null = unbekannt)
  function loeseMauer(steineStr) {
    var w = String(steineStr || '').split(';').map(function (r) { return r.trim(); }).filter(Boolean)
      .map(function (r) { return r.split(',').map(function (s) { return zahl(s); }); });
    var geaendert = true;
    while (geaendert) {
      geaendert = false;
      for (var r = 0; r < w.length - 1; r++) {
        for (var s = 0; s < w[r].length; s++) {
          var unten = w[r + 1];
          if (s + 1 >= unten.length) continue;
          var t = w[r][s], a = unten[s], b = unten[s + 1];
          if (t === null && a !== null && b !== null) { w[r][s] = a + b; geaendert = true; }
          else if (t !== null && a === null && b !== null && t - b >= 0) { unten[s] = t - b; geaendert = true; }
          else if (t !== null && b === null && a !== null && t - a >= 0) { unten[s + 1] = t - a; geaendert = true; }
        }
      }
    }
    return w;
  }

  /* ------------------------- ermittleLoesungen ----------------------------- */

  function ermittleLoesungen(rootEl, gruppeFuerTyp) {
    var erg = { luecken: {}, striche: {}, verbindungen: {}, gruppen: {} };
    if (!rootEl || typeof rootEl.querySelectorAll !== 'function') return erg;

    // Gruppe: Builder-Block (data-mix-typ) hat Vorrang, sonst Typ des Bausteins
    function gruppe(el, typ) {
      var block = el.closest ? el.closest('.mix-aufgaben-block') : null;
      var t = (block && attr(block, 'data-mix-typ')) || typ;
      if (!t || typeof gruppeFuerTyp !== 'function') return null;
      return gruppeFuerTyp(t) || null;
    }

    function setze(lueckeEl, soll, typ) {
      var id = attr(lueckeEl, 'data-id');
      if (!id || Object.prototype.hasOwnProperty.call(erg.luecken, id)) return;
      erg.luecken[id] = { soll: gueltigerSoll(soll), gruppe: gruppe(lueckeEl, typ) };
    }

    function setzeSumme(lueckeEl, partnerId, summe, typ) {
      var id = attr(lueckeEl, 'data-id');
      if (!id || Object.prototype.hasOwnProperty.call(erg.luecken, id)) return;
      erg.luecken[id] = { soll: null, gruppe: gruppe(lueckeEl, typ), regel: 'summe', partner: partnerId, summe: summe };
    }

    function haus(el, dach, paare, typ) {
      alle(el, '.luecke').forEach(function (l) {
        var id = attr(l, 'data-id') || '';
        var m = /_r(\d+)_([lr])$/.exec(id);
        if (!m) return;
        var p = paare[parseInt(m[1], 10)];
        if (!p) return;
        var andere = m[2] === 'l' ? p[1] : p[0];
        if (andere === '_') {
          setzeSumme(l, id.slice(0, -1) + (m[2] === 'l' ? 'r' : 'l'), dach, typ);
        } else {
          var v = zahl(andere);
          if (v !== null) setze(l, dach - v, typ);
        }
      });
    }

    // 1. Zahlenhaus: data-dach − Vorgabe der Zeile aus data-etagen; "_:_" -> summe
    alle(rootEl, '.zahlenhaus').forEach(function (el) {
      var dach = zahl(attr(el, 'data-dach'));
      var etagen = attr(el, 'data-etagen');
      if (dach === null || etagen === null) return;
      var paare = liste(etagen).map(function (p) {
        return p.split(':').map(function (s) { return s.trim(); });
      });
      haus(el, dach, paare, 'zahlenhaus');
    });

    // 2. Zahlenfreunde: alle Etagen beidseitig offen -> summe = dach
    alle(rootEl, '.zahlenfreund-block').forEach(function (el) {
      var dach = zahl(attr(el, 'data-dach'));
      if (dach === null) return;
      var n = zahl(attr(el, 'data-etagen-anzahl'));
      var paare = [];
      for (var r = 0; r < (n === null ? dach + 1 : n); r++) paare.push(['_', '_']);
      haus(el, dach, paare, 'zahlenfreunde');
    });

    // 3. Finger / Wuerfel / Tuerme: Wert aus data-werte (L/R-Praefix abgeschnitten)
    alle(rootEl, '.zaehl-karten-reihe').forEach(function (el) {
      var art = attr(el, 'data-baustein');
      if (art !== 'finger' && art !== 'wuerfel' && art !== 'tuerme') return;
      var werte = liste(attr(el, 'data-werte')).map(specWert);
      var typ = art === 'finger' ? 'finger' : 'wuerfel_tuerme';
      alle(el, '.luecke').forEach(function (l) {
        var m = /_(\d+)$/.exec(attr(l, 'data-id') || '');
        if (m) setze(l, werte[parseInt(m[1], 10)], typ);
      });
    });

    // 4. Punktebilder (<= 10): Anzahl Punkte aus data-werte
    alle(rootEl, '[data-baustein="punktebilder"]').forEach(function (el) {
      var werte = liste(attr(el, 'data-werte')).map(zahl);
      alle(el, '.luecke').forEach(function (l) {
        var m = /_(\d+)$/.exec(attr(l, 'data-id') || '');
        if (m) setze(l, werte[parseInt(m[1], 10)], 'punkte');
      });
    });

    // 5. Punkte > 10 (vorgedrucktes Zwanzigerfeld): n = blaue + rote Vorgabe-Punkte
    alle(rootEl, '.zwanziger-aufgabe-zeile').forEach(function (el) {
      var punkte = alle(el, '.kreis-vorgabe');
      if (!punkte.length) return; // interaktives Feld: keine Vorgabe
      var n = punkte.filter(function (k) {
        return k.classList.contains('blau') || k.classList.contains('rot');
      }).length;
      if (n < 10 || n > 20) return;
      if (n <= 19) {
        // n = 20 waere 1 Z + 10 E (Bild) oder 2 Z + 0 E -> nicht eindeutig
        var zellen = alle(el, '.stellenwert-zelle').map(function (z) { return z.querySelector('.luecke'); });
        if (zellen.length === 2 && zellen[0] && zellen[1]) {
          setze(zellen[0], 1, 'punkte');
          setze(zellen[1], n - 10, 'punkte');
        }
      }
      alle(el, '.gleichung-zeile').forEach(function (gz) {
        var t = gleichungTokens(gz);
        // "10 + _ = _" -> 10 + (n − 10) = n
        if (t && t.length === 5 && t[0].art === 'zahl' && t[0].wert === 10 && t[1].op === '+' &&
            t[2].art === 'luecke' && t[3].op === '=' && t[4].art === 'luecke') {
          setze(t[2].el, n - 10, 'punkte');
          setze(t[4].el, n, 'punkte');
        }
      });
    });

    // 6. Aquarium: Anzahl .zaehl-item im Becken (Abhaken/markiert nicht ausgewertet)
    alle(rootEl, '.aquarium-aufgabe').forEach(function (el) {
      var anzahl = 0;
      alle(el, '.aquarium-becken').forEach(function (b) { anzahl += alle(b, '.zaehl-item').length; });
      if (anzahl === 0) return;
      alle(el, '.luecke').forEach(function (l) { setze(l, anzahl, 'aquarium'); });
    });

    // 7. Strichlisten (Builder): Anzahl Tiere t = .zaehl-item mit data-id "<p>_sl_w_<t>_<i>"
    var zaehlIds = alle(rootEl, '.zaehl-item').map(function (z) { return attr(z, 'data-id') || ''; });
    function anzahlTiere(prefix, t) {
      var start = prefix + '_sl_w_' + t + '_';
      return zaehlIds.filter(function (id) { return id.indexOf(start) === 0; }).length;
    }
    alle(rootEl, '.luecke').forEach(function (l) {
      var m = /^(.+)_sl_z_(\d+)$/.exec(attr(l, 'data-id') || '');
      if (!m) return;
      var n = anzahlTiere(m[1], m[2]);
      if (n > 0) setze(l, n, 'strichlisten');
    });
    alle(rootEl, '.striche-anzeige').forEach(function (s) {
      var id = attr(s, 'data-id') || '';
      var m = /^(.+)_sl_s_(\d+)$/.exec(id);
      if (!m) return;
      var n = anzahlTiere(m[1], m[2]);
      if (n > 0) {
        erg.striche[id] = n;
        erg.gruppen[id] = gruppe(s, 'strichlisten');
      }
    });

    // 8. Seifenblasen / Zuordnung: links i <-> rechts j mit gleichem Zahlwert ("i:j,...")
    alle(rootEl, '[data-baustein="zuordnung"]').forEach(function (el) {
      var container = el.querySelector('.zuordnung-container');
      var zoId = attr(container, 'data-id');
      if (!zoId) return;
      var links = liste(attr(el, 'data-links')).map(specWert);
      var rechts = liste(attr(el, 'data-rechts')).map(zahl);
      var paare = [];
      var eindeutig = links.length > 0 && links.length === rechts.length;
      for (var i = 0; eindeutig && i < links.length; i++) {
        var treffer = [];
        rechts.forEach(function (w, j) { if (w !== null && w === links[i]) treffer.push(j); });
        if (links[i] === null || treffer.length !== 1) eindeutig = false;
        else paare.push(i + ':' + treffer[0]);
      }
      erg.verbindungen[zoId] = eindeutig ? paare.join(',') : null;
      erg.gruppen[zoId] = gruppe(container, 'seifenblasen');
    });

    // 9. Nachbarzahlen: z − 1 / z + 1
    alle(rootEl, '[data-baustein="nachbarzahlen"]').forEach(function (el) {
      var zahlen = liste(attr(el, 'data-zahlen')).map(zahl);
      alle(el, '.luecke').forEach(function (l) {
        var m = /_(\d+)_([vn])$/.exec(attr(l, 'data-id') || '');
        if (!m) return;
        var z = zahlen[parseInt(m[1], 10)];
        if (z === null || z === undefined) return;
        setze(l, m[2] === 'v' ? z - 1 : z + 1, 'nachbarn');
      });
    });

    // 10. Zahlenmauern: aus data-steine (Nachbarsumme, auch rueckwaerts)
    alle(rootEl, '[data-baustein="zahlenmauer"]').forEach(function (el) {
      var w = loeseMauer(attr(el, 'data-steine'));
      alle(el, '.luecke').forEach(function (l) {
        var m = /_r(\d+)_s(\d+)$/.exec(attr(l, 'data-id') || '');
        if (!m) return;
        var reihe = w[parseInt(m[1], 10)];
        var v = reihe ? reihe[parseInt(m[2], 10)] : null;
        if (v !== null && v !== undefined) setze(l, v, 'zahlenmauern');
      });
    });

    // 11. Rechnen / Zwerg & Riese / sonstige Gleichungen mit genau einer Luecke
    alle(rootEl, '.gleichung-zeile').forEach(function (gz) {
      var loesung = loeseGleichung(gleichungTokens(gz));
      if (!loesung) return;
      var typ = gz.closest('.zwerg-riese-karte') ? 'zwerg_riese'
        : gz.closest('.zwanziger-aufgabe-zeile') ? 'punkte' : 'rechnen';
      setze(loesung.el, loesung.wert, typ);
    });

    // 11b. Schreibstreifen / Zahlenstrahl-Reihen (.schreib-reihe)
    alle(rootEl, '.schreib-reihe').forEach(function (reihe) {
      var zellen = alle(reihe, '.schreib-zelle').map(function (z) {
        var v = z.querySelector('.vorgabe');
        var l = z.querySelector('.luecke');
        return { luecke: l, wert: v ? zahl(v.textContent) : null, spur: !!(v && v.classList.contains('spur')) };
      });
      if (zellen.some(function (z) { return z.spur; })) {
        // Schreibstreifen: die Ziffer der Reihe wird wiederholt
        var ziffer = null;
        zellen.forEach(function (z) { if (ziffer === null && z.wert !== null && !z.spur) ziffer = z.wert; });
        zellen.forEach(function (z) { if (z.luecke && ziffer !== null) setze(z.luecke, ziffer, 'schreibstreifen'); });
        return;
      }
      // Zahlenstrahl-Reihe: Schritt +1 oder -1 aus zwei gedruckten Zahlen
      var bekannt = [];
      zellen.forEach(function (z, i) { if (z.wert !== null) bekannt.push({ i: i, w: z.wert }); });
      if (bekannt.length < 2) return;
      var schritt = (bekannt[1].w - bekannt[0].w) / (bekannt[1].i - bekannt[0].i);
      if (Math.abs(schritt) !== 1) return;
      var konsistent = bekannt.every(function (b) { return b.w === bekannt[0].w + schritt * (b.i - bekannt[0].i); });
      if (!konsistent) return;
      zellen.forEach(function (z, i) {
        if (z.luecke) setze(z.luecke, bekannt[0].w + schritt * (i - bekannt[0].i), 'nachbarn');
      });
    });

    // 11c. Ordnen: gedruckte Zahlen aufsteigend in die Luecken (a < b < c ...)
    alle(rootEl, '.zwanziger-aufgabe-zeile').forEach(function (zeile) {
      if (zeile.querySelector('.kreis-vorgabe')) return;
      var gz = zeile.querySelector('.gleichung-zeile');
      if (!gz) return;
      var luecken = alle(gz, '.luecke');
      var quelle = Array.prototype.slice.call(zeile.children || []).filter(function (k) {
        return !k.classList.contains('gleichung-zeile');
      });
      if (quelle.length !== 1 || !luecken.length) return;
      var zahlen = (String(quelle[0].textContent).match(/\d+/g) || []).map(function (s) { return parseInt(s, 10); });
      var eindeutig = zahlen.every(function (n, i) { return zahlen.indexOf(n) === i; });
      if (!eindeutig || zahlen.length !== luecken.length) return;
      zahlen.sort(function (a, b) { return a - b; });
      luecken.forEach(function (l, i) { setze(l, zahlen[i], 'nachbarn'); });
    });

    // 11d. Halbieren: "n = _ + _" unter einem Halbieren-Label -> zwei gleiche Haelften
    alle(rootEl, '.gleichung-zeile').forEach(function (gz) {
      if (!gz.closest('.zwerg-riese-karte')) return;
      var t = gleichungTokens(gz);
      if (!t || t.length !== 5 || t[0].art !== 'zahl' || t[1].op !== '=' || t[2].art !== 'luecke' ||
          t[3].op !== '+' || t[4].art !== 'luecke' || t[0].wert % 2 !== 0) return;
      var label = null;
      Array.prototype.slice.call((gz.parentNode && gz.parentNode.children) || []).some(function (k) {
        if (k === gz) return true;
        if (k.classList.contains('zwerg-riese-label')) label = k;
        return false;
      });
      if (!label || String(label.textContent).indexOf('Halbieren') === -1) return;
      setze(t[2].el, t[0].wert / 2, 'zwerg_riese');
      setze(t[4].el, t[0].wert / 2, 'zwerg_riese');
    });

    // 11e. Zehnerstopp: Hauptaufgabe "a + b = _" legt Schritt 2 "10 + _ = _" fest
    alle(rootEl, '.schritt-box').forEach(function (box) {
      var haupt = null, s2 = null;
      alle(box, '.gleichung-zeile').forEach(function (gz) {
        var t = gleichungTokens(gz);
        if (!t || t.length !== 5) return;
        var arten = t.map(function (x) { return x.art; }).join(',');
        if (arten === 'zahl,op,zahl,op,luecke' && t[1].op === '+' && t[3].op === '=' && !haupt) haupt = t;
        else if (arten === 'zahl,op,luecke,op,luecke' && t[0].wert === 10 && t[1].op === '+' && t[3].op === '=' && !s2) s2 = t;
      });
      if (!haupt || !s2) return;
      var summe = haupt[0].wert + haupt[2].wert;
      if (summe < 10) return;
      setze(s2[2].el, summe - 10, 'rechnen');
      setze(s2[4].el, summe, 'rechnen');
    });

    // 12. Alle uebrigen Luecken: nicht ausgewertet
    alle(rootEl, '.luecke').forEach(function (l) { setze(l, null, null); });

    return erg;
  }

  /* ------------------------------ werteAus --------------------------------- */

  function leeresErgebnis() {
    return { gesamt: 0, falsch: 0, leer: 0, nichtAusgewertet: 0, proGruppe: {}, details: {}, soll: {} };
  }

  function normPaare(s) {
    return String(s || '').split(',').map(function (p) { return p.trim(); }).filter(Boolean)
      .map(function (p) {
        var t = p.split(':');
        return parseInt(t[0], 10) + ':' + parseInt(t[1], 10);
      }).sort().join(',');
  }

  function werteAus(loesungen, eingaben) {
    var erg = leeresErgebnis();
    if (!loesungen || typeof loesungen !== 'object') return erg;
    var ein = eingaben && typeof eingaben === 'object' ? eingaben : {};
    var eL = ein.luecken || {}, eS = ein.striche || {}, eV = ein.verbindungen || {};
    var gruppen = loesungen.gruppen || {};

    function text(id) {
      var v = eL[id];
      return v === null || v === undefined ? '' : String(v).trim();
    }

    function buche(id, status, gruppe, sollText) {
      erg.details[id] = status;
      if (status === 'nicht-ausgewertet') { erg.nichtAusgewertet++; return; }
      erg.gesamt++;
      if (status === 'falsch') erg.falsch++;
      if (status === 'leer') erg.leer++;
      erg.soll[id] = sollText;
      if (gruppe) {
        var g = erg.proGruppe[gruppe] || (erg.proGruppe[gruppe] = { gesamt: 0, falsch: 0, leer: 0 });
        g.gesamt++;
        if (status === 'falsch') g.falsch++;
        if (status === 'leer') g.leer++;
      }
    }

    var L = loesungen.luecken || {};
    Object.keys(L).forEach(function (id) {
      var e = L[id] || {};
      var eigen = text(id);
      if (e.regel === 'summe') {
        if (eigen === '') return buche(id, 'leer', e.gruppe, 'Summe ' + e.summe);
        var partner = text(e.partner);
        // Ohne Partnerwert ist die Zerlegung nicht eindeutig pruefbar
        if (partner === '') return buche(id, 'nicht-ausgewertet');
        var a = zahl(eigen), b = zahl(partner);
        var ok = a !== null && b !== null && a + b === e.summe;
        return buche(id, ok ? 'richtig' : 'falsch', e.gruppe, 'Summe ' + e.summe);
      }
      if (e.soll === null || e.soll === undefined) return buche(id, 'nicht-ausgewertet');
      if (eigen === '') return buche(id, 'leer', e.gruppe, String(e.soll));
      buche(id, zahl(eigen) === e.soll ? 'richtig' : 'falsch', e.gruppe, String(e.soll));
    });

    var S = loesungen.striche || {};
    Object.keys(S).forEach(function (id) {
      var ist = parseInt(eS[id], 10);
      if (!ist) return buche(id, 'leer', gruppen[id], String(S[id]));
      buche(id, ist === S[id] ? 'richtig' : 'falsch', gruppen[id], String(S[id]));
    });

    var V = loesungen.verbindungen || {};
    Object.keys(V).forEach(function (id) {
      if (V[id] === null || V[id] === undefined) return buche(id, 'nicht-ausgewertet');
      var ist = String(eV[id] || '').trim();
      if (ist === '') return buche(id, 'leer', gruppen[id], V[id]);
      buche(id, normPaare(ist) === normPaare(V[id]) ? 'richtig' : 'falsch', gruppen[id], V[id]);
    });

    return erg;
  }

  /* --------------------- Texte fuer die Lehrkraft-Auswertung --------------------- */

  // "x von y falsch · z nicht bearbeitet" (nur Lehrkraft-Ansicht)
  function zusammenfassungsText(erg) {
    var e = erg || {};
    return (e.falsch || 0) + ' von ' + (e.gesamt || 0) + ' falsch · ' + (e.leer || 0) + ' nicht bearbeitet';
  }

  // proGruppe -> [{ id, titel, text }] in der festen Reihenfolge der Gruppen;
  // unbekannte Gruppen-Ids hinten mit ihrer Id als Titel.
  function gruppenAufteilung(proGruppe, gruppenListe) {
    var pg = proGruppe || {};
    var liste = gruppenListe || [];
    var ids = [];
    liste.forEach(function (g) { if (pg[g.id]) ids.push(g.id); });
    Object.keys(pg).forEach(function (id) { if (ids.indexOf(id) === -1) ids.push(id); });
    return ids.map(function (id) {
      var g = null;
      for (var i = 0; i < liste.length; i++) if (liste[i].id === id) g = liste[i];
      return { id: id, titel: g ? g.titel : id, text: zusammenfassungsText(pg[id]) };
    });
  }

  // Zuordnungs-Soll "0:2,1:0" -> "Bild 1 – 7 · Bild 2 – 3" (rechtsWerte: angezeigte Zahlen je Index)
  function zuordnungSollText(soll, rechtsWerte) {
    var werte = rechtsWerte || [];
    var teile = String(soll || '').split(',').map(function (p) { return p.trim(); }).filter(Boolean)
      .map(function (p) {
        var t = p.split(':');
        var i = parseInt(t[0], 10), j = parseInt(t[1], 10);
        if (isNaN(i) || isNaN(j)) return null;
        var roh = werte[j];
        var w = roh !== undefined && roh !== null && String(roh).trim() !== '' ? String(roh).trim() : String(j + 1);
        return { i: i, text: 'Bild ' + (i + 1) + ' – ' + w };
      })
      .filter(Boolean)
      .sort(function (a, b) { return a.i - b.i; })
      .map(function (x) { return x.text; });
    return teile.length ? teile.join(' · ') : 'Verbindungen';
  }

  return {
    ermittleLoesungen: ermittleLoesungen,
    werteAus: werteAus,
    zusammenfassungsText: zusammenfassungsText,
    gruppenAufteilung: gruppenAufteilung,
    zuordnungSollText: zuordnungSollText
  };
});
