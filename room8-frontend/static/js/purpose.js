document.addEventListener('DOMContentLoaded', function() {
    const purposeContainer = document.querySelector('.purpose-container');
    const sections = document.querySelectorAll('.purpose-section');
    const navDots = document.querySelectorAll('.nav-dot');
    const body = document.body;
    
    let isScrolling = false;
    let currentSection = 0;
    
    // Initialize nav dots
    navDots[0].classList.add('active');
    
    // Hide header on first section
    updateNavVisibility();
    
    // Add intersection observer for animation triggers
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const section = entry.target;
          const sectionIndex = parseInt(section.id.replace('section', '')) - 1;
          
          // Activate animations
          activateAnimations(section);
          
          // Update current section
          currentSection = sectionIndex;
          
          // Update nav dots
          updateNavDots();
          
          // Show/hide header based on section
          updateNavVisibility();
        }
      });
    }, observerOptions);
    
    // Observe each section
    sections.forEach(section => {
      observer.observe(section);
    });
    
    // Function to activate animations in a section
    function activateAnimations(section) {
      const animatedElements = section.querySelectorAll('.fade-in, .slide-in, .scale-in, .bounce-in, .fade-in-up');
      
      animatedElements.forEach(element => {
        const delay = element.dataset.delay || 0;
        
        setTimeout(() => {
          element.classList.add('visible');
        }, delay * 1000);
      });
    }
    
    // Function to update nav dots
    function updateNavDots() {
      navDots.forEach((dot, index) => {
        if (index === currentSection) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }
    
    // Function to show/hide header based on section
    function updateNavVisibility() {
      if (currentSection === 0) {
        body.classList.add('hide-nav');
      } else {
        body.classList.remove('hide-nav');
      }
    }
    
    // Nav dot click event
    navDots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        scrollToSection(index);
      });
    });
    
    // Function to scroll to a specific section
    function scrollToSection(index) {
      if (isScrolling) return;
      
      isScrolling = true;
      currentSection = index;
      
      sections[index].scrollIntoView({ behavior: 'smooth' });
      updateNavDots();
      updateNavVisibility();
      
      setTimeout(() => {
        isScrolling = false;
      }, 1000);
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        if (currentSection < sections.length - 1) {
          scrollToSection(currentSection + 1);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        if (currentSection > 0) {
          scrollToSection(currentSection - 1);
        }
      }
    });
    
    // Wheel event for smoother scrolling
    purposeContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      
      if (isScrolling) return;
      
      if (e.deltaY > 0 && currentSection < sections.length - 1) {
        scrollToSection(currentSection + 1);
      } else if (e.deltaY < 0 && currentSection > 0) {
        scrollToSection(currentSection - 1);
      }
    }, { passive: false });
    
    // Touch events for mobile
    let touchStartY = 0;
    
    purposeContainer.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    purposeContainer.addEventListener('touchmove', (e) => {
      if (isScrolling) return;
      
      const touchY = e.touches[0].clientY;
      const diff = touchStartY - touchY;
      
      if (diff > 50 && currentSection < sections.length - 1) {
        scrollToSection(currentSection + 1);
      } else if (diff < -50 && currentSection > 0) {
        scrollToSection(currentSection - 1);
      }
    }, { passive: true });
  });