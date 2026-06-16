/* =============================================================================
 *  Sınav Pusulası — Loglar sayfası (logs.js)
 *  Kullanım sonucu oluşan başarılı / başarısız çıktıların listesi.
 * ========================================================================== */

(function () {
  "use strict";
  const SP = window.SP;
  const listEl = document.getElementById("log-list");
  if (!listEl) return; // bu sayfa loglar değilse çık

  const filterBtns = document.querySelectorAll("[data-filter]");
  const clearBtn = document.getElementById("clear-logs");
  const statSuccess = document.getElementById("stat-success");
  const statFail = document.getElementById("stat-fail");
  const statTotal = document.getElementById("stat-total");

  let activeFilter = "all";

  function render() {
    const logs = SP.getLogs();
    const total = logs.length;
    const ok = logs.filter((l) => l.status === "success").length;
    const fail = total - ok;

    statTotal.textContent = total;
    statSuccess.textContent = ok;
    statFail.textContent = fail;

    const shown = logs.filter((l) =>
      activeFilter === "all" ? true : l.status === activeFilter);

    if (shown.length === 0) {
      listEl.innerHTML = `<div class="empty">
        <div class="empty-icon">📋</div>
        <p>${total === 0
          ? "Henüz kayıt yok. Anasayfada bir ders sorgulayın; sonuç burada görünecek."
          : "Bu filtreye uygun kayıt yok."}</p>
      </div>`;
      return;
    }

    listEl.innerHTML = shown.map(rowHtml).join("");

    // Detay aç/kapa
    listEl.querySelectorAll(".log-row").forEach((row) => {
      row.addEventListener("click", () => row.classList.toggle("is-open"));
    });
  }

  function rowHtml(l) {
    const esc = SP.escapeHtml;
    const ok = l.status === "success";
    const examLabel = l.examType === "final" ? "Final" : l.examType === "vize" ? "Vize" : "—";
    const sourceLabel = ({
      n8n: "n8n / Gemini", demo: "Demo (failsafe)", client: "İstemci", config: "Yapılandırma",
    })[l.source] || l.source || "—";

    const detail = ok
      ? `<div class="log-detail">
           <div><span class="k">Kaynak</span><span class="v">${esc(sourceLabel)}</span></div>
           <div><span class="k">Konu sayısı</span><span class="v">${l.topicCount ?? "—"}</span></div>
           <div><span class="k">Süre</span><span class="v">${l.durationMs != null ? l.durationMs + " ms" : "—"}</span></div>
           <div><span class="k">Deneme</span><span class="v">${l.attempts ?? 1}</span></div>
         </div>`
      : `<div class="log-detail log-detail--err">
           <div><span class="k">Hata kodu</span><span class="v"><code>${esc(l.errorCode || "UNKNOWN")}</code></span></div>
           <div><span class="k">Hata kaynağı (stage)</span><span class="v"><code>${esc(l.errorStage || "—")}</code></span></div>
           <div class="wide"><span class="k">Açıklama</span><span class="v">${esc(l.errorMessage || "—")}</span></div>
           <div><span class="k">Kaynak</span><span class="v">${esc(sourceLabel)}</span></div>
           <div><span class="k">Deneme</span><span class="v">${l.attempts ?? 1}</span></div>
           <div><span class="k">Süre</span><span class="v">${l.durationMs != null ? l.durationMs + " ms" : "—"}</span></div>
         </div>`;

    return `
      <div class="log-row ${ok ? "is-success" : "is-fail"}">
        <div class="log-summary">
          <span class="log-status">${ok ? "✓ Başarılı" : "✕ Başarısız"}</span>
          <span class="log-course">${esc(l.courseQuery || "—")}</span>
          <span class="log-exam">${examLabel}</span>
          ${ok ? "" : `<span class="log-errcode">${esc(l.errorCode || "")}</span>`}
          <span class="log-time">${esc(SP.formatDate(l.timestamp))}</span>
          <span class="log-caret">▾</span>
        </div>
        ${detail}
      </div>`;
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      activeFilter = btn.getAttribute("data-filter");
      render();
    });
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Tüm günlük kayıtları silinsin mi? Bu işlem geri alınamaz.")) {
        SP.clearLogs();
        render();
      }
    });
  }

  render();
})();
