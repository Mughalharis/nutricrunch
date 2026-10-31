# NutriCrunch website

Static website (plain HTML, CSS and JavaScript). No build step, no framework, no server code. Orders are sent to the owner as a WhatsApp message.

## Files

```
index.html        page structure and all text
css/styles.css    all styling (colours and gradients are variables at the top, in :root)
js/config.js      THE FILE TO EDIT: shop settings, prices, products, gift boxes, photos, customer proof
js/app.js         behaviour: product cards, search, cart, delivery form, WhatsApp order, gift box builder
images/           NutriCrunch pouch photos (product-*.jpg are the clean, background-removed listing images, 1200x900)
```

Fonts (Rozha One, Hind, Noto Nastaliq Urdu) load from Google Fonts. Product photos that are not yet replaced load from Unsplash (see "To finish before launch").

## Run it locally

Open `index.html` in a browser, or serve the folder:

```
npx serve .
```

## Put it live

It is a static site, so any static host works. Upload the whole folder, keeping the structure.

- **Netlify (easiest):** go to app.netlify.com/drop and drag the folder in. You get a live link, and you can add the real domain afterwards.
- **cPanel / shared hosting:** upload the contents into `public_html`, so that `index.html` sits at the root.
- **Vercel, GitHub Pages, Cloudflare Pages:** push the folder to a repository and point the host at the root. No build command, no output directory.

Use HTTPS (all hosts above provide it).

## Edit content (all in `js/config.js`)

| What | Where |
|---|---|
| WhatsApp number (orders come here) | `SHOP.whatsapp` (international form, `92339...`, no + or 0) |
| Delivery charge and free-delivery limit | `SHOP.shipping` (200) and `SHOP.freeShipOver` (5000) |
| Pack sizes | `WEIGHTS` (250g, 500g, 1kg). `DEFAULT_W` is the size shown first (500g) |
| Extra amount added to every pack | `PACK_FEE` (now 0, because Rs. 400 per kg is already inside each `kg` price) |
| Product prices | `kg` on each product in `PRODUCTS` (price per kg). Pack price = kg price x weight, rounded to Rs. 10, plus `PACK_FEE` |
| Mix price | `fixed` on the Mix product (250g 925, 500g 1850, 1kg 3700) |
| Sale | `SALE_PERCENT` (0 = off, 20 = 20% off with the normal price struck through) |
| Best sellers | `BEST_IDS` (4 to 6 product ids) |
| Gift boxes | `GIFT_BOXES` (contents, box fee, capacity, photo). Price is computed from the contents plus the fee |
| Ribbon colours | `RIBBONS` |
| Product photos | `pack:` (file key from `PACKS`) or `img:` (stock photo key from `PHOTO`) on each product |

To add a product photo: save the file in `images/`, add it to `PACKS` at the top of `config.js`, and set `pack: "yourKey"` on the product.

Colours and gradients: change the variables in the `:root` block at the top of `css/styles.css` (`--maroon`, `--pista`, `--brass`, `--grad-hero` and so on).

## How the order works

1. The customer fills the cart (stored in the browser's localStorage).
2. They enter name, phone, city and address (validated in the page).
3. "Confirm Order on WhatsApp" opens WhatsApp with the full order, total and address already written, addressed to `SHOP.whatsapp`.
4. The customer presses Send. The order reaches the owner only after that.

There is no backend, so orders are not stored anywhere else and nothing is sent automatically. If the owner later wants automatic order capture (dashboard, email, WhatsApp Business API), a small backend or form service is needed.

## Promo codes and sales source

`PROMOS` in `js/config.js` lists the codes (example: `INSTA10`, `FB10`, `WA5`). Each has a `source` name and either `percent` or `flat` Rs. off (use `percent: 0` for tracking only). The customer types the code in the tokri; the discount shows in the totals. Every WhatsApp order ends with `Promo code:` and `Sales source:` lines, and the webhook also gets `promo_code`, `sales_source` and `discount`. A link like `https://yoursite.com/?promo=INSTA10` applies the code automatically, so put one link per channel in each bio or ad. The code is checked in the browser only, so treat it as tracking, not as protection.

## Automatic order capture (optional)

`SHOP.orderWebhook` in `js/config.js` is empty by default. Paste a webhook URL (Pabbly Connect, Zapier, Make) there and every confirmed order is also POSTed as JSON: `order_ref, created_at, customer_name, customer_phone, city, address, note, items[], subtotal, delivery, total, summary`. The tool can then send the customer a WhatsApp message with Confirm / Cancel buttons through the WhatsApp Business API (AiSensy, Wati etc.; templates need Meta approval). The webhook only fires from the website, and a failure never blocks the customer's own WhatsApp message.

## To finish before launch

- **Chilgoza:** Rs. 13,000/kg is an estimate from online price lists. Confirm the price and whether it is in-shell or kernels.
- **Photos:** all listings use the owner's real NutriCrunch pouch photos (background removed, `images/product-*.jpg`), including **Akhrot** (the owner's own photo of walnuts in a NutriCrunch pouch, window content reused) and **Mix** (black pouch). Four gift boxes use the owner's box photos (`images/gift-*.jpg`). To change one: replace the file, keep the name.
- **Prices (29 Oct, from the owner's handwritten rate list, each + Rs. 400/kg):** Badam 3,400 → 3,800; Kaju 3,500 → 3,900; Pista 5,800 → 6,200 (the list says "pista namkeen", please confirm it is the kernel price); Anjir 2,600 → 3,000; Kishmish 1,200 → 1,600; Khubani 900 → 1,300; Sukkari 1,000 → 1,400 (the line was hard to read, confirm). Not on the list, so only +400 on the earlier estimate: Chilgoza 13,400, Ajwa 2,600 (list showed 4,000 crossed out), Mixed Fruit Giri 2,200. Akhrot is now sold in shell (as in the owner's pouch photo) at the list's 850 + 400 = Rs. 1,250/kg, so confirm that the 850 line is in-shell walnuts. Akhrot giri (kernels) is no longer listed.
- **Older price note:** per-kg prices are estimates from Pakistani online price lists (October 2026). Confirm each against the real supplier cost, especially Anjir and Pista.
- **Mixed Fruit Giri** was added at Rs. 1,800/kg: an estimate, please confirm.
- **Gift box fees** (`fee` in `GIFT_BOXES`) are placeholders.
- **"Why NutriCrunch" section** (`index.html`, id `why`): the four cards have dashed "Add your real details" boxes. Replace them with the real sourcing, quality check, packaging and freshness information, and remove the `todo` class.
- **Footer** (`index.html`): "Delivery: 2 to 5 working days" and "Cash on delivery available" need to be confirmed or removed.
- **Page title, meta description, favicon:** set to the real brand details if different.
