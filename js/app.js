// ============================================================
//  PDF 뷰어 본체
//  - 이 파일은 사이트 루트의 js/ 폴더에 1개만 둡니다.
//  - 어느 깊이의 index.html에서 부르든, 부트스트랩이 찾아준
//    window.SITE_BASE(루트까지의 상대경로)를 기준으로 동작합니다.
// ============================================================
import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs";
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";

const base = window.SITE_BASE || ""; // 예: "" (루트) 또는 "../../" (서브패스)
const cfg = window.PDF_CONFIG || {};
const files = Array.isArray(cfg.files) ? cfg.files : [];

const viewer = document.getElementById("viewer");
const messageEl = document.getElementById("message");
const docTitleEl = document.getElementById("docTitle");
const picker = document.getElementById("picker");
const downloadBtn = document.getElementById("downloadBtn");
const statusEl = document.getElementById("status");

let current = null; // { file, title, src }

function setStatus(msg) {
  if (!msg) { statusEl.classList.remove("show"); return; }
  statusEl.textContent = msg;
  statusEl.classList.add("show");
}
function showMessage(icon, title, html) {
  viewer.classList.add("hidden");
  messageEl.classList.remove("hidden");
  messageEl.innerHTML =
    `<div class="big-icon">${icon}</div><h2>${title}</h2>` +
    (html ? `<p>${html}</p>` : "");
}
function getScale() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  return dpr * 1.5;
}
function srcFor(file) {
  return base + "pdf/" + encodeURIComponent(file);
}

async function renderPdf(item) {
  current = { ...item, src: srcFor(item.file) };
  docTitleEl.textContent = item.title || item.file;
  downloadBtn.disabled = false;
  showMessage("⏳", "불러오는 중…", "");
  setStatus("불러오는 중…");

  try {
    const pdf = await pdfjsLib.getDocument(current.src).promise;
    viewer.innerHTML = "";
    messageEl.classList.add("hidden");
    viewer.classList.remove("hidden");

    const scale = getScale();
    for (let i = 1; i <= pdf.numPages; i++) {
      setStatus(`렌더링 중… ${i} / ${pdf.numPages}`);
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });

      const wrap = document.createElement("div");
      wrap.className = "page-wrap";
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      const badge = document.createElement("div");
      badge.className = "page-num";
      badge.textContent = `${i} / ${pdf.numPages}`;

      wrap.appendChild(canvas);
      wrap.appendChild(badge);
      viewer.appendChild(wrap);
      await page.render({ canvasContext: ctx, viewport }).promise;
    }
    setStatus("");
    window.scrollTo({ top: 0 });
  } catch (err) {
    console.error(err);
    setStatus("");
    showMessage("⚠️", "PDF를 불러오지 못했어요",
      `<code>pdf/${item.file}</code> 파일이 사이트 루트에 올라가 있는지 확인해 주세요.`);
  }
}

// 원본 PDF 그대로 다운로드
downloadBtn.addEventListener("click", async () => {
  if (!current) return;
  try {
    const res = await fetch(current.src);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = current.file || "document.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    window.open(current.src, "_blank");
  }
});

// ---- 초기화 ----
if (files.length === 0) {
  showMessage("📂", "표시할 PDF가 없어요",
    "index.html 상단 <code>PDF_CONFIG.files</code> 에 PDF를 등록해 주세요.");
} else {
  if (files.length > 1) {
    picker.classList.remove("hidden");
    files.forEach((f, i) => {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = f.title || f.file;
      picker.appendChild(opt);
    });
    picker.addEventListener("change", () => renderPdf(files[+picker.value]));
  }
  renderPdf(files[0]);
}
