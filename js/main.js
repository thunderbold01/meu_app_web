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
addEventListener("keydown", e => { if (e.key === "Escape"){ closeModal(); setMenu(false); } });

/* ---------- calculadora AliExpress ---------- */
const AX_RATES = { USD:64, CNY:9, EUR:74, MZN:1 };

function axURLfrom(text){
  const m = String(text).match(/https?:\/\/[^\s"'<>]+/i);
  if (!m) return null;
  const url = m[0].replace(/[)\].,;:!?"']+$/, "");
  return /^https?:\/\/(?:[a-z0-9-]+\.)*aliexpress\.[a-z.]{2,}(\/|$)/i.test(url) ? url : null;
}

const axLink = document.getElementById("axLink");
const axGo = document.getElementById("axGo");
const axPrice = document.getElementById("axPrice");
const axStatus = document.getElementById("axStatus");
const axOut = document.getElementById("axOut");
const axName = document.getElementById("axName");
const axBase = document.getElementById("axBase");
const axFee = document.getElementById("axFee");
const axTotal = document.getElementById("axTotal");
const axRule = document.getElementById("axRule");
const axWa = document.getElementById("axWa");
let axInfo = { url:"", name:"" };

function axFmt(n){ return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " MT"; }
function axSay(msg, cls){ axStatus.textContent = msg; axStatus.className = "calc-status" + (cls ? " " + cls : ""); }

function axRender(){
  const base = parseFloat(axPrice.value);
  if (!(base > 0)){ axOut.hidden = true; return; }
  const small = base < 1000;
  const fee = small ? 600 : Math.round(base * .3) + 250;
  const total = base + fee;
  axOut.hidden = false;
  axName.hidden = !axInfo.name;
  if (axInfo.name) axName.textContent = axInfo.name;
  axBase.textContent = axFmt(base);
  axFee.textContent = axFmt(fee);
  axTotal.textContent = axFmt(total);
  axRule.textContent = small ? "Regra aplicada: abaixo de 1000 MT → + 600 MT fixos" : "Regra aplicada: 1000 MT ou mais → + 30% e + 250 MT";
  const lines = ["Olá! Quero encomendar este produto do AliExpress:"];
  if (axInfo.name) lines.push("Produto: " + axInfo.name);
  if (axInfo.url) lines.push("Link: " + axInfo.url);
  lines.push("Preço do produto: " + axFmt(base));
  lines.push("Serviço + transporte: " + axFmt(fee));
  lines.push("TOTAL: " + axFmt(total));
  lines.push(small ? "(regra: abaixo de 1000 MT → +600 MT)" : "(regra: 1000 MT ou mais → +30% e +250 MT)");
  lines.push("Pode confirmar, por favor?");
  axWa.href = waURL(lines.join("\n"));
}
axPrice.addEventListener("input", axRender);

async function axProductAPI(url){
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 57000);
  try{
    const r = await fetch("/api/product?url=" + encodeURIComponent(url), {signal: ctl.signal});
    let j = null;
    try{ j = await r.json(); }catch{}
    if (!r.ok) throw new Error((j && j.error) || "__bad");
    return j;
  }finally{
    clearTimeout(timer);
  }
}

async function axLookup(){
  const raw = axLink.value.trim();
  if (!raw){ axSay("Cole o link do produto do AliExpress.", "err"); axLink.focus(); return; }
  const url = axURLfrom(raw);
  if (!url){ axSay("Esse link não é do AliExpress.", "err"); axLink.focus(); return; }
  axInfo = { url, name:"" };
  axSay("A ler o produto no AliExpress… pode demorar até 45 segundos.");
  axGo.disabled = true;
  try{
    const j = await axProductAPI(url);
    if (j && j.ok && j.price > 0){
      const mt = j.mt > 0 ? j.mt : Math.round(j.price * (AX_RATES[j.currency] || 1));
      axInfo.name = j.title || "";
      axPrice.value = mt;
      axRender();
      axSay("Preço encontrado: " + j.price + " " + j.currency + " = " + axFmt(mt) + " (taxa " + (j.rate || AX_RATES[j.currency] || 1) + " MT por 1 " + j.currency + ")", "ok");
      return;
    }
    if (j && j.title){
      axInfo.name = j.title;
      axSay("Produto: " + j.title + " — não consegui ler o preço. Escreva o preço em MT abaixo.", "err");
      axPrice.focus();
      return;
    }
    throw new Error((j && j.error) || "falha");
  }catch(e){
    if (e.name === "AbortError"){
      axSay("Demorou demasiado. Escreva o preço em MT abaixo.", "err");
      axPrice.focus();
    }else if (e.message && e.message.length < 150 && !/^Failed|Network|__bad/i.test(e.message)){
      axSay(e.message, "err");
    }else{
      axSay("Não consegui ler o preço automaticamente. Escreva o preço em MT abaixo.", "err");
      axPrice.focus();
    }
  }finally{
    axGo.disabled = false;
  }
}
axGo.addEventListener("click", axLookup);
axLink.addEventListener("keydown", e => { if (e.key === "Enter") axLookup(); });
