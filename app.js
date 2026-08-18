/* Portfolio Alexandre Sampaio Dutra
   Comportamento do site: tema claro/escuro, idioma PT/EN, acordeao de cursos,
   destaque do menu conforme a rolagem e envio do orcamento pelo WhatsApp. */
(function () {
  'use strict';

  // Valores que no editor de design eram controles; aqui sao os padroes do site.
  var props = {
    tema: 'claro',
    idioma: 'pt',
    fotoFoco: 22,
    verProjetos: true,
    cursosAbertos: false
  };

  var WHATSAPP = '5598984941488';
  var SECOES = ['atuacao', 'habilidades', 'cursos', 'projetos', 'servicos', 'contato'];

  var estado = {
    aberto: null,
    idioma: leia('asd-idioma', ['pt', 'en']),
    tema: leia('asd-tema', ['claro', 'escuro'])
  };

  function leia(chave, aceitos) {
    try {
      var v = window.localStorage.getItem(chave);
      return aceitos.indexOf(v) > -1 ? v : null;
    } catch (e) {
      return null;
    }
  }

  function grave(chave, valor) {
    try {
      window.localStorage.setItem(chave, valor);
    } catch (e) {}
  }

  function ref(nome, escopo) {
    return (escopo || document).querySelector('[data-ref="' + nome + '"]');
  }

  var idioma = function () {
    return estado.idioma || (props.idioma === 'en' ? 'en' : 'pt');
  };
  var tema = function () {
    return estado.tema || (props.tema === 'escuro' ? 'escuro' : 'claro');
  };

  // Mesmos valores que o componente original expunha para o template.
  function valores() {
    var a = estado.aberto;
    var tudo = props.cursosAbertos === true;
    var pt = idioma() === 'pt';
    return {
      pt: pt,
      en: !pt,
      rotuloProjeto: pt ? 'Projeto' : 'Project',
      rotuloFalar: pt ? 'Falar comigo' : 'Message me',
      rotuloTema: tema() === 'escuro' ? (pt ? 'Escuro' : 'Dark') : (pt ? 'Claro' : 'Light'),
      verProjetos: props.verProjetos !== false,
      redes: tudo || a === 'redes',
      python: tudo || a === 'python',
      bi: tudo || a === 'bi',
      sql: tudo || a === 'sql',
      info: tudo || a === 'info',
      ia: tudo || a === 'ia',
      cnh: tudo || a === 'cnh'
    };
  }

  // Efeitos que o original fazia em componentDidMount/DidUpdate.
  function aplica() {
    var escuro = tema() === 'escuro';
    if (escuro) document.documentElement.dataset.tema = 'escuro';
    else delete document.documentElement.dataset.tema;

    var marca = ref('marcaTema');
    if (marca) {
      marca.style.background = escuro ? 'var(--acento)' : 'transparent';
      marca.style.border = escuro ? '0' : '1px solid var(--faixaTexto3)';
    }

    var foto = ref('fotoRef');
    if (foto) {
      foto.style.backgroundPosition = '50% ' + props.fotoFoco + '%';
      foto.style.filter = 'var(--fotoFiltro)';
    }

    var pt = idioma() === 'pt';
    [[ref('btPt'), pt], [ref('btEn'), !pt]].forEach(function (par) {
      var b = par[0], on = par[1];
      if (!b) return;
      b.style.background = on ? 'var(--acento2)' : 'none';
      b.style.color = on ? 'var(--sobreAcento)' : 'var(--faixaTexto3)';
      b.style.borderColor = on ? 'var(--acento2)' : 'var(--faixaLinha)';
      b.style.fontWeight = on ? '600' : '400';
    });

    document.documentElement.lang = pt ? 'pt-BR' : 'en';
  }

  function pinta() {
    var v = valores();
    document.querySelectorAll('[data-if]').forEach(function (el) {
      el.hidden = !v[el.dataset.if];
    });
    document.querySelectorAll('[data-text]').forEach(function (el) {
      el.textContent = v[el.dataset.text];
    });
    document.querySelectorAll('[data-title]').forEach(function (el) {
      el.title = v[el.dataset.title];
    });
    document.querySelectorAll('[data-expanded]').forEach(function (el) {
      el.setAttribute('aria-expanded', v[el.dataset.expanded] ? 'true' : 'false');
    });
    aplica();
  }

  var acoes = {
    trocaTema: function () {
      var novo = tema() === 'escuro' ? 'claro' : 'escuro';
      grave('asd-tema', novo);
      estado.tema = novo;
      pinta();
    },
    paraPt: troca('pt'),
    paraEn: troca('en'),
    abrirRedes: alterna('redes'),
    abrirPython: alterna('python'),
    abrirBi: alterna('bi'),
    abrirSql: alterna('sql'),
    abrirInfo: alterna('info'),
    abrirIa: alterna('ia'),
    abrirCnh: alterna('cnh')
  };

  function troca(l) {
    return function () {
      grave('asd-idioma', l);
      estado.idioma = l;
      pinta();
    };
  }

  function alterna(k) {
    return function () {
      estado.aberto = estado.aberto === k ? null : k;
      pinta();
    };
  }

  // O formulario existe em PT e em EN; le sempre os campos do que foi enviado.
  function envia(e) {
    e.preventDefault();
    var form = e.currentTarget;
    var v = function (nome) {
      var el = ref(nome, form);
      return el && el.value ? el.value.trim() : '';
    };
    var pt = idioma() === 'pt';
    var nome = v('refNome') || (pt ? 'não informado' : 'not given');
    var linhas = pt
      ? ['Olá, Alexandre! Meu nome é ' + nome + '.', '', 'Preciso de: ' + v('refServico'), 'Para quando: ' + v('refPrazo'), 'Faixa de investimento: ' + v('refOrcamento')]
      : ['Hi Alexandre! My name is ' + nome + '.', '', 'I need: ' + v('refServico'), 'Timing: ' + v('refPrazo'), 'Budget range: ' + v('refOrcamento')];
    var detalhe = v('refDetalhe');
    if (detalhe) linhas.push('', detalhe);
    linhas.push('', pt ? '(enviado pelo site)' : '(sent from the site)');
    window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(linhas.join('\n')), '_blank', 'noopener');
  }

  // Em celular a faixa do menu rola de lado e nao cabe inteira: "Projetos",
  // "Servicos" e "Orcamento" nascem fora da tela. Ao trocar de secao, traz o
  // item ativo para a vista. Mexe so na horizontal da faixa — scrollIntoView
  // mexeria na rolagem vertical da pagina e tiraria o leitor do lugar.
  function revela(link) {
    var faixa = link.parentElement;
    if (!faixa || faixa.scrollWidth <= faixa.clientWidth + 1) return;
    var rl = link.getBoundingClientRect();
    var rf = faixa.getBoundingClientRect();
    var alvo = faixa.scrollLeft + (rl.left - rf.left) - (rf.width - rl.width) / 2;
    alvo = Math.max(0, Math.min(alvo, faixa.scrollWidth - faixa.clientWidth));
    // Atribuicao simples, sem scrollTo({behavior:'smooth'}): quem suaviza e o
    // scroll-behavior do mobile.css. Assim o movimento nao depende do navegador
    // animar rolagem por script — que e justamente o que alguns suspendem em
    // quadro fora de vista — e ainda respeita prefers-reduced-motion, porque a
    // regra que desliga a suavidade vive no CSS.
    faixa.scrollLeft = alvo;
  }

  // Menu: marca a secao visivel enquanto a pagina rola.
  function menu() {
    var nav = ref('navRef');
    if (!nav) return;

    var ultimo;
    var marca = function (id) {
      nav.querySelectorAll('[data-sec]').forEach(function (l) {
        var on = l.dataset.sec === id;
        l.style.color = on ? '#fff' : 'var(--navLink)';
        l.style.borderBottomColor = on ? 'var(--acento2)' : 'transparent';
        // So quando a secao muda: avalia() roda a cada evento de rolagem, e
        // reposicionar a faixa a cada quadro brigaria com o dedo do usuario.
        if (on && id !== ultimo) revela(l);
      });
      ultimo = id;
    };

    var hero = document.getElementById('topo');
    var avalia = function () {
      var alvo = window.innerHeight * 0.35;
      if (hero && hero.getBoundingClientRect().bottom > alvo) return marca(null);
      var atual = null;
      SECOES.forEach(function (id) {
        var s = document.getElementById(id);
        if (!s) return;
        var r = s.getBoundingClientRect();
        if (r.top <= alvo && r.bottom > alvo) atual = id;
      });
      if (!atual && window.scrollY >= document.documentElement.scrollHeight - window.innerHeight - 2) atual = 'contato';
      marca(atual);
    };

    window.addEventListener('scroll', avalia, { passive: true });
    window.addEventListener('resize', avalia);

    var passos = [];
    for (var i = 0; i <= 50; i++) passos.push(i / 50);
    var obs = new IntersectionObserver(avalia, { threshold: passos });
    [hero].concat(SECOES.map(function (id) { return document.getElementById(id); }))
      .forEach(function (s) { if (s) obs.observe(s); });

    avalia();
  }

  function inicia() {
    document.addEventListener('click', function (e) {
      var alvo = e.target.closest('[data-click]');
      if (!alvo) return;
      var fn = acoes[alvo.dataset.click];
      if (fn) fn();
    });

    document.querySelectorAll('[data-submit="envia"]').forEach(function (f) {
      f.addEventListener('submit', envia);
    });

    pinta();
    menu();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inicia);
  else inicia();
})();
