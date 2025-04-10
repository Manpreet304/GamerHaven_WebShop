<?php
class User {
    public $salutation;
    public $first_name;
    public $last_name;
    public $address;
    public $zip;
    public $city;
    public $email;
    public $username;
    public $password;
    public $payment_method;
    public $payment_info;
    public $country;

    public function __construct(array $data) {
        foreach ($data as $key => $value) {
            if (property_exists($this, $key)) {
                $this->$key = trim($value);
            }
        }
    }
}
