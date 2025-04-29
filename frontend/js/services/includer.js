// === Navbar laden ===

// Holt die Navbar-HTML und fügt sie in das Element mit ID "navbar-placeholder" ein
fetch("../../inclusions/navbar.html")
  .then(function(response) {
    return response.text(); // Antwort als Text lesen
  })
  .then(function(html) {
    // Setzt die geladene HTML in das Platzhalter-DIV ein
    document.getElementById("navbar-placeholder").innerHTML = html;

    // Nachdem die Navbar eingefügt wurde, laden wir das Navbar-Skript
    const script = document.createElement("script");
    script.src = "../../frontend/js/services/navbar.js"; // Pfad zum Script
    document.body.appendChild(script); // Script wird ins Body eingefügt und geladen
  })
  .catch(function(error) {
    console.error("Error loading Navbar:", error);
  });
