/* NMRM Infotech — interactions */

// Mobile menu
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }

  // Scroll reveal
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach(r => io.observe(r));

  // Animated counters
  const counters = document.querySelectorAll('[data-counter]');
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.counter);
      const suffix = el.dataset.suffix || '';
      const duration = 1500;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target % 1 === 0
          ? Math.round(target * eased)
          : (target * eased).toFixed(1);
        el.textContent = val + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(c => counterIO.observe(c));

  // Contact form — EmailJS integration
  const form = document.querySelector('form[data-emailjs-form]');
  if (form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const status = form.querySelector('.form-status');
    const serviceId = form.dataset.serviceId;
    const templateId = form.dataset.templateId;
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Send Message →';

    const setStatus = (msg, color) => {
      if (!status) return;
      status.textContent = msg;
      status.style.color = color;
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Honeypot — silently drop if the hidden "website" field is filled (bot).
      const honeypot = form.querySelector('input[name="website"]');
      if (honeypot && honeypot.value.trim() !== '') {
        setStatus('Thank you — our team will be in touch within one business day.', 'var(--cyan)');
        form.reset();
        return;
      }

      // Guard against missing SDK or credentials
      if (typeof emailjs === 'undefined' || !serviceId || !templateId) {
        setStatus('Sorry, the message couldn’t be sent. Please email us directly at niraj@nmrminfotech.com.', '#FF6B6B');
        return;
      }

      // UI: disable submit while sending
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending…';
      }
      setStatus('Sending your message…', 'var(--text-muted)');

      try {
        await emailjs.sendForm(serviceId, templateId, form);
        setStatus('Thank you — our team will be in touch within one business day.', 'var(--cyan)');
        form.reset();
      } catch (err) {
        console.error('EmailJS error:', err);
        setStatus('Sorry, something went wrong. Please email us at niraj@nmrminfotech.com or call +91 98218 96800.', '#FF6B6B');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      }
    });
  }
});
