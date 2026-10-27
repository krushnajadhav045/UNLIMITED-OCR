"""
Unlimited-OCR Visualization Web Server
Serves the interactive web UI and provides a real-time PDF/image document parsing endpoint.
"""

import http.server
import socketserver
import os
import sys
import json
import base64
import email
import pymupdf

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(DIRECTORY, "assets", "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

from tools.pdf_processor import process_pdf_bytes, process_image_bytes

def parse_pdf_document(pdf_bytes, filename="document.pdf"):
    return process_pdf_bytes(pdf_bytes, filename)

def parse_image_document(img_bytes, filename="image.png"):
    return process_image_bytes(img_bytes, filename)

class UnlimitedOCRHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path.startswith("/api/upload") or self.path.startswith("/api/parse"):
            print(f"[upload] Request started: {self.path}", flush=True)
            content_type = self.headers.get("Content-Type", "")
            content_length = int(self.headers.get("Content-Length", 0))
            
            if content_length == 0:
                self.send_error_response("Empty request body")
                return
                
            body = self.rfile.read(content_length)
            
            # Parse multipart/form-data using email.message_from_bytes
            header_bytes = f"Content-Type: {content_type}\r\n\r\n".encode("utf-8")
            msg = email.message_from_bytes(header_bytes + body)
            
            uploaded_file = None
            filename = "document.pdf"
            
            if msg.is_multipart():
                for part in msg.get_payload():
                    part_filename = part.get_filename()
                    if part_filename:
                        uploaded_file = part.get_payload(decode=True)
                        filename = part_filename
                        break
            else:
                uploaded_file = body
                
            if not uploaded_file:
                self.send_error_response("No file found in upload")
                return
                
            try:
                if filename.lower().endswith(".pdf"):
                    result = parse_pdf_document(uploaded_file, filename)
                else:
                    result = parse_image_document(uploaded_file, filename)
                    
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "data": result}).encode("utf-8"))
            except Exception as e:
                print(f"[upload] Processing failed: {e}", flush=True)
                self.send_error_response(f"Failed to process document: {str(e)}")
        else:
            self.send_response(404)
            self.end_headers()

    def send_error_response(self, error_message):
        self.send_response(400)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"success": False, "error": error_message}).encode("utf-8"))

def main():
    os.chdir(DIRECTORY)

    class ThreadingHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
        allow_reuse_address = True
        daemon_threads = True

    with ThreadingHTTPServer(("", PORT), UnlimitedOCRHandler) as httpd:
        print("==================================================")
        print(f" Unlimited-OCR Visualization Server Ready")
        print(f" URL: http://localhost:{PORT}")
        print("==================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")

if __name__ == "__main__":
    main()
