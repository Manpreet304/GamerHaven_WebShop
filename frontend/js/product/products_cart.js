(function(window, $) {
  'use strict';

  const ProductsCart = {
    // [1] Add-to-Cart Button animieren (grün bei Erfolg, rot bei Fehler)
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

    // [2] Drag-and-Drop-Verhalten aktivieren
    initDragDrop() {
      const scrollThreshold = 60;
      const scrollSpeed     = 30;
      const dropZone        = '#cart-drop-area';

      // [2.1] Beim Rand scrollen
      $(document).on('dragover', ev => {
        const y = ev.originalEvent.clientY;
        if (y < scrollThreshold) window.scrollBy(0, -scrollSpeed);
        else if (y > window.innerHeight - scrollThreshold) window.scrollBy(0, scrollSpeed);
      });

      // [2.2] Dropzone optisch markieren
      $(document).on('dragover', dropZone, ev => {
        ev.preventDefault();
        $(ev.currentTarget).addClass('drag-over');
      });
      $(document).on('dragleave drop', dropZone, ev => {
        ev.preventDefault();
        $(ev.currentTarget).removeClass('drag-over');
      });

      // [2.3] Produkt ablegen → zum Warenkorb hinzufügen
      $(document).on('drop', dropZone, ev => {
        ev.preventDefault();
        const pid = parseInt(ev.originalEvent.dataTransfer.getData('text/plain'), 10);
        if (!isNaN(pid)) {
          window.ProductsAPI.addToCart(pid, 1, {
            onSuccess: () => {
              updateCartCount();
              ProductsCart.animateCartButtons(pid, true);
            },
            onError: err => {
              ProductsCart.animateCartButtons(pid, false);
              handleResponse(err, {
                errorMessage: err?.message || err?.data?.error || 'Failed to add product to cart.'
              });
            }
          });
        }
      });
    }
  };

  window.ProductsCart = ProductsCart;

})(window, jQuery);
