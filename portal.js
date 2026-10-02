// Comportamiento compartido de todas las páginas del portal:
//  - [data-copy]: la tarjeta copia su texto al portapapeles.
//  - .photo-card.zoom / img.fig / a.zoom-link: la imagen se abre en grande en el visor.
(function(){
  const $ = id => document.getElementById(id);
  const toast = $("toast");
  const lightbox = $("lightbox");
  const lightboxTitle = $("lightboxTitle");
  const lightboxImage = $("lightboxImage");
  let toastTimer;

  // ---------- Copiar al portapapeles ----------
  async function copyText(text){
    try{
      await navigator.clipboard.writeText(text);
    }catch(e){
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    if(!toast) return;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1500);
  }

  document.querySelectorAll("[data-copy]").forEach(card => {
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    const doCopy = () => copyText(card.dataset.copy);
    card.addEventListener("click", doCopy);
    card.addEventListener("keydown", e => {
      if(e.key === "Enter" || e.key === " "){ e.preventDefault(); doCopy(); }
    });
  });

  // ---------- Menú de ascensos: se cierra al tocar fuera o con Escape ----------
  document.querySelectorAll(".nav-menu").forEach(menu => {
    document.addEventListener("click", e => { if(!menu.contains(e.target)) menu.open = false; });
    document.addEventListener("keydown", e => { if(e.key === "Escape") menu.open = false; });
  });

  // ---------- Requisitos en ventana: la tarjeta que apunta a una .req.popup la abre encima ----------
  const popups = document.querySelectorAll(".req.popup");
  if(popups.length){
    const modal = document.createElement("div");
    modal.className = "detail-modal";
    document.body.appendChild(modal);
    const closeDetail = () => modal.classList.remove("show");
    popups.forEach(sec => {
      const close = document.createElement("button");
      close.type = "button";
      close.className = "close-btn detail-close";
      close.textContent = "Cerrar";
      close.addEventListener("click", closeDetail);
      sec.prepend(close);
      document.querySelectorAll(`a[href="#${sec.id}"]`).forEach(a => a.addEventListener("click", e => {
        e.preventDefault();
        modal.replaceChildren(sec);
        sec.scrollTop = 0;
        modal.classList.add("show");
      }));
    });
    modal.addEventListener("click", e => { if(e.target === modal) closeDetail(); });
    document.addEventListener("keydown", e => { if(e.key === "Escape") closeDetail(); });
  }

  // ---------- Visor de imágenes ----------
  if(!lightbox) return;

  // Botones del visor: pantalla completa y descargar
  const actions = document.createElement("div");
  actions.className = "lightbox-actions";
  actions.innerHTML =
    '<button type="button" class="close-btn" id="lbFull">⛶ Pantalla completa</button>' +
    '<a class="close-btn" id="lbDownload" download>⬇ Descargar</a>';
  const closeBtn = $("closeLightbox");
  closeBtn.parentNode.insertBefore(actions, closeBtn);
  actions.appendChild(closeBtn);
  const lbDownload = $("lbDownload");

  $("lbFull").addEventListener("click", () => {
    if(lightboxImage.requestFullscreen) lightboxImage.requestFullscreen().catch(() => window.open(lightboxImage.src, "_blank"));
    else if(lightboxImage.webkitRequestFullscreen) lightboxImage.webkitRequestFullscreen();
    else window.open(lightboxImage.src, "_blank"); // iPhone: abre la imagen sola, se puede ampliar con los dedos
  });

  function openBox(title, src){
    lightboxTitle.textContent = title;
    lightboxImage.src = src;
    lightboxImage.alt = title;
    lbDownload.href = src;
    lbDownload.setAttribute("download", src.split("/").pop());
    lightbox.classList.add("show");
    lightbox.setAttribute("aria-hidden", "false");
  }
  function closeBox(){
    lightbox.classList.remove("show");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.src = "";
  }

  document.querySelectorAll(".photo-card.zoom").forEach(card => {
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    const open = () => openBox(card.dataset.title, card.dataset.image);
    card.addEventListener("click", open);
    card.addEventListener("keydown", e => {
      if(e.key === "Enter" || e.key === " "){ e.preventDefault(); open(); }
    });
  });
  document.querySelectorAll("a.zoom-link").forEach(link => {
    link.addEventListener("click", e => { e.preventDefault(); openBox(link.dataset.title, link.getAttribute("href")); });
  });
  document.querySelectorAll("img.fig").forEach(img => {
    img.addEventListener("click", () => openBox(img.alt, img.getAttribute("src")));
  });

  $("closeLightbox").addEventListener("click", closeBox);
  lightbox.addEventListener("click", e => { if(e.target === lightbox) closeBox(); });
  document.addEventListener("keydown", e => { if(e.key === "Escape") closeBox(); });
})();

// ---------- Chatbot (Botpress): burbuja más grande ----------
// El webchat v3 se dibuja dentro de un shadow DOM, así que portal.css no le llega:
// los estilos se le pasan con additionalStylesheet.
(function(){
  const css = `
    .bpFab{width:112px !important; height:112px !important; box-shadow:0 10px 28px rgba(0,0,0,.45) !important}
    @media (min-width:768px){
      /* el chat abierto se ubica arriba de la burbuja, que ahora es más alta */
      .bpWebchat{bottom:152px !important; height:min(700px,calc(100% - 172px)) !important}
    }
    @media (max-width:620px){
      .bpFab{width:84px !important; height:84px !important}
      .bpFabWrapper{bottom:16px !important; right:16px !important}
    }`;

  window.addEventListener("load", () => {
    const bp = window.botpress;
    if(!bp) return;
    const apply = () => bp.config({ configuration: { additionalStylesheet: css } });
    bp.on("webchat:initialized", apply);
    apply();
  });
})();
