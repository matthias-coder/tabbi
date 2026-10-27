/* ==========================================================================
   TABBI: Tipp-ArbeitsBlätter-Bibliothek – Katalog & Auto-Discovery (js/blaetter-katalog.js)
   ==========================================================================
   Neue 2-stufige Kategorisierung:
   1. Zuerst Aufgabentyp wählen (`aufgabentyp`:
      - 'zahlenhaeuser'  -> 🏠 Zahlenhäuser & Zahlenfreunde
      - 'finger_wuerfel' -> ✋🎲 Finger, Türme & Würfel
      - 'zaehlen_mengen' -> 🐟🐚 Zählen, Strichlisten & Bündeln
      - 'rechnen_reihen' -> ➕🧱 Rechnen, Zahlenreihen & Mauern)
   2. Im Aufgabentyp den Zahlenbereich wählen (`zahlenbereich`: '1-5', '5-10', '1-10', '10-20', 'alle')
   3. In JEDEM Aufgabentyp gibt es ein eigenes Click & Mix (selbe Aufgabe, freie Zahlenwahl)!
   ========================================================================== */

window.TABBI_KATALOG = [
  // ========================================================================
  // AUFGABENTYP 1: 🏠 ZAHLENHÄUSER (Reine Zahlenhäuser)
  // ========================================================================
  {
    id: 'mix_zahlenhaeuser',
    blattId: '011_click_und_mix',
    istClickMix: true,
    aufgabentyp: 'zahlenhaeuser',
    gruppe: 'zerlegen',
    zahlenbereich: 'alle',
    zahlenFilter: null,
    url: 'blaetter/011_click_und_mix.html?typ=zahlenhaus&bereich=1-10',
    icon: '🎲🏠',
    titel: 'Click & Mix: Zahlenhäuser',
    beschreibung: 'Gleiche Aufgabe (Zahlenhäuser), aber mehrere Einzelzahlen (z. B. 2, 5 und 8) oder Zahlenbereich frei wählbar – zufällig gemischt!',
    tags: ['🎲 Click & Mix', 'Einzelzahlen-Mehrfachwahl', 'Nicht aufsteigend']
  },
  {
    id: '001_zahlenhaeuser_1_5',
    blattId: '001_zahlenhaeuser_und_freunde',
    aufgabentyp: 'zahlenhaeuser',
    gruppe: 'zerlegen',
    zahlenbereich: '1-5',
    zahlenFilter: '1-5',
    url: 'blaetter/001_zahlenhaeuser_und_freunde.html?bereich=1-5',
    icon: '🏠',
    titel: 'Zahlenhäuser (Zahlen 1 bis 5)',
    beschreibung: 'Die Zahlenhäuser für 1, 2, 3, 4 und 5 in gemischter Reihenfolge (auch mehrere Einzelzahlen frei wählbar!).',
    tags: ['Zahlenhäuser', 'Zahlen 1–5']
  },
  {
    id: '001_zahlenhaeuser_5_10',
    blattId: '001_zahlenhaeuser_und_freunde',
    aufgabentyp: 'zahlenhaeuser',
    gruppe: 'zerlegen',
    zahlenbereich: '5-10',
    zahlenFilter: '5-10',
    url: 'blaetter/001_zahlenhaeuser_und_freunde.html?bereich=5-10',
    icon: '🏘️',
    titel: 'Zahlenhäuser (Zahlen 5 bis 10)',
    beschreibung: 'Die großen Zahlenhäuser für 5, 6, 7, 8, 9 und 10 in gemischter Reihenfolge.',
    tags: ['Zahlenhäuser', 'Zahlen 5–10']
  },
  {
    id: '001_komplett_1_10',
    blattId: '001_zahlenhaeuser_und_freunde',
    aufgabentyp: 'zahlenhaeuser',
    gruppe: 'zerlegen',
    zahlenbereich: '1-10',
    zahlenFilter: null,
    url: 'blaetter/001_zahlenhaeuser_und_freunde.html?bereich=1-10',
    icon: '📚',
    titel: 'Zahlenhäuser (Alle 1 bis 10)',
    beschreibung: 'Alle Zahlenhäuser von 1 bis 10 (inkl. Mehrfachwahl einzelner Dachzahlen über ⚙️ Zahlenbereich / Mix).',
    tags: ['Komplettblatt', 'Zahlen 1–10']
  },

  // ========================================================================
  // AUFGABENTYP 2: 🔵🔴 ZAHLENFREUNDE (Zahlenhaus + 2×5 Zehnerstreifen)
  // ========================================================================
  {
    id: 'mix_zahlenfreunde',
    blattId: '011_click_und_mix',
    istClickMix: true,
    aufgabentyp: 'zahlenfreunde',
    gruppe: 'zerlegen',
    zahlenbereich: 'alle',
    zahlenFilter: null,
    url: 'blaetter/011_click_und_mix.html?typ=zahlenfreunde&bereich=1-5',
    icon: '🎲🔵',
    titel: 'Click & Mix: Zahlenfreunde',
    beschreibung: 'Gleiche Aufgabe (Zahlenhaus + Zehnerstreifen 2×5), aber mehrere Einzelzahlen oder Zahlenbereich frei wählbar!',
    tags: ['🎲 Click & Mix', 'Einzelzahlen-Mehrfachwahl', 'Plättchen 2×5']
  },
  {
    id: '001b_zahlenfreunde_1_5',
    blattId: '001b_zahlenfreunde',
    aufgabentyp: 'zahlenfreunde',
    gruppe: 'zerlegen',
    zahlenbereich: '1-5',
    zahlenFilter: '1-5',
    url: 'blaetter/001b_zahlenfreunde.html?bereich=1-5',
    icon: '🔵🔴',
    titel: 'Zahlenfreunde (Zahlen 1 bis 5)',
    beschreibung: 'Zahlenhäuser mit Zehnerstreifen zum Antippen (Blau & Rot) für die Zahlen 1 bis 5 (zufällig gemischt).',
    tags: ['Zahlenfreunde', 'Zahlen 1–5', 'Plättchen 2×5']
  },
  {
    id: '001b_zahlenfreunde_5_10',
    blattId: '001b_zahlenfreunde',
    aufgabentyp: 'zahlenfreunde',
    gruppe: 'zerlegen',
    zahlenbereich: '5-10',
    zahlenFilter: '5-10',
    url: 'blaetter/001b_zahlenfreunde.html?bereich=5-10',
    icon: '🔵🔴',
    titel: 'Zahlenfreunde (Zahlen 5 bis 10)',
    beschreibung: 'Zahlenhäuser mit Zehnerstreifen zum Antippen (Blau & Rot) für die Zahlen 5 bis 10 (zufällig gemischt).',
    tags: ['Zahlenfreunde', 'Zahlen 5–10', 'Plättchen 2×5']
  },
  {
    id: '001b_zahlenfreunde_1_10',
    blattId: '001b_zahlenfreunde',
    aufgabentyp: 'zahlenfreunde',
    gruppe: 'zerlegen',
    zahlenbereich: '1-10',
    zahlenFilter: null,
    url: 'blaetter/001b_zahlenfreunde.html?bereich=1-10',
    icon: '🔵🔴',
    titel: 'Zahlenfreunde (Alle 1 bis 10)',
    beschreibung: 'Alle Zahlenfreunde-Häuser mit Zehnerstreifen von 1 bis 10 (inkl. Mehrfachwahl einzelner Zahlen).',
    tags: ['Komplettblatt', 'Zahlen 1–10', 'Plättchen 2×5']
  },

  // ========================================================================
  // AUFGABENTYP 2: ✋🎲 FINGERBILDER, STECKWÜRFEL-TÜRME & WÜRFEL
  // ========================================================================
  {
    id: 'mix_finger_wuerfel',
    blattId: '011_click_und_mix',
    istClickMix: true,
    aufgabentyp: 'finger_wuerfel',
    gruppe: 'mengen',
    zahlenbereich: 'alle',
    zahlenFilter: null,
    url: 'blaetter/011_click_und_mix.html?typ=finger,wuerfel_tuerme&bereich=1-5',
    icon: '🎲✋',
    titel: 'Click & Mix: Finger, Türme & Würfel',
    beschreibung: 'Gleiche Aufgabe (Fingerbilder L/R, Steckwürfel-Türme & Würfelaugen), aber Zahlenbereich (1–5, 5–10, 1–10) frei wählbar!',
    tags: ['🎲 Click & Mix', 'Linke & Rechte Hände', 'Zahlen frei wählbar']
  },
  {
    id: '002_zahlen_bis_5',
    blattId: '002_zahlen_bis_5_finger_tuerme_wuerfel',
    aufgabentyp: 'finger_wuerfel',
    gruppe: 'mengen',
    zahlenbereich: '1-5',
    zahlenFilter: null,
    url: 'blaetter/002_zahlen_bis_5_finger_tuerme_wuerfel.html',
    icon: '✋🎲',
    titel: 'Finger, Türme & Würfel (Zahlen 1 bis 5)',
    beschreibung: 'Zahlenreihe 4 & 5 tippen, Fingerbilder erkennen, Steckwürfel-Türme und Würfelbilder zählen (mit eigenem Zahlen-Mix oben im Blatt!).',
    tags: ['Matheheldin S. 13', 'Zahlen 1–5', 'Finger & Würfel']
  },
  {
    id: '006_gleiche_mengen_anmalen',
    blattId: '006_gleiche_mengen_anmalen',
    aufgabentyp: 'finger_wuerfel',
    gruppe: 'mengen',
    zahlenbereich: '1-10',
    zahlenFilter: null,
    url: 'blaetter/006_gleiche_mengen_anmalen.html',
    icon: '🎨🫧',
    titel: 'Gleiche Mengen anmalen (Zahl, Finger, Würfel)',
    beschreibung: 'Welche Seifenblasen (Zahl, Fingerbild, Würfelbild) zeigen gleich viel? Male sie mit derselben Farbe an (Zahlen 1–5, 5–10, 1–10 wählbar)!',
    tags: ['Unterwasser-Heft', 'Zahlen 1–10', 'Farben']
  },

  // ========================================================================
  // AUFGABENTYP 3: 🐟🐚 ZÄHLEN, PUNKTEBILDER, STRICHLISTEN & BÜNDELN
  // ========================================================================
  {
    id: 'mix_punkte_zaehlen',
    blattId: '011_click_und_mix',
    istClickMix: true,
    aufgabentyp: 'zaehlen_mengen',
    gruppe: 'mengen',
    zahlenbereich: 'alle',
    zahlenFilter: null,
    url: 'blaetter/011_click_und_mix.html?typ=punkte&bereich=1-10',
    icon: '🎲🫧',
    titel: 'Click & Mix: Punktebilder & Zwanzigerfeld',
    beschreibung: 'Gleiche Aufgabe (Zehnerstreifen-Punktebilder bzw. Zwanzigerfeld Z|E), aber Zahlenbereich (1–5, 5–10, 1–10, 10–20) frei wählbar!',
    tags: ['🎲 Click & Mix', 'Zehnerstreifen & 20er-Feld', 'Zahlen frei wählbar']
  },
  {
    id: '003_punktebilder_fische',
    blattId: '003_punktebilder_und_fische',
    aufgabentyp: 'zaehlen_mengen',
    gruppe: 'mengen',
    zahlenbereich: '1-10',
    zahlenFilter: null,
    url: 'blaetter/003_punktebilder_und_fische.html',
    icon: '🐟🫧',
    titel: 'Fische zählen & Punktebilder (0 bis 10)',
    beschreibung: 'Fische im Aquarium zählen (mit Antipp-Hilfe) und Zehnerstreifen-Punktebilder ablesen (im Blatt umschaltbar auf 1–5, 5–10, 1–10).',
    tags: ['Unterwasser-Heft', 'Zahlen 0–10', 'Zählen']
  },
  {
    id: '004_strichlisten',
    blattId: '004_zaehlen_mit_strichlisten',
    aufgabentyp: 'zaehlen_mengen',
    gruppe: 'mengen',
    zahlenbereich: '5-10',
    zahlenFilter: null,
    url: 'blaetter/004_zaehlen_mit_strichlisten.html',
    icon: '🦀📊',
    titel: 'Zählen mit Strichlisten (Unterwasser)',
    beschreibung: 'Meerestiere im Suchbild antippen, Strichlisten (mit 5er-Bündeln) machen und Anzahl eintragen (jederzeit mit neuen Tier-Anzahlen würfelbar!).',
    tags: ['Unterwasser-Heft', 'Strichlisten', 'Zahlen 1–10']
  },
  {
    id: '005_einkreisen_buendeln',
    blattId: '005_zaehlen_einkreisen_buendeln',
    aufgabentyp: 'zaehlen_mengen',
    gruppe: 'mengen',
    zahlenbereich: '1-10',
    zahlenFilter: null,
    url: 'blaetter/005_zaehlen_einkreisen_buendeln.html',
    icon: '🐚⭕',
    titel: 'Zählen & Mengen bündeln',
    beschreibung: 'Immer so viele Meerestiere wie die Zahl vorne angibt mit bunten Farben zu Bündeln zusammenfassen (Zahlenbereich oben frei wählbar!).',
    tags: ['Unterwasser-Heft', 'Einkreisen & Bündeln', 'Zahlen 1–10']
  },
  {
    id: '007_zehner_und_einer_20',
    blattId: '007_zahlen_bis_20_zehner_und_einer',
    aufgabentyp: 'zaehlen_mengen',
    gruppe: 'zehner',
    zahlenbereich: '10-20',
    zahlenFilter: null,
    url: 'blaetter/007_zahlen_bis_20_zehner_und_einer.html',
    icon: '🔟🔵',
    titel: 'Zehner & Einer am Zwanzigerfeld (11 bis 20)',
    beschreibung: 'Punkte im Zwanzigerfeld ablesen, in die Z/E-Stellenwerttafel eintragen (10 + Einer) und selbst legen.',
    tags: ['Zahlen bis 20', 'Zwanzigerfeld', 'Zehner & Einer']
  },

  // ========================================================================
  // AUFGABENTYP 4: ➕🧱 RECHNEN, ZAHLENREIHEN & ZAHLENMAUERN
  // ========================================================================
  {
    id: 'mix_rechnen_reihen',
    blattId: '011_click_und_mix',
    istClickMix: true,
    aufgabentyp: 'rechnen_reihen',
    gruppe: 'rechnen',
    zahlenbereich: 'alle',
    zahlenFilter: null,
    url: 'blaetter/011_click_und_mix.html?typ=nachbarn,rechnen&bereich=10-20',
    icon: '🎲➕',
    titel: 'Click & Mix: Rechnen, Nachbarzahlen & Mauern',
    beschreibung: 'Gleiche Aufgabe (Plus/Minus, Nachbarzahlen & Zahlenmauern), aber Zahlenbereich (1–5, 5–10, 1–10, 10–20) frei wählbar!',
    tags: ['🎲 Click & Mix', 'Plus, Minus & Mauern', 'Zahlen frei wählbar']
  },
  {
    id: '008_nachbarzahlen_20',
    blattId: '008_nachbarzahlen_und_zahlenstrahl_20',
    aufgabentyp: 'rechnen_reihen',
    gruppe: 'ordnen',
    zahlenbereich: '10-20',
    zahlenFilter: null,
    url: 'blaetter/008_nachbarzahlen_und_zahlenstrahl_20.html',
    icon: '🔢↔️',
    titel: 'Zahlenreihe & Nachbarzahlen (bis 20)',
    beschreibung: 'Zahlenreihen vorwärts und rückwärts ausfüllen, Vorgänger & Nachfolger bestimmen und Zahlen ordnen (Zahlenbereich oben umschaltbar!).',
    tags: ['Zahlen bis 20', 'Nachbarzahlen', 'Zahlenreihe']
  },
  {
    id: '009_zwergen_riesen_20',
    blattId: '009_zwergen_und_riesenaufgaben',
    aufgabentyp: 'rechnen_reihen',
    gruppe: 'rechnen',
    zahlenbereich: '10-20',
    zahlenFilter: null,
    url: 'blaetter/009_zwergen_und_riesenaufgaben.html',
    icon: '🧙‍♂️🦣',
    titel: 'Zwergen- & Riesenaufgaben + Verdoppeln (bis 20)',
    beschreibung: 'Die kleine Aufgabe hilft bei der großen Aufgabe (Plus & Minus ohne Zehnerübergang) sowie Verdoppeln & Halbieren.',
    tags: ['Zahlen bis 20', 'Zwerg & Riese', 'Verdoppeln']
  },
  {
    id: '010_zehneruebergang_mauern_20',
    blattId: '010_zehneruebergang_und_zahlenmauern_20',
    aufgabentyp: 'rechnen_reihen',
    gruppe: 'rechnen',
    zahlenbereich: '10-20',
    zahlenFilter: null,
    url: 'blaetter/010_zehneruebergang_und_zahlenmauern_20.html',
    icon: '🧱🔟',
    titel: 'Rechnen über die 10 & Zahlenmauern (bis 20)',
    beschreibung: 'Schrittweise über die 10 rechnen („Erst bis zur 10, dann weiter“) mit Zwanzigerfeld sowie Zahlenmauern.',
    tags: ['Zahlen bis 20', 'Zehnerübergang', 'Zahlenmauern']
  }
,

  // ========================================================================
  // FACH DEUTSCH: 📖 LESEN & SILBEN (Klasse 1 Grundschule Hessen)
  // ========================================================================
  {
    id: '012_leseblatt_generator',
    blattId: '012_leseblatt_silben_und_woerter',
    istClickMix: true,
    istLeseblatt: true,
    fach: 'deutsch',
    gruppe: 'lesen',
    url: 'blaetter/012_leseblatt_silben_und_woerter.html',
    icon: '⚙️📖',
    titel: 'Eigenes Leseblatt zusammenstellen',
    beschreibung: 'Freie Auswahl aller bekannten Buchstaben, Schwierigkeitsgrad (Silben / Wörter) und zweifarbige Silben (blau/rot).',
    tags: ['Leseblatt', 'Generator', 'Buchstaben frei wählbar']
  },
  {
    id: '012_leseblatt_stufe_1',
    blattId: '012_leseblatt_silben_und_woerter',
    istLeseblatt: true,
    fach: 'deutsch',
    gruppe: 'lesen',
    url: 'blaetter/012_leseblatt_silben_und_woerter.html?stufe=1',
    icon: '📖🌱',
    titel: 'Lesestufe 1: Erste Laute (M, L, S + Vokale)',
    beschreibung: 'Silben wie Ma, Mo, Sa, Se, el, am und erste Wörter (Mama, Lama, Limo, Lela, Mimi, Oma).',
    tags: ['Lesestufe 1', 'M L S', 'Vokale A E I O U']
  },
  {
    id: '012_leseblatt_stufe_2',
    blattId: '012_leseblatt_silben_und_woerter',
    istLeseblatt: true,
    fach: 'deutsch',
    gruppe: 'lesen',
    url: 'blaetter/012_leseblatt_silben_und_woerter.html?stufe=2',
    icon: '📖🌿',
    titel: 'Lesestufe 2: Konsonanten (+ R, N, T)',
    beschreibung: 'Silben mit R, N, T und Wörter wie Name, Nase, Tanne, Rabe, Tomate, Salat, Rente.',
    tags: ['Lesestufe 2', 'R N T', 'Wortlesen']
  },
  {
    id: '012_leseblatt_stufe_3',
    blattId: '012_leseblatt_silben_und_woerter',
    istLeseblatt: true,
    fach: 'deutsch',
    gruppe: 'lesen',
    url: 'blaetter/012_leseblatt_silben_und_woerter.html?stufe=3',
    icon: '📖🌳',
    titel: 'Lesestufe 3: Plosive & Weichlaute (+ D, B, P, W)',
    beschreibung: 'Silben und Wörter mit D, B, P, W wie Dose, Dame, Blume, Baum, Wal, Post, Butter.',
    tags: ['Lesestufe 3', 'D B P W', 'Wortschatz']
  },
  {
    id: '012_leseblatt_stufe_4',
    blattId: '012_leseblatt_silben_und_woerter',
    istLeseblatt: true,
    fach: 'deutsch',
    gruppe: 'lesen',
    url: 'blaetter/012_leseblatt_silben_und_woerter.html?stufe=4',
    icon: '📖⭐',
    titel: 'Lesestufe 4: Reibe- & Zischlaute (+ F, K, G, Z)',
    beschreibung: 'Silben und Wörter mit F, K, G, Z wie Fisch, Frosch, Kiste, Katze, Gans, Garten, Zelt.',
    tags: ['Lesestufe 4', 'F K G Z', 'Wortlesen']
  },
  {
    id: '012_leseblatt_stufe_5',
    blattId: '012_leseblatt_silben_und_woerter',
    istLeseblatt: true,
    fach: 'deutsch',
    gruppe: 'lesen',
    url: 'blaetter/012_leseblatt_silben_und_woerter.html?stufe=5',
    icon: '📖🏆',
    titel: 'Lesestufe 5: Zwielaute (+ EI, AU, EU, CH, SCH)',
    beschreibung: 'Wörter mit Zwielauten und Lautverbindungen wie Eimer, Auto, Eule, Buch, Milch, Schule, Stern.',
    tags: ['Lesestufe 5', 'Zwielaute', 'Schule']
  }
];