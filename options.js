const localizeHtmlPage = () => {
  document.title = chrome.i18n.getMessage("optionsPageTitle") || "Options - YouTube Live Chat Blocker";
  document.querySelectorAll('[data-i18n]').forEach(elem => {
    elem.textContent = chrome.i18n.getMessage(elem.getAttribute('data-i18n'));
  });
};
localizeHtmlPage();

const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const fileInput = document.getElementById("fileInput");
const messageBox = document.getElementById("message");

const showMessage = (msg, isSuccess = true) => {
  messageBox.textContent = msg;
  messageBox.className = `notification ${isSuccess ? 'is-success' : 'is-danger'}`;
  messageBox.classList.remove("is-hidden");
  setTimeout(() => {
    messageBox.classList.add("is-hidden");
  }, 3000);
};

exportBtn.addEventListener("click", async () => {
  const { rules: loadedRules } = await chrome.storage.local.get("rules");
  const rules = loadedRules || [];
  const jsonString = JSON.stringify({ rules }, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `ytlcb_rules_${new Date().getTime()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showMessage(chrome.i18n.getMessage("msgExportSuccess"));
});

importBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (data && Array.isArray(data.rules)) {
        // Basic validation
        const isValid = data.rules.every(rule => 
          typeof rule.id === "number" && 
          ["contains", "equals", "regexp"].includes(rule.type) && 
          typeof rule.text === "string" &&
          (rule.active === undefined || typeof rule.active === "boolean")
        );
        
        if (isValid) {
          chrome.storage.local.set({ rules: data.rules }, () => {
            showMessage(chrome.i18n.getMessage("msgImportSuccess"));
            fileInput.value = ""; // Reset input
          });
        } else {
          showMessage(chrome.i18n.getMessage("msgInvalidFormat"), false);
        }
      } else {
        showMessage(chrome.i18n.getMessage("msgInvalidStructure"), false);
      }
    } catch (err) {
      showMessage(chrome.i18n.getMessage("msgParseError"), false);
    }
  };
  reader.readAsText(file);
});
