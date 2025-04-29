// /customer/products_ui.js

function initProductUI() {
    setupHoverRotation([]);
  }
  
  // Produkte im Grid anzeigen
  function renderProducts(products) {
    const grid = $("#productGrid").empty();
    const modals = $("#modals-container").empty();
    const tplCard = document.getElementById("product-template").content;
    const tplModal = document.getElementById("product-modal-template").content;
  
    products.forEach(function (product, index) {
      // --- Produktkarte erstellen ---
      const $card = $(tplCard.cloneNode(true)).find(".product-card");
      $card.attr("data-product-id", product.id)
        .find(".product-image").attr("src", product.images?.[0] || "pictures/placeholder.jpg").attr("data-index", index);
      $card.find(".card-title").text(product.name);
      $card.find(".card-meta").text(`${product.category} · ${product.brand}`);
      $card.find(".product-price").text(`€${product.price}`);
      $card.find(".rating").html(renderStars(product.rating));
      $card.find(".view-details")
        .attr("data-bs-toggle", "modal")
        .attr("data-bs-target", `#productModal${product.id}`);
  
      grid.append($card.closest(".col-md-4"));
  
      // --- Produktmodal erstellen ---
      const $modal = $(tplModal.cloneNode(true)).find(".product-modal")
        .attr("id", `productModal${product.id}`)
        .attr("data-product-id", product.id);
  
      $modal.find(".modal-title").text(product.name);
      $modal.find(".modal-product-image").attr("src", product.images?.[0] || "pictures/placeholder.jpg");
  
      // 💥 Smooth Rotation für mehrere Bilder im Modal
      if (product.images?.length > 1) {
        let currentIndex = 0;
        const $modalImage = $modal.find(".modal-product-image");
  
        setInterval(function () {
          $modalImage.fadeOut(300, function () {
            currentIndex = (currentIndex + 1) % product.images.length;
            $modalImage.attr("src", product.images[currentIndex]).fadeIn(300);
          });
        }, 2500);
      }
  
      // --- Weitere Produktdetails ---
      $modal.find(".product-description").html(`<strong>Description:</strong><br>${product.description || "No description"}`);
      $modal.find(".product-price-text").html(`<strong>Price:</strong> €${product.price}`);
      $modal.find(".product-stock").html(`<strong>Stock:</strong> ${product.stock > 0 ? "✅ In Stock" : "❌ Out of Stock"}`);
      $modal.find(".product-category").html(`<strong>Category:</strong> ${product.category} / ${product.sub_category}`);
      $modal.find(".product-rating").html(`<strong>Rating:</strong> ${renderStars(product.rating)}`);
  
      // --- Attribute nur einfügen wenn vorhanden ---
      const attributesHtml = renderAttributes(product.attributes);
      $modal.find(".attributes").html(
        attributesHtml ? `<strong>Attributes:</strong><br>${attributesHtml}` : ""
      );
  
      modals.append($modal.closest(".modal"));
    });
  }
  
  // Attribute korrekt rendern
  function renderAttributes(attrString) {
    try {
      const obj = JSON.parse(attrString);
      return Object.entries(obj).map(([key, value]) => `<div><strong>${key}:</strong> ${value}</div>`).join("");
    } catch {
      return "";
    }
  }
  
  // ⭐️ Hover Effekt bei Produktbildern (mit Smooth Fade)
  function setupHoverRotation(products) {
    $(".product-card").each(function () {
      const $img = $(this).find(".product-image");
      const imgs = products[$img.data("index")]?.images || [];
  
      if (imgs.length <= 1) return;
  
      let interval;
      $(this).hover(
        function () {
          interval = setInterval(function () {
            const current = imgs.indexOf($img.attr("src"));
            const next = (current + 1) % imgs.length;
            $img.fadeOut(300, function () {
              $img.attr("src", imgs[next]).fadeIn(300);
            });
          }, 2000);
        },
        function () {
          clearInterval(interval);
          $img.fadeOut(300, function () {
            $img.attr("src", imgs[0]).fadeIn(300);
          });
        }
      );
    });
  }
  
  // ⭐️ Sterne Bewertung richtig anzeigen
  function renderStars(rating) {
    const r = parseFloat(rating) || 0;
    const full = Math.floor(r);
    const half = r - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
  
    return `
      ${'<i class="bi bi-star-fill text-warning"></i>'.repeat(full)}
      ${half ? '<i class="bi bi-star-half text-warning"></i>' : ''}
      ${'<i class="bi bi-star text-warning"></i>'.repeat(empty)}
      <span class="ms-1 text-muted">(${r.toFixed(1)})</span>
    `;
  }
  