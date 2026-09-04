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
        $ua = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
        $referer = isset($data->referer) ? $data->referer : '';
        $landing_page = isset($data->landing_page) ? $data->landing_page : null;
        $device_type = isset($data->device_type) ? $data->device_type : null;
        $browser = isset($data->browser) ? $data->browser : null;
        $os = isset($data->os) ? $data->os : null;
        $screen_resolution = isset($data->screen_resolution) ? $data->screen_resolution : null;
        $language = isset($data->language) ? $data->language : null;
        $timezone = isset($data->timezone) ? $data->timezone : null;
        $utm_source = isset($data->utm_source) ? $data->utm_source : null;
        $utm_medium = isset($data->utm_medium) ? $data->utm_medium : null;
        $utm_campaign = isset($data->utm_campaign) ? $data->utm_campaign : null;

        // Check if session exists
        $query = "SELECT id FROM visitor_sessions WHERE session_uuid = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$session_uuid]);

        if ($stmt->rowCount() > 0) {
            $session = $stmt->fetch(PDO::FETCH_ASSOC);
            $session_id = $session['id'];
            
            // Update user_id if they just logged in
            if ($user_id) {
                $upd = "UPDATE visitor_sessions SET user_id = ?, is_active = 1, ended_at = NULL WHERE id = ?";
                $this->conn->prepare($upd)->execute([$user_id, $session_id]);
            }
        } else {
            // New Session
            $query = "INSERT INTO visitor_sessions 
                      SET session_uuid=:uuid, user_id=:user_id, ip_address=:ip, 
                          user_agent=:ua, referer_url=:referer,
                          landing_page=:landing_page, device_type=:device_type,
                          browser=:browser, os=:os, screen_resolution=:screen_resolution,
                          language=:language, timezone=:timezone, utm_source=:utm_source,
                          utm_medium=:utm_medium, utm_campaign=:utm_campaign";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":uuid", $session_uuid);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->bindParam(":ip", $ip);
            $stmt->bindParam(":ua", $ua);
            $stmt->bindParam(":referer", $referer);
            $stmt->bindParam(":landing_page", $landing_page);
            $stmt->bindParam(":device_type", $device_type);
            $stmt->bindParam(":browser", $browser);
            $stmt->bindParam(":os", $os);
            $stmt->bindParam(":screen_resolution", $screen_resolution);
            $stmt->bindParam(":language", $language);
            $stmt->bindParam(":timezone", $timezone);
            $stmt->bindParam(":utm_source", $utm_source);
            $stmt->bindParam(":utm_medium", $utm_medium);
            $stmt->bindParam(":utm_campaign", $utm_campaign);
            $stmt->execute();
            $session_id = $this->conn->lastInsertId();
        }

        return ["session_id" => $session_id];
    }

    public function logPageView($data) {
        // Get internal session ID
        $sQuery = "SELECT id, user_id FROM visitor_sessions WHERE session_uuid = ?";
        $sStmt = $this->conn->prepare($sQuery);
        $sStmt->execute([$data->session_uuid]);
        $session = $sStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($session) {
            $query = "INSERT INTO page_views 
                      SET session_id=:sid, user_id=:user_id, page_path=:path,
                          page_url=:url, page_title=:title, referrer_url=:referrer,
                          last_ping_at=CURRENT_TIMESTAMP";
            $stmt = $this->conn->prepare($query);
            $page_url = isset($data->page_url) ? $data->page_url : null;
            $page_title = isset($data->page_title) ? $data->page_title : null;
            $referrer_url = isset($data->referrer_url) ? $data->referrer_url : null;
            $stmt->bindParam(":sid", $session['id']);
            $stmt->bindParam(":user_id", $session['user_id']);
            $stmt->bindParam(":path", $data->page_path);
            $stmt->bindParam(":url", $page_url);
            $stmt->bindParam(":title", $page_title);
            $stmt->bindParam(":referrer", $referrer_url);
            $stmt->execute();

            $page_view_id = $this->conn->lastInsertId();
            $this->conn->prepare("UPDATE visitor_sessions SET page_count = page_count + 1 WHERE id = ?")
                       ->execute([$session['id']]);

            return ["page_view_id" => (int)$page_view_id];
        }

        return false;
    }

    public function updateLiveStatus($data) {
        $sQuery = "SELECT id, user_id FROM visitor_sessions WHERE session_uuid = ?";
        $sStmt = $this->conn->prepare($sQuery);
        $sStmt->execute([$data->session_uuid]);
        $session = $sStmt->fetch(PDO::FETCH_ASSOC);

        if ($session) {
            $page_view_id = isset($data->page_view_id) ? $data->page_view_id : null;
            $duration = isset($data->stay_duration) ? max(0, (int)$data->stay_duration) : null;
            $title = isset($data->page_title) ? $data->page_title : null;

            if ($page_view_id && $duration !== null) {
                $this->conn->prepare("UPDATE page_views SET stay_duration = ?, last_ping_at = CURRENT_TIMESTAMP WHERE id = ? AND session_id = ?")
                           ->execute([$duration, $page_view_id, $session['id']]);
            }

            $query = "INSERT INTO live_traffic (session_id, current_page, current_page_title, current_page_view_id, is_logged_in) 
                      VALUES (:sid, :page, :title, :pvid, :logged_in) 
                      ON DUPLICATE KEY UPDATE current_page=:page, current_page_title=:title,
                          current_page_view_id=:pvid, is_logged_in=:logged_in,
                          last_ping_at=CURRENT_TIMESTAMP";
            $stmt = $this->conn->prepare($query);
            $is_logged_in = $session['user_id'] ? 1 : 0;
            $stmt->bindParam(":sid", $session['id']);
            $stmt->bindParam(":page", $data->current_page);
            $stmt->bindParam(":title", $title);
            $stmt->bindParam(":pvid", $page_view_id);
            $stmt->bindParam(":logged_in", $is_logged_in);
            $stmt->execute();

            $this->conn->prepare("UPDATE visitor_sessions SET is_active = 1, total_duration = GREATEST(total_duration, ?) WHERE id = ?")
                       ->execute([$duration ?: 0, $session['id']]);
        }
    }

    public function endPageView($data) {
        $page_view_id = isset($data->page_view_id) ? $data->page_view_id : null;
        if (!$page_view_id) return false;

        $duration = isset($data->stay_duration) ? max(0, (int)$data->stay_duration) : 0;
        $exit_type = isset($data->exit_type) ? $data->exit_type : 'navigation';

        $query = "UPDATE page_views
                  SET stay_duration = ?, exited_at = CURRENT_TIMESTAMP,
                      exit_type = ?, last_ping_at = CURRENT_TIMESTAMP
                  WHERE id = ?";
        return $this->conn->prepare($query)->execute([$duration, $exit_type, $page_view_id]);
    }

    public function endSession($data) {
        $session_uuid = $data->session_uuid;
        $query = "UPDATE visitor_sessions
                  SET is_active = 0, ended_at = CURRENT_TIMESTAMP
                  WHERE session_uuid = ?";
        return $this->conn->prepare($query)->execute([$session_uuid]);
    }

    public function logEvent($data) {
        $sQuery = "SELECT id, user_id FROM visitor_sessions WHERE session_uuid = ?";
        $sStmt = $this->conn->prepare($sQuery);
        $sStmt->execute([$data->session_uuid]);
        $session = $sStmt->fetch(PDO::FETCH_ASSOC);
        if (!$session) return false;

        $page_view_id = isset($data->page_view_id) ? $data->page_view_id : null;
        $event_name = isset($data->event_name) ? $data->event_name : null;
        $page_path = isset($data->page_path) ? $data->page_path : null;
        $event_data = isset($data->event_data) ? json_encode($data->event_data) : null;

        $query = "INSERT INTO visitor_events
                  SET session_id=:sid, page_view_id=:pvid, user_id=:uid,
                      event_type=:etype, event_name=:ename, page_path=:path,
                      event_data=:edata";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":sid", $session['id']);
        $stmt->bindParam(":pvid", $page_view_id);
        $stmt->bindParam(":uid", $session['user_id']);
        $stmt->bindParam(":etype", $data->event_type);
        $stmt->bindParam(":ename", $event_name);
        $stmt->bindParam(":path", $page_path);
        $stmt->bindParam(":edata", $event_data);
        return $stmt->execute();
    }
}
?>
