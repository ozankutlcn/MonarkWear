/* ==========================================================================
   MONARK WEAR · A · SAHA — shared behaviour (assets/js/site.js)
   Classic script. Load order at end of <body>:
     <script src="assets/js/data.js"></script>
     <script src="assets/js/site.js"></script>
     <script> page-specific code (use window.Monark) </script>

   Each page provides in markup: SVG sprite, .marquee, header.header, main#main,
   footer.footer, a.wa-float. site.js INJECTS: #menu, #search, #cart dialogs + toast.
   Any <a data-wa="message"> gets its href rebuilt from config.whatsapp.

   window.Monark API
   --------------------------------------------------------------------------
   data                          window.MONARK (products, categories, colors, config)
   config                        shortcut to data.config
   formatPrice(n)                -> "3.490 TL"
   esc(str)                      HTML-escape
   trLower(str)                  Turkish-aware lowercase (search)
   icon(name, cls?)              -> '<svg class="icon ..."><use href="#i-name"/></svg>'
   imgSrc(image, width?)         resolve {src}|{u} image object to URL
   getProduct(id)                -> product | null
   getCategory(id)               -> category | null
   productsIn(catId)             -> products whose cats include catId ('hepsi' = all)
   searchProducts(query)         -> matching products (name, category, colour)
   sizesOf(product)              -> [{size, available}] in standard order
   productUrl(id) / categoryUrl(kat) / searchUrl(q)
   waLink(text)                  -> https://wa.me/<config.whatsapp>?text=...
   renderCard(product, opts?)    -> '<li class="card">…' (opts: {eager, headingTag})
   renderLine(line, opts?)       -> '<li class="cline">…' (opts: {large})
   shipBar(subtotal)             -> free-shipping progress HTML
   qtyHTML(value, opts?)         -> qty stepper HTML (opts: {min,max,label,key})
   cart.items()                  -> [{key,id,color,size,qty, product,colorHex,price,total}]
   cart.add(id,{size,color?,qty?}) -> line | null (null when size missing/unavailable)
   cart.remove(key) / cart.updateQty(key,qty) / cart.clear()
   cart.count() / cart.subtotal() / cart.freeShipLeft()
   cartMessage(note?)            -> WhatsApp order text for all lines + total
   openCart(opener?) / closeCart()
   openDialog(dialogEl, opener?) shared modal handling (focus return, scroll lock)
   toast(title, {text?, action?:{label, onClick?|href?}, duration?})
   recent.add(id) / recent.list() 'Son Baktıkların' (localStorage monark_recent)

   Events (dispatched on document):
   "monark:cart"  detail {action:'add'|'remove'|'qty'|'clear'|'sync', line, count, subtotal}
   ========================================================================== */
(function(){
  "use strict";

  var D = window.MONARK || { products:[], categories:[], colors:{}, sizeOrder:["S","M","L","XL","XXL"], config:{} };
  var CFG = D.config || {};
  var FREE = CFG.freeShip || 2999;
  var MAXQ = CFG.maxQty || 10;
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Utilities ---------- */
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]; }); }
  function trLower(s){ return String(s || "").toLocaleLowerCase("tr-TR"); }
  function formatPrice(n){ return Math.round(Number(n) || 0).toLocaleString("tr-TR") + " TL"; }
  function icon(name, cls){ return '<svg class="icon' + (cls ? " " + cls : "") + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>'; }
  function imgSrc(im, w){
    if (!im) return "";
    if (im.src) return im.src;
    if (im.u) return "https://images.unsplash.com/" + im.u + "?w=" + (w || 600) + "&q=80&auto=format&fit=crop";
    return "";
  }
  function waLink(text){ return "https://wa.me/" + (CFG.whatsapp || "") + (text ? "?text=" + encodeURIComponent(text) : ""); }
  function productUrl(id){ return "urun.html?id=" + encodeURIComponent(id); }
  function categoryUrl(kat){ return "koleksiyon.html" + (kat && kat !== "hepsi" ? "?kat=" + encodeURIComponent(kat) : ""); }
  function searchUrl(q){ return "koleksiyon.html?q=" + encodeURIComponent(q); }
  function $(id){ return document.getElementById(id); }

  var byId = {};
  D.products.forEach(function(p){ byId[p.id] = p; });
  function getProduct(id){ return byId[id] || null; }
  function getCategory(id){ for (var i = 0; i < D.categories.length; i++){ if (D.categories[i].id === id) return D.categories[i]; } return null; }
  function productsIn(cat){
    if (!cat || cat === "hepsi") return D.products.slice();
    return D.products.filter(function(p){ return (p.cats || [p.cat]).indexOf(cat) > -1; });
  }
  function sizesOf(p){
    return (D.sizeOrder || []).filter(function(s){ return p.sizes && s in p.sizes; })
      .map(function(s){ return { size:s, available:!!p.sizes[s] }; });
  }
  function colorHex(p, name){
    for (var i = 0; i < p.colors.length; i++){ if (p.colors[i].name === name) return p.colors[i].hex; }
    return "#ccc";
  }
  function haystack(p){
    var cats = (p.cats || [p.cat]).map(function(c){ var k = getCategory(c); return k ? k.name + " " + k.short : c; }).join(" ");
    var extra = (p.cats || []).indexOf("tisort") > -1 ? " tisort t-shirt" : "";
    return trLower(p.name + " " + cats + extra + " " + p.colors.map(function(c){ return c.name; }).join(" ") + " " + (p.fit || ""));
  }
  function searchProducts(q){
    var terms = trLower(q).trim().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return D.products.filter(function(p){ var h = haystack(p); return terms.every(function(t){ return h.indexOf(t) > -1; }); });
  }

  /* ---------- Storage (UI demo only) ---------- */
  var mem = {};
  function load(key, fallback){
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e){ return key in mem ? mem[key] : fallback; }
  }
  function save(key, val){
    mem[key] = val;
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e){}
  }

  /* ---------- Cart store ---------- */
  var CART_KEY = "monark_cart";
  function rawLines(){
    var v = load(CART_KEY, []);
    if (!Array.isArray(v)) return [];
    return v.filter(function(l){ return l && byId[l.id] && l.size && l.qty > 0; });
  }
  function emit(action, line){
    var detail = { action:action, line:line || null, count:cart.count(), subtotal:cart.subtotal() };
    var ev;
    try { ev = new CustomEvent("monark:cart", { detail:detail }); }
    catch (e){ ev = document.createEvent("CustomEvent"); ev.initCustomEvent("monark:cart", false, false, detail); }
    document.dispatchEvent(ev);
  }
  function enrich(l){
    var p = byId[l.id];
    return { key:l.key, id:l.id, color:l.color, size:l.size, qty:l.qty, product:p, colorHex:colorHex(p, l.color), price:p.price, total:p.price * l.qty };
  }
  var cart = {
    items: function(){ return rawLines().map(enrich); },
    add: function(id, o){
      o = o || {};
      var p = byId[id]; if (!p) return null;
      var size = o.size;
      if (!size || !p.sizes[size]) return null;
      var color = o.color || p.colors[0].name;
      var qty = Math.max(1, Math.min(MAXQ, parseInt(o.qty, 10) || 1));
      var key = id + "|" + color + "|" + size;
      var lines = rawLines(), hit = null;
      lines.forEach(function(l){ if (l.key === key) hit = l; });
      if (hit) hit.qty = Math.min(MAXQ, hit.qty + qty);
      else { hit = { key:key, id:id, color:color, size:size, qty:qty }; lines.push(hit); }
      save(CART_KEY, lines);
      var line = enrich(hit); line.added = qty;
      emit("add", line);
      return line;
    },
    remove: function(key){
      var lines = rawLines(), gone = null;
      lines = lines.filter(function(l){ if (l.key === key){ gone = l; return false; } return true; });
      save(CART_KEY, lines);
      emit("remove", gone ? enrich(gone) : null);
    },
    updateQty: function(key, qty){
      qty = parseInt(qty, 10);
      if (!(qty > 0)) return cart.remove(key);
      var lines = rawLines(), hit = null;
      lines.forEach(function(l){ if (l.key === key){ l.qty = Math.min(MAXQ, qty); hit = l; } });
      save(CART_KEY, lines);
      emit("qty", hit ? enrich(hit) : null);
    },
    clear: function(){ save(CART_KEY, []); emit("clear"); },
    count: function(){ return rawLines().reduce(function(n, l){ return n + l.qty; }, 0); },
    subtotal: function(){ return rawLines().reduce(function(n, l){ return n + byId[l.id].price * l.qty; }, 0); },
    freeShipLeft: function(){ return Math.max(0, FREE - cart.subtotal()); }
  };
  window.addEventListener("storage", function(e){ if (e.key === CART_KEY) emit("sync"); });

  function cartMessage(note){
    var items = cart.items();
    var sub = cart.subtotal();
    var out = ["Merhaba, sipariş vermek istiyorum:", ""];
    items.forEach(function(l, i){
      out.push((i + 1) + ") " + l.product.name + " — " + l.color + ", " + l.size + " beden × " + l.qty + " = " + formatPrice(l.total));
    });
    out.push("", "Ara toplam: " + formatPrice(sub));
    out.push("Kargo: " + (sub >= FREE ? "Ücretsiz" : "Hesaplanacak"));
    if (note && String(note).trim()) out.push("", "Not: " + String(note).trim());
    return out.join("\n");
  }

  /* ---------- Recently viewed ---------- */
  var recent = {
    add: function(id){
      if (!byId[id]) return;
      var l = load("monark_recent", []); if (!Array.isArray(l)) l = [];
      l = [id].concat(l.filter(function(x){ return x !== id; })).slice(0, 12);
      save("monark_recent", l);
    },
    list: function(){
      var l = load("monark_recent", []);
      return Array.isArray(l) ? l.filter(function(id){ return byId[id]; }) : [];
    }
  };

  /* ---------- Renderers ---------- */
  function priceHTML(p){
    if (p.oldPrice && p.oldPrice > p.price){
      return '<span class="sr-only">İndirimli fiyat: </span>' + formatPrice(p.price) +
        ' <s class="price__old"><span class="sr-only">, eski fiyat: </span>' + formatPrice(p.oldPrice) + '</s>';
    }
    return formatPrice(p.price);
  }
  function renderCard(p, opts){
    opts = opts || {};
    var h = opts.headingTag || "h3";
    var url = productUrl(p.id);
    var main = p.images[0], alt2 = p.images[1];
    var load = opts.eager ? "" : ' loading="lazy"';
    var sw = p.colors.map(function(c){ return '<span class="sw" style="background:' + c.hex + '" title="' + esc(c.name) + '"></span>'; }).join("");
    var sizes = sizesOf(p).map(function(s){
      return '<button class="sz" type="button" data-quick-add data-size="' + s.size + '"' +
        (s.available ? ' aria-label="' + s.size + ' beden — sepete ekle"' : ' disabled aria-label="' + s.size + ' beden tükendi"') + '>' + s.size + '</button>';
    }).join("");
    var tag = p.badge ? '<span class="tag' + (p.badge === "SINIRLI" ? " tag--ink" : "") + '">' + esc(p.badge) + '</span>' : "";
    return '<li class="card" data-id="' + esc(p.id) + '" data-href="' + url + '">' +
      '<div class="card__media">' +
        '<img src="' + imgSrc(main, 600) + '" width="' + (main.w || 600) + '" height="' + (main.h || 750) + '" alt="' + esc(main.alt || p.name) + '"' + load + (main.pos ? ' style="object-position:' + main.pos + '"' : "") + '>' +
        (alt2 ? '<img class="img-alt" src="' + imgSrc(alt2, 600) + '" width="' + (alt2.w || 600) + '" height="' + (alt2.h || 750) + '" alt="" loading="lazy"' + (alt2.pos ? ' style="object-position:' + alt2.pos + '"' : "") + '>' : "") +
        tag +
        '<a class="card__open" href="' + url + '" aria-label="' + esc(p.name) + ', ' + formatPrice(p.price) + '"></a>' +
        '<div class="sizebar"><span class="sizebar__label label">Hızlı Ekle</span><div class="sizebar__sizes" role="group" aria-label="' + esc(p.name) + ' — hızlı ekle, beden seç">' + sizes + '</div></div>' +
      '</div>' +
      '<div class="card__info"><' + h + ' class="card__name">' + esc(p.name) + '</' + h + '><span class="card__price">' + priceHTML(p) + '</span></div>' +
      '<div class="card__meta"><span class="swatches" aria-hidden="true">' + sw + '</span><span>' + p.colors.length + ' renk</span></div>' +
      '<a class="card__cta" href="' + url + '" tabindex="-1">Bedenini Seç</a>' +
    '</li>';
  }
  function qtyHTML(v, o){
    o = o || {};
    var min = o.min == null ? 1 : o.min, max = o.max || MAXQ;
    v = Math.max(min, Math.min(max, parseInt(v, 10) || min));
    var lab = o.label || "Adet";
    return '<div class="qty' + (o.large ? " qty--lg" : "") + '"' + (o.key ? ' data-key="' + esc(o.key) + '"' : "") + '>' +
      '<button class="qty__btn" type="button" data-step="-1" aria-label="' + esc(lab) + ' azalt"' + (v <= min ? " disabled" : "") + '>' + icon("minus") + '</button>' +
      '<input class="qty__val" type="number" inputmode="numeric" min="' + min + '" max="' + max + '" value="' + v + '" aria-label="' + esc(lab) + '">' +
      '<button class="qty__btn" type="button" data-step="1" aria-label="' + esc(lab) + ' artır"' + (v >= max ? " disabled" : "") + '>' + icon("plus") + '</button>' +
    '</div>';
  }
  function renderLine(l, o){
    o = o || {};
    var p = l.product, url = productUrl(p.id), im = p.images[0];
    return '<li class="cline' + (o.large ? " cline--lg" : "") + '" data-key="' + esc(l.key) + '">' +
      '<a class="cline__img" href="' + url + '" tabindex="-1" aria-hidden="true"><img src="' + imgSrc(im, 240) + '" alt="" width="' + (im.w || 240) + '" height="' + (im.h || 300) + '" loading="lazy"' + (im.pos ? ' style="object-position:' + im.pos + '"' : "") + '></a>' +
      '<div class="cline__body">' +
        '<div class="cline__top"><a class="cline__name" href="' + url + '">' + esc(p.name) + '</a><span class="cline__price">' + formatPrice(l.total) + '</span></div>' +
        '<p class="cline__meta"><span class="sw" style="background:' + l.colorHex + '" aria-hidden="true"></span>' + esc(l.color) + ' · ' + esc(l.size) + ' beden' + (l.qty > 1 ? ' · ' + formatPrice(l.price) + ' / adet' : "") + '</p>' +
        '<div class="cline__actions">' +
          qtyHTML(l.qty, { key:l.key, label:p.name + " adedi" }) +
          '<button class="cline__remove" type="button" data-remove="' + esc(l.key) + '" aria-label="' + esc(p.name + ", " + l.color + ", " + l.size) + ' — sepetten kaldır">Kaldır</button>' +
        '</div>' +
      '</div>' +
    '</li>';
  }
  function shipBar(sub){
    var left = FREE - sub, done = left <= 0;
    var pct = Math.max(0, Math.min(100, sub / FREE * 100));
    return '<div class="shipbar' + (done ? " is-done" : "") + '">' +
      '<p class="shipbar__text">' + (done ? icon("check") + 'Kargo bedava.' : 'Ücretsiz kargoya <b>' + formatPrice(left) + '</b> kaldı') + '</p>' +
      '<div class="shipbar__track" role="progressbar" aria-label="Ücretsiz kargo ilerlemesi" aria-valuemin="0" aria-valuemax="' + FREE + '" aria-valuenow="' + Math.min(sub, FREE) + '" aria-valuetext="' + (done ? "Ücretsiz kargo kazanıldı" : formatPrice(left) + " kaldı") + '"><span class="shipbar__fill" style="width:' + pct.toFixed(1) + '%"></span></div>' +
    '</div>';
  }

  /* ---------- Inject shared dialogs + toast ---------- */
  var CAT_LINKS = D.categories.map(function(c){ return { href:categoryUrl(c.id), label:(c.id === "esofman" ? "Takım" : c.name), kat:c.id }; });
  function injectChrome(){
    var wrap = document.createElement("div");
    var menuLinks = CAT_LINKS.map(function(c){
      return '<a class="display" href="' + c.href + '" data-close-nav>' + esc(c.label) + ' ' + icon("arrow") + '</a>';
    }).join("") + '<a class="display" href="koleksiyon.html" data-close-nav>Tümü ' + icon("arrow") + '</a>' +
      '<a class="display" href="magaza.html" data-close-nav>Mağaza ' + icon("arrow") + '</a>';
    var chips = ["Fleece","Nocta","Kot Ceket","Sherpa","Hoodie","Jogger"].map(function(t){ return '<button class="chip" type="button">' + t + '</button>'; }).join("");
    wrap.innerHTML =
      '<dialog class="menu" id="menu" aria-label="Menü">' +
        '<div class="menu__head"><a class="wordmark" href="index.html" aria-label="Monark Wear ana sayfa">MONARK</a>' +
          '<button class="xbtn hbtn" type="button" data-close aria-label="Menüyü kapat">' + icon("close") + '</button></div>' +
        '<nav class="menu__list" aria-label="Kategoriler">' + menuLinks +
          '<div class="menu__sub"><a href="yardim.html#sss">Yardım</a><a href="yardim.html#kargo-iade">Kargo &amp; Değişim</a><a href="yardim.html#beden-rehberi">Beden Rehberi</a><a href="sepet.html">Sepet</a></div>' +
        '</nav>' +
        '<div class="menu__foot">' +
          '<button class="btn btn--accent" type="button" data-open="search">' + icon("search") + ' Ürün Ara</button>' +
          '<a class="btn btn--outline-light" href="' + waLink("Merhaba, bilgi almak istiyorum.") + '" target="_blank" rel="noopener">' + icon("wa", "icon--fill") + ' WhatsApp\'tan Yaz</a>' +
        '</div>' +
      '</dialog>' +

      '<dialog class="search" id="search" aria-label="Ürün ara">' +
        '<div class="wrap">' +
          '<form class="search__bar" role="search" id="search-form">' + icon("search") +
            '<label class="sr-only" for="search-input">Ürün ara</label>' +
            '<input class="search__input" id="search-input" type="search" placeholder="Ne arıyorsun?" autocomplete="off" enterkeyhint="search">' +
            '<button class="xbtn" type="button" data-close aria-label="Aramayı kapat">' + icon("close") + '</button>' +
          '</form>' +
          '<div class="search__body">' +
            '<div id="search-suggest"><p class="label" style="color:var(--muted);margin-bottom:12px">Hızlı arama</p><div class="chips">' + chips + '</div></div>' +
            '<p class="sr-only" id="search-status" aria-live="polite"></p>' +
            '<ul class="results" id="search-results"></ul>' +
            '<p id="search-all" hidden><a class="tlink" href="koleksiyon.html">Tüm sonuçları gör ' + icon("arrow") + '</a></p>' +
            '<div class="empty" id="search-empty" hidden>' +
              '<p class="label" id="search-empty-text"></p>' +
              '<p class="small">Aradığını bulamadıysan WhatsApp\'tan sor, rafta ne varsa söyleyelim.</p>' +
              '<p><a class="tlink" id="search-empty-wa" href="' + waLink() + '" target="_blank" rel="noopener">WhatsApp\'tan Sor</a></p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</dialog>' +

      '<dialog class="drawer" id="cart" aria-labelledby="cart-title">' +
        '<span class="grab" aria-hidden="true"></span>' +
        '<div class="drawer__head"><h2 class="label" id="cart-title" tabindex="-1">Sepet (0)</h2>' +
          '<button class="xbtn" type="button" data-close aria-label="Sepeti kapat">' + icon("close") + '</button></div>' +
        '<div class="drawer__body" id="cart-body"></div>' +
        '<div class="drawer__foot" id="cart-foot"></div>' +
      '</dialog>' +

      '<div class="toast" id="toast" role="status" aria-live="polite" aria-atomic="true">' +
        '<span class="toast__mark" aria-hidden="true"></span><p class="toast__msg"></p><button class="toast__action" type="button" hidden></button>' +
      '</div>';
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
  }

  /* ---------- Dialog helpers ---------- */
  var lastFocus = null;
  function openDialog(d, opener){
    if (!d) return;
    if (!d._wired) wireDialog(d);
    var t = $("toast"); if (t) t.classList.remove("is-shown"); // toast would sit inert under the backdrop
    [].forEach.call(document.querySelectorAll("dialog[open]"), function(o){ if (o !== d){ o._swap = true; o.close(); } });
    if (opener) lastFocus = opener;
    else if (!lastFocus) lastFocus = document.activeElement;
    if (!d.open){
      if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
    }
    document.body.classList.add("has-modal");
  }
  function wireDialog(d){
    if (d._wired) return; d._wired = true;
    d.addEventListener("close", function(){
      if (d._swap){ d._swap = false; return; }
      if (!document.querySelector("dialog[open]")){
        document.body.classList.remove("has-modal");
        if (lastFocus && document.contains(lastFocus) && !d._navigating){
          try { lastFocus.focus({ preventScroll:true }); } catch (e){ lastFocus.focus(); }
        }
        lastFocus = null;
      }
      d._navigating = false;
    });
    d.addEventListener("click", function(e){
      if (e.target === d){
        var r = d.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
      }
      if (e.target.closest("[data-close]")) d.close();
      var nav = e.target.closest("[data-close-nav]");
      if (nav){
        var href = nav.getAttribute("href") || "";
        d._navigating = true; d.close();
        // same-page anchors: let the browser scroll after the dialog closes
        if (href.charAt(0) === "#"){ e.preventDefault(); var t = document.querySelector(href); if (t) setTimeout(function(){ t.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); }, 10); }
      }
    });
  }

  /* ---------- Cart drawer ---------- */
  function renderCart(){
    var body = $("cart-body"), foot = $("cart-foot"), title = $("cart-title");
    if (!body) return;
    var items = cart.items(), n = cart.count(), sub = cart.subtotal();
    title.textContent = "Sepet (" + n + ")";
    if (!items.length){
      body.innerHTML =
        '<div class="empty">' +
          '<p class="empty__title display">Sepetin boş.</p>' +
          '<p class="small">Ürünü seç, bedenini işaretle, sepete ekle. Siparişi WhatsApp\'tan ya da Shopier\'de tamamlarsın.</p>' +
        '</div>';
      foot.innerHTML =
        '<a class="btn btn--accent" href="koleksiyon.html" data-close-nav>Koleksiyonu Gör ' + icon("arrow", "icon--arrow") + '</a>' +
        '<p class="small">2.999 TL ve üzeri siparişlerde kargo ücretsiz.</p>';
      return;
    }
    body.innerHTML = shipBar(sub) + '<ul class="clines" aria-label="Sepetteki ürünler">' + items.map(function(l){ return renderLine(l); }).join("") + '</ul>';
    foot.innerHTML =
      '<div class="sumrow"><span>Ara toplam</span><b class="tnum">' + formatPrice(sub) + '</b></div>' +
      '<p class="small">Kargo ' + (sub >= FREE ? "ücretsiz." : "sepette hesaplanır; 2.999 TL üzeri ücretsiz.") + '</p>' +
      '<a class="btn btn--accent" href="sepet.html" data-close-nav>Sepete Git ' + icon("arrow", "icon--arrow") + '</a>' +
      '<button class="btn btn--outline" type="button" data-close>Alışverişe Devam</button>';
  }
  function openCart(opener){
    renderCart();
    var d = $("cart");
    openDialog(d, opener || document.activeElement);
    var t = $("cart-title"); if (t) t.focus();
  }
  function closeCart(){ var d = $("cart"); if (d && d.open) d.close(); }

  /* focus restore after re-render inside the drawer */
  function refocus(container, key, sel){
    if (!container) return;
    var row = key && container.querySelector('[data-key="' + (window.CSS && CSS.escape ? CSS.escape(key) : key) + '"]');
    var el = row && row.querySelector(sel);
    if (el) el.focus(); else { var t = $("cart-title"); if (t) t.focus(); }
  }

  /* ---------- Badge ---------- */
  function updateBadges(bump){
    var n = cart.count();
    [].forEach.call(document.querySelectorAll("[data-cart-count]"), function(el){
      el.textContent = n;
      if (bump && !reduced){ el.classList.remove("is-bump"); void el.offsetWidth; el.classList.add("is-bump"); }
    });
    [].forEach.call(document.querySelectorAll("[data-open='cart']"), function(b){ b.setAttribute("aria-label", "Sepet, " + n + " ürün"); });
  }

  /* ---------- Toast ---------- */
  var toastTimer = null, toastAction = null;
  function toast(title, o){
    o = o || {};
    var el = $("toast"); if (!el) return;
    var msg = el.querySelector(".toast__msg"), btn = el.querySelector(".toast__action");
    msg.innerHTML = '<b>' + esc(title) + '</b>' + (o.text ? '<span>' + esc(o.text) + '</span>' : "");
    toastAction = o.action || null;
    if (toastAction){ btn.hidden = false; btn.textContent = toastAction.label; } else btn.hidden = true;
    el.classList.add("is-shown");
    clearTimeout(toastTimer);
    var dur = o.duration || 4500;
    var hide = function(){ el.classList.remove("is-shown"); };
    toastTimer = setTimeout(hide, dur);
    el.onmouseenter = el.onfocusin = function(){ clearTimeout(toastTimer); };
    el.onmouseleave = el.onfocusout = function(){ clearTimeout(toastTimer); toastTimer = setTimeout(hide, 2000); };
  }

  /* ---------- Search ---------- */
  function wireSearch(){
    var input = $("search-input"), results = $("search-results"), empty = $("search-empty"), suggest = $("search-suggest"), all = $("search-all");
    function run(){
      var raw = input.value.trim();
      if (!raw){ results.innerHTML = ""; empty.hidden = true; all.hidden = true; suggest.hidden = false; $("search-status").textContent = ""; return; }
      suggest.hidden = true;
      var hits = searchProducts(raw);
      results.innerHTML = hits.slice(0, 8).map(function(p){
        var k = getCategory(p.cat);
        return '<li><a class="result" href="' + productUrl(p.id) + '"><img src="' + imgSrc(p.images[0], 200) + '" alt="" width="56" height="70" loading="lazy"' + (p.images[0].pos ? ' style="object-position:' + p.images[0].pos + '"' : "") + '>' +
          '<span><b>' + esc(p.name) + '</b><small>' + esc(k ? k.name : "") + '</small></span><span>' + formatPrice(p.price) + '</span></a></li>';
      }).join("");
      all.hidden = !hits.length;
      all.querySelector("a").href = searchUrl(raw);
      all.querySelector("a").firstChild.nodeValue = "Tüm sonuçları gör (" + hits.length + ") ";
      empty.hidden = hits.length > 0;
      if (!hits.length){
        $("search-empty-text").textContent = "“" + raw + "” için sonuç yok.";
        $("search-empty-wa").href = waLink("Merhaba, " + raw + " var mı?");
      }
      $("search-status").textContent = hits.length ? hits.length + " sonuç bulundu" : "Sonuç yok";
    }
    input.addEventListener("input", run);
    // type=search swallows the first Escape (clears text); close the dialog instead
    input.addEventListener("keydown", function(e){ if (e.key === "Escape"){ e.preventDefault(); $("search").close(); } });
    $("search-form").addEventListener("submit", function(e){ e.preventDefault(); run(); var f = results.querySelector("a"); if (f) f.focus(); });
    [].forEach.call(document.querySelectorAll("#search .chip"), function(c){ c.addEventListener("click", function(){ input.value = c.textContent; run(); input.focus(); }); });
  }

  /* ---------- Header (overlay -> solid) ---------- */
  function wireHeader(){
    var header = document.querySelector(".header");
    if (!header || !header.classList.contains("header--overlay")) return;
    var hero = document.querySelector("[data-hero]") || document.querySelector("main > :first-child");
    if (!hero) { header.classList.add("is-solid"); return; }
    if ("IntersectionObserver" in window){
      new IntersectionObserver(function(entries){
        header.classList.toggle("is-solid", !entries[0].isIntersecting);
      }, { rootMargin: "-" + (header.offsetHeight + 1) + "px 0px 0px 0px", threshold: 0 }).observe(hero);
    } else {
      var onScroll = function(){ header.classList.toggle("is-solid", window.scrollY > hero.offsetHeight - header.offsetHeight); };
      window.addEventListener("scroll", onScroll, { passive:true }); onScroll();
    }
  }

  /* ---------- Active nav ---------- */
  function markCurrent(){
    var file = (location.pathname.split("/").pop() || "index.html");
    var kat = new URLSearchParams(location.search).get("kat");
    [].forEach.call(document.querySelectorAll(".nav a, .menu__list > a"), function(a){
      var href = a.getAttribute("href") || "";
      if (href.charAt(0) === "#") return;
      var parts = href.split("?"), f = parts[0], q = new URLSearchParams(parts[1] || "");
      if (f === file && (q.get("kat") || null) === (kat || null)) a.setAttribute("aria-current", "page");
    });
  }

  /* ---------- Init ---------- */
  injectChrome();
  [].forEach.call(document.querySelectorAll("dialog"), wireDialog);
  wireSearch();
  wireHeader();
  markCurrent();
  renderCart();
  updateBadges(false);

  // data-wa links use the configured number
  [].forEach.call(document.querySelectorAll("a[data-wa]"), function(a){ a.href = waLink(a.getAttribute("data-wa")); });

  // openers
  document.addEventListener("click", function(e){
    var b = e.target.closest("[data-open]");
    if (b){
      var id = b.getAttribute("data-open");
      if (id === "cart"){ e.preventDefault(); openCart(b); return; }
      var d = $(id); if (!d) return;
      var opener = b;
      if (id === "search" && b.closest("#menu")) opener = document.querySelector(".menu-btn");
      openDialog(d, opener);
      if (id === "search") setTimeout(function(){ $("search-input").focus(); }, 30);
    }
  });

  // marquee pause
  var mq = document.querySelector(".marquee"), mqBtn = mq && mq.querySelector(".marquee__toggle");
  if (mqBtn){
    mqBtn.addEventListener("click", function(){
      var paused = mq.classList.toggle("is-paused");
      mqBtn.setAttribute("aria-pressed", String(paused));
      mqBtn.setAttribute("aria-label", paused ? "Kayan duyuruyu başlat" : "Kayan duyuruyu durdur");
    });
  }

  // qty steppers (global)
  function syncQty(q){
    var inp = q.querySelector(".qty__val"), v = parseInt(inp.value, 10);
    var min = parseInt(inp.min, 10) || 1, max = parseInt(inp.max, 10) || MAXQ;
    var btns = q.querySelectorAll(".qty__btn");
    btns[0].disabled = v <= min; btns[1].disabled = v >= max;
  }
  document.addEventListener("click", function(e){
    var b = e.target.closest(".qty__btn"); if (!b || b.disabled) return;
    var q = b.closest(".qty"), inp = q.querySelector(".qty__val");
    var min = parseInt(inp.min, 10) || 1, max = parseInt(inp.max, 10) || MAXQ;
    var v = Math.max(min, Math.min(max, (parseInt(inp.value, 10) || min) + Number(b.getAttribute("data-step"))));
    inp.value = v; syncQty(q);
    inp.dispatchEvent(new Event("change", { bubbles:true }));
  });
  document.addEventListener("change", function(e){
    if (!e.target.classList || !e.target.classList.contains("qty__val")) return;
    var inp = e.target, min = parseInt(inp.min, 10) || 1, max = parseInt(inp.max, 10) || MAXQ;
    var v = parseInt(inp.value, 10); inp.value = isNaN(v) ? min : Math.max(min, Math.min(max, v));
    syncQty(inp.closest(".qty"));
  }, true);

  // cart drawer: qty + remove
  var cartD = $("cart");
  cartD.addEventListener("change", function(e){
    var inp = e.target.closest(".qty__val"); if (!inp) return;
    var key = inp.closest(".qty").getAttribute("data-key");
    var fromBtn = document.activeElement && document.activeElement.classList.contains("qty__btn") ? document.activeElement.getAttribute("data-step") : null;
    cart.updateQty(key, inp.value);
    refocus($("cart-body"), key, fromBtn ? '.qty__btn[data-step="' + fromBtn + '"]' : ".qty__val");
  });
  cartD.addEventListener("click", function(e){
    var r = e.target.closest("[data-remove]"); if (!r) return;
    var line = r.closest(".cline"), next = line && (line.nextElementSibling || line.previousElementSibling);
    var nextKey = next && next.getAttribute("data-key");
    cart.remove(r.getAttribute("data-remove"));
    refocus($("cart-body"), nextKey, ".cline__remove");
    toast("Sepetten kaldırıldı");
  });

  // react to cart changes everywhere
  document.addEventListener("monark:cart", function(e){
    updateBadges(e.detail.action === "add");
    renderCart();
  });

  // product cards: quick add + whole-card click
  document.addEventListener("click", function(e){
    var sz = e.target.closest(".sz[data-quick-add]");
    if (sz){
      e.preventDefault();
      if (sz.disabled) return;
      var card = sz.closest(".card"), id = card.getAttribute("data-id");
      var line = cart.add(id, { size:sz.getAttribute("data-size") });
      if (line){
        toast("Sepete eklendi", { text: line.product.name + " · " + line.color + " · " + line.size, action:{ label:"Sepeti Gör", onClick:function(){ openCart(sz); } } });
      }
      return;
    }
    var c = e.target.closest(".card");
    if (c && !e.target.closest("a, button, input, label")){
      var href = c.getAttribute("data-href");
      if (href){ if (e.metaKey || e.ctrlKey) window.open(href, "_blank"); else location.href = href; }
    }
  });

  // toast action
  $("toast").querySelector(".toast__action").addEventListener("click", function(){
    var a = toastAction; $("toast").classList.remove("is-shown");
    if (!a) return;
    if (a.onClick) a.onClick(); else if (a.href) location.href = a.href;
  });

  /* ---------- Public API ---------- */
  window.Monark = {
    data:D, config:CFG,
    formatPrice:formatPrice, esc:esc, trLower:trLower, icon:icon, imgSrc:imgSrc,
    getProduct:getProduct, getCategory:getCategory, productsIn:productsIn, searchProducts:searchProducts, sizesOf:sizesOf,
    productUrl:productUrl, categoryUrl:categoryUrl, searchUrl:searchUrl, waLink:waLink,
    renderCard:renderCard, renderLine:renderLine, shipBar:shipBar, qtyHTML:qtyHTML, priceHTML:priceHTML,
    cart:cart, cartMessage:cartMessage,
    openCart:openCart, closeCart:closeCart, openDialog:openDialog,
    toast:toast, recent:recent, reducedMotion:reduced
  };
})();

/* Turkish uppercase fix: lang="tr" turns i → İ under text-transform:uppercase.
   Wrap English loanwords in <span lang="en"> so they uppercase as OVERSIZE, HOODIE, SHOPIER, VICE CITY. */
(function(){
  var RE = /\b(Oversize|Hoodie|Sweatshirt|Premium|Shopier|Vice|City|Tracksuit|Fit|Boxy|Jogger|Tech|Club|Nocta|Sherpa|Double|Face|Stussy|Basic|Fleece)\b/gi;
  var SKIP = { SCRIPT:1, STYLE:1, TEXTAREA:1, INPUT:1, OPTION:1, TITLE:1, NOSCRIPT:1 };
  function fix(root){
    if (!root || !document.createTreeWalker) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = w.nextNode())) {
      var p = n.parentNode;
      if (!p || SKIP[p.nodeName] || !RE.test(n.nodeValue)) { RE.lastIndex = 0; continue; }
      RE.lastIndex = 0;
      if (p.closest && p.closest('[lang="en"],[contenteditable]')) continue;
      list.push(n);
    }
    list.forEach(function(t){
      var frag = document.createDocumentFragment(), s = t.nodeValue, last = 0, m;
      RE.lastIndex = 0;
      while ((m = RE.exec(s))) {
        if (m.index > last) frag.appendChild(document.createTextNode(s.slice(last, m.index)));
        var sp = document.createElement('span'); sp.lang = 'en'; sp.textContent = m[0]; frag.appendChild(sp);
        last = m.index + m[0].length;
      }
      if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
      t.parentNode.replaceChild(frag, t);
    });
  }
  function start(){
    fix(document.body);
    if (window.MutationObserver) new MutationObserver(function(ms){
      ms.forEach(function(m){ for (var i = 0; i < m.addedNodes.length; i++) {
        var a = m.addedNodes[i];
        if (a.nodeType === 1) fix(a); else if (a.nodeType === 3 && a.parentNode) fix(a.parentNode);
      }});
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
