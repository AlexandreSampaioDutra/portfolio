/* Gera o index.html a partir do arquivo de design (design/Portfolio Alexandre.dc.html).
   O arquivo de design usa o runtime "dc" (React); aqui ele vira HTML estatico:
     <helmet>            -> vai para o <head>
     <sc-if value="{{x}}"> -> <div class="dc-if" data-if="x">, alternado pelo app.js
     ref / onClick / onSubmit / title / aria-expanded -> atributos data-*
     style-hover / style-focus -> regras CSS reais ([data-hv="n"]:hover)
     {{ texto }}         -> <span data-text="...">

   Uso: node tools/build-from-design.js
   Depois de mexer no design em claude.ai/design, baixe o .dc.html por cima e rode de novo. */
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const SRC = path.join(raiz, 'design', 'Portfolio Alexandre.dc.html');
const DEST = path.join(raiz, 'index.html');

const src = fs.readFileSync(SRC, 'utf8');

// --- 1. fatias do documento -------------------------------------------------
const headRaw = src.slice(src.indexOf('<head>') + 6, src.indexOf('</head>'));
const helmet = src.slice(src.indexOf('<helmet>') + 8, src.indexOf('</helmet>'));
let tpl = src.slice(src.indexOf('</helmet>') + 9, src.lastIndexOf('</x-dc>'));

const head = headRaw.replace('<script src="./support.js"></script>\n', '').replace(/\n+$/, '');

// --- 2. style-hover / style-focus -> regras CSS reais -----------------------
// Precisam de !important porque o estado normal vem em atributo style (inline).
const rules = [];
const dedupe = new Map();

const bang = (css) =>
  css
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => (/!important$/.test(d) ? d : d + ' !important'))
    .join(';');

function slot(kind, css) {
  const key = kind + '|' + css;
  if (dedupe.has(key)) return dedupe.get(key);
  const n = dedupe.size + 1;
  dedupe.set(key, n);
  rules.push(`[data-${kind}="${n}"]:${kind === 'hv' ? 'hover' : 'focus'}{${bang(css)}}`);
  return n;
}

tpl = tpl.replace(/\sstyle-hover="([^"]*)"/g, (_, css) => ` data-hv="${slot('hv', css)}"`);
tpl = tpl.replace(/\sstyle-focus="([^"]*)"/g, (_, css) => ` data-fc="${slot('fc', css)}"`);

// --- 3. atributos ligados ---------------------------------------------------
tpl = tpl.replace(/<sc-if\s+value="\{\{\s*([\w$]+)\s*\}\}"[^>]*>/g, '<div class="dc-if" data-if="$1">');
tpl = tpl.replace(/<\/sc-if>/g, '</div>');
tpl = tpl.replace(/\sref="\{\{\s*([\w$]+)\s*\}\}"/g, ' data-ref="$1"');
tpl = tpl.replace(/\sonClick="\{\{\s*([\w$]+)\s*\}\}"/g, ' data-click="$1"');
tpl = tpl.replace(/\sonSubmit="\{\{\s*([\w$]+)\s*\}\}"/g, ' data-submit="$1"');
tpl = tpl.replace(/\stitle="\{\{\s*([\w$]+)\s*\}\}"/g, ' data-title="$1"');
tpl = tpl.replace(/\saria-expanded="\{\{\s*([\w$]+)\s*\}\}"/g, ' aria-expanded="false" data-expanded="$1"');
tpl = tpl.replace(/\srequired="\{\{\s*true\s*\}\}"/g, ' required');
tpl = tpl.replace(/\sautoComplete=/g, ' autocomplete=');

// --- 4. interpolacao de texto ----------------------------------------------
tpl = tpl.replace(/\{\{\s*([\w$]+)\s*\}\}/g, '<span data-text="$1"></span>');

// --- 5. nada pode sobrar do dialeto do runtime ------------------------------
const sobras = [
  ...[...tpl.matchAll(/\{\{[^}]*\}\}/g)].map((m) => m[0]),
  ...[...tpl.matchAll(/<sc-[a-z-]+/g)].map((m) => m[0]),
  ...[...tpl.matchAll(/\s(style-[a-z]+|hint-[a-z-]+)=/g)].map((m) => m[1]),
];
if (sobras.length) {
  console.error('Construcoes do runtime nao convertidas:', [...new Set(sobras)]);
  process.exit(1);
}

// --- 6. CSS de apoio --------------------------------------------------------
const extraCss = ['.dc-if{display:contents}', '.dc-if[hidden]{display:none}', ...rules].join('\n  ');

// --- 7. montagem ------------------------------------------------------------
// Tema e idioma sao lidos antes da pintura para nao piscar branco no modo escuro.
const preTheme = `<script>
(function(){try{
  var t=localStorage.getItem('asd-tema');
  if(t==='escuro')document.documentElement.dataset.tema='escuro';
  var i=localStorage.getItem('asd-idioma');
  if(i==='en')document.documentElement.lang='en';
}catch(e){}})();
</script>`;

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>${head}
${preTheme}
${helmet.trim().replace('</style>', `${extraCss}\n</style>`)}
</head>
<body>
${tpl.trim()}
<script src="app.js"></script>
</body>
</html>
`;

fs.writeFileSync(DEST, html, 'utf8');
console.log('index.html gerado:', html.length, 'bytes |', rules.length, 'regras hover/focus');
