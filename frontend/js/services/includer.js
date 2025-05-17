// === Navbar laden ===
$.get("../../inclusions/navbar.html")
  .done(html => {
    // HTML einfügen
    $("#navbar-placeholder").html(html);

    // Navbar-Script dynamisch einbinden
    const script = document.createElement("script");
    script.src = "../../frontend/js/services/navbar.js";
    script.onload = () => console.log("Navbar script loaded");
    script.onerror = () => console.error("Navbar script failed to load");
    document.body.appendChild(script);
  })
  .fail((xhr, status, err) => {
    console.error("Error loading Navbar:", status, err);
  });