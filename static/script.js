window.onload = function() {
  var parts = window.location.pathname.split("/");
  if (parts.length >= 3 && parts[1] != "-") {
    document.querySelector("#src").value = decodeURIComponent(parts[1]);
    document.querySelector("#dest").value = decodeURIComponent(parts[2]);
    update();
  }
  document.querySelectorAll(".input input").forEach(function(el) {
    el.addEventListener("keyup", function(e) {
      update();
    });
  });
};

function update() {
  var src = document.querySelector("#src").value;
  var dst = document.querySelector("#dest").value;
  var enc = [encodeURIComponent(src), encodeURIComponent(dst)];
  var path = enc.join("/");
  history.replaceState(enc, path, "/" + path);

  renderTransform(showTransform(src, dst));
}

function renderTransform(steps) {
  var out = "";
  for (var i = 0; i < steps.length; i++) {
    out += `<div class="iteration"><div class="number number${i}">${i}</div><div class="text">`;
    if (steps[i][0]) {
      steps[i][1] = steps[i][1].map(function(s) {
        var out = s.replace(/&/g, "&amp;");
        out = out.replace(/</g, "&lt;");
        out = out.replace(/>/g, "&gt;");
        return out;
      });
    }
    switch (steps[i][0]) {
      case false:
        out += steps[i][1][0];
        break;
      case "del":
        out += steps[i][1][0];
        out += '<span class="delete"></span>';
        out += steps[i][1][1];
        break;
      case "ins":
        out += steps[i][1][0];
        if (steps[i][1][1] == " ") {
          out += `<span class="insert space">${steps[i][1][1]}</span>`;
        } else {
          out += `<span class="insert">${steps[i][1][1]}</span>`;
        }
        out += steps[i][1][2];
        break;
      case "rep":
        out += steps[i][1][0];
        if (steps[i][1][1] == " ") {
          out += `<span class="replace space">${steps[i][1][1]}</span>`;
        } else {
          out += `<span class="replace">${steps[i][1][1]}</span>`;
        }
        out += steps[i][1][2];
        break;
    }
    out += "</div></div>";
  }
  document.querySelector(".output").innerHTML = out;
}

function showTransform(start, end) {
  var steps = levSteps(start, end);
  // console.log(steps);
  var out = [[false, [start]]];
  var pos = 0;
  for (var i = 0; i < steps.length; i++) {
    // console.log(out);
    var last = out[out.length - 1][1].join("");
    switch (steps[i][0]) {
      case false:
        pos++;
        break;
      case "rep":
        out.push(repAt(last, pos, steps[i][1]));
        pos++;
        break;
      case "ins":
        out.push(insAt(last, pos, steps[i][1]));
        pos++;
        break;
      case "del":
        out.push(delAt(last, pos, steps[i][1]));
        break;
    }
  }
  return out;
}

// https://stackoverflow.com/a/41445241/
function levSteps(a, b) {
  var m = new Array(a.length + 1);

  for (var i = 0; i < m.length; i++) {
    m[i] = new Array(b.length + 1);

    for (var j = 0; j < m[i].length; j++) {
      if (i === 0) m[i][j] = j;
      if (j === 0) m[i][j] = i;
    }
  }

  for (var i = 1; i <= a.length; i++) {
    for (var j = 1; j <= b.length; j++) {
      // no change needed
      if (a[i - 1] === b[j - 1]) {
        m[i][j] = m[i - 1][j - 1];

        // choose deletion or insertion
      } else {
        m[i][j] = Math.min(m[i - 1][j], m[i][j - 1], m[i - 1][j - 1]) + 1;
      }
    }
  }

  var i = a.length,
    j = b.length,
    instructions = [];

  while (i !== 0 && j !== 0) {
    if (a[i - 1] === b[j - 1]) {
      instructions.unshift([false]);
      i--;
      j--;
    } else if (m[i - 1][j] < m[i][j - 1]) {
      instructions.unshift(["del"]);
      i--;
    } else if (m[i - 1][j] === m[i][j - 1]) {
      instructions.unshift(["rep", b[j - 1]]);
      i--;
      j--;
    } else {
      instructions.unshift(["ins", b[j - 1]]);
      j--;
    }
  }

  if (i === 0 && j > 0) {
    while (j > 0) {
      instructions.unshift(["ins", b[j - 1]]);
      j--;
    }
  } else if (j === 0 && i > 0) {
    while (i > 0) {
      instructions.unshift(["del"]);
      i--;
    }
  }

  // console.log(instructions);
  return instructions;
}

function insAt(str, pos, char) {
  return ["ins", [str.substring(0, pos), char, str.substring(pos)]];
}

function delAt(str, pos) {
  return ["del", [str.substring(0, pos), str.substring(pos + 1)]];
}

function repAt(str, pos, char) {
  return ["rep", [str.substring(0, pos), char, str.substring(pos + 1)]];
}
