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

## Architecture & Security

- **Manifest V3**: Compliant with latest Chrome Web Store standards using background service workers.
- **Zero Remote Code**: All automation scripts (`hashnode-automator.js`, `artxflow-bridge.js`) are bundled locally within the extension.
- **Silent Background Execution**: Tabs are opened with `{ active: false }` so they never steal focus or interrupt your writing flow, and are immediately destroyed when the operation finishes.
- **Secure Communication**: Communication between `localhost:3002` (or `*.artxflow.com`) and the extension happens via content script window messaging and validated action types.
