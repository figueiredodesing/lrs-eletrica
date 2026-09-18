(function () {
  'use strict';

  /* ============================================
     CARROSSEL GENÉRICO REUTILIZÁVEL
     ============================================ */
  function createCarousel(root) {
    if (!root) return null;

    const slides = Array.from(root.querySelectorAll('[data-slide]'));
    const dotsWrap = root.querySelector('[data-dots]');
    const prevBtn = root.querySelector('[data-prev]');
    const nextBtn = root.querySelector('[data-next]');
    const autoplayMs = parseInt(root.dataset.autoplay, 10) || 0;

    if (!slides.length) return null;

    let current = Math.max(0, slides.findIndex((s) => s.classList.contains('is-active')));
    if (current < 0) current = 0;
    let timer = null;

    // Build dots
    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Ir para o slide ' + (i + 1));
        if (i === current) dot.classList.add('is-active');
        dot.addEventListener('click', () => goTo(i, true));
        dotsWrap.appendChild(dot);
      });
    }

    function render() {
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
      if (dotsWrap) {
        Array.from(dotsWrap.children).forEach((dot, i) => dot.classList.toggle('is-active', i === current));
      }
    }

    function goTo(index, userAction) {
      current = (index + slides.length) % slides.length;
      render();
      if (userAction) restartAutoplay();
    }

    function next(userAction) { goTo(current + 1, userAction); }
    function prev(userAction) { goTo(current - 1, userAction); }

    function startAutoplay() {
      if (!autoplayMs) return;
      stopAutoplay();
      timer = setInterval(() => next(false), autoplayMs);
    }
    function stopAutoplay() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    function restartAutoplay() { startAutoplay(); }

    if (nextBtn) nextBtn.addEventListener('click', () => next(true));
    if (prevBtn) prevBtn.addEventListener('click', () => prev(true));

    root.addEventListener('mouseenter', stopAutoplay);
    root.addEventListener('mouseleave', startAutoplay);

    render();
    startAutoplay();

    return { next, prev, goTo, startAutoplay, stopAutoplay };
  }

  /* ============================================
     HEADER: scroll state + menu mobile
     ============================================ */
  const header = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  const overlay = document.getElementById('overlay');
  const navLinks = Array.from(document.querySelectorAll('[data-nav]'));
  const backToTop = document.getElementById('backToTop');

  function toggleBackToTop() {
    if (!backToTop) return;
    if (window.scrollY > 400) backToTop.classList.add('is-visible');
    else backToTop.classList.remove('is-visible');
  }
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function onScroll() {
    if (window.scrollY > 12) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');

    toggleBackToTop();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function openMobileMenu() {
    nav.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    overlay.classList.add('is-active');
  }
  function closeMobileMenu() {
    nav.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    if (!contactPanel.classList.contains('is-open')) overlay.classList.remove('is-active');
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = nav.classList.contains('is-open');
      if (isOpen) closeMobileMenu(); else openMobileMenu();
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  /* ============================================
     CONTACT SLIDE PANEL
     ============================================ */
  const contactPanel = document.getElementById('contactPanel');
  const openContactBtn = document.getElementById('openContactPanel');
  const closeContactBtn = document.getElementById('closeContactPanel');

  function openContactPanel() {
    contactPanel.classList.add('is-open');
    contactPanel.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-active');
  }
  function closeContactPanel() {
    contactPanel.classList.remove('is-open');
    contactPanel.setAttribute('aria-hidden', 'true');
    if (!nav.classList.contains('is-open')) overlay.classList.remove('is-active');
  }

  if (openContactBtn) openContactBtn.addEventListener('click', openContactPanel);
  if (closeContactBtn) closeContactBtn.addEventListener('click', closeContactPanel);

  overlay.addEventListener('click', () => {
    closeMobileMenu();
    closeContactPanel();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
      closeContactPanel();
    }
  });

  /* ============================================
     SCROLL SPY — destaque do link ativo
     ============================================ */
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = '#' + entry.target.id;
            navLinks.forEach((link) => {
              link.classList.toggle('active', link.getAttribute('href') === id);
            });
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((section) => spy.observe(section));
  }

  /* ============================================
     MASCOTE INTERATIVO (parallax + clique)
     ============================================ */
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
      const activeMascot = heroSection.querySelector('.slide.is-active .mascot__img');
      if (!activeMascot) return;
      const rect = heroSection.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      const rotateY = relX * 14;
      const rotateX = relY * -10;
      const translateX = relX * 16;
      activeMascot.style.transform =
        'translate(' + translateX + 'px, 0) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
    });

    heroSection.addEventListener('mouseleave', () => {
      const activeMascot = heroSection.querySelector('.slide.is-active .mascot__img');
      if (activeMascot) activeMascot.style.transform = '';
    });

    heroSection.addEventListener('click', (e) => {
      const mascotImg = e.target.closest('.mascot__img');
      if (!mascotImg) return;
      const wrap = mascotImg.closest('.slide__mascot');
      if (!wrap) return;
      wrap.classList.remove('is-bouncing');
      // force reflow to restart the animation
      void wrap.offsetWidth;
      wrap.classList.add('is-bouncing');
    });
  }

  /* ============================================
     FORMULÁRIO DE CONTATO → WHATSAPP
     ============================================ */
  const WHATSAPP_NUMBER = '5533984217848';
  const contactForm = document.getElementById('contactForm');

  function validateField(field, testFn) {
    const wrapper = field.closest('.field');
    const valid = testFn(field.value.trim());
    wrapper.classList.toggle('is-invalid', !valid);
    return valid;
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nome = contactForm.querySelector('#cf-nome');
      const email = contactForm.querySelector('#cf-email');
      const telefone = contactForm.querySelector('#cf-telefone');
      const mensagem = contactForm.querySelector('#cf-mensagem');

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phonePattern = /^[\d\s()+-]{8,}$/;

      const validNome = validateField(nome, (v) => v.length >= 2);
      const validEmail = validateField(email, (v) => emailPattern.test(v));
      const validTelefone = validateField(telefone, (v) => phonePattern.test(v));
      const validMensagem = validateField(mensagem, (v) => v.length >= 3);

      if (!(validNome && validEmail && validTelefone && validMensagem)) {
        return;
      }

      const texto =
        'Olá! Meu nome é ' + nome.value.trim() + '.\n' +
        'E-mail: ' + email.value.trim() + '\n' +
        'Telefone: ' + telefone.value.trim() + '\n\n' +
        'Mensagem: ' + mensagem.value.trim();

      const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(texto);
      window.open(url, '_blank', 'noopener');

      contactForm.reset();
      closeContactPanel();
    });
  }

  /* ============================================
     FAQ — acordeão
     ============================================ */
  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ============================================
     RODAPÉ — ano dinâmico
     ============================================ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================
     INIT
     ============================================ */
  createCarousel(document.getElementById('heroCarousel'));
})();
