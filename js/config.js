/* Your NutriCrunch pouch photos (files in the images/ folder). */
const PACKS = {
  wide:"images/pack-mix-wide.jpg", close:"images/pack-three-pouches.jpg", figs:"images/pack-anjir.jpg", black:"images/pack-black-hero.jpg", mixClean:"images/product-mix.jpg",
  almond:"images/product-almond.jpg", cashew:"images/product-cashew.jpg", pista:"images/product-pista.jpg", chilgoza:"images/product-chilgoza.jpg",
  fig:"images/product-fig.jpg", raisin:"images/product-raisin.jpg", apricot:"images/product-apricot.jpg", dates:"images/product-dates.jpg", mixfruit:"images/product-mixfruit.jpg", akhrot:"images/product-akhrot.jpg",
  giftRed:"images/gift-red.jpg", giftFloral:"images/gift-floral.jpg", giftWindow:"images/gift-window.jpg", giftTruck:"images/gift-truck.jpg"
};

/* =============================================================
   EDIT THESE: shop settings, images, products and prices
   ============================================================= */
const SHOP = {
  whatsapp: "923398402017",      // 0339 8402017 in international form: country code 92, no leading 0, no + or spaces
  whatsappDisplay: "0339 8402017",
  freeShipOver: 5000,            // free delivery at or above this subtotal (Rs.)
  shipping: 200,                 // delivery charge below that (Rs.)
};

/* PRICING
   Each single product has a price per kg (kg:), taken from Pakistani online dry fruit price lists (October 2026).
   Pack price = kg price x weight, rounded to Rs. 10, plus PACK_FEE. kg price = the shop's own rate list + Rs. 400. Example: Badam 500g = 3,800 x 0.5 = Rs. 1,900.
   The mix has fixed prices (fixed:) that are used as written. Change a number here and every card, cart line and gift box updates.
   SALE_PERCENT: 0 shows normal prices. Set 20 to show a 20% sale with the normal price struck through. */
/* PROMO CODES: one code per sales channel, so every order tells you where the customer came from.
   code (UPPERCASE) -> { source: name shown in your WhatsApp order, percent: % off the subtotal  OR  flat: Rs. off }.
   Add, remove or change codes freely. Set percent: 0 for a tracking-only code (no discount, you still see the source).
   A link such as  https://yoursite.com/?promo=INSTA10  applies the code automatically (put it in your Instagram bio). */
const PROMOS = {
  INSTA10:  { source: "Instagram",  percent: 10 },
  FB10:     { source: "Facebook",   percent: 10 },
  TIKTOK10: { source: "TikTok",     percent: 10 },
  WA5:      { source: "WhatsApp",   percent: 5 },
  FRIEND:   { source: "Referral",   percent: 5 },
  EID200:   { source: "Eid offer",  flat: 200 },
};

const PACK_FEE = 0;     // flat amount added per pack. 0 now: the +Rs. 400 per kg margin is already inside each product's kg price
const SALE_PERCENT = 0;
const WEIGHTS = [ { k: "250g", g: 250 }, { k: "500g", g: 500 }, { k: "1kg", g: 1000 } ];
const DEFAULT_W = 1;             // index in WEIGHTS shown first (1 = 500g)

// Free Unsplash photos used where you have not added your own pack photo yet. Swap any id to change a picture.
const PHOTO = {
  mixed2:    "1641291361624-38b69b86b1cf",
  market:    "1710857397974-f0617001c39e",
  almond:    "1608797178974-15b35a64ede9",
  cashew:    "1726771517475-e7acdd34cd8a",
  pistachio: "1704079662049-d00890d21a69",
  walnut2:   "1635843108103-9af0ea224a19",
  dates:     "1556843824-256570ca21c4",
  raisins:   "1691657917109-c6e027eac44a",
  giftOrange:"1647221598272-9aa015392c81",
  giftMint:  "1707944145479-12755f0434d8",
  giftBlack: "1674620213535-9b2a2553ef40",
  giftRed:   "1671150590216-f138600130ce",
  giftWrap:  "1549465220-1a8b9238cd48",
  giftFloral:"1592903297149-37fb25202dfa",
};
const photo = (key, w = 600) => `https://images.unsplash.com/photo-${PHOTO[key]}?auto=format&fit=crop&w=${w}&q=70`;

/* PRODUCTS
   pack: use one of your embedded NutriCrunch photos (wide, close, figs, black). img: stock photo key used when there is no pack photo.
   Photos still to add: badam, kaju, pista, akhrot, kishmish, khubani, ajwa, sukkari. */
const PRODUCTS = [
  { id: "mix",     name: "NutriCrunch Mix",             short: "Mix",     ur: "نیوٹری کرنچ مکس میوہ", cat: "mix",   fixed: { 250: 925, 500: 1850, 1000: 3700 }, pack: "mixClean", img: "mixed2", tag: "7-in-1 mix", note: "Pista · Kishmish · Badam · Akhrot · Anjir · Kaju · Khubani" },
  { id: "badam",   name: "Badam (Almonds)",             short: "Badam",   ur: "بادام",         cat: "nuts",  kg: 3800, pack: "almond", img: "almond",    tag: "Almonds" },
  { id: "kaju",    name: "Kaju (Cashews)",              short: "Kaju",    ur: "کاجو",          cat: "nuts",  kg: 3900, pack: "cashew", img: "cashew",    tag: "Cashews" },
  { id: "pista",   name: "Pista Giri (Pistachio)",      short: "Pista",   ur: "پستہ",          cat: "nuts",  kg: 6200, pack: "pista", img: "pistachio", tag: "Pistachio" },
  { id: "akhrot",  name: "Akhrot (Walnuts, in shell)", short: "Akhrot",  ur: "اخروٹ",         cat: "nuts",  kg: 1250, pack: "akhrot", img: "walnut2",   tag: "Walnuts" },
  { id: "chilgoza", name: "Chilgoza (Pine Nuts)",    short: "Chilgoza",ur: "چلغوزہ",       cat: "nuts",  kg: 13400, pack: "chilgoza", img: "mixed2",   tag: "Pine nuts" },
  { id: "anjir",   name: "Anjir (Dried Figs)",          short: "Anjir",   ur: "انجیر",         cat: "dates", kg: 3000, pack: "fig", img: "market", tag: "Dried figs" },
  { id: "kishmish",name: "Kishmish (Raisins)",          short: "Kishmish",ur: "کشمش",          cat: "dates", kg: 1600, pack: "raisin", img: "raisins",   tag: "Raisins" },
  { id: "khubani", name: "Khubani (Dried Apricots)",    short: "Khubani", ur: "خوبانی",        cat: "dates", kg: 1300, pack: "apricot", img: "market",    tag: "Apricots" },
  { id: "mixfruit", name: "Mixed Fruit Giri",           short: "Fruit Giri", ur: "مکس فروٹ گری", cat: "dates", kg: 2200, pack: "mixfruit", img: "mixed2", tag: "Mixed fruit" },
  { id: "ajwa",    name: "Khajoor Ajwa",                short: "Ajwa",    ur: "عجوہ کھجور",    cat: "dates", kg: 2600, pack: "dates", img: "dates",     tag: "Dates" },
  { id: "sukkari", name: "Khajoor Sukkari",             short: "Sukkari", ur: "سکری کھجور",    cat: "dates", kg: 1400, pack: "dates", img: "dates",     tag: "Dates" },
];
const CATS = [
  { key: "all",   label: "All",                  ur: "سب" },
  { key: "nuts",  label: "Giri & Nuts",          ur: "گری" },
  { key: "dates", label: "Khajoor & Dried Fruit", ur: "کھجور" },
  { key: "mix",   label: "Mixed Mewa",           ur: "مکس" },
];

/* GIFT BOXES: four designs. items = [product id, grams]. Price = contents (same pack prices as above) + fee, rounded to Rs. 50.
   fee = the cost of the box itself, max = how many 250g packs fit when a customer builds their own. */
const GIFT_BOXES = [
  { id: "mini",  name: "Mini Tohfa Bag",     ur: "چھوٹا تحفہ بیگ",  desc: "Handle gift bag, for a visit",  fee: 350,  max: 3, pack: "giftFloral", img: "giftFloral", items: [["badam", 250], ["kaju", 250], ["kishmish", 250]] },
  { id: "sehat", name: "Sehat Window Box",   ur: "صحت ڈبہ",         desc: "Kraft box with a clear window", fee: 400,  max: 4, pack: "giftWindow", img: "giftFloral", items: [["anjir", 250], ["khubani", 250], ["kishmish", 250], ["akhrot", 250]] },
  { id: "eid",   name: "Truck Art Eid Box",  ur: "ٹرک آرٹ عید ڈبہ", desc: "Colourful Pakistani truck art", fee: 600,  max: 5, pack: "giftTruck",  img: "giftOrange", items: [["badam", 250], ["kaju", 250], ["pista", 250], ["sukkari", 500]] },
  { id: "royal", name: "Royal Ribbon Hamper",ur: "شاہی ربن ہیمپر",  desc: "Red and gold, tied with ribbon",fee: 1200, max: 6, pack: "giftRed",    img: "giftRed",    items: [["mix", 500], ["pista", 500], ["kaju", 500], ["ajwa", 500], ["badam", 500]] },
];
const RIBBONS = [
  { id: "Burgundy", c: "#5a1222" }, { id: "Gold", c: "#c9a063" }, { id: "Olive", c: "#4b4b27" }, { id: "Cream", c: "#efe3c4" },
];

const BEST_IDS = ["mix", "badam", "kaju", "pista", "anjir", "khubani"];   // product ids shown in Best Sellers (4 to 6)

const QUOTES = [
  "روز مٹھی بھر بادام، صحت کا پکا انتظام",
  "کھجور کی مٹھاس، دسترخوان کی جان",
  "اخروٹ کا ایک دانہ، دماغ کا خزانہ",
  "مہمان کی عزت، میوے کی طشتری",
  "پستہ، کاجو، کشمش، ہر دانے میں خلوص",
];
