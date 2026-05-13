<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/Review.php';

$database = new Database();
$db = $database->getConnection();
$review = new Review($db);

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        $product_id = isset($_GET['product_id']) ? $_GET['product_id'] : null;

        if ($product_id) {
            echo json_encode($review->readByProduct($product_id));
        } else {
            echo json_encode($review->readAll());
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        if (
            empty($data['product_id']) ||
            empty($data['reviewer']) ||
            empty($data['reviewer_email']) ||
            empty($data['review']) ||
            empty($data['rating'])
        ) {
            http_response_code(400);
            echo json_encode(["message" => "Incomplete review data."]);
            break;
        }

        $created = $review->create($data);

        if ($created) {
            http_response_code(201);
            echo json_encode($created);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to create review."]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['id'])) {
            http_response_code(400);
            echo json_encode(["message" => "Review id is required."]);
            break;
        }

        if (isset($data['status']) && count($data) <= 2) {
            $updated = $review->updateStatus($data['id'], $data['status']);
        } else {
            if (
                empty($data['product_id']) ||
                empty($data['reviewer']) ||
                empty($data['reviewer_email']) ||
                empty($data['review']) ||
                empty($data['rating'])
            ) {
                http_response_code(400);
                echo json_encode(["message" => "Incomplete review data."]);
                break;
            }

            $updated = $review->update($data['id'], $data);
        }

        echo json_encode(["success" => $updated]);
        break;

    case 'DELETE':
        $id = isset($_GET['id']) ? $_GET['id'] : null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(["message" => "Review id is required."]);
            break;
        }

        echo json_encode(["success" => $review->delete($id)]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed."]);
        break;
}
?>
