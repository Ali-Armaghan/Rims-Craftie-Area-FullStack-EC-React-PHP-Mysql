<?php

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed."]);
    exit;
}

if ($action !== 'products') {
    http_response_code(404);
    echo json_encode(["message" => "Upload endpoint not found."]);
    exit;
}

if (empty($_FILES['images'])) {
    http_response_code(400);
    echo json_encode(["message" => "No images uploaded."]);
    exit;
}

$uploadDir = __DIR__ . '/../../uploads/products';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0775, true);
}

$allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
$maxSize = 5 * 1024 * 1024;
$uploaded = [];
$files = $_FILES['images'];
$scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$origin = $scheme . '://' . $_SERVER['HTTP_HOST'];
$publicBase = $origin . preg_replace('#/api$#', '', $scriptDir) . '/uploads/products';

for ($i = 0; $i < count($files['name']); $i++) {
    if ($files['error'][$i] !== UPLOAD_ERR_OK) {
        continue;
    }

    if ($files['size'][$i] > $maxSize) {
        http_response_code(400);
        echo json_encode(["message" => "Each image must be 5MB or less."]);
        exit;
    }

    $extension = strtolower(pathinfo($files['name'][$i], PATHINFO_EXTENSION));
    if (!in_array($extension, $allowedExtensions, true)) {
        http_response_code(400);
        echo json_encode(["message" => "Only JPG, PNG, WEBP, and GIF images are allowed."]);
        exit;
    }

    $fileName = uniqid('product_', true) . '.' . $extension;
    $targetPath = $uploadDir . '/' . $fileName;

    if (move_uploaded_file($files['tmp_name'][$i], $targetPath)) {
        $uploaded[] = $publicBase . '/' . $fileName;
    }
}

if (!$uploaded) {
    http_response_code(500);
    echo json_encode(["message" => "Unable to upload images."]);
    exit;
}

echo json_encode([
    "message" => "Images uploaded.",
    "images" => $uploaded
]);
?>
