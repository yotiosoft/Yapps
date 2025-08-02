$('#input-textarea').keyup(function() {
    var input = document.getElementById("input-textarea");
    var output = document.getElementById("output-area");

    // Clear previous output
    while (output.firstChild) {
        output.removeChild(output.firstChild);
    }

    // Process each character
    for (var i = 0; i < input.value.length; i++) {
        var char = input.value[i];
        var charBox = document.createElement("span");

        // Common styles for all character boxes
        charBox.style.display = "inline-block";
        charBox.style.textAlign = "center";
        charBox.style.fontFamily = "monospace";

        // Handle newlines separately
        if (char === '\n') {
            output.appendChild(document.createElement("br"));
            continue;
        }

        // Apply color and content based on character type
        if (char.match(/^\t$/)) { // Tab
            charBox.textContent = '\t';
            charBox.title = 'Tab';
            charBox.style.backgroundColor = "#ef454a";
            charBox.style.border = "2px solid #ccc";
        } else if (char.match(/^ $/)) { // Half-width space
            charBox.textContent = ' ';
            charBox.title = 'Half-width space';
            charBox.style.backgroundColor = "#20f582";
            charBox.style.border = "2px solid #ccc";
        } else if (char.match(/^　$/)) { // Full-width space
            charBox.textContent = '　';
            charBox.title = 'Full-width space';
            charBox.style.backgroundColor = "#20c8f5";
            charBox.style.border = "2px solid #ccc";
        } else {
            // Normal character
            charBox.textContent = char;
            charBox.style.border = "1px solid transparent"; // Keep alignment
        }

        output.appendChild(charBox);
    }
});
