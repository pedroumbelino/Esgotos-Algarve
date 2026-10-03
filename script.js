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

  document.getElementById("ano").textContent = new Date().getFullYear();

  // Menu móvel
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.getElementById("menu");
  const setMenu = open => {
    toggle.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
    toggle.querySelector(".sr-only").textContent = open ? "Fechar menu" : "Abrir menu";
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  menu.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

  // Barra de chamada em telemóvel: aparece depois do hero
  const bar = document.querySelector(".mobilebar");
  const hero = document.querySelector(".hero");
  const quote = document.getElementById("orcamento");
  if ("IntersectionObserver" in window) {
    let heroVisible = true, quoteVisible = false;
    const update = () => bar.classList.toggle("is-shown", !heroVisible && !quoteVisible);
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; update(); }).observe(hero);
    new IntersectionObserver(([e]) => { quoteVisible = e.isIntersecting; update(); }, { threshold: .15 }).observe(quote);

    // Revelar secções
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) {
      const items = document.querySelectorAll(".sec-head, .svc, .audience li, .steps li, .towns, .map, .faq, .quote");
      const io = new IntersectionObserver(entries => {
        entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
      }, { rootMargin: "0px 0px -8% 0px" });
      items.forEach(el => { el.classList.add("reveal"); io.observe(el); });
    }
  }

  // Formulário de orçamento: valida e abre o email com o pedido preenchido
  const form = document.getElementById("form-orcamento");
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
