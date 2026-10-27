import json

with open('assets/krushna_resume_data.json', 'r', encoding='utf-8') as f:
    krushna_data = json.load(f)

with open('assets/demo_stream_data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove 'const DEMO_DATA = ' prefix and trailing ';' to parse or rewrite
prefix = "const DEMO_DATA = "
if content.startswith(prefix):
    js_body = content[len(prefix):].rstrip()
    if js_body.endswith(';'):
        js_body = js_body[:-1]

# Instead of parsing arbitrary JS, let's inject "krushna_resume" cleanly before the final closing brace
last_brace = content.rfind('};')
if last_brace != -1:
    krushna_json_str = json.dumps(krushna_data, indent=4, ensure_ascii=False)
    # indent by 2 spaces
    indented = '\n'.join('  ' + line for line in krushna_json_str.splitlines())
    new_content = content[:last_brace].rstrip() + ',\n  "krushna_resume": ' + indented.strip() + '\n};\n'
    with open('assets/demo_stream_data.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Merged krushna_resume into assets/demo_stream_data.js successfully!")
else:
    print("Could not find closing };")
