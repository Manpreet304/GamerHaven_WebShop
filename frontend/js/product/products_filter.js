// products.filters.js
(function (window, $) {
  const ProductsFilters = {
    collectFilters() {
      return {
        category: $("input[name='category']:checked").val() || "",
        brand: $("#filter-brand input:checked").map((_, el) => el.value).get().join(","),
        rating: $("#filter-rating").val() || "",
        stock: $("#filter-stock").val() || "",
        priceMin: $("#priceMin").val() || "",
        priceMax: $("#priceMax").val() || ""
      };
    },

    resetAllFilters() {
      $("#filter-category input[type='radio']").prop("checked", false);
      $("#filter-brand input[type='checkbox']").prop("checked", false);
      $("#priceMin, #priceMax, #filter-rating, #filter-stock").val("");
    },

    renderFilters(products, filters = {}) {
      const selectedCategory = filters.category || "";
      const selectedBrands = (filters.brand || "").split(",");

      const unique = (arr) => [...new Set(arr.filter(Boolean))];

      const categories = unique(products.map(p => p.category)).sort();
      const brands = unique(
        (selectedCategory
          ? products.filter(p => p.category === selectedCategory)
          : products
        ).map(p => p.brand)
      ).sort();

      // Kategorie-Filter rendern
      const categoryHTML = [
        `<div class="form-check">
          <input class="form-check-input" type="radio" name="category" value="" ${!selectedCategory ? "checked" : ""}>
          <label class="form-check-label">All Products</label>
        </div>`,
        ...categories.map(cat => `
          <div class="form-check">
            <input class="form-check-input" type="radio" name="category" value="${escapeHTML(cat)}" ${cat === selectedCategory ? "checked" : ""}>
            <label class="form-check-label">${escapeHTML(cat)}</label>
          </div>
        `)
      ];
      $("#filter-category").html(categoryHTML.join(""));

      // Marken-Filter rendern
      const brandHTML = brands.map(brand => `
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="${escapeHTML(brand)}" ${selectedBrands.includes(brand) ? "checked" : ""}>
          <label class="form-check-label">${escapeHTML(brand)}</label>
        </div>
      `);
      $("#filter-brand").html(brandHTML.join(""));
    }
  };

  // Optional: einfacher Escape-Helper für HTML-Ausgabe
  function escapeHTML(str) {
    return str.replace(/[&<>"']/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[tag]));
  }

  window.ProductsFilters = ProductsFilters;
})(window, jQuery);
