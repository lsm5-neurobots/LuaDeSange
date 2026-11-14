// Monta os pacotes de arte procedural a partir de art-src/ (um arquivo por factory).
// ART_EXP = expedição (zumbis, objetos, mapa) · ART_HUB = herói, recrutas, pets, abrigo.
// Cada pacote roda num escopo isolado com seu próprio PIX (escala independente).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(here, '../art-src'), OUT = path.resolve(here, '../public/art');
fs.mkdirSync(OUT, { recursive: true });

const BUNDLES = {
  ART_EXP: {
    file: 'art-exp.js',
    parts: ['shared/pix', 'shared/items', 'shared/tween', 'shared/gore', 'shared/fx', 'shared/baton', 'shared/strikes', 'shared/moveset', 'shared/zreact', 'shared/vigia', 'shared/bosskit',
      'zombies/err', 'zombies/ras', 'zombies/cor', 'zombies/cusp', 'zombies/grit', 'zombies/barr', 'zombies/salt', 'zombies/brut', 'zombies/acou', 'zombies/chorona', 'zombies/meianoite', 'zombies/estalador', 'zombies/blindado', 'zombies/estivador', 'zombies/ascensorista', 'zombies/vendedorfitas', 'zombies/erveira', 'zombies/percussionista', 'zombies/barqueiro', 'zombies/malandro', 'zombies/passista', 'zombies/maquinista', 'zombies/frevista', 'zombies/baiana', 'zombies/turista', 'zombies/peixeiro', 'zombies/acaizeiro', 'zombies/seresteiro', 'zombies/garcom', 'zombies/grafiteiro', 'zombies/seringueiro', 'zombies/garimpeiro', 'zombies/bugio', 'zombies/piranha', 'zombies/onca', 'zombies/cobragrande', 'zombies/peao', 'zombies/tuiuiu', 'zombies/queixada', 'zombies/ariranha', 'zombies/tamandua', 'zombies/reijacare',
      'objects/obj', 'objects/bau', 'objects/puzzle', 'shared/clima', 'map/marco-zero', 'map/olinda', 'map/pelourinho', 'map/ver-o-peso', 'map/lapa', 'map/amazonia', 'map/pantanal'],
    exports: ['PIX', 'ITEMS', 'TWEEN', 'GORE', 'FX', 'BATON', 'VIGIA', 'ERR', 'RAS', 'COR', 'CUSP', 'GRIT', 'BARR', 'SALT', 'BRUT', 'ACOU', 'CHORONA', 'MEIANOITE', 'ESTALADOR', 'BLINDADO', 'ESTIVADOR', 'ASCENSORISTA', 'VENDEDORFITAS', 'ERVEIRA', 'PERCUSSIONISTA', 'BARQUEIRO', 'MALANDRO', 'PASSISTA', 'MAQUINISTA', 'FREVISTA', 'BAIANA', 'TURISTA', 'PEIXEIRO', 'ACAIZEIRO', 'SERESTEIRO', 'GARCOM', 'GRAFITEIRO', 'SERINGUEIRO', 'GARIMPEIRO', 'BUGIO', 'PIRANHA', 'ONCA', 'COBRAGRANDE', 'PEAO', 'TUIUIU', 'QUEIXADA', 'ARIRANHA', 'TAMANDUA', 'REIJACARE', 'OBJ', 'BAU', 'PUZZLE', 'CLIMA', 'MAP', 'OLINDA', 'PELOURINHO', 'VEROPESO', 'LAPA', 'AMAZONIA', 'PANTANAL'],
  },
  ART_HUB: {
    file: 'art-hub.js',
    parts: ['shared/pix', 'shared/items', 'shared/tween', 'shared/baton', 'shared/strikes', 'shared/moveset', 'shared/zreact', 'shared/gun', 'shared/armas-icon', 'shared/golpe-icons', 'shared/menu-icons', 'shared/heroi', 'shared/vigia',
      'hub/recruta_base', 'hub/serralheiro', 'hub/pedreira', 'hub/lenhador', 'hub/cata', 'hub/agri', 'hub/capo', 'hub/enfe',
      'hub/petcore', 'hub/pet_cachorro', 'hub/pet_gato', 'hub/pet_capivara', 'hub/jabu', 'hub/papa', 'hub/sagu',
      'zombies/cusp', 'zombies/grit', 'zombies/barr', 'shared/clima', 'hub/abrigo'],
    exports: ['PIX', 'ITEMS', 'TWEEN', 'BATON', 'GUN', 'ARMAS_ICON', 'GOLPES_ICON', 'MENU_ICON', 'HEROI', 'VIGIA', 'SERRALHEIRO', 'PEDREIRA', 'LENHADOR', 'CATA', 'AGRI', 'CAPO', 'ENFE',
      'PET_CACHORRO', 'PET_GATO', 'PET_CAPIVARA', 'JABU', 'PAPA', 'SAGU', 'CUSP', 'GRIT', 'BARR', 'CLIMA', 'ABRIGO'],
  },
};

for (const [name, b] of Object.entries(BUNDLES)) {
  const body = b.parts.map((p) => {
    const f = path.join(SRC, p + '.js');
    if (!fs.existsSync(f)) throw new Error('arte não encontrada: ' + p);
    return `/* ===== ${p} ===== */\n` + fs.readFileSync(f, 'utf8');
  }).join('\n');
  const ret = b.exports.map((n) => `${n}:typeof ${n}!=='undefined'?${n}:null`).join(',');
  // versão = hash do pacote: chave do cache persistente de quadros (IndexedDB) — mudou a arte, os quadros salvos caem
  const ver = crypto.createHash('sha1').update(body).digest('hex').slice(0, 12);
  const out = `/* gerado por tools/build-art.mjs a partir de art-src/ — não editar aqui */\nwindow.${name}=(function(){\nconst __BUNDLE='${name}', __ARTV='${ver}';\n${body}\nPIX.seal();\nreturn {${ret}};\n})();\n`;
  fs.writeFileSync(path.join(OUT, b.file), out);
  console.log(b.file, (out.length / 1024).toFixed(0) + ' KB');
}

// worker de geração em segundo plano (mesmos pacotes, OffscreenCanvas)
fs.copyFileSync(path.join(SRC, 'worker/art-worker.js'), path.join(OUT, 'art-worker.js'));
console.log('art-worker.js copiado');
