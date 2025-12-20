# app.py
# GLAVNA APLIKACIJA - Entry point projekta
from flask import Flask, jsonify, request, send_from_directory,session
from flask_login import LoginManager, login_required, current_user
from matplotlib.rcsetup import validate_string_or_None

from config import Config
from models import db, Korisnik, Polaznik, Vlasnik
from auth import auth_bp, init_oauth
import sqlite3
import os

# FRONTEND DOKUMENTACIJA
#
# API ENDPOINTI
#
# 1. /api/auth/login [GET]
#    - Pokreće GitHub OAuth login flow.
#    - Frontend treba redirectati korisnika na ovaj endpoint.
#    - Ako je korisnik već logiran:
#        - Ako ima user_type, redirecta na /dashboard
#        - Ako nema user_type, redirecta na /select-user-type
#
# 2. /api/auth/callback [GET]
#    - GitHub OAuth callback.
#    - Backend obrađuje login i kreira/aktualizira usera.
#    - Nakon login-a redirecta na:
#        - /select-user-type ako user_type nije postavljen
#        - /dashboard ako user_type postoji
#
# 3. /api/auth/logout [GET]
#    - Logout endpoint.
#    - Nakon logout-a redirecta na login stranicu (/)
#
# 4. /api/me [GET]
#    - Vraća podatke trenutno logiranog korisnika u JSON formatu.
#    - Zaštićen endpoint, zahtijeva session cookie.
#
# 5. /api/select-user-type [POST]
#    - Postavlja tip korisnika ('regular' ili 'creator').
#    - Body: { "user_type": "regular" } ili { "user_type": "creator" }
#    - Zaštićen endpoint, zahtijeva login.
#    - Ako user već ima tip, vraća 400 grešku.
#
# REACT INTEGRACIJA
#
# - Sve rute koje nisu /api/* služe SPA frontend (React build).
# - Koristiti fetch sa 'credentials: include' za sve zaštićene API pozive.
# - Provjeru login statusa raditi GET /api/me
#   - Ako status 200 => user logiran
#   - Ako status 401 => user nije logiran
#
# FRONTEND NAVIGACIJA
#
# - LoginPage: pokazuje dugme za GitHub login (/api/auth/login)
# - SelectUserType: ako user_type nije postavljen
# - Dashboard: ako user_type postoji
#
# NAPOMENA
#
# - Svi API pozivi koriste session cookie za autentikaciju, nema tokena u headeru.
# - Backend automatski redirecta logirane korisnike na odgovarajuće stranice.
# - Ne mijenjati redirect URI, mora biti isti kao u GitHub OAuth App postavkama.




app = Flask(__name__)
app.frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

# Učitaj konfiguraciju iz config.py
app.config.from_object(Config)

# Inicijaliziraj database
db.init_app(app)

# Inicijaliziraj Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(username):
    """Flask-Login koristi ovu funkciju da učita korisnika iz sessiona"""
    user = db.session.get(Polaznik, username)
    if user:
        return user
    vlasnik = db.session().get(Vlasnik, username)
    if vlasnik:
        return vlasnik

    return db.session().get(Korisnik, username)

# Inicijaliziraj OAuth
oauth = init_oauth(app)

# Registriraj authentication blueprint
app.register_blueprint(auth_bp)
#app.register_blueprint(db_bp)


# ===== API RUTE =====

# ===== REACT ROUTING - SPA =====

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    if path.startswith("api"):
        return jsonify({"error": "Not Found"}), 404

    if path == "":
        path = "index.html"

    full_path = os.path.join(app.frontend_dir, path)
    if os.path.exists(full_path) and os.path.isfile(full_path):
        return send_from_directory(app.frontend_dir, path)

    return send_from_directory(app.frontend_dir, "index.html")

@app.route('/api/print-all')
def print_all_data():
    with app.app_context():  # Obavezno za SQLAlchemy
        print("=== KORISNIK ===")
        for k in db.session.execute(db.select(Korisnik)).scalars():
            print(k.to_dict())

        print("\n=== POLAZNIK ===")
        for p in db.session.execute(db.select(Polaznik)).scalars():
            print(p.to_dict())

        print("\n=== VLASNIK ===")
        for v in db.session.execute(db.select(Polaznik)).scalars():
            print(v.to_dict())


# app.py (dodaj ovu rutu za debugging sessiona)
@app.route('/api/debug-session')
def debug_session():
    """DEV ONLY - Debug session podataka"""
    return jsonify({
        'session_data': dict(session),
        'reg_data': session.get('reg_data')
    }), 200


# ===== DATABASE SETUP =====

def create_tables():
    """Kreira database tablice ako ne postoje"""
    with app.app_context():
        db.create_all()


# ===== ERROR HANDLERS =====

@app.errorhandler(404)
def page_not_found(e):
    """Handler za 404 greške - vraća JSON umjesto HTML-a"""
    return jsonify({'error': 'Endpoint ne postoji'}), 404


@app.errorhandler(500)
def internal_error(e):
    """Handler za 500 greške"""
    db.session.rollback()
    return jsonify({'error': 'Greška na serveru'}), 500


@login_manager.unauthorized_handler
def unauthorized():
    """Handler kada user nije logiran"""
    return jsonify({'error': 'Unauthorized', 'authenticated': False}), 401


if __name__ == '__main__':
    # Kreiraj tablice pri prvom pokretanju
    create_tables()

    # Pokreni development server
    app.run(debug=True, port=int(os.environ.get("PORT", 5000)), host='0.0.0.0')
