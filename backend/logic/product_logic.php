<?php

class ProductLogic {
    public function getAllProducts($conn): array {
        $products = [];
        $stmt = $conn->prepare("SELECT id, name, price, stock, brand, category, sub_category, attributes, image_url, rating FROM products ORDER BY created_at DESC");
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
}

