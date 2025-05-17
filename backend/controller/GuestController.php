<?php
// controller/UserController.php

require_once("../logic/RegisterLogic.php");
require_once("../logic/LoginLogic.php");
require_once("../logic/LogoutLogic.php");
require_once("../logic/GuestInfoLogic.php");
require_once("../models/UserModel.php");

class GuestController {
    private mysqli $conn;
    private RegisterLogic $registerLogic;
    private LoginLogic $loginLogic;
    private LogoutLogic $logoutLogic;
    private GuestInfoLogic $guestInfoLogic;

    public function __construct(mysqli $conn) {
        $this->conn = $conn;
        $this->registerLogic = new RegisterLogic();
        $this->loginLogic = new LoginLogic();
        $this->logoutLogic = new LogoutLogic();
        $this->guestInfoLogic = new GuestInfoLogic();
    }

    public function register(array $data): array {
    $user = new User($data);
    return $this->registerLogic->register($user, $data["password2"] ?? '', $this->conn);
}


    public function login(array $data, bool $remember): array {
    return $this->loginLogic->login($data, $remember, $this->conn);
}


    public function logout(): array {
        return $this->logoutLogic->logout($this->conn);
    }

    public function getGuestInfo(): array {
        return $this->guestInfoLogic->getUserStatus($this->conn);
    }
}

