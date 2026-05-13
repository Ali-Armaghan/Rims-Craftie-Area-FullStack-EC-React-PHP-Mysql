<?php
require_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"), true);

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if ($action === 'ledger') {
            // Resale ledger with user info
            $query = "SELECT rl.*, u.name as user_name, u.resale_code 
                      FROM resale_ledger rl 
                      LEFT JOIN users u ON rl.user_id = u.id 
                      ORDER BY rl.created_at DESC 
                      LIMIT 200";
            $stmt = $db->prepare($query);
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } else {
            // Commissions: users with their resale info
            $query = "SELECT u.id, u.name, u.email, u.resale_code, u.resale_balance,
                             COUNT(o.id) as total_referrals,
                             COALESCE(SUM(o.commission_earned), 0) as total_commissions
                      FROM users u
                      LEFT JOIN orders o ON o.referred_by_code = u.resale_code AND o.resale_credited = 1
                      GROUP BY u.id
                      ORDER BY total_commissions DESC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        break;

    case 'POST':
        // Manually adjust user balance
        if (!empty($data['user_id']) && !empty($data['amount']) && !empty($data['type'])) {
            $db->beginTransaction();
            try {
                $op = $data['type'] === 'credit' ? '+' : '-';
                $db->prepare("UPDATE users SET resale_balance = resale_balance $op ? WHERE id = ?")
                   ->execute([$data['amount'], $data['user_id']]);
                $db->prepare("INSERT INTO resale_ledger SET user_id=?, type=?, amount=?, description=?")
                   ->execute([$data['user_id'], $data['type'], $data['amount'], $data['reason'] ?? 'Manual Adjustment']);
                $db->commit();
                echo json_encode(['success' => true]);
            } catch (Exception $e) {
                $db->rollBack();
                http_response_code(500);
                echo json_encode(['success' => false]);
            }
        }
        break;
}
?>
