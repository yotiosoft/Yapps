$('#input-textarea').on('input', function () {
  const input = this.value;
  const output = document.getElementById("output-area");
  output.innerHTML = '';

  let tab_char = false, half_space_char = false, full_space_char = false;
  let bcg = document.createElement("span");

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (ch === "\t") {
      if (!tab_char) {
        if (bcg.textContent) output.appendChild(bcg);
        tab_char = true; half_space_char = false; full_space_char = false;
        bcg = document.createElement("span");
        bcg.className = "tab";
      }
      bcg.textContent += "\t";
    }
    else if (ch === " ") {
      if (!half_space_char) {
        if (bcg.textContent) output.appendChild(bcg);
        half_space_char = true; full_space_char = false; tab_char = false;
        bcg = document.createElement("span");
        bcg.className = "half-space";
      }
      bcg.textContent += " ";
    }
    else if (ch === "　") {
      if (!full_space_char) {
        if (bcg.textContent) output.appendChild(bcg);
        full_space_char = true; half_space_char = false; tab_char = false;
        bcg = document.createElement("span");
        bcg.className = "full-space";
      }
      bcg.textContent += ch;
    }
    else {
      if (tab_char || half_space_char || full_space_char) {
        if (bcg.textContent) output.appendChild(bcg);
        tab_char = half_space_char = full_space_char = false;
        bcg = document.createElement("span");
      }
      bcg.textContent += ch;
    }
  }

  if (bcg.textContent) output.appendChild(bcg);
});
