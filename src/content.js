function handleFolderExpansion(folder) {
  const button = folder.querySelector('button');
  const folderContainer = folder.nextElementSibling;

  if (folderContainer && folderContainer.classList.contains('expanded')) {
    const isHidden = folderContainer.style.display === 'none';
    folderContainer.style.display = isHidden ? '' : 'none';
    if (button) {
      button.textContent = isHidden ? '▲' : '▼';
      button.setAttribute('aria-expanded', String(isHidden));
    }
    return;
  }

  const loadingElement = document.createElement('div');
  loadingElement.textContent = chrome.i18n.getMessage('loadingText');
  folder.after(loadingElement);

  fetch(folder.getAttribute('data-url'))
    .then(response => response.text())
    .then(data => {
      loadingElement.remove();

      const newFolderContainer = document.createElement('div');
      newFolderContainer.classList.add('folder-container', 'expanded');

      const parser = new DOMParser();
      const doc = parser.parseFromString(data, 'text/html');
      const fileLinks = doc.querySelectorAll('.ygtvitem a');

      if (fileLinks.length === 0) {
        newFolderContainer.textContent = chrome.i18n.getMessage('noFilesMessage');
      } else {
        fileLinks.forEach(fileLinkElement => {
          const fileEntry = document.createElement('div');
          const linkElement = document.createElement('a');
          linkElement.setAttribute('href', fileLinkElement.getAttribute('href'));
          linkElement.textContent = fileLinkElement.textContent;
          fileEntry.appendChild(linkElement);
          newFolderContainer.appendChild(fileEntry);
        });
      }

      folder.after(newFolderContainer);

      if (button) {
        button.textContent = '▲';
        button.setAttribute('aria-expanded', 'true');
      }
    })
    .catch(error => {
      console.error('Error fetching folder content:', error);
      loadingElement.remove();
      const errorElement = document.createElement('div');
      errorElement.textContent = chrome.i18n.getMessage('errorMessage');
      folder.after(errorElement);
    });
}

document.querySelectorAll('.activity.folder.modtype_folder').forEach(folder => {
  const expandButton = document.createElement('button');
  expandButton.textContent = '▼';
  expandButton.style.cursor = 'pointer';
  expandButton.setAttribute('aria-label', chrome.i18n.getMessage('expandButtonLabel'));
  expandButton.setAttribute('aria-expanded', 'false');
  expandButton.addEventListener('click', function () {
    handleFolderExpansion(folder);
  });
  folder.prepend(expandButton);
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'expandAll') {
    document.querySelectorAll('.activity.folder.modtype_folder').forEach(folder => {
      const container = folder.nextElementSibling;
      if (!container || !container.classList.contains('expanded')) {
        handleFolderExpansion(folder);
      }
    });
  }
});
