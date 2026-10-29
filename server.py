import http.server
import socketserver
import json
import urllib.request
import ssl
import os
import webbrowser
import threading

PORT = int(os.environ.get("PORT", 8000))
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

ZHIPU_API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def do_POST(self):
        if self.path == "/api/zhipu/chat/completions":
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            
            try:
                data = json.loads(body)
                api_key = "98316861ee314f4cab11e93225033be2.7thgUZzcWRK7pv3o"
                
                req = urllib.request.Request(
                    ZHIPU_API_URL,
                    data=json.dumps({
                        "model": "glm-4-flash",
                        "messages": data["messages"]
                    }).encode("utf-8"),
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {api_key}"
                    }
                )
                
                ctx = ssl.create_default_context()
                ctx.check_hostname = False
                ctx.verify_mode = ssl.CERT_NONE
                
                with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
                    result = resp.read().decode("utf-8")
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(result.encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"error": {"message": str(e)}}).encode("utf-8"))
        else:
            self.send_error(404)
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        home_url = f"http://localhost:{PORT}/index.html"
        print(f"服务器启动成功！")
        print(f"访问地址：{home_url}")
        print(f"浏览器将自动打开，按 Ctrl+C 停止服务器")
        # 延迟 1 秒等服务器就绪，再自动用默认浏览器打开首页
        threading.Timer(1.0, lambda: webbrowser.open(home_url)).start()
        httpd.serve_forever()
