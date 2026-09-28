/* shopflo-neo:v1.0.0 */
class ShopfloTheme {
  constructor(config) {
    this.config = config || window.shopfloThemeConfig || {};
    this.buyNowButton = document.getElementById('flo-buy-now-button');
    this.nativeBuyNowWrapper = document.getElementById('shopify-buy-now__button--wrapper');

    this.init();

    const SHOPFLO_LOGO = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWx0ZXI9InVybCgjYSkiPjxwYXRoIGQ9Im0xNi4xMTUgNi4wMTMtNi4xMjkgNi4xMjVhMy4wMTYgMy4wMTYgMCAwIDEtNC4yNjMgMCAzLjAxIDMuMDEgMCAwIDEgMC00LjI2MUw5LjcyIDMuODgyYTMuMDE2IDMuMDE2IDAgMCAxIDQuMjY0IDB6IiBmaWxsPSJ1cmwoI2IpIi8+PHBhdGggZD0ibTE2LjExNSA2LjAxMy02LjEyOSA2LjEyNWEzLjAxNiAzLjAxNiAwIDAgMS00LjI2MyAwIDMuMDEgMy4wMSAwIDAgMSAwLTQuMjYxTDkuNzIgMy44ODJhMy4wMTYgMy4wMTYgMCAwIDEgNC4yNjQgMHoiIGZpbGw9InVybCgjYykiLz48cGF0aCBkPSJtNy44ODUgMTcuOTg3IDYuMTI5LTYuMTI1YTMuMDE2IDMuMDE2IDAgMCAxIDQuMjYzIDAgMy4wMSAzLjAxIDAgMCAxIDAgNC4yNjFsLTMuOTk3IDMuOTk1YTMuMDE2IDMuMDE2IDAgMCAxLTQuMjYzIDB6IiBmaWxsPSJ1cmwoI2QpIi8+PHBhdGggZD0ibTcuODg1IDE3Ljk4NyA2LjEyOS02LjEyNWEzLjAxNiAzLjAxNiAwIDAgMSA0LjI2MyAwIDMuMDEgMy4wMSAwIDAgMSAwIDQuMjYxbC0zLjk5NyAzLjk5NWEzLjAxNiAzLjAxNiAwIDAgMS00LjI2MyAweiIgZmlsbD0idXJsKCNlKSIvPjwvZz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImIiIHgxPSIxMC41ODEiIHkxPSIxLjUzNiIgeDI9IjEzLjAwMyIgeTI9IjkuNzEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBzdG9wLWNvbG9yPSIjNDc2MGZmIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMDFjY2E3Ii8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9ImMiIHgxPSIxNC40MTYiIHkxPSIxNC40NTMiIHgyPSIyMS42ODIiIHkyPSIxMC4xMTQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBzdG9wLWNvbG9yPSIjNDc2MGZmIiBzdG9wLW9wYWNpdHk9IjAiLz48c3RvcCBvZmZzZXQ9Ii40MTEiIHN0b3AtY29sb3I9IiM0NzYwZmYiIHN0b3Atb3BhY2l0eT0iLjMxIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNDc2MGZmIi8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9ImQiIHgxPSIxMC41ODEiIHkxPSIxLjUzNiIgeDI9IjEzLjAwMyIgeTI9IjkuNzEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBzdG9wLWNvbG9yPSIjNDc2MGZmIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMDFjY2E3Ii8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9ImUiIHgxPSIxNC40MTYiIHkxPSIxNC40NTMiIHgyPSIyMS42ODIiIHkyPSIxMC4xMTQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBzdG9wLWNvbG9yPSIjNDc2MGZmIiBzdG9wLW9wYWNpdHk9IjAiLz48c3RvcCBvZmZzZXQ9Ii40MTEiIHN0b3AtY29sb3I9IiM0NzYwZmYiIHN0b3Atb3BhY2l0eT0iLjMxIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNDc2MGZmIi8+PC9saW5lYXJHcmFkaWVudD48ZmlsdGVyIGlkPSJhIiB4PSI0Ljg0IiB5PSIzIiB3aWR0aD0iMTQuMzIiIGhlaWdodD0iMTguMjYxIiBmaWx0ZXJVbml0cz0idXNlclNwYWNlT25Vc2UiIGNvbG9yLWludGVycG9sYXRpb24tZmlsdGVycz0ic1JHQiI+PGZlRmxvb2QgZmxvb2Qtb3BhY2l0eT0iMCIgcmVzdWx0PSJCYWNrZ3JvdW5kSW1hZ2VGaXgiLz48ZmVDb2xvck1hdHJpeCBpbj0iU291cmNlQWxwaGEiIHZhbHVlcz0iMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMTI3IDAiIHJlc3VsdD0iaGFyZEFscGhhIi8+PGZlT2Zmc2V0IGR5PSIuMjYxIi8+PGZlQ29tcG9zaXRlIGluMj0iaGFyZEFscGhhIiBvcGVyYXRvcj0ib3V0Ii8+PGZlQ29sb3JNYXRyaXggdmFsdWVzPSIwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwLjU1IDAiLz48ZmVCbGVuZCBpbjI9IkJhY2tncm91bmRJbWFnZUZpeCIgcmVzdWx0PSJlZmZlY3QxX2Ryb3BTaGFkb3dfMjE3NzBfMzMwNzQwIi8+PGZlQmxlbmQgaW49IlNvdXJjZUdyYXBoaWMiIGluMj0iZWZmZWN0MV9kcm9wU2hhZG93XzIxNzcwXzMzMDc0MCIgcmVzdWx0PSJzaGFwZSIvPjxmZUNvbG9yTWF0cml4IGluPSJTb3VyY2VBbHBoYSIgdmFsdWVzPSIwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAxMjcgMCIgcmVzdWx0PSJoYXJkQWxwaGEiLz48ZmVPZmZzZXQgZHk9Ii4zOTIiLz48ZmVDb21wb3NpdGUgaW4yPSJoYXJkQWxwaGEiIG9wZXJhdG9yPSJhcml0aG1ldGljIiBrMj0iLTEiIGszPSIxIi8+PGZlQ29sb3JNYXRyaXggdmFsdWVzPSIwIDAgMCAwIDEgMCAwIDAgMCAxIDAgMCAwIDAgMSAwIDAgMCAwLjUgMCIvPjxmZUJsZW5kIGluMj0ic2hhcGUiIHJlc3VsdD0iZWZmZWN0Ml9pbm5lclNoYWRvd18yMTc3MF8zMzA3NDAiLz48ZmVDb2xvck1hdHJpeCBpbj0iU291cmNlQWxwaGEiIHZhbHVlcz0iMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMTI3IDAiIHJlc3VsdD0iaGFyZEFscGhhIi8+PGZlT2Zmc2V0IGR5PSIuMTMxIi8+PGZlQ29tcG9zaXRlIGluMj0iaGFyZEFscGhhIiBvcGVyYXRvcj0iYXJpdGhtZXRpYyIgazI9Ii0xIiBrMz0iMSIvPjxmZUNvbG9yTWF0cml4IHZhbHVlcz0iMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMC4yNSAwIi8+PGZlQmxlbmQgaW4yPSJlZmZlY3QyX2lubmVyU2hhZG93XzIxNzcwXzMzMDc0MCIgcmVzdWx0PSJlZmZlY3QzX2lubmVyU2hhZG93XzIxNzcwXzMzMDc0MCIvPjwvZmlsdGVyPjwvZGVmcz48L3N2Zz4="

    const SIZE = 48;
    const FONT = 42;

    console.log(
      "%c %c Shopflo",
      `background:url('${SHOPFLO_LOGO}') no-repeat center;
      background-size:${SIZE}px ${SIZE}px;
      padding-inline-start:${SIZE / 2}px;
      padding-block-start:${SIZE / 2}px;
      padding-inline-end:10px;
      padding-inline-end:10px;
      vertical-align:middle;`,
      `background:linear-gradient(160deg,#4760FF 0%,#01CCA7 100%);
      -webkit-background-clip:text;
      background-clip:text;
      -webkit-text-fill-color:transparent;
      font-size:${FONT}px;
      font-weight:800;
      letter-spacing:4px;
      vertical-align:middle;
      font-family:-apple-system,BlinkMacSystemFont,Inter,Segoe UI,sans-serif;`
    );
  }

  init() {
    this.syncCartAutoOpenGlobal();
    this.bindGlobalTriggers();
    this.bindBuyNowAtcSync();
    this.bindBuyNowIntlFallback();
    this.bindDomEvents();
    this.bindCartPageRedirectIntercept();
    this.bindThirdPartyCartMutation();
    this.bindPopupMorph();
    this.bindLabelWidthGuard();
    this.bindQuickViewVariantIsolation();
  }

  isDomesticTimezone() {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timeZone === 'Asia/Calcutta' || timeZone === 'Asia/Kolkata';
  }

  shouldTriggerFloDirectly() {
    if (this.config.shopflo_enable === false) return false;
    return !this.config.shopflo_international_redirect_enabled || this.isDomesticTimezone();
  }

  syncCartAutoOpenGlobal() {
    window.shopfloCartAutoOpen = true;
  }

  dispatchCheckoutOpened() {
    document.dispatchEvent(new CustomEvent('shopflo-event:checkout-opened'));
  }

  dispatchCartOpened() {
    document.dispatchEvent(new CustomEvent('shopflo-event:cart-opened'));
  }

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

  openThemeFloCart() {
    if (this.shouldTriggerFloDirectly()) {
      if (typeof window.handleFloCartBtn === 'function') {
        this.dispatchCartOpened();
        window.handleFloCartBtn();
      }
    } else {
      window.location.href = '/cart';
    }
  }

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

  bindGlobalTriggers() {
    window.openThemeFloCheckout = this.openThemeFloCheckout.bind(this);
    window.openThemeFloCart = this.openThemeFloCart.bind(this);
  }

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

    if (this._buyNowAtcObserver) this._buyNowAtcObserver.disconnect();

    const sync = () => {
      this.buyNowButton.disabled = atcButton.disabled || atcButton.getAttribute('aria-disabled') === 'true';
    };
    sync();
    this._buyNowAtcObserver = new MutationObserver(sync);
    this._buyNowAtcObserver.observe(atcButton, {
      attributes: true,
      attributeFilter: ['disabled', 'aria-disabled', 'class'],
    });
  }

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

  // Theme-agnostic fix for "Buy Now checks out the wrong product/variant" whenever more than one
  // product's add-to-cart form is present in the document at once (a collection grid with
  // quick-add/quick-view, a sticky ATC bar alongside the main form, multiple sections on one
  // page, etc.) - a pattern common to virtually every Shopify theme, not just this one.
  //
  // Root cause: every such form renders Shopify's own standard hidden
  // <input name="id" value="{variant_id}">, and window.handleFloBuyNowBtn (defined by the
  // externally-hosted Shopflo bundle, https://bridge.shopflo.com/js/shopflo.bundle.js) does not
  // resolve product/variant context purely from the clicked element - confirmed by testing that
  // it can resolve to whichever input[name="id"] appears first in DOM order instead of the one
  // inside the form the shopper actually clicked Buy Now on.
  //
  // Fix: wrap window.handleFloBuyNowBtn itself (Shopflo's own API surface - stable across every
  // theme that integrates it) so that for the duration of each call, every input[name="id"]
  // EXCEPT the one belonging to the clicked button's own form is temporarily hidden from
  // name-based lookups. This makes no assumption about modal libraries, quick-view
  // implementations, or DOM structure - it only assumes the standard onclick="handleFloBuyNowBtn(event)"
  // convention (this snippet's own markup, see shopflo.liquid) and Shopify's own
  // input[name="id"] variant convention, both of which are portable to any theme.
  bindQuickViewVariantIsolation() {
    const isolate = (event) => {
      const trigger = event && event.target && typeof event.target.closest === 'function'
        ? event.target.closest('form, product-form, [data-product-id]')
        : null;
      const ownForm = trigger ? trigger.closest('form') || trigger.querySelector('form') : null;
      const keepInput = ownForm ? ownForm.querySelector('input[name="id"]') : null;

      const suspended = keepInput
        ? Array.from(document.querySelectorAll('input[name="id"]')).filter((input) => input !== keepInput)
        : [];
      suspended.forEach((input) => {
        input.setAttribute('data-shopflo-suspended-name', 'id');
        input.removeAttribute('name');
      });

      // Deliberately no outer "already restored" guard shared between the two scheduled calls
      // below (setTimeout(restore, 0) and setTimeout(restore, 2000)) - a shared guard would make
      // the 0ms call always win and the 2000ms safety net permanently unreachable dead code.
      // Idempotency instead lives per-input (the hasAttribute check), so either call - or both -
      // can safely run and only ever touches inputs that are still actually suspended.
      return () => {
        suspended.forEach((input) => {
          if (input.hasAttribute('data-shopflo-suspended-name')) {
            input.setAttribute('name', 'id');
            input.removeAttribute('data-shopflo-suspended-name');
          }
        });
      };
    };

    const wrap = () => {
      const original = window.handleFloBuyNowBtn;
      if (typeof original !== 'function' || original.__shopfloIsolationWrapped) return;

      const wrapped = function (event) {
        const restore = isolate(event);
        try {
          return original.apply(this, arguments);
        } finally {
          // The bundle may open its checkout UI asynchronously - give it a moment to finish
          // reading the DOM before restoring, then restore regardless as a safety net so native
          // add-to-cart elsewhere on the page is never left broken.
          setTimeout(restore, 0);
          setTimeout(restore, 2000);
        }
      };
      wrapped.__shopfloIsolationWrapped = true;
      window.handleFloBuyNowBtn = wrapped;
    };

    if (typeof window.handleFloBuyNowBtn === 'function') {
      wrap();
      return;
    }

    // The Shopflo bundle (bridge.shopflo.com) defines this global asynchronously after it loads,
    // and script-load order relative to this file varies by theme - poll briefly rather than
    // assuming any particular load order.
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (typeof window.handleFloBuyNowBtn === 'function') {
        clearInterval(timer);
        wrap();
      } else if (attempts >= 40) {
        clearInterval(timer);
      }
    }, 150);
  }

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

  _resolveThirdPartyCartSelector(descriptor) {
    if (!descriptor || !descriptor.selector) return null;
    const { type, selector } = descriptor;
    if (type === 'class' && !selector.startsWith('.')) return `.${selector}`;
    if (type === 'id' && !selector.startsWith('#')) return `#${selector}`;
    return selector;
  }

  bindThirdPartyCartMutation() {
    const cfg = this.config.shopflo_third_party_cart_mutation;
    if (!cfg || cfg.enabled !== true) return;

    const buttonSelector = this._resolveThirdPartyCartSelector(cfg.checkout_button);
    if (!buttonSelector) return;
    const wrapperSelector = this._resolveThirdPartyCartSelector(cfg.checkout_parent_wrapper);

    document.addEventListener(
      'click',
      (event) => {
        const path = cfg.is_shadow_dom ? event.composedPath() : null;
        const button = path
          ? path.find((node) => node instanceof Element && node.matches(buttonSelector))
          : event.target.closest(buttonSelector);
        if (!button) return;

        if (wrapperSelector) {
          const inWrapper = path
            ? path.some((node) => node instanceof Element && node.matches(wrapperSelector))
            : button.closest(wrapperSelector);
          if (!inWrapper) return;
        }

        event.preventDefault();
        event.stopPropagation();
        this.openThemeFloCheckout();
      },
      true
    );
  }

  bindLabelWidthGuard() {
    const SQUEEZE_CLASS = 'sf-label-squeezed';
    const SQUEEZE_RATIO = 0.55;
    const BUTTON_SELECTOR = '.shopflo-checkout__button, .shopflo-buy-now__button';

    // Re-queries buttons on every call (not captured once at bind time) so a button injected
    // later - e.g. a Quick View/quick-add modal replacing its content via innerHTML well after
    // this ran - is picked up the next time evaluate() runs, not just whatever existed at
    // init()/resize()/fonts.ready() time.
    const evaluate = () => {
      const buttons = document.querySelectorAll(BUTTON_SELECTOR);
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

    // Theme-agnostic re-evaluation for a button that appears LATER (e.g. a Quick View/quick-add
    // modal injecting a fresh .shopflo-buy-now__button via innerHTML, strictly after every
    // trigger above has already fired) - a MutationObserver on document.body watching for new
    // matching nodes, rather than hooking into any specific host theme's own modal/JS framework
    // (that file varies per theme; this file must stay portable to any of them - see the
    // Quick View variant-isolation fix for the same principle). Only reacts to nodes actually
    // being ADDED to the tree (childList), never to evaluate()'s own class toggling (which
    // mutates no node's structure), so this cannot re-trigger itself the way observing the
    // buttons' own size/attributes would.
    let mutationTimer;
    const observer = new MutationObserver((mutations) => {
      const sawRelevantNode = mutations.some((mutation) =>
        Array.from(mutation.addedNodes).some((node) => {
          if (node.nodeType !== 1) return false;
          return (
            (typeof node.matches === 'function' && node.matches(BUTTON_SELECTOR)) ||
            (typeof node.querySelector === 'function' && node.querySelector(BUTTON_SELECTOR))
          );
        })
      );
      if (!sawRelevantNode) return;
      clearTimeout(mutationTimer);
      mutationTimer = setTimeout(evaluate, 50);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  bindPopupMorph() {
    this.reduceMotion =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      this.config.shopflo_enable_popup_animation === false;

    if (this.reduceMotion) {
      document.addEventListener('click', (event) => {
        const trigger = event.target.closest('.shopflo-popup-trigger');
        if (!trigger || trigger.disabled) return;
        if (trigger.dataset.floAction === 'buy-now') {
          this.openThemeFloBuyNow(event);
        } else if (trigger.dataset.floAction === 'checkout') {
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
      if (trigger.dataset.floAction !== 'buy-now' && trigger.dataset.floAction !== 'checkout') return;

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

  triggerHeightFor(trigger) {
    return `${trigger.getBoundingClientRect().height}px`;
  }

  targetPopupHeight() {
    return getComputedStyle(this.popupWrapper).getPropertyValue('--popup-h').trim() || '100%';
  }

  setPopupHeight(height) {
    this.popupWrapper.style.setProperty('--h', height);
  }

  triggerRadiusFor(trigger) {
    return getComputedStyle(trigger).borderRadius || '0px';
  }

  targetPopupRadius() {
    return getComputedStyle(this.popupWrapper).getPropertyValue('--popup-radius').trim() || '0px';
  }

  setPopupRadius(radius) {
    this.popupWrapper.style.setProperty('--radius', radius);
  }

  getDurationMs() {
    const raw = getComputedStyle(this.popupWrapper).getPropertyValue('--duration').trim();
    const ms = raw.endsWith('ms') ? parseFloat(raw) : parseFloat(raw) * 1000;
    return Number.isFinite(ms) && ms > 0 ? ms : 500;
  }

  edgeFadeTiming(edge) {
    const total = this.getDurationMs();
    const edgeDuration = Math.round(total * 0.08);
    const delay = edge === 'end' ? total - edgeDuration : 0;
    return { edgeDuration, delay };
  }

  closeFadeTiming() {
    const duration = 1950;
    const delay = Math.max(0, this.getDurationMs() - duration);
    return { duration, delay };
  }

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
    void this.popupWrapper.offsetWidth;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.setPopupHeight(this.targetPopupHeight());
        const popupW = this.popupWrapper.offsetWidth;
        const popupH = this.popupWrapper.offsetHeight;

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
    } else if (action === 'checkout') {
      this.openThemeFloCheckout();
    }

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
    setTimeout(finish, this.getDurationMs() + 150);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.shopfloThemeInstance = new ShopfloTheme();
});

window.ShopfloTheme = ShopfloTheme;

const ShopfloAccountsConfig = {
  ready: {
    intervalMs: 150,
    maxAttempts: 20,
    onTimeout: 'warn',
  },

  session: {
    isSessionKey: 'flo_isShopfloSession',
    isLogoutKey: 'FLO_SSO_IS_LOGOUT',
  },

  iframe: {
    sourceId: 'flo-shopify-login-iframe',
    mobileBreakpoint: 799,
  },

  debug: true,
};

function readShopfloSessionStorage(key) {
  try {
    return window.sessionStorage.getItem(key);
  } catch (e) {
    console.warn('[shopflo-accounts]', 'sessionStorage.getItem(\'' + key + '\') threw - treating as absent.', e);
    return null;
  }
}

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

function seedShopfloSessionFlagsIfMissing() {
  const { isSessionKey, isLogoutKey } = ShopfloAccountsConfig.session;
  const hasEitherFlag =
    readShopfloSessionStorage(isSessionKey) !== null || readShopfloSessionStorage(isLogoutKey) !== null;
  if (hasEitherFlag) return;

  writeShopfloSessionStorage(isSessionKey, 'true');
  writeShopfloSessionStorage(isLogoutKey, 'true');
}
seedShopfloSessionFlagsIfMissing();

window.isThemeFloLoggedIn = function () {
  return resolveShopfloAuthState().state === 'logged-in';
};

class ShopfloAccounts extends HTMLElement {
  connectedCallback() {
    if (this._shopfloInitialized) return;
    this._shopfloInitialized = true;

    this._log('connectedCallback: initializing slot=' + this._resolveSlot());

    this._onPageShow = this._onPageShow.bind(this);
    window.addEventListener('pageshow', this._onPageShow);

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

  _log(...args) {
    if (ShopfloAccountsConfig.debug) console.log('[shopflo-accounts]', ...args);
  }

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

  _readSessionStorage(key) {
    return readShopfloSessionStorage(key);
  }

  _writeSessionStorage(key, value) {
    return writeShopfloSessionStorage(key, value);
  }

  _resolveSessionState() {
    const { hasSession, isLoggingOut, state } = resolveShopfloAuthState();
    this._log('_resolveSessionState:', { hasSession, isLoggingOut, state });
    return state;
  }

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

  _setupDrawerItemTriggers() {
    this.querySelectorAll('[data-flo-trigger="account-login"]').forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        this._log('account-login clicked, typeof window.handleShopifyLogin =', typeof window.handleShopifyLogin);
        this._callGlobalWhenReady('handleShopifyLogin', [event, '/account']);
        this._handleAccountIframeFlow();
      });
    });

    this.querySelectorAll('[data-flo-trigger="account-logout"]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        this._log('account-logout clicked');
        this._writeSessionStorage(ShopfloAccountsConfig.session.isLogoutKey, 'true');
        window.location.reload();
      });
    });
  }

  _dispatchAccountEvent(name) {
    document.dispatchEvent(new CustomEvent('shopflo-event:' + name));
  }

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
    const state = this._resolveSessionState();
    this._applyAuthState(state);
    this._log('_handleHeaderIconClick: resolved state =', state);

    if (state === 'logged-in') {
      this._closeIframeFlow();
      const opening = this._isDrawerClosed();
      this._log('_handleHeaderIconClick: logged-in branch, opening =', opening);
      if (opening) {
        this._positionDrawer();
      }
      this._toggleState('drawer', event.currentTarget);
      this._setOverlayVisible(opening);
      this._dispatchAccountEvent(opening ? 'account-drawer-opened' : 'account-drawer-closed');
    } else {
      this._log('_handleHeaderIconClick: logged-out branch, deferring to window.handleDrawer()');
      this._dispatchAccountEvent('account-login-opened');
      this._callGlobalWhenReady('handleDrawer', []);
    }
  }

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
      if (parsed && (parsed.vertical === 'above' || parsed.vertical === 'below') && (parsed.horizontal === 'left' || parsed.horizontal === 'right' || parsed.horizontal === 'center')) {
        return parsed;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  _writeCachedDrawerPosition(cacheKey, position) {
    try {
      window.sessionStorage.setItem(cacheKey, JSON.stringify(position));
    } catch (e) {
    }
  }

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

    const preferredVertical = this.dataset.drawerVertical === 'above' ? 'above' : 'below';
    const preferredHorizontal =
      this.dataset.drawerHorizontal === 'left'
        ? 'left'
        : this.dataset.drawerHorizontal === 'center'
          ? 'center'
          : 'right';

    const spaceBelow = viewportH - anchorRect.bottom;
    const spaceAbove = anchorRect.top;
    const spaceForPreferredVertical = preferredVertical === 'above' ? spaceAbove : spaceBelow;
    const spaceForOtherVertical = preferredVertical === 'above' ? spaceBelow : spaceAbove;
    const vertical = (spaceForPreferredVertical >= height || spaceForPreferredVertical >= spaceForOtherVertical)
      ? preferredVertical
      : (preferredVertical === 'above' ? 'below' : 'above');

    const spaceForRightAlign = anchorRect.right;
    const spaceForLeftAlign = viewportW - anchorRect.left;

    let horizontal;
    if (preferredHorizontal === 'center') {
      const anchorCenterX = anchorRect.left + anchorRect.width / 2;
      const centerFits =
        anchorCenterX >= width / 2 && viewportW - anchorCenterX >= width / 2;
      horizontal = centerFits ? 'center' : (spaceForLeftAlign >= spaceForRightAlign ? 'left' : 'right');
    } else {
      const spaceForPreferredHorizontal = preferredHorizontal === 'left' ? spaceForLeftAlign : spaceForRightAlign;
      const spaceForOtherHorizontal = preferredHorizontal === 'left' ? spaceForRightAlign : spaceForLeftAlign;
      horizontal = (spaceForPreferredHorizontal >= width || spaceForPreferredHorizontal >= spaceForOtherHorizontal)
        ? preferredHorizontal
        : (preferredHorizontal === 'left' ? 'right' : 'left');
    }

    return { vertical, horizontal };
  }

  _applyDrawerPosition(drawerEl, position) {
    drawerEl.classList.toggle('shopflo-accounts__drawer--open-top', position.vertical === 'above');
    drawerEl.classList.toggle('shopflo-accounts__drawer--open-left', position.horizontal === 'left');
    drawerEl.classList.toggle('shopflo-accounts__drawer--open-center', position.horizontal === 'center');
  }

  _setOverlayVisible(visible) {
    this.querySelectorAll('[data-flo-state="account-drawer-overlay"]').forEach((el) => {
      el.setAttribute('data-flo-visible', visible ? 'true' : 'false');
    });
    this._setHeaderOverflowVisible(visible);
  }

  // Theme Editor > Shopflo Shop Pass > "Force overflow visible on" - some host headers clip
  // this dropdown/login panel with their own overflow:hidden (often for a sticky-header
  // effect), since it's an absolutely-positioned descendant nested inside that header. Forces
  // overflow:visible on each configured ancestor selector while open, restores it on close -
  // a no-op (returns immediately) when the setting is left blank, which is the default.
  _setHeaderOverflowVisible(visible) {
    const raw = window.shopfloThemeConfig && window.shopfloThemeConfig.shopflo_account_overflow_fix_selectors;
    if (!raw) return;

    raw
      .split(',')
      .map((selector) => selector.trim())
      .filter(Boolean)
      .forEach((selector) => {
        document.querySelectorAll(selector).forEach((el) => {
          el.classList.toggle('sf-header-overflow-visible', visible);
        });
      });
  }

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

  _openIframeFlow(realIframeEl) {
    this._dispatchAccountEvent('account-iframe-opened');

    this.querySelectorAll('[data-flo-state="drawer"]').forEach((el) => {
      el.setAttribute('data-flo-visible', 'false');
    });

    const isMobile = window.matchMedia('(max-width: ' + ShopfloAccountsConfig.iframe.mobileBreakpoint + 'px)').matches;
    if (isMobile) {
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

  _startIframeSizeSync(realIframeEl) {
    const applySize = () => {
      let height = realIframeEl.style.height;
      if (!height) {
        height = getComputedStyle(realIframeEl).height;
      }

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

  _closeIframeFlow() {
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
