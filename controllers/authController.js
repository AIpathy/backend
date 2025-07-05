const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Token üretme fonksiyonu
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Kayıt fonksiyonu
exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Kullanıcı var mı kontrol et
        const [user] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (user.length > 0) return res.status(400).json({ message: 'Bu e-posta zaten kayıtlı.' });

        // Şifreyi şifrele
        const hashedPassword = await bcrypt.hash(password, 10);

        // Yeni kullanıcı ekle
        await db.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);

        // Eklenen kullanıcıyı çek
        const [newUser] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        res.status(201).json({
            id: newUser[0].id,
            name: newUser[0].name,
            email: newUser[0].email,
            token: generateToken(newUser[0].id)
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
            token: generateToken(user[0].id)
        });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};
