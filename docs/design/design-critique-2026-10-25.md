# Design-Critique: TABBI (Stand 2026-10-25, Commit `a2d5493`)

Geprüft: Bibliothek (`index.html`), Arbeitsblätter `001`, `009`, `011` (inkl. Lehrkraft-Sperre),
Hilfe (`hilfe.html`) – jeweils im Browser bei 1180×820 (Tablet quer) und 768×1024 (Tablet hoch),
dazu eine Auswertung von `css/tabbi.css` (3 594 Zeilen).

Kontext: Statische PWA, Hauptnutzer ist ein Erstklässler mit Teilhabeassistenz am Tablet;
Lehrkraft und Eltern nutzen Bibliothek, Erstellung und Druck. Reifegrad: funktional fertig,
jetzt Feinschliff. Maßstab bleibt die Eiserne Grundregel aus `AGENTS.md`.

---

### Gesamteindruck

Die Arbeitsblatt-Ansicht ist stark: ruhiges Karo, klare Zahlenhäuser, Füller-Blau für Eingaben,
große Ziffernblock-Tasten. Die größte Baustelle ist das **fehlende semantische Farbsystem**:
Blau, Grün, Rot und Gelb bedeuten an verschiedenen Stellen Verschiedenes – und auf der
Kind-Fläche tauchen Rot (⌫-Taste) und Grün („Neu würfeln“) auf, also genau die Farben, die
Kinder als „falsch“/„richtig“ lesen. Dazu frisst die Erwachsenen-Steuerung auf dem Tablet im
Hochformat gut die Hälfte des Bildschirms, bevor die erste Aufgabe beginnt.

---

### Usability

| Befund | Schwere | Empfehlung |
|---|---|---|
| ⌫-Taste ist rot (`#fee2e2`/`#ef4444`), also die Farbe von „falsch“. Das Kind benutzt sie ständig, oft *nach* einem eigenen Fehler – das wirkt wie ein Urteil. | 🔴 Kritisch | ⌫ neutral (grau) gestalten und über Form/Symbol unterscheiden (breitere Taste, Pfeil-Glyphe). Rot/Grün auf der Kind-Fläche ganz vermeiden. |
| Vorname des Kindes steht in 15 Dateien (Druckkopf „Name: …“ in allen Blättern, Hilfe-Texte 10×, README, `index.html`). Repo ist öffentlich. | 🔴 Kritisch | Bereits als Teil E in `docs/superpowers/specs/2026-10-25-…` geplant – vorziehen. Neutral „das Kind“, leere Namenszeile. |
| Tablet hoch, Blatt 009: Kopfzeile (3 Zeilen inkl. Buttons) + Tab-Leiste + „Zahlenbereich/Einzel-Ansicht“ belegen ~270 px, der 0–20-Ziffernblock ~300 px. Für die Aufgabe bleiben ~45 % der Höhe. | 🔴 Kritisch | Kopfzeile einzeilig: Zurück · Titel · Drucken · „Werkzeuge ▾“. Neu würfeln, Löschen, Zahlenbereich, Einzel-Ansicht wandern ins Werkzeug-Menü (Zwei-Tipp bzw. Lehrkraft-Sperre bleiben). |
| Ziffernblock 0–20 im Hochformat: Reihen mit 6, 7, 6 und 4 Tasten → jede Reihe hat andere Tastenbreiten (die „17–20“-Tasten sind fast doppelt so breit wie „0–5“). Ziel-Größen springen, Muskelgedächtnis aus dem 0–10-Modus geht verloren. | 🟡 Mittel | Einheitliche Tastenbreite. Die Reihe 0–10 bleibt in beiden Modi an derselben Stelle; 11–20 kommt als zweite Reihe mit gleicher Tastenbreite dazu (Details: Designsystem § 5.3). |
| Erwachsenen-Werkzeuge („Neu würfeln“ grün, „Löschen“, „PDF / Drucken“) sitzen auf dem Blatt genauso prominent wie die Kind-Bedienung. Grüner „Neu würfeln“-Knopf zieht den Blick des Kindes an. | 🟡 Mittel | Werkzeuge visuell zurücknehmen (Ghost-Buttons, neutrale Farbe), gesperrte Aktionen einheitlich als „Lehrkraft“-Knopf kennzeichnen (violett + Schloss). |
| Bibliothek: „🔒 ➕ Arbeitsblatt erstellen“ ist der lauteste Knopf der Seite und steht doppelt (Kopf + Leer-Zustand), obwohl die häufigste Aufgabe hier „Blatt öffnen“ ist und Erstellen gesperrt ist. | 🟡 Mittel | Erstellen als ruhiger Lehrkraft-Knopf (Outline violett) oben rechts; im Leer-Zustand nur ein Textverweis. Primärfarbe gehört den „Öffnen“-Knöpfen der Kacheln. |
| „Fertig“-Bereich am Blattende erscheint mit Einblend-Animation und gelbem Verlauf (`#fef08a`). Gelb ist sonst die Fokus-Farbe, die Animation wirkt wie eine kleine Belohnung. | 🟢 Gering | Ohne Animation, neutrale Fläche. Gelb ausschließlich für die aktive Lücke. |
| Kein `prefers-reduced-motion`: blinkender Cursor und Pulsieren laufen immer. | 🟢 Gering | Motion-Tokens + Reduced-Motion-Block (im Designsystem vorgesehen). |

### Visuelle Hierarchie

- **Was zuerst ins Auge fällt:**
  - *Bibliothek:* der grüne Erstellen-Knopf und der bunte Schreibtisch-Hintergrund mit vier
    Maskottchen-Stickern – **falsch**, der Inhalt (Kacheln) sollte führen.
  - *Arbeitsblatt (quer):* die Zahlenhäuser – **richtig**. Im Hochformat konkurrieren drei
    Button-Reihen damit.
- **Lesefluss:** Arbeitsblatt quer ist sauber (Kopf → Häuser → Ziffernblock). Bibliothek springt
  zwischen Kopf, zwei Filterzeilen, Leer-Zustand und erst dann den eigentlichen Blättern.
- **Betonung:** 67× `font-weight: 700`, nur 2× 400. Wenn fast alles fett ist, verliert auch die
  fette Füller-Blau-Eingabe ihren Sonderstatus. Überschriften, Buttons, Meta-Texte und
  Kind-Eingaben haben dasselbe Gewicht.

### Konsistenz

| Element | Problem | Empfehlung |
|---|---|---|
| Farbe | 68 verschiedene Hex-Werte + 25 rgba-Varianten; nur 18 als Variable, 150 `var()`-Nutzungen gegenüber Hunderten roher Werte. Tailwind-Slate/Blue ad hoc gemischt. | Semantische Tokens (Tinte, Papier, Fokus, UI, Lehrkraft, Gefahr) – siehe `docs/design/designsystem.md`. |
| Blau | Füller-Blau `#0000CD` (Kind), Plättchen-Blau `#2563eb`, UI-Primär `#1d4ed8` (Öffnen, Drucken, Filter, Tabs) – vier Blautöne, drei Bedeutungen. | **„Blau gehört dem Kind“**: UI-Akzent auf Petrol (`#0f766e`) umstellen, Blau nur noch für Füller und Plättchen. |
| Grün / Rot | Grün = Erstellen, Neu würfeln, Bestätigen, Status; Rot = Plättchen, ⌫, Warnung, Heftrand. | Grün aus der UI streichen; Rot nur für Plättchen (Kind) und Zwei-Tipp-Warnzustand (Erwachsene). |
| Schriftgrößen | 34 verschiedene `font-size`-Werte (0.78–2.75 rem, u. a. 0.92/0.95/0.96 rem nebeneinander). | 8-stufige Skala. |
| Radien | 17 Werte (3 px … 58 px). | 4 Stufen: 6 / 10 / 16 px / pill. |
| Schatten | 39 unterschiedliche `box-shadow`. | 3 Ebenen + Tasten-Kante. |
| Abstände | 60 unterschiedliche `padding`-Deklarationen. | 4-px-Raster, 7 Stufen. |
| Z-Index | 0 … 9999 ohne System. | Benannte Ebenen. |
| Icons | Emoji als UI-Icons (🎲 🗑️ 🖨️ ⚙️ 🔍 🔒 ➕ 🌙 ✏️) – rendern auf iPad, Windows und Android unterschiedlich, Größe/Farbe nicht steuerbar. | Inhalts-Emoji (Tiere, Obst) bleiben. UI-Icons mittelfristig als kleines monochromes Inline-SVG-Set. |
| Inline-Styles | 38× in `011_click_und_mix.html`, 12× in `index.html`, 5× in `tabbi-core.js`. | In Klassen überführen, damit Tokens greifen. |

### Barrierefreiheit

- **Farbkontrast (WCAG 2.2):**
  - Füller-Blau auf Papier 10.95 : 1, auf Fokus-Gelb 10.53 : 1 – ✅
  - Druck-Schwarz auf Papier 15.6 : 1 – ✅
  - Weiß auf `#16a34a` (Erstellen-Knopf, Bestätigungen) **3.30 : 1 – ❌** für 16-px-Text
    (Großtext-Schwelle ist 18.66 px fett). Mit `#15803d` 5.02 : 1.
  - `#94a3b8` als Textfarbe (u. a. Zeile 606) **2.56 : 1 – ❌**. Mindestens `#64748b` (4.76 : 1).
  - Fokus-Rahmen `#d97706` auf Gelb 3.00 : 1 – grenzwertig für Nicht-Text (3 : 1). `#b45309` → 4.74 : 1.
  - Weiß auf UI-Primär `#1d4ed8` 6.70 : 1 – ✅
- **Touch-Ziele:** Ziffernblock 58 px hoch ✅, Kopfzeilen-Buttons 48 px ✅, Plättchen 44 px ✅
  (Minimum). Problem ist nicht die Größe, sondern die *Ungleichheit* der Tasten im 0–20-Modus.
- **Lesbarkeit:** Andika ✅. Meta-Texte bis 0.78 rem (12.5 px) in der Bibliothek sind für
  Erwachsene am Tablet zu klein; Untergrenze 13 px.
- **Tastatur (Desktop/Lehrkraft):** nur 2× `:focus-visible` im CSS. Für alle Knöpfe einen
  einheitlichen Fokusring vorsehen (beeinflusst das Kind am Touch-Gerät nicht).
- **Alternativtexte:** Würfel/Türme haben `aria-label` ✅.

### Was gut funktioniert

- **Arbeitsblatt-Fläche:** Rechenheft-Karo, schwarze Vorgaben, blaue Eingaben – sofort als
  Heft erkennbar, Lehrkraft sieht auf einen Blick, was das Kind eingetragen hat.
- **Aktive Lücke:** Gelb + Rahmen + blinkender Cursor ist eindeutig und gut sichtbar.
- **Schutzmechanismen:** Zwei-Tipp-Bestätigung und Einmaleins-Sperre sind gut umgesetzt und
  unaufdringlich gestaltet.
- **Bausteine sind präzise aufeinander abgestimmt** (Etagenhöhe = Plättchenreihe), das war schon
  ein Token-Ansatz (`--etage-height`, `--kreis-size`).
- **Hilfe-Seite:** Zeichenerklärung mit echten Bausteinen statt Screenshots – vorbildlich.

### Prioritäten

1. **Kind-Fläche farbneutral machen** – ⌫ grau, kein Grün/Rot außer Plättchen, Gelb nur für den
   Fokus. Direkt aus der Eiserne-Grundregel-Logik: kein Signal, das wie Bewertung aussieht.
2. **Kopfzeile auf eine Zeile + Werkzeug-Menü** – gibt im Hochformat ~150 px an die Aufgabe
   zurück und nimmt Erwachsenen-Knöpfe aus dem Blickfeld des Kindes.
3. **Token-Migration** – semantische Variablen sind jetzt in `css/tabbi.css` hinterlegt
   (ohne Optikänderung). Abschnitt für Abschnitt rohe Hex-Werte ersetzen, dann die Zielwerte
   (Petrol-Akzent, Kontrastfixes, Schriftgewichte) an *einer* Stelle umschalten.

Das Zielbild steht in [`designsystem.md`](designsystem.md), die Live-Ansicht der Tokens in
[`styleguide.html`](styleguide.html).
