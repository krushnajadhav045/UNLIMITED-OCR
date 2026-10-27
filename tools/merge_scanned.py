import json

with open('assets/scanned_notebook_data.json', 'r', encoding='utf-8') as f:
    scanned_data = json.load(f)

with open('assets/demo_stream_data.js', 'r', encoding='utf-8') as f:
    content = f.read()

last_brace = content.rfind('};')
if last_brace != -1:
    scanned_json_str = json.dumps(scanned_data, indent=4, ensure_ascii=False)
    indented = '\n'.join('  ' + line for line in scanned_json_str.splitlines())
    new_content = content[:last_brace].rstrip() + ',\n  "scanned_notebook": ' + indented.strip() + '\n};\n'
    with open('assets/demo_stream_data.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Merged scanned_notebook into assets/demo_stream_data.js successfully!")
else:
    print("Could not find closing };")
