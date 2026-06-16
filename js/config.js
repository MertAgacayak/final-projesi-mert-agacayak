/* =============================================================================
 *  Sınav Pusulası — Yapılandırma (config)
 *  Manisa Celal Bayar Üniversitesi · Sınava Hazırlık Yönlendirme Sistemi
 * -----------------------------------------------------------------------------
 *  Bu dosya, ön yüzün (frontend) tek yapılandırma noktasıdır.
 *  n8n webhook adresinizi aşağıdaki N8N_WEBHOOK_URL alanına yazın.
 *
 *  GÜVENLİK NOTU:
 *  Gemini API anahtarı ASLA bu dosyaya / tarayıcıya yazılmaz.
 *  Anahtar yalnızca n8n yapılandırmasında (sunucu tarafında) tutulur.
 *  Ön yüz sadece n8n webhook'una istek atar; Gemini ile konuşan n8n'dir.
 * ========================================================================== */

window.APP_CONFIG = {
  // ---- n8n bağlantısı ----
  // Kendi n8n webhook adresinizi buraya yapıştırın.
  // Örnek: "https://n8n.ornek.com/webhook/sinav-pusulasi"
  // Boş bırakılırsa sistem otomatik olarak DEMO (failsafe) moduna düşer.
  N8N_WEBHOOK_URL: "",

  // ---- Dayanıklılık (failsafe) ayarları ----
  REQUEST_TIMEOUT_MS: 30000,   // Tek bir denemenin zaman aşımı (ms)
  MAX_RETRIES: 2,              // Ağ/sunucu hatasında ek deneme sayısı
  RETRY_BASE_DELAY_MS: 1200,   // Üstel geri çekilme (exponential backoff) taban gecikmesi
  DEMO_FALLBACK: true,         // n8n erişilemezse demo veriyle çalışmaya devam et

  // ---- Marka / metinler ----
  APP_NAME: "Sınav Pusulası",
  UNIVERSITY: "Manisa Celal Bayar Üniversitesi",
  UNIVERSITY_SHORT: "MCBÜ",

  // ---- Günlük (log) ayarları ----
  LOG_STORAGE_KEY: "sp_logs_v1",
  LOG_MAX_RECORDS: 200,        // localStorage'da tutulacak en fazla kayıt
};
