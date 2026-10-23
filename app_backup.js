// OlympicLens MVP. All values below are illustrative demo data, not official statistics.
const records = [
  {year:2008,country:"United States",sport:"Swimming",gold:8,silver:6,bronze:5},
  {year:2008,country:"China",sport:"Gymnastics",gold:7,silver:4,bronze:3},
  {year:2008,country:"Great Britain",sport:"Athletics",gold:3,silver:4,bronze:2},
  {year:2008,country:"Japan",sport:"Wrestling",gold:2,silver:2,bronze:3},
  {year:2008,country:"India",sport:"Wrestling",gold:1,silver:0,bronze:1},
  {year:2012,country:"United States",sport:"Swimming",gold:7,silver:5,bronze:6},
  {year:2012,country:"China",sport:"Gymnastics",gold:5,silver:3,bronze:4},
  {year:2012,country:"Great Britain",sport:"Athletics",gold:4,silver:3,bronze:3},
  {year:2012,country:"Japan",sport:"Wrestling",gold:2,silver:3,bronze:2},
  {year:2012,country:"India",sport:"Badminton",gold:0,silver:1,bronze:1},
  {year:2016,country:"United States",sport:"Swimming",gold:8,silver:7,bronze:4},
  {year:2016,country:"China",sport:"Gymnastics",gold:6,silver:4,bronze:5},
  {year:2016,country:"Great Britain",sport:"Athletics",gold:5,silver:2,bronze:4},
  {year:2016,country:"Japan",sport:"Wrestling",gold:3,silver:2,bronze:3},
  {year:2016,country:"India",sport:"Badminton",gold:0,silver:1,bronze:1},
  {year:2020,country:"United States",sport:"Swimming",gold:9,silver:8,bronze:6},
  {year:2020,country:"China",sport:"Gymnastics",gold:6,silver:5,bronze:4},
  {year:2020,country:"Great Britain",sport:"Athletics",gold:4,silver:4,bronze:3},
  {year:2020,country:"Japan",sport:"Wrestling",gold:5,silver:2,bronze:1},
  {year:2020,country:"India",sport:"Badminton",gold:1,silver:0,bronze:1},
  {year:2024,country:"United States",sport:"Swimming",gold:8,silver:7,bronze:7},
  {year:2024,country:"China",sport:"Gymnastics",gold:7,silver:4,bronze:3},
  {year:2024,country:"Great Britain",sport:"Athletics",gold:3,silver:5,bronze:4},
  {year:2024,country:"Japan",sport:"Wrestling",gold:4,silver:3,bronze:2},
  {year:2024,country:"India",sport:"Badminton",gold:0,silver:1,bronze:1}
];
const $ = id => document.getElementById(id);
const sum = (rows, key) => rows.reduce((n, r) => n + r[key], 0);
const groupSum = (rows, key, valueKey="total") => {
  const out = {};
  rows.forEach(r => { out[r[key]] = (out[r[key]] || 0) + r[valueKey]; });
  return out;
};
const withTotal = rows => rows.map(r => ({...r,total:r.gold+r.silver+r.bronze}));
let charts = {};

function filteredRecords() {
  const year = $("yearFilter").value, country = $("countryFilter").value, sport = $("sportFilter").value;
  return withTotal(records.filter(r =>
    (year === "all" || String(r.year) === year) &&
    (country === "all" || r.country === country) &&
    (sport === "all" || r.sport === sport)
  ));
}
function drawChart(id, type, labels, datasets, extra={}) {
  if (charts[id]) charts[id].destroy();
  const ctx = $(id).getContext("2d");
  charts[id] = new Chart(ctx, {
    type, data:{labels,datasets},
    options: {
  responsive: true,
  maintainAspectRatio: false,
      plugins:{legend:{labels:{color:"#c3cee3",boxWidth:10,font:{size:11}}}},
      scales:type==="pie"?{}:{
        x:{ticks:{color:"#9eabc4"},grid:{color:"#263450"}},
        y:{beginAtZero:true,ticks:{color:"#9eabc4"},grid:{color:"#263450"}}
      }, ...extra}
  });
}
function render() {
  const rows = filteredRecords();
  ["gold","silver","bronze","total"].forEach(k => $(k+"Kpi").textContent = sum(rows,k).toLocaleString());
  const byCountry = groupSum(rows,"country");
  drawChart("countryChart","bar",Object.keys(byCountry),[{label:"Total medals",data:Object.values(byCountry),backgroundColor:"#78a9ff",borderRadius:5}]);
  const years = [...new Set(rows.map(r=>r.year))].sort((a,b)=>a-b);
  const trendCountries = $("countryFilter").value==="all" ? ["United States","China","India"] : [$("countryFilter").value];
  drawChart("trendChart","line",years,trendCountries.map((country,i)=>({
    label:country,
    data:years.map(y=>sum(rows.filter(r=>r.year===y&&r.country===country),"total")),
    borderColor:["#5ce1d0","#78a9ff","#f6c85f"][i%3],backgroundColor:"transparent",tension:.3,spanGaps:true
  })));
  const bySport = groupSum(rows,"sport");
  drawChart("sportChart","doughnut",Object.keys(bySport),[{label:"Medals",data:Object.values(bySport),backgroundColor:["#78a9ff","#5ce1d0","#f6c85f","#b59aff","#ff8d9b"]}],{cutout:"58%"});
  const countries = [...new Set(rows.map(r=>r.country))];
  $("medalTable").innerHTML = countries.map(c=>{
    const cr=rows.filter(r=>r.country===c);
    return `<tr><td>${c}</td><td>${sum(cr,"gold")}</td><td>${sum(cr,"silver")}</td><td>${sum(cr,"bronze")}</td><td><strong>${sum(cr,"total")}</strong></td></tr>`;
  }).join("") || '<tr><td colspan="5">No records match these filters.</td></tr>';
  // Demo-only baseline: use each country's latest available total. Not a trained ML model.
  const all = withTotal(records);
  const forecastCountries = $("countryFilter").value==="all" ? ["United States","China","Great Britain","India"] : [$("countryFilter").value];
  $("predictionList").innerHTML = forecastCountries.map(c=>{
    const available = all.filter(r=>r.country===c).sort((a,b)=>a.year-b.year);
    const latest = available[available.length-1];
    const value = latest ? latest.total : 0;
    return `<div class="prediction-row"><div><strong>${c}</strong><br><span>Baseline estimate</span></div><div style="text-align:right"><strong>${value} medals</strong><br><small>Illustrative only</small></div></div>`;
  }).join("");
}
["yearFilter","countryFilter","sportFilter"].forEach(id => $(id).addEventListener("change",render));
$("resetBtn").addEventListener("click",()=>{ $("yearFilter").value="all"; $("countryFilter").value="all"; $("sportFilter").value="all"; render(); });
render();