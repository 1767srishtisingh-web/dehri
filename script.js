/* =========================================================
   Dehri - script.js
   Frontend demo only. All data lives in this file and in the
   browser's localStorage. Nothing is sent to a server.

   Contents
   1. Settings and sample data  (edit this part to customise)
   2. State and storage
   3. Helpers
   4. Customer portal: products, cart, checkout
   5. Service areas and map
   6. Delivery partners and order tracking
   7. Shopkeeper portal
   8. Start-up
   ========================================================= */

"use strict";

/* =========================================================
   1. SETTINGS AND SAMPLE DATA
   ========================================================= */

const CONFIG = {
  currency: "₹",
  deliveryFee: 15,          // charged on small orders
  freeDeliveryAbove: 299,   // orders of this value or more get free delivery
  lowStockLevel: 5,         // "Only N left" appears at or below this
  statusStepSeconds: 8,     // seconds between simulated order statuses
  orderPrefix: "DH",
  storagePrefix: "dehri_",
  contact: "Phone and WhatsApp: +91 90000 00000 (sample number)",
};

/* Service areas and planned areas.
   IMPORTANT: coordinates are approximate. Chakia and Jamalpur use public
   postal/encyclopedia coordinates for the Ballia-district villages; Milki
   and Talibpur are placed nearby as placeholders. Check every pin on
   openstreetmap.org and correct lat/lng before using this publicly. */
const AREAS = [
  { id: "chakia",   name: "Chakia",   lat: 25.7400, lng: 84.4400, status: "active" },
  { id: "milki",    name: "Milki",    lat: 25.7520, lng: 84.4620, status: "active" },
  { id: "jamalpur", name: "Jamalpur", lat: 25.7915, lng: 84.4686, status: "active" },
  { id: "talibpur", name: "Talibpur", lat: 25.7720, lng: 84.4320, status: "active" },
  { id: "bairia",   name: "Bairia",   lat: 25.7600, lng: 84.4850, status: "planned" },
  { id: "reoti",    name: "Reoti",    lat: 25.8500, lng: 84.3800, status: "planned" },
  { id: "sahatwar", name: "Sahatwar", lat: 25.8360, lng: 84.3160, status: "planned" },
  { id: "ballia",   name: "Ballia",   lat: 25.7600, lng: 84.1470, status: "planned" },
];

/* Shops. "serves" lists the area ids each shop delivers to. */
const SHOPS = [
  { id: "s1", name: "Gupta Kirana Store",       areaId: "chakia",   serves: ["chakia", "milki"] },
  { id: "s2", name: "Maa Vaishno General Store", areaId: "jamalpur", serves: ["jamalpur", "talibpur"] },
  { id: "s3", name: "Yadav Dairy and Bakery",    areaId: "milki",    serves: ["milki", "chakia", "jamalpur"] },
  { id: "s4", name: "Talibpur Fresh Mart",       areaId: "talibpur", serves: ["talibpur", "jamalpur"] },
];

const CATEGORIES = [
  { id: "staples",   name: "Atta, rice and dal" },
  { id: "dairy",     name: "Dairy and bakery" },
  { id: "snacks",    name: "Snacks" },
  { id: "beverages", name: "Tea and drinks" },
  { id: "produce",   name: "Fruits and vegetables" },
  { id: "household", name: "Household" },
];

/* Products.
   price  = shop price before tax
   taxPct = tax percentage (sample values, confirm real GST rates)
   extra  = packing or handling charge per unit
   Customer pays: price + tax + extra */
const DEFAULT_PRODUCTS = [
  { id: "p01", name: "Chakki atta",        unit: "5 kg",    category: "staples",   shopId: "s1", price: 215, taxPct: 0,  extra: 5, stock: 18, image: "images/atta.svg" },
  { id: "p02", name: "Basmati rice",       unit: "1 kg",    category: "staples",   shopId: "s1", price: 98,  taxPct: 5,  extra: 2, stock: 24, image: "images/rice.svg" },
  { id: "p03", name: "Arhar dal",          unit: "1 kg",    category: "staples",   shopId: "s2", price: 142, taxPct: 5,  extra: 2, stock: 15, image: "images/arhar-dal.svg" },
  { id: "p04", name: "Mustard oil",        unit: "1 L",     category: "staples",   shopId: "s2", price: 158, taxPct: 5,  extra: 0, stock: 12, image: "images/mustard-oil.svg" },
  { id: "p05", name: "Sugar",              unit: "1 kg",    category: "staples",   shopId: "s1", price: 44,  taxPct: 5,  extra: 1, stock: 30, image: "images/sugar.svg" },
  { id: "p06", name: "Iodised salt",       unit: "1 kg",    category: "staples",   shopId: "s4", price: 24,  taxPct: 0,  extra: 0, stock: 40, image: "images/salt.svg" },

  { id: "p07", name: "Toned milk",         unit: "500 ml",  category: "dairy",     shopId: "s3", price: 28,  taxPct: 0,  extra: 0, stock: 35, image: "images/milk.svg" },
  { id: "p08", name: "Fresh paneer",       unit: "200 g",   category: "dairy",     shopId: "s3", price: 86,  taxPct: 5,  extra: 2, stock: 9,  image: "images/paneer.svg" },
  { id: "p09", name: "Dahi",               unit: "400 g",   category: "dairy",     shopId: "s3", price: 38,  taxPct: 5,  extra: 0, stock: 14, image: "images/dahi.svg" },
  { id: "p10", name: "White bread",        unit: "400 g",   category: "dairy",     shopId: "s3", price: 40,  taxPct: 0,  extra: 0, stock: 4,  image: "images/bread.svg" },
  { id: "p11", name: "Eggs",               unit: "6 pieces", category: "dairy",    shopId: "s4", price: 45,  taxPct: 0,  extra: 3, stock: 20, image: "images/eggs.svg" },

  { id: "p12", name: "Aloo bhujia",        unit: "200 g",   category: "snacks",    shopId: "s1", price: 48,  taxPct: 5,  extra: 2, stock: 26, image: "images/aloo-bhujia.svg" },
  { id: "p13", name: "Salted potato chips", unit: "52 g",   category: "snacks",    shopId: "s2", price: 19,  taxPct: 5,  extra: 0, stock: 48, image: "images/chips.svg" },
  { id: "p14", name: "Glucose biscuits",   unit: "250 g",   category: "snacks",    shopId: "s1", price: 28,  taxPct: 5,  extra: 0, stock: 32, image: "images/biscuits.svg" },
  { id: "p15", name: "Namkeen mixture",    unit: "400 g",   category: "snacks",    shopId: "s4", price: 92,  taxPct: 5,  extra: 2, stock: 11, image: "images/namkeen.svg" },
  { id: "p16", name: "Instant noodles",    unit: "Pack of 4", category: "snacks",  shopId: "s2", price: 52,  taxPct: 5,  extra: 0, stock: 0,  image: "images/noodles.svg" },

  { id: "p17", name: "Assam tea",          unit: "250 g",   category: "beverages", shopId: "s1", price: 118, taxPct: 5,  extra: 0, stock: 16, image: "images/tea.svg" },
  { id: "p18", name: "Mango drink",        unit: "600 ml",  category: "beverages", shopId: "s4", price: 34,  taxPct: 18, extra: 0, stock: 22, image: "images/mango-drink.svg" },
  { id: "p19", name: "Cola",               unit: "750 ml",  category: "beverages", shopId: "s2", price: 32,  taxPct: 18, extra: 0, stock: 18, image: "images/cola.svg" },
  { id: "p20", name: "Packaged drinking water", unit: "1 L", category: "beverages", shopId: "s4", price: 17, taxPct: 5,  extra: 0, stock: 60, image: "images/water.svg" },

  { id: "p21", name: "Potato",             unit: "1 kg",    category: "produce",   shopId: "s4", price: 26,  taxPct: 0,  extra: 2, stock: 45, image: "images/potato.svg" },
  { id: "p22", name: "Onion",              unit: "1 kg",    category: "produce",   shopId: "s4", price: 34,  taxPct: 0,  extra: 2, stock: 38, image: "images/onion.svg" },
  { id: "p23", name: "Tomato",             unit: "500 g",   category: "produce",   shopId: "s4", price: 18,  taxPct: 0,  extra: 2, stock: 5,  image: "images/tomato.svg" },
  { id: "p24", name: "Banana",             unit: "6 pieces", category: "produce",  shopId: "s3", price: 30,  taxPct: 0,  extra: 0, stock: 17, image: "images/banana.svg" },

  { id: "p25", name: "Detergent powder",   unit: "1 kg",    category: "household", shopId: "s2", price: 102, taxPct: 18, extra: 0, stock: 13, image: "images/detergent.svg" },
  { id: "p26", name: "Bathing soap",       unit: "Pack of 3", category: "household", shopId: "s1", price: 84, taxPct: 5,  extra: 0, stock: 21, image: "images/soap.svg" },
  { id: "p27", name: "Dishwash bar",       unit: "300 g",   category: "household", shopId: "s2", price: 22,  taxPct: 18, extra: 0, stock: 28, image: "images/dishwash-bar.svg" },
];

/* Demo delivery partners (2 to 4 work well). */
const PARTNERS = [
  { id: "d1", name: "Rakesh Yadav",  vehicle: "Motorcycle", covers: ["chakia", "milki"],      hours: "7 am to 1 pm" },
  { id: "d2", name: "Imran Ansari",  vehicle: "Bicycle",    covers: ["jamalpur", "talibpur"], hours: "8 am to 6 pm" },
  { id: "d3", name: "Sunita Devi",   vehicle: "Scooter",    covers: ["milki", "jamalpur", "chakia", "talibpur"], hours: "2 pm to 8 pm" },
];

/* Simulated order statuses, in order. */
const ORDER_STATUSES = ["Order placed", "Confirmed by shop", "Packed", "Out for delivery", "Delivered"];

/* Social links. Replace "#"-style placeholders with your real pages. */
const SOCIAL_LINKS = [
  { name: "Facebook",  url: "https://www.facebook.com/" },
  { name: "Instagram", url: "https://www.instagram.com/" },
  { name: "WhatsApp",  url: "https://wa.me/919000000000" },
  { name: "YouTube",   url: "https://www.youtube.com/" },
];

/* =========================================================
   2. STATE AND STORAGE
   ========================================================= */

const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(CONFIG.storagePrefix + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(CONFIG.storagePrefix + key, JSON.stringify(value));
      return true;
    } catch (err) {
      return false; // storage full or blocked; the demo keeps working in memory
    }
  },
  clearAll() {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(CONFIG.storagePrefix))
        .forEach((k) => localStorage.removeItem(k));
    } catch (err) { /* ignore */ }
  },
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const state = {
  view: "customer",
  area: store.get("area", "all"),        // "all" or an active area id
  category: "all",
  search: "",
  products: store.get("products", clone(DEFAULT_PRODUCTS)),
  cart: store.get("cart", {}),           // { productId: quantity }
  orders: store.get("orders", []),
  trackedOrderId: store.get("tracked", null),
  activeShop: SHOPS[0].id,
  formImage: null,                       // image chosen in the shopkeeper form
  lastTrackedStatus: -1,
};

const saveProducts = () => store.set("products", state.products);
const saveCart = () => store.set("cart", state.cart);
const saveOrders = () => store.set("orders", state.orders);

/* =========================================================
   3. HELPERS
   ========================================================= */

const $ = (selector) => document.querySelector(selector);
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

function money(n) {
  const value = round2(n);
  return CONFIG.currency + (Number.isInteger(value) ? value : value.toFixed(2));
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
  ));
}

const activeAreas = () => AREAS.filter((a) => a.status === "active");
const plannedAreas = () => AREAS.filter((a) => a.status === "planned");
const areaById = (id) => AREAS.find((a) => a.id === id);
const shopById = (id) => SHOPS.find((s) => s.id === id);
const productById = (id) => state.products.find((p) => p.id === id);
const categoryById = (id) => CATEGORIES.find((c) => c.id === id);

/* Price of one unit, split into its parts. */
function priceParts(product) {
  const tax = round2(product.price * product.taxPct / 100);
  const total = round2(product.price + tax + product.extra);
  return { base: product.price, tax, extra: product.extra, total };
}

function breakupText(product) {
  const p = priceParts(product);
  const parts = ["Shop price " + money(p.base)];
  parts.push(product.taxPct > 0 ? "tax " + product.taxPct + "% " + money(p.tax) : "no tax");
  if (p.extra > 0) parts.push("packing " + money(p.extra));
  return parts.join(" + ");
}

let toastTimer;
function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}

/* =========================================================
   4. CUSTOMER PORTAL
   ========================================================= */

/* ---------- Hero price slip ---------- */
function renderPriceSlip() {
  const sample = state.products.find((p) => p.category === "snacks" && p.extra > 0) || state.products[0];
  if (!sample) { $("#priceSlip").innerHTML = ""; return; }
  const p = priceParts(sample);
  $("#priceSlip").innerHTML = `
    <h2>How a price is built</h2>
    <p class="slip-item">${escapeHtml(sample.name)}, ${escapeHtml(sample.unit)}</p>
    <dl>
      <div class="slip-line"><dt>Shop price</dt><dd>${money(p.base)}</dd></div>
      <div class="slip-line"><dt>Tax (${sample.taxPct}%)</dt><dd>${money(p.tax)}</dd></div>
      <div class="slip-line"><dt>Packing charge</dt><dd>${money(p.extra)}</dd></div>
      <div class="slip-line slip-total"><dt>You pay</dt><dd>${money(p.total)}</dd></div>
    </dl>
    <div class="slip-fees">
      <span>Delivery ${money(CONFIG.deliveryFee)} on orders below ${money(CONFIG.freeDeliveryAbove)}</span>
      <strong>Free delivery at ${money(CONFIG.freeDeliveryAbove)} and above</strong>
    </div>`;
}

/* ---------- Area selectors ---------- */
function renderAreaSelect() {
  const options = ['<option value="all">All service areas</option>']
    .concat(activeAreas().map((a) => `<option value="${a.id}">${escapeHtml(a.name)}</option>`));
  $("#areaSelect").innerHTML = options.join("");
  $("#areaSelect").value = state.area;
}

function setArea(areaId, moveMap) {
  state.area = areaId;
  store.set("area", areaId);
  $("#areaSelect").value = areaId;
  renderProducts();
  renderAreaList();
  if (moveMap) focusMapOn(areaId);
}

/* ---------- Categories ---------- */
function renderCategories() {
  const all = [{ id: "all", name: "All" }].concat(CATEGORIES);
  $("#categoryChips").innerHTML = all.map((c) => `
    <button type="button" class="chip" data-category="${c.id}" aria-pressed="${state.category === c.id}">
      ${escapeHtml(c.name)}
    </button>`).join("");
}

/* ---------- Product grid ---------- */
function visibleProducts() {
  const query = state.search.trim().toLowerCase();
  return state.products.filter((p) => {
    const shop = shopById(p.shopId);
    if (!shop) return false;
    if (state.area !== "all" && !shop.serves.includes(state.area)) return false;
    if (state.category !== "all" && p.category !== state.category) return false;
    if (query) {
      const cat = categoryById(p.category);
      const haystack = (p.name + " " + shop.name + " " + (cat ? cat.name : "")).toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

function actionHtml(product) {
  const qty = state.cart[product.id] || 0;
  if (product.stock <= 0) {
    return '<button type="button" class="btn btn-ghost" disabled>Out of stock</button>';
  }
  if (qty === 0) {
    return `<button type="button" class="btn btn-add" data-add="${product.id}">Add to cart</button>`;
  }
  return `
    <div class="stepper">
      <button type="button" data-dec="${product.id}" aria-label="Remove one ${escapeHtml(product.name)}">&minus;</button>
      <span aria-live="polite">${qty}</span>
      <button type="button" data-inc="${product.id}" aria-label="Add one ${escapeHtml(product.name)}" ${qty >= product.stock ? "disabled" : ""}>+</button>
    </div>`;
}

function renderProducts() {
  const list = visibleProducts();
  const area = areaById(state.area);
  $("#productsTitle").textContent = area ? "Products delivered to " + area.name : "Products from all shops";
  $("#resultCount").textContent = list.length + (list.length === 1 ? " product" : " products") +
    (area ? "" : ". Choose your area to see only what can reach you.");

  if (list.length === 0) {
    $("#productGrid").innerHTML = `
      <div class="empty">
        <strong>No products match.</strong>
        Clear the search, pick another category, or choose a different area.
      </div>`;
    return;
  }

  $("#productGrid").innerHTML = list.map((p) => {
    const shop = shopById(p.shopId);
    const parts = priceParts(p);
    let stockNote = "";
    if (p.stock <= 0) stockNote = '<p class="card-stock out">Out of stock</p>';
    else if (p.stock <= CONFIG.lowStockLevel) stockNote = `<p class="card-stock">Only ${p.stock} left</p>`;
    return `
      <article class="card">
        <div class="card-media">
          <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy" width="400" height="300">
        </div>
        <div class="card-body">
          <p class="card-shop">${escapeHtml(shop.name)}</p>
          <h3>${escapeHtml(p.name)}</h3>
          <p class="card-unit">${escapeHtml(p.unit)}</p>
          <p class="card-price">${money(parts.total)}</p>
          <p class="card-breakup">${escapeHtml(breakupText(p))}</p>
          ${stockNote}
          <div class="card-action">${actionHtml(p)}</div>
        </div>
      </article>`;
  }).join("");
}

/* ---------- Cart ---------- */
function sanitizeCart() {
  Object.keys(state.cart).forEach((id) => {
    const product = productById(id);
    if (!product || product.stock <= 0) { delete state.cart[id]; return; }
    if (state.cart[id] > product.stock) state.cart[id] = product.stock;
    if (state.cart[id] <= 0) delete state.cart[id];
  });
}

function changeQty(productId, delta) {
  const product = productById(productId);
  if (!product) return;
  const next = (state.cart[productId] || 0) + delta;
  if (next > product.stock) { toast("Only " + product.stock + " in stock."); return; }
  if (next <= 0) delete state.cart[productId];
  else state.cart[productId] = next;
  saveCart();
  renderProducts();
  renderCart();
}

/* Totals for the cart: item total, tax, extra charges, delivery fee. */
function cartTotals() {
  let base = 0, tax = 0, extra = 0, count = 0;
  Object.entries(state.cart).forEach(([id, qty]) => {
    const product = productById(id);
    if (!product) return;
    const p = priceParts(product);
    base += p.base * qty;
    tax += p.tax * qty;
    extra += p.extra * qty;
    count += qty;
  });
  base = round2(base); tax = round2(tax); extra = round2(extra);
  const subtotal = round2(base + tax + extra);
  const delivery = count === 0 || subtotal >= CONFIG.freeDeliveryAbove ? 0 : CONFIG.deliveryFee;
  return { base, tax, extra, subtotal, delivery, total: round2(subtotal + delivery), count };
}

function billHtml(t) {
  return `
    <div class="bill-line"><span>Item total (shop prices)</span><span>${money(t.base)}</span></div>
    <div class="bill-line"><span>Taxes</span><span>${money(t.tax)}</span></div>
    <div class="bill-line"><span>Packing and extra charges</span><span>${money(t.extra)}</span></div>
    <div class="bill-line"><span>Delivery fee</span>${t.delivery === 0 ? '<span class="free">Free</span>' : "<span>" + money(t.delivery) + "</span>"}</div>
    <div class="bill-line total"><span>To pay</span><span>${money(t.total)}</span></div>`;
}

function renderCart() {
  sanitizeCart();
  const t = cartTotals();
  $("#cartCount").textContent = t.count;

  // Mobile cart bar
  const bar = $("#cartBar");
  bar.hidden = t.count === 0;
  bar.innerHTML = `<span>${t.count} ${t.count === 1 ? "item" : "items"}, ${money(t.total)}</span><span>View cart</span>`;

  if (t.count === 0) {
    $("#cartBody").innerHTML = `
      <div class="empty" style="margin-top:16px">
        <strong>Your cart is empty.</strong>
        Add products from the shop list to start an order.
      </div>`;
    $("#cartFoot").innerHTML = "";
    return;
  }

  $("#cartBody").innerHTML = Object.entries(state.cart).map(([id, qty]) => {
    const product = productById(id);
    const p = priceParts(product);
    return `
      <div class="cart-line">
        <img src="${escapeHtml(product.image)}" alt="">
        <div>
          <h3>${escapeHtml(product.name)}</h3>
          <p>${escapeHtml(product.unit)}, ${escapeHtml(shopById(product.shopId).name)}</p>
          <p>${money(p.total)} each, incl. tax and charges</p>
        </div>
        <div class="cart-line-right">
          <span>${money(p.total * qty)}</span>
          <div class="stepper stepper-small">
            <button type="button" data-dec="${id}" aria-label="Remove one">&minus;</button>
            <span>${qty}</span>
            <button type="button" data-inc="${id}" aria-label="Add one" ${qty >= product.stock ? "disabled" : ""}>+</button>
          </div>
        </div>
      </div>`;
  }).join("");

  const remaining = round2(CONFIG.freeDeliveryAbove - t.subtotal);
  const percent = Math.min(100, Math.round(t.subtotal / CONFIG.freeDeliveryAbove * 100));
  const progressText = remaining > 0
    ? `Add ${money(remaining)} more for free delivery.`
    : "You have free delivery on this order.";

  $("#cartFoot").innerHTML = `
    <div class="progress">
      <span>${progressText}</span>
      <div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div>
    </div>
    <div class="bill">${billHtml(t)}</div>
    <button type="button" class="btn btn-primary btn-block" id="goCheckout">Go to checkout</button>`;
}

function openCart() {
  $("#overlay").hidden = false;
  $("#cartDrawer").hidden = false;
  $("#closeCart").focus();
}

function closeCart() {
  $("#overlay").hidden = true;
  $("#cartDrawer").hidden = true;
}

/* ---------- Checkout ---------- */
function openCheckout() {
  if (cartTotals().count === 0) return;
  closeCart();
  $("#coArea").innerHTML = '<option value="">Choose your area</option>' +
    activeAreas().map((a) => `<option value="${a.id}">${escapeHtml(a.name)}</option>`).join("");
  $("#coArea").value = state.area === "all" ? "" : state.area;
  $("#checkoutBill").innerHTML = billHtml(cartTotals());
  $("#coError").textContent = "";
  const dialog = $("#checkoutDialog");
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
}

function closeCheckout() {
  const dialog = $("#checkoutDialog");
  if (typeof dialog.close === "function" && dialog.open) dialog.close();
  else dialog.removeAttribute("open");
}

function nextOrderId() {
  let id;
  do {
    id = CONFIG.orderPrefix + Math.floor(10000 + Math.random() * 90000);
  } while (state.orders.some((o) => o.id === id));
  return id;
}

function placeOrder(event) {
  event.preventDefault();
  const name = $("#coName").value.trim();
  const phone = $("#coPhone").value.trim();
  const areaId = $("#coArea").value;
  const address = $("#coAddress").value.trim();
  const payment = document.querySelector('input[name="coPay"]:checked').value;
  const error = $("#coError");

  if (name.length < 2) { error.textContent = "Enter your full name."; return; }
  if (!/^[6-9]\d{9}$/.test(phone)) { error.textContent = "Enter a 10-digit mobile number starting with 6, 7, 8 or 9."; return; }
  if (!areaId) { error.textContent = "Choose your delivery area."; return; }
  if (address.length < 5) { error.textContent = "Enter your address with a nearby landmark."; return; }

  sanitizeCart();
  const lines = Object.entries(state.cart).map(([id, qty]) => ({ product: productById(id), qty }));
  if (lines.length === 0) { error.textContent = "Your cart is empty."; return; }

  // Shop coverage check: every product's shop must serve the chosen area.
  const blocked = lines.filter((l) => !shopById(l.product.shopId).serves.includes(areaId));
  if (blocked.length > 0) {
    error.textContent = "These items are from shops that do not deliver to " + areaById(areaId).name +
      ": " + blocked.map((l) => l.product.name).join(", ") + ". Remove them from the cart or choose another area.";
    return;
  }

  const totals = cartTotals();
  const eligible = PARTNERS.filter((d) => d.covers.includes(areaId));
  const partner = (eligible.length ? eligible : PARTNERS)[Math.floor(Math.random() * (eligible.length || PARTNERS.length))];

  const order = {
    id: nextOrderId(),
    createdAt: Date.now(),
    skips: 0,
    customer: { name, phone, address },
    areaId,
    payment,
    partnerId: partner.id,
    totals,
    items: lines.map((l) => ({ name: l.product.name, unit: l.product.unit, qty: l.qty, total: round2(priceParts(l.product).total * l.qty) })),
  };

  // Reduce demo stock
  lines.forEach((l) => { l.product.stock = Math.max(0, l.product.stock - l.qty); });
  saveProducts();

  state.orders.unshift(order);
  state.orders = state.orders.slice(0, 20);
  saveOrders();

  state.cart = {};
  saveCart();

  closeCheckout();
  $("#checkoutForm").reset();
  renderProducts();
  renderCart();
  renderShopkeeper();
  trackOrder(order.id);
  $("#track").scrollIntoView();
  toast("Demo order " + order.id + " placed.");
}

/* =========================================================
   5. SERVICE AREAS AND MAP
   ========================================================= */

let map = null;
const markers = {};

function renderAreaList() {
  $("#areaList").innerHTML = activeAreas().map((a) => {
    const shopCount = SHOPS.filter((s) => s.serves.includes(a.id)).length;
    return `
      <button type="button" class="area-btn" data-area="${a.id}" aria-pressed="${state.area === a.id}">
        <strong>${escapeHtml(a.name)}</strong>
        <span>${shopCount} ${shopCount === 1 ? "shop delivers" : "shops deliver"} here</span>
      </button>`;
  }).join("");
  $("#plannedList").innerHTML = plannedAreas().map((a) => `<li>${escapeHtml(a.name)}</li>`).join("");
}

function initMap() {
  const el = $("#map");
  if (typeof L === "undefined") {
    el.innerHTML = '<div class="map-fallback">The map could not load. Check your internet connection and reload the page.</div>';
    return;
  }

  map = L.map(el, { scrollWheelZoom: false });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  AREAS.forEach((a) => {
    const active = a.status === "active";
    const marker = L.circleMarker([a.lat, a.lng], {
      radius: active ? 10 : 7,
      color: active ? "#2b4acb" : "#55607a",
      weight: 2,
      fillColor: active ? "#2b4acb" : "#ffffff",
      fillOpacity: active ? 0.85 : 1,
    }).addTo(map);

    const shops = SHOPS.filter((s) => s.serves.includes(a.id)).map((s) => escapeHtml(s.name));
    marker.bindPopup(active
      ? `<strong>${escapeHtml(a.name)}</strong><br>Service area<br>${shops.length ? "Shops: " + shops.join(", ") : "No shops yet"}<br><em>Approximate location</em>`
      : `<strong>${escapeHtml(a.name)}</strong><br>Planned, not serviceable yet<br><em>Approximate location</em>`);
    marker.bindTooltip(a.name, { permanent: active, direction: "top", offset: [0, -8] });
    if (active) marker.on("click", () => setArea(a.id, false));
    markers[a.id] = marker;
  });

  focusMapOn(state.area);
}

function focusMapOn(areaId) {
  if (!map) return;
  const area = areaById(areaId);
  if (area) {
    map.setView([area.lat, area.lng], 14);
    markers[area.id].openPopup();
  } else {
    map.fitBounds(activeAreas().map((a) => [a.lat, a.lng]), { padding: [40, 40] });
  }
}

function showAllOnMap() {
  if (!map) return;
  map.closePopup();
  map.fitBounds(AREAS.map((a) => [a.lat, a.lng]), { padding: [30, 30] });
}

/* =========================================================
   6. DELIVERY PARTNERS AND ORDER TRACKING
   ========================================================= */

function renderDelivery() {
  $("#feeRow").innerHTML = `
    <div class="fee">
      <strong>${money(CONFIG.deliveryFee)} delivery</strong>
      <span class="muted">On orders below ${money(CONFIG.freeDeliveryAbove)}</span>
    </div>
    <div class="fee fee-free">
      <strong>Free delivery</strong>
      <span>On orders of ${money(CONFIG.freeDeliveryAbove)} and above</span>
    </div>`;

  $("#partnerGrid").innerHTML = PARTNERS.map((d) => {
    const initials = d.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
    const covers = d.covers.map((id) => areaById(id)).filter(Boolean).map((a) => a.name).join(", ");
    return `
      <div class="partner">
        <div class="avatar" aria-hidden="true">${escapeHtml(initials)}</div>
        <div>
          <h3>${escapeHtml(d.name)}</h3>
          <p>${escapeHtml(d.vehicle)}, ${escapeHtml(d.hours)}</p>
          <p>Covers ${escapeHtml(covers)}</p>
        </div>
      </div>`;
  }).join("");
}

/* Status index is worked out from the order time, so it survives reloads. */
function statusIndex(order) {
  const elapsed = (Date.now() - order.createdAt) / 1000;
  const index = Math.floor(elapsed / CONFIG.statusStepSeconds) + (order.skips || 0);
  return Math.min(ORDER_STATUSES.length - 1, index);
}

function trackOrder(orderId) {
  state.trackedOrderId = orderId;
  state.lastTrackedStatus = -1;
  store.set("tracked", orderId);
  renderTracking();
}

function renderTracking() {
  const box = $("#trackResult");
  if (!state.trackedOrderId) { box.innerHTML = ""; return; }

  const order = state.orders.find((o) => o.id === state.trackedOrderId);
  if (!order) {
    if (state.lastTrackedStatus === -2) return; // message already shown
    state.lastTrackedStatus = -2;
    box.innerHTML = `
      <div class="track-card">
        <strong>No order found for ${escapeHtml(state.trackedOrderId)}.</strong>
        <p class="muted small">Check the number and try again. Demo orders are saved only in this browser.</p>
      </div>`;
    return;
  }

  const index = statusIndex(order);
  if (index === state.lastTrackedStatus) return; // nothing changed, skip re-drawing
  state.lastTrackedStatus = index;

  const partner = PARTNERS.find((d) => d.id === order.partnerId) || PARTNERS[0];
  const area = areaById(order.areaId);
  const done = index === ORDER_STATUSES.length - 1;

  box.innerHTML = `
    <div class="track-card">
      <div class="track-meta">
        <strong>Order ${escapeHtml(order.id)}</strong>
        <span>${money(order.totals.total)}, ${escapeHtml(order.payment)}</span>
      </div>
      <ol class="steps">
        ${ORDER_STATUSES.map((label, i) => `
          <li class="${i < index || (done && i === index) ? "done" : i === index ? "current" : ""}">${label}</li>`).join("")}
      </ol>
      <div class="track-foot">
        <span>
          ${order.items.reduce((sum, it) => sum + it.qty, 0)} items to ${escapeHtml(area ? area.name : "")}.
          Delivery partner: ${escapeHtml(partner.name)} (${escapeHtml(partner.vehicle)}).
        </span>
        ${done ? "" : '<button type="button" class="btn btn-ghost btn-small" id="skipStatus">Skip to next status</button>'}
      </div>
    </div>`;
}

/* =========================================================
   7. SHOPKEEPER PORTAL
   ========================================================= */

function renderShopSelect() {
  $("#shopSelect").innerHTML = SHOPS.map((s) => {
    const area = areaById(s.areaId);
    return `<option value="${s.id}">${escapeHtml(s.name)}${area ? ", " + escapeHtml(area.name) : ""}</option>`;
  }).join("");
  $("#shopSelect").value = state.activeShop;
  $("#pfCategory").innerHTML = CATEGORIES.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
}

function renderShopkeeper() {
  const shop = shopById(state.activeShop);
  const items = state.products.filter((p) => p.shopId === shop.id);
  const low = items.filter((p) => p.stock > 0 && p.stock <= CONFIG.lowStockLevel).length;
  const out = items.filter((p) => p.stock <= 0).length;
  const value = items.reduce((sum, p) => sum + p.price * p.stock, 0);
  const serves = shop.serves.map((id) => areaById(id)).filter(Boolean).map((a) => a.name).join(", ");

  $("#shopStats").innerHTML = `
    <div class="stat"><strong>${items.length}</strong><span>Products listed</span></div>
    <div class="stat"><strong>${low}</strong><span>Low on stock</span></div>
    <div class="stat"><strong>${out}</strong><span>Out of stock</span></div>
    <div class="stat"><strong>${money(value)}</strong><span>Stock value at shop price. Delivers to ${escapeHtml(serves)}.</span></div>`;

  if (items.length === 0) {
    $("#inventoryBody").innerHTML = '<tr><td colspan="7" class="muted">No products yet. Use the form to list your first product.</td></tr>';
    return;
  }

  $("#inventoryBody").innerHTML = items.map((p) => {
    const parts = priceParts(p);
    let tag = "";
    if (p.stock <= 0) tag = '<span class="tag tag-out">Out</span>';
    else if (p.stock <= CONFIG.lowStockLevel) tag = '<span class="tag tag-low">Low</span>';
    return `
      <tr>
        <td>
          <div class="inv-product">
            <img src="${escapeHtml(p.image)}" alt="">
            <div>${escapeHtml(p.name)}<small>${escapeHtml(p.unit)}</small></div>
          </div>
        </td>
        <td class="num">${money(parts.base)}</td>
        <td class="num">${p.taxPct}% (${money(parts.tax)})</td>
        <td class="num">${money(parts.extra)}</td>
        <td class="num"><strong>${money(parts.total)}</strong></td>
        <td>
          <div class="inv-stock">
            <button type="button" data-stock-dec="${p.id}" aria-label="Reduce stock of ${escapeHtml(p.name)}">&minus;</button>
            <b>${p.stock}</b>
            <button type="button" data-stock-inc="${p.id}" aria-label="Increase stock of ${escapeHtml(p.name)}">+</button>
            ${tag}
          </div>
        </td>
        <td>
          <div class="inv-actions">
            <button type="button" class="link-btn" data-edit="${p.id}">Edit</button>
            <button type="button" class="link-btn danger" data-delete="${p.id}">Delete</button>
          </div>
        </td>
      </tr>`;
  }).join("");
}

function changeStock(productId, delta) {
  const product = productById(productId);
  if (!product) return;
  product.stock = Math.max(0, product.stock + delta);
  saveProducts();
  refreshAfterProductChange();
}

function refreshAfterProductChange() {
  renderShopkeeper();
  renderProducts();
  renderCart();
  renderPriceSlip();
}

function updateFormTotal() {
  const price = parseFloat($("#pfPrice").value) || 0;
  const taxPct = parseFloat($("#pfTax").value) || 0;
  const extra = parseFloat($("#pfExtra").value) || 0;
  const total = priceParts({ price, taxPct, extra }).total;
  $("#pfTotal").textContent = "Customer pays " + money(total) + " (shop price + tax + extra charge)";
}

function resetProductForm() {
  $("#productForm").reset();
  $("#pfId").value = "";
  state.formImage = null;
  $("#pfPreview").src = "images/placeholder.svg";
  $("#formTitle").textContent = "List a product";
  $("#pfSubmit").textContent = "List product";
  $("#pfCancel").hidden = true;
  $("#pfError").textContent = "";
  updateFormTotal();
}

function startEdit(productId) {
  const p = productById(productId);
  if (!p) return;
  $("#pfId").value = p.id;
  $("#pfName").value = p.name;
  $("#pfUnit").value = p.unit;
  $("#pfCategory").value = p.category;
  $("#pfPrice").value = p.price;
  $("#pfTax").value = p.taxPct;
  $("#pfExtra").value = p.extra;
  $("#pfStock").value = p.stock;
  $("#pfImage").value = "";
  state.formImage = null;
  $("#pfPreview").src = p.image;
  $("#formTitle").textContent = "Edit product";
  $("#pfSubmit").textContent = "Save changes";
  $("#pfCancel").hidden = false;
  $("#pfError").textContent = "";
  updateFormTotal();
  $("#productForm").scrollIntoView({ block: "start" });
  $("#pfName").focus();
}

/* Shrinks the chosen photo to a 400px square so it fits in localStorage. */
function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("not an image"));
      img.onload = () => {
        const size = 400;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function submitProductForm(event) {
  event.preventDefault();
  const error = $("#pfError");
  const name = $("#pfName").value.trim();
  const unit = $("#pfUnit").value.trim();
  const price = parseFloat($("#pfPrice").value);
  const taxPct = parseFloat($("#pfTax").value);
  const extra = parseFloat($("#pfExtra").value);
  const stock = parseInt($("#pfStock").value, 10);

  if (name.length < 2) { error.textContent = "Enter the product name."; return; }
  if (!unit) { error.textContent = "Enter the pack size, for example 500 g."; return; }
  if (!(price > 0)) { error.textContent = "Enter a shop price above 0."; return; }
  if (!(taxPct >= 0 && taxPct <= 40)) { error.textContent = "Enter a tax percentage between 0 and 40."; return; }
  if (!(extra >= 0)) { error.textContent = "Enter an extra charge of 0 or more."; return; }
  if (!(stock >= 0)) { error.textContent = "Enter stock of 0 or more."; return; }

  const editingId = $("#pfId").value;
  const fields = {
    name, unit,
    category: $("#pfCategory").value,
    price: round2(price), taxPct: round2(taxPct), extra: round2(extra), stock,
  };

  if (editingId) {
    const product = productById(editingId);
    Object.assign(product, fields);
    if (state.formImage) product.image = state.formImage;
    toast("Saved changes to " + name + ".");
  } else {
    state.products.unshift(Object.assign({
      id: "p" + Date.now(),
      shopId: state.activeShop,
      image: state.formImage || "images/placeholder.svg",
    }, fields));
    toast("Listed " + name + ".");
  }

  if (!saveProducts()) {
    toast("Saved for this visit only. Browser storage is full or blocked.");
  }
  resetProductForm();
  refreshAfterProductChange();
}

/* =========================================================
   8. START-UP: views, events, first render
   ========================================================= */

function setView(view) {
  state.view = view;
  document.body.dataset.view = view;
  document.querySelectorAll("[data-panel]").forEach((el) => { el.hidden = el.dataset.panel !== view; });
  document.querySelectorAll("[data-view-btn]").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.viewBtn === view));
  });
  if (view === "customer" && map) setTimeout(() => map.invalidateSize(), 50);
  if (view === "shopkeeper") window.scrollTo(0, 0);
}

function bindEvents() {
  // Portal switch and nav links
  document.addEventListener("click", (event) => {
    const viewBtn = event.target.closest("[data-view-btn]");
    if (viewBtn) { setView(viewBtn.dataset.viewBtn); return; }
    const go = event.target.closest("[data-go]");
    if (go && state.view !== go.dataset.go) setView(go.dataset.go);
  });

  // Area, search, categories
  $("#areaSelect").addEventListener("change", (e) => setArea(e.target.value, true));
  $("#searchInput").addEventListener("input", (e) => { state.search = e.target.value; renderProducts(); });
  $("#categoryChips").addEventListener("click", (e) => {
    const chip = e.target.closest("[data-category]");
    if (!chip) return;
    state.category = chip.dataset.category;
    renderCategories();
    renderProducts();
  });

  // Add, plus and minus buttons (product grid and cart)
  const qtyHandler = (e) => {
    const add = e.target.closest("[data-add]");
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    if (add) changeQty(add.dataset.add, 1);
    else if (inc) changeQty(inc.dataset.inc, 1);
    else if (dec) changeQty(dec.dataset.dec, -1);
  };
  $("#productGrid").addEventListener("click", qtyHandler);
  $("#cartBody").addEventListener("click", qtyHandler);

  // Cart drawer
  $("#cartButton").addEventListener("click", openCart);
  $("#cartBar").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", closeCart);
  $("#overlay").addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });
  $("#cartFoot").addEventListener("click", (e) => { if (e.target.closest("#goCheckout")) openCheckout(); });

  // Checkout
  $("#closeCheckout").addEventListener("click", closeCheckout);
  $("#checkoutForm").addEventListener("submit", placeOrder);
  $("#coPhone").addEventListener("input", (e) => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10); });

  // Service areas
  $("#areaList").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-area]");
    if (btn) setArea(btn.dataset.area, true);
  });
  $("#showAllMap").addEventListener("click", showAllOnMap);

  // Tracking
  $("#trackForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = $("#trackInput").value.trim().toUpperCase();
    if (!id) { toast("Enter an order number."); return; }
    trackOrder(id);
  });
  $("#trackResult").addEventListener("click", (e) => {
    if (!e.target.closest("#skipStatus")) return;
    const order = state.orders.find((o) => o.id === state.trackedOrderId);
    if (!order) return;
    order.skips = (order.skips || 0) + 1;
    saveOrders();
    renderTracking();
  });
  setInterval(renderTracking, 1000); // moves the simulated status forward

  // Shopkeeper portal
  $("#shopSelect").addEventListener("change", (e) => {
    state.activeShop = e.target.value;
    resetProductForm();
    renderShopkeeper();
  });
  $("#productForm").addEventListener("submit", submitProductForm);
  $("#pfCancel").addEventListener("click", resetProductForm);
  ["#pfPrice", "#pfTax", "#pfExtra"].forEach((sel) => $(sel).addEventListener("input", updateFormTotal));
  $("#pfImage").addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    readImage(file)
      .then((dataUrl) => { state.formImage = dataUrl; $("#pfPreview").src = dataUrl; })
      .catch(() => { $("#pfError").textContent = "That file could not be read as an image. Choose a JPG or PNG photo."; });
  });
  $("#inventoryBody").addEventListener("click", (e) => {
    const inc = e.target.closest("[data-stock-inc]");
    const dec = e.target.closest("[data-stock-dec]");
    const edit = e.target.closest("[data-edit]");
    const del = e.target.closest("[data-delete]");
    if (inc) changeStock(inc.dataset.stockInc, 1);
    else if (dec) changeStock(dec.dataset.stockDec, -1);
    else if (edit) startEdit(edit.dataset.edit);
    else if (del) {
      const product = productById(del.dataset.delete);
      if (product && window.confirm("Delete " + product.name + " from your shop?")) {
        state.products = state.products.filter((p) => p.id !== product.id);
        saveProducts();
        if ($("#pfId").value === product.id) resetProductForm();
        refreshAfterProductChange();
        toast("Deleted " + product.name + ".");
      }
    }
  });
  $("#resetDemo").addEventListener("click", () => {
    if (!window.confirm("Reset all demo data? This restores the sample products and clears the cart and demo orders.")) return;
    store.clearAll();
    state.products = clone(DEFAULT_PRODUCTS);
    state.cart = {};
    state.orders = [];
    state.trackedOrderId = null;
    resetProductForm();
    refreshAfterProductChange();
    renderTracking();
    toast("Demo data reset.");
  });
}

function init() {
  // If a saved area no longer exists, fall back to all areas
  if (state.area !== "all" && !activeAreas().some((a) => a.id === state.area)) state.area = "all";

  renderPriceSlip();
  renderAreaSelect();
  renderCategories();
  renderProducts();
  renderCart();
  renderAreaList();
  renderDelivery();
  renderTracking();
  renderShopSelect();
  renderShopkeeper();
  updateFormTotal();

  $("#socialLinks").innerHTML = SOCIAL_LINKS.map((s) =>
    `<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.name)}</a></li>`).join("");
  $("#contactLine").textContent = CONFIG.contact;

  bindEvents();
  initMap();
}

document.addEventListener("DOMContentLoaded", init);
