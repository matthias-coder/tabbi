/* ==========================================================================
   TABBI: Historien-Speicher (js/tabbi-historie.js)
   Append-only Liste abgeschlossener Blaetter. Reines Modul: kein DOM, kein
   direkter localStorage-Zugriff - der Speicher wird per erzeuge(storage)
   injiziert. Es gibt bewusst KEIN Loesch-API.
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
        // lesen -> neues Array bauen -> schreiben; gespeicherte Liste bleibt bei Fehler unberuehrt
        var neu = [eintrag].concat(lese());
        storage.setItem(SCHLUESSEL, JSON.stringify(neu));
        return { ok: true, eintrag: eintrag };
      } catch (e) {
        return { ok: false, fehler: 'speicher' };
      }
    }

    return { holeAlle: holeAlle, hole: hole, fuegeHinzu: fuegeHinzu };
  }

  return { erzeuge: erzeuge };
});
