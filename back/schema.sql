-- Print shop schema (derived from the API routes). Safe to re-run.
CREATE TABLE IF NOT EXISTS staff_accounts (
  staff_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NULL,
  role ENUM('admin','cashier') NOT NULL DEFAULT 'cashier',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(170) NOT NULL UNIQUE,
  base_price DECIMAL(10,2) NOT NULL,
  category_id INT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS print_attributes (
  attribute_id INT AUTO_INCREMENT PRIMARY KEY,
  attribute_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS attribute_options (
  option_id INT AUTO_INCREMENT PRIMARY KEY,
  attribute_id INT NOT NULL,
  option_value VARCHAR(150) NOT NULL,
  price_modifier DECIMAL(10,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (attribute_id) REFERENCES print_attributes(attribute_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_attributes (
  product_id INT NOT NULL,
  option_id INT NOT NULL,
  PRIMARY KEY (product_id, option_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  FOREIGN KEY (option_id) REFERENCES attribute_options(option_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  staff_id INT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'completed',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES staff_accounts(staff_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  order_item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS staff_activity_log (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  staff_id INT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES staff_accounts(staff_id) ON DELETE SET NULL
);
