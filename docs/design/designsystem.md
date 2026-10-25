# TABBI Designsystem „Heft & Füller“

Version 1.0 · 2026-10-25 · gilt für alle Seiten (`index.html`, `hilfe.html`, `blaetter/*.html`)

Dieses Dokument ist die verbindliche Gestaltungsgrundlage. Es ergänzt `AGENTS.md`
(Eiserne Grundregel, Bedienhilfen, Druck) und widerspricht ihr nirgends – bei Konflikt gilt
`AGENTS.md`. Die Tokens sind als CSS-Variablen im `:root` von `css/tabbi.css` hinterlegt,
eine Live-Ansicht liefert [`styleguide.html`](styleguide.html). Hintergrund und Befunde:
[`design-critique-2026-10-25.md`](design-critique-2026-10-25.md).

---

## 1. Leitidee

TABBI sieht aus wie **ein Schulheft, in das jemand mit Füller schreibt** – und alles, was nicht
Heft ist, tritt zurück. Daraus folgen vier Prinzipien:

1. **Zwei Zonen, zwei Sprachen.**
   - *Kind-Zone* = Blattfläche + Ziffernblock/Buchstaben-Tastatur. Papier, Tinte, Karo. Reizarm.
   - *Erwachsenen-Zone* = Kopfzeile, Werkzeuge, Bibliothek, Erstellung, Hilfe, Dialoge.
     Ruhiges Grau mit einem Akzent.
2. **Farbe ist Bedeutung, nicht Dekoration.** Jede Farbe hat genau eine Aufgabe (§ 3).
   **Blau gehört dem Kind** – die UI benutzt kein Blau.
3. **Kein Signal, das wie Bewertung aussieht.** Auf der Kind-Zone gibt es kein Grün, kein Rot
   (außer roten Plättchen), keine Belohnungs-Animation, keinen Zustand, der mit Richtigkeit
   korreliert. Das ist die Eiserne Grundregel, übersetzt in Gestaltung.
4. **Gleiche Dinge sehen gleich aus und sitzen am gleichen Ort.** Gleiche Tastengröße, gleiche
   Positionen, gleiche Knopf-Typen für gleiche Aufgaben – Muskelgedächtnis ist motorische Hilfe.

**Kein Dark Mode.** TABBI ist bewusst Papier. Ein dunkles Heft gibt es auch nicht.

---

## 2. Zonen im Überblick

| | Kind-Zone | Erwachsenen-Zone |
|---|---|---|
| Wo | Blattfläche, Ziffernblock, Buchstaben-Tastatur | Kopfzeile, Werkzeug-Menü, Bibliothek, Hilfe, Dialoge, Erstellung |
| Hintergrund | Rechenheft-Karo `--paper` + `--paper-karo` | `--ui-surface`; Bibliothek ruhiger Hintergrund (Karo oder stark abgetöntes Motiv) |
| Farben | nur Tinte (§ 3.1) + Fokus-Gelb | UI-Neutral + Akzent Petrol, Lehrkraft-Violett, Gefahr-Rot |
| Typo | Ziffern groß, Eingaben fett | Fließtext regular, Überschriften fett |
| Deko | keine (keine Sticker, Maskottchen, Emoji-Deko) | Maskottchen erlaubt, sparsam (Logo, Leer-Zustände, Hilfe) |
| Bewegung | nur blinkender Cursor | kurze Übergänge (≤ 200 ms) |
| Icons | Inhalts-Emoji (Tiere, Obst) als Aufgabenmaterial | monochrome UI-Icons |

---

## 3. Farbe

Alle Werte als Token in `css/tabbi.css`. **Rohe Hex-Werte in neuem Code sind nicht erlaubt.**

### 3.1 Tinte & Papier (Kind-Zone) – reserviert

| Token | Wert | Bedeutung | Darf nicht für |
|---|---|---|---|
| `--ink-print` | `#222222` | Vorgedruckte Vorgaben, Aufgabentext | – |
| `--ink-fueller` | `#0000CD` | **Ausschließlich Kind-Eingaben** (fett) | UI, Links, Rahmen, Icons |
| `--ink-plaettchen-blau` | `#2563eb` | Plättchen Zustand 1 | UI-Knöpfe |
| `--ink-plaettchen-rot` | `#dc2626` | Plättchen Zustand 2 | UI außer Zwei-Tipp-Warnung |
| `--ink-line` | `#1e293b` | Zellrahmen, Dach, Zahlenmauer | – |
| `--paper` | `#fdfdf9` | Blattfläche | – |
| `--paper-karo` | `#dce6f2` | Karo-Linien (bewusst kontrastarm, 1.24 : 1) | Text |
| `--paper-heftrand` | `rgba(248,113,113,.35)` | Roter Heftrand (Hilfe, Druck) | – |
| `--focus-bg` | `#fffacd` | **Nur** aktive Lücke / aktives Element | Hinweise, Banner, „Fertig“ |
| `--focus-ring` | `#b45309` | Rahmen der aktiven Lücke (4.74 : 1 auf Gelb) | – |

Die Anmal-/Bündel-Palette (Abschnitt „Farb-Palette für Gleiche Mengen“ in `tabbi.css`) ist
Aufgabenmaterial, keine UI-Farbe, und bleibt wie sie ist.

### 3.2 UI (Erwachsenen-Zone)

| Token | Wert | Verwendung | Kontrast |
|---|---|---|---|
| `--ui-surface` | `#ffffff` | Karten, Kopfzeile, Dialoge | – |
| `--ui-surface-muted` | `#f8fafc` | Ziffernblock-Leiste, Filterleisten | – |
| `--ui-surface-sunken` | `#f1f5f9` | gedrückte/inaktive Flächen | – |
| `--ui-border` | `#cbd5e1` | Standard-Rahmen | Deko |
| `--ui-border-strong` | `#94a3b8` | Tastenrahmen, Trenner (**nie Text**) | 2.56 : 1 |
| `--ui-text` | `#1e293b` | Standard-Text | 14.6 : 1 |
| `--ui-text-muted` | `#475569` | Sekundärtext | 7.58 : 1 |
| `--ui-text-subtle` | `#64748b` | Meta, Platzhalter – **hellste erlaubte Textfarbe** | 4.76 : 1 |
| `--ui-accent` | `#0f766e` | Primärknöpfe („Öffnen“), aktive Filter/Tabs | Weiß 5.47 : 1 |
| `--ui-accent-strong` | `#115e59` | Hover/gedrückt | Weiß 7.6 : 1 |
| `--ui-accent-soft` | `#f0fdfa` | Hintergrund aktiver Chips | – |
| `--ui-accent-border` | `#5eead4` | Rahmen aktiver Chips | Deko |
| `--ui-teacher` | `#6d28d9` | Alles hinter `TabbiLehrerGate` (Erstellen, Neu würfeln, Auswertung) | Weiß 7.1 : 1 |
| `--ui-teacher-soft` | `#f5f3ff` | Hintergrund Lehrkraft-Knopf | – |
| `--ui-danger` | `#b91c1c` | Zwei-Tipp-Warnzustand, endgültiges Löschen | Weiß 6.5 : 1 |
| `--ui-danger-soft` | `#fef2f2` | Hintergrund Warnbanner | – |

**Warum Petrol?** Blau ist Füller und Plättchen, Grün liest das Kind als „richtig“, Rot als
„falsch“, Gelb ist Fokus. Petrol ist die einzige kräftige Farbe, die keiner dieser Bedeutungen
in die Quere kommt, und hat genug Kontrast für weißen Text.

**Grün** wird in der UI nicht mehr verwendet (heute: Erstellen, Neu würfeln, Status).

---

## 4. Typografie

Schrift: **Andika** 400 + 700 (`--font-main`). Keine weiteren Schnitte.

| Token | Größe | Verwendung |
|---|---|---|
| `--text-xs` | 0.8125 rem (13 px) | Meta, Chips – **Untergrenze** |
| `--text-sm` | 0.875 rem (14 px) | Sekundärtext, Hilfe-Fußnoten |
| `--text-md` | 1 rem (16 px) | Fließtext, Knöpfe |
| `--text-lg` | 1.25 rem (20 px) | Abschnittstitel, Aufgabenanweisung |
| `--text-xl` | 1.5 rem (24 px) | Blatt-Titel, Ziffernblock-Tasten |
| `--text-task` | 1.65 rem (26.4 px) | Ziffern in Lücken und Vorgaben |
| `--text-2xl` | 2 rem (32 px) | Dachzahl, große Einzelzahlen |
| `--text-3xl` | 2.5 rem (40 px) | Fokus-Ansicht (Einzelaufgabe) |

**Gewichte:** `--weight-regular: 400` für Fließtext, Meta und Knopfbeschriftungen in der
Erwachsenen-Zone; `--weight-bold: 700` für Überschriften, Ziffernblock-Tasten, Vorgaben-Ziffern
und **Kind-Eingaben**. Faustregel: Wenn ein Bildschirm mehr als drei fette Textgruppen hat, ist
etwas zu laut.

Zeilenhöhe: Fließtext 1.5, Überschriften 1.25, Ziffern in Zellen 1.

---

## 5. Raum, Form, Ebenen

### 5.1 Abstände (4-px-Raster)

`--space-1` 4 · `--space-2` 8 · `--space-3` 12 · `--space-4` 16 · `--space-5` 24 ·
`--space-6` 32 · `--space-7` 48 px.
Bausteinmaße (`--etage-height`, `--spalte-width`, `--dach-height`, `--kreis-size`,
`--karo-size`) bleiben eigene Tokens, weil sie geometrisch aufeinander abgestimmt sind.

### 5.2 Radien, Schatten, Ebenen

| Token | Wert | Verwendung |
|---|---|---|
| `--radius-sm` | 6 px | Lücken, Zellen, Chips im Blatt |
| `--radius-md` | 10 px | Knöpfe, Tasten |
| `--radius-lg` | 16 px | Karten, Kacheln, Dialoge, Blattfläche |
| `--radius-pill` | 999 px | Filter-Chips, Status-Pillen |
| `--shadow-1` | `0 1px 2px rgba(15,23,42,.06)` | Karten in Ruhe |
| `--shadow-2` | `0 4px 12px rgba(15,23,42,.08)` | Kacheln, Kopfzeile, Ziffernblock-Leiste |
| `--shadow-3` | `0 12px 32px rgba(15,23,42,.16)` | Dialoge, schwebende Eingabeleiste (Desktop) |
| `--key-edge` | 4 px Unterkante `--ui-border-strong` | Tasten (taktile „Druckkante“), gedrückt 2 px |
| `--z-sticky` | 100 | Kopfzeile |
| `--z-keyboard` | 200 | Ziffernblock/Tastatur |
| `--z-overlay` | 1000 | Dialoge (Lehrkraft-Sperre) |
| `--z-toast` | 1100 | Bestätigungs-Banner |

### 5.3 Touch-Ziele

| Token | Wert | Gilt für |
|---|---|---|
| `--touch-min` | 48 px | Alle Knöpfe der Erwachsenen-Zone |
| `--touch-key` | 56 px | Ziffernblock- und Buchstaben-Tasten (Tablet), Desktop-Schwebeleiste ≥ 44 px |
| `--kreis-size` | 44 px | Plättchen (Minimum, nicht kleiner) |

Abstand zwischen zwei Tipp-Zielen mindestens `--space-1` (besser `--space-2`).

### 5.4 Bewegung

`--dur-fast` 120 ms (Tastendruck), `--dur-base` 200 ms (Menüs, Dialoge), Easing `ease-out`.
In der Kind-Zone nur der blinkende Cursor. Unter `prefers-reduced-motion: reduce` werden alle
Dauern 0 und der Cursor steht still (sichtbar, nicht blinkend).

---

## 6. Komponenten

Jede Komponente nennt Zustände. „Druck“ heißt: Verhalten unter `@media print`
(Details zum Drucklayout: Spec `docs/superpowers/specs/2026-10-25-…`, Teil A).

### 6.1 Lücke (`.luecke`)

| Zustand | Aussehen |
|---|---|
| leer | `--ui-surface`, Rahmen 2 px `--ink-line`, `--radius-sm` |
| aktiv, leer | `--focus-bg`, Innenrahmen 3 px `--focus-ring`, blinkender Cursor `--ink-fueller` |
| gefüllt | Ziffer `--ink-fueller`, `--weight-bold`, `--text-task` |
| aktiv, gefüllt | wie aktiv, Ziffer bleibt sichtbar (Überschreiben per Tipp) |
| Druck | weiß, Rahmen dünn schwarz, Ziffer Füller-Blau |

Es gibt **keinen** Zustand „richtig“, „falsch“, „unvollständig“ oder „passt nicht“.

### 6.2 Plättchen (`.kreis`)

3 Zustände per Tipp: leer (transparent, Rahmen `--ink-line`) → `--ink-plaettchen-blau` →
`--ink-plaettchen-rot` → leer. Alle Plättchen sind immer gleich groß und gleich aktiv.
Zehnerstreifen: zwei 5er-Gruppen mit Trennstrich.

### 6.3 Ziffernblock (`.numpad`)

- **Tasten:** alle Zifferntasten gleich breit und hoch (`--touch-key`), `--ui-surface`,
  Rahmen `--ui-border-strong` mit `--key-edge`, Ziffer `--ui-text` `--weight-bold` `--text-xl`.
  Gedrückt: `--ui-surface-sunken`, Kante 2 px.
- **⌫ (Rückschritt):** **neutral**, nicht rot. Unterscheidung über Form: 1.5-fache Breite,
  Glyphe ⌫, Fläche `--ui-surface-sunken`. Rot würde nach jedem Korrigieren wie ein Urteil wirken.
- **0–10 / 0–20-Umschalter:** kleine Taste rechts außen, Zustand über Beschriftung, Fläche
  `--ui-accent-soft` wenn aktiv.
- **Layout-Regel:** Die Reihe **0 1 2 … 10** sitzt in beiden Modi an derselben Stelle und hat
  dieselbe Tastenbreite. Im 0–20-Modus kommt **11 … 20** als zusätzliche Reihe mit identischer
  Tastenbreite hinzu; auf schmalen Geräten werden beide Reihen gleichmäßig umbrochen (z. B. je
  6 Spalten), aber nie mit unterschiedlichen Tastenbreiten.
  *Grundregel-Check offen:* Ob 11–20 spaltengenau unter 1–10 stehen darf (macht die
  Zehner-Einer-Struktur sichtbar), entscheidet die Lehrkraft. Standard bis dahin: zweite Reihe
  linksbündig ab „0“-Spalte, also ohne Stellenwert-Ausrichtung.
- **Tablet/Touch:** volle Breite, `position: fixed; bottom: 0`, `env(safe-area-inset-bottom)`.
- **Desktop (`min-width: 1024px` und `pointer: fine`):** schwebende Leiste, mittig,
  `--radius-lg`, `--shadow-3`, Abstand `--space-4` zum Rand (Spec Teil B).
- Die **Buchstaben-Tastatur** benutzt dieselbe Hülle und dieselben Tasten-Tokens,
  A–Z + Ä Ö Ü in ABC-Reihenfolge.

### 6.4 Knöpfe (`.ui-btn`)

| Typ | Aussehen | Wofür |
|---|---|---|
| **Primär** | Fläche `--ui-accent`, Text weiß | Eine Hauptaktion pro Ansicht (Kachel „Öffnen“, Dialog „OK“) |
| **Sekundär** | `--ui-surface`, Rahmen `--ui-border`, Text `--ui-text` | Drucken, Hilfe, Filter inaktiv |
| **Ruhig (Ghost)** | transparent, Text `--ui-text-muted`, Rahmen erst bei Hover | Werkzeuge auf dem Arbeitsblatt |
| **Lehrkraft** | `--ui-teacher-soft`, Rahmen + Text `--ui-teacher`, Schloss-Icon vorn | Alles hinter `TabbiLehrerGate` |
| **Zwei-Tipp, Warnzustand** | Fläche `--ui-danger`, Text weiß, Beschriftung „Wirklich …?“ | Zustand nach dem 1. Tipp bei Löschen/Zurück/Würfeln |

Alle: Höhe ≥ `--touch-min`, `--radius-md`, `--text-md`, `--weight-regular` (nur Primär darf
`--weight-bold`). Fokusring für Tastatur: `:focus-visible` → 3 px `--ui-accent`, 2 px Abstand.
Icon + Text, nie Icon allein (Ausnahme: ⌫).

### 6.5 Kopfzeile Arbeitsblatt

Eine Zeile, `--ui-surface`, `--shadow-2`, `position: sticky`.

```
[← Übersicht]      (Logo) Titel des Blatts         [Drucken] [Werkzeuge ▾]
                     Untertitel (--text-sm)
```

- **Werkzeuge ▾** öffnet ein Menü mit: Neu würfeln (Lehrkraft), Löschen (Zwei-Tipp),
  Zahlenbereich/Mix, Einzel-Ansicht. Tab-Leisten für Teilblätter bleiben unter der Kopfzeile,
  aber als kompakte Chips (`--radius-pill`).
- „Zurück“ behält den Zwei-Tipp-Schutz.
- Im Druck komplett ausgeblendet (`.print-hide`).

### 6.6 Bibliothek

- **Kopf:** Logo + Titel links; rechts „Hilfe“ (Sekundär) und „Erstellen“ (Lehrkraft-Knopf).
  Der Erstellen-Knopf erscheint nur einmal.
- **Filter:** eine Zeile Chips (Fach), darunter eine Zeile Chips (Status). Aktiver Chip:
  `--ui-accent-soft` + `--ui-accent-border`, Text `--ui-accent-strong`.
- **Kachel:** `--ui-surface`, `--radius-lg`, `--shadow-2`, Innenabstand `--space-4`.
  Reihenfolge: Symbol + Status-Pille → Titel (`--text-lg`, bold) → Schlagwort-Chips → Primär „Öffnen“.
  Status-Pillen neutral (`--ui-surface-sunken`, `--ui-text-muted`) – „Neu“, „Angefangen“,
  „Abgeschlossen“ dürfen sich in Text und Icon unterscheiden, **nicht** in Grün/Rot.
- **Hintergrund:** ruhig. Schreibtisch-Motiv höchstens als sehr stark abgetöntes Bild ohne
  zusätzliche Sticker; auf Geräten < 1060 px nur Karo.

### 6.7 Dialog (Lehrkraft-Sperre)

Overlay `rgba(15,23,42,.45)`, Karte `--ui-surface` `--radius-lg` `--shadow-3`, Titel `--text-lg`.
Bestätigen = Primär (Petrol, nicht Grün), Abbrechen = Sekundär, ⌫ = neutrale Taste wie im
Ziffernblock. Falsche Eingabe: kurzes Wackeln erlaubt (Erwachsenen-Zone), kein Rot-Blinken.

### 6.8 Hinweise & Banner

Bestätigungs-Banner (z. B. „Gespeichert“): `--ui-surface`, linker Balken `--ui-accent`,
`--shadow-2`, `--z-toast`, verschwindet nach 3 s. Nie in der Kind-Zone über der Aufgabe.

### 6.9 „Fertig“-Bereich am Blattende

Neutraler Sekundär-Knopf ohne Einblend-Animation, ohne Gelb, ohne Konfetti. Sein Erscheinen
darf nicht davon abhängen, ob Antworten stimmen.

---

## 7. Icons & Bilder

- **Inhalts-Emoji** (Tiere, Obst, Gegenstände) sind Aufgabenmaterial und bleiben.
- **UI-Icons** werden mittelfristig ein kleines Inline-SVG-Set (24 px, 2 px Strich,
  `currentColor`): zurück, drucken, werkzeuge, würfeln, löschen, schloss, hilfe, plus, lupe.
  Bis dahin Emoji nur in der Erwachsenen-Zone, immer mit Text.
- **Maskottchen** (`assets/figuren/`): Logo, Leer-Zustände, Hilfe. Nie auf der Blattfläche,
  nie als Reaktion auf Eingaben.

---

## 8. Sprache in der Oberfläche

- Kurz, Verb zuerst: „Öffnen“, „Drucken“, „Neu würfeln“.
- Das Kind wird nicht namentlich genannt (öffentliches Repo) – „das Kind“ oder direkte Anrede
  vermeiden; Druckkopf mit leerer Namenszeile.
- Keine Wertungen („Super!“, „Fast!“), keine Zahlen über Richtigkeit.

---

## 9. Regeln für neuen Code

1. Nur Tokens, keine rohen Farben/Größen. Fehlt ein Token: hier ergänzen, dann benutzen.
2. Keine Inline-Styles in HTML/JS für Gestaltung (Ausnahme: berechnete Geometrie wie Linienkoordinaten).
3. Neue Komponenten hier in § 6 mit allen Zuständen eintragen.
4. Vor jeder Gestaltungsentscheidung in der Kind-Zone die Grundregel-Frage stellen:
   *„Sieht oder erfährt das Kind hier etwas, das es auf dem Blatt selbst herausfinden müsste?“* –
   und zusätzlich: *„Sieht das hier wie eine Bewertung aus?“*
5. Nach Änderungen an `css/` oder `js/` die Cache-Version in `sw.js` hochzählen.

---

## 10. Migrationsplan

Die Tokens existieren bereits in `css/tabbi.css`; die alten Variablennamen sind als Aliase
erhalten, die Optik ist unverändert. Umstellung in kleinen, einzeln prüfbaren Schritten:

| Schritt | Inhalt | Sichtbar? |
|---|---|---|
| 1 ✅ | Tokens im `:root`, Legacy-Aliase, Doku, Styleguide | nein |
| 2 | Rohe Hex-Werte abschnittsweise durch Tokens ersetzen (gleicher Wert → kein Optikwechsel) | nein |
| 3 ✅ | Kind-Zone neutralisieren: ⌫ grau, „Neu würfeln“ im Lehrkraft-Stil statt Grün, Fertig-Bereich ohne Gelb/Animation (Bestätigen Petrol, Weiterarbeiten neutral mit ✏️ statt ✖), Fokusrahmen `#b45309` | ja |
| 4 | Kopfzeile einzeilig + Werkzeug-Menü; Bibliothek: Erstellen als Lehrkraft-Knopf | ja |
| 5 | Akzent Petrol statt UI-Blau, Grün raus, Kontrast-Fixes, Schriftgewichte | ja |
| 6 | Ziffernblock-Layout-Regel (gleiche Tastenbreiten) | ja |
| 7 | Inline-Styles aus `011_click_und_mix.html`, `index.html`, `tabbi-core.js` in Klassen | nein |
| 8 | UI-Icon-Set (SVG) | ja |

Schritt 3 hat die höchste Priorität, weil er die Grundregel betrifft.
