# Shopflo integration - session context (2026-08-31 → 2026-09-28)

Working notes from an extended Claude Code session on the Shopflo checkout/buy-now/cart/shop-pass
integration (`snippets/shopflo.liquid`, `assets/shopflo-script.js`, `assets/shopflo-styles.css`,
`config/settings_schema.json`, `sections/header.liquid`). Kept here (not just in Claude's own
memory) so any collaborator - human or AI - can pick up full context without re-deriving it from
the diff.

All items below were implemented and verified (headless-Chrome DOM/CSS checks where relevant,
`shopify theme check` clean throughout at a stable baseline of 32 pre-existing errors / 20
pre-existing warnings unrelated to this work) unless marked otherwise.

---

## 1. Checkout / Buy Now button

### "Top of button" promo banner now nests inside the button
When `shopflo_promo_banner_layout_checkout/_buy_now` is `top_of_button`, the promo badge is
rendered as a DOM **child** of the `<button>` itself (captured once into a variable, emitted
either before the button as a sibling for `attached`/`separate`, or inside it for
`top_of_button`) instead of as a preceding sibling positioned via `:has(+ button...)` CSS
mirroring. Deleted ~45 lines of duplicated hover-effect-mirroring CSS - a real DOM child
naturally inherits the button's transform/filter/box-shadow/shine for free. Side effect: the
badge's corner offset is now measured from the actual button edges (more correct for
non-full-width buttons).

### Label doesn't fill full width when icons + badge are both hidden - fixed
`.shopflo-checkout__button--label`/`.shopflo-buy-now__button--label` had a fixed
`flex-basis: 70%` with `flex-grow: 0` everywhere in the row. When the payment-icons wrapper and
the "Powered by Shopflo" badge are both omitted from the DOM, the label stayed capped at 70%,
leaving dead space. Added `flex-grow: 1` to both label classes - no visual change when siblings
are present, fills 100% when they're absent.

### Label-width "squeeze" guard - auto-hides icons/badge when the label is cramped
New `bindLabelWidthGuard()` in `assets/shopflo-script.js`. Measures each button's label width vs.
the button's own width; adds `.sf-label-squeezed` (CSS hides the icons row + badge under it)
whenever the label's rendered width is `<=55%` of the button's width (ratio tuned down from an
initial 60%). Re-evaluated on window resize (debounced) and `document.fonts.ready` - **not** via
a `ResizeObserver` on the button itself, because a non-"Full width" button shrink-wraps to its
content, so hiding icons/badge would shrink the button too, and a self-observing ResizeObserver
would react to its own change → infinite oscillation. Every `evaluate()` run removes the squeeze
class first (restoring natural state) before measuring, so it never reacts to a state a previous
run produced. Complements the `flex-grow: 1` fix above.

### New render param: `shopflo_payment_icons`
`{% render 'shopflo', type: 'checkout', shopflo_payment_icons: false %}` - checkout/buy_now only.
An extra AND-gate on top of (not instead of) the existing Theme Editor "Show payment icons"
setting, so a caller can force the row off for one render without touching settings. Uses the
safe boolean pattern (see "Patterns" below), unlike the pre-existing `shopflo_badge` param which
still uses the unsafe one.

### New render param: `extra_class` (originally named `class`, renamed on request)
`{% render 'shopflo', type: 'checkout', extra_class: 'my-class' %}` - appends the given class(es)
to that render's own root wrapper element: `.shopflo-checkout__wrapper` for `'checkout'`,
`.shopflo-buy-now__wrapper` for `'buy_now'`, or `<shopflo-accounts>` itself for the three
`shop_pass_*` types (they share one render branch). No-op for other `type`s (e.g. `'assets'`).

---

## 2. Cart / add-to-cart

### `shopflo_intercept_cart_page_redirect` implemented
This config key already existed in `window.shopfloThemeConfig` (hardcoded `false`) but was never
read anywhere - the header cart icon was a plain `<a href="{{ routes.cart_url }}">` with zero
Shopflo wiring. Added `bindCartPageRedirectIntercept()`: when the flag is `true` (checked once at
bind time, since it's a static per-page-load literal), a delegated `document` click listener
intercepts clicks on any `<a href>` whose `.pathname` matches the newly-exposed
`shopflo_cart_url` config value, and calls `openThemeFloCart()` instead of letting the native
page load. Skips modifier-key clicks and `target="_blank"` links.

### Add-to-cart with `shopflo_enable: false` now falls back to `/cart`
`bindDomEvents()`'s `shopflo-event:add-to-cart` listener used to just `return` when Shopflo
shouldn't trigger directly, leaving native theme behavior in charge - which for `cart-drawer.js`
meant literally nothing happened (its own native open is commented out, deferring entirely to
this listener), and for `cart-notification.js` meant its native toast opened regardless (it only
guards on `window.shopfloCartAutoOpen`, hardcoded `true`, not on `shopflo_enable`). Now does
`window.location.href = '/cart'` in that branch - matches the cart icon's own fallback. Checkout
and buy-now buttons deliberately still fall back to `/checkout`, not `/cart` - confirmed correct
by the user, do not change.

---

## 3. Shop Pass (account/login) - Theme Editor settings

Three independently-styled slots: Login Button A (primary), B (secondary, can inherit A or C's
style via "Inherit styles from"), C (tertiary, can inherit A or B). Any NEW per-button style
setting must be wired through the SAME three-slot, two-pass inheritance resolution already used
for the existing fields (see "Patterns" below) - this bit multiple times during the session.

New settings added, each following that pattern:
- **Font size** (`shopflo_account_font_size_button_a/b/c`, default 14px = previous hardcoded
  value).
- **Icon spacing** (`shopflo_account_icon_gap_button_a/b/c`, default 6px = previous hardcoded
  gap).
- **Bold text** (`shopflo_account_bold_text_button_a/b/c`, checkbox, default `true`). Required
  also deleting a hardcoded `font-weight: 500` on `.shopflo-accounts__label` that would otherwise
  have silently overridden the new `.sf-text--bold`/`.sf-text--normal` utility classes (equal
  specificity, later in the cascade) - the checkbox would have been a no-op without that removal.
- **Full width** (`shopflo_account_full_width_button_a/b/c`, checkbox, default `false` - unlike
  checkout/buy-now's own Full width, which defaults `true`, since this element is normally inline
  among other header icons). Applies `sf-full-width` to BOTH `<shopflo-accounts>` and the inner
  `.shopflo-accounts__icon-button` - both needed, since the button's `width:100%` only resolves
  against a definite containing-block width, and the wrapper itself defaults to shrink-to-fit.
  `.shopflo-accounts__icon-button` already sets its own `width: fit-content` (equal specificity,
  later in the file) - same cascade-order gotcha as bold text, fixed the same way (scoped
  `.class.class` overrides).
- **Dropdown position - two new options**: "Open above center" / "Open below center", alongside
  the existing four (above/below × left/right). The setting is one combined
  `{vertical}-{horizontal}` select, split in Liquid - the new option *values* needed zero Liquid
  changes. The real work was in `_computeDrawerPosition()` (see bug fixes below), which used to
  treat horizontal as strictly binary.

---

## 4. Shop Pass - bug fixes

### "Dropdown position" appeared not to work - two separate causes
1. **By design, not a bug**: positioning only ever applies to the LOGGED-IN drawer
   (`.shopflo-accounts__drawer`) - `_handleHeaderIconClick()`'s logged-out branch defers entirely
   to the external bundle's own `window.handleDrawer()`, which this theme has zero control over.
   Testing logged-out (the common case) makes the setting look inert even when wired correctly.
2. **Real bug, fixed**: `_positionDrawer()` cached the computed open-direction in
   `sessionStorage` keyed only by slot, and on a cache hit used it directly without re-checking
   against the current `data-drawer-vertical`/`-horizontal`. So once cached, changing the Theme
   Editor setting had zero effect for the rest of that browser tab's session - exactly the
   theme-editor preview workflow. Fixed by folding the preferred direction into the cache key
   itself, so a changed setting is a cache miss on its own (old key sits orphaned, harmless).

### Login/account icon missing entirely on mobile (pre-existing since the first commit)
`sections/header.liquid`'s mobile nav drawer rendered `type: 'shop_pass_primary'` - duplicating
Button A (default "Desktop only", already rendered separately in the main header row) -
contradicting its own comment ("shop_pass_primary/shop_pass_secondary instances already cover
mobile"). `shop_pass_secondary` (Button B, default "Mobile only") was never rendered ANYWHERE in
the theme. Fixed by changing the render call to `type: 'shop_pass_secondary'`. Confirmed via
`git log` this exact bug existed since the repo's very first commit.

### Drawer's "Account" item hard-navigated to `/account` - TRIED A FIX, THEN REVERTED
`_setupDrawerItemTriggers()`'s `account-login` handler calls
`window.handleShopifyLogin(event, '/account')`. **First attempted fix (WRONG, explicitly reverted
by the user): swapped it for `window.handleDrawer()`.** `handleDrawer()` is a TOGGLE meant for
the header icon, not a dedicated "open account management" call - firing it from an
already-open drawer's own item risks putting the bundle in the wrong state. **Reverted back to
`handleShopifyLogin(event, '/account')`**, which matches the exact signature the bundle's own
dummy `shop_pass_bundle_markup` reference link uses, so it isn't a misuse on this theme's part.
If the redirect-vs-overlay behavior itself needs to change, that decision happens inside the
external bundle script, not this repo - raise it with Shopflo directly rather than trying another
client-side function swap.

**Do not repeat this mistake** - do not wire `handleDrawer()` into the drawer's own items.

### Fresh session (no cookies at all) - seed both Shopflo session keys
On a genuinely fresh session (neither `flo_isShopfloSession` nor `FLO_SSO_IS_LOGOUT` present at
all), `seedShopfloSessionFlagsIfMissing()` now seeds both to `'true'` once, immediately, at
script-parse time. This still resolves to `'logged-out'` in this theme's own state resolution
(same as both keys being absent), so it's a no-op for this theme's own branching - it exists
because the external bundle reads these same two keys directly and, per observed behavior, only
initializes its own login flow correctly once both have a defined value. Never overwrites an
existing session.

### New public global: `window.isThemeFloLoggedIn()`
A function (not a cached boolean - state can change without a reload), usable from anywhere,
including a page with zero `shop_pass_*` instances rendered. Extracted the shared auth-resolution
logic into module-level `readShopfloSessionStorage()`/`writeShopfloSessionStorage()`/
`resolveShopfloAuthState()` functions, with the `ShopfloAccounts` class's own
`_readSessionStorage()`/`_writeSessionStorage()`/`_resolveSessionState()` now delegating to them
(pure refactor, same debug logging preserved).

### Close ("X") button added to the account drawer
Sits at the edge of the drawer FARTHEST from the account icon - bottom when the drawer opens
below (default), top when it opens above (`--open-top`). **Explicit follow-up correction**: must
float OUTSIDE the drawer's rounded/padded card, not be laid out as a list-style item inside it.
Final implementation: `position: absolute` on `.shopflo-accounts__drawer-close` itself, offset
past the drawer's own edge (`bottom: -30px` by default, flipped to `top: -30px` under
`--open-top`), with its own background/shadow so it reads as a distinct floating circular badge.
Still a real DOM child of the drawer, so it inherits the drawer's own `data-flo-visible`
hide/show for free (a `display:none` parent always hides descendants regardless of the
descendant's own `position`). No `data-flo-trigger="close-drawer"` JS wiring was needed - that
attribute is already handled generically by `_setupOverlayTrigger()`.

---

## 5. Patterns worth knowing before touching this code again

**Three-slot inheritance cascade** (Shop Pass Button A/B/C): a new per-button style setting needs
four pieces wired in this exact order in `snippets/shopflo.liquid`: (1) B's `_preliminary` value
resolved against A or C's raw fields; (2) C's `_source` value resolved against A directly or B's
`_preliminary`; (3) B's final `_source` value resolved against its own `_preliminary`, swapped to
C's `_source` if B points at C; (4) the per-slot final value picked by `account_slot`. This
two-pass order is what makes a genuine A←B←C/A←C←B chain resolve correctly and a B↔C cycle
terminate deterministically instead of looping. Fields that drive a CSS var (icon size, font
size, icon gap) additionally get exposed as `--shopflo-account-X-primary/-secondary/-tertiary` in
the `:root` `{% style %}` block and remapped per-slot in CSS; fields that drive markup directly
(label text, layout, bold text, full width) resolve straight into a variable picked by
`account_slot`.

**Boolean render params must use the safe pattern, never `| default:`**:
```liquid
assign my_param_param = my_param
assign my_param = true
if my_param_param == false
  assign my_param = false
endif
```
`| default: true` silently treats an explicit `false` the same as "not passed". `show_icon` and
the newer params (`shopflo_payment_icons`) use the safe pattern; the older `shopflo_badge` still
uses the unsafe one (known, not fixed - out of scope each time it came up).

**Cascade-order footgun, hit twice**: when a new setting needs to override a property some OTHER
rule already sets on the same element with equal selector specificity (a single class), the rule
declared LATER in the stylesheet wins regardless of which is "more specific-sounding" - check
what else sets that property before assuming a plain utility class will win. Bit
`.shopflo-accounts__label`'s `font-weight` (bold text setting) and
`.shopflo-accounts__icon-button`'s `width` (full width setting); both fixed by scoping the
override as a two-class selector instead.

**Verification technique**: no browser-automation tool was available in this environment, so all
CSS/interaction behavior in this session was verified by scripting real headless Chrome directly
via the DevTools Protocol (`chrome --headless=new --remote-debugging-port=N`, driven by a small
Node script using native `WebSocket`/`fetch` to dispatch real `Input.dispatchMouseEvent`
clicks/hovers and read back `getComputedStyle`/`getBoundingClientRect`) rather than trusting
static code reading alone. This caught at least one real bug that reasoning-only review missed
(the `display: flex` vs `display: block` cascade-order issue on the close button work).

## Known pre-existing issues noticed but NOT fixed (out of scope each time)

- Dead code near the top of `snippets/shopflo.liquid`
  (`any_selected_checkout_payment_icons`/`any_selected_buy_now_payment_icons`, ~line 235-241)
  references a wrong/nonexistent setting id for checkout and is immediately shadowed by a correct
  re-computation inside the `'checkout'`/`'buy_now'` case blocks - harmless, worth cleaning up if
  ever touching that area.
- `shopflo_badge` render param uses the unsafe `| default: true` pattern, unlike newer params.

---

## 6. Label-squeeze guard - quick-add modal gap (DIAGNOSED, NOT YET FIXED)

`bindLabelWidthGuard()` (see item 1 above) only calls `evaluate()` three times: at `init()`,
on `document.fonts.ready`, and on debounced `window resize`. It also captures its button list via
a single `querySelectorAll()` call at bind time, not re-queried inside `evaluate()`.

Cart drawer (`snippets/cart-drawer.liquid`) and cart-notification popover use `visibility:hidden`,
not `display:none`, so their checkout buttons have real, non-zero dimensions at `init()` even
while visually hidden - the guard works correctly for both.

**The actual gap: quick-add modal.** `assets/quick-add.js`'s `QuickAddModal.show()` fetches the
product page over AJAX and injects a fresh `.shopflo-buy-now__button` via `innerHTML` at click
time - strictly after all three `bindLabelWidthGuard()` triggers have already fired. Nothing
re-invokes the guard when this modal content is injected, and even a manual re-invocation
wouldn't see this button today since the original `querySelectorAll()` result is stale. Net
effect: a Buy Now button opened via quick-add whose label is long enough to overflow will keep
its payment icons/badge visible instead of hiding them - user-reported as "payment icons not
hiding when label overflows, in a few cases."

**Fix outlined, not yet applied**: move the `querySelectorAll(...)` call inside `evaluate()` so
it always reflects the current DOM, and call `evaluate()` again from `quick-add.js` right after
`setInnerHTML(this.modalContent, ...)` injects the new product markup.

---

## 7. Checkout / Buy Now button padding split into vertical/horizontal

`shopflo_button_padding_checkout` and `shopflo_button_padding_buy_now` were each a single `range`
setting applied as the CSS `padding` shorthand (all four sides equal). Split into independent
pairs, matching the pattern the Shop Pass A/B/C buttons already used
(`shopflo_account_padding_block/inline_button_a/b/c`):

- `shopflo_button_padding_checkout` → `shopflo_button_padding_block_checkout` +
  `shopflo_button_padding_inline_checkout`
- `shopflo_button_padding_buy_now` → `shopflo_button_padding_block_buy_now` +
  `shopflo_button_padding_inline_buy_now` (both keep the existing
  `visible_if: shopflo_match_checkout_layout_buy_now == false`)

Same 0-50px range and default 10px on all four new settings, so existing stores render
identically after the change. CSS vars renamed `--sf-checkout-padding`/`--sf-buy-now-padding` →
`-padding-block`/`-padding-inline` pairs in `snippets/shopflo.liquid`'s `:root` block (including
the buy-now "match checkout layout" branch, which now sources both block and inline from the
checkout settings when matching). `assets/shopflo-styles.css` buttons now use
`padding-block`/`padding-inline` instead of the `padding` shorthand. The payment-icon sizing
`calc()`s (`.shopflo-icon[class*="shopflo-payment-icon--"]` and its per-button overrides, ~line
577-592) measure vertical space inside the button, so they were repointed at the `-block`
variable specifically, not `-inline`.

---

## 8. Render param / setting renames

- `show_icon` → `show_user_icon` (shop_pass icon-visibility render param, `snippets/shopflo.liquid`
  - doc comment, safe-boolean-pattern assignment, both `{%- if -%}` usages). Purely a naming
  clarity request, no behavior change. No other call site in the repo passed this param.
- `shopflo_customer_account_enabled` → `shopflo_customer_account_provider` (the select deciding
  whether the header/mobile-drawer account icon renders Shopflo's `shop_pass_secondary` or the
  theme's own native account link) - across `config/settings_schema.json`,
  `snippets/shopflo.liquid`, and `sections/header.liquid` (both the desktop and mobile-drawer
  `{%- if -%}` checks). Naming clarity only - same two option values (`'shopflo'`/`'shopify'`),
  same behavior.

---

## 9. `!important` added to all Shopflo CSS

On request, every declaration in every rule whose selector touches a `.shopflo-*`/`.sf-*` class,
a `[class*="shopflo-…"/"sf-…"]` attribute pattern, or the `shopflo-accounts` custom element got
`!important` appended (443 additions on top of the pre-existing 20) - so a host theme's own CSS
can never silently override Shopflo's styling when this integration is copy-pasted elsewhere.
Left untouched: `@keyframes` bodies (the spec disallows `!important` there), the
`.dummy-popup-*` popup-morph rules, `#shopify-buy-now__button--wrapper`,
`.buy-now__button--radius`/`.checkout__button--radius`, the `#flo-shopify-login-*` IDs, and
`[data-flo-visible]`/`#flo-marketing-popup-wrapper` - none carry the `shopflo-`/`sf-` prefix
literally, so they fell outside the requested scope.

Cascade-order-dependent pairs (e.g. the promo-banner "cancel the button's own hover effect, apply
it once to the wrapper instead" pair, and the `.shopflo-accounts__icon-button`/`.sf-full-width`
override pair) got `!important` on BOTH sides of the pair, on request - since `!important` vs
`!important` still resolves by source order, the later-declared rule keeps winning, so behavior
is unchanged.

**Gotcha hit while implementing**: a mechanical "add `!important` before every `;`" script must
mask `/* … */` comments before doing any brace-matching - two comments in this file contain
literal `{`/`}` characters in their PROSE (`shopflo-accounts{}, above` and a Liquid
`{% render ... %}` snippet quoted inside a comment), which broke naive brace-counting and produced
a corrupted `!important}` fragment near the `shopflo-accounts` custom-element rule. Fixed by
regex-stashing every comment as a placeholder token before parsing, restoring verbatim after -
verified after the fix via a balanced-brace count and a full diff review with zero non-`!important`
line changes. Re-ran the exact same (corrected) script later in the same session, after the whole
change was reverted (an unrelated third-party error, per the user) and re-requested - if
`assets/shopflo-styles.css` needs bulk-editing again, mask comments FIRST, every time.

---

## 10. `shopflo_third_party_cart_mutation` wired up (was dead config)

`window.shopfloThemeConfig.shopflo_third_party_cart_mutation` (`snippets/shopflo.liquid`, a
hardcoded object literal - `enabled`, `is_shadow_dom`, `checkout_parent_wrapper`
`{type, selector}`, `checkout_button` `{type, selector}`) existed with zero JS consumer. Added
`bindThirdPartyCartMutation()` to `assets/shopflo-script.js` (called from `init()`) to actually use
it: when a theme we're integrated into renders its OWN native cart-drawer checkout button (not
`.shopflo-checkout__button`), this replaces that button's click behavior with
`openThemeFloCheckout()`.

- **Delegated document-level click listener (capture phase), not a MutationObserver** - the
  third-party cart drawer's contents get wholesale re-rendered on every cart mutation
  (add/update/remove), which would orphan a once-bound listener on the old button node; matching
  by CSS selector at click time survives any number of re-renders. Same idiom as the pre-existing
  `.shopflo-popup-trigger` delegation.
- **`is_shadow_dom` handling**: a click through an open shadow root gets retargeted at the
  document (`event.target` becomes the shadow HOST, not the real button), so
  `event.target.closest()` alone would miss it - uses `event.composedPath()` instead when this
  flag is true, to walk the real click path across the shadow boundary.
- `_resolveThirdPartyCartSelector({type, selector})` normalizes whether `selector` already
  includes its own leading `.`/`#` or not.
- On match: `preventDefault()` + `stopPropagation()` (not just `preventDefault` - the third-party
  button may navigate via its own JS click handler rather than a plain `<a href>`, so only
  capture-phase + stopPropagation reliably pre-empts it), then routes through the existing
  `openThemeFloCheckout()` so it inherits the same `shouldTriggerFloDirectly()` international
  fallback every other Shopflo trigger already has.

---

## 11. Cross-theme bug: ATC click sometimes opened the CHECKOUT overlay

**Symptom** (reported after integrating into a different theme): clicking that theme's own native
Add to Cart button occasionally popped Shopflo's full checkout overlay instead of just adding to
cart.

**Root cause**: `bindPopupMorph()`'s document-level `.shopflo-popup-trigger` delegated click
listener (both the `reduceMotion` branch and the animated branch's `runPendingFloAction()`)
treated **anything that wasn't exactly `data-flo-action="buy-now"` as a checkout trigger** -
including no `data-flo-action` at all. If a foreign theme's native ATC button ever ends up
carrying the `.shopflo-popup-trigger` class during integration (e.g. a shared button-group utility
class, or a dev following `shopflo.liquid`'s own doc comment about wiring custom buttons into the
popup flow) without an exact `data-flo-action="buy-now"`, the click added to cart AND fell through
to the default-checkout branch.

**Fix**: all three spots (`assets/shopflo-script.js` - the `reduceMotion` click handler, the
animated click handler, and `runPendingFloAction()`) now require an EXACT match on
`data-flo-action === 'checkout'` before calling `openThemeFloCheckout()`; anything else is a
no-op, not a silent default. Safe because both real Shopflo buttons already set the attribute
explicitly (`data-flo-action="checkout"` on `#flo-checkout-button`, `="buy-now"` on
`#flo-buy-now-button`) - nothing legitimate relied on the old implicit fallback.

---

## 12. Buy Now quantity not syncing to Shopflo checkout

**Symptom**: selecting quantity 4/6 on the product page, then clicking Buy Now, opened Shopflo
checkout with quantity 1 regardless.

**Root cause, confirmed by direct A/B test against the working reference markup Shopflo provided**:
the Shopflo bundle's own quantity/variant detection for buy-now keys off *Shopify's native dynamic
checkout button convention* - the `.shopify-payment-button` wrapper div +
`.shopify-payment-button__button`/`--unbranded` classes that `{{ form | payment_button }}` itself
renders (likely because Shopify's own platform-injected script - not the Shopflo bundle - scans
for exactly this class to wire up live quantity sync using the correct `form.elements`/`FormData`
API, which correctly picks up Dawn's quantity `<input>` even though it lives outside the `<form>`
tag, associated only via `form="…"`). `#flo-buy-now-button` never carried those classes/wrapper,
so nothing resolved the real quantity.

**Fix**: `snippets/shopflo.liquid`'s buy-now button markup now ALSO carries
`shopify-payment-button__button shopify-payment-button__button--unbranded` (appended, not
replacing, the existing `shopflo-buy-now__button shopflo-popup-trigger` etc.) and is wrapped in an
extra `<div class="shopify-payment-button">` - matching Shopify's convention without touching our
own click-handling/styling. `assets/shopflo-styles.css` adds
`.shopflo-buy-now__wrapper > .shopify-payment-button { display: contents !important; }` scoped
ONLY to our own wrapper, so the extra div stays invisible to flex layout (full-width/alignment
unaffected) without touching the DIFFERENT, real `.shopify-payment-button` that
`{{ form | payment_button }}` renders separately in the international-redirect fallback further
down the same file.

**Explicitly decided NOT to pursue** (discussed, user chose to keep the classes-based fix instead):
reading quantity ourselves via `form.elements.namedItem('quantity')` and passing it as an explicit
second arg to `window.handleFloBuyNowBtn(event, quantity)` - unconfirmed whether the bundle even
accepts a second argument, so lower confidence than the empirically-verified classes approach.

**Related question answered, no code change**: could the international-redirect fallback
(`bindBuyNowIntlFallback()` swapping to `{{ form | payment_button }}`) be replaced with our own
styled button + a hand-built `/cart/{variant_id}:{quantity}` permalink instead? **No** -
`payment_button` is Shopify's native *dynamic checkout* button, which can render Apple Pay/Google
Pay/PayPal/Shop Pay express-checkout buttons (not just a plain link) depending on shopper
eligibility, plus handles selling plans/gift cards/inventory rules natively. Hand-rolling a
permalink would lose all of that. Left as-is.

---

## 13. Font-weight / letter-spacing settings, and a stale-editor-save data-loss incident

- `shopflo_font_weight_checkout` (select, Bold/Normal) default changed `bold` → `normal`.
- `shopflo_letter_spacing_checkout` (range, px) default changed `0` → `1`.
- Buy-now's font-weight control was a `checkbox` (`shopflo_bold_text_buy_now`, default `true`,
  converted from boolean to `'bold'`/`'normal'` in Liquid) while checkout used a `select`
  (`shopflo_font_weight_checkout`) for the exact same two states - inconsistent control type, no
  functional difference. Converted buy-now to match: `shopflo_bold_text_buy_now` → new `select`
  `shopflo_font_weight_buy_now` (Bold/Normal, default `normal`), same `visible_if` gate.
  `snippets/shopflo.liquid`'s `buy_now_font_weight` assignment simplified to read the new setting
  directly (no more boolean→string conversion needed).

**Data-loss incident worth remembering**: the FIRST time the `font_weight_checkout`/
`letter_spacing_checkout` default changes and the buy-now bold-text default flip (`true` → `false`)
were made, they silently reverted on disk before being committed - `config/settings_schema.json`
came back showing the OLD defaults (`bold`/`0`/`true`) days later, even though the button-padding
split and other edits made in the same file around the same time survived intact. Most likely
cause: the user had the file open in their own editor, and an editor save wrote back a stale
in-memory buffer that predated those specific small edits, silently clobbering just that slice of
changes on disk (matches the "file changed on disk since you last read it" pattern the harness
flagged for `assets/shopflo-styles.css` elsewhere in this same session). **Lesson**: after a batch
of small default-value tweaks to a file the user also has open in an IDE, it's worth re-reading
the file before trusting it's still in the state just written, especially before committing -
don't assume a prior Edit call is still on disk just because no error was reported at the time.

---

## 14. Repo hygiene

Added a root `.gitignore` (`.shopify/`, `.env*`, `node_modules/`, OS/editor junk, logs) - none
existed before. `claude-context/` added to it on request; the existing tracked
`claude-context/shopflo-session-2026-09.md` remains tracked (gitignore only stops NEW files in
that folder from being added, doesn't untrack what's already committed) - untrack it explicitly
with `git rm --cached` if that's ever actually wanted.

---

## 15. Three requirements - IMPLEMENTED (were specced-only in an earlier revision of this doc)

### 15a. Header-adaptive icon color (Shop Pass) - done
Per-slot (A/B/C) checkbox `shopflo_account_icon_sync_header_button_a/b/c`
(`config/settings_schema.json`, default `false`, hides the icon-color/gradient picker when `true`
via `visible_if`). Implemented as a MARKUP class, not a CSS-var swap to `currentColor` - see the
"critical self-caught error" note below, this is the one real design pitfall in this feature.
`snippets/shopflo.liquid`'s `'shop_pass_*'` case resolves `account_icon_sync_header` through the
same two-pass B/C cascade as every other per-button field (§5 pattern), then appends
`sf-icon-sync-header` to `account_icon_button_class` when true. `assets/shopflo-styles.css`:
`.shopflo-accounts__icon-button.sf-icon-sync-header svg.sf-account-icon--default` resets
`color: inherit` and turns off the mask/background/gradient technique entirely, letting the SVG's
own native `stroke="currentColor"` paths inherit `color` from wherever the header cascades it in -
solid color only, no gradient support, by design. **No fallback anchoring** (e.g. NOT wired to
Dawn's `--color-foreground`) - bare inheritance, accepting the risk it may pick up the "wrong"
color in some placements.

**Pitfall hit and self-corrected while implementing**: first attempt set the icon's CSS custom
property directly to the literal string `currentColor` inside the `'assets'` case's STYLE cascade.
Broken by construction - `currentColor` always resolves to THAT SAME element's own computed
`color`, and the base rule (`.shopflo-accounts__icon-button svg`) also sets `color: transparent`
on that exact selector for the mask technique to work, so it would always resolve to transparent.
Caught before running any validation; reverted, then correctly re-implemented as the markup-class
approach above (a different, separate cascade in the `'shop_pass_*'` case, since it drives a class
not a CSS var - see the two-cascade-locations note in §5).

### 15b. Use theme's own account icon (Shop Pass) - done
Settled on the `type: "html"` raw-SVG-paste option (not the icon-snippet-name option originally
considered) for portability. Per-slot (A/B/C): `shopflo_account_icon_source_button_a/b/c` (select,
`shopflo`/`theme`, default `shopflo`) reveals `shopflo_account_theme_icon_button_a/b/c` (`type:
"html"`, raw SVG markup) via `visible_if`. Both wired through the standard two-pass B/C
inheritance cascade (§5 pattern) alongside every other per-button field, so B/C match A (or each
other) until explicitly overridden - `account_icon_source`/`account_theme_icon` resolve per-slot
exactly like `account_label_text` etc.

Both hardcoded `<svg>` blocks in `snippets/shopflo.liquid` (logged-out AND logged-in button
states) now branch: `{% if account_icon_source == 'theme' and account_theme_icon != blank %}` -
output the pasted markup verbatim - `{% else %}` the existing hardcoded icon, now tagged with a
new `sf-account-icon--default` class to distinguish it from a theme-pasted icon. This class
matters because Shopflo's own icon is painted via the `background`+`mask-image` technique (needed
for gradient support - see §15a) which would otherwise clip a theme-pasted SVG into Shopflo's own
icon silhouette. `assets/shopflo-styles.css`'s `.shopflo-accounts__icon-button svg` rule was split:
generic sizing (`width`/`height`/`flex-shrink`) stays on the bare `svg` selector so it still
applies to a theme icon too; the mask/background/`color:transparent` block moved to
`svg.sf-account-icon--default` only, so a theme-pasted SVG paints itself natively, untouched.
15a's `sf-icon-sync-header` override was updated the same way (`svg.sf-account-icon--default`
scoped) since header-color-sync is a Shopflo-icon-only feature - a theme icon manages its own
color.

### 15c. Header `overflow: hidden` clipping the account drawer/iframe - done, Shop-Pass-only
Went with the merchant-facing Theme Editor option (not the hardcoded-per-integration array
originally considered): one text setting `shopflo_account_overflow_fix_selectors` (comma-separated
CSS selectors, e.g. `.header-wrapper, #shopify-section-header`), placed in the global Shop Pass
settings block (not per-button A/B/C - one shared list, since it's about ANCESTOR elements, not
per-button styling). Exposed to JS via `window.shopfloThemeConfig.shopflo_account_overflow_fix_selectors`
in the `'assets'` case. **Explicitly scoped to Shop Pass only, not checkout/cart** - confirmed by
the user; the popup-morph overlay doesn't need it (not nested inside the header the way
`<shopflo-accounts>` is).

Mechanism as planned: `.sf-header-overflow-visible { overflow: visible !important; }` toggled via
`classList.toggle` (not inline-style snapshot/restore) on each selector match. New
`_setHeaderOverflowVisible(visible)` method on `ShopfloAccounts` (`assets/shopflo-script.js`),
called from the EXISTING `_setOverlayVisible(visible)` (both the drawer-open and login-panel-open
paths already funnel through this one function) - no new open/close tracking needed. Blank/unset
setting is a no-op.

---

## 16. Bug: `shopflo_badge: false` render param silently ignored

Same unsafe-default bug documented (but left unfixed) in §5's "Boolean render params" pattern
section - `shopflo_badge` was the one remaining param using
`assign shopflo_badge = shopflo_badge | default: true`, which treats an explicit `false` the same
as "not passed". Fixed by switching it to the same safe pattern already used for
`shopflo_payment_icons`/`show_user_icon` right next to it in `snippets/shopflo.liquid`.

---

## 17. Bug: label doesn't fill full width when icons/badge hidden - the §1 fix was incomplete

§1 already added `flex-grow: 1` to the label classes for the "both icons AND badge omitted from
DOM" case. Turns out the payment-icons ANCESTOR span itself
(`<span class="shopflo-payment-icons__wrapper">`) was rendered **unconditionally** in
`snippets/shopflo.liquid` - only the icons *inside* the loop were gated on
`checkout_icons_enabled`/`buy_now_icons_enabled`. So disabling icons left an EMPTY wrapper span
still occupying its `flex-basis: 15%` (`assets/shopflo-styles.css`) with no `flex-grow`,
permanently blocking the label from reclaiming that space - `flex-grow: 1` had nothing to grow
into. Fixed by moving the `{%- if …icons_enabled… -%}…{%- endif -%}` to wrap the
`<span class="shopflo-payment-icons__wrapper">` element itself (both checkout and buy-now), so an
empty wrapper is never left in the DOM at all - matches how the badge already correctly worked
(gated by a real `{%- if shopflo_badge -%}` around the whole element, not just its content).

---

## 18. New setting: Hover text color (checkout + buy-now)

**Bug that prompted it**: `.shopflo-checkout__button:hover`/`.shopflo-buy-now__button:hover` only
ever repainted the BUTTON's `background` - the label's text color (painted via `background` +
`background-clip: text`, same gradient-support technique as everywhere else in this file) had no
hover variant at all, so a dark "Hover background" with unchanged (also dark) text could go
unreadable on hover.

Added `shopflo_hover_text_color_checkout`/`shopflo_hover_text_color_buy_now`
(`config/settings_schema.json`, `color_background` type, mirrors "Hover background"'s
visibility rules exactly - buy-now's version shares its `visible_if` with its own Hover background
sibling). New `--sf-checkout-hover-color`/`--sf-buy-now-hover-color` CSS vars
(`snippets/shopflo.liquid`, wired through the buy-now "match checkout animation" branch same as
hover background), each falling back to the BASE (non-hover) text color when unset - zero visual
change for existing stores until a merchant opts in. New CSS rules target the label specifically
via `background` (not `color` - has to match the same property the base/hover-background techique
already overrides for gradient support).

**Related, unresolved question raised by the user**: "background still changes on hover even with
Hover background left unset" - traced to `.sf-button-hover--darken`/`.sf-button-hover--lighten`
(`filter: brightness(0.9)`/`brightness(1.12)`) applying to the WHOLE rendered button regardless of
the Hover background setting - this is only a bug if it happens with a hover effect OTHER than
Darken/Lighten selected; waiting on the user to confirm which Hover effect they were testing with
before investigating further.

---

## 19. Bug: Buy Now checks out the wrong product/variant (Quick View from collection grid)

**Symptom**: on a collection page, opening Quick View on ANY product and clicking Buy Now always
checked out the collection's FIRST product/variant instead of the one actually shown in the open
Quick View modal.

**Investigation - dead ends ruled out in order, each confirmed by an actual test, not just
reasoning**:
1. *Suspected first*: `id="flo-buy-now-button"` is a hardcoded, non-unique literal emitted by
   every `{% render 'shopflo', type: 'buy_now' %}` call, and `ShopfloTheme`'s constructor
   (`assets/shopflo-script.js`) cached `document.getElementById('flo-buy-now-button')` ONCE at
   initial page load, before Quick View ever opens. Switched the button to a direct
   `onclick="handleFloBuyNowBtn(event)"` to bypass that stale cached reference and the
   `.shopflo-popup-trigger` delegated-click path entirely. **Did not fix it** - ruled out that the
   click-routing/caching layer was the (sole) cause.
2. *Suspected next*: the user had briefly reintroduced a SECOND element also carrying
   `id="flo-buy-now-button"` (an old commented-out plain button block in
   `product-main-block__add-to-cart.liquid`, un-commented alongside the live
   `{% render 'shopflo', type: 'buy_now' %}` call). Removed the duplicate so only one
   `#flo-buy-now-button` exists at a time. **Still did not fix it** - ruled out literal button-ID
   duplication.
3. *Confirmed root cause, by elimination plus direct DOM evidence*: every single-variant product
   card in the collection grid (`snippets/product-actions__add-to-cart.liquid:59-88`) renders its
   OWN live `<form>` with Shopify's standard hidden `<input name="id" value="{variant_id}">`,
   unconditionally, as part of the page's initial HTML - well before Quick View's modal (which
   injects its own product's `input[name="id"]`) even exists in the DOM. `window.handleFloBuyNowBtn`
   (defined by the externally-hosted Shopflo bundle,
   `https://bridge.shopflo.com/js/shopflo.bundle.js` - not present in this repo, its internals
   can't be read directly) does not resolve product/variant context purely from the clicked
   element - confirmed by testing that with only ONE `#flo-buy-now-button` on the page (dead end
   #2, above) it still grabbed the FIRST `input[name="id"]` in DOM order (the first grid card),
   not the one inside the currently-open Quick View modal.

**A user-proposed additional theory ("nested clickable child steals `event.target`") was
considered but never actually confirmed or denied** - the shopflo-rendered buy-now button wraps
its label in nested `<span>`s (icons/promo/badge) that a real click could land on instead of the
`<button>` itself, which would matter if `handleFloBuyNowBtn` reads attributes off `event.target`
directly rather than doing its own `.closest()` walk. Addressed defensively (see fix below) but
this was never isolated as the sole/actual cause - the root cause in item 3 above was already
sufficient to reproduce the bug on its own.

**Fix - two parts, both confined to Shopflo-owned files only (`snippets/shopflo.liquid`,
`assets/shopflo-script.js`, `assets/shopflo-styles.css`) per explicit user constraint, and
required to be THEME-AGNOSTIC** (this integration is copy-pasted across many merchant themes -
see the new Patterns bullet below):

1. **`assets/shopflo-script.js` - `bindQuickViewVariantIsolation()`** (called from `init()`).
   Wraps `window.handleFloBuyNowBtn` itself (polling briefly if the Shopflo bundle hasn't defined
   it yet, since script-load order relative to this file isn't guaranteed) rather than hooking
   into any theme-specific modal/quick-view mechanism. On every call: resolves the clicked
   trigger's own `<form>` via `event.target.closest('form, product-form, [data-product-id]')`,
   temporarily strips the `name` attribute off every OTHER `input[name="id"]` in the document for
   the duration of the call (restored immediately after, plus a 2s safety-net restore, so native
   add-to-cart elsewhere is never left broken), so only the clicked form's own variant input is
   discoverable by whatever internal query the bundle runs. Portable because it only assumes (a)
   Shopflo's own `handleFloBuyNowBtn` global and `onclick="handleFloBuyNowBtn(event)"` convention
   (both already Shopflo's, not the theme's) and (b) Shopify's own standard
   `input[name="id"]` variant-input convention (near-universal across Shopify themes) - no
   dependency on Bootstrap, a specific modal element id, or this theme's Quick View
   implementation.

   **First attempt at this fix was theme-specific and got explicitly rejected by the user**:
   listening for Bootstrap's `shown.bs.modal`/`hidden.bs.modal` on a hardcoded
   `#gsp-modal__quick-view` element id (this theme's own Quick View modal). Correctly fixed the
   bug IN THIS THEME but would silently no-op in any other theme that doesn't happen to use
   Bootstrap modals with that exact id for its quick view/quick-add. Replaced with the
   function-wrapping approach above before shipping. **Do not reintroduce a fix hooked to this
   theme's own modal/DOM ids - route through `window.handleFloBuyNowBtn` (or the equivalent
   Shopflo global) instead.**

2. **`assets/shopflo-styles.css`**: `.shopflo-buy-now__button * { pointer-events: none !important; }`
   - defense-in-depth for the nested-span click-target theory above (not confirmed as the actual
   cause, but zero-risk to keep). No visual change - only affects which element a click inside the
   button reports as `event.target`. Also fixes `bindBuyNowAtcSync()` to `disconnect()` its
   previous `MutationObserver` before creating a new one, since it's now effectively re-run more
   than once per page load in some flows.

**Verification note**: could not fully confirm `handleFloBuyNowBtn`'s internal resolution logic
from source (it's loaded externally, not in this repo) - the fix targets the DOM-level evidence
(duplicate `input[name="id"]`) that was actually isolated by testing, not a guess.

**New pattern for section 5, above**: any future fix in `assets/shopflo-script.js` must stay
theme-agnostic - hook into Shopflo's OWN global functions/conventions
(`window.handleFloBuyNowBtn`, `window.handleFloCheckoutBtn`, `.shopflo-popup-trigger` + exact
`data-flo-action` values, etc.), never into a specific host theme's own element ids, classes, or
modal/JS-framework mechanics (e.g. a Bootstrap `shown.bs.modal` listener tied to one theme's
quick-view modal id) - this integration is dropped into many different themes verbatim.

---

## 20. Loose threads closed, no code change

- **`shopflo_badge: false` re-validated, no bug found**: re-traced the full render-param flow (the
  safe-boolean assignment fixed in §16, both `{%- if shopflo_badge -%}` guards) and found it
  correct and complete. Left open pending a concrete repro from the user - not reproducible from
  reading the code alone.
- **"Separate copy" of the code, clarified**: the `/* shopflo-neo:v1.0.0 */`-prefixed content
  pasted into this conversation at two points (see §9/§13 stale-buffer context) was itself copied
  FROM this repo, not maintained as a genuinely separate external source - so the earlier warning
  about needing to manually patch a separate copy doesn't apply. Confirmed by the user.

---

## 21. Bug: hover label showed a solid box instead of clipped text - and a deeper CSS bug it exposed

**Symptom #1 (surface bug)**: hovering a checkout/buy-now button showed the label as a solid
(often white-looking) box instead of recoloring the text, even with "Hover background"/"Hover text
color" both left unset.

**Root cause**: `.shopflo-checkout__button--label`/`.shopflo-buy-now__button--label`'s hover rules
(`assets/shopflo-styles.css`) only set `background: ... !important` - a SHORTHAND. The `background`
shorthand implicitly resets every background-* sub-property NOT named in its own value, including
`background-clip`, back to its initial `border-box` - even when a different, lower-specificity
rule (the base label rule) had separately declared `background-clip: text`. Since the hover rule
wins on specificity, its shorthand silently un-clipped the label's text-painted background into a
solid box, while `-webkit-text-fill-color: transparent` (a different, untouched property) kept the
glyphs invisible - net visual result: an opaque box with invisible text.

**Fix**: both hover label rules now re-declare `background-clip`/`-webkit-background-clip`/
`-webkit-text-fill-color`/`color` alongside `background`. Lesson for this codebase: any rule that
sets `background` as a shorthand on an element whose OWN base rule relies on a background
sub-property set via a SEPARATE declaration (clip, origin, position, image, repeat, attachment)
must repeat that sub-property in the shorthand rule too, or it silently resets.

**New setting added while fixing hover behavior further**: `shopflo_hover_border_match_bg_checkout`/
`_buy_now` (checkbox, "Match border color to hover background") - on hover, the button's border
recolors to the hover background instead of staying the base border color. Wired via new
`--sf-checkout-hover-border-color`/`--sf-buy-now-hover-border-color` CSS vars, consumed by the
existing border-box paint layer in the general `:hover` rule.

**Symptom #2 (the checkbox above didn't visibly do anything at first) - a much deeper, pre-existing
bug uncovered while debugging it**: verified directly in headless Chrome via the DevTools Protocol
(dispatching a real `Input.dispatchMouseEvent` hover and reading `getComputedStyle()` - see §5's
"Verification technique") that `background: SOLID_COLOR_A padding-box, SOLID_COLOR_B border-box;`
computes to **no background at all** (`background-image: none`, `background-color: transparent`) -
completely dropped by the browser - while the exact same pattern with either value wrapped as
`linear-gradient(X, X)` renders correctly. Root cause: per the CSS Backgrounds spec, a plain
`<color>` may only appear in the shorthand's LAST (final) comma-separated layer; this codebase's
whole "gradient-capable border ring" trick (used for EVERY checkout/buy-now background+border
combo, base and hover, plus the Darken/Lighten `::before` overlays) puts the FILL color in the
FIRST layer - which is only valid when the fill happens to be a gradient (an `<image>`, not a
`<color>`), and silently invalidates the entire declaration whenever a merchant picks a plain solid
color for Background/Hover background instead.

**Fix**: added `-img` sibling CSS custom properties (`--sf-checkout-background-img`,
`--sf-checkout-hover-background-img`, and the `--sf-buy-now-*` equivalents) computed in
`snippets/shopflo.liquid` via a `contains: 'gradient'` check - pass a gradient value through
unchanged, wrap a solid color as `linear-gradient(color, color)` (visually identical to a flat
fill, but now a real `<image>`, valid in any layer position). Only the FIRST-layer (fill) position
in `assets/shopflo-styles.css` was repointed at these `-img` vars (8 call sites: base
checkout/buy-now, general hover checkout/buy-now, and the 4 Darken/Lighten `::before` variants) -
the original plain `--sf-checkout-background`/`--sf-buy-now-background` vars are UNCHANGED and
still used as plain colors elsewhere (e.g. the payment-icon `border: 1px solid var(...)` rule at
~line 625/630), which would have broken if they'd been converted to always-gradient form directly.
**This means checkout/buy-now buttons using a solid (non-gradient) Background or Hover background
color were silently invisible-background before this fix, on every prior state of this codebase -
not something introduced this session.** If a similar gradient-capable two-layer background trick
is added anywhere else in this file, wrap non-final-layer fills as `linear-gradient(x, x)` from the
start.

**Follow-up report from the user ("still not matching") turned out to be a stale deploy, not a
code bug.** Verified the checkbox mechanism three separate ways before concluding this:
1. Synthetic HTML with solid colors - border correctly switched on hover.
2. Synthetic HTML with two DIFFERENT real multi-stop gradients (background vs. hover background,
   plus a third distinct border color) - border correctly switched to match the hover gradient,
   confirmed via headless-Chrome screenshot.
3. The ACTUAL unmodified `assets/shopflo-styles.css` from this repo (not a reproduction), loaded
   against the real `.shopflo-checkout__button`/`shopflo-popup-trigger`/`sf-button-hover--scale`
   classes - same correct result, both in computed styles and a rendered screenshot.

Since the exact shipped code provably worked in isolation, the user was asked to check the LIVE
deployed `shopflo-styles.css` asset (via the browser Network tab or opening its URL directly) for
the literal string `hover-border-color` - confirming whether the live theme actually had this
change or was serving a stale/cached build. That was indeed the cause - after re-deploying, the
user confirmed it's fixed. **Lesson for this session**: when a fix is verified correct via direct
testing of the actual shipped file but the user still reports it's broken, suspect a stale
deploy/CDN cache before writing more code - ask the user to inspect the live deployed asset content
directly rather than continuing to patch code that already demonstrably works.
