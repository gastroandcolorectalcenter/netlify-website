/**
 * FAQ Accordion
 * Handle FAQ accordion functionality
 */

(function() {
  'use strict';

  // ==========================================
  // FAQ ACCORDION
  // ==========================================
  
  const faqItems = document.querySelectorAll('.faq-item');
  
  if (faqItems.length > 0) {
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      
      if (question && answer) {
        // Initial state
        answer.style.maxHeight = '0px';
        answer.style.overflow = 'hidden';
        answer.style.transition = 'max-height 0.3s ease';
        
        question.addEventListener('click', () => {
          const isExpanded = question.getAttribute('aria-expanded') === 'true';
          
          // Close all other FAQs (optional - comment out for multi-open)
          faqItems.forEach(otherItem => {
            if (otherItem !== item) {
              const otherQuestion = otherItem.querySelector('.faq-question');
              const otherAnswer = otherItem.querySelector('.faq-answer');
              
              if (otherQuestion && otherAnswer) {
                otherQuestion.setAttribute('aria-expanded', 'false');
                otherAnswer.hidden = true;
                otherAnswer.style.maxHeight = '0px';
                otherItem.classList.remove('active');
              }
            }
          });
          
          // Toggle current FAQ
          if (isExpanded) {
            // Close
            question.setAttribute('aria-expanded', 'false');
            answer.hidden = true;
            answer.style.maxHeight = '0px';
            item.classList.remove('active');
          } else {
            // Open
            question.setAttribute('aria-expanded', 'true');
            answer.hidden = false;
            answer.style.maxHeight = answer.scrollHeight + 'px';
            item.classList.add('active');
          }
        });
        
        // Keyboard support
        question.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            question.click();
          }
        });
      }
    });
  }

  // ==========================================
  // DEEP LINK TO FAQ
  // ==========================================
  
  /**
   * Open FAQ if URL has hash matching FAQ ID
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      const targetFaq = document.querySelector(`[data-faq-id="${hash}"]`);
      
      if (targetFaq) {
        const question = targetFaq.querySelector('.faq-question');
        if (question) {
          setTimeout(() => {
            question.click();
            targetFaq.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }
      }
    }
  });

})();