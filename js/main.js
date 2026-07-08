/* ============================================================
   Nanbin Studio 官网 - 交互脚本
   内容渲染源自 data.js 中的 SITE_DATA 对象
   ============================================================ */

'use strict';

/* ============================================================
   渲染引擎 — 由数据驱动
   ============================================================ */
(function render() {
  var D = SITE_DATA;

  /* ---- 轮播 ---- */
  var track = document.getElementById('carouselTrack');
  var dotsContainer = document.getElementById('carouselDots');
  var slidesHtml = '';
  var dotsHtml = '';
  D.carousel.forEach(function (item, i) {
    slidesHtml +=
      '<div class="carousel-slide">' +
        '<div class="carousel-content">' +
          '<div class="carousel-badge">' + item.badge + '</div>' +
          '<h1 class="carousel-title">' + item.title + '</h1>' +
          '<p class="carousel-desc">' + item.desc + '</p>' +
          '<div class="carousel-actions">' +
            '<a href="' + item.btnLink + '" class="btn btn-primary">' + item.btnText + '</a>' +
            '<a href="' + item.btn2Link + '" class="btn btn-outline">' + item.btn2Text + '</a>' +
          '</div>' +
        '</div>' +
        '<div class="carousel-image">' +
          '<div class="carousel-placeholder"><img src="' + item.image + '" alt="' + item.badge + '"></div>' +
        '</div>' +
      '</div>';
    dotsHtml += '<button class="carousel-dot' + (i === 0 ? ' active' : '') + '" data-index="' + i + '" aria-label="第' + (i+1) + '张幻灯片"></button>';
  });
  track.innerHTML = slidesHtml;
  dotsContainer.innerHTML = dotsHtml;

  /* ---- 作品 ---- */
  var showcaseGrid = document.getElementById('showcaseGrid');
  showcaseGrid.innerHTML = D.showcases.map(function (s) {
    return '<a href="' + s.link + '" class="showcase-card" target="_blank" rel="noopener noreferrer">' +
      '<div class="showcase-image"><img src="' + s.image + '" alt="' + s.title + '"></div>' +
      '<div class="showcase-body">' +
        '<h3>' + s.title + '</h3>' +
        '<p>' + s.desc + '</p>' +
        '<div class="showcase-tags">' + s.tags.map(function (t) { return '<span class="showcase-tag">' + t + '</span>'; }).join('') + '</div>' +
      '</div>' +
    '</a>';
  }).join('');

  /* ---- 页脚 ---- */
  var footerGrid = document.getElementById('footerGrid');
  var footerBrandHtml =
    '<div class="footer-brand">' +
      '<a href="#" class="navbar-logo"><span class="logo-icon">N</span><span>Nanbin Studio</span></a>' +
      '<p>' + D.footer.desc + '</p>' +
    '</div>';
  var footerColsHtml = D.footer.cols.map(function (col) {
    return '<div class="footer-col">' +
      '<h4>' + col.title + '</h4>' +
      col.links.map(function (link) { return '<a href="' + link.href + '">' + link.text + '</a>'; }).join('') +
    '</div>';
  }).join('');
  footerGrid.innerHTML = footerBrandHtml + footerColsHtml;
})();

/* ============================================================
   轮播控制
   ============================================================ */
(function carousel() {
  var track = document.getElementById('carouselTrack');
  var dots = document.querySelectorAll('.carousel-dot');
  var prevBtn = document.getElementById('carouselPrev');
  var nextBtn = document.getElementById('carouselNext');
  var index = 0;
  var total = dots.length;
  var autoTimer = null;

  function goTo(i) {
    if (i < 0) i = total - 1;
    if (i >= total) i = 0;
    index = i;
    track.style.transform = 'translateX(-' + (index * 100) + '%)';
    dots.forEach(function (d, j) {
      d.classList.toggle('active', j === index);
    });
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(next, 5000);
  }
  function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }

  // 事件绑定
  nextBtn.addEventListener('click', function () { next(); startAuto(); });
  prevBtn.addEventListener('click', function () { prev(); startAuto(); });
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      goTo(parseInt(this.getAttribute('data-index'), 10));
      startAuto();
    });
  });

  // 悬停暂停
  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);

  startAuto();
})();

/* ============================================================
   导航栏
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
   平滑滚动
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

console.log('%c Nanbin Studio %c 用创意与科技重塑数字体验 ',
  'background:#00BFA5;color:white;font-size:14px;font-weight:bold;padding:6px 10px;border-radius:4px 0 0 4px;',
  'background:#212529;color:white;font-size:14px;padding:6px 10px;border-radius:0 4px 4px 0;');
