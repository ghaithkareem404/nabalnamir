/* ==========================================================================
   Naba' Al-Namir — site behaviour
   ========================================================================== */
(function () {
  'use strict';

  var WHATSAPP = '9647814141422';
  var EMAIL = 'info@nabalnamir.com';

  /* Embed source for the contact map. Replace the value below with the
     "Embed a map" iframe src from Google Maps (Share > Embed a map) to pin
     the exact plant location. */
  var MAP_EMBED = 'https://www.google.com/maps?q=' +
    encodeURIComponent('عويريج الصناعية, بغداد') + '&z=14&output=embed';

  var COPY = {
    ar: {
      missing: 'يرجى إكمال الحقول المطلوبة.',
      mailed: 'فُتح برنامج البريد لديك — أكمل الإرسال من هناك.',
      whats: 'فُتح واتساب في نافذة جديدة.',
      mapTitle: 'موقع المصنع على الخريطة'
    },
    en: {
      missing: 'Please complete the required fields.',
      mailed: 'Your email client has opened — finish sending from there.',
      whats: 'WhatsApp has opened in a new window.',
      mapTitle: 'Plant location on the map'
    }
  };

  function lang() {
    return document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'ar';
  }
  function t(key) {
    return COPY[lang()][key];
  }

  /* ---------- language ---------- */
  var KEY = 'nn-lang';
  var langBtn = document.getElementById('langToggle');
  var langLabel = langBtn ? langBtn.querySelector('span') : null;

  function setLang(next) {
    var root = document.documentElement;
    root.setAttribute('lang', next);
    root.setAttribute('dir', next === 'ar' ? 'rtl' : 'ltr');

    var nodes = document.querySelectorAll('[data-ar][data-en]');
    for (var i = 0; i < nodes.length; i++) {
      var value = nodes[i].getAttribute(next === 'ar' ? 'data-ar' : 'data-en');
      if (value !== null) nodes[i].innerHTML = value;
    }

    if (langLabel) langLabel.textContent = next === 'ar' ? 'EN' : 'ع';
    if (langBtn) {
      langBtn.setAttribute('aria-label',
        next === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
    }

    document.title = next === 'ar'
      ? 'شركة نبع النمير لتعبئة المياه الصحية والعصائر المحدودة'
      : "Naba' Al-Namir Company for Healthy Water Bottling & Juices, Ltd.";

    var frame = document.querySelector('.mapbox iframe');
    if (frame) frame.setAttribute('title', t('mapTitle'));

    try { localStorage.setItem(KEY, next); } catch (e) { /* storage unavailable */ }
  }

  try {
    if (localStorage.getItem(KEY) === 'en') setLang('en');
  } catch (e) { /* storage unavailable */ }

  if (langBtn) {
    langBtn.addEventListener('click', function () {
      setLang(lang() === 'ar' ? 'en' : 'ar');
    });
  }

  /* ---------- mobile navigation ---------- */
  var burger = document.getElementById('navToggle');
  var nav = document.getElementById('nav');

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (ev) {
      if (ev.target.tagName !== 'A') return;
      nav.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  }

  /* ---------- active section in the nav ---------- */
  var links = nav ? nav.querySelectorAll('a[href^="#"]') : [];
  var marks = [];
  for (var n = 0; n < links.length; n++) {
    var section = document.querySelector(links[n].getAttribute('href'));
    if (section) marks.push({ link: links[n], el: section });
  }

  function syncNav() {
    var line = window.scrollY + 140;
    var current = null;
    for (var i = 0; i < marks.length; i++) {
      if (marks[i].el.offsetTop <= line) current = marks[i];
    }
    for (var j = 0; j < marks.length; j++) {
      marks[j].link.classList.toggle('on', marks[j] === current);
    }
  }

  var queued = false;
  window.addEventListener('scroll', function () {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(function () { syncNav(); queued = false; });
  }, { passive: true });
  syncNav();

  /* ---------- product filters ---------- */
  var filters = document.querySelectorAll('.fl');
  var items = document.querySelectorAll('.pitem');

  for (var f = 0; f < filters.length; f++) {
    filters[f].addEventListener('click', function () {
      var want = this.getAttribute('data-filter');
      for (var a = 0; a < filters.length; a++) filters[a].classList.remove('on');
      this.classList.add('on');
      for (var b = 0; b < items.length; b++) {
        var keep = want === 'all' || items[b].getAttribute('data-cat') === want;
        items[b].classList.toggle('off', !keep);
      }
    });
  }

  /* ---------- entrance ---------- */
  var rising = document.querySelectorAll(
    '.pillars li, .brand-lead, .brand-min, .pitem, .stages li, .terms, .reach-list, .form, .facts'
  );

  if ('IntersectionObserver' in window) {
    var watcher = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting) continue;
        entries[i].target.classList.add('in');
        watcher.unobserve(entries[i].target);
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    for (var r = 0; r < rising.length; r++) {
      rising[r].classList.add('rise');
      watcher.observe(rising[r]);
    }
  }

  /* ---------- map, loaded on request ---------- */
  var mapBox = document.getElementById('mapBox');
  var mapBtn = document.getElementById('mapLoad');

  if (mapBox && mapBtn) {
    mapBtn.addEventListener('click', function () {
      var frame = document.createElement('iframe');
      frame.setAttribute('title', t('mapTitle'));
      frame.setAttribute('src', MAP_EMBED);
      frame.setAttribute('loading', 'lazy');
      frame.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      frame.setAttribute('allowfullscreen', '');
      mapBox.replaceChildren(frame);
    });
  }

  /* ---------- contact form ---------- */
  var form = document.getElementById('contactForm');
  var note = document.getElementById('formNote');
  var waBtn = document.getElementById('sendWhatsapp');

  function collect() {
    var els = form.elements;
    var name = els.name.value.trim();
    var phone = els.phone.value.trim();
    var message = els.message.value.trim();
    var picked = els.subject.options[els.subject.selectedIndex];
    var subject = picked.getAttribute(lang() === 'ar' ? 'data-ar' : 'data-en') || picked.text;

    els.name.classList.toggle('bad', !name);
    els.phone.classList.toggle('bad', !phone);
    els.message.classList.toggle('bad', !message);

    if (!name || !phone || !message) {
      if (note) { note.textContent = t('missing'); note.classList.add('bad'); }
      return null;
    }
    if (note) note.classList.remove('bad');
    return { name: name, phone: phone, message: message, subject: subject };
  }

  function body(d) {
    return lang() === 'ar'
      ? 'الاسم: ' + d.name + '\nالهاتف: ' + d.phone + '\nالموضوع: ' + d.subject + '\n\n' + d.message
      : 'Name: ' + d.name + '\nPhone: ' + d.phone + '\nSubject: ' + d.subject + '\n\n' + d.message;
  }

  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var d = collect();
      if (!d) return;
      var subject = (lang() === 'ar' ? 'من الموقع: ' : 'From the website: ') + d.subject;
      window.location.href = 'mailto:' + EMAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body(d));
      if (note) note.textContent = t('mailed');
    });
  }

  if (waBtn) {
    waBtn.addEventListener('click', function () {
      var d = collect();
      if (!d) return;
      window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(body(d)),
        '_blank', 'noopener');
      if (note) note.textContent = t('whats');
    });
  }

  /* ---------- footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
