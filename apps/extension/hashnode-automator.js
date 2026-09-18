/**
 * Hashnode Automator Content Script
 * Runs inside the background Hashnode editor tab to inject title, markdown,
 * and publish the post silently.
 */

(function () {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function isElementVisible(el) {
    if (!el) return false;
    try {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return false;
      }
      return true;
    } catch {
      return true;
    }
  }

  // Set input / textarea value using native setters to trigger React state hooks
  function setNativeInputValue(element, value) {
    const isTextarea = element.tagName === 'TEXTAREA';
    const prototype = isTextarea
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
    const valueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

    if (valueSetter) {
      valueSetter.call(element, value);
    } else {
      element.value = value;
    }

    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Set title value across textarea, input, or contenteditable
  function setTitleValue(titleEl, title) {
    titleEl.focus();
    if (titleEl.tagName === 'TEXTAREA' || titleEl.tagName === 'INPUT') {
      setNativeInputValue(titleEl, title);
    } else if (titleEl.isContentEditable) {
      try {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(titleEl);
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, title);
      } catch {
        titleEl.innerText = title;
      }
      titleEl.dispatchEvent(new Event('input', { bubbles: true }));
      titleEl.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      titleEl.innerText = title;
    }
  }

  let writeBtnClicked = false;

  // Ensure we are inside the Hashnode editor, clicking "Write" from /drafts if necessary
  async function ensureEditorReady(timeoutMs = 25000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      // 1. Check if ProseMirror editor is already present
      const pm = document.querySelector('.ProseMirror');
      if (pm && isElementVisible(pm)) {
        return pm;
      }

      // 2. If on /drafts or dashboard, click "Write" button once
      const isDraftsOrDash =
        window.location.pathname.includes('/drafts') ||
        window.location.pathname.includes('/dashboard') ||
        document.title.toLowerCase().includes('drafts');

      if (isDraftsOrDash && !writeBtnClicked) {
        const btns = Array.from(document.querySelectorAll('button, a'));
        const writeBtn = btns.find((b) => {
          const txt = (b.innerText || '').trim().toLowerCase();
          const href = (b.getAttribute('href') || '').toLowerCase();
          const testid = (b.getAttribute('data-testid') || '').toLowerCase();
          const aria = (b.getAttribute('aria-label') || '').toLowerCase();
          return (
            txt === 'write' ||
            txt === 'new story' ||
            txt === 'new post' ||
            txt === 'write an article' ||
            txt === 'write article' ||
            txt === 'new article' ||
            txt.startsWith('write') ||
            txt.includes('write an article') ||
            txt.includes('new draft') ||
            testid.includes('write') ||
            aria.includes('write') ||
            href.includes('/edit') ||
            href.includes('/new')
          );
        });

        if (writeBtn) {
          console.log('[Hashnode Automator] Clicking Write button from drafts/dashboard...');
          writeBtnClicked = true;
          writeBtn.click();
          await sleep(2500);

          // If a publication dropdown appeared, select the first publication option
          const pubMenu = document.querySelector('[role="menu"], [role="listbox"], [data-radix-menu-content]');
          if (pubMenu) {
            const pubOption = pubMenu.querySelector('[role="menuitem"], [role="option"], button');
            if (pubOption) {
              pubOption.click();
              await sleep(1500);
            }
          }
        }
      }

      await sleep(400);
    }

    const domDump = Array.from(
      document.querySelectorAll('input, textarea, [contenteditable="true"], h1, h2, button')
    ).map((el) => {
      const tag = el.tagName.toLowerCase();
      const ph = el.getAttribute('placeholder') || el.getAttribute('data-placeholder') || '';
      const txt = (el.innerText || el.value || '').trim().slice(0, 20);
      return `<${tag} ph="${ph}" txt="${txt}">`;
    });

    throw new Error(
      `Timed out waiting to enter Hashnode editor on ${window.location.href} ("${document.title}"). Available elements: ${domDump.slice(0, 10).join(' | ') || 'NONE'}`
    );
  }

  // Find the title element inside the editor
  function findTitleElementInEditor(editorEl) {
    const TITLE_SELECTORS = [
      'textarea[placeholder*="title" i]',
      'input[placeholder*="title" i]',
      'textarea[aria-label*="title" i]',
      'input[aria-label*="title" i]',
      '[data-placeholder*="title" i]',
      '[data-placeholder*="Title" i]',
      '[data-placeholder*="article" i]',
      '[placeholder*="title" i]',
      '[placeholder*="Title" i]',
      '[placeholder*="article" i]',
      '[data-testid*="title" i]',
      '[data-testid="post-title"]',
      'h1[contenteditable="true"]',
      '.ProseMirror h1',
      'textarea',
    ];

    for (const sel of TITLE_SELECTORS) {
      const el = document.querySelector(sel);
      if (el && isElementVisible(el) && el !== editorEl) {
        return el;
      }
    }

    // Check if ProseMirror has an h1 as its first child
    const firstChild = editorEl.firstElementChild;
    if (
      firstChild &&
      (firstChild.tagName === 'H1' ||
        (firstChild.getAttribute('data-placeholder') || '').toLowerCase().includes('title'))
    ) {
      return firstChild;
    }

    return null;
  }

  // Insert markdown content into rich text editor
  async function insertMarkdownIntoEditor(editorEl, markdown) {
    editorEl.focus();
    await sleep(200);

    // Strategy 1: Paste Event (TipTap / ProseMirror markdown parser)
    try {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editorEl);
      selection.removeAllRanges();
      selection.addRange(range);

      const pasteData = new DataTransfer();
      pasteData.setData('text/plain', markdown);
      pasteData.setData('text/markdown', markdown);
      const pasteEvent = new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: pasteData,
      });

      editorEl.dispatchEvent(pasteEvent);
      await sleep(400);

      if ((editorEl.innerText || '').trim().length > 10) {
        return;
      }
    } catch {}

    // Strategy 2: document.execCommand insertText
    try {
      document.execCommand('selectAll', false, null);
      document.execCommand('insertText', false, markdown);
      await sleep(300);
      if ((editorEl.innerText || '').trim().length > 10) {
        return;
      }
    } catch {}

    // Strategy 3: Textarea value or innerText
    if (editorEl.tagName === 'TEXTAREA' || editorEl.tagName === 'INPUT') {
      setNativeInputValue(editorEl, markdown);
    } else {
      editorEl.innerText = markdown;
      editorEl.dispatchEvent(new Event('input', { bubbles: true }));
      editorEl.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  // Set canonical URL in post settings if present
  function injectCanonicalUrl(canonicalUrl) {
    if (!canonicalUrl) return;
    try {
      const canonicalInput = document.querySelector(
        'input[name*="canonical" i], input[placeholder*="canonical" i], input[placeholder*="original" i], input[placeholder*="https://" i]'
      );
      if (canonicalInput && !canonicalInput.value) {
        setNativeInputValue(canonicalInput, canonicalUrl);
      }
    } catch {}
  }

  // Find and trigger the Publish flow
  async function triggerPublish(canonicalUrl) {
    // 1. Locate top header "Publish" button
    let publishBtn = null;
    const findBtnStart = Date.now();
    while (Date.now() - findBtnStart < 12000) {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      publishBtn = buttons.find((btn) => {
        // Skip buttons inside navigation sidebar/drawer
        if (btn.closest('nav') || btn.closest('aside')) return false;

        const text = (btn.innerText || '').trim().toLowerCase();
        const aria = (btn.getAttribute('aria-label') || '').toLowerCase();
        const testid = (btn.getAttribute('data-testid') || '').toLowerCase();
        return (
          testid.includes('publish') ||
          text === 'publish' ||
          text === 'publish post' ||
          text.startsWith('publish') ||
          aria.includes('publish')
        );
      });

      if (publishBtn) {
        const isDisabled =
          publishBtn.disabled ||
          publishBtn.getAttribute('aria-disabled') === 'true' ||
          publishBtn.classList.contains('disabled') ||
          publishBtn.classList.contains('cursor-not-allowed') ||
          publishBtn.classList.contains('opacity-50');

        if (!isDisabled) {
          break;
        }
      }
      await sleep(400);
    }

    if (!publishBtn) {
      throw new Error('Publish button not found or remained disabled in Hashnode editor header.');
    }

    console.log('[Hashnode Automator] Clicking Publish button in header...');
    publishBtn.click();
    await sleep(1500);

    // 2. Locate the "Draft settings" panel and the final Publish button
    let confirmBtn = null;
    const modalPollStart = Date.now();
    while (Date.now() - modalPollStart < 12000) {
      // 1. Check for the Draft settings panel container (matches the panel in Hashnode editor)
      const allContainers = Array.from(
        document.querySelectorAll('aside, section, [role="dialog"], div[class*="drawer"], div[class*="sheet"], div')
      );
      const settingsPanel = allContainers.find((el) => {
        const t = (el.innerText || '');
        return (
          (t.includes('Draft settings') || t.includes('By publishing, you agree')) &&
          el.querySelector('button') !== null
        );
      });

      if (settingsPanel) {
        // If canonical URL provided, inject it (switch to Discovery tab if present)
        if (canonicalUrl) {
          try {
            const tabs = Array.from(settingsPanel.querySelectorAll('button, [role="tab"], span'));
            const discoveryTab = tabs.find((el) => (el.innerText || '').trim().toLowerCase() === 'discovery');
            if (discoveryTab) {
              discoveryTab.click();
              await sleep(300);
              injectCanonicalUrl(canonicalUrl);
            }
          } catch {}
        } else {
          injectCanonicalUrl(canonicalUrl);
        }

        // Find the confirm Publish button inside the settings panel
        const panelBtns = Array.from(settingsPanel.querySelectorAll('button'));
        confirmBtn = panelBtns.find((b) => {
          if (b === publishBtn) return false;
          const txt = (b.innerText || '').trim().toLowerCase();
          const testid = (b.getAttribute('data-testid') || '').toLowerCase();
          return (
            !txt.includes('cancel') &&
            !txt.includes('close') &&
            (txt === 'publish' || txt === 'publish now' || txt === 'publish post' || testid.includes('publish'))
          );
        });

        if (confirmBtn) break;
      }

      // 2. Fallback: Search any button on the page whose text is 'publish' or 'publish now' and is NOT the header publishBtn
      const allBtns = Array.from(document.querySelectorAll('button'));
      confirmBtn = allBtns.find((b) => {
        if (b === publishBtn) return false;
        // Ignore buttons inside the left sidebar navigation
        if (b.closest('nav')) return false;

        const txt = (b.innerText || '').trim().toLowerCase();
        const testid = (b.getAttribute('data-testid') || '').toLowerCase();
        return (
          !txt.includes('cancel') &&
          !txt.includes('close') &&
          (txt === 'publish' || txt === 'publish now' || txt === 'publish post' || testid.includes('publish-now') || testid.includes('publish-btn'))
        );
      });

      if (confirmBtn) break;
      await sleep(350);
    }

    if (!confirmBtn) {
      const dump = Array.from(document.querySelectorAll('button'))
        .filter(isElementVisible)
        .map((b) => `"${(b.innerText || '').trim()}"`)
        .slice(0, 10);
      throw new Error(`Opened Draft settings, but could not find the final Publish button. Available buttons: [${dump.join(', ')}]`);
    }

    // Wait for confirm button to become enabled if currently disabled
    const enableWaitStart = Date.now();
    while (confirmBtn.disabled && Date.now() - enableWaitStart < 5000) {
      await sleep(250);
    }

    console.log('[Hashnode Automator] Found confirm button in Draft settings! Clicking it:', confirmBtn.innerText);
    confirmBtn.scrollIntoView?.({ block: 'center' });
    confirmBtn.click();
    await sleep(2000);
  }

  // Validate that a URL is a real published post on Hashnode
  function isValidPublishedArticleUrl(url, initialUrl, editorUrl) {
    if (!url) return false;
    if (url === initialUrl || (editorUrl && url === editorUrl)) return false;

    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      const path = parsed.pathname;

      // Must be on Hashnode domain
      if (!host.endsWith('hashnode.dev') && !host.endsWith('hashnode.com') && !host.includes('hashnode.')) {
        return false;
      }

      // Cannot contain internal/administrative keywords in path
      const disallowedWords = [
        'draft',
        'drafts',
        'edit',
        'editor',
        'new',
        'posts/new',
        'preview',
        'dashboard',
        'settings',
        'explore',
        'changelog',
        'discussions',
        'bookmarks',
        'analytics',
        'recommendations',
        'onboarding',
      ];

      for (const word of disallowedWords) {
        if (path.toLowerCase().includes(`/${word}`) || path.toLowerCase() === `/${word}`) {
          return false;
        }
      }

      // Draft IDs: 24-character hexadecimal MongoDB ObjectIDs (e.g. /66e9be1734567890abcdef)
      const cleanPath = path.replace(/^\/|\/$/g, '');
      if (/^[a-f0-9]{24}$/i.test(cleanPath)) {
        return false;
      }

      // User profile paths: /@username
      if (cleanPath.startsWith('@')) {
        return false;
      }

      // Must have a meaningful post slug (e.g. /my-post-title)
      return cleanPath.length >= 3;
    } catch {
      return false;
    }
  }

  // Main automation entrypoint
  window.__runHashnodeAutomator = async function (article) {
    try {
      if (
        window.location.pathname.includes('/login') ||
        window.location.pathname.includes('/signin')
      ) {
        return {
          success: false,
          error: 'NOT_LOGGED_IN',
          message: 'Please log into your Hashnode account in Chrome first.',
        };
      }

      await sleep(500);

      // 1. Enter the editor (.ProseMirror container)
      const editorEl = await ensureEditorReady(25000);

      // 2. Locate title element
      const titleEl = findTitleElementInEditor(editorEl);

      // 3. Inject content
      if (!titleEl || titleEl === editorEl) {
        // Unified ProseMirror document: Heading 1 + Body
        const combinedMarkdown = `# ${article.title}\n\n${article.markdown}`;
        await insertMarkdownIntoEditor(editorEl, combinedMarkdown);
      } else {
        // Separate Title and Body
        setTitleValue(titleEl, article.title);
        await sleep(400);
        await insertMarkdownIntoEditor(editorEl, article.markdown);
      }

      console.log('[Hashnode Automator] Content injected successfully into editor.');

      // 4. Wait for auto-save to sync
      console.log('[Hashnode Automator] Waiting for auto-save to sync...');
      await sleep(3000);
      const autoSaveStart = Date.now();
      while (Date.now() - autoSaveStart < 8000) {
        const bodyText = document.body.innerText || '';
        const isSaving = /saving\.\.\.|syncing\.\.\./i.test(bodyText);
        if (!isSaving) break;
        await sleep(400);
      }

      // 5. Capture URLs before triggering publish
      const initialUrl = window.location.href;
      const editorUrl = window.location.href;

      // 6. Trigger publish flow
      await triggerPublish(article.canonicalUrl);

      // 7. Poll for verified published article URL (up to 25s)
      let publishedUrl = null;
      const pollStart = Date.now();

      while (Date.now() - pollStart < 25000) {
        const currentUrl = window.location.href;

        // Check 1: Has the page navigated to a published article URL?
        if (isValidPublishedArticleUrl(currentUrl, initialUrl, editorUrl)) {
          publishedUrl = currentUrl;
          break;
        }

        // Check 2: Success toast / dialog with "View post" or "Read post"
        const links = Array.from(document.querySelectorAll('a[href]'));
        const successLink = links.find((a) => {
          const txt = (a.innerText || '').toLowerCase().trim();
          const href = a.href;
          const isViewPostText =
            txt === 'view post' ||
            txt === 'read post' ||
            txt === 'see post' ||
            txt === 'open post' ||
            txt.includes('view post') ||
            txt.includes('read story');
          return isViewPostText && isValidPublishedArticleUrl(href, initialUrl, editorUrl);
        });

        if (successLink) {
          publishedUrl = successLink.href;
          break;
        }

        // Check 3: Top button changed from "Publish" to "Update" (post is live!)
        const updateBtn = Array.from(document.querySelectorAll('button')).find((b) => {
          const txt = (b.innerText || '').trim().toLowerCase();
          return txt === 'update' || txt === 'updated';
        });
        if (updateBtn) {
          const liveLink = Array.from(document.querySelectorAll('a[href]')).find((a) =>
            isValidPublishedArticleUrl(a.href, initialUrl, editorUrl)
          );
          if (liveLink) {
            publishedUrl = liveLink.href;
            break;
          }
        }

        await sleep(600);
      }

      if (!publishedUrl) {
        const visibleBtns = Array.from(document.querySelectorAll('button, a'))
          .filter(isElementVisible)
          .map((b) => (b.innerText || '').trim())
          .filter(Boolean)
          .slice(0, 8);

        const currentUrl = window.location.href;
        const pageTitle = document.title;

        return {
          success: false,
          error: `Draft was saved, but live publish confirmation was not detected (Page: "${pageTitle}", URL: ${currentUrl}, Buttons: [${visibleBtns.join(', ')}]).`,
          message: `Draft was saved, but live publish confirmation was not detected (Page: "${pageTitle}", URL: ${currentUrl}, Buttons: [${visibleBtns.join(', ')}]).`,
        };
      }

      return {
        success: true,
        publishedUrl: publishedUrl,
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Automation failed',
        message: err.message || 'Automation failed',
      };
    }
  };
})();
