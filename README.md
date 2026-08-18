# Portfólio — Alexandre Sampaio Dutra

No ar: **https://alexandredutra.dev.br**

Site estático (HTML + CSS + um arquivo JS, sem build e sem framework) gerado a partir do
projeto Claude Design **Portfólio com azulejo São Luís**. Publicado pela Vercel a partir da
branch `main`, na raiz — cada push atualiza o site em menos de um minuto.

```
index.html                        página pronta (gerada)
app.js                            tema, idioma, acordeão, menu e orçamento no WhatsApp
assets/mobile.css                 camada de celular (escrita à mão, não vem do design)
assets/                           favicon, imagem de compartilhamento, prévia do MeuFinanceiro
design/Portfolio Alexandre.dc.html  arquivo original do Claude Design (referência)
design/support.js                 runtime dc original (referência, não usado pelo site)
tools/build-from-design.js        regenera o index.html a partir do arquivo de design
```

## Rodar

```bash
python -m http.server 8000
# abre http://127.0.0.1:8000
```

Abrir o `index.html` direto pelo `file://` também funciona, mas `localStorage` e alguns
navegadores se comportam melhor via servidor.

## O que o site faz

- **Tema claro/escuro** — botão no topo, guardado em `localStorage` (`asd-tema`). O tema é
  aplicado por um script inline no `<head>`, antes da primeira pintura, para não piscar branco.
- **PT / EN** — os dois idiomas ficam no HTML; o `app.js` mostra um e esconde o outro
  (`localStorage` `asd-idioma`, e `<html lang>` acompanha).
- **Cursos** — acordeão, um item aberto por vez, com `aria-expanded` correto.
- **Menu** — sublinha a seção visível conforme a rolagem (`IntersectionObserver` + `scroll`).
  No celular a faixa do menu não cabe inteira; ao trocar de seção, o `app.js` traz o item
  ativo para a vista rolando só a faixa, na horizontal.
- **Orçamento** — o formulário não envia para servidor nenhum: monta a mensagem e abre o
  WhatsApp `wa.me/5598984941488` em outra aba.

## Celular

`assets/mobile.css` é a única folha de estilo escrita à mão do projeto. Ela **não vem do
Claude Design**: o `tools/build-from-design.js` a injeta no `<head>` do `index.html`, junto
com o `viewport-fit=cover` e os `preconnect` dos CDNs de ícones. Por isso baixar um
`.dc.html` novo por cima do design não apaga o trabalho de celular.

O HTML gerado tem estilo inline em quase todo elemento e nenhuma classe, então as regras do
`mobile.css` precisam de `!important` e encontram os elementos pelo id da seção ou por um
trecho do próprio estilo inline (`[style*="padding:76px 26px"]`). **Se o design mudar esses
valores, a regra correspondente para de casar em silêncio** — depois de regerar, vale abrir
a página estreita e conferir. Cada regra tem o motivo escrito ao lado no arquivo.

O ajuste que mais importa: os campos do formulário ficam com 16px em tela de toque. Abaixo
disso o Safari dá zoom na página inteira quando o dedo toca o campo, e não desfaz depois.

## Domínio

O site responde em `alexandredutra.dev.br` (registrado no Registro.br, DNS apontado para a
Vercel). Três endereços no `<head>` carregam o domínio escrito por extenso:

```
og:url        https://alexandredutra.dev.br/
og:image      https://alexandredutra.dev.br/assets/compartilhar.png
twitter:image https://alexandredutra.dev.br/assets/compartilhar.png
```

Mais o `<link rel="canonical">` e o campo `url` do JSON-LD. Ao trocar de endereço de novo,
mudar os cinco em `design/Portfolio Alexandre.dc.html` e rodar `node tools/build-from-design.js`.
Sem os endereços certos, a prévia com imagem não aparece no WhatsApp, Instagram nem LinkedIn.

## Dependências externas

A página busca na internet: Google Fonts (Bricolage Grotesque, IBM Plex Mono) e os ícones de
tecnologia em `cdn.jsdelivr.net` (devicon) e `cdn.simpleicons.org`. Sem rede, o site abre com
fonte de sistema e sem os ícones. Para funcionar offline, baixar esses arquivos para `assets/`
e trocar os endereços.

## Atualizar a partir do Claude Design

1. Baixar o `.dc.html` novo por cima de `design/Portfolio Alexandre.dc.html`.
2. `node tools/build-from-design.js`

O script converte o dialeto do runtime dc para HTML puro: `<helmet>` vira `<head>`,
`<sc-if>` vira `div.dc-if[data-if]`, `style-hover`/`style-focus` viram regras CSS de verdade
e `{{ expressão }}` vira `data-text`. Se aparecer alguma construção nova que ele não conhece,
o build falha em vez de gerar página quebrada — aí é preciso ensinar a nova regra ao script
(e, se for estado novo, ao `app.js`).
