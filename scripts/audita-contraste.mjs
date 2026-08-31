/**
 * Auditoria de contraste, alvo de toque e overflow — medindo no DOM real,
 * não a olho e não a partir dos tokens.
 *
 * Requer o Chrome instalado e o playwright-core:
 *   npm i -D playwright-core
 *
 * Uso:
 *   npm run dev            (em outro terminal)
 *   node scripts/audita-contraste.mjs http://localhost:5600/
 */
import { chromium } from 'playwright-core';

const URL_ALVO = process.argv[2] || 'http://localhost:5600/';
const VIEWPORTS = [[390, 844, 'mobile'], [768, 1024, 'tablet'], [1440, 900, 'desktop']];

/* --- WCAG 2.x: luminância relativa e razão de contraste --------------------- */
const canal = (v) => {
  v /= 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};
const luminancia = (r, g, b) => 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
const razao = (a, b) => {
  const l1 = luminancia(...a), l2 = luminancia(...b);
  const [alto, baixo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (alto + 0.05) / (baixo + 0.05);
};
const rgb = (css) => {
  const m = css.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/);
  return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null;
};

const navegador = await chromium.launch({ channel: 'chrome' });
let falhasTotais = 0;

for (const [largura, altura, nome] of VIEWPORTS) {
  const pagina = await navegador.newPage({ viewport: { width: largura, height: altura } });
  await pagina.goto(URL_ALVO, { waitUntil: 'networkidle' });
  // a revelação por scroll deixaria tudo fora da viewport invisível na medição
  await pagina.addStyleTag({
    content: '[data-revela]{animation:none!important;opacity:1!important;transform:none!important}',
  });

  const dados = await pagina.evaluate(() => {
    const saida = {
      overflow: document.body.scrollWidth > document.documentElement.clientWidth,
      bodyW: document.body.scrollWidth,
      vw: document.documentElement.clientWidth,
      alvosPequenos: [],
      textos: [],
    };

    document.querySelectorAll('a,button,input,select,textarea,[role=button]').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      if (el.closest('[hidden]')) return;
      // exceção "inline" da WCAG 2.5.8: alvo dentro de um bloco de texto
      if (getComputedStyle(el).display === 'inline') return;
      if (r.width < 24 || r.height < 24) {
        saida.alvosPequenos.push(
          (el.textContent || el.tagName).trim().slice(0, 32) +
          ' · ' + Math.round(r.width) + 'x' + Math.round(r.height)
        );
      }
    });

    const escondido = (el) => !!(el.closest('[hidden]') || el.offsetParent === null &&
      getComputedStyle(el).position !== 'fixed');

    const vistos = new Set();
    document.querySelectorAll('p,h1,h2,h3,h4,a,span,li,label,button,b').forEach((el) => {
      if (!el.textContent.trim()) return;
      if (escondido(el)) return;
      if (el.children.length > 0 && el.tagName !== 'BUTTON') return;
      const cs = getComputedStyle(el);
      let alvo = el, fundo = 'rgba(0, 0, 0, 0)';
      while (alvo && alvo !== document.documentElement) {
        const c = getComputedStyle(alvo).backgroundColor;
        if (c && !c.startsWith('rgba(0, 0, 0, 0)')) { fundo = c; break; }
        alvo = alvo.parentElement;
      }
      const chave = cs.color + '|' + fundo + '|' + cs.fontSize + '|' + cs.fontWeight;
      if (vistos.has(chave)) return;
      vistos.add(chave);
      saida.textos.push({
        cor: cs.color, fundo,
        px: parseFloat(cs.fontSize), peso: cs.fontWeight,
        exemplo: el.textContent.trim().slice(0, 40),
      });
    });
    return saida;
  });

  console.log('\n===== ' + nome + ' (' + largura + 'px) =====');
  console.log('scroll horizontal: ' + (dados.overflow ? 'SIM — ' + dados.bodyW + ' > ' + dados.vw : 'não'));
  if (dados.alvosPequenos.length) {
    console.log('alvos abaixo de 24px: ' + dados.alvosPequenos.join(' | '));
    falhasTotais += dados.alvosPequenos.length;
  }

  const falhas = [];
  for (const t of dados.textos) {
    const cor = rgb(t.cor), fundo = rgb(t.fundo);
    if (!cor || !fundo) continue;
    const misturada = [0, 1, 2].map((i) => Math.round(cor[i] * cor[3] + fundo[i] * (1 - cor[3])));
    const r = razao(misturada, fundo.slice(0, 3));
    const grande = t.px >= 24 || (t.px >= 18.66 && +t.peso >= 700);
    const minimo = grande ? 3 : 4.5;
    if (r < minimo) {
      falhas.push(
        '  X ' + r.toFixed(2) + ' (mínimo ' + minimo + ') · ' + t.px + 'px/' + t.peso +
        ' · ' + t.cor + ' sobre ' + t.fundo + ' — "' + t.exemplo + '"'
      );
    }
  }
  console.log('amostras de texto: ' + dados.textos.length + ' · falhas de contraste: ' + falhas.length);
  falhas.forEach((f) => console.log(f));
  falhasTotais += falhas.length;

  await pagina.close();
}

await navegador.close();
console.log('\n' + (falhasTotais === 0 ? 'OK — nenhuma falha.' : falhasTotais + ' item(ns) a corrigir.'));
process.exit(falhasTotais === 0 ? 0 : 1);
