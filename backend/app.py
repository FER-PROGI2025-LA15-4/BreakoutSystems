import os
from flask import Flask, jsonify, send_from_directory
from flask_login import LoginManager
from config import Config
from auth import auth_bp, init_oauth
from models import User
from apscheduler.schedulers.background import BackgroundScheduler
from mail import send_reminder
from escape_room import room_bp
from leaderboard import leaderboard_bp
from owner import owner_bp
from payment import payment_bp
from player import player_bp
from team_leader import leader_bp
from admin import admin_bp
from pathlib import Path
from db_connection import get_db_connection


PROJECT_ROOT = Path(__file__).resolve().parent.parent
INSTANCE_PATH = PROJECT_ROOT / "instance"

app = Flask(
    __name__,
    instance_path=str(INSTANCE_PATH),
    instance_relative_config=True
)

app.frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
app.config.from_object(Config)
INSTANCE_PATH.mkdir(parents=True, exist_ok=True)

login_manager = LoginManager()
login_manager.init_app(app)
init_oauth(app)
app.register_blueprint(auth_bp)
app.register_blueprint(room_bp)
app.register_blueprint(player_bp)
app.register_blueprint(leader_bp)
app.register_blueprint(leaderboard_bp)
app.register_blueprint(owner_bp)
app.register_blueprint(payment_bp)
app.register_blueprint(admin_bp)

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


@app.route('/instance/images/<path:filename>')
def serve_instance_images(filename):
    image_dir = Path(app.instance_path) / "images"
    return send_from_directory(image_dir, filename)


@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({'error': 'Unauthorized', 'authenticated': False}), 401


def init_db():
    db = get_db_connection()
    cursor = db.cursor()

    # Only run script if there are no tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    if not tables:
        run_base_sql()
        run_test_sql()
    db.close()


def run_base_sql():
    db = get_db_connection()
    sql_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'base.sql')
    if os.path.exists(sql_path):
        with open(sql_path, 'r', encoding='utf-8') as f:
            db.executescript(f.read())


def run_test_sql():
    db = get_db_connection()
    test_sql = os.path.join(os.path.dirname(__file__), '..', 'database', 'test_skripta.sql')
    if os.path.exists(test_sql):
        try:
            with open(test_sql, 'r', encoding='utf-8') as f:
                db.executescript(f.read())
        except Exception as e:
            print(f"GREŠKA u test_skripta.sql: {e}")


if __name__ == '__main__':
    with app.app_context():
        init_db()
    app.run(debug=True, port=int(os.environ.get("PORT", 5000)), host='0.0.0.0')
    scheduler = BackgroundScheduler()
    scheduler.add_job(send_reminder, 'interval', hours=1)
    scheduler.start()
