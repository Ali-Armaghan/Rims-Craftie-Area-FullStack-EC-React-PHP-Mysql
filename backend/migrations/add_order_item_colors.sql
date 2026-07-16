-- Add selected color fields to order_items
ALTER TABLE order_items
  ADD COLUMN color_name VARCHAR(100) NULL DEFAULT NULL AFTER product_name,
  ADD COLUMN color_hex VARCHAR(20) NULL DEFAULT NULL AFTER color_name;
