async function loadCSV(path){
  const txt = await (await fetch(path)).text();
  const [head, ...rows] = txt.trim().split(/\r?\n/);
  const cols = head.split(",");
  return rows.map(r=>{
    const vals = r.split(",");
    const o={}; cols.forEach((c,i)=>o[c]=vals[i]); return o;
  });
}

function compute(rows){
  const req = ["month","vendor","category","amount","currency"];
  const validCat = new Set(["Hosting","Software","Travel","Ads"]);
  const key = r => `${r.month}|${r.vendor}|${r.category}|${r.amount}|${r.currency}`;

  let nulls=0, dupRate=0;
  const seen = new Map();
  const byMonth = new Map();

  rows.forEach(r=>{
    req.forEach(k=>{ if(!r[k]) nulls++; });
    const k = key(r); seen.set(k, (seen.get(k)||0)+1);
    const amt = parseFloat(r.amount||"0");
    if(!Number.isNaN(amt)) byMonth.set(r.month, (byMonth.get(r.month)||0)+amt);
  });

  let dupRows=0; for(const c of seen.values()) if(c>1) dupRows += (c-1);

  const fields = rows.length * req.length;
  const nullRate = fields? (nulls/fields*100):0;
  dupRate = rows.length? (dupRows/rows.length*100):0;

  return {rows, nullRate, dupRate, byMonth};
}

function render({rows,nullRate,dupRate,byMonth}){
  document.getElementById("rows").textContent = rows.length;
  document.getElementById("nullRate").textContent = `${nullRate.toFixed(2)}%`;
  document.getElementById("dupRate").textContent  = `${dupRate.toFixed(2)}%`;

  // monthly list
  const ul = document.getElementById("byMonth");
  ul.innerHTML = "";
  [...byMonth.entries()].sort().forEach(([m,v])=>{
    const li=document.createElement("li"); li.textContent=`${m}: ${v.toFixed(2)}`; ul.appendChild(li);
  });

  // table
  const th = document.querySelector("#tbl thead"); const tb = document.querySelector("#tbl tbody");
  th.innerHTML = "<tr><th>month</th><th>vendor</th><th>category</th><th>amount</th><th>currency</th></tr>";
  tb.innerHTML = "";
  rows.forEach(r=>{
    const tr=document.createElement("tr");
    tr.innerHTML = `<td>${r.month}</td><td>${r.vendor}</td><td>${r.category}</td><td>${r.amount}</td><td>${r.currency}</td>`;
    tb.appendChild(tr);
  });
}

(async ()=>{
  const rows = await loadCSV("./data/spend.csv");
  render(compute(rows));
})();
