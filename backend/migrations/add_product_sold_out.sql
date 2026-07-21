-- Mark products as sold out without hiding them from the store.
-- If column already exists, ignore the error and continue.
ALTER TABLE products
  ADD COLUMN is_sold_out TINYINT(1) NOT NULL DEFAULT 0
  COMMENT '1 = show Sold Out on storefront, still listed'
  AFTER is_active;
