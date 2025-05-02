// js/admin/admin_products.js
(function(window, $) {
  // Tab-Navigation initialisieren
  function initTabs() {
    document.querySelectorAll("#adminTabs button").forEach(btn => {
      btn.addEventListener("click", e => {
        e.preventDefault();
        new bootstrap.Tab(btn).show();
      });
    });
  }

  // Produkte laden
  function loadProducts() {
    apiRequest({
      url: "../../backend/api/ApiAdmin.php?listProducts",
      method: "GET",
      onSuccess: res => {
        const products = res.data; // Array von Produkten
        const $tbody   = $("#productsTable tbody").empty();

        products.forEach(p => {
          $tbody.append(`
            <tr data-id="${p.id}">
              <td>${p.id}</td>
              <td>${p.name}</td>
              <td>€${Number(p.price).toFixed(2)}</td>
              <td>${p.stock}</td>
              <td>${p.rating ?? "-"}</td>
              <td>
                <button class="btn btn-sm btn-primary edit-product">Edit</button>
                <button class="btn btn-sm btn-danger delete-product">Delete</button>
              </td>
            </tr>
          `);
        });
      },
      onError: err => {
        // zeigt die Backend-Nachricht oder Fallback
        handleResponse(err, {});
      }
    });
  }

  // Modal öffnen und Daten befüllen
  function openProductModal(id) {
    resetForm("#productForm");
    $("#existingImages").empty();

    const modalEl = document.getElementById("productModal");
    const modal = new bootstrap.Modal(modalEl);

    if (id) {
      apiRequest({
        url: `../../backend/api/ApiAdmin.php?getProduct&id=${id}`,
        method: "GET",
        onSuccess: res => {
          const p = res.data;
          $("#productId").val(p.id);
          $("#productName").val(p.name);
          $("#productBrand").val(p.brand);
          $("#productCategory").val(p.category);
          $("#productSubCategory").val(p.sub_category);
          $("#productPrice").val(p.price);
          $("#productStock").val(p.stock);
          $("#productRating").val(p.rating);
          $("#productDescription").val(p.description);
          if (p.attributes) {
            const attrs = JSON.parse(p.attributes);
            $("#productAttributes").val(
              Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join("\n")
            );
          }
          if (p.image_url) {
            JSON.parse(p.image_url).forEach(src => {
              $("#existingImages").append(`<li class="list-group-item">${src}</li>`);
            });
          }
          modal.show();
        },
        onError: err => handleResponse(err, {})
      });
    } else {
      modal.show();
    }
  }

  // Produkt speichern (add/update)
  function saveProduct() {
    const form = $("#productForm")[0];
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const fd = new FormData(form);
    const attrs = {};
    $("#productAttributes").val().split(/\r?\n/).forEach(line => {
      const [k, v] = line.split(/:\s*/, 2);
      if (v !== undefined) attrs[k.trim()] = v.trim();
    });
    fd.set("attributes", JSON.stringify(attrs));

    const id  = $("#productId").val();
    const url = id
      ? `../../backend/api/ApiAdmin.php?updateProduct&id=${id}`
      : `../../backend/api/ApiAdmin.php?addProduct`;

    $.ajax({
      url,
      method: "POST",
      processData: false,
      contentType: false,
      data: fd,
      xhrFields: { withCredentials: true }
    })
    .done(resp => handleResponse(resp, {
      successMessage: id ? "Product updated successfully." : "Product added successfully.",
      onSuccess: () => {
        loadProducts();
        bootstrap.Modal.getInstance(document.getElementById("productModal")).hide();
      }
    }))
    .fail(xhr => handleResponse(xhr.responseJSON || {}, {
      // kein statischer errorMessage hier, resp.message wird verwendet
    }));
  }

  // Produkt löschen
  function deleteProduct(id) {
    apiRequest({
      url: `../../backend/api/ApiAdmin.php?deleteProduct&id=${id}`,
      method: "POST",
      successMessage: "Product deleted successfully.",
      onSuccess: loadProducts,
      onError: err => handleResponse(err, {})
    });
  }

  // Event-Handler binden
  function bindProductEvents() {
    $("#addProductBtn").on("click", () => openProductModal());

    $(document).on("click", ".edit-product", function() {
      openProductModal($(this).closest("tr").data("id"));
    });

    $(document).on("click", ".delete-product", function() {
      deleteProduct($(this).closest("tr").data("id"));
    });

    $("#saveProductBtn").on("click", saveProduct);
  }

  // Initialisierung
  $(function() {
    initTabs();
    loadProducts();
    bindProductEvents();
  });
})(window, jQuery);
