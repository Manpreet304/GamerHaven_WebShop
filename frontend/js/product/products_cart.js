/**
 * js/products/products.cart.js
 * Verantwortlich für Animation und Drag-n-Drop im Warenkorb
 */
(function(window, $) {
  'use strict';

  const ProductsCart = {
    // Add-to-Cart Button animieren (Erfolg oder Fehler)
    animateCartButtons(productId, success) {
      const selectors = [
        `.product-card[data-product-id='${productId}'] .add-to-cart`,
        `#productModal${productId} .add-to-cart`
      ];
      selectors.forEach(sel => {
        const btn = $(sel);
        btn
          .removeClass('button-added button-error')
          .addClass(success ? 'button-added' : 'button-error')
          .html(success
            ? '<i class="bi bi-check-lg me-1"></i> Added'
            : '<i class="bi bi-x-circle me-1"></i> Error'
          );
        setTimeout(() => {
          btn.removeClass('button-added button-error')
             .html('<i class="bi bi-cart-plus me-1"></i> Add to Cart');
        }, 2000);
      });
    },

    // Drag-n-Drop auf Seite aktivieren
    initDragDrop() {
      const scrollThreshold = 60;
      const scrollSpeed     = 30;
      const dropZone        = '#cart-drop-area';

      // Scroll bei Randnähe während Drag
      $(document).on('dragover', ev => {
        const y = ev.originalEvent.clientY;
        if (y < scrollThreshold) window.scrollBy(0, -scrollSpeed);
        else if (y > window.innerHeight - scrollThreshold) window.scrollBy(0, scrollSpeed);
      });

      // Dropzone-Optik
      $(document).on('dragover', dropZone, ev => {
        ev.preventDefault();
        $(ev.currentTarget).addClass('drag-over');
      });
      $(document).on('dragleave drop', dropZone, ev => {
        ev.preventDefault();
        $(ev.currentTarget).removeClass('drag-over');
      });

      // Produkt in Warenkorb via Drop
      $(document).on('drop', dropZone, ev => {
        ev.preventDefault();
        const pid = parseInt(ev.originalEvent.dataTransfer.getData('text/plain'), 10);
        if (!isNaN(pid)) {
          window.ProductsAPI.addToCart(pid, 1, {
            onSuccess: () => {
              updateCartCount();
              ProductsCart.animateCartButtons(pid, true);
            },
            onError: () => {
              ProductsCart.animateCartButtons(pid, false);
              showMessage('danger', 'Failed to add product to cart.');
            }
          });
        }
      });
    }
  };

  // Objekt global verfügbar machen
  window.ProductsCart = ProductsCart;

})(window, jQuery);