document.addEventListener("DOMContentLoaded", () => {
  // ------------------- NAVBAR CODE -------------------
  const header = document.querySelector('header');
  
  // Function to update navbar style based on scroll position
  function updateNavbarStyle() {
    // Check if we've scrolled past the hero section
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;
    
    const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
    
    if (window.scrollY > heroBottom - 80) { // 80px is navbar height
      // Past hero section - change colors for visibility
      header.classList.add('scrolled');
    } else {
      // In hero section - transparent style
      header.classList.remove('scrolled');
    }
  }
  
  // Run once on page load
  updateNavbarStyle();
  
  // Add scroll event listener
  window.addEventListener('scroll', updateNavbarStyle);
  
  // Mobile menu toggle - check if it exists first
  if (!document.querySelector('.mobile-menu-btn')) {
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = '<span></span><span></span><span></span>';
    const navRight = document.querySelector('.nav-right');
    if (navRight) {
      navRight.prepend(mobileMenuBtn);
    }
  }
  
  // Add click event to mobile menu button
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function() {
      const navLinks = document.querySelector('.nav-links');
      if (navLinks) {
        navLinks.classList.toggle('show');
      }
    });
  }

  // ------------------- BUBBLE ANIMATION CODE -------------------
  const centerBubble = document.getElementById("you");
  const users = document.querySelectorAll(".floating-bubble.user");
  const matchLine = document.querySelector(".match-line line");
  const matchZone = document.querySelector(".match-zone");

  // Only run animation code if match elements exist
  if (matchZone && centerBubble) {
    let animationTriggered = false;

    // Observer: triggers when matchZone comes into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animationTriggered) {
          animationTriggered = true;

          matchZone.classList.add("revealed");

          // Delay to allow DOM paint
          setTimeout(() => {
            animateBubbles();
          }, 300);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(matchZone);

    function animateBubbles() {
      const centerRect = centerBubble.getBoundingClientRect();
      const centerX = centerRect.left + centerRect.width / 2;
      const centerY = centerRect.top + centerRect.height / 2;
      
      // Track the match bubble for timing other animations
      let matchBubble = null;
      let lastRejectedAnimationTime = 0;

      users.forEach((user, index) => {
        const isMatch = user.classList.contains("match");

        const userRect = user.getBoundingClientRect();
        const startX = userRect.left + userRect.width / 2;
        const startY = userRect.top + userRect.height / 2;

        const dx = centerX - startX;
        const dy = centerY - startY;

        const moveX = dx * 0.8;
        const moveY = dy * 0.8;

        const animationStartTime = 700 * index;
        if (!isMatch) {
          lastRejectedAnimationTime = Math.max(lastRejectedAnimationTime, animationStartTime + 900);
        }

        setTimeout(() => {
          user.style.transition = "transform 0.4s ease-in";
          user.style.transform = `translate(${moveX}px, ${moveY}px)`;

          setTimeout(() => {
            if (isMatch) {
              matchBubble = user;
              user.innerText = "✔";
              user.classList.add("matched");
              centerBubble.classList.add("matched");

              const finalX = 47;
              const finalY = 250;

              user.style.transition = "transform 0.6s ease-out";
              user.style.transform = `translate(${finalX}px, ${finalY}px)`;

              // Draw the match line after the final position settles
              setTimeout(() => {
                drawMatchLine(centerBubble, user);
                
                // After line is drawn and animation completes, make rejected bubbles fly away
                setTimeout(() => {
                  flyAwayRejectedBubbles();
                  
                  // Add zoom effect after bubbles fly away
                  setTimeout(() => {
                    zoomInOnMatch(centerBubble, matchBubble);
                  }, 1200);
                }, 900); // After line animation completes
              }, 600);
            } else {
              user.innerText = "✖";
              user.classList.add("rejected");

              // Bounce back to original position
              user.style.transition = "transform 0.5s ease-out";
              user.style.transform = "translate(0, 0)";
            }
          }, 400);
        }, animationStartTime);
      });
    }

    function flyAwayRejectedBubbles() {
      const rejectedBubbles = document.querySelectorAll(".floating-bubble.rejected");
      
      // Make all bubbles fly away at the same time (removed the staggered delay)
      rejectedBubbles.forEach((bubble) => {
        // Generate random direction to fly away
        const randomAngle = Math.random() * Math.PI * 2; // Random angle in radians
        const distance = 1000; // How far to fly away
        
        const moveX = Math.cos(randomAngle) * distance;
        const moveY = Math.sin(randomAngle) * distance;
        
        bubble.style.transition = "transform 1.2s cubic-bezier(.17,.67,.83,.97), opacity 1s ease";
        bubble.style.transform = `translate(${moveX}px, ${moveY}px)`;
        bubble.style.opacity = "0";
      });
    }

    function zoomInOnMatch(centerBubble, matchBubble) {
      // First, ensure the match zone has position relative
      matchZone.style.position = "relative";
      
      // Get the midpoint between the two bubbles
      const centerRect = centerBubble.getBoundingClientRect();
      const matchRect = matchBubble.getBoundingClientRect();
      
      const centerX = centerRect.left + centerRect.width / 2;
      const centerY = centerRect.top + centerRect.height / 2;
      const matchX = matchRect.left + matchRect.width / 2;
      const matchY = matchRect.top + matchRect.height / 2;
      
      // Calculate the relative position within the match zone
      const matchZoneRect = matchZone.getBoundingClientRect();
      const relMidX = (centerX + matchX) / 2 - matchZoneRect.left;
      const relMidY = (centerY + matchY) / 2 - matchZoneRect.top;
      
      // Reduce the zoom scale to avoid covering text
      matchZone.style.transition = "transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
      matchZone.style.transformOrigin = `${relMidX}px ${relMidY}px`;
      matchZone.style.transform = "scale(1.15)";
      
      // Add a subtle glow effect to the matched bubbles
      centerBubble.style.transition = "box-shadow 1s ease";
      matchBubble.style.transition = "box-shadow 1s ease";
      centerBubble.style.boxShadow = "0 0 30px 10px rgba(40, 199, 111, 0.7)";
      matchBubble.style.boxShadow = "0 0 30px 10px rgba(40, 199, 111, 0.7)";
      
      // Make the SVG line glow as well
      const line = document.querySelector(".match-line line");
      if (line) {
        line.style.transition = "stroke-width 1s ease, stroke 1s ease";
        line.setAttribute("stroke-width", "5");
        line.setAttribute("stroke", "#28c76f");
      }
      
      // After a short delay, add sparkle emojis and the arrow with text box
      setTimeout(() => {
        addSparkles();
        addMatchLabel(matchBubble, matchZoneRect);
      }, 800);
    }
    
    function addSparkles() {
      // Number of sparkles to add
      const numSparkles = 20;
      
      // Create and add sparkles to match zone
      for (let i = 0; i < numSparkles; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle-emoji';
        sparkle.textContent = '✨';
        sparkle.style.position = 'absolute';
        
        // Generate random position for each sparkle
        const left = Math.random() * 90 + 5; // 5% to 95% of width
        const top = Math.random() * 90 + 5;  // 5% to 95% of height
        
        sparkle.style.left = `${left}%`;
        sparkle.style.top = `${top}%`;
        
        // Random size and opacity
        const size = Math.random() * 1.5 + 1; // 1em to 2.5em
        const opacity = Math.random() * 0.4 + 0.6; // 0.6 to 1.0
        
        sparkle.style.fontSize = `${size}em`;
        sparkle.style.opacity = opacity;
        
        // Add animation delay
        sparkle.style.animationDelay = `${Math.random() * 2}s`;
        
        // Add to match zone
        matchZone.appendChild(sparkle);
      }
    }
    
    function addMatchLabel(matchBubble, matchZoneRect) {
        // Create container for the label and arrow
        const labelContainer = document.createElement('div');
        labelContainer.className = 'match-label-container';
        
        // Create label element - no box, just text
        const label = document.createElement('div');
        label.className = 'match-label';
        label.textContent = 'Your Perfect Match!';
        label.style.fontSize = '13px'; // Make text smaller
        
        // Calculate positions
        const bubbleRect = matchBubble.getBoundingClientRect();
        const bubbleCenterX = bubbleRect.left - matchZoneRect.left + bubbleRect.width/2;
        const bubbleCenterY = bubbleRect.top - matchZoneRect.top + bubbleRect.height/2;
        
        // Position container further to the left of the match bubble
        labelContainer.style.position = 'absolute';
        labelContainer.style.left = `${bubbleCenterX - 300}px`; // Moved further left
        labelContainer.style.top = `${bubbleCenterY - 8}px`; // Slight vertical adjustment
        
        // Create SVG arrow with shorter length
        const svgNS = "http://www.w3.org/2000/svg";
        const arrow = document.createElementNS(svgNS, "svg");
        arrow.setAttribute("class", "match-arrow-svg");
        arrow.setAttribute("width", "110"); // Much shorter width
        arrow.setAttribute("height", "16"); // Smaller height
        arrow.setAttribute("style", "position: absolute; left: 130px; top: 6px;"); // Adjusted start position
        
        // Create the arrow line pointing to bubble - shorter line with gap on both ends
        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("d", "M0,8 L95,8"); // Shorter straight line
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "black");
        path.setAttribute("stroke-width", "1.5"); // Thinner line
        
        // Arrow head (smaller)
        const arrowHead = document.createElementNS(svgNS, "polygon");
        arrowHead.setAttribute("points", "91,4 101,8 91,12"); // Smaller arrowhead
        arrowHead.setAttribute("fill", "black");
        
        arrow.appendChild(path);
        arrow.appendChild(arrowHead);
        
        // Add elements to container
        labelContainer.appendChild(label);
        labelContainer.appendChild(arrow);
        
        // Add to match zone
        matchZone.appendChild(labelContainer);
        
        // Trigger animations
        setTimeout(() => {
          labelContainer.classList.add('visible');
        }, 100);
      }

    function drawMatchLine(fromEl, toEl) {
      const line = document.querySelector(".match-line line");
      if (!line) return;
      
      // Get SVG positioning right
      const matchZoneRect = matchZone.getBoundingClientRect();
      const svgElement = document.querySelector(".match-line");
      
      // Set SVG to cover the entire match zone
      if (svgElement) {
        svgElement.setAttribute("width", matchZoneRect.width);
        svgElement.setAttribute("height", matchZoneRect.height);
      }
      
      // Wait to ensure transforms have applied
      setTimeout(() => {
        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();
        
        // Adjust coordinates relative to the SVG/match-zone
        const startX = fromRect.left + fromRect.width/2 - matchZoneRect.left;
        const startY = fromRect.top + fromRect.height/2 - matchZoneRect.top;
        
        const endX = toRect.left + toRect.width/2 - matchZoneRect.left;
        const endY = toRect.top + toRect.height/2 - matchZoneRect.top;
        
        // Set initial position
        line.setAttribute("x1", startX);
        line.setAttribute("y1", startY);
        line.setAttribute("x2", startX);  // Start both points at the same position
        line.setAttribute("y2", startY);
        line.setAttribute("visibility", "visible");
        
        // Animate drawing the line
        let progress = 0;
        const duration = 800;
        const frameRate = 1000/60;
        const totalFrames = duration/frameRate;
        
        function animateLine() {
          progress += 1;
          const pct = progress/totalFrames;
          const easing = easeOutQuad(pct);  // Apply easing function
          
          const currentX = startX + (endX - startX) * easing;
          const currentY = startY + (endY - startY) * easing;
          
          line.setAttribute("x2", currentX);
          line.setAttribute("y2", currentY);
          
          if (progress < totalFrames) {
            requestAnimationFrame(animateLine);
          }
        }
        
        // Start animation
        requestAnimationFrame(animateLine);
      }, 100);
    }

    // Easing function for smoother animation
    function easeOutQuad(t) {
      return t * (2 - t);
    }
  }
  
  // Form submission handling for find_room8 form
  const room8Form = document.getElementById('room8Form');
  if (room8Form) {
    room8Form.addEventListener("submit", function(event) {
      event.preventDefault();
      
      // Simple validation
      let isValid = true;
      const requiredInputs = this.querySelectorAll('[required]');
      
      requiredInputs.forEach(input => {
        if (!input.value.trim()) {
          input.classList.add('invalid');
          isValid = false;
        } else {
          input.classList.remove('invalid');
        }
      });
      
      if (!isValid) {
        return;
      }
      
      // Show loading button state
      const button = document.querySelector(".submit-btn");
      if (button) {
        button.classList.add("loading");
      }
      
      // Simulate form processing
      setTimeout(() => {
        if (button) {
          button.classList.remove("loading");
        }
        
        // Show success message
        const formSuccess = document.getElementById('form-success');
        if (formSuccess) {
          room8Form.style.display = 'none';
          formSuccess.classList.add('visible');
        }
        
        // Show toast notification
        const toast = document.getElementById('toast');
        if (toast) {
          toast.classList.add("show");
          setTimeout(() => {
            toast.classList.remove("show");
          }, 3000);
        }
      }, 2000);
    });
  }
  
  console.log("DOM fully loaded - All scripts initialized");
});