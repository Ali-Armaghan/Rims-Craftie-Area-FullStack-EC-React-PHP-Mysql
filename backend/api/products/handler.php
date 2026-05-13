<?php
// api/products/handler.php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/Product.php';

$database = new Database();
$db = $database->getConnection();
$product = new Product($db);

// action is already set by index.php or we use the remaining path
$slug = isset($pathParts[1]) ? $pathParts[1] : '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        $res = $product->readOneById($_GET['id']);
        if ($res) {
            echo json_encode($res);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Product not found."]);
        }
    } elseif ($slug) {
        $res = $product->readOne($slug);
        if ($res) {
            echo json_encode($res);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Product not found."]);
        }
    } else {
        $params = $_GET;
        $res = $product->read($params);
        echo json_encode($res);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if ($product->create($data)) {
        http_response_code(201);
        echo json_encode(["message" => "Product created."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to create product."]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = isset($data['id']) ? $data['id'] : null;
    if ($id && $product->update($id, $data)) {
        echo json_encode(["message" => "Product updated."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to update product."]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    if ($id && $product->delete($id)) {
        echo json_encode(["message" => "Product deleted."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to delete product."]);
    }
}
?>
