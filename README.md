# AIpathy

AIpathy, ruh sağlığı takibi ve analizi için geliştirilmiş web uygulamasıdır.

## 🎯 Backend - Tamamlanan Özellikler

### ✅ Kullanıcı Yönetimi (User Management)

#### Kimlik Doğrulama (Authentication)
- **Kullanıcı Kaydı**: Yeni kullanıcı hesabı oluşturma
- **Kullanıcı Girişi**: Email ve şifre ile giriş yapma
- **Şifre Sıfırlama**: Unutulan şifreleri sıfırlama
- **JWT Token**: Güvenli token tabanlı kimlik doğrulama

#### Kullanıcı Profil Yönetimi
- **Profil Görüntüleme**: Kullanıcı bilgilerini getirme
- **Profil Güncelleme**: Kullanıcı bilgilerini düzenleme
- **Kullanıcı İstatistikleri**: Analiz geçmişi ve istatistikler

#### Kullanıcı Rolleri
- **Normal Kullanıcı** (`user`): Analiz yapabilen kullanıcılar
- **Doktor** (`doctor`): Hasta yönetimi yapabilen kullanıcılar

### ✅ Hasta Yönetimi (Patient Management)

#### Hasta İşlemleri
- **Hasta Listesi**: Doktorun hastalarını listeleme
- **Hasta Detayı**: Belirli hasta bilgilerini görüntüleme
- **Hasta Ekleme**: Yeni hasta kaydı oluşturma
- **Hasta Güncelleme**: Hasta bilgilerini düzenleme
- **Hasta Analizleri**: Hastanın analiz geçmişini görüntüleme

#### Hasta Durumu Takibi
- **Risk Seviyesi**: Düşük, orta, yüksek risk kategorileri
- **Durum Takibi**: Aktif, pasif, uyarı durumları
- **Son Aktivite**: Hastanın son aktivite zamanı

### ✅ Analiz Sistemi (Analysis System)

#### Analiz Türleri
- **Ses Analizi**: Ses dosyası yükleyerek analiz
- **Yüz Analizi**: Görsel dosya yükleyerek analiz
- **Test Analizi**: PHQ-9, GAD-7 ve diğer testler

#### Dosya Yükleme
- **Audio Dosyaları**: Ses analizi için
- **Image Dosyaları**: Yüz analizi için
- **Dosya Doğrulama**: MIME type kontrolü
- **Boyut Limiti**: 10MB maksimum dosya boyutu

#### Analiz Sonuçları
- **Skor Hesaplama**: 0-10 arası puanlama
- **Detaylı Rapor**: Analiz sonuçları ve açıklamalar
- **Geçmiş Takibi**: Tüm analiz geçmişi

### ✅ Dashboard Sistemi

#### Doktor Dashboard
- **Hasta İstatistikleri**: Toplam hasta sayısı
- **Durum Dağılımı**: Hasta durumlarına göre dağılım
- **Risk Analizi**: Hasta risk seviyeleri
- **Son Aktiviteler**: Son 10 aktivite
- **Okunmamış Uyarılar**: Uyarı sayısı

#### Kullanıcı Dashboard
- **Analiz İstatistikleri**: Toplam analiz sayısı
- **Tür Dağılımı**: Analiz türlerine göre dağılım
- **Son Analizler**: Son 5 analiz
- **Ortalama Skor**: Tüm analizlerin ortalaması
- **Trend Analizi**: Son 7 gün vs önceki 7 gün

### ✅ Uyarı Sistemi (Alert System)

#### Uyarı Türleri
- **Risk Uyarıları**: Yüksek riskli hasta uyarıları
- **İnaktivite Uyarıları**: Uzun süre analiz yapmayan hastalar
- **Skor Değişimi**: Anormal skor değişimleri

#### Uyarı Yönetimi
- **Uyarı Listesi**: Tüm uyarıları görüntüleme
- **Okundu İşaretleme**: Uyarıları okundu olarak işaretleme
- **Filtreleme**: Okunmamış uyarıları filtreleme

### ✅ Güvenlik Özellikleri
- **Şifre Hashleme**: bcryptjs ile güvenli şifre saklama
- **Input Validation**: Express-validator ile veri doğrulama
- **CORS**: Cross-origin resource sharing desteği
- **Helmet**: Güvenlik başlıkları
- **JWT Authentication**: Token tabanlı kimlik doğrulama
- **Role-based Access**: Rol tabanlı erişim kontrolü

## 🔗 API Endpoints

### Authentication Endpoints
```
POST /api/auth/register     - Kullanıcı kaydı
POST /api/auth/login        - Kullanıcı girişi
POST /api/auth/forgot-password - Şifre sıfırlama isteği
POST /api/auth/reset-password  - Şifre sıfırlama
```

### User Management Endpoints
```
GET  /api/users/profile     - Kullanıcı profilini getir
PUT  /api/users/profile     - Kullanıcı profilini güncelle
```

### Patient Management Endpoints
```
GET  /api/patients          - Hasta listesini getir
GET  /api/patients/:id      - Belirli hastayı getir
GET  /api/patients/:id/analyses - Hasta analizlerini getir
POST /api/patients          - Yeni hasta ekle
PUT  /api/patients/:id      - Hasta bilgilerini güncelle
```

### Analysis Endpoints
```
POST /api/analyses/voice    - Ses analizi gönder
POST /api/analyses/facial   - Yüz analizi gönder
POST /api/analyses/test     - Test analizi gönder
GET  /api/analyses/user     - Kullanıcı analizlerini getir
```

### Dashboard Endpoints
```
GET  /api/dashboard/doctor/stats - Doktor istatistikleri
GET  /api/dashboard/user/stats   - Kullanıcı istatistikleri
GET  /api/dashboard/alerts       - Uyarıları getir
PUT  /api/dashboard/alerts/:id/read - Uyarıyı okundu işaretle
```

### Health Check
```
GET /health                 - API durumu kontrolü
```

## 🛠️ Teknolojiler

### Backend Framework
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MySQL**: Veritabanı
- **JWT**: Token tabanlı kimlik doğrulama

### Güvenlik
- **bcryptjs**: Şifre hashleme
- **helmet**: Güvenlik başlıkları
- **express-validator**: Input validation

### Dosya İşleme
- **multer**: Dosya yükleme
- **fs**: Dosya sistemi işlemleri

### Geliştirme Araçları
- **nodemon**: Otomatik sunucu yenileme
- **dotenv**: Ortam değişkenleri
- **cors**: Cross-origin resource sharing

## 📁 Proje Yapısı

```
backend/
├── config/
│   └── database.js          # Veritabanı bağlantısı
├── controllers/
│   ├── authController.js     # Kimlik doğrulama işlemleri
│   ├── userController.js     # Kullanıcı yönetimi
│   ├── patientController.js  # Hasta yönetimi
│   ├── analysisController.js # Analiz işlemleri
│   └── dashboardController.js # Dashboard işlemleri
├── middleware/
│   ├── auth.js              # JWT token doğrulama
│   └── validation.js        # Input validation
├── routes/
│   ├── auth.js              # Authentication route'ları
│   ├── users.js             # User management route'ları
│   ├── patients.js          # Patient management route'ları
│   ├── analyses.js          # Analysis route'ları
│   └── dashboard.js         # Dashboard route'ları
├── database/
│   └── init.sql             # Veritabanı şeması
├── server.js                # Ana sunucu dosyası
└── package.json             # Proje bağımlılıkları
```

## 🗄️ Veritabanı Şeması

### Aktif Tablolar
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

## 🚀 Kurulum ve Çalıştırma (eklenecek)

### Gereksinimler
- Node.js (v14+)
- MySQL (v8.0+)
- npm veya yarn
```

## 🔮 Gelecek Özellikler

### Planlanan Geliştirmeler
- **AI Entegrasyonu**: Gerçek AI analiz servisleri
- **Email Entegrasyonu**: Şifre sıfırlama email'leri
- **Real-time Notifications**: WebSocket ile gerçek zamanlı bildirimler
- **Mobile API**: Mobil uygulama için optimize edilmiş endpoint'ler
- **Advanced Analytics**: Gelişmiş analitik ve raporlama
- **Multi-language Support**: Çoklu dil desteği

## İletişim

Proje hakkında sorularınız için issue açabilirsiniz.

---

**Not**: Gelecekteki iyileştirmeler için takipte kalın!