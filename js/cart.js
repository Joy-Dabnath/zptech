(() => {
  const KEY = "zp_cart";
  const CUR = "$";

  // Demo items shown on first visit. Replace prices/names, or set to [] for an empty cart.
  const DEMO = [
    { id: "core",   name: "ZP Core Powders",          price: 49, qty: 1, img: "img/zp-core.png" },
    { id: "flux",   name: "Day & Night Flux Capsules", price: 39, qty: 2, img: "img/day-night-flux.png" },
    { id: "strata", name: "Strataflux Skincare Oil",   price: 59, qty: 1, img: "img/strataflux.png" }
  ];

  let items = null;
  try { items = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
  if (!Array.isArray(items)) items = DEMO.map(i => ({ ...i }));

  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} };
  const money = n => CUR + n.toFixed(2);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ----- Build drawer markup -----
  const overlay = document.createElement("div");
  overlay.className = "zpc-overlay";

  const drawer = document.createElement("aside");
  drawer.className = "zpc-drawer";
  drawer.setAttribute("role", "dialog");
  drawer.setAttribute("aria-label", "Shopping cart");
  drawer.innerHTML = `
    <div class="zpc-head">
      <h3 class="zpc-title">Your Cart <span id="zpcCount">(0)</span></h3>
      <button class="zpc-close" aria-label="Close cart"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <ul class="zpc-list" id="zpcList"></ul>
    <div class="zpc-foot" id="zpcFoot">
      <div class="zpc-row"><span>Subtotal</span><span id="zpcSub">$0.00</span></div>
      <div class="zpc-row"><span>Shipping</span><span>Calculated at checkout</span></div>
      <div class="zpc-row total"><span>Total</span><span id="zpcTotal">$0.00</span></div>
      <a href="https://www.zptech.net/cart/" class="zpc-btn ghost">View Cart</a>
      <a href="https://www.zptech.net/checkout/" class="zpc-btn primary">Checkout</a>
    </div>`;
  document.body.append(overlay, drawer);

  const list = drawer.querySelector("#zpcList");
  const foot = drawer.querySelector("#zpcFoot");

  // ----- Render -----
  const render = () => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const sub = items.reduce((s, i) => s + i.qty * i.price, 0);

    drawer.querySelector("#zpcCount").textContent = `(${count})`;
    drawer.querySelector("#zpcSub").textContent = money(sub);
    drawer.querySelector("#zpcTotal").textContent = money(sub);
    document.querySelectorAll(".cart-count, .zpf-cart-badge").forEach(b => (b.textContent = count));
    foot.classList.toggle("hidden", !items.length);

    list.innerHTML = items.length
      ? items.map(i => `
        <li class="zpc-item">
          <img src="${esc(i.img)}" alt="${esc(i.name)}">
          <div>
            <div class="zpc-name">${esc(i.name)}</div>
            <div class="zpc-price">${money(i.price)}</div>
            <div class="zpc-qty">
              <button data-act="dec" data-id="${esc(i.id)}" aria-label="Decrease quantity">−</button>
              <span>${i.qty}</span>
              <button data-act="inc" data-id="${esc(i.id)}" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <div>
            <div class="zpc-line">${money(i.qty * i.price)}</div>
            <button class="zpc-remove" data-act="rm" data-id="${esc(i.id)}">Remove</button>
          </div>
        </li>`).join("")
      : `<li class="zpc-empty"><i class="fa-solid fa-cart-shopping"></i>Your cart is empty.</li>`;
  };

  // ----- Open / close -----
  let lastFocus = null;
  const open = () => {
    lastFocus = document.activeElement;
    overlay.classList.add("open");
    drawer.classList.add("open");
    document.body.classList.add("zpc-lock");
    drawer.querySelector(".zpc-close").focus();
  };
  const close = () => {
    overlay.classList.remove("open");
    drawer.classList.remove("open");
    document.body.classList.remove("zpc-lock");
    if (lastFocus) lastFocus.focus();
  };

  // Navbar cart icon + floating cart open the drawer
  document.addEventListener("click", e => {
    if (e.target.closest(".cart-icon, .zpf-floating-cart")) {
      e.preventDefault();
      open();
    }
  });
  overlay.addEventListener("click", close);
  drawer.querySelector(".zpc-close").addEventListener("click", close);
  document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });

  // Quantity / remove
  list.addEventListener("click", e => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const item = items.find(i => i.id === btn.dataset.id);
    if (!item) return;
    if (btn.dataset.act === "inc") item.qty++;
    if (btn.dataset.act === "dec") item.qty = Math.max(1, item.qty - 1);
    if (btn.dataset.act === "rm") items = items.filter(i => i !== item);
    save();
    render();
  });

  // Public API: ZPCart.add({id, name, price, img}) from any "Add to cart" button
  window.ZPCart = {
    add(p) {
      const found = items.find(i => i.id === p.id);
      if (found) found.qty++;
      else items.push({ qty: 1, ...p });
      save();
      render();
      open();
    },
    open,
    close
  };

  render();
})();
