const rateLimit = require('express-rate-limit');

//GENEL API LİMİTİ – tüm /api istekleri
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   
  max: 100,                   
  standardHeaders: true,      
  legacyHeaders: false        
});

//AUTH İŞLEMLERİ İÇİN SIKI LİMİT – brute‑force engeli
const authLimiter = rateLimit({
  windowMs: 30 * 1000,
  max: 50,                   
  message: {
    status: 429,
    message: 'Çok fazla deneme. Lütfen 15 dakika sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { apiLimiter, authLimiter };
