<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/Loyalty.php';

$database = new Database();
$db = $database->getConnection();
$loyalty = new Loyalty($db);

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if (empty($_GET['user_id'])) {
            http_response_code(400);
            echo json_encode(['message' => 'user_id is required']);
            break;
        }

        $userCheck = $db->prepare("SELECT id FROM users WHERE id = ? LIMIT 1");
        $userCheck->execute([(int) $_GET['user_id']]);
        if (!$userCheck->fetch(PDO::FETCH_ASSOC)) {
            http_response_code(404);
            echo json_encode(['message' => 'User not found']);
            break;
        }

        echo json_encode($loyalty->getStatus((int) $_GET['user_id']));
        break;

    default:
        http_response_code(405);
        echo json_encode(['message' => 'Method not allowed']);
        break;
}
?>
