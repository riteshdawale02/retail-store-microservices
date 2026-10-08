CREATE DATABASE IF NOT EXISTS retail_product_db;
CREATE DATABASE IF NOT EXISTS retail_order_db;
GRANT ALL PRIVILEGES ON retail_product_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON retail_order_db.* TO 'root'@'%';
FLUSH PRIVILEGES;
