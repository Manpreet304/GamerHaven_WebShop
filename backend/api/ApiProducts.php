<?php
// api/product.php

// Antwort-Header setzen: JSON als Rückgabeformat
header("Content-Type: application/json");

// Session starten, falls noch nicht aktiv
if (session_status() === PHP_SESSION_NONE) session_start();

require_once("../db/dbaccess.php");           
require_once("../logic/ProductLogic.php");    
require_once("../models/response.php");

// Produktlogik-Instanz direkt erstellen
$logic = new ProductLogic($conn);

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

        // Methode direkt aus der Logik aufrufen und Antwort senden
        sendApiResponse(...$logic->getFilteredProducts($filters));
        break;

    default:
        sendApiResponse(405, null, "Method not allowed");
}
