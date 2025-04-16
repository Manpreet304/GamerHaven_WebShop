<?php
require_once("../logic/order_logic.php");

class OrderController {
    private OrderLogic $logic;

    public function __construct() {
        $this->logic = new OrderLogic();
    }

    public function placeOrder(int $userId, int $paymentId, ?string $voucher): array {
        global $conn;

        try {
            $success = $this->logic->createOrder($userId, $paymentId, $voucher, $conn);
            return [
                "status" => 200,
                "body" => ["success" => true]
            ];
        } catch (Exception $e) {
            return [
                "status" => 500,
                "body" => [
                    "success" => false,
                    "error" => $e->getMessage()
                ]
            ];
        }
    }
}
