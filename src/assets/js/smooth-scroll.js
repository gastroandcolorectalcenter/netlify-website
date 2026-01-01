/**
 * Smooth Scroll
 * Smooth scrolling for anchor links
 */

(function() {
  'use strict';

  // ==========================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ==========================================
  
  /**
   * Smooth scroll to element
   */
  const smoothScrollTo = (target, offset = 80) => {
    const targetElement = document.querySelector(target);
    
    if (targetElement) {
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = targetPosition - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };
  
  /**
   * Handle anchor link clicks
   */
  const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      const target = document.querySelector(href);
      
      if (target) {
        e.preventDefault();
        
        // Update URL without triggering scroll
        if (history.pushState) {
          history.pushState(null, null, href);
        } else {
          location.hash = href;
        }
        
        // Scroll to target
        smoothScrollTo(href);
        
        // Focus target for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus();
      }
    });
  });
  
  /**
   * Scroll to hash on page load
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      // Small delay to ensure page is fully loaded
      setTimeout(() => {
        smoothScrollTo(window.location.hash);
      }, 100);
    }
  });
  
  // ==========================================
  // HANDLE DATA-SCROLL ATTRIBUTE
  // ==========================================
  
  /**
   * Links with data-scroll attribute
   * Used for navigation menu items
   */
  const scrollLinks = document.querySelectorAll('[data-scroll]');

scrollLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');

    // Only allow pure hash links like "#section"
    if (!href || !href.startsWith('#') || href.length === 1) {
      return;
    }

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});
})();
