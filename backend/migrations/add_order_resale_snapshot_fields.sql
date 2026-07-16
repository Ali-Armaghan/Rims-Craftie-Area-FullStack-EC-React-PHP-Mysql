ALTER TABLE orders
  ADD COLUMN referrer_user_id INT NULL DEFAULT NULL AFTER referred_by_code,
  ADD COLUMN resale_discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00 AFTER referrer_user_id,
  ADD COLUMN resale_discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER resale_discount_percent,
  ADD COLUMN resale_commission_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00 AFTER resale_discount_amount;
