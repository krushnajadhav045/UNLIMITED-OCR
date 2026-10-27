import urllib.request
import json

boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
with open(r"C:\Users\krushna\Downloads\Krushna_GenAi_Resume.pdf", "rb") as f:
    pdf_data = f.read()

header = f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"Krushna_GenAi_Resume.pdf\"\r\nContent-Type: application/pdf\r\n\r\n".encode("utf-8")
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
        print("Page count:", len(pages))
        if pages:
            print("Page 1 image prefix:", pages[0].get("image")[:40])
            print("Blocks count:", len(pages[0].get("blocks", [])))
            for b in pages[0].get("blocks", [])[:5]:
                print(f"  [{b['category']}] {b['bbox']} -> {b['content'][:30]}")
except Exception as e:
    print("Request failed:", e)
