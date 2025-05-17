<?php
class OrderLogic {
  private mysqli $conn;

  public function __construct(mysqli $conn) {
    $this->conn = $conn;
  }

  // Bestellung erstellen (inkl. Warenkorb, Zahlung, Gutschein, Lagerstand)
  public function createOrder(int $userId, int $paymentId, ?string $voucherCode): array {
    $this->conn->begin_transaction();

    try {
      // Warenkorb und Produktinfos laden
      $stmt = $this->conn->prepare("SELECT c.product_id, c.quantity, p.name, p.price, p.stock
                                     FROM cart c
                                     JOIN products p ON c.product_id = p.id
                                     WHERE c.user_id = ?");
      $stmt->bind_param("i", $userId);
      $stmt->execute();
      $result = $stmt->get_result();

      $items = [];
      $originalSubtotal = 0.0;
      while ($row = $result->fetch_assoc()) {
        if ($row["stock"] < $row["quantity"]) {
          throw new Exception("Product '{$row['name']}' is out of stock or insufficient quantity.");
        }
        $items[] = $row;
        $originalSubtotal += $row["price"] * $row["quantity"];
      }

      if (empty($items)) throw new Exception("Cart is empty.");

      // Gutschein prüfen
      $voucherId = null;
      $discount = 0.0;
      $subtotal = $originalSubtotal;

      if (!empty($voucherCode)) {
        $vstmt = $this->conn->prepare("SELECT id, remaining_value
                                       FROM vouchers
                                       WHERE code = ? AND is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())");
        $vstmt->bind_param("s", $voucherCode);
        $vstmt->execute();
        $voucher = $vstmt->get_result()->fetch_assoc();

        if (!$voucher) throw new Exception("Invalid voucher code.");

        $voucherId = (int)$voucher["id"];
        $discount = min($voucher["remaining_value"], $subtotal);
        $remaining = $voucher["remaining_value"] - $discount;
        $active = $remaining > 0 ? 1 : 0;
      }

      $shipping = $subtotal >= 300.0 ? 0.0 : 9.90;
      $total = $subtotal - $discount + $shipping;

      // Bestellung eintragen
      $istmt = $this->conn->prepare("INSERT INTO orders (user_id, payment_id, voucher_id, subtotal, discount, shipping_amount, total_amount, created_at)
                                     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())");
      $istmt->bind_param("iiidddd", $userId, $paymentId, $voucherId, $subtotal, $discount, $shipping, $total);
      $istmt->execute();
      $orderId = $istmt->insert_id;

      // Bestellpositionen & Lager aktualisieren
      $pstmt = $this->conn->prepare("INSERT INTO order_items (order_id, product_id, name_snapshot, price_snapshot, quantity, total_price)
                                     VALUES (?, ?, ?, ?, ?, ?)");
      $ustmt = $this->conn->prepare("UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?");

      foreach ($items as $it) {
        $price = $it["price"];
        $qty = $it["quantity"];
        $totalPrice = $price * $qty;

        $pstmt->bind_param("iisdid", $orderId, $it["product_id"], $it["name"], $price, $qty, $totalPrice);
        $pstmt->execute();

        $ustmt->bind_param("iii", $qty, $it["product_id"], $qty);
        $ustmt->execute();
      }

      // Gutschein aktualisieren, falls verwendet
      if ($voucherId !== null) {
        $ustmt2 = $this->conn->prepare("UPDATE vouchers SET remaining_value = ?, is_active = ? WHERE id = ?");
        $ustmt2->bind_param("dii", $remaining, $active, $voucherId);
        $ustmt2->execute();
      }

      // Warenkorb leeren
      $dstmt = $this->conn->prepare("DELETE FROM cart WHERE user_id = ?");
      $dstmt->bind_param("i", $userId);
      $dstmt->execute();

      $this->conn->commit();
      return [200, ["success" => true, "orderId" => $orderId], "Order placed"];

    } catch (Exception $e) {
      $this->conn->rollback();
      return [500, ["success" => false], "Order creation failed: " . $e->getMessage()];
    }
  }

  // Bestellübersicht für Nutzer
  public function getOrdersByUser(int $userId): array {
    $stmt = $this->conn->prepare("SELECT id, created_at, subtotal, discount, shipping_amount, total_amount
                                  FROM orders
                                  WHERE user_id = ?
                                  ORDER BY created_at DESC");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $orders = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    return [200, $orders, "Orders retrieved"];
  }

  // Einzelne Bestellung + Items abrufen (inkl. Zugriffsschutz)
  public function getOrderWithItems(int $orderId, int $userId): array {
    $stmt = $this->conn->prepare("SELECT id, created_at, subtotal, discount, shipping_amount, total_amount
                                  FROM orders
                                  WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $orderId, $userId);
    $stmt->execute();
    $order = $stmt->get_result()->fetch_assoc();

    if (!$order) return [404, null, "Order not found"];

    $itemsStmt = $this->conn->prepare("SELECT product_id, name_snapshot, price_snapshot, quantity, total_price
                                       FROM order_items
                                       WHERE order_id = ?");
    $itemsStmt->bind_param("i", $orderId);
    $itemsStmt->execute();
    $items = $itemsStmt->get_result()->fetch_all(MYSQLI_ASSOC);

    return [200, ["order" => $order, "items" => $items], "Order details loaded"];
  }
}
