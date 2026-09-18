document.getElementById('openArtXFlow').addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:3002' });
});
