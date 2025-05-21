<?php
class ProductLogic {
  private mysqli $conn;

  public function __construct(mysqli $conn) {
    $this->conn = $conn;
  }

  // Sucht Produkte basierend auf verschiedenen Filtern: Kategorie, Marke, Preis, Bewertung, Lagerbestand und Suchbegriff
  public function getFilteredProducts(array $filters): array {
    $sql    = "SELECT * FROM products WHERE 1=1"; // Grundstruktur mit optionalen Bedingungen
    $params = [];
    $types  = "";

    // Filter: Kategorie
    if (!empty($filters["category"])) {
      $sql     .= " AND category = ?";
      $params[] = $filters["category"];
      $types   .= "s";
    }

    // Filter: Marke (Mehrfachauswahl per Komma getrennt)
    if (!empty($filters["brand"])) {
      $brands = explode(",", $filters["brand"]);
      $sql   .= " AND brand IN (" . implode(",", array_fill(0, count($brands), "?")) . ")";
      $params = array_merge($params, $brands);
      $types .= str_repeat("s", count($brands));
    }

    // Filter: Mindestpreis
    if (!empty($filters["priceMin"])) {
      $sql     .= " AND price >= ?";
      $params[] = (float)$filters["priceMin"];
      $types   .= "d";
    }

    // Filter: Höchstpreis
    if (!empty($filters["priceMax"])) {
      $sql     .= " AND price <= ?";
      $params[] = (float)$filters["priceMax"];
      $types   .= "d";
    }

    // Filter: Mindestbewertung
    if (!empty($filters["rating"])) {
      $sql     .= " AND rating >= ?";
      $params[] = (float)$filters["rating"];
      $types   .= "d";
    }

    // Filter: Lagerbestand (1 = verfügbar, 0 = nicht verfügbar)
    if (isset($filters["stock"]) && $filters["stock"] !== "") {
      $sql .= $filters["stock"] === "1" ? " AND stock > 0" : " AND stock = 0";
    }

    // Volltextsuche: durchsucht Name, Marke und Kategorie
    if (!empty($filters["search"])) {
      $sql     .= " AND (name LIKE ? OR brand LIKE ? OR category LIKE ?)";
      $search   = "%" . $filters["search"] . "%";
      $params   = array_merge($params, [$search, $search, $search]);
      $types   .= "sss";
    }

    // Ergebnisse nach Erstellungsdatum sortieren
    $sql .= " ORDER BY created_at DESC";

    // Query vorbereiten und Parameter binden
    $stmt = $this->conn->prepare($sql);
    if (!empty($params)) {
      $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $products = [];
    while ($row = $result->fetch_assoc()) {
      // Bildpfade aus image_url extrahieren
      $row["images"] = $this->extractImages($row["image_url"]);
      unset($row["image_url"]);
      $products[] = $row;
    }

    return [200, $products, "Filtered products loaded"];
  }

  // Wandelt das image_url-Feld in ein Array um (JSON oder CSV) und ergänzt Pfad
  private function extractImages(string $imageField): array {
    $images = json_decode($imageField, true);
    if (!is_array($images)) {
      $images = explode(',', $imageField);
    }
    return array_map(
      fn(string $img) => '../../' . ltrim($img, '/'),
      $images
    );
  }
}
