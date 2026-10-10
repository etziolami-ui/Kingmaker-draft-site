/* Renders data/conformance.json into the conformance panel.
   Vanilla JS, no dependencies. All percentages are computed here, client-side,
   from the raw counts in the snapshot — nothing is pre-baked into the HTML. */
(function () {
  "use strict";

  var wrap = document.getElementById("conf-table-wrap");
  var meta = document.getElementById("conf-meta");
  var decompose = document.getElementById("conf-decompose");

  var BREAKDOWN = [
    ["failed", "failed", "chip-failed"],
    ["timed_out", "timed out", "chip-timeout"],
    ["crashed", "crashed", "chip-crash"],
    ["harness_errors", "harness errors", "chip-harness"],
    ["skipped", "skipped", "chip-skipped"],
    ["not_run", "not run", "chip-notrun"]
  ];

  function fmt(n) {
    return Number(n).toLocaleString("en-US");
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // Seal timestamp "20261010T131758Z-194d7e512b3c" -> "2026-10-10 13:17:58 UTC".
  function sealDate(seal) {
    var m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/.exec(seal || "");
    return m ? m[1] + "-" + m[2] + "-" + m[3] + " " + m[4] + ":" + m[5] + ":" + m[6] + " UTC" : null;
  }

  function fail(message) {
    wrap.removeAttribute("aria-busy");
    wrap.textContent = "";
    wrap.appendChild(el("p", "conf-error", message));
  }

  function buildTable(names, suites) {
    var table = el("table", "conf");
    var thead = el("thead");
    var headRow = el("tr");
    ["Catalog", "Passed", "Attempted", "Pass rate", "Itemized non-passes", "Freshness"].forEach(
      function (h, i) {
        var th = el("th", i >= 1 && i <= 3 ? "num" : null, h);
        th.scope = "col";
        if (i === 4) th.classList.add("wide-col");
        headRow.appendChild(th);
      }
    );
    thead.appendChild(headRow);
    table.appendChild(thead);

    var tbody = el("tbody");
    names.forEach(function (name) {
      var s = suites[name];
      var pct = (s.passed / s.attempted) * 100;
      var tr = el("tr");

      var labelCell = el("td");
      labelCell.appendChild(el("span", "suite-label", s.label || name));
      labelCell.appendChild(el("span", "suite-id", name));
      tr.appendChild(labelCell);

      tr.appendChild(el("td", "num", fmt(s.passed)));
      tr.appendChild(el("td", "num", fmt(s.attempted)));
      tr.appendChild(el("td", "rate", pct.toFixed(1) + "%"));

      var chips = el("td");
      var chipWrap = el("div", "chips");
      BREAKDOWN.forEach(function (pair) {
        var key = pair[0], label = pair[1], cls = pair[2];
        var v = s[key];
        if (typeof v === "number" && v > 0) {
          chipWrap.appendChild(el("span", "chip " + cls, label + " " + fmt(v)));
        }
      });
      chips.appendChild(chipWrap);
      tr.appendChild(chips);

      var fresh = el("td");
      if (s.measured === true) {
        fresh.appendChild(el("span", "badge badge-fresh", "fresh"));
      } else if (s.measured === false) {
        fresh.appendChild(el("span", "badge badge-carried", "carried from an earlier run"));
      } else {
        fresh.appendChild(el("span", "badge", "not yet measured"));
      }
      tr.appendChild(fresh);

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    return table;
  }

  function render(snapshot) {
    var suites = snapshot.suites || {};
    var names = Object.keys(suites);

    if (!names.length) {
      fail("The snapshot contains no suites — nothing has been measured yet.");
      return;
    }

    meta.textContent = "";
    var sealLine = "Snapshot seal " + (snapshot.board_run || "unknown") +
      (sealDate(snapshot.board_run) ? " · taken " + sealDate(snapshot.board_run) : "") +
      " · " + names.length + " catalogs";
    meta.appendChild(document.createTextNode(sealLine));

    wrap.removeAttribute("aria-busy");
    wrap.textContent = "";
    wrap.appendChild(buildTable(names, suites));

    // Verification, not decoration: does every suite's itemization actually sum
    // to its attempted count? State the result either way.
    var KEYS = ["passed", "failed", "timed_out", "crashed", "harness_errors", "skipped", "not_run"];
    var allExact = names.every(function (n) {
      var s = suites[n];
      var sum = KEYS.reduce(function (acc, k) { return acc + (typeof s[k] === "number" ? s[k] : 0); }, 0);
      return sum === s.attempted;
    });
    decompose.textContent = allExact
      ? "Checked live against the snapshot: for every catalog, passed + failed + timed out + crashed + harness errors + skipped + not run sums exactly to attempted. No row is hidden or averaged away."
      : "Note: one or more catalogs in this snapshot do not itemize every attempted row — the pass rate above counts only the rows shown.";
  }

  fetch("data/conformance.json", { cache: "no-cache" })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(render)
    .catch(function () {
      fail("Conformance numbers could not be loaded (data/conformance.json is missing or unreadable). No numbers are claimed here — treat every figure as \u201Cnot yet measured\u201D until the data file is present.");
    });
})();
