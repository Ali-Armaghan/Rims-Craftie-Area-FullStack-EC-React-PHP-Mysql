<?php
// api/admin/Admin.php

class Admin {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getDashboardStats() {
        $stats = [];
        
        // Total Sales
        $q1 = "SELECT SUM(total) as total_sales FROM orders WHERE status != 'cancelled'";
        $stats['total_sales'] = $this->conn->query($q1)->fetchColumn() ?: 0;

        // Total Orders
        $q2 = "SELECT COUNT(*) as total_orders FROM orders";
        $stats['total_orders'] = $this->conn->query($q2)->fetchColumn() ?: 0;

        // Total Users
        $q3 = "SELECT COUNT(*) as total_users FROM users";
        $stats['total_users'] = $this->conn->query($q3)->fetchColumn() ?: 0;

        // Live Visitors (last 2 minutes)
        $q4 = "SELECT COUNT(*) FROM live_traffic WHERE last_ping_at > DATE_SUB(NOW(), INTERVAL 2 MINUTE)";
        $stats['live_visitors'] = $this->conn->query($q4)->fetchColumn() ?: 0;

        return $stats;
    }

    public function getLiveTraffic() {
        $query = "SELECT lt.*, vs.ip_address, vs.user_agent, u.name as user_name 
                  FROM live_traffic lt 
                  JOIN visitor_sessions vs ON lt.session_id = vs.id 
                  LEFT JOIN users u ON vs.user_id = u.id 
                  WHERE lt.last_ping_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE) 
                  ORDER BY lt.last_ping_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getReSaleManagement() {
        $query = "SELECT id, name, email, resale_code, resale_balance FROM users ORDER BY resale_balance DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function adjustUserBalance($user_id, $amount, $type, $reason, $admin_id) {
        try {
            $this->conn->beginTransaction();

            $operator = ($type === 'credit') ? '+' : '-';
            $query = "UPDATE users SET resale_balance = resale_balance $operator ? WHERE id = ?";
            $this->conn->prepare($query)->execute([$amount, $user_id]);

            $lQuery = "INSERT INTO resale_ledger SET user_id=?, type=?, amount=?, description=?";
            $desc = "Admin Adjustment: " . $reason;
            $this->conn->prepare($lQuery)->execute([$user_id, $type, $amount, $desc]);

            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }
    public function getUsers() {
        $query = "SELECT id, name, email, phone, resale_code, resale_balance, status, created_at FROM users ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>
