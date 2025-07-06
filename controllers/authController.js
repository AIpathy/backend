const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Token üretme fonksiyonu
const generateToken = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Kayıt fonksiyonu
exports.registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // Kullanıcı var mı kontrol et
        const [user] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (user.length > 0) return res.status(400).json({ message: 'Bu e-posta zaten kayıtlı.' });

        // Şifreyi şifrele
        const hashedPassword = await bcrypt.hash(password, 10);

        // Yeni kullanıcı ekle
        await db.execute('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, role]);

        // Eklenen kullanıcıyı çek
        const [newUser] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        res.status(201).json({
            id: newUser[0].id,
            name: newUser[0].name,
            email: newUser[0].email,
            role: newUser[0].role,
            token: generateToken(newUser[0].id, newUser[0].role)
        });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası: ' + error });
    }
};

// Giriş fonksiyonu
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Kullanıcıyı bul
        const [user] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (user.length === 0) return res.status(401).json({ message: 'Geçersiz e-posta.' });

        // Şifreyi kontrol et
        const isMatch = await bcrypt.compare(password, user[0].password);
        if (!isMatch) return res.status(401).json({ message: 'Geçersiz şifre.' });

        res.json({
            id: user[0].id,
            name: user[0].name,
            email: user[0].email,
            role: user[0].role,
            token: generateToken(user[0].id, user[0].role)
        });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};

// Şifremi Unuttum
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // Kullanıcıyı bul
        const [user] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (user.length === 0) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

        // Token üret
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Veritabanına yaz
        await db.execute('UPDATE users SET resetToken = ? WHERE email = ?', [resetToken, email]);

        // Normalde e-posta gönderilir, biz tokenı döneceğiz
        res.status(200).json({ message: 'Şifre sıfırlama tokenı oluşturuldu.', resetToken });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};

// Şifre Sıfırlama
exports.resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;

    try {
        // Token kontrol
        const [user] = await db.execute('SELECT * FROM users WHERE resetToken = ?', [resetToken]);
        if (user.length === 0) return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş token.' });

        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Şifreyi güncelle ve tokenı temizle
        await db.execute('UPDATE users SET password = ?, resetToken = NULL WHERE resetToken = ?', [hashedPassword, resetToken]);

        res.status(200).json({ message: 'Şifre başarıyla sıfırlandı.' });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};
