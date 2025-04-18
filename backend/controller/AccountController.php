<?php
declare(strict_types=1);
require_once __DIR__ . '/../logic/AccountLogic.php';

class AccountController {
    private AccountLogic $logic;

    public function __construct() {
        $this->logic = new AccountLogic();
    }

    public function updateAccount(int $userId, array $data, $conn): array {
        if (empty($data['password']) ||
            ! $this->logic->verifyPassword($userId, $data['password'], $conn)
        ) {
            return [
                "status" => 401,
                "body"   => ["success" => false, "error" => "Current password is incorrect."]
            ];
        }

        $fields = [
            "firstname" => $data['first_name'],
            "lastname"  => $data['last_name'],
            "email"     => $data['email'],
            "address"   => $data['address'],
            "zip_code"  => $data['zip_code'],
            "city"      => $data['city'],
            "country"   => $data['country']
        ];

        $success = $this->logic->updateUser($userId, $fields, $conn);
        return [
            "status" => $success ? 200 : 500,
            "body"   => ["success" => $success]
        ];
    }

    public function changePassword(int $userId, array $data, $conn): array {
        $result = $this->logic->changePassword($userId, $data, $conn);
        if ($result === true) {
            return ["status" => 200, "body" => ["success" => true]];
        }
        return ["status" => 400, "body" => ["success" => false, "error" => $result]];
    }

    public function getOrders(int $userId, $conn): array {
        $orders = $this->logic->getUserOrders($userId, $conn);
        return ["status" => 200, "body" => $orders];
    }

    public function getOrderDetails(int $orderId, $conn): array {
        $items = $this->logic->getOrderDetails($orderId, $conn);
        return ["status" => 200, "body" => $items];
    }

    /**
     * API‑Methode: neue Zahlungsmethode anlegen
     */
    public function addPayment(int $userId, array $data, $conn): array {
        $success = $this->logic->addPaymentMethod($userId, $data, $conn);
        return [
            "status" => $success ? 200 : 500,
            "body"   => ["success" => $success]
        ];
    }
}
