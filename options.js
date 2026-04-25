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

exportBtn.addEventListener("click", () => {
  chrome.storage.local.get("rules", result => {
    const rules = result.rules || [];
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
    
    showMessage("Rules exported successfully!");
  });
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
          typeof rule.text === "string"
        );
        
        if (isValid) {
          chrome.storage.local.set({ rules: data.rules }, () => {
            showMessage("Rules imported successfully!");
            fileInput.value = ""; // Reset input
          });
        } else {
          showMessage("Invalid rule format in the JSON file.", false);
        }
      } else {
        showMessage("Invalid JSON structure. 'rules' array is missing.", false);
      }
    } catch (err) {
      showMessage("Failed to parse JSON file.", false);
    }
  };
  reader.readAsText(file);
});
