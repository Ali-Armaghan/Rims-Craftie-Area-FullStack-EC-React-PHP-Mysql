<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/Order.php';

$database = new Database();
$db = $database->getConnection();
$order = new Order($db);

$data = json_decode(file_get_contents("php://input"), true);
if (!is_array($data)) {
    $data = [];
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if (!empty($_GET['id'])) {
            // Get single order with items
            $query = "SELECT o.*, u.name as customer_name, u.email as customer_email 
                      FROM orders o 
                      LEFT JOIN users u ON o.user_id = u.id 
                      WHERE o.id = ?";
            $params = [$_GET['id']];

            if (!empty($_GET['user_id'])) {
                $query .= " AND o.user_id = ?";
                $params[] = $_GET['user_id'];
            }

            $stmt = $db->prepare($query);
            $stmt->execute($params);
            $ord = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$ord) {
                http_response_code(404);
                echo json_encode(['message' => 'Order not found']);
                break;
            }
            
            // Get items (prefer stored product_name snapshot; keep selected color)
            $iq = "SELECT oi.*,
                          COALESCE(oi.product_name, p.name) as product_name
                   FROM order_items oi
                   LEFT JOIN products p ON oi.product_id = p.id
                   WHERE oi.order_id = ?";
            $istmt = $db->prepare($iq);
            $istmt->execute([$_GET['id']]);
            $ord['items'] = $istmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode($ord);
        } elseif (!empty($_GET['user_id'])) {
            $query = "SELECT o.*, u.name as customer_name 
                      FROM orders o 
                      LEFT JOIN users u ON o.user_id = u.id 
                      WHERE o.user_id = ?
                      ORDER BY o.created_at DESC";
            $stmt = $db->prepare($query);
            $stmt->execute([$_GET['user_id']]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
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

    case 'POST':
        if (
            empty($data['user_id']) ||
            empty($data['shipping_address']) ||
            empty($data['items']) ||
            !isset($data['subtotal']) ||
            !isset($data['total'])
        ) {
            http_response_code(400);
            echo json_encode(['message' => 'Incomplete order data']);
            break;
        }

        $userCheck = $db->prepare("SELECT id FROM users WHERE id = ? LIMIT 1");
        $userCheck->execute([$data['user_id']]);
        if (!$userCheck->fetch(PDO::FETCH_ASSOC)) {
            http_response_code(401);
            echo json_encode(['message' => 'Invalid user session. Please login again.']);
            break;
        }

        $res = $order->create($data);
        http_response_code($res['success'] ? 201 : 500);
        echo json_encode($res);
        break;

    case 'PUT':
        if (!empty($data['id']) && !empty($data['status'])) {
            $res = $order->updateStatus($data['id'], $data['status']);
            echo json_encode(['success' => $res]);
        } else {
            http_response_code(400);
            echo json_encode(['message' => 'Order id and status are required']);
        }
        break;

    case 'DELETE':
        // Multi-delete: body { "ids": [1,2,3] } or ?ids=1,2,3
        $ids = [];
        if (!empty($data['ids']) && is_array($data['ids'])) {
            $ids = $data['ids'];
        } elseif (!empty($_GET['ids'])) {
            $ids = array_map('trim', explode(',', $_GET['ids']));
        }

        if (!empty($ids)) {
            $res = $order->deleteMany($ids);
            if (!empty($res['success'])) {
                echo json_encode([
                    'success' => true,
                    'message' => $res['deleted'] . ' order(s) deleted',
                    'deleted' => $res['deleted'],
                ]);
            } else {
                http_response_code(503);
                echo json_encode([
                    'success' => false,
                    'message' => $res['message'] ?? 'Unable to delete orders',
                ]);
            }
            break;
        }

        // Single delete: ?id=123
        $id = !empty($_GET['id']) ? $_GET['id'] : ($data['id'] ?? null);
        if ($id && $order->delete($id)) {
            echo json_encode(['success' => true, 'message' => 'Order deleted']);
        } else {
            http_response_code(503);
            echo json_encode(['success' => false, 'message' => 'Unable to delete order']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['message' => 'Method not allowed']);
        break;
}
?>
