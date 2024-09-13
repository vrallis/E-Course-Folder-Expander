// Log message to verify that the script is running
console.log("Content script loaded");
const loadingText = chrome.i18n.getMessage("loadingText");


// Select all folder elements
document.querySelectorAll('.activity.folder.modtype_folder').forEach(folder => {
  
  // Get the link
  const folderLink = folder.querySelector('a');
  
  // Create an arrow element
  const arrow = document.createElement('span');
  arrow.textContent = '▶';  // Arrow for collapsed folder
  arrow.style.cursor = 'pointer';  // Clickable pointer indicator
  arrow.style.marginLeft = '5px';
  arrow.style.pointerEvents = 'auto';
  
  // Insert the arrow next to folder
  folderLink.parentElement.insertBefore(arrow, folderLink.nextSibling);

  // Variables to track loaded content
  let contentLoaded = false;
  let folderContentElement = null;

  // Event listener for arrow click
  arrow.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default behavior

    // Check if content is already loaded, if so toggle visibility
    if (contentLoaded) {
      folderContentElement.style.display = folderContentElement.style.display === 'none' ? 'block' : 'none';
      arrow.textContent = folderContentElement.style.display === 'none' ? '▶' : '▼';
      return;
    }

    //console.log("Arrow clicked! Fetching folder contents...");
    const folderUrl = folderLink.href; // Get the folder's URL from the link
    folderContentElement = document.createElement('div'); // Create content container for the specific folder
    folderContentElement.className = 'expanded-folder-contents';
    folderContentElement.style.marginLeft = '20px'; // Intendent

    // Loading indicator
    const loadingElement = document.createElement('div');
    loadingElement.innerHTML = loadingText;
    loadingElement.style.fontStyle = 'italic';
    folder.after(loadingElement);

    // Simulate the referrer as the current page
    const referrerUrl = window.location.href;

    // Fetch the folder URL
    fetch(folderUrl, {
      credentials: 'include',
      headers: {
        'Referer': referrerUrl // Simulate clicking link clicking from the current page
      }
    })
      .then(response => response.text())
      .then(data => {
        // Log the full response HTML for debugging
        // console.log("Full response HTML received. Parsing HTML...");

        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');
        
        // Remove the loading indicator once the content is fetched
        loadingElement.remove();

        // Call the function to handle content of folder
        handleFinalFolderContent(doc, folderContentElement, arrow, folder);

        // Mark content as loaded
        contentLoaded = true;
      })
      .catch(error => {
        console.error('Error fetching folder content:', error);
        // Remove the loading indicator if error
        loadingElement.remove();
      });
  });
});

// Function to handle final folder content extraction and display
function handleFinalFolderContent(doc, folderContentElement, arrow, folder) {
  const fileEntries = doc.querySelectorAll('li .fp-filename-icon');
  console.log("Found file entries:", fileEntries);

  if (fileEntries.length > 0) {
    console.log("Inserting folder contents...");
    
    // Add each file entry as a new div below the folder
    fileEntries.forEach(entry => {
      const fileLink = entry.querySelector('a');
      const fileIcon = entry.querySelector('img');

      // Only proceed if fileLink and fileIcon exist
      if (fileLink && fileIcon) {
        // Create a div to hold the file link and icon
        const fileLinkElement = document.createElement('div');
        fileLinkElement.style.marginLeft = '20px';
        fileLinkElement.style.marginBottom = '10px';
        fileLinkElement.innerHTML = `
          <a href="${fileLink.href}" target="_blank">
            <img src="${fileIcon.src}" alt="${fileIcon.alt}" style="vertical-align:middle; margin-right:5px;">
            ${fileLink.textContent}
          </a>
        `;
        folderContentElement.appendChild(fileLinkElement);
      } else {
        console.error("Error: Missing fileLink or fileIcon in entry", entry);
      }
    });

    arrow.textContent = '▼';  // Change arrow state
    folder.after(folderContentElement); // Insert content below the folder

    console.log("Folder contents inserted successfully!");

    // Remove the event listener to prevent loops
    arrow.removeEventListener('click', arguments.callee);
  } else {
    console.error("No file entries found for this folder");
  }
}
