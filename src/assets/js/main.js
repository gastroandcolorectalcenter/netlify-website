/**
 * Main JavaScript File
 * Core functionality for Dr. Shah Surgical Practice Website
 */

(function() {
  'use strict';

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================
  
  /**
   * Query selector helper
   */
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => parent.querySelectorAll(selector);

  /**
   * Add event listener helper
   */
  const on = (element, event, handler) => {
    if (element) {
      element.addEventListener(event, handler);
    }
  };

  /**
   * Debounce function
   */
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // ==========================================
  // HEADER SCROLL EFFECT
  // ==========================================
  
  const header = $('.site-header');
  
  if (header) {
    let lastScroll = 0;
    
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      
      // Add shadow on scroll
      if (currentScroll > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      lastScroll = currentScroll;
    };
    
    window.addEventListener('scroll', debounce(handleScroll, 10));
  }

  // ==========================================
  // FORM HANDLING
  // ==========================================
  
  /**
   * Handle form submissions (Formspree integration)
   */
  const handleFormSubmit = (form) => {
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton?.innerHTML;
    
    on(form, 'submit', async (e) => {
      e.preventDefault();
      
      // Disable submit button
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = `
          <svg class="spinner" width="20" height="20" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5"></circle>
          </svg>
          <span>Sending...</span>
        `;
      }
      
      try {
        const formData = new FormData(form);
        const action = form.getAttribute('action');
        
        const response = await fetch(action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          // Show success message
          form.style.display = 'none';
          const successMessage = form.parentElement.querySelector('.form-success');
          if (successMessage) {
            successMessage.hidden = false;
          }
          
          // Reset form
          form.reset();
          
          // Optional: Redirect after delay
          // setTimeout(() => {
          //   window.location.href = '/thank-you/';
          // }, 2000);
        } else {
          throw new Error('Form submission failed');
        }
      } catch (error) {
        console.error('Form submission error:', error);
        alert('Sorry, there was an error submitting the form. Please try again or contact us directly.');
      } finally {
        // Re-enable submit button
        if (submitButton && originalButtonText) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonText;
        }
      }
    });
  };
  
  // Initialize all forms
  const forms = $$('form[action*="formspree"]');
  forms.forEach(handleFormSubmit);

  // ==========================================
  // LAZY LOADING IMAGES
  // ==========================================
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });
    
    const images = $$('img[loading="lazy"]');
    images.forEach(img => imageObserver.observe(img));
  }

  // ==========================================
  // BACK TO TOP BUTTON
  // ==========================================
  
  const createBackToTop = () => {
    const button = document.createElement('button');
    button.className = 'back-to-top';
    button.setAttribute('aria-label', 'Back to top');
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    `;
    
    document.body.appendChild(button);
    
    // Show/hide button
    const toggleButton = () => {
      if (window.pageYOffset > 300) {
        button.classList.add('visible');
      } else {
        button.classList.remove('visible');
      }
    };
    
    window.addEventListener('scroll', debounce(toggleButton, 100));
    
    // Scroll to top on click
    on(button, 'click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  };
  
  createBackToTop();

  // ==========================================
  // EXTERNAL LINKS
  // ==========================================
  
  /**
   * Add target="_blank" to external links
   */
  const externalLinks = $$('a[href^="http"]');
  externalLinks.forEach(link => {
    if (!link.href.includes(window.location.hostname)) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });

  // ==========================================
  // ANIMATION ON SCROLL
  // ==========================================
  
  if ('IntersectionObserver' in window) {
    const animateOnScroll = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    // Add animation class to elements
    const elementsToAnimate = $$('.service-card, .feature-item, .hospital-card, .blog-card, .review-card');
    elementsToAnimate.forEach(el => animateOnScroll.observe(el));
  }

  // ==========================================
  // PRINT FUNCTIONALITY
  // ==========================================
  
  /**
   * Clean up page before printing
   */
  window.addEventListener('beforeprint', () => {
    // Hide unnecessary elements
    const hideElements = $$('.mobile-menu-toggle, .back-to-top, .share-buttons');
    hideElements.forEach(el => el.style.display = 'none');
  });
  
  window.addEventListener('afterprint', () => {
    // Restore elements
    const restoreElements = $$('.mobile-menu-toggle, .back-to-top, .share-buttons');
    restoreElements.forEach(el => el.style.display = '');
  });

})();

// ==========================================
// BACK TO TOP BUTTON STYLES (Inline)
// ==========================================

const backToTopStyles = document.createElement('style');
backToTopStyles.textContent = `
  .back-to-top {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 50px;
    height: 50px;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    opacity: 0;
    visibility: hidden;
    transform: translateY(100px);
    transition: all 0.3s ease;
    z-index: var(--z-fixed);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .back-to-top.visible {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
  
  .back-to-top:hover {
    background: var(--primary-dark);
    transform: translateY(-3px);
  }
  
  .back-to-top svg {
    width: 24px;
    height: 24px;
  }
  
  .spinner {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .spinner circle {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: 0;
    stroke-linecap: round;
  }
  
  .animate-in {
    animation: fadeInUp 0.6s ease forwards;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    .back-to-top {
      bottom: 1rem;
      right: 1rem;
      width: 45px;
      height: 45px;
    }
  }
`;
document.head.appendChild(backToTopStyles);