<?php
require_once __DIR__ . '/../logic/account_logic.php';

class AccountController {
    private AccountLogic $logic;

    public function __construct() {
        $this->logic = new AccountLogic();
    }

    public function updateAccount(int $userId, array $data, $conn): array {
        // 1) confirm current password
        if (empty($data['password'])
            || ! $this->logic->verifyPassword($userId, $data['password'], $conn)
        ) {
            return [
                "status" => 401,
                "body"   => ["success" => false, "error" => "Current password is incorrect."]
            ];
        }

        // 2) remap fields
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

    public function addPaymentMethod(int $userId, array $data, $conn): array {
        $success = $this->logic->addPaymentMethod($userId, $data, $conn);
        return ["status" => $success ? 200 : 500, "body" => ["success" => $success]];
    }

    public function removePaymentMethod(int $paymentId, $conn): array {
        $success = $this->logic->removePaymentMethod($paymentId, $conn);
        return ["status" => $success ? 200 : 500, "body" => ["success" => $success]];
    }

    public function getOrders(int $userId, $conn): array {
        $orders = $this->logic->getUserOrders($userId, $conn);
        return ["status" => 200, "body" => $orders];
    }

    public function getOrderDetails(int $orderId, $conn): array {
        $items = $this->logic->getOrderDetails($orderId, $conn);
        return ["status" => 200, "body" => $items];
    }
}
