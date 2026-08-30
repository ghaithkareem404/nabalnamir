/* ============================================================
   Naba' Al-Namir — site behaviour
   ============================================================ */
(function () {
  'use strict';

  var WHATSAPP = '9647814141422';
  var EMAIL = 'info@nabalnamir.com';

  /* ---------- 1. Language toggle (AR <-> EN) ---------- */
  var STORAGE_KEY = 'nn-lang';
  var langBtn = document.getElementById('langToggle');

  var UI = {
    ar: {
      formEmpty: 'يرجى تعبئة الحقول المطلوبة.',
      formSent: 'تم فتح برنامج البريد لديك، أكمل الإرسال من هناك.',
      formWa: 'تم فتح واتساب في نافذة جديدة.',
      navLabel: 'القائمة الرئيسية'
    },
    en: {
      formEmpty: 'Please fill in the required fields.',
      formSent: 'Your email client has opened — finish sending from there.',
      formWa: 'WhatsApp has opened in a new window.',
      navLabel: 'Main navigation'
    }
  };

  function currentLang() {
    return document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'ar';
  }

  function applyLang(lang) {
    var html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    var nodes = document.querySelectorAll('[data-ar][data-en]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var text = el.getAttribute(lang === 'ar' ? 'data-ar' : 'data-en');
      if (text !== null) el.innerHTML = text;
    }

    if (langBtn) {
      langBtn.textContent = lang === 'ar' ? 'EN' : 'ع';
      langBtn.setAttribute('aria-label', lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
    }

    document.title = lang === 'ar'
      ? 'شركة نبع النمير لتعبئة المياه الصحية والعصائر المحدودة'
      : "Naba' Al-Namir Company for Healthy Water Bottling & Juices, Ltd.";

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* storage blocked */ }
  }

  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en') applyLang('en');
  } catch (e) { /* storage blocked */ }

  if (langBtn) {
    langBtn.addEventListener('click', function () {
      applyLang(currentLang() === 'ar' ? 'en' : 'ar');
    });
  }

  /* ---------- 2. Mobile navigation ---------- */
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var open = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    mainNav.addEventListener('click', function (ev) {
      if (ev.target.tagName === 'A') {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- 3. Header shadow + active link on scroll ---------- */
  var header = document.getElementById('siteHeader');
  var navLinks = mainNav ? mainNav.querySelectorAll('a[href^="#"]') : [];
  var sections = [];

  for (var n = 0; n < navLinks.length; n++) {
    var target = document.querySelector(navLinks[n].getAttribute('href'));
    if (target) sections.push({ link: navLinks[n], el: target });
  }

  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 10);

    var pos = window.scrollY + 140;
    var active = null;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].el.offsetTop <= pos) active = sections[i];
    }
    for (var j = 0; j < sections.length; j++) {
      sections[j].link.classList.toggle('active', sections[j] === active);
    }
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();

  /* ---------- 4. Product filters ---------- */
  var filters = document.querySelectorAll('.filter');
  var products = document.querySelectorAll('.product');

  for (var f = 0; f < filters.length; f++) {
    filters[f].addEventListener('click', function () {
      var cat = this.getAttribute('data-filter');
      for (var k = 0; k < filters.length; k++) filters[k].classList.remove('is-active');
      this.classList.add('is-active');
      for (var p = 0; p < products.length; p++) {
        var show = cat === 'all' || products[p].getAttribute('data-cat') === cat;
        products[p].classList.toggle('is-hidden', !show);
      }
    });
  }

  /* ---------- 5. Reveal on scroll ---------- */
  var revealTargets = document.querySelectorAll(
    '.trust-item, .brand-card, .product, .steps li, .vm, .ci-item, .dist-card, .about-panel'
  );

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add('visible');
          io.unobserve(entries[i].target);
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    for (var r = 0; r < revealTargets.length; r++) {
      revealTargets[r].classList.add('reveal');
      io.observe(revealTargets[r]);
    }
  }

  /* ---------- 6. Contact form ---------- */
  var form = document.getElementById('contactForm');
  var note = document.getElementById('formNote');
  var waBtn = document.getElementById('sendWhatsapp');

  function readForm() {
    if (!form) return null;
    var els = form.elements;
    var name = els.name.value.trim();
    var phone = els.phone.value.trim();
    var message = els.message.value.trim();
    var select = els.subject;
    var chosen = select.options[select.selectedIndex];
    var subject = chosen.getAttribute(currentLang() === 'ar' ? 'data-ar' : 'data-en') || chosen.text;

    els.name.classList.toggle('invalid', !name);
    els.phone.classList.toggle('invalid', !phone);
    els.message.classList.toggle('invalid', !message);

    if (!name || !phone || !message) {
      if (note) {
        note.textContent = UI[currentLang()].formEmpty;
        note.classList.add('error');
      }
      return null;
    }
    if (note) note.classList.remove('error');
    return { name: name, phone: phone, message: message, subject: subject };
  }

  function bodyText(d) {
    return currentLang() === 'ar'
      ? 'الاسم: ' + d.name + '\nالهاتف: ' + d.phone + '\nنوع الطلب: ' + d.subject + '\n\n' + d.message
      : 'Name: ' + d.name + '\nPhone: ' + d.phone + '\nRequest: ' + d.subject + '\n\n' + d.message;
  }

  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var d = readForm();
      if (!d) return;
      var subj = (currentLang() === 'ar' ? 'طلب من الموقع: ' : 'Website request: ') + d.subject;
      window.location.href = 'mailto:' + EMAIL +
        '?subject=' + encodeURIComponent(subj) +
        '&body=' + encodeURIComponent(bodyText(d));
      if (note) note.textContent = UI[currentLang()].formSent;
    });
  }

  if (waBtn) {
    waBtn.addEventListener('click', function () {
      var d = readForm();
      if (!d) return;
      window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(bodyText(d)), '_blank', 'noopener');
      if (note) note.textContent = UI[currentLang()].formWa;
    });
  }

  /* ---------- 7. Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
