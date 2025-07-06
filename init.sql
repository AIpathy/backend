-- Create database if not exists
CREATE DATABASE IF NOT EXISTS aipathy_db;
USE aipathy_db;

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Insert default roles
INSERT IGNORE INTO roles (id, name) VALUES (1, 'user'), (2, 'doctor'), (3, 'admin');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expire DATETIME DEFAULT NULL,
    FOREIGN KEY (role) REFERENCES roles(id)
);