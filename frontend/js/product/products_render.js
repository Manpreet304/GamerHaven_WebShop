(function(window, $) {
  'use strict';

  const ProductsRender = {
    // [1] Sterne-Rating als HTML
    renderStars(rating) {
      const r     = parseFloat(rating) || 0;
      const full  = Math.floor(r);
      const half  = r - full >= 0.5;
      const empty = 5 - full - (half ? 1 : 0);
      return (
        '<span class="stars">' +
        '<i class="bi bi-star-fill text-warning"></i>'.repeat(full) +
        (half ? '<i class="bi bi-star-half text-warning"></i>' : '') +
        '<i class="bi bi-star text-warning"></i>'.repeat(empty) +
        ` <span class="ms-1 text-muted">(${r.toFixed(1)})</span>` +
        '</span>'
      );
    },

    // [2] Attributliste als HTML generieren
    renderAttributes(attrString) {
      try {
        const obj = JSON.parse(attrString);
        return Object.entries(obj)
          .map(([k, v]) => `<div><strong>${k}:</strong> ${v}</div>`)
          .join('');
      } catch {
        return '<i>No attributes</i>';
      }
    },

    // [3] Hover-Bildwechsel aktivieren (Galerie)
    setupHoverRotation(products) {
      $('.product-card').each(function() {
        const $img = $(this).find('.product-image');
        const idx  = $img.data('index');
        const imgs = products[idx]?.images || [];
        if (imgs.length <= 1) return;

        let interval;
        $(this).hover(
          () => {
            interval = setInterval(() => {
              const cur  = imgs.indexOf($img.attr('src'));
              const next = (cur + 1) % imgs.length;
              $img.attr('src', imgs[next]);
            }, 2000);
          },
          () => {
            clearInterval(interval);
            $img.attr('src', imgs[0]);
          }
        );
      });
    },

    // [4] Produktkarten und zugehörige Modals erzeugen
    renderProducts(products) {
      const grid = $('#productGrid').empty();
      const mods = $('#modals-container').empty();
      const tplCard  = document.getElementById('product-template').content;
      const tplModal = document.getElementById('product-modal-template').content;

      products.forEach((p, idx) => {
        // [4.1] Karte bauen
        const $card = $(tplCard.cloneNode(true)).find('.product-card')
          .attr('data-product-id', p.id)
          .attr('draggable','true')
          .on('dragstart', ev => {
            ev.originalEvent.dataTransfer.setData('text/plain', p.id);
            $card.addClass('dragging');
          })
          .on('dragend', () => $card.removeClass('dragging'));

        $card.find('.product-image')
          .attr('src', p.images?.[0] || 'pictures/placeholder.jpg')
          .attr('data-index', idx);
        $card.find('.card-title').text(p.name);
        $card.find('.card-meta').text(`${p.category} · ${p.brand}`);
        $card.find('.product-price').text(`€${p.price}`);
        $card.find('.rating').html(this.renderStars(p.rating));
        $card.find('.view-details')
          .attr('data-bs-toggle','modal')
          .attr('data-bs-target',`#productModal${p.id}`);

        grid.append($card.closest('.col-md-4'));

        // [4.2] Modal bauen
        const $mod    = $(tplModal.cloneNode(true)).find('.product-modal')
                          .attr('id',`productModal${p.id}`);
        const $modImg = $mod.find('.modal-product-image')
                          .attr('src', p.images?.[0] || 'pictures/placeholder.jpg');

        // Bild-Slideshow im Modal
        if (p.images?.length > 1) {
          let i = 0;
          $mod.on('shown.bs.modal', () => {
            const iv = setInterval(() => {
              i = (i + 1) % p.images.length;
              $modImg.attr('src', p.images[i]);
            }, 2500);
            $mod.data('slideshowInterval', iv);
          }).on('hidden.bs.modal', () => {
            clearInterval($mod.data('slideshowInterval'));
          });
        }

        $mod.find('.modal-title').text(p.name);
        $mod.find('.product-description')
          .html(`<strong>Description:</strong><br>${p.description || 'No description'}`);
        $mod.find('.product-price-text')
          .html(`<strong>Price:</strong> €${p.price}`);
        $mod.find('.product-stock')
          .html(`<strong>Stock:</strong> ${p.stock > 0 ? '✅ In Stock' : '❌ Out of Stock'}`);
        $mod.find('.product-category')
          .html(`<strong>Category:</strong> ${p.category}${p.sub_category ? '/' + p.sub_category : ''}`);
        $mod.find('.product-rating').html(`<strong>Rating:</strong> ${this.renderStars(p.rating)}`);
        $mod.find('.attributes')
          .html(`<strong>Attributes:</strong><br>${this.renderAttributes(p.attributes)}`);

        mods.append($mod.closest('.modal'));
      });
    }
  };

  window.ProductsRender = ProductsRender;

})(window, jQuery);
