/**
 * ArtXFlow Bridge Content Script
 * Bridges window.postMessage from the ArtXFlow web app to the Chrome Extension service worker.
 */

(function () {
  const SOURCE_WEB = 'artxflow-web';
  const SOURCE_EXT = 'artxflow-extension';

  // Announce that extension is installed and ready
  function announceReady() {
    window.postMessage(
      {
        source: SOURCE_EXT,
        type: 'READY',
        version: '0.2.0',
      },
      '*',
    );
  }

  // Periodic announcement during page startup
  announceReady();
  const readyInterval = setInterval(announceReady, 1000);
  setTimeout(() => clearInterval(readyInterval), 5000);

  // Listen for requests from the ArtXFlow web application
  window.addEventListener('message', async (event) => {
    // Only accept messages intended for this extension
    if (event.source !== window || !event.data || event.data.source !== SOURCE_WEB) {
      return;
    }

    const { type, requestId, payload } = event.data;

    if (type === 'PING') {
      window.postMessage(
        {
          source: SOURCE_EXT,
          type: 'PONG',
          requestId,
          version: '0.2.0',
        },
        '*',
      );
      return;
    }

    function isExtensionContextValid() {
      try {
        return typeof chrome !== 'undefined' && Boolean(chrome.runtime && chrome.runtime.sendMessage && chrome.runtime.id);
      } catch {
        return false;
      }
    }

    if (type === 'CHECK_HASHNODE_LOGIN') {
      if (!isExtensionContextValid()) {
        window.postMessage(
          {
            source: SOURCE_EXT,
            type: 'CHECK_HASHNODE_LOGIN_RESPONSE',
            requestId,
            result: {
              loggedIn: false,
              error: 'Extension was reloaded in Chrome. Please refresh this ArtXFlow tab (Cmd+R / F5) to reconnect.',
            },
          },
          '*',
        );
        return;
      }

      try {
        const response = await chrome.runtime.sendMessage({
          type: 'CHECK_HASHNODE_LOGIN',
        });
        window.postMessage(
          {
            source: SOURCE_EXT,
            type: 'CHECK_HASHNODE_LOGIN_RESPONSE',
            requestId,
            result: response,
          },
          '*',
        );
      } catch (err) {
        window.postMessage(
          {
            source: SOURCE_EXT,
            type: 'CHECK_HASHNODE_LOGIN_RESPONSE',
            requestId,
            result: { loggedIn: false, error: err.message },
          },
          '*',
        );
      }
      return;
    }

    if (type === 'CHECK_MEDIUM_LOGIN') {
      if (!isExtensionContextValid()) {
        window.postMessage(
          {
            source: SOURCE_EXT,
            type: 'CHECK_MEDIUM_LOGIN_RESPONSE',
            requestId,
            result: {
              loggedIn: false,
              error: 'Extension was reloaded in Chrome. Please refresh this ArtXFlow tab (Cmd+R / F5) to reconnect.',
            },
          },
          '*',
        );
        return;
      }

      try {
        const response = await chrome.runtime.sendMessage({
          type: 'CHECK_MEDIUM_LOGIN',
        });
        window.postMessage(
          {
            source: SOURCE_EXT,
            type: 'CHECK_MEDIUM_LOGIN_RESPONSE',
            requestId,
            result: response,
          },
          '*',
        );
      } catch (err) {
        window.postMessage(
          {
            source: SOURCE_EXT,
            type: 'CHECK_MEDIUM_LOGIN_RESPONSE',
            requestId,
            result: { loggedIn: false, error: err.message },
          },
          '*',
        );
      }
      return;
    }

    if (type === 'PUBLISH_HASHNODE' || type === 'PUBLISH_MEDIUM') {
      if (!isExtensionContextValid()) {
        window.postMessage(
          {
            source: SOURCE_EXT,
            type: 'PUBLISH_RESPONSE',
            requestId,
            result: {
              success: false,
              error: 'Extension was reloaded in Chrome. Please refresh this ArtXFlow tab (Cmd+R / F5) to reconnect to the extension.',
            },
          },
          '*',
        );
        return;
      }

      try {
        const response = await chrome.runtime.sendMessage({
          type,
          payload,
        });

        window.postMessage(
          {
            source: SOURCE_EXT,
            type: 'PUBLISH_RESPONSE',
            requestId,
            result: response,
          },
          '*',
        );
      } catch (err) {
        const isContextError = (err?.message || '').includes('Extension context invalidated') || (err?.message || '').includes('sendMessage');
        window.postMessage(
          {
            source: SOURCE_EXT,
            type: 'PUBLISH_RESPONSE',
            requestId,
            result: {
              success: false,
              error: isContextError
                ? 'Extension was reloaded in Chrome. Please refresh this ArtXFlow tab (Cmd+R / F5) to reconnect to the extension.'
                : (err?.message || 'Extension communication error'),
            },
          },
          '*',
        );
      }
    }
  });
})();
