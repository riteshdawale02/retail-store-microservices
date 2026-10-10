CREATE DATABASE IF NOT EXISTS retail_product_db;
CREATE DATABASE IF NOT EXISTS retail_order_db;

-- Create retail_user and grant full privileges on both databases
CREATE USER IF NOT EXISTS 'retail_user'@'%' IDENTIFIED BY 'RetailAppSecret2026!';
ALTER USER 'retail_user'@'%' IDENTIFIED BY 'RetailAppSecret2026!';
GRANT ALL PRIVILEGES ON retail_product_db.* TO 'retail_user'@'%';
GRANT ALL PRIVILEGES ON retail_order_db.* TO 'retail_user'@'%';
GRANT ALL PRIVILEGES ON *.* TO 'retail_user'@'%' WITH GRANT OPTION;

-- Ensure root user has full permissions
GRANT ALL PRIVILEGES ON retail_product_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON retail_order_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;

FLUSH PRIVILEGES;
