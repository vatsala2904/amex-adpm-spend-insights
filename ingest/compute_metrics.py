import csv, collections, math

SRC = "data/sample/spend.csv"
required = ["month","vendor","category","amount","currency"]
valid_categories = {"Hosting","Software","Travel","Ads"}
valid_currencies = {"USD","INR"}

rows = []
with open(SRC, newline="") as f:
    r = csv.DictReader(f)
    assert set(required).issubset(r.fieldnames), "Missing required columns"
    for i,row in enumerate(r, start=1):
        rows.append(row)

N = len(rows)
nulls = 0
dups_counter = collections.Counter()
valid_category = 0
positive_amount = 0
valid_currency = 0
spend_by_month = collections.defaultdict(float)

for row in rows:
    # nulls
    for k in required:
        if row[k] is None or row[k]=="":
            nulls += 1
    # dup key
    dkey = (row["month"], row["vendor"], row["category"], row["amount"], row["currency"])
    dups_counter[dkey] += 1
    # checks
    if row["category"] in valid_categories:
        valid_category += 1
    try:
        amt = float(row["amount"])
    except ValueError:
        amt = math.nan
    if isinstance(amt,float) and amt>0:
        positive_amount += 1
        spend_by_month[row["month"]] += amt
    if row["currency"] in valid_currencies:
        valid_currency += 1

dup_rows = sum(c-1 for c in dups_counter.values() if c>1)
fields_checked = N*len(required)
null_rate = (nulls/fields_checked*100) if fields_checked else 0.0
dup_rate = (dup_rows/N*100) if N else 0.0
valid_cat_pct = (valid_category/N*100) if N else 0.0
positive_amt_pct = (positive_amount/N*100) if N else 0.0
valid_ccy_pct = (valid_currency/N*100) if N else 0.0

print("# Data Quality Summary")
print(f"- rows: {N}")
print(f"- null_rate: {null_rate:.2f}% (target < 1%)")
print(f"- duplicate_row_rate: {dup_rate:.2f}% (target = 0%)")
print(f"- valid_category_pct: {valid_cat_pct:.2f}% (target = 100%)")
print(f"- positive_amount_pct: {positive_amt_pct:.2f}% (target = 100%)")
print(f"- valid_currency_pct: {valid_ccy_pct:.2f}% (target = 100%)")
print("\n## Monthly Spend (sum)")
for m,amt in sorted(spend_by_month.items()):
    print(f"- {m}: {amt:.2f}")
