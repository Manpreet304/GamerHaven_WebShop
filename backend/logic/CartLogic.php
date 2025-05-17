<?php
class CartLogic {

  // Anzahl aller Produkte im Warenkorb eines Nutzers
  public function count(int $userId, mysqli $conn): array {
    $stmt = $conn->prepare("SELECT SUM(quantity) AS total FROM cart WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    return [200, ["count" => (int)($row["total"] ?? 0)], "Cart count loaded"];
  }

  // Zusammenfassung des Warenkorbs
  public function summary(int $userId, mysqli $conn): array {
    $stmt = $conn->prepare("SELECT c.id, p.name, p.price, c.quantity
                            FROM cart c
                            JOIN products p ON c.product_id = p.id
                            WHERE c.user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $res = $stmt->get_result();

    $items    = [];
    $subtotal = 0;
    while ($r = $res->fetch_assoc()) {
      $r["price"]    = (float)$r["price"];
      $r["quantity"] = (int)$r["quantity"];
      $items[]       = $r;
      $subtotal     += $r["price"] * $r["quantity"];
    }

    $shipping = $subtotal >= 300 ? 0 : 9.90;
    $total    = $subtotal + $shipping;

    return [200, [
      "items"    => $items,
      "subtotal" => round($subtotal, 2),
      "shipping" => round($shipping, 2),
      "total"    => round($total, 2)
    ], "Cart loaded"];
  }

  // Produkt in den Warenkorb hinzufügen
  public function add(int $userId, int $productId, int $quantity, mysqli $conn): array {
    $stmt = $conn->prepare("SELECT stock FROM products WHERE id = ?");
    if (!$stmt) return [500, null, "Internal error"];
    $stmt->bind_param("i", $productId);
    $stmt->execute();
    $product = $stmt->get_result()->fetch_assoc();

    if (!$product) return [404, null, "Product not found"];
    if ($product['stock'] <= 0) return [400, null, "Product is out of stock"];
    if ($product['stock'] < $quantity) return [400, null, "Not enough stock available"];

    // Falls bereits im Warenkorb: Menge erhöhen
    $check = $conn->prepare("SELECT id FROM cart WHERE user_id = ? AND product_id = ?");
    $check->bind_param("ii", $userId, $productId);
    $check->execute();
    $item = $check->get_result()->fetch_assoc();

    if ($item) {
      $stmt = $conn->prepare("UPDATE cart SET quantity = quantity + ? WHERE id = ?");
      $stmt->bind_param("ii", $quantity, $item["id"]);
    } else {
      $stmt = $conn->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)");
      $stmt->bind_param("iii", $userId, $productId, $quantity);
    }

    if (!$stmt->execute()) {
      return [500, null, "Could not add to cart"];
    }

    return [200, ["added" => true], "Product added to cart"];
  }

  // Menge im Warenkorb anpassen
  public function update(int $cartId, int $quantity, mysqli $conn): array {
    $stmt = $conn->prepare("UPDATE cart SET quantity = ? WHERE id = ?");
    $stmt->bind_param("ii", $quantity, $cartId);
    $ok = $stmt->execute();

    return $ok
      ? [200, ["updated" => true], "Quantity updated"]
      : [500, ["updated" => false], "Failed to update quantity"];
  }

  // Artikel aus Warenkorb entfernen
  public function remove(int $cartId, mysqli $conn): array {
    $stmt = $conn->prepare("DELETE FROM cart WHERE id = ?");
    $stmt->bind_param("i", $cartId);
    $ok = $stmt->execute();

    return $ok
      ? [200, ["deleted" => true], "Item removed"]
      : [500, ["deleted" => false], "Failed to remove item"];
  }
}
