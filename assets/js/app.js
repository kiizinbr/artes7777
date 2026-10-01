/* =============================================================================
   Único script do hub: o botão "Copiar link" de cada vídeo e card.
   Ele nasce `hidden` no HTML — sem este arquivo o botão nem aparece, e o
   "Baixar" e o "WhatsApp" continuam funcionando, porque são links puros.
   Não escreve cookie nem guarda nada.
   ========================================================================== */
(function () {
  "use strict";

  function copia(texto) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(texto);
    }
    // Fallback para navegador sem a API (webview antiga): textarea + execCommand
    return new Promise(function (ok, falha) {
      var campo = document.createElement("textarea");
      campo.value = texto;
      campo.setAttribute("readonly", "");
      campo.style.position = "fixed";
      campo.style.opacity = "0";
      document.body.appendChild(campo);
      campo.select();
      try { document.execCommand("copy") ? ok() : falha(); } catch (e) { falha(e); }
      document.body.removeChild(campo);
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-copia]"), function (botao) {
    var rotulo = botao.querySelector("[data-copia-rotulo]");
    var original = rotulo.textContent;
    var volta;
    botao.hidden = false;
    botao.addEventListener("click", function () {
      copia(botao.getAttribute("data-copia")).then(function () {
        rotulo.textContent = "Link copiado!";
        botao.classList.add("copiado");
      }, function () {
        // Sem área de transferência: mostra o link para a pessoa copiar na mão
        window.prompt("Copie o link:", botao.getAttribute("data-copia"));
      });
      clearTimeout(volta);
      volta = setTimeout(function () {
        rotulo.textContent = original;
        botao.classList.remove("copiado");
      }, 2200);
    });
  });
})();
