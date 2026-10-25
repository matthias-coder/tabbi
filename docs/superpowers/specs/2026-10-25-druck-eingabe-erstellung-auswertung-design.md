# TABBI – Druck, schwebende Eingabe, entschlackte Erstellung, Abschließen & Auswertung

Stand: 2026-10-25 · Status: Entwurf zur Freigabe

Dieses Dokument beschreibt fünf zusammenhängende Änderungen an TABBI. Grundlage sind die
Projektregeln in `AGENTS.md` – insbesondere die **Eiserne Grundregel** (keine kognitive Hilfe,
kein Feedback für das Kind). Alles hier muss sich daran messen lassen.

Markierungen: **[Entscheidung Nutzer]** = vom Projektinhaber so festgelegt.
**[Vorschlag]** = im Gespräch vorgeschlagen und bestätigt. **[Autor-Call]** = vom Autor nach dem
Review festgelegt, vom Nutzer noch zu prüfen. **[Builder-Call]** = Vorschlag des Autors, darf der
Builder begründet ändern.

---

## 1. Warum

- Der **Druck** wirkt wie ein 1:1-Abzug des Bildschirms: große Elemente, Kästen, viel Leerraum,
  kein Heftrand. Ausdrucke werden aber nur abgeheftet und korrigiert – es soll mehr auf eine Seite.
- Am **Desktop** wirkt die bildschirmbreite Ziffernleiste unten fremd.
- Die **Blatt-Erstellung** (`blaetter/011_click_und_mix.html`) ist überfrachtet: 6 Schritte,
  13 gleichrangige Aufgabentyp-Chips, Einzelzahlen-Wahl, Seiten-/Anzahl-/Präfix-Optionen.
- Es fehlt eine Möglichkeit, **zu überprüfen, ob das Kind die Aufgaben bewältigt** – ohne dass es
  selbst in der App Rückmeldung bekommt.
- Das Repo ist **öffentlich**; der Vorname des Kindes steht in 17 Dateien.

## 2. Ziele / Nicht-Ziele / Anti-Ziele

**Ziele**
1. Kompaktes, eigenständiges Drucklayout mit Heftrand.
2. Schwebende Eingabeleiste am Desktop (Ziffern, vorbereitet für Buchstaben).
3. Erstellung über 5 fachdidaktische Übergruppen statt 13 Einzeltypen.
4. Abschließen eines Blatts → gesperrt, nicht löschbar, in einer Historie einsehbar; Auswertung
   mit sichtbaren Fehlern nur für die Lehrkraft.
5. Kindername vollständig aus dem aktuellen Stand entfernen.

**Nicht-Ziele**
- Deutsch-Aufgabentypen (Silbenbögen, Silben einfärben, Anlaute …) – eigenes späteres Vorhaben,
  sobald echte Blätter vorliegen. **[Entscheidung Nutzer]**
- Backup/Export/Sync der Historie. Gespeichert wird nur auf dem Gerät. **[Entscheidung Nutzer]**
- Bereinigen der Git-Historie vom Namen. **[Entscheidung Nutzer]**
- Neue Mathe-Aufgabentypen (z. B. `<` `>` `=`) – die Gruppenstruktur muss sie nur aufnehmen können.

**Anti-Ziele (wäre ein Fehlschlag, auch wenn es „funktioniert“)**
- Das Kind sieht oder hört in der App irgendein Richtig/Falsch-Signal – auch nicht indirekt
  (Farbe der Kachel, Zähler, Druckvorschau mit Korrektur, Lösungen im DOM sichtbar).
- Der Abschließen-Vorgang verrät etwas („Du hast 3 Fehler“, Animation, Sterne).
- Der Kindername taucht wieder in einer Datei oder Commit-Message auf.
- Die Erstellung wird „einfacher“, aber eine Lehrkraft findet ihren Aufgabentyp nicht mehr.

## 3. Rahmenbedingungen

- Vanilla HTML/CSS/JS, kein Build-Step, GitHub Pages, PWA (`sw.js` – Cache-Version bei
  Asset-Änderungen hochzählen).
- Speicherung nur `localStorage` (mit `try/catch`), wie bisher.
- Zielgeräte: Tablet (Hauptgerät, Touch) und Desktop-Browser (Lehrkraft/Eltern).
- Lehrkraft-Sperre existiert: `TabbiLehrerGate` (`js/tabbi-core.js` ~Z. 2932) – 3 Sek. halten +
  Einmaleins-Aufgabe, Freigabe 10 Min. in `sessionStorage`. Wird wiederverwendet.
- Alle Regeln aus `AGENTS.md` gelten unverändert (keine `<input>`, voller Zahlenraum, Füller-Blau
  `#0000CD`, Fokus-Gelb `#fffacd`, Zwei-Tipp-Bestätigungen statt `confirm()` usw.).

---

## 4. Teil A – Drucklayout „wie ein Schul-Arbeitsblatt“ **[Entscheidung Nutzer: Variante A]**

Referenz-Mockup: `.superpowers/brainstorm/…/content/druck-und-ziffernblock.html` (lokal, nicht
im Repo), Variante A.

**Prinzip:** Druck ist ein eigenes Layout, kein verkleinerter Bildschirm.

- `@page`: A4 hochkant. Rand links ca. **25 mm** (Heftrand/Locher), oben/rechts/unten ca. 10 mm.
  **[Vorschlag; genaue mm Builder-Call]**
- **Kopfzeile** je Blatt: links `Name: ________` (leere Linie oder lokal hinterlegter Name, s. Teil E),
  Mitte Blatt-Titel fett, rechts `Datum: TT.MM.JJJJ`; darunter eine dünne durchgehende Linie.
- **Aufgabenblöcke** nummeriert (schwarzer Kreis mit Ziffer) + kurze Überschrift/Arbeitsanweisung.
  Die Überschrift ist die bestehende Blocküberschrift bzw. der Typname; keine neuen Anweisungen
  erfinden, die über das Papierblatt hinausgehen. **[Builder-Call]**
- Keine Kästen, Schatten, Hintergründe, Karo-Muster, abgerundeten Karten. Dünne schwarze Linien
  (ca. 0,5–1 px). Alle Bausteine deutlich verkleinert (Zahlenhaus-Zelle Richtwert ~5–6 mm,
  Plättchen ~4–5 mm), Elemente fließen dicht nebeneinander (`flex-wrap`), mehrere Aufgabentypen
  auf einer Seite.
- Füller-Blau, rote/blaue Plättchen bleiben farbig (`print-color-adjust: exact`).
- Ein Aufgabenblock wird nicht mitten durchgeschnitten (`break-inside: avoid` je Baustein/Block;
  sehr große Blöcke dürfen zwischen Bausteinen umbrechen). **[Builder-Call]**
- Ausgeblendet bleibt alles UI (`.print-hide`), Fokus-Markierung neutral.
- Gilt für **alle** Blätter: Katalog-Blätter `001–010`, Click & Mix / erstellte Blätter,
  Auswertungsansicht. **[Builder-Call]**
- Ersetzt den bestehenden Block „11. Druck- & PDF-Workflow“ in `css/tabbi.css` (~Z. 3076 ff.).

**Normaler „🖨️ PDF / Drucken“-Knopf druckt immer ohne Korrektur** – auch bei abgeschlossenen
Blättern, weil schon die PDF-Vorschau dem Kind sonst Feedback gäbe. Druck *mit* Korrektur gibt es
nur in der Auswertung (Teil D). **[Entscheidung Nutzer: Korrektur auf Papier ist erlaubt; Umsetzung Builder-Call]**

## 5. Teil B – Schwebende Eingabeleiste am Desktop **[Entscheidung Nutzer: Variante A]**

- Ab Viewport-Breite ca. **1024 px** und feinem Zeiger (`@media (min-width:1024px) and (pointer:fine)`
  – genaue Bedingung **[Builder-Call]**) wird der Ziffernblock zur schwebenden Leiste:
  unten mittig, nur so breit wie die Tasten, abgerundet (~14 px), Schatten, ~12–16 px Abstand
  zum unteren Rand, leicht deckender weißer Hintergrund.
- Tablet/schmal/Touch: unverändert (volle Breite, `bottom:0`, Safe-Area, Tasten ≥ 56 px).
- Inhalt unverändert: voller Zahlenraum (0–10 bzw. 0–20) + ⌫, Tastengröße am Desktop darf auf
  ~44–48 px sinken (Maus). Bei 0–20 zwei Reihen. **[Builder-Call]**
- Blatt erhält unten so viel Abstand, dass die Leiste keine Aufgabe verdeckt.
- **Vorbereitung Buchstaben-Tastatur:** Dieselbe schwebende Hülle muss eine Buchstaben-Tastatur
  aufnehmen können: A–Z + Ä Ö Ü in **ABC-Reihenfolge** (nicht QWERTZ), drei Reihen, + ⌫.
  **[Vorschlag]** Groß-/Kleinschreibung bleibt offen (Deutsch-Vorhaben). Es reicht, dass die
  Hülle generisch ist; eine fertige Buchstaben-Tastatur ist nicht Teil dieses Projekts.

## 6. Teil C – Entschlackte Erstellung **[Vorschlag, vom Nutzer bestätigt]**

### 6.1 Übergruppen (an KMK-Bildungsstandards „Zahlen und Operationen“ und Schulbuchkapiteln Kl. 1)

| Übergruppe | Aufgabentypen (`data-mix-typ`) |
|---|---|
| 👀 Mengen erfassen & zählen | `punkte`, `finger`, `wuerfel_tuerme`, `aquarium`, `strichlisten`, `buendeln`, `seifenblasen` (Bild ↔ Zahl) |
| 🏠 Zahlen zerlegen | `zahlenhaus`, `zahlenfreunde` |
| ↔️ Zahlen ordnen & vergleichen | `nachbarn` (später z. B. Vergleichen) |
| ➕ Plus & Minus rechnen | `rechnen`, `zwerg_riese`, `zahlenmauern` |
| 🔟 Zehner & Einer | Katalog-Blatt 007; in der Erstellung erst sichtbar, sobald ein passender Mix-Typ existiert |

Alle 13 heutigen Mix-Typen liegen in den Gruppen 1–4; `buendeln` bleibt in Gruppe 1. Gruppe 5
erscheint in der Erstellung erst mit einem eigenen Typ (keine leere Kachel), in der Bibliothek
sofort (Blatt 007). **[Autor-Call]**

Zahlenraum: Unterstützt ein gewählter Typ einen Zahlenraum nicht (heute z. B. `zahlenmauern`,
`zwerg_riese` nur bis 20), wird das der Lehrkraft am Typ angezeigt bzw. der Zahlenraum passend
angeboten. Das ist Lehrkraft-Konfiguration und berührt die Grundregel nicht (die gilt für die
Eingaben des Kindes). **[Autor-Call; Details Builder-Call]**

Die Gruppen sind **datengetrieben** (eine Konfigurationsliste), damit neue Typen nur eingetragen
werden. Der Katalog (`js/blaetter-katalog.js`, heute eigene 4 Kategorien `aufgabentyp`) wird auf
dieselben 5 Gruppen umgestellt, damit Bibliothek und Erstellung gleich sortiert sind. **[Builder-Call]**

### 6.2 Neuer Ablauf (Lehrkraft-Sicht)

1. **Übergruppe** wählen (5 große Kacheln).
2. **Aufgabentyp(en)** der Gruppe wählen – kleine Kacheln mit Mini-Vorschaubild, Mehrfachwahl
   innerhalb der Gruppe erlaubt. **[Builder-Call: gruppenübergreifendes Mischen nur über „Mehr Optionen“]**
3. **Zahlenraum**: bis 5 / bis 10 / bis 20 (einfache Wahl).
4. **Erstellen** – mit sinnvollen Voreinstellungen ergibt sich nach 2–3 Tipps ein brauchbares Blatt.

**„Mehr Optionen“** (eingeklappt): Einzelzahlen-Auswahl, Anzahl der Aufgaben, Kennzeichnung
(Übungsblatt/Wochenplan/Lerncheck), gruppenübergreifendes Mischen.
„Aufgaben pro DIN-A4-Seite“ und „Seitenanzahl“ entfallen als Bildschirm-Begriffe; stattdessen
„Anzahl Aufgaben“, da der Druck jetzt selbst kompakt umbricht. **[Builder-Call]**

Fach-Wahl (Mathe/Deutsch) bleibt; Deutsch bleibt „vorbereitet“.

## 7. Teil D – Abschließen, Historie, Auswertung

### 7.1 Abschließen (Kind-Sicht) **[Entscheidung Nutzer: Kind/Assistentin schließt ab]**

- Es gibt bereits einen Zwei-Tipp-„Fertig“-Knopf (`btn-blatt-fertig-frage`, `istAbgeschlossen`,
  `js/tabbi-core.js` ~Z. 2035–2056). Er setzt heute nur ein Flag `abgeschlossen`, das beim
  Weiterbearbeiten wieder zurückgesetzt wird (~Z. 1625). **Dieser Knopf wird zum neuen
  Abschließen umgebaut** – das rücksetzbare Flag entfällt. **[Autor-Call]**
- Bestehende Blätter mit altem Flag `abgeschlossen: true` werden **nicht** automatisch in die
  Historie migriert (ohne Schnappschuss/Lösungen); sie gelten als normale, bearbeitbare Blätter.
  **[Autor-Call]**
- Im Blatt Knopf **„✅ Fertig“** (Begriff Builder-Call), Zwei-Tipp-Bestätigung wie „Löschen“.
- Nach Bestätigung: kein Feedback jeglicher Art. Das Blatt wird **gesperrt**: keine Eingaben,
  Ziffernblock, „Leeren“, „Löschen“, „Fertig“ verschwinden. Neutraler Hinweis „Abgeschlossen am …“.
- Abgeschlossene Blätter sind in der UI **nicht löschbar** – auch nicht durch die Lehrkraft.
  **[Builder-Call; Nutzer: „soll sich nicht mehr löschen lassen“]**

### 7.2 Datenmodell **[Builder-Call]**

Abschließen erzeugt einen **eingefrorenen Historien-Eintrag** (Schnappschuss):
`{ id, quelleId, titel, fach, gruppe(n), abgeschlossenAm, html, eingaben, loesungen }`
in einem neuen Schlüssel (z. B. `tabbi_historie_v1`).

- **Erstellte Blätter** (Testbibliothek): wandern in die Historie (verschwinden aus „Erstellt“).
- **Katalog-Blätter** (`001–010`, zufällig gemischt mit `__layout`): Schnappschuss in die Historie,
  das Katalog-Blatt selbst wird danach frisch (neues Layout, leere Eingaben) – es ist eine Vorlage.
- **„Nochmal neu“** an einem Historien-Eintrag erzeugt ein frisches Exemplar mit denselben
  Einstellungen; der Historien-Eintrag bleibt unverändert.
- **Anzeige eines Historien-Eintrags:** über dieselbe Blatt-Seite in einem **gesperrten Modus**
  (z. B. `?historie=<id>`), der aus dem Schnappschuss rendert (erstellte Blätter: gespeichertes
  `html`; Katalog-Blätter: `blattId` + gespeichertes Layout) und die Eingaben einsetzt. Der Core
  bekommt dafür einen „eingefroren“-Zustand (keine Eingabe, kein Speichern). Genaue Technik
  **[Builder-Call]**.
- **Speicher sparsam:** Wo möglich nur Layout/Parameter + Eingaben + Lösungen speichern statt
  vollständigem HTML. Schlägt das Speichern beim Abschließen fehl (Quota), bleibt das Blatt offen
  und unverändert, mit neutralem Hinweis „Speichern nicht möglich – bitte Lehrkraft holen“ (kein
  Bezug auf Inhalt/Richtigkeit). **[Autor-Call]**

### 7.3 Lösungen

- Generatoren kennen die Lösung je Lücke beim Erzeugen. Sie werden als Map `data-id → Sollwert`
  **im Datensatz** gespeichert (Testbibliothek bzw. `__layout`), **nicht** als Attribut im Blatt-DOM.
- Auswertung gilt für **alle** Blätter, auch Katalog `001–010`. Deren Bausteine werden bereits
  zentral im Core aus deklarativen Attributen gerendert (`rendereDeklarativeBausteine`,
  ~Z. 631 ff.: `data-dach`, `data-etagen`, `data-zahlen` …). Die Lösung wird **in denselben
  Render-Funktionen** berechnet, die auch Click & Mix nutzt – keine eigenen Parser je Blatt.
  **[Autor-Call]**
- Mehrdeutige Bausteine: nur Eindeutiges wird bewertet. Beispiele: Plättchen anmalen → Anzahl
  farbiger Plättchen bzw. Anzahl je Farbe, wo die Aufgabe das festlegt; Zahlenhaus-Zeile mit
  Vorgabe → eindeutig. Was nicht eindeutig prüfbar ist, wird als „nicht ausgewertet“ geführt.
  Die konkrete Regel je der 13 Typen legt der Builder fest und dokumentiert sie. **[Builder-Call]**
- Bereits existierende, ohne Lösungen erstellte Blätter: Auswertung zeigt „für dieses Blatt keine
  Lösungen hinterlegt“; Abschließen/Historie funktionieren trotzdem. **[Builder-Call]**

### 7.4 Historie (Bibliothek)

- Neuer Bereich **„📁 Abgeschlossen“** in `index.html`, neueste zuerst, mit Datum.
- Für das Kind sichtbar und öffenbar: zeigt das Blatt **nur mit seinen Eingaben**, ohne Korrektur,
  ohne Zähler, ohne Farbcode an der Kachel. Drucken dort = ohne Korrektur. **[Vorschlag]**

### 7.5 Auswertung (nur hinter `TabbiLehrerGate`) **[Entscheidung Nutzer: hinter der Sperre; Fehler ersichtlich]**

- Zugang über einen Lehrkraft-Knopf am Historien-Eintrag (3 Sek. halten + Einmaleins).
- Ansicht: das ausgefüllte Blatt unverändert; **falsche Einträge rot markiert, richtige Lösung
  klein daneben**; leere Lücken als „nicht bearbeitet“ (anders markiert, kein Fehler).
- Kopf: Zusammenfassung „x von y falsch · z nicht bearbeitet“, aufgeteilt nach Übergruppe.
- **„🖨️ Mit Korrektur drucken“** – nutzt das Drucklayout aus Teil A inkl. Markierungen.
- Beim Verlassen/Ablauf der Freigabe verschwindet die Auswertung wieder; sie bleibt nie offen
  auf dem Gerät des Kindes stehen. **[Builder-Call]**
- Kind-Ansicht und Auswertung sind **vollständig getrennt**: Eine aktive 10-Minuten-Freigabe
  ändert nichts an Aussehen oder Druck der normalen Historien-Ansicht. Korrektur erscheint nur,
  wenn die Auswertung ausdrücklich geöffnet wird. **[Autor-Call, Sicherheitsentscheidung]**

## 8. Teil E – Kindername entfernen **[Entscheidung Nutzer]**

- Alle Vorkommen im aktuellen Stand entfernen: `hilfe.html` (10), `AGENTS.md`, `README.md`,
  `manifest.json`, `index.html`, alle `blaetter/*.html`. Gemeint ist der Vorname, der vor der
  Bereinigung in `AGENTS.md` §1 („für einen Erstklässler (…)“) steht – bewusst hier nicht
  ausgeschrieben. Auch Varianten (Genitiv, Klein-/Großschreibung) erfassen.
- Texte neutral: „das Kind“, „ein Erstklässler“.
- Druckkopf: `Name: ________`. Optional kann die Lehrkraft hinter der Sperre einen Namen
  hinterlegen, der nur in `localStorage` gespeichert und im Druckkopf eingesetzt wird.
  **[Vorschlag]**
- Git-Historie bleibt unverändert.

## 9. Was dem Builder überlassen ist

Reihenfolge der Umsetzung, genaue Maße/Breakpoints, Datei-Aufteilung (ggf. neues
`js/tabbi-auswertung.js`), Migration bestehender `localStorage`-Daten, Bewertungsregel je
Aufgabentyp (dokumentiert), Wortwahl der Knöpfe, Mini-Vorschaubilder der Typ-Kacheln,
Anpassung von `hilfe.html` an die neuen Abläufe.

## 10. Abnahme

- Jede Ansicht, die das Kind ohne Sperre erreicht, wurde gegen die Grundregel geprüft
  (kein Richtig/Falsch, keine Lösungen im DOM, keine Korrektur in Druckvorschau).
- Ein gemischtes Blatt (z. B. 12 Zahlenhäuser + 8 Zahlenfreunde + 9 Rechenaufgaben) passt beim
  Druck auf eine A4-Seite mit Heftrand.
- `grep -ri "<Kindername>"` im Arbeitsstand liefert keine Treffer.
