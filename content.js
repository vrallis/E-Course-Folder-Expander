// Log message to verify that the script is running
console.log("Content script loaded");

// Select all folder elements with the specific class (activity folder modtype_folder)
document.querySelectorAll('.activity.folder.modtype_folder').forEach(folder => {
  
  // Get the link inside the folder that contains the URL
  const folderLink = folder.querySelector('a');
  
  // Create an arrow element (▶ initially, will change to ▼ when expanded)
  const arrow = document.createElement('span');
  arrow.textContent = '▶';  // Arrow for collapsed folder
  arrow.style.cursor = 'pointer';  // Ensure the cursor shows pointer to indicate it's clickable
  arrow.style.marginLeft = '5px';
  arrow.style.pointerEvents = 'auto'; // Ensure the arrow is clickable
  
  // Insert the arrow next to the folder link
  folderLink.parentElement.insertBefore(arrow, folderLink.nextSibling);

  // Event listener for arrow click
  arrow.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default behavior of the link
    console.log("Arrow clicked! Fetching folder contents...");

    const folderUrl = folderLink.href; // Get the folder's URL from the link
    const folderContentElement = document.createElement('div');
    folderContentElement.className = 'expanded-folder-contents';
    folderContentElement.style.marginLeft = '20px'; // Indent for visual hierarchy

    // Simulate the referrer as the current page (to avoid the intermediate page)
    const referrerUrl = window.location.href;

    // Step 1: Fetch the folder URL with the referrer set
    fetch(folderUrl, {
      credentials: 'include',
      headers: {
        'Referer': referrerUrl // Simulate clicking the link from the current page
      }
    })
      .then(response => response.text())
      .then(data => {
        // Log the full response HTML for debugging
        console.log("Full response HTML received. Parsing HTML...");

        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');
        
        // Call the function to handle final folder content
        handleFinalFolderContent(doc, folderContentElement, arrow, folder);
      })
      .catch(error => console.error('Error fetching folder content:', error));
  });
});

// Function to handle final folder content extraction and display
function handleFinalFolderContent(doc, folderContentElement, arrow, folder) {
  // Select all <li> elements containing file links
  const fileEntries = doc.querySelectorAll('li .fp-filename-icon');
  console.log("Found file entries:", fileEntries);

  if (fileEntries.length > 0) {
    console.log("Inserting folder contents...");
    
    // Add each file entry as a new div below the folder
    fileEntries.forEach(entry => {
      const fileLink = entry.querySelector('a'); // Get the <a> tag inside the entry
      const fileIcon = entry.querySelector('img'); // Get the <img> tag for the icon

      // Only proceed if fileLink and fileIcon exist
      if (fileLink && fileIcon) {
        // Create a div to hold the file link and icon
        const fileLinkElement = document.createElement('div');
        fileLinkElement.style.marginLeft = '20px'; // Add indentation for each file
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

    arrow.textContent = '▼';  // Change arrow to "expanded" state
    folder.after(folderContentElement); // Insert content below the folder

    console.log("Folder contents inserted successfully!");

    // Remove the event listener after expansion to prevent repeated loading
    arrow.removeEventListener('click', arguments.callee);
  } else {
    console.error("No file entries found for this folder");
  }
}
