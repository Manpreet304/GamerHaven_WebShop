<?php
require_once("../logic/order_logic.php");

class OrderController {
    private OrderLogic $logic;

    public function __construct() {
        $this->logic = new OrderLogic();
    }

    public function placeOrder(int $userId, int $paymentId, ?string $voucher): array {
        global $conn;
        $success = $this->logic->createOrder($userId, $paymentId, $voucher, $conn);
        return [
            "status" => $success ? 200 : 500,
            "body" => ["success" => $success]
        ];
    }
