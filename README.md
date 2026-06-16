# Sınav Pusulası · MCBÜ Sınava Hazırlık Yönlendirme Sistemi

Manisa Celal Bayar Üniversitesi öğrencileri için: ders adı/kodu ve **vize / final**
seçimine göre sınavda çıkması beklenen konuları listeleyen ve her konu için **YouTube**
üzerinden eğitim videoları öneren statik web uygulaması.

Mimari: **Statik ön yüz (bu site) → n8n webhook → Gemini API**.
Gemini anahtarı yalnızca n8n tarafında (sunucu) tutulur; tarayıcıya hiç inmez.

---

## Sayfalar

| Sayfa | Dosya | İçerik |
|-------|-------|--------|
| **Anasayfa (uygulama)** | `index.html` | Ders sorgusu + vize/final toggle + konu ve video sonuçları |
| **Loglar** | `loglar.html` | Her kullanımın başarılı/başarısız çıktısı; hatada **kaynak** net görünür |
| **Failsafe** | `failsafe.html` | Sistemin hatalarla nasıl başa çıktığı, fallback katmanları ve hata kodları |

---

## Dosya yapısı

```
.
├── index.html            # Anasayfa / uygulama
├── loglar.html           # Loglar
├── failsafe.html         # Hata yönetimi dokümantasyonu
├── css/style.css
├── js/
│   ├── config.js         # >>> N8N_WEBHOOK_URL buraya <<<
│   ├── common.js         # navigasyon + log sistemi (localStorage)
│   ├── demo-data.js      # failsafe demo veri kümesi
│   ├── app.js            # ana uygulama mantığı (retry/timeout/fallback)
│   └── logs.js           # loglar sayfası
└── n8n/workflow.json     # n8n'e içe aktarılabilir iş akışı (Gemini)
```

---

## Kurulum

### 1) n8n iş akışını içe aktar
1. n8n arayüzünde **Import from File** ile `n8n/workflow.json` dosyasını içe aktar.
2. **"Gemini'ye Sor"** (HTTP Request) düğümünü aç; URL’deki
   `GEMINI_API_KEY_BURAYA` ifadesini **kendi Gemini API anahtarınla** değiştir
   (anahtar hardcoded olarak n8n config’inde kalır, tarayıcıya gitmez).
3. İş akışını **Active** yap ve **Production webhook URL**’ini kopyala
   (örn. `https://<n8n-host>/webhook/sinav-pusulasi`).

> İstersen anahtarı URL’ye gömmek yerine bir n8n *credential* olarak da
> tanımlayabilirsin; sözleşme (request/response JSON) değişmez.

### 2) Webhook adresini ön yüze gir
`js/config.js` dosyasında:

```js
N8N_WEBHOOK_URL: "https://<n8n-host>/webhook/sinav-pusulasi",
```

> Boş bırakırsan site otomatik olarak **demo (failsafe)** modunda çalışır —
> n8n olmadan da arayüz tamamen denenebilir.

### 3) Çalıştır
Statik site; derleme (build) gerektirmez. Yerelde test için:

```bash
python3 -m http.server 8080
# tarayıcı: http://localhost:8080
```

GitHub Pages, Netlify, Vercel ya da herhangi bir statik barındırmada doğrudan yayınlanır.

---

## Veri sözleşmesi (özet)

**İstek** (ön yüz → n8n): `POST` → `{ requestId, courseQuery, examType, university, timestamp }`

**Başarılı yanıt**: `{ success: true, course, examType, topics[], meta }`
Her `topic`: `{ title, description, importance, videos[] }`,
her `video`: `{ title, channel?, searchQuery, url? }`.

**Hatalı yanıt**: `{ success: false, error: { code, stage, message } }`

Tam şema ve hata kodları için **Failsafe** sayfasına bakın.

---

## Dayanıklılık (failsafe) özeti

- **Girdi doğrulama** → boş/kısa sorgu hiç gönderilmez.
- **Zaman aşımı** (30 sn) + **üstel geri çekilmeli yeniden deneme** (max 2).
- **Şema doğrulama** → bozuk JSON yakalanır, eksik alanlar tamamlanır.
- **Demo fallback** → n8n erişilemezse yerel demo içerikle yanıt verilir.
- **Video failsafe** → ölü link riskine karşı YouTube **arama** bağlantısı kullanılır.
- **Günlükleme** → her sonuç (başarı/hata + kaynak) Loglar sayfasına yazılır.

---

## Git: commit & push

Bu depo derleme adımı içermez; commit yapıldıktan sonra **lokal terminalden** kendi
GitHub PAT’in ile push edebilirsin:

```bash
git remote add origin https://github.com/<kullanıcı>/<repo>.git
git push -u origin main
# kullanıcı adı: GitHub kullanıcın
# parola: GitHub Personal Access Token (PAT)
```

> Not: PAT bu projede hiçbir dosyaya yazılmaz; yalnızca push sırasında terminalde kullanılır.

---

## Notlar

- Gemini, gerçek YouTube video kimliği yerine **arama sorgusu** üretir → kullanıcı her
  zaman geçerli bir arama sonucuna yönlenir (404 olmaz).
- Loglar tarayıcıda `localStorage`’da tutulur (cihaza özel). Kalıcı/sunucu tarafı
  günlükleme isteniyorsa n8n akışına bir veritabanı düğümü eklenebilir.
