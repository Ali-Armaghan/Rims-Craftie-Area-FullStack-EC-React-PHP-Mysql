<?php
// api/auth/handler.php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/User.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$data = json_decode(file_get_contents("php://input"));

switch ($action) {
    case 'register':
        if (
            !empty($data->name) &&
            !empty($data->email) &&
            !empty($data->password)
        ) {
            $user->name = $data->name;
            $user->email = $data->email;
            $user->password = $data->password;
            $user->phone = isset($data->phone) ? $data->phone : "";

            if ($user->register()) {
                http_response_code(201);
                echo json_encode(array("message" => "User was created."));
            } else {
                http_response_code(400);
                echo json_encode(array("message" => "Unable to register user. Email may already exist."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Incomplete data."));
        }
        break;

    case 'login':
        if (!empty($data->email) && !empty($data->password)) {
            $user->email = $data->email;
            $userData = $user->login($data->password);
            
            if ($userData) {
                // In a real app, generate a JWT here. 
                // For this plan/initial code, we'll return the user data.
                http_response_code(200);
                echo json_encode(array(
                    "message" => "Login successful.",
                    "user" => $userData
                ));
            } else {
                http_response_code(401);
                echo json_encode(array("message" => "Login failed. Invalid email or password."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Incomplete data."));
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(array("message" => "Auth action not found."));
        break;
}
?>
