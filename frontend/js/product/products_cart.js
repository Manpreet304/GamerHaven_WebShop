// products.cart.js
(function (window, $) {
  const ProductsCart = {
    animateCartButtons(productId, success) {
      const buttons = [
        $(`.product-card[data-product-id='${productId}'] .add-to-cart`),
        $(`#productModal${productId} .add-to-cart`)
      ];

      buttons.forEach(btn => {
        btn.removeClass("button-added button-error")
          .addClass(success ? "button-added" : "button-error")
          .html(success
            ? '<i class="bi bi-check-lg me-1"></i> Added'
            : '<i class="bi bi-x-circle me-1"></i> Error'
          );

        setTimeout(() => {
          btn.removeClass("button-added button-error")
            .html('<i class="bi bi-cart-plus me-1"></i> Add to Cart');
        }, 2000);
      });
    },

    initDragDrop() {
      const scrollThreshold = 60;
      const scrollSpeed = 30;

      // Auto-scroll during drag
      $(document).on("dragover", ev => {
        const y = ev.originalEvent.clientY;
        if (y < scrollThreshold) window.scrollBy(0, -scrollSpeed);
        else if (y > window.innerHeight - scrollThreshold) window.scrollBy(0, scrollSpeed);
      });

      // Drop zone styling
      const dropZone = "#cart-drop-area";
      $(document).on("dragover", dropZone, ev => {
        ev.preventDefault();
        $(ev.currentTarget).addClass("drag-over");
      });

      $(document).on("dragleave drop", dropZone, ev => {
        ev.preventDefault();
        $(ev.currentTarget).removeClass("drag-over");
      });

      // Drop event handler
      $(document).on("drop", dropZone, ev => {
        ev.preventDefault();
        const pid = parseInt(ev.originalEvent.dataTransfer.getData("text/plain"), 10);

        if (!isNaN(pid)) {
          window.ProductsAPI.addToCart(pid, 1, {
            onSuccess: () => {
              updateCartCount();
              ProductsCart.animateCartButtons(pid, true);
            },
            onError: () => {
              ProductsCart.animateCartButtons(pid, false);
              showMessage("danger", "Failed to add product to cart.");
            }
          });
        }
      });
    }
  };

  window.ProductsCart = ProductsCart;
})(window, jQuery);
