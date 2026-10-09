/* ================================================================
   CONFIGURAÇÃO — SUBSTITUA AQUI pelos contactos reais do serviço
================================================================ */
const CONFIG = {
  phoneDisplay: "+258 84 585 2210",
  phoneTel:     "+258845852210",
  whatsapp:     "258845852210",
  email:        "encomendas@globalmz.co.mz"
};

/* ---------- ligações de contacto ---------- */
const waURL = (msg) => "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(msg);
document.querySelectorAll("[data-tel]").forEach(a => {
  a.href = "tel:" + CONFIG.phoneTel;
  a.setAttribute("aria-label", "Ligar para " + CONFIG.phoneDisplay);
});
document.querySelectorAll("[data-tel-text]").forEach(el => el.textContent = CONFIG.phoneDisplay);
document.querySelectorAll("[data-mail]").forEach(a => { a.href = "mailto:" + CONFIG.email; });
document.querySelectorAll("[data-mail-text]").forEach(el => el.textContent = CONFIG.email);
document.querySelectorAll("[data-wa]").forEach(a => {
  a.href = waURL(a.dataset.msg || "Olá! Quero fazer uma encomenda internacional.");
  a.target = "_blank"; a.rel = "noopener noreferrer"; a.referrerPolicy = "strict-origin-when-cross-origin";
});

/* ---------- header + menu ---------- */
const head = document.getElementById("siteHead");
addEventListener("scroll", () => head.classList.toggle("scrolled", scrollY > 10), {passive:true});

const burger = document.getElementById("burger"), mMenu = document.getElementById("mMenu");
function setMenu(open){
  burger.setAttribute("aria-expanded", open);
  mMenu.classList.toggle("open", open);
  document.body.style.overflow = open ? "hidden" : "";
}
burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
mMenu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));

/* ---------- efeito SLIDE ao rolar ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); }
}), {threshold:.12, rootMargin:"0px 0px -6% 0px"});
document.querySelectorAll(".sl,.sr").forEach(el => io.observe(el));

/* ---------- scroll-spy ---------- */
const spyLinks = document.querySelectorAll("[data-spy]");
const spyIO = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting){
    spyLinks.forEach(l => l.classList.toggle("active", l.dataset.spy === e.target.id));
  }
}), {rootMargin:"-40% 0px -55% 0px"});
spyLinks.forEach(l => { const s = document.getElementById(l.dataset.spy); if (s) spyIO.observe(s); });

/* ---------- progresso da rota nos 4 passos ---------- */
const stepsWrap = document.getElementById("stepsWrap");
const routeFill = document.getElementById("routeFill");
const routeMarker = document.getElementById("routeMarker");
const steps = stepsWrap.querySelectorAll(".step");
function updateRoute(){
  const r = stepsWrap.getBoundingClientRect();
  const span = innerHeight * .5;
  const passed = Math.min(1, Math.max(0, (innerHeight * .8 - r.top) / span));
  routeFill.style.width = (passed * 100) + "%";
  routeMarker.style.left = (passed * 100) + "%";
  const markerX = r.left + passed * r.width;
  steps.forEach(s => {
    const sr = s.getBoundingClientRect();
    s.classList.toggle("on", sr.left + sr.width / 2 <= markerX + 12);
  });
}
addEventListener("scroll", () => requestAnimationFrame(updateRoute), {passive:true});
addEventListener("resize", updateRoute);
document.querySelector(".steps-scroll").addEventListener("scroll", () => requestAnimationFrame(updateRoute), {passive:true});
updateRoute();

/* ---------- split China/EUA: toque no mobile ---------- */
const sides = document.querySelectorAll(".side");
sides.forEach(s => s.addEventListener("click", () => {
  if (innerWidth > 820) return;
  sides.forEach(o => o.style.flex = "");
  s.style.flex = "1.35";
}));

/* ---------- FAQ ---------- */
document.querySelectorAll(".faq-q").forEach(q => {
  q.addEventListener("click", () => {
    const item = q.parentElement;
    const wasOpen = item.classList.contains("open");
    document.querySelectorAll(".faq.open").forEach(f => {
      f.classList.remove("open");
      f.querySelector(".faq-q").setAttribute("aria-expanded", "false");
    });
    if (!wasOpen){ item.classList.add("open"); q.setAttribute("aria-expanded", "true"); }
  });
});

/* ---------- modal ---------- */
const DOCS = {
  protecao: { title: "Condições de proteção da encomenda", body: `
    <h4>O que está coberto</h4>
    <ul><li>Perda da encomenda confirmada pela transportadora ou pelo fornecedor, dentro do prazo acordado na confirmação.</li>
    <li>Produto errado ou não conforme, desde que sinalizado nas primeiras 48 horas após a entrega.</li></ul>
    <h4>O que fazemos</h4>
    <p>Após análise confirmada, o cliente pode optar entre a recuperação do valor pago (produto + serviços, conforme acordo) ou a repetição da encomenda, quando possível.</p>
    <h4>Prazos</h4>
    <p>Análise do caso em até 30 dias, conforme a rota e a transportadora envolvida. O cliente é mantido informado durante todo o processo.</p>
    <h4>Como acionar</h4>
    <p>Contacte-nos pelo WhatsApp ou telefone com o número da encomenda e os comprovativos. Todo o processo fica registado por escrito.</p>
    <h4>Exclusões</h4>
    <ul><li>Dados de entrega incorretos fornecidos pelo cliente.</li>
    <li>Produtos restritos ou proibidos não declarados na encomenda.</li>
    <li>Recusa da encomenda sem justificação.</li>
    <li>Atrasos ou encargos alfandegares fora do nosso controlo.</li>
    <li>Danos em itens frágeis não sinalizados na encomenda.</li></ul>
    <p class="fine">As condições finais de cada encomenda são as acordadas por escrito na confirmação. Este resumo não substitui o acordo individual.</p>`},
  termos: { title: "Termos do serviço", body: `
    <h4>Escopo</h4>
    <p>Prestamos um serviço de compras internacionais assistidas: localização, compra, transporte e acompanhamento de encomendas dos EUA e da China até Moçambique.</p>
    <h4>Confirmação</h4>
    <p>Cada encomenda só é iniciada após confirmação expressa do cliente, com cotação e condições aceites por escrito (WhatsApp ou e-mail).</p>
    <h4>Cotações</h4>
    <p>As cotações têm validade limitada (normalmente 72 horas), pois preços e taxas variam nos mercados de origem.</p>
    <h4>Responsabilidades</h4>
    <p>O cliente é responsável pela exatidão das informações fornecidas (produto, quantidade, dados de entrega). O serviço responde pelo cumprimento das condições acordadas.</p>`},
  encomendas: { title: "Política de encomendas", body: `
    <h4>Fluxo</h4>
    <p>Cotação → confirmação do cliente → compra → comprovativo → transporte acompanhado → entrega.</p>
    <h4>Cancelamentos</h4>
    <p>Antes da compra junto do fornecedor: sem custo. Após a compra: conforme as condições acordadas por escrito, podendo aplicar-se custos já suportados.</p>
    <h4>Entregas</h4>
    <p>Combinadas na confirmação da encomenda, com atualizações em cada etapa até a receção pelo cliente.</p>`},
  restritos: { title: "Produtos restritos", body: `
    <h4>Não aceitamos encomendas de:</h4>
    <ul><li>Armas, munições e réplicas realistas;</li>
    <li>Substâncias controladas, drogas e produtos associados;</li>
    <li>Produtos falsificados ou que violem marcas registadas;</li>
    <li>Artigos proibidos pela alfândega moçambicana ou pelas transportadoras;</li>
    <li>Baterias e líquidos não conformes com as regras de transporte aéreo;</li>
    <li>Qualquer produto cuja importação seja ilegal em Moçambique.</li></ul>
    <h4>Em caso de dúvida</h4>
    <p>Consulte-nos antes de enviar o pedido. Confirmamos a categoria do produto antes de aceitar a encomenda, sem compromisso.</p>`},
  privacidade: { title: "Política de privacidade", body: `
    <h4>Dados que recolhemos</h4>
    <p>Apenas os necessários para processar a encomenda: nome, contacto, detalhes do produto e dados de entrega.</p>
    <h4>Como usamos</h4>
    <p>Para cotar, comprar, transportar e comunicar a encomenda. Partilhamos o mínimo necessário com fornecedores e transportadores.</p>
    <h4>O que nunca fazemos</h4>
    <p>Não vendemos nem partilhamos os seus dados para publicidade de terceiros.</p>
    <h4>Os seus direitos</h4>
    <p>Pode solicitar a correção ou eliminação dos seus dados contactando-nos pelos canais indicados no rodapé.</p>`}
};
const modal = document.getElementById("modal"), modalTitle = document.getElementById("modalTitle"), modalBody = document.getElementById("modalBody");
function openDoc(key){
  const d = DOCS[key]; if (!d) return;
  modalTitle.textContent = d.title;
  modalBody.innerHTML = d.body;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeModal(){
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
document.querySelectorAll("[data-doc]").forEach(b => b.addEventListener("click", () => openDoc(b.dataset.doc)));
modal.querySelectorAll("[data-close]").forEach(el => el.addEventListener("click", closeModal));
addEventListener("keydown", e => { if (e.key === "Escape"){ closeModal(); setMenu(false); lojaSair(); } });

/* ---------- lojas dentro do próprio site ---------- */
const lojaOv = document.getElementById("lojaOv");
const lojaFrame = document.getElementById("lojaFrame");
const lojaNome = document.getElementById("lojaNome");
const lojaHost = document.getElementById("lojaHost");
const lojaLoad = document.getElementById("lojaLoad");
const lojaLoadTxt = lojaLoad.querySelector(".loja-load-txt");
const LOJA_TXT = lojaLoadTxt ? lojaLoadTxt.textContent : "";
let lojaUrl = "", lojaAberto = false, lojaPush = false, lojaPronto = false;
let lojaAbertoEm = 0, lojaTimers = [], lojaPoll = 0;

function lojaAgenda(fn, ms){ const t = setTimeout(fn, ms); lojaTimers.push(t); }
function lojaPara(){ lojaTimers.forEach(clearTimeout); lojaTimers = []; if (lojaPoll){ clearInterval(lojaPoll); lojaPoll = 0; } }
function lojaSubframes(){
  try{ return lojaFrame.contentWindow.length; }catch{ return -1; }
}
function lojaProntoOk(){
  if (lojaPronto) return;
  lojaPronto = true;
  lojaLoad.hidden = true;
}
function lojaBloqueado(){
  if (lojaPronto || !lojaAberto) return;
  const t = lojaLoad.querySelector(".loja-load-txt");
  if (t) t.textContent = "Esta loja não permite abrir dentro do site — a continuar na página…";
  lojaAgenda(() => { if (lojaAberto && !lojaPronto) location.href = lojaUrl; }, 900);
}
function lojaAbrir(url, nome){
  if (!url) return;
  lojaUrl = url;
  lojaNome.textContent = nome || "Loja";
  let host = ""; try{ host = new URL(url).hostname; }catch{}
  lojaHost.textContent = host;
  lojaAberto = true; lojaPronto = false; lojaAbertoEm = Date.now();
  lojaOv.hidden = false; lojaOv.setAttribute("aria-hidden", "false");
  lojaLoad.hidden = false; lojaLoad.classList.remove("slow");
  if (lojaLoadTxt) lojaLoadTxt.textContent = LOJA_TXT;
  document.body.style.overflow = "hidden";
  lojaFrame.src = url;
  if (!lojaPush){ history.pushState({ loja: 1 }, "", location.href); lojaPush = true; }
  lojaPoll = setInterval(() => { if (lojaSubframes() > 0) lojaProntoOk(); }, 1500);
  lojaAgenda(() => { if (lojaAberto && !lojaPronto) lojaLoad.classList.add("slow"); }, 12000);
}
function lojaFechar(){
  if (!lojaAberto) return;
  lojaAberto = false; lojaPush = false;
  lojaPara();
  lojaLoad.classList.remove("slow");
  lojaOv.hidden = true; lojaOv.setAttribute("aria-hidden", "true");
  lojaFrame.src = "about:blank";
  document.body.style.overflow = "";
}
function lojaSair(){
  if (!lojaAberto) return;
  if (lojaPush) history.back();
  else lojaFechar();
}
lojaFrame.addEventListener("load", () => {
  if (!lojaAberto || lojaPronto) return;
  if (Date.now() - lojaAbertoEm > 6000) return;
  lojaAgenda(() => {
    if (!lojaAberto || lojaPronto) return;
    if (lojaSubframes() > 0){ lojaProntoOk(); return; }
    lojaAgenda(() => {
      if (!lojaAberto || lojaPronto) return;
      if (lojaSubframes() > 0) lojaProntoOk();
      else lojaBloqueado();
    }, 1300);
  }, 700);
});
document.getElementById("lojaBack").addEventListener("click", lojaSair);
document.getElementById("lojaClose").addEventListener("click", lojaSair);
document.getElementById("lojaEscape").addEventListener("click", () => { if (lojaUrl) location.href = lojaUrl; });
addEventListener("popstate", () => { if (lojaAberto) lojaFechar(); });
document.querySelectorAll(".calc-store").forEach(a => {
  a.addEventListener("click", e => {
    e.preventDefault();
    const n = a.querySelector(".cs-name");
    lojaAbrir(a.href, n ? n.textContent.trim() : "Loja");
  });
});
