# TABBI – Leseblätter & Lese-Karten (Deutsch Klasse 1) – Design Spec

Stand: 2026-10-27 · Status: Zur Freigabe · Ansatz C (Hessen-Stufen + separater Generator)

---

## 1. Warum & Kontext

TABBI ist bisher für das Fach Mathematik der 1. Klasse optimiert (12 Module, Rechnen, Zahlenzerlegung, Mengen). 
Für den Deutsch-Anfangsunterricht benötigt das Kind (unterstützt von einer Teilhabeassistenz, Lehrkraft oder Eltern) gezielte Übung beim **Zusammenlauten von Silben** (z. B. *Ma, Mo, Sa, Se, el, al, Lo, Lu*) und dem **Erlesen erster einfacher Wörter** (z. B. *Mama, Limo, Lela, Mimi, Salomo*).

Das Lesen findet laut in Begleitung einer Bezugsperson statt. Es ist **keine automatische Korrektur oder Bewertung** erforderlich. Im Vordergrund steht die motorische Entlastung, reizarme Darstellung und maximale Flexibilität für den Schulalltag.

---

## 2. Ziele, Nicht-Ziele & Anti-Ziele

### Ziele
1. **Feste hessische Lesestufen (Katalog):** Sofort einsatzbereite Leseblätter entlang des typischen Fibel-Verlaufs an hessischen Grundschulen (Klasse 1, Stufen 1–5).
2. **Separater, schlanker Leseblatt-Generator:** Lehrkraft/Eltern können die bekannten Buchstaben individuell anhaken und die Schwierigkeit (1: Nur Silben, 2: 2-silbige Wörter, 3: Längere 3-silbige Wörter) einstellen – komplett getrennt vom Mathe-Generator.
3. **Zwei Darstellungsmodi:**
   - **Kompaktes A4-Druckblatt:** Mit 25 mm Heftrand, Schulheft-Layout, Silbentabelle und Wortlisten zum analogen Üben/Abhaken im Schnellhefter.
   - **Digitaler Lese-Karten-Modus (Vollbild):** Riesige Einzeldarstellung von Silben/Wörtern in der Fibel-Schrift `'Andika'` (4–6rem) mit großen `◀ Zurück`- und `Weiter ▶`-Tasten.
4. **Nahtlose Integration:** Neues Fach „📖 Deutsch (Lesen)“ in der Bibliothek, Offline-Verfügbarkeit in der PWA.

### Nicht-Ziele
- Automatische Spracherkennung (Voice-Recognition) oder Vorlesefunktion (TTS) – das Lesen übt das Kind aktiv mit der Begleitperson.
- Ganze Sätze oder Fließtexte in Stufe 1–3 (bleibt auf Silben und Wörter fokussiert, um die riesige Schriftgröße auf Tablets nicht zu brechen).
- Schreibübungen mit Tastatur (dieses Modul fokussiert das **Lesen**, Schreibübungen mit Buchstabentastatur folgen als separates Modul).
- Belohnungsanimationen, Timer oder Richtig/Falsch-Wertung.

### Anti-Ziele
- Keine Vermischung mit dem 1.200-Zeilen-Mathe-Code in `011_click_und_mix.html`.
- Keine Verletzung der Eisernen Grundregel: Keine Hilfen, die das Lesen vorwegnehmen.
- Überfrachtete Benutzeroberfläche: Keine bunten Bildchen oder Maskottchen auf der Lese-Fläche (gemäß Designsystem „Heft & Füller“).

---

## 3. Didaktischer Aufbau: Lesestufen (Lehrplan Hessen Klasse 1)

Wörter und Silben werden streng aus dem jeweils freigeschalteten Buchstabenpool generiert:

* **Stufe 1 (Erste Lautbegegnung):**
  * *Vokale:* A, E, I, O, U
  * *Konsonanten:* M, L, S
  * *Silben:* Ma, Me, Mi, Mo, Mu, La, Le, Li, Lo, Lu, Sa, Se, Si, So, Su, am, em, im, om, um, al, el, il, ol, ul, as, es, is, os, us
  * *Wörter:* Mama, Mimi, Lama, Limo, Lela, Mimi, Salomo, Oma, Omi, Esel, Melone, Salsa
* **Stufe 2 (Erweiterter Konsonantenkreis):**
  * *Neu hinzu:* R, N, T
  * *Silben:* Ra, Re, Ri, Ro, Ru, Na, Ne, Ni, No, Nu, Ta, Te, Ti, To, Tu (sowie umgekehrte Formen)
  * *Wörter:* Name, Nase, Tanne, Rabe, Tor, Tomate, Salat, Nest, Rast, Rente, Riese
* **Stufe 3 (Plosive & Weichlaute):**
  * *Neu hinzu:* D, B, P, W
  * *Wörter:* Dose, Dame, Blume, Baum, Wal, Wind, Pinsel, Post, Butter, Brot
* **Stufe 4 (Reibelaute & Zischlaute):**
  * *Neu hinzu:* F, K, G, Z
  * *Wörter:* Fisch, Frosch, Kiste, Katze, Gans, Garten, Zaun, Zelt
* **Stufe 5 (Zwielaute & Lautverbindungen):**
  * *Neu hinzu:* EI, AU, EU, CH, SCH, ST, SP
  * *Wörter:* Eimer, Auto, Eule, Buch, Milch, Schule, Stein, Stern

---

## 4. Technische Spezifikation & UI-Design

### 4.1 Modul-Dateien
- **`blaetter/012_leseblatt_silben_und_woerter.html`**: Das zentrale Leseblatt-Modul. Unterstützt Stufen-Aufrufe (`?stufe=1`) und eigene Buchstaben-Kombinationen (`?buchstaben=A,E,I,O,U,M,L,S&grad=2`). Enthält auch das Generator-Overlay für Lehrkräfte.
- **`js/tabbi-lesekorpus.js`**: Reines UMD-Datenmodul mit:
  - Fibel-Wortlisten je Stufe, direkt vorsilbiert als Array: z. B. `['To', 'ma', 'te']`, `['Ma', 'ma']`.
  - Silben-Generator (Kombination Konsonant+Vokal und Vokal+Konsonant aus aktiven Buchstaben).
  - Wort-Filter: Wählt Wörter aus dem Korpus, die *nur* die freigegebenen Buchstaben enthalten.
- **Erweiterung `index.html`**:
  - Neuer Bereich bzw. Filter „📖 Deutsch (Lesen)“ im Header/Filter.
  - Zeigt die 5 Katalog-Leseblätter (Stufe 1–5) sowie den Button *„⚙️ Eigenes Leseblatt erstellen“*.
  - Status-Kennzeichnung: Zeigt `📖 Leseblatt` (kein unpassendes `0/0 gelöst`).
- **Erweiterung `css/tabbi.css`**:
  - Styles für `.silben-tabelle`, `.lese-woerter-liste` im Schulheft-Stil.
  - Vollbild `.lese-karten-view` mit 4–6rem Schriftgröße, großen Touch-Zielen (mind. 56px).
  - Drucklayout mit 25 mm Rand links (`@media print`).

### 4.2 Die zwei Modi im Detail

#### Modus 1: Druck- & Übersichtsansicht (Heft & Füller)
- Reines Rechenheft-/Linienblatt ohne Ablenkung.
- Kopfzeile: `Name: ________`, `Titel: Leseblatt – Stufe X`, `Datum: TT.MM.JJJJ`.
- Oben rechts zwei klare Aktionsknöpfe: `🖨️ PDF / Drucken` und `🔍 Lese-Karten starten`.
- Inhalt: 
  - Oben: 3–4 Zeilen Silben in übersichtlicher Tabelle (z. B. 4×4 oder 5×4 Raster).
  - Unten: 8–12 Wörter mit großzügigem Zeilenabstand für den Lesefinger.
- Druck: Kompakt auf 1 DIN-A4-Seite, 25 mm Heftrand links.

#### Modus 2: Digitaler Lese-Karten-Modus (Vollbild)
- Ablenkungsfreies Vollbild auf dem Tablet.
- In der Mitte: **Eine einzige Silbe oder ein Wort**, riesig zentriert in `'Andika'`.
- Optionale Silbenfärbung: Erste Silbe blau (`#2563eb`), zweite Silbe rot (`#dc2626`) nach Silbenfibel-Standard.
- Unten: Große Navigationsleiste:
  - `◀ Zurück`
  - `Übersicht`
  - `Weiter ▶`
- Auf der letzten Karte: Button `Fertig gelesen 👍` (bringt das Kind zurück zur Übersicht oder Bibliothek).

### 4.3 Separates Generator-Overlay (Lehrkraft / Eltern)
Direkt aufrufbar über den Button *„⚙️ Neues Leseblatt erstellen“*:
1. **Buchstaben-Auswahl:** Schnellauswahl per Klick auf „Stufe 1, 2, 3, 4, 5“ ODER Klick auf einzelne Buchstaben-Kacheln (A–Z).
2. **Schwierigkeitsgrad:**
   - *Grad 1:* Nur Silben (16 Silben).
   - *Grad 2:* Silben + 2-silbige Wörter.
   - *Grad 3:* Silben + 2- und 3-silbige Wörter (inkl. Konsonantenhäufung).
3. **Silben-Färbung:** Schalter *„Silben zweifarbig (blau/rot)“* (Standard: Aus / einfarbig schwarz gemäß Eiserner Grundregel).
4. **Erstellen:** Öffnet sofort das passende Leseblatt.

---

## 5. Einhaltung der System-Regeln & Eiserne Grundregel

- **Keine kognitive Hilfe:** Keine Sprachausgabe, kein Timer, keine automatische Bewertung.
- **Kind-Zone bleibt neutral:** Kein Bewertungs-Grün/Rot, keine Emojis/Sticker auf der Lesefläche.
- **Lifecycle:** Leseblätter sind zustandslos und beliebig oft wiederholbar (fließen nicht in Fehler-Auswertung ein).
- **PWA & Offline:** Service Worker Cache wird auf `tabbi-offline-v16` aktualisiert, `tabbi-lesekorpus.js` und `012_leseblatt_silben_und_woerter.html` kommen in `CORE_ASSETS`.
