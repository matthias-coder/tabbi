# Druck, schwebende Eingabe, Erstellung, Abschließen & Auswertung – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kompakter Druck mit Heftrand, schwebender Ziffernblock am Desktop, Erstellung über 5 Übergruppen, endgültiges Abschließen mit Historie und Lehrkraft-Auswertung, Kindername entfernt.

**Architecture:** Bestehende Vanilla-Struktur bleibt (`js/tabbi-core.js` als IIFE, Blätter in `blaetter/`). Neue, rein logische Teile kommen in drei kleine UMD-Module (`js/tabbi-gruppen.js`, `js/tabbi-historie.js`, `js/tabbi-auswertung.js`), die im Browser `window.Tabbi*` setzen und in Node per `require` testbar sind. DOM-Verdrahtung bleibt in Core/Seiten und wird im Browser verifiziert.

**Tech Stack:** HTML5, CSS3, Vanilla JS (kein Build), `localStorage`; Tests mit `node --test` (Node ≥ 24, keine Abhängigkeiten); Browser-Checks über lokalen Server `python -m http.server 8770` (Konfig `.claude/launch.json`, Name `tabbi`).

**Spec:** `docs/superpowers/specs/2026-10-25-druck-eingabe-erstellung-auswertung-design.md`

## Global Constraints

- Eiserne Grundregel (`AGENTS.md` §1): Keine Ansicht ohne Lehrkraft-Sperre zeigt Richtig/Falsch, Zähler, Lösungen oder Korrektur – auch nicht in der Druckvorschau.
- Lösungen werden **nie** als Attribut/Text ins Blatt-DOM der Kind-Ansicht geschrieben; nur im Datensatz (`localStorage`).
- Keine `<input>`-Felder; keine `window.confirm()`; Zwei-Tipp-Bestätigung für Fertig.
- Farben: Kind-Eingabe `#0000CD` bold, aktive Lücke `#fffacd`, Plättchen blau `#2563eb` / rot `#dc2626`.
- Ziffernblock zeigt immer den vollen Zahlenraum (0–10 bzw. 0–20) + ⌫; Tablet: Tasten ≥ 56 px, `env(safe-area-inset-bottom)`.
- Lehrkraft-Zugang ausschließlich über `TabbiLehrerGate` (3 Sek. halten + Einmaleins, Freigabe 10 Min.).
- Der Vorname des Kindes erscheint in keiner Datei und keiner Commit-Message (Prüfung per Hash, Task 1).
- Jeder Task, der Assets ändert/hinzufügt: `sw.js` `CACHE_NAME` hochzählen und neue Dateien in `CORE_ASSETS` eintragen.
- Commit-Messages englisch, enden mit `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Neue Module nutzen dieses Muster (einmal hier festgelegt, überall gleich):
  ```js
  (function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.TabbiXyz = factory();
  })(typeof self !== 'undefined' ? self : this, function () { 'use strict'; /* … */ return { /* API */ }; });
  ```

## Review Focus

1. **Zurück-Taste / alte URL nach dem Abschließen:** Öffnet jemand das Blatt erneut über Verlauf oder Lesezeichen, darf es weder die alten Eingaben bearbeitbar zeigen noch den Historien-Eintrag verändern → Test in Task 8.
2. **Auswertungs-URL ohne gültige Freigabe** (Reload nach > 10 Min., Lesezeichen, Kind tippt Link an): zeigt nur die gesperrte Kind-Ansicht ohne Markierungen → Test in Task 10.
3. **`localStorage` voll oder gesperrt** (privater Modus) beim Abschließen: Blatt bleibt offen und unverändert, neutraler Hinweis, keine halben Einträge → Tests in Task 6 und Task 8.
4. **Alte Daten ohne Lösungen / Lücken ohne bekannte Regel:** Auswertung zeigt „nicht ausgewertet“ bzw. „keine Lösungen hinterlegt“, nie einen Absturz oder ein falsches „falsch“ → Test in Task 7.
5. **Breiter Touch-Bildschirm** (Tablet quer ≥ 1024 px, Touch-Laptop): behält die volle Leiste; schwebende Leiste deckt nie die letzte Aufgabe ab → Check in Task 3.

---

### Task 1: Kindername entfernen + Testgerüst

**Files:**
- Create: `tests/kein-kindername.test.js`
- Modify: `hilfe.html`, `AGENTS.md`, `README.md`, `manifest.json`, `index.html`, `blaetter/001…011*.html` (alle Treffer; Druckköpfe in 001–010 z. B. `001:49–53`, Builder `011:787–791`)

**Interfaces:**
- Produces: Druckkopf-Markup in allen Blättern einheitlich `<span class="druck-name">Name: ________</span>` (Task 2 ersetzt den Inhalt optional per JS).

- [ ] **Step 1: Failing test** `tests/kein-kindername.test.js` – läuft rekursiv über `*.html, *.js, *.css, *.md, *.json` (ohne `.git`, `.superpowers`, `node_modules`, `gitignore/`), zerlegt Text in Wörter (`/[a-zäöüß]+/g` nach `toLowerCase()`), hasht jedes Wort mit SHA-256 und erwartet keinen Treffer auf `5f16795c54ab7de419edf8e9c6da6065f7dd448f122fcbc9815c67daa566ba8e`. Fehlermeldung nennt Datei + Zeile, **nicht** das Wort.
- [ ] **Step 2:** `node --test tests/` → FAIL (≈ 27 Treffer in 17 Dateien).
- [ ] **Step 3:** Alle Treffer ersetzen: Fließtext neutral („das Kind“, „ein Erstklässler“); Druckköpfe `Name: ________` mit Klasse `druck-name`; `manifest.json` neutral beschreiben.
- [ ] **Step 4:** `node --test tests/` → PASS.
- [ ] **Step 5:** Commit `chore: remove child's first name from public sources`.

### Task 2: Drucklayout „wie ein Schul-Arbeitsblatt“

**Files:**
- Modify: `css/tabbi.css:3075–3552` (Block „11. Druck- & PDF-Workflow“ komplett ersetzen), `js/tabbi-core.js` (`setzeHeutigesDruckDatum` ~1045 um Namen ergänzen), alle Blätter mit `.druck-kopf`, `blaetter/011_click_und_mix.html` (`.druck-seite-kopf` 787–791), `index.html` (Lehrkraft-Feld „Name für den Druck“)

**Interfaces:**
- Produces: `localStorage['tabbi_druckname']` (String, optional). `TabbiLehrerGate` bleibt unverändert.
- Produces: CSS-Klassen `.druck-aufgabe-nr` (nummerierter Kreis) und `.druck-aufgabe-titel` – Task 10 nutzt das Drucklayout mit.

- [ ] **Step 1:** Kopf vereinheitlichen: `.druck-kopf` / `.druck-seite-kopf` = Name links, Titel fett mittig, `Datum:` rechts, darunter 1 px Linie. `setzeHeutigesDruckDatum` setzt zusätzlich `.druck-name` auf `Name: <tabbi_druckname>`, wenn vorhanden (try/catch).
- [ ] **Step 2:** In `index.html` hinter der Sperre (`TabbiLehrerGate.mitFreigabe`) einen Knopf „Name für den Druck“. Er öffnet ein Overlay mit Anzeige-`div` und Buchstaben-Kacheln A–Z, Ä, Ö, Ü, Leertaste, ⌫ (kein `<input>`, kein `prompt`), „Speichern“ schreibt `tabbi_druckname`, „Entfernen“ löscht den Schlüssel.
- [ ] **Step 3:** Neuer Print-Block: `@page { size: A4 portrait; margin: 10mm 10mm 10mm 25mm; }`; alle Hintergründe/Schatten/Radien/Karo aus; Linien 0,5–1 px `#222`; Aufgabenblöcke `break-inside: avoid`, Bausteine `display:inline-flex; flex-wrap` dicht; Richtwerte Zahlenhaus-Zelle ~6 mm, Plättchen ~4,5 mm; Blöcke nummeriert über CSS-Counter (`.druck-aufgabe-nr`) mit vorhandener Blocküberschrift als Titel; `print-color-adjust: exact`; `.print-hide`, `#numpad`, Fokus-Gelb wie bisher neutralisiert. Hilfe-Seiten-Regeln (hilfe-*) übernehmen.
- [ ] **Step 4: Browser-Check (Druck-Emulation)** – Server `tabbi` starten, Blatt öffnen, in der Konsole:
  ```js
  for (const s of document.styleSheets) for (const r of s.cssRules)
    if (r instanceof CSSMediaRule && r.media.mediaText.includes('print')) r.media.appendMedium('screen');
  document.body.style.width = '661px'; // 210 − 25 − 10 mm
  ```
  Erwartet: Katalogblatt 001 und ein Builder-Blatt mit 12 Zahlenhäusern + Zahlenfreunden + 9 Rechenaufgaben haben `document.querySelector('main').scrollHeight <= 1047` (277 mm). Screenshot gegen Mockup Variante A prüfen. Zusätzlich echter Druckdialog „Als PDF speichern“: Heftrand links sichtbar, Blau/Rot farbig.
- [ ] **Step 5:** `sw.js` Cache-Version hoch; Commit `feat: compact worksheet print layout with binding margin`.

### Task 3: Schwebender Ziffernblock am Desktop

**Files:**
- Modify: `css/tabbi.css` (nach `#numpad` 1696–1762 und Buchstaben 2577 eine neue Media-Query ergänzen)

**Interfaces:**
- Consumes: DOM `nav#numpad > .numpad-inner > .numpad-reihe > button.numpad-taste` (unverändert, `rendereNumpadTasten` 1098 / `rendereBuchstabenTastatur` 1135).

- [ ] **Step 1:** `@media (min-width: 1024px) and (pointer: fine)`: `#numpad { left:50%; right:auto; transform:translateX(-50%); bottom:16px; width:max-content; max-width:calc(100vw - 32px); border-radius:14px; box-shadow:0 6px 20px rgba(15,23,42,.22); background:rgba(255,255,255,.96); }`, `.numpad-inner { max-width:none; }`, `.numpad-taste { flex:0 0 48px; min-height:48px; }`; Buchstaben-Tastatur: dieselbe Hülle, ABC-Reihenfolge bleibt aus `rendereBuchstabenTastatur`, drei Reihen. `body`/`main` bekommen `padding-bottom` = Leistenhöhe + 32 px.
- [ ] **Step 2: Browser-Check** bei Viewport 1280×800 (Maus): `getComputedStyle(numpad).left !== '0px'` und `numpad.getBoundingClientRect().width < 900`; bei 0–20 (`data-aktion="toggle-20"`) zwei Reihen, Leiste bleibt mittig. Letzte Aufgabe ganz nach unten scrollen: `letzteLuecke.getBoundingClientRect().bottom < numpad.getBoundingClientRect().top`.
- [ ] **Step 3: Check Review Focus 5** – `resize_window` 1180×820 mit `preset`/Touch-Emulation (mobile UA, `pointer: coarse`): Leiste volle Breite (`left === '0px'`); 768×1024: unverändert.
- [ ] **Step 4:** Commit `feat: floating numpad on desktop`.

### Task 4: Übergruppen (Daten + Bibliothek)

**Files:**
- Create: `js/tabbi-gruppen.js`, `tests/gruppen.test.js`
- Modify: `js/blaetter-katalog.js` (Feld `gruppe` je Eintrag), `index.html` (`rendereKatalog` 118–176 nach Gruppen gliedern; Skript einbinden), `blaetter/011_click_und_mix.html` (Skript einbinden), `sw.js`

**Interfaces:**
- Produces: `window.TabbiGruppen = { GRUPPEN, gruppeFuerTyp(typ) → gruppenId|null, typenDerGruppe(gruppenId) → string[], maxZahlFuerTyp(typ) → number }`
  - `GRUPPEN`: Array in fester Reihenfolge von `{ id, titel, icon, typen: string[] }` mit
    `mengen` „👀 Mengen erfassen & zählen“ `[punkte, finger, wuerfel_tuerme, aquarium, strichlisten, buendeln, seifenblasen]`,
    `zerlegen` „🏠 Zahlen zerlegen“ `[zahlenhaus, zahlenfreunde]`,
    `ordnen` „↔️ Zahlen ordnen & vergleichen“ `[nachbarn]`,
    `rechnen` „➕ Plus & Minus rechnen“ `[rechnen, zwerg_riese, zahlenmauern]`,
    `zehner` „🔟 Zehner & Einer“ `[]`.
  - `maxZahlFuerTyp`: `zahlenfreunde, finger, wuerfel_tuerme, aquarium, seifenblasen` → 10; `strichlisten, buendeln` → 8; `zahlenhaus, nachbarn, punkte, rechnen, zahlenmauern, zwerg_riese` → 20.

- [ ] **Step 1: Failing tests** `tests/gruppen.test.js`: jeder der 13 Typen liegt in genau einer Gruppe; `GRUPPEN.map(g=>g.id)` deep-equals `['mengen','zerlegen','ordnen','rechnen','zehner']`; `gruppeFuerTyp('buendeln') === 'mengen'`; `gruppeFuerTyp('xyz') === null`; `maxZahlFuerTyp('strichlisten') === 8`; jeder Katalog-Eintrag (per `vm` geladenes `blaetter-katalog.js`, `window`-Stub) hat ein `gruppe`-Feld aus den 5 IDs, Blatt 007 hat `zehner`.
- [ ] **Step 2:** `node --test tests/` → FAIL.
- [ ] **Step 3:** Modul implementieren; Katalog-Einträge um `gruppe` ergänzen (altes `aufgabentyp` darf bleiben, wird nicht mehr gelesen).
- [ ] **Step 4:** `node --test tests/` → PASS.
- [ ] **Step 5:** `index.html`: Katalog-Grid je Gruppe mit Zwischenüberschrift in `GRUPPEN`-Reihenfolge, leere Gruppen ausgelassen. Browser-Check: Überschriften erscheinen, Blatt 007 unter „Zehner & Einer“.
- [ ] **Step 6:** Commit `feat: five didactic task groups for catalog`.

### Task 5: Entschlackte Erstellung

**Files:**
- Modify: `blaetter/011_click_und_mix.html` (Konfigurator 49–165, Zustand 205–211, Listener 830–970, `generiereZufallsBlatt` 745–823), `css/tabbi.css` (`.mix-*`)

**Interfaces:**
- Consumes: `TabbiGruppen.GRUPPEN`, `typenDerGruppe`, `maxZahlFuerTyp`.
- Produces: unveränderter Aufruf `TabbiTestbibliothek.speichereNeuenTest({...})`, zusätzlich Feld `einstellungen: { typen, bereich, zahlen, anzahl, praefix }` (wird von Task 9 `?neuAus=` gelesen – daher dieselbe Struktur).

- [ ] **Step 1:** Ablauf: (1) Fach (bleibt), (2) Übergruppe – 5 große Kacheln aus `GRUPPEN`, Gruppen ohne Typen ausgeblendet, (3) Typ-Kacheln der Gruppe (Mehrfachwahl, Mini-Vorschau = vorhandenes Typ-Icon/Emoji in groß), (4) Zahlenraum `bis 5 | bis 10 | bis 20` (= `1-5`, `1-10`, `1-20`), (5) „Erstellen“. Voreinstellung: Gruppe `zerlegen`, Typ `zahlenhaus`, bis 10, Anzahl „Mittel“.
- [ ] **Step 2:** „Mehr Optionen“ (eingeklappt): Einzelzahlen (`baueEinzelzahlenChips`), Anzahl `Wenig | Mittel | Viel` → (`anzahlProSeite`, `seitenAnzahl`) = (2,1) / (4,1) / (4,2), Kennzeichnung (Präfix-Chips), Schalter „Typen aus mehreren Gruppen mischen“ (zeigt dann alle Typen gruppiert).
- [ ] **Step 3:** Liegt der Zahlenraum über `maxZahlFuerTyp(typ)`, zeigt die Typ-Kachel den Hinweis „Zahlen bis X“; Generierung nutzt wie bisher die Grenzen in `zieheAusZahlenPool`.
- [ ] **Step 4: Browser-Check:** Vom Öffnen bis zum gespeicherten Blatt mit Voreinstellungen ≤ 3 Tipps nach der Sperre; jeder der 13 Typen über seine Gruppe erreichbar; gespeicherter Eintrag hat `einstellungen` mit den gewählten Typen und dem Bereich.
- [ ] **Step 5:** Commit `feat: group-based worksheet builder`.

### Task 6: Historien-Speicher

**Files:**
- Create: `js/tabbi-historie.js`, `tests/historie.test.js`

**Interfaces:**
- Produces: `window.TabbiHistorie = { erzeuge(storage) → api }` mit `api`:
  - `holeAlle() → Eintrag[]` (neueste zuerst, `[]` bei Fehler/kaputtem JSON)
  - `hole(id) → Eintrag|null`
  - `fuegeHinzu(eintragOhneId) → { ok: true, eintrag } | { ok: false, fehler: 'speicher' }` – vergibt `id = 'h_<Date.now()>_<rnd4>'`, `abgeschlossenAm` ISO
  - **kein** Lösch-API.
  - Schlüssel `tabbi_historie_v1`. `Eintrag = { id, abgeschlossenAm, titel, fach, gruppen: string[], quelle: 'test'|'katalog', blattId, url, html: string|null, layout: object|null, eingaben: object, loesungen: object|null, einstellungen: object|null }`.
  - `storage` = Objekt mit `getItem/setItem` (im Browser `window.localStorage`; im Test ein Map-Stub).

- [ ] **Step 1: Failing tests:** `fuegeHinzu` dann `holeAlle()[0].titel` gleich; zwei Einträge → neuester zuerst; Stub mit werfendem `setItem` (QuotaExceededError) → `{ok:false, fehler:'speicher'}` **und** `holeAlle()` danach unverändert (Review Focus 3); `getItem` liefert `'kaputt'` → `holeAlle()` deep-equals `[]`; `Object.keys(api)` enthält kein `loesche*`.
- [ ] **Step 2:** FAIL. **Step 3:** implementieren. **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat: append-only history store`.

### Task 7: Lösungen & Auswertung (Logik)

**Files:**
- Create: `js/tabbi-auswertung.js`, `tests/auswertung.test.js`

**Interfaces:**
- Produces: `window.TabbiAuswertung = { ermittleLoesungen(rootEl, gruppeFuerTyp) → Loesungen, werteAus(loesungen, eingaben) → Ergebnis }`
  - `Loesungen = { luecken: { [dataId]: { soll: number|null, gruppe: string|null, regel?: 'summe', partner?: dataId, summe?: number } }, striche: { [dataId]: number }, verbindungen: { [zoId]: string /* "0:2,1:0" */ } }`
  - `Ergebnis = { gesamt, falsch, leer, nichtAusgewertet, proGruppe: { [gruppe]: { gesamt, falsch, leer } }, details: { [dataId]: 'richtig'|'falsch'|'leer'|'nicht-ausgewertet' }, soll: { [dataId]: string } }`
  - `eingaben` = Shape von `speichereStand` (core 2426): `{ luecken, kreise, striche, farben, verbindungen, markiert }`.
  - `ermittleLoesungen` liest nur die gerenderten Bausteine und ihre vorhandenen Daten-Attribute; es schreibt nichts ins DOM. In Node wird es mit einem Mini-DOM-Stub getestet (Objekte mit `querySelectorAll`/`getAttribute`), nicht mit jsdom.

Regeln je Typ (aus `rendereDeklarativeBausteine` core 631–861 und `erzeugeAufgabenBlock` 011:362–675):

| Typ | Lücken-IDs | Soll |
|---|---|---|
| zahlenhaus | `<p>_r<i>_l/_r` | `data-dach` − Vorgabe der Zeile aus `data-etagen` |
| zahlenfreunde | `<p>_r<i>_l/_r` | eine Seite vorgegeben → Differenz; beide leer vorgegeben → `regel:'summe'` (l+r = dach); Kreise nicht ausgewertet |
| finger, wuerfel_tuerme | `<p>_<i>` | Wert aus `data-werte` (L/R-Präfix abschneiden) |
| punkte ≤ 10 | `<p>_<i>` | Anzahl Punkte aus `data-werte` |
| punkte > 10 | `_ze_i_z`, `_ze_i_e`, `_zegl_i_l1/l2` | Z = 1, E = n − 10, Gleichung `10 + E = n` |
| aquarium | `<p>_aq_i_l` | Anzahl `.zaehl-item` im Becken; `markiert` nicht ausgewertet |
| strichlisten | `<p>_sl_z_<t>` + `striche[data-id]` | Anzahl Tiere `t` (Lücke und Strichzahl) |
| buendeln | – | nicht ausgewertet |
| seifenblasen | `verbindungen[zoId]` | Paarung links↔rechts mit gleichem Zahlwert |
| nachbarn | `<p>_<i>_v/_n` | z − 1 / z + 1 |
| rechnen, zwerg_riese | `…_l1` | Ergebnis aus den gedruckten Operanden der `erstelleGleichungHTML`-Struktur |
| zahlenmauern | `<p>_r<row>_s<stone>` | aus `data-steine` (Nachbarsumme) |
| unbekannt / statisch ohne Daten | – | `soll:null` → `nicht-ausgewertet` |

- [ ] **Step 1: Failing tests** `werteAus`: Haus dach 5, Vorgabe 2, Eingabe „3“ → `richtig`; „4“ → `falsch`, `soll['…']==='3'`; leer → `leer` und zählt nicht in `falsch`; `regel:'summe'` dach 10 mit 6/4 → beide `richtig`, 6/5 → beide `falsch`; `soll:null` → `nicht-ausgewertet`, nicht in `gesamt`; `loesungen === null` → `{ gesamt:0, … }` ohne Exception (Review Focus 4); `proGruppe.zerlegen.falsch` zählt korrekt.
- [ ] **Step 2: Failing tests** `ermittleLoesungen` mit DOM-Stub für zahlenhaus, nachbarn, zahlenmauern, strichlisten, seifenblasen (je ein Fall, IDs wie in der Tabelle).
- [ ] **Step 3:** FAIL. **Step 4:** implementieren (eine Funktion je Typ, Dispatcher über Baustein-Klasse/`data-baustein`). **Step 5:** PASS.
- [ ] **Step 6: Browser-Check:** Builder-Blatt mit allen 13 Typen erzeugen, in der Konsole `TabbiAuswertung.ermittleLoesungen(document.querySelector('main'), TabbiGruppen.gruppeFuerTyp)` – jede `.luecke` hat einen Eintrag; Stichprobe je Typ von Hand nachrechnen. `document.querySelectorAll('[data-soll],[data-loesung]').length === 0`.
- [ ] **Step 7:** Commit `feat: solution derivation and evaluation logic`.

### Task 8: Abschließen sperrt endgültig und legt Historie an

**Files:**
- Modify: `js/tabbi-core.js` – `baueFertigstellenBereich` 1492, `aktualisiereFertigstellenButton` 1538, Fertig-Handler 2035–2056, Reset-Logik ~1624, `speichereStand` 2426, `ladeStand` 2516, `TabbiTestbibliothek` 2759 (`entferneTest(id)` intern, kein UI-Löschen für Historie), Init ~917 und `DOMContentLoaded` 3250; Skripte in allen Blättern einbinden; `sw.js`

**Interfaces:**
- Consumes: `TabbiHistorie.erzeuge(localStorage)`, `TabbiAuswertung.ermittleLoesungen`, `TabbiGruppen.gruppeFuerTyp`.
- Produces: `TabbiBlatt#schliesseAb() → { ok: boolean }`; URL-Parameter `?historie=<id>` öffnet die gesperrte Ansicht; `TabbiBlatt#istGesperrt` (boolean).

- [ ] **Step 1:** Fertig-Handler `ok` ruft `schliesseAb()`: baut Eintrag (`quelle:'test'` mit `html` aus Testbibliothek-Eintrag und `einstellungen` aus demselben Testbibliothek-Eintrag (Task 5); `quelle:'katalog'` mit `blattId`, `url` und `layout` aus `<key>__layout` oder `null`), `eingaben` = aktueller Stand, `loesungen` = `ermittleLoesungen(...)`, `gruppen` = Gruppen der vorkommenden Typen. Bei `ok:true`: Test aus Testbibliothek entfernen bzw. Katalog-Schlüssel `<key>`, `<key>__layout` leeren; dann zur Bibliothek. Bei `ok:false`: nichts löschen, Hinweis „Speichern nicht möglich – bitte Lehrkraft holen“ im Fertig-Bereich, Blatt bleibt bearbeitbar.
- [ ] **Step 2:** Altes rücksetzbares `abgeschlossen`-Flag entfernen (Reset ~1624, `speichereStand`/`ladeStand`); vorhandene alte Flags beim Laden ignorieren.
- [ ] **Step 3:** Gesperrter Modus bei `?historie=<id>`: Eintrag laden; `html` bzw. `layout` statt Neugenerierung einsetzen (vorhandene Lade-Pfade von 011 `testId` und `ladeGespeicherteWuerfelAufgaben` 2382 wiederverwenden), `eingaben` anwenden, dann `istGesperrt = true`: kein Numpad, keine Klick-Handler für Lücken/Kreise/Striche/Farben/Verbindungen, kein Speichern, Fertig/Leeren/Löschen/Click-&-Mix-Leiste/Würfeln ausgeblendet; Banner „Abgeschlossen am <TT.MM.JJJJ>“. Unbekannte ID → Hinweis „Blatt nicht gefunden“ + Link zur Bibliothek.
- [ ] **Step 4: Browser-Check:** Katalogblatt 001 teilweise ausfüllen, Fertig → ✔. Erwartet: `TabbiHistorie.erzeuge(localStorage).holeAlle()[0].quelle === 'katalog'`, `localStorage` hat keinen `tabbi_daten_001…`-Schlüssel mehr; 001 erneut öffnen → leer, neues Layout. Builder-Test abschließen → verschwindet aus „Erstellt“.
- [ ] **Step 5: Check Review Focus 1:** Nach dem Abschließen Browser-Zurück auf die alte Blatt-URL → leeres frisches Blatt (Katalog) bzw. „Blatt nicht gefunden“ (Test-URL); Historien-Eintrag unverändert (`JSON.stringify` vorher/nachher gleich). `?historie=<id>` öffnen, eine Lücke antippen und Taste drücken → keine Änderung, kein neuer `localStorage`-Schlüssel.
- [ ] **Step 6: Check Review Focus 3:** In der Konsole `Storage.prototype.setItem = () => { throw new DOMException('x','QuotaExceededError'); }`, dann Fertig → ✔: Hinweis erscheint, Blatt bearbeitbar, Historie unverändert.
- [ ] **Step 7:** Commit `feat: final completion locks sheet into history`.

### Task 9: Bibliothek „📁 Abgeschlossen“ + „Nochmal neu“

**Files:**
- Modify: `index.html` (`rendereTestbibliothek` 173–300 und neuer Abschnitt), `css/tabbi.css` (Kacheln), `blaetter/011_click_und_mix.html` (Erzeugen aus `einstellungen`)

**Interfaces:**
- Consumes: `TabbiHistorie.holeAlle()`, URL `?historie=<id>` aus Task 8.
- Produces: URL `blaetter/011_click_und_mix.html?neuAus=<historieId>` erzeugt ein neues Blatt mit denselben `einstellungen` und legt es in der Testbibliothek ab; Katalog-Einträge verlinken für „Nochmal neu“ einfach auf ihre `url`.

- [ ] **Step 1:** Abschnitt „📁 Abgeschlossen“ unter den bestehenden Bereichen: Kachel mit Icon, Titel, „Abgeschlossen am …“, Knöpfe „Ansehen“ (`?historie=`), „Nochmal neu“, Lehrkraft-Knopf „🔒 Auswertung (3 Sek. halten)“ (Ziel kommt in Task 10). Keine Zähler, kein Farbcode, kein Löschen-Knopf. Status-Filter um „Abgeschlossen“ ergänzen.
- [ ] **Step 2:** `?neuAus=` in 011 implementieren (ohne Lehrkraft-Sperre, da kein Erstellen neuer Inhalte – nur Wiederholung).
- [ ] **Step 3: Browser-Check:** Nach Task-8-Abschluss erscheint die Kachel; „Ansehen“ zeigt gesperrtes Blatt; „Nochmal neu“ erzeugt neuen Eintrag in „Erstellt“ mit gleichen Typen/Bereich, Historien-Eintrag bleibt; DOM der Kachel enthält keine Ziffern außer dem Datum.
- [ ] **Step 4:** Commit `feat: completed sheets section with repeat`.

### Task 10: Auswertungsansicht hinter der Sperre

**Files:**
- Modify: `js/tabbi-core.js` (Auswertungs-Overlay im gesperrten Modus), `css/tabbi.css` (Bildschirm + Druck), `index.html` (Lehrkraft-Knopf aus Task 9 verdrahten)

**Interfaces:**
- Consumes: `TabbiAuswertung.werteAus(eintrag.loesungen, eintrag.eingaben)`, `TabbiLehrerGate.bindeDreiSekundenButton`, `istFreigeschaltet()`, `sperreLehrerbereich()`.
- Produces: URL `?historie=<id>&auswertung=1`; CSS-Klassen `.ausw-falsch` (roter Rahmen `#dc2626`), `.ausw-leer` (grau gestrichelt), `.ausw-soll` (kleine rote Ziffer neben der Lücke), `#ausw-kopf`.

- [ ] **Step 1:** Lehrkraft-Knopf in der Historien-Kachel: `bindeDreiSekundenButton(btn, () => location.href = '…?historie=<id>&auswertung=1')`.
- [ ] **Step 2:** Im gesperrten Modus nur wenn `auswertung=1` **und** `TabbiLehrerGate.istFreigeschaltet()`: `werteAus` anwenden, Klassen + `.ausw-soll`-Spans erzeugen, `#ausw-kopf` „x von y falsch · z nicht bearbeitet“ + Aufteilung `proGruppe` mit `TabbiGruppen`-Titeln; bei `loesungen === null` „Für dieses Blatt sind keine Lösungen hinterlegt“. Knöpfe „🖨️ Mit Korrektur drucken“ (`window.print()`) und „Schließen“ (`sperreLehrerbereich()` + zurück zur Bibliothek). Alle 30 s `istFreigeschaltet()` prüfen; abgelaufen → `location.replace('?historie=<id>')`.
- [ ] **Step 3:** Druck-CSS: `.ausw-*` und `#ausw-kopf` werden mitgedruckt (rot via `print-color-adjust`), Rest wie Task 2.
- [ ] **Step 4: Check Review Focus 2:** `sessionStorage.removeItem('tabbi_lehrer_freigabe_ts')`, dann `?historie=<id>&auswertung=1` laden → `document.querySelectorAll('.ausw-falsch,.ausw-soll,#ausw-kopf').length === 0`. Ebenso normale Ansicht `?historie=<id>` bei **aktiver** Freigabe → 0 Treffer.
- [ ] **Step 5: Browser-Check:** Blatt mit absichtlich 2 Fehlern und 1 leerer Lücke abschließen, Auswertung öffnen → Kopf „2 von N falsch · 1 nicht bearbeitet“, rote Markierung an genau 2 Lücken mit Soll daneben; Druck-Emulation (Task 2, Step 4) zeigt Markierungen.
- [ ] **Step 6:** Commit `feat: teacher-only evaluation view with correction print`.

### Task 11: Statische Katalog-Lücken, Hilfe, Doku, Abschluss

**Files:**
- Modify: `js/tabbi-auswertung.js` + `tests/auswertung.test.js` (statische Lücken), `hilfe.html`, `README.md`, `AGENTS.md`, `sw.js`

- [ ] **Step 1:** Für die handgeschriebenen `.luecke` in `blaetter/003, 004, 007, 008, 009` prüfen, ob die Lösung aus gedruckten Zahlen im selben Baustein ableitbar ist; wenn ja, Regel in `ermittleLoesungen` (über Baustein-Struktur, nicht per Blatt-ID) mit je einem Test; wenn nein, bleibt `soll:null` und es wird in `README.md` unter „Auswertung – Grenzen“ aufgelistet.
- [ ] **Step 2:** `hilfe.html`: Abschnitte für Fertig/Abschließen, Abgeschlossen-Bereich, Auswertung (Lehrkraft), neue Erstellung, Druck. `AGENTS.md`: §4 Ordnerstruktur um die drei Module und `tabbi_historie_v1`/`tabbi_druckname` ergänzen, Fertig-Verhalten beschreiben. `README.md` analog.
- [ ] **Step 3:** `sw.js`: `CACHE_NAME` hoch, `js/tabbi-gruppen.js`, `js/tabbi-historie.js`, `js/tabbi-auswertung.js` in `CORE_ASSETS`.
- [ ] **Step 4:** `node --test tests/` → alle PASS; Browser-Rundgang: Blatt erstellen → ausfüllen → Fertig → Abgeschlossen → Auswertung → Mit Korrektur drucken; Offline-Reload (Service Worker) lädt alle neuen Module.
- [ ] **Step 5:** Commit `docs: help and project docs for completion and evaluation`.
