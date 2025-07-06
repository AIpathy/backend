const jwt = require('jsonwebtoken');

//Token kontrolü
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token bulunamadı.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token geçersiz.' });
        }
        req.user = user; 
        next();
    });
};

//Rol kontrolü
const verifyRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Yetkisiz erişim.' });
        }
        next();
    };
};

module.exports = { verifyToken, verifyRole };
