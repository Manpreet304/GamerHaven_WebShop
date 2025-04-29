// /customer/products_filters.js
function initProductFilters() {
    $("#applyFilters").click(function () {
      loadProducts(collectFilters());
    });
  
    $("#resetFilters").click(function () {
      resetAllFilters();
      loadProducts();
    });
  
    $(document).on("change", "#filter-category input, #filter-brand input, #filter-rating, #filter-stock, #priceMin, #priceMax", function () {
      loadProducts(collectFilters());
    });
  
    $(document).on("input", "#liveSearchInput", debounce(function () {
      const term = $("#liveSearchInput").val().trim();
      const filters = collectFilters();
      if (term) filters.search = term;
      loadProducts(filters);
    }, 300));
  }
  
  // Filter sammeln
  function collectFilters() {
    return {
      category: $("input[name='category']:checked").val() || "",
      brand: $("#filter-brand input:checked").map((_, el) => el.value).get().join(","),
      rating: $("#filter-rating").val(),
      stock: $("#filter-stock").val(),
      priceMin: $("#priceMin").val(),
      priceMax: $("#priceMax").val()
    };
  }
  
  // Filter zurücksetzen
  function resetAllFilters() {
    $("#filter-category input, #filter-brand input").prop("checked", false);
    $("#filter-rating, #filter-stock, #priceMin, #priceMax").val("");
  }
  
  // Debounce Helper
  function debounce(func, delay) {
    let timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(func, delay);
    };
  }
  
  // Filter-Bereiche neu aufbauen
function renderFilters(products, filters = {}) {
    const selectedCategory = filters.category || "";
    const categories = [...new Set(products.map(p => p.category))].sort();
  
    const catHtml = [
      `<div class="form-check">
        <input class="form-check-input" type="radio" name="category" value="" ${!selectedCategory ? "checked" : ""}>
        <label class="form-check-label">All Products</label>
      </div>`,
      ...categories.map(c => `
        <div class="form-check">
          <input class="form-check-input" type="radio" name="category" value="${c}" ${selectedCategory === c ? "checked" : ""}>
          <label class="form-check-label">${c}</label>
        </div>
      `)
    ];
    $("#filter-category").html(catHtml.join(""));
  
    const filtered = selectedCategory ? products.filter(p => p.category === selectedCategory) : products;
    const brands = [...new Set(filtered.map(p => p.brand))].sort();
    const selectedBrands = (filters.brand || "").split(",");
  
    const brandHtml = brands.map(b => `
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="${b}" ${selectedBrands.includes(b) ? "checked" : ""}>
        <label class="form-check-label">${b}</label>
      </div>
    `);
    $("#filter-brand").html(brandHtml.join(""));
  }
  