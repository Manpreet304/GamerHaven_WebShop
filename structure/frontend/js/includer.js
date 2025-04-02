    // Navbar laden
    fetch("../../inclusions/navbar.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("navbar-placeholder").innerHTML = data;
        })
        .catch(error => console.error("Fehler beim Laden der Navbar:", error));

    // Footer laden
    fetch("../../inclusions/footer.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer-placeholder").innerHTML = data;
        })
        .catch(error => console.error("Fehler beim Laden des Footers:", error));