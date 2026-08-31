/**
 * Prepara as artes digitais para publicação a partir dos originais em `_fonte/`.
 *
 *   node scripts/prepara-artes.mjs
 *
 * Além dos arquivos, este script REESCREVE o bloco de cards do `index.html`
 * entre os marcadores `<!-- ARTES:INICIO -->` e `<!-- ARTES:FIM -->`. É de
 * propósito: peso e dimensão aparecem na página, e número copiado à mão
 * envelhece na primeira troca de arte. Uma fonte da verdade só — este arquivo.
 * O `index.html` continua completo no repo (o GitHub Pages publica o que está
 * versionado), então isto não é etapa de build: é geração de código-fonte.
 *
 * Para cada arte declarada em ARTES, gera três coisas na pasta da família:
 *
 *   1. o arquivo de DOWNLOAD, em JPEG, no tamanho original. JPEG e não WebP de
 *      propósito: o arquivo vai virar papel de parede de celular, e o caminho
 *      "segurar a imagem → Salvar" do iOS e de galerias Android antigas é
 *      previsível em JPEG e não é em WebP. Peso aqui importa menos que abrir
 *      em qualquer lugar;
 *   2. a PRÉVIA da página, em WebP a 45% do lado. É ela que aparece no card;
 *      quem baixa recebe o arquivo do item 1, não este;
 *   3. a linha correspondente do `manifesto.json`, com dimensão e peso reais
 *      medidos do arquivo gerado — a página anuncia o peso do download, e
 *      número escrito à mão envelhece na primeira troca de arte.
 *
 * O EXIF do original é descartado (`.withMetadata()` NÃO é chamado). Não há
 * dado sensível nos três primeiros arquivos — foi conferido —, mas arte que
 * sai do celular ou da câmera de alguém carrega data, aparelho e às vezes GPS,
 * e este script é o funil por onde toda arte futura passa.
 *
 * Trocar de arte NÃO toca em código: substitui o arquivo em `_fonte/`, ajusta
 * o título/descrição aqui embaixo e roda de novo.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const RAIZ = path.join('assets', 'wallpapers');
const FONTE = path.join(RAIZ, '_fonte');

/** Uma entrada por arte. `arquivo` é o nome dentro de `_fonte/`. */
const ARTES = [
  {
    slug: 'coragem-e-coracao',
    arquivo: 'coragem-e-coracao.jpg',
    titulo: 'Coragem e Coração',
    descricao:
      'O retrato de campanha com a assinatura completa — nome, cargo, número e o lema. ' +
      'O bloco de texto fica na parte de baixo, onde o relógio da tela de bloqueio não alcança.',
    alt:
      'Papel de parede vertical: Sarah Poncio de blusa cinza sobre fundo claro, à direita. ' +
      'À esquerda, em letras grandes, "SARAH PONCIO", a tarja "Deputada Federal", o número ' +
      '7777 e o lema "Coragem e Coração". Embaixo, a hashtag "#AgoraÉFederal". Na borda ' +
      'esquerda, na vertical, "Federação Renovação Solidária PRD/Solidariedade".',
  },
  {
    slug: 'dia-4-de-outubro',
    arquivo: 'dia-4-de-outubro.jpg',
    titulo: 'Dia 4 de outubro',
    descricao:
      'A data da eleição em balão de fala, junto de "Em defesa das mulheres". ' +
      'A assinatura sobe para o topo — é a arte para quem quer o rosto no centro da tela.',
    alt:
      'Papel de parede vertical: Sarah Poncio ao centro, sobre fundo claro. Acima dela, ' +
      '"SARAH PONCIO", a tarja "Deputada Federal", o número 7777 e o lema "Coragem e Coração". ' +
      'Dois balões de fala trazem "Dia 4 de outubro vote 7777" e "Em defesa das mulheres". ' +
      'No rodapé, a hashtag "#AgoraÉFederal". Na borda esquerda, na vertical, ' +
      '"Federação Renovação Solidária PRD/Solidariedade".',
  },
  {
    slug: 'padrao-coracoes',
    arquivo: 'padrao-coracoes.jpg',
    titulo: 'Padrão de corações',
    descricao:
      'Sem foto: a assinatura 7777 repetida entre corações azuis e laranja. ' +
      'É a mais discreta das três — funciona atrás dos ícones sem competir com eles.',
    alt:
      'Papel de parede vertical em fundo verde-acinzentado, com a assinatura "SARAH PONCIO / ' +
      'Deputada Federal / 7777" repetida em grade, intercalada por corações azuis e laranja. ' +
      'No rodapé, "Federação Renovação Solidária PRD/Solidariedade".',
  },
];

/** Lado maior da prévia. 45% de 1920 = 864 px: nítido em tela retina de card. */
const FATOR_PREVIA = 0.45;

const kb = (bytes) => Math.round(bytes / 1024);

const manifesto = [];

for (const arte of ARTES) {
  const origem = path.join(FONTE, arte.arquivo);
  if (!fs.existsSync(origem)) throw new Error(`arte não encontrada: ${origem}`);

  const meta = await sharp(origem).metadata();
  const { width: larg, height: alt } = meta;
  if (!larg || !alt) throw new Error(`não consegui ler a dimensão de ${origem}`);

  const nomeDownload = `${arte.slug}-${larg}x${alt}.jpg`;
  const nomePrevia = `${arte.slug}-previa.webp`;

  // 1. download — mesmo tamanho, sem EXIF, mozjpeg em qualidade alta.
  //    Qualidade 92 porque a arte tem áreas chapadas grandes (o fundo do
  //    ciclorama e o fundo do padrão): abaixo disso o degradê do fundo
  //    ganha faixas visíveis numa tela OLED de celular.
  await sharp(origem)
    .jpeg({ quality: 92, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(path.join(RAIZ, nomeDownload));

  // 2. prévia — WebP, só para a página.
  await sharp(origem)
    .resize({ width: Math.round(larg * FATOR_PREVIA) })
    .webp({ quality: 82 })
    .toFile(path.join(RAIZ, nomePrevia));

  const pesoDownload = fs.statSync(path.join(RAIZ, nomeDownload)).size;
  const previaMeta = await sharp(path.join(RAIZ, nomePrevia)).metadata();

  manifesto.push({
    slug: arte.slug,
    titulo: arte.titulo,
    descricao: arte.descricao,
    alt: arte.alt,
    download: { arquivo: nomeDownload, largura: larg, altura: alt, kb: kb(pesoDownload) },
    previa: { arquivo: nomePrevia, largura: previaMeta.width, altura: previaMeta.height },
  });

  console.log(
    `${arte.slug.padEnd(20)} download ${larg}x${alt} ${String(kb(pesoDownload)).padStart(4)} KB` +
      `   prévia ${previaMeta.width}x${previaMeta.height}`
  );
}

fs.writeFileSync(
  path.join(RAIZ, 'manifesto.json'),
  JSON.stringify({ artes: manifesto }, null, 2) + '\n'
);
console.log(`\n${manifesto.length} artes → ${path.join(RAIZ, 'manifesto.json')}`);

/* --- varre o que sobrou de rodadas anteriores -------------------------------
   O nome do arquivo de download leva a dimensão dentro (`slug-1080x1920.jpg`),
   então trocar uma arte por outra de tamanho diferente deixava a antiga na
   pasta. Num repositório servido pelo GitHub Pages isso não é lixo inofensivo:
   o arquivo velho continua publicado, no endereço velho, e quem tiver o link
   antigo baixa a arte que a campanha já tirou do ar. */
const esperados = new Set(manifesto.flatMap((a) => [a.download.arquivo, a.previa.arquivo, 'manifesto.json']));
const orfaos = fs.readdirSync(RAIZ)
  .filter((f) => fs.statSync(path.join(RAIZ, f)).isFile())
  .filter((f) => !esperados.has(f));
for (const f of orfaos) {
  fs.unlinkSync(path.join(RAIZ, f));
  console.log(`removido (sobra de rodada anterior): ${f}`);
}

/* --- os cards do index.html ------------------------------------------------
   O nome do arquivo baixado leva "sarah-poncio-7777" na frente: o arquivo vai
   parar na pasta de downloads de gente que baixou outras dez coisas hoje, e
   "coragem-e-coracao.jpg" sozinho não diz de quem é.
   O `&quot;` no alt não é firula: o texto das artes tem aspas e o atributo é
   delimitado por aspas duplas. */
const esc = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const ICONE_BAIXAR =
  '<svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" ' +
  'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M12 3v12m0 0 4.6-4.6M12 15l-4.6-4.6M4 19h16"/></svg>';

const cards = manifesto.map((a) => {
  const arq = `${RAIZ.split(path.sep).join('/')}/${a.download.arquivo}`;
  const prev = `${RAIZ.split(path.sep).join('/')}/${a.previa.arquivo}`;
  return `      <li class="arte">
        <a class="arte__previa" href="${arq}" target="_blank" rel="noopener">
          <img src="${prev}" width="${a.previa.largura}" height="${a.previa.altura}" loading="lazy" decoding="async"
               alt="${esc(a.alt)}">
        </a>
        <div class="arte__corpo">
          <h3 class="arte__titulo">${esc(a.titulo)}</h3>
          <p class="arte__txt">${esc(a.descricao)}</p>
          <p class="arte__ficha">${a.download.largura} × ${a.download.altura} · ${a.download.kb} KB · JPG</p>
          <div class="arte__acoes">
            <a class="btn btn--navy" href="${arq}" download="sarah-poncio-7777-${a.slug}.jpg">
              ${ICONE_BAIXAR}
              Baixar
            </a>
            <a class="link" href="${arq}" target="_blank" rel="noopener">Abrir imagem</a>
          </div>
        </div>
      </li>`;
}).join('\n');

const INICIO = '<!-- ARTES:INICIO';
const FIM = '<!-- ARTES:FIM -->';
const html = fs.readFileSync('index.html', 'utf8');
const iIni = html.indexOf(INICIO);
const iFim = html.indexOf(FIM);
if (iIni === -1 || iFim === -1) {
  throw new Error('não achei os marcadores ARTES:INICIO / ARTES:FIM no index.html');
}
// o marcador de abertura tem comentário de várias linhas: recorta até o `-->` dele
const fimDoComentario = html.indexOf('-->', iIni) + 3;
const novo =
  html.slice(0, fimDoComentario) +
  '\n    <ul class="grade">\n' + cards + '\n    </ul>\n    ' +
  html.slice(iFim);
fs.writeFileSync('index.html', novo);
console.log(`${manifesto.length} cards → index.html (bloco ARTES)`);
