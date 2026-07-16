-- Add colors JSON column to products
-- If column already exists, ignore the error and continue.
ALTER TABLE products
  ADD COLUMN colors JSON NULL DEFAULT NULL
  COMMENT '[{ "name": "Black", "hex": "#000000" }, ...]';
