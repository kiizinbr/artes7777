/**
 * Gera o cartão de link (Open Graph) em `assets/brand/cartao.png`, 1200×630.
 *
 *   node scripts/monta-cartao.mjs
 *
 * Por que existe: o endereço vai circular em grupo de WhatsApp, e link sem
 * cartão vira uma linha azul que ninguém clica — o cartão é metade da difusão.
 *
 * Renderiza no Chrome em vez de compor a imagem em código: assim usa as mesmas
 * fontes e as mesmas cores do site, e não abre uma segunda fonte da verdade
 * para a identidade visual.
 *
 * As fontes entram como data URI a partir de `assets/fonts/`. Não é firula de
 * offline: puxá-las do fonts.googleapis.com aqui reintroduziria pela porta dos
 * fundos exatamente o que o CSS do projeto proíbe na porta da frente, e o
 * arquivo gerado ficaria refém de a máquina de quem gera ter internet.
 *
 * As três miniaturas são as PRÉVIAS de verdade, lidas de assets/wallpapers/.
 * Trocar uma arte e rodar `prepara-artes.mjs` muda o cartão junto.
 */
import { chromium } from 'playwright-core';
import { readFile } from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.join('assets', 'wallpapers');

const fonte = async (arquivo) =>
  `data:font/woff2;base64,${(await readFile(path.join('assets', 'fonts', arquivo))).toString('base64')}`;

const anton = await fonte('anton-400-latin.woff2');
const barlow700 = await fonte('barlow-700-latin.woff2');
const barlowCond = await fonte('barlow-condensed-700-latin.woff2');

const manifesto = JSON.parse(fs.readFileSync(path.join(RAIZ, 'manifesto.json'), 'utf8'));
const previas = await Promise.all(
  manifesto.artes.slice(0, 3).map(async (a) =>
    `data:image/webp;base64,${(await readFile(path.join(RAIZ, a.previa.arquivo))).toString('base64')}`
  )
);
if (previas.length < 3) throw new Error(`o cartão espera 3 prévias, o manifesto tem ${previas.length}`);

const PAGINA = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<style>
  @font-face { font-family: "Anton"; src: url("${anton}") format("woff2"); }
  @font-face { font-family: "Barlow"; font-weight: 700; src: url("${barlow700}") format("woff2"); }
  @font-face { font-family: "Barlow Condensed"; font-weight: 700; src: url("${barlowCond}") format("woff2"); }

  * { box-sizing: border-box; margin: 0; }
  body {
    width: 1200px; height: 630px; overflow: hidden; background: #172053;
    display: flex; align-items: center; gap: 40px; padding: 0 0 0 64px;
    font-family: "Barlow", sans-serif; color: #fff; position: relative;
  }
  /* Campo escuro cortado na diagonal, atrás do leque — é o corte diagonal da
     direção visual, e a profundidade sai de massa de cor, não de sombra.
     Feito com navy-950 CHAPADO, não com laranja transparente: laranja a 14%
     sobre navy vira roxo, e roxo não está na paleta desta campanha. */
  .campo { position: absolute; right: 0; top: 0; bottom: 0; width: 620px;
           background: #0a0f2e; clip-path: polygon(148px 0, 100% 0, 100% 100%, 0 100%); }
  /* e a faixa laranja fina, essa sim, correndo na borda do corte */
  .fio { position: absolute; right: 468px; top: -60px; width: 9px; height: 780px;
         background: #fe6f29; transform: rotate(10.7deg); transform-origin: top center; }
  .texto { flex: 1; position: relative; }
  .chapeu { font-family: "Barlow Condensed", sans-serif; font-size: 27px; font-weight: 700;
            letter-spacing: .22em; text-transform: uppercase; color: #fe6f29; margin-bottom: 20px; }
  h1 { font-family: Anton, sans-serif; font-weight: 400; font-size: 86px; line-height: 1.06;
       text-transform: uppercase; letter-spacing: .012em; }
  h1 em { font-style: normal; color: #fe6f29; }
  p { font-size: 30px; font-weight: 700; color: rgba(255,255,255,.86); margin-top: 24px; line-height: 1.3; }

  /* Leque de três: a arte da frente inteira, as de trás só o bastante para o
     olho contar "são várias". Giro pequeno — em 1200x630 o WhatsApp corta as
     bordas, então nada encosta na margem. */
  .leque { position: relative; width: 470px; height: 630px; flex: none; }
  .leque img { position: absolute; top: 96px; width: 232px; height: 412px;
               object-fit: cover; border: 4px solid #0a0f2e; }
  .leque img:nth-child(1) { left: 0;   transform: rotate(-7deg); }
  .leque img:nth-child(2) { left: 200px; top: 78px; transform: rotate(3deg); z-index: 2; }
  .leque img:nth-child(3) { left: 118px; top: 150px; transform: rotate(-2deg); z-index: 1; }
  .pe { position: absolute; left: 0; right: 0; bottom: 0; height: 16px; background: #fe6f29; }
</style></head>
<body>
  <div class="campo"></div>
  <div class="fio"></div>
  <div class="texto">
    <div class="chapeu">Sarah Poncio · Deputada Federal</div>
    <h1>Artes <em>digitais</em><br>da campanha</h1>
    <p>Papel de parede e moldura de perfil. De graça.</p>
  </div>
  <div class="leque">
    <img src="${previas[0]}" alt="">
    <img src="${previas[1]}" alt="">
    <img src="${previas[2]}" alt="">
  </div>
  <div class="pe"></div>
</body></html>`;

const navegador = await chromium.launch({ channel: 'chrome' });
const p = await navegador.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await p.setContent(PAGINA, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
fs.mkdirSync(path.join('assets', 'brand'), { recursive: true });
await p.screenshot({ path: path.join('assets', 'brand', 'cartao.png') });
await navegador.close();

console.log('assets/brand/cartao.png — 1200x630');
