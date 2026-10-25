# TABBI: Tipp-ArbeitsBlätter-Bibliothek (System-Regeln & Architektur)

## 1. Projektvision & Eiserne Grundregel
TABBI ist eine statische Web-App (PWA auf GitHub Pages) für einen Erstklässler (Louis), der mit Unterstützung einer Teilhabeassistentin Schul-Arbeitsblätter digital ausfüllt.
- **Ziel:** Motorische Entlastung (Tippen statt Schreiben/Ausmalen), **KEINE kognitive Hilfe**.
- **Eiserne Grundregel:** Die digitale Fassung darf nichts verraten, einschränken oder erleichtern, was auf dem Papier-Arbeitsblatt offen ist. Vor jeder UI-Entscheidung prüfen: *"Sieht oder erfährt das Kind hier etwas, das es auf dem Blatt selbst herausfinden müsste?"*

### Verboten sind strikt:
- Felder/Kreise deaktivieren oder ausgrauen, die laut Lösung nicht gebraucht werden.
- Automatisches Auffüllen bis zu einer Zielzahl.
- Eingabe auf "passende" Werte begrenzen (Ziffernblock muss immer den vollen Zahlenraum 0–10 bzw. 0–20 zeigen).
- Richtig/Falsch-Feedback, Sterne, Punkte, Sounds, Belohnungen oder Prüfen-Knöpfe.
- Systemtastatur des Tablets (`<input>`-Felder sind verboten! Lücken sind klickbare `<div>`- oder `<button>`-Elemente).
- Vorschläge, Autokorrektur, Auto-Vervollständigung.

### Erlaubte Bedienhilfen (rein motorisch):
- Aktive Lücke gelb (`#fffacd`) markieren.
- Nach Zahleneingabe springt der Fokus automatisch zur nächsten leeren Lücke.
- Direkte Überschreibbarkeit: Antippen einer bereits ausgefüllten Lücke + neue Zahl überschreibt den alten Wert sofort (kein vorheriges Löschen nötig).
- Smarte Rückschritt-Taste (`⌫`): 
  1. Ist das aktive Feld gefüllt -> Inhalt löschen, Fokus bleibt im Feld.
  2. Ist das aktive Feld bereits leer -> Fokus springt ein Feld zurück.
- "Löschen"-Knopf (Blatt leeren) mit Zwei-Tipp-Bestätigung direkt im UI (kein `window.confirm()`).

---

## 2. Visuelles Design & Layout
- **Schriftart:** Google Font `'Andika'` (für Leseanfänger optimiert), Fallback `system-ui, sans-serif`.
- **Farbschema:**
  - Hintergrund: Rechenheft-Karo-Muster (dezentes CSS-Grid-Pattern).
  - Vorgedruckte Zahlen/Texte (Vorgaben): Druck-Schwarz (`#222222`).
  - **Kind-Eingaben:** Kräftiges **Füller-Blau** (`#0000CD`), leicht hervorgehoben (`font-weight: bold`), damit die Lehrkraft sofort erkennt, was das Kind eingetragen hat.
- **Fat-Finger-Schutz:** 
  - `touch-action: manipulation` und `user-select: none` global aktivieren (verhindert Double-Tap-to-Zoom und Textmarkierung auf dem Tablet).
  - Fester Ziffernblock am unteren Bildschirmrand (`position: fixed; bottom: 0`), Tasten mind. `56px` hoch, inkl. `env(safe-area-inset-bottom)`.
  - Zurück-Navigation zur Bibliothek (`index.html`) gegen versehentliches Tippen schützen (z.B. Zwei-Tipp-Bestätigung).

---

## 3. Druck- & PDF-Workflow (`@media print`)
Die Korrektur erfolgt analog durch die Lehrkraft auf Papier oder im exportierten PDF.
- Jedes Blatt hat oben rechts einen Button `🖨️ PDF / Drucken` (`window.print()`).
- Im `@media print`:
  - Ziffernblock, Navigation, Hilfe-Texte, "Löschen"- und "Drucken"-Buttons komplett ausblenden (`.print-hide { display: none !important; }`).
  - Gelbe Fokus-Markierung der aktiven Lücke ausblenden, Rahmen neutralisieren.
  - **Farbdruck erzwingen:** `-webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;`, damit Füller-Blau und rot/blaue Plättchen im PDF/Druck erhalten bleiben.

---

## 4. Technische Struktur & Datenhaltung
- **Reines Vanilla-Setup:** HTML5, CSS3, Vanilla JS. Keine Frameworks, kein Build-Step, direkt lauffähig auf GitHub Pages.
- **Ordnerstruktur:**
  - `index.html` (Visuelle Bibliothek mit großen Kacheln, Vorschaubild und Fortschrittsstatus `⚪ Neu`, `✏️ Angefangen`).
  - `css/tabbi.css` (Zentrales Stylesheet für Heft-Karo, Ziffernblock, Bausteine, Print-Styles).
  - `js/tabbi-core.js` (Zentrale Logik für Numpad, Fokus-Steuerung, Backspace, `localStorage` Sync, Zwei-Tipp-Reset).
  - `blaetter/*.html` (Einzelne Arbeitsblätter, eindeutig identifiziert über `data-blatt-id`).
- **Speicherung (`localStorage`):**
  - Schlüssel-Format: `tabbi_daten_<blatt_id>` (mit `try/catch` abgesichert).
  - Speichert alle Lücken-Werte und Plättchen-Zustände bei jeder Änderung sofort ab und stellt sie beim Laden wieder her.

---

## 5. Standard-Bausteine für Aufgaben
1. **Zahlenhaus:** Dach mit Zielzahl, darunter zweispaltige Tabelle (Wohnungen) mit Vorgaben (schwarz) und Lücken (Füller-Blau).
2. **Zahlenfreunde / Zehnerstreifen / Plättchen:**
   - 10 Kreise in zwei 5er-Gruppen (durch kleinen Abstand oder Trennstrich geteilt). Alle 10 Kreise sind immer aktiv und identisch.
   - **3-State-Toggle pro Kreis:** 1. Tipp = Blau (`#2563eb`), 2. Tipp = Rot (`#dc2626`), 3. Tipp = Leer (transparent).
3. **Rechenpäckchen / Gleichungen:** `3 + [Lücke] = [Lücke]`.
4. **Wörter / Buchstaben (Deutsch):** Statt Ziffernblock wird unten eine vollständige Buchstaben-Tastatur (A–Z + ÄÖÜ als große Kacheln) eingeblendet.

---

## 6. Workflow für neue Arbeitsblätter (Foto -> HTML)
Wenn ein Foto eines neuen Arbeitsblatts übergeben wird:
1. Jede Aufgabe analysieren und vollständig transkribieren (Vorgaben vs. Lücken).
2. **Nicht raten:** Bei unleserlichen Stellen im Chat konkret nachfragen (z. B. *"Haus 7, Reihe 3 rechts: Ist das eine 4 oder 9?"*).
3. Eiserne Grundregel prüfen.
4. Sauberes HTML-Blatt im Ordner `blaetter/` generieren und in der `index.html` verlinken.