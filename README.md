# Artes digitais 7777

Hub de artes da campanha da **Sarah Poncio — Deputada Federal, nº 7777**.
HTML estático, sem framework e sem build.

**No ar:** https://kiizinbr.github.io/artes7777/

## O que tem aqui

| Arte | Formato | Onde mora |
|---|---|---|
| Coragem e Coração | 1080 × 1920, JPG | este repo |
| Dia 4 de outubro | 1080 × 1920, JPG | este repo |
| Padrão de corações | 1080 × 1920, JPG | este repo |
| Moldura de perfil | gerador em `<canvas>` | [moldura7777](https://kiizinbr.github.io/moldura7777/) — listada aqui, hospedada lá |

## Rodar

```
npm install
npm run dev        # http://localhost:5600
```

## Estrutura

```
index.html                          a página inteira; o bloco de cards é GERADO
assets/
  css/app.css                       tokens copiados do site da campanha + estilos
  fonts/*.woff2                     Anton e Barlow locais — nunca do Google
  brand/cartao.png                  cartão de link (Open Graph), gerado
  wallpapers/
    _fonte/*.jpg                    os originais do designer, versionados
    <slug>-1080x1920.jpg            o arquivo que a pessoa baixa
    <slug>-previa.webp              o que aparece no card
    manifesto.json                  título, descrição, alt, dimensão e peso medidos
scripts/
  prepara-artes.mjs                 artes → JPG + prévia + manifesto + cards do HTML
  monta-cartao.mjs                  cartão 1200×630 renderizado no Chrome
  audita-contraste.mjs              contraste, alvo de toque e overflow em 3 larguras
  serve.mjs                         servidor estático de desenvolvimento
docs/PENDENCIAS.md                  o que trava, o que está em aberto e com quem
```

## Acrescentar uma arte

1. Põe o original em `assets/wallpapers/_fonte/`.
2. Acrescenta a entrada em `ARTES`, no topo de `scripts/prepara-artes.mjs` — slug,
   arquivo, título, descrição e o **texto alternativo** (obrigatório: é ele que descreve
   a arte para quem não a enxerga).
3. Roda:

```
node scripts/prepara-artes.mjs     # gera, mede e reescreve os cards do index.html
node scripts/monta-cartao.mjs      # o cartão usa as 3 primeiras prévias
node scripts/audita-contraste.mjs  # com o npm run dev no ar — meta: 0 falhas
```

Não editar o bloco entre `<!-- ARTES:INICIO -->` e `<!-- ARTES:FIM -->` à mão: dimensão e
peso são medidos do arquivo gerado, e a página anuncia os dois.

## Por que JPEG no download e WebP na prévia

O arquivo baixado vira papel de parede de celular. O caminho "segurar a imagem → Salvar" é
previsível em JPEG e não é em WebP, e galeria de Android antigo ainda tropeça no formato.
Peso importa menos que abrir em qualquer lugar. A prévia, que só a página usa, é WebP a
45% do lado.

A qualidade do JPEG é 92 com croma 4:4:4: as artes têm áreas chapadas grandes (o ciclorama
do estúdio e o fundo do padrão), e abaixo disso o degradê ganha faixas visíveis em tela
OLED. Conferido ampliando a borda do "7777" — a recompressão é imperceptível
(RMSE 1,9 sobre 255) e o arquivo cai de 555 KB para 249 KB.

## O iPhone

`<a download>` **não** leva a imagem para o app Fotos no iOS, e papel de parede precisa
estar em Fotos. Dentro do visualizador embutido do Instagram e do WhatsApp o download
programado é bloqueado — e é de lá que vem o tráfego de campanha. Por isso cada card tem
"Abrir imagem" ao lado do botão, e o recado acima da grade explica o gesto: abrir, segurar
o dedo, "Adicionar às Fotos".

## Publicação

GitHub Pages, branch `main`, raiz do repo. O `.nojekyll` está lá para o Jekyll não engolir
nada. **Um `git push` publica em cerca de um minuto, sem revisão e sem ninguém no meio** —
ver `docs/PENDENCIAS.md` §2 sobre o dia da eleição.

O repo é **público** porque o Pages gratuito não serve repositório privado. As artes-fonte
em `_fonte/` ficam visíveis: arte com data de estreia não pode ser commitada antes da data.

## Antes de divulgar o link

`docs/PENDENCIAS.md` §1: o endereço eletrônico usado na campanha tem de constar do
RRC/DRAP, e se ficou de fora só pode ser usado 48 horas depois de comunicado à Justiça
Eleitoral (Lei 9.504/1997, art. 28, § 1º, I e § 1º-B). Multa de R$ 5.000 a R$ 30.000.
**Confirmar com o jurídico da campanha antes de mandar o link em qualquer grupo.**

## Relação com os outros repositórios

- **`sarah-poncio-federal`** → `sarahponcio.com.br`, o site da campanha. O botão "Artes"
  no header dele aponta para cá.
- **`moldura7777`** (pasta local `sarah-poncio-twibbon`) → o gerador de moldura de perfil.
  Não foi movido para cá: o link dele já circulou, e mudar de endereço mataria o que já
  foi compartilhado.
