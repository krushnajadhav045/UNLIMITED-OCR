import pymupdf
import json
import os

doc = pymupdf.open('Unlimited-OCR.pdf')

def extract_page_blocks(pno):
    page = doc[pno - 1]
    rect = page.rect
    w, h = rect.width, rect.height
    blocks = page.get_text('blocks')
    items = []
    for b in blocks:
        x0, y0, x1, y1, text, block_no, block_type = b
        ny1 = int(round(y0 / h * 1000))
        nx1 = int(round(x0 / w * 1000))
        ny2 = int(round(y1 / h * 1000))
        nx2 = int(round(x1 / w * 1000))
        clean = text.strip()
        if not clean:
            continue
        
        cat = 'text'
        if any(clean.startswith(prefix) for prefix in ['4.', '5.', '4.1', '4.2', '5.1', '1.', '2.', '3.']) and len(clean.split('\n')[0]) < 60:
            cat = 'title'
        elif 'Table ' in clean or 'Figure ' in clean:
            cat = 'title'
        elif clean.isdigit() and len(clean) < 4:
            cat = 'page_number'
            
        items.append({
            'category': cat,
            'bbox': [ny1, nx1, ny2, nx2],
            'content': clean
        })
    return items

data = {}
for p in [1, 5, 8, 9]:
    data[f'page_{p}'] = extract_page_blocks(p)

os.makedirs('assets', exist_ok=True)
with open('assets/sample_ocr_data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print('Extracted sample data for pages:', list(data.keys()))
