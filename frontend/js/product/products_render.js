// products.render.js
(function(window, $) {
    const ProductsRender = {
      renderStars(rating) {
        const r = parseFloat(rating) || 0;
        const full = Math.floor(r);
        const half = r - full >= 0.5;
        const emptyCount = 5 - full - (half ? 1 : 0);
        return Array(full).fill('<i class="bi bi-star-fill text-warning"></i>').join("") +
               (half ? '<i class="bi bi-star-half text-warning"></i>' : "") +
               Array(emptyCount).fill('<i class="bi bi-star text-warning"></i>').join("") +
               ` <span class="ms-1 text-muted">(${r.toFixed(1)})</span>`;
      },
  
      renderAttributes(attrString) {
        try {
          const obj = JSON.parse(attrString);
          return Object.entries(obj)
            .map(([k, v]) => `<div><strong>${k}:</strong> ${v}</div>`)
            .join("");
        } catch {
          return "<i>No attributes</i>";
        }
      },
  
      setupHoverRotation(products) {
        $(".product-card").each(function() {
          const $img = $(this).find(".product-image");
          const idx = $img.data("index");
          const imgs = products[idx]?.images || [];
          if (imgs.length <= 1) return;
  
          let interval;
          $(this).hover(
            () => {
              interval = setInterval(() => {
                const cur = imgs.indexOf($img.attr("src"));
                const next = (cur + 1) % imgs.length;
                $img.attr("src", imgs[next]);
              }, 2000);
            },
            () => {
              clearInterval(interval);
              $img.attr("src", imgs[0]);
            }
          );
        });
      },
  
      renderProducts(products) {
        const grid = $("#productGrid").empty();
        const mods = $("#modals-container").empty();
        const tplCard = document.getElementById("product-template").content;
        const tplModal = document.getElementById("product-modal-template").content;
  
        products.forEach((p, i) => {
          // Karte
          const $card = $(tplCard.cloneNode(true)).find(".product-card")
            .attr("data-product-id", p.id)
            .attr("draggable", "true")
            .on("dragstart", ev => {
              ev.originalEvent.dataTransfer.setData("text/plain", p.id);
              $card.addClass("dragging");
            })
            .on("dragend", () => $card.removeClass("dragging"));
  
          $card.find(".product-image")
               .attr("src", p.images?.[0] || "pictures/placeholder.jpg")
               .attr("data-index", i);
          $card.find(".card-title").text(p.name);
          $card.find(".card-meta").text(`${p.category} · ${p.brand}`);
          $card.find(".product-price").text(`€${p.price}`);
          $card.find(".rating").html(this.renderStars(p.rating));
          $card.find(".view-details")
               .attr("data-bs-toggle", "modal")
               .attr("data-bs-target", `#productModal${p.id}`);
  
          grid.append($card.closest(".col-md-4"));
  
          // Modal
          const $mod = $(tplModal.cloneNode(true)).find(".product-modal")
            .attr("id", `productModal${p.id}`);
          $mod.find(".modal-product-image")
              .attr("src", p.images?.[0] || "pictures/placeholder.jpg");
          if (p.images?.length > 1) {
            let idx = 0;
            setInterval(() => {
              idx = (idx + 1) % p.images.length;
              $mod.find(".modal-product-image").attr("src", p.images[idx]);
            }, 2500);
          }
          $mod.find(".modal-title").text(p.name);
          $mod.find(".product-description")
              .html(`<strong>Description:</strong><br>${p.description||"No description"}`);
          $mod.find(".product-price-text")
              .html(`<strong>Price:</strong> €${p.price}`);
          $mod.find(".product-stock")
              .html(`<strong>Stock:</strong> ${p.stock>0?"✅ In Stock":"❌ Out of Stock"}`);
          $mod.find(".product-category")
              .html(`<strong>Category:</strong> ${p.category} / ${p.sub_category}`);
          $mod.find(".product-rating")
              .html(`<strong>Rating:</strong> ${this.renderStars(p.rating)}`);
          $mod.find(".attributes")
              .html(`<strong>Attributes:</strong><br>${this.renderAttributes(p.attributes)}`);
          mods.append($mod.closest(".modal"));
        });
      }
    };
  
    window.ProductsRender = ProductsRender;
  })(window, jQuery);
  