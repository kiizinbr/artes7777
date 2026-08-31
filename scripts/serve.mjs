/**
 * Servidor estático de desenvolvimento. Sem dependência externa.
 * Uso: npm run dev  →  http://localhost:5600
 *
 * Porta própria: 5173 é o site da campanha e 5599 é o gerador de moldura. Os três
 * rodam ao mesmo tempo quando se compara um com o outro.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORTA = Number(process.env.PORT || 5600);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.pdf':  'application/pdf',
};

http.createServer((req, res) => {
  // decodeURIComponent LANÇA em percent malformado ("%zz", "%"). Sem este
  // try/catch uma URL torta derrubava o processo inteiro do servidor.
  let rota;
  try {
    rota = decodeURIComponent(req.url.split('?')[0]);
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('400 — URL malformada');
    return;
  }
  if (rota.indexOf('\0') !== -1) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('400');
    return;
  }
  if (rota.endsWith('/')) rota += 'index.html';

  const arquivo = path.join(RAIZ, rota);
  // Impede sair da raiz do projeto. `path.relative`, e não `startsWith(RAIZ)`:
  // com startsWith de string uma pasta IRMÃ de nome parecido (…/artes7777-ANTIGO)
  // passaria, porque o caminho dela começa com o mesmo prefixo.
  const dentro = path.relative(RAIZ, arquivo);
  if (dentro.startsWith('..') || path.isAbsolute(dentro)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403');
    return;
  }

  fs.readFile(arquivo, (erro, dados) => {
    if (erro) {
      // text/plain, e não HTML: a rota vem do visitante, e devolvê-la crua
      // dentro de <code> era XSS refletido de brinde num servidor de dev.
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 — não achei ' + rota);
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(arquivo).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(dados);
  });
// 127.0.0.1, nao 0.0.0.0: e servidor de desenvolvimento, nao precisa ficar
// exposto para a rede local enquanto alguem edita um wallpaper.
}).listen(PORTA, '127.0.0.1', () => {
  console.log('Site no ar em http://localhost:' + PORTA);
});
