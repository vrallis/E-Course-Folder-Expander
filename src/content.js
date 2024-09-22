// Function to handle folder expansion
function handleFolderExpansion(folder) {
  const folderContainer = folder.nextElementSibling;

  // Check if folder has already been expanded
  if (folderContainer && folderContainer.classList.contains('expanded')) {
      folderContainer.classList.toggle('hidden');
      return;
  }

  // Create a loading indicator (Safe alternative to innerHTML)
  const loadingElement = document.createElement('div');
  loadingElement.textContent = 'Loading...';  // Use textContent for safer DOM manipulation
  folder.after(loadingElement);

  // Fetch folder contents
  fetch(folder.getAttribute('data-url'))
      .then(response => response.text())
      .then(data => {
          // Remove loading indicator
          loadingElement.remove();

          // Create a container for the folder contents
          const newFolderContainer = document.createElement('div');
          newFolderContainer.classList.add('folder-container', 'expanded');

          // Parse the response and extract the file links
          const parser = new DOMParser();
          const doc = parser.parseFromString(data, 'text/html');
          const fileLinks = doc.querySelectorAll('.ygtvitem a');

          if (fileLinks.length === 0) {
              newFolderContainer.textContent = 'No file entries found for this folder.';
          } else {
              fileLinks.forEach(fileLinkElement => {
                  const fileEntry = document.createElement('div');
                  const fileLink = fileLinkElement.getAttribute('href');
                  const fileName = fileLinkElement.textContent;

                  // Create link element safely
                  const linkElement = document.createElement('a');
                  linkElement.setAttribute('href', fileLink);
                  linkElement.textContent = fileName;

                  // Append link element to file entry and container
                  fileEntry.appendChild(linkElement);
                  newFolderContainer.appendChild(fileEntry);
              });
          }

          // Insert the new folder contents below the folder
          folder.after(newFolderContainer);
      })
      .catch(error => {
          console.error('Error fetching folder content:', error);
          loadingElement.remove();
          const errorElement = document.createElement('div');
          errorElement.textContent = 'Error loading folder contents.';
          folder.after(errorElement);
      });
}

// Attach event listeners to each folder to handle expansion
document.querySelectorAll('.activity.folder.modtype_folder').forEach(folder => {
  const expandButton = document.createElement('button');
  expandButton.textContent = '▼';  // Simple arrow icon for expand button
  expandButton.style.cursor = 'pointer';  // Make it look like a clickable button
  expandButton.addEventListener('click', function () {
      handleFolderExpansion(folder);
  });
  folder.prepend(expandButton);  // Add the expand button to the folder
});
