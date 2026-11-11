/* Good Entrepreneur SAS : comportements du site */
(function () {
  const C = window.GE_CONFIG || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const tel = t => "tel:" + t.replace(/[^\d+]/g, "");
  const wa = msg => `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(msg)}`;
  const ICON = id => `<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;

  /* ---- Coordonnées ---- */
  $$('[data-cfg="adresse"]').forEach(el => el.textContent = C.adresse);
  $$('[data-cfg="horaires"]').forEach(el => el.textContent = C.horaires);
  $$('[data-cfg="tel1"]').forEach(el => { el.textContent = C.telephones[0]; if (el.tagName === "A") el.href = tel(C.telephones[0]); });
  $$('[data-cfg="telephones"]').forEach(el => el.innerHTML = C.telephones.map(t => `<a href="${tel(t)}">${esc(t)}</a>`).join("<br>"));
  $$('[data-cfg="email"]').forEach(el => { el.textContent = C.email; if (el.tagName === "A") el.href = "mailto:" + C.email; });
  $$('[data-tel]').forEach(a => a.href = tel(C.telephones[0]));
  $$("[data-mail]").forEach(a => a.href = "mailto:" + C.email);
  $$('.js-wa').forEach(a => { a.href = wa(a.dataset.msg || "Bonjour Good Entrepreneur, je souhaite un renseignement."); a.target = "_blank"; a.rel = "noopener"; });
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  /* ---- Carte ---- */
  const map = $("#map");
  if (map) {
    if (C.carte) map.innerHTML = `<iframe src="${esc(C.carte)}" loading="lazy" title="Localisation du siège"></iframe>`;
    else { map.classList.add("photo"); map.innerHTML = "<span>Carte : ajoutez le lien Google Maps dans js/config.js</span>"; }
  }

  /* ---- Photos ---- */
  const putPhoto = (el, src, alt) => {
    if (!src) return;
    const img = new Image(); img.src = src; img.alt = alt || ""; img.loading = "lazy";
    el.prepend(img); el.querySelector("span")?.remove();
  };
  $$("[data-photo]").forEach(el => putPhoto(el, (C.photos || {})[el.dataset.photo], el.dataset.alt));

  /* ---- Flotte ---- */
  const fleet = $("#fleet");
  if (fleet && C.vehicules) {
    C.vehicules.forEach((v, i) => {
      const el = document.createElement("article");
      el.className = "car";
      el.innerHTML = `
        <div class="photo"><span>Photo du ${esc(v.nom.toLowerCase())}</span></div>
        <div class="car-body">
          <div class="car-top"><h3>${esc(v.nom)}</h3><span class="plate">GE-0${i + 1}</span></div>
          <div class="specs">
            <span>${ICON("car")}${esc(v.type)}</span>
            <span>${ICON("users")}${v.places} places</span>
            <span>${ICON("bag")}${v.bagages} bagages</span>
            ${v.clim ? `<span>${ICON("snow")}Climatisé</span>` : ""}
          </div>
          <a class="btn btn-line-dark btn-sm js-wa" href="#" data-msg="Bonjour, je souhaite réserver le ${esc(v.nom)} (${esc(v.type)})." target="_blank" rel="noopener">${ICON("wa")}Réserver ce véhicule</a>
        </div>`;
      putPhoto(el.querySelector(".photo"), v.photo, v.nom);
      el.querySelector(".js-wa").href = wa(el.querySelector(".js-wa").dataset.msg);
      fleet.appendChild(el);
    });
  }

  /* ---- Menu mobile ---- */
  const burger = $(".burger"), menu = $("#menu");
  if (burger) {
    burger.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", open);
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && menu.classList.contains("open")) { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); burger.focus(); }
    });
  }

  /* ---- Onglets (accueil) ---- */
  $$('[role="tablist"]').forEach(list => {
    const tabs = $$('[role="tab"]', list);
    const select = t => tabs.forEach(x => {
      const on = x === t;
      x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1;
      $("#" + x.getAttribute("aria-controls")).hidden = !on;
    });
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(t));
      t.addEventListener("keydown", e => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        const n = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
        select(n); n.focus();
      });
    });
  });

  /* ---- Ouvre l'onglet ciblé par l'ancre (ex. activites.html#vtc) ---- */
  const openFromHash = () => {
    const id = location.hash.slice(1);
    const t = id && $(`[role="tab"][aria-controls="${CSS.escape(id)}"]`);
    if (t) { t.click(); t.closest('[role="tablist"]').scrollIntoView({ block: "start" }); }
  };
  openFromHash(); window.addEventListener("hashchange", openFromHash);

  /* ---- Sujet pré-rempli via ?sujet= ---- */
  const sujet = new URLSearchParams(location.search).get("sujet");
  if (sujet) { const r = $(`input[name="objet"][value="${CSS.escape(sujet)}"]`); if (r) r.checked = true; }

  /* ---- Formulaires (e-mail ou WhatsApp, sans serveur) ---- */
  const LABELS = { nom: "votre nom", email: "un e-mail valide", objet: "le sujet", message: "votre message",
    depart: "le lieu de départ", arrivee: "la destination", date: "la date", produits: "les produits recherchés" };
  $$("form[data-kind]").forEach(form => {
    const out = $(".form-msg", form);
    form.addEventListener("submit", e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form));
      const missing = [];
      $$("[required]", form).forEach(f => {
        const bad = f.type === "email" ? !/^\S+@\S+\.\S+$/.test(f.value) : f.type === "radio" ? !d[f.name] : !f.value.trim();
        if (f.type !== "radio") f.setAttribute("aria-invalid", bad);
        if (bad && !missing.includes(LABELS[f.name])) missing.push(LABELS[f.name]);
      });
      if (missing.length) { out.className = "form-msg err"; out.textContent = "Il manque " + missing.join(", ") + "."; return; }

      let subject, body;
      if (form.dataset.kind === "trajet") {
        subject = "Réservation VTC";
        body = `Bonjour, je souhaite réserver un trajet.\nDépart : ${d.depart}\nDestination : ${d.arrivee}\nDate et heure : ${d.date.replace("T", " à ")}\nPassagers : ${d.passagers}`;
      } else if (form.dataset.kind === "achat") {
        subject = "Demande d'approvisionnement";
        body = `Bonjour, je recherche les produits suivants :\n${d.produits}\nQuantité approximative : ${d.quantite || "à préciser"}`;
      } else {
        subject = "Demande : " + d.objet;
        body = `Nom : ${d.nom}\nTéléphone : ${d.tel || "non renseigné"}\nE-mail : ${d.email}\nSujet : ${d.objet}\n\n${d.message}`;
      }
      const viaMail = e.submitter && e.submitter.value === "mail";
      if (viaMail) location.href = `mailto:${C.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      else window.open(wa(body), "_blank", "noopener");
      out.className = "form-msg";
      out.textContent = viaMail ? "Votre e-mail est prêt. Il ne reste qu'à l'envoyer." : "Votre message est prêt dans WhatsApp. Il ne reste qu'à l'envoyer.";
    });
  });

  /* ---- Date minimale = maintenant ---- */
  $$('input[type="datetime-local"]').forEach(i => {
    const n = new Date(); n.setMinutes(n.getMinutes() - n.getTimezoneOffset());
    i.min = n.toISOString().slice(0, 16);
  });
})();
