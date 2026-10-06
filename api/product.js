import fs from "node:fs";
import puppeteer from "puppeteer-core";

const RATES = { USD: 64, CNY: 9, EUR: 74, MZN: 1 };
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function productIdFrom(raw) {
  try {
    const u = new URL(String(raw));
    if (!/^([a-z0-9-]+\.)*aliexpress\.[a-z.]+$/i.test(u.hostname)) return null;
    const m = u.pathname.match(/\/(?:item|i)\/(?:[^/]*-)?(\d+)(?:\.html)?/);
    if (!m) return null;
    return m[1];
  } catch {
    return null;
  }
}

function cleanTitle(t) {
  return String(t || "")
    .replace(/\s+/g, " ")
    .replace(/\s*[|–-]\s*AliExpress.*$/i, "")
    .replace(/\s*on AliExpress.*$/i, "")
    .trim()
    .slice(0, 150);
}

async function seoName(id) {
  const u = "https://www.aliexpress.com/aeglodetailweb/api/seo/seodata?productId=" + id + "&channel=detail&device=pc";
  const r = await fetch(u, {
    headers: { "User-Agent": UA, Referer: "https://www.aliexpress.com/" },
    signal: AbortSignal.timeout(7000)
  });
  if (!r.ok) return "";
  const j = await r.json();
  return cleanTitle(j?.body?.title) || cleanTitle(j?.body?.description);
}

async function launch() {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const chromium = (await import("@sparticuz/chromium")).default;
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport ?? { width: 1366, height: 900 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless ?? true
    });
  }
  const candidates = [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  ];
  const exe = candidates.find(p => { try { return fs.existsSync(p); } catch { return false; } });
  if (!exe) throw new Error("sem navegador disponível");
  return puppeteer.launch({
    executablePath: exe,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--lang=pt-MZ"]
  });
}

function parseMoney(s) {
  if (!s) return null;
  const currency = /CN¥|CNY|¥/.test(s) ? "CNY" : /€|EUR/.test(s) ? "EUR" : "USD";
  const m = String(s).replace(/\u00a0/g, " ").match(/(\d+(?:[.,]\d{1,2})?)/);
  if (!m) return null;
  const t = m[1].includes(",") && !m[1].includes(".") ? m[1].replace(",", ".") : m[1].replace(/,/g, "");
  const v = parseFloat(t);
  if (!(v > 0) || v > 1e7) return null;
  return { value: v, currency };
}

function parsePdp(text) {
  try {
    const s = String(text).trim();
    const json = JSON.parse(s.startsWith("{") ? s : s.slice(s.indexOf("(") + 1, s.lastIndexOf(")")));
    const res = json?.data?.result;
    if (!res) return null;
    let priceStr = "";
    if (res.PRICE) {
      const t = res.PRICE.targetSkuPriceInfo || {};
      priceStr = t.salePriceString || String(t.salePriceLocal || "").split("|")[0] || "";
      if (!priceStr) {
        const first = Object.values(res.PRICE.skuPriceInfoMap || {})[0];
        if (first) priceStr = first.salePriceString || String(first.salePriceLocal || "").split("|")[0] || "";
      }
    }
    const PRICE_KEYS = ["salePriceString", "formatedActivityPrice", "formatedPrice", "displayMinPrice", "displaySalePrice"];
    let subject = "";
    const walk = (o, d) => {
      if ((subject && priceStr) || !o || typeof o !== "object" || d > 14) return;
      for (const k of Object.keys(o)) {
        if (!subject && /^(subject|productSubject)$/i.test(k) && typeof o[k] === "string" && o[k].length > 4) subject = o[k];
        else if (!priceStr && PRICE_KEYS.includes(k) && typeof o[k] === "string" && /\d/.test(o[k])) priceStr = o[k];
        if (o[k] && typeof o[k] === "object") walk(o[k], d + 1);
      }
    };
    walk(res, 0);
    return priceStr ? { priceStr, subject } : null;
  } catch {
    return null;
  }
}

async function render(url) {
  const browser = await launch();
  try {
    const page = await browser.newPage();
    await page.setUserAgent(UA);
    await page.setExtraHTTPHeaders({ "Accept-Language": "pt-MZ,pt;q=0.9,en;q=0.8" });
    await page.setViewport({ width: 1366, height: 900 });

    let pdpText = null;
    let pdpDone = false;
    page.on("response", r => {
      if (pdpDone) return;
      if (!/mtop\.aliexpress\.pdp\.pc\.query/.test(r.url())) return;
      r.text().then(t => {
        if (!t || !/SUCCESS/.test(t)) return;
        pdpDone = true;
        if (/salePrice/.test(t)) pdpText = t;
      }).catch(() => {});
    });

    const t0 = Date.now();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 }).catch(() => {});
    const deadline = t0 + 44000;
    while (!pdpText && !pdpDone && Date.now() < deadline) await new Promise(r => setTimeout(r, 500));

    if (pdpText) {
      const pdp = parsePdp(pdpText);
      if (pdp) return { priceText: pdp.priceStr, title: cleanTitle(pdp.subject), captcha: false, source: "pdp" };
    }

    const domWait = Math.max(0, Math.min(5000, t0 + 50000 - Date.now()));
    if (domWait) {
      await page
        .waitForFunction(() => {
          const el = document.querySelector('[class*="price-default--current"],[class*="price--current"]');
          return !!(el && /\d/.test(el.textContent));
        }, { timeout: domWait })
        .catch(() => {});
    }
    const out = await page.evaluate(() => {
      const clean = s => (s || "").replace(/\s+/g, " ").trim();
      let priceText = "";
      for (const sel of ['[class*="price-default--current"]', '[class*="product-price--current"]', '[class*="price--current"]']) {
        const el = document.querySelector(sel);
        if (el && /\d/.test(el.textContent)) { priceText = clean(el.textContent); break; }
      }
      const bodyText = clean(document.body.innerText).slice(0, 5000);
      const captcha = /drag the slider|verify to ensure|captcha verification/i.test(bodyText);
      const notFound = /P[áa]gina n[ãa]o encontrada|page not found|does not exist/i.test(bodyText);
      return { priceText, title: clean(document.title), captcha, notFound, source: "dom" };
    });
    if (out.notFound) {
      throw Object.assign(new Error("Este produto não existe ou foi removido no AliExpress."), { code: "notfound" });
    }
    return out;
  } finally {
    await browser.close().catch(() => {});
  }
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "GET") { res.status(405).json({ ok: false, error: "Método não permitido." }); return; }

  const raw = (req.query && req.query.url) || "";
  const productId = productIdFrom(raw);
  if (!productId) {
    res.status(400).json({ ok: false, error: "Link inválido — cole um link do AliExpress." });
    return;
  }

  const nameP = productId ? seoName(productId) : Promise.resolve("");
  try {
    const out = await render(raw);
    const title = cleanTitle(out.title) || (await nameP);
    const money = parseMoney(out.priceText);
    if (!money) {
      res.status(200).json({
        ok: false,
        needPrice: true,
        title,
        error: out.captcha ? "bloqueio" : "preço não encontrado"
      });
      return;
    }
    const rate = RATES[money.currency] || 1;
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    res.status(200).json({
      ok: true,
      price: money.value,
      currency: money.currency,
      rate,
      mt: Math.round(money.value * rate),
      title
    });
  } catch (e) {
    if (e.code === "notfound") {
      res.status(404).json({ ok: false, error: e.message });
      return;
    }
    const title = await nameP;
    if (title) {
      res.status(200).json({ ok: false, needPrice: true, title, error: String(e.message || e).slice(0, 120) });
    } else {
      res.status(502).json({ ok: false, error: "Não foi possível ler o produto. Escreva o preço manualmente." });
    }
  }
}
