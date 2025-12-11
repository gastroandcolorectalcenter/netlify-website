// ===Mobile menu toggle functionality===//
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', !isExpanded);
});

// Close mobile menu when clicking on nav links
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar')) {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
    }
});

// Handle keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
    }
});

// Smooth scroll for anchor links (if any)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

/* ================================
     FAQ ACCORDION
================================== */

document.addEventListener('DOMContentLoaded', () => {
  const faqSection = document.getElementById('faq');
  if (!faqSection) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          initFAQAccordion();
          obs.unobserve(faqSection);
        }
      });
    }, { threshold: 0.2 });
    observer.observe(faqSection);
  } else {
    initFAQAccordion();
  }
});

function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon = question.querySelector('svg path');

    question.addEventListener('click', () => toggleFAQ(item, faqItems, answer, icon));

    question.addEventListener('keypress', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        question.click();
      }
    });
  });

  window.addEventListener('resize', () => {
    clearTimeout(window._faqResizeTimeout);
    window._faqResizeTimeout = setTimeout(() => {
      document.querySelectorAll('.faq-item.active .faq-answer').forEach(answer => {
        answer.style.maxHeight = answer.scrollHeight + "px";
      });
    }, 250);
  });
}

function toggleFAQ(item, faqItems, answer, icon) {
  const isActive = item.classList.contains('active');

  faqItems.forEach(other => {
    if (other !== item) {
      other.classList.remove('active');
      const otherQ = other.querySelector('.faq-question');
      const otherA = other.querySelector('.faq-answer');
      const otherI = other.querySelector('svg path');
      otherA.style.maxHeight = 0;
      otherQ.setAttribute('aria-expanded', 'false');
      otherI.setAttribute("d", "M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"); // plus
    }
  });

  item.classList.toggle('active');

  // Defer layout read/write to avoid forced reflow
  requestAnimationFrame(() => {
    if (!isActive) {
      answer.style.maxHeight = answer.scrollHeight + "px";
      icon.setAttribute("d", "M19 13H5V11H19V13Z"); // minus
      item.querySelector('.faq-question').setAttribute('aria-expanded', 'true');
    } else {
      answer.style.maxHeight = 0;
      icon.setAttribute("d", "M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"); // plus
      item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    }
  });
}