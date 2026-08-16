# Portfólio — Alexandre Sampaio Dutra

Site estático (HTML + CSS + um arquivo JS, sem build e sem framework) gerado a partir do
projeto Claude Design **Portfólio com azulejo São Luís**.

```
index.html                        página pronta (gerada)
app.js                            tema, idioma, acordeão, menu e orçamento no WhatsApp
assets/                           foto, favicon, imagem de compartilhamento, prévia do MeuFinanceiro
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
- **Orçamento** — o formulário não envia para servidor nenhum: monta a mensagem e abre o
  WhatsApp `wa.me/5598984941488` em outra aba.

## Antes de publicar

No `<head>` do `index.html` (e do arquivo em `design/`) existem três endereços de exemplo:

```
og:url        https://SEU-DOMINIO.com.br/
og:image      https://SEU-DOMINIO.com.br/assets/compartilhar.png
twitter:image https://SEU-DOMINIO.com.br/assets/compartilhar.png
```

Trocar pelo domínio real — sem isso a prévia com imagem não aparece no WhatsApp, Instagram
nem LinkedIn.

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
