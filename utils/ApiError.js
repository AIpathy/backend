
/**
 * Özel hata sınıfı:
 *  - statusCode : HTTP durum kodu
 *  - message    : Kullanıcıya gösterilecek hata mesajı
 *  - details    : (opsiyonel) Ek hata detayları
 */
class ApiError extends Error {
    constructor(statusCode, message, details = null) {
      super(message);
      this.statusCode = statusCode;
      this.details = details;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  module.exports = ApiError;