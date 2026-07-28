-- Database Schema for Online Store & ReSale System

CREATE DATABASE IF NOT EXISTS online_store_resale;
USE online_store_resale;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    resale_code VARCHAR(20) UNIQUE NOT NULL,
    resale_discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    resale_commission_percent DECIMAL(5,2) NOT NULL DEFAULT 5.00,
    resale_code_active TINYINT(1) NOT NULL DEFAULT 1,
    resale_balance DECIMAL(10,2) DEFAULT 0.00,
    referred_by_id INT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referred_by_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 2. Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('superadmin', 'manager') DEFAULT 'manager',
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    parent_id INT,
    show_on_home TINYINT(1) NOT NULL DEFAULT 0,
    home_sort_order INT NOT NULL DEFAULT 0,
    image VARCHAR(500) NULL DEFAULT NULL,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 4. Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2) NULL DEFAULT NULL,
    stock INT DEFAULT 0,
    images JSON, -- Store as array of paths
    colors JSON NULL DEFAULT NULL, -- [{ "name": "Black", "hex": "#000000" }, ...]
    is_active TINYINT(1) DEFAULT 1,
    is_sold_out TINYINT(1) NOT NULL DEFAULT 0, -- 1 = Sold Out on storefront
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 4b. Product ↔ Category (many-to-many)
CREATE TABLE IF NOT EXISTS product_categories (
    product_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (product_id, category_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 5. Product Reviews Table
CREATE TABLE IF NOT EXISTS product_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    reviewer VARCHAR(100) NOT NULL,
    reviewer_email VARCHAR(150) NOT NULL,
    review TEXT NOT NULL,
    rating TINYINT NOT NULL,
    status ENUM('approved', 'pending') DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 6. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    order_number VARCHAR(30) UNIQUE NOT NULL,
    status ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL,
    shipping_address JSON NOT NULL,
    referred_by_code VARCHAR(20),
    referrer_user_id INT NULL DEFAULT NULL,
    resale_discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    resale_discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    resale_commission_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    commission_earned DECIMAL(10,2) DEFAULT 0.00,
    resale_credited TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 7. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    product_name VARCHAR(200) NOT NULL,
    color_name VARCHAR(100) NULL DEFAULT NULL,
    color_hex VARCHAR(20) NULL DEFAULT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- 8. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    user_id INT,
    method ENUM('card', 'bank_transfer', 'cod', 'resale_balance') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(100),
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 9. ReSale Ledger (Balance History)
CREATE TABLE IF NOT EXISTS resale_ledger (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    order_id INT, -- If linked to an order
    type ENUM('credit', 'debit') NOT NULL, -- credit = earned, debit = spent
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- 10. Visitor Sessions Table
CREATE TABLE IF NOT EXISTS visitor_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_uuid VARCHAR(100) UNIQUE NOT NULL,
    user_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referer_url TEXT,
    resale_code_used VARCHAR(20),
    landing_page VARCHAR(255),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    screen_resolution VARCHAR(50),
    language VARCHAR(50),
    timezone VARCHAR(100),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    page_count INT DEFAULT 0,
    total_duration INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    country VARCHAR(100),
    city VARCHAR(100),
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 11. Page Views Table
CREATE TABLE IF NOT EXISTS page_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT,
    user_id INT,
    page_path VARCHAR(255) NOT NULL,
    page_url TEXT,
    page_title VARCHAR(200),
    referrer_url TEXT,
    stay_duration INT DEFAULT 0, -- in seconds
    entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_ping_at TIMESTAMP NULL,
    exited_at TIMESTAMP NULL,
    exit_type ENUM('navigation', 'close', 'timeout') DEFAULT NULL,
    FOREIGN KEY (session_id) REFERENCES visitor_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 12. Visitor Events Table (clicks, custom actions, scroll, etc.)
CREATE TABLE IF NOT EXISTS visitor_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT,
    page_view_id INT,
    user_id INT,
    event_type VARCHAR(50) NOT NULL,
    event_name VARCHAR(100),
    page_path VARCHAR(255),
    event_data JSON,
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES visitor_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (page_view_id) REFERENCES page_views(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 13. Live Traffic Table (Lightweight Heartbeat)
CREATE TABLE IF NOT EXISTS live_traffic (
    session_id INT PRIMARY KEY,
    last_ping_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    current_page VARCHAR(255),
    current_page_title VARCHAR(200),
    current_page_view_id INT,
    is_logged_in TINYINT(1) DEFAULT 0,
    FOREIGN KEY (session_id) REFERENCES visitor_sessions(id) ON DELETE CASCADE
);

CREATE INDEX idx_visitor_sessions_user ON visitor_sessions(user_id);
CREATE INDEX idx_visitor_sessions_active ON visitor_sessions(is_active, last_seen);
CREATE INDEX idx_page_views_session ON page_views(session_id);
CREATE INDEX idx_page_views_user ON page_views(user_id);
CREATE INDEX idx_visitor_events_session ON visitor_events(session_id);
CREATE INDEX idx_visitor_events_page_view ON visitor_events(page_view_id);

-- 13b. Abandoned / incomplete checkout drafts
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

-- 14. Settings Table
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(50) UNIQUE NOT NULL,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Initial Settings
INSERT INTO settings (setting_key, setting_value) VALUES ('commission_rate', '5');
INSERT INTO settings (setting_key, setting_value) VALUES ('min_payout_amount', '500');
INSERT INTO settings (setting_key, setting_value) VALUES ('currency', 'PKR');
INSERT INTO settings (setting_key, setting_value) VALUES ('sale_countdown_enabled', '0');
INSERT INTO settings (setting_key, setting_value) VALUES ('sale_countdown_ends_at', '');
