<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/CheckoutDraft.php';

$database = new Database();
$db = $database->getConnection();
$drafts = new CheckoutDraft($db);

$data = json_decode(file_get_contents("php://input"), true);
if (!is_array($data)) {
    $data = [];
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        $status = isset($_GET['status']) ? $_GET['status'] : null;
        echo json_encode($drafts->listAll($status));
        break;

    case 'POST':
        if ($action === 'convert') {
            $result = $drafts->convert($data);
            if (empty($result['success'])) {
                http_response_code(400);
            }
            echo json_encode($result);
            break;
        }

        $result = $drafts->upsert($data);
        if (empty($result['success'])) {
            http_response_code(400);
        }
        echo json_encode($result);
        break;

    case 'PUT':
        $result = $drafts->convert($data);
        if (empty($result['success'])) {
            http_response_code(400);
        }
        echo json_encode($result);
        break;

    default:
        http_response_code(405);
        echo json_encode(['message' => 'Method not allowed']);
        break;
}
