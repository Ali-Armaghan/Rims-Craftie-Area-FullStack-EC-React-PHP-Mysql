-- Original price before discount; products.price remains the sale price
ALTER TABLE products
ADD COLUMN original_price DECIMAL(10,2) NULL DEFAULT NULL AFTER price;
