function loadLocalizedText() {
  document.getElementById('extensionName').innerText = chrome.i18n.getMessage('extensionName');
  document.getElementById('expandAllBtn').innerText = chrome.i18n.getMessage('expandAllLabel');
}

document.getElementById('expandAllBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'expandAll' });
    }
  });
});

loadLocalizedText();
