<?php
// api/product.php

// Antwort-Header setzen: JSON als Rückgabeformat
header("Content-Type: application/json");

// Session starten, falls noch nicht aktiv
if (session_status() === PHP_SESSION_NONE) session_start();

// Benötigte Abhängigkeiten einbinden
require_once("../db/dbaccess.php");             // DB-Verbindung
require_once("../controller/ProductController.php"); // Controller-Logik
require_once("../models/response.php");         // sendApiResponse() für einheitliche Antwortstruktur

// Controller-Instanz erstellen
$productController = new ProductController($conn);

// HTTP-Methode auswerten
switch ($_SERVER["REQUEST_METHOD"]) {
    case "GET":
        // Filter aus Query-String übernehmen (optional, default: null)
        $filters = [
            "category"  => $_GET["category"] ?? null,
            "brand"     => $_GET["brand"] ?? null,
            "priceMin"  => $_GET["priceMin"] ?? null,
            "priceMax"  => $_GET["priceMax"] ?? null,
            "rating"    => $_GET["rating"] ?? null,
            "stock"     => $_GET["stock"] ?? null,
            "search"    => $_GET["search"] ?? null
        ];

        // Controller-Methode aufrufen und API-Antwort zurücksenden
        sendApiResponse(...$productController->getAllFiltered($filters));
        break;

    default:
        // Alle anderen Methoden (POST, PUT, DELETE, ...) sind nicht erlaubt
        sendApiResponse(405, null, "Method not allowed");
}
