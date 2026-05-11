<?php
// api/tracking/Tracker.php

class Tracker {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function initSession($data) {
        $session_uuid = $data->session_uuid;
        $user_id = isset($data->user_id) ? $data->user_id : null;
        $ip = $_SERVER['REMOTE_ADDR'];
        $ua = $_SERVER['HTTP_USER_AGENT'];
        $referer = isset($data->referer) ? $data->referer : '';
        $resale_code = isset($data->resale_code) ? $data->resale_code : null;

        // Check if session exists
        $query = "SELECT id FROM visitor_sessions WHERE session_uuid = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$session_uuid]);

        if ($stmt->rowCount() > 0) {
            $session = $stmt->fetch(PDO::FETCH_ASSOC);
            $session_id = $session['id'];
            
            // Update user_id if they just logged in
            if ($user_id) {
                $upd = "UPDATE visitor_sessions SET user_id = ? WHERE id = ?";
                $this->conn->prepare($upd)->execute([$user_id, $session_id]);
            }
        } else {
            // New Session
            $query = "INSERT INTO visitor_sessions 
                      SET session_uuid=:uuid, user_id=:user_id, ip_address=:ip, 
                          user_agent=:ua, referer_url=:referer, resale_code_used=:res_code";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":uuid", $session_uuid);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->bindParam(":ip", $ip);
            $stmt->bindParam(":ua", $ua);
            $stmt->bindParam(":referer", $referer);
            $stmt->bindParam(":res_code", $resale_code);
            $stmt->execute();
            $session_id = $this->conn->lastInsertId();
        }

        return ["session_id" => $session_id];
    }

    public function logPageView($data) {
        // Get internal session ID
        $sQuery = "SELECT id FROM visitor_sessions WHERE session_uuid = ?";
        $sStmt = $this->conn->prepare($sQuery);
        $sStmt->execute([$data->session_uuid]);
        $session = $sStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($session) {
            $query = "INSERT INTO page_views 
                      SET session_id=:sid, page_path=:path, page_title=:title";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":sid", $session['id']);
            $stmt->bindParam(":path", $data->page_path);
            $stmt->bindParam(":title", $data->page_title);
            $stmt->execute();
        }
    }

    public function updateLiveStatus($data) {
        $sQuery = "SELECT id FROM visitor_sessions WHERE session_uuid = ?";
        $sStmt = $this->conn->prepare($sQuery);
        $sStmt->execute([$data->session_uuid]);
        $session = $sStmt->fetch(PDO::FETCH_ASSOC);

        if ($session) {
            $query = "INSERT INTO live_traffic (session_id, current_page) 
                      VALUES (:sid, :page) 
                      ON DUPLICATE KEY UPDATE current_page=:page, last_ping_at=CURRENT_TIMESTAMP";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":sid", $session['id']);
            $stmt->bindParam(":page", $data->current_page);
            $stmt->execute();
        }
    }
}
?>
