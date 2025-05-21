// Lädt die Navbar von einer externen HTML-Datei
$.get("../../inclusions/navbar.html")
  .done(html => {
    // Fügt das geladene HTML in die Seite ein
    $("#navbar-placeholder").html(html);

    // Lädt ein begleitendes JavaScript dynamisch nach
    const script = document.createElement("script");
    script.src = "../../frontend/js/services/navbar.js";
    script.onload = () => console.log("Navbar script loaded");
    script.onerror = () => console.error("Navbar script failed to load");
    document.body.appendChild(script);
  })
  .fail((xhr, status, err) => {
    // Fehlerbehandlung beim Laden der Navbar
    console.error("Error loading Navbar:", status, err);
  });
