// /admin/products.js

$(document).ready(function () {
  initTabs();
  loadProducts();
  bindProductEvents();
});

/** ------------------- REITER (TABS) INITIALISIEREN ------------------- **/

function initTabs() {
  document.querySelectorAll("#adminTabs button").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      new bootstrap.Tab(btn).show();
    });
  });
}

/** ------------------- PRODUKTE LADEN ------------------- **/

function loadProducts() {
  $.get("../../backend/api/ApiAdmin.php?listProducts")
    .done(function (products) {
      const tbody = $("#productsTable tbody").empty();

      products.forEach(function (p) {
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
    .fail(function (xhr) {
      handleResponse(xhr.responseJSON || {}, { errorMessage: "Failed to load products." });
    });
}

/** ------------------- PRODUKT BEARBEITEN ------------------- **/

function openProductModal(id) {
  resetForm("#productForm");
  $("#existingImages").empty();

  if (id) {
    $.get(`../../backend/api/ApiAdmin.php?getProduct&id=${id}`)
      .done(function (p) {
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
            Object.entries(attrs).map(function ([k, v]) {
              return `${k}: ${v}`;
            }).join("\n")
          );
        }

        if (p.image_url) {
          JSON.parse(p.image_url).forEach(function (src) {
            $("#existingImages").append(`<li class="list-group-item">${src}</li>`);
          });
        }
      })
      .fail(function (xhr) {
        handleResponse(xhr.responseJSON || {}, { errorMessage: "Failed to load product data." });
      });
  }

  new bootstrap.Modal(document.getElementById("productModal")).show();
}

/** ------------------- PRODUKT SPEICHERN ------------------- **/

function saveProduct() {
  const form = $("#productForm")[0];
  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  const fd = new FormData(form);

  // Attribute-Textfeld in JSON umwandeln
  const attributesObj = {};
  $("#productAttributes").val().split(/\r?\n/).forEach(function (line) {
    const [key, value] = line.split(/:\s*/, 2);
    if (value !== undefined) {
      attributesObj[key.trim()] = value.trim();
    }
  });

  fd.set("attributes", JSON.stringify(attributesObj));

  const id = $("#productId").val();
  const url = id
    ? `../../backend/api/ApiAdmin.php?updateProduct&id=${id}`
    : `../../backend/api/ApiAdmin.php?addProduct`;

  $.ajax({
    url: url,
    method: "POST",
    processData: false,
    contentType: false,
    data: fd
  })
    .done(function (response) {
      handleResponse(response, {
        successMessage: id ? "Product updated successfully." : "Product added successfully.",
        onSuccess: function () {
          loadProducts();
          bootstrap.Modal.getInstance(document.getElementById("productModal")).hide();
        }
      });
    })
    .fail(function (xhr) {
      handleResponse(xhr.responseJSON || {}, { errorMessage: "Failed to save product." });
    });
}

/** ------------------- PRODUKT LÖSCHEN ------------------- **/

function deleteProduct(id) {
  $.post(`../../backend/api/ApiAdmin.php?deleteProduct&id=${id}`)
    .done(function (response) {
      handleResponse(response, {
        successMessage: "Product deleted successfully.",
        onSuccess: loadProducts
      });
    })
    .fail(function (xhr) {
      handleResponse(xhr.responseJSON || {}, { errorMessage: "Failed to delete product." });
    });
}

/** ------------------- EVENTS BINDEN ------------------- **/

function bindProductEvents() {
  // Neues Produkt hinzufügen
  $("#addProductBtn").click(function () {
    openProductModal();
  });

  // Existierendes Produkt bearbeiten
  $(document).on("click", ".edit-product", function (e) {
    openProductModal($(e.currentTarget).data("id"));
  });

  // Produkt löschen
  $(document).on("click", ".delete-product", function (e) {
    deleteProduct($(e.currentTarget).data("id"));
  });

  // Produkt speichern
  $("#saveProductBtn").click(saveProduct);
}
