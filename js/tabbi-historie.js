/* ==========================================================================
   TABBI: Historien-Speicher (js/tabbi-historie.js)
   Append-only Liste abgeschlossener Blaetter. Reines Modul: kein DOM, kein
   direkter localStorage-Zugriff - der Speicher wird per erzeuge(storage)
   injiziert. Es gibt bewusst KEIN Loesch-API.
   Dazu reine Hilfsfunktionen fuer das Abschliessen (Gruppen, Datum, URLs).
   ========================================================================== */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TabbiHistorie = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var SCHLUESSEL = 'tabbi_historie_v1';

  function erzeuge(storage) {
    function lese() {
      try {
        var roh = storage.getItem(SCHLUESSEL);
        if (roh === null || roh === undefined) return [];
        var liste = JSON.parse(roh);
        return Array.isArray(liste) ? liste : [];
      } catch (e) {
        return [];
      }
    }

    // Streng: wirft, wenn ein vorhandener Verlauf nicht lesbar ist (nie ueberschreiben).
    function leseStreng() {
      var roh = storage.getItem(SCHLUESSEL);
      if (roh === null || roh === undefined || roh === '') return [];
      var liste = JSON.parse(roh);
      if (!Array.isArray(liste)) throw new Error('kein Array');
      return liste;
    }

    function holeAlle() {
      return lese();
    }

    function hole(id) {
      var liste = lese();
      for (var i = 0; i < liste.length; i++) {
        if (liste[i] && liste[i].id === id) return liste[i];
      }
      return null;
    }

    function zufall4() {
      var s = '';
      while (s.length < 4) s += Math.random().toString(36).slice(2);
      return s.slice(0, 4);
    }

    function fuegeHinzu(eintragOhneId) {
      var eintrag = {};
      var k;
      for (k in eintragOhneId) {
        if (Object.prototype.hasOwnProperty.call(eintragOhneId, k)) eintrag[k] = eintragOhneId[k];
      }
      eintrag.id = 'h_' + Date.now() + '_' + zufall4();
      eintrag.abgeschlossenAm = new Date().toISOString();
      try {
        // lesen (streng) -> neues Array bauen -> schreiben; unlesbarer/alter Verlauf wird nie ueberschrieben
        var neu = [eintrag].concat(leseStreng());
        storage.setItem(SCHLUESSEL, JSON.stringify(neu));
        return { ok: true, eintrag: eintrag };
      } catch (e) {
        return { ok: false, fehler: 'speicher' };
      }
    }

    return { holeAlle: holeAlle, hole: hole, fuegeHinzu: fuegeHinzu };
  }

  /* ----------------------- reine Hilfsfunktionen ------------------------- */

  // Eindeutige Gruppen (Reihenfolge des ersten Auftretens) aus Loesungen + Zusatz-Typen
  function gruppenAusLoesungen(loesungen, zusatzTypen, gruppeFuerTyp) {
    var erg = [];
    function dazu(g) {
      if (g && erg.indexOf(g) === -1) erg.push(g);
    }
    (Array.isArray(zusatzTypen) ? zusatzTypen : []).forEach(function (t) {
      if (typeof gruppeFuerTyp === 'function') dazu(gruppeFuerTyp(t));
    });
    if (loesungen && typeof loesungen === 'object') {
      ['luecken', 'gruppen'].forEach(function (feld) {
        var map = loesungen[feld];
        if (!map || typeof map !== 'object') return;
        Object.keys(map).forEach(function (id) {
          var v = map[id];
          dazu(v && typeof v === 'object' ? v.gruppe : v);
        });
      });
    }
    return erg;
  }

  // ISO-Zeitpunkt -> "TT.MM.JJJJ" (lokale Zeit); ungueltig -> ''
  function formatiereDatum(iso) {
    var d = new Date(iso);
    if (!iso || isNaN(d.getTime())) return '';
    function zwei(n) { return (n < 10 ? '0' : '') + n; }
    return zwei(d.getDate()) + '.' + zwei(d.getMonth() + 1) + '.' + d.getFullYear();
  }

  // Seiten-URL (relativ zur Bibliothek) ohne Sitzungs-Parameter, z. B. "blaetter/001.html?bereich=1-5"
  var SITZUNGS_PARAMETER = ['historie', 'testId', 'aktion', 'print', 'fokus'];
  function blattUrl(dateiname, search) {
    var basis = 'blaetter/' + String(dateiname || '');
    var q = String(search || '').replace(/^\?/, '');
    if (!q) return basis;
    var teile = q.split('&').filter(function (teil) {
      if (!teil) return false;
      var name = decodeURIComponent(teil.split('=')[0]);
      return SITZUNGS_PARAMETER.indexOf(name) === -1;
    });
    return teile.length ? basis + '?' + teile.join('&') : basis;
  }

  // URL der gesperrten Ansicht eines Historien-Eintrags (relativ zur Bibliothek).
  // Nur die Seite + historie: Bereich/Zahlen/Tabs stecken bereits im Schnappschuss.
  function ansichtsUrl(eintrag) {
    if (!eintrag || !eintrag.id) return '';
    var seite = String(eintrag.url || '').split('?')[0];
    return seite + '?historie=' + encodeURIComponent(eintrag.id);
  }

  // einstellungen eines Builder-Eintrags -> Generator-Zustand fuer "Nochmal neu".
  // gueltigeTypen: Liste erlaubter Typ-Ids. Ungueltig/leer -> null.
  function zustandAusEinstellungen(e, gueltigeTypen) {
    if (!e || typeof e !== 'object') return null;
    var erlaubt = Array.isArray(gueltigeTypen) ? gueltigeTypen : null;
    var typen = (Array.isArray(e.typen) ? e.typen : []).filter(function (t) {
      return typeof t === 'string' && (!erlaubt || erlaubt.indexOf(t) !== -1);
    });
    if (typen.length === 0) return null;
    var bereich = ['1-5', '1-10', '1-20'].indexOf(e.bereich) !== -1 ? e.bereich : '1-10';
    var zahlen = null;
    if (Array.isArray(e.zahlen)) {
      zahlen = e.zahlen.filter(function (z) { return typeof z === 'number' && z >= 1 && z <= 20 && z % 1 === 0; });
      if (zahlen.length === 0) zahlen = null;
    }
    var anzahl = ['wenig', 'mittel', 'viel'].indexOf(e.anzahl) !== -1 ? e.anzahl : 'mittel';
    var praefix = typeof e.praefix === 'string' ? e.praefix : '';
    return { typen: typen, bereich: bereich, zahlen: zahlen, anzahl: anzahl, praefix: praefix };
  }

  return {
    zustandAusEinstellungen: zustandAusEinstellungen,
    erzeuge: erzeuge,
    gruppenAusLoesungen: gruppenAusLoesungen,
    formatiereDatum: formatiereDatum,
    blattUrl: blattUrl,
    ansichtsUrl: ansichtsUrl
  };
});
