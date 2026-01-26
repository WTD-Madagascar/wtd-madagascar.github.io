/* WTD SOS — bouton urgence (FR/MG)
   - Aucune collecte serveur
   - Aucune géolocalisation en arrière-plan
   - Tout est déclenché par l'utilisateur (clic)
*/
(function () {
  "use strict";

  const DEFAULT_CFG = {
    lang_default: "fr",
    contacts: {},
    emergency_numbers: [],
    message_templates: {
      fr: "JE SUIS EN DANGER. Aidez-moi.\nPosition : {coords}\nCarte : {maps}\nHeure : {time}",
      mg: "MILA VONJY AHO. Tandindomin-doza aho.\nToerana : {coords}\nSarintany : {maps}\nOra : {time}"
    }
  };

  // Base path: si BASE_PATH existe, on l'utilise, sinon on calcule par rapport au script
  const BASE =
    (typeof window.BASE_PATH === "string" && window.BASE_PATH) ||
    guessBasePathFromScript();

  const CFG_URL = BASE + "data/emergency.json";

  let cfg = DEFAULT_CFG;
  let lang = "fr";
  let lastMessage = "";
  let lastCoords = null;

  document.addEventListener("DOMContentLoaded", async () => {
    cfg = await safeLoadConfig(CFG_URL, DEFAULT_CFG);
    lang = cfg.lang_default === "mg" ? "mg" : "fr";

    injectStyles();
    injectUI();
    wireUI();
  });

  function guessBasePathFromScript() {
    // Exemple: .../assets/js/sos.js => base = .../
    const scripts = document.getElementsByTagName("script");
    const me = Array.from(scripts).find(s => (s.src || "").includes("/assets/js/sos.js"));
    if (!me || !me.src) return "";
    return me.src.split("/assets/js/sos.js")[0] + "/";
  }

  async function safeLoadConfig(url, fallback) {
    try {
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) return fallback;
      const j = await r.json();
      return {
        ...fallback,
        ...j,
        contacts: j.contacts || fallback.contacts,
        emergency_numbers: Array.isArray(j.emergency_numbers) ? j.emergency_numbers : fallback.emergency_numbers,
        message_templates: j.message_templates || fallback.message_templates
      };
    } catch {
      return fallback;
    }
  }

  function t(fr, mg) {
    return lang === "mg" ? mg : fr;
  }

  function injectStyles() {
    const css = `
/* SOS floating button */
.wtd-sos-btn{
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 9999;
  border: 0;
  border-radius: 999px;
  padding: 12px 14px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(0,0,0,.25);
}
.wtd-sos-btn:focus{ outline: 3px solid rgba(255,255,255,.9); outline-offset: 2px; }

/* Overlay */
.wtd-sos-overlay{
  position: fixed;
  inset: 0;
  z-index: 9998;
  background: rgba(0,0,0,.55);
  display: none;
}
.wtd-sos-overlay[open]{ display: block; }

/* Modal */
.wtd-sos-modal{
  position: fixed;
  z-index: 9999;
  inset: auto 16px 84px 16px;
  max-width: 720px;
  margin: 0 auto;
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  display: none;
  box-shadow: 0 25px 60px rgba(0,0,0,.35);
}
.wtd-sos-modal[open]{ display: block; }

.wtd-sos-row{ display:flex; gap:10px; flex-wrap:wrap; align-items:center; justify-content:space-between; }
.wtd-sos-title{ font-size: 18px; margin: 0; }
.wtd-sos-small{ font-size: 13px; opacity: .85; margin-top: 6px; }

.wtd-sos-actions{ display:flex; gap:10px; flex-wrap:wrap; margin-top: 12px; }
.wtd-sos-actions button, .wtd-sos-actions a{
  border-radius: 10px;
  padding: 10px 12px;
  border: 1px solid #0b4a6f;
  background: #0b4a6f;
  color: #fff;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
}
.wtd-sos-actions .secondary{
  background: #fff;
  color: #0b4a6f;
}
.wtd-sos-actions .danger{
  background: #b00020;
  border-color: #b00020;
}

.wtd-sos-box{
  margin-top: 10px;
  border: 1px solid rgba(0,0,0,.12);
  border-radius: 10px;
  padding: 10px;
}
.wtd-sos-textarea{
  width: 100%;
  min-height: 110px;
  border-radius: 10px;
  padding: 10px;
  border: 1px solid rgba(0,0,0,.18);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 13px;
}

.wtd-sos-list{ margin: 10px 0 0; padding-left: 18px; }
.wtd-sos-list li{ margin: 6px 0; }
.wtd-sos-topright{
  display:flex; gap:8px; align-items:center;
}
.wtd-sos-select{
  border-radius: 10px;
  padding: 8px 10px;
  border: 1px solid rgba(0,0,0,.2);
  font-weight: 700;
}
.wtd-sos-close{
  border: 1px solid rgba(0,0,0,.25);
  background:#fff;
  color:#111;
  border-radius: 10px;
  padding: 8px 10px;
  cursor:pointer;
  font-weight:800;
}
    `.trim();

    const style = document.createElement("style");
    style.setAttribute("data-wtd-sos", "1");
    style.textContent = css;
    document.head.appendChild(style);
  }

  function injectUI() {
    // Bouton
    const btn = document.createElement("button");
    btn.className = "wtd-sos-btn";
    btn.type = "button";
    btn.id = "wtdSosBtn";
    btn.setAttribute("aria-haspopup", "dialog");
    btn.textContent = t("JE SUIS EN DANGER !", "TANDINDOMIN-DOZA AHO !");
    // Couleur via inline (pas besoin toucher ton CSS global)
    btn.style.background = "#b00020";
    btn.style.color = "#fff";

    // Overlay + modal
    const overlay = document.createElement("div");
    overlay.className = "wtd-sos-overlay";
    overlay.id = "wtdSosOverlay";

    const modal = document.createElement("div");
    modal.className = "wtd-sos-modal";
    modal.id = "wtdSosModal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "wtdSosTitle");

    modal.innerHTML = `
      <div class="wtd-sos-row">
        <div>
          <h2 class="wtd-sos-title" id="wtdSosTitle">${escapeHtml(t("Urgence", "Vonjy"))}</h2>
          <div class="wtd-sos-small">
            ${escapeHtml(t(
              "Aucune surveillance. La position est partagée uniquement si vous cliquez.",
              "Tsy fanaraha-maso. Alefa ihany ny toerana raha manindry ianao."
            ))}
          </div>
        </div>

        <div class="wtd-sos-topright">
          <select class="wtd-sos-select" id="wtdSosLang" aria-label="Langue">
            <option value="fr">FR</option>
            <option value="mg">MG</option>
          </select>
          <button class="wtd-sos-close" id="wtdSosClose" type="button">${escapeHtml(t("Fermer", "Hidio"))}</button>
        </div>
      </div>

      <div class="wtd-sos-box">
        <strong>${escapeHtml(t("Que faire maintenant :", "Ataovy izao :"))}</strong>
        <ul class="wtd-sos-list" id="wtdSosList"></ul>
      </div>

      <div class="wtd-sos-box">
        <label for="wtdSosMsg"><strong>${escapeHtml(t("Message prêt à envoyer", "Hafatra vonona halefa"))}</strong></label>
        <textarea class="wtd-sos-textarea" id="wtdSosMsg" readonly></textarea>

        <div class="wtd-sos-actions" style="margin-top:10px;">
          <button class="danger" type="button" id="wtdSosGetPos">${escapeHtml(t("1) Obtenir ma position", "1) Raiso ny toerana"))}</button>
          <button type="button" id="wtdSosCopy">${escapeHtml(t("2) Copier le message", "2) Adikao ny hafatra"))}</button>
          <a class="secondary" href="#" id="wtdSosSMS">${escapeHtml(t("3) Envoyer à la famille", "3) Alefa amin'ny fianakaviana"))}</a>
          <div id="wtdSosCalls" style="display:flex; gap:10px; flex-wrap:wrap;"></div>
        </div>

        <div class="wtd-sos-small" id="wtdSosHint" style="margin-top:8px;"></div>
      </div>
    `;

    document.body.appendChild(btn);
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    // Init select value
    const sel = modal.querySelector("#wtdSosLang");
    sel.value = lang;
  }

  function wireUI() {
    const btn = document.getElementById("wtdSosBtn");
    const overlay = document.getElementById("wtdSosOverlay");
    const modal = document.getElementById("wtdSosModal");
    const close = document.getElementById("wtdSosClose");
    const selLang = document.getElementById("wtdSosLang");
    const list = document.getElementById("wtdSosList");
    const msgEl = document.getElementById("wtdSosMsg");
    const getPos = document.getElementById("wtdSosGetPos");
    const copyBtn = document.getElementById("wtdSosCopy");
    const smsLink = document.getElementById("wtdSosSMS");
    const callsWrap = document.getElementById("wtdSosCalls");
    const hint = document.getElementById("wtdSosHint");

    function refreshUI() {
      // textes
      btn.textContent = t("JE SUIS EN DANGER !", "TANDINDOMIN-DOZA AHO !");
      document.getElementById("wtdSosTitle").textContent = t("Urgence", "Vonjy");
      close.textContent = t("Fermer", "Hidio");
      getPos.textContent = t("1) Obtenir ma position", "1) Raiso ny toerana");
      copyBtn.textContent = t("2) Copier le message", "2) Adikao ny hafatra");
      smsLink.textContent = t("3) Envoyer à la famille", "3) Alefa amin'ny fianakaviana");

      // liste actions
      list.innerHTML = `
        <li>${escapeHtml(t("Si vous êtes suivi(e), entrez dans un lieu public.", "Raha arahana ianao, midira amin'ny toerana be olona."))}</li>
        <li>${escapeHtml(t("Cliquez “Obtenir ma position” puis envoyez le message.", "Tsindrio “Raiso ny toerana” dia alefaso ny hafatra."))}</li>
        <li>${escapeHtml(t("Appelez un numéro d'urgence si vous pouvez parler.", "Antsoy vonjy raha afaka miresaka ianao."))}</li>
      `;

      // calls
      callsWrap.innerHTML = "";
      (cfg.emergency_numbers || []).forEach(item => {
        const a = document.createElement("a");
        a.href = `tel:${(item.phone || "").trim()}`;
        a.className = "secondary";
        a.textContent = (lang === "mg" ? item.label_mg : item.label_fr) || item.phone || "Appeler";
        a.setAttribute("aria-label", a.textContent);
        callsWrap.appendChild(a);
      });

      // message
      msgEl.value = lastMessage || t(
        "Cliquez sur “Obtenir ma position” pour générer le message.",
        "Tsindrio “Raiso ny toerana” mba hamoronana hafatra."
      );

      // sms link (famille1 par défaut)
      const fam = cfg.contacts && cfg.contacts.family1 ? cfg.contacts.family1.phone : "";
      smsLink.href = buildSmsHref(fam, lastMessage || "");
      hint.textContent = t(
        "Le bouton “Envoyer à la famille” ouvre votre application SMS (si disponible).",
        "Ny bokotra “Alefa amin'ny fianakaviana” dia manokatra SMS (raha misy)."
      );
    }

    function open() {
      overlay.setAttribute("open", "");
      modal.setAttribute("open", "");
      modal.focus?.();
      refreshUI();
    }

    function closeIt() {
      overlay.removeAttribute("open");
      modal.removeAttribute("open");
    }

    btn.addEventListener("click", open);
    overlay.addEventListener("click", closeIt);
    close.addEventListener("click", closeIt);

    selLang.addEventListener("change", () => {
      lang = selLang.value === "mg" ? "mg" : "fr";
      refreshUI();
    });

    getPos.addEventListener("click", async () => {
      const now = new Date();
      const time = now.toLocaleString();

      // Géoloc uniquement si dispo + autorisée
      const pos = await getGeolocationOnce();
      if (!pos) {
        lastCoords = null;
        lastMessage = fillTemplate(cfg.message_templates[lang], {
          coords: t("Position indisponible", "Tsy azo ny toerana"),
          maps: "—",
          time
        });
        refreshUI();
        return;
      }

      lastCoords = pos;
      const coords = `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`;
      const maps = `https://maps.google.com/?q=${encodeURIComponent(coords)}`;

      lastMessage = fillTemplate(cfg.message_templates[lang], {
        coords,
        maps,
        time
      });

      refreshUI();
    });

    copyBtn.addEventListener("click", async () => {
      const text = (document.getElementById("wtdSosMsg").value || "").trim();
      if (!text) return;

      try {
        await navigator.clipboard.writeText(text);
        hint.textContent = t("Message copié.", "Voakopia ny hafatra.");
      } catch {
        hint.textContent = t("Copie impossible ici. Sélectionnez et copiez manuellement.", "Tsy azo adika eto. Safidio dia adikao amin-tanana.");
      }
    });

    // Première init
    refreshUI();
  }

  function buildSmsHref(phone, message) {
    // Compat multi-plateforme: iOS utilise &body, Android ?body.
    const p = (phone || "").trim();
    const body = encodeURIComponent(message || "");
    // Si pas de téléphone, on ouvre SMS vide (ça évite un lien cassé)
    const target = p ? p : "";
    return `sms:${target}?&body=${body}`;
  }

  function fillTemplate(tpl, vars) {
    return String(tpl || "")
      .replaceAll("{coords}", vars.coords ?? "")
      .replaceAll("{maps}", vars.maps ?? "")
      .replaceAll("{time}", vars.time ?? "");
  }

  async function getGeolocationOnce() {
    if (!("geolocation" in navigator)) return null;

    return new Promise(resolve => {
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    }[c]));
  }

})();
