/* =============================================================================
 *  Sınav Pusulası — Ortak yardımcılar (common.js)
 *  Tüm sayfalarda paylaşılan: navigasyon, günlük (log) sistemi, küçük yardımcılar
 * ========================================================================== */

(function () {
  "use strict";

  const CFG = window.APP_CONFIG || {};

  /* --------------------------------------------------------------------- */
  /*  Küçük yardımcılar                                                     */
  /* --------------------------------------------------------------------- */

  // Basit, çakışma ihtimali çok düşük kimlik üreteci (uuid benzeri)
  function uid() {
    const r = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).slice(1);
    return `${r()}${r()}-${r()}-${r()}-${r()}-${r()}${r()}${r()}`;
  }

  // XSS'e karşı metin kaçışı
  function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  // Tarihi Türkçe okunur biçime çevir
  function formatDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString("tr-TR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      });
    } catch (e) {
      return iso || "";
    }
  }

  // YouTube arama bağlantısı (her zaman çalışan, "ölü link" üretmeyen failsafe)
  function youtubeSearchUrl(query) {
    return "https://www.youtube.com/results?search_query=" + encodeURIComponent(query || "");
  }

  // YouTube küçük resim (thumbnail) — videoId verilmişse
  function youtubeThumb(videoId) {
    return videoId ? `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg` : null;
  }

  /* --------------------------------------------------------------------- */
  /*  Günlük (log) sistemi — localStorage tabanlı                          */
  /* --------------------------------------------------------------------- */

  const LOG_KEY = CFG.LOG_STORAGE_KEY || "sp_logs_v1";
  const LOG_MAX = CFG.LOG_MAX_RECORDS || 200;

  function getLogs() {
    try {
      const raw = localStorage.getItem(LOG_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      // Bozuk veri → güvenli biçimde boş listeye dön (failsafe)
      console.warn("Günlükler okunamadı, sıfırlanıyor:", e);
      return [];
    }
  }

  function saveLogs(list) {
    try {
      localStorage.setItem(LOG_KEY, JSON.stringify(list.slice(0, LOG_MAX)));
    } catch (e) {
      console.warn("Günlük kaydedilemedi:", e);
    }
  }

  /**
   * Bir kullanım sonucunu günlüğe yazar.
   * @param {object} entry { courseQuery, examType, status, source, durationMs,
   *                         topicCount, errorCode, errorStage, errorMessage, attempts }
   * @returns {object} eklenen kayıt
   */
  function addLog(entry) {
    const record = {
      id: uid(),
      timestamp: new Date().toISOString(),
      courseQuery: entry.courseQuery || "",
      examType: entry.examType || "",
      status: entry.status === "success" ? "success" : "fail",
      source: entry.source || "n8n",        // "n8n" | "demo"
      durationMs: entry.durationMs ?? null,
      attempts: entry.attempts ?? 1,
      topicCount: entry.topicCount ?? null,
      errorCode: entry.errorCode || null,
      errorStage: entry.errorStage || null,
      errorMessage: entry.errorMessage || null,
    };
    const list = getLogs();
    list.unshift(record);
    saveLogs(list);
    return record;
  }

  function clearLogs() {
    saveLogs([]);
  }

  /* --------------------------------------------------------------------- */
  /*  Navigasyon — aktif bağlantıyı işaretle + mobil menü                  */
  /* --------------------------------------------------------------------- */

  function initNav() {
    const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll("[data-nav]").forEach((el) => {
      const target = el.getAttribute("data-nav").toLowerCase();
      const isHome = (target === "index.html") && (path === "" || path === "index.html");
      if (target === path || isHome) {
        el.classList.add("is-active");
        el.setAttribute("aria-current", "page");
      }
    });

    const toggle = document.querySelector("[data-nav-toggle]");
    const menu = document.querySelector("[data-nav-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", () => {
        const open = menu.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(open));
      });
    }
  }

  /* --------------------------------------------------------------------- */
  /*  Dışa aktarılan API                                                   */
  /* --------------------------------------------------------------------- */

  window.SP = {
    uid,
    escapeHtml,
    formatDate,
    youtubeSearchUrl,
    youtubeThumb,
    getLogs,
    addLog,
    clearLogs,
    initNav,
    config: CFG,
  };

  document.addEventListener("DOMContentLoaded", initNav);
})();
