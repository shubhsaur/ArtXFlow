/**
 * ArtXFlow Companion Service Worker (Manifest V3)
 * Coordinates silent background tab automation for Hashnode publishing.
 */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Helper to wait until a tab finishes loading and settles on its destination URL
async function waitForEditorReady(tabId, timeoutMs = 30000) {
  const startTime = Date.now();
  let lastUrl = '';

  while (Date.now() - startTime < timeoutMs) {
    try {
      const tab = await chrome.tabs.get(tabId);
      lastUrl = tab.url || '';

      // 1. Check if redirected to login/signin
      if (lastUrl.includes('/login') || lastUrl.includes('/signin')) {
        return { ok: false, error: 'NOT_LOGGED_IN', url: lastUrl };
      }

      // 2. Wait if still on initial redirect
      if (
        lastUrl.includes('hn.new') ||
        lastUrl === 'about:blank' ||
        !lastUrl
      ) {
        await sleep(400);
        continue;
      }

      // 3. Tab has navigated to Hashnode domain (e.g. hashnode.com/drafts, hashnode.com/<blog>/new)
      if (lastUrl.includes('hashnode.com') || lastUrl.includes('hashnode.dev') || lastUrl.includes('hshno.de')) {
        try {
          const [docRes] = await chrome.scripting.executeScript({
            target: { tabId },
            func: () => document.readyState,
          });
          if (docRes?.result === 'complete' || docRes?.result === 'interactive' || tab.status === 'complete') {
            return { ok: true, url: lastUrl };
          }
        } catch {
          if (tab.status === 'complete') {
            return { ok: true, url: lastUrl };
          }
        }
      }

      await sleep(500);
    } catch {
      await sleep(400);
    }
  }

  // Graceful fallback: if lastUrl reached Hashnode domain, proceed into automator
  if (lastUrl.includes('hashnode.com') || lastUrl.includes('hashnode.dev')) {
    return { ok: true, url: lastUrl };
  }

  return { ok: false, error: 'TIMEOUT_REDIRECT', url: lastUrl };
}

// Helper to wait until Medium editor tab finishes loading and settles
async function waitForMediumEditorReady(tabId, timeoutMs = 30000) {
  const startTime = Date.now();
  let lastUrl = '';

  while (Date.now() - startTime < timeoutMs) {
    try {
      const tab = await chrome.tabs.get(tabId);
      lastUrl = tab.url || '';

      // 1. Check if redirected to login/signin
      if (
        lastUrl.includes('/signin') ||
        lastUrl.includes('/m/signin') ||
        lastUrl.includes('/m/connect') ||
        lastUrl.includes('accounts.google.com')
      ) {
        return { ok: false, error: 'NOT_LOGGED_IN', url: lastUrl };
      }

      // 2. Wait if still loading or on initial redirect
      if (
        lastUrl === 'about:blank' ||
        !lastUrl ||
        lastUrl.includes('story.new')
      ) {
        await sleep(400);
        continue;
      }

      // 3. Tab has settled on Medium domain
      if (lastUrl.includes('medium.com')) {
        try {
          const [docRes] = await chrome.scripting.executeScript({
            target: { tabId },
            func: () => document.readyState,
          });
          if (docRes?.result === 'complete' || docRes?.result === 'interactive' || tab.status === 'complete') {
            return { ok: true, url: lastUrl };
          }
        } catch {
          if (tab.status === 'complete') {
            return { ok: true, url: lastUrl };
          }
        }
      }

      await sleep(500);
    } catch {
      await sleep(400);
    }
  }

  if (lastUrl.includes('medium.com')) {
    return { ok: true, url: lastUrl };
  }

  return { ok: false, error: 'TIMEOUT_REDIRECT', url: lastUrl };
}

// Helper to determine if URL is a live published story on Medium
function isPublishedStoryUrl(url) {
  try {
    if (!url) return false;
    const parsed = new URL(url);
    const isMediumDomain = parsed.hostname.includes('medium.com') || parsed.hostname.endsWith('.pub');
    if (!isMediumDomain && !parsed.hostname.includes('medium')) return false;

    const path = parsed.pathname;
    if (
      path === '/' ||
      path === '' ||
      path.startsWith('/new-story') ||
      path.startsWith('/edit') ||
      path.startsWith('/me') ||
      path.startsWith('/settings') ||
      path.startsWith('/m/') ||
      path.includes('/edit') ||
      path.includes('/settings') ||
      path.includes('/publish') ||
      path.includes('/draft') ||
      path.startsWith('/tag/') ||
      path.startsWith('/topic/') ||
      path.startsWith('/search')
    ) {
      return false;
    }

    if (path.includes('/@') || path.startsWith('/p/') || path.split('/').filter(Boolean).length >= 1) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Helper to actively wait until Medium's final settings/preview page DOM is loaded
async function waitForMediumSettingsPage(tabId, timeoutMs = 30000) {
  const start = Date.now();
  console.log('[ArtXFlow ServiceWorker] Actively waiting for Medium final settings page...');

  // Allow navigation to begin
  await sleep(1000);

  while (Date.now() - start < timeoutMs) {
    try {
      const [evalRes] = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          const bodyText = (document.body?.innerText || '').toLowerCase();
          const hasSettings =
            bodyText.includes('draft settings') ||
            bodyText.includes('code of conduct') ||
            bodyText.includes('attribution & placement') ||
            bodyText.includes('select a publication') ||
            bodyText.includes('story preview');

          const allButtons = Array.from(
            document.querySelectorAll('button, [role="button"], a, div[role="button"], span[role="button"], input[type="button"], input[type="submit"]'),
          );

          // Find buttons outside top navbar whose text is "Publish"
          const publishBtns = allButtons.filter((b) => {
            if (b.closest('nav, header, [role="banner"]')) return false;
            const txt = (b.textContent || b.innerText || b.value || '').trim().toLowerCase();
            return txt === 'publish' || txt === 'publish now' || txt === 'publish story';
          });

          return {
            hasSettings,
            publishBtnCount: publishBtns.length,
            url: window.location.href,
          };
        },
      });

      const res = evalRes?.result;
      if (res?.hasSettings || res?.publishBtnCount > 0) {
        console.log(`[ArtXFlow ServiceWorker] Confirmed on settings page (${res.url}), buttons found: ${res.publishBtnCount}`);
        await sleep(1200);
        return { ok: true, url: res.url };
      }
    } catch {
      // Expected while page is navigating / document is reloading
    }

    await sleep(600);
  }

  return { ok: false, error: 'SETTINGS_PAGE_TIMEOUT' };
}

// Helper to locate and click the final confirmation Publish button on the settings page
async function clickFinalPublishButton(tabId, timeoutMs = 20000) {
  const start = Date.now();
  console.log('[ArtXFlow ServiceWorker] Locating and clicking final Publish button on settings page...');

  while (Date.now() - start < timeoutMs) {
    try {
      const [clickRes] = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          const allButtons = Array.from(
            document.querySelectorAll('button, [role="button"], a, div[role="button"], span[role="button"], input[type="button"], input[type="submit"]'),
          );

          // Filter out buttons inside top navigation
          const nonNav = allButtons.filter((b) => !b.closest('nav, header, [role="banner"]'));

          // 1. Find by exact text "publish", "publish now", or "publish story"
          let target = nonNav.find((b) => {
            const txt = (b.textContent || b.innerText || b.value || '').trim().toLowerCase();
            return txt === 'publish' || txt === 'publish now' || txt === 'publish story';
          });

          // 2. Find inside settings panel/container
          if (!target) {
            const panel = Array.from(document.querySelectorAll('div, section, aside')).find((el) => {
              const t = (el.innerText || '').toLowerCase();
              return t.includes('draft settings') || t.includes('code of conduct') || t.includes('attribution');
            });
            if (panel) {
              target = Array.from(panel.querySelectorAll('button, [role="button"], a')).find((b) => {
                const txt = (b.textContent || b.innerText || '').trim().toLowerCase();
                return txt.includes('publish') && !txt.includes('published');
              });
            }
          }

          // 3. Find by data-testid or data-action
          if (!target) {
            target = nonNav.find((b) => {
              const tid = (b.getAttribute('data-testid') || '').toLowerCase();
              const act = (b.getAttribute('data-action') || '').toLowerCase();
              return tid.includes('publish') || act.includes('publish');
            });
          }

          if (!target) {
            return { success: false, reason: 'BUTTON_NOT_FOUND' };
          }

          // Ensure we click the button element even if a child span was matched
          const clickable = target.closest('button, [role="button"]') || target;

          const isDisabled =
            clickable.disabled ||
            clickable.getAttribute('aria-disabled') === 'true' ||
            clickable.classList.contains('disabled');

          if (isDisabled) {
            return { success: false, reason: 'BUTTON_DISABLED' };
          }

          clickable.focus();
          try {
            clickable.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } catch {}

          const opts = { bubbles: true, cancelable: true, view: window };
          clickable.dispatchEvent(new PointerEvent('pointerover', opts));
          clickable.dispatchEvent(new MouseEvent('mouseover', opts));
          clickable.dispatchEvent(new PointerEvent('pointerdown', opts));
          clickable.dispatchEvent(new MouseEvent('mousedown', opts));
          clickable.dispatchEvent(new PointerEvent('pointerup', opts));
          clickable.dispatchEvent(new MouseEvent('mouseup', opts));
          clickable.click();
          clickable.dispatchEvent(new MouseEvent('click', opts));

          return {
            success: true,
            buttonText: (clickable.textContent || clickable.innerText || clickable.value || '').trim(),
          };
        },
      });

      const res = clickRes?.result;
      if (res?.success) {
        console.log(`[ArtXFlow ServiceWorker] Successfully clicked final Publish button ("${res.buttonText}")!`);
        return { ok: true };
      }

      console.log(`[ArtXFlow ServiceWorker] Final button not ready yet (${res?.reason}), retrying...`);
    } catch (clickErr) {
      console.warn('[ArtXFlow ServiceWorker] Click attempt caught error:', clickErr?.message);
    }

    await sleep(600);
  }

  return { ok: false, error: 'FINAL_PUBLISH_CLICK_TIMEOUT' };
}

// Helper to poll for the live published story URL
async function waitForMediumLiveStoryUrl(tabId, timeoutMs = 35000) {
  const start = Date.now();
  console.log('[ArtXFlow ServiceWorker] Polling for live published story URL...');

  while (Date.now() - start < timeoutMs) {
    try {
      const tab = await chrome.tabs.get(tabId);
      const currentUrl = tab.url || '';
      if (isPublishedStoryUrl(currentUrl)) {
        return currentUrl;
      }

      // Check inside page DOM for a story link or redirect
      try {
        const [domRes] = await chrome.scripting.executeScript({
          target: { tabId },
          func: () => {
            const current = window.location.href;
            const viewStoryLink = Array.from(document.querySelectorAll('a')).find((a) => {
              const href = a.getAttribute('href') || '';
              const txt = (a.innerText || '').toLowerCase();
              return (
                (txt.includes('story') || txt.includes('view') || txt.includes('read') || txt.includes('published')) &&
                !href.includes('/edit') &&
                !href.includes('/new-story') &&
                !href.includes('/settings') &&
                !href.includes('/publish')
              );
            });
            return {
              current,
              linkUrl: viewStoryLink?.href || null,
            };
          },
        });

        const data = domRes?.result;
        if (data?.linkUrl && isPublishedStoryUrl(data.linkUrl)) {
          return data.linkUrl;
        }
        if (data?.current && isPublishedStoryUrl(data.current)) {
          return data.current;
        }
      } catch {}
    } catch {}

    await sleep(1000);
  }
  return null;
}

// Listen for messages from ArtXFlow bridge content script or popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'FETCH_IMAGE_AS_DATA_URL') {
    (async () => {
      try {
        const { url } = message;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch image: HTTP ${res.status}`);
        const blob = await res.blob();
        const mimeType = blob.type || 'image/jpeg';
        const buffer = await blob.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        const dataUrl = `data:${mimeType};base64,${base64}`;
        sendResponse({ success: true, dataUrl, mimeType });
      } catch (err) {
        console.warn('[ArtXFlow ServiceWorker] Error fetching image:', err);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }

  if (message.type === 'CHECK_HASHNODE_LOGIN') {
    (async () => {
      let tabId = null;
      try {
        const tab = await chrome.tabs.create({ url: 'https://hn.new', active: false });
        tabId = tab.id;
        const result = await waitForEditorReady(tabId, 15000);
        await chrome.tabs.remove(tabId);
        tabId = null;

        if (!result.ok && result.error === 'NOT_LOGGED_IN') {
          sendResponse({ loggedIn: false });
        } else {
          sendResponse({ loggedIn: true });
        }
      } catch (err) {
        if (tabId) {
          try {
            await chrome.tabs.remove(tabId);
          } catch {}
        }
        sendResponse({ loggedIn: false, error: err.message });
      }
    })();
    return true; // Keep channel open for async response
  }

  if (message.type === 'PUBLISH_HASHNODE') {
    (async () => {
      let tabId = null;
      try {
        const { payload } = message;

        // Remember the current tab to return focus to ArtXFlow afterwards
        const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const originTabId = currentTab?.id;

        // 1. Create active tab so Chrome grants window focus and allows typing/selections
        const tab = await chrome.tabs.create({
          url: 'https://hn.new',
          active: true,
        });
        tabId = tab.id;

        // 2. Wait until tab settles on Hashnode destination URL
        const readyResult = await waitForEditorReady(tabId, 30000);
        if (!readyResult.ok) {
          await chrome.tabs.remove(tabId);
          tabId = null;

          if (readyResult.error === 'NOT_LOGGED_IN') {
            sendResponse({
              success: false,
              error: 'NOT_LOGGED_IN',
              message: 'You are not logged into Hashnode. Please open hashnode.com in Chrome and log in first.',
            });
            return;
          }

          sendResponse({
            success: false,
            error: 'TIMEOUT_REDIRECT',
            message: `Hashnode editor took too long to load (last URL: ${readyResult.url}). Please ensure you are logged in.`,
          });
          return;
        }

        // Allow React & client-side hydration
        await sleep(1500);

        // 3. Unfreeze requestAnimationFrame and visibilityState in the MAIN world
        try {
          await chrome.scripting.executeScript({
            target: { tabId },
            world: 'MAIN',
            func: () => {
              if (document.hidden) {
                window.requestAnimationFrame = function (callback) {
                  return setTimeout(() => callback(performance.now()), 16);
                };
                try {
                  Object.defineProperty(document, 'visibilityState', {
                    get: () => 'visible',
                    configurable: true,
                  });
                  Object.defineProperty(document, 'hidden', {
                    get: () => false,
                    configurable: true,
                  });
                  document.hasFocus = () => true;
                  document.dispatchEvent(new Event('visibilitychange'));
                } catch {}
              }
            },
          });
        } catch {}

        await sleep(500);

        // 4. Inject the automator script into the tab
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['hashnode-automator.js'],
        });

        // 5. Run the automator inside Hashnode editor DOM with robust error trapping
        let result = null;
        try {
          const executionResults = await chrome.scripting.executeScript({
            target: { tabId },
            func: async (article) => {
              try {
                if (typeof window.__runHashnodeAutomator !== 'function') {
                  return {
                    success: false,
                    error: 'Automator script failed to inject into Hashnode editor.',
                  };
                }
                return await window.__runHashnodeAutomator(article);
              } catch (innerErr) {
                return {
                  success: false,
                  error: innerErr?.message || 'Error inside automator execution.',
                };
              }
            },
            args: [payload],
          });

          result = executionResults?.[0]?.result;
        } catch (execErr) {
          result = {
            success: false,
            error: execErr?.message || 'Script execution failed.',
          };
        }

        console.log('[ArtXFlow ServiceWorker] Automator result:', JSON.stringify(result));

        // 6. Clean up automation tab ONLY if publication succeeded
        if (result?.success && tabId) {
          const idToClose = tabId;
          tabId = null;
          (async () => {
            try {
              await sleep(600);
              await chrome.tabs.remove(idToClose);
              if (originTabId) {
                await chrome.tabs.update(originTabId, { active: true });
              }
            } catch (closeErr) {
              console.warn('[ArtXFlow ServiceWorker] Tab close failed, retrying in 1s...', closeErr);
              try {
                await sleep(1000);
                await chrome.tabs.remove(idToClose);
                if (originTabId) {
                  await chrome.tabs.update(originTabId, { active: true });
                }
              } catch {}
            }
          })();
        }

        if (!result || !result.success) {
          const errorMessage =
            result?.message || result?.error || 'Hashnode automation could not complete publishing.';
          sendResponse({
            success: false,
            error: errorMessage,
            message: `${errorMessage} (The Hashnode tab has been kept open in Chrome for your review)`,
          });
          return;
        }

        sendResponse({
          success: true,
          publishedUrl: result.publishedUrl,
        });
      } catch (err) {
        // Do not auto-close tab on error to preserve state for inspection
        sendResponse({
          success: false,
          error: err.message || 'Unknown automation error occurred.',
        });
      }
    })();
    return true; // Keep channel open for async response
  }

  if (message.type === 'CHECK_MEDIUM_LOGIN') {
    (async () => {
      let tabId = null;
      try {
        const tab = await chrome.tabs.create({ url: 'https://medium.com/new-story', active: false });
        tabId = tab.id;
        const result = await waitForMediumEditorReady(tabId, 15000);
        await chrome.tabs.remove(tabId);
        tabId = null;

        if (!result.ok && result.error === 'NOT_LOGGED_IN') {
          sendResponse({ loggedIn: false });
        } else {
          sendResponse({ loggedIn: true });
        }
      } catch (err) {
        if (tabId) {
          try {
            await chrome.tabs.remove(tabId);
          } catch {}
        }
        sendResponse({ loggedIn: false, error: err.message });
      }
    })();
    return true; // Keep channel open for async response
  }

  if (message.type === 'PUBLISH_MEDIUM') {
    (async () => {
      let tabId = null;
      try {
        const { payload } = message;

        // Remember caller tab to return focus
        const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const originTabId = currentTab?.id;

        // 1. Create active tab so Chrome grants window focus and allows typing/selections
        const tab = await chrome.tabs.create({
          url: 'https://medium.com/new-story',
          active: true,
        });
        tabId = tab.id;

        // 2. Wait until tab settles on Medium editor URL
        const readyResult = await waitForMediumEditorReady(tabId, 30000);
        if (!readyResult.ok) {
          await chrome.tabs.remove(tabId);
          tabId = null;

          if (readyResult.error === 'NOT_LOGGED_IN') {
            sendResponse({
              success: false,
              error: 'NOT_LOGGED_IN',
              message: 'You are not logged into Medium. Please open medium.com in Chrome and log in first.',
            });
            return;
          }

          sendResponse({
            success: false,
            error: 'TIMEOUT_REDIRECT',
            message: `Medium editor took too long to load (last URL: ${readyResult.url}). Please ensure you are logged in.`,
          });
          return;
        }

        // Allow React & client-side hydration
        await sleep(1500);

        // 3. Inject the Medium automator script into the editor tab
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['medium-automator.js'],
        });

        // 4. Run Stage 1: Inject article content and click header Publish button
        console.log('[ArtXFlow ServiceWorker] Running Medium Stage 1 (Editor)...');
        let stage1Result = null;
        try {
          const execRes = await chrome.scripting.executeScript({
            target: { tabId },
            func: async (article) => {
              if (typeof window.__runMediumEditor !== 'function') {
                return {
                  success: false,
                  error: 'Medium automator script failed to inject into editor.',
                };
              }
              return await window.__runMediumEditor(article);
            },
            args: [payload],
          });
          stage1Result = execRes?.[0]?.result;
        } catch (stage1Err) {
          console.log('[ArtXFlow ServiceWorker] Stage 1 completed with navigation:', stage1Err?.message);
          // If page navigated immediately on clicking header Publish button, that's expected
          stage1Result = { success: true, phase: 'NAVIGATED' };
        }

        if (!stage1Result || !stage1Result.success) {
          const errorMessage =
            stage1Result?.message || stage1Result?.error || 'Medium editor could not complete.';
          sendResponse({
            success: false,
            error: errorMessage,
            message: `${errorMessage} (The Medium tab has been kept open in Chrome for your review)`,
          });
          return;
        }

        // 5. Actively wait until Medium reaches the Draft Settings page
        console.log('[ArtXFlow ServiceWorker] Actively waiting for Medium settings page to load...');
        const settingsRes = await waitForMediumSettingsPage(tabId, 30000);
        if (!settingsRes.ok) {
          sendResponse({
            success: false,
            error: 'SETTINGS_PAGE_TIMEOUT',
            message: 'Medium final settings page took too long to load. (The Medium tab has been kept open in Chrome for your review)',
          });
          return;
        }

        // 6. Locate and click the final confirmation Publish button on the settings page
        console.log('[ArtXFlow ServiceWorker] Clicking final Publish button on settings page...');
        const clickRes = await clickFinalPublishButton(tabId, 20000);
        if (!clickRes.ok) {
          sendResponse({
            success: false,
            error: 'FINAL_PUBLISH_FAILED',
            message: 'Could not click the final "Publish" button on the Medium settings page. (The Medium tab has been kept open in Chrome for your review)',
          });
          return;
        }

        // 7. Wait for live published story URL navigation
        console.log('[ArtXFlow ServiceWorker] Waiting for live published story URL navigation...');
        const liveUrl = await waitForMediumLiveStoryUrl(tabId, 35000);

        if (!liveUrl) {
          const finalTab = await chrome.tabs.get(tabId).catch(() => null);
          const current = finalTab?.url || '';
          sendResponse({
            success: false,
            error: 'URL_NOT_RESOLVED',
            message: `Medium story was submitted but live URL could not be confirmed (current: ${current}). Tab left open for review.`,
          });
          return;
        }

        console.log('[ArtXFlow ServiceWorker] Medium published successfully! URL:', liveUrl);

        // 9. Clean up automation tab ONLY if publication succeeded
        if (tabId) {
          const idToClose = tabId;
          tabId = null;
          (async () => {
            try {
              await sleep(600);
              await chrome.tabs.remove(idToClose);
              if (originTabId) {
                await chrome.tabs.update(originTabId, { active: true });
              }
            } catch (closeErr) {
              console.warn('[ArtXFlow ServiceWorker] Initial Medium tab close failed, retrying in 1s...', closeErr);
              try {
                await sleep(1000);
                await chrome.tabs.remove(idToClose);
                if (originTabId) {
                  await chrome.tabs.update(originTabId, { active: true });
                }
              } catch {}
            }
          })();
        }

        sendResponse({
          success: true,
          publishedUrl: liveUrl,
        });
      } catch (err) {
        // Do not auto-close tab on error to preserve state for inspection
        sendResponse({
          success: false,
          error: err.message || 'Unknown Medium automation error occurred.',
        });
      }
    })();
    return true; // Keep channel open for async response
  }
});
