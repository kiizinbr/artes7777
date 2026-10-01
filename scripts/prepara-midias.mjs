/**
 * Prepara os VÍDEOS e os CARDS da campanha e reescreve os dois blocos deles no
 * `index.html` — entre `<!-- VIDEOS:INICIO -->`/`<!-- VIDEOS:FIM -->` e
 * `<!-- CARDS:INICIO -->`/`<!-- CARDS:FIM -->`. Mesma regra do
 * `prepara-artes.mjs`: peso e duração são MEDIDOS do arquivo publicado, então
 * não editar aqueles blocos à mão.
 *
 *   node scripts/prepara-midias.mjs
 *
 * Cada peça ganha um `id` próprio e, com ele, um LINK DIRETO
 * (…/artes7777/#video-faltam-3-dias) — é o que a campanha manda no WhatsApp.
 * O link abre a página já rolada até a peça, com o player e o botão de baixar.
 * ⚠️ Esses ids já vão circular: trocar um `slug` mata o link que foi mandado.
 *
 * Vídeos: entram JÁ recodificados (720p, ~1,3 MB) a partir de
 * `assets/midias/_fonte/`. Os originais da campanha vêm a 30 Mbps (37–56 MB) —
 * recodificar com:
 *   ffmpeg -i ORIGINAL.mp4 -vf "scale=720:-2:flags=lanczos,fps=30" -c:v libx264 \
 *     -profile:v high -preset slow -crf 25 -maxrate 2200k -bufsize 4400k \
 *     -pix_fmt yuv420p -c:a aac -b:a 96k -ac 2 -movflags +faststart SAIDA.mp4
 * A capa (poster) é um frame escolhido à mão, em WebP, ao lado do vídeo.
 * ⚠️ `assets/midias/_fonte/` fica FORA do git (.gitignore): repo público no Pages
 * publica todo arquivo versionado, e original de celular/câmera carrega EXIF.
 *
 * Cards: a imagem de download sai em JPEG (mesma razão dos papéis de parede:
 * "segurar → Salvar" é previsível em JPEG), sem EXIF, e a prévia em WebP.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const RAIZ = path.join('assets', 'midias');
const FONTE = path.join(RAIZ, '_fonte');
const BASE = 'https://kiizinbr.github.io/artes7777/';

const VIDEOS = [
  { slug: 'urna-7777', titulo: 'Na urna: 7777, confirma',
    descricao: 'Sarah digita 7777 na urna e confirma.',
    whats: 'Na urna é 7777 e confirma!' },
  { slug: 'faltam-5-dias', titulo: 'Faltam 5 dias', descricao: 'Contagem para o dia 4 de outubro.',
    whats: 'Faltam 5 dias para votar 7777!' },
  { slug: 'faltam-3-dias', titulo: 'Faltam 3 dias', descricao: 'Contagem para o dia 4 de outubro.',
    whats: 'Faltam 3 dias para votar 7777!' },
  { slug: 'faltam-2-dias', titulo: 'Faltam 2 dias', descricao: 'Contagem para o dia 4 de outubro.',
    whats: 'Faltam 2 dias para votar 7777!' },
];

const CARDS = [
  { slug: '5-curiosidades', arquivo: '5-curiosidades.jpg', titulo: '5 curiosidades sobre mim',
    whats: '5 curiosidades sobre a Sarah Poncio 7777',
    alt: 'Card vertical: 5 curiosidades sobre mim. 01, nascida em Caxias. 02, deputada mais ' +
      'jovem da Alerj. 03, criadora da Lei do Spray. 04, líder de bancada mais jovem da Alerj. ' +
      '05, destaque em pautas voltadas aos direitos das mulheres, apoio a mães atípicas, ' +
      'inclusão social e proteção animal. Ao lado, foto de Sarah Poncio na Alerj.' },
];

const mb = (bytes) => (bytes / 1024 / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' MB';
const kb = (bytes) => bytes < 1024 * 1024 ? Math.round(bytes / 1024) + ' kB' : mb(bytes);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const duracao = (f) => Math.round(Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries',
  'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }).trim()));

const ICONE_BAIXAR = '<svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0 4.6-4.6M12 15l-4.6-4.6M4 19h16"/></svg>';
const ICONE_LINK = '<svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2"/></svg>';
const ICONE_ZAP = '<svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.17c-.24.68-1.42 1.31-1.96 1.36-.5.05-.98.23-3.3-.69-2.78-1.1-4.55-3.94-4.69-4.12-.14-.18-1.12-1.49-1.12-2.85 0-1.35.71-2.02.96-2.29.25-.28.55-.35.73-.35.18 0 .37 0 .53.01.17.01.4-.06.63.48.24.55.8 1.9.87 2.04.07.14.12.3.02.48-.09.18-.14.29-.28.45-.14.16-.3.36-.42.48-.14.14-.29.29-.12.57.16.28.73 1.2 1.56 1.94 1.07.95 1.97 1.25 2.25 1.39.28.14.44.12.6-.07.17-.19.7-.81.88-1.09.18-.28.37-.23.62-.14.25.09 1.6.75 1.87.89.28.14.46.21.53.32.07.11.07.65-.17 1.33Z"/></svg>';

/* Os três botões de toda peça. "Copiar link" nasce `hidden`: sem JS ele não
   funciona, e botão que não faz nada é pior que botão nenhum. O WhatsApp é link
   puro (wa.me sem número = o apoiador escolhe para quem manda) e funciona sem JS. */
function acoes({ id, titulo, arquivo, nomeDownload, whats }) {
  const link = BASE + '#' + id;
  const texto = encodeURIComponent(whats + ' ' + link);
  return `        <div class="midia__acoes">
          <a class="btn btn--navy" href="${arquivo}" download="${nomeDownload}" aria-label="Baixar: ${esc(titulo)}">
            ${ICONE_BAIXAR}
            Baixar
          </a>
          <button class="btn btn--linha" type="button" data-copia="${link}" hidden aria-label="Copiar o link direto de: ${esc(titulo)}">
            ${ICONE_LINK}
            <span data-copia-rotulo>Copiar link</span>
          </button>
          <a class="btn btn--primario" href="https://wa.me/?text=${texto}" target="_blank" rel="noopener noreferrer" aria-label="Enviar no WhatsApp: ${esc(titulo)}">
            ${ICONE_ZAP}
            WhatsApp
          </a>
        </div>`;
}

/* --- vídeos ---------------------------------------------------------------- */
const blocoVideos = VIDEOS.map((v) => {
  const id = 'video-' + v.slug;
  for (const ext of ['mp4', 'webp']) {
    const de = path.join(FONTE, `${v.slug}.${ext}`);
    if (!fs.existsSync(de)) throw new Error('falta ' + de);
    fs.copyFileSync(de, path.join(RAIZ, `${v.slug}.${ext}`));
  }
  const mp4 = path.join(RAIZ, `${v.slug}.mp4`);
  const rel = `assets/midias/${v.slug}`;
  const peso = fs.statSync(mp4).size;
  const seg = duracao(mp4);
  return `      <li class="arte midia" id="${id}">
        <div class="arte__previa">
          <video controls playsinline preload="none" poster="${rel}.webp" aria-label="Vídeo: ${esc(v.titulo)}">
            <source src="${rel}.mp4" type="video/mp4">
          </video>
        </div>
        <div class="midia__corpo">
          <h3 class="midia__titulo">${v.titulo}</h3>
          <p class="midia__meta">${v.descricao} Vídeo · ${seg} s · ${mb(peso)}</p>
${acoes({ id, titulo: v.titulo, arquivo: rel + '.mp4', nomeDownload: `sarah-poncio-7777-${v.slug}.mp4`, whats: v.whats })}
        </div>
      </li>`;
}).join('\n');

/* --- cards ----------------------------------------------------------------- */
const blocoCards = (await Promise.all(CARDS.map(async (c) => {
  const id = 'card-' + c.slug;
  const de = path.join(FONTE, c.arquivo);
  if (!fs.existsSync(de)) throw new Error('falta ' + de);
  const jpg = path.join(RAIZ, `${c.slug}-1080x1920.jpg`);
  const previa = path.join(RAIZ, `${c.slug}-previa.webp`);
  // sem .withMetadata(): o EXIF do original NÃO vai junto
  await sharp(de).resize(1080, 1920, { fit: 'cover' }).jpeg({ quality: 86, mozjpeg: true }).toFile(jpg);
  await sharp(de).resize(486, 864, { fit: 'cover' }).webp({ quality: 80 }).toFile(previa);
  const rel = `assets/midias/${c.slug}`;
  return `      <li class="arte midia" id="${id}">
        <a class="arte__previa" href="${rel}-1080x1920.jpg" target="_blank" rel="noopener">
          <img src="${rel}-previa.webp" width="486" height="864" loading="lazy" decoding="async"
               alt="${esc(c.alt)}">
        </a>
        <div class="midia__corpo">
          <h3 class="midia__titulo">${c.titulo}</h3>
          <p class="midia__meta">Imagem · 1080 × 1920 · ${kb(fs.statSync(jpg).size)}</p>
${acoes({ id, titulo: c.titulo, arquivo: rel + '-1080x1920.jpg', nomeDownload: `sarah-poncio-7777-${c.slug}.jpg`, whats: c.whats })}
        </div>
      </li>`;
}))).join('\n');

/* --- reescreve os blocos ---------------------------------------------------- */
// O index.html está em CRLF (Windows): trabalha em LF e devolve no formato que veio
const bruto = fs.readFileSync('index.html', 'utf8');
const crlf = bruto.includes('\r\n');
let html = bruto.split('\r\n').join('\n');
const troca = (nome, miolo) => {
  const re = new RegExp(`(<!-- ${nome}:INICIO[\\s\\S]*?-->\\n)[\\s\\S]*?(\\s*<!-- ${nome}:FIM -->)`);
  if (!re.test(html)) throw new Error(`index.html sem os marcadores ${nome}:INICIO / ${nome}:FIM`);
  html = html.replace(re, (_, a, b) => `${a}    <ul class="grade grade--midias">\n${miolo}\n    </ul>${b}`);
};
troca('VIDEOS', blocoVideos);
troca('CARDS', blocoCards);
fs.writeFileSync('index.html', crlf ? html.split('\n').join('\r\n') : html);

console.log(`${VIDEOS.length} vídeos e ${CARDS.length} card(s) prontos. Links diretos:`);
for (const v of VIDEOS) console.log('  ' + BASE + '#video-' + v.slug);
for (const c of CARDS) console.log('  ' + BASE + '#card-' + c.slug);
