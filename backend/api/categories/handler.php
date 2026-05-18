<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/Category.php';

$database = new Database();
$db = $database->getConnection();
$category = new Category($db);

$data = json_decode(file_get_contents("php://input"), true);

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if (!empty($_GET['id'])) {
            $item = $category->readOne($_GET['id']);
            if (!$item) {
                http_response_code(404);
                echo json_encode(["message" => "Category not found."]);
            } else {
                echo json_encode($item);
            }
        } else {
            echo json_encode($category->read());
        }
        break;

    case 'POST':
        if (empty($data['name'])) {
            http_response_code(400);
            echo json_encode(["message" => "Category name is required."]);
            break;
        }

        $created = $category->create($data);

        if ($created) {
            http_response_code(201);
            echo json_encode($created);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to create category."]);
        }
        break;

    case 'PUT':
        if (empty($data['id']) || empty($data['name'])) {
            http_response_code(400);
            echo json_encode(["message" => "Category id and name are required."]);
            break;
        }

        $updated = $category->update($data['id'], $data);

        if ($updated) {
            echo json_encode($updated);
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Unable to update category."]);
        }
        break;

    case 'DELETE':
        $id = isset($_GET['id']) ? $_GET['id'] : null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(["message" => "Category id is required."]);
            break;
        }

        echo json_encode($category->delete($id));
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed."]);
        break;
}
?>
