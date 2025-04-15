// === Navbar laden ===
fetch("../../inclusions/navbar.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("navbar-placeholder").innerHTML = data;

        // Sobald Navbar geladen ist → lade dynamische Login-/Menülogik
        const script = document.createElement("script");
        script.src = "../../frontend/js/navbar.js"; 
        document.body.appendChild(script);
    })
    .catch(error => console.error("Fehler beim Laden der Navbar:", error));