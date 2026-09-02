class ShopfloTheme {
  constructor(config) {
    this.config = config || window.shopfloThemeConfig || {};
    this.buyNowButton = document.getElementById('flo-buy-now-button');
    this.nativeBuyNowWrapper = document.getElementById('shopify-buy-now__button--wrapper');

    this.init();
  }

  init() {
    // Master on/off (window.shopfloThemeConfig.shopflo_enable, hardcoded in
    // snippets/shopflo.liquid - NOT a Theme Editor setting) is deliberately NOT checked here.
    // The checkout/buy-now/cart markup always renders the same way regardless, so every binding
    // below must stay active either way - shouldTriggerFloDirectly() is what actually decides,
    // at click time, whether to open Shopflo's real flow or fall back to a plain navigation.
    this.syncCartAutoOpenGlobal();
    this.bindGlobalTriggers();
    this.bindBuyNowAtcSync();
    this.bindBuyNowIntlFallback();
    this.bindDomEvents();
    this.bindCartPageRedirectIntercept();
    this.bindPopupMorph();
    this.bindLabelWidthGuard();
  }

  isDomesticTimezone() {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timeZone === 'Asia/Calcutta' || timeZone === 'Asia/Kolkata';
  }

  // The single click-time decision point: should this interaction go through Shopflo's real
  // bundle, or fall back to a plain native action? False when Shopflo is disabled entirely
  // (this.config.shopflo_enable), OR when the shopper should be internationally redirected
  // instead (shopflo_international_redirect_enabled and not on a domestic timezone).
  shouldTriggerFloDirectly() {
    if (this.config.shopflo_enable === false) return false;
    return !this.config.shopflo_international_redirect_enabled || this.isDomesticTimezone();
  }

  // cart-drawer.js / cart-notification.js read this global directly - always true, since
  // auto-opening the cart right after add-to-cart is the only flow this theme wires up.
  syncCartAutoOpenGlobal() {
    window.shopfloCartAutoOpen = true;
  }

  // Dispatched right before Shopflo's real checkout overlay actually opens - whether triggered
  // by the checkout button or a buy-now button, both open the same underlying checkout - so any
  // other modal/popup on the page can listen and close itself instead of sitting behind it.
  // Not fired on the native-navigation fallback (shouldTriggerFloDirectly() false): the page is
  // leaving entirely there, so there's nothing in-page left to close.
  dispatchCheckoutOpened() {
    document.dispatchEvent(new CustomEvent('shopflo-event:checkout-opened'));
  }

  // Dispatched right before Shopflo's real cart overlay actually opens - cart-icon click or
  // auto-open after add-to-cart - same reasoning as dispatchCheckoutOpened() above.
  dispatchCartOpened() {
    document.dispatchEvent(new CustomEvent('shopflo-event:cart-opened'));
  }

  // Named openThemeFloCheckout (not openFloCheckout) deliberately - same reasoning as
  // openThemeFloCart below: the Shopflo bundle script defines its own globals
  // (handleFloCheckoutBtn, etc.); prefixing ours with "Theme" avoids silently colliding with
  // or overriding a same-named function the bundle might also expose.
  openThemeFloCheckout() {
    if (this.shouldTriggerFloDirectly()) {
      if (typeof window.handleFloCheckoutBtn === 'function') {
        this.dispatchCheckoutOpened();
        window.handleFloCheckoutBtn();
      }
    } else {
      window.location.href = '/checkout';
    }
  }

  // Named openThemeFloCart (not openFloCart) deliberately - the Shopflo bundle script defines
  // its own globals (handleFloCartBtn, etc.); prefixing ours with "Theme" avoids silently
  // colliding with or overriding a same-named function the bundle might also expose.
  openThemeFloCart() {
    if (this.shouldTriggerFloDirectly()) {
      // Always a plain, foreground open - `loadCartInBackground: true` tells the bundle to load
      // WITHOUT showing anything, so passing it here would silently do nothing on click. Any
      // background warming for "Cart Click" mode happens earlier, at add-to-cart time - see
      // bindDomEvents().
      if (typeof window.handleFloCartBtn === 'function') {
        this.dispatchCartOpened();
        window.handleFloCartBtn();
      }
    } else {
      window.location.href = '/cart';
    }
  }

  // Named openThemeFloBuyNow (not openFloBuyNow) deliberately - same reasoning as
  // openThemeFloCheckout/openThemeFloCart above. Centralizes the same shouldTriggerFloDirectly()
  // gate those two already have - buy-now itself opens the same underlying checkout as the
  // checkout button, so its native fallback is the same plain '/checkout' navigation, not '/cart'.
  // Every call site that could otherwise reach window.handleFloBuyNowBtn directly (see
  // bindPopupMorph()'s reduceMotion branch and click gate, and runPendingFloAction() below) must
  // go through this instead - calling the bundle function unconditionally would open Shopflo's
  // real buy-now flow even for a shopper who should be internationally redirected to native
  // checkout instead.
  openThemeFloBuyNow(originEvent) {
    if (this.shouldTriggerFloDirectly()) {
      if (typeof window.handleFloBuyNowBtn === 'function') {
        this.dispatchCheckoutOpened();
        window.handleFloBuyNowBtn(originEvent);
      }
    } else {
      window.location.href = '/checkout';
    }
  }

  // snippets/shopflo.liquid renders onclick="openThemeFloCheckout()" as a plain global call
  bindGlobalTriggers() {
    window.openThemeFloCheckout = this.openThemeFloCheckout.bind(this);
    window.openThemeFloCart = this.openThemeFloCart.bind(this);
  }

  // keeps the Buy Now button's disabled state in sync with the product form's Add to Cart
  // button as the shopper switches variants, on top of the initial server-rendered state
  bindBuyNowAtcSync() {
    if (!this.buyNowButton) return;

    const scope =
      this.buyNowButton.closest('form[action*="/cart/add"]') ||
      this.buyNowButton.closest('product-info, .product, [data-section-type="product"], section') ||
      document;
    const atcButton =
      scope.querySelector('button[name="add"], [name="add"]:not([type="hidden"])') ||
      document.querySelector(
        'form[action*="/cart/add"] [name="add"], form[action*="/cart/add"] button[type="submit"]'
      );
    if (!atcButton) return;

    const sync = () => {
      this.buyNowButton.disabled = atcButton.disabled || atcButton.getAttribute('aria-disabled') === 'true';
    };
    sync();
    new MutationObserver(sync).observe(atcButton, {
      attributes: true,
      attributeFilter: ['disabled', 'aria-disabled', 'class'],
    });
  }

  // internationally redirected shoppers fall back to Shopify's native dynamic checkout button
  // instead of the Flo buy-now button
  bindBuyNowIntlFallback() {
    if (!this.buyNowButton || !this.nativeBuyNowWrapper) return;
    if (!window.location.pathname.includes('products')) return;

    if (this.shouldTriggerFloDirectly()) {
      this.buyNowButton.style.setProperty('display', 'flex', 'important');
      this.nativeBuyNowWrapper.style.setProperty('display', 'none', 'important');
    } else {
      this.nativeBuyNowWrapper.style.setProperty('display', 'block', 'important');
      this.buyNowButton.style.setProperty('display', 'none', 'important');
    }
  }

  // shopflo-event:add-to-cart fires right after every successful add-to-cart (see
  // assets/cart-drawer.js / assets/cart-notification.js) - opens Shopflo's cart immediately when
  // it should trigger directly (see shouldTriggerFloDirectly()), otherwise falls back to a plain
  // '/cart' navigation - same fallback as clicking the cart icon (openThemeFloCart()) - rather
  // than leaving the shopper on the product page with no feedback (cart-drawer.js's own native
  // open() call is deliberately commented out, and cart-notification.js's native open() ignores
  // shopflo_enable entirely, so without this the shopper could see nothing happen at all).
  bindDomEvents() {
    document.addEventListener('shopflo-event:add-to-cart', () => {
      if (!this.shouldTriggerFloDirectly()) {
        window.location.href = '/cart';
        return;
      }
      if (typeof window.handleFloCartBtn !== 'function') {
        return;
      }
      this.dispatchCartOpened();
      window.handleFloCartBtn();
    });
  }

  // Intercepts clicks on any link pointing at the cart PAGE (window.shopfloThemeConfig's
  // shopflo_cart_url, i.e. routes.cart_url - e.g. the header cart icon in sections/header.liquid,
  // which is otherwise a plain <a href="{{ routes.cart_url }}"> with no Shopflo wiring at all) and
  // opens Shopflo's cart instead of letting the native /cart page load - only when
  // this.config.shopflo_intercept_cart_page_redirect is explicitly true (hardcoded in
  // snippets/shopflo.liquid, same as shopflo_enable - see bindDomEvents() above). Left OFF
  // (false/unset) is a no-op: every such link just does its plain native navigation, same as
  // before this method existed.
  //
  // Routed through openThemeFloCart() itself rather than duplicating its logic, so the disabled
  // (shouldTriggerFloDirectly() false) case still ends up at the same '/cart' page the browser's
  // own default action would have reached anyway - intercepting never changes the outcome there,
  // only the mechanism.
  bindCartPageRedirectIntercept() {
    if (this.config.shopflo_intercept_cart_page_redirect !== true) return;
    const cartPath = this.config.shopflo_cart_url;
    if (!cartPath) return;

    document.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = event.target.closest('a[href]');
      if (!link || link.pathname !== cartPath) return;
      if (link.target && link.target !== '_self') return;

      event.preventDefault();
      this.openThemeFloCart();
    });
  }

  // UI check: if the button's own label ends up squeezed to <=60% of the button's width (long or
  // translated label text competing with the payment icons row and the "Powered by Shopflo" badge
  // for room), hide both so the label - already flex-grow:1 in assets/shopflo-styles.css - can
  // claim that freed-up space instead of truncating/wrapping awkwardly.
  //
  // Re-evaluated on window resize (debounced) and web-font load, NOT via a ResizeObserver on the
  // button itself: a non-"Full width" button's own outer size shrinks to fit its content, so
  // hiding its icons/badge would itself shrink the button, which a self-observing ResizeObserver
  // would then react to again - an infinite show/hide oscillation. Reacting only to external
  // signals sidesteps that: every evaluation removes the squeeze class FIRST (restoring icons/
  // badge to their natural state) before measuring, so a run never reacts to a state a previous
  // run of this same code produced.
  bindLabelWidthGuard() {
    const SQUEEZE_CLASS = 'sf-label-squeezed';
    const SQUEEZE_RATIO = 0.55;

    const buttons = document.querySelectorAll('.shopflo-checkout__button, .shopflo-buy-now__button');
    if (!buttons.length) return;

    const evaluate = () => {
      buttons.forEach((button) => {
        button.classList.remove(SQUEEZE_CLASS);

        const label = button.querySelector(
          '.shopflo-checkout__button--label, .shopflo-buy-now__button--label'
        );
        if (!label) return;

        const buttonWidth = button.getBoundingClientRect().width;
        if (!buttonWidth) return;

        const labelWidth = label.getBoundingClientRect().width;
        if (labelWidth / buttonWidth <= SQUEEZE_RATIO) {
          button.classList.add(SQUEEZE_CLASS);
        }
      });
    };

    evaluate();
    if (window.document.fonts && window.document.fonts.ready) {
      window.document.fonts.ready.then(evaluate);
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(evaluate, 150);
    });
  }

  // Drives the shared dummy popup (#popupOverlay/#popupWrapper, rendered once in shopflo.liquid)
  // through a button<->full-screen FLIP animation that we fully own, instead of trying to morph
  // Shopflo's own injected checkout markup (fragile: we don't control its structure or timing).
  // Buttons carry .shopflo-popup-trigger + data-flo-action="checkout|buy-now" instead of onclick,
  // so any number of Buy Now / Checkout buttons on the page can share this one popup. Only once
  // the OPEN transition finishes do we hand off to the real Shopflo checkout; closing is driven by
  // Shopflo's "FLO_EXIT_CHECKOUT" postMessage, which shrinks the popup back to its trigger button.
  bindPopupMorph() {
    // reduceMotion covers both the OS-level accessibility preference and the Theme Editor's
    // "Enable checkout popup animation" toggle. With no animation to play, the dummy popup adds
    // nothing (it would just flash open then immediately hand off) - so skip it and its whole
    // DOM/JS machinery entirely, and call Shopflo's real functions directly on click, same as
    // before the popup-morph system existed.
    this.reduceMotion =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      this.config.shopflo_enable_popup_animation === false;

    if (this.reduceMotion) {
      document.addEventListener('click', (event) => {
        const trigger = event.target.closest('.shopflo-popup-trigger');
        if (!trigger || trigger.disabled) return;
        if (trigger.dataset.floAction === 'buy-now') {
          this.openThemeFloBuyNow(event);
        } else {
          this.openThemeFloCheckout();
        }
      });
      return;
    }

    this.popupOverlay = document.getElementById('popupOverlay');
    this.popupWrapper = document.getElementById('popupWrapper');
    if (!this.popupOverlay || !this.popupWrapper) return;

    this.popupAnimating = false;
    this.activePopupTrigger = null;
    this.pendingFloAction = null;
    this.pendingFloEvent = null;

    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('.shopflo-popup-trigger');
      if (!trigger || trigger.disabled || this.popupAnimating) return;

      // Matches openThemeFloCheckout()/openThemeFloBuyNow()'s own fallback branch (disabled
      // entirely, or an internationally-redirected shopper): a full page navigation is instant,
      // so there's nothing for the popup to usefully animate into - navigate directly instead.
      // Both actions fall back to the same '/checkout' - buy-now opens the same underlying
      // checkout as the checkout button, just with a single product instead of the full cart.
      if (!this.shouldTriggerFloDirectly()) {
        window.location.href = '/checkout';
        return;
      }

      this.openPopupFrom(trigger, event);
    });

    const closeBtn = document.getElementById('popupClose');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closePopup());

    this.popupOverlay.addEventListener('click', (event) => {
      if (event.target === this.popupOverlay) this.closePopup();
    });

    window.addEventListener('message', (event) => this.handleFloMessage(event));
  }

  handleFloMessage(event) {
    const data = event.data;
    const type = typeof data === 'string' ? data : data && (data.type || data.event || data.name);
    if (type === 'FLO_EXIT_CHECKOUT') this.closePopup();
  }

  // ratio of the trigger button's on-screen box to the popup's fixed natural width, expressed as
  // a translate+scale so `transform-origin: 0 0` makes the popup sit exactly over the button.
  // Height is NOT scaled here - it's a real property transition (see triggerHeightFor/--h) so it
  // doesn't distort border-radius/content the way non-uniform scale(sx, sy) would.
  popupRectFor(trigger) {
    const triggerRect = trigger.getBoundingClientRect();
    const popupW = this.popupWrapper.offsetWidth;
    return {
      x: triggerRect.left,
      y: triggerRect.top,
      sx: popupW ? triggerRect.width / popupW : 1,
    };
  }

  setPopupTransformVars(rect) {
    this.popupWrapper.style.setProperty('--tx', `${rect.x}px`);
    this.popupWrapper.style.setProperty('--ty', `${rect.y}px`);
    this.popupWrapper.style.setProperty('--sx', String(rect.sx));
  }

  // real (px) height of whichever button triggered the popup
  triggerHeightFor(trigger) {
    return `${trigger.getBoundingClientRect().height}px`;
  }

  // the popup's own resting height (--popup-h, responsive per breakpoint), read as a concrete
  // value so it can be transitioned to/from
  targetPopupHeight() {
    return getComputedStyle(this.popupWrapper).getPropertyValue('--popup-h').trim() || '100%';
  }

  setPopupHeight(height) {
    this.popupWrapper.style.setProperty('--h', height);
  }

  // the popup's FLIP start/end radius - matches the trigger button's own live computed
  // border-radius exactly, so the popup starts (open) / ends (close) looking like the button
  triggerRadiusFor(trigger) {
    return getComputedStyle(trigger).borderRadius || '0px';
  }

  // the popup's own resting radius (--popup-radius, responsive per breakpoint - see
  // shopflo-css-variables.liquid), read as a concrete value so it can be transitioned to/from
  targetPopupRadius() {
    return getComputedStyle(this.popupWrapper).getPropertyValue('--popup-radius').trim() || '0px';
  }

  setPopupRadius(radius) {
    this.popupWrapper.style.setProperty('--radius', radius);
  }

  // total morph duration in ms, read from --duration so the opacity edge below always tracks it
  getDurationMs() {
    const raw = getComputedStyle(this.popupWrapper).getPropertyValue('--duration').trim();
    const ms = raw.endsWith('ms') ? parseFloat(raw) : parseFloat(raw) * 1000;
    return Number.isFinite(ms) && ms > 0 ? ms : 500;
  }

  // timing for the popup wrapper's OWN opacity edge-fade: a short ~8% slice of the overall
  // morph, positioned at the very start (edge:'start') or very end (edge:'end') of --duration.
  // 8% (~40ms on the current 550ms --duration) reads fine here because it's layered on top of
  // a transform/radius change that's already visibly moving - the eye reads the opacity shift
  // as part of that motion rather than judging it as its own fade.
  edgeFadeTiming(edge) {
    const total = this.getDurationMs();
    const edgeDuration = Math.round(total * 0.08);
    const delay = edge === 'end' ? total - edgeDuration : 0;
    return { edgeDuration, delay };
  }

  // Shared close-only crossfade window: the popup wrapper (opaque, sitting on top of the
  // button z-index-wise) and the trigger button MUST fade on the exact same duration/delay, or
  // the still-opaque wrapper simply masks however far the button has already faded in - which
  // is what made it look like the button "pops in" only after the shrink visually finishes.
  closeFadeTiming() {
    const duration = 1950;
    const delay = Math.max(0, this.getDurationMs() - duration);
    return { duration, delay };
  }

  // the opacity fade should only cover a short slice of the overall transform/radius morph on
  // open, not the whole duration - so it reads as a quick flourish rather than a slow cross-fade.
  // On close, it's synced with fadeTrigger's window instead (see closeFadeTiming).
  setPopupOpacityTiming(edge) {
    if (edge === 'end') {
      const { duration, delay } = this.closeFadeTiming();
      this.popupWrapper.style.setProperty('--opacity-duration', `${duration}ms`);
      this.popupWrapper.style.setProperty('--opacity-delay', `${delay}ms`);
      return;
    }
    const { edgeDuration, delay } = this.edgeFadeTiming(edge);
    this.popupWrapper.style.setProperty('--opacity-duration', `${edgeDuration}ms`);
    this.popupWrapper.style.setProperty('--opacity-delay', `${delay}ms`);
  }

  // hides the real trigger button within a 50ms window at the very start of the expand
  // (edge:'start', open). On close (edge:'end'), it fades in over the same window the popup
  // wrapper itself is fading out over (closeFadeTiming), so both happen as one crossfade.
  fadeTrigger(trigger, edge, targetOpacity) {
    if (edge === 'end') {
      const { duration, delay } = this.closeFadeTiming();
      trigger.style.transition = `opacity ${duration}ms linear ${delay}ms`;
      trigger.style.opacity = String(targetOpacity);
      return;
    }
    trigger.style.transition = 'opacity 50ms linear';
    trigger.style.opacity = String(targetOpacity);
  }

  openPopupFrom(trigger, originClickEvent) {
    this.popupAnimating = true;
    this.activePopupTrigger = trigger;
    this.pendingFloAction = trigger.dataset.floAction;
    this.pendingFloEvent = originClickEvent;

    this.showPopupIfHidden();
    this.popupOverlay.classList.add('is-open');
    trigger.classList.add('sf-popup-trigger--hidden');

    this.popupWrapper.style.transition = 'none';
    this.setPopupTransformVars(this.popupRectFor(trigger));
    this.setPopupRadius(this.triggerRadiusFor(trigger));
    this.setPopupHeight(this.triggerHeightFor(trigger));
    this.popupWrapper.style.opacity = '0';
    void this.popupWrapper.offsetWidth; // force layout so the "start" position paints before we animate away from it

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Measure the natural resting height/width while transitions are STILL disabled (from
        // the instant-jump phase above), so offsetHeight reports the real target height rather
        // than a transition's in-progress (starting) value.
        this.setPopupHeight(this.targetPopupHeight());
        const popupW = this.popupWrapper.offsetWidth;
        const popupH = this.popupWrapper.offsetHeight;

        // Restore --h to the trigger's height and FORCE A FLUSH here (still under
        // transition:none) - without this, the browser's next transition comparison would use
        // the measurement snapshot above (already at the target) as its baseline, see no net
        // change once --h is set to the target again below, and silently skip animating height
        // entirely (it would just snap to full size on frame one).
        this.setPopupHeight(this.triggerHeightFor(trigger));
        void this.popupWrapper.offsetHeight;

        this.popupWrapper.style.transition = '';
        this.popupOverlay.classList.add('active');

        this.setPopupTransformVars({
          x: (window.innerWidth - popupW) / 2,
          y: (window.innerHeight - popupH) / 2,
          sx: 1,
        });
        this.setPopupRadius(this.targetPopupRadius());
        this.setPopupHeight(this.targetPopupHeight());
        this.setPopupOpacityTiming('start');
        this.popupWrapper.style.opacity = '1';
        this.fadeTrigger(trigger, 'start', 0);

        // local flag (not instance state) so the transitionend/timeout race can only ever
        // run the hand-off once per cycle, regardless of what a later cycle does to `this`
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          this.popupAnimating = false;
          this.runPendingFloAction();
        };
        this.popupWrapper.addEventListener(
          'transitionend',
          (e) => {
            if (e.propertyName !== 'transform') return;
            finish();
          },
          { once: true }
        );
        // safety net in case the transition is interrupted and transitionend never fires -
        // scaled to --duration (plus a buffer) so it never fires before the real transition
        // could possibly have finished, however long --duration is set to
        setTimeout(finish, this.getDurationMs() + 150);
      });
    });
  }

  runPendingFloAction() {
    const action = this.pendingFloAction;
    const originEvent = this.pendingFloEvent;
    this.pendingFloAction = null;
    this.pendingFloEvent = null;

    if (action === 'buy-now') {
      this.openThemeFloBuyNow(originEvent);
    } else {
      this.openThemeFloCheckout();
    }

    // Shopflo's own checkout/cart overlay mounts at an extreme z-index (see its injected
    // stylesheet) so it already paints over our popup - this hide is just cleanup, giving the
    // handoff call a tick to fire before we get out of the way. Kept as `visibility` (not
    // display/is-open) so closePopup() can reveal it again for the shrink-back animation
    // without disturbing its transform/transition state.
    setTimeout(() => {
      this.popupOverlay.style.visibility = 'hidden';
    }, 10);
  }

  showPopupIfHidden() {
    if (this.popupOverlay.style.visibility === 'hidden') {
      this.popupOverlay.style.visibility = '';
    }
  }

  closePopup() {
    const trigger = this.activePopupTrigger;
    if (!trigger || this.popupAnimating) return;
    this.popupAnimating = true;

    this.showPopupIfHidden();
    this.popupOverlay.classList.remove('active');

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      this.popupOverlay.classList.remove('is-open');
      trigger.classList.remove('sf-popup-trigger--hidden');
      // release inline control back to the button's own CSS-driven transition now that the
      // crossfade is done (or was skipped) - it's already visually at full opacity by now
      trigger.style.opacity = '';
      trigger.style.transition = '';
      this.activePopupTrigger = null;
      this.popupAnimating = false;
    };

    if (!document.body.contains(trigger)) {
      this.popupWrapper.style.opacity = '0';
      finish();
      return;
    }

    this.setPopupTransformVars(this.popupRectFor(trigger));
    this.setPopupRadius(this.triggerRadiusFor(trigger));
    this.setPopupHeight(this.triggerHeightFor(trigger));
    this.setPopupOpacityTiming('end');
    this.popupWrapper.style.opacity = '0';
    this.fadeTrigger(trigger, 'end', 1);
    this.popupWrapper.addEventListener(
      'transitionend',
      (e) => {
        if (e.propertyName !== 'transform') return;
        finish();
      },
      { once: true }
    );
    // safety net: a transition can be silently aborted (no transitionend fired) - scaled to
    // --duration (plus a buffer) so it never fires before the real transition could possibly
    // have finished, however long --duration is set to
    setTimeout(finish, this.getDurationMs() + 150);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.shopfloThemeInstance = new ShopfloTheme();
});

window.ShopfloTheme = ShopfloTheme;

/**
 * Shopflo Accounts (shop_pass)
 * ----------------------------------------------------------------
 * Defines <shopflo-accounts>, a custom element that renders its OWN
 * account icon/dropdown markup (rendered via
 * {% render 'shopflo', type: 'shop_pass_primary' | 'shop_pass_secondary' | 'shop_pass_tertiary' %},
 * see snippets/shopflo.liquid), driven entirely by two sessionStorage
 * keys the Shopflo bundle itself owns and keeps up to date:
 *
 *   flo_isShopfloSession — "true" when a Shopflo session exists, absent otherwise.
 *   FLO_SSO_IS_LOGOUT    — "true" right after a logout, absent otherwise.
 *
 * Design summary:
 *  - No hidden "actual" markup, no click-forwarding, no DOM
 *    observation of bundle-controlled elements. Auth state is a
 *    synchronous sessionStorage read, not something inferred from
 *    which element happens to be visible.
 *  - Confidently logged-in (session present, not mid-logout) is the
 *    ONLY state where this renders its own dropdown. Every other
 *    state (fresh session, or just logged out) defers entirely to
 *    the bundle's own window.handleDrawer() to decide what to show.
 *  - Logging out sets FLO_SSO_IS_LOGOUT and reloads the page, so
 *    every <shopflo-accounts> instance re-reads the same keys fresh
 *    on load — instances never need to be synced with each other at
 *    runtime.
 *  - Any number of <shopflo-accounts> proxy instances can exist on
 *    a page (desktop header, mobile menu, footer, ...); each is
 *    fully independent.
 *  - Proxy markup declares its role via data-flo-trigger /
 *    data-flo-state attributes. This file never hardcodes ids, so
 *    theme authors can freely add/remove/restructure proxy markup
 *    without touching this file.
 */

/**
 * Global config. Edit this object to change behavior across every
 * <shopflo-accounts> instance on the page — instance-level
 * differences (labels, initial state, markup) belong in the
 * .liquid snippet / theme settings, not here.
 */
const ShopfloAccountsConfig = {
  // Bounded readiness poll for the bundle-defined globals this file
  // calls on demand (handleDrawer / handleShopifyLogin) — the bundle
  // script may still be evaluating when the shopper clicks.
  ready: {
    intervalMs: 150,
    maxAttempts: 20, // ~3s ceiling
    onTimeout: 'warn', // 'warn' | 'silent'
  },

  // sessionStorage keys the Shopflo bundle itself owns. Both are
  // either the string "true" or absent — never a literal "false".
  session: {
    isSessionKey: 'flo_isShopfloSession',
    isLogoutKey: 'FLO_SSO_IS_LOGOUT',
  },

  // The bundle appends its OWN real login iframe on handleShopifyLogin() click.
  // DESKTOP (screen width 800px+): kept permanently off-screen (see #flo-shopify-login-iframe in
  // shopflo-styles.css) — we copy its src into our own iframe (in normal, always-visible proxy
  // markup) instead, so it can be styled/positioned freely as part of our own drawer.
  // MOBILE (up to 799px): the bundle's own self-contained sheet+overlay component is left fully
  // visible and untouched — no copying, this theme's own drawer/overlay just steps out of the
  // way entirely.
  iframe: {
    sourceId: 'flo-shopify-login-iframe',
    mobileBreakpoint: 799,
  },

  // TEMPORARILY true to trace shop-pass click handling in the console while diagnosing
  // unresponsive buttons - set back to false once confirmed working. Critical failures (e.g.
  // sessionStorage access throwing) are always logged via console.warn/error regardless of this.
  debug: true,
};

/**
 * Safe sessionStorage read - sessionStorage access can throw synchronously (not just return
 * null) in storage-restricted contexts: Safari ITP, private browsing in older engines, or a
 * sandboxed iframe (e.g. Shopify's own theme-editor live preview can run the storefront in one).
 * Without this guard, that throw happens INSIDE the click handler and aborts it before it does
 * anything else - from the outside this looks exactly like "the button is unresponsive", with
 * no visible error unless you're inspecting the correct frame's console.
 *
 * Kept as a plain module-level function (also used by ShopfloAccounts._readSessionStorage(),
 * which just delegates to this one) rather than a class method, so resolveShopfloAuthState()
 * below - and the public window.isThemeFloLoggedIn() global that reads it - both work even on a
 * page with zero shop_pass_* instances rendered.
 */
function readShopfloSessionStorage(key) {
  try {
    return window.sessionStorage.getItem(key);
  } catch (e) {
    console.warn('[shopflo-accounts]', 'sessionStorage.getItem(\'' + key + '\') threw - treating as absent.', e);
    return null;
  }
}

// Mirrors readShopfloSessionStorage() above - same safe-write reasoning as
// ShopfloAccounts._writeSessionStorage(), which now just delegates to this one.
function writeShopfloSessionStorage(key, value) {
  try {
    window.sessionStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn('[shopflo-accounts]', 'sessionStorage.setItem(\'' + key + '\') threw - continuing anyway.', e);
    return false;
  }
}

function resolveShopfloAuthState() {
  const { isSessionKey, isLogoutKey } = ShopfloAccountsConfig.session;
  const hasSession = readShopfloSessionStorage(isSessionKey) === 'true';
  const isLoggingOut = readShopfloSessionStorage(isLogoutKey) === 'true';
  const state = hasSession && !isLoggingOut ? 'logged-in' : 'logged-out';
  return { hasSession, isLoggingOut, state };
}

// A shopper with NEITHER Shopflo session key present at all (a genuinely fresh session - no
// prior visit, nothing in sessionStorage yet) leaves both keys `null`/absent. That already
// resolves to 'logged-out' in resolveShopfloAuthState() above (same as both keys being
// explicitly 'true' - hasSession && !isLoggingOut is false either way), so THIS theme's own
// logged-in/logged-out branching is unaffected. But the Shopflo bundle script reads these same
// two keys directly and independently of this file - and, per observed behavior, its own login
// flow only initializes correctly once both keys have a defined value, not while they're
// undefined. So on a truly fresh session (neither key set), explicitly seed both to 'true' -
// i.e. an explicit "logged out" state - purely so the bundle has something defined to read,
// without changing what this theme itself would otherwise decide. Runs once, immediately, at
// script-parse time - deliberately not gated behind DOMContentLoaded or any shop_pass_* instance
// existing, so it's in place before the bundle (or a shopper) ever gets a chance to read it.
function seedShopfloSessionFlagsIfMissing() {
  const { isSessionKey, isLogoutKey } = ShopfloAccountsConfig.session;
  const hasEitherFlag =
    readShopfloSessionStorage(isSessionKey) !== null || readShopfloSessionStorage(isLogoutKey) !== null;
  if (hasEitherFlag) return;

  writeShopfloSessionStorage(isSessionKey, 'true');
  writeShopfloSessionStorage(isLogoutKey, 'true');
}
seedShopfloSessionFlagsIfMissing();

// Public global flag for "is the shopper currently logged in via Shopflo?" - a FUNCTION, not a
// static boolean, since login state can change after page load (e.g. right after a successful
// Shopflo login) without a full page reload; a snapshot taken once at load time would go stale.
// Always synchronous and cheap (two sessionStorage reads) - safe to call at any time, including
// before any shop_pass_* instance has rendered/upgraded. Named with the same "Theme"-prefixed
// convention as openThemeFloCheckout()/openThemeFloCart() (see ShopfloTheme.bindGlobalTriggers())
// to avoid silently colliding with a same-named global the Shopflo bundle script might also
// define.
window.isThemeFloLoggedIn = function () {
  return resolveShopfloAuthState().state === 'logged-in';
};

class ShopfloAccounts extends HTMLElement {
  connectedCallback() {
    // Guards against connectedCallback firing more than once for the
    // same element (e.g. if it's ever disconnected/reconnected by
    // the theme — a sticky-header clone, a section re-render, etc.).
    // Without this, a second connectedCallback would attach a SECOND
    // click listener to the same button, so one physical click could
    // fire _handleHeaderIconClick twice in the same tick — and if
    // real auth state changes between those two firings, each one
    // can resolve a different branch, producing mixed behavior.
    if (this._shopfloInitialized) return;
    this._shopfloInitialized = true;

    this._log('connectedCallback: initializing slot=' + this._resolveSlot());

    this._onPageShow = this._onPageShow.bind(this);
    window.addEventListener('pageshow', this._onPageShow);

    // Synchronous sessionStorage read — nothing to wait on.
    this._applyAuthState(this._resolveSessionState());

    this._setupHeaderIconTrigger();
    this._setupOverlayTrigger();
    this._setupDrawerItemTriggers();

    this._log('connectedCallback: setup complete, triggers found:', {
      'header-icon': this.querySelectorAll('[data-flo-trigger="header-icon"]').length,
      'close-drawer': this.querySelectorAll('[data-flo-trigger="close-drawer"]').length,
      'account-login': this.querySelectorAll('[data-flo-trigger="account-login"]').length,
      'account-logout': this.querySelectorAll('[data-flo-trigger="account-logout"]').length,
    });
  }

  disconnectedCallback() {
    window.removeEventListener('pageshow', this._onPageShow);
  }

  /** console.log gated behind ShopfloAccountsConfig.debug - flip that to false once confirmed working. */
  _log(...args) {
    if (ShopfloAccountsConfig.debug) console.log('[shopflo-accounts]', ...args);
  }

  /**
   * Fires on every page show, including when the page is restored
   * from the browser's back-forward cache (bfcache) after the user
   * navigates away and presses back. A bfcache restore does NOT
   * re-run connectedCallback's normal setup, since the page isn't
   * reloaded, just resumed exactly as it was — so a drawer left open
   * when they left is still open when they return. This explicitly
   * resets that. event.persisted is what distinguishes a genuine
   * bfcache restore from an ordinary load, where this should do
   * nothing (normal setup already handles the closed default).
   */
  _onPageShow(event) {
    if (!event.persisted) return;
    const wasOpen = this.querySelector(
      '[data-flo-state="drawer"][data-flo-visible="true"], [data-flo-state="drawer-iframe"][data-flo-visible="true"]'
    );
    if (!wasOpen) return;
    this._closeDrawer();
  }

  _globalsReady(fnNames) {
    return fnNames.every((name) => typeof window[name] === 'function');
  }

  /**
   * Resolves once required global functions exist, or once
   * maxAttempts is exhausted (resolves false in that case).
   * Resolves immediately (true) if no globals are required.
   */
  _waitForGlobals(fnNames) {
    const readyConfig = ShopfloAccountsConfig.ready;
    return new Promise((resolve) => {
      if (!fnNames.length || this._globalsReady(fnNames)) {
        resolve(true);
        return;
      }
      let attempts = 0;
      const timer = setInterval(() => {
        attempts += 1;
        if (this._globalsReady(fnNames)) {
          clearInterval(timer);
          resolve(true);
        } else if (attempts >= readyConfig.maxAttempts) {
          clearInterval(timer);
          resolve(false);
        }
      }, readyConfig.intervalMs);
    });
  }

  /**
   * Resolves with the element once it exists in the DOM, or null once
   * maxAttempts is exhausted. Used to detect the bundle's own
   * dynamically-appended iframe without a MutationObserver — this is
   * a short, bounded poll only, not a continuous watch.
   */
  _waitForElement(id) {
    const readyConfig = ShopfloAccountsConfig.ready;
    return new Promise((resolve) => {
      const existing = document.getElementById(id);
      if (existing) {
        resolve(existing);
        return;
      }
      let attempts = 0;
      const timer = setInterval(() => {
        attempts += 1;
        const el = document.getElementById(id);
        if (el) {
          clearInterval(timer);
          resolve(el);
        } else if (attempts >= readyConfig.maxAttempts) {
          clearInterval(timer);
          resolve(null);
        }
      }, readyConfig.intervalMs);
    });
  }

  // Delegates to the module-level readShopfloSessionStorage() (see its own doc comment, just
  // after ShopfloAccountsConfig's declaration) - kept as an instance method purely so every
  // existing this._readSessionStorage(...) call site below didn't need touching.
  _readSessionStorage(key) {
    return readShopfloSessionStorage(key);
  }

  // Delegates to the module-level writeShopfloSessionStorage() (see its own doc comment, just
  // after readShopfloSessionStorage's) - kept as an instance method purely so every existing
  // this._writeSessionStorage(...) call site below didn't need touching.
  _writeSessionStorage(key, value) {
    return writeShopfloSessionStorage(key, value);
  }

  /**
   * Confidently 'logged-in' ONLY when a Shopflo session exists AND we're not in the brief
   * post-logout window — every other combination (both keys missing, both present/true, or only
   * FLO_SSO_IS_LOGOUT present) defers to the bundle's own window.handleDrawer() rather than
   * guessing, since that's the one thing the bundle itself always knows how to resolve correctly.
   */
  _resolveSessionState() {
    const { hasSession, isLoggingOut, state } = resolveShopfloAuthState();
    this._log('_resolveSessionState:', { hasSession, isLoggingOut, state });
    return state;
  }

  /** Reflects a resolved auth state onto this instance's own proxy elements. */
  _applyAuthState(state) {
    const isLoggedIn = state === 'logged-in';
    this.querySelectorAll('[data-flo-state="login-icon"]').forEach((el) => {
      el.setAttribute('data-flo-visible', isLoggedIn ? 'false' : 'true');
    });
    this.querySelectorAll('[data-flo-state="account-icon"]').forEach((el) => {
      el.setAttribute('data-flo-visible', isLoggedIn ? 'true' : 'false');
    });
  }

  _setupHeaderIconTrigger() {
    const triggers = this.querySelectorAll('[data-flo-trigger="header-icon"]');
    triggers.forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        this._log('header-icon clicked');
        this._handleHeaderIconClick(event);
      });
    });
  }

  _setupOverlayTrigger() {
    const triggers = this.querySelectorAll('[data-flo-trigger="close-drawer"]');
    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        this._log('close-drawer (overlay) clicked');
        this._closeDrawer();
      });
    });
  }

  /** Wires the drawer's own "Account" / "Log out" menu items — no bundle click-forwarding. */
  _setupDrawerItemTriggers() {
    this.querySelectorAll('[data-flo-trigger="account-login"]').forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        // handleShopifyLogin(event, '/account') - NOT handleDrawer(). handleDrawer() is a
        // TOGGLE meant for the header icon (open/close between login UI and account drawer based
        // on the bundle's OWN session read, which isn't guaranteed to agree with this theme's
        // sessionStorage flags at the instant this click fires) - calling it from an ALREADY-OPEN
        // drawer's own "Account" item risks toggling the bundle into the wrong state (e.g. its
        // login UI instead of account management) or fighting with whatever this drawer is
        // already showing. handleShopifyLogin(event, '/account') is the bundle's dedicated,
        // idempotent "open account management" call - the same signature its own dummy
        // shop_pass_bundle_markup reference link uses - so it's the correct one here regardless
        // of where it ultimately navigates/renders.
        this._log('account-login clicked, typeof window.handleShopifyLogin =', typeof window.handleShopifyLogin);
        this._callGlobalWhenReady('handleShopifyLogin', [event, '/account']);
        this._handleAccountIframeFlow();
      });
    });

    this.querySelectorAll('[data-flo-trigger="account-logout"]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        this._log('account-logout clicked');
        // Setting FLO_SSO_IS_LOGOUT and reloading is the whole logout flow — on the next load
        // _resolveSessionState() reads it back as 'logged-out' and every instance starts fresh,
        // so there is nothing else to reset here. Uses the safe writer (see
        // _writeSessionStorage above) and reloads UNCONDITIONALLY, even if the write failed - a
        // failed write just means the next load resolves 'logged-in' again instead of
        // 'logged-out', which is no worse than not reloading at all, whereas an unguarded
        // sessionStorage.setItem() throwing here would silently skip reload() entirely.
        this._writeSessionStorage(ShopfloAccountsConfig.session.isLogoutKey, 'true');
        window.location.reload();
      });
    });
  }

  // Dispatched on `document` for shop-pass interactions, so any other modal/popup on the page
  // can listen and close itself (same reasoning as dispatchCheckoutOpened()/dispatchCartOpened()
  // in ShopfloTheme above). Not a class method there because these live on the instance for the
  // custom element instead - kept as a tiny shared helper here rather than repeating
  // `document.dispatchEvent(new CustomEvent(...))` at every call site.
  _dispatchAccountEvent(name) {
    document.dispatchEvent(new CustomEvent('shopflo-event:' + name));
  }

  /** Calls window[fnName] immediately if it already exists, else waits up to the ready ceiling. */
  _callGlobalWhenReady(fnName, args) {
    if (typeof window[fnName] === 'function') {
      this._log('_callGlobalWhenReady: window.' + fnName + '() already available, calling now.');
      window[fnName].apply(window, args);
      return;
    }
    this._log('_callGlobalWhenReady: window.' + fnName + '() not ready yet, polling (up to ' + (ShopfloAccountsConfig.ready.maxAttempts * ShopfloAccountsConfig.ready.intervalMs) + 'ms)...');
    this._waitForGlobals([fnName]).then((ok) => {
      if (!ok) {
        console.warn('[shopflo-accounts]', 'Timed out waiting for window.' + fnName + '(). The Shopflo bundle script (https://bridge.shopflo.com/js/shopflo.bundle.js) may have failed to load or hasn\'t defined this function - check the Network tab for that request.');
        return;
      }
      this._log('_callGlobalWhenReady: window.' + fnName + '() became available, calling now.');
      window[fnName].apply(window, args);
    });
  }

  _handleHeaderIconClick(event) {
    // Re-check right before acting, rather than trusting whatever this instance last rendered —
    // state may have changed since load.
    const state = this._resolveSessionState();
    this._applyAuthState(state);
    this._log('_handleHeaderIconClick: resolved state =', state);

    if (state === 'logged-in') {
      this._closeIframeFlow();
      const opening = this._isDrawerClosed(); // check BEFORE toggling
      this._log('_handleHeaderIconClick: logged-in branch, opening =', opening);
      if (opening) {
        this._positionDrawer();
      }
      this._toggleState('drawer', event.currentTarget);
      this._setOverlayVisible(opening);
      this._dispatchAccountEvent(opening ? 'account-drawer-opened' : 'account-drawer-closed');
    } else {
      // Not confidently logged-in — defer entirely to the bundle's own handleDrawer(), which
      // decides for itself whether to show its login UI or its own account drawer.
      this._log('_handleHeaderIconClick: logged-out branch, deferring to window.handleDrawer()');
      this._dispatchAccountEvent('account-login-opened');
      this._callGlobalWhenReady('handleDrawer', []);
    }
  }

  // Bidirectional toggle for this instance's own local state
  // (e.g. opening/closing its own drawer). Not broadcast — each
  // instance's drawer open/closed state is local UI, not a
  // page-wide truth like login state.
  _toggleState(state, triggerEl) {
    const targets = this.querySelectorAll('[data-flo-state="' + state + '"]');
    targets.forEach((el) => {
      const isVisible = el.getAttribute('data-flo-visible') === 'true';
      el.setAttribute('data-flo-visible', isVisible ? 'false' : 'true');
    });
    if (triggerEl) {
      const expanded = triggerEl.getAttribute('aria-expanded') === 'true';
      triggerEl.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    }
  }

  _isDrawerClosed() {
    const drawerEl = this.querySelector('[data-flo-state="drawer"]');
    return !drawerEl || drawerEl.getAttribute('data-flo-visible') !== 'true';
  }

  /**
   * Flips the drawer away from its preferred open direction (Theme Editor > Shopflo Shop Pass >
   * Primary/Secondary Login Button > Drawer position/Drawer alignment, read from this element's
   * own data-drawer-vertical/data-drawer-horizontal attributes) whenever the trigger is too
   * close to that edge of the viewport for the drawer's own (effectively fixed) size to fit.
   * Runs right before the drawer is revealed, so the flip is already applied on the very first
   * paint - no flash of the wrong position.
   *
   * The decision is resolved once per slot (primary/secondary) per browser session and cached
   * in sessionStorage, rather than re-measuring on every open - the trigger's position relative
   * to the viewport it lives in doesn't change between clicks within the same session, so
   * re-measuring every time is pure waste.
   */
  /** Which of the three independently-styled slots this instance is - see the
   * shopflo-accounts--primary/--secondary/--tertiary modifier classes in
   * snippets/shopflo.liquid's shop_pass case. */
  _resolveSlot() {
    if (this.classList.contains('shopflo-accounts--secondary')) return 'secondary';
    if (this.classList.contains('shopflo-accounts--tertiary')) return 'tertiary';
    return 'primary';
  }

  _positionDrawer() {
    const drawerEl = this.querySelector('[data-flo-state="drawer"]');
    const anchorEl = this.querySelector('[data-flo-state="account-icon"]');
    if (!drawerEl || !anchorEl) return;

    const slot = this._resolveSlot();
    // The preferred direction (Theme Editor > Shopflo Shop Pass > Login Button A/B/C > Dropdown
    // position, read off this element's own data-drawer-vertical/-horizontal) is folded into the
    // cache key itself, not just used inside _computeDrawerPosition() below - a cached position
    // is otherwise read and applied WITHOUT ever re-checking whether it still matches the
    // currently-configured preference, so changing the Theme Editor setting had no visible effect
    // for the rest of that sessionStorage session (e.g. across a theme-editor preview reload) even
    // though every other part of this class was reading the new value correctly. Keying by
    // preference too makes a changed setting a cache MISS on its own, with no separate
    // invalidation step needed.
    const cacheKey =
      'shopflo_account_drawer_position_' +
      slot +
      '_' +
      this.dataset.drawerVertical +
      '_' +
      this.dataset.drawerHorizontal;
    let position = this._readCachedDrawerPosition(cacheKey);
    if (!position) {
      position = this._computeDrawerPosition(drawerEl, anchorEl);
      this._writeCachedDrawerPosition(cacheKey, position);
    }
    this._applyDrawerPosition(drawerEl, position);
  }

  _readCachedDrawerPosition(cacheKey) {
    try {
      const raw = window.sessionStorage.getItem(cacheKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.vertical === 'above' || parsed.vertical === 'below') && (parsed.horizontal === 'left' || parsed.horizontal === 'right')) {
        return parsed;
      }
      return null;
    } catch (e) {
      return null; // storage unavailable (e.g. private browsing) - fall through to computing fresh every time
    }
  }

  _writeCachedDrawerPosition(cacheKey, position) {
    try {
      window.sessionStorage.setItem(cacheKey, JSON.stringify(position));
    } catch (e) {
      // storage unavailable - nothing to do, next click just recomputes
    }
  }

  /**
   * Measures the drawer's real rendered size while it's still closed,
   * by temporarily forcing it visible-but-invisible (inline
   * `!important` beats the stylesheet's `[data-flo-visible="false"]
   * { display: none !important }` rule - see setPopupHeight/etc. in
   * ShopfloTheme for the same trick). No flash: visibility:hidden
   * never paints anything, and both overrides are removed again
   * before this function returns.
   */
  _measureDrawerSize(drawerEl) {
    drawerEl.style.setProperty('display', 'block', 'important');
    drawerEl.style.setProperty('visibility', 'hidden', 'important');
    const rect = drawerEl.getBoundingClientRect();
    drawerEl.style.removeProperty('display');
    drawerEl.style.removeProperty('visibility');
    return { width: rect.width, height: rect.height };
  }

  _computeDrawerPosition(drawerEl, anchorEl) {
    const anchorRect = anchorEl.getBoundingClientRect();
    const { width, height } = this._measureDrawerSize(drawerEl);
    const viewportW = document.documentElement.clientWidth;
    const viewportH = document.documentElement.clientHeight;

    // Preferred side comes from this instance's own data-drawer-vertical/-horizontal (Theme
    // Editor > Shopflo Shop Pass > Primary/Secondary Login Button > Drawer position/Drawer
    // alignment) - only flips away from it when it genuinely doesn't fit AND the other side has
    // more room, same as the trigger being too close to that edge of the viewport.
    const preferredVertical = this.dataset.drawerVertical === 'above' ? 'above' : 'below';
    const preferredHorizontal = this.dataset.drawerHorizontal === 'left' ? 'left' : 'right';

    const spaceBelow = viewportH - anchorRect.bottom;
    const spaceAbove = anchorRect.top;
    const spaceForPreferredVertical = preferredVertical === 'above' ? spaceAbove : spaceBelow;
    const spaceForOtherVertical = preferredVertical === 'above' ? spaceBelow : spaceAbove;
    const vertical = (spaceForPreferredVertical >= height || spaceForPreferredVertical >= spaceForOtherVertical)
      ? preferredVertical
      : (preferredVertical === 'above' ? 'below' : 'above');

    const spaceForRightAlign = anchorRect.right;
    const spaceForLeftAlign = viewportW - anchorRect.left;
    const spaceForPreferredHorizontal = preferredHorizontal === 'left' ? spaceForLeftAlign : spaceForRightAlign;
    const spaceForOtherHorizontal = preferredHorizontal === 'left' ? spaceForRightAlign : spaceForLeftAlign;
    const horizontal = (spaceForPreferredHorizontal >= width || spaceForPreferredHorizontal >= spaceForOtherHorizontal)
      ? preferredHorizontal
      : (preferredHorizontal === 'left' ? 'right' : 'left');

    return { vertical, horizontal };
  }

  _applyDrawerPosition(drawerEl, position) {
    drawerEl.classList.toggle('shopflo-accounts__drawer--open-top', position.vertical === 'above');
    drawerEl.classList.toggle('shopflo-accounts__drawer--open-left', position.horizontal === 'left');
  }

  _setOverlayVisible(visible) {
    this.querySelectorAll('[data-flo-state="account-drawer-overlay"]').forEach((el) => {
      el.setAttribute('data-flo-visible', visible ? 'true' : 'false');
    });
  }

  /**
   * Called after the "Account" drawer item's click has fired
   * handleShopifyLogin() — waits for the bundle to append its real
   * (permanently hidden) login iframe, then mirrors it into ours.
   */
  _handleAccountIframeFlow() {
    this._waitForElement(ShopfloAccountsConfig.iframe.sourceId).then((iframeEl) => {
      if (!iframeEl) {
        console.warn(
          '[shopflo-accounts]',
          'Timed out waiting for #' + ShopfloAccountsConfig.iframe.sourceId + ' to appear after account-login click.'
        );
        return;
      }
      this._openIframeFlow(iframeEl);
    });
  }

  /**
   * Desktop: copies the bundle's real iframe src into OUR OWN iframe (a sibling of the drawer)
   * and swaps from the plain menu drawer to the iframe view. Does NOT touch the real iframe
   * itself beyond reading its src — that one stays permanently off-screen (see
   * #flo-shopify-login-iframe in shopflo-styles.css) on desktop only.
   *
   * Mobile: does NOT copy anything — the bundle's own real sheet+overlay component is left
   * fully visible and untouched, so we only hide our own simple menu drawer and overlay, then
   * step out of the way entirely.
   */
  _openIframeFlow(realIframeEl) {
    this._dispatchAccountEvent('account-iframe-opened');

    this.querySelectorAll('[data-flo-state="drawer"]').forEach((el) => {
      el.setAttribute('data-flo-visible', 'false');
    });

    const isMobile = window.matchMedia('(max-width: ' + ShopfloAccountsConfig.iframe.mobileBreakpoint + 'px)').matches;
    if (isMobile) {
      // The bundle's real sheet+overlay renders itself — nothing more for us to do. Hide our own
      // overlay too, since the real one already covers that role; showing both would double-dim.
      this._setOverlayVisible(false);
      return;
    }

    const src = realIframeEl.getAttribute('src');
    if (!src) {
      console.warn('[shopflo-accounts]', 'Real iframe #' + ShopfloAccountsConfig.iframe.sourceId + ' has no src yet.');
      return;
    }

    this.querySelectorAll('[data-flo-state="drawer-iframe"]').forEach((iframeEl) => {
      iframeEl.setAttribute('src', src);
      iframeEl.setAttribute('data-flo-visible', 'true');
    });

    this._setOverlayVisible(true);

    this.querySelectorAll('[data-flo-state="account-icon"]').forEach((el) => {
      el.setAttribute('data-flo-iframe-active', 'true');
    });

    this._startIframeSizeSync(realIframeEl);
  }

  /**
   * Keeps our copy's size matched to the real content's, which
   * changes at times we don't control (the user interacting inside
   * it). Scoped narrowly — one element, one attribute, only for as
   * long as the iframe view is actually open — and disconnected in
   * _closeIframeFlow, so cost is effectively zero outside that window.
   */
  _startIframeSizeSync(realIframeEl) {
    const applySize = () => {
      // Prefer the literal inline height value (the TARGET the bundle
      // set) over getComputedStyle. If the real iframe animates its
      // height via a CSS transition, getComputedStyle can report a
      // mid-transition frame instead of the destination value. The
      // inline string is immune to that, since it's the target, not
      // the current render. Only fall back to computed style if
      // there's no inline value to read (e.g. height set via a class).
      let height = realIframeEl.style.height;
      if (!height) {
        height = getComputedStyle(realIframeEl).height;
      }

      // Known bad transient value — corrected every time it occurs,
      // not just on a first read, since it can recur on later
      // mutations too. Rounded comparison catches near-232 fractional
      // reads (e.g. 231.992px). Keep the 'px' unit — a unitless
      // number here would make the CSS custom property invalid.
      if (Math.round(parseFloat(height)) === 232) {
        height = '225px';
      }

      this.querySelectorAll('[data-flo-state="drawer-iframe"]').forEach((iframeEl) => {
        iframeEl.style.setProperty('--flo-sso-iframe-height', height);
      });
    };

    applySize();
    this._iframeSizeObserver = new MutationObserver(applySize);
    this._iframeSizeObserver.observe(realIframeEl, { attributes: true, attributeFilter: ['style'] });

    // Safety net: if height changes via a transition rather than a
    // plain inline jump, re-sync once more once it's actually settled.
    this._iframeSizeRealEl = realIframeEl;
    this._iframeTransitionEndHandler = (event) => {
      if (event.propertyName === 'height') applySize();
    };
    realIframeEl.addEventListener('transitionend', this._iframeTransitionEndHandler);
  }

  _stopIframeSizeSync() {
    if (this._iframeSizeObserver) {
      this._iframeSizeObserver.disconnect();
      this._iframeSizeObserver = null;
    }
    if (this._iframeSizeRealEl && this._iframeTransitionEndHandler) {
      this._iframeSizeRealEl.removeEventListener('transitionend', this._iframeTransitionEndHandler);
    }
    this._iframeSizeRealEl = null;
    this._iframeTransitionEndHandler = null;
  }

  /**
   * Reverses _openIframeFlow: hides our iframe/overlay, resets our iframe back to about:blank
   * (stops it rather than leaving it loaded in the background). Fully collapses rather than
   * restoring the plain menu — matches standard dropdown-toggle behavior.
   */
  _closeIframeFlow() {
    // Called unconditionally whenever the drawer is closed/toggled (not just when the iframe is
    // actually open), so this check keeps account-iframe-closed from firing needlessly - only
    // dispatched when there was really something to close.
    const wasOpen = this.querySelector('[data-flo-state="drawer-iframe"][data-flo-visible="true"]');

    this._stopIframeSizeSync();

    this.querySelectorAll('[data-flo-state="drawer-iframe"]').forEach((iframeEl) => {
      iframeEl.setAttribute('data-flo-visible', 'false');
      iframeEl.setAttribute('src', 'about:blank');
      iframeEl.style.removeProperty('--flo-sso-iframe-height');
    });

    this.querySelectorAll('[data-flo-state="account-icon"]').forEach((el) => {
      el.removeAttribute('data-flo-iframe-active');
    });

    if (wasOpen) this._dispatchAccountEvent('account-iframe-closed');
  }

  /**
   * The overlay is only ever shown while the drawer or iframe is
   * open, so a click on it always means "close everything" — this is
   * a force-close, not a toggle.
   */
  _closeDrawer() {
    const wasDrawerOpen = !this._isDrawerClosed();
    this._closeIframeFlow();
    this.querySelectorAll('[data-flo-state="drawer"]').forEach((el) => {
      el.setAttribute('data-flo-visible', 'false');
    });
    this._setOverlayVisible(false);
    this.querySelectorAll('[data-flo-trigger="header-icon"]').forEach((el) => {
      if (el.hasAttribute('aria-expanded')) el.setAttribute('aria-expanded', 'false');
    });
    if (wasDrawerOpen) this._dispatchAccountEvent('account-drawer-closed');
  }
}

if (!customElements.get('shopflo-accounts')) {
  customElements.define('shopflo-accounts', ShopfloAccounts);
}
