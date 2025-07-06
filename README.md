Aipathy Backend
Bu proje, Aipathy uygulamasının backend API yapısını içerir.

📦 Şu Anda Tamamlanan Özellikler
 Kullanıcı Kayıt (Sign Up)

 Kullanıcı Giriş (Login)

 Token Doğrulama

 Rol Bazlı Yetkilendirme

 Doktor Paneli Erişimi

 Kullanıcı Paneli Erişimi

 Swagger API Dokümantasyonu

⚙️ Kullanılan Teknolojiler
Node.js

Express.js

MySQL

JWT (Json Web Token)

Swagger

🔗 API Endpoints
🔐 Authentication
POST /api/auth/register → Kullanıcı kayıt olur.

POST /api/auth/login → Kullanıcı giriş yapar. (Token döner)

👤 Profil
GET /api/profile → Giriş yapan kullanıcının bilgilerini getirir. (Token gerekli)

🩺 Doctor Panel
GET /api/doctor-panel → Yalnızca 'doctor' rolündeki kullanıcılar erişebilir. (Token gerekli)

🙍‍♂️ User Panel
GET /api/user-panel → Yalnızca 'user' rolündeki kullanıcılar erişebilir. (Token gerekli)

📂 Veritabanı
Veritabanı yapısı ve örnek veriler için database/aipathy.sql dosyasını kullanabilirsiniz.

Bu dosyayı MySQL üzerinden import ederek localde hızlıca çalıştırabilirsiniz.

🚀 Kurulum
bash
Kopyala
Düzenle
git clone https://github.com/AIpathy/backend.git
cd backend
npm install
npm start

📝 Ek Bilgiler
Swagger Dokümantasyonu → http://localhost:5000/api-docs

.env ve node_modules dosyaları .gitignore tarafından zaten takip edilmiyor.