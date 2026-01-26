/* =========================================================
   WTD BOT — Local, non-traçant, rassurant
   FR / MG
   Aucun stockage, aucun appel serveur
========================================================= */

(function () {

  const LANG = document.documentElement.lang === "mg" ? "mg" : "fr";

  const TEXT = {
    fr: {
      hello: "Je suis là avec vous. Respirez. Vous n’êtes pas seul.",
      help: "Si vous êtes en danger immédiat, appuyez sur le bouton rouge.",
      danger: "JE SUIS EN DANGER !",
      call: "Appeler les secours",
      locate: "Partager ma position",
      locating: "Recherche de votre position…",
      located: "Position prête à être partagée.",
      refused: "Position non partagée. Vous pouvez appeler les secours.",
      noGeo: "La géolocalisation n’est pas disponible sur cet appareil.",
      disclaimer:
        "Ce bouton n’envoie rien automatiquement. Vous gardez le contrôle."
    },
    mg: {
      hello: "Eto aho miaraka aminao. Mifoka rivotra. Tsy irery ianao.",
      help: "Raha tandindomin-doza ianao dia tsindrio ilay bokotra mena.",
      danger: "TANDINDOMIN-DOZA AHO !",
      call: "Antsoy ny vonjy taitra",
      locate: "Zarao ny toerana misy ahy",
      locating: "Mitady ny toerana misy anao…",
      located: "Vonona ny toerana misy anao.",
      refused: "Tsy nozaraina ny toerana. Afaka miantso vonjy ianao.",
      noGeo: "Tsy misy géolocalisation amin’ity fitaovana ity.",
      disclaimer:
        "Tsy misy zavatra alefa ho azy. Ianao no mifehy tanteraka."
    }
  };

  const T = TEXT[LANG];

  // Numéros configurables (adapter si besoin)
  const EMERGENCY_NUMBER = "112";        // international
  const FAMILY_NUMBER = "";              // ex: "tel:+261XXXXXXXXX"

  function el(id) {
    return document.getElementById(id);
  }

  function setText() {
    el("bot-hello").textContent = T.hello;
    el("bot-help").textContent = T.help;
    el("btn-danger").textContent = T.danger;
    el("btn-call").textContent = T.call;
    el("btn-locate").textContent = T.locate;
    el("bot-disclaimer").textContent = T.disclaimer;
  }

  function callEmergency() {
    window.location.href = "tel:" + EMERGENCY_NUMBER;
  }

  function callFamily() {
    if (FAMILY_NUMBER) {
      window.location.href = FAMILY_NUMBER;
    }
  }

  function shareLocation() {
    const status = el("bot-status");

    if (!navigator.geolocation) {
      status.textContent = T.noGeo;
      return;
    }

    status.textContent = T.locating;

    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);

        const message =
          "Je suis en difficulté. Ma position est : " +
          "https://maps.google.com/?q=" + lat + "," + lng;

        // Aucune donnée envoyée : simple lien affiché
        const link = document.createElement("a");
        link.href = "sms:?body=" + encodeURIComponent(message);
        link.textContent = "Envoyer ma position par SMS";
        link.className = "btn btn-secondary";

        status.textContent = T.located;
        status.appendChild(document.createElement("br"));
        status.appendChild(link);
      },
      () => {
        status.textContent = T.refused;
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }

  document.addEventListener("DOMContentLoaded", () => {
    setText();

    el("btn-danger").addEventListener("click", callEmergency);
    el("btn-call").addEventListener("click", callEmergency);
    el("btn-locate").addEventListener("click", shareLocation);
  });

})();
