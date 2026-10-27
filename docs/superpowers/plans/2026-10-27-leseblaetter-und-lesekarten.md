# Leseblätter & Lese-Karten (Deutsch Klasse 1) – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Neues Fach Deutsch mit 5 hessischen Lesestufen, druckbaren A4-Leseblättern mit 25 mm Heftrand, Vollbild-Lese-Karten-Modus (4–6rem 'Andika') und separatem Buchstaben-Generator für Lehrkräfte/Eltern.

**Architecture:** Reines Vanilla-Setup analog zu den bestehenden Modulen. `js/tabbi-lesekorpus.js` als UMD-Modul mit vor-silbierten Wörtern und Silbengenerator (in Node mit `node --test` testbar). `blaetter/012_leseblatt_silben_und_woerter.html` als interaktives Lese- und Druckmodul mit Vollbild-Modus und Generator-Overlay. Keine Lücken/Eingaben; zustandsloses Lese-Tool.

**Tech Stack:** HTML5, CSS3, Vanilla JS (ES6/UMD), Node.js Test Runner (`node --test`), Service Worker Cache v16.

**Spec:** `docs/superpowers/specs/2026-10-27-leseblaetter-und-lesekarten-design.md`

## Global Constraints

- Eiserne Grundregel (`AGENTS.md` §1): Keine kognitiven Hilfen, keine Sprachausgabe, kein Timer, keine automatische Bewertung.
- Designsystem „Heft & Füller“ (`docs/design/designsystem.md`): Kind-Zone bleibt neutral (nur Tinte & Papier). Keine Emojis/Sticker auf der Lesefläche.
- Farben: Text schwarz `#222222`, optionale Silbenfärbung ausschließlich Blau `#2563eb` und Rot `#dc2626` (Fibel-Standard). UI-Akzente Petrol (`#0f766e`).
- Lesekarten-Navigation: Touch-Tasten mindestens 56 px hoch, `touch-action: manipulation`, Desktop-Pfeiltasten-Steuerung.
- Druck: A4 portrait mit 25 mm Rand links (Heftrand), einheitlicher Kopf `Name: ________`, Titel fett zentriert, `Datum: TT.MM.JJJJ`.
- Keine Vermischung mit `011_click_und_mix.html`: Deutsch-Lesen bleibt ein separates Modul.
- Offline-PWA: Jede Asset-Änderung zählt `sw.js` `CACHE_NAME` hoch und listet neue Dateien in `CORE_ASSETS`.
- Kein Kindername in Dateien oder Commit-Messages (gesichert durch `tests/kein-kindername.test.js`).

## Review Focus

1. **Unbekannte oder leere Buchstaben-Parameter in der URL:** `?buchstaben=` leer oder mit ungültigen Zeichen fällt sauber auf Stufe 1 zurück ohne Absturz.
2. **Schriftgrößen-Skalierung im Lese-Karten-Modus:** Sehr lange Wörter (z. B. *Schmetterling* oder 3-Silber) ragen auf schmalen Smartphone-Displays nicht über den Bildschirmrand hinaus.
3. **Pfeiltasten-Navigation an den Rändern:** Auf der 1. Karte ist `◀ Zurück` deaktiviert; auf der letzten Karte wechselt `Weiter ▶` zum Abschluss-Button `Fertig gelesen 👍`.
4. **Drucklayout:** Silbentabelle und Wortliste passen sauber auf genau 1 DIN-A4-Seite ohne unbeabsichtigten Seitenumbruch.
5. **Druckname:** Ist `tabbi_druckname` im `localStorage` hinterlegt, erscheint er im Druckkopf des Leseblatts.

---

### Task 1: Datenkorpus & Silben-Logik (`js/tabbi-lesekorpus.js`)

**Files:**
- Create: `js/tabbi-lesekorpus.js`
- Test: `tests/lesekorpus.test.js`

**Interfaces:**
- Produces: `window.TabbiLesekorpus = { STUFEN, erzeugeSilben(buchstabenPool), filtereWoerter(buchstabenPool, schwierigkeit), silbiereWort(wortObjekt), ermittleStufe(buchstabenPool) }`
  - `STUFEN`: Array von 1 bis 5 mit `{ id: number, titel: string, neueBuchstaben: string[], vokale: string[], konsonanten: string[] }`.
  - `erzeugeSilben(pool)`: Erzeugt deterministisch Konsonant-Vokal- und Vokal-Konsonant-Paare (z. B. *Ma, Mo, el, am*).
  - `filtereWoerter(pool, schwierigkeit)`: Gibt Wörter zurück, deren Buchstaben vollständig in `pool` enthalten sind, sortiert/gefiltert nach Silbenanzahl (Schwierigkeit 2 = genau 2 Silben; Schwierigkeit 3 = bis zu 3 Silben). Jedes Wort ist ein Objekt `{ text: string, silben: string[] }`.

- [ ] **Step 1: Failing Test schreiben** in `tests/lesekorpus.test.js`:
  - Testet, dass alle 5 Stufen definiert sind und korrekte Buchstaben enthalten.
  - Testet, dass `erzeugeSilben(['A','M','L'])` Silben wie `Ma`, `La`, `am`, `al` liefert, aber keine Buchstaben außerhalb des Pools.
  - Testet, dass `filtereWoerter(['A','E','I','O','U','M','L','S'], 2)` Wörter wie *Mama*, *Lama*, *Limo* findet, aber kein Wort mit *T* oder *R*.
  - Testet, dass unbekannte/leere Buchstaben-Arrays auf Fallback-Pool Stufe 1 zurückfallen.
  - Testet, dass jedes Wortobjekt über ein `silben`-Array verfügt (z. B. `['To', 'ma', 'te']`).
- [ ] **Step 2:** Test ausführen: `node --test tests/lesekorpus.test.js` → FAIL.
- [ ] **Step 3:** `js/tabbi-lesekorpus.js` als UMD-Modul mit vollständigem hessischen Grundschul-Wortschatz (Stufen 1–5) implementieren.
- [ ] **Step 4:** Test ausführen: `node --test tests/lesekorpus.test.js` → PASS.
- [ ] **Step 5:** Commit: `feat: add reading corpus and syllable generator module`.

---

### Task 2: Styles für Leseblätter, Silbentabelle & Vollbild-Lesekarten (`css/tabbi.css`)

**Files:**
- Modify: `css/tabbi.css`

**Interfaces:**
- Produces CSS-Klassen:
  - `.leseblatt-container`, `.silben-raster`, `.silben-zelle`: Gestochen scharfe Silbentabelle im Schulheft-Stil.
  - `.lese-woerter-grid`, `.lese-wort-eintrag`: Zweispaltige Wortliste mit Fibel-Schrift 'Andika' und 32px Zeilenabstand für den Lesefinger.
  - `.silbe-blau` (`color: #2563eb`), `.silbe-rot` (`color: #dc2626`): Zweifarbige Silben für Fibel-Methode.
  - `.lese-karten-overlay`: Vollbild-Kartenansicht mit fixed-Positionierung (`z-index: 1000`), ablenkungsfreiem Hintergrund (`#ffffff` oder leicht abgetönt), zentrierter Großschrift (`font-size: clamp(3.5rem, 10vw, 7rem)`), `.lese-nav` mit großen Tasten (min 56px).
  - `@media print`: Spezifische Druckformatierung für Leseblätter (25 mm Rand links, einheitliche Linien, Seitenumbruch vermieden).

- [ ] **Step 1:** CSS-Regeln für `.silben-raster`, `.lese-woerter-grid` und `.silbe-blau`/`.silbe-rot` in `css/tabbi.css` ergänzen.
- [ ] **Step 2:** Vollbild-Overlay-Styles `.lese-karten-overlay` mit responsivem `clamp`-Font und Touch-Buttons gestalten.
- [ ] **Step 3:** Print-Styles für `.leseblatt-druck` in `@media print` integrieren (1 Seite A4).
- [ ] **Step 4:** Commit: `feat: styles for reading sheets, syllable tables and flashcards`.

---

### Task 3: Leseblatt-Seite & Vollbild-Viewer (`blaetter/012_leseblatt_silben_und_woerter.html`)

**Files:**
- Create: `blaetter/012_leseblatt_silben_und_woerter.html`
- Test: `tests/leseblatt-dom.test.js` (prüft HTML-Struktur, Script-Imports, data-Attribute)

**Interfaces:**
- Consumes: `TabbiLesekorpus`, `TabbiCore` (für Druckdatum, Druckname, Lehrkraft-Gate).
- URL-Parameter: `?stufe=1` (1 bis 5) oder `?buchstaben=A,E,I,M,L,S&grad=2&faerbung=1`.
- Produces:
  - Interaktives Arbeitsblatt mit Kopf (`Name: ________`, `Leseblatt Stufe X`, Datum).
  - Schalter oben: `🖨️ PDF / Drucken` und `🔍 Lese-Karten starten`.
  - Vollbild-Lese-Karten-Engine: Zeigt Silben & Wörter nacheinander, Tastatursteuerung (Pfeiltasten, Leertaste), Touch-Gesten, Karte-Zähler (`Karte X von Y`).
  - Abschluss-Bildschirm: Nach der letzten Karte erscheint die Karte *„Fertig gelesen 👍“* mit Knopf zum Zurückkehren.

- [ ] **Step 1: Failing Test schreiben** in `tests/leseblatt-dom.test.js`:
  - Prüft, dass die HTML-Datei existiert und UTF-8-kodiert ist.
  - Prüft, dass keine verbotenen `<input>`-Tags vorhanden sind.
  - Prüft, dass `js/tabbi-lesekorpus.js` und `css/tabbi.css` korrekt referenziert sind.
- [ ] **Step 2:** Test ausführen: `node --test tests/leseblatt-dom.test.js` → FAIL.
- [ ] **Step 3:** `blaetter/012_leseblatt_silben_und_woerter.html` erstellen:
  - Liest Parameter aus `window.location.search`.
  - Generiert Silbentabelle und Wortliste aus `TabbiLesekorpus`.
  - Implementiert den Lese-Karten-Viewer (State: `kartenIndex`, `kartenListe`, Vor-/Zurück-Methoden, Tastatur-Listener).
  - Bindet `tabbi_druckname` ein.
- [ ] **Step 4:** Test ausführen: `node --test tests/leseblatt-dom.test.js` → PASS.
- [ ] **Step 5:** Commit: `feat: add reading worksheet and fullscreen card viewer`.

---

### Task 4: Separater Leseblatt-Generator (Modal / Dialog)

**Files:**
- Modify: `blaetter/012_leseblatt_silben_und_woerter.html`
- Modify: `css/tabbi.css`

**Interfaces:**
- Produces: Generator-Overlay `#generator-modal` in `012_leseblatt_silben_und_woerter.html` (aufrufbar über den Button *„⚙️ Neues Leseblatt erstellen“* im Blatt-Header).
  - Schnellauswahl-Chips für Hessen-Stufen 1–5.
  - Individuelle Buchstaben-Chips (A–Z) zum Ein-/Ausschalten.
  - Schwierigkeits-Stufen-Wahl (1: Silben, 2: 2-Silber, 3: 3-Silber).
  - Checkbox/Toggle für zweifarbige Silben (blau/rot).
  - Button *„Leseblatt anzeigen“* (aktualisiert das Blatt ohne Neuladen per URL/State).

- [ ] **Step 1:** HTML-Markup für das Modal in `012_leseblatt_silben_und_woerter.html` einfügen.
- [ ] **Step 2:** Generator-Logik implementieren: Buchstaben-Kacheln toggeln, Stufen-Vorauswahl synchronisieren, Parameter zusammenstellen.
- [ ] **Step 3:** CSS-Styling für das Generator-Modal im Designsystem (Petrol-Akzent, saubere Kacheln).
- [ ] **Step 4:** Commit: `feat: separate reading worksheet generator overlay`.

---

### Task 5: Bibliotheks-Integration (`index.html` & `js/blaetter-katalog.js`)

**Files:**
- Modify: `js/blaetter-katalog.js`
- Modify: `index.html`
- Test: `tests/katalog-deutsch.test.js`

**Interfaces:**
- Produces:
  - 5 neue Katalog-Einträge in `js/blaetter-katalog.js` (für Stufe 1 bis 5) unter der Fachkategorie `deutsch` bzw. Gruppe `lesen`.
  - 1 Generator-Kachel für Deutsch in der Bibliothek (*„📖 Eigenes Leseblatt erstellen“*).
  - Fach-Filter in `index.html`: Ermöglicht das Umschalten zwischen *„Alle“*, *„➕ Mathe“* und *„📖 Deutsch“*.
  - Statusanzeige für Leseblätter: Zeigt `📖 Leseblatt` anstelle von Lücken-Zählern.

- [ ] **Step 1: Failing Test schreiben** in `tests/katalog-deutsch.test.js`:
  - Prüft, dass `TABBI_KATALOG` die 5 neuen Deutsch-Leseblätter enthält.
  - Prüft, dass alle URLs auf `blaetter/012_leseblatt_silben_und_woerter.html?stufe=X` verweisen.
- [ ] **Step 2:** Test ausführen: `node --test tests/katalog-deutsch.test.js` → FAIL.
- [ ] **Step 3:** `js/blaetter-katalog.js` um die 5 Lesestufen-Einträge ergänzen.
- [ ] **Step 4:** `index.html` anpassen: Fach-Filterleiste erweitern, Generator-Button einbinden, Lücken-Zähler bei Leseblättern durch Badge `📖 Leseblatt` ersetzen.
- [ ] **Step 5:** Test ausführen: `node --test tests/katalog-deutsch.test.js` → PASS.
- [ ] **Step 6:** Commit: `feat: integrate reading sheets and German filter in library`.

---

### Task 6: PWA Offline-Support, Gesamttests & Dokumentation

**Files:**
- Modify: `sw.js` (Cache-Bump auf `tabbi-offline-v16`, neue Assets eintragen)
- Modify: `README.md`, `hilfe.html`, `AGENTS.md`

**Interfaces:**
- Produces:
  - Vollständiger Offline-Cache für alle neuen Dateien (`js/tabbi-lesekorpus.js`, `blaetter/012_leseblatt_silben_und_woerter.html`).
  - Dokumentierte Bedienung des Leseblatts und Lese-Karten-Modus in `hilfe.html` und `README.md`.

- [ ] **Step 1:** `sw.js`: `CACHE_NAME` auf `tabbi-offline-v16` setzen und neue Dateien in `CORE_ASSETS` eintragen.
- [ ] **Step 2:** `hilfe.html` erweitern: Neuer FAQ-Abschnitt *„Wie funktioniert das Lesetraining?“* mit Tastatursteuerung und Stufenerklärung.
- [ ] **Step 3:** `README.md` und `AGENTS.md` aktualisieren: Aufgabentyp 5 (Deutsch / Lesen) beschreiben.
- [ ] **Step 4:** Gesamttestlauf: `node --test tests/*.test.js` ausführen (alle Tests inklusive `tests/kein-kindername.test.js` müssen grün sein).
- [ ] **Step 5:** Commit: `docs: update help, readme and bump pwa cache to v16`.
