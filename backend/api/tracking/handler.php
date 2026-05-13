<?php
// api/tracking/handler.php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/Tracker.php';

$database = new Database();
$db = $database->getConnection();
$tracker = new Tracker($db);

$data = json_decode(file_get_contents("php://input"));

switch ($action) {
    case 'init':
        // Frontend sends: session_uuid, user_id (optional), referer, user_agent
        $res = $tracker->initSession($data);
        echo json_encode($res);
        break;

    case 'pageview':
        // Frontend sends: session_uuid, page_path, page_title
        if (!empty($data->session_uuid) && !empty($data->page_path)) {
            $res = $tracker->logPageView($data);
            echo json_encode(["message" => "Page view logged.", "data" => $res]);
        }
        break;

    case 'ping':
        // Frontend sends: session_uuid, current_page
        if (!empty($data->session_uuid)) {
            $tracker->updateLiveStatus($data);
            echo json_encode(["message" => "Ping received."]);
        }
        break;

    case 'end-page':
        if (!empty($data->page_view_id)) {
            $res = $tracker->endPageView($data);
            echo json_encode(["success" => $res]);
        }
        break;

    case 'end-session':
        if (!empty($data->session_uuid)) {
            $res = $tracker->endSession($data);
            echo json_encode(["success" => $res]);
        }
        break;

    case 'event':
        if (!empty($data->session_uuid) && !empty($data->event_type)) {
            $res = $tracker->logEvent($data);
            echo json_encode(["success" => $res]);
        }
        break;

    default:
        http_response_code(404);
        break;
}
?>
