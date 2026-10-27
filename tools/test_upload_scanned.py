import urllib.request
import json

boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
with open(r"C:\Users\krushna\Downloads\Scanned_20260907_122448.pdf", "rb") as f:
    pdf_data = f.read()

header = f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"Scanned_20260907_122448.pdf\"\r\nContent-Type: application/pdf\r\n\r\n".encode("utf-8")
footer = f"\r\n--{boundary}--\r\n".encode("utf-8")
body = header + pdf_data + footer

req = urllib.request.Request(
    "http://127.0.0.1:8080/api/upload",
    data=body,
    headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
)

try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        print("API Success:", res.get("success"))
        doc = res.get("data", {})
        print("Document Title:", doc.get("title"))
        pages = doc.get("pages", [])
        print("Total Pages:", len(pages))
        for p in pages:
            print(f"Page {p['pageNumber']} detected blocks:", len(p.get("blocks", [])))
            for b in p.get("blocks", [])[:4]:
                print(f"   [{b['category']}] {b['bbox']} -> {b['content']}")
except Exception as e:
    print("Request failed:", e)
