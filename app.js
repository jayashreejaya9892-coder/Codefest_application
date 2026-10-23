// OlympicLens MVP - loads Olympic medalist data from data/all_olympic_medalists.csv
// Note: the source is athlete-level. We deduplicate repeated team-event medal rows
// by Games + country + medal + sport + event name to reduce team-medal overcounting.
const $ = id => document.getElementById(id);
let records = [];
let charts = {};

const sum = (rows, key) => rows.reduce((n, r) => n + (Number(r[key]) || 0), 0);
const withTotal = rows => rows.map(r => ({ ...r, total: r.gold + r.silver + r.bronze }));

// CSV parser that handles quoted values and commas inside quotes.
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], next = text[i + 1];
    if (ch === '"' && quoted && next === '"') { field += '"'; i++; }
    else if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) { row.push(field); field = ""; }
    else if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && next === "\n") i++;
      row.push(field);
      if (row.some(v => v.trim() !== "")) rows.push(row);
      row = []; field = "";
    } else field += ch;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  const headers = (rows.shift() || []).map(h => h.trim().replace(/^\uFEFF/, ""));
  return rows.map(values => Object.fromEntries(headers.map((h, i) => [h, (values[i] || "").trim()])));
}

function buildRecords(csvRows) {
  const seen = new Set();
  const games = [];
  for (const r of csvRows) {
    const year = Number(r.year);
    const medal = (r.medal || "").toLowerCase();
    if (!year || !r.country || !r.season || !["gold", "silver", "bronze"].includes(medal)) continue;

    // A team can have several athlete rows for the same medal in the same event.
    const eventKey = [year, r.season, r.country, medal, r.sport, r.event_name].join("|");
    if (seen.has(eventKey)) continue;
    seen.add(eventKey);
    games.push({
      year,
      season: r.season,
      game: `${year} ${r.season}`,
      country: r.country,
      sport: r.sport || "Unknown",
      gold: medal === "gold" ? 1 : 0,
      silver: medal === "silver" ? 1 : 0,
      bronze: medal === "bronze" ? 1 : 0
    });
  }
  return games;
}

function setOptions(id, values, format = v => v) {
  const select = $(id);
  if (!select) return;
  const previous = select.value;
  select.innerHTML = '<option value="all">All</option>' +
    values.map(v => `<option value="${String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")}">${format(v)}</option>`).join("");
  if ([...select.options].some(o => o.value === previous)) select.value = previous;
}

function populateFilters() {
  const games = [...new Set(records.map(r => r.game))].sort((a, b) => {
    const [ay, as] = a.split(" "), [by, bs] = b.split(" ");
    return Number(ay) - Number(by) || as.localeCompare(bs);
  });
  setOptions("yearFilter", games);
  setOptions("countryFilter", [...new Set(records.map(r => r.country))].sort());
  setOptions("sportFilter", [...new Set(records.map(r => r.sport))].sort());
}

function filteredRecords() {
  const game = $("yearFilter")?.value || "all";
  const country = $("countryFilter")?.value || "all";
  const sport = $("sportFilter")?.value || "all";
  return withTotal(records.filter(r =>
    (game === "all" || r.game === game) &&
    (country === "all" || r.country === country) &&
    (sport === "all" || r.sport === sport)
  ));
}

function drawChart(id, type, labels, datasets, extra = {}) {
  const canvas = $(id);
  if (!canvas || typeof Chart === "undefined") return;
  if (charts[id]) charts[id].destroy();
  charts[id] = new Chart(canvas.getContext("2d"), {
    type,
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: "#c3cee3", boxWidth: 10, font: { size: 11 } } } },
      scales: type === "pie" || type === "doughnut" ? {} : {
        x: { ticks: { color: "#9eabc4", maxRotation: 45, minRotation: 0 }, grid: { color: "#263450" } },
        y: { beginAtZero: true, ticks: { color: "#9eabc4" }, grid: { color: "#263450" } }
      },
      ...extra
    }
  });
}

function render() {
  const rows = filteredRecords();
  ["gold", "silver", "bronze", "total"].forEach(k => {
    const el = $(k + "Kpi");
    if (el) el.textContent = sum(rows, k).toLocaleString();
  });

  const byCountry = {};
  rows.forEach(r => byCountry[r.country] = (byCountry[r.country] || 0) + r.total);
  const countryEntries = Object.entries(byCountry).sort((a, b) => b[1] - a[1]).slice(0, 15);
  drawChart("countryChart", "bar", countryEntries.map(x => x[0]), [{
    label: "Total medals", data: countryEntries.map(x => x[1]),
    backgroundColor: "#78a9ff", borderRadius: 5
  }]);

  const allGames = [...new Set(rows.map(r => r.game))].sort((a, b) => {
    const [ay, as] = a.split(" "), [by, bs] = b.split(" ");
    return Number(ay) - Number(by) || as.localeCompare(bs);
  });
  const selectedCountry = $("countryFilter")?.value || "all";
  const trendCountries = selectedCountry === "all"
    ? ["United States", "China", "India"]
    : [selectedCountry];
  drawChart("trendChart", "line", allGames, trendCountries.map((country, i) => ({
    label: country,
    data: allGames.map(game => sum(rows.filter(r => r.game === game && r.country === country), "total")),
    borderColor: ["#5ce1d0", "#78a9ff", "#f6c85f"][i % 3],
    backgroundColor: "transparent", tension: .3, spanGaps: true
  })));

  const bySport = {};
  rows.forEach(r => bySport[r.sport] = (bySport[r.sport] || 0) + r.total);
  const sportEntries = Object.entries(bySport).sort((a, b) => b[1] - a[1]).slice(0, 10);
  drawChart("sportChart", "doughnut", sportEntries.map(x => x[0]), [{
    label: "Medals", data: sportEntries.map(x => x[1]),
    backgroundColor: ["#78a9ff", "#5ce1d0", "#f6c85f", "#b59aff", "#ff8d9b", "#7bd88f", "#ffb86b", "#8be9fd", "#bd93f9", "#f1fa8c"]
  }], { cutout: "58%" });

  const countries = [...new Set(rows.map(r => r.country))].sort();
  const table = $("medalTable");
  if (table) {
    table.innerHTML = countries.map(c => {
      const cr = rows.filter(r => r.country === c);
      return `<tr><td>${c}</td><td>${sum(cr, "gold")}</td><td>${sum(cr, "silver")}</td><td>${sum(cr, "bronze")}</td><td><strong>${sum(cr, "total")}</strong></td></tr>`;
    }).join("") || '<tr><td colspan="5">No records match these filters.</td></tr>';
  }

  // Simple baseline only: latest available Games total, not a trained ML prediction.
  const all = withTotal(records);
  const forecastCountries = selectedCountry === "all"
    ? ["United States", "China", "Great Britain", "India"]
    : [selectedCountry];
  const prediction = $("predictionList");
  if (prediction) {
    prediction.innerHTML = forecastCountries.map(c => {
      const available = all.filter(r => r.country === c).sort((a, b) => a.year - b.year);
      const latestYear = available.length ? available[available.length - 1].year : null;
      const latest = latestYear === null ? [] : available.filter(r => r.year === latestYear);
      const value = sum(latest, "total");
      return `<div class="prediction-row"><div><strong>${c}</strong><br><span>Latest Games baseline</span></div><div style="text-align:right"><strong>${value} medals</strong><br><small>${latestYear ?? "No data"} · not an ML prediction</small></div></div>`;
    }).join("");
  }
}

async function init() {
  try {
    const response = await fetch("data/all_olympic_medalists.csv");
    if (!response.ok) throw new Error(`CSV file could not be loaded (HTTP ${response.status}).`);
    const csvText = await response.text();
    records = buildRecords(parseCSV(csvText));
    if (!records.length) throw new Error("No medal rows were found. Check the CSV file and column names.");
    populateFilters();
    ["yearFilter", "countryFilter", "sportFilter"].forEach(id => {
      const el = $(id);
      if (el) el.addEventListener("change", render);
    });
    const reset = $("resetBtn");
    if (reset) reset.addEventListener("click", () => {
      ["yearFilter", "countryFilter", "sportFilter"].forEach(id => { if ($(id)) $(id).value = "all"; });
      render();
    });
    render();
    console.info(`OlympicLens loaded ${records.length.toLocaleString()} deduplicated medal-event records.`);
  } catch (error) {
    console.error(error);
    const message = document.createElement("p");
    message.style.cssText = "margin:16px;padding:14px;border:1px solid #ff8d9b;border-radius:10px;color:#ffb8c0;background:#291b2b";
    message.textContent = `${error.message} Start the project with VS Code Live Server and check that the CSV is at data/all_olympic_medalists.csv.`;
    document.body.prepend(message);
  }
}
init();
