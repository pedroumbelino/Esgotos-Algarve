/* Email para onde seguem os pedidos de contacto */
const CONTACTO = { email: "esgotosalgarve@gmail.com" };

/* Textos gerados pelo script, nas duas línguas do site */
const EN = (document.documentElement.lang || "").toLowerCase().startsWith("en");
const T = EN ? {
  abrir: "Open menu", fechar: "Close menu", base: "Olhão",
  servico: "Service", nome: "Name", telefone: "Phone", localidade: "Area", semLocal: "not given",
  assunto: "Contact request: ", semEmail: "The company email is not set up yet. Please call us directly.",
  aberto: "Your email app is open with the request filled in. Just press send."
} : {
  abrir: "Abrir menu", fechar: "Fechar menu", base: "Olhão",
  servico: "Serviço", nome: "Nome", telefone: "Telefone", localidade: "Localidade", semLocal: "não indicada",
  assunto: "Pedido de contacto: ", semEmail: "O email da empresa ainda não está configurado. Por agora, ligue-nos diretamente.",
  aberto: "Abrimos o seu email com o pedido de contacto preenchido. Só falta carregar em enviar."
};

(function () {
  const ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();

  // Menu móvel
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.getElementById("menu");
  if (toggle && menu) {
  const setMenu = open => {
    toggle.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
    toggle.querySelector(".sr-only").textContent = open ? T.fechar : T.abrir;
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  menu.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });
  }

  // Barra de chamada em telemóvel: aparece depois do hero
  const bar = document.querySelector(".mobilebar");
  const hero = document.querySelector(".hero");
  const quote = document.getElementById("orcamento");
  if ("IntersectionObserver" in window && bar && hero && quote) {
    let heroVisible = true, quoteVisible = false;
    const update = () => bar.classList.toggle("is-shown", !heroVisible && !quoteVisible);
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; update(); }).observe(hero);
    new IntersectionObserver(([e]) => { quoteVisible = e.isIntersecting; update(); }, { threshold: .15 }).observe(quote);

    // Revelar secções
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) {
      const items = document.querySelectorAll(".sec-head, .svc, .steps li, .towns, .map, .faq, .quote");
      const io = new IntersectionObserver(entries => {
        entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
      }, { rootMargin: "0px 0px -8% 0px" });
      items.forEach(el => { el.classList.add("reveal"); io.observe(el); });
    }
  }

  // Mapa de zonas: escolher localidade
  const svg = document.querySelector(".map svg");
  if (svg) {
    const focus = svg.querySelector(".map__focus");
    const label = svg.querySelector(".map__label");
    const route = svg.querySelector(".map__route");
    const base = { x: +route.getAttribute("x1"), y: +route.getAttribute("y1") };
    const buttons = document.querySelectorAll(".town");

    const select = slug => {
      const pt = svg.querySelector('.map__pt[data-town="' + slug + '"]');
      const x = pt ? +pt.getAttribute("cx") : base.x;
      const y = pt ? +pt.getAttribute("cy") : base.y;
      const nome = pt ? pt.dataset.name : T.base;
      svg.querySelectorAll(".map__pt").forEach(p => p.classList.toggle("is-active", p === pt));
      buttons.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.town === slug)));
      focus.setAttribute("transform", "translate(" + x + " " + y + ")");
      focus.style.transform = "translate(" + x + "px, " + y + "px)";
      route.setAttribute("x2", x); route.setAttribute("y2", y);
      label.textContent = nome;
      // manter a etiqueta dentro do mapa
      label.setAttribute("text-anchor", x > 320 ? "end" : x < 80 ? "start" : "middle");
      // a sul da base (ou demasiado perto do topo) a etiqueta vai para baixo
      label.setAttribute("y", (y > base.y || y < 30) ? 17 : -11);
    };
    buttons.forEach(b => b.addEventListener("click", () => select(b.dataset.town)));
    select("olhao");
  }

  // Aviso de cookies (só guarda a escolha neste aviso)
  const cookies = document.querySelector(".cookies");
  if (cookies) {
    let visto = false;
    try { visto = localStorage.getItem("ea-cookies") === "ok"; } catch (e) {}
    if (!visto) cookies.hidden = false;
    cookies.querySelector("[data-cookies-ok]").addEventListener("click", () => {
      try { localStorage.setItem("ea-cookies", "ok"); } catch (e) {}
      cookies.hidden = true;
    });
  }

  // Localidade: sugestões à medida que se escreve (pode sempre escrever outra)
  const LOCALIDADES = [
    "Albufeira", "Alcoutim", "Aljezur", "Almancil", "Alte", "Altura", "Alvor", "Armação de Pêra",
    "Benafim", "Bensafrim", "Boliqueime", "Budens", "Cabanas de Tavira", "Carvoeiro", "Castro Marim",
    "Conceição de Tavira", "Estoi", "Estômbar", "Faro", "Ferragudo", "Ferreiras", "Fuseta", "Gambelas",
    "Guia", "Lagoa", "Lagos", "Loulé", "Luz", "Manta Rota", "Mexilhoeira Grande", "Moncarapacho",
    "Monchique", "Monte Gordo", "Montenegro", "Odiáxere", "Olhão", "Olhos de Água", "Paderne",
    "Patacão", "Pechão", "Portimão", "Praia da Rocha", "Quarteira", "Quelfes", "Querença",
    "Quinta do Lago", "Sagres", "Salir", "Santa Bárbara de Nexe", "Santa Luzia",
    "São Bartolomeu de Messines", "São Brás de Alportel", "Silves", "Tavira", "Tunes",
    "Vale do Garrão", "Vale do Lobo", "Vila do Bispo", "Vila Real de Santo António", "Vilamoura"
  ];
  // as mais próximas e procuradas aparecem primeiro nas sugestões
  const PRIORIDADE = [
    "Olhão", "Faro", "Tavira", "São Brás de Alportel", "Fuseta", "Moncarapacho", "Quelfes", "Pechão",
    "Estoi", "Loulé", "Almancil", "Quinta do Lago", "Vale do Lobo", "Vale do Garrão", "Quarteira",
    "Vilamoura", "Albufeira", "Santa Bárbara de Nexe", "Montenegro", "Gambelas", "Portimão",
    "Lagoa", "Lagos", "Silves", "Vila Real de Santo António"
  ];
  const peso = n => { const i = PRIORIDADE.indexOf(n); return i < 0 ? 999 : i; };
  const porPeso = (a, b) => peso(a) - peso(b) || a.localeCompare(b, "pt");
  const semAcentos = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const combo = document.getElementById("f-local");
  const lista = document.getElementById("f-local-lista");
  if (combo && lista) {
    let ativo = -1, opcoes = [];
    const fechar = () => { lista.hidden = true; combo.setAttribute("aria-expanded", "false"); combo.removeAttribute("aria-activedescendant"); ativo = -1; };
    const marcar = i => {
      ativo = i;
      [...lista.children].forEach((li, k) => li.setAttribute("aria-selected", String(k === i)));
      if (i >= 0) { combo.setAttribute("aria-activedescendant", lista.children[i].id); lista.children[i].scrollIntoView({ block: "nearest" }); }
    };
    const escolher = nome => { combo.value = nome; fechar(); };
    const procurar = () => {
      const q = semAcentos(combo.value.trim());
      if (!q) { fechar(); return; }
      // primeiro as que começam pelo texto, depois as que têm uma palavra a começar por ele
      const comeca = LOCALIDADES.filter(n => semAcentos(n).startsWith(q));
      const palavra = LOCALIDADES.filter(n => !comeca.includes(n) && semAcentos(n).split(/\s+/).some(w => w.startsWith(q)));
      opcoes = comeca.sort(porPeso).concat(palavra.sort(porPeso)).slice(0, 8);
      if (!opcoes.length || (opcoes.length === 1 && semAcentos(opcoes[0]) === q)) { fechar(); return; }
      lista.innerHTML = "";
      opcoes.forEach((nome, k) => {
        const li = document.createElement("li");
        li.id = "f-local-op-" + k;
        li.setAttribute("role", "option");
        const ini = semAcentos(nome).indexOf(q);
        if (ini >= 0) {
          li.append(nome.slice(0, ini));
          const m = document.createElement("mark"); m.textContent = nome.slice(ini, ini + q.length); li.append(m);
          li.append(nome.slice(ini + q.length));
        } else li.textContent = nome;
        li.addEventListener("mousedown", e => { e.preventDefault(); escolher(nome); });
        lista.append(li);
      });
      lista.hidden = false;
      combo.setAttribute("aria-expanded", "true");
      marcar(0);
    };
    combo.addEventListener("input", procurar);
    combo.addEventListener("keydown", e => {
      if (lista.hidden) return;
      if (e.key === "ArrowDown") { e.preventDefault(); marcar((ativo + 1) % opcoes.length); }
      else if (e.key === "ArrowUp") { e.preventDefault(); marcar((ativo - 1 + opcoes.length) % opcoes.length); }
      else if (e.key === "Enter" && ativo >= 0) { e.preventDefault(); escolher(opcoes[ativo]); }
      else if (e.key === "Escape") { fechar(); }
    });
    combo.addEventListener("blur", fechar);
  }

  // Formulário de contacto: valida e abre o email com o pedido preenchido
  const form = document.getElementById("form-orcamento");
  if (!form) return;
  const note = form.querySelector(".form__note");
  const showErr = (input, errId, bad) => {
    input.setAttribute("aria-invalid", String(bad));
    const err = document.getElementById(errId);
    err.hidden = !bad;
    if (bad) input.setAttribute("aria-describedby", errId); else input.removeAttribute("aria-describedby");
  };

  form.addEventListener("submit", e => {
    e.preventDefault();
    const nome = form.nome, tel = form.telefone;
    const badNome = nome.value.trim().length < 2;
    const badTel = tel.value.replace(/\D/g, "").length < 9;
    showErr(nome, "err-nome", badNome);
    showErr(tel, "err-tel", badTel);
    if (badNome || badTel) { (badNome ? nome : tel).focus(); note.textContent = ""; return; }

    const servico = form.servico.value;
    const corpo = [
      T.servico + ": " + servico,
      T.nome + ": " + nome.value.trim(),
      T.telefone + ": " + tel.value.trim(),
      T.localidade + ": " + (form.localidade.value.trim() || T.semLocal),
      "",
      form.mensagem.value.trim()
    ].join("\n");

    if (!CONTACTO.email) {
      note.textContent = T.semEmail;
      return;
    }
    window.location.href = "mailto:" + CONTACTO.email +
      "?subject=" + encodeURIComponent(T.assunto + servico) +
      "&body=" + encodeURIComponent(corpo);
    note.textContent = T.aberto;
  });
})();
