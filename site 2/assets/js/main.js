/* ==========================================================================
   MALWAI GIDDHA — VANILLA JAVASCRIPT INTERACTION MODULE
   Strictly used ONLY for:
   - Sticky header scroll transition
   - IntersectionObserver reveal animations
   - Hero slider controls & auto-advance
   - Testimonial slider interactions
   - Gallery category filtering & full-screen lightbox modal (with keyboard nav)
   - Back-to-top smooth button
   - Native HTML5 enquiry form validation & query prefill
   - Dynamic canonical URL sync when hosted
   ========================================================================== */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var logic = window.MalwaiLogic || {
    getWrappedIndex: function (current, delta, total) {
      return total > 0 ? (current + delta + total) % total : 0;
    },
    matchesGalleryCategory: function (itemCategory, activeFilter) {
      if (!activeFilter || activeFilter === 'all') return true;
      return String(itemCategory || '').toLowerCase().split(/\s+/).indexOf(String(activeFilter).toLowerCase()) !== -1;
    }
  };

  /* 1. Sticky Header & Back-to-Top Visibility */
  function initStickyAndBackToTop() {
    var headerWrap = document.getElementById('siteHeader');
    var backToTopBtn = document.getElementById('backToTopBtn');

    function onScroll() {
      var y = window.scrollY || window.pageYOffset || 0;
      if (headerWrap) {
        headerWrap.classList.toggle('is-scrolled', y > 40);
      }
      if (backToTopBtn) {
        backToTopBtn.classList.toggle('is-visible', y > 420);
      }
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', function () {
        window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
      });
    }
  }

  /* 2. Intersection Observer Reveal Animations */
  function initScrollReveals() {
    var revealEls = document.querySelectorAll('.reveal-on-scroll');
    if (!revealEls.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -24px 0px' }
    );

    revealEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.96) {
        el.classList.add('is-visible');
      } else {
        observer.observe(el);
      }
    });
  }

  /* 3. Cinematic Hero Slider */
  function initHeroSlider() {
    var heroSection = document.getElementById('heroSlider');
    if (!heroSection) return;

    var slides = Array.prototype.slice.call(heroSection.querySelectorAll('.hero-slide'));
    var indicators = Array.prototype.slice.call(heroSection.querySelectorAll('.hero-indicator-btn'));
    var prevBtn = heroSection.querySelector('[data-hero-prev]');
    var nextBtn = heroSection.querySelector('[data-hero-next]');

    if (!slides.length) return;

    var currentIndex = slides.findIndex(function (s) {
      return s.classList.contains('is-active');
    });
    if (currentIndex < 0) currentIndex = 0;

    var timerId = null;

    function goToSlide(nextIdx) {
      currentIndex = nextIdx;
      slides.forEach(function (slide, idx) {
        var active = idx === currentIndex;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      indicators.forEach(function (btn, idx) {
        var active = idx === currentIndex;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-current', active ? 'true' : 'false');
      });
    }

    function startAutoPlay() {
      if (prefersReducedMotion || timerId) return;
      timerId = window.setInterval(function () {
        goToSlide(logic.getWrappedIndex(currentIndex, 1, slides.length));
      }, 6500);
    }

    function stopAutoPlay() {
      if (timerId) {
        window.clearInterval(timerId);
        timerId = null;
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        stopAutoPlay();
        goToSlide(logic.getWrappedIndex(currentIndex, -1, slides.length));
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        stopAutoPlay();
        goToSlide(logic.getWrappedIndex(currentIndex, 1, slides.length));
      });
    }

    indicators.forEach(function (btn, idx) {
      btn.addEventListener('click', function () {
        stopAutoPlay();
        goToSlide(idx);
      });
    });

    heroSection.addEventListener('mouseenter', stopAutoPlay);
    heroSection.addEventListener('mouseleave', startAutoPlay);

    goToSlide(currentIndex);
    startAutoPlay();
  }

  /* 4. Testimonial Slider */
  function initTestimonialSlider() {
    var wrapper = document.getElementById('testimonialSlider');
    if (!wrapper) return;

    var items = Array.prototype.slice.call(wrapper.querySelectorAll('.testimonial-slide'));
    var prevBtn = wrapper.querySelector('[data-testimonial-prev]');
    var nextBtn = wrapper.querySelector('[data-testimonial-next]');
    if (!items.length) return;

    var index = 0;

    function renderTestimonial(nextIdx) {
      index = nextIdx;
      items.forEach(function (item, i) {
        item.classList.toggle('d-none', i !== index);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        renderTestimonial(logic.getWrappedIndex(index, -1, items.length));
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        renderTestimonial(logic.getWrappedIndex(index, 1, items.length));
      });
    }
  }

  /* 5. Gallery Filters & Full-Screen Lightbox Viewer */
  function initGallery() {
    var filterBar = document.getElementById('galleryFilterBar');
    var galleryGrid = document.getElementById('galleryGrid');
    var countBadge = document.getElementById('galleryVisibleCount');
    var items = galleryGrid ? Array.prototype.slice.call(galleryGrid.querySelectorAll('.masonry-item')) : [];

    if (filterBar && items.length) {
      var filterBtns = Array.prototype.slice.call(filterBar.querySelectorAll('.gallery-filter-btn'));
      filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var selected = btn.getAttribute('data-filter') || 'all';
          filterBtns.forEach(function (b) {
            b.classList.toggle('is-active', b === btn);
            b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
          });

          var visibleCount = 0;
          items.forEach(function (item) {
            var categories = item.getAttribute('data-category') || '';
            var match = logic.matchesGalleryCategory(categories, selected);
            item.classList.toggle('is-hidden', !match);
            if (match) visibleCount += 1;
          });

          if (countBadge) {
            countBadge.textContent = visibleCount + ' photographs';
          }
        });
      });
    }

    var lightboxEl = document.getElementById('galleryLightboxModal');
    if (!lightboxEl || !window.bootstrap) return;

    var modalInstance = window.bootstrap.Modal.getOrCreateInstance(lightboxEl);
    var lightboxImg = document.getElementById('lightboxImage');
    var lightboxTitle = document.getElementById('lightboxTitle');
    var lightboxCategory = document.getElementById('lightboxCategory');
    var lightboxPrev = document.getElementById('lightboxPrevBtn');
    var lightboxNext = document.getElementById('lightboxNextBtn');

    var triggers = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox-trigger]'));
    var currentVisibleIndex = 0;

    function getVisibleTriggers() {
      return triggers.filter(function (t) {
        var parentItem = t.closest('.masonry-item');
        return !parentItem || !parentItem.classList.contains('is-hidden');
      });
    }

    function openLightboxAt(triggerList, idx) {
      var target = triggerList[idx];
      if (!target || !lightboxImg) return;
      currentVisibleIndex = idx;
      lightboxImg.src = target.getAttribute('data-image') || '';
      lightboxImg.alt = target.getAttribute('data-title') || 'Malwai Giddha Photograph';
      if (lightboxTitle) lightboxTitle.textContent = target.getAttribute('data-title') || '';
      if (lightboxCategory) lightboxCategory.textContent = target.getAttribute('data-category-label') || '';
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var visibleList = getVisibleTriggers();
        var idx = visibleList.indexOf(trigger);
        if (idx < 0) idx = 0;
        openLightboxAt(visibleList, idx);
        modalInstance.show();
      });
    });

    if (lightboxPrev) {
      lightboxPrev.addEventListener('click', function () {
        var visibleList = getVisibleTriggers();
        openLightboxAt(visibleList, logic.getWrappedIndex(currentVisibleIndex, -1, visibleList.length));
      });
    }

    if (lightboxNext) {
      lightboxNext.addEventListener('click', function () {
        var visibleList = getVisibleTriggers();
        openLightboxAt(visibleList, logic.getWrappedIndex(currentVisibleIndex, 1, visibleList.length));
      });
    }

    document.addEventListener('keydown', function (event) {
      if (!lightboxEl.classList.contains('show')) return;
      if (event.key === 'ArrowLeft' && lightboxPrev) lightboxPrev.click();
      if (event.key === 'ArrowRight' && lightboxNext) lightboxNext.click();
    });
  }

  /* 6. Contact Form Native Validation Feedback & Query Prefill */
  function initContactFormValidation() {
    var form = document.getElementById('enquiryForm');
    if (!form) return;

    try {
      var params = new URLSearchParams(window.location.search);
      var cityParam = params.get('city');
      var eventParam = params.get('event');
      var cityInput = document.getElementById('eventCity');
      var eventSelect = document.getElementById('eventType');

      if (cityParam && cityInput && !cityInput.value) {
        cityInput.value = cityParam;
      }
      if (eventParam && eventSelect) {
        var normalized = eventParam.toLowerCase();
        Array.prototype.slice.call(eventSelect.options).forEach(function (opt) {
          if (opt.value && opt.value.toLowerCase().indexOf(normalized.split(' ')[0]) !== -1) {
            eventSelect.value = opt.value;
          }
        });
      }
    } catch (_err) {
      // Ignore malformed query string
    }

    form.addEventListener('submit', function (event) {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    });
  }

  /* 7. Mobile Offcanvas & Smooth Anchor Scrolling */
  function initMobileNavBehavior() {
    var offcanvasEl = document.getElementById('mobileCulturalNav');
    if (!offcanvasEl || !window.bootstrap) return;
    var links = offcanvasEl.querySelectorAll('a[href^="#"]');
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        var instance = window.bootstrap.Offcanvas.getInstance(offcanvasEl);
        if (instance) instance.hide();
      });
    });
  }

  /* 8. Sync Canonical & OpenGraph URL to Active Origin */
  function syncCanonicalUrl() {
    if (!window.location || !window.location.origin || window.location.origin === 'null') return;
    var resolvedUrl = window.location.origin + window.location.pathname;
    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', resolvedUrl);
    var ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', resolvedUrl);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initStickyAndBackToTop();
    initScrollReveals();
    initHeroSlider();
    initTestimonialSlider();
    initGallery();
    initContactFormValidation();
    initMobileNavBehavior();
    syncCanonicalUrl();
  });
})();
