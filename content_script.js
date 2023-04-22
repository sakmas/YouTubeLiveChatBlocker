let enabled;
let rules = [];
let chatObserver;

const elName = Object.freeze({
  yt: {
    messageTag: "yt-live-chat-text-message-renderer",
    messageClass: "yt-live-chat-item-list-renderer"
  },
  ytlcb: {
    filterdItemClass: "ytlcb-filterd-item"
  }
});

const filter = nodes => {
  nodes.forEach(node => {
    const message = ((node.querySelector("#message") || []).textContent || "");

    const mached = rules.some(word => {
      switch (word.type) {
        case "contains":
          return message.includes(word.text);
        case "equals":
          return message === word.text;
        case "regexp":
          const regexp = new RegExp(word.text);
          return regexp.test(message);
        default:
          return false;
      }
    });

    if (mached) {
      node.classList.add(elName.ytlcb.filterdItemClass);
    }
  });
};

const filterAll = () => {
  const nodes = document.querySelectorAll(`${elName.yt.messageTag}.${elName.yt.messageClass}`);

  nodes.forEach(node => node.classList.remove(elName.ytlcb.filterdItemClass));
  if (rules.length !== 0) {
    filter(nodes);
  }
};

const resetFilterAll = () => {
  const nodes = document.querySelectorAll(`.${elName.ytlcb.filterdItemClass}`);
  nodes.forEach(node => node.classList.remove(elName.ytlcb.filterdItemClass));
};

const init = () => {
  const style = document.createElement("style");
  style.textContent = `
    ${elName.yt.messageTag}.${elName.ytlcb.filterdItemClass} {
      display: none !important;
    }
  `;
  document.head.appendChild(style);

  const chatListNode = document.querySelector("#chat");

  if (chatListNode) {
    if (enabled) {
      filterAll();
      chatObserver.observe(chatListNode, { childList: true, subtree: true });
    }
  } else {
    const rootNode = document.querySelector("body");
    rootObserver.observe(rootNode, { childList: true, subtree: true });
  }
};

const rootObserver = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    const chatListNode = [...mutation.addedNodes].filter(node => {
      return node.nodeType === Node.ELEMENT_NODE && node.id === "chat";
    });
    if (chatListNode) {
      if (enabled) {
        filterAll();
        chatObserver.observe(chatListNode, { childList: true, subtree: true });
      }
      rootObserver.disconnect();
    }
  });
});

chatObserver = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    const chatNodes = [...mutation.addedNodes].filter(node => {
      return node.nodeType === Node.ELEMENT_NODE && node.classList.contains(elName.yt.messageClass);
    });
    filter(chatNodes);
  });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  const changedKey = Object.keys(changes)[0];
  switch (changedKey) {
    case "power":
      switch (changes.power.newValue) {
        case "on":
          filterAll();
          const chatListNode = document.querySelector("#chat");
          chatObserver.observe(chatListNode, { childList: true, subtree: true });
          enabled = true;
          break;
        case "off":
          chatObserver.disconnect();
          resetFilterAll();
          enabled = false;
          break;
      }
      break;

    case "rules":
      rules = changes.rules.newValue;
      if (enabled) {
        filterAll();
      }
      break;
  }
});

(async () => {
  const power = await chrome.storage.local.get("power").power;
  enabled = { "on": true, "off": false }[power || "on"];

  rules = (await chrome.storage.local.get("rules")).rules;

  init();
})();
