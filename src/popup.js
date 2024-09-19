// Load localized text based on the browser's language
function loadLocalizedText() {
    const extensionName = chrome.i18n.getMessage("extensionName");
    const comingSoonMessage = chrome.i18n.getMessage("comingSoonMessage");
  
    console.log("Detected Language:", chrome.i18n.getUILanguage());
    console.log("Extension Name:", extensionName);
    console.log("Coming Soon Message:", comingSoonMessage);

    document.getElementById('extensionName').innerText = extensionName;
    document.getElementById('comingSoon').innerText = comingSoonMessage;
  }
  
  loadLocalizedText();
  