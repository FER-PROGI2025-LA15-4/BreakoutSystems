# app.py
import os
import sqlite3
from flask import Flask, jsonify, request, send_from_directory, session
from flask_login import LoginManager, current_user,login_required
from config import Config
from auth import auth_bp, init_oauth, get_db_connection, DB_PATH
from models import User

app = Flask(__name__)
app.frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
app.config.from_object(Config)

login_manager = LoginManager()
login_manager.init_app(app)
init_oauth(app)
app.register_blueprint(auth_bp)

SCHEMA_SQL_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'base.sql')



@login_manager.user_loader
def load_user(username):
    db = get_db_connection()
    user_row = db.execute("SELECT * FROM Korisnik WHERE username = ?", (username,)).fetchone()
    db.close()
    if user_row:
        return User(dict(user_row))
    return None

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    if path.startswith("api"): return jsonify({"error": "Not Found"}), 404
    if path == "": path = "index.html"
    full_path = os.path.join(app.frontend_dir, path)
    if os.path.exists(full_path) and os.path.isfile(full_path):
        return send_from_directory(app.frontend_dir, path)
    return send_from_directory(app.frontend_dir, "index.html")


@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({'error': 'Unauthorized', 'authenticated': False}), 401

def init_db():

    db = get_db_connection()
    sql_path = os.path.join(os.path.dirname(__file__), 'database', 'base.sql')
    if os.path.exists(sql_path):
        with open(sql_path, 'r', encoding='utf-8') as f:
            db.executescript(f.read())

    # test_sql = os.path.join(os.path.dirname(__file__), 'database', 'test_skripta.sql')
    # if os.path.exists(test_sql):
    #     try:
    #         with open(test_sql, 'r', encoding='utf-8') as f:
    #             db.executescript(f.read())
    #     except Exception as e:
    #         print(f"GREŠKA u test_skripta.sql: {e}")

    db.close()



if __name__ == '__main__':
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    init_db()

    app.run(debug=True, port=5000, host='0.0.0.0')