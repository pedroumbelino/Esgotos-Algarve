/* =========================================================
   CONTACTOS: altere aqui e o site inteiro é atualizado.
   ========================================================= */
const CONTACTO = {
  telefone: "",            // ex.: "+351 912 345 678"  (por preencher)
  email: "",               // ex.: "geral@esgotosalgarve.pt" (por preencher)
};

(function () {
  // Aplicar contactos
  if (CONTACTO.telefone) {
    const digits = CONTACTO.telefone.replace(/[^\d+]/g, "");
    const pretty = CONTACTO.telefone.replace(/^\+351\s?/, "");
    document.querySelectorAll("[data-phone-link]").forEach(a => a.href = "tel:" + digits);
    document.querySelectorAll("[data-phone-text]").forEach(el => el.textContent = pretty);
  }
  if (CONTACTO.email) {
    document.querySelectorAll("[data-email-link]").forEach(a => a.href = "mailto:" + CONTACTO.email);
    document.querySelectorAll("[data-email-text]").forEach(el => el.textContent = CONTACTO.email);
  }

  const ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();

  // Menu móvel
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.getElementById("menu");
  if (toggle && menu) {
  const setMenu = open => {
    toggle.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
    toggle.querySelector(".sr-only").textContent = open ? "Fechar menu" : "Abrir menu";
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
    const caption = document.querySelector(".map__caption");
    const base = { x: +route.getAttribute("x1"), y: +route.getAttribute("y1") };
    const buttons = document.querySelectorAll(".town");

    const select = slug => {
      const pt = svg.querySelector('.map__pt[data-town="' + slug + '"]');
      const x = pt ? +pt.getAttribute("cx") : base.x;
      const y = pt ? +pt.getAttribute("cy") : base.y;
      const nome = pt ? pt.dataset.name : "Almancil";
      svg.querySelectorAll(".map__pt").forEach(p => p.classList.toggle("is-active", p === pt));
      buttons.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.town === slug)));
      focus.setAttribute("transform", "translate(" + x + " " + y + ")");
      focus.style.transform = "translate(" + x + "px, " + y + "px)";
      route.setAttribute("x2", x); route.setAttribute("y2", y);
      label.textContent = nome;
      // manter a etiqueta dentro do mapa
      label.setAttribute("text-anchor", x > 320 ? "end" : x < 80 ? "start" : "middle");
      // a sul de Almancil (ou demasiado perto do topo) a etiqueta vai para baixo
      label.setAttribute("y", (y > base.y || y < 30) ? 17 : -11);
      caption.innerHTML = pt
        ? "<strong>" + nome + "</strong>: servimos esta zona a partir de Almancil."
        : "<strong>Almancil</strong>, a nossa base.";
    };
    buttons.forEach(b => b.addEventListener("click", () => select(b.dataset.town)));
    select("almancil");
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

  // Formulário de orçamento: valida e abre o email com o pedido preenchido
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
      "Serviço: " + servico,
      "Nome: " + nome.value.trim(),
      "Telefone: " + tel.value.trim(),
      "Localidade: " + (form.localidade.value.trim() || "não indicada"),
      "",
      form.mensagem.value.trim()
    ].join("\n");

    if (!CONTACTO.email) {
      note.textContent = "O email da empresa ainda não está configurado. Por agora, ligue-nos diretamente.";
      return;
    }
    window.location.href = "mailto:" + CONTACTO.email +
      "?subject=" + encodeURIComponent("Pedido de orçamento: " + servico) +
      "&body=" + encodeURIComponent(corpo);
    note.textContent = "Abrimos o seu email com o pedido de orçamento preenchido. Só falta carregar em enviar.";
  });
})();
