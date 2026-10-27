# TABBI: Tipp-ArbeitsBlätter-Bibliothek

> **Digitale, barrierearme Arbeitsblätter für die Grundschule (Klasse 1)**  
> Entwickelt für ein Kind (1. Klasse) zur motorischen Entlastung (Tippen statt Schreiben/Ausmalen) mit Begleitung einer Teilhabeassistentin – lauffähig als PWA direkt im Browser / GitHub Pages ohne Backend oder Build-Step.

---

## 📌 Inhaltsverzeichnis
1. [Projektvision & Eiserne Grundregel](#-projektvision--eiserne-grundregel)
2. [Aktueller Entwicklungsstand](#-aktueller-entwicklungsstand)
3. [Funktionsumfang & Kern-Features](#-funktionsumfang--kern-features)
4. [Katalog der Arbeitsblätter & Aufgabentypen](#-katalog-der-arbeitsblätter--aufgabentypen)
5. [Click & Mix Generator & Test-Bibliothek](#-click--mix-generator--test-bibliothek)
6. [Design & Barrierefreiheit (Motorische Hilfen)](#-design--barrierefreiheit-motorische-hilfen)
7. [Druck- & PDF-Workflow](#-druck---pdf-workflow)
8. [Technische Architektur](#-technische-architektur)
9. [Offline-Betrieb (PWA & Service Worker)](#-offline-betrieb-pwa--service-worker)
10. [Dateistruktur](#-dateistruktur)

---

## 🎯 1. Projektvision & Eiserne Grundregel

TABBI transferiert analoge Schul-Arbeitsblätter in eine digitale, tablet-optimierte Oberfläche.

### ⚖️ Eiserne Grundregel (Keine kognitive Hilfe!)
> **Die digitale Fassung darf nichts verraten, einschränken oder erleichtern, was auf dem Papier-Arbeitsblatt offen ist.**  
> *„Sieht oder erfährt das Kind hier etwas, das es auf dem Blatt selbst herausfinden müsste?“*

* ❌ **Streng verboten:**
  * Felder deaktivieren oder ausgrauen, die laut Lösung nicht gebraucht werden.
  * Automatisches Auffüllen bis zu einer Zielsumme.
  * Eingabewerte einschränken (z. B. nur noch die Differenz erlauben).
  * Automatische Korrektur, Richtig/Falsch-Feedback, Sterne, Punkte oder Sounds.
  * Systemtastatur des Tablets (keine Standard-`<input>`-Felder, sondern klickbare DIVs/Buttons gegen Popups).
* ✔️ **Erlaubt sind rein motorische Erleichterungen:**
  * Große Touch-Targets (Fat-Finger-Schutz, mind. 56px).
  * Fester, aufgeräumter Ziffernblock am unteren Rand (0–10 bzw. 0–20).
  * Gelbe Markierung (`#fffacd`) der aktiven Lücke.
  * Automatisches Weiterspringen zur nächsten leeren Lücke nach Zifferneingabe.
  * Direkte Überschreibbarkeit bereits gefüllter Lücken ohne vorheriges Löschen.
  * Smarte Rückschritt-Taste (`⌫`).

---

## 🚀 2. Aktueller Entwicklungsstand

Der aktuelle Stand (Offline-Release) umfasst:

* **12 fertige Arbeitsblatt-Module** mit über 20 Einzel-Varianten und Zahlenraum-Filtern.
* **Click & Mix Generator:** Individuelles Zusammenstellen, Mischen und Differenzieren von Aufgaben.
* **Test-Bibliothek ("Mein Test"):** Eigenes Erstellen von 1- bis 2-seitigen Mathe-Tests, dauerhaftes Speichern im Browser (`localStorage`), Wiederaufrufen und Drucken.
* **Einzel-Ansicht (Fokus-Modus):** Großes, ablenkungsfreies Anzeigen jeweils einer einzigen Aufgabe mit Vor- und Zurück-Navigation. Verschachtelungsfehler behoben, saubere Zentrierung.
* **Grafisches TABBI-Theming:** Eigenes Maskottchen (TABBI) in Web-Icons, Favicons (16/32/64/128px), Titelbalken sowie dezent transparent im Schreibtisch-/Schulheft-Hintergrund.
* **Vollständiger PWA-Offline-Support:** Service Worker (Cache-Version siehe `CACHE_NAME` in `sw.js`) für lückenloses Arbeiten im Klassenzimmer ohne Internetverbindung.

---

## 🛠️ 3. Funktionsumfang & Kern-Features

| Feature | Beschreibung |
|---|---|
| **Eingabe-Numpad** | Fester Ziffernblock (0–10 oder 0–20) am unteren Rand. Verhindert das Aufpoppen der Tastatur. |
| **Fokus-Steuerung** | Aktives Feld wird gelb markiert; Cursor springt automatisch zur nächsten leeren Lücke. |
| **Smarte Rückschritt-Taste** | Ist ein Feld gefüllt, wird es geleert. Ist es bereits leer, springt der Cursor ein Feld zurück. |
| **2-Tipp-Löschung** | Blatt leeren verlangt eine Zwei-Tipp-Bestätigung direkt im UI (kein nerviges System-Popup). |
| **Status & Speicherung** | Fortschritt (`⚪ Neu`, `✏️ Angefangen`, `✅ Fertig`) wird live im `localStorage` gespeichert. |
| **Einzel-Ansicht (Fokus-Modus)** | Per Knopfdruck wird nur eine einzige Aufgabe im Großformat fokussiert. |
| **Druck-Optimierung** | Ein Klick auf `🖨️ PDF / Drucken` erzeugt eine kompakte Druckseite mit Heftrand und optionalem Namen (`tabbi_druckname`), ohne UI-Bedienelemente. |
| **Schwebender Ziffernblock** | Auf großen Bildschirmen schwebt der Ziffernblock neben dem Blatt, auf dem Tablet liegt er am unteren Rand. |
| **Gruppen-Builder** | Aufgabentypen in 5 Übergruppen, seltene Optionen unter „Mehr Optionen“. |
| **✅ Fertig / 📁 Abgeschlossen** | Endgültiger Abschluss (zwei Tipps): Blatt gesperrt, in `tabbi_historie_v1` verschoben, nicht löschbar. Dort *Ansehen* und *Nochmal neu*. |
| **Auswertung (nur Lehrkraft)** | 3-Sekunden-Halten plus Einmaleins-Aufgabe. Rote Markierungen mit Sollwert, „nicht bearbeitet“, Zusammenfassung je Gruppe, `Mit Korrektur drucken`. Sperrt beim Verlassen wieder. Der normale Druck zeigt nie Korrekturen, das Kind sieht nie Richtig/Falsch. |

---

## 📚 4. Katalog der Arbeitsblätter & Aufgabentypen

### 🏠 Aufgabentyp 1: Zahlenhäuser & Zahlenfreunde
* **Zahlenhäuser (001):** Dach mit Zielzahl, Wohnungen mit Vorgaben (schwarz) und Lücken (Füller-Blau `#0000CD`). Varianten für 1–5, 5–10 und 1–10.
* **Zahlenfreunde (001b):** Zahlenhaus kombiniert mit 2×5 Zehnerstreifen. Interaktive 3-State-Plättchen (1. Klick = Blau, 2. Klick = Rot, 3. Klick = Leer).

### ✋🎲 Aufgabentyp 2: Finger, Türme & Würfel
* **Zahlen bis 5 (002):** Visuelle Erfassung von Mengen durch Fingerbilder (SVG-Hände), Holzwürfeltürme und klassische Würfelaugen.

### 🐟🐚 Aufgabentyp 3: Zählen, Strichlisten & Mengen
* **Punktebilder & Fische (003):** Aquarium mit Zählaufgaben und Punktefeldern.
* **Strichlisten (004):** Bündeln in 5er-Paketen mit echter Zählkontrolle.
* **Einkreisen & Bündeln (005):** 10er-Bündelung und Restbestimmung.
* **Gleiche Mengen anmalen (006):** Vergleichen und Zuordnen gleicher Mengen.

### ➕🧱 Aufgabentyp 4: Rechnen, Zehnerübergang & Mauern bis 20
* **Zehner & Einer (007):** Bündelungs-Tabelle ($Z$ und $E$) bis 20.
* **Nachbarzahlen & Zahlenstrahl (008):** Vorgänger ($-1$), Zahl und Nachfolger ($+1$).
* **Zwergen- & Riesenaufgaben (009):** Analogieaufgaben ($3 + 4 = 7 \rightarrow 13 + 4 = 17$).
* **Zehnerübergang & Zahlenmauern (010):** Schrittweises Rechnen über die 10 ($8 + 5 = 8 + 2 + 3$) und Zahlenmauern.

---

## 🎛️ 5. Click & Mix Generator & Test-Bibliothek

Unter `blaetter/011_click_und_mix.html` steht ein dynamischer Aufgabengenerator zur Verfügung:

1. **Freie Aufgabenauswahl:** Beliebige Kombination aus 13 Aufgabentypen.
2. **Differenzierung:** Freie Wahl des Zahlenraums (z. B. nur Zahlen 3, 6, 9 oder Bereiche wie 1–5, 10–20).
3. **Mischung:** Aufgabenreihenfolge kann gewürfelt werden.
4. **Test-Modus:**
   * Generiert 1- oder 2-seitige Arbeitsblätter mit offiziellem Namens-/Datumskopf.
   * Tests können unter einem eigenen Namen in der lokalen Bibliothek abgelegt werden.
   * Direkter Wechsel in die **Einzel-Ansicht** für reizarmes Bearbeiten am Tablet.

---

## 🎨 6. Design & Barrierefreiheit (Motorische Hilfen)

* **Typografie:** Google Font `'Andika'` – speziell für Leseanfänger und Grundschulkinder optimiert.
* **Hintergrund:** Dezentes Rechenheft-Karo (CSS-Grid) mit transparenten Schreibtisch-Elementen.
* **Farbkodierung:**
  * Vorgedruckter Text / Aufgaben: Druck-Schwarz (`#222222`).
  * Kind-Eingaben: Kräftiges **Füller-Blau** (`#0000CD`), fett formatiert.
  * Aktive Lücke: Gelb (`#fffacd`) mit blauem Fokusrahmen.
* **Fat-Finger-Schutz:**
  * `touch-action: manipulation` und `user-select: none` verhindern versehentliches Zoomen oder Textmarkieren.
  * Tastenhöhe von mind. 56px, optimiert für Kinderfinger.
  * Berücksichtigung von iOS `env(safe-area-inset-bottom)`.

---

## 🖨️ 7. Druck- & PDF-Workflow

Die Korrektur erfolgt traditionell durch die Lehrkraft auf Papier oder digital im exportierten PDF.

* **Druck-Button:** `🖨️ PDF / Drucken` ruft `window.print()` auf.
* **`@media print`-Regeln:**
  * Ziffernblock, Navigationsleisten, Reset-Buttons und Hilfehinweise werden komplett ausgeblendet (`.print-hide`).
  * Aktive Fokus-Markierungen werden neutralisiert.
  * Farbdruck wird durch `-webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;` erzwungen, damit Füller-Blau und rot-blaue Plättchen im Ausdruck exakt erhalten bleiben.
  * Seitenumbrüche (`page-break-after: always`) sind für 2-seitige Tests exakt vordefiniert.

---

## 🏗️ 8. Technische Architektur

TABBI basiert auf einem strikten **Vanilla-Web-Stack**:
* **Kein Build-Step**, kein npm-Zwang zur Laufzeit, kein Framework overhead.
* Direktes Hosting auf **GitHub Pages**.
* **Zentrale Komponenten:**
  * `js/tabbi-core.js`: Universeller Controller für alle Blätter (Numpad, Navigation, Fokus, Persistenz, Event-Handling).
  * `js/tabbi-gruppen.js`: Aufgabengruppen des Builders und Zuordnung Typ -> Gruppe.
  * `js/tabbi-historie.js`: Verwaltung der abgeschlossenen Blätter (`tabbi_historie_v1`).
  * `js/tabbi-auswertung.js`: Lösungen aus gedruckten Vorgaben ableiten und vergleichen (nur Lehrkraft-Ansicht, schreibt nie ins DOM).
  * `js/blaetter-katalog.js`: Zentrale Metadaten aller Arbeitsblätter und Filterkategorien.
  * `css/tabbi.css`: Globales Designsystem, responsive Breakpoints und Drucklayouts.
* **Datenspeicherung:**
  * Jeder Zustand wird in `localStorage` unter `tabbi_daten_<blattId>` als JSON persistiert.
  * Abgeschlossene Blätter unter `tabbi_historie_v1`, optionaler Druckname unter `tabbi_druckname`.
  * Fehlerresistente Speicherung über `try/catch`.

### Auswertung – Grenzen

Die Auswertung wertet nur Lücken, deren Lösung eindeutig aus gedruckten Vorgaben im selben Baustein folgt (Regeln nach Struktur, nicht nach Blatt). Alles andere zählt als „nicht ausgewertet“ und nie als falsch:

* **Punkte bis 20, Stellenwerttafel bei genau 20:** Zehner/Einer sind aus dem Bild nicht eindeutig (1 Zehner + 10 Einzelpunkte). Die Gleichung `10 + 10 = 20` wird gewertet.
* **Strichlisten im Katalogblatt 004:** Zahlenfelder (`zahl_*`) und Striche haben keine gedruckte Zählvorlage (Tiere nur als Bild).
* **Zahlenreihen mit nur einer gedruckten Zahl** oder Schrittweite ungleich ±1, sowie Ordnen mit doppelten Zahlen.
* **Halbieren mit ungeradem n** und `n = _ + _` ohne „Halbieren“-Kennzeichnung (mehrere Zerlegungen möglich).
* **Kreise, Plättchen, Anmalen, Einkreisen, Bündeln:** reine Markierungen, werden nicht bewertet.
* **Deutsch-Demo-Lücken** im Builder.
* **Zahlenhaus/Zahlenfreunde mit zwei leeren Lücken:** gewertet wird nur, ob die Summe stimmt, wenn beide gefüllt sind.
* **Ordnen:** gewertet nur, wenn die Anzahl der gedruckten Zahlen der Anzahl der Lücken entspricht.

### Speicherplatz

Jedes abgeschlossene Blatt speichert sein komplettes HTML im `localStorage` (ca. 5 MB pro Origin, gemeinsam mit allen anderen Daten). Ist der Speicher voll, zeigt „Fertig“ den neutralen Hinweis und das Blatt bleibt bearbeitbar. Ein Export bzw. Archiv wäre eine mögliche spätere Erweiterung.

---

## 📱 9. Offline-Betrieb (PWA & Service Worker)

* **`manifest.json`:** Ermöglicht das "Zum Home-Bildschirm hinzufügen" auf iPads und Tablets als vollwertige Standalone-App ohne Browser-URL-Leiste.
* **`sw.js` (Cache-Version: `CACHE_NAME`):**
  * Cached alle Core-Assets, Icons, Stylesheets und Arbeitsblätter.
  * Cache-First-Strategie mit Fallback auf Netzwerk.
  * Bei Updates wird der alte Cache beim Aktivieren automatisch aufgeräumt.

---

## 📁 10. Dateistruktur

```text
tabbi/
├── .gitignore                    # Ignoriert raw_assets, gitignore-Ordner & temporäre Skripte
├── AGENTS.md                     # System-Regeln & Eiserne Grundregel für KI-Agenten
├── README.md                     # Projektdokumentation (dieses Dokument)
├── index.html                    # Hauptübersicht & Kachel-Bibliothek mit Filtern
├── hilfe.html                    # Hilfe & Fragen (Bedienung, Lehrkraft-Funktionen, Aufgabentypen)
├── manifest.json                 # Web App Manifest für PWA-Installation
├── sw.js                         # Service Worker für Offline-Betrieb
├── assets/                       # Vektor- & Bildressourcen
│   ├── icon.svg                  # App-Icon
│   ├── schulheft-hintergrund.svg # Karo-Muster
│   ├── schreibtisch-hintergrund.jpg
│   └── figuren/                  # Freigestellte TABBI-Maskottchen (16, 32, 64, 128px)
├── css/
│   └── tabbi.css                 # Gesamtes Designsystem, Komponenten & Print-Styles
├── js/
│   ├── tabbi-core.js             # Kernlogik (Numpad, Lücken, Fokus-Modus, Storage)
│   ├── tabbi-gruppen.js          # Aufgabengruppen des Builders
│   ├── tabbi-historie.js         # Abgeschlossene Blätter
│   ├── tabbi-auswertung.js       # Lösungen & Auswertung (nur Lehrkraft)
│   ├── tabbi-lesekorpus.js       # Deutsch-Lesekorpus (Fibel-Wortschatz & Silben)
│   └── blaetter-katalog.js       # Katalog aller Blätter & Metadaten
├── blaetter/                     # Alle interaktiven Arbeitsblätter
│   ├── 001_zahlenhaeuser_und_freunde.html
│   ├── 001b_zahlenfreunde.html
│   ├── 002_zahlen_bis_5_finger_tuerme_wuerfel.html
│   ├── 003_punktebilder_und_fische.html
│   ├── 004_zaehlen_mit_strichlisten.html
│   ├── 005_zaehlen_einkreisen_buendeln.html
│   ├── 006_gleiche_mengen_anmalen.html
│   ├── 007_zahlen_bis_20_zehner_und_einer.html
│   ├── 008_nachbarzahlen_und_zahlenstrahl_20.html
│   ├── 009_zwergen_und_riesenaufgaben.html
│   ├── 010_zehneruebergang_und_zahlenmauern_20.html
│   ├── 011_click_und_mix.html    # Generator & Test-Ersteller
│   └── 012_leseblatt_silben_und_woerter.html # Leseblätter & Lese-Karten (Stufe 1–5)
└── gitignore/                    # Lokale Vorlagen & Rohdateien (nicht im Git-Repo)
```
