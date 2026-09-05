/* ============================================================
   Nanbin Studio - Interaction scripts
   Content is rendered from SITE_DATA (data.js), text via i18n (i18n.js)
   ============================================================ */

'use strict';

/* Carousel position kept across re-renders (e.g. language switch) */
var currentSlideIndex = 0;

/* ============================================================
   Render engine - rebuilds all dynamic content
   Called on "i18n:ready" and on every "i18n:change"
   ============================================================ */
function renderDynamic() {
  var D = SITE_DATA;

  /* ---- Hero carousel slides ---- */
  var track = document.getElementById('carouselTrack');
  var dotsContainer = document.getElementById('carouselDots');
  var slidesHtml = '';
  var dotsHtml = '';
  D.carousel.forEach(function (item, i) {
    slidesHtml +=
      '<div class="carousel-slide">' +
        '<div class="carousel-content">' +
          '<div class="carousel-badge">' + window.t(item.badge) + '</div>' +
          '<h1 class="carousel-title">' + window.t(item.title) + '</h1>' +
          '<p class="carousel-desc">' + window.t(item.desc) + '</p>' +
          '<div class="carousel-actions">' +
            '<a href="' + item.btnLink + '" class="btn btn-primary">' + window.t(item.btnText) + '</a>' +
            '<a href="' + item.btn2Link + '" class="btn btn-outline">' + window.t(item.btn2Text) + '</a>' +
          '</div>' +
        '</div>' +
        '<div class="carousel-image">' +
          '<div class="carousel-placeholder"><img src="' + item.image + '" alt="' + window.t(item.badge) + '"></div>' +
        '</div>' +
      '</div>';
    dotsHtml += '<button class="carousel-dot' + (i === currentSlideIndex ? ' active' : '') + '" data-index="' + i + '" aria-label="' + window.t('hero.slide.aria', { i: i + 1 }) + '"></button>';
  });
  track.innerHTML = slidesHtml;
  dotsContainer.innerHTML = dotsHtml;

  /* ---- Blurred backdrop layer (current slide image as hero background) ---- */
  var hero = document.querySelector('.hero');
  var oldBg = hero.querySelector('.carousel-bg');
  if (oldBg) oldBg.remove();
  var bgLayer = document.createElement('div');
  bgLayer.className = 'carousel-bg';
  bgLayer.setAttribute('aria-hidden', 'true');
  bgLayer.innerHTML = D.carousel.map(function (item, i) {
    return '<img class="carousel-bg-img' + (i === currentSlideIndex ? ' active' : '') + '" src="' + item.image + '" alt="">';
  }).join('');
  hero.insertBefore(bgLayer, hero.firstChild);

  /* ---- Showcase cards ---- */
  var showcaseGrid = document.getElementById('showcaseGrid');
  showcaseGrid.innerHTML = D.showcases.map(function (s) {
    return '<a href="' + s.link + '" class="showcase-card" target="_blank" rel="noopener noreferrer">' +
      '<div class="showcase-image"><img src="' + s.image + '" alt="' + window.t(s.title) + '"></div>' +
      '<div class="showcase-body">' +
        '<h3>' + window.t(s.title) + '</h3>' +
        '<p>' + window.t(s.desc) + '</p>' +
        '<div class="showcase-tags">' + s.tags.map(function (tag) { return '<span class="showcase-tag">' + window.t(tag) + '</span>'; }).join('') + '</div>' +
      '</div>' +
    '</a>';
  }).join('');

  /* ---- Footer ---- */
  var footerGrid = document.getElementById('footerGrid');
  var footerBrandHtml =
    '<div class="footer-brand">' +
      '<a href="#" class="navbar-logo"><span class="logo-icon"><img src="https://free.picui.cn/free/2026/07/09/6a4f9c5da363d.png" alt="Nanbin Studio 图标"></span><span>Nanbin Studio</span></a>' +
      '<p>' + window.t(D.footer.desc) + '</p>' +
    '</div>';
  var footerColsHtml = D.footer.cols.map(function (col) {
    return '<div class="footer-col">' +
      '<h4>' + window.t(col.title) + '</h4>' +
      col.links.map(function (link) { return '<a href="' + link.href + '">' + window.t(link.text) + '</a>'; }).join('') +
    '</div>';
  }).join('');
  footerGrid.innerHTML = footerBrandHtml + footerColsHtml;

  /* ---- Re-init carousel controls & glass touch light for fresh DOM ---- */
  initCarousel();
  bindTouchLight();
}

/* ============================================================
   Carousel controls (re-entrant: safe to call after re-render)
   ============================================================ */
function initCarousel() {
  var track = document.getElementById('carouselTrack');
  var dots = document.querySelectorAll('.carousel-dot');
  var prevBtn = document.getElementById('carouselPrev');
  var nextBtn = document.getElementById('carouselNext');
  var index = currentSlideIndex;
  var total = dots.length;
  var autoTimer = null;

  if (!total) return;

  // Restore carousel position immediately after rebuild
  track.style.transform = 'translateX(-' + (index * 100) + '%)';

  function goTo(i) {
    if (i < 0) i = total - 1;
    if (i >= total) i = 0;
    index = i;
    currentSlideIndex = i; // persist across re-renders
    track.style.transform = 'translateX(-' + (index * 100) + '%)';
    dots.forEach(function (d, j) {
      d.classList.toggle('active', j === index);
    });
    // Sync blurred backdrop with the active slide
    document.querySelectorAll('.carousel-bg-img').forEach(function (img, j) {
      img.classList.toggle('active', j === index);
    });
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(next, 5000);
  }
  function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }

  // Stop the previous auto timer before rebinding
  if (track._stopAuto) track._stopAuto();
  track._stopAuto = stopAuto;

  nextBtn.addEventListener('click', function () { next(); startAuto(); });
  prevBtn.addEventListener('click', function () { prev(); startAuto(); });
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      goTo(parseInt(this.getAttribute('data-index'), 10));
      startAuto();
    });
  });

  // Pause on hover
  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);

  startAuto();
}

/* ============================================================
   Liquid Glass touch-point illumination
   Radial highlight follows the mouse over glass controls
   ============================================================ */
function bindTouchLight() {
  document.querySelectorAll('.btn, .carousel-btn, .navbar-links a').forEach(function (el) {
    if (el._touchLight) return; // bind only once per element
    el._touchLight = true;
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
}

/* ============================================================
   Navbar (static elements - bind once)
   ============================================================ */
(function navbar() {
  var navbar = document.getElementById('navbar');
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');

  window.addEventListener('scroll', function () {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  toggle.addEventListener('click', function () {
    var isOpen = links.classList.toggle('open');
    toggle.classList.toggle('active');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  links.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      links.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ============================================================
   Smooth scrolling for anchor links
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener('click', function (e) {
    var targetId = this.getAttribute('href');
    if (targetId === '#') return;
    var target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - 72;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
  });
});

/* ============================================================
   Bootstrap: first render waits for the i18n dictionary,
   later language switches re-render automatically
   ============================================================ */
document.addEventListener('i18n:ready', renderDynamic);
document.addEventListener('i18n:change', renderDynamic);

console.log('%c Nanbin Studio %c Reshaping digital experiences with creativity and technology ',
  'background:#00BFA5;color:white;font-size:14px;font-weight:bold;padding:6px 10px;border-radius:4px 0 0 4px;',
  'background:#212529;color:white;font-size:14px;padding:6px 10px;border-radius:0 4px 4px 0;');
