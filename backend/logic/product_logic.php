<?php

class ProductLogic {
    public function getAllProducts($conn): array {
        $products = [];
        $stmt = $conn->prepare("SELECT id, name, description, price, stock, brand, category, sub_category, attributes, image_url, rating FROM products ORDER BY created_at DESC");
        $stmt->execute();
        $result = $stmt->get_result();

        while ($row = $result->fetch_assoc()) {
            $decoded = json_decode($row["image_url"], true);
            if (is_array($decoded)) {
                $row["images"] = array_map(fn($img) => "/GamerHaven_WebShop/" . ltrim($img, "/"), $decoded);
            } else {
                $imageList = array_map('trim', explode(",", $row["image_url"]));
                $row["images"] = array_map(fn($img) => "/GamerHaven_WebShop/" . ltrim($img, "/"), $imageList);
            }

            unset($row["image_url"]);
            $products[] = $row;
        }

        return $products;
    }

    public function getFilteredProducts($conn, array $filters): array {
        $sql = "SELECT id, name, description, price, stock, brand, category, sub_category, attributes, image_url, rating FROM products WHERE 1=1";
        $params = [];
        $types = "";

        if (isset($filters["category"]) && $filters["category"] !== "") {
            $sql .= " AND category = ?";
            $params[] = $filters["category"];
            $types .= "s";
        }

        if (!empty($filters["brand"])) {
            $brandList = explode(",", $filters["brand"]);
            $placeholders = implode(",", array_fill(0, count($brandList), "?"));
            $sql .= " AND brand IN ($placeholders)";
            $params = array_merge($params, $brandList);
            $types .= str_repeat("s", count($brandList));
        }

        if (!empty($filters["priceMin"])) {
            $sql .= " AND price >= ?";
            $params[] = floatval($filters["priceMin"]);
            $types .= "d";
        }

        if (!empty($filters["priceMax"])) {
            $sql .= " AND price <= ?";
            $params[] = floatval($filters["priceMax"]);
            $types .= "d";
        }

        if (!empty($filters["rating"])) {
            $sql .= " AND rating >= ?";
            $params[] = floatval($filters["rating"]);
            $types .= "d";
        }

        if ($filters["stock"] !== null && $filters["stock"] !== "") {
            if ($filters["stock"] == "1") {
                $sql .= " AND stock > 0";
            } elseif ($filters["stock"] == "0") {
                $sql .= " AND stock = 0";
            }
        }

        $sql .= " ORDER BY created_at DESC";
        $stmt = $conn->prepare($sql);

        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }

        $stmt->execute();
        $result = $stmt->get_result();
        $products = [];

        while ($row = $result->fetch_assoc()) {
            $decoded = json_decode($row["image_url"], true);
            if (is_array($decoded)) {
                $row["images"] = array_map(fn($img) => "/GamerHaven_WebShop/" . ltrim($img, "/"), $decoded);
            } else {
                $imageList = array_map('trim', explode(",", $row["image_url"]));
                $row["images"] = array_map(fn($img) => "/GamerHaven_WebShop/" . ltrim($img, "/"), $imageList);
            }

            unset($row["image_url"]);
            $products[] = $row;
        }

        return $products;
    }
}
