ALTER TABLE users ADD COLUMN expertise_level VARCHAR(255) NULL AFTER specialization;

-- Update existing doctor records with sample expertise levels
UPDATE users SET expertise_level = 'Uzman Psikiyatrist' WHERE user_type = 'doctor' AND specialization = 'Psikiyatri' AND expertise_level IS NULL;
UPDATE users SET expertise_level = 'Klinik Psikolog' WHERE user_type = 'doctor' AND specialization = 'Psikoloji' AND expertise_level IS NULL; 