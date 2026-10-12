document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-share-copy]");
  if (button) {
    const menu = button.closest(".share-menu");
    const input = menu.querySelector(".share-url-row input");
    const status = menu.querySelector(".share-copy-status");
    try {
      await navigator.clipboard.writeText(input.value);
      status.textContent = "URLをコピーしました。";
    } catch {
      input.select();
      const copied = document.execCommand("copy");
      status.textContent = copied ? "URLをコピーしました。" : "コピーできませんでした。URLを選択してコピーしてください。";
    }
    return;
  }
  for (const details of document.querySelectorAll(".share-actions[open]")) {
    if (!details.contains(event.target)) details.open = false;
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const details = document.querySelector(".share-actions[open]");
  if (details) {
    details.open = false;
    details.querySelector("summary").focus();
  }
});
