(function () {
  'use strict';

  /* ---------- Sticky header on scroll ---------- */
  var header = document.getElementById('siteHeader');
  if (header) {
    function onScroll() {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- Event video: load real MP4 & play on demand ---------- */
  var videoPlayer = document.getElementById('videoPlayer');
  var videoPoster = document.getElementById('videoPoster');

  if (videoPlayer && videoPoster) {
    function playEventVideo() {
      var video = document.createElement('video');
      video.controls = true;
      video.playsInline = true;
      video.poster = 'assets/img/kunbi-kares-poster.jpg';
      video.setAttribute('aria-label', 'Kunbi Kares outreach event highlight');
      videoPlayer.innerHTML = '';
      videoPlayer.appendChild(video);
      // Set src directly (not via a <source> child) so the browser's resource
      // selection algorithm runs immediately instead of requiring an explicit load().
      video.src = 'assets/video/kunbi-kares-event.mp4';
      video.play().catch(function () { /* user can hit native play control */ });
    }

    videoPoster.addEventListener('click', playEventVideo);
    videoPoster.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        playEventVideo();
      }
    });
  }

  /* ---------- Work portfolio filters ---------- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var workCards = document.querySelectorAll('.work-card[data-category]');
  if (filterBtns.length && workCards.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var filter = btn.getAttribute('data-filter');
        workCards.forEach(function (card) {
          var match = filter === 'all' || card.getAttribute('data-category') === filter;
          card.classList.toggle('is-hidden', !match);
        });
      });
    });
  }

  /* ---------- Photo sliders ---------- */
  document.querySelectorAll('[data-slider]').forEach(function (slider) {
    var track = slider.querySelector('.img-slider-track');
    var slides = slider.querySelectorAll('.img-slider-track img');
    var prevBtn = slider.querySelector('.slider-prev');
    var nextBtn = slider.querySelector('.slider-next');
    var currentEl = slider.querySelector('[data-slider-current]');
    var totalEl = slider.querySelector('[data-slider-total]');
    var card = slider.closest('.work-card');
    var captionEl = card && card.querySelector('[data-slider-caption]');
    var total = slides.length;
    var index = 0;

    if (totalEl) totalEl.textContent = String(total);

    function render() {
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      if (currentEl) currentEl.textContent = String(index + 1);
      if (captionEl) captionEl.textContent = slides[index].getAttribute('data-caption') || '';
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        index = (index - 1 + total) % total;
        render();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        index = (index + 1) % total;
        render();
      });
    }
  });

  /* ---------- FAQ accordion ---------- */
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var question = item.querySelector('.faq-question');
    question.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      faqItems.forEach(function (other) {
        other.classList.remove('open');
        other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Contact form (front-end only demo) ---------- */
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');

  if (form && status) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      status.textContent = "Thanks — your request has been received. We'll be in touch shortly.";
      status.classList.add('visible');
      form.reset();
      status.setAttribute('tabindex', '-1');
      status.focus();
    });
  }
})();
