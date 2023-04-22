const rulesContainer = document.querySelector("#rulesContainer");
const ruleTemplate = document.querySelector("#ruleTemplate");
const noRuleRow = rulesContainer.querySelector(".no-item-row");

const saveRules = () => {
  const rows = rulesContainer.querySelectorAll(".rule-row:not(#ruleTemplate)");
  const rules = [...rows].map(row => {
    return {
      id: Number(row.dataset.id),
      type: row.querySelector(".rule-type").dataset.type,
      text: row.querySelector(".rule-text").textContent
    }
  });
  chrome.storage.local.set({ rules: rules });
};

const createRuleRow = (id, type, word) => {
  const row = ruleTemplate.cloneNode(true);

  const typeContent = {
    "contains": "Contains",
    "equals": "Equals",
    "regexp": "Regular expression"
  }[type];

  row.id = "";
  row.dataset.id = id,
  row.querySelector(".rule-type").textContent = typeContent;
  row.querySelector(".rule-type").dataset.type = type;
  row.querySelector(".rule-text").textContent = word;
  row.style.display = "table-row";

  const deleteBtn = row.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", () => {
    rulesContainer.removeChild(row);
    saveRules();
    if (rulesContainer.querySelectorAll(".rule-row:not(#ruleTemplate)").length === 0) {
      noRuleRow.classList.remove("is-hidden");
    }
  });

  rulesContainer.prepend(row);
  noRuleRow.classList.add("is-hidden");
}

const addRule = () => {
  const inputType = document.querySelector(".input-rule-type");
  const inputText = document.querySelector(".input-rule-text");

  if (!inputText.value) {
    inputText.classList.add("is-danger");
    inputText.focus();
    return;
  }

  const id = (new Date()).getTime();
  createRuleRow(id, inputType.value, inputText.value);
  saveRules();

  inputText.classList.remove("is-danger");
  inputType.value = "contains";
  inputText.value = "";
  inputText.focus();
}

document.querySelector("#addBtn").addEventListener("click", addRule);

document.querySelector(".vc-switch-input").addEventListener("change", event => {
  const checked = event.target.checked ? "on" : "off";
  chrome.storage.local.set({ power: checked });
});

document.querySelector(".input-rule-text").addEventListener("keypress", event => {
  if (event.key === "Enter") {
    addRule();
  }
});

chrome.storage.local.get("power", result => {
  const power = result.power || "on";
  const powerSwitch = document.querySelector(".vc-switch-input");

  switch (power) {
    case "on":
      powerSwitch.checked = true;
      break;
    case "off":
      powerSwitch.checked = false;
      break;
  }
});

chrome.storage.local.get("rules", result => {
  if (result.rules.length !== 0) {
    result.rules.sort((a, b) => a.id - b.id).forEach((rule) => createRuleRow(rule.id, rule.type, rule.text));
  }
});
