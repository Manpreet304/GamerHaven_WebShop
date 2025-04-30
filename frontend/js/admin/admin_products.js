// admin.products.js
(function(window, $) {
  function initTabs() {
    document.querySelectorAll("#adminTabs button").forEach(btn => {
      btn.addEventListener("click", e => {
        e.preventDefault();
        new bootstrap.Tab(btn).show();
      });
    });
  }

  function loadProducts() {
    $.get("../../backend/api/ApiAdmin.php?listProducts")
      .done(products => {
        const tbody = $("#productsTable tbody").empty();
        products.forEach(p => {
          tbody.append(`
            <tr>
              <td>${p.id}</td>
              <td>${p.name}</td>
              <td>€${Number(p.price).toFixed(2)}</td>
              <td>${p.stock}</td>
              <td>${p.rating ?? "-"}</td>
              <td>
                <button class="btn btn-sm btn-primary edit-product" data-id="${p.id}">Edit</button>
                <button class="btn btn-sm btn-danger delete-product" data-id="${p.id}">Delete</button>
              </td>
            </tr>
          `);
        });
      })
      .fail(xhr => handleResponse(xhr.responseJSON || {}, {
        errorMessage: "Products could not be loaded."
      }));
  }

  function openProductModal(id) {
    resetForm("#productForm");
    $("#existingImages").empty();

    if (id) {
      $.get(`../../backend/api/ApiAdmin.php?getProduct&id=${id}`)
        .done(p => {
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
        })
        .fail(xhr => handleResponse(xhr.responseJSON || {}, {
          errorMessage: "Product data could not be loaded."
        }));
    }

    new bootstrap.Modal(document.getElementById("productModal")).show();
  }

  function saveProduct() {
    const form = $("#productForm")[0];
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const fd = new FormData(form);
    const attributesObj = {};
    $("#productAttributes").val().split(/\r?\n/).forEach(line => {
      const [k, v] = line.split(/:\s*/, 2);
      if (v !== undefined) attributesObj[k.trim()] = v.trim();
    });
    fd.set("attributes", JSON.stringify(attributesObj));

    const id = $("#productId").val();
    const url = id
      ? `../../backend/api/ApiAdmin.php?updateProduct&id=${id}`
      : `../../backend/api/ApiAdmin.php?addProduct`;

    $.ajax({
      url,
      method: "POST",
      processData: false,
      contentType: false,
      data: fd
    })
      .done(resp => handleResponse(resp, {
        successMessage: id ? "Product updated successfully." : "Product added successfully.",
        onSuccess: () => {
          loadProducts();
          bootstrap.Modal.getInstance(document.getElementById("productModal")).hide();
        }
      }))
      .fail(xhr => handleResponse(xhr.responseJSON || {}, {
        errorMessage: "Error saving product."
      }));
  }

  function deleteProduct(id) {
    $.post(`../../backend/api/ApiAdmin.php?deleteProduct&id=${id}`)
      .done(resp => handleResponse(resp, {
        successMessage: "Product deleted successfully.",
        onSuccess: loadProducts
      }))
      .fail(xhr => handleResponse(xhr.responseJSON || {}, {
        errorMessage: "Error deleting product."
      }));
  }

  function bindProductEvents() {
    $("#addProductBtn").click(() => openProductModal());

    $(document).on("click", ".edit-product", e =>
      openProductModal($(e.currentTarget).data("id"))
    );

    $(document).on("click", ".delete-product", function() {
      deleteProduct($(this).data("id"));
    });

    $("#saveProductBtn").click(saveProduct);
  }

  $(function() {
    initTabs();
    loadProducts();
    bindProductEvents();
  });
})(window, jQuery);
