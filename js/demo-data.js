/* =============================================================================
 *  Sınav Pusulası — Demo / Failsafe veri kümesi (demo-data.js)
 * -----------------------------------------------------------------------------
 *  Bu veri, n8n webhook'una ulaşılamadığında VEYA webhook yapılandırılmadığında
 *  devreye giren "failsafe" içeriktir. Amaç: sistem her koşulda kullanıcıya
 *  anlamlı bir çıktı göstersin, asla boş ekranla karşılaşılmasın.
 *
 *  Not: Videolar, "ölü link" riskini ortadan kaldırmak için doğrudan video
 *  kimliği yerine YouTube arama sorgusu (searchQuery) ile tanımlanır.
 *  (Bkz. failsafe.html — "Doğrulanmış Arama Bağlantıları" başlığı.)
 * ========================================================================== */

(function () {
  "use strict";

  // Anahtar: ders adı/kodundan üretilen normalize edilmiş etiket
  const CURATED = {
    "bil101": {
      course: { code: "BIL101", name: "Bilgisayar Programlama I" },
      vize: [
        {
          title: "Algoritma ve Akış Şemaları",
          importance: "yüksek",
          description: "Problem çözme adımları, sözde kod (pseudocode) ve akış şeması mantığı.",
          videos: [
            { title: "Algoritma ve Akış Şeması Konu Anlatımı", searchQuery: "algoritma ve akış şeması konu anlatımı" },
            { title: "Sözde Kod (Pseudocode) Örnekleri", searchQuery: "pseudocode sözde kod örnekleri türkçe" },
          ],
        },
        {
          title: "Değişkenler ve Veri Tipleri",
          importance: "yüksek",
          description: "Tam sayı, ondalık, karakter, mantıksal veri tipleri ve bellek kavramı.",
          videos: [
            { title: "C / Programlamada Değişkenler ve Veri Tipleri", searchQuery: "programlama değişkenler ve veri tipleri konu anlatımı" },
          ],
        },
        {
          title: "Operatörler ve Koşul Yapıları",
          importance: "orta",
          description: "Aritmetik/mantıksal operatörler, if-else ve switch-case yapıları.",
          videos: [
            { title: "Koşul Yapıları if-else Anlatımı", searchQuery: "programlama if else koşul yapıları" },
          ],
        },
        {
          title: "Döngüler (for, while)",
          importance: "yüksek",
          description: "for, while, do-while döngüleri ve döngü kontrol deyimleri.",
          videos: [
            { title: "Döngüler for while Konu Anlatımı", searchQuery: "programlama döngüler for while konu anlatımı" },
          ],
        },
      ],
      final: [
        {
          title: "Fonksiyonlar ve Parametre Geçişi",
          importance: "yüksek",
          description: "Fonksiyon tanımı, dönüş değerleri, değer/referans ile parametre aktarımı.",
          videos: [
            { title: "Fonksiyonlar Konu Anlatımı", searchQuery: "programlama fonksiyonlar konu anlatımı türkçe" },
          ],
        },
        {
          title: "Diziler (Arrays)",
          importance: "yüksek",
          description: "Tek ve çok boyutlu diziler, dizilerde arama ve sıralama temelleri.",
          videos: [
            { title: "Diziler (Array) Anlatımı", searchQuery: "programlama diziler array konu anlatımı" },
          ],
        },
        {
          title: "Karakter Dizileri (String) İşlemleri",
          importance: "orta",
          description: "String tanımı, kopyalama, birleştirme ve temel string fonksiyonları.",
          videos: [
            { title: "String İşlemleri", searchQuery: "programlama string karakter dizisi işlemleri" },
          ],
        },
        {
          title: "İşaretçiler / Bellek Yönetimine Giriş",
          importance: "orta",
          description: "Pointer kavramı, adres ve değer ilişkisi, temel dinamik bellek.",
          videos: [
            { title: "İşaretçiler (Pointer) Giriş", searchQuery: "c programlama pointer işaretçiler konu anlatımı" },
          ],
        },
      ],
    },

    "mat101": {
      course: { code: "MAT101", name: "Matematik I (Kalkülüs)" },
      vize: [
        {
          title: "Limit ve Süreklilik",
          importance: "yüksek",
          description: "Limit kavramı, tek/çift taraflı limitler ve süreklilik koşulları.",
          videos: [{ title: "Limit ve Süreklilik", searchQuery: "limit ve süreklilik üniversite konu anlatımı" }],
        },
        {
          title: "Türev Kuralları",
          importance: "yüksek",
          description: "Çarpım, bölüm, zincir kuralı ve temel türev alma teknikleri.",
          videos: [{ title: "Türev Kuralları", searchQuery: "türev kuralları üniversite konu anlatımı" }],
        },
        {
          title: "Türevin Uygulamaları",
          importance: "orta",
          description: "Artma-azalma, ekstremum, grafik çizimi ve optimizasyon.",
          videos: [{ title: "Türev Uygulamaları", searchQuery: "türevin uygulamaları optimizasyon konu anlatımı" }],
        },
      ],
      final: [
        {
          title: "Belirsiz İntegral",
          importance: "yüksek",
          description: "Temel integral kuralları, değişken değiştirme yöntemi.",
          videos: [{ title: "Belirsiz İntegral", searchQuery: "belirsiz integral konu anlatımı üniversite" }],
        },
        {
          title: "Belirli İntegral ve Alan",
          importance: "yüksek",
          description: "Riemann toplamı, belirli integral ve eğri altındaki alan.",
          videos: [{ title: "Belirli İntegral", searchQuery: "belirli integral alan hesabı konu anlatımı" }],
        },
        {
          title: "İntegral Teknikleri",
          importance: "orta",
          description: "Kısmi integrasyon ve trigonometrik integraller.",
          videos: [{ title: "Kısmi İntegrasyon", searchQuery: "kısmi integrasyon konu anlatımı" }],
        },
      ],
    },

    "bil201": {
      course: { code: "BIL201", name: "Veri Yapıları" },
      vize: [
        {
          title: "Diziler ve Bağlı Listeler",
          importance: "yüksek",
          description: "Statik diziler ile tekli/çiftli bağlı listelerin karşılaştırması.",
          videos: [{ title: "Bağlı Listeler", searchQuery: "veri yapıları bağlı liste linked list konu anlatımı" }],
        },
        {
          title: "Yığın (Stack) ve Kuyruk (Queue)",
          importance: "yüksek",
          description: "LIFO/FIFO mantığı, temel işlemler ve kullanım alanları.",
          videos: [{ title: "Stack ve Queue", searchQuery: "veri yapıları stack queue konu anlatımı türkçe" }],
        },
      ],
      final: [
        {
          title: "Ağaçlar (Tree) ve İkili Arama Ağacı",
          importance: "yüksek",
          description: "Ağaç terminolojisi, BST ekleme/silme/arama.",
          videos: [{ title: "İkili Arama Ağacı", searchQuery: "ikili arama ağacı bst konu anlatımı" }],
        },
        {
          title: "Sıralama Algoritmaları",
          importance: "yüksek",
          description: "Kabarcık, seçmeli, hızlı (quick) ve birleştirme (merge) sıralama.",
          videos: [{ title: "Sıralama Algoritmaları", searchQuery: "sıralama algoritmaları konu anlatımı" }],
        },
        {
          title: "Hashing (Karma) Tabloları",
          importance: "orta",
          description: "Hash fonksiyonları ve çakışma çözümleme yöntemleri.",
          videos: [{ title: "Hash Tabloları", searchQuery: "hash tablosu veri yapıları konu anlatımı" }],
        },
      ],
    },
  };

  // Ders adı/kodunu basit bir anahtara indirger (örn. "BİL 101" -> "bil101")
  function normalizeKey(query) {
    return (query || "")
      .toLocaleLowerCase("tr-TR")
      .replace(/ı/g, "i")
      .replace(/[^a-z0-9]/g, "");
  }

  // Ders ADIYLA da curated içeriğe ulaşılsın (örnek "chip"ler kod değil ad kullanıyor)
  const ALIASES = {
    bilgisayarprogramlamai: "bil101",
    bilgisayarprogramlama: "bil101",
    matematik: "mat101",
    matematiki: "mat101",
    matematik1: "mat101",
    kalkulus: "mat101",
    veriyapilari: "bil201",
  };

  function resolveCuratedKey(query) {
    const key = normalizeKey(query);
    if (CURATED[key]) return key;          // doğrudan kod eşleşmesi (bil101)
    if (ALIASES[key]) return ALIASES[key]; // ad eşleşmesi (matematik i -> mat101)
    return null;
  }

  // Bilinmeyen ders için makul, genel bir konu taslağı üretir (failsafe).
  function genericPlan(query, examType) {
    const kapsam = examType === "final" ? "dönemin tamamı" : "ilk yarısı";
    const konular = examType === "final"
      ? ["Temel Kavramlar ve Tanımlar", "Ara Sınav Sonrası İşlenen Konular",
         "Uygulama ve Problem Çözme", "Bütünleşik Örnekler ve Tekrar"]
      : ["Dersin Giriş ve Temel Kavramları", "İlk Ünite: Tanımlar ve Yöntemler",
         "İkinci Ünite: Uygulamalar", "Ara Sınav Kapsamı Tekrarı"];

    return konular.map((baslik, i) => ({
      title: baslik,
      importance: i < 2 ? "yüksek" : "orta",
      description: `"${query}" dersinin ${kapsam} için tahmini konu başlığı (demo içeriği).`,
      videos: [
        { title: `${query} ${baslik}`, searchQuery: `${query} ${baslik} konu anlatımı` },
      ],
    }));
  }

  /**
   * Demo/failsafe yanıtı üretir. n8n yanıtıyla AYNI şemayı kullanır.
   * @param {string} courseQuery
   * @param {"vize"|"final"} examType
   * @returns {object} standart yanıt nesnesi
   */
  function buildDemoResponse(courseQuery, examType) {
    const curatedKey = resolveCuratedKey(courseQuery);
    const curated = curatedKey ? CURATED[curatedKey] : null;
    let course, topics, note;

    if (curated) {
      course = curated.course;
      topics = curated[examType] || curated.vize;
      note = "Demo içerik: bu ders için hazır örnek müfredat kullanıldı.";
    } else {
      course = { code: "", name: courseQuery };
      topics = genericPlan(courseQuery, examType);
      note = "Demo içerik: bu ders için n8n/Gemini erişimi yok; genel bir taslak üretildi.";
    }

    return {
      success: true,
      source: "demo",
      course,
      examType,
      topics,
      meta: {
        model: "demo-failsafe",
        generatedAt: new Date().toISOString(),
        note,
      },
    };
  }

  window.SP_DEMO = { buildDemoResponse, normalizeKey };
})();
