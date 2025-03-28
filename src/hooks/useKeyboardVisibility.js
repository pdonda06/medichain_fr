import { useState, useEffect } from 'react';
import useResponsive from './useResponsive';

/**
 * Custom hook to detect virtual keyboard visibility on mobile devices
 * @returns {Object} Keyboard state information
 */
const useKeyboardVisibility = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const { isMobile, isTouch } = useResponsive();

  useEffect(() => {
    if (!isMobile || !isTouch) return;

    // Store original viewport height
    const originalHeight = window.innerHeight;
    setViewportHeight(originalHeight);

    // Function to check if keyboard is visible
    const detectKeyboard = () => {
      // If the window height significantly decreases, the keyboard is likely visible
      const heightDifference = originalHeight - window.innerHeight;
      
      if (heightDifference > 150) {
        setIsKeyboardVisible(true);
        setKeyboardHeight(heightDifference);
      } else {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      }
      
      setViewportHeight(window.innerHeight);
    };

    // Listen for resize events (iOS)
    window.addEventListener('resize', detectKeyboard);
    
    // For Android devices, use visualViewport if available
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', detectKeyboard);
    }

    // Additional focus/blur detection for inputs
    const handleFocus = (e) => {
      if (
        e.target.tagName === 'INPUT' || 
        e.target.tagName === 'TEXTAREA' || 
        e.target.tagName === 'SELECT'
      ) {
        // Check again after a short delay (for Android)
        setTimeout(detectKeyboard, 100);
      }
    };

    const handleBlur = (e) => {
      if (
        e.target.tagName === 'INPUT' || 
        e.target.tagName === 'TEXTAREA' || 
        e.target.tagName === 'SELECT'
      ) {
        setTimeout(() => {
          setIsKeyboardVisible(false);
          setKeyboardHeight(0);
          setViewportHeight(originalHeight);
        }, 100);
      }
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    return () => {
      window.removeEventListener('resize', detectKeyboard);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', detectKeyboard);
      }
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, [isMobile, isTouch]);

  return {
    isKeyboardVisible,
    keyboardHeight,
    viewportHeight,
    // Effective height is the viewport height minus keyboard height
    effectiveHeight: viewportHeight,
    // Function to scroll to an element when the keyboard is visible
    scrollToElement: (element) => {
      if (!element || !isKeyboardVisible) return;
      
      setTimeout(() => {
        if (element) {
          // Get element position relative to viewport
          const rect = element.getBoundingClientRect();
          
          // Check if element is below keyboard
          if (rect.bottom > viewportHeight - 20) {
            // Calculate how much to scroll
            const scrollAmount = rect.bottom - (viewportHeight - 20);
            
            // Scroll the page
            window.scrollBy({
              top: scrollAmount,
              behavior: 'smooth'
            });
          }
        }
      }, 300);
    }
  };
};

export default useKeyboardVisibility; 