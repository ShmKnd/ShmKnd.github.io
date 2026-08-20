#!/usr/bin/env python3
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
csv_path = ROOT / 'data' / 'projects.csv'
out_path = ROOT / 'assets' / 'js' / 'projects-data.js'
text = csv_path.read_text(encoding='utf-8-sig')
out = "/* Auto-generated fallback for file:// local preview.\n" \
      "   Source of truth: data/projects.csv\n" \
      "   Regenerate with: python3 tools/sync_csv.py */\n" \
      "window.PORTFOLIO_CSV_FALLBACK = " + json.dumps(text, ensure_ascii=False) + ";\n"
out_path.write_text(out, encoding='utf-8')
print(f'Wrote {out_path.relative_to(ROOT)} from {csv_path.relative_to(ROOT)}')
