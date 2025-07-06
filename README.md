# Aipathy Backend

Bu proje, Aipathy uygulamasının backend API yapısını içerir.

---

## 📦 Şu Anda Tamamlanan Özellikler

- [x] Kullanıcı Kayıt (Sign Up)
- [x] Kullanıcı Giriş (Login)
- [x] Token Doğrulama
- [x] Rol Bazlı Yetkilendirme
- [x] Doktor Paneli Erişimi

---

## ⚙️ Kullanılan Teknolojiler

- Node.js
- Express.js
- MySQL
- JWT (Json Web Token)
- Swagger

---

## 🔗 API Endpoints

- `POST /api/auth/register` → Kayıt Ol
- `POST /api/auth/login` → Giriş Yap
- `GET /api/profile` → Profil Bilgisi (Token Gerekli)
- `GET /api/doctor-panel` → Doktor Paneli (Sadece Doktorlar Erişebilir)

---

## 🚀 Kurulum

```bash
git clone https://github.com/AIpathy/backend.git
cd backend
npm install
npm start

📝 Ek Bilgiler
Swagger Dokümantasyonu → http://localhost:5000/api-docs

.env ve node_modules GitHub'a eklenmemiştir (gitignore dosyası ayarlanmıştır).

