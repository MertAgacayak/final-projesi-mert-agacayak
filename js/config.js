/* =============================================================================
 *  Sınav Pusulası — Yapılandırma (config)
 *  Manisa Celal Bayar Üniversitesi · Sınava Hazırlık Yönlendirme Sistemi
 * -----------------------------------------------------------------------------
 *  Bu dosya, ön yüzün (frontend) tek yapılandırma noktasıdır.
 *  n8n webhook adresinizi aşağıdaki N8N_WEBHOOK_URL alanına yazın.
 *
 *  GÜVENLİK NOTU:
 *  OpenAI API anahtarı ASLA bu dosyaya / tarayıcıya yazılmaz.
 *  Anahtar yalnızca n8n yapılandırmasında (sunucu tarafı, OpenAI credential) tutulur.
 *  Ön yüz sadece n8n webhook'una istek atar; OpenAI modeliyle konuşan n8n'dir.
 * ========================================================================== */

window.APP_CONFIG = {
  // ---- n8n bağlantısı ----
  // n8n webhook adresi (production). Boş bırakılırsa sistem DEMO (failsafe) moduna düşer.
  N8N_WEBHOOK_URL: "https://mertagacayak06.app.n8n.cloud/webhook/sinav-pusulasi",

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
