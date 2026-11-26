/* ==========================================================================
   MONARK WEAR — demo katalog (window.MONARK)
   Classic script, file:// uyumlu. site.js'den ÖNCE yüklenir.

   Ürün adları müşterinin Instagram açıklamalarından türetilmiştir.
   Fiyatlar, beden stokları, açıklama/bakım metinleri DEMO amaçlıdır.

   Ürün şekli:
   {
     id, name, cat (ana kategori), cats:[...tüm kategoriler],
     price, oldPrice?, badge? ('YENİ'|'KAMPANYA'|'SINIRLI'),
     colors:[{name,hex}], sizes:{S:true,M:false,...},
     images:[{src|u, w?, h?, alt, pos?}],   // src = yerel IG dosyası, u = Unsplash id
     stock?:true,                              // temsili (Unsplash) görsel
     desc, details:[...], fit:'Oversize'|'Regular'|'Boxy',
     added:'YYYY-MM-DD',                       // "Yeni" sıralaması için (demo)
     ig?: 'https://www.instagram.com/...'      // kaynağı olan gerçek gönderi
   }
   Görsel çözümü: Monark.imgSrc(image, width) — site.js
   ========================================================================== */
(function(){
  "use strict";

  var C = {
    siyah:     { name:"Siyah",       hex:"#141414" },
    lacivert:  { name:"Lacivert",    hex:"#1E2742" },
    yesil:     { name:"Yeşil",       hex:"#2E4A3B" },
    bordo:     { name:"Bordo",       hex:"#5E1A24" },
    griYikama: { name:"Gri Yıkama",  hex:"#7E8A96" },
    acikMavi:  { name:"Açık Mavi",   hex:"#A3BCD8" },
    bej:       { name:"Bej",         hex:"#DCCFB6" },
    mavi:      { name:"Mavi",        hex:"#4F8FD0" },
    haki:      { name:"Haki",        hex:"#5E6B4E" },
    gri:       { name:"Gri",         hex:"#8C8C88" },
    griMelanj: { name:"Gri Melanj",  hex:"#BDBDB8" },
    krem:      { name:"Krem",        hex:"#EFEBDF" },
    kirmizi:   { name:"Kırmızı",     hex:"#C4202B" },
    beyaz:     { name:"Beyaz",       hex:"#F4F3EF" }
  };
  function cols(){ return [].slice.call(arguments).map(function(k){ return C[k]; }); }
  function sz(off){ // off: tükenen bedenler
    var o = {}; ["S","M","L","XL","XXL"].forEach(function(s){ o[s] = off.indexOf(s) === -1; }); return o;
  }
  var IG = "assets/ig/";
  var CARE = "Bakım: 30°C ters yüz yıkama, düşük ısıda ütü (demo bilgi)";

  var products = [
    {
      id:"nocta-tracksuit-takim", name:"Nocta Tracksuit Takım",
      cat:"fleece", cats:["fleece","esofman"],
      price:3490, badge:"SINIRLI",
      colors:cols("siyah"), sizes:sz(["S","XXL"]),
      images:[{ src:IG+"nocta-tracksuit.jpg", w:360, h:640, pos:"50% 42%", alt:"Siyah Nocta tracksuit takım, beyaz post üzerinde serili" }],
      desc:"Nocta Tracksuit Monark'tan alınır. Fermuarlı kapüşonlu üst ve jogger alt; sezonun en çok sorulan takımı.",
      details:["Takım: kapüşonlu fermuarlı üst + jogger alt","Kalıp: Regular","Sınırlı stok — beden için WhatsApp'tan sorabilirsin",CARE],
      fit:"Regular", added:"2026-11-02", ig:"https://www.instagram.com/reel/DAY_3OlosU-/"
    },
    {
      id:"premium-esofman-takimi", name:"Premium Eşofman Takımı",
      cat:"esofman", cats:["esofman"],
      price:2990, badge:"SINIRLI",
      colors:cols("siyah","lacivert","yesil","bordo"), sizes:sz(["XXL"]),
      images:[{ src:IG+"esofman-takimi-rack.jpg", w:361, h:640, pos:"50% 62%", alt:"Üç şeritli premium eşofman takımları, MONARK tabelası altında askıda" }],
      desc:"Premium orijinal eşofman takımı. Klasik üç şerit, dik yaka, takım olarak satılır. Çok sınırlı stok.",
      details:["Takım: fermuarlı üst + alt","Kalıp: Regular","Renkler rafta karışık; renk teyidi için WhatsApp",CARE],
      fit:"Regular", added:"2026-11-10", ig:"https://www.instagram.com/reel/DShwrRSDXlf/"
    },
    {
      id:"boxy-kot-ceket", name:"Boxy Oversize Kot Ceket",
      cat:"ceket", cats:["ceket"],
      price:2290, badge:"YENİ",
      colors:cols("griYikama","acikMavi","lacivert"), sizes:sz(["S"]),
      images:[
        { src:IG+"kot-ceket-model.jpg", w:480, h:640, pos:"50% 30%", alt:"Gri yıkama boxy kot ceket giyen model, sokakta" },
        { src:IG+"kot-ceket-rack.jpg", w:360, h:640, pos:"50% 45%", alt:"Boxy kot ceketler siyah askılıkta" }
      ],
      desc:"Boxy oversize kot ceket. Kısa boy, geniş omuz, yanlarda şerit detayı. Bol jean ile tam oturur.",
      details:["Kumaş: denim","Kalıp: Boxy / Oversize — normal bedenini al","Fermuarlı, elastik bel ve manşet",CARE],
      fit:"Boxy", added:"2026-11-14", ig:"https://www.instagram.com/p/DfuDPdQDS6E/"
    },
    {
      id:"kislik-sherpa-ceket", name:"Kışlık Sherpa Ceket",
      cat:"ceket", cats:["ceket","fleece"],
      price:2490, badge:"YENİ",
      colors:cols("bej","siyah","mavi","haki"), sizes:sz(["XXL"]),
      images:[{ src:IG+"sherpa-ceket.jpg", w:480, h:640, pos:"60% 50%", alt:"Bej, mavi, siyah ve haki sherpa ceketler askılıkta" }],
      swatchThumb:{ src:IG+"sherpa-detay-150.jpg", w:150, h:150, alt:"Sherpa kumaş detayı" },
      desc:"Kışlık sherpa ceket. Kuzu yünü dokulu gövde, göğüste dokuma panel, dik yaka.",
      details:["Kumaş: sherpa (polar) + dokuma panel","Kalıp: Regular","Fermuarlı, iki yan cep",CARE],
      fit:"Regular", added:"2026-11-18", ig:"https://www.instagram.com/p/DgImpa4DQ4G/"
    },
    {
      id:"double-face-jogger", name:"Double Face Jogger",
      cat:"alt", cats:["alt"],
      price:1290, badge:"YENİ",
      colors:cols("siyah","gri","mavi","haki","krem"), sizes:sz([]),
      images:[{ src:IG+"double-face-jogger.jpg", w:480, h:640, pos:"50% 50%", alt:"Farklı renklerde double face jogger'lar kırmızı halı üzerinde" }],
      desc:"Double face kumaş jogger. İki yüzü de düzgün, gün boyu formunu korur.",
      details:["Kumaş: double face","Kalıp: Regular, paçası lastikli","Bel: lastik + ip",CARE],
      fit:"Regular", added:"2026-11-20", ig:"https://www.instagram.com/p/DgIbujfjakX/"
    },
    {
      id:"uc-iplik-hoodie", name:"3 İplik Hoodie",
      cat:"hoodie", cats:["hoodie"],
      price:1490, oldPrice:1890, badge:"KAMPANYA",
      colors:cols("siyah","lacivert","kirmizi","gri"), sizes:sz(["S"]),
      images:[{ src:IG+"uc-iplik-hoodie.jpg", w:608, h:640, pos:"60% 50%", alt:"Siyah, lacivert, kırmızı ve gri 3 iplik hoodie'ler askılıkta" }],
      desc:"3 iplik hoodie, kampanyalı fiyat. Kalın gövde, kanguru cep, nakış logo.",
      details:["Kumaş: 3 iplik","Kalıp: Regular","Kapüşon, kanguru cep",CARE],
      fit:"Regular", added:"2026-11-22", ig:"https://www.instagram.com/p/DgKACP7DcOV/"
    },
    {
      id:"uc-iplik-sweatshirt", name:"3 İplik Sweatshirt",
      cat:"sweat", cats:["sweat"],
      price:1190, oldPrice:1490, badge:"KAMPANYA",
      colors:cols("siyah","griMelanj","lacivert"), sizes:sz(["XXL"]),
      images:[{ src:IG+"uc-iplik-sweatshirt.jpg", w:561, h:640, pos:"55% 50%", alt:"Siyah, gri ve lacivert 3 iplik sweatshirt'ler askılıkta" }],
      desc:"3 iplik bisiklet yaka sweatshirt. Göğüste nakış logo, ribanalı yaka ve manşet.",
      details:["Kumaş: 3 iplik","Kalıp: Regular","Bisiklet yaka",CARE],
      fit:"Regular", added:"2026-11-22", ig:"https://www.instagram.com/p/DgKbkgojVRf/"
    },
    {
      id:"premium-uc-iplik-sweatshirt", name:"Premium 3 İplik Sweatshirt",
      cat:"sweat", cats:["sweat"],
      price:1590, badge:"YENİ",
      colors:cols("beyaz","siyah"), sizes:sz(["S","M"]),
      images:[{ src:IG+"premium-sweatshirt.jpg", w:480, h:640, pos:"58% 50%", alt:"Beyaz ve siyah yazı nakışlı premium sweatshirt'ler askılıkta" }],
      desc:"Premium 3 iplik sweatshirt. Göğüste yazı nakış, rahat oversize duruş.",
      details:["Kumaş: 3 iplik","Kalıp: Oversize","Nakış baskı",CARE],
      fit:"Oversize", added:"2026-11-24", ig:"https://www.instagram.com/p/DgKCo13DfpW/"
    },
    {
      id:"tech-fleece-takim", name:"Tech Fleece Takım",
      cat:"fleece", cats:["fleece","esofman"],
      price:3290, stock:true,
      colors:cols("gri","siyah"), sizes:sz(["XL"]),
      images:[
        { u:"photo-1556821840-3a63f95609a7", alt:"Gri kapüşonlu üst, arkadan (temsili görsel)" },
        { u:"photo-1572495641004-28421ae52e52", alt:"Sokakta fleece giyen iki kişi (temsili görsel)" }
      ],
      desc:"Tech Fleece takım. İnce ama sıcak, vücudu saran kesim; fermuarlı üst ve dar paça alt.",
      details:["Takım: fermuarlı kapüşonlu üst + jogger alt","Kalıp: Regular / dar paça","Görsel temsilidir",CARE],
      fit:"Regular", added:"2026-10-20"
    },
    {
      id:"club-fleece-hoodie", name:"Club Fleece Hoodie",
      cat:"hoodie", cats:["hoodie","fleece"],
      price:1890, stock:true,
      colors:cols("beyaz","siyah","griMelanj"), sizes:sz(["XXL"]),
      images:[{ u:"photo-1620799140408-edc6dcb6d633", alt:"Beyaz sweatshirt, düz zemin (temsili görsel)" }],
      desc:"Club Fleece hoodie. İçi yumuşak fleece, günlük kullanım için.",
      details:["Kumaş: fleece","Kalıp: Regular","Görsel temsilidir",CARE],
      fit:"Regular", added:"2026-10-12"
    },
    {
      id:"agir-gramaj-tisort", name:"Ağır Gramaj Tişört",
      cat:"tisort", cats:["tisort"],
      price:890, stock:true,
      colors:cols("siyah","beyaz"), sizes:sz([]),
      images:[{ u:"photo-1618354691373-d851c5c3a990", alt:"Askıda siyah tişört (temsili görsel)" }],
      desc:"Ağır gramaj tişört. Kalın kumaş, düşük omuz, yıkamada formunu korur.",
      details:["Kumaş: ağır gramaj pamuk","Kalıp: Oversize","Görsel temsilidir",CARE],
      fit:"Oversize", added:"2026-09-28"
    },
    {
      id:"grafik-baskili-tisort", name:"Grafik Baskılı Tişört",
      cat:"tisort", cats:["tisort"],
      price:790, stock:true,
      colors:cols("beyaz","siyah"), sizes:sz(["S","L"]),
      images:[{ u:"photo-1576566588028-4147f3842f27", alt:"Baskılı tişört (temsili görsel)" }],
      desc:"Grafik baskılı tişört. Önde büyük baskı, rahat kesim.",
      details:["Kumaş: pamuk","Kalıp: Regular","Görsel temsilidir",CARE],
      fit:"Regular", added:"2026-09-15"
    }
  ];

  var categories = [
    { id:"fleece",  name:"Fleece",         short:"Fleece", image:{ src:IG+"nocta-tracksuit.jpg", w:360, h:640, pos:"50% 38%", alt:"" } },
    { id:"esofman", name:"Eşofman Takımı", short:"Takım",  image:{ src:IG+"esofman-takimi-rack.jpg", w:361, h:640, pos:"50% 50%", alt:"" } },
    { id:"ceket",   name:"Ceket",          short:"Ceket",  image:{ src:IG+"kot-ceket-rack.jpg", w:360, h:640, pos:"50% 42%", alt:"" } },
    { id:"sweat",   name:"Sweatshirt",     short:"Sweat",  image:{ src:IG+"uc-iplik-sweatshirt.jpg", w:561, h:640, pos:"50% 45%", alt:"" } },
    { id:"hoodie",  name:"Hoodie",         short:"Hoodie", image:{ src:IG+"uc-iplik-hoodie.jpg", w:608, h:640, pos:"50% 45%", alt:"" } },
    { id:"alt",     name:"Jogger / Alt",   short:"Jogger", image:{ src:IG+"double-face-jogger.jpg", w:480, h:640, pos:"50% 50%", alt:"" } },
    { id:"tisort",  name:"Tişört",         short:"Tişört", image:{ u:"photo-1521572163474-6864f9cf17ab", alt:"" }, stock:true }
  ];

  window.MONARK = {
    products: products,
    categories: categories,
    colors: C,
    sizeOrder: ["S","M","L","XL","XXL"],
    config: {
      whatsapp: "905000000000",            // placeholder numara
      shopier: "https://www.shopier.com/monarkwear",
      freeShip: 2999,
      instagram: "https://www.instagram.com/monarkwearcom/",
      igHandle: "@monarkwearcom",
      igFollowers: "42,1B",
      maxQty: 10
    }
  };
})();
