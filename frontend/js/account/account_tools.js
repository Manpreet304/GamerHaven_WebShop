/**
 * js/account/account_tools.js
 * Kleine Utility-Funktionen für den Account-Bereich
 */
(function(window, $) {
  'use strict';

  const AccountTools = {
    // Tooltips initialisieren
    initTooltips() {
      $('[data-bs-toggle="tooltip"]').each((_, el) => new bootstrap.Tooltip(el));
    }
  };

  window.AccountTools = AccountTools;
})(window, jQuery);
