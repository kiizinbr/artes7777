# Contexto para agentes — hub de artes digitais 7777

> ⚠️ **Este repositório é PÚBLICO e tudo nele é servido pelo GitHub Pages** — o
> `index.html`, sim, mas também todo `.md`, todo script e todo arquivo em `docs/`. Não
> guarde aqui nada que você não publicaria: pendência interna, nota jurídica, decisão de
> negócio, endereço, telefone, credencial. O material interno deste projeto mora no
> repositório **privado** `sarah-poncio-federal`, em `docs/PENDENCIAS-artes7777.md`.
> Isso não é hipótese: um dossiê de conformidade ficou servido em HTTP 200 aqui no dia
> em que o repo nasceu.

## O que é

O endereço onde o apoiador da campanha da **Sarah Poncio (Deputada Federal, RJ, nº 7777)**
pega arte pronta: papel de parede de celular hoje, o que vier depois amanhã. HTML
estático puro — sem framework, sem bundler, sem etapa de build. `npm run dev` serve os
mesmos arquivos que o Pages publica.

Publicado em **https://kiizinbr.github.io/artes7777/**.

**Não confundir com os dois vizinhos:**

| Repo | Endereço | O que é |
|---|---|---|
| `sarah-poncio-federal` (privado) | sarahponcio.com.br | o site da campanha (tema WordPress na GoDaddy) |
| `moldura7777` (público; pasta local `sarah-poncio-twibbon`) | kiizinbr.github.io/moldura7777 | o gerador de moldura de perfil |
| **este** | kiizinbr.github.io/artes7777 | o hub de artes, que lista os dois acima |

A moldura **não** foi movida para cá: o link dela já circulou em grupo de WhatsApp e
mudar de endereço mataria o que já foi compartilhado. Aqui ela é um destaque que aponta
para lá.

## Por que este repo existe, e não uma seção no site

Publicar arte nova aqui é `git push`. No site, cada arte exigiria rodar `gera-tema.mjs`,
subir o `.zip` no wp-admin da GoDaddy e conviver com o cache de imagem de 31 dias de lá.
A troca foi essa, e é a razão de a "aba" Artes digitais do header do site apontar para
fora em vez de para uma âncora interna.

O outro lado dessa moeda: **`git push` publica sozinho em cerca de um minuto, sem revisão
e sem ninguém no meio.** Trate cada commit como uma publicação.

## Regras que não são preferência

1. **As artes são as do designer, à risca.** Nada de layout inventado em código — a
   decisão é de 21/08/2026, tomada no repo da moldura depois de um ciclo perdido
   redesenhando a arte oficial. Arte nova entra por `assets/wallpapers/_fonte/` e uma
   entrada em `ARTES`, no `scripts/prepara-artes.mjs`.
2. **`prepara-artes.mjs` é a fonte da verdade dos cards.** Ele mede dimensão e peso do
   arquivo GERADO e reescreve o bloco entre `<!-- ARTES:INICIO -->` e `<!-- ARTES:FIM -->`
   do `index.html`. Não editar aquele bloco à mão: número copiado envelhece na primeira
   troca de arte, e a página anuncia o peso do download.
3. **Fontes moram em `assets/fonts`, não no Google.** Reintroduzir o `<link>` do
   fonts.googleapis.com entrega IP e User-Agent de todo visitante ao Google antes de
   qualquer consentimento — e num endereço de campanha o simples acesso já revela opinião
   política (LGPD, art. 5º, II; o art. 11 não oferece legítimo interesse para isso).
   A `moldura7777` **faz isso hoje** e está errada; não copiar de lá.
4. **A paleta é bicolor: navy `#172053`, laranja `#FE6F29`, branco.** Os contrastes nos
   comentários do `app.css` foram medidos, não estimados: o laranja da marca dá 2.79:1
   sobre branco e **reprova como texto** — ele é grafismo e fundo, quem escreve é o
   `--laranja-700`. Laranja transparente sobre navy vira roxo, que não existe nesta
   marca: profundidade se faz com `--navy-950` chapado e corte diagonal.
5. **Sem sombra difusa, sem analítica, sem contador de downloads.** Em site de candidata,
   analítica que singulariza visitante trata dado sensível, e o art. 11 da LGPD não
   oferece legítimo interesse — exigiria consentimento e banner. O site da campanha
   rejeitou isso pelo mesmo motivo. A página não escreve **nenhum** cookie; foi medido, e
   o aviso de privacidade afirma isso.
6. **O rodapé traz os dois CNPJs**, contratante e produtor, iguais aos do site. A
   `moldura7777` está no ar sem eles por uma pendência aberta lá, não por decisão
   correta — não usar aquele rodapé como molde.

## Trocar ou acrescentar arte

```
# 1. põe o original em assets/wallpapers/_fonte/
# 2. acrescenta a entrada em ARTES, no scripts/prepara-artes.mjs
node scripts/prepara-artes.mjs    # gera JPG + prévia, mede, reescreve os cards
node scripts/monta-cartao.mjs     # o cartão de link usa as 3 primeiras prévias
npm run dev                       # confere em http://localhost:5600
node scripts/audita-contraste.mjs # contraste, alvo de toque e overflow — meta: 0 falhas
git add -A && git commit && git push   # ⚠️ publica sozinho em ~1 min
```

O download sai em **JPEG**, não em WebP: o arquivo vira papel de parede de celular, e o
caminho "segurar a imagem → Salvar" é previsível em JPEG e não é em WebP. A prévia da
página é que é WebP.

## O que o iPhone quebra, e por que a página avisa

`<a download>` **não** leva a imagem para o app Fotos no iOS — leva para Arquivos, e papel
de parede precisa estar em Fotos. Dentro do visualizador embutido do Instagram e do
WhatsApp o download programado é bloqueado de vez, e é justamente de lá que vem o
tráfego de campanha. Por isso todo card tem "Abrir imagem" ao lado do botão, e o recado
acima da grade explica o gesto. Não remover achando que é redundante.

## Verificação

```
npm run dev                          # em outro terminal, porta 5600
node scripts/audita-contraste.mjs    # contraste, alvo de toque, overflow — 0 falhas
```
