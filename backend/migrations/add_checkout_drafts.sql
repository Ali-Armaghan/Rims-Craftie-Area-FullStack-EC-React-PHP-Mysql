-- Abandoned / incomplete checkout drafts
-- If table already exists, ignore the error and continue.
CREATE TABLE IF NOT EXISTS checkout_drafts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    draft_token VARCHAR(64) NOT NULL,
    user_id INT NULL DEFAULT NULL,
    full_name VARCHAR(150) NULL DEFAULT NULL,
    phone VARCHAR(30) NULL DEFAULT NULL,
    email VARCHAR(150) NULL DEFAULT NULL,
    address TEXT NULL DEFAULT NULL,
    city VARCHAR(100) NULL DEFAULT NULL,
    referral_code VARCHAR(40) NULL DEFAULT NULL,
    cart_json JSON NULL DEFAULT NULL,
    cart_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('abandoned', 'converted') NOT NULL DEFAULT 'abandoned',
    converted_order_id INT NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_checkout_drafts_token (draft_token),
    KEY idx_checkout_drafts_phone (phone),
    KEY idx_checkout_drafts_status_updated (status, updated_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
