import os
from flask import Flask, jsonify, send_from_directory

app = Flask(__name__)
frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

@app.route("/api/hello", methods=["GET"])
def hello():
    return jsonify({"message": "Hello, World!"})

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path.startswith("api"):
        return jsonify({"error": "Not Found"}), 404

    if path == "":
        path = "index.html"

    full_path = os.path.join(frontend_dir, path)
    if os.path.exists(full_path) and os.path.isfile(full_path):
        return send_from_directory(frontend_dir, path)

    return send_from_directory(frontend_dir, "index.html")

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))
