/* ==========================================================================
   TABBI: Tipp-ArbeitsBlätter-Bibliothek
   Zentrale Steuerungslogik & Baustein-Helfer (js/tabbi-core.js)
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE_PREFIX = 'tabbi_daten_';
  const ZWEI_TIPP_TIMEOUT_MS = 3000;
  // Der 2. Tipp zählt erst nach dieser Mindestpause – ein versehentlicher Doppeltipp löst also NICHTS aus
  const ZWEI_TIPP_MIN_PAUSE_MS = 700;

  /**
   * Hilfsfunktion: Erzeugt das SVG für ein Zahlenhaus-Spitzdach
   */
  function erstelleDachSVG() {
    return (
      '<svg class="dach-svg" viewBox="0 0 112 68" preserveAspectRatio="none" aria-hidden="true">' +
      '<polygon points="56,3 110.5,66.5 1.5,66.5"></polygon>' +
      '</svg>'
    );
  }

  /**
   * Hilfsfunktion: Erzeugt einen horizontalen Zehnerstreifen (2x5 Kreise mit Mittelstrich)
   * Alle 10 Kreise sind immer aktiv und identisch (Eiserne Grundregel!).
   */
  function erstelleZehnerstreifenHTML(prefixId) {
    let links = '';
    let rechts = '';
    for (let i = 1; i <= 5; i++) {
      links += `<button type="button" class="kreis" data-id="${prefixId}_k${i}" aria-label="Plättchen ${i}"></button>`;
    }
    for (let i = 6; i <= 10; i++) {
      rechts += `<button type="button" class="kreis" data-id="${prefixId}_k${i}" aria-label="Plättchen ${i}"></button>`;
    }
    return (
      `<div class="zehnerstreifen">` +
      `<div class="fuenfer-gruppe">${links}</div>` +
      `<div class="fuenfer-gruppe">${rechts}</div>` +
      `</div>`
    );
  }

  /**
   * Hilfsfunktion: Erzeugt ein statisches (vorgedrucktes) Zehnerstreifen-Punktebild
   * wie auf dem Blatt "Punktebilder verbinden"
   */
  function erstelleVorgabeZehnerstreifenHTML(anzahlGefuellt) {
    let links = '';
    let rechts = '';
    for (let i = 1; i <= 5; i++) {
      const kl = i <= anzahlGefuellt ? 'kreis-vorgabe gefuellt' : 'kreis-vorgabe';
      links += `<div class="${kl}"></div>`;
    }
    for (let i = 6; i <= 10; i++) {
      const kl = i <= anzahlGefuellt ? 'kreis-vorgabe gefuellt' : 'kreis-vorgabe';
      rechts += `<div class="${kl}"></div>`;
    }
    return (
      `<div class="zehnerstreifen">` +
      `<div class="fuenfer-gruppe">${links}</div>` +
      `<div class="fuenfer-gruppe">${rechts}</div>` +
      `</div>`
    );
  }

  /**
   * Hilfsfunktion: Erzeugt ein anatomisch klares Schulbuch-SVG-Fingerbild für 0 bis 5 Finger
   * einer linken ('L') oder rechten ('R') Hand (und bei 6 bis 10 automatisch linke + rechte Hand!).
   */
  function erstelleHandSVG(fingerAnzahl, seite = 'R') {
    if (fingerAnzahl > 5) {
      return (
        `<div class="hand-box">` +
        erstelleHandSVG(5, 'L') +
        erstelleHandSVG(fingerAnzahl - 5, 'R') +
        `</div>`
      );
    }

    const n = Math.max(0, Math.min(5, parseInt(fingerAnzahl || 0, 10)));
    const thumbUp = n === 1 || n === 2 || n === 3 || n === 5;
    const indexUp = n >= 2;
    const middleUp = n >= 3;
    const ringUp = n >= 4;
    const pinkyUp = n >= 4;

    const strokeColor = '#0f172a';
    const strokeWidth = '3.5';
    const fillRaised = '#ffffff';
    const fillPalm = '#fffbeb';
    const fillFolded = '#cbd5e1';

    let openFingers = '';
    if (indexUp) {
      openFingers += `<rect x="27" y="12" width="14" height="48" rx="7" fill="${fillRaised}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>`;
    }
    if (middleUp) {
      openFingers += `<rect x="43" y="5" width="14" height="55" rx="7" fill="${fillRaised}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>`;
    }
    if (ringUp) {
      openFingers += `<rect x="59" y="11" width="14" height="49" rx="7" fill="${fillRaised}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>`;
    }
    if (pinkyUp) {
      openFingers += `<rect x="75" y="21" width="13" height="41" rx="6.5" fill="${fillRaised}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>`;
    }

    let openThumb = '';
    if (thumbUp) {
      openThumb = `<path d="M 29 74 L 9 53 C 4 48 4 40 10 36 C 16 32 23 35 27 42 L 36 55 Z" fill="${fillRaised}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>`;
    }

    const palm = `<path d="M 26 52 C 26 47, 87 47, 87 54 L 87 73 C 87 86, 75 94, 66 96 L 66 104 L 38 104 L 38 95 C 29 92, 25 83, 26 71 Z" fill="${fillPalm}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>`;

    let foldedFingers = '';
    if (!indexUp) {
      foldedFingers += `<rect x="27" y="44" width="14" height="22" rx="7" fill="${fillFolded}" stroke="${strokeColor}" stroke-width="3"/>`;
    }
    if (!middleUp) {
      foldedFingers += `<rect x="43" y="42" width="14" height="24" rx="7" fill="${fillFolded}" stroke="${strokeColor}" stroke-width="3"/>`;
    }
    if (!ringUp) {
      foldedFingers += `<rect x="59" y="44" width="14" height="22" rx="7" fill="${fillFolded}" stroke="${strokeColor}" stroke-width="3"/>`;
    }
    if (!pinkyUp) {
      foldedFingers += `<rect x="75" y="47" width="13" height="20" rx="6.5" fill="${fillFolded}" stroke="${strokeColor}" stroke-width="3"/>`;
    }

    let foldedThumb = '';
    if (!thumbUp) {
      foldedThumb = `<path d="M 23 66 C 23 58, 33 55, 48 59 C 53 61, 54 68, 48 71 C 38 74, 23 73, 23 66 Z" fill="${fillFolded}" stroke="${strokeColor}" stroke-width="3" stroke-linejoin="round"/>`;
    }

    const groupTransform = seite === 'L' ? ' transform="translate(100, 0) scale(-1, 1)"' : '';
    const handLabel = `${seite === 'L' ? 'Linke' : 'Rechte'} Hand: ${n} Finger`;

    return (
      `<svg class="hand-svg" viewBox="0 0 100 110" role="img" aria-label="${handLabel}">` +
      `<g${groupTransform}>` +
      openThumb +
      openFingers +
      palm +
      foldedFingers +
      foldedThumb +
      `</g>` +
      `</svg>`
    );
  }

  /**
   * Hilfsfunktion: Erzeugt ein klassisches Würfelbild (1 bis 6 Augen, bei >6 zwei Würfel mit klarem Abstand)
   */
  function erstelleWuerfelHTML(augen) {
    if (augen > 6) {
      return (
        `<div style="display:inline-flex;gap:12px;align-items:center;">` +
        erstelleWuerfelHTML(5) +
        erstelleWuerfelHTML(augen - 5) +
        `</div>`
      );
    }
    // 3x3 Raster (Indizes 1..9)
    const belegt = {
      1: [5],
      2: [3, 7],
      3: [3, 5, 7],
      4: [1, 3, 7, 9],
      5: [1, 3, 5, 7, 9],
      6: [1, 3, 4, 6, 7, 9]
    }[augen] || [];

    let zellen = '';
    for (let i = 1; i <= 9; i++) {
      zellen += belegt.includes(i) ? `<span class="wuerfel-auge"></span>` : `<span></span>`;
    }
    return `<div class="wuerfel-bild" aria-label="Würfel ${augen}">${zellen}</div>`;
  }

  /**
   * Hilfsfunktion: Erzeugt einen Steckwürfel-Turm der Höhe N mit klar ablesbaren Blöcken
   */
  function erstelleTurmHTML(hoehe) {
    let wuerfel = '';
    for (let i = 0; i < hoehe; i++) {
      wuerfel += `<div class="steck-wuerfel"></div>`;
    }
    return `<div class="wuerfel-turm" aria-label="Turm aus ${hoehe} Würfeln">${wuerfel}</div>`;
  }

  /**
   * Hilfsfunktion: Erzeugt ein kontrastreiches, unverwechselbares Schulbuch-SVG für Zähl-Tiere
   * (statt kleiner, leicht verwechselbarer System-Emojis!):
   * - 'krabbe' / '🦀'          -> Knallrote Krabbe (oval + 2 große Scheren)
   * - 'seestern' / '⭐' / '🌟'  -> Leuchtend gelber 5-zackiger Seestern
   * - 'fisch' / '🐟' / '🐠'     -> Kräftig blauer Fisch mit Dreiecksflosse
   * - 'muschel' / '🐚'         -> Kräftig grüne Muschel
   * Alle anderen Tiere (z. B. 🐬 Delfin, 🦑 Tintenfisch, 🐡 Kugelfisch, 🐴, 🦭, 🦞) werden NICHT
   * auf eine der 4 Formen gemappt (sonst sähen zwei verschiedene Tierarten gleich aus und das
   * Blatt wiche vom Papier-Original ab!), sondern als großes Emoji dargestellt.
   */
  function erstelleTierSVG(typOderSymbol) {
    const roh = String(typOderSymbol || '').trim();
    const s = roh.toLowerCase();
    const istFisch = s === 'fisch' || s.includes('🐟') || s.includes('🐠');
    const istBekannt =
      s === 'krabbe' || s.includes('🦀') ||
      s === 'seestern' || s === 'stern' || s.includes('⭐') || s.includes('🌟') ||
      s === 'muschel' || s.includes('🐚') ||
      istFisch;

    // 0. Unbekanntes Tier -> großes, gut sichtbares Original-Emoji (keine falsche Zuordnung!)
    if (!istBekannt) {
      return `<span class="tier-emoji" aria-hidden="true">${roh}</span>`;
    }

    // 1. KRABBE (Rot #ef4444, Kontur #7f1d1d)
    if (s === 'krabbe' || s.includes('🦀')) {
      return (
        `<svg class="tier-svg" viewBox="0 0 64 64" role="img" aria-label="Rote Krabbe">` +
          `<!-- Beine links & rechts -->` +
          `<path d="M16 38 L5 42 M15 44 L6 50 M48 38 L59 42 M49 44 L58 50" stroke="#991b1b" stroke-width="3.5" stroke-linecap="round"/>` +
          `<!-- Große Scheren oben links & rechts -->` +
          `<path d="M20 28 L12 18 C7 14 7 7 13 6 C17 5 20 10 18 14 L22 12 C25 14 24 20 20 22" fill="#ef4444" stroke="#7f1d1d" stroke-width="2.8" stroke-linejoin="round"/>` +
          `<path d="M44 28 L52 18 C57 14 57 7 51 6 C47 5 44 10 46 14 L42 12 C39 14 40 20 44 22" fill="#ef4444" stroke="#7f1d1d" stroke-width="2.8" stroke-linejoin="round"/>` +
          `<!-- Körper -->` +
          `<ellipse cx="32" cy="39" rx="18" ry="13" fill="#ef4444" stroke="#7f1d1d" stroke-width="3"/>` +
          `<!-- Augen -->` +
          `<circle cx="25" cy="34" r="3.5" fill="#ffffff" stroke="#7f1d1d" stroke-width="2"/>` +
          `<circle cx="25" cy="34" r="1.6" fill="#0f172a"/>` +
          `<circle cx="39" cy="34" r="3.5" fill="#ffffff" stroke="#7f1d1d" stroke-width="2"/>` +
          `<circle cx="39" cy="34" r="1.6" fill="#0f172a"/>` +
          `<path d="M26 43 Q32 47 38 43" fill="none" stroke="#7f1d1d" stroke-width="2.5" stroke-linecap="round"/>` +
        `</svg>`
      );
    }

    // 2. SEESTERN (Leuchtend Gelb #facc15, Kontur #92400e – völlig andere Form als Krabbe & Fisch!)
    if (s === 'seestern' || s === 'stern' || s.includes('⭐') || s.includes('🌟')) {
      return (
        `<svg class="tier-svg" viewBox="0 0 64 64" role="img" aria-label="Gelber Seestern">` +
          `<polygon points="32,5 39,22 58,23 43,35 48,54 32,43 16,54 21,35 6,23 25,22" fill="#facc15" stroke="#92400e" stroke-width="3.2" stroke-linejoin="round"/>` +
          `<circle cx="27" cy="29" r="2.4" fill="#0f172a"/>` +
          `<circle cx="37" cy="29" r="2.4" fill="#0f172a"/>` +
          `<path d="M27 36 Q32 40 37 36" fill="none" stroke="#92400e" stroke-width="2.4" stroke-linecap="round"/>` +
        `</svg>`
      );
    }

    // 3. MUSCHEL (Kräftig Grün #22c55e, Kontur #14532d)
    if (s === 'muschel' || s.includes('🐚')) {
      return (
        `<svg class="tier-svg" viewBox="0 0 64 64" role="img" aria-label="Grüne Muschel">` +
          `<path d="M10 34 C10 15 54 15 54 34 L44 52 C38 55 26 55 20 52 Z" fill="#4ade80" stroke="#14532d" stroke-width="3.2" stroke-linejoin="round"/>` +
          `<line x1="32" y1="18" x2="32" y2="52" stroke="#14532d" stroke-width="2.4" stroke-linecap="round"/>` +
          `<line x1="21" y1="22" x2="25" y2="51" stroke="#14532d" stroke-width="2.2" stroke-linecap="round"/>` +
          `<line x1="43" y1="22" x2="39" y2="51" stroke="#14532d" stroke-width="2.2" stroke-linecap="round"/>` +
        `</svg>`
      );
    }

    // 4. FISCH (Kräftig Blau #3b82f6, Kontur #1e3a8a – nur für 🐟 / 🐠 / 'fisch')
    return (
      `<svg class="tier-svg" viewBox="0 0 64 64" role="img" aria-label="Blauer Fisch">` +
        `<!-- Schwanzflosse -->` +
        `<polygon points="46,32 60,18 60,46" fill="#60a5fa" stroke="#1e3a8a" stroke-width="3" stroke-linejoin="round"/>` +
        `<!-- Rückenflosse -->` +
        `<path d="M22 18 Q30 8 38 19" fill="#60a5fa" stroke="#1e3a8a" stroke-width="2.8" stroke-linejoin="round"/>` +
        `<!-- Fischkörper -->` +
        `<ellipse cx="28" cy="32" rx="21" ry="14" fill="#3b82f6" stroke="#1e3a8a" stroke-width="3.2"/>` +
        `<!-- Kiemenbogen & Auge -->` +
        `<path d="M21 23 Q25 32 21 41" fill="none" stroke="#1e3a8a" stroke-width="2.5" stroke-linecap="round"/>` +
        `<circle cx="15" cy="29" r="3.4" fill="#ffffff" stroke="#1e3a8a" stroke-width="2"/>` +
        `<circle cx="14.5" cy="29" r="1.7" fill="#0f172a"/>` +
      `</svg>`
    );
  }

  /**
   * Erzeugt das SVG-Icon "Zielflagge mit Fragezeichen" (🏁❓) für den Fertigstellen-Button
   * am unteren Ende des Arbeitsblatts, sobald alle Aufgaben ausgefüllt wurden.
   */
  function erstelleZielflaggeFragezeichenSVG() {
    return (
      `<svg class="zielflagge-svg" viewBox="0 0 76 72" aria-hidden="true">` +
        `<!-- Fahnenstange mit Kugel -->` +
        `<line x1="12" y1="10" x2="12" y2="64" stroke="#1e293b" stroke-width="4.5" stroke-linecap="round"/>` +
        `<circle cx="12" cy="8" r="4" fill="#f59e0b" stroke="#1e293b" stroke-width="2.2"/>` +
        `<!-- Karierte Zielflagge (4x3 Schachbrett) -->` +
        `<g stroke="#1e293b" stroke-width="2.2" stroke-linejoin="round">` +
          `<rect x="14" y="11" width="44" height="33" rx="3" fill="#ffffff"/>` +
          `<rect x="14" y="11" width="11" height="11" fill="#1e293b"/>` +
          `<rect x="36" y="11" width="11" height="11" fill="#1e293b"/>` +
          `<rect x="25" y="22" width="11" height="11" fill="#1e293b"/>` +
          `<rect x="47" y="22" width="11" height="11" fill="#1e293b"/>` +
          `<rect x="14" y="33" width="11" height="11" fill="#1e293b"/>` +
          `<rect x="36" y="33" width="11" height="11" fill="#1e293b"/>` +
          `<rect x="14" y="11" width="44" height="33" rx="3" fill="none" stroke="#1e293b" stroke-width="2.8"/>` +
        `</g>` +
        `<!-- Großes Fragezeichen-Abzeichen rechts unten -->` +
        `<circle cx="54" cy="49" r="17" fill="#fef08a" stroke="#1e293b" stroke-width="3"/>` +
        `<text x="54" y="57" text-anchor="middle" font-family="Andika, system-ui, sans-serif" font-size="25" font-weight="800" fill="#b45309">?</text>` +
      `</svg>`
    );
  }

  /**
   * Hilfsfunktion: Formatiert eine Strichlisten-Anzahl in echte 5er-Bündel (4 Striche + Querstrich)
   */
  function formatiereStrichlisteHTML(anzahl) {
    const n = Math.max(0, parseInt(anzahl || 0, 10));
    if (n === 0) return '';
    const fuenfer = Math.floor(n / 5);
    const rest = n % 5;
    let html = '';
    for (let i = 0; i < fuenfer; i++) {
      html += `<span class="strich-buendel fuenfer">||||</span>`;
    }
    if (rest > 0) {
      html += `<span class="strich-buendel">${'|'.repeat(rest)}</span>`;
    }
    return html;
  }

  /**
   * Hilfsfunktion: Erzeugt ein interaktives Zwanzigerfeld (2 Zehnerstreifen übereinander = 20 Kreise).
   * Alle 20 Kreise sind immer frei mit dem 3-State-Toggle (leer -> blau -> rot -> leer) antippbar.
   */
  function erstelleInteraktivesZwanzigerfeldHTML(prefixId) {
    return (
      `<div class="zwanzigerfeld">` +
      erstelleZehnerstreifenHTML(`${prefixId}_z1`) +
      erstelleZehnerstreifenHTML(`${prefixId}_z2`) +
      `</div>`
    );
  }

  /**
   * Hilfsfunktion: Erzeugt ein vorgedrucktes Zwanzigerfeld (z.B. 10 blaue Punkte oben + Einer in Rot unten)
   */
  function erstelleVorgabeZwanzigerfeldHTML(anzahlBlau, anzahlRot = 0) {
    const baueReihe = (startIdx) => {
      let links = '';
      let rechts = '';
      for (let i = 1; i <= 10; i++) {
        const idx = startIdx + i;
        let kl = 'kreis-vorgabe';
        if (idx <= anzahlBlau) {
          kl += ' blau';
        } else if (idx <= anzahlBlau + anzahlRot) {
          kl += ' rot';
        }
        if (i <= 5) links += `<div class="${kl}"></div>`;
        else rechts += `<div class="${kl}"></div>`;
      }
      return (
        `<div class="zehnerstreifen">` +
        `<div class="fuenfer-gruppe">${links}</div>` +
        `<div class="fuenfer-gruppe">${rechts}</div>` +
        `</div>`
      );
    };
    return `<div class="zwanzigerfeld">${baueReihe(0)}${baueReihe(10)}</div>`;
  }

  /**
   * Hilfsfunktion: Erzeugt eine Gleichungs-Zeile aus einem String wie "10 + _ = _" oder "13 + 4 = _"
   */
  function erstelleGleichungHTML(formelStr, prefixId) {
    const teile = formelStr.trim().split(/\s+/);
    let lueckeIdx = 0;
    const inner = teile
      .map((token) => {
        if (token === '_') {
          lueckeIdx++;
          return `<div class="gleichung-box"><div class="luecke" data-id="${prefixId}_l${lueckeIdx}"></div></div>`;
        }
        if (/^\d+$/.test(token)) {
          return `<div class="gleichung-box"><div class="vorgabe">${token}</div></div>`;
        }
        return `<span class="gleichung-op">${token}</span>`;
      })
      .join('');
    return `<div class="gleichung-zeile">${inner}</div>`;
  }

  /**
   * Hilfsfunktion: Erzeugt eine 3-stöckige Zahlenmauer
   * data-steine="oben; mitteLinks,mitteRechts; untenLinks,untenMitte,untenRechts" (z.B. "_; _,_; 3,4,5")
   */
  function erstelleZahlenmauerHTML(steineStr, prefixId) {
    const reihen = steineStr.split(';').map((s) => s.trim()).filter(Boolean);
    let mauerHTML = '';
    reihen.forEach((reiheStr, rIdx) => {
      const steine = reiheStr.split(',').map((s) => s.trim());
      let reiheHTML = '';
      steine.forEach((wert, sIdx) => {
        const inhalt =
          wert === '_'
            ? `<div class="luecke" data-id="${prefixId}_r${rIdx}_s${sIdx}"></div>`
            : `<div class="vorgabe">${wert}</div>`;
        reiheHTML += `<div class="mauer-stein">${inhalt}</div>`;
      });
      mauerHTML += `<div class="mauer-reihe">${reiheHTML}</div>`;
    });
    return `<div class="zahlenmauer">${mauerHTML}</div>`;
  }

  /**
   * Hilfsfunktion: Erzeugt einen zweispaltigen Zuordnungs-/Verbindungs-Baustein
   * Links: Runde Symbol-Kreise (Fingerbilder, Würfel, Türme)
   * Rechts: Runde Zahlen-Kreise gegenüber
   * Ablauf: 1. Klick links -> 2. Klick rechts -> Frage mit grünem Haken (✔) oder rotem X (✖)!
   */
  function erstelleZuordnungHTML(linksSpecStr, rechtsZahlenStr, prefix) {
    const linksListe = (linksSpecStr || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const rechtsListe = (rechtsZahlenStr || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const anzahl = Math.max(linksListe.length, rechtsListe.length, 1);
    const rowH = 124;
    const svgHeight = anzahl * rowH;

    const macheSymbolInhalt = (spec, idx) => {
      if (spec.startsWith('W:')) {
        return erstelleWuerfelHTML(parseInt(spec.slice(2), 10) || 1);
      }
      if (spec.startsWith('T:')) {
        return erstelleTurmHTML(parseInt(spec.slice(2), 10) || 1);
      }
      const clean = spec.replace(/^F:/i, '');
      const match = clean.match(/^([LR])?(\d+)$/i);
      const seite = match && match[1] ? match[1].toUpperCase() : idx % 2 === 0 ? 'L' : 'R';
      const w = match ? parseInt(match[2], 10) : parseInt(clean, 10) || 1;
      return erstelleHandSVG(w, seite);
    };

    const linksButtonsHTML = linksListe
      .map(
        (spec, i) =>
          `<div class="zuordnung-zeile-punkt">` +
            `<button type="button" class="zuordnung-knoten links" data-zo-seite="links" data-zo-index="${i}" aria-label="Symbol ${i + 1}">` +
              macheSymbolInhalt(spec, i) +
            `</button>` +
          `</div>`
      )
      .join('');

    const rechtsButtonsHTML = rechtsListe
      .map(
        (zahl, j) =>
          `<div class="zuordnung-zeile-punkt">` +
            `<button type="button" class="zuordnung-knoten rechts" data-zo-seite="rechts" data-zo-index="${j}" aria-label="Zahl ${zahl}">` +
              `<span class="vorgabe zuordnung-zahl">${zahl}</span>` +
            `</button>` +
          `</div>`
      )
      .join('');

    return (
      `<div class="zuordnung-container" data-id="${prefix}_zo" data-verbindungen="" data-anzahl="${anzahl}">` +
        `<div class="zuordnung-anleitung print-hide">` +
          `<span>1. Links Bild antippen</span>` +
          `<span>➔</span>` +
          `<span>2. Rechts Zahl antippen</span>` +
          `<span>➔</span>` +
          `<span>3. Mit <strong style="color:#16a34a;">✔</strong> bestätigen oder <strong style="color:#dc2626;">✖</strong> abbrechen</span>` +
        `</div>` +
        `<div class="zuordnung-buehne">` +
          `<svg class="zuordnung-svg" viewBox="0 0 600 ${svgHeight}" preserveAspectRatio="none" aria-hidden="true">` +
            `<g class="zuordnung-linien-fest"></g>` +
            `<g class="zuordnung-linie-vorschau"></g>` +
          `</svg>` +
          `<div class="zuordnung-spalte links">${linksButtonsHTML}</div>` +
          `<div class="zuordnung-mitte-dialog print-hide">` +
            `<div class="zuordnung-frage-box" style="display:none;" role="group" aria-label="Verbindung bestätigen oder abbrechen">` +
              `<span class="zuordnung-frage-titel">Verbinden?</span>` +
              `<div class="zuordnung-frage-buttons">` +
                `<button type="button" class="zuordnung-btn-haken" data-zo-aktion="ok" aria-label="OK, Linie ziehen">✔</button>` +
                `<button type="button" class="zuordnung-btn-x" data-zo-aktion="abbruch" aria-label="Abbrechen">✖</button>` +
              `</div>` +
            `</div>` +
          `</div>` +
          `<div class="zuordnung-spalte rechts">${rechtsButtonsHTML}</div>` +
        `</div>` +
      `</div>`
    );
  }

  /**
   * Zeichnet alle bestätigten Linien (und ggf. die gestrichelte Vorschau-Linie)
   * eines .zuordnung-container in dessen SVG.
   * Berechnet Koordinaten dynamisch anhand der tatsächlichen Pixel-Breite und Positionen,
   * sodass die Linien auch auf schmalen Smartphone-Displays (< 600px) exakt an den Kreisen ansetzen!
   */
  function zeichneZuordnungsLinien(container) {
    if (!container) return;
    const buehne = container.querySelector('.zuordnung-buehne');
    const svgEl = container.querySelector('.zuordnung-svg');
    const svgFest = container.querySelector('.zuordnung-linien-fest');
    const svgVorschau = container.querySelector('.zuordnung-linie-vorschau');
    if (!svgFest || !svgVorschau) return;

    const buehneRect = buehne ? buehne.getBoundingClientRect() : null;
    const buehneW = buehneRect && buehneRect.width > 0 ? Math.round(buehneRect.width) : 600;
    const buehneH = buehneRect && buehneRect.height > 0 ? Math.round(buehneRect.height) : 396;

    if (svgEl) {
      svgEl.setAttribute('viewBox', `0 0 ${buehneW} ${buehneH}`);
    }

    const linksSpalte = container.querySelector('.zuordnung-spalte.links');
    const spaltenW = linksSpalte && linksSpalte.getBoundingClientRect().width > 0
      ? Math.round(linksSpalte.getBoundingClientRect().width)
      : 136;

    const xLinks = Math.max(10, spaltenW - 2);
    const xRechts = Math.min(buehneW - 10, buehneW - spaltenW + 2);
    const c1 = Math.round(xLinks + (xRechts - xLinks) * 0.35);
    const c2 = Math.round(xLinks + (xRechts - xLinks) * 0.65);

    const holeY = (seite, idx) => {
      const zeilen = container.querySelectorAll(`.zuordnung-spalte.${seite} .zuordnung-zeile-punkt`);
      if (zeilen[idx] && buehneRect) {
        const zRect = zeilen[idx].getBoundingClientRect();
        return Math.round(zRect.top - buehneRect.top + zRect.height / 2);
      }
      return Math.round(idx * 132 + 66);
    };

    // 1. Feste Verbindungen parsen ("0:1,1:2")
    const raw = container.getAttribute('data-verbindungen') || '';
    const paare = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((p) => p.split(':').map((n) => parseInt(n, 10)))
      .filter(([l, r]) => !isNaN(l) && !isNaN(r));

    const verbundeneLinks = new Set();
    const verbundeneRechts = new Set();

    let festHTML = '';
    paare.forEach(([lIdx, rIdx]) => {
      verbundeneLinks.add(lIdx);
      verbundeneRechts.add(rIdx);
      const y1 = holeY('links', lIdx);
      const y2 = holeY('rechts', rIdx);
      festHTML +=
        `<path d="M ${xLinks} ${y1} C ${c1} ${y1}, ${c2} ${y2}, ${xRechts} ${y2}" fill="none" stroke="#0000CD" stroke-width="5.5" stroke-linecap="round" />` +
        `<circle cx="${xLinks}" cy="${y1}" r="6.5" fill="#0000CD" />` +
        `<circle cx="${xRechts}" cy="${y2}" r="6.5" fill="#0000CD" />`;
    });
    svgFest.innerHTML = festHTML;

    // Knoten-Klassen (.verbunden) aktualisieren
    container.querySelectorAll('.zuordnung-knoten.links').forEach((btn) => {
      const idx = parseInt(btn.getAttribute('data-zo-index'), 10);
      btn.classList.toggle('verbunden', verbundeneLinks.has(idx));
    });
    container.querySelectorAll('.zuordnung-knoten.rechts').forEach((btn) => {
      const idx = parseInt(btn.getAttribute('data-zo-index'), 10);
      btn.classList.toggle('verbunden', verbundeneRechts.has(idx));
    });

    // 2. Vorschau-Linie zeichnen, falls sowohl links als auch rechts gewählt wurde
    const pLinks = container.getAttribute('data-pending-links');
    const pRechts = container.getAttribute('data-pending-rechts');
    if (pLinks !== null && pLinks !== '' && pRechts !== null && pRechts !== '') {
      const lIdx = parseInt(pLinks, 10);
      const rIdx = parseInt(pRechts, 10);
      const y1 = holeY('links', lIdx);
      const y2 = holeY('rechts', rIdx);
      svgVorschau.innerHTML =
        `<path d="M ${xLinks} ${y1} C ${c1} ${y1}, ${c2} ${y2}, ${xRechts} ${y2}" fill="none" stroke="#d97706" stroke-width="5" stroke-dasharray="10,8" stroke-linecap="round" />` +
        `<circle cx="${xLinks}" cy="${y1}" r="7" fill="#d97706" />` +
        `<circle cx="${xRechts}" cy="${y2}" r="7" fill="#d97706" />`;
    } else {
      svgVorschau.innerHTML = '';
    }
  }

  // Bei Größenänderung Zuordnungslinien responsiv neu ausrichten
  window.addEventListener('resize', () => {
    document.querySelectorAll('.zuordnung-container').forEach((c) => zeichneZuordnungsLinien(c));
  });

  /**
   * Zufalls-Helfer für "🎲 Neu würfeln" auf allen Arbeitsblättern
   */
  function zufallsZahl(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function mischeArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function zieheZufallsListe(min, max, anzahl) {
    const res = [];
    let pool = [];
    while (res.length < anzahl) {
      if (pool.length === 0) {
        for (let n = min; n <= max; n++) pool.push(n);
        pool = mischeArray(pool);
        if (res.length > 0 && pool.length > 1 && pool[0] === res[res.length - 1]) {
          [pool[0], pool[1]] = [pool[1], pool[0]];
        }
      }
      res.push(pool.shift());
    }
    return res;
  }

  /**
   * Deklarativer Baustein-Generator:
   * Erlaubt es, in neuen Arbeitsblättern extrem einfach per HTML-Attribut
   * Zahlenhäuser oder Zahlenfreunde-Blöcke zu rendern, falls der Inhalt noch leer ist.
   */
  function rendereDeklarativeBausteine() {
    // 1. Deklarative Zahlenhäuser: <div class="zahlenhaus" data-dach="4" data-etagen=" _:4, 1:_, _:1, _:0, _:2 "></div>
    document.querySelectorAll('.zahlenhaus[data-dach][data-etagen]').forEach((el, idx) => {
      if (el.children.length > 0 && !el.hasAttribute('data-rebuild')) return;
      el.removeAttribute('data-rebuild');
      const dach = el.getAttribute('data-dach');
      const etagenRaw = el.getAttribute('data-etagen') || '';
      const prefix = el.getAttribute('data-prefix') || `zh_${dach}_${idx}`;

      const paare = etagenRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      let etagenHTML = '';
      paare.forEach((paar, rIdx) => {
        const [links, rechts] = paar.split(':').map((s) => s.trim());
        const zelleLinks =
          links === '_'
            ? `<div class="luecke" role="button" tabindex="0" data-id="${prefix}_r${rIdx}_l"></div>`
            : `<div class="vorgabe">${links}</div>`;
        const zelleRechts =
          rechts === '_'
            ? `<div class="luecke" role="button" tabindex="0" data-id="${prefix}_r${rIdx}_r"></div>`
            : `<div class="vorgabe">${rechts}</div>`;
        etagenHTML += `<div class="etage">${zelleLinks}${zelleRechts}</div>`;
      });

      el.innerHTML =
        `<div class="dach">${erstelleDachSVG()}<span class="dach-zahl">${dach}</span></div>` +
        `<div class="wohnungen">${etagenHTML}</div>`;
    });

    // 2. Deklarative Zahlenfreunde (Haus + je Etage ein 2x5 Zehnerstreifen rechts daneben):
    // <div class="zahlenfreund-block" data-dach="5" data-etagen-anzahl="6"></div>
    document.querySelectorAll('.zahlenfreund-block[data-dach]').forEach((el, idx) => {
      if (el.children.length > 0) return;
      const dach = parseInt(el.getAttribute('data-dach'), 10);
      const anzahlEtagen = parseInt(el.getAttribute('data-etagen-anzahl') || String(dach + 1), 10);
      const prefix = el.getAttribute('data-prefix') || `zf_${dach}_${idx}`;

      let etagenHTML = '';
      let streifenHTML = '';

      for (let r = 0; r < anzahlEtagen; r++) {
        etagenHTML +=
          `<div class="etage">` +
          `<div class="luecke" role="button" tabindex="0" data-id="${prefix}_r${r}_l"></div>` +
          `<div class="luecke" role="button" tabindex="0" data-id="${prefix}_r${r}_r"></div>` +
          `</div>`;

        streifenHTML +=
          `<div class="zehnerstreifen-zeile">` +
          erstelleZehnerstreifenHTML(`${prefix}_r${r}`) +
          `</div>`;
      }

      el.innerHTML =
        `<div class="zahlenhaus">` +
        `<div class="dach">${erstelleDachSVG()}<span class="dach-zahl">${dach}</span></div>` +
        `<div class="wohnungen">${etagenHTML}</div>` +
        `</div>` +
        `<div class="zehnerstreifen-spalte">${streifenHTML}</div>`;
    });

    // 3. Deklarative Ziffern-Schreibstreifen (Aufgabe 1 auf "Zahlen bis 5"):
    // <div class="schreib-streifen" data-zahlen="4,5" data-spalten="13"></div>
    document.querySelectorAll('.schreib-streifen[data-zahlen]').forEach((el, idx) => {
      if (el.children.length > 0) return;
      const zahlen = (el.getAttribute('data-zahlen') || '').split(',').map((s) => s.trim()).filter(Boolean);
      const spalten = parseInt(el.getAttribute('data-spalten') || '12', 10);
      const prefix = el.getAttribute('data-prefix') || `ss_${idx}`;

      let reihenHTML = '';
      zahlen.forEach((z, rIdx) => {
        let zellen = '';
        for (let c = 0; c < spalten; c++) {
          if (c === 0) {
            zellen += `<div class="schreib-zelle"><div class="vorgabe">${z}</div></div>`;
          } else if (c <= 2) {
            zellen += `<div class="schreib-zelle"><div class="vorgabe spur">${z}</div></div>`;
          } else {
            zellen += `<div class="schreib-zelle"><div class="luecke" data-id="${prefix}_z${z}_c${c}"></div></div>`;
          }
        }
        reihenHTML += `<div class="schreib-reihe">${zellen}</div>`;
      });
      el.innerHTML = reihenHTML;
    });

    // 4. Deklarative Fingerbilder-Reihe (Aufgabe 2 auf "Zahlen bis 5"):
    // <div class="zaehl-karten-reihe" data-baustein="finger" data-werte="2,5,1,3,4,5,2,1,3,4"></div>
    document.querySelectorAll('.zaehl-karten-reihe[data-baustein="finger"]').forEach((el, idx) => {
      if (el.children.length > 0) return;
      const werte = (el.getAttribute('data-werte') || '').split(',').map((s) => s.trim()).filter(Boolean);
      const prefix = el.getAttribute('data-prefix') || `finger_${idx}`;
      el.innerHTML = werte
        .map((raw, i) => {
          const match = raw.match(/^([LR])?(\d+)$/i);
          const seite = match && match[1] ? match[1].toUpperCase() : i % 2 === 0 ? 'L' : 'R';
          const w = match ? parseInt(match[2], 10) : parseInt(raw, 10);
          return (
            `<div class="zaehl-karte">` +
            `<div class="zaehl-symbol-box">${erstelleHandSVG(w, seite)}</div>` +
            `<div class="zaehl-luecke-box"><div class="luecke" data-id="${prefix}_${i}"></div></div>` +
            `</div>`
          );
        })
        .join('');
    });

    // 5. Deklarative Steckwürfel-Türme (Aufgabe 3 auf "Zahlen bis 5"):
    // <div class="zaehl-karten-reihe" data-baustein="tuerme" data-werte="3,1,5,2,4,2,3,1,3,5"></div>
    document.querySelectorAll('.zaehl-karten-reihe[data-baustein="tuerme"]').forEach((el, idx) => {
      if (el.children.length > 0) return;
      const werte = (el.getAttribute('data-werte') || '').split(',').map((n) => parseInt(n.trim(), 10));
      const prefix = el.getAttribute('data-prefix') || `turm_${idx}`;
      el.innerHTML = werte
        .map(
          (w, i) =>
            `<div class="zaehl-karte">` +
            `<div class="zaehl-symbol-box">${erstelleTurmHTML(w)}</div>` +
            `<div class="zaehl-luecke-box"><div class="luecke" data-id="${prefix}_${i}"></div></div>` +
            `</div>`
        )
        .join('');
    });

    // 6. Deklarative Würfelbilder-Reihe (Aufgabe 4 auf "Zahlen bis 5"):
    // <div class="zaehl-karten-reihe" data-baustein="wuerfel" data-werte="1,4,3,5,1,2,3,5,2,3"></div>
    document.querySelectorAll('.zaehl-karten-reihe[data-baustein="wuerfel"]').forEach((el, idx) => {
      if (el.children.length > 0) return;
      const werte = (el.getAttribute('data-werte') || '').split(',').map((n) => parseInt(n.trim(), 10));
      const prefix = el.getAttribute('data-prefix') || `wuerfel_${idx}`;
      el.innerHTML = werte
        .map(
          (w, i) =>
            `<div class="zaehl-karte">` +
            `<div class="zaehl-symbol-box">${erstelleWuerfelHTML(w)}</div>` +
            `<div class="zaehl-luecke-box"><div class="luecke" data-id="${prefix}_${i}"></div></div>` +
            `</div>`
        )
        .join('');
    });

    // 7. Deklarative Punktebilder-Zeilen ("Punktebilder verbinden"):
    // <div data-baustein="punktebilder" data-werte="8,0,9,3,5,10,1,6,2"></div>
    document.querySelectorAll('[data-baustein="punktebilder"]').forEach((el, idx) => {
      if (el.children.length > 0) return;
      const werte = (el.getAttribute('data-werte') || '').split(',').map((n) => parseInt(n.trim(), 10));
      const prefix = el.getAttribute('data-prefix') || `pb_${idx}`;
      el.innerHTML = werte
        .map(
          (w, i) =>
            `<div class="punktebild-zeile">` +
            erstelleVorgabeZehnerstreifenHTML(w) +
            `<span style="font-size:1.5rem;font-weight:700;color:#64748b;">➔</span>` +
            `<div class="blase-luecke"><div class="luecke" data-id="${prefix}_${i}"></div></div>` +
            `</div>`
        )
        .join('');
    });

    // 8. Deklarative Zählen-und-Einkreisen-Zeilen ("Zählen und Einkreisen" & "Mengen bündeln"):
    // <div class="einkreisen-zeile" data-ziel="2" data-symbol="🐚" data-gesamt="10"></div>
    document.querySelectorAll('.einkreisen-zeile[data-ziel][data-symbol]').forEach((el, idx) => {
      if (el.children.length > 0) return;
      const ziel = el.getAttribute('data-ziel');
      const symbol = el.getAttribute('data-symbol');
      const gesamt = parseInt(el.getAttribute('data-gesamt') || '10', 10);
      const prefix = el.getAttribute('data-prefix') || `ek_${idx}`;

      let itemsHTML = '';
      for (let i = 1; i <= gesamt; i++) {
        itemsHTML += `<button type="button" class="einkreis-item" data-id="${prefix}_item_${i}" aria-label="${symbol} ${i}">${erstelleTierSVG(symbol)}</button>`;
      }

      el.innerHTML =
        `<div class="einkreisen-zielzahl">${ziel}</div>` +
        `<div class="einkreisen-objekte">${itemsHTML}</div>`;
    });

    // 9. Deklarative Zahlenmauern:
    // <div data-baustein="zahlenmauer" data-steine="_; _,_; 4,3,5"></div>
    document.querySelectorAll('[data-baustein="zahlenmauer"][data-steine]').forEach((el, idx) => {
      if (el.children.length > 0) return;
      const steine = el.getAttribute('data-steine');
      const prefix = el.getAttribute('data-prefix') || `zm_${idx}`;
      el.innerHTML = erstelleZahlenmauerHTML(steine, prefix);
    });

    // 10. Deklarative Nachbarzahlen (Vorgänger | Zahl | Nachfolger):
    // <div class="nachbarzahlen-grid" data-baustein="nachbarzahlen" data-zahlen="12,15,18,11,19,14"></div>
    document.querySelectorAll('[data-baustein="nachbarzahlen"][data-zahlen]').forEach((el, idx) => {
      if (el.children.length > 0) return;
      const zahlen = (el.getAttribute('data-zahlen') || '').split(',').map((s) => s.trim()).filter(Boolean);
      const prefix = el.getAttribute('data-prefix') || `nb_${idx}`;
      el.innerHTML = zahlen
        .map(
          (z, i) =>
            `<div class="nachbar-trio fokus-kandidat">` +
            `<div class="nachbar-kopf">−1</div>` +
            `<div class="nachbar-kopf">Zahl</div>` +
            `<div class="nachbar-kopf">+1</div>` +
            `<div class="nachbar-zelle"><div class="luecke" data-id="${prefix}_${i}_v"></div></div>` +
            `<div class="nachbar-zelle"><div class="vorgabe">${z}</div></div>` +
            `<div class="nachbar-zelle"><div class="luecke" data-id="${prefix}_${i}_n"></div></div>` +
            `</div>`
        )
        .join('');
    });

    // 11. Deklarative Zuordnungs-/Verbindungs-Aufgaben (Links Symbole ↔ Rechts Zahlen + ✔/✖ Bestätigung):
    // <div data-baustein="zuordnung" data-links="L5,R3,6" data-rechts="5,6,3" data-prefix="zo_1"></div>
    document.querySelectorAll('[data-baustein="zuordnung"][data-links][data-rechts]').forEach((el, idx) => {
      if (el.children.length > 0) return;
      const links = el.getAttribute('data-links') || '';
      const rechts = el.getAttribute('data-rechts') || '';
      const prefix = el.getAttribute('data-prefix') || `zo_${idx}`;
      el.innerHTML = erstelleZuordnungHTML(links, rechts, prefix);
    });

    // 12. Automatische Aufwertung von Meerestier-Emojis in Zähl-Kacheln & Strichlisten-Köpfen zu Schulbuch-SVGs:
    document.querySelectorAll('.zaehl-item, .strichlisten-kopf, .einkreis-item').forEach((el) => {
      if (el.querySelector('svg, .tier-emoji')) return;
      const raw = (el.textContent || '').trim();
      if (raw) {
        el.innerHTML = erstelleTierSVG(raw);
      }
    });
  }

  /**
   * Hauptklasse für ein einzelnes Arbeitsblatt
   */
  class TabbiBlatt {
    constructor(blattId) {
      this.blattId = blattId;
      this.istGespeicherterTest = this.pruefeObGespeicherterTest();
      // Eigener Storage-Key pro gespeicherten Test (testId) oder Kachel/Zahlenbereich
      this.storageKey = this.berechneStorageKey(blattId);
      this.aktiveLuecke = null;
      this.numpadMax = parseInt(document.body.getAttribute('data-numpad-max') || '10', 10);
      this.tastaturModus = document.body.getAttribute('data-tastatur') || 'zahlen';
      this.buchstabenGross = true;
      this.aktiveFarbe = 'farbe-blau';
      this.fokusModus = false;
      this.fokusIndex = 0;
      this.istAbgeschlossen = false;
      this.zweiTippTimer = new WeakMap();

      this.init();
    }

    pruefeObGespeicherterTest() {
      try {
        const params = new URLSearchParams(window.location.search);
        return Boolean(params.get('testId'));
      } catch (e) {
        return false;
      }
    }

    /**
     * Berechnet den eindeutigen localStorage-Schlüssel für das aktuell geöffnete Blatt
     * inklusive gespeicherter Test-ID (?testId=...) oder Teilbereich.
     */
    berechneStorageKey(blattId) {
      try {
        const params = new URLSearchParams(window.location.search);
        const testId = params.get('testId');
        if (testId) {
          return `${STORAGE_PREFIX}${testId.replace(/[^a-z0-9_-]/gi, '_')}`;
        }
        const suffixe = [];
        if (params.get('typ')) suffixe.push('t_' + params.get('typ').replace(/[^a-z0-9_]/gi, '_'));
        if (params.get('tab')) suffixe.push('tab_' + params.get('tab'));
        if (params.get('bereich')) suffixe.push('b_' + params.get('bereich'));
        if (params.get('zahlen')) suffixe.push('z_' + params.get('zahlen').replace(/[^0-9_]/g, '_'));
        if (suffixe.length > 0) {
          return `${STORAGE_PREFIX}${blattId}__${suffixe.join('_')}`;
        }
      } catch (e) {}
      return STORAGE_PREFIX + blattId;
    }

    init() {
      // PWA Manifest & Offline-Service-Worker automatisch einbinden
      this.registrierePWA();

      // Aktuelles Tagesdatum im Druck-Header eintragen (z. B. "25.10.2026")
      this.setzeHeutigesDruckDatum();

      // Falls auf diesem Blatt zuvor "🎲 Neu würfeln" genutzt wurde, gespeicherte Aufgaben-Attribute vor dem Rendern wiederherstellen!
      this.ladeGespeicherteWuerfelAufgaben();

      // Deklarative Bausteine zuerst in echtes DOM umwandeln
      rendereDeklarativeBausteine();

      // Allen .luecke und .kreis Elementen eine eindeutige data-id geben, falls noch nicht vorhanden
      this.vergebeElementIds();

      // Fixierten Ziffernblock am unteren Bildschirmrand sicherstellen
      this.baueNumpad();

      // Eingebettete Click & Mix Leiste für jedes Blatt aufbauen (selbe Aufgabe, andere Zahlen/Zahlenbereich wählbar!)
      this.baueBlattClickAndMixLeiste();

      // Fokus-Modus (1-Aufgaben-Ansicht für Tablet/Mobilgeräte) vorbereiten
      this.baueFokusSteuerung();

      // Unten am Arbeitsblatt den Fertigstellen-Bereich (Zielflagge mit Fragezeichen 🏁❓) vorbereiten
      this.baueFertigstellenBereich();

      // Event-Listener für Lücken, Kreise, Tabs, Bereichsfilter & Aktions-Buttons binden
      this.bindeEvents();

      // Gespeicherte Daten aus localStorage laden
      this.ladeStand();

      // URL-Parameter prüfen (z. B. ?bereich=1-5 oder ?tab=freunde oder ?fokus=1)
      this.wendeUrlParameterAn();

      // Erste sichtbare, leere Lücke aktivieren
      this.fokussiereErsteLeereLuecke();

      // Gesamtzahl der Aufgaben-Felder nach dem Initialisieren im Storage hinterlegen (für Fortschrittsanzeige "8 / 12")
      this.aktualisiereGesamtFelderStatistik();

      // Prüfen, ob alle Aufgaben bereits ausgefüllt sind -> Fertigstellen-Button einblenden
      this.aktualisiereFertigstellenButton(false);
    }

    registrierePWA() {
      const istUnterordner = window.location.pathname.includes('/blaetter/');
      const prefix = istUnterordner ? '../' : './';

      if (!document.querySelector('link[rel="manifest"]')) {
        const link = document.createElement('link');
        link.rel = 'manifest';
        link.href = prefix + 'manifest.json';
        document.head.appendChild(link);
      }

      if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        navigator.serviceWorker.register(prefix + 'sw.js').catch(() => {});
      }
    }

    setzeHeutigesDruckDatum() {
      const heute = new Date().toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      document.querySelectorAll('.druck-kopf span, .druck-seite-kopf span').forEach((sp) => {
        if (sp.textContent.includes('Datum:')) {
          sp.textContent = `Datum: ${heute}`;
        }
      });
    }

    vergebeElementIds() {
      document.querySelectorAll('.luecke').forEach((el, index) => {
        if (!el.getAttribute('data-id')) {
          el.setAttribute('data-id', `luecke_${index}`);
        }
        if (!el.hasAttribute('role')) {
          el.setAttribute('role', 'button');
        }
        if (!el.hasAttribute('tabindex')) {
          el.setAttribute('tabindex', '0');
        }
      });

      document.querySelectorAll('.kreis').forEach((el, index) => {
        if (!el.getAttribute('data-id')) {
          el.setAttribute('data-id', `kreis_${index}`);
        }
      });

      document.querySelectorAll('.zaehl-item, .einkreis-item, .mengen-blase').forEach((el, index) => {
        if (!el.getAttribute('data-id')) {
          el.setAttribute('data-id', `interaktiv_${index}`);
        }
      });
    }

    /**
     * Erstellt das fixierte #numpad (0-10 bzw. umschaltbar auf 0-20 + prominente ⌫-Taste)
     */
    baueNumpad() {
      let numpad = document.getElementById('numpad');
      if (!numpad) {
        numpad = document.createElement('nav');
        numpad.id = 'numpad';
        numpad.setAttribute('aria-label', 'Ziffernblock');
        document.body.appendChild(numpad);
      }
      this.rendereNumpadTasten(numpad);
    }

    rendereNumpadTasten(numpad) {
      if (!numpad) return;
      if (this.tastaturModus === 'buchstaben') {
        this.rendereBuchstabenTastatur(numpad);
        return;
      }

      const zeigeBis20 = this.numpadMax === 20;

      let reihe1 = '';
      for (let n = 0; n <= 10; n++) {
        reihe1 += `<button type="button" class="numpad-taste" data-ziffer="${n}">${n}</button>`;
      }
      // Prominente Backspace-Taste (⌫) und optionaler 0-20 Umschalter
      reihe1 += `<button type="button" class="numpad-taste taste-backspace" data-aktion="backspace" aria-label="Löschen oder zurück">⌫</button>`;
      reihe1 += `<button type="button" class="numpad-taste taste-modus ${zeigeBis20 ? 'aktiv' : ''}" data-aktion="toggle-20" title="Zahlenraum 0-10 / 0-20 umschalten">${zeigeBis20 ? '0–20 ✓' : '0–20'}</button>`;

      let reihe2 = '';
      if (zeigeBis20) {
        let tasten11Bis20 = '';
        for (let n = 11; n <= 20; n++) {
          tasten11Bis20 += `<button type="button" class="numpad-taste" data-ziffer="${n}">${n}</button>`;
        }
        reihe2 = `<div class="numpad-reihe">${tasten11Bis20}</div>`;
      }

      numpad.innerHTML =
        `<div class="numpad-inner">` +
        `<div class="numpad-reihe">${reihe1}</div>` +
        reihe2 +
        `</div>`;
    }

    /**
     * Erstellt die vollständige Buchstaben-Tastatur (A–Z + ÄÖÜ als große Kacheln + ⌫)
     * gemäß AGENTS.md Abschnitt 5.4 für Deutsch-Arbeitsblätter.
     */
    rendereBuchstabenTastatur(numpad) {
      if (!numpad) return;
      const reihen = [
        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
        ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'],
        ['U', 'V', 'W', 'X', 'Y', 'Z', 'Ä', 'Ö', 'Ü']
      ];

      const macheTastenHTML = (buchstaben) =>
        buchstaben
          .map((b) => {
            const zeichen = this.buchstabenGross ? b : b.toLowerCase();
            return `<button type="button" class="numpad-taste taste-buchstabe" data-ziffer="${zeichen}">${zeichen}</button>`;
          })
          .join('');

      const r1 = macheTastenHTML(reihen[0]);
      const r2 = macheTastenHTML(reihen[1]);
      const r3 =
        macheTastenHTML(reihen[2]) +
        `<button type="button" class="numpad-taste taste-modus ${this.buchstabenGross ? 'aktiv' : ''}" data-aktion="toggle-case" title="Groß-/Kleinschreibung umschalten">${this.buchstabenGross ? 'ABC' : 'abc'}</button>` +
        `<button type="button" class="numpad-taste taste-backspace" data-aktion="backspace" aria-label="Löschen oder zurück">⌫</button>`;

      numpad.innerHTML =
        `<div class="numpad-inner numpad-buchstaben">` +
        `<div class="numpad-reihe">${r1}</div>` +
        `<div class="numpad-reihe">${r2}</div>` +
        `<div class="numpad-reihe">${r3}</div>` +
        `</div>`;
    }

    /**
     * Baut auf jedem Arbeitsblatt (außer 011_click_und_mix oder einem eingefrorenen Test)
     * eine eigene "🎲 Click & Mix"-Leiste ein:
     * Gleicher Aufgabentyp, aber Zahlenbereich (1-5, 5-10, 1-10, 10-20 oder Einzelzahl) frei wählbar & neu würfelbar!
     */
    baueBlattClickAndMixLeiste() {
      if (this.blattId === '011_click_und_mix' || this.istGespeicherterTest) return;
      if (document.getElementById('blatt-click-mix-bar')) return;

      const main = document.querySelector('main.blatt-inhalt');
      if (!main || !main.parentNode) return;

      this.mixMin = 1;
      this.mixMax = parseInt(document.body.getAttribute('data-numpad-max') || '10', 10);

      // 1. Kompakten Schalter "⚙️ Zahlenbereich / Mix" in die .steuerung-leiste einfügen
      let leiste = document.querySelector('.steuerung-leiste');
      if (!leiste) {
        leiste = document.createElement('section');
        leiste.className = 'steuerung-leiste print-hide';
        main.parentNode.insertBefore(leiste, main);
      }

      const toggleMixBtn = document.createElement('button');
      toggleMixBtn.type = 'button';
      toggleMixBtn.className = 'lehrer-mix-toggle-btn print-hide';
      toggleMixBtn.innerHTML = '⚙️ Zahlenbereich / Mix';
      leiste.appendChild(toggleMixBtn);

      const bar = document.createElement('section');
      bar.id = 'blatt-click-mix-bar';
      bar.className = 'blatt-click-mix-bar print-hide';
      bar.setAttribute('aria-label', 'Click and Mix Zahlenwahl für dieses Arbeitsblatt');

      toggleMixBtn.addEventListener('click', () => {
        // Bereits offen -> ohne Sperre wieder schließen
        if (bar.classList.contains('offen')) {
          bar.classList.remove('offen');
          toggleMixBtn.classList.remove('aktiv');
          return;
        }
        // Öffnen ist eine Lehrer-Funktion (Zahlenwechsel löscht alle Kind-Eingaben!) -> Einmaleins-Sperre
        const oeffnen = () => {
          bar.classList.add('offen');
          toggleMixBtn.classList.add('aktiv');
        };
        if (window.TabbiLehrerGate) {
          window.TabbiLehrerGate.mitFreigabe(oeffnen);
        } else {
          oeffnen();
        }
      });

      // Prüfen, ob das Blatt eigene Aufgabenblöcke mit data-zahl="1..10" hat (wie Zahlenhäuser 001 oder Zahlenfreunde 001b):
      const hatEinzelHaeuser = document.querySelectorAll('[data-zahl]').length > 0;
      this.ausgewaehlteZahlen = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

      let einzelZahlenHTML = '';
      if (hatEinzelHaeuser) {
        let btns = '';
        for (let z = 1; z <= 10; z++) {
          btns += `<button type="button" class="bcm-chip aktiv" data-bcm-einzelzahl="${z}">${z}</button>`;
        }
        einzelZahlenHTML =
          `<div class="bcm-gruppe">` +
          `<span class="bcm-label">Einzelzahlen (Mehrfachwahl):</span>` +
          btns +
          `</div>`;
      }

      bar.innerHTML =
        `<div class="bcm-gruppe">` +
          `<span class="bcm-label">🎲 Schnellwahl Bereich:</span>` +
          `<button type="button" class="bcm-chip" data-bcm-bereich="1-5">1–5</button>` +
          `<button type="button" class="bcm-chip" data-bcm-bereich="5-10">5–10</button>` +
          `<button type="button" class="bcm-chip ${this.mixMax <= 10 ? 'aktiv' : ''}" data-bcm-bereich="1-10">1–10</button>` +
          `<button type="button" class="bcm-chip ${this.mixMax > 10 ? 'aktiv' : ''}" data-bcm-bereich="10-20">10–20</button>` +
        `</div>` +
        einzelZahlenHTML +
        `<button type="button" class="bcm-wuerfel-btn" id="btn-bcm-wuerfeln">` +
          `🎲 Gleiche Aufgabe mit neuen Zahlen würfeln` +
        `</button>`;

      main.parentNode.insertBefore(bar, main);

      bar.addEventListener('click', (e) => {
        // A) Klick auf eine Einzelzahl (Mehrfachauswahl an/aus!)
        const einzelBtn = e.target.closest('[data-bcm-einzelzahl]');
        if (einzelBtn) {
          const z = parseInt(einzelBtn.getAttribute('data-bcm-einzelzahl'), 10);
          if (this.ausgewaehlteZahlen.has(z)) {
            // Mindestens 1 Zahl muss aktiv bleiben
            if (this.ausgewaehlteZahlen.size > 1) {
              this.ausgewaehlteZahlen.delete(z);
              einzelBtn.classList.remove('aktiv');
            }
          } else {
            this.ausgewaehlteZahlen.add(z);
            einzelBtn.classList.add('aktiv');
          }
          // Bereichs-Chips deaktivieren, da jetzt eine individuelle Mehrfachauswahl aktiv ist
          bar.querySelectorAll('[data-bcm-bereich]').forEach((c) => c.classList.remove('aktiv'));
          this.filtereNachZahlenSet(this.ausgewaehlteZahlen);
          return;
        }

        // B) Klick auf einen Schnellwahl-Bereich (1-5, 5-10, 1-10, 10-20)
        const chip = e.target.closest('[data-bcm-bereich]');
        if (chip) {
          const bereichStr = chip.getAttribute('data-bcm-bereich');
          const [min, max] = bereichStr.split('-').map((n) => parseInt(n, 10));
          this.mixMin = min;
          this.mixMax = max;

          bar.querySelectorAll('[data-bcm-bereich]').forEach((c) => c.classList.toggle('aktiv', c === chip));

          // Einzelzahlen-Buttons passend zum Bereich synchronisieren
          this.ausgewaehlteZahlen.clear();
          for (let n = min; n <= max; n++) this.ausgewaehlteZahlen.add(n);
          bar.querySelectorAll('[data-bcm-einzelzahl]').forEach((eb) => {
            const ez = parseInt(eb.getAttribute('data-bcm-einzelzahl'), 10);
            eb.classList.toggle('aktiv', this.ausgewaehlteZahlen.has(ez));
          });

          // Numpad automatisch anpassen (0-10 vs. 0-20)
          const zielMax = max > 10 ? 20 : 10;
          if (this.numpadMax !== zielMax) {
            this.numpadMax = zielMax;
            this.rendereNumpadTasten(document.getElementById('numpad'));
          }

          // Falls das Blatt über data-zahl Blöcke verfügt (wie Zahlenhäuser / Zahlenfreunde), direkt filtern + neu mischen
          if (document.querySelectorAll('[data-zahl]').length > 0) {
            this.aktiviereBereich(bereichStr);
          }
          this.wuerfleBlattNeu();
          return;
        }

        const wuerfelBtn = e.target.closest('#btn-bcm-wuerfeln');
        if (wuerfelBtn) {
          this.wuerfleBlattNeu();
        }
      });
    }

    /**
     * Richtet den Fokus-Modus ("🔍 Einzel-Ansicht" vs. "📄 Blatt-Ansicht") ein.
     * Ideal für Tablets und kleinere Mobilgeräte: Zeigt immer nur 1 Aufgabe groß und ohne Scrollen!
     */
    baueFokusSteuerung() {
      // Markiere alle eigenständigen Aufgaben-Einheiten als .fokus-kandidat
      this.markiereFokusKandidaten();

      if (document.querySelectorAll('.fokus-kandidat').length <= 1) return;

      // Falls der Toggle-Button schon existiert, nicht doppelt einfügen
      if (document.getElementById('btn-fokus-modus')) return;

      // 1. Toggle-Button in die .steuerung-leiste (oder unter den Header) einfügen
      let leiste = document.querySelector('.steuerung-leiste');
      if (!leiste) {
        leiste = document.createElement('section');
        leiste.className = 'steuerung-leiste print-hide';
        const main = document.querySelector('main.blatt-inhalt');
        if (main && main.parentNode) {
          main.parentNode.insertBefore(leiste, main);
        }
      }

      const toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.id = 'btn-fokus-modus';
      toggleBtn.className = 'fokus-toggle-btn print-hide';
      toggleBtn.innerHTML = '🔍 Einzel-Ansicht (1 Aufgabe)';
      toggleBtn.addEventListener('click', () => {
        this.setzeFokusModus(!this.fokusModus);
      });
      leiste.appendChild(toggleBtn);

      // 2. Navigationsleiste (◀ Zurück | Aufgabe X von Y | Weiter ▶) vor <main> einfügen
      const nav = document.createElement('div');
      nav.className = 'fokus-nav print-hide';
      nav.innerHTML =
        `<button type="button" class="fokus-nav-btn zurueck" id="btn-fokus-prev">◀ Zurück</button>` +
        `<span class="fokus-nav-info" id="fokus-nav-status">Aufgabe 1</span>` +
        `<button type="button" class="fokus-nav-btn weiter" id="btn-fokus-next">Weiter ▶</button>`;

      const main = document.querySelector('main.blatt-inhalt');
      if (main && main.parentNode) {
        main.parentNode.insertBefore(nav, main);
      }

      document.getElementById('btn-fokus-prev').addEventListener('click', () => {
        this.blattereFokus(-1);
      });
      document.getElementById('btn-fokus-next').addEventListener('click', () => {
        this.blattereFokus(1);
      });
    }

    markiereFokusKandidaten() {
      const kandidaten = document.querySelectorAll(
        '.haeuser-grid > .zahlenhaus, .freunde-liste > .zahlenfreund-block, .aquarium-grid > .aquarium-aufgabe, [data-baustein="punktebilder"] > .punktebild-zeile, .einkreisen-zeile, .zwanziger-aufgabe-zeile, .zwerg-riese-karte, .zehneruebergang-karte, .zahlenmauern-grid > *, .mix-aufgaben-block'
      );

      if (kandidaten.length > 1) {
        kandidaten.forEach((el) => el.classList.add('fokus-kandidat'));
      } else {
        const sektionen = document.querySelectorAll('.aufgaben-sektion');
        if (sektionen.length > 1) {
          sektionen.forEach((el) => el.classList.add('fokus-kandidat'));
        }
      }
    }

    holeSichtbareFokusKandidaten() {
      return Array.from(document.querySelectorAll('.fokus-kandidat')).filter((el) => {
        if (el.classList.contains('aufgabe-versteckt')) return false;
        const panel = el.closest('.tab-panel');
        if (panel && !panel.classList.contains('aktiv')) return false;
        return true;
      });
    }

    setzeFokusModus(aktiv) {
      const kandidaten = this.holeSichtbareFokusKandidaten();
      if (kandidaten.length <= 1) {
        this.fokusModus = false;
        document.body.classList.remove('fokus-modus');
        return;
      }

      this.fokusModus = Boolean(aktiv);
      document.body.classList.toggle('fokus-modus', this.fokusModus);

      const toggleBtn = document.getElementById('btn-fokus-modus');
      if (toggleBtn) {
        toggleBtn.classList.toggle('aktiv', this.fokusModus);
        toggleBtn.innerHTML = this.fokusModus
          ? '📄 Ganzes Blatt zeigen'
          : '🔍 Einzel-Ansicht (1 Aufgabe)';
      }

      this.fokusIndex = 0;
      this.aktualisiereFokusAnsicht();
    }

    blattereFokus(delta) {
      const kandidaten = this.holeSichtbareFokusKandidaten();
      if (kandidaten.length === 0) return;
      this.fokusIndex = Math.max(0, Math.min(kandidaten.length - 1, this.fokusIndex + delta));
      this.aktualisiereFokusAnsicht();
    }

    aktualisiereFokusAnsicht() {
      document.querySelectorAll('.fokus-kandidat.fokus-aktiv').forEach((el) =>
        el.classList.remove('fokus-aktiv')
      );

      if (!this.fokusModus) {
        this.fokussiereErsteLeereLuecke();
        this.aktualisiereFertigstellenButton(false);
        return;
      }

      const kandidaten = this.holeSichtbareFokusKandidaten();
      if (kandidaten.length === 0) return;

      if (this.fokusIndex >= kandidaten.length) {
        this.fokusIndex = 0;
      }

      const aktuell = kandidaten[this.fokusIndex];
      aktuell.classList.add('fokus-aktiv');

      const statusEl = document.getElementById('fokus-nav-status');
      if (statusEl) {
        statusEl.textContent = `Aufgabe ${this.fokusIndex + 1} von ${kandidaten.length}`;
      }

      const prevBtn = document.getElementById('btn-fokus-prev');
      const nextBtn = document.getElementById('btn-fokus-next');
      if (prevBtn) prevBtn.disabled = this.fokusIndex <= 0;
      if (nextBtn) nextBtn.disabled = this.fokusIndex >= kandidaten.length - 1;

      this.fokussiereErsteLeereLuecke();
      this.aktualisiereFertigstellenButton(false);
    }

    /**
     * Erstellt am unteren Ende des Arbeitsblatts (<main class="blatt-inhalt">)
     * den Fertigstellen-Bereich mit Zielflagge & Fragezeichen (🏁❓),
     * der automatisch eingeblendet wird, sobald alle Aufgaben ausgefüllt sind.
     */
    baueFertigstellenBereich() {
      const main = document.querySelector('main.blatt-inhalt');
      if (!main) return;

      let bereich = document.getElementById('blatt-fertig-bereich');
      if (!bereich) {
        bereich = document.createElement('section');
        bereich.id = 'blatt-fertig-bereich';
        bereich.className = 'blatt-fertig-bereich print-hide';
        bereich.style.display = 'none';
        bereich.setAttribute('aria-label', 'Arbeitsblatt fertigstellen');
        bereich.innerHTML =
          `<button type="button" class="blatt-fertig-hauptbtn" id="btn-blatt-fertig-frage">` +
            erstelleZielflaggeFragezeichenSVG() +
            `<span class="blatt-fertig-text-gruppe">` +
              `<span class="blatt-fertig-titel">Fertig mit den Aufgaben?</span>` +
              `<span class="blatt-fertig-sub">Tippe auf die Zielflagge zum Abschließen</span>` +
            `</span>` +
          `</button>` +
          `<div class="blatt-fertig-frage-box" id="blatt-fertig-frage-box" style="display:none;" role="group" aria-label="Arbeitsblatt abschließen bestätigen">` +
            `<div class="blatt-fertig-frage-kopf">` +
              erstelleZielflaggeFragezeichenSVG() +
              `<span class="blatt-fertig-frage-titel">Arbeitsblatt fertigstellen?</span>` +
            `</div>` +
            `<div class="blatt-fertig-frage-buttons">` +
              `<button type="button" class="blatt-fertig-btn-ok" data-fertig-aktion="ok" aria-label="Ja, fertigstellen und zur Bibliothek">` +
                `<span class="blatt-fertig-symbol">✔</span>` +
                `<span>Ja, fertig!</span>` +
              `</button>` +
              `<button type="button" class="blatt-fertig-btn-abbruch" data-fertig-aktion="abbruch" aria-label="Zurück zum Blatt und weiterarbeiten">` +
                `<span class="blatt-fertig-symbol">✖</span>` +
                `<span>Weiterarbeiten</span>` +
              `</button>` +
            `</div>` +
          `</div>`;
      }
      // Immer ganz ans Ende von <main> hängen
      if (bereich.parentNode !== main || main.lastElementChild !== bereich) {
        main.appendChild(bereich);
      }
    }

    /**
     * Prüft, ob alle sichtbaren Aufgaben auf dem Blatt ausgefüllt sind (rein formal, ohne Richtig/Falsch-Wertung!)
     * und blendet dann unten den Fertigstellen-Button (Zielflagge mit Fragezeichen 🏁❓) ein.
     */
    aktualisiereFertigstellenButton(scrollWennNeuFertig = false) {
      this.baueFertigstellenBereich();
      const bereich = document.getElementById('blatt-fertig-bereich');
      if (!bereich) return;

      // Im Lehrer-Erstellmodus / Vorschau-Modus den Schüler-Fertigstellen-Button nicht anzeigen
      const konfig = document.getElementById('erstellen-konfigurator');
      const vorschau = document.getElementById('vorschau-aktionen-leiste');
      if (
        (konfig && konfig.style.display !== 'none' && konfig.offsetParent !== null) ||
        (vorschau && vorschau.style.display !== 'none' && vorschau.offsetParent !== null)
      ) {
        bereich.style.display = 'none';
        return;
      }

      // Alle Aufgaben des GANZEN Blatts prüfen (über alle Tabs hinweg, nur per Zahlenfilter ausgeblendete zählen nicht)
      const nichtAusgeblendet = (el) => !el.closest('.aufgabe-versteckt');
      const alleLuecken = Array.from(document.querySelectorAll('main .luecke')).filter(nichtAusgeblendet);
      const alleZuordnungen = Array.from(document.querySelectorAll('main .zuordnung-container')).filter(nichtAusgeblendet);
      const alleEinkreisZeilen = Array.from(document.querySelectorAll('main .einkreisen-zeile')).filter(nichtAusgeblendet);
      const alleMengenBlasen = Array.from(document.querySelectorAll('main .mengen-blase')).filter(nichtAusgeblendet);

      const hatAufgaben =
        alleLuecken.length +
          alleZuordnungen.length +
          alleEinkreisZeilen.length +
          alleMengenBlasen.length >
        0;

      if (!hatAufgaben) {
        bereich.style.display = 'none';
        return;
      }

      const lueckenAlleGefuellt = alleLuecken.every((l) => l.textContent.trim() !== '');

      const zuordnungenAlleVerbunden = alleZuordnungen.every((zo) => {
        const linksKnoten = zo.querySelectorAll('.zuordnung-knoten.links').length;
        if (linksKnoten === 0) return true;
        const raw = (zo.getAttribute('data-verbindungen') || '').trim();
        const paare = raw ? raw.split(',').filter(Boolean) : [];
        return paare.length >= linksKnoten;
      });

      const farbenKlassen = [
        'farbe-blau',
        'farbe-rot',
        'farbe-gruen',
        'farbe-gelb',
        'farbe-lila',
        'farbe-orange'
      ];
      const einkreisAlleBearbeitet = alleEinkreisZeilen.every((zeile) => {
        const items = Array.from(zeile.querySelectorAll('.einkreis-item'));
        return items.some((it) => farbenKlassen.some((f) => it.classList.contains(f)));
      });

      const blasenBearbeitet =
        alleMengenBlasen.length === 0 ||
        alleMengenBlasen.some((b) => farbenKlassen.some((f) => b.classList.contains(f)));

      const istDurch =
        lueckenAlleGefuellt &&
        zuordnungenAlleVerbunden &&
        einkreisAlleBearbeitet &&
        blasenBearbeitet;

      const warSichtbar = bereich.style.display !== 'none';

      if (istDurch) {
        bereich.style.display = 'flex';
        if (scrollWennNeuFertig && !warSichtbar) {
          setTimeout(() => {
            bereich.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 180);
        }
      } else {
        bereich.style.display = 'none';
        const hauptBtn = document.getElementById('btn-blatt-fertig-frage');
        const frageBox = document.getElementById('blatt-fertig-frage-box');
        if (hauptBtn) hauptBtn.style.display = 'inline-flex';
        if (frageBox) frageBox.style.display = 'none';

        // Wenn nicht mehr alle Aufgaben ausgefüllt sind (z. B. Feld per Backspace geleert),
        // wird der Status "abgeschlossen" sofort zurückgesetzt!
        if (this.istAbgeschlossen) {
          this.istAbgeschlossen = false;
          try {
            const raw = localStorage.getItem(this.storageKey);
            if (raw) {
              const d = JSON.parse(raw);
              if (d && d.abgeschlossen) {
                d.abgeschlossen = false;
                localStorage.setItem(this.storageKey, JSON.stringify(d));
              }
            }
          } catch (e) {}
        }
      }
    }

    /**
     * Prüft, ob ein Element gerade im sichtbaren Tab und Zahlenbereich liegt
     */
    istSichtbar(el) {
      if (!el) return false;
      if (el.closest('.aufgabe-versteckt')) return false;
      const panel = el.closest('.tab-panel');
      if (panel && !panel.classList.contains('aktiv')) return false;
      return el.offsetParent !== null;
    }

    holeSichtbareLuecken() {
      return Array.from(document.querySelectorAll('.luecke')).filter((el) =>
        this.istSichtbar(el)
      );
    }

    setzeAktiveLuecke(el, scrollIntoView = false) {
      document.querySelectorAll('.luecke.aktiv').forEach((l) => l.classList.remove('aktiv'));
      this.aktiveLuecke = el || null;
      if (this.aktiveLuecke) {
        this.aktiveLuecke.classList.add('aktiv');
        const zielTastatur =
          this.aktiveLuecke.getAttribute('data-tastatur') ||
          document.body.getAttribute('data-tastatur') ||
          'zahlen';
        if (this.tastaturModus !== zielTastatur) {
          this.tastaturModus = zielTastatur;
          this.rendereNumpadTasten(document.getElementById('numpad'));
        }
        if (scrollIntoView) {
          this.aktiveLuecke.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }

    fokussiereErsteLeereLuecke() {
      const sichtbare = this.holeSichtbareLuecken();
      if (sichtbare.length === 0) {
        this.setzeAktiveLuecke(null);
        return;
      }
      const ersteLeere = sichtbare.find((l) => l.textContent.trim() === '');
      this.setzeAktiveLuecke(ersteLeere || sichtbare[0], false);
    }

    /**
     * Trägt eine Zahl in die aktive Lücke ein (direktes Überschreiben)
     * und springt automatisch zur nächsten leeren Lücke.
     */
    trageZahlEin(wert) {
      const sichtbare = this.holeSichtbareLuecken();
      if (sichtbare.length === 0) return;

      if (!this.aktiveLuecke || !this.istSichtbar(this.aktiveLuecke)) {
        this.fokussiereErsteLeereLuecke();
      }
      if (!this.aktiveLuecke) return;

      // Direktes Überschreiben (kein vorheriges Löschen nötig)
      this.aktiveLuecke.textContent = String(wert);
      this.speichereStand();

      // Automatisch zur nächsten leeren Lücke weiterspringen
      const aktuellerIndex = sichtbare.indexOf(this.aktiveLuecke);
      let naechsteLuecke = null;

      // 1. Suche ab aktueller Position bis Ende
      for (let i = aktuellerIndex + 1; i < sichtbare.length; i++) {
        if (sichtbare[i].textContent.trim() === '') {
          naechsteLuecke = sichtbare[i];
          break;
        }
      }

      // 2. Falls keine leere Lücke danach folgt, suche ab Anfang bis aktuelle Position
      if (!naechsteLuecke) {
        for (let i = 0; i < aktuellerIndex; i++) {
          if (sichtbare[i].textContent.trim() === '') {
            naechsteLuecke = sichtbare[i];
            break;
          }
        }
      }

      // 3. Falls alle Lücken im aktuell sichtbaren Bereich ausgefüllt sind:
      if (!naechsteLuecke) {
        // Im "🔍 Einzel-Ansicht"-Modus (Fokus-Modus) nach 320ms automatisch zur nächsten Aufgabe weiterblättern!
        if (this.fokusModus) {
          const kandidaten = this.holeSichtbareFokusKandidaten();
          if (this.fokusIndex + 1 < kandidaten.length) {
            setTimeout(() => {
              this.blattereFokus(1);
            }, 320);
            return;
          }
        }
        if (aktuellerIndex + 1 < sichtbare.length) {
          naechsteLuecke = sichtbare[aktuellerIndex + 1];
        }
      }

      if (naechsteLuecke) {
        this.setzeAktiveLuecke(naechsteLuecke, true);
      }
    }

    /**
     * Smarte ⌫-Logik gemäß AGENTS.md:
     * 1. Ist das aktive Feld gefüllt -> Inhalt löschen, Fokus bleibt im Feld.
     * 2. Ist das aktive Feld bereits leer -> Fokus springt ein Feld zurück.
     */
    verarbeiteBackspace() {
      const sichtbare = this.holeSichtbareLuecken();
      if (sichtbare.length === 0) return;

      if (!this.aktiveLuecke || !this.istSichtbar(this.aktiveLuecke)) {
        this.fokussiereErsteLeereLuecke();
      }
      if (!this.aktiveLuecke) return;

      const inhalt = this.aktiveLuecke.textContent.trim();
      if (inhalt !== '') {
        // Fall 1: Feld hat Inhalt -> löschen, Fokus bleibt im selben Feld
        this.aktiveLuecke.textContent = '';
        this.speichereStand();
      } else {
        // Fall 2: Feld ist bereits leer -> Fokus springt ein Feld zurück
        const aktuellerIndex = sichtbare.indexOf(this.aktiveLuecke);
        if (aktuellerIndex > 0) {
          this.setzeAktiveLuecke(sichtbare[aktuellerIndex - 1], true);
        }
      }
    }

    /**
     * 3-State-Toggle für .kreis-Elemente:
     * 1. Klick = .blau, 2. Klick = .rot, 3. Klick = leer
     */
    toggleKreis(kreisEl) {
      if (kreisEl.classList.contains('blau')) {
        kreisEl.classList.remove('blau');
        kreisEl.classList.add('rot');
      } else if (kreisEl.classList.contains('rot')) {
        kreisEl.classList.remove('rot');
      } else {
        kreisEl.classList.add('blau');
      }
      this.speichereStand();
    }

    /**
     * Zwei-Tipp-Bestätigung (3 Sekunden Timeout) für kritische Buttons
     * (z.B. "Löschen" und "Zurück zur Übersicht")
     */
    richteZweiTippSchutzEin(buttonEl, warnText, aktionCallback) {
      if (!buttonEl) return;
      const originalHTML = buttonEl.innerHTML;

      buttonEl.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Läuft bereits der 3-Sekunden-Timer? -> 2. Tipp! Aktion ausführen.
        if (buttonEl.classList.contains('zwei-tipp-aktiv')) {
          // Doppeltipp-Schutz: zu schneller 2. Tipp (< 700 ms) wird ignoriert
          const ersterTipp = parseInt(buttonEl.getAttribute('data-zwei-tipp-start') || '0', 10);
          if (Date.now() - ersterTipp < ZWEI_TIPP_MIN_PAUSE_MS) return;

          const alterTimer = this.zweiTippTimer.get(buttonEl);
          if (alterTimer) clearTimeout(alterTimer);
          buttonEl.classList.remove('zwei-tipp-aktiv');
          buttonEl.innerHTML = originalHTML;
          aktionCallback();
          return;
        }

        // 1. Tipp: Warnzustand aktivieren
        buttonEl.classList.add('zwei-tipp-aktiv');
        buttonEl.setAttribute('data-zwei-tipp-start', String(Date.now()));
        buttonEl.textContent = warnText;

        const timer = setTimeout(() => {
          buttonEl.classList.remove('zwei-tipp-aktiv');
          buttonEl.innerHTML = originalHTML;
          this.zweiTippTimer.delete(buttonEl);
        }, ZWEI_TIPP_TIMEOUT_MS);

        this.zweiTippTimer.set(buttonEl, timer);
      });
    }

    bindeEvents() {
      // 1. Klick auf Lücke oder Kreis (Event Delegation am Dokument)
      document.addEventListener('click', (e) => {
        const luecke = e.target.closest('.luecke');
        if (luecke) {
          this.setzeAktiveLuecke(luecke, false);
          return;
        }

        const kreis = e.target.closest('.kreis');
        if (kreis) {
          this.toggleKreis(kreis);
          return;
        }

        // Abhakbares Zähl-Item (z.B. Fische im Aquarium oder Tiere im Wimmelbild)
        const zaehlItem = e.target.closest('.zaehl-item');
        if (zaehlItem) {
          zaehlItem.classList.toggle('markiert');
          this.speichereStand();
          return;
        }

        // Zuordnungs-Baustein: 1. Klick links (Symbol) -> 2. Klick rechts (Zahl) -> Frage mit ✔ (grün) oder ✖ (rot)
        const zoKnoten = e.target.closest('.zuordnung-knoten');
        if (zoKnoten) {
          const container = zoKnoten.closest('.zuordnung-container');
          if (!container) return;
          const seite = zoKnoten.getAttribute('data-zo-seite');
          const index = zoKnoten.getAttribute('data-zo-index');

          if (seite === 'links') {
            container.querySelectorAll('.zuordnung-knoten.links').forEach((b) =>
              b.classList.toggle('ausgewaehlt', b === zoKnoten)
            );
            container.setAttribute('data-pending-links', index);
          } else if (seite === 'rechts') {
            container.querySelectorAll('.zuordnung-knoten.rechts').forEach((b) =>
              b.classList.toggle('ausgewaehlt', b === zoKnoten)
            );
            container.setAttribute('data-pending-rechts', index);
          }

          const hatLinks = container.getAttribute('data-pending-links') !== null && container.getAttribute('data-pending-links') !== '';
          const hatRechts = container.getAttribute('data-pending-rechts') !== null && container.getAttribute('data-pending-rechts') !== '';
          const frageBox = container.querySelector('.zuordnung-frage-box');

          if (hatLinks && hatRechts) {
            if (frageBox) frageBox.style.display = 'flex';
          } else if (frageBox) {
            frageBox.style.display = 'none';
          }
          zeichneZuordnungsLinien(container);
          return;
        }

        // Zuordnungs-Bestätigung: Grüner Haken (✔ ok) oder Rotes X (✖ abbruch)
        const zoAktionBtn = e.target.closest('[data-zo-aktion]');
        if (zoAktionBtn) {
          const container = zoAktionBtn.closest('.zuordnung-container');
          if (!container) return;
          const aktion = zoAktionBtn.getAttribute('data-zo-aktion');
          const lIdx = parseInt(container.getAttribute('data-pending-links') || '', 10);
          const rIdx = parseInt(container.getAttribute('data-pending-rechts') || '', 10);

          const bisherRaw = container.getAttribute('data-verbindungen') || '';
          let paare = bisherRaw
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .map((p) => p.split(':').map((n) => parseInt(n, 10)))
            .filter(([l, r]) => !isNaN(l) && !isNaN(r));

          if (aktion === 'ok' && !isNaN(lIdx) && !isNaN(rIdx)) {
            // Bisherige Verbindung von diesem linken Knoten (oder zu diesem rechten Knoten) ersetzen
            paare = paare.filter(([l, r]) => l !== lIdx && r !== rIdx);
            paare.push([lIdx, rIdx]);
            container.setAttribute(
              'data-verbindungen',
              paare.map(([l, r]) => `${l}:${r}`).join(',')
            );
          } else if (aktion === 'abbruch' && !isNaN(lIdx) && !isNaN(rIdx)) {
            // Falls diese Verbindung bereits fest bestand und man auf ✖ tippt, wird sie gelöscht
            paare = paare.filter(([l, r]) => !(l === lIdx && r === rIdx));
            container.setAttribute(
              'data-verbindungen',
              paare.map(([l, r]) => `${l}:${r}`).join(',')
            );
          }

          container.removeAttribute('data-pending-links');
          container.removeAttribute('data-pending-rechts');
          container.querySelectorAll('.zuordnung-knoten').forEach((b) =>
            b.classList.remove('ausgewaehlt')
          );
          const frageBox = container.querySelector('.zuordnung-frage-box');
          if (frageBox) frageBox.style.display = 'none';

          zeichneZuordnungsLinien(container);
          this.speichereStand();
          return;
        }

        // Strichlisten-Buttons (+1 Strich / -1 Strich)
        const strichBtn = e.target.closest('.strich-btn[data-strich-id]');
        if (strichBtn) {
          const zielId = strichBtn.getAttribute('data-strich-id');
          const delta = parseInt(strichBtn.getAttribute('data-delta') || '1', 10);
          const anzeigeEl = document.querySelector(`.striche-anzeige[data-id="${zielId}"]`);
          if (anzeigeEl) {
            const alt = parseInt(anzeigeEl.getAttribute('data-anzahl') || '0', 10);
            const neu = Math.max(0, Math.min(20, alt + delta));
            anzeigeEl.setAttribute('data-anzahl', String(neu));
            anzeigeEl.innerHTML = formatiereStrichlisteHTML(neu);
            this.speichereStand();
          }
          return;
        }

        // Farb-Pinsel-Auswahl (für "Gleiche Mengen gleich anmalen" & "Mengen bündeln")
        const pinselBtn = e.target.closest('.farb-pinsel-btn[data-farbe]');
        if (pinselBtn) {
          this.aktiveFarbe = pinselBtn.getAttribute('data-farbe');
          document.querySelectorAll('.farb-pinsel-btn').forEach((b) =>
            b.classList.toggle('aktiv', b === pinselBtn)
          );
          return;
        }

        // Einkreis-Objekt oder Mengen-Blase einfärben / Bündel-Farbe umschalten
        const farbZiel = e.target.closest('.einkreis-item, .mengen-blase');
        if (farbZiel) {
          const alleFarben = [
            'farbe-blau',
            'farbe-rot',
            'farbe-gruen',
            'farbe-gelb',
            'farbe-lila',
            'farbe-orange'
          ];
          const hatPalette = document.querySelector('.farb-pinsel-btn') !== null;

          if (hatPalette) {
            // Wenn eine Farbpalette auf dem Blatt ist: mit gewähltem Pinsel anmalen (oder bei erneutem Tipp wieder weiß machen)
            if (this.aktiveFarbe === 'radierer' || farbZiel.classList.contains(this.aktiveFarbe)) {
              farbZiel.classList.remove(...alleFarben);
            } else {
              farbZiel.classList.remove(...alleFarben);
              farbZiel.classList.add(this.aktiveFarbe);
            }
          } else {
            // Ohne Farbpalette: 4-State-Bündel-Toggle (leer -> blau -> rot -> grün -> leer)
            if (farbZiel.classList.contains('farbe-blau')) {
              farbZiel.classList.replace('farbe-blau', 'farbe-rot');
            } else if (farbZiel.classList.contains('farbe-rot')) {
              farbZiel.classList.replace('farbe-rot', 'farbe-gruen');
            } else if (farbZiel.classList.contains('farbe-gruen')) {
              farbZiel.classList.remove('farbe-gruen');
            } else {
              farbZiel.classList.add('farbe-blau');
            }
          }
          this.speichereStand();
          return;
        }

        const numpadBtn = e.target.closest('#numpad .numpad-taste');
        if (numpadBtn) {
          const ziffer = numpadBtn.getAttribute('data-ziffer');
          const aktion = numpadBtn.getAttribute('data-aktion');

          if (ziffer !== null) {
            this.trageZahlEin(ziffer);
          } else if (aktion === 'backspace') {
            this.verarbeiteBackspace();
          } else if (aktion === 'toggle-20') {
            this.numpadMax = this.numpadMax === 20 ? 10 : 20;
            this.rendereNumpadTasten(document.getElementById('numpad'));
          } else if (aktion === 'toggle-case') {
            this.buchstabenGross = !this.buchstabenGross;
            this.rendereNumpadTasten(document.getElementById('numpad'));
          }
          return;
        }

        // Tab-Umschaltung (z.B. "Zahlenhäuser" <-> "Zahlenfreunde")
        const tabBtn = e.target.closest('.tab-btn[data-tab]');
        if (tabBtn) {
          this.aktiviereTab(tabBtn.getAttribute('data-tab'));
          return;
        }

        // Zahlenbereich-Umschaltung (z.B. "1-5", "5-10", "1-10")
        const bereichBtn = e.target.closest('.bereich-btn[data-bereich]');
        if (bereichBtn) {
          this.aktiviereBereich(bereichBtn.getAttribute('data-bereich'));
          return;
        }

        // Fertigstellen-Button (Zielflagge mit Fragezeichen 🏁❓) -> Frage mit ✔ (grün) oder ✖ (rot) öffnen
        const fertigHauptBtn = e.target.closest('#btn-blatt-fertig-frage');
        if (fertigHauptBtn) {
          const frageBox = document.getElementById('blatt-fertig-frage-box');
          if (frageBox) {
            fertigHauptBtn.style.display = 'none';
            frageBox.style.display = 'flex';
            frageBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return;
        }

        // Bestätigung im Fertigstellen-Dialog: ✔ Ja, fertig! (zur Bibliothek) oder ✖ Noch bleiben
        const fertigAktionBtn = e.target.closest('[data-fertig-aktion]');
        if (fertigAktionBtn) {
          const aktion = fertigAktionBtn.getAttribute('data-fertig-aktion');
          const hauptBtn = document.getElementById('btn-blatt-fertig-frage');
          const frageBox = document.getElementById('blatt-fertig-frage-box');
          if (aktion === 'ok') {
            this.istAbgeschlossen = true;
            this.speichereStand();
            const btnZurueck = document.getElementById('btn-zurueck');
            const ziel =
              (btnZurueck && (btnZurueck.getAttribute('href') || btnZurueck.getAttribute('data-href'))) ||
              '../index.html';
            window.location.href = ziel;
          } else {
            if (frageBox) frageBox.style.display = 'none';
            if (hauptBtn) hauptBtn.style.display = 'inline-flex';
          }
          return;
        }
      });

      // 2. Zwei-Tipp-Schutz für "Löschen"-Button
      const btnReset = document.getElementById('btn-reset');
      this.richteZweiTippSchutzEin(btnReset, 'Wirklich löschen?', () => {
        this.leereBlatt();
      });

      // 2b. "🎲 Neu würfeln"-Button automatisch vor dem Löschen-Button einfügen (nur wenn NICHT eingefrorener Test und nicht Click & Mix)
      if (btnReset && !document.getElementById('btn-neu-wuerfeln') && !this.istGespeicherterTest && this.blattId !== '011_click_und_mix') {
        const btnWuerfel = document.createElement('button');
        btnWuerfel.type = 'button';
        btnWuerfel.id = 'btn-neu-wuerfeln';
        btnWuerfel.className = 'ui-btn ui-btn-wuerfel';
        btnWuerfel.innerHTML = '🎲 Neu würfeln';
        btnReset.parentNode.insertBefore(btnWuerfel, btnReset);

        this.richteZweiTippSchutzEin(btnWuerfel, 'Neu würfeln?', () => {
          // Neu würfeln löscht alle Eingaben -> nur nach Lehrer-Freigabe (Einmaleins-Sperre)
          if (window.TabbiLehrerGate) {
            window.TabbiLehrerGate.mitFreigabe(() => this.wuerfleBlattNeu());
          } else {
            this.wuerfleBlattNeu();
          }
        });
      }

      // 3. Zwei-Tipp-Schutz für "Zurück zur Übersicht"-Button
      const btnZurueck = document.getElementById('btn-zurueck');
      this.richteZweiTippSchutzEin(btnZurueck, 'Wirklich zurück?', () => {
        const ziel = btnZurueck.getAttribute('href') || btnZurueck.getAttribute('data-href') || '../index.html';
        window.location.href = ziel;
      });

      // 4. Drucken-Button
      const btnPrint = document.getElementById('btn-print');
      if (btnPrint) {
        btnPrint.addEventListener('click', () => {
          window.print();
        });
      }
    }

    aktiviereTab(tabName) {
      if (!tabName) return;
      document.querySelectorAll('.tab-btn[data-tab]').forEach((btn) => {
        btn.classList.toggle('aktiv', btn.getAttribute('data-tab') === tabName);
      });
      document.querySelectorAll('.tab-panel[data-tab-panel]').forEach((panel) => {
        panel.classList.toggle('aktiv', panel.getAttribute('data-tab-panel') === tabName);
      });
      this.fokusIndex = 0;
      this.aktualisiereFokusAnsicht();
      this.fokussiereErsteLeereLuecke();
    }

    /**
     * Filtert Aufgabenblöcke nach Zahlenraum (z. B. "1-5", "5-10", "1-10")
     */
    aktiviereBereich(bereich) {
      if (!bereich) return;
      document.querySelectorAll('.bereich-btn[data-bereich]').forEach((btn) => {
        btn.classList.toggle('aktiv', btn.getAttribute('data-bereich') === bereich);
      });

      const teile = bereich.split('-').map((n) => parseInt(n, 10));
      const min = teile[0] || 1;
      const max = teile[1] || 10;

      const set = new Set();
      for (let z = min; z <= max; z++) set.add(z);
      this.ausgewaehlteZahlen = set;

      // Auch die Einzelzahlen-Buttons in der Click-&-Mix-Leiste synchronisieren
      document.querySelectorAll('[data-bcm-einzelzahl]').forEach((eb) => {
        const ez = parseInt(eb.getAttribute('data-bcm-einzelzahl'), 10);
        eb.classList.toggle('aktiv', set.has(ez));
      });
      document.querySelectorAll('[data-bcm-bereich]').forEach((bb) => {
        bb.classList.toggle('aktiv', bb.getAttribute('data-bcm-bereich') === bereich);
      });

      this.filtereNachZahlenSet(set, `Zahlen ${min} bis ${max}`);
    }

    /**
     * Filtert Aufgabenblöcke nach einer beliebigen Menge von Einzelzahlen (z. B. {2, 5, 7})
     * und mischt ihre Reihenfolge im Container zufällig durch (niemals starr aufsteigend!).
     */
    filtereNachZahlenSet(zahlenSet, eigenerTitel = null) {
      document.querySelectorAll('[data-zahl]').forEach((aufgabeEl) => {
        const zahl = parseInt(aufgabeEl.getAttribute('data-zahl'), 10);
        const sichtbar = zahlenSet.has(zahl);
        aufgabeEl.classList.toggle('aufgabe-versteckt', !sichtbar);
      });

      this.mischeAufgabenContainerZufaellig();

      const bereichAnzeige = document.getElementById('aktueller-bereich-text');
      if (bereichAnzeige) {
        if (eigenerTitel) {
          bereichAnzeige.textContent = `${eigenerTitel} (gemischt)`;
        } else {
          const liste = Array.from(zahlenSet).sort((a, b) => a - b);
          bereichAnzeige.textContent = `Gewählte Zahlen: ${liste.join(', ')} (gemischt)`;
        }
      }

      this.fokusIndex = 0;
      this.aktualisiereFokusAnsicht();
      this.fokussiereErsteLeereLuecke();
    }

    /**
     * Mischt die Reihenfolge der Häuser/Freunde-Blöcke im DOM zufällig durch,
     * damit sie NICHT einfach aufsteigend (1, 2, 3, 4, 5...) hintereinander stehen!
     */
    mischeAufgabenContainerZufaellig() {
      document.querySelectorAll('.haeuser-grid, .freunde-liste').forEach((container) => {
        const kinder = Array.from(container.children);
        if (kinder.length <= 1) return;
        let gemischt = mischeArray(kinder);
        // Verhindern, dass die ersten 3 sichtbaren Elemente zufällig genau aufsteigend sortiert sind
        const sichtbare = gemischt.filter((el) => !el.classList.contains('aufgabe-versteckt'));
        if (sichtbare.length >= 3) {
          const z0 = parseInt(sichtbare[0].getAttribute('data-zahl') || '0', 10);
          const z1 = parseInt(sichtbare[1].getAttribute('data-zahl') || '0', 10);
          const z2 = parseInt(sichtbare[2].getAttribute('data-zahl') || '0', 10);
          if (z0 < z1 && z1 < z2) {
            // Tausche erstes und zweites sichtbares Element
            const idx0 = gemischt.indexOf(sichtbare[0]);
            const idx1 = gemischt.indexOf(sichtbare[1]);
            [gemischt[idx0], gemischt[idx1]] = [gemischt[idx1], gemischt[idx0]];
          }
        }
        gemischt.forEach((el) => container.appendChild(el));
      });
    }

    wendeUrlParameterAn() {
      try {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        const bereich = params.get('bereich');
        const fokus = params.get('fokus');
        const aktion = params.get('aktion');
        if (tab) {
          this.aktiviereTab(tab);
        }
        if (bereich) {
          this.aktiviereBereich(bereich);
        }
        const zahlenParam = params.get('zahlen');
        if (zahlenParam) {
          const zahlenListe = zahlenParam
            .split(',')
            .map((s) => parseInt(s.trim(), 10))
            .filter((n) => !isNaN(n));
          if (zahlenListe.length > 0) {
            this.ausgewaehlteZahlen = new Set(zahlenListe);
            document.querySelectorAll('[data-bcm-einzelzahl]').forEach((eb) => {
              const ez = parseInt(eb.getAttribute('data-bcm-einzelzahl'), 10);
              eb.classList.toggle('aktiv', this.ausgewaehlteZahlen.has(ez));
            });
            document.querySelectorAll('[data-bcm-bereich]').forEach((bb) => bb.classList.remove('aktiv'));
            this.filtereNachZahlenSet(this.ausgewaehlteZahlen);
          }
        }
        if (aktion === 'reset') {
          this.leereBlatt();
        } else if (aktion === 'neu') {
          this.wuerfleBlattNeu();
        }
        if (fokus === '1' || window.innerWidth <= 680) {
          this.setzeFokusModus(true);
        }
      } catch (err) {
        // Ignorieren falls URLSearchParams nicht verfügbar
      }
    }

    /**
     * Würfelt alle Aufgaben-Zahlen auf dem aktuellen Arbeitsblatt komplett neu aus
     * und leert dabei alle bisherigen Eingaben (Reset + Zufalls-Aufgaben).
     */
    wuerfleBlattNeu() {
      // Falls Click & Mix einen eigenen Generator-Button hat, diesen auslösen
      const mixBtn = document.getElementById('btn-mix-neu');
      if (mixBtn) {
        mixBtn.click();
        return;
      }

      // 1. Zahlenhäuser (Dachzahl bleibt, Zerlegungen in den Etagen werden neu gemischt & links/rechts zufällig verteilt)
      document.querySelectorAll('.zahlenhaus[data-dach][data-etagen]').forEach((el) => {
        const dach = parseInt(el.getAttribute('data-dach'), 10);
        const bisherigePaare = (el.getAttribute('data-etagen') || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        const anzahlEtagen = bisherigePaare.length || dach + 1;

        const alleZerlegungen = [];
        for (let a = 0; a <= dach; a++) alleZerlegungen.push(a);
        const gemischt = mischeArray(alleZerlegungen);

        const neuePaare = [];
        for (let i = 0; i < anzahlEtagen; i++) {
          const linksZahl = gemischt[i % gemischt.length];
          const rechtsZahl = dach - linksZahl;
          neuePaare.push(Math.random() < 0.5 ? `${linksZahl}:_` : `_:${rechtsZahl}`);
        }

        el.setAttribute('data-etagen', neuePaare.join(', '));
        el.setAttribute('data-rebuild', '1');
        el.innerHTML = '';
      });

      // 2. Fingerbilder, Steckwürfel-Türme, Würfelbilder & Punktebilder neu würfeln
      document
        .querySelectorAll(
          '[data-baustein="finger"], [data-baustein="tuerme"], [data-baustein="wuerfel"], [data-baustein="punktebilder"]'
        )
        .forEach((el) => {
          const baustein = el.getAttribute('data-baustein');
          const alteWerte = (el.getAttribute('data-werte') || '')
            .split(',')
            .map((s) => parseInt(s.replace(/^[LR]/i, '').trim(), 10))
            .filter((n) => !isNaN(n));
          if (alteWerte.length === 0) return;

          const min = this.mixMin || Math.min(...alteWerte);
          const max = Math.min(10, this.mixMax || Math.max(...alteWerte));
          const neueZahlen = zieheZufallsListe(Math.min(min, max), max, alteWerte.length);

          if (baustein === 'finger') {
            const mitHand = neueZahlen.map((z) =>
              z <= 5 ? `${Math.random() < 0.5 ? 'L' : 'R'}${z}` : String(z)
            );
            el.setAttribute('data-werte', mitHand.join(','));
          } else {
            el.setAttribute('data-werte', neueZahlen.join(','));
          }
          el.innerHTML = '';
        });

      // 3. Nachbarzahlen neu würfeln
      document.querySelectorAll('[data-baustein="nachbarzahlen"][data-zahlen]').forEach((el) => {
        const alteZahlen = (el.getAttribute('data-zahlen') || '')
          .split(',')
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !isNaN(n));
        if (alteZahlen.length === 0) return;
        const min = Math.max(1, this.mixMin || 11);
        const max = Math.min(19, this.mixMax || 19);
        const neueZahlen = zieheZufallsListe(Math.min(min, max), max, alteZahlen.length);
        el.setAttribute('data-zahlen', neueZahlen.join(','));
        el.innerHTML = '';
      });

      // 4. Zahlenmauern neu würfeln
      document.querySelectorAll('[data-baustein="zahlenmauer"][data-steine]').forEach((el) => {
        const zielMax = Math.max(4, this.mixMax || 16);
        const b = zufallsZahl(1, Math.max(1, Math.floor(zielMax / 4)));
        const a = zufallsZahl(0, Math.max(1, Math.floor((zielMax - 2 * b) / 2)));
        const c = zufallsZahl(0, Math.max(1, zielMax - 2 * b - a));
        el.setAttribute('data-steine', `_; _,_; ${a},${b},${c}`);
        el.innerHTML = '';
      });

      // 5. Zählen & Einkreisen / Mengen bündeln: Zielzahlen neu würfeln
      document.querySelectorAll('.einkreisen-zeile[data-ziel][data-symbol]').forEach((el) => {
        const gesamt = parseInt(el.getAttribute('data-gesamt') || '10', 10);
        const min = Math.max(1, Math.min(this.mixMin || 2, gesamt - 1));
        const max = Math.min(gesamt, this.mixMax || 9);
        const neuesZiel = zufallsZahl(min, max);
        el.setAttribute('data-ziel', String(neuesZiel));
        el.innerHTML = '';
      });

      // 6. Blatt-spezifische Custom-Container (z. B. Aquarien, Zwergen/Riesen, Zwanzigerfeld) per Event informieren
      window.dispatchEvent(
        new CustomEvent('tabbi:neu-wuerfeln', {
          detail: { min: this.mixMin || 1, max: this.mixMax || 10 }
        })
      );

      // 7. Alle Häuser/Zahlenfreunde-Reihenfolgen bunt durchmischen (nicht aufsteigend!),
      //    Eingaben leeren, Bausteine frisch aufbauen und Fokus auf das 1. Feld setzen
      this.mischeAufgabenContainerZufaellig();
      this.leereBlatt();
      this.aktualisiereDynamischesBlatt();
      this.speichereWuerfelAufgaben();
    }

    /**
     * Speichert den aktuell ausgewürfelten Zustand (HTML von <main> + Bereichsauswahl)
     * im localStorage, damit die neuen Zufallszahlen auch beim Neuladen erhalten bleiben!
     */
    speichereWuerfelAufgaben() {
      try {
        const main = document.querySelector('main.blatt-inhalt');
        if (!main) return;
        localStorage.setItem(
          this.storageKey + '__layout',
          JSON.stringify({
            mixMin: this.mixMin || 1,
            mixMax: this.mixMax || 10,
            numpadMax: this.numpadMax || 10,
            mainHTML: main.innerHTML
          })
        );
        this.aktualisiereGesamtFelderStatistik();
      } catch (e) {}
    }

    /**
     * Lädt zuvor ausgewürfelte Zufalls-Aufgaben wieder in <main>, falls vorhanden
     */
    ladeGespeicherteWuerfelAufgaben() {
      if (this.blattId === '011_click_und_mix') return;
      try {
        const raw = localStorage.getItem(this.storageKey + '__layout');
        if (!raw) return;
        const layout = JSON.parse(raw);
        const main = document.querySelector('main.blatt-inhalt');
        if (main && layout && layout.mainHTML) {
          main.innerHTML = layout.mainHTML;
          this.mixMin = layout.mixMin || 1;
          this.mixMax = layout.mixMax || 10;
          this.numpadMax = layout.numpadMax || 10;
        }
      } catch (e) {}
    }

    /**
     * Speichert die Gesamtanzahl der ausfüllbaren Lücken/Blasen für die Fortschrittsanzeige ("✏️ 8 / 12 ausgefüllt")
     */
    aktualisiereGesamtFelderStatistik() {
      try {
        const sichtbareLuecken = Array.from(document.querySelectorAll('.luecke')).filter(
          (el) => !el.closest('.aufgabe-versteckt')
        );
        const zuordnungLinks = Array.from(document.querySelectorAll('.zuordnung-knoten.links')).filter(
          (el) => !el.closest('.aufgabe-versteckt')
        );
        const einkreisZeilen = Array.from(document.querySelectorAll('.einkreisen-zeile')).filter(
          (el) => !el.closest('.aufgabe-versteckt')
        );
        const blasen = document.querySelectorAll('.mengen-blase');
        const gesamt =
          sichtbareLuecken.length + zuordnungLinks.length + einkreisZeilen.length > 0
            ? sichtbareLuecken.length + zuordnungLinks.length + einkreisZeilen.length
            : blasen.length;
        if (gesamt > 0) {
          localStorage.setItem(this.storageKey + '__total', String(gesamt));
        }
      } catch (e) {}
    }

    /**
     * Speichert alle Lücken, Kreise, Strichlisten, Verbindungen und Markierungen sofort in localStorage
     */
    speichereStand() {
      const daten = {
        luecken: {},
        kreise: {},
        striche: {},
        farben: {},
        verbindungen: {},
        markiert: [],
        abgeschlossen: Boolean(this.istAbgeschlossen),
        updatedAt: new Date().toISOString()
      };

      document.querySelectorAll('.luecke').forEach((el) => {
        const id = el.getAttribute('data-id');
        const val = el.textContent.trim();
        if (id && val !== '') {
          daten.luecken[id] = val;
        }
      });

      document.querySelectorAll('.kreis').forEach((el) => {
        const id = el.getAttribute('data-id');
        if (!id) return;
        if (el.classList.contains('blau')) {
          daten.kreise[id] = 'blau';
        } else if (el.classList.contains('rot')) {
          daten.kreise[id] = 'rot';
        }
      });

      document.querySelectorAll('.striche-anzeige[data-id]').forEach((el) => {
        const id = el.getAttribute('data-id');
        const anzahl = parseInt(el.getAttribute('data-anzahl') || '0', 10);
        if (id && anzahl > 0) {
          daten.striche[id] = anzahl;
        }
      });

      const alleFarben = [
        'farbe-blau',
        'farbe-rot',
        'farbe-gruen',
        'farbe-gelb',
        'farbe-lila',
        'farbe-orange'
      ];
      document.querySelectorAll('.einkreis-item[data-id], .mengen-blase[data-id]').forEach((el) => {
        const id = el.getAttribute('data-id');
        const gefundeneFarbe = alleFarben.find((f) => el.classList.contains(f));
        if (id && gefundeneFarbe) {
          daten.farben[id] = gefundeneFarbe;
        }
      });

      document.querySelectorAll('.zuordnung-container[data-id]').forEach((el) => {
        const id = el.getAttribute('data-id');
        const verb = (el.getAttribute('data-verbindungen') || '').trim();
        if (id && verb !== '') {
          daten.verbindungen[id] = verb;
        }
      });

      document.querySelectorAll('.zaehl-item.markiert[data-id]').forEach((el) => {
        daten.markiert.push(el.getAttribute('data-id'));
      });

      try {
        const hatEintraege =
          Object.keys(daten.luecken).length > 0 ||
          Object.keys(daten.kreise).length > 0 ||
          Object.keys(daten.striche).length > 0 ||
          Object.keys(daten.farben).length > 0 ||
          Object.keys(daten.verbindungen).length > 0 ||
          daten.markiert.length > 0 ||
          daten.abgeschlossen;
        if (hatEintraege) {
          localStorage.setItem(this.storageKey, JSON.stringify(daten));
        } else {
          localStorage.removeItem(this.storageKey);
        }
      } catch (err) {
        console.warn('TABBI: Speichern in localStorage fehlgeschlagen:', err);
      }

      this.aktualisiereFertigstellenButton(true);
    }

    /**
     * Lädt gespeicherte Lücken, Kreise, Strichlisten, Verbindungen und Markierungen aus localStorage
     */
    ladeStand() {
      try {
        const raw = localStorage.getItem(this.storageKey);
        if (!raw) return;
        const daten = JSON.parse(raw);

        if (daten && daten.luecken) {
          Object.entries(daten.luecken).forEach(([id, val]) => {
            const el = document.querySelector(`.luecke[data-id="${id}"]`);
            if (el) {
              el.textContent = String(val);
            }
          });
        }

        if (daten && daten.kreise) {
          Object.entries(daten.kreise).forEach(([id, farbe]) => {
            const el = document.querySelector(`.kreis[data-id="${id}"]`);
            if (el) {
              el.classList.remove('blau', 'rot');
              if (farbe === 'blau' || farbe === 'rot') {
                el.classList.add(farbe);
              }
            }
          });
        }

        if (daten && daten.striche) {
          Object.entries(daten.striche).forEach(([id, anzahl]) => {
            const el = document.querySelector(`.striche-anzeige[data-id="${id}"]`);
            if (el) {
              el.setAttribute('data-anzahl', String(anzahl));
              el.innerHTML = formatiereStrichlisteHTML(anzahl);
            }
          });
        }

        if (daten && daten.farben) {
          Object.entries(daten.farben).forEach(([id, farbe]) => {
            const el = document.querySelector(`[data-id="${id}"]`);
            if (el) {
              el.classList.add(farbe);
            }
          });
        }

        if (daten && daten.verbindungen) {
          Object.entries(daten.verbindungen).forEach(([id, verb]) => {
            const el = document.querySelector(`.zuordnung-container[data-id="${id}"]`);
            if (el) {
              el.setAttribute('data-verbindungen', String(verb));
              zeichneZuordnungsLinien(el);
            }
          });
        }

        if (daten && Array.isArray(daten.markiert)) {
          daten.markiert.forEach((id) => {
            const el = document.querySelector(`.zaehl-item[data-id="${id}"]`);
            if (el) {
              el.classList.add('markiert');
            }
          });
        }

        this.istAbgeschlossen = Boolean(daten && daten.abgeschlossen);
      } catch (err) {
        console.warn('TABBI: Laden aus localStorage fehlgeschlagen:', err);
      }
      this.aktualisiereFertigstellenButton(false);
    }

    /**
     * Leert das gesamte Arbeitsblatt und entfernt den localStorage-Eintrag
     */
    leereBlatt() {
      this.istAbgeschlossen = false;
      document.querySelectorAll('.luecke').forEach((el) => {
        el.textContent = '';
      });
      document.querySelectorAll('.kreis').forEach((el) => {
        el.classList.remove('blau', 'rot');
      });
      document.querySelectorAll('.striche-anzeige').forEach((el) => {
        el.setAttribute('data-anzahl', '0');
        el.innerHTML = '';
      });
      document.querySelectorAll('.einkreis-item, .mengen-blase').forEach((el) => {
        el.classList.remove(
          'farbe-blau',
          'farbe-rot',
          'farbe-gruen',
          'farbe-gelb',
          'farbe-lila',
          'farbe-orange'
        );
      });
      document.querySelectorAll('.zuordnung-container').forEach((el) => {
        el.setAttribute('data-verbindungen', '');
        el.removeAttribute('data-pending-links');
        el.removeAttribute('data-pending-rechts');
        el.querySelectorAll('.zuordnung-knoten').forEach((k) =>
          k.classList.remove('ausgewaehlt', 'verbunden')
        );
        const frageBox = el.querySelector('.zuordnung-frage-box');
        if (frageBox) frageBox.style.display = 'none';
        zeichneZuordnungsLinien(el);
      });
      document.querySelectorAll('.zaehl-item.markiert').forEach((el) => {
        el.classList.remove('markiert');
      });

      try {
        localStorage.removeItem(this.storageKey);
      } catch (err) {
        console.warn('TABBI: Löschen aus localStorage fehlgeschlagen:', err);
      }

      this.fokussiereErsteLeereLuecke();
      this.aktualisiereFertigstellenButton(false);
    }

    /**
     * Öffentliche Methode für dynamisch nachgeladene/generierte Aufgaben (z. B. Click & Mix):
     * Wandelt deklarative Bausteine um, vergibt IDs, aktualisiert Fokus-Steuerung und setzt Fokus.
     */
    aktualisiereDynamischesBlatt() {
      rendereDeklarativeBausteine();
      this.vergebeElementIds();
      this.baueFokusSteuerung();
      this.baueFertigstellenBereich();
      this.fokusIndex = 0;
      this.aktualisiereFokusAnsicht();
      this.fokussiereErsteLeereLuecke();
      this.aktualisiereFertigstellenButton(false);
    }
  }

  /**
   * Hilfsfunktionen für die Bibliothek (index.html)
   */
  const TabbiBibliothek = {
    /**
     * Berechnet aus einer Kachel-URL und blattId exakt denselben Storage-Key wie TabbiBlatt
     */
    berechneKeyAusUrl(blattId, urlStr) {
      try {
        const qIndex = (urlStr || '').indexOf('?');
        if (qIndex === -1) return STORAGE_PREFIX + blattId;
        const params = new URLSearchParams(urlStr.slice(qIndex + 1));
        const suffixe = [];
        if (params.get('typ')) suffixe.push('t_' + params.get('typ').replace(/[^a-z0-9_]/gi, '_'));
        if (params.get('tab')) suffixe.push('tab_' + params.get('tab'));
        if (params.get('bereich')) suffixe.push('b_' + params.get('bereich'));
        if (suffixe.length > 0) {
          return `${STORAGE_PREFIX}${blattId}__${suffixe.join('_')}`;
        }
      } catch (e) {}
      return STORAGE_PREFIX + blattId;
    },

    /**
     * Prüft, ob für eine Kachel (inkl. eigenem Zahlenbereich / Click-&-Mix-Typ)
     * bereits Einträge in localStorage vorliegen, und gibt auch den Fortschritt zurück.
     */
    holeBlattStatus(blattId, zahlenFilter = null, urlStr = '') {
      try {
        const key = this.berechneKeyAusUrl(blattId, urlStr);
        let raw = localStorage.getItem(key);
        // Rückfallebene: Falls unter dem spezifischen Key noch nichts liegt, prüfe Basis-Blatt-Key
        const nutztBasisKey = !raw && key !== STORAGE_PREFIX + blattId;
        if (nutztBasisKey) {
          raw = localStorage.getItem(STORAGE_PREFIX + blattId);
        }
        if (!raw) return { angefangen: false, anzahl: 0, gesamt: 0, storageKey: key };

        const daten = JSON.parse(raw);
        const lueckenKeys = Object.keys(daten.luecken || {});
        const kreiseKeys = Object.keys(daten.kreise || {});
        const stricheKeys = Object.keys(daten.striche || {});
        const farbenKeys = Object.keys(daten.farben || {});
        const markiertKeys = Array.isArray(daten.markiert) ? daten.markiert : [];

        // Für den Fortschritts-Zähler ("8 / 12 ausgefüllt") zählen vor allem Lücken oder bearbeitete Zeilen
        const einkreisZeilenSet = new Set();
        farbenKeys.forEach((k) => {
          const match = k.match(/^(.*)_item_\d+$/);
          if (match) einkreisZeilenSet.add(match[1]);
        });

        const hauptEintraege =
          lueckenKeys.length > 0
            ? lueckenKeys
            : einkreisZeilenSet.size > 0
            ? Array.from(einkreisZeilenSet)
            : [...farbenKeys, ...kreiseKeys, ...stricheKeys];
        const alleKeys = [
          ...lueckenKeys,
          ...kreiseKeys,
          ...stricheKeys,
          ...farbenKeys,
          ...markiertKeys
        ];

        const gesamtRaw = localStorage.getItem(key + '__total') || localStorage.getItem(STORAGE_PREFIX + blattId + '__total');
        const gesamt = gesamtRaw ? parseInt(gesamtRaw, 10) : 0;

        if (!zahlenFilter || !nutztBasisKey) {
          return {
            angefangen: alleKeys.length > 0,
            anzahl: hauptEintraege.length || alleKeys.length,
            gesamt: gesamt,
            storageKey: key
          };
        }

        const [min, max] = zahlenFilter.split('-').map((n) => parseInt(n, 10));
        const passendeKeys = alleKeys.filter((k) => {
          const match = k.match(/^(?:zh|zf)_(\d+)_/);
          if (!match) return true;
          const zahl = parseInt(match[1], 10);
          return zahl >= min && zahl <= max;
        });

        return {
          angefangen: passendeKeys.length > 0,
          anzahl: passendeKeys.length,
          gesamt: 0,
          storageKey: key
        };
      } catch (err) {
        return { angefangen: false, anzahl: 0, gesamt: 0, storageKey: STORAGE_PREFIX + blattId };
      }
    }
  };

  /**
   * Zentrale Verwaltung der gespeicherten Arbeitsblätter / Tests ("Testbibliothek")
   * Jedes von der Lehrkraft über "➕ Arbeitsblatt erstellen" -> Vorschau -> "💾 In Bibliothek speichern"
   * angelegte Arbeitsblatt wird hier mit Erstellungsdatum, Fach und fest eingefrorenen Aufgaben gespeichert.
   */
  const TESTBIBLIOTHEK_STORAGE_KEY = 'tabbi_testbibliothek_v1';

  const TabbiTestbibliothek = {
    formatiereDatum(isoString) {
      try {
        const d = isoString ? new Date(isoString) : new Date();
        const datum = d.toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        const uhrzeit = d.toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit'
        });
        return `${datum} • ${uhrzeit} Uhr`;
      } catch (e) {
        return 'Heute';
      }
    },

    /**
     * Erzeugt beim allerersten Start 3 fertige Beispiel-Arbeitsblätter,
     * damit die Bibliothek sofort einsatzbereit ist.
     */
    erzeugeStartBeispiele() {
      const jetzt = Date.now();
      const iso1 = new Date(jetzt - 120000).toISOString();
      const iso2 = new Date(jetzt - 60000).toISOString();
      const iso3 = new Date(jetzt).toISOString();

      return [
        {
          id: 'test_start_1',
          titel: 'Zahlenhäuser (Zahlen 1 bis 5)',
          fach: 'mathe',
          icon: '🏠',
          erstelltAm: iso3,
          erstelltDatumText: this.formatiereDatum(iso3),
          aufgabenTypen: ['zahlenhaus'],
          zahlenText: 'Zahlen 1 bis 5',
          tags: ['🔢 Mathematik', '🏠 Zahlenhäuser', 'Zahlen 1–5', '1 Druckseite'],
          numpadMax: 10,
          tastaturTyp: 'zahlen',
          seitenAnzahl: 1,
          gesamtFelder: 11,
          html:
            `<article class="druck-seite" aria-label="Arbeitsblatt Seite 1">` +
              `<div class="druck-seite-kopf">` +
                `<span>Name: Louis</span>` +
                `<span>Zahlenhäuser (Zahlen 1 bis 5)</span>` +
                `<span>Datum: _______________</span>` +
              `</div>` +
              `<div class="mix-aufgaben-block fokus-kandidat">` +
                `<h2 class="mix-block-titel"><span class="aufgaben-nr">1</span><span>Zahlenhäuser ergänzen</span></h2>` +
                `<div class="haeuser-grid" style="gap:24px;">` +
                  `<div class="zahlenhaus" data-dach="4" data-prefix="st1_zh0" data-etagen="3:_, _:2, 0:_, _:4"></div>` +
                  `<div class="zahlenhaus" data-dach="2" data-prefix="st1_zh1" data-etagen="1:_, _:0, 2:_"></div>` +
                  `<div class="zahlenhaus" data-dach="5" data-prefix="st1_zh2" data-etagen="2:_, _:1, 5:_, _:3"></div>` +
                `</div>` +
              `</div>` +
            `</article>`
        },
        {
          id: 'test_start_2',
          titel: 'Zahlenfreunde mit Zehnerstreifen (3, 5, 7)',
          fach: 'mathe',
          icon: '🔵🔴',
          erstelltAm: iso2,
          erstelltDatumText: this.formatiereDatum(iso2),
          aufgabenTypen: ['zahlenfreunde'],
          zahlenText: 'Zahlen: 3, 5, 7',
          tags: ['🔢 Mathematik', '🔵🔴 Zahlenfreunde', 'Zahlen: 3, 5, 7', '1 Druckseite'],
          numpadMax: 10,
          tastaturTyp: 'zahlen',
          seitenAnzahl: 1,
          gesamtFelder: 8,
          html:
            `<article class="druck-seite" aria-label="Arbeitsblatt Seite 1">` +
              `<div class="druck-seite-kopf">` +
                `<span>Name: Louis</span>` +
                `<span>Zahlenfreunde (3, 5, 7)</span>` +
                `<span>Datum: _______________</span>` +
              `</div>` +
              `<div class="mix-aufgaben-block fokus-kandidat">` +
                `<h2 class="mix-block-titel"><span class="aufgaben-nr">1</span><span>Zahlenfreunde (Dachzahl 5): Punkte antippen (Blau &amp; Rot) und eintragen</span></h2>` +
                `<div class="zahlenfreund-block" data-dach="5" data-etagen-anzahl="4" data-prefix="st2_zf0"></div>` +
              `</div>` +
              `<div class="mix-aufgaben-block fokus-kandidat">` +
                `<h2 class="mix-block-titel"><span class="aufgaben-nr">2</span><span>Zahlenfreunde (Dachzahl 3): Punkte antippen (Blau &amp; Rot) und eintragen</span></h2>` +
                `<div class="zahlenfreund-block" data-dach="3" data-etagen-anzahl="4" data-prefix="st2_zf1"></div>` +
              `</div>` +
            `</article>`
        },
        {
          id: 'test_start_3',
          titel: 'Fingerbilder & Würfel erkennen (1 bis 5)',
          fach: 'mathe',
          icon: '✋🎲',
          erstelltAm: iso1,
          erstelltDatumText: this.formatiereDatum(iso1),
          aufgabenTypen: ['finger', 'wuerfel_tuerme'],
          zahlenText: 'Zahlen 1 bis 5',
          tags: ['🔢 Mathematik', '✋ Fingerbilder', '🎲 Würfel & Türme', '1 Druckseite'],
          numpadMax: 10,
          tastaturTyp: 'zahlen',
          seitenAnzahl: 1,
          gesamtFelder: 14,
          html:
            `<article class="druck-seite" aria-label="Arbeitsblatt Seite 1">` +
              `<div class="druck-seite-kopf">` +
                `<span>Name: Louis</span>` +
                `<span>Fingerbilder &amp; Würfel (1 bis 5)</span>` +
                `<span>Datum: _______________</span>` +
              `</div>` +
              `<div class="mix-aufgaben-block fokus-kandidat">` +
                `<h2 class="mix-block-titel"><span class="aufgaben-nr">1</span><span>Wie viele Finger sind es?</span></h2>` +
                `<div class="zaehl-karten-reihe" data-baustein="finger" data-werte="L4,R2,L5,R1,L3,R4,L2" data-prefix="st3_fg"></div>` +
              `</div>` +
              `<div class="mix-aufgaben-block fokus-kandidat">` +
                `<h2 class="mix-block-titel"><span class="aufgaben-nr">2</span><span>Würfelbilder erkennen</span></h2>` +
                `<div class="zaehl-karten-reihe" data-baustein="wuerfel" data-werte="3,5,1,4,2,5,3" data-prefix="st3_wf"></div>` +
              `</div>` +
            `</article>`
        }
      ];
    },

    holeAlleTests() {
      try {
        const raw = localStorage.getItem(TESTBIBLIOTHEK_STORAGE_KEY);
        if (raw === null) {
          const startListe = this.erzeugeStartBeispiele();
          localStorage.setItem(TESTBIBLIOTHEK_STORAGE_KEY, JSON.stringify(startListe));
          return startListe;
        }
        const liste = JSON.parse(raw);
        if (!Array.isArray(liste)) return [];
        // Nach Erstellungsdatum absteigend sortieren (neueste zuerst)
        return liste.sort((a, b) => new Date(b.erstelltAm || 0) - new Date(a.erstelltAm || 0));
      } catch (e) {
        return [];
      }
    },

    holeTest(testId) {
      if (!testId) return null;
      const alle = this.holeAlleTests();
      return alle.find((t) => t.id === testId) || null;
    },

    speichereNeuenTest(testDaten) {
      const alle = this.holeAlleTests();
      const jetztIso = new Date().toISOString();
      const zufallsSuffix = Math.random().toString(36).slice(2, 6);
      const neueId = `test_${Date.now()}_${zufallsSuffix}`;

      const neuerTest = {
        id: neueId,
        titel: testDaten.titel || 'Mathe-Arbeitsblatt',
        fach: testDaten.fach || 'mathe',
        icon: testDaten.icon || '📄',
        erstelltAm: jetztIso,
        erstelltDatumText: this.formatiereDatum(jetztIso),
        aufgabenTypen: Array.isArray(testDaten.aufgabenTypen) ? testDaten.aufgabenTypen : ['zahlenhaus'],
        zahlenText: testDaten.zahlenText || 'Zahlen 1 bis 10',
        tags: Array.isArray(testDaten.tags) ? testDaten.tags : [],
        numpadMax: testDaten.numpadMax || 10,
        tastaturTyp: testDaten.tastaturTyp || 'zahlen',
        seitenAnzahl: testDaten.seitenAnzahl || 1,
        gesamtFelder: testDaten.gesamtFelder || 0,
        html: testDaten.html || ''
      };

      alle.unshift(neuerTest);
      try {
        localStorage.setItem(TESTBIBLIOTHEK_STORAGE_KEY, JSON.stringify(alle));
        if (neuerTest.gesamtFelder > 0) {
          localStorage.setItem(`${STORAGE_PREFIX}${neueId}__total`, String(neuerTest.gesamtFelder));
        }
      } catch (e) {
        console.warn('TABBI: Speichern in Testbibliothek fehlgeschlagen:', e);
      }
      return neuerTest;
    },

    loescheTest(testId) {
      if (!testId) return;
      try {
        const alle = this.holeAlleTests().filter((t) => t.id !== testId);
        localStorage.setItem(TESTBIBLIOTHEK_STORAGE_KEY, JSON.stringify(alle));
        const key = `${STORAGE_PREFIX}${testId}`;
        localStorage.removeItem(key);
        localStorage.removeItem(key + '__layout');
        localStorage.removeItem(key + '__total');
      } catch (e) {}
    },

    leereTestEingaben(testId) {
      if (!testId) return;
      try {
        const key = `${STORAGE_PREFIX}${testId}`;
        localStorage.removeItem(key);
      } catch (e) {}
    },

    holeTestFortschritt(testEintrag) {
      if (!testEintrag || !testEintrag.id) {
        return { angefangen: false, fertig: false, anzahl: 0, gesamt: 0, storageKey: '' };
      }
      const key = `${STORAGE_PREFIX}${testEintrag.id}`;
      try {
        const raw = localStorage.getItem(key);
        const gesamtRaw = localStorage.getItem(key + '__total');
        const gesamt = gesamtRaw
          ? parseInt(gesamtRaw, 10)
          : parseInt(testEintrag.gesamtFelder || 0, 10);

        if (!raw) {
          return { angefangen: false, fertig: false, anzahl: 0, gesamt, storageKey: key };
        }
        const daten = JSON.parse(raw);
        const lueckenKeys = Object.keys(daten.luecken || {});
        const kreiseKeys = Object.keys(daten.kreise || {});
        const stricheKeys = Object.keys(daten.striche || {});
        const farbenKeys = Object.keys(daten.farben || {});
        const verbindungenEintraege = Object.values(daten.verbindungen || {}).flatMap((v) =>
          String(v)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        );
        const markiertKeys = Array.isArray(daten.markiert) ? daten.markiert : [];

        // Bei Einkreisen/Bündeln zählen die bearbeiteten Zeilen, nicht jedes Einzeltier
        const einkreisZeilenSet = new Set();
        farbenKeys.forEach((k) => {
          const match = k.match(/^(.*)_item_\d+$/);
          if (match) einkreisZeilenSet.add(match[1]);
        });

        const hauptEintraege =
          lueckenKeys.length + verbindungenEintraege.length + einkreisZeilenSet.size > 0
            ? [...lueckenKeys, ...verbindungenEintraege, ...Array.from(einkreisZeilenSet)]
            : [...farbenKeys, ...kreiseKeys, ...stricheKeys];
        const alleKeys = [
          ...lueckenKeys,
          ...verbindungenEintraege,
          ...kreiseKeys,
          ...stricheKeys,
          ...farbenKeys,
          ...markiertKeys
        ];
        const anzahl = hauptEintraege.length || alleKeys.length;
        const abgeschlossen = Boolean(daten.abgeschlossen);
        const angefangen = alleKeys.length > 0 || abgeschlossen;
        const fertig = (gesamt > 0 && anzahl >= gesamt) || (abgeschlossen && (gesamt === 0 || anzahl >= gesamt));

        return {
          angefangen,
          fertig,
          abgeschlossen,
          anzahl,
          gesamt,
          storageKey: key
        };
      } catch (e) {
        return { angefangen: false, fertig: false, anzahl: 0, gesamt: 0, storageKey: key };
      }
    }
  };

  /**
   * Kindersicherung für den Lehrerbereich ("➕ Arbeitsblatt erstellen"):
   * 1. Button muss 3 Sekunden lang gedrückt gehalten werden (Long-Press mit Fortschrittsbalken).
   * 2. Danach erscheint eine Einmaleins-Aufgabe (z. B. 3 × 7, 8 × 6) über ein eigenes Zahlenfeld (ohne <input>!).
   */
  const LEHRER_FREIGABE_KEY = 'tabbi_lehrer_freigabe_ts';
  const LEHRER_HOLD_DAUER_MS = 3000;

  const TabbiLehrerGate = {
    istFreigeschaltet(maxAlterMs = 10 * 60 * 1000) {
      try {
        const ts = parseInt(sessionStorage.getItem(LEHRER_FREIGABE_KEY) || '0', 10);
        if (!ts) return false;
        return Date.now() - ts < maxAlterMs;
      } catch (e) {
        return false;
      }
    },

    merkeFreigabe() {
      try {
        sessionStorage.setItem(LEHRER_FREIGABE_KEY, String(Date.now()));
      } catch (e) {}
    },

    sperreLehrerbereich() {
      try {
        sessionStorage.removeItem(LEHRER_FREIGABE_KEY);
      } catch (e) {}
    },

    /**
     * Führt eine Lehrer-Aktion (Löschen, Neu würfeln, Zahlenbereich ändern …) nur aus,
     * wenn der Lehrerbereich in den letzten 10 Minuten freigeschaltet wurde –
     * sonst erscheint vorher die Einmaleins-Aufgabe.
     */
    mitFreigabe(aktionCallback, onAbbruchCallback = null) {
      if (this.istFreigeschaltet()) {
        aktionCallback();
        return;
      }
      this.oeffneMatheGate(aktionCallback, onAbbruchCallback);
    },

    erzeugeEinmaleinsAufgabe() {
      const faktorenA = [3, 4, 5, 6, 7, 8, 9];
      const faktorenB = [4, 5, 6, 7, 8, 9];
      const a = faktorenA[Math.floor(Math.random() * faktorenA.length)];
      const b = faktorenB[Math.floor(Math.random() * faktorenB.length)];
      return {
        a,
        b,
        text: `${a} × ${b}`,
        loesung: a * b
      };
    },

    /**
     * Öffnet das Einmaleins-Zutritts-Modal (z. B. "Was ist 3 × 7?" oder "8 × 6?")
     */
    oeffneMatheGate(onErfolgCallback, onAbbruchCallback = null) {
      const altesModal = document.getElementById('tabbi-lehrer-gate-modal');
      if (altesModal) altesModal.remove();

      let aufgabe = this.erzeugeEinmaleinsAufgabe();
      let eingabe = '';

      const overlay = document.createElement('div');
      overlay.id = 'tabbi-lehrer-gate-modal';
      overlay.className = 'lehrer-gate-overlay print-hide';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Lehrerbereich Zutrittskontrolle');

      let ziffernTastenHTML = '';
      for (let n = 1; n <= 9; n++) {
        ziffernTastenHTML += `<button type="button" class="gate-ziffer-btn" data-gate-ziffer="${n}">${n}</button>`;
      }
      ziffernTastenHTML += `<button type="button" class="gate-ziffer-btn gate-loeschen" data-gate-aktion="clear" aria-label="Eingabe löschen">⌫</button>`;
      ziffernTastenHTML += `<button type="button" class="gate-ziffer-btn" data-gate-ziffer="0">0</button>`;
      ziffernTastenHTML += `<button type="button" class="gate-ziffer-btn gate-ok" data-gate-aktion="pruefen">✓ OK</button>`;

      overlay.innerHTML =
        `<div class="lehrer-gate-karte" id="lehrer-gate-karte">` +
          `<div class="lehrer-gate-kopf">` +
            `<span class="lehrer-gate-icon">🔒</span>` +
            `<div>` +
              `<h2 class="lehrer-gate-titel">Lehrerbereich entsperren</h2>` +
              `<p class="lehrer-gate-sub">Bitte löse kurz diese Einmaleins-Aufgabe:</p>` +
            `</div>` +
          `</div>` +
          `<div class="lehrer-gate-aufgabe-box">` +
            `<span class="lehrer-gate-rechnung" id="gate-rechnung-text">${aufgabe.text} =</span>` +
            `<div class="luecke aktiv lehrer-gate-antwort" id="gate-antwort-feld" aria-live="polite"></div>` +
          `</div>` +
          `<p class="lehrer-gate-status" id="gate-status-text"></p>` +
          `<div class="lehrer-gate-numpad">` +
            ziffernTastenHTML +
          `</div>` +
          `<div class="lehrer-gate-fuss">` +
            `<button type="button" class="lehrer-gate-abbrechen" id="btn-gate-abbrechen">✖ Abbrechen</button>` +
          `</div>` +
        `</div>`;

      document.body.appendChild(overlay);

      const rechnungEl = overlay.querySelector('#gate-rechnung-text');
      const antwortEl = overlay.querySelector('#gate-antwort-feld');
      const statusEl = overlay.querySelector('#gate-status-text');
      const karteEl = overlay.querySelector('#lehrer-gate-karte');

      const aktualisiereAnzeige = () => {
        antwortEl.textContent = eingabe;
      };

      const pruefeAntwort = () => {
        if (eingabe === '') return;
        const wert = parseInt(eingabe, 10);
        if (wert === aufgabe.loesung) {
          this.merkeFreigabe();
          overlay.remove();
          if (typeof onErfolgCallback === 'function') {
            onErfolgCallback();
          }
        } else {
          karteEl.classList.remove('gate-fehler-wackeln');
          void karteEl.offsetWidth;
          karteEl.classList.add('gate-fehler-wackeln');
          statusEl.textContent = `Nicht ganz – neue Aufgabe!`;
          eingabe = '';
          aktualisiereAnzeige();
          setTimeout(() => {
            aufgabe = this.erzeugeEinmaleinsAufgabe();
            rechnungEl.textContent = `${aufgabe.text} =`;
          }, 350);
        }
      };

      overlay.addEventListener('click', (e) => {
        const zifferBtn = e.target.closest('[data-gate-ziffer]');
        if (zifferBtn) {
          statusEl.textContent = '';
          const z = zifferBtn.getAttribute('data-gate-ziffer');
          if (eingabe.length < 3) {
            eingabe += z;
            aktualisiereAnzeige();
            const erwarteteLaenge = String(aufgabe.loesung).length;
            if (eingabe.length >= erwarteteLaenge) {
              setTimeout(pruefeAntwort, 140);
            }
          }
          return;
        }

        const aktionBtn = e.target.closest('[data-gate-aktion]');
        if (aktionBtn) {
          const aktion = aktionBtn.getAttribute('data-gate-aktion');
          if (aktion === 'clear') {
            eingabe = eingabe.slice(0, -1);
            statusEl.textContent = '';
            aktualisiereAnzeige();
          } else if (aktion === 'pruefen') {
            pruefeAntwort();
          }
          return;
        }

        if (e.target.closest('#btn-gate-abbrechen') || e.target === overlay) {
          overlay.remove();
          if (typeof onAbbruchCallback === 'function') {
            onAbbruchCallback();
          }
        }
      });
    },

    /**
     * Macht einen Button oder Link zu einem 3-Sekunden-Halte-Button mit Fortschrittsbalken,
     * der nach 3 Sekunden das Einmaleins-Gate öffnet.
     */
    bindeDreiSekundenButton(buttonEl, onErfolgCallback) {
      if (!buttonEl || buttonEl.getAttribute('data-gate-gebunden') === '1') return;
      buttonEl.setAttribute('data-gate-gebunden', '1');
      buttonEl.classList.add('lehrer-hold-btn');

      const originalLabelHTML = buttonEl.innerHTML;
      buttonEl.innerHTML =
        `<span class="lehrer-hold-balken" aria-hidden="true"></span>` +
        `<span class="lehrer-hold-inhalt">${originalLabelHTML}</span>`;

      const inhaltEl = buttonEl.querySelector('.lehrer-hold-inhalt');
      let holdTimer = null;
      let countdownInterval = null;
      let hinweisTimer = null;
      let startZeit = 0;
      let istAktiv = false;

      const starteHalten = (e) => {
        if (e.type === 'mousedown' && e.button !== 0) return;
        if (istAktiv) return;
        istAktiv = true;
        startZeit = Date.now();
        if (hinweisTimer) clearTimeout(hinweisTimer);

        buttonEl.classList.remove('lehrer-hold-hinweis');
        buttonEl.classList.add('lehrer-hold-laeuft');
        inhaltEl.textContent = '🔒 Halten… 3 Sek.';

        countdownInterval = setInterval(() => {
          const vergangen = Date.now() - startZeit;
          const restSek = Math.max(1, Math.ceil((LEHRER_HOLD_DAUER_MS - vergangen) / 1000));
          inhaltEl.textContent = `🔒 Halten… ${restSek} Sek.`;
        }, 250);

        holdTimer = setTimeout(() => {
          beendeHalten(true);
          this.oeffneMatheGate(onErfolgCallback);
        }, LEHRER_HOLD_DAUER_MS);
      };

      const beendeHalten = (erfolgreich = false) => {
        if (!istAktiv) return;
        istAktiv = false;
        const gehaltenMs = Date.now() - startZeit;

        if (holdTimer) {
          clearTimeout(holdTimer);
          holdTimer = null;
        }
        if (countdownInterval) {
          clearInterval(countdownInterval);
          countdownInterval = null;
        }
        buttonEl.classList.remove('lehrer-hold-laeuft');

        if (!erfolgreich && gehaltenMs < LEHRER_HOLD_DAUER_MS) {
          buttonEl.classList.add('lehrer-hold-hinweis');
          inhaltEl.textContent = '🔒 3 Sek. gedrückt halten!';
          hinweisTimer = setTimeout(() => {
            buttonEl.classList.remove('lehrer-hold-hinweis');
            inhaltEl.innerHTML = originalLabelHTML;
          }, 2200);
        } else {
          inhaltEl.innerHTML = originalLabelHTML;
        }
      };

      // Verhindere normalen Schnell-Klick auf den Link/Button
      buttonEl.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });

      buttonEl.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });

      buttonEl.addEventListener('pointerdown', starteHalten);
      buttonEl.addEventListener('pointerup', () => beendeHalten(false));
      buttonEl.addEventListener('pointerleave', () => beendeHalten(false));
      buttonEl.addEventListener('pointercancel', () => beendeHalten(false));
    }
  };

  // Global verfügbar machen
  window.TabbiBlatt = TabbiBlatt;
  window.TabbiBibliothek = TabbiBibliothek;
  window.TabbiTestbibliothek = TabbiTestbibliothek;
  window.TabbiLehrerGate = TabbiLehrerGate;
  window.TabbiBausteine = {
    erstelleHandSVG,
    erstelleWuerfelHTML,
    erstelleTurmHTML,
    erstelleTierSVG,
    erstelleVorgabeZehnerstreifenHTML,
    erstelleInteraktivesZwanzigerfeldHTML,
    erstelleVorgabeZwanzigerfeldHTML,
    erstelleGleichungHTML,
    erstelleZahlenmauerHTML,
    erstelleZuordnungHTML,
    zeichneZuordnungsLinien,
    formatiereStrichlisteHTML
  };

  // Automatische Initialisierung, sobald das DOM geladen ist
  document.addEventListener('DOMContentLoaded', () => {
    const blattId = document.body.getAttribute('data-blatt-id');
    if (blattId) {
      window.tabbiApp = new TabbiBlatt(blattId);
    }
  });
})();
