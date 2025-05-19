/**
 * js/account/account_tools.js
 * Kleine Utility-Funktionen für den Account-Bereich
 */
(function(window, $) {
  'use strict';

  // [1] Sammlung von Hilfsfunktionen für Account
  const AccountTools = {

    // [1.1] Tooltips aus Bootstrap initialisieren
    initTooltips() {
      $('[data-bs-toggle="tooltip"]').each((_, el) => new bootstrap.Tooltip(el));
    }
  };

  // [2] Globale Bereitstellung
  window.AccountTools = AccountTools;

})(window, jQuery);