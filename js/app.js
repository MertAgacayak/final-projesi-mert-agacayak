/* =============================================================================
 *  Sınav Pusulası — Ana uygulama mantığı (app.js)
 *  Anasayfa: ders sorgusu + vize/final seçimi -> konular + YouTube videoları
 * ========================================================================== */

(function () {
  "use strict";

  const CFG = window.APP_CONFIG || {};
  const SP = window.SP;

  // --------------------------------------------------------------------- //
  //  Durum (state)                                                        //
  // --------------------------------------------------------------------- //
  let examType = "vize"; // varsayılan: vize açık

  // --------------------------------------------------------------------- //
  //  DOM referansları                                                     //
  // --------------------------------------------------------------------- //
  const form = document.getElementById("query-form");
  const courseInput = document.getElementById("course-input");
  const toggleVize = document.getElementById("toggle-vize");
  const toggleFinal = document.getElementById("toggle-final");
  const submitBtn = document.getElementById("submit-btn");
  const statusBox = document.getElementById("status-box");
  const resultsBox = document.getElementById("results");
  const modeBadge = document.getElementById("mode-badge");

  if (!form) return; // bu sayfa anasayfa değilse çık

  // --------------------------------------------------------------------- //
  //  Vize / Final toggle — biri açılınca diğeri kapanır                   //
  // --------------------------------------------------------------------- //
  function setExamType(type) {
    examType = type === "final" ? "final" : "vize";
    const vizeOn = examType === "vize";
    toggleVize.classList.toggle("is-on", vizeOn);
    toggleFinal.classList.toggle("is-on", !vizeOn);
    toggleVize.setAttribute("aria-pressed", String(vizeOn));
    toggleFinal.setAttribute("aria-pressed", String(!vizeOn));
  }
  toggleVize.addEventListener("click", () => setExamType("vize"));
  toggleFinal.addEventListener("click", () => setExamType("final"));
  setExamType("vize");

  // Mod rozeti: webhook yapılandırılmış mı?
  if (modeBadge) {
    const configured = !!(CFG.N8N_WEBHOOK_URL && CFG.N8N_WEBHOOK_URL.trim());
    modeBadge.textContent = configured ? "n8n bağlı" : "Demo modu";
    modeBadge.classList.add(configured ? "badge--live" : "badge--demo");
    modeBadge.title = configured
      ? "İstekler n8n webhook'una gönderilir."
      : "n8n webhook adresi tanımsız; sistem failsafe demo verisiyle çalışıyor.";
  }

  // --------------------------------------------------------------------- //
  //  Durum mesajları                                                      //
  // --------------------------------------------------------------------- //
  function showStatus(kind, html) {
    statusBox.className = "status status--" + kind;
    statusBox.innerHTML = html;
    statusBox.hidden = false;
  }
  function hideStatus() {
    statusBox.hidden = true;
  }

  // --------------------------------------------------------------------- //
  //  Yanıt şeması doğrulama (failsafe: bozuk yanıtı yakala)               //
  // --------------------------------------------------------------------- //
  function validateResponse(data) {
    if (!data || typeof data !== "object") {
      throw schemaError("Yanıt boş veya nesne değil.");
    }
    if (data.success === false) {
      // n8n'in ürettiği yapılandırılmış hata
      const err = data.error || {};
      const e = new Error(err.message || "n8n tarafında bilinmeyen hata.");
      e.code = err.code || "N8N_ERROR";
      e.stage = err.stage || "n8n";
      e.handled = true;
      throw e;
    }
    if (!Array.isArray(data.topics)) {
      throw schemaError("Yanıtta 'topics' dizisi yok.");
    }
    // Konuları normalize et (eksik alanları tamamla)
    data.topics = data.topics
      .filter((t) => t && (t.title || t.baslik))
      .map((t) => ({
        title: t.title || t.baslik || "Başlıksız konu",
        description: t.description || t.aciklama || "",
        importance: (t.importance || t.onem || "orta").toLowerCase(),
        videos: Array.isArray(t.videos)
          ? t.videos.map((v) => ({
              title: v.title || v.baslik || "Eğitim videosu",
              channel: v.channel || v.kanal || "",
              url: v.url || "",
              videoId: v.videoId || v.id || "",
              searchQuery: v.searchQuery || v.arama || (v.title || t.title || ""),
            }))
          : [],
      }));
    if (data.topics.length === 0) {
      throw schemaError("Yanıtta hiç konu bulunamadı.");
    }
    if (!data.course) data.course = { code: "", name: "" };
    return data;
  }

  function schemaError(msg) {
    const e = new Error(msg);
    e.code = "SCHEMA_INVALID";
    e.stage = "response_format";
    e.handled = true;
    return e;
  }

  // --------------------------------------------------------------------- //
  //  Tek bir n8n isteği (zaman aşımı korumalı)                           //
  // --------------------------------------------------------------------- //
  function fetchOnce(payload, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(CFG.N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const e = new Error(`Sunucu ${res.status} (${res.statusText}) döndürdü.`);
          e.code = res.status === 429 ? "RATE_LIMIT" : "HTTP_" + res.status;
          e.stage = "n8n_request";
          e.handled = true;
          // 4xx (429 hariç) tekrar denemeye değmez
          e.retryable = res.status >= 500 || res.status === 429;
          throw e;
        }
        return res.json();
      })
      .finally(() => clearTimeout(timer));
  }

  // --------------------------------------------------------------------- //
  //  Yeniden deneme + üstel geri çekilme (exponential backoff)            //
  // --------------------------------------------------------------------- //
  async function fetchWithRetry(payload) {
    let attempt = 0;
    let lastErr;
    const maxRetries = CFG.MAX_RETRIES ?? 2;

    while (attempt <= maxRetries) {
      try {
        const json = await fetchOnce(payload, CFG.REQUEST_TIMEOUT_MS || 30000);
        return { data: validateResponse(json), attempts: attempt + 1 };
      } catch (err) {
        lastErr = err;
        // AbortError → zaman aşımı
        if (err.name === "AbortError") {
          lastErr = Object.assign(new Error("İstek zaman aşımına uğradı."), {
            code: "TIMEOUT", stage: "n8n_request", handled: true, retryable: true,
          });
        }
        // Şema/işlenmiş n8n hatası tekrar denenmez (retryable değilse)
        const retryable = lastErr.retryable !== false &&
          lastErr.code !== "SCHEMA_INVALID" && lastErr.code !== "N8N_ERROR" &&
          !(lastErr.code && lastErr.code.startsWith("HTTP_4") && lastErr.code !== "HTTP_429");

        if (!retryable || attempt === maxRetries) break;

        const delay = (CFG.RETRY_BASE_DELAY_MS || 1200) * Math.pow(2, attempt);
        showStatus("loading",
          `<span class="spinner"></span> Bağlantı sorunu, yeniden deneniyor… (${attempt + 1}/${maxRetries})`);
        await new Promise((r) => setTimeout(r, delay));
        attempt++;
      }
    }
    lastErr.attempts = attempt + 1;
    throw lastErr;
  }

  // --------------------------------------------------------------------- //
  //  Sonuçları çiz                                                        //
  // --------------------------------------------------------------------- //
  function renderResults(data) {
    const esc = SP.escapeHtml;
    const c = data.course || {};
    const baslik = [c.code, c.name].filter(Boolean).join(" — ") || "Ders";
    const examLabel = data.examType === "final" ? "Final" : "Vize";

    const sourceTag = data.source === "demo"
      ? `<span class="tag tag--demo" title="${esc((data.meta && data.meta.note) || "")}">Demo / Failsafe içerik</span>`
      : `<span class="tag tag--live">Gemini · n8n</span>`;

    const importanceClass = (imp) =>
      imp === "yüksek" || imp === "yuksek" ? "imp--high"
      : imp === "düşük" || imp === "dusuk" ? "imp--low" : "imp--mid";

    const topicsHtml = data.topics.map((t, idx) => {
      const videos = (t.videos || []).map((v) => {
        const href = v.url || SP.youtubeSearchUrl(v.searchQuery || v.title);
        const isSearch = !v.url;
        const thumb = SP.youtubeThumb(v.videoId);
        const thumbHtml = thumb
          ? `<img class="video-thumb" src="${esc(thumb)}" alt="" loading="lazy">`
          : `<span class="video-thumb video-thumb--ph" aria-hidden="true">▶</span>`;
        return `
          <a class="video-card" href="${esc(href)}" target="_blank" rel="noopener noreferrer">
            ${thumbHtml}
            <span class="video-meta">
              <span class="video-title">${esc(v.title)}</span>
              ${v.channel ? `<span class="video-channel">${esc(v.channel)}</span>` : ""}
              <span class="video-link">${isSearch ? "YouTube'da ara ↗" : "İzle ↗"}</span>
            </span>
          </a>`;
      }).join("");

      return `
        <article class="topic-card">
          <header class="topic-head">
            <span class="topic-no">${idx + 1}</span>
            <h3 class="topic-title">${esc(t.title)}</h3>
            <span class="imp-badge ${importanceClass(t.importance)}">${esc(t.importance || "orta")}</span>
          </header>
          ${t.description ? `<p class="topic-desc">${esc(t.description)}</p>` : ""}
          <div class="video-grid">${videos || `<p class="muted small">Bu konu için video önerisi bulunamadı.</p>`}</div>
        </article>`;
    }).join("");

    resultsBox.innerHTML = `
      <div class="result-head">
        <div>
          <h2 class="result-title">${esc(baslik)}</h2>
          <div class="result-sub">${esc(examLabel)} sınavı · ${data.topics.length} konu ${sourceTag}</div>
        </div>
      </div>
      ${data.source === "demo" && data.meta && data.meta.note
        ? `<div class="note note--warn">⚠ ${esc(data.meta.note)}</div>` : ""}
      <div class="topics">${topicsHtml}</div>`;
    resultsBox.hidden = false;
    resultsBox.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // --------------------------------------------------------------------- //
  //  Form gönderimi                                                       //
  // --------------------------------------------------------------------- //
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const courseQuery = courseInput.value.trim();

    // Girdi doğrulama (failsafe: stage = input_validation)
    if (courseQuery.length < 2) {
      showStatus("error",
        `<strong>Geçersiz giriş.</strong> Lütfen ders adı veya kodunu girin (en az 2 karakter).
         <div class="err-meta">Hata kaynağı: <code>input_validation · INVALID_INPUT</code></div>`);
      SP.addLog({
        courseQuery, examType, status: "fail", source: "client",
        errorCode: "INVALID_INPUT", errorStage: "input_validation",
        errorMessage: "Ders adı/kodu çok kısa veya boş.",
      });
      courseInput.focus();
      return;
    }

    resultsBox.hidden = true;
    submitBtn.disabled = true;
    submitBtn.classList.add("is-loading");
    const started = Date.now();
    const configured = !!(CFG.N8N_WEBHOOK_URL && CFG.N8N_WEBHOOK_URL.trim());

    const payload = {
      requestId: SP.uid(),
      courseQuery,
      examType,
      university: CFG.UNIVERSITY,
      timestamp: new Date().toISOString(),
    };

    try {
      let result;

      if (configured) {
        showStatus("loading", `<span class="spinner"></span> Müfredat inceleniyor ve konular hazırlanıyor…`);
        result = await fetchWithRetry(payload);
        result.data.source = result.data.source || "n8n";
      } else {
        // Webhook yok → doğrudan failsafe demo
        if (!CFG.DEMO_FALLBACK) throw Object.assign(new Error("n8n webhook tanımsız."), {
          code: "NO_WEBHOOK", stage: "config", handled: true,
        });
        showStatus("loading", `<span class="spinner"></span> Demo içerik hazırlanıyor…`);
        await new Promise((r) => setTimeout(r, 350)); // ufak doğal gecikme
        result = { data: window.SP_DEMO.buildDemoResponse(courseQuery, examType), attempts: 1 };
      }

      hideStatus();
      renderResults(result.data);
      SP.addLog({
        courseQuery, examType, status: "success",
        source: result.data.source || (configured ? "n8n" : "demo"),
        durationMs: Date.now() - started,
        attempts: result.attempts,
        topicCount: result.data.topics.length,
      });

    } catch (err) {
      // ----- Hata yolu: önce demo'ya düşmeyi dene (failsafe) -----
      const canFallback = configured && CFG.DEMO_FALLBACK;
      if (canFallback) {
        const demo = window.SP_DEMO.buildDemoResponse(courseQuery, examType);
        renderResults(demo);
        showStatus("warn",
          `<strong>n8n'e ulaşılamadı, failsafe devrede.</strong>
           Aşağıdaki içerik yerel demo verisinden üretildi.
           <div class="err-meta">Hata kaynağı:
             <code>${SP.escapeHtml(err.stage || "n8n")} · ${SP.escapeHtml(err.code || "UNKNOWN")}</code></div>`);
        SP.addLog({
          courseQuery, examType, status: "fail", source: "n8n",
          durationMs: Date.now() - started, attempts: err.attempts || 1,
          errorCode: err.code || "UNKNOWN", errorStage: err.stage || "n8n",
          errorMessage: err.message,
        });
      } else {
        // Demo da kapalıysa net hata göster
        showStatus("error",
          `<strong>İşlem başarısız.</strong> ${SP.escapeHtml(err.message)}
           <div class="err-meta">Hata kaynağı:
             <code>${SP.escapeHtml(err.stage || "bilinmiyor")} · ${SP.escapeHtml(err.code || "UNKNOWN")}</code></div>`);
        SP.addLog({
          courseQuery, examType, status: "fail", source: configured ? "n8n" : "config",
          durationMs: Date.now() - started, attempts: err.attempts || 1,
          errorCode: err.code || "UNKNOWN", errorStage: err.stage || "n8n",
          errorMessage: err.message,
        });
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove("is-loading");
    }
  });
})();
