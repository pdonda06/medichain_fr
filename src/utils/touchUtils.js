/**
 * Utility functions for handling touch gestures and improving mobile interactions
 */

/**
 * Creates a swipe detector for a given element
 * @param {HTMLElement} element - The element to attach swipe detection to
 * @param {Object} handlers - Object containing swipe direction handlers
 * @param {Function} handlers.onSwipeLeft - Handler for left swipe
 * @param {Function} handlers.onSwipeRight - Handler for right swipe
 * @param {Function} handlers.onSwipeUp - Handler for up swipe
 * @param {Function} handlers.onSwipeDown - Handler for down swipe
 * @param {Object} options - Additional options
 * @param {number} options.threshold - Minimum distance for a swipe (default: 50px)
 * @param {number} options.restraint - Maximum perpendicular movement allowed (default: 100px)
 * @param {number} options.allowedTime - Maximum time allowed for swipe (default: 300ms)
 * @returns {Object} Object with detach method to remove event listeners
 */
export const detectSwipe = (element, handlers = {}, options = {}) => {
  if (!element) return { detach: () => {} };
  
  const { 
    onSwipeLeft, 
    onSwipeRight, 
    onSwipeUp, 
    onSwipeDown 
  } = handlers;
  
  const { 
    threshold = 50, 
    restraint = 100, 
    allowedTime = 300 
  } = options;
  
  let startX, startY, startTime;
  let distX, distY, elapsedTime;

  const touchStartHandler = (e) => {
    const touchObj = e.changedTouches[0];
    startX = touchObj.pageX;
    startY = touchObj.pageY;
    startTime = new Date().getTime();
    e.preventDefault();
  };

  const touchEndHandler = (e) => {
    const touchObj = e.changedTouches[0];
    distX = touchObj.pageX - startX;
    distY = touchObj.pageY - startY;
    elapsedTime = new Date().getTime() - startTime;

    if (elapsedTime <= allowedTime) {
      if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
        if (distX > 0 && onSwipeRight) {
          onSwipeRight(e);
        } else if (distX < 0 && onSwipeLeft) {
          onSwipeLeft(e);
        }
      } else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint) {
        if (distY > 0 && onSwipeDown) {
          onSwipeDown(e);
        } else if (distY < 0 && onSwipeUp) {
          onSwipeUp(e);
        }
      }
    }
    e.preventDefault();
  };

  element.addEventListener('touchstart', touchStartHandler, { passive: false });
  element.addEventListener('touchend', touchEndHandler, { passive: false });

  return {
    detach: () => {
      element.removeEventListener('touchstart', touchStartHandler);
      element.removeEventListener('touchend', touchEndHandler);
    }
  };
};

/**
 * Creates a pull-to-refresh handler for a scrollable container
 * @param {HTMLElement} element - The scrollable container element
 * @param {Function} onRefresh - Function to call when refresh is triggered
 * @param {Object} options - Additional options
 * @param {number} options.threshold - Pull distance required to trigger refresh (default: 80px)
 * @param {number} options.maxPull - Maximum pull distance (default: 120px)
 * @param {number} options.resistance - Pull resistance factor (default: 2.5)
 * @returns {Object} Object with detach method to remove event listeners
 */
export const enablePullToRefresh = (element, onRefresh, options = {}) => {
  if (!element || !onRefresh) return { detach: () => {} };
  
  const { 
    threshold = 80, 
    maxPull = 120, 
    resistance = 2.5 
  } = options;
  
  let startY, currentY;
  let refreshing = false;
  let pullDistance = 0;
  
  // Create indicator element
  const indicator = document.createElement('div');
  indicator.className = 'ptr-indicator';
  indicator.style.cssText = `
    position: absolute;
    left: 0;
    width: 100%;
    text-align: center;
    height: 40px;
    top: -40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
    transform: translateY(0);
    z-index: 1000;
    pointer-events: none;
  `;
  
  // Create spinner
  const spinner = document.createElement('div');
  spinner.className = 'ptr-spinner';
  spinner.style.cssText = `
    width: 24px;
    height: 24px;
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-top-color: #1976d2;
    border-radius: 50%;
    animation: ptr-rotate 0.8s linear infinite;
    opacity: 0;
    transition: opacity 0.2s ease;
  `;
  
  // Create animation style
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ptr-rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  
  document.head.appendChild(style);
  indicator.appendChild(spinner);
  element.parentNode.insertBefore(indicator, element);
  element.style.position = 'relative';
  
  const touchStartHandler = (e) => {
    if (refreshing) return;
    if (element.scrollTop <= 0) {
      startY = e.touches[0].pageY;
    }
  };
  
  const touchMoveHandler = (e) => {
    if (refreshing || !startY) return;
    
    currentY = e.touches[0].pageY;
    pullDistance = (currentY - startY) / resistance;
    
    if (pullDistance > 0 && element.scrollTop <= 0) {
      e.preventDefault();
      
      // Limit the pull distance
      pullDistance = Math.min(pullDistance, maxPull);
      
      // Update indicator
      indicator.style.transform = `translateY(${pullDistance}px)`;
      spinner.style.opacity = pullDistance / threshold;
      spinner.style.transform = `rotate(${pullDistance * 2}deg)`;
    }
  };
  
  const touchEndHandler = (e) => {
    if (!startY || refreshing) {
      startY = null;
      return;
    }
    
    if (pullDistance >= threshold) {
      // Trigger refresh
      refreshing = true;
      
      // Animate indicator to a fixed position
      indicator.style.transform = 'translateY(50px)';
      spinner.style.opacity = '1';
      
      // Call the onRefresh function
      Promise.resolve(onRefresh())
        .finally(() => {
          // Reset after refresh completes
          setTimeout(() => {
            indicator.style.transform = 'translateY(0)';
            spinner.style.opacity = '0';
            
            // Reset variables after animation
            setTimeout(() => {
              refreshing = false;
              pullDistance = 0;
            }, 200);
          }, 300);
        });
    } else {
      // Reset if threshold not reached
      indicator.style.transform = 'translateY(0)';
      spinner.style.opacity = '0';
    }
    
    startY = null;
    pullDistance = 0;
  };
  
  element.addEventListener('touchstart', touchStartHandler, { passive: true });
  element.addEventListener('touchmove', touchMoveHandler, { passive: false });
  element.addEventListener('touchend', touchEndHandler, { passive: true });
  
  return {
    detach: () => {
      element.removeEventListener('touchstart', touchStartHandler);
      element.removeEventListener('touchmove', touchMoveHandler);
      element.removeEventListener('touchend', touchEndHandler);
      indicator.parentNode.removeChild(indicator);
      style.parentNode.removeChild(style);
    }
  };
};

/**
 * Provides momentum scrolling behavior for touch interactions
 * @param {HTMLElement} element - The scrollable container element
 * @param {Object} options - Additional options
 * @param {number} options.multiplier - Scrolling speed multiplier (default: 0.8)
 * @param {number} options.maxVelocity - Maximum scrolling velocity (default: 50)
 * @param {number} options.deceleration - Deceleration rate (default: 0.95)
 * @returns {Object} Object with detach method to remove event listeners
 */
export const enableMomentumScroll = (element, options = {}) => {
  if (!element) return { detach: () => {} };
  
  const { 
    multiplier = 0.8, 
    maxVelocity = 50, 
    deceleration = 0.95 
  } = options;
  
  let isScrolling = false;
  let lastY = 0;
  let velocity = 0;
  let rafId = null;
  
  const touchStartHandler = (e) => {
    isScrolling = false;
    lastY = e.touches[0].pageY;
    velocity = 0;
    
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
  
  const touchMoveHandler = (e) => {
    const currentY = e.touches[0].pageY;
    const deltaY = lastY - currentY;
    
    // Update velocity
    velocity = deltaY * multiplier;
    
    // Cap velocity at maximum
    velocity = Math.min(Math.max(velocity, -maxVelocity), maxVelocity);
    
    // Update last position
    lastY = currentY;
    
    // Mark that we're scrolling to prevent immediate animation in touchEnd
    isScrolling = true;
  };
  
  const touchEndHandler = () => {
    if (!isScrolling) return;
    
    // Apply momentum scrolling with deceleration
    const momentumScroll = () => {
      if (Math.abs(velocity) > 0.5) {
        element.scrollTop += velocity;
        velocity *= deceleration;
        rafId = requestAnimationFrame(momentumScroll);
      } else {
        isScrolling = false;
        velocity = 0;
        rafId = null;
      }
    };
    
    rafId = requestAnimationFrame(momentumScroll);
  };
  
  element.addEventListener('touchstart', touchStartHandler, { passive: true });
  element.addEventListener('touchmove', touchMoveHandler, { passive: true });
  element.addEventListener('touchend', touchEndHandler, { passive: true });
  
  return {
    detach: () => {
      element.removeEventListener('touchstart', touchStartHandler);
      element.removeEventListener('touchmove', touchMoveHandler);
      element.removeEventListener('touchend', touchEndHandler);
      
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    }
  };
};

/**
 * Helper for touch-friendly forms 
 * @param {HTMLFormElement} form - The form element to enhance
 * @returns {Object} Object with detach method to remove event listeners
 */
export const enhanceMobileForm = (form) => {
  if (!form) return { detach: () => {} };
  
  // Find all form inputs
  const inputs = form.querySelectorAll('input, textarea, select');
  const detachFunctions = [];
  
  // Process each input
  inputs.forEach(input => {
    // For iOS, prevent zoom on focus
    if (input.type === 'text' || input.type === 'email' || input.type === 'password' || input.tagName === 'TEXTAREA') {
      input.style.fontSize = '16px';
    }
    
    // Add label tap improvement (if input has id and label with for attribute)
    if (input.id) {
      const label = form.querySelector(`label[for="${input.id}"]`);
      if (label) {
        const labelClickHandler = (e) => {
          // Slight delay to improve touch response
          setTimeout(() => {
            input.focus();
          }, 10);
        };
        
        label.addEventListener('click', labelClickHandler);
        detachFunctions.push(() => label.removeEventListener('click', labelClickHandler));
      }
    }
    
    // Improve keyboards for different input types
    if (input.type === 'email') {
      input.setAttribute('inputmode', 'email');
      input.setAttribute('autocomplete', 'email');
    } else if (input.type === 'tel') {
      input.setAttribute('inputmode', 'tel');
      input.setAttribute('autocomplete', 'tel');
    } else if (input.type === 'search') {
      input.setAttribute('inputmode', 'search');
    } else if (input.type === 'number') {
      input.setAttribute('inputmode', 'decimal');
    }
    
    // Prevent document scrolling while typing in a field (prevents form shifting)
    const inputFocusHandler = () => {
      document.body.style.overflow = 'hidden';
    };
    
    const inputBlurHandler = () => {
      document.body.style.overflow = '';
    };
    
    input.addEventListener('focus', inputFocusHandler);
    input.addEventListener('blur', inputBlurHandler);
    
    detachFunctions.push(() => {
      input.removeEventListener('focus', inputFocusHandler);
      input.removeEventListener('blur', inputBlurHandler);
    });
  });
  
  // Handle form submission and improve touch response
  const submitHandler = (e) => {
    // If a submit button was pressed, add active class for feedback
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.classList.add('submitting');
      // Remove class after animation completes
      setTimeout(() => {
        submitButton.classList.remove('submitting');
      }, 300);
    }
  };
  
  form.addEventListener('submit', submitHandler);
  detachFunctions.push(() => form.removeEventListener('submit', submitHandler));
  
  return {
    detach: () => {
      detachFunctions.forEach(detach => detach());
    }
  };
};

/**
 * Enable better touch handling for tables
 * @param {HTMLElement} tableContainer - The table container element
 * @returns {Object} Object with detach method to remove event listeners
 */
export const enhanceMobileTable = (tableContainer) => {
  if (!tableContainer) return { detach: () => {} };
  
  // Enable horizontal swipe scrolling for tables
  let startX;
  let scrollLeft;
  
  const touchStartHandler = (e) => {
    startX = e.touches[0].pageX - tableContainer.offsetLeft;
    scrollLeft = tableContainer.scrollLeft;
  };
  
  const touchMoveHandler = (e) => {
    if (!startX) return;
    
    const x = e.touches[0].pageX - tableContainer.offsetLeft;
    const walk = (x - startX) * 1; // Scroll multiplier
    
    tableContainer.scrollLeft = scrollLeft - walk;
    
    // If we're scrolling horizontally, prevent vertical scroll
    if (Math.abs(walk) > 10) {
      e.preventDefault();
    }
  };
  
  const touchEndHandler = () => {
    startX = null;
  };
  
  tableContainer.addEventListener('touchstart', touchStartHandler, { passive: true });
  tableContainer.addEventListener('touchmove', touchMoveHandler, { passive: false });
  tableContainer.addEventListener('touchend', touchEndHandler, { passive: true });
  
  // Add visual indicator for scrollable tables
  const scrollIndicator = document.createElement('div');
  scrollIndicator.className = 'table-scroll-indicator';
  scrollIndicator.style.cssText = `
    position: absolute;
    right: 8px;
    bottom: 8px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  const arrow = document.createElement('div');
  arrow.style.cssText = `
    width: 10px;
    height: 10px;
    border-right: 2px solid rgba(0, 0, 0, 0.5);
    border-bottom: 2px solid rgba(0, 0, 0, 0.5);
    transform: rotate(-45deg);
  `;
  
  scrollIndicator.appendChild(arrow);
  
  // Only show indicator if table is wider than container
  const checkScrollable = () => {
    const isScrollable = tableContainer.scrollWidth > tableContainer.clientWidth;
    scrollIndicator.style.opacity = isScrollable ? 0.7 : 0;
    
    // Update arrow direction based on scroll position
    if (tableContainer.scrollLeft > 20) {
      arrow.style.transform = 'rotate(135deg)'; // Point left
    } else {
      arrow.style.transform = 'rotate(-45deg)'; // Point right
    }
  };
  
  // Position indicator and check scrollability
  const updateIndicator = () => {
    tableContainer.style.position = 'relative';
    tableContainer.appendChild(scrollIndicator);
    checkScrollable();
  };
  
  // Update on scroll
  const scrollHandler = () => {
    checkScrollable();
  };
  
  // Update on resize
  const resizeObserver = new ResizeObserver(checkScrollable);
  resizeObserver.observe(tableContainer);
  
  // Initial setup
  updateIndicator();
  tableContainer.addEventListener('scroll', scrollHandler, { passive: true });
  
  return {
    detach: () => {
      tableContainer.removeEventListener('touchstart', touchStartHandler);
      tableContainer.removeEventListener('touchmove', touchMoveHandler);
      tableContainer.removeEventListener('touchend', touchEndHandler);
      tableContainer.removeEventListener('scroll', scrollHandler);
      resizeObserver.disconnect();
      
      if (scrollIndicator.parentNode === tableContainer) {
        tableContainer.removeChild(scrollIndicator);
      }
    }
  };
}; 