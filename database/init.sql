-- AIpathy Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type ENUM('user', 'doctor') NOT NULL DEFAULT 'user',
    specialization VARCHAR(255) NULL,
    status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Patients table (for doctors to manage their patients)
CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    age INT,
    status ENUM('active', 'inactive', 'warning') DEFAULT 'active',
    risk_level ENUM('low', 'medium', 'high') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_activity TIMESTAMP NULL,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Analyses table
CREATE TABLE IF NOT EXISTS analyses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    patient_id INT NULL,
    type ENUM('voice', 'facial', 'phq9', 'gad7', 'test') NOT NULL,
    score DECIMAL(5,2) NULL,
    details TEXT,
    file_path VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alerts table (for doctors)
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    type ENUM('risk', 'inactivity', 'score_change') NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO users (name, email, password, user_type, specialization) VALUES
('Dr. Ahmet Yılmaz', 'dr.ahmet@example.com', '$2b$10$rQZ8K9mN2pL1xV3yU7wE4tR6sA8bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU0vW1xY2z', 'doctor', 'Psikiyatri'),
('Ayşe Demir', 'ayse@example.com', '$2b$10$rQZ8K9mN2pL1xV3yU7wE4tR6sA8bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU0vW1xY2z', 'user', NULL),
('Mehmet Kaya', 'mehmet@example.com', '$2b$10$rQZ8K9mN2pL1xV3yU7wE4tR6sA8bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU0vW1xY2z', 'user', NULL);

-- Insert sample patients
INSERT INTO patients (doctor_id, name, email, age, status, risk_level) VALUES
(1, 'Fatma Özkan', 'fatma@example.com', 28, 'active', 'medium'),
(1, 'Ali Yıldız', 'ali@example.com', 35, 'active', 'low'),
(1, 'Zeynep Kaya', 'zeynep@example.com', 42, 'warning', 'high');

-- Insert sample analyses
INSERT INTO analyses (user_id, patient_id, type, score, details) VALUES
(2, NULL, 'phq9', 7.5, 'Hafif depresyon belirtileri'),
(2, NULL, 'voice', 6.2, 'Ses analizi: Normal stres seviyesi'),
(3, NULL, 'gad7', 8.1, 'Orta düzey anksiyete'),
(1, 1, 'phq9', 5.5, 'Hasta durumu iyileşme gösteriyor'),
(1, 2, 'facial', 4.8, 'Yüz analizi: Pozitif duygu durumu'); 