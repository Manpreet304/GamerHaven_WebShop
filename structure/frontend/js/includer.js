Promise.all([
    fetch("../../inclusions/navbar.html").then(response => response.text()),
    fetch("../../inclusions/footer.html").then(response => response.text())
])
.then(([navbarData, footerData]) => {
    document.getElementById("navbar-placeholder").innerHTML = navbarData;
    document.getElementById("footer-placeholder").innerHTML = footerData;
})
.catch(error => console.error("Error loading the content:", error));
