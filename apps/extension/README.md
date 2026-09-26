# ArtXFlow Chrome Companion Extension

The **ArtXFlow Chrome Companion Extension** enables automated, silent background publishing to developer blogging platforms such as Hashnode and Medium without requiring paid Pro subscriptions or legacy tokens.

---

## Why Is This Needed?

- **Hashnode**: In 2026, Hashnode paywalled their public GraphQL write APIs (`publishPost`, `createDraft`), requiring an active **Hashnode Pro ($19/month/publication)** plan to publish programmatically.
- **Medium**: In January 2025, Medium stopped issuing new Integration Tokens for their REST API v1 (`POST /v1/users/{authorId}/posts`). New workspaces and authors without existing legacy tokens cannot publish via API.

However, both Hashnode's web editor (`https://hn.new`) and Medium's web editor (`https://medium.com/new-story`) remain 100% free for all users using their active browser session.

This extension bridges the gap:
1. When you hit **Publish** in ArtXFlow with Hashnode or Medium selected, the web app talks to this extension via a lightweight window message bridge.
2. The extension spins up a silent, inactive background tab (`active: false`) in Google Chrome.
3. It inserts your title, markdown content, and canonical SEO URL into Hashnode's or Medium's web editor, clicks publish, retrieves the live published URL, and closes the background tab.
4. ArtXFlow records the publication as `PUBLISHED` in the canonical database, giving you 100% free multi-platform syndication!

---

## How to Install (Developer Unpacked Mode)

1. Open Google Chrome (or any Chromium browser like Brave, Edge, Arc).
2. Navigate to:
   ```text
   chrome://extensions
   ```
3. Enable **Developer mode** using the toggle switch in the top right corner.
4. Click the **Load unpacked** button in the top left.
5. In the file picker, select this directory:
   ```text
   /Users/shubhamsaurabh/Documents/projects/artxflow/apps/extension
   ```
6. The **ArtXFlow Publisher Companion** extension is now installed!

---

## Prerequisites Before Publishing

- Ensure you are logged into [hashnode.com](https://hashnode.com) and/or [medium.com](https://medium.com) in your Chrome browser.
- Open [ArtXFlow Web](http://localhost:3002).
- When you click **Publish...**, you will see:
  `⚡ Extension Free Mode` and `ArtXFlow Companion Extension Active`.

---

## Updating Already-Published Posts (v0.3.0)

Re-publishing an edited article no longer creates a duplicate post. When a destination already has
a `PUBLISHED` publication with a remote URL, ArtXFlow sends `UPDATE_HASHNODE` / `UPDATE_MEDIUM`
instead of `PUBLISH_*` and the extension edits the existing remote post in place.

| Platform | Edit entry | Save flow |
| --- | --- | --- |
| Hashnode | `https://hashnode.com/edit/<id>` (id captured at create time) | header **Update** → confirm **Update** panel → `Article updated` toast |
| Medium | `https://medium.com/p/<storyId>/edit` (story id captured at create time), else `<liveUrl>/edit` | header **Save and publish** → redirects to the live URL (`?postPublishedType=repub`, stripped before recording) |

Details:

- **Create-time id capture** — the create automator records the editor resource id
  (`hashnode.com/edit/<id>` for Hashnode, the 12-hex story id for Medium) and ArtXFlow stores it as
  `externalResourceId`, so updates need zero scraping.
- **Legacy rows** (published before 0.3.0, where `externalResourceId` is just the live URL):
  - Medium derives the story id from the URL; otherwise it appends `/edit`.
  - Hashnode has no edit affordance on public post pages, so the worker probes the page for an
    `a[href*="/edit/"]` link (drafts/posts manager layouts). When found, the id is upgraded in
    ArtXFlow for next time; when not found the run fails with `EDIT_URL_UNRESOLVED` and the tab is
    left open so you can copy the editor URL manually.
- **Content replacement** — Hashnode's ProseMirror document is cleared with an editor-scoped range
  delete plus a post-clear assertion (`CONTENT_NOT_CLEARED` if the old body survives); Medium clears
  its `postArticle-content` block the same way before re-inserting the parsed sections.
- **Failure contract** — any failure keeps the target tab open for review and returns an actionable
  message to ArtXFlow; success closes the tab and returns to the ArtXFlow tab.

---

## Architecture & Security

- **Manifest V3**: Compliant with latest Chrome Web Store standards using background service workers.
- **Zero Remote Code**: All automation scripts (`hashnode-automator.js`, `artxflow-bridge.js`) are bundled locally within the extension.
- **Silent Background Execution**: Automation tabs are opened only for the duration of an operation, never reuse your active tab, and are destroyed automatically on success (kept open on failure so you can inspect what the automator saw).
- **Secure Communication**: Communication between `localhost:3002` (or `*.artxflow.com`) and the extension happens via content script window messaging and validated action types.
