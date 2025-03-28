// This optional code is used to register a service worker.
// register() is not called by default.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.

// Update for better mobile compatibility, especially with ngrok
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/) ||
    // Allow ngrok URLs
    window.location.hostname.includes('.ngrok.io') ||
    window.location.hostname.includes('.ngrok-free.app')
);
export function register(config) {
  // Enable service worker registration in production or on ngrok
  if ((process.env.NODE_ENV === 'production' || window.location.hostname.includes('ngrok')) && 'serviceWorker' in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL || '.', window.location.href);
    
    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebook/create-react-app/issues/2374
      console.warn('Service worker registration skipped due to origin mismatch');
      return;
    }

    // Check if the app is already installed BEFORE adding event listeners
    const isAppInstalled = () => {
      return window.matchMedia('(display-mode: standalone)').matches || 
             window.matchMedia('(display-mode: fullscreen)').matches || 
             window.matchMedia('(display-mode: minimal-ui)').matches ||
             window.navigator.standalone === true;
    };

    // If already installed, don't set up the installation prompts
    if (isAppInstalled()) {
      console.log('App is already installed - skipping install prompts');
      
      // Still register the service worker for updates, but skip install logic
      window.addEventListener('load', () => {
        const swUrl = `${process.env.PUBLIC_URL || '.'}/service-worker.js`;
        if (isLocalhost) {
          checkValidServiceWorker(swUrl, config);
        } else {
          registerValidSW(swUrl, config);
        }
      });
      
      return;
    }

    window.addEventListener('load', () => {
      // Use relative path for ngrok compatibility
      const swUrl = `${process.env.PUBLIC_URL || '.'}/service-worker.js`;

      if (isLocalhost) {
        // This is running on localhost. Let's check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, config);

        // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service ' +
              'worker. To learn more, visit https://cra.link/PWA'
          );
        });
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl, config);
      }
    });

    // Add this event listener for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('beforeinstallprompt event fired!', e);
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event for later use
      window.deferredPrompt = e;
      // Optionally show your custom "Add to Home screen" UI
      showInstallPromotion();
    });

    // Track when the PWA is installed
    window.addEventListener('appinstalled', (evt) => {
      // Hide any "Add to Home screen" UI
      hideInstallPromotion();
      // Log the installation to analytics
      console.log('MediCare was installed');
      
      // Set a flag in localStorage to remember the app was installed
      localStorage.setItem('pwaInstalled', 'true');
    });
  } else {
    console.log('Service Worker registration skipped: Not in production or service workers not supported');
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              console.log(
                'New content is available and will be used when all ' +
                  'tabs for this page are closed. See https://cra.link/PWA.'
              );

              // Execute callback
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // At this point, everything has been precached.
              // It's the perfect time to display a
              // "Content is cached for offline use." message.
              console.log('Content is cached for offline use.');

              // Execute callback
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

// Utility functions for install prompts
function showInstallPromotion() {
  // This can be implemented to show a custom UI prompt to install the PWA
  // For now, just logging to console
  console.log('Install promotion shown');
}

function hideInstallPromotion() {
  // Hide the UI prompt
  console.log('Install promotion hidden');
} 