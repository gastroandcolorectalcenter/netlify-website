// Inline for testing - move to script.js after verification
  (function() {
      const trigger = document.getElementById('disclaimerTrigger');
      const modal = document.getElementById('disclaimerModal');
      const closeBtn = document.getElementById('closeModal');
      
      // Open modal
      function openModal() {
          modal.classList.add('active');
          document.body.style.overflow = 'hidden';
          closeBtn.focus();
      }
      
      // Close modal
      function closeModal() {
          modal.classList.remove('active');
          document.body.style.overflow = '';
          trigger.focus();
      }
      
      // Event listeners
      trigger.addEventListener('click', openModal);
      closeBtn.addEventListener('click', closeModal);
      
      // Close on overlay click
      modal.addEventListener('click', function(e) {
          if (e.target === modal) {
              closeModal();
          }
      });
      
      // Close on Escape key
      document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape' && modal.classList.contains('active')) {
              closeModal();
          }
      });
  })();