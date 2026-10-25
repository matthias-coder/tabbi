/* ==========================================================================
   TABBI: Übergruppen der Aufgabentypen (js/tabbi-gruppen.js)
   Feste Reihenfolge der didaktischen Gruppen, Typ -> Gruppe, maximaler Zahlenraum je Typ.
   ========================================================================== */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TabbiGruppen = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var GRUPPEN = [
    { id: 'mengen', titel: 'Mengen erfassen & zählen', icon: '👀',
      typen: ['punkte', 'finger', 'wuerfel_tuerme', 'aquarium', 'strichlisten', 'buendeln', 'seifenblasen'] },
    { id: 'zerlegen', titel: 'Zahlen zerlegen', icon: '🏠',
      typen: ['zahlenhaus', 'zahlenfreunde'] },
    { id: 'ordnen', titel: 'Zahlen ordnen & vergleichen', icon: '↔️',
      typen: ['nachbarn'] },
    { id: 'rechnen', titel: 'Plus & Minus rechnen', icon: '➕',
      typen: ['rechnen', 'zwerg_riese', 'zahlenmauern'] },
    { id: 'zehner', titel: 'Zehner & Einer', icon: '🔟',
      typen: [] }
  ];

  var MAX_ZAHL = {
    zahlenfreunde: 10, finger: 10, wuerfel_tuerme: 10, aquarium: 10, seifenblasen: 10,
    strichlisten: 8, buendeln: 8,
    zahlenhaus: 20, nachbarn: 20, punkte: 20, rechnen: 20, zahlenmauern: 20, zwerg_riese: 20
  };

  function gruppeFuerTyp(typ) {
    for (var i = 0; i < GRUPPEN.length; i++) {
      if (GRUPPEN[i].typen.indexOf(typ) !== -1) return GRUPPEN[i].id;
    }
    return null;
  }

  function typenDerGruppe(gruppenId) {
    for (var i = 0; i < GRUPPEN.length; i++) {
      if (GRUPPEN[i].id === gruppenId) return GRUPPEN[i].typen.slice();
    }
    return [];
  }

  function maxZahlFuerTyp(typ) {
    return Object.prototype.hasOwnProperty.call(MAX_ZAHL, typ) ? MAX_ZAHL[typ] : 20;
  }

  return {
    GRUPPEN: GRUPPEN,
    gruppeFuerTyp: gruppeFuerTyp,
    typenDerGruppe: typenDerGruppe,
    maxZahlFuerTyp: maxZahlFuerTyp
  };
});
