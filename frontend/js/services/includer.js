// === Navbar laden via jQuery AJAX ===
$.ajax({
    url: "../../inclusions/navbar.html",
    method: "GET",
    dataType: "html",
    xhrFields: {
      withCredentials: true 
    }
  })
    .done(html => {
      $("#navbar-placeholder").html(html);
  
      // Navbar-Logik nachladen
      const script = document.createElement("script");
      script.src = "../../frontend/js/services/navbar.js";
      document.body.appendChild(script);
    })
    .fail((xhr, status, err) => {
      console.error("Error loading Navbar:", status, err);
    });
  