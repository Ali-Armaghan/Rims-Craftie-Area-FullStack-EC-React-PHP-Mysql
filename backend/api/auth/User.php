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
    public $resale_discount_percent = 0;
    public $resale_commission_percent = 5;
    public $resale_code_active = 1;
    public $referred_by_id;
    public $referred_by_code;

    public function __construct($db) {
        $this->conn = $db;
        $this->ensureResaleSettingsColumns();
    }

    private function ensureResaleSettingsColumns() {
        static $done = false;
        if ($done) {
            return;
        }

        $columns = [
            "resale_discount_percent" => "ALTER TABLE " . $this->table_name . " ADD COLUMN resale_discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00 AFTER resale_code",
            "resale_commission_percent" => "ALTER TABLE " . $this->table_name . " ADD COLUMN resale_commission_percent DECIMAL(5,2) NOT NULL DEFAULT 5.00 AFTER resale_discount_percent",
            "resale_code_active" => "ALTER TABLE " . $this->table_name . " ADD COLUMN resale_code_active TINYINT(1) NOT NULL DEFAULT 1 AFTER resale_commission_percent",
        ];

        foreach ($columns as $column => $sql) {
            try {
                $this->conn->query("SELECT $column FROM " . $this->table_name . " LIMIT 1");
            } catch (Exception $e) {
                try {
                    $this->conn->exec($sql);
                } catch (Exception $ignored) {
                }
            }
        }

        $done = true;
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

    private function generateUniqueResaleCode() {
        do {
            $code = $this->generateResaleCode();
            $stmt = $this->conn->prepare("SELECT id FROM " . $this->table_name . " WHERE resale_code = ? LIMIT 1");
            $stmt->execute([$code]);
        } while ($stmt->fetch(PDO::FETCH_ASSOC));

        return $code;
    }

    private function sanitizeResaleCode($value) {
        $code = strtoupper(trim((string) $value));
        $code = preg_replace('/[^A-Z0-9-]/', '', $code);
        return $code;
    }

    private function clampPercent($value, $default) {
        if ($value === null || $value === '') {
            return (float) $default;
        }

        $number = (float) $value;
        if ($number < 0) {
            return 0.0;
        }
        if ($number > 100) {
            return 100.0;
        }
        return round($number, 2);
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

        if (!empty($this->resale_code)) {
            $this->resale_code = $this->sanitizeResaleCode($this->resale_code);
            if ($this->resale_code === '') {
                return false;
            }

            $codeCheck = $this->conn->prepare("SELECT id FROM " . $this->table_name . " WHERE resale_code = ? LIMIT 1");
            $codeCheck->execute([$this->resale_code]);
            if ($codeCheck->fetch(PDO::FETCH_ASSOC)) {
                return false;
            }
        } else {
            $this->resale_code = $this->generateUniqueResaleCode();
        }

        $this->resale_discount_percent = $this->clampPercent($this->resale_discount_percent ?? 0, 0);
        $this->resale_commission_percent = $this->clampPercent($this->resale_commission_percent ?? 5, 5);
        $this->resale_code_active = !empty($this->resale_code_active) ? 1 : 0;

        $query = "INSERT INTO " . $this->table_name . " 
                  SET name=:name, email=:email, password=:password, phone=:phone, 
                      resale_code=:resale_code, resale_discount_percent=:resale_discount_percent,
                      resale_commission_percent=:resale_commission_percent, resale_code_active=:resale_code_active,
                      referred_by_id=:referred_by_id";

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
        $stmt->bindParam(":resale_discount_percent", $this->resale_discount_percent);
        $stmt->bindParam(":resale_commission_percent", $this->resale_commission_percent);
        $stmt->bindParam(":resale_code_active", $this->resale_code_active);
        $stmt->bindParam(":referred_by_id", $this->referred_by_id);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function login($password) {
        $query = "SELECT id, name, email, password, resale_code, resale_balance,
                         resale_discount_percent, resale_commission_percent, resale_code_active
                  FROM " . $this->table_name . " 
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
