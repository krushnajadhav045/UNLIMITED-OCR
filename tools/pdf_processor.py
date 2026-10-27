import pymupdf
import base64
from rapidocr_onnxruntime import RapidOCR

# Lazy loaded OCR engine
_ocr_engine = None

def get_ocr_engine():
    global _ocr_engine
    if _ocr_engine is None:
        _ocr_engine = RapidOCR()
    return _ocr_engine

def process_pdf_bytes(pdf_bytes, filename='document.pdf'):
    doc = pymupdf.open(stream=pdf_bytes, filetype='pdf')
    pages_data = []
    
    for i, page in enumerate(doc):
        rect = page.rect
        w, h = rect.width, rect.height
        pix = page.get_pixmap(dpi=150)
        img_bytes = pix.tobytes('png')
        img_b64 = 'data:image/png;base64,' + base64.b64encode(img_bytes).decode('utf-8')
        
        # 1. Try digital text extraction first
        blocks = page.get_text('blocks')
        page_blocks = []
        b_idx = 0
        
        for b in blocks:
            x0, y0, x1, y1, text, block_no, block_type = b
            clean = text.strip()
            if not clean:
                continue
            
            # normalize to 0..1000 scale [x1, y1, x2, y2]
            nx1 = max(0, min(1000, int(round(x0 / w * 1000))))
            ny1 = max(0, min(1000, int(round(y0 / h * 1000))))
            nx2 = max(0, min(1000, int(round(x1 / w * 1000))))
            ny2 = max(0, min(1000, int(round(y1 / h * 1000))))
            
            first_line = clean.split('\n')[0].strip()
            cat = 'text'
            
            if len(first_line) < 45 and (first_line.isupper() or any(first_line.lower().startswith(k) for k in [
                'experience', 'education', 'skills', 'project', 'summary', 'profile', 
                'certif', 'objective', 'technical', 'work', 'awards', 'table', 'figure'
            ])):
                cat = 'title'
            elif len(clean) < 30 and (clean.isupper() or b_idx < 3):
                cat = 'title'
            elif '|' in clean and '\n' in clean:
                cat = 'table'
                
            b_idx += 1
            page_blocks.append({
                'id': f'p{i+1}-b{b_idx}',
                'category': cat,
                'bbox': [nx1, ny1, nx2, ny2],
                'content': clean
            })
            
        # 2. If page has 0 digital text blocks, it is a SCANNED or HANDWRITTEN document!
        # Fallback to RapidOCR
        if len(page_blocks) == 0:
            engine = get_ocr_engine()
            ocr_result, _ = engine(img_bytes)
            if ocr_result:
                pw, ph = pix.width, pix.height
                for item in ocr_result:
                    box, text, score = item
                    clean = text.strip()
                    if not clean:
                        continue
                        
                    min_x = min(pt[0] for pt in box)
                    min_y = min(pt[1] for pt in box)
                    max_x = max(pt[0] for pt in box)
                    max_y = max(pt[1] for pt in box)
                    
                    nx1 = max(0, min(1000, int(round(min_x / pw * 1000))))
                    ny1 = max(0, min(1000, int(round(min_y / ph * 1000))))
                    nx2 = max(0, min(1000, int(round(max_x / pw * 1000))))
                    ny2 = max(0, min(1000, int(round(max_y / ph * 1000))))
                    
                    cat = 'text'
                    if clean.endswith(':') or clean.startswith(('1]', '2]', '3]', '4]', '•', '#')) or len(clean) < 18:
                        cat = 'title'
                    
                    b_idx += 1
                    page_blocks.append({
                        'id': f'p{i+1}-b{b_idx}',
                        'category': cat,
                        'bbox': [nx1, ny1, nx2, ny2],
                        'content': clean
                    })
                    
        pages_data.append({
            'pageNumber': i + 1,
            'image': img_b64,
            'aspectRatio': w / h,
            'blocks': page_blocks
        })
        
    return {'title': filename, 'pages': pages_data}

def process_image_bytes(img_bytes, filename='image.png'):
    pw, ph = 1241, 1754
    aspect_ratio = pw / ph
    
    # Try reading dimensions
    try:
        doc = pymupdf.open(stream=img_bytes, filetype='png')
        page = doc[0]
        pw, ph = page.rect.width, page.rect.height
        aspect_ratio = pw / ph
    except Exception:
        pass
        
    engine = get_ocr_engine()
    ocr_result, _ = engine(img_bytes)
    page_blocks = []
    b_idx = 0
    
    if ocr_result:
        for item in ocr_result:
            box, text, score = item
            clean = text.strip()
            if not clean:
                continue
            min_x = min(pt[0] for pt in box)
            min_y = min(pt[1] for pt in box)
            max_x = max(pt[0] for pt in box)
            max_y = max(pt[1] for pt in box)
            
            nx1 = max(0, min(1000, int(round(min_x / pw * 1000))))
            ny1 = max(0, min(1000, int(round(min_y / ph * 1000))))
            nx2 = max(0, min(1000, int(round(max_x / pw * 1000))))
            ny2 = max(0, min(1000, int(round(max_y / ph * 1000))))
            
            cat = 'text'
            if clean.endswith(':') or len(clean) < 18:
                cat = 'title'
                
            b_idx += 1
            page_blocks.append({
                'id': f'p1-b{b_idx}',
                'category': cat,
                'bbox': [nx1, ny1, nx2, ny2],
                'content': clean
            })
            
    img_b64 = 'data:image/png;base64,' + base64.b64encode(img_bytes).decode('utf-8')
    return {
        'title': filename,
        'pages': [
            {
                'pageNumber': 1,
                'image': img_b64,
                'aspectRatio': aspect_ratio,
                'blocks': page_blocks
            }
        ]
    }

if __name__ == '__main__':
    with open(r'C:\Users\krushna\Downloads\Scanned_20260907_122448.pdf', 'rb') as f:
        res = process_pdf_bytes(f.read(), 'Scanned_20260907_122448.pdf')
    print('Pages:', len(res['pages']))
    for p in res['pages']:
        print(f"Page {p['pageNumber']} blocks:", len(p['blocks']))
        for b in p['blocks'][:5]:
            print(f"  [{b['category']}] {b['bbox']} -> {b['content']}")
