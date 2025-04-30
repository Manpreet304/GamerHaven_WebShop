// js/account.tools.js
(function(window, $) {
    const AccountTools = {
      initTooltips() {
        $('[data-bs-toggle="tooltip"]').each((_, el) => new bootstrap.Tooltip(el));
      }
    };
  
    window.AccountTools = AccountTools;
  })(window, jQuery);
  