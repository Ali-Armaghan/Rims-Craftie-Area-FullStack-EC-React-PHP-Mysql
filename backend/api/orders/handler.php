<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/Order.php';

$database = new Database();
$db = $database->getConnection();
$order = new Order($db);

$data = json_decode(file_get_contents("php://input"), true);

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if (!empty($_GET['id'])) {
            // Get single order with items
            $query = "SELECT o.*, u.name as customer_name, u.email as customer_email 
                      FROM orders o 
                      LEFT JOIN users u ON o.user_id = u.id 
                      WHERE o.id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$_GET['id']]);
            $ord = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Get items
            $iq = "SELECT oi.*, p.name as product_name FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?";
            $istmt = $db->prepare($iq);
            $istmt->execute([$_GET['id']]);
            $ord['items'] = $istmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode($ord);
        } else {
            $query = "SELECT o.*, u.name as customer_name 
                      FROM orders o 
                      LEFT JOIN users u ON o.user_id = u.id 
                      ORDER BY o.created_at DESC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        break;

    case 'PUT':
        if (!empty($data['id']) && !empty($data['status'])) {
            $res = $order->updateStatus($data['id'], $data['status']);
            echo json_encode(['success' => $res]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['message' => 'Method not allowed']);
        break;
}
?>
