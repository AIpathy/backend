# AIpathy Backend

## Kullanılan Teknolojiler

### Diller
- **JavaScript (Node.js)** - Ana programlama dili

### Framework ve Kütüphaneler
- **Express.js** - Web framework
- **bcryptjs** - Şifre hashleme
- **jsonwebtoken** - JWT token yönetimi
- **express-validator** - Form validasyonu
- **multer** - Dosya upload işlemleri
- **axios** - HTTP istekleri
- **helmet** - Güvenlik middleware
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables

### Veritabanı
- **MySQL** - Ana veritabanı
- **mysql2** - MySQL driver

### Geliştirme ve Deployment
- **Jest** - Test framework
- **Nodemon** - Development server
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

### **Deployment/Containerization:**
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

### **CI/CD:**
- **Github Actions**
- **Deploy to Server**

### **Domain/Hosting/Server**
- **Domain: https://aipathy.xyz**
- **Provider: Sercan Arga (Teşekkürler)**

### **Control Panel:**
- **Plesk** - Web hosting kontrol paneli

## Proje Mimarisi

### MVC Mimarisi
- **Controllers**: İş mantığı ve API endpoint'leri
- **Routes**: URL routing ve middleware yönetimi
- **Middleware**: Authentication, validation, error handling
- **Services**: Business logic ve external API entegrasyonları
- **Config**: Veritabanı ve uygulama konfigürasyonları

### Kod Yapısı
```
backend/
├── config/                 # Konfigürasyon dosyaları
├── controllers/           # İş mantığı kontrolcüleri
├── middleware/            # Middleware fonksiyonları
├── routes/               # API route'ları
├── services/             # Business logic servisleri
├── database/             # Veritabanı dosyaları
├── utils/                # Yardımcı fonksiyonlar
├── server.js             # Ana sunucu dosyası
├── Dockerfile           # Docker container konfigürasyonu
└── docker-compose.yml   # Multi-container orchestration
```

### API Mimarisi
- **RESTful API Design** - Standart HTTP metodları
- **JWT Authentication** - Token tabanlı güvenlik
- **Role-based Access Control** - Kullanıcı rolü bazlı erişim
- **Error Handling** - Merkezi hata yönetimi
- **Input Validation** - Giriş verisi doğrulama

### Kullanıcı Yönetimi
- **Kimlik Doğrulama**: Kayıt, giriş, şifre sıfırlama
- **Profil Yönetimi**: Görüntüleme ve güncelleme
- **Kullanıcı Rolleri**: Normal kullanıcı ve doktor rolleri

### Hasta Yönetimi
- **Hasta İşlemleri**: Liste, detay, ekleme, güncelleme
- **Durum Takibi**: Risk seviyeleri ve aktivite takibi
- **Analiz Geçmişi**: Hastanın tüm analizleri

### Analiz Sistemi
- **Ses Analizi**: Ses dosyası yükleyerek analiz
- **Test Analizi**: PHQ-9, GAD-7 ve diğer testler
- **Dosya Yükleme**: Audio dosyaları için güvenli upload
- **Sonuç Raporlama**: Detaylı analiz sonuçları

### Dashboard Sistemi
- **Doktor Dashboard**
- **Kullanıcı Dashboard**

### Alert System
- **Risk Uyarıları**: Yüksek riskli hasta uyarıları
- **İnaktivite Uyarıları**: Uzun süre analiz yapmayan hastalar
- **Uyarı Yönetimi**: Liste, okundu işaretleme, filtreleme

## API Endpoints

### Authentication
```
POST /api/auth/register     - Kullanıcı kaydı
POST /api/auth/login        - Kullanıcı girişi
POST /api/auth/forgot-password - Şifre sıfırlama isteği
POST /api/auth/reset-password  - Şifre sıfırlama
```

### User Management
```
GET  /api/users/profile     - Kullanıcı profilini getir
PUT  /api/users/profile     - Kullanıcı profilini güncelle
PUT  /api/users/password    - Şifre güncelleme
```

### Patient Management
```
GET  /api/patients          - Hasta listesini getir
GET  /api/patients/:id      - Belirli hastayı getir
GET  /api/patients/:id/analyses - Hasta analizlerini getir
POST /api/patients          - Yeni hasta ekle
PUT  /api/patients/:id      - Hasta bilgilerini güncelle
```

### Analysis
```
POST /api/analyses/voice    - Ses analizi gönder
POST /api/analyses/test     - Test analizi gönder
GET  /api/analyses/user     - Kullanıcı analizlerini getir
```

### Dashboard
```
GET  /api/dashboard/doctor/stats - Doktor istatistikleri
GET  /api/dashboard/user/stats   - Kullanıcı istatistikleri
GET  /api/dashboard/alerts       - Uyarıları getir
PUT  /api/dashboard/alerts/:id/read - Uyarıyı okundu işaretle
```

### Alerts
```
GET  /api/alerts            - Tüm uyarıları getir
GET  /api/alerts/:id        - Belirli uyarıyı getir
PUT  /api/alerts/:id/read   - Uyarıyı okundu işaretle
PUT  /api/alerts/read-all   - Tüm uyarıları okundu işaretle
DELETE /api/alerts/:id      - Uyarı sil
DELETE /api/alerts          - Tüm uyarıları sil
```

### ML Service
```
GET  /api/ml/health         - ML servis durumu kontrolü
POST /api/ml/analyze/:testType - Test analizi (anxiety, borderline, narcissism, social_phobia, beck_depression, alcohol)
POST /api/ml/analyze-audio  - Ses duygu analizi
POST /api/ml/combined-analysis - Test + ses kombinasyon analizi
```

### AI Service
```
POST /api/ai/chat           - AI destekli sohbet
```

### Migration
```
GET  /api/migration         - Migration işlemleri
```

### Health Check
```
GET /health                 - API durumu kontrolü
```

## Veritabanı Şeması

### Tablolar
- **users**: Kullanıcı bilgileri
- **password_reset_tokens**: Şifre sıfırlama token'ları
- **patients**: Hasta bilgileri
- **analyses**: Analiz sonuçları
- **alerts**: Uyarı sistemi

### Tablo İlişkileri
- `users` → `patients` (doctor_id foreign key)
- `users` → `analyses` (user_id foreign key)
- `patients` → `analyses` (patient_id foreign key)
- `patients` → `alerts` (patient_id foreign key)

## Güvenlik Özellikleri
- **bcryptjs** - Güvenli şifre hashleme
- **JWT** - Token tabanlı kimlik doğrulama
- **Helmet** - Güvenlik başlıkları
- **CORS** - Cross-origin resource sharing
- **Input Validation** - Veri doğrulama
- **Role-based Access** - Rol tabanlı erişim kontrolü

## Gelecek Özellikler
- **Email Entegrasyonu**: Şifre sıfırlama email'leri
- **Real-time Notifications**: WebSocket ile gerçek zamanlı bildirimler
- **Mobile API**: Mobil uygulama için optimize edilmiş endpoint'ler
- **Advanced Analytics**: Gelişmiş analitik ve raporlama
- **Multi-language Support**: Çoklu dil desteği

---