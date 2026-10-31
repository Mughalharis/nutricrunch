/* ============================ helpers ============================ */
const $ = (s, r = document) => r.querySelector(s);
const rs = n => "Rs. " + Math.round(n).toLocaleString("en-PK");
const FALLBACK = "data:image/svg+xml;utf8," + encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><defs><radialGradient id='g' cx='50%' cy='40%' r='75%'><stop offset='0' stop-color='#f0d08a'/><stop offset='1' stop-color='#a8641b'/></radialGradient></defs><rect width='400' height='400' fill='url(#g)'/><g fill='#5c1220' opacity='.85'><ellipse cx='150' cy='190' rx='46' ry='66' transform='rotate(-24 150 190)'/><ellipse cx='248' cy='214' rx='40' ry='60' transform='rotate(22 248 214)'/><circle cx='200' cy='130' r='34'/></g></svg>"
);
// Any image that fails to load shows a warm placeholder instead of a broken icon
document.addEventListener("error", e => {
  const t = e.target;
  if (t && t.tagName === "IMG" && t.src !== FALLBACK) { t.src = FALLBACK; }
}, true);

let toastTimer;
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ============================ quotes ============================ */
(function () {
  const html = QUOTES.map(q => `<span>${q}</span>`).join("");
  $("#quoteTrack").innerHTML = html + html;
})();

/* ============================ pricing helpers ============================ */
const byId = id => PRODUCTS.find(p => p.id === id);
const wLabel = g => g >= 1000 ? (g / 1000) + "kg" : g + "g";
function basePack(p, g) {
  if (p.fixed) return p.fixed[g];
  return Math.round(p.kg * g / 1000 / 10) * 10 + PACK_FEE;
}
function priceFor(p, wi) {
  const base = basePack(p, WEIGHTS[wi].g);
  return SALE_PERCENT ? { now: Math.round(base * (1 - SALE_PERCENT / 100) / 10) * 10, was: base } : { now: base, was: 0 };
}
const imgFor = (p, w = 600) => p.pack ? PACKS[p.pack] : photo(p.img, w);
const imgRef = p => p.pack ? "pack:" + p.pack : photo(p.img, 160);
const gImg = (g, w = 800) => g.pack ? PACKS[g.pack] : photo(g.img, w);
const gRef = g => g.pack ? "pack:" + g.pack : photo(g.img, 160);
const resolveImg = r => String(r || "").startsWith("pack:") ? PACKS[r.slice(5)] : r;

/* ============================ products ============================ */
let activeCat = "all";
const chosenW = {};          // product id -> weight index
PRODUCTS.forEach(p => chosenW[p.id] = DEFAULT_W);

function renderFilters() {
  $("#filters").innerHTML = CATS.map(c =>
    `<button class="chip" data-cat="${c.key}" aria-pressed="${c.key === activeCat}">${c.label}<span class="urdu">${c.ur}</span></button>`
  ).join("");
}
let query = "", sortBy = "featured";
function renderProducts() {
  const q = query.trim().toLowerCase();
  let list = PRODUCTS.filter(p =>
    (activeCat === "all" || p.cat === activeCat) &&
    (!q || (p.name + " " + p.ur + " " + p.tag).toLowerCase().includes(q)));
  const key = p => basePack(p, 500);
  if (sortBy === "low")  list.sort((a, b) => key(a) - key(b));
  if (sortBy === "high") list.sort((a, b) => key(b) - key(a));
  if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name));
  $("#resultCount").textContent = `${list.length} ${list.length === 1 ? "product" : "products"}`;
  if (!list.length) {
    $("#productGrid").innerHTML = `<div class="no-results"><span class="urdu">کوئی نتیجہ نہیں ملا</span>Nothing matches "${q.replace(/[<>&"]/g, "")}". Try another name, or message us on WhatsApp: any dry fruit can be packed on order.</div>`;
    return;
  }
  $("#productGrid").innerHTML = list.map(p => {
    const wi = chosenW[p.id], pr = priceFor(p, wi);
    return `
    <article class="card" data-id="${p.id}">
      <div class="ph">
        ${SALE_PERCENT ? `<span class="badge">${SALE_PERCENT}% OFF</span>` : ""}
        <img src="${imgFor(p, 600)}" alt="${p.name}" loading="lazy">
        <span class="tag">${p.tag}</span>
      </div>
      <div class="body">
        <h3>${p.name}</h3>
        <div class="ur-name">${p.ur}</div>
        ${p.note ? `<div class="note">${p.note}</div>` : ""}
        <div class="weights" role="group" aria-label="Weight">
          ${WEIGHTS.map((w, i) => `<button data-w="${i}" aria-pressed="${i === wi}">${w.k}</button>`).join("")}
        </div>
        <div class="price"><span class="now">${rs(pr.now)}</span>${pr.was ? `<span class="was">${rs(pr.was)}</span>` : `<span class="was" hidden></span>`}</div>
        <button class="btn btn-dark" data-add="${p.id}">Add to Cart</button>
      </div>
    </article>`;
  }).join("");
}
$("#filters").addEventListener("click", e => {
  const b = e.target.closest("[data-cat]"); if (!b) return;
  activeCat = b.dataset.cat; renderFilters(); renderProducts();
});
$("#productGrid").addEventListener("click", e => {
  const card = e.target.closest(".card"); if (!card) return;
  const id = card.dataset.id, p = byId(id);
  const wb = e.target.closest("[data-w]");
  if (wb) {
    chosenW[id] = +wb.dataset.w;
    const pr = priceFor(p, chosenW[id]), was = card.querySelector(".was");
    card.querySelectorAll("[data-w]").forEach(b => b.setAttribute("aria-pressed", b === wb));
    card.querySelector(".now").textContent = rs(pr.now);
    if (was) { was.hidden = !pr.was; was.textContent = pr.was ? rs(pr.was) : ""; }
    return;
  }
  if (e.target.closest("[data-add]")) {
    const wi = chosenW[id], pr = priceFor(p, wi);
    addToCart({ key: `${id}-${WEIGHTS[wi].k}`, name: p.name, detail: WEIGHTS[wi].k, price: pr.now, img: imgRef(p) });
  }
});

/* ============================ gift boxes (ready-made) ============================ */
const giftPrice = g => Math.round((g.items.reduce((s, [id, gr]) => s + basePack(byId(id), gr), 0) + g.fee) / 50) * 50;
$("#giftGrid").innerHTML = GIFT_BOXES.map(g => `
  <article class="gift-card">
    <div class="ph"><img src="${gImg(g)}" alt="${g.name}" loading="lazy"></div>
    <div class="body">
      <h3>${g.name}</h3>
      <div class="urdu">${g.ur}</div>
      <div class="meta-line">${g.desc}</div>
      <ul>${g.items.map(([id, gr]) => `<li>${byId(id).short} ${wLabel(gr)}</li>`).join("")}</ul>
      <div class="price"><span class="now">${rs(giftPrice(g))}</span></div>
      <button class="btn btn-dark" data-gift="${g.id}">Add to Cart</button>
    </div>
  </article>`).join("");
$("#giftGrid").addEventListener("click", e => {
  const b = e.target.closest("[data-gift]"); if (!b) return;
  const g = GIFT_BOXES.find(x => x.id === b.dataset.gift);
  addToCart({ key: "set-" + g.id, name: g.name, detail: g.items.map(([id, gr]) => `${byId(id).short} ${wLabel(gr)}`).join(", "), price: giftPrice(g), img: gRef(g) });
});

/* ============================ gift builder ============================ */
const gs = { box: GIFT_BOXES[0].id, items: new Set(), ribbon: RIBBONS[0].id };
const packPrice250 = p => basePack(p, 250);

$("#boxOpts").innerHTML = GIFT_BOXES.map((b, i) => `
  <div class="opt"><input type="radio" name="box" id="box-${b.id}" value="${b.id}" ${i === 0 ? "checked" : ""}>
  <label for="box-${b.id}"><span>${b.name}<br><small>Up to ${b.max} packs of 250g</small></span><small>${rs(b.fee)}</small></label></div>`).join("");
$("#itemOpts").innerHTML = PRODUCTS.map(p => `
  <div class="opt"><input type="checkbox" id="bi-${p.id}" value="${p.id}">
  <label for="bi-${p.id}"><span>${p.name}</span><small>${rs(packPrice250(p))}</small></label></div>`).join("");
$("#ribbonOpts").innerHTML = RIBBONS.map((r, i) => `
  <div class="opt"><input type="radio" name="ribbon" id="rb-${r.id}" value="${r.id}" ${i === 0 ? "checked" : ""}>
  <label for="rb-${r.id}"><span><i class="swatch" style="background:${r.c}"></i>${r.id}</span></label></div>`).join("");

function boxObj() { return GIFT_BOXES.find(b => b.id === gs.box); }
function renderBuilder() {
  const box = boxObj(), n = gs.items.size, full = n >= box.max;
  document.querySelectorAll("#itemOpts input").forEach(i => { i.disabled = full && !i.checked; });
  $("#pickCount").textContent = `${n} / ${box.max} chosen`;
  $("#prevBox").textContent = `${box.name} · ${gs.ribbon} ribbon`;
  const msg = $("#giftMsg").value.trim();
  $("#prevMsg").textContent = msg || "آپ کے لیے، محبت کے ساتھ";
  $("#prevMsg").style.direction = /[؀-ۿ]/.test(msg) || !msg ? "rtl" : "ltr";
  const picked = PRODUCTS.filter(p => gs.items.has(p.id));
  const itemsTotal = picked.reduce((s, p) => s + packPrice250(p), 0);
  const total = box.fee + itemsTotal;
  $("#giftSummary").innerHTML =
    `<li><span>${box.name}</span><span>${rs(box.fee)}</span></li>` +
    (picked.length ? picked.map(p => `<li><span>${p.short} 250g</span><span>${rs(packPrice250(p))}</span></li>`).join("")
                   : `<li><span style="color:var(--ink-soft)">No mewa chosen yet</span><span>-</span></li>`) +
    `<li class="total"><span>Total</span><span>${rs(total)}</span></li>`;
  const hint = $("#giftHint");
  hint.classList.remove("warn");
  hint.textContent = full ? "Your box is full. Remove a pack to swap it." : "";
  return { box, picked, total, msg };
}
$("#builder").addEventListener("change", e => {
  const t = e.target;
  if (t.name === "box") {
    gs.box = t.value;
    const max = boxObj().max;
    while (gs.items.size > max) {          // trim extras if switching to a smaller box
      const last = [...gs.items].pop(); gs.items.delete(last); document.getElementById("bi-" + last).checked = false;
    }
  } else if (t.name === "ribbon") gs.ribbon = t.value;
  else if (t.type === "checkbox") { t.checked ? gs.items.add(t.value) : gs.items.delete(t.value); }
  renderBuilder();
});
$("#giftMsg").addEventListener("input", () => { $("#msgCount").textContent = `${$("#giftMsg").value.length} / 80`; renderBuilder(); });
$("#addGift").addEventListener("click", () => {
  const { box, picked, total, msg } = renderBuilder();
  if (!picked.length) { const h = $("#giftHint"); h.textContent = "Choose at least one pack of mewa for your box."; h.classList.add("warn"); return; }
  const detail = `${picked.map(p => p.short + " 250g").join(", ")} · ${gs.ribbon} ribbon` + (msg ? ` · Card: "${msg}"` : "");
  addToCart({ key: `custom-${Date.now()}`, name: `Custom ${box.name}`, detail, price: total, img: gRef(box) });
});

/* ============================ cart ============================ */
let cart = [];
try { cart = JSON.parse(localStorage.getItem("nc_cart") || "[]"); } catch (_) { cart = []; }
const save = () => { try { localStorage.setItem("nc_cart", JSON.stringify(cart)); } catch (_) {} };

function addToCart(item) {
  const ex = cart.find(c => c.key === item.key);
  if (ex) ex.qty += 1; else cart.push({ ...item, qty: 1 });
  cartStep = "cart"; save(); renderCart(); toast(`${item.name} added to your tokri`);
}
let promo = "";   // applied promo code
try { promo = localStorage.getItem("nc_promo") || ""; } catch (_) {}
try { const q = new URLSearchParams(location.search).get("promo"); if (q && PROMOS[q.trim().toUpperCase()]) { promo = q.trim().toUpperCase(); } } catch (_) {}
if (promo && !PROMOS[promo]) promo = "";
const savePromo = () => { try { localStorage.setItem("nc_promo", promo); } catch (_) {} };
function totals() {
  const sub = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const ship = !cart.length ? 0 : (sub >= SHOP.freeShipOver ? 0 : SHOP.shipping);
  const p = promo && PROMOS[promo];
  const discount = !p ? 0 : Math.min(sub, p.flat ? p.flat : Math.round(sub * (p.percent || 0) / 100));
  return { sub, ship, discount, total: sub - discount + ship };
}
/* Sends a copy of the order to SHOP.orderWebhook (Pabbly Connect, Zapier, Make...). Does nothing while the URL is empty.
   A failure here never blocks the customer's WhatsApp order. */
function sendOrderToWebhook(order) {
  if (!SHOP.orderWebhook) return;
  try {
    fetch(SHOP.orderWebhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(order), keepalive: true }).catch(() => {});
  } catch (e) {}
}
let cartStep = "cart";          // cart -> details -> sent
let lastLink = "", lastRef = "";
let details = { name: "", phone: "", city: "", address: "", note: "" };
try { Object.assign(details, JSON.parse(localStorage.getItem("nc_details") || "{}")); } catch (_) {}
const saveDetails = () => { try { localStorage.setItem("nc_details", JSON.stringify(details)); } catch (_) {} };
function orderRef() {
  const d = new Date(), p2 = n => String(n).padStart(2, "0");
  return `NC-${String(d.getFullYear()).slice(2)}${p2(d.getMonth() + 1)}${p2(d.getDate())}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function renderCart() {
  const count = cart.reduce((s, c) => s + c.qty, 0);
  $("#cartCount").textContent = count;
  const body = $("#cartBody"), foot = $("#cartFoot");

  if (cartStep === "sent") {
    body.innerHTML = `<div class="empty"><span class="urdu">آرڈر تیار ہے</span><b>Your order is ready in WhatsApp.</b><br>Press Send there so we receive it. We then confirm payment and dispatch.</div>`;
    foot.innerHTML = `<a class="btn btn-brass btn-block" href="${lastLink}" target="_blank" rel="noopener">Open WhatsApp again</a>
      <button class="btn btn-dark btn-block" id="newOrder">Start a new order</button>
      <div class="fine">Order reference ${lastRef}</div>`;
    return;
  }
  if (!cart.length) {
    cartStep = "cart";
    body.innerHTML = `<div class="empty"><span class="urdu">ٹوکری خالی ہے</span>Your tokri is empty. Add some mewa to begin.</div>`;
    foot.innerHTML = `<a href="#shop" class="btn btn-dark btn-block" id="startShop">Start Shopping</a>`;
    return;
  }
  const t = totals(), left = SHOP.freeShipOver - t.sub;
  const sums = `
    <div class="row"><span>Subtotal</span><span>${rs(t.sub)}</span></div>
    ${promoRow(t)}
    <div class="row"><span>Delivery</span><span>${t.ship ? rs(t.ship) : "Free"}</span></div>
    <div class="ship-note">${left > 0 ? `Add ${rs(left)} more for free delivery` : "You have free delivery"}</div>
    <div class="row total"><span>Total</span><span>${rs(t.total)}</span></div>`;

  if (cartStep === "details") {
    body.innerHTML = `<form class="dform" id="dform" novalidate>
      <h4 class="dtitle">Delivery details<span class="urdu">ڈیلیوری کی تفصیل</span></h4>
      <div class="fld"><label for="dName">Full name</label><input id="dName" autocomplete="name"><small class="err" id="eName"></small></div>
      <div class="fld"><label for="dPhone">Mobile number</label><input id="dPhone" type="tel" inputmode="tel" autocomplete="tel" placeholder="03XX XXXXXXX"><small class="err" id="ePhone"></small></div>
      <div class="fld"><label for="dCity">City</label><input id="dCity" autocomplete="address-level2"><small class="err" id="eCity"></small></div>
      <div class="fld"><label for="dAddress">Full address</label><textarea id="dAddress" autocomplete="street-address" placeholder="House, street, area"></textarea><small class="err" id="eAddress"></small></div>
      <div class="fld"><label for="dNote">Note <i>(optional)</i></label><textarea id="dNote" placeholder="Landmark, preferred time, gift message for the courier"></textarea></div>
    </form>`;
    ["Name", "Phone", "City", "Address", "Note"].forEach(k => { $("#d" + k).value = details[k.toLowerCase()]; });
    foot.innerHTML = sums + `<button class="btn btn-brass btn-block" id="confirmOrder">Confirm Order on WhatsApp</button>
      <button class="link-btn" id="backCart">Back to tokri</button>
      <div class="fine">Your order opens in WhatsApp. Press Send so we receive it.</div>`;
    return;
  }

  body.innerHTML = cart.map((c, i) => `
    <div class="line">
      <img src="${resolveImg(c.img)}" alt="">
      <div>
        <div class="t">${c.name}</div>
        <div class="d">${c.detail}</div>
        <div class="qty"><button data-dec="${i}" aria-label="Decrease">&minus;</button><span>${c.qty}</span><button data-inc="${i}" aria-label="Increase">+</button></div>
      </div>
      <div><div class="p">${rs(c.price * c.qty)}</div><button class="rm" data-rm="${i}">Remove</button></div>
    </div>`).join("");
  foot.innerHTML = sums + `<button class="btn btn-brass btn-block" id="toDetails">Enter Delivery Details</button>
    <div class="fine">Next: your name, number and address. Then confirm on WhatsApp.</div>`;
}

function promoRow(t) {
  const p = promo && PROMOS[promo];
  if (p) return `<div class="row promo-on"><span>Promo <b>${promo}</b> <button class="link-btn" id="promoRm" type="button">remove</button></span><span>${t.discount ? "-" + rs(t.discount) : "applied"}</span></div>`;
  if (cartStep !== "cart") return "";
  return `<div class="promo"><input id="promoIn" placeholder="Promo code" autocapitalize="characters" autocomplete="off"><button class="btn btn-dark" id="promoApply" type="button">Apply</button></div><small class="err" id="promoErr"></small>`;
}
function applyPromo() {
  const v = ($("#promoIn").value || "").trim().toUpperCase();
  if (!v) return;
  if (!PROMOS[v]) { $("#promoErr").textContent = "This code is not valid."; return; }
  promo = v; savePromo(); renderCart();
}

function validateDetails() {
  const d = details, e = {};
  if (d.name.trim().length < 2) e.Name = "Please enter your full name.";
  const digits = d.phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) e.Phone = "Enter a valid mobile number, for example 03XX XXXXXXX.";
  if (d.city.trim().length < 2) e.City = "Please enter your city.";
  if (d.address.trim().length < 8) e.Address = "Please enter your full delivery address.";
  ["Name", "Phone", "City", "Address"].forEach(k => {
    $("#e" + k).textContent = e[k] || "";
    $("#d" + k).classList.toggle("invalid", !!e[k]);
  });
  const first = Object.keys(e)[0];
  if (first) $("#d" + first).focus();
  return !first;
}

$("#cartBody").addEventListener("click", e => {
  const inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]"), rm = e.target.closest("[data-rm]");
  if (inc) cart[+inc.dataset.inc].qty++;
  else if (dec) { const i = +dec.dataset.dec; if (--cart[i].qty <= 0) cart.splice(i, 1); }
  else if (rm) cart.splice(+rm.dataset.rm, 1);
  else return;
  save(); renderCart();
});
$("#cartBody").addEventListener("input", e => {
  const m = /^d(Name|Phone|City|Address|Note)$/.exec(e.target.id || ""); if (!m) return;
  details[m[1].toLowerCase()] = e.target.value; saveDetails();
  e.target.classList.remove("invalid"); const er = $("#e" + m[1]); if (er) er.textContent = "";
});
$("#cartFoot").addEventListener("keydown", e => { if (e.key === "Enter" && e.target.id === "promoIn") { e.preventDefault(); applyPromo(); } });
$("#cartFoot").addEventListener("click", e => {
  if (e.target.closest("#startShop")) { closeCart(); return; }
  if (e.target.closest("#promoApply")) { applyPromo(); return; }
  if (e.target.closest("#promoRm")) { promo = ""; savePromo(); renderCart(); return; }
  if (e.target.closest("#toDetails")) { cartStep = "details"; renderCart(); $("#dName").focus(); return; }
  if (e.target.closest("#backCart")) { cartStep = "cart"; renderCart(); return; }
  if (e.target.closest("#newOrder")) { cart = []; save(); cartStep = "cart"; renderCart(); return; }
  if (!e.target.closest("#confirmOrder")) return;
  if (!validateDetails()) return;
  const t = totals(), d = details, ref = orderRef();
  const lines = cart.map(c => `• ${c.name} (${c.detail}) x${c.qty} = ${rs(c.price * c.qty)}`).join("\n");
  const note = d.note.trim();
  const text = `Assalam o Alaikum NutriCrunch! New order ${ref}\n\n${lines}\n\nSubtotal: ${rs(t.sub)}\n${t.discount ? `Promo ${promo} (${PROMOS[promo].source}): -${rs(t.discount)}\n` : ""}Delivery: ${t.ship ? rs(t.ship) : "Free"}\nTotal: ${rs(t.total)}\n\nName: ${d.name.trim()}\nPhone: ${d.phone.trim()}\nCity: ${d.city.trim()}\nAddress: ${d.address.trim()}` + (note ? `\nNote: ${note}` : "") + `\n\nPromo code: ${promo || "none"}\nSales source: ${promo ? PROMOS[promo].source : "Direct / no code"}`;
  lastLink = `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(text)}`; lastRef = ref;
  window.open(lastLink, "_blank", "noopener");
  sendOrderToWebhook({
    order_ref: ref, created_at: new Date().toISOString(),
    customer_name: d.name.trim(), customer_phone: d.phone.trim(), city: d.city.trim(), address: d.address.trim(), note: note,
    items: cart.map(c => ({ name: c.name, detail: c.detail, qty: c.qty, unit_price: c.price, line_total: c.price * c.qty })),
    subtotal: t.sub, discount: t.discount, delivery: t.ship, total: t.total,
    promo_code: promo || "", sales_source: promo ? PROMOS[promo].source : "Direct", summary: text
  });
  cartStep = "sent"; renderCart();
});

const drawer = $("#drawer"), overlay = $("#overlay");
function openCart() { drawer.classList.add("open"); overlay.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); $("#closeCart").focus(); }
function closeCart() { drawer.classList.remove("open"); overlay.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); $("#openCart").focus(); }
$("#openCart").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", e => { if (e.key === "Escape" && drawer.classList.contains("open")) closeCart(); });

/* WhatsApp float button */
const waHelp = `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent("Assalam o Alaikum! I have a question about NutriCrunch.")}`;
$("#waFloat").href = waHelp;
$("#footWa").href = waHelp;
$("#footWa").textContent = SHOP.whatsappDisplay;

/* ============================ best sellers ============================ */
function renderBest() {
  $("#bestGrid").innerHTML = BEST_IDS.map(id => {
    const p = byId(id); if (!p) return "";
    return `<article class="card best-card">
      <div class="ph"><span class="badge">BEST SELLER</span><img src="${imgFor(p, 700)}" alt="${p.name}" loading="lazy"></div>
      <div class="body">
        <h3>${p.name}</h3><div class="ur-name">${p.ur}</div>
        ${p.note ? `<div class="note">${p.note}</div>` : ""}
        <div class="tiers">${WEIGHTS.map((w, i) => { const pr = priceFor(p, i);
          return `<div class="tier${i === DEFAULT_W ? " main" : ""}"><span class="w">${w.k}</span><span class="pr"><b>${rs(pr.now)}</b>${pr.was ? `<s>${rs(pr.was)}</s>` : ""}</span><button class="btn btn-dark" data-addw="${p.id}|${i}" aria-label="Add ${w.k} ${p.name} to cart">Add</button></div>`; }).join("")}
        </div>
      </div></article>`;
  }).join("");
}
$("#bestGrid").addEventListener("click", e => {
  const b = e.target.closest("[data-addw]"); if (!b) return;
  const [id, wi] = b.dataset.addw.split("|"), p = byId(id), w = WEIGHTS[+wi];
  addToCart({ key: `${id}-${w.k}`, name: p.name, detail: w.k, price: priceFor(p, +wi).now, img: imgRef(p) });
});

/* search, sort, category tiles, mobile menu */
$("#searchBox").addEventListener("input", e => { query = e.target.value; renderProducts(); });
$("#sortBox").addEventListener("change", e => { sortBy = e.target.value; renderProducts(); });
$("#ct1").src = PACKS.almond;  $("#ct2").src = PACKS.figs;
$("#ct3").src = PACKS.wide;  $("#ct4").src = PACKS.giftTruck;
$("#heroImg").src = PACKS.black;  $("#packsImg").src = PACKS.close;
const customLink = `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent("Assalam o Alaikum! I would like a custom NutriCrunch pack. I want: ")}`;
$("#customWa").href = customLink;  $("#customWa2").href = customLink;
$("#catGrid").addEventListener("click", e => {
  const t = e.target.closest("button[data-cat]"); if (!t) return;
  activeCat = t.dataset.cat; query = ""; $("#searchBox").value = "";
  renderFilters(); renderProducts();
  $("#shop").scrollIntoView({ behavior: "smooth" });
});
const mnav = $("#mnav"), menuBtn = $("#menuBtn");
function setMenu(open) { mnav.hidden = !open; menuBtn.setAttribute("aria-expanded", open); }
menuBtn.addEventListener("click", () => setMenu(mnav.hidden));
mnav.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });

/* init */
renderFilters(); renderProducts(); renderBest(); renderBuilder(); renderCart();
