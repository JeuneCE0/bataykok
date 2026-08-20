#!/usr/bin/env node
/**
 * Génère les icônes de l'app depuis une source vectorielle.
 *
 *   node scripts/gen-icons.js
 *
 * L'ancienne icône était un PNG figé : le mot « BATAY KOK » chevauchait les
 * pattes du coq, coupait l'anneau et se faisait rogner par le bas — illisible
 * à 60 px, c'est-à-dire à la seule taille où une icône se regarde. Le nom est
 * déjà écrit sous l'icône par le système : le mettre dedans ne sert qu'à
 * encombrer. On garde donc une tête de coq franche, cadrée serré, dans la
 * palette du jeu.
 *
 * Chrome sans interface fait le rendu : le moteur SVG interne d'ImageMagick
 * abîme les dégradés, et librsvg n'est pas installé.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ASSETS = path.join(__dirname, '..', 'assets');

const TRAIT = '#0B0714';
const OR = '#FFC93C';

/** Rayons de gloire — l'arrière-plan des vignettes du jeu, en plus large. */
function rayons(n, couleur, opacite) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = (i * 2 * Math.PI) / n;
    const l = 0.16;
    const p = (k) => [50 + Math.cos(a + k) * 90, 50 + Math.sin(a + k) * 90];
    const [x1, y1] = p(-l);
    const [x2, y2] = p(l);
    d += `M50 50 L${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
  }
  return `<path d="${d}" fill="${couleur}" opacity="${opacite}"/>`;
}

/** Tête de coq de trois quarts — crête, œil décidé, bec, barbillon. */
const TETE = `
  <g stroke="${TRAIT}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">
    <path d="M28 27 C32 7, 42 14, 45 5 C51 13, 55 7, 58 17 C64 9, 71 16, 68 29 Z" fill="url(#comb)"/>
    <path d="M28 46 C28 28, 44 20, 58 24 C72 28, 78 40, 76 52 C74 68, 62 78, 48 78
             C34 78, 26 66, 28 46 Z" fill="url(#corps)"/>
    <path d="M74 46 L94 52 L74 60 Z" fill="url(#bec)"/>
    <path d="M70 58 C78 60, 80 70, 73 73 C67 76, 63 66, 67 58 Z" fill="url(#barbe)"/>
    <ellipse cx="62" cy="44" rx="9" ry="10" fill="#FFFFFF"/>
    <circle cx="64" cy="45" r="4.6" fill="${TRAIT}" stroke="none"/>
    <path d="M50 27 L70 32" stroke-width="4.6"/>
  </g>`;

function svg({ fond, anneau, marge }) {
  const echelle = marge ? 0.78 : 0.8;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="fond" cx="0.5" cy="0.42" r="0.75">
      <stop offset="0" stop-color="#4B2B72"/>
      <stop offset="0.6" stop-color="#22123A"/>
      <stop offset="1" stop-color="#0B0714"/>
    </radialGradient>
    <radialGradient id="corps" cx="0.35" cy="0.28" r="0.85">
      <stop offset="0" stop-color="#D69B58"/>
      <stop offset="0.55" stop-color="#A5622C"/>
      <stop offset="1" stop-color="#6B3A16"/>
    </radialGradient>
    <linearGradient id="comb" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FF5B4A"/>
      <stop offset="1" stop-color="#C1201B"/>
    </linearGradient>
    <linearGradient id="barbe" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#E8382E"/>
      <stop offset="1" stop-color="#A5140F"/>
    </linearGradient>
    <linearGradient id="bec" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFD34E"/>
      <stop offset="1" stop-color="#E8890B"/>
    </linearGradient>
  </defs>
  ${fond ? '<rect width="100" height="100" fill="url(#fond)"/>' : ''}
  ${fond ? rayons(12, OR, 0.09) : ''}
  ${anneau ? `<circle cx="50" cy="50" r="41" fill="none" stroke="${TRAIT}" stroke-width="9"/>` : ''}
  ${anneau ? `<circle cx="50" cy="50" r="41" fill="none" stroke="${OR}" stroke-width="5"/>` : ''}
  <g transform="translate(50 50) scale(${echelle}) translate(-58 -42)">${TETE}</g>
</svg>`;
}

function rendre(nom, markup, taille) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kokicon-'));
  const html = path.join(tmp, 'i.html');
  fs.writeFileSync(html, `<html><body style="margin:0">${markup}</body></html>`);
  const sortie = path.join(ASSETS, nom);
  execFileSync(CHROME, [
    '--headless',
    '--disable-gpu',
    '--hide-scrollbars',
    '--default-background-color=00000000',
    `--window-size=${taille},${taille}`,
    `--screenshot=${sortie}`,
    `file://${html}`,
  ], { stdio: 'ignore' });
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`${nom} — ${taille}px`);
}

const plein = svg({ fond: true, anneau: true, marge: false });
rendre('icon.png', plein, 1024);
rendre('favicon.png', plein, 256);
// Le splash pose l'icône sur la couleur de fond déclarée dans app.json.
rendre('splash-icon.png', svg({ fond: false, anneau: true, marge: false }), 1024);
// Android rogne l'avant-plan dans un masque : 25 % de marge de sûreté.
rendre('android-icon-foreground.png', svg({ fond: false, anneau: false, marge: true }), 1024);
// Thème monochrome Android : une silhouette pleine, sans dégradé ni contour.
rendre('android-icon-monochrome.png', `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 100 100">
  <g transform="translate(50 50) scale(0.78) translate(-58 -42)" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="2.6" stroke-linejoin="round">
    <path d="M28 27 C32 7, 42 14, 45 5 C51 13, 55 7, 58 17 C64 9, 71 16, 68 29 Z"/>
    <path d="M28 46 C28 28, 44 20, 58 24 C72 28, 78 40, 76 52 C74 68, 62 78, 48 78 C34 78, 26 66, 28 46 Z"/>
    <path d="M74 46 L94 52 L74 60 Z"/>
    <path d="M70 58 C78 60, 80 70, 73 73 C67 76, 63 66, 67 58 Z"/>
  </g></svg>`, 1024);
rendre('android-icon-background.png', `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 100 100">
  <defs><radialGradient id="f" cx="0.5" cy="0.42" r="0.75">
    <stop offset="0" stop-color="#4B2B72"/><stop offset="0.6" stop-color="#22123A"/><stop offset="1" stop-color="#0B0714"/>
  </radialGradient></defs>
  <rect width="100" height="100" fill="url(#f)"/>${rayons(12, OR, 0.09)}</svg>`, 1024);
