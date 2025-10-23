from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/", methods=["GET"])
def static_route():
    pass

@app.route("/api/hello", methods=["GET"])
def hello():
    return jsonify({"message": "Hello, World!"})

if __name__ == "__main__":
    app.run(port=5000)
