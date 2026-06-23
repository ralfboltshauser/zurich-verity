from http.server import BaseHTTPRequestHandler, HTTPServer
import json


USERS = [
    {"id": 1, "email": "alice@example.test", "role": "customer"},
    {"id": 2, "email": "ops@example.test", "role": "operator"},
]


def json_response(handler, status, payload):
    body = json.dumps(payload, indent=2).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


class DemoHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/health":
            json_response(self, 200, {"status": "ok", "service": "zurich-verity-demo"})
            return

        if self.path == "/api/users":
            public_users = [{"id": user["id"], "role": user["role"]} for user in USERS]
            json_response(self, 200, {"users": public_users})
            return

        # VERITY_DEMO_VULNERABLE_START
        if self.path == "/api/debug/users":
            debug_users = [
                {
                    "id": 1,
                    "email": "alice@example.test",
                    "password": "<demo-password-placeholder>",
                    "api_key": "<demo-api-key-placeholder>",
                    "ssn": "<demo-ssn-placeholder>",
                },
                {
                    "id": 2,
                    "email": "ops@example.test",
                    "password": "<demo-password-placeholder>",
                    "api_key": "<demo-api-key-placeholder>",
                    "ssn": "<demo-ssn-placeholder>",
                },
            ]
            json_response(self, 200, {"users": debug_users})
            return
        # VERITY_DEMO_VULNERABLE_END

        json_response(self, 404, {"error": "not found"})

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", 8080), DemoHandler)
    print("zurich-verity-demo listening on http://0.0.0.0:8080", flush=True)
    server.serve_forever()
