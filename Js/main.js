let scrollTriggered = true;
    let currentSection = 'hero';
    let scrollPosition = 0;
    let totalPageHeight = 0;
    const sectionOrder = ['hero', 'square-plate', 'round-plate', 'deep-shape', 'tray', 'sustainable', 'sustainable2', 'core-values', 'featured-products', 'industries', 'business', 'events', 'testimonials', 'blog', 'footer'];

    // Initialize AOS
    document.addEventListener('DOMContentLoaded', () => {
      AOS.init({
        duration: 800,
        once: true
      });

      // Calculate total page height
      totalPageHeight = sectionOrder.length * window.innerHeight;
    });

    // Enhanced Video Autoplay with Multiple Fallbacks
    function initializeVideo() {
      const video = document.getElementById('hero-video');
      if (!video) return;

      // Set video properties
      video.muted = true;
      video.autoplay = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute('webkit-playsinline', '');
      video.setAttribute('playsinline', '');

      // Multiple play attempts
      const attemptPlay = () => {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('Video is playing successfully');
          }).catch(error => {
            console.log('Video autoplay failed:', error);
            // Try again after user interaction
            document.addEventListener('click', () => {
              video.play().catch(e => console.log('Manual play failed:', e));
            }, { once: true });

            document.addEventListener('touchstart', () => {
              video.play().catch(e => console.log('Touch play failed:', e));
            }, { once: true });
          });
        }
      };

      // Try to play immediately
      attemptPlay();

      // Try again after a short delay
      setTimeout(attemptPlay, 1000);

      // Try on various events
      ['loadeddata', 'canplay', 'canplaythrough'].forEach(event => {
        video.addEventListener(event, attemptPlay, { once: true });
      });
    }

    // Load navbar
    document.addEventListener('DOMContentLoaded', () => {
      fetch('./navbar.html')
        .then(r => r.text())
        .then(html => {
          document.getElementById('navbar-container').innerHTML = html;
          setupDropdowns();
        })
        .catch(() => {
          // Create a simple navbar if fetch fails
          document.getElementById('navbar-container').innerHTML = `
            <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top">
              <div class="container-fluid">
                <a class="navbar-brand fw-bold text-success" href="#">Aumekaa</a>
                <div class="navbar-nav ms-auto">
                  <a class="nav-link" href="#hero">Home</a>
                  <a class="nav-link" href="#products">Products</a>
                  <a class="nav-link" href="#about">About</a>
                  <a class="nav-link" href="#contact">Contact</a>
                </div>
              </div>
            </nav>
          `;
        });

      // Initialize video
      initializeVideo();
    });

    // Enhanced Parallax Navigation System with upward scroll only
    function navigateToSection(targetSection) {
      if (currentSection === targetSection || scrollTriggered) return;

      scrollTriggered = true;

      // Get current section index and target section index
      const currentIndex = sectionOrder.indexOf(currentSection);
      const targetIndex = sectionOrder.indexOf(targetSection);

      // Update navigation dots
      updateNavigationDots(targetSection);

      // Only allow upward parallax overlap effect
      if (targetIndex < currentIndex) {
        // Upward navigation with parallax overlapping
        upwardTransitionParallax(currentSection, targetSection);
      } else {
        // Forward navigation - simple transition without overlap
        forwardTransitionSimple(currentSection, targetSection);
      }
    }

    function upwardTransitionParallax(fromSection, toSection) {

      // Add z-index styles dynamically
      currentSectionEl.style.zIndex = "1";
      targetSectionEl.style.zIndex = "9999";
      Array.from(currentSectionEl.querySelectorAll('*')).forEach(el => el.style.zIndex = "1");
      Array.from(targetSectionEl.querySelectorAll('*')).forEach(el => el.style.zIndex = "10000");

      const currentSectionEl = document.getElementById(`${fromSection}-section`);
      const targetSectionEl = document.getElementById(`${toSection}-section`);

      // Reset background text for current plate section
      if (isPlateSection(fromSection)) {
        const currentBackgroundText = document.getElementById(`${fromSection}-background-text`);
        if (currentBackgroundText) {
          currentBackgroundText.style.animation = 'none';
          currentBackgroundText.style.opacity = '0';
        }
      }

      // Fix the previous section in place
      currentSectionEl.classList.remove('current');
      currentSectionEl.classList.add('fixed');

      // Bring target section up with overlap effect
      targetSectionEl.classList.remove('prev');
      targetSectionEl.classList.add('overlapping-up');

      setTimeout(() => {
        // Complete the transition
        currentSectionEl.classList.remove('fixed');
        currentSectionEl.classList.add('next');

        targetSectionEl.classList.remove('overlapping-up');
        targetSectionEl.classList.add('current');

        // Trigger background text animation for target plate sections
        if (isPlateSection(toSection)) {
          setTimeout(() => {
            const targetBackgroundText = document.getElementById(`${toSection}-background-text`);
            if (targetBackgroundText) {
              targetBackgroundText.style.animation = 'fadeInText 1.5s ease forwards';
              targetBackgroundText.style.opacity = '1';
            }
          }, 100);
        }

        // Reinitialize AOS for content sections
        if (!isPlateSection(toSection)) {
          AOS.refresh();
        }

        // Update current section and reset scroll trigger

        // Clean z-index override
        targetSectionEl.style.zIndex = "";
        currentSectionEl.style.zIndex = "";
        Array.from(currentSectionEl.querySelectorAll('*')).forEach(el => el.style.zIndex = "");
        Array.from(targetSectionEl.querySelectorAll('*')).forEach(el => el.style.zIndex = "");

        currentSection = toSection;
        scrollTriggered = false;
      }, 800);
    }

    function forwardTransitionSimple(fromSection, toSection) {
      const currentSectionEl = document.getElementById(`${fromSection}-section`);
      const targetSectionEl = document.getElementById(`${toSection}-section`);

      // Simple forward transition without overlap
      currentSectionEl.classList.remove('current');
      currentSectionEl.classList.add('prev');

      targetSectionEl.classList.remove('next');
      targetSectionEl.classList.add('current');

      // Apply plate animations for product sections
      if (isPlateSection(fromSection)) {
        const currentWrapper = document.querySelector(`#${fromSection}-section .plate-wrapper`);

        if (fromSection === 'square-plate') {
          currentWrapper.classList.add('fall-animation');
        } else {
          currentWrapper.classList.add('dive-animation');
        }

        // Reset background text animation
        const currentBackgroundText = document.getElementById(`${fromSection}-background-text`);
        if (currentBackgroundText) {
          currentBackgroundText.style.animation = 'none';
          currentBackgroundText.style.opacity = '0';
        }
      }

      setTimeout(() => {
        // Reset plate animations
        if (isPlateSection(fromSection)) {
          const currentWrapper = document.querySelector(`#${fromSection}-section .plate-wrapper`);
          currentWrapper.classList.remove('fall-animation');
          currentWrapper.classList.remove('dive-animation');
        }

        // Trigger background text animation for target plate sections
        if (isPlateSection(toSection)) {
          setTimeout(() => {
            const targetBackgroundText = document.getElementById(`${toSection}-background-text`);
            if (targetBackgroundText) {
              targetBackgroundText.style.animation = 'fadeInText 1.5s ease forwards';
              targetBackgroundText.style.opacity = '1';
            }
          }, 100);
        }

        // Reinitialize AOS for content sections
        if (!isPlateSection(toSection)) {
          AOS.refresh();
        }

        // Update current section and reset scroll trigger
        currentSection = toSection;
        scrollTriggered = false;
      }, 800);
    }

    function isPlateSection(sectionId) {
      return ['square-plate', 'round-plate', 'deep-shape', 'tray'].includes(sectionId);
    }

    function updateNavigationDots(activeSection) {
      // Remove active class from all dots
      document.querySelectorAll('.nav-dot').forEach(dot => {
        dot.classList.remove('active');
      });

      // Add active class to the current section's dot
      const activeDot = document.querySelector(`.nav-dot[data-section="${activeSection}"]`);
      if (activeDot) {
        activeDot.classList.add('active');
      }
    }

    // Handle scroll events with enhanced logic
    window.addEventListener('wheel', e => {
      if (scrollTriggered) return;

      const currentIndex = sectionOrder.indexOf(currentSection);

      // Calculate scroll position based on full page height
      const scrollDelta = e.deltaY;
      const sectionHeight = totalPageHeight / sectionOrder.length;

      scrollPosition += scrollDelta;
      scrollPosition = Math.max(0, Math.min(scrollPosition, totalPageHeight - window.innerHeight));

      if (e.deltaY > 10) {
        // Scroll down - go to next section
        const nextIndex = currentIndex + 1;
        if (nextIndex < sectionOrder.length) {
          navigateToSection(sectionOrder[nextIndex]);
        }
      } else if (e.deltaY < -10) {
        // Scroll up - go to previous section with parallax overlap
        const prevIndex = currentIndex - 1;
        if (prevIndex >= 0) {
          navigateToSection(sectionOrder[prevIndex]);
        }
      }
    }, { passive: true });

    // Navigation dots click handlers
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('.nav-dot').forEach((dot, index) => {
        dot.addEventListener('click', () => {
          navigateToSection(sectionOrder[index]);
        });
      });
    });

    // Cart functionality
    function closeCart() {
      document.getElementById('cart-sidebar').classList.remove('open');
    }

    // Setup dropdowns after navbar is loaded
    function setupDropdowns() {
      const productsDropdown = document.getElementById('products-dropdown-container');
      const aboutDropdown = document.getElementById('about-dropdown-container');
      const productsTrigger = document.getElementById('products-tab-trigger');
      const aboutTrigger = document.getElementById('about-tab-trigger');
      const cartIcon = document.querySelector('.bi-cart');

      if (!productsTrigger || !aboutTrigger) return;

      let isProductsOpen = false;
      let isAboutOpen = false;

      // PRODUCTS DROPDOWN
      if (productsTrigger) {
        productsTrigger.addEventListener('click', function (e) {
          e.preventDefault();

          if (isProductsOpen) {
            productsDropdown.innerHTML = '';
            productsDropdown.style.display = 'none';
            isProductsOpen = false;
            return;
          }

          // Close About dropdown if open
          if (isAboutOpen) {
            aboutDropdown.innerHTML = '';
            aboutDropdown.style.display = 'none';
            isAboutOpen = false;
          }

          const rect = this.getBoundingClientRect();
          productsDropdown.style.top = `${rect.bottom + window.scrollY}px`;
          productsDropdown.style.left = `${rect.left + window.scrollX}px`;
          productsDropdown.style.display = 'block';

          productsDropdown.innerHTML = `
            <div class="container">
              <div class="tab-bar" id="tabBar">
                <div class="tab-highlight" id="tabHighlight"></div>
                <div class="tab active" data-tab="0">Sustainable Materials</div>
                <div class="tab" data-tab="1">Everyday Use</div>
                <div class="tab" data-tab="2">Industrial Solutions</div>
                <div class="tab" data-tab="3">Handicrafts</div>
              </div>
              <div style="position: relative;">
                <div class="content-arrow"></div>
                <div class="content" id="content"></div>
              </div>
            </div>
          `;

          isProductsOpen = true;

          setTimeout(() => {
            const tabs = document.querySelectorAll('.tab');
            const highlight = document.getElementById('tabHighlight');
            const content = document.getElementById('content');

            const data = [
              {
                title: "Arreca Products",
                items: ["Compostable Cutlery", "Bamboo Products"],
                image: "./assets/Plate.png"
              },
              {
                title: "Drinkware",
                items: ["Tableware", "Flatware"],
                image: "./assets/round-plate.png"
              },
              {
                title: "Industrial Packing",
                items: ["Foodservice Packaging", "E-Commerce Packaging", "Cornstarch Bags"],
                image: "./assets/square-plate.png"
              },
              {
                title: "Tableware",
                items: ["Decor Items", "Gift Box"],
                image: "./assets/tray.png"
              }
            ];

            function updateHighlight(tab) {
              highlight.style.width = `${tab.offsetWidth}px`;
              highlight.style.left = `${tab.offsetLeft}px`;
            }

            function updateContent(index) {
              const d = data[index];
              content.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 24px;">
                  <img src="${d.image}" alt="Product" style="width: 80px; height: 80px; border-radius: 8px;">
                  <div style="text-align: left;">
                    <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">${d.title}</div>
                    <ul style="list-style: none; padding: 0; margin: 0; font-size: 15px; color: #444;">
                      ${d.items.map(item => `<li style="margin-bottom: 6px;">${item}</li>`).join('')}
                    </ul>
                  </div>
                </div>
              `;
            }

            tabs.forEach(tab => {
              tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                updateHighlight(tab);
                updateContent(parseInt(tab.dataset.tab));
              });
            });

            const activeTab = document.querySelector('.tab.active');
            updateHighlight(activeTab);
            updateContent(0);
          }, 0);
        });
      }

      // ABOUT DROPDOWN
      if (aboutTrigger) {
        aboutTrigger.addEventListener('click', function (e) {
          e.preventDefault();

          if (isAboutOpen) {
            aboutDropdown.innerHTML = '';
            aboutDropdown.style.display = 'none';
            isAboutOpen = false;
            return;
          }

          if (isProductsOpen) {
            productsDropdown.innerHTML = '';
            productsDropdown.style.display = 'none';
            isProductsOpen = false;
          }

          const rect = this.getBoundingClientRect();
          aboutDropdown.style.top = `${rect.bottom + window.scrollY}px`;
          aboutDropdown.style.left = `${rect.left + window.scrollX}px`;
          aboutDropdown.style.display = 'block';

          aboutDropdown.innerHTML = `
            <div class="custom-menu">
              <ul class="mb-0 p-0">
                <li>Who We Are</li>
                <li>Our Mission</li>
                <li>Sustainability Commitment</li>
              </ul>
            </div>
          `;

          isAboutOpen = true;
        });
      }

      // Close dropdowns on outside click
      document.addEventListener('click', function (event) {
        const isClickInsideProducts = productsDropdown.contains(event.target) || (productsTrigger && productsTrigger.contains(event.target));
        const isClickInsideAbout = aboutDropdown.contains(event.target) || (aboutTrigger && aboutTrigger.contains(event.target));

        if (!isClickInsideProducts && isProductsOpen) {
          productsDropdown.innerHTML = '';
          productsDropdown.style.display = 'none';
          isProductsOpen = false;
        }

        if (!isClickInsideAbout && isAboutOpen) {
          aboutDropdown.innerHTML = '';
          aboutDropdown.style.display = 'none';
          isAboutOpen = false;
        }
      });

      // Cart icon click handler
      if (cartIcon) {
        cartIcon.style.cursor = 'pointer';
        cartIcon.addEventListener('click', () => {
          document.getElementById('cart-sidebar').classList.toggle('open');
        });
      }
    }

    // Apply background text animation on page load
    document.addEventListener('DOMContentLoaded', () => {
      // Force apply the animation to all background texts
      setTimeout(() => {
        const backgroundTexts = document.querySelectorAll('.background-text');
        backgroundTexts.forEach(text => {
          text.style.animation = 'fadeInText 1.5s ease forwards';
          text.style.opacity = '1';
        });
      }, 500);
    });

    // Ensure background text is visible when navigating to a section
    function showBackgroundText(sectionId) {
      const backgroundText = document.getElementById(`${sectionId}-background-text`);
      if (backgroundText) {
        backgroundText.style.animation = 'fadeInText 1.5s ease forwards';
        backgroundText.style.opacity = '1';
      }
    }