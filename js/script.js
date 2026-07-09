/* ============================================================
   MARK JOSHUA BALURAN — Portfolio Script
   Handles: Custom cursor, scroll reveals, counter animations,
   mobile nav, active link tracking, video lightbox
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ─── Accessibility: Check for reduced motion preference ───
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  // ─── CUSTOM CURSOR ───
  const cursor = document.querySelector('.cursor');
  if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    // Use smooth interpolation for a trailing effect
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateCursor() {
      // Smooth lerp (linear interpolation)
      const speed = 0.15;
      cursorX += (mouseX - cursorX) * speed;
      cursorY += (mouseY - cursorY) * speed;
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Expand cursor on interactive elements
    const hoverTargets = document.querySelectorAll(
      'a, button, .folder-card, .skill-item, .btn, input, textarea, .video-item'
    );
    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
    });
  }


  // ─── NAVBAR SCROLL EFFECT ───
  const navbar = document.getElementById('navbar');

  function handleNavbarScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll(); // Run once on load


  // ─── MOBILE HAMBURGER MENU ───
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
      // Prevent body scroll when menu is open
      document.body.style.overflow = navLinks.classList.contains('active')
        ? 'hidden'
        : '';
    });

    // Close menu when a nav link is clicked
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }


  // ─── ACTIVE NAVIGATION LINK ON SCROLL ───
  const sections = document.querySelectorAll('section[id]');
  const navLinkElements = document.querySelectorAll('.nav-links a');

  function updateActiveLink() {
    const scrollPos = window.scrollY + window.innerHeight / 3;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinkElements.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();


  // ─── SCROLL REVEAL ANIMATIONS (Intersection Observer) ───
  if (!prefersReducedMotion) {
    const revealElements = document.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-image'
    );

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // If reduced motion is preferred, make everything visible immediately
    document
      .querySelectorAll(
        '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-image'
      )
      .forEach((el) => el.classList.add('is-visible'));
  }


  // ─── COUNTER ANIMATION ───
  const counters = document.querySelectorAll('.stat-number[data-target]');

  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const counter = entry.target;
            const target = parseInt(counter.getAttribute('data-target'), 10);
            const duration = 2000; // 2 seconds
            const stepTime = 30;
            const totalSteps = duration / stepTime;
            const increment = target / totalSteps;
            let current = 0;

            function updateCounter() {
              current += increment;
              if (current < target) {
                counter.textContent = Math.floor(current) + '+';
                setTimeout(updateCounter, stepTime);
              } else {
                counter.textContent = target + '+';
              }
            }

            if (prefersReducedMotion) {
              counter.textContent = target + '+';
            } else {
              updateCounter();
            }

            counterObserver.unobserve(counter);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((c) => counterObserver.observe(c));
  }

  // ─── EXPANDABLE FOLDER PORTFOLIO ───
  const folderCards = document.querySelectorAll('.folder-card');
  const folderPanels = document.querySelectorAll('.folder-panel');
  const closeButtons = document.querySelectorAll('.folder-panel-close');

  function closeAllFolders() {
    folderCards.forEach(card => card.classList.remove('active'));
    folderPanels.forEach(panel => {
      if (panel.classList.contains('active')) {
        panel.classList.remove('active');
        // Stop any playing videos in the collapsed panel by resetting their src
        const iframes = panel.querySelectorAll('iframe');
        iframes.forEach(iframe => {
          const currentSrc = iframe.src;
          iframe.src = '';
          iframe.src = currentSrc;
        });
      }
    });
  }

  folderCards.forEach(card => {
    card.addEventListener('click', () => {
      const folderId = card.getAttribute('data-folder');
      const targetPanel = document.getElementById(folderId);

      if (card.classList.contains('active')) {
        // If already active, close it
        card.classList.remove('active');
        if (targetPanel) {
          targetPanel.classList.remove('active');
          // Reset iframes to stop videos
          const iframes = targetPanel.querySelectorAll('iframe');
          iframes.forEach(iframe => {
            const currentSrc = iframe.src;
            iframe.src = '';
            iframe.src = currentSrc;
          });
        }
      } else {
        // Close other open folders first
        closeAllFolders();

        // Open this one
        card.classList.add('active');
        if (targetPanel) {
          targetPanel.classList.add('active');
          
          // Smooth scroll to the folder panel
          setTimeout(() => {
            const navHeight = navbar ? navbar.offsetHeight : 0;
            const targetPosition = targetPanel.getBoundingClientRect().top + window.scrollY - navHeight - 20;
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }, 150); // slight delay to allow display: block to compute
        }
      }
    });
  });

  // Close folder panel via close button
  closeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllFolders();
    });
  });

  // ─── BACK TO TOP BUTTON ───
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  // ─── CONTACT FORM HANDLER ───
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const message = document.getElementById('form-message').value.trim();

      // Basic validation
      if (!name || !email || !message) {
        alert('Please fill in all fields.');
        return;
      }

      // Email format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
      }

      const formData = new FormData(contactForm);
      formData.set("access_key", "e5de19b9-cb43-42f9-a14c-a46ca970ae12");

      const originalHTML = submitBtn.innerHTML;
      submitBtn.textContent = "Sending...";
      submitBtn.disabled = true;
      submitBtn.style.opacity = "0.7";
      submitBtn.style.cursor = "not-allowed";

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: formData
        });

        const data = await response.json();

        if (response.ok) {
          alert("Success! Your message has been sent directly to my email.");
          contactForm.reset();
        } else {
          alert("Error: " + data.message);
        }

      } catch (error) {
        alert("Something went wrong. Please check your connection and try again.");
      } finally {
        submitBtn.innerHTML = originalHTML;
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
        submitBtn.style.cursor = "pointer";
      }
    });
  }


  // ─── SMOOTH SCROLL FOR ANCHOR LINKS ───
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const navHeight = navbar ? navbar.offsetHeight : 0;
        const targetPosition =
          targetElement.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      }
    });
  });


  // ─── PARALLAX EFFECT ON HERO DECORATIONS ───
  if (!prefersReducedMotion) {
    const decoCircle = document.querySelector('.deco-circle');
    const decoDots = document.querySelector('.deco-dots');
    const decoPlus = document.querySelector('.deco-plus');

    window.addEventListener(
      'scroll',
      () => {
        const scrollY = window.scrollY;
        if (scrollY < window.innerHeight) {
          // Only apply in hero viewport
          if (decoCircle) {
            decoCircle.style.transform = `translate(${scrollY * 0.08}px, ${scrollY * 0.12}px) rotate(${scrollY * 0.05}deg)`;
          }
          if (decoDots) {
            decoDots.style.transform = `translate(${scrollY * -0.05}px, ${scrollY * 0.08}px)`;
          }
          if (decoPlus) {
            decoPlus.style.transform = `translate(${scrollY * 0.06}px, ${scrollY * -0.1}px) rotate(${scrollY * 0.1}deg)`;
          }
        }
      },
      { passive: true }
    );
  }

  // ─── VIDEO LIGHTBOX ───
  const videoItems = document.querySelectorAll('.video-item[data-video-src]');
  const videoLightbox = document.getElementById('video-lightbox');
  const lightboxIframe = document.getElementById('lightbox-iframe');
  const lightboxClose = document.getElementById('lightbox-close');

  if (videoLightbox && lightboxIframe && lightboxClose) {
    videoItems.forEach((item) => {
      item.addEventListener('click', () => {
        const videoSrc = item.getAttribute('data-video-src');
        if (videoSrc) {
          lightboxIframe.src = videoSrc;
          videoLightbox.classList.add('active');
          videoLightbox.setAttribute('aria-hidden', 'false');
          // Reset custom cursor if needed
          const cursor = document.querySelector('.cursor');
          if (cursor) cursor.classList.remove('hovered');
        }
      });
    });

    const closeLightbox = () => {
      videoLightbox.classList.remove('active');
      videoLightbox.setAttribute('aria-hidden', 'true');
      lightboxIframe.src = '';
    };

    lightboxClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeLightbox();
    });

    // Close on click outside content
    videoLightbox.addEventListener('click', (e) => {
      if (e.target === videoLightbox) {
        closeLightbox();
      }
    });

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && videoLightbox.classList.contains('active')) {
        closeLightbox();
      }
    });
  }
});
