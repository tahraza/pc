const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '..', 'annales');
const OUTPUT_FILE = path.join(__dirname, '..', 'content', 'annales-pdf.json');

// Mapping des sessions pour un affichage propre
const sessionNames = {
  'metropole': 'Métropole',
  'polynesie': 'Polynésie',
  'amerique-nord': 'Amérique du Nord',
  'amerique-sud': 'Amérique du Sud',
  'asie': 'Asie',
  'centres-etranger': 'Centres étrangers',
  'mayotte-liban': 'Mayotte-Liban',
  'liban': 'Liban',
  'nouv-caledonie': 'Nouvelle-Calédonie',
  'la-reunion': 'La Réunion',
  'suede': 'Suède',
};

function parseFilename(filename) {
  // Format: ANNÉE_spe-physique-chimie_SESSION_NUMÉRO_TYPE.pdf
  const match = filename.match(/^(\d{4})_spe-physique-chimie_([a-z-]+)_(\d{2})_(sujet|corrige)\.pdf$/);
  if (!match) return null;

  return {
    year: parseInt(match[1]),
    sessionId: match[2],
    session: sessionNames[match[2]] || match[2],
    number: parseInt(match[3]),
    type: match[4],
    filename: filename
  };
}

function main() {
  const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.pdf'));

  // Parser tous les fichiers
  const parsed = files.map(parseFilename).filter(Boolean);

  // Regrouper par année/session/numéro
  const grouped = {};

  for (const file of parsed) {
    const key = `${file.year}-${file.sessionId}-${String(file.number).padStart(2, '0')}`;

    if (!grouped[key]) {
      grouped[key] = {
        id: key,
        year: file.year,
        sessionId: file.sessionId,
        session: file.session,
        number: file.number,
        sujetFile: null,
        corrigeFile: null,
      };
    }

    if (file.type === 'sujet') {
      grouped[key].sujetFile = file.filename;
    } else {
      grouped[key].corrigeFile = file.filename;
    }
  }

  // Convertir en tableau et trier
  const annales = Object.values(grouped)
    .map(a => ({
      ...a,
      hasCorrige: a.corrigeFile !== null,
      sujetUrl: a.sujetFile ? `/annales/${a.sujetFile}` : null,
      corrigeUrl: a.corrigeFile ? `/annales/${a.corrigeFile}` : null,
    }))
    .sort((a, b) => {
      // Trier par année décroissante, puis par session, puis par numéro
      if (a.year !== b.year) return b.year - a.year;
      if (a.session !== b.session) return a.session.localeCompare(b.session);
      return a.number - b.number;
    });

  // Statistiques
  const stats = {
    total: annales.length,
    withCorrige: annales.filter(a => a.hasCorrige).length,
    byYear: {}
  };

  for (const a of annales) {
    stats.byYear[a.year] = (stats.byYear[a.year] || 0) + 1;
  }

  console.log('=== Statistiques ===');
  console.log(`Total: ${stats.total} sujets`);
  console.log(`Avec corrigé: ${stats.withCorrige}`);
  console.log('Par année:', stats.byYear);

  // Écrire le fichier JSON
  const output = { annales };
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\nFichier généré: ${OUTPUT_FILE}`);
}

main();
