# flo-shopify-theme-neo

A Shopify theme with [Shopflo](https://www.shopflo.com)'s checkout, cart, and Shop Pass
(account/login) integration built in. The integration code itself
(`snippets/shopflo.liquid`, `assets/shopflo-script.js`, `assets/shopflo-styles.css`) is
theme-agnostic and portable to any Shopify theme. This particular repo happens to build on
[Dawn](https://github.com/Shopify/dawn), used here as the reference/example host theme — that's
just this repo's own base, not a requirement of the Shopflo integration.

## Structure

Standard Shopify theme layout:

- `layout/` — `theme.liquid` (main layout) and `password.liquid`
- `templates/` — JSON/Liquid templates per page type
- `sections/` — reusable page sections
- `snippets/` — reusable partials
- `assets/` — CSS/JS/images
- `config/` — `settings_schema.json` (Theme Editor settings) and `settings_data.json`
- `locales/` — translation files

## Shopflo integration

[Shopflo](https://www.shopflo.com) replaces the native checkout/cart/account flows with its own
conversion-optimized bundle. The integration is designed to drop into **any** Shopify theme, not
just Dawn — it makes no assumptions about the host theme's markup beyond the small set of
conventions documented below (a data attribute here, a class there). All of it is wired through
one entry point:

- `snippets/shopflo.liquid` — single render target for every Shopflo piece (assets, checkout
  button, buy-now button, Shop Pass account slots, shared popup markup). Read the `{% doc %}`
  block at the top of this file before touching anything Shopflo-related — it's written to be
  the one source of truth, for a human or an AI theme-editing agent, on how to add/wire up any
  piece in any theme without guessing at markup contracts.
- `assets/shopflo-script.js` — click-time logic (`ShopfloTheme` class) and the `<shopflo-accounts>`
  custom element that drives the Shop Pass login/account drawer.
- `assets/shopflo-styles.css` — supporting styles, including the settings-driven CSS variables and
  Shop Pass visibility rules.

This repo's `sections/header.liquid` shows one concrete example of hooking a theme's own markup
(cart icon, account icon) up to Shopflo — the same conventions apply wherever this integration is
dropped into a different theme.

Master on/off is a hardcoded value in `window.shopfloThemeConfig` (see `snippets/shopflo.liquid`),
not a Theme Editor setting — `assets/shopflo-script.js` reads it at click time and decides whether
to open Shopflo's real checkout/cart or fall back to a plain native navigation.

## Development

This theme is managed with [Shopify CLI](https://shopify.dev/docs/api/shopify-cli):

```sh
shopify theme dev      # start a local dev server against a connected store
shopify theme check    # lint the theme
shopify theme push     # push to a store
```

`.shopify/` is local CLI state and is gitignored.
