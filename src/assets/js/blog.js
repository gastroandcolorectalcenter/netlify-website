/**
 * Blog JavaScript
 * Category filtering and blog-specific functionality
 * Only loaded on blog pages
 */

(function() {
  'use strict';

  // ==========================================
  // LANGUAGE TOGGLE
  // ==========================================
  
  const langButtons = document.querySelectorAll('.lang-btn');
  const blogPostContent = document.querySelector('.blog-post-content');
  
  if (langButtons.length > 0 && blogPostContent) {
    // Get saved language preference or default to English
    let currentLang = localStorage.getItem('preferredLanguage') || 'en';
    
    // Set initial language
    setLanguage(currentLang);
    
    langButtons.forEach(button => {
      button.addEventListener('click', () => {
        const lang = button.dataset.lang;
        setLanguage(lang);
        localStorage.setItem('preferredLanguage', lang);
      });
    });
    
    function setLanguage(lang) {
      currentLang = lang;
      
      // Update button states
      langButtons.forEach(btn => {
        if (btn.dataset.lang === lang) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      
      // Handle content sections with data-lang attribute (nested divs in markdown)
      const nestedLangSections = blogPostContent.querySelectorAll('[data-lang]');
      nestedLangSections.forEach(section => {
        const sectionLang = section.dataset.lang;
        if (sectionLang === lang) {
          section.style.display = '';
        } else {
          section.style.display = 'none';
        }
      });
      
      // Hide/show English content (everything except Nepali div)
      if (lang === 'ne') {
        // Hide all direct children of blog-post-content except divs with data-lang="ne"
        Array.from(blogPostContent.children).forEach(child => {
          if (child.dataset.lang === 'ne') {
            child.style.display = '';
          } else if (!child.dataset.lang) {
            // Hide English content (elements without data-lang)
            child.style.display = 'none';
          }
        });
      } else {
        // Show English content, hide Nepali
        Array.from(blogPostContent.children).forEach(child => {
          if (child.dataset.lang === 'ne') {
            child.style.display = 'none';
          } else if (!child.dataset.lang) {
            // Show English content
            child.style.display = '';
          }
        });
      }
      
      // Toggle Table of Contents based on language
      const tocElements = document.querySelectorAll('.table-of-contents[data-toc-lang]');
      tocElements.forEach(toc => {
        if (toc.dataset.tocLang === lang) {
          toc.style.display = '';
        } else {
          toc.style.display = 'none';
        }
      });
      
      // Update elements with data-lang-en and data-lang-ne attributes (title, excerpt)
      const translatableElements = document.querySelectorAll('[data-lang-en][data-lang-ne]');
      translatableElements.forEach(element => {
        const text = element.dataset[`lang${lang.charAt(0).toUpperCase() + lang.slice(1)}`];
        if (text) {
          if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.value = text;
          } else if (element.tagName === 'P') {
            element.textContent = text;
          } else {
            element.textContent = text;
          }
        }
      });
    }
  }

  // ==========================================
  // BLOG CATEGORY FILTERING
  // ==========================================
  
  const categoryButtons = document.querySelectorAll('.category-btn');
  const categoryGroups = document.querySelectorAll('.category-group');
  
  if (categoryButtons.length > 0 && categoryGroups.length > 0) {
    
    // Show initial category (all)
    const showCategory = (category) => {
      // Update button states
      categoryButtons.forEach(btn => {
        if (btn.dataset.category === category) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      
      // Show/hide category groups
      categoryGroups.forEach(group => {
        if (group.dataset.category === category) {
          group.style.display = 'block';
        } else {
          group.style.display = 'none';
        }
      });
      
      // Update URL without reload
      if (history.pushState && category !== 'all') {
        const newUrl = `${window.location.pathname}?category=${category}`;
        history.pushState({ category }, '', newUrl);
      } else if (category === 'all') {
        history.pushState({ category }, '', window.location.pathname);
      }
    };
    
    // Handle button clicks
    categoryButtons.forEach(button => {
      button.addEventListener('click', () => {
        const category = button.dataset.category;
        showCategory(category);
      });
    });
    
    // Check URL for category parameter on load
    window.addEventListener('load', () => {
      const urlParams = new URLSearchParams(window.location.search);
      const category = urlParams.get('category');
      
      if (category) {
        showCategory(category);
      } else {
        showCategory('all');
      }
    });
    
    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.category) {
        showCategory(e.state.category);
      } else {
        showCategory('all');
      }
    });
  }

  // ==========================================
  // SIDEBAR CATEGORY ACCORDION
  // ==========================================
  
  const sidebarCategoryLinks = document.querySelectorAll('.categories-widget .category-link');
  
  if (sidebarCategoryLinks.length > 0) {
    sidebarCategoryLinks.forEach(categoryLink => {
      categoryLink.addEventListener('click', (e) => {
        e.preventDefault();
        
        const categorySlug = categoryLink.dataset.category;
        const postsList = document.querySelector(`.category-posts-list[data-category-posts="${categorySlug}"]`);
        
        if (postsList) {
          // Toggle expanded state
          const isExpanded = postsList.classList.contains('expanded');
          
          // Close all other expanded categories
          document.querySelectorAll('.category-posts-list.expanded').forEach(list => {
            if (list !== postsList) {
              list.classList.remove('expanded');
              list.style.display = 'none';
            }
          });
          
          document.querySelectorAll('.category-link.expanded').forEach(link => {
            if (link !== categoryLink) {
              link.classList.remove('expanded');
            }
          });
          
          // Toggle current category
          if (isExpanded) {
            postsList.classList.remove('expanded');
            categoryLink.classList.remove('expanded');
            setTimeout(() => {
              postsList.style.display = 'none';
            }, 300);
          } else {
            postsList.style.display = 'block';
            // Trigger reflow for animation
            postsList.offsetHeight;
            postsList.classList.add('expanded');
            categoryLink.classList.add('expanded');
          }
        }
      });
    });
    
    // Auto-expand current category on page load
    const currentPostCategory = document.querySelector('.category-link.active');
    if (currentPostCategory) {
      const categorySlug = currentPostCategory.dataset.category;
      const postsList = document.querySelector(`.category-posts-list[data-category-posts="${categorySlug}"]`);
      
      if (postsList) {
        postsList.style.display = 'block';
        setTimeout(() => {
          postsList.classList.add('expanded');
          currentPostCategory.classList.add('expanded');
        }, 100);
      }
    }
  }

  // ==========================================
  // BLOG SEARCH (OPTIONAL)
  // ==========================================
  
  const blogSearchInput = document.querySelector('#blog-search');
  const blogCards = document.querySelectorAll('.blog-card');
  
  if (blogSearchInput && blogCards.length > 0) {
    blogSearchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      
      blogCards.forEach(card => {
        const title = card.querySelector('.blog-card-title')?.textContent.toLowerCase() || '';
        const excerpt = card.querySelector('.blog-card-excerpt')?.textContent.toLowerCase() || '';
        const category = card.querySelector('.blog-card-category')?.textContent.toLowerCase() || '';
        
        if (title.includes(searchTerm) || excerpt.includes(searchTerm) || category.includes(searchTerm)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // ==========================================
  // READING PROGRESS BAR
  // ==========================================
  
  const createReadingProgressBar = () => {
    const article = document.querySelector('.blog-post-content');
    
    if (!article) return;
    
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.innerHTML = '<div class="reading-progress-bar"></div>';
    document.body.appendChild(progressBar);
    
    const bar = progressBar.querySelector('.reading-progress-bar');
    
    // Update progress on scroll
    const updateProgress = () => {
      const articleTop = article.offsetTop;
      const articleHeight = article.offsetHeight;
      const scrollPosition = window.pageYOffset;
      const windowHeight = window.innerHeight;
      
      const progress = ((scrollPosition - articleTop + windowHeight) / articleHeight) * 100;
      const clampedProgress = Math.max(0, Math.min(100, progress));
      
      bar.style.width = `${clampedProgress}%`;
    };
    
    window.addEventListener('scroll', updateProgress);
    updateProgress();
  };
  
  if (document.querySelector('.blog-post-content')) {
    createReadingProgressBar();
  }

  // ==========================================
  // TABLE OF CONTENTS (AUTO-GENERATE)
  // ==========================================
  
  const createTableOfContents = () => {
    const article = document.querySelector('.blog-post-content');
    if (!article) return;
    
    const buildTocList = (headings, langPrefix) => {
      const tocList = document.createElement('ul');
      tocList.className = 'toc-list';

      let currentSublist = null;

      headings.forEach((heading, index) => {
        if (!heading.id) {
          heading.id = `${langPrefix}-heading-${index}`;
        }

        const link = document.createElement('a');
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent.replace(/#/g, '').trim();

        if (heading.tagName === 'H2') {
          const li = document.createElement('li');
          li.className = 'toc-item';

          const details = document.createElement('details');
          details.className = 'toc-group';

          const summary = document.createElement('summary');
          summary.appendChild(link);

          const sublist = document.createElement('ul');
          sublist.className = 'toc-sublist';

          details.appendChild(summary);
          details.appendChild(sublist);
          li.appendChild(details);
          tocList.appendChild(li);

          currentSublist = sublist;
          return;
        }

        if (!currentSublist) {
          return;
        }

        const subItem = document.createElement('li');
        subItem.className = heading.tagName === 'H4' ? 'toc-subitem toc-subitem--minor' : 'toc-subitem';
        subItem.appendChild(link);
        currentSublist.appendChild(subItem);
      });

      return tocList;
    };

    const getHeadings = (root, selector, includeTopLevel) => {
      const collected = [];
      Array.from(root.children).forEach(child => {
        if (!child.dataset.lang) {
          const headings = child.querySelectorAll(selector);
          headings.forEach(h => collected.push(h));

          if (includeTopLevel && selector.includes(child.tagName.toLowerCase())) {
            collected.push(child);
          }
        }
      });
      return collected;
    };

    const setupTocToggle = (tocContainer) => {
      const tocList = tocContainer.querySelector('.toc-list');
      const tocHeader = tocContainer.querySelector('h3');
      if (!tocList || !tocHeader) return;

      const collapsedHeight = parseInt(
        getComputedStyle(tocContainer).getPropertyValue('--toc-collapsed-height'),
        10
      ) || 220;

      if (tocList.scrollHeight <= collapsedHeight + 8) {
        return;
      }

      tocContainer.classList.add('toc-collapsed');

      const toggleButton = document.createElement('button');
      toggleButton.type = 'button';
      toggleButton.className = 'toc-toggle-btn';
      toggleButton.textContent = 'Show more';
      toggleButton.setAttribute('aria-expanded', 'false');

      const toggle = () => {
        const isCollapsed = tocContainer.classList.toggle('toc-collapsed');
        toggleButton.setAttribute('aria-expanded', String(!isCollapsed));
        toggleButton.textContent = isCollapsed ? 'Show more' : 'Show less';
      };

      toggleButton.addEventListener('click', toggle);
      tocContainer.appendChild(toggleButton);
    };

    // Create TOC for English content
    const englishHeadings = getHeadings(article, 'h2, h3, h4', true);
    const englishH2Count = englishHeadings.filter(heading => heading.tagName === 'H2').length;
    
    // Create TOC for Nepali content
    const nepaliDiv = article.querySelector('[data-lang="ne"]');
    const nepaliHeadings = nepaliDiv ? Array.from(nepaliDiv.querySelectorAll('h2, h3, h4')) : [];
    const nepaliH2Count = nepaliHeadings.filter(heading => heading.tagName === 'H2').length;
    
    // Create English TOC
    if (englishH2Count >= 3) {
      const tocContainer = document.createElement('div');
      tocContainer.className = 'table-of-contents';
      tocContainer.setAttribute('data-toc-lang', 'en');
      tocContainer.innerHTML = '<h3>Table of Contents</h3>';
      tocContainer.appendChild(buildTocList(englishHeadings, 'en'));
      
      // Insert TOC after first paragraph in English content
      const firstParagraph = Array.from(article.children).find(child => 
        child.tagName === 'P' && !child.dataset.lang
      );
      if (firstParagraph) {
        firstParagraph.after(tocContainer);
        setupTocToggle(tocContainer);
      }
    }
    
    // Create Nepali TOC
    if (nepaliH2Count >= 3 && nepaliDiv) {
      const tocContainer = document.createElement('div');
      tocContainer.className = 'table-of-contents';
      tocContainer.setAttribute('data-toc-lang', 'ne');
      tocContainer.style.display = 'none'; // Hidden by default
      tocContainer.innerHTML = '<h3>सामग्री तालिका</h3>';
      tocContainer.appendChild(buildTocList(nepaliHeadings, 'ne'));
      
      // Insert Nepali TOC after first paragraph in Nepali div
      const firstNepaliParagraph = nepaliDiv.querySelector('p');
      if (firstNepaliParagraph) {
        firstNepaliParagraph.after(tocContainer);
        setupTocToggle(tocContainer);
      }
    }
  };
  
  if (document.querySelector('.blog-post-content')) {
    createTableOfContents();
  }

  // ==========================================
  // COPY CODE BLOCKS
  // ==========================================
  
  const codeBlocks = document.querySelectorAll('pre code');
  
  codeBlocks.forEach(codeBlock => {
    const pre = codeBlock.parentElement;
    
    // Create copy button
    const button = document.createElement('button');
    button.className = 'copy-code-btn';
    button.textContent = 'Copy';
    
    pre.style.position = 'relative';
    pre.appendChild(button);
    
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(codeBlock.textContent);
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = 'Copy';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    });
  });

})();

// ==========================================
// BLOG-SPECIFIC STYLES (Inline)
// ==========================================

const blogStyles = document.createElement('style');
blogStyles.textContent = `
  .reading-progress {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: rgba(0, 0, 0, 0.1);
    z-index: var(--z-fixed);
  }
  
  .reading-progress-bar {
    height: 100%;
    background: var(--primary-color);
    transition: width 0.1s ease;
  }
  
  .copy-code-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.375rem 0.75rem;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: var(--radius-sm);
    font-size: var(--text-xs);
    cursor: pointer;
    transition: all var(--transition-fast);
  }
  
  .copy-code-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

if (document.querySelector('.blog-post-content') || document.querySelector('.blog-listing-page')) {
  document.head.appendChild(blogStyles);
}

// ==========================================
// DISCLAIMER POPUP
// ==========================================

const disclaimerOverlay = document.getElementById('disclaimerPopup');
const acceptBtn = document.getElementById('acceptDisclaimer');
const declineBtn = document.getElementById('declineDisclaimer');

if (disclaimerOverlay && acceptBtn && declineBtn) {
  const hasAcceptedDisclaimer = sessionStorage.getItem('disclaimerAccepted');
  
  if (!hasAcceptedDisclaimer) {
    document.body.classList.add('disclaimer-open');
    disclaimerOverlay.classList.remove('hidden');
  } else {
    disclaimerOverlay.classList.add('hidden');
    document.body.classList.remove('disclaimer-open');
  }
  
  acceptBtn.addEventListener('click', function() {
    sessionStorage.setItem('disclaimerAccepted', 'true');
    disclaimerOverlay.style.opacity = '0';
    
    setTimeout(() => {
      disclaimerOverlay.classList.add('hidden');
      document.body.classList.remove('disclaimer-open');
    }, 300);
  });
  
  declineBtn.addEventListener('click', function() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/blogs/';
    }
  });
  
  const disclaimerPopup = disclaimerOverlay.querySelector('.disclaimer-popup');
  if (disclaimerPopup) {
    disclaimerPopup.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }
}
