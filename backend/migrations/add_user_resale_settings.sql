ALTER TABLE users
  ADD COLUMN resale_discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00 AFTER resale_code,
  ADD COLUMN resale_commission_percent DECIMAL(5,2) NOT NULL DEFAULT 5.00 AFTER resale_discount_percent,
  ADD COLUMN resale_code_active TINYINT(1) NOT NULL DEFAULT 1 AFTER resale_commission_percent;
