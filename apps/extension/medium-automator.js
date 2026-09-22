/**
 * Medium Automator Content Script
 * Runs inside the foreground Medium editor tab (medium.com/new-story)
 * to inject title, markdown content, and publish the story cleanly.
 */

(function () {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  function finishResult(res) {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({
          type: 'MEDIUM_AUTOMATOR_DONE',
          result: res,
        });
      }
    } catch {}
    return res;
  }

  function isElementVisible(el) {
    if (!el || !el.isConnected) return false;
    try {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') {
        return false;
      }
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    } catch {
      return true;
    }
  }

  // Find Medium editor title element
  function findTitleElement() {
    const candidates = [
      document.querySelector('[data-testid="storyTitle"]'),
      document.querySelector('h3.graf--title'),
      document.querySelector('h1.graf--title'),
      document.querySelector('[data-placeholder="Title"]'),
      document.querySelector('[data-default-value="Title"]'),
      document.querySelector('[aria-label="Title"]'),
      document.querySelector('[data-field="title"]'),
    ];

    for (const c of candidates) {
      if (c && isElementVisible(c)) return c;
    }

    // Heuristic: element with placeholder containing "title"
    const withPlaceholder = Array.from(
      document.querySelectorAll('[data-placeholder], [placeholder], h1, h2, h3'),
    ).find((el) => {
      const ph = (
        el.getAttribute('data-placeholder') ||
        el.getAttribute('placeholder') ||
        ''
      ).toLowerCase();
      return ph.includes('title') && isElementVisible(el);
    });

    return withPlaceholder || null;
  }

  // Find Medium editor body content area
  function findBodyElement(titleEl) {
    // 1. Direct next sibling of title if present
    if (titleEl && titleEl.nextElementSibling) {
      const next = titleEl.nextElementSibling;
      if (next !== titleEl && (next.classList.contains('graf') || next.tagName === 'P')) {
        return next;
      }
    }

    const candidates = [
      document.querySelector('p.graf--p:not(.graf--title)'),
      document.querySelector('[data-placeholder*="story" i]'),
      document.querySelector('[data-placeholder*="Tell your story" i]'),
      document.querySelector('section.section--first p'),
      document.querySelector('p.graf--p'),
      document.querySelector('div[data-field="body"]'),
    ];

    for (const c of candidates) {
      if (c && c !== titleEl && isElementVisible(c)) return c;
    }

    // Heuristic: any contenteditable element that is not the title and not wrapping the title
    const editables = Array.from(document.querySelectorAll('[contenteditable="true"], p.graf'));
    return editables.find((el) => el !== titleEl && !el.contains(titleEl) && isElementVisible(el)) || null;
  }

  // Find Header Publish button
  function findPublishHeaderButton() {
    const candidates = Array.from(
      document.querySelectorAll('button, [role="button"], a, div[role="button"], span[role="button"]'),
    );
    const visible = candidates.filter(isElementVisible);

    // 1. data-testid="publish-button"
    let btn = visible.find((b) => (b.getAttribute('data-testid') || '').toLowerCase() === 'publish-button');
    if (btn) return btn;

    // 2. data-action="publish"
    btn = visible.find((b) => (b.getAttribute('data-action') || '').toLowerCase() === 'publish');
    if (btn) return btn;

    // 3. Exact text "publish"
    btn = visible.find((b) => {
      const txt = (b.textContent || b.innerText || '').trim().toLowerCase();
      return txt === 'publish';
    });
    if (btn) return btn;

    // 4. Starts with or contains "publish", excluding "publish now" and "published"
    btn = visible.find((b) => {
      const txt = (b.textContent || b.innerText || '').trim().toLowerCase();
      return txt.includes('publish') && !txt.includes('publish now') && !txt.includes('published');
    });
    if (btn) return btn;

    // 5. aria-label contains publish
    btn = visible.find((b) => {
      const label = (b.getAttribute('aria-label') || '').toLowerCase();
      return label.includes('publish') && !label.includes('publish now');
    });

    return btn || null;
  }

  // Check if Medium's publish side drawer or preview modal is open
  function isPublishPanelOpen() {
    const bodyText = document.body ? (document.body.innerText || '').toLowerCase() : '';
    if (
      bodyText.includes('draft settings') ||
      bodyText.includes('code of conduct') ||
      bodyText.includes('attribution & placement') ||
      bodyText.includes('story preview') ||
      bodyText.includes('add a topic') ||
      bodyText.includes('schedule for later')
    ) {
      return true;
    }

    const drawerOrModal = document.querySelector(
      '[role="dialog"], [aria-modal="true"], [data-testid*="publish" i], [data-testid*="draft-settings" i], .overlay',
    );
    return drawerOrModal !== null;
  }

  // Find Confirm "Publish" / "Publish now" button in the publish drawer or modal
  function findFinalPublishButton(headerPublishBtn) {
    const candidates = Array.from(
      document.querySelectorAll('button, [role="button"], a, div[role="button"], span[role="button"]'),
    );
    const visible = candidates.filter(isElementVisible);

    // Identify top navigation / header container to strictly exclude header buttons
    const topNav = headerPublishBtn?.closest('nav, header, [role="banner"], [data-testid="header"]');

    // Filter out headerPublishBtn and anything inside topNav
    const nonHeaderCandidates = visible.filter((b) => {
      if (headerPublishBtn && (b === headerPublishBtn || headerPublishBtn.contains(b))) {
        return false;
      }
      if (topNav && topNav.contains(b)) {
        return false;
      }
      return true;
    });

    // 1. Look inside side drawer or dialog container first
    const panel =
      document.querySelector(
        '[data-testid*="publish" i], [data-testid*="draft-settings" i], [role="dialog"], [aria-modal="true"], aside, .overlay',
      ) ||
      Array.from(document.querySelectorAll('div, section, aside')).find((el) => {
        const t = (el.innerText || '').toLowerCase();
        return (
          t.includes('draft settings') ||
          t.includes('code of conduct') ||
          t.includes('attribution & placement') ||
          t.includes('story preview') ||
          t.includes('add a topic')
        );
      });

    if (panel) {
      const panelButtons = Array.from(
        panel.querySelectorAll('button, [role="button"], a, div[role="button"], span[role="button"]'),
      ).filter(isElementVisible);

      // Search for button with exact "publish" or "publish now" inside the panel
      const exactPanelBtn = panelButtons.find((b) => {
        if (headerPublishBtn && (b === headerPublishBtn || headerPublishBtn.contains(b))) return false;
        const txt = (b.textContent || b.innerText || '').trim().toLowerCase();
        return txt === 'publish' || txt === 'publish now' || txt === 'publish story';
      });
      if (exactPanelBtn) return exactPanelBtn;

      // Search for button containing "publish" (excluding "published") inside the panel
      const fuzzyPanelBtn = panelButtons.find((b) => {
        if (headerPublishBtn && (b === headerPublishBtn || headerPublishBtn.contains(b))) return false;
        const txt = (b.textContent || b.innerText || '').trim().toLowerCase();
        return txt.includes('publish') && !txt.includes('published');
      });
      if (fuzzyPanelBtn) return fuzzyPanelBtn;
    }

    // 2. data-testid / data-action matches on any non-header candidate
    let btn = nonHeaderCandidates.find((b) => {
      const tid = (b.getAttribute('data-testid') || '').toLowerCase();
      const action = (b.getAttribute('data-action') || '').toLowerCase();
      return (
        tid.includes('publish-confirm') ||
        tid.includes('publish-now') ||
        tid === 'publish-button' ||
        action.includes('publish-confirm') ||
        action.includes('publish-now')
      );
    });
    if (btn) return btn;

    // 3. Exact text "publish now" or "publish" on non-header candidate
    btn = nonHeaderCandidates.find((b) => {
      const txt = (b.textContent || b.innerText || '').trim().toLowerCase();
      return txt === 'publish now' || txt === 'publish';
    });
    if (btn) return btn;

    // 4. Text contains "publish" (excluding "published", "publishing to", "by publishing")
    btn = nonHeaderCandidates.find((b) => {
      const txt = (b.textContent || b.innerText || '').trim().toLowerCase();
      return (
        txt.includes('publish') &&
        !txt.includes('published') &&
        !txt.includes('publishing to') &&
        !txt.includes('by publishing')
      );
    });
    if (btn) return btn;

    return null;
  }

  // Click element using full pointer and mouse event chain (React 18+ compliant)
  function clickElement(el) {
    if (!el) return false;
    try {
      el.focus();
    } catch {}
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch {}

    const opts = { bubbles: true, cancelable: true, view: window };
    try {
      el.dispatchEvent(new PointerEvent('pointerover', opts));
    } catch {}
    try {
      el.dispatchEvent(new MouseEvent('mouseover', opts));
    } catch {}
    try {
      el.dispatchEvent(new PointerEvent('pointerdown', opts));
    } catch {}
    try {
      el.dispatchEvent(new MouseEvent('mousedown', opts));
    } catch {}
    try {
      el.dispatchEvent(new PointerEvent('pointerup', opts));
    } catch {}
    try {
      el.dispatchEvent(new MouseEvent('mouseup', opts));
    } catch {}
    try {
      el.click();
    } catch {}
    try {
      el.dispatchEvent(new MouseEvent('click', opts));
    } catch {}
    return true;
  }

  // Clean inline markdown formatting (bold, italic, code, strikethrough, markdown links)
  function removeInlineFormatting(text) {
    if (!text || typeof text !== 'string') return text;
    let result = text;
    result = result.replace(/\*\*([^*]+)\*\*/g, '$1');
    result = result.replace(/__([^_]+)__/g, '$1');
    result = result.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '$1');
    result = result.replace(/(?<!_)_([^_]+)_(?!_)/g, '$1');
    result = result.replace(/`([^`]+)`/g, '$1');
    result = result.replace(/~~([^~]+)~~/g, '$1');
    result = result.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    return result.trim();
  }

  // Parse markdown into structured Medium sections matching JayeshPadhiar/markdown-to-medium
  async function parseMarkdownContent(content, articleTitle) {
    try {
      if (!content) return [];
      const lines = content.split('\n');
      const sections = [];
      let i = 0;
      const normalizedTitle = (articleTitle || '').trim().toLowerCase();

      while (i < lines.length) {
        const line = lines[i];

        // Skip empty lines
        if (line.trim() === '') {
          i++;
          continue;
        }

        // Skip duplicate title at start of body
        const hMatch = line.trim().match(/^#{1,6}\s+(.+)$/);
        const rawHeadText = hMatch ? hMatch[1].trim() : line.trim();
        if (sections.length === 0 && rawHeadText.toLowerCase() === normalizedTitle) {
          i++;
          continue;
        }

        // Headers (# ## ### #### ##### ######)
        if (line.trim().match(/^#{1,6}\s+/)) {
          const match = line.trim().match(/^(#{1,6})\s+(.+)$/);
          if (match) {
            const level = match[1].length;
            const text = removeInlineFormatting(match[2].trim());
            // Level 1 is header (Cmd+Opt+1), Level 2-6 is subheader (Cmd+Opt+2)
            const type = level === 1 ? 'header' : 'subheader';
            sections.push({
              type,
              content: [text],
              level,
            });
          }
          i++;
          continue;
        }

        // Code blocks (```)
        if (line.trim().startsWith('```')) {
          const language = line.trim().substring(3).trim();
          const codeLines = [];
          i++; // Move to next line after opening ```
          while (i < lines.length && !lines[i].trim().startsWith('```')) {
            codeLines.push(lines[i]);
            i++;
          }
          sections.push({
            type: 'code_block',
            content: codeLines,
            language: language || 'text',
          });
          i++; // Skip closing ```
          continue;
        }

        // Tables (convert to aligned monospaced code_block)
        if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
          const tableLines = [];
          while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
            tableLines.push(lines[i].trim());
            i++;
          }

          if (tableLines.length >= 2) {
            const parsedRows = tableLines
              .filter((l) => !l.match(/^\|[\s\-:|]+\|$/))
              .map((l) =>
                l
                  .slice(1, -1)
                  .split('|')
                  .map((c) => removeInlineFormatting(c.trim())),
              );

            if (parsedRows.length > 0) {
              const colCount = Math.max(...parsedRows.map((r) => r.length));
              const colWidths = Array(colCount).fill(3);
              for (const r of parsedRows) {
                for (let c = 0; c < colCount; c++) {
                  colWidths[c] = Math.max(colWidths[c], (r[c] || '').length);
                }
              }
              const pad = (str, len) => str + ' '.repeat(Math.max(0, len - str.length));
              const formattedHeader =
                '| ' + parsedRows[0].map((h, c) => pad(h, colWidths[c])).join(' | ') + ' |';
              const formattedDivider =
                '|-' + colWidths.map((w) => '-'.repeat(w)).join('-|-') + '-|';
              const formattedData = parsedRows.slice(1).map(
                (r) =>
                  '| ' +
                  Array.from({ length: colCount })
                    .map((_, c) => pad(r[c] || '', colWidths[c]))
                    .join(' | ') +
                  ' |',
              );
              sections.push({
                type: 'code_block',
                content: [formattedHeader, formattedDivider, ...formattedData],
                language: 'text',
              });
            }
          }
          continue;
        }

        // Standalone Images (![alt](url))
        if (line.trim().match(/^!\[.*\]\(.*\)/)) {
          const match = line.trim().match(/^!\[([^\]]*)\]\(([^)]+?)(?:\s+"([^"]*)")?\)$/);
          if (match) {
            const altText = match[1] || '';
            const url = match[2];
            const title = match[3] || '';
            sections.push({
              type: 'image',
              content: [url],
              caption: altText || title || '',
              url,
            });

            // If immediately followed by a matching caption line (e.g. *Dealopoly card shuffler*), skip it to avoid duplication
            if (i + 1 < lines.length) {
              const nextLine = lines[i + 1].trim();
              const nextClean = removeInlineFormatting(nextLine).toLowerCase();
              const captionClean = (altText || title).toLowerCase();
              if (
                nextLine.startsWith('*') &&
                nextLine.endsWith('*') &&
                (nextClean === captionClean || nextClean.includes(captionClean))
              ) {
                i++;
              }
            }
          }
          i++;
          continue;
        }

        // Blockquotes (> text)
        if (line.trim().startsWith('>')) {
          const quoteLines = [];
          while (i < lines.length && lines[i].trim().startsWith('>')) {
            let currentLine = lines[i].trim();
            while (currentLine.startsWith('>')) {
              currentLine = currentLine.substring(1).trim();
            }
            if (currentLine) {
              quoteLines.push(removeInlineFormatting(currentLine));
            }
            i++;
          }
          sections.push({
            type: 'quote',
            content: quoteLines,
          });
          continue;
        }

        // Unordered Lists (*, -, +)
        if (line.match(/^(\s*)([-*+])\s+/)) {
          const listItems = [];
          while (i < lines.length && lines[i].match(/^(\s*)([-*+])\s+/)) {
            const match = lines[i].match(/^(\s*)([-*+])\s+(.+)$/);
            if (match) {
              listItems.push(removeInlineFormatting(match[3]));
            }
            i++;
          }
          sections.push({
            type: 'bullet_list',
            content: listItems,
          });
          continue;
        }

        // Ordered Lists (1., 2., etc.)
        if (line.match(/^(\s*)\d+\.\s+/)) {
          const listItems = [];
          while (i < lines.length && lines[i].match(/^(\s*)\d+\.\s+/)) {
            const match = lines[i].match(/^(\s*)\d+\.\s+(.+)$/);
            if (match) {
              listItems.push(removeInlineFormatting(match[2]));
            }
            i++;
          }
          sections.push({
            type: 'num_list',
            content: listItems,
          });
          continue;
        }

        // Horizontal Rules (---, ***, ___)
        if (line.trim().match(/^(-{3,}|\*{3,}|_{3,})$/)) {
          sections.push({
            type: 'subheader',
            content: ['---'],
            level: 2,
          });
          i++;
          continue;
        }

        // Standalone Links ([text](url))
        if (line.trim().match(/^\[.*\]\(.*\)$/)) {
          const match = line.trim().match(/^\[([^\]]+)\]\(([^)]+)\)$/);
          if (match) {
            sections.push({
              type: 'link',
              content: [removeInlineFormatting(match[1])],
              url: match[2],
            });
          }
          i++;
          continue;
        }

        // Regular paragraphs (collect consecutive non-special lines)
        const paragraphLines = [];
        while (
          i < lines.length &&
          lines[i].trim() !== '' &&
          !lines[i].trim().match(/^#{1,6}\s+/) &&
          !lines[i].trim().startsWith('```') &&
          !lines[i].trim().startsWith('|') &&
          !lines[i].trim().match(/^!\[.*\]\(.*\)/) &&
          !lines[i].trim().startsWith('>') &&
          !lines[i].match(/^(\s*)([-*+]|\d+\.)\s+/) &&
          !lines[i].trim().match(/^(-{3,}|\*{3,}|_{3,})$/) &&
          !lines[i].trim().match(/^\[.*\]\(.*\)$/)
        ) {
          const cleanLine = removeInlineFormatting(lines[i].trim());
          if (cleanLine) {
            paragraphLines.push(cleanLine);
          }
          i++;
        }

        if (paragraphLines.length > 0) {
          const hasLinks = paragraphLines.some((l) => l.includes('http') || l.includes('www.'));
          sections.push({
            type: hasLinks ? 'link' : 'text',
            content: paragraphLines,
          });
        }
      }

      return sections;
    } catch (err) {
      console.error('[Medium Automator] Error parsing markdown:', err);
      return [
        {
          type: 'text',
          content: [content],
        },
      ];
    }
  }

  // Exact keyMap matching JayeshPadhiar/markdown-to-medium
  const keyMap = {
    header: {
      mac: { cmd: true, alt: true, key: '1', keyCode: 49, which: 49, code: 'Digit1' },
      windows: { ctrl: true, alt: true, key: '1', keyCode: 49, which: 49, code: 'Digit1' },
    },
    subheader: {
      mac: { cmd: true, alt: true, key: '2', keyCode: 50, which: 50, code: 'Digit2' },
      windows: { ctrl: true, alt: true, key: '2', keyCode: 50, which: 50, code: 'Digit2' },
    },
    quote: {
      mac: { cmd: true, alt: true, key: '5', keyCode: 53, which: 53, code: 'Digit5' },
      windows: { ctrl: true, alt: true, key: '5', keyCode: 53, which: 53, code: 'Digit5' },
    },
    code_block: {
      mac: { cmd: true, alt: true, key: '6', keyCode: 54, which: 54, code: 'Digit6' },
      windows: { ctrl: true, alt: true, key: '6', keyCode: 54, which: 54, code: 'Digit6' },
    },
    left_key: {
      mac: { key: 'ArrowLeft', keyCode: 37, which: 37, code: 'ArrowLeft' },
      windows: { key: 'ArrowLeft', keyCode: 37, which: 37, code: 'ArrowLeft' },
    },
    right_key: {
      mac: { key: 'ArrowRight', keyCode: 39, which: 39, code: 'ArrowRight' },
      windows: { key: 'ArrowRight', keyCode: 39, which: 39, code: 'ArrowRight' },
    },
    up_key: {
      mac: { key: 'ArrowUp', keyCode: 38, which: 38, code: 'ArrowUp' },
      windows: { key: 'ArrowUp', keyCode: 38, which: 38, code: 'ArrowUp' },
    },
    down_key: {
      mac: { key: 'ArrowDown', keyCode: 40, which: 40, code: 'ArrowDown' },
      windows: { key: 'ArrowDown', keyCode: 40, which: 40, code: 'ArrowDown' },
    },
    enter: {
      mac: { key: 'Enter', keyCode: 13, which: 13, code: 'Enter' },
      windows: { key: 'Enter', keyCode: 13, which: 13, code: 'Enter' },
    },
    space: {
      mac: { key: ' ', keyCode: 32, which: 32, code: 'Space' },
      windows: { key: ' ', keyCode: 32, which: 32, code: 'Space' },
    },
    dot: {
      mac: { key: '.', keyCode: 190, which: 190, code: 'Period' },
      windows: { key: '.', keyCode: 190, which: 190, code: 'Period' },
    },
    backspace: {
      mac: { key: 'Backspace', keyCode: 8, which: 8, code: 'Backspace' },
      windows: { key: 'Backspace', keyCode: 8, which: 8, code: 'Backspace' },
    },
  };

  // Dynamic pacing controls: deliberate pace for initial sections, accelerated for remaining
  let isFastPace = false;

  function getPaceDelays() {
    if (isFastPace) {
      return {
        keyPreDelay: 15,
        keyPostDelay: 35,
        textPreDelay: 15,
        textPostDelay: 25,
        listDelay: 25,
        scrollBehavior: 'auto',
      };
    }
    return {
      keyPreDelay: 100,
      keyPostDelay: 200,
      textPreDelay: 50,
      textPostDelay: 100,
      listDelay: 100,
      scrollBehavior: 'smooth',
    };
  }

  // Dispatch keyEvent matching JayeshPadhiar/markdown-to-medium
  function keyEvent(keytype, element) {
    return new Promise((resolve) => {
      const delays = getPaceDelays();
      setTimeout(() => {
        let selectedInput = element || document.querySelector('.is-selected') || document.activeElement;
        const isWindows = navigator.platform.toUpperCase().indexOf('WIN') >= 0;
        const keyConfig = keyMap[keytype]?.[isWindows ? 'windows' : 'mac'];

        if (!keyConfig) {
          resolve(false);
          return;
        }

        const keydown = new KeyboardEvent('keydown', {
          key: keyConfig.key,
          code: keyConfig.code,
          keyCode: keyConfig.keyCode,
          which: keyConfig.which,
          ctrlKey: keyConfig.ctrl || false,
          metaKey: keyConfig.cmd || false,
          altKey: keyConfig.alt || false,
          shiftKey: keyConfig.shift || false,
          bubbles: true,
          cancelable: true,
        });

        const keyup = new KeyboardEvent('keyup', {
          key: keyConfig.key,
          code: keyConfig.code,
          keyCode: keyConfig.keyCode,
          which: keyConfig.which,
          ctrlKey: keyConfig.ctrl || false,
          metaKey: keyConfig.cmd || false,
          altKey: keyConfig.alt || false,
          shiftKey: keyConfig.shift || false,
          bubbles: true,
          cancelable: true,
        });

        setTimeout(() => {
          if (!selectedInput || !selectedInput.isConnected) {
            selectedInput = element || document.querySelector('.is-selected') || document.activeElement;
          }
          if (selectedInput) {
            selectedInput.focus();
            selectedInput.dispatchEvent(keydown);
            selectedInput.dispatchEvent(keyup);
          }
          resolve(true);
        }, delays.keyPostDelay);
      }, delays.keyPreDelay);
    });
  }

  // Set cursor to end of contenteditable element matching JayeshPadhiar/markdown-to-medium
  async function setCursorToEnd(element) {
    if (!element || !element.isConnected) return;
    try {
      element.focus();
      if (typeof window.getSelection !== 'undefined' && typeof document.createRange !== 'undefined') {
        const range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false);
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    } catch (err) {
      console.warn('[Medium Automator] setCursorToEnd warning:', err);
    }
  }

  // Insert text into selectedInput matching JayeshPadhiar/markdown-to-medium
  async function insertText(text) {
    return new Promise((resolve) => {
      const delays = getPaceDelays();
      setTimeout(async () => {
        let selectedInput = document.querySelector('.is-selected') || document.activeElement;
        if (!selectedInput) {
          resolve(true);
          return;
        }

        selectedInput.focus();
        await setCursorToEnd(selectedInput);

        const safeText = String(text ?? '');
        selectedInput.textContent = safeText;
        selectedInput.dispatchEvent(new Event('input', { bubbles: true }));

        try {
          selectedInput.scrollIntoView({ behavior: delays.scrollBehavior, block: 'center' });
        } catch {}

        await setCursorToEnd(selectedInput);
        await keyEvent('enter');

        setTimeout(async () => {
          selectedInput = document.querySelector('.is-selected') || document.activeElement;
          if (selectedInput) {
            await setCursorToEnd(selectedInput);
          }
          resolve(true);
        }, delays.textPostDelay);
      }, delays.textPreDelay);
    });
  }

  // Header insertion
  async function insertHeader(section) {
    await keyEvent('header');
    const headerText = Array.isArray(section.content) ? section.content.join(' ') : section.content;
    await insertText(headerText);
  }

  // Subheader insertion
  async function insertSubheader(section) {
    await keyEvent('subheader');
    const subheaderText = Array.isArray(section.content) ? section.content.join(' ') : section.content;
    await insertText(subheaderText);
  }

  // Quote insertion
  async function insertQuote(section) {
    await keyEvent('quote');
    const quoteText = Array.isArray(section.content) ? section.content.join(' ') : section.content;
    await insertText(quoteText);
  }

  // Bullet list insertion (types '* ' only on item 0, exits via backspace)
  async function insertBulletList(section) {
    if (Array.isArray(section.content)) {
      for (let i = 0; i < section.content.length; i++) {
        const item = section.content[i];
        await insertText((i === 0 ? '* ' : '') + item);
        if (i < section.content.length - 1) {
          await sleep(getPaceDelays().listDelay);
        }
      }
    } else {
      await insertText(section.content);
    }
    await keyEvent('backspace');
  }

  // Numbered list insertion (types '1. ' only on item 0, exits via backspace)
  async function insertNumList(section) {
    if (Array.isArray(section.content)) {
      for (let i = 0; i < section.content.length; i++) {
        const item = section.content[i];
        await insertText((i === 0 ? '1. ' : '') + item);
        if (i < section.content.length - 1) {
          await sleep(getPaceDelays().listDelay);
        }
      }
    } else {
      await insertText(section.content);
    }
    await keyEvent('backspace');
  }

  // Code block insertion (types code, presses enter, exits via right_key)
  async function insertCodeBlock(section) {
    await keyEvent('code_block');
    if (Array.isArray(section.content)) {
      const codeText = section.content.join('\n');
      await insertText(codeText);
    } else {
      await insertText(section.content);
    }
    await keyEvent('enter');
    await setCursorToEnd(document.activeElement);
    const currentFocus = document.activeElement;
    if (currentFocus) {
      currentFocus.focus();
      await keyEvent('right_key', currentFocus);
    }
  }

  // Link insertion
  async function insertLink(section) {
    const linkText = Array.isArray(section.content) ? section.content.join(' ') : section.content;
    await insertText(linkText);
  }

  // Helper to convert base64 data URL to a File object
  function dataUrlToFile(dataUrl, filename = 'image.png', mimeType = 'image/png') {
    try {
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || mimeType;
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    } catch (e) {
      console.warn('[Medium Automator] Failed to convert dataUrl to File:', e);
      return null;
    }
  }

  // Image insertion (fetches binary via service worker, pastes as File into Medium editor to create native figure)
  async function insertImage(section) {
    const url =
      section.url || (Array.isArray(section.content) ? section.content[0] : section.content);
    if (!url) return;

    console.log('[Medium Automator] Inserting image:', url);

    try {
      // 1. Fetch image binary as data URL from background service worker (avoids CORS)
      const fetchResponse = await new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { type: 'FETCH_IMAGE_AS_DATA_URL', url },
          (response) => {
            if (chrome.runtime.lastError || !response || !response.success) {
              console.warn(
                '[Medium Automator] Service worker fetch image error:',
                chrome.runtime.lastError || response?.error,
              );
              resolve(null);
            } else {
              resolve(response);
            }
          },
        );
      });

      if (!fetchResponse || !fetchResponse.dataUrl) {
        console.warn('[Medium Automator] Falling back to text URL insertion for image:', url);
        await insertText(url);
        if (section.caption) await insertText(section.caption);
        return;
      }

      // 2. Convert to File object
      const ext = fetchResponse.mimeType
        ? fetchResponse.mimeType.split('/')[1]?.split('+')[0] || 'png'
        : 'png';
      const file = dataUrlToFile(
        fetchResponse.dataUrl,
        `medium-image-${Date.now()}.${ext}`,
        fetchResponse.mimeType,
      );

      if (!file) {
        await insertText(url);
        if (section.caption) await insertText(section.caption);
        return;
      }

      let selectedInput = document.querySelector('.is-selected') || document.activeElement;
      if (!selectedInput) {
        selectedInput = document.querySelector('article, [contenteditable="true"]');
      }
      if (selectedInput) {
        selectedInput.focus();
        await setCursorToEnd(selectedInput);
      }

      // Count figures before paste to detect when new figure is added
      const figureCountBefore = document.querySelectorAll('figure, .graf--figure').length;

      // 3. Dispatch synthetic paste event with DataTransfer containing binary File
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      const pasteEvent = new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        composed: true,
        clipboardData: dataTransfer,
      });

      const targetElement = selectedInput || document.activeElement || document.body;
      targetElement.dispatchEvent(pasteEvent);

      // 4. Also try file input fallback if paste didn't immediately create a figure
      await sleep(1500);
      let figureCountAfter = document.querySelectorAll('figure, .graf--figure').length;

      if (figureCountAfter <= figureCountBefore) {
        const fileInputs = Array.from(document.querySelectorAll('input[type="file"]'));
        const imageInput = fileInputs.find(
          (inp) => inp.accept?.includes('image') || inp.className?.includes('image'),
        );
        if (imageInput) {
          console.log('[Medium Automator] Attempting file input dispatch fallback...');
          const inputDt = new DataTransfer();
          inputDt.items.add(file);
          imageInput.files = inputDt.files;
          imageInput.dispatchEvent(new Event('change', { bubbles: true }));
          await sleep(2000);
          figureCountAfter = document.querySelectorAll('figure, .graf--figure').length;
        }
      }

      // 5. If figure was successfully added and we have a caption, set the caption
      if (figureCountAfter > figureCountBefore) {
        console.log('[Medium Automator] Native image figure created in Medium editor.');
        const allFigures = Array.from(document.querySelectorAll('figure, .graf--figure'));
        const latestFigure = allFigures[allFigures.length - 1];

        if (section.caption && latestFigure) {
          const figcaption = latestFigure.querySelector(
            'figcaption, [data-default-value*="caption" i], .imageCaption',
          );
          if (figcaption) {
            figcaption.focus();
            figcaption.textContent = section.caption;
            figcaption.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }

        await sleep(500);
        let nextBlock = document.querySelector('.is-selected');
        if (!nextBlock || nextBlock === latestFigure) {
          await keyEvent('down_key');
          await keyEvent('enter');
        }
      } else {
        console.warn(
          '[Medium Automator] Paste event did not trigger figure creation; falling back to link insertion',
        );
        await insertText(url);
        if (section.caption) await insertText(section.caption);
      }
    } catch (err) {
      console.warn('[Medium Automator] Error in insertImage:', err);
      await insertText(url);
      if (section.caption) await insertText(section.caption);
    }
  }

  // Iterate over all parsed sections
  async function insertMarkdownContent(sections) {
    isFastPace = false;
    for (let idx = 0; idx < sections.length; idx++) {
      const section = sections[idx];

      // After the first 2 sections (sections 0 & 1), wait for initial auto-save to register
      // and transition to fast pace for the rest of the document
      if (idx === 2) {
        console.log('[Medium Automator] Initial sections inserted; waiting for auto-save and transitioning to fast pace...');
        await sleep(800);
        isFastPace = true;
      }

      console.log(`[Medium Automator] Inserting section ${idx + 1}/${sections.length} (${section.type}) [fast=${isFastPace}]`);
      switch (section.type) {
        case 'text':
          await insertText(Array.isArray(section.content) ? section.content.join(' ') : section.content);
          break;
        case 'header':
          await insertHeader(section);
          break;
        case 'subheader':
          await insertSubheader(section);
          break;
        case 'quote':
          await insertQuote(section);
          break;
        case 'bullet_list':
          await insertBulletList(section);
          break;
        case 'num_list':
          await insertNumList(section);
          break;
        case 'code_block':
          await insertCodeBlock(section);
          break;
        case 'image':
          await insertImage(section);
          break;
        case 'link':
          await insertLink(section);
          break;
        default:
          await insertText(Array.isArray(section.content) ? section.content.join(' ') : section.content);
          break;
      }
    }
  }

  // Heuristic to check if current URL is a published Medium story
  function isPublishedStoryUrl(url) {
    try {
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

      // Check for user story pattern: /@username/slug or /p/id or /slug-id or /publication/slug
      if (path.includes('/@') || path.startsWith('/p/') || path.split('/').filter(Boolean).length >= 1) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Stage 1: In the editor, fill Title, Markdown (fast pace after section 1), and click header Publish
  window.__runMediumEditor = async function (article) {
    console.log('[Medium Automator] Stage 1: Starting editor automation for:', article.title);

    try {
      // 1. Verify we are not redirected to signin
      const currentUrl = window.location.href;
      if (
        currentUrl.includes('/signin') ||
        currentUrl.includes('/m/signin') ||
        currentUrl.includes('/m/connect') ||
        currentUrl.includes('accounts.google.com')
      ) {
        return finishResult({
          success: false,
          error: 'NOT_LOGGED_IN',
          message: 'You are not logged into Medium in Chrome. Please log in at medium.com and try again.',
        });
      }

      // 2. Wait for editor to be ready and locate Title element
      console.log('[Medium Automator] Locating Title element...');
      let titleEl = null;
      const titleStart = Date.now();
      while (Date.now() - titleStart < 20000) {
        titleEl = findTitleElement();
        if (titleEl) break;
        await sleep(400);
      }

      if (!titleEl) {
        return finishResult({
          success: false,
          error: 'TITLE_NOT_FOUND',
          message: 'Could not locate the Title element in the Medium editor. Please check the open tab.',
        });
      }

      // 3. Locate Body element BEFORE modifying title (both exist in fresh draft)
      console.log('[Medium Automator] Locating Body element...');
      let bodyEl = null;
      const bodyStart = Date.now();
      while (Date.now() - bodyStart < 15000) {
        bodyEl = findBodyElement(titleEl);
        if (bodyEl) break;
        await sleep(400);
      }

      if (!bodyEl) {
        bodyEl = findBodyElement(titleEl);
      }

      // 4. Set Title cleanly
      console.log('[Medium Automator] Setting title...');
      const cleanTitle = (article.title || '').replace(/\n+/g, ' ').trim();
      titleEl.focus();
      await setCursorToEnd(titleEl);
      titleEl.textContent = cleanTitle;
      titleEl.dispatchEvent(new Event('input', { bubbles: true }));
      await sleep(300);

      // 5. Transition to Body element
      if (!bodyEl || bodyEl === titleEl || bodyEl.contains(titleEl) || !bodyEl.isConnected) {
        titleEl.focus();
        await setCursorToEnd(titleEl);
        await keyEvent('enter', titleEl);
        await sleep(300);
        bodyEl = findBodyElement(titleEl);
      }

      if (!bodyEl) {
        bodyEl = findBodyElement(titleEl);
      }

      if (!bodyEl) {
        return finishResult({
          success: false,
          error: 'BODY_NOT_FOUND',
          message: 'Could not locate the Story Body area in the Medium editor.',
        });
      }

      bodyEl.focus();
      await setCursorToEnd(bodyEl);
      await sleep(200);

      // 6. Parse and inject content using JayeshPadhiar formatter pipeline + dynamic pacing
      const sections = await parseMarkdownContent(article.markdown, cleanTitle);
      console.log(`[Medium Automator] Inserting ${sections.length} structured sections...`);
      await insertMarkdownContent(sections);

      // Blur active element to trigger auto-save flush
      try {
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
          document.activeElement.blur();
        }
      } catch {}
      await sleep(1500);

      // 7. Wait for Medium auto-save to persist and activate the header Publish button
      console.log('[Medium Automator] Waiting for Medium auto-save and enabled Publish button...');
      const publishHeaderStart = Date.now();
      let headerPublishBtn = null;
      let autoSaveError = null;

      while (Date.now() - publishHeaderStart < 25000) {
        const errorBanner = Array.from(document.querySelectorAll('div, span, p, a')).find((el) => {
          const t = (el.innerText || '').toLowerCase();
          return t.includes('cannot save your story') || t.includes('something is wrong and we cannot save');
        });

        if (errorBanner) {
          autoSaveError = (errorBanner.innerText || '').trim();
        } else {
          autoSaveError = null;
        }

        headerPublishBtn = findPublishHeaderButton();
        if (headerPublishBtn && !autoSaveError) {
          const isDisabled =
            headerPublishBtn.disabled ||
            headerPublishBtn.getAttribute('aria-disabled') === 'true' ||
            headerPublishBtn.classList.contains('disabled') ||
            (headerPublishBtn.getAttribute('title') || '').toLowerCase().includes('start writing');

          if (!isDisabled) {
            console.log('[Medium Automator] Publish button is enabled and auto-save is clean.');
            break;
          }
        }
        await sleep(600);
      }

      if (autoSaveError) {
        return finishResult({
          success: false,
          error: 'AUTOSAVE_FAILED',
          message: `Medium auto-save error: "${autoSaveError}". (The Medium tab has been kept open for your review)`,
        });
      }

      if (!headerPublishBtn) {
        headerPublishBtn = findPublishHeaderButton();
      }

      if (!headerPublishBtn) {
        return finishResult({
          success: false,
          error: 'PUBLISH_HEADER_NOT_FOUND',
          message: 'Could not find the header Publish button on Medium. Tab left open for inspection.',
        });
      }

      console.log('[Medium Automator] Clicking header Publish button to trigger navigation to draft settings page...');
      clickElement(headerPublishBtn);
      try {
        headerPublishBtn.click();
      } catch {}

      return finishResult({
        success: true,
        phase: 'HEADER_CLICKED',
      });
    } catch (editorErr) {
      console.error('[Medium Automator] Stage 1 error:', editorErr);
      return finishResult({
        success: false,
        error: 'STAGE_1_ERROR',
        message: `Medium editor error: ${editorErr?.message || String(editorErr)}`,
      });
    }
  };

  // Stage 2: On the newly loaded settings/preview page, find and click the final confirm Publish button
  window.__runMediumFinalPublish = async function () {
    console.log('[Medium Automator] Stage 2: Looking for final Publish button on settings page...');
    const publishFinalStart = Date.now();
    let finalPublishBtn = null;

    while (Date.now() - publishFinalStart < 20000) {
      finalPublishBtn = findFinalPublishButton(null);
      if (finalPublishBtn) {
        const isDisabled =
          finalPublishBtn.disabled ||
          finalPublishBtn.getAttribute('aria-disabled') === 'true' ||
          finalPublishBtn.classList.contains('disabled');
        if (!isDisabled) {
          console.log('[Medium Automator] Found final Publish button:', (finalPublishBtn.textContent || '').trim());
          break;
        }
      }
      await sleep(500);
    }

    if (!finalPublishBtn) {
      return finishResult({
        success: false,
        error: 'FINAL_PUBLISH_NOT_FOUND',
        message: 'Could not find the final "Publish" button on the Medium settings page. (The Medium tab has been kept open for your review)',
      });
    }

    console.log('[Medium Automator] Clicking final Publish button on settings page...');
    clickElement(finalPublishBtn);
    try {
      finalPublishBtn.click();
    } catch {}
    await sleep(2000);

    return finishResult({
      success: true,
      phase: 'FINAL_PUBLISH_CLICKED',
    });
  };

  // Standalone fallback: runs both stages sequentially with URL resolution
  window.__runMediumAutomator = async function (article) {
    const editorRes = await window.__runMediumEditor(article);
    if (!editorRes || !editorRes.success) return editorRes;
    await sleep(2500);

    const finalRes = await window.__runMediumFinalPublish();
    if (!finalRes || !finalRes.success) return finalRes;

    const navStart = Date.now();
    let liveUrl = null;
    while (Date.now() - navStart < 30000) {
      const current = window.location.href;
      if (isPublishedStoryUrl(current)) {
        liveUrl = current;
        break;
      }
      await sleep(1000);
    }

    if (!liveUrl) {
      const current = window.location.href;
      if (isPublishedStoryUrl(current)) {
        liveUrl = current;
      } else {
        return finishResult({
          success: false,
          error: 'URL_NOT_RESOLVED',
          message: `Medium story was submitted but live URL could not be confirmed (current: ${current}). Tab left open.`,
        });
      }
    }

    return finishResult({
      success: true,
      publishedUrl: liveUrl,
    });
  };
})();
