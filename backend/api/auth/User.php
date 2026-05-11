<?php
// api/auth/User.php

class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $name;
    public $email;
    public $password;
    public $phone;
    public $resale_code;
    public $referred_by_id;
    public $referred_by_code;

    public function __construct($db) {
        $this->conn = $db;
    }

    private function generateResaleCode($length = 8) {
        $characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = 'RS-';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }
        return $randomString;
    }

    public function register() {
        // Check if email exists
        $query = "SELECT id FROM " . $this->table_name . " WHERE email = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->email]);
        if ($stmt->rowCount() > 0) return false;

        // Handle referral
        if ($this->referred_by_code) {
            $refQuery = "SELECT id FROM " . $this->table_name . " WHERE resale_code = ? LIMIT 0,1";
            $refStmt = $this->conn->prepare($refQuery);
            $refStmt->execute([$this->referred_by_code]);
            if ($refStmt->rowCount() > 0) {
                $refRow = $refStmt->fetch(PDO::FETCH_ASSOC);
                $this->referred_by_id = $refRow['id'];
            }
        }

        $this->resale_code = $this->generateResaleCode();

        $query = "INSERT INTO " . $this->table_name . " 
                  SET name=:name, email=:email, password=:password, phone=:phone, 
                      resale_code=:resale_code, referred_by_id=:referred_by_id";

        $stmt = $this->conn->prepare($query);

        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->password = password_hash($this->password, PASSWORD_BCRYPT);
        $this->phone = htmlspecialchars(strip_tags($this->phone));

        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password", $this->password);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":resale_code", $this->resale_code);
        $stmt->bindParam(":referred_by_id", $this->referred_by_id);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function login($password) {
        $query = "SELECT id, name, email, password, resale_code, resale_balance FROM " . $this->table_name . " 
                  WHERE email = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->email]);

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (password_verify($password, $row['password'])) {
                unset($row['password']);
                return $row;
            }
        }
        return false;
    }
}
?>
