<?php
require_once("../logic/OrderLogic.php");

class OrderController {
    private OrderLogic $logic;

    public function __construct(mysqli $conn) {
        $this->logic = new OrderLogic($conn);
    }

    public function placeOrder(int $userId, int $paymentId, ?string $voucher): array {
        return $this->logic->createOrder($userId, $paymentId, $voucher);
    }

    public function getOrders(int $userId): array {
        return $this->logic->getOrdersByUser($userId);
    }

    public function getOrderDetails(int $orderId, int $userId): array {
        return $this->logic->getOrderWithItems($orderId, $userId);
    }
}
