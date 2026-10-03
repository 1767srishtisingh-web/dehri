# Dehri - hyperlocal grocery and snacks delivery (frontend demo)

A static website built with HTML, CSS and vanilla JavaScript. No build step,
no backend. All sample data is in `script.js`; changes made in the browser are
kept in localStorage.

## Folder structure

    dehri/
    ├── index.html      Page structure (customer portal, shopkeeper portal, cart, checkout)
    ├── style.css       All styles. Colours and fonts are variables at the top.
    ├── script.js       Settings, sample data and all interactions
    ├── README.md
    └── images/         Demo product illustrations (original SVGs, free to use)
        ├── logo.svg, placeholder.svg
        └── atta.svg, rice.svg, milk.svg ... (27 product images)

## Run locally

Option 1, VS Code Live Server (recommended):
1. Open the `dehri` folder in VS Code.
2. Install the "Live Server" extension.
3. Right-click `index.html` and choose "Open with Live Server".

Option 2: double-click `index.html`. Everything works, but OpenStreetMap may
refuse to serve map tiles to pages opened as `file://`. If the map is grey or
shows "access blocked" tiles, use Live Server.

An internet connection is needed for the map (Leaflet + OpenStreetMap) and the
web fonts. The rest works offline.

## Customise (all in script.js, section 1)

| What                         | Where                                         |
|------------------------------|-----------------------------------------------|
| Delivery fee, free threshold | `CONFIG.deliveryFee`, `CONFIG.freeDeliveryAbove` |
| Villages and map pins        | `AREAS` (set `status` to "active" or "planned") |
| Shops and their coverage     | `SHOPS` (`serves` lists area ids)              |
| Categories                   | `CATEGORIES`                                   |
| Products, prices, tax, stock | `DEFAULT_PRODUCTS`                             |
| Delivery partners            | `PARTNERS`                                     |
| Social links, contact line   | `SOCIAL_LINKS`, `CONFIG.contact`               |
| Colours and fonts            | `:root` at the top of `style.css`              |
| Brand name and hero text     | `index.html`                                   |

After editing `DEFAULT_PRODUCTS`, click "Reset demo data" in the Shopkeeper
portal (or clear site data) so the browser drops its saved copy.

To use your own photos, put JPG/PNG/WebP files in `images/` and change the
product's `image` path.

## Before going public

- Map coordinates are approximate. Verify each pin on openstreetmap.org.
- Tax percentages are sample values. Confirm the correct GST rate per product.
- Shops, partners, phone number and social links are placeholders.
- Orders, payment, tracking and inventory are simulated in the browser. A real
  service needs a backend, a database, logins and a payment provider.
