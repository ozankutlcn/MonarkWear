# MonarkWear — SAHA multi-page demo site spec (phase 2)

The client chose direction **A · SAHA** (see ../directions.md section A, and the approved concept `../A-saha-concept-v1.html`, a frozen copy of index.html). We now deepen it into a multi-page static demo. **UI ONLY. No backend, no build tools, no npm in the project.** Plain HTML + CSS + vanilla JS, opens from disk via file:// (so NO fetch() of local JSON, NO ES modules — use classic `<script src>` with globals). Cart state may live in localStorage (UI demo only, wrapped in try/catch).

The approved look/feel of SAHA must be preserved exactly: Archivo variable (wdth 62..125), palette (bg #FFF, surface #EEEEEC, ink #0B0B0B, muted #6E6E6A, accent #FFD23F fills only, line #DCDCD8), square corners, marquee bar, transparent→solid header on home, ink footer with giant cropped MONARK wordmark, ink-square WhatsApp float, reduced-motion rules, lang="tr", focus rings.

## Key behavior change
Product buttons NO LONGER jump straight to Shopier. Flow: card → **product detail page (urun.html?id=…)** → pick color/size → "Sepete Ekle" (cart drawer opens) or "Hemen Al" → **sepet.html** → "Siparişi Tamamla" choice: **WhatsApp ile sipariş** (prefilled message listing all lines + total) or **Shopier ile öde** (link out to https://www.shopier.com/monarkwear). Only the final checkout step leaves the site.

## File structure (A-saha/)
```
index.html            home
koleksiyon.html       product listing (?kat=fleece|esofman|ceket|sweat|hoodie|alt|tisort|hepsi, ?q= search)
urun.html             product detail (?id=<slug>)
sepet.html            cart page + checkout choice
magaza.html           physical store page
yardim.html           help: tabs/anchors #sss #kargo-iade #beden-rehberi #iletisim
assets/css/site.css   ALL shared styles (tokens, header, marquee, footer, cards, drawers, buttons, forms)
assets/js/data.js     window.MONARK = { products:[...], categories:[...], config:{ whatsapp:'905000000000', shopier:'https://www.shopier.com/monarkwear', freeShip:2999, instagram:'https://www.instagram.com/monarkwearcom/' } }
assets/js/site.js     shared: header scroll state, marquee pause, mobile menu, search dialog (searches MONARK.products, links to urun.html), cart store (localStorage 'monark_cart'), cart drawer, cart count badge, toast, formatPrice ("3.490 TL"), product card renderer used by every page, WhatsApp float.
assets/ig/            REAL Instagram photos of the client (max 640px tall; see below)
```
Each page: same header/marquee/footer markup (duplicated HTML is fine; keep identical), page-specific inline `<script>` at bottom after data.js + site.js. Header nav links become real pages: FLEECE → koleksiyon.html?kat=fleece, ESOFMAN/TAKIM, CEKET, SWEAT, MAĞAZA → magaza.html. Non-home pages use solid header (no transparent state).

## Real client images (assets/ig/, from @monarkwearcom posts — PREFER these over Unsplash)
| file | px | content / caption source |
|---|---|---|
| nocta-tracksuit.jpg | 360x640 | black Nocta tracksuit flatlay on white fur ("Nocta Tracksuit Monark'tan Alınır!" — their most liked reel, 956 likes) |
| esofman-takimi-rack.jpg | 361x640 | 3-stripe premium tracksuits on rack under MONARK store sign ("Premium orijinal eşofman takımı… Çok sınırlı stok!") |
| kot-ceket-model.jpg | 480x640 | street model in boxy grey denim track jacket + fur hat ("boxy Oversize kot ceket") |
| kot-ceket-rack.jpg | 360x640 | boxy denim jackets on black rack, store studio |
| double-face-jogger.jpg | 480x640 | joggers flatlay on red rug, various colors ("Double face kumaş Jogger") |
| sherpa-ceket.jpg | 480x640 | sherpa/fleece jackets on rack: beige, black, blue, olive ("Kışlık Sherpa ceket") |
| uc-iplik-hoodie.jpg | 608x640 | hoodies black/navy/red/grey on rack ("3 iplik Hoodie, kampanyalı fiyat") |
| uc-iplik-sweatshirt.jpg | 561x640 | crewneck sweatshirts black/grey/navy on rack ("3 iplik sweatshirt") |
| premium-sweatshirt.jpg | 480x640 | white + black script-embroidered crewnecks on rack ("Premium 3 iplik sweatshirt") |
| magaza-cephe.jpg | 480x640 | REAL storefront: green-white awning, black MONARK WEAR sign ("Artık sizi fiziksel mağazamızda da ağırlıyoruz!") |
| magaza-indirim.jpg | 360x640 | storefront with customer walking in ("MONARK WEAR'DA BÜYÜK İNDİRİM!") |
| vice-city-kampanya.jpg | 512x640 | illustrated campaign art, two people carrying MONARK boxes, neon purple sky ("Vice City sokaklarında yeni bir tarz!") |
| logo-profil-150.jpg | 150 | brand logo: purple/black blocky "MONARK WEAR" on turquoise (reference only; too small to use large) |
| sherpa-detay-150.jpg, tech-fleece-gri-150.jpg | 150 | tiny highlight covers — only usable as ≤80px thumbs |

**Resolution rule:** never display an IG image wider than ~1.4× its pixel width (e.g. 480px file → max ~670px CSS on 1x). For full-bleed desktop moments either use an Unsplash lifestyle image (pool in ../brief.md; hero yellow tracksuit photo-1515886657613-9f3515b0c78f is approved) OR compose IG images in multi-panel layouts (e.g. 3–4 portrait panels side by side) rather than stretching one. Use `object-fit:cover` with sensible object-position. Rack photos have light grey studio walls — present them on the #EEEEEC surface so they feel intentional.

## Product catalog (data.js) — names derived from the client's own captions; prices are DEMO
Each product: `{ id, name, cat, price, oldPrice?, badge? ('YENİ'|'KAMPANYA'|'SINIRLI'), colors:[{name,hex}], sizes:{S:true,M:true,L:false,...}, images:[...], desc, details:[...bullet strings: kumaş, kalıp, bakım], fit:'Oversize'|'Regular'|'Boxy' }`
1. nocta-tracksuit-takim — "Nocta Tracksuit Takım", cat fleece/esofman, 3.490 TL, SINIRLI, Siyah; images: nocta-tracksuit.jpg
2. premium-esofman-takimi — "Premium Eşofman Takımı", esofman, 2.990 TL, SINIRLI, Siyah/Lacivert/Yeşil/Bordo; esofman-takimi-rack.jpg
3. boxy-kot-ceket — "Boxy Oversize Kot Ceket", ceket, 2.290 TL, YENİ, Gri Yıkama/Açık Mavi/Lacivert; kot-ceket-model.jpg + kot-ceket-rack.jpg
4. kislik-sherpa-ceket — "Kışlık Sherpa Ceket", ceket, 2.490 TL, YENİ, Bej/Siyah/Mavi/Haki; sherpa-ceket.jpg (+ sherpa-detay-150 as tiny swatch thumb only)
5. double-face-jogger — "Double Face Jogger", alt, 1.290 TL, YENİ, Siyah/Gri/Mavi/Haki/Krem; double-face-jogger.jpg
6. uc-iplik-hoodie — "3 İplik Hoodie", hoodie, 1.490 TL (oldPrice 1.890), KAMPANYA, Siyah/Lacivert/Kırmızı/Gri; uc-iplik-hoodie.jpg
7. uc-iplik-sweatshirt — "3 İplik Sweatshirt", sweat, 1.190 TL (oldPrice 1.490), KAMPANYA, Siyah/Gri/Lacivert; uc-iplik-sweatshirt.jpg
8. premium-uc-iplik-sweatshirt — "Premium 3 İplik Sweatshirt", sweat, 1.590 TL, YENİ, Beyaz/Siyah; premium-sweatshirt.jpg
9. tech-fleece-takim — "Tech Fleece Takım", fleece, 3.290 TL, Gri/Siyah; Unsplash photo-1556821840-3a63f95609a7 (+ photo-1572495641004-28421ae52e52) — mark as stock image in data (`stock:true`)
10. club-fleece-hoodie — "Club Fleece Hoodie", hoodie/fleece, 1.890 TL; Unsplash photo-1620799140408-edc6dcb6d633 (stock)
11–12. two tees from the Unsplash pool (Ağır Gramaj Tişört photo-1618354691373-d851c5c3a990 890 TL; Grafik Baskılı Tişört photo-1576566588028-4147f3842f27 790 TL) (stock)
Categories: Fleece, Eşofman Takımı, Ceket, Sweatshirt, Hoodie, Jogger/Alt, Tişört. Vary size availability believably. No fake stock counts, no star ratings, no "X kişi bakıyor".

## Pages
**index.html** — keep the approved SAHA home but feed it real content: hero stays (yellow Unsplash, approved); split panels FLEECE/TİŞÖRT → change to two real-category panels built from IG imagery (e.g. "TAKIM" with nocta + esofman panels, "CEKET" with kot-ceket-model + sherpa) — respect resolution rule (panels ≤ ~700px wide each is fine at 50/50 on 1440 → 720px; acceptable, or use 3–4 panels); categories strip → real categories with IG images; Yeni Gelenler grid → from data.js, cards link to urun.html; brand band → can use vice-city-kampanya.jpg as a campaign block ("VICE CITY" drop) composed with ink/yellow type instead of stretching; Sizden Gelenler keep (demo, labeled); Mağazamız → magaza-cephe.jpg real storefront + "Mağazayı Gör →" magaza.html; Instagram strip → real IG images linking to the real posts (https://www.instagram.com/p/DaqS3jljRdH/, /p/Df4lBostPLl/, /p/DfuDPdQDS6E/, /p/DgIbujfjakX/, /p/DgImpa4DQ4G/, /p/DgKACP7DcOV/, /p/DgKbkgojVRf/, /p/DgKCo13DfpW/, /reel/DAY_3OlosU-/, /reel/Df2oE8gtVPo/, /reel/Df-S5sktTcY/, /reel/DShwrRSDXlf/ — mapping: DaqS3jljRdH=magaza-cephe, Df4lBostPLl=vice-city, DfuDPdQDS6E=kot-ceket-model, DgIbujfjakX=double-face-jogger, DgImpa4DQ4G=sherpa-ceket, DgKACP7DcOV=uc-iplik-hoodie, DgKbkgojVRf=uc-iplik-sweatshirt, DgKCo13DfpW=premium-sweatshirt, DAY_3OlosU-=nocta-tracksuit, Df2oE8gtVPo=kot-ceket-rack, Df-S5sktTcY=magaza-indirim, DShwrRSDXlf=esofman-takimi-rack); trust row; footer with real links.

**koleksiyon.html** — SAHA-style page header (huge 62/900 category title, count, breadcrumb). Category tabs (horizontal, yellow tape on active). Toolbar: filter (size, color, price range, fit) as desktop left sidebar or top bar + mobile bottom-sheet "FİLTRE (n)"; sort (Önerilen, Fiyat artan/azalan, Yeni). Active filter chips with × and "Temizle". Grid 4-col desktop / 2-col mobile using shared card. Empty state with WhatsApp CTA. Interleave one editorial tile (e.g. Vice City campaign) into the grid. Reads ?kat and ?q from URL; updates URL with history.replaceState.

**urun.html** — the showpiece. Breadcrumb. Desktop: left gallery (vertical stack of images / thumbnails + main; zoom-on-click lightbox), right sticky buy panel: badge, name (62/900 large), price (+ struck oldPrice), color swatches (named), size grid with struck unavailable sizes + "Beden Rehberi" link opening a size-chart drawer (table cm: göğüs/boy/kol for S–XXL, demo values), quantity stepper, primary yellow "SEPETE EKLE", secondary ink "HEMEN AL" (→ adds + goes to sepet.html), tertiary "WhatsApp'tan Sor" (prefilled: product, color, size, URL). Validation: if no size chosen → inline error "Lütfen beden seç" + shake-free highlight. Under buttons: 3 compact info rows (2.999 TL üzeri ücretsiz kargo · Mağazadan teslim al · Kolay değişim — say "Değişim koşulları için yardım sayfası", no invented day counts unless phrased as placeholder) . Accordions: Ürün Açıklaması, Kumaş & Bakım, Kargo & Değişim. Then "Kombini Tamamla" / "Bunlar da İlginizi Çekebilir" rail (same category first), and "Son Baktıkların" (localStorage). Mobile: swipeable gallery (scroll-snap) with dots, sticky bottom bar with price + "SEPETE EKLE". Unknown id → friendly not-found state with link to koleksiyon.

**sepet.html** — big "SEPET" title; line items (thumb, name, color/size, qty stepper, line price, remove); free-shipping progress bar in yellow tape style ("Ücretsiz kargoya 1.210 TL kaldı" → "Kargo bedava ✓"); order summary (ara toplam, kargo: "2.999 TL üzeri ücretsiz / aksi halde Shopier'de hesaplanır", toplam); checkout choice block: [WhatsApp ile Sipariş Ver] builds message with all lines and opens wa.me; [Shopier ile Öde] opens Shopier store in new tab with note "Ödeme Shopier güvencesiyle". Optional order note textarea included in WhatsApp message. Empty cart state with links to collections + recommended products rail.

**magaza.html** — hero using magaza-cephe.jpg + magaza-indirim.jpg as a 2-panel composition with "MAĞAZAMIZ" huge; info table: Adres [Adres eklenecek], Çalışma saatleri [eklenecek], Telefon/WhatsApp placeholder; buttons Yol Tarifi (Google Maps search placeholder) + WhatsApp; map placeholder block (styled ink/grey with pin, labeled "Harita adres girildiğinde eklenecek" — no external iframe); "Mağazada neler var" strip using esofman-takimi-rack, kot-ceket-rack, sherpa-ceket, uc-iplik-hoodie; quote from caption "Artık sizi fiziksel mağazamızda da ağırlıyoruz!".

**yardim.html** — anchored sections with sticky side index (desktop) / tabs (mobile): SSS accordion (Sipariş nasıl verilir? WhatsApp/Shopier, Kargo ücreti? 2.999 TL üzeri ücretsiz, Değişim? placeholder text, Beden seçimi?, Mağazadan teslim?), Kargo & Değişim (placeholder policy text clearly marked "[Müşteri tarafından onaylanacak]"), Beden Rehberi table (same demo table), İletişim (WhatsApp, Instagram, mağaza; simple contact form that only opens WhatsApp with the message — no backend).

## Quality bar
Premium, cohesive, NOT AI slop: no rounded cards, no shadows except drawers, no gradients except the hero scrim, no emoji icons, inline SVG icons only. Consistent spacing scale, consistent section-title component, crisp type. Every interactive state: hover (pointer:fine only), focus-visible, active, disabled. Mobile 390px flawless, no horizontal overflow. Footer note "Fiyatlar, yorumlar ve bazı görseller demo amaçlıdır." Turkish copy throughout, short and confident.
