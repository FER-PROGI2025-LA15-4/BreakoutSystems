# app.py
# GLAVNA APLIKACIJA - Entry point projekta
from flask import Flask, jsonify, request, send_from_directory
from flask_login import LoginManager, login_required, current_user
from config import Config
from models import db, User, LeaderBoard, EscapeRoom
from auth import auth_bp, init_oauth
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

#  ❗ ❗ ❗ ❗ Provjerite CORS postavke ako frontend i backend nisu na istoj domeni ❗ ❗ ❗ ❗ ❗ ❗
#  ❗ ❗ ❗ ❗ mislim da trebate koristiti
#   fetch('/api/me', {
#       credentials: 'include' // da se ukljuci cookie u zahtjev
#   })



app = Flask(__name__, static_folder='build', static_url_path='')

# Učitaj konfiguraciju iz config.py
app.config.from_object(Config)

# Inicijaliziraj database
db.init_app(app)

# Inicijaliziraj Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'api.login_check'
login_manager.login_message = 'Molimo prijavite se za pristup ovoj stranici.'

@login_manager.user_loader
def load_user(user_id):
    """Flask-Login koristi ovu funkciju da učita korisnika iz sessiona"""
    return User.query.get(int(user_id))

# Inicijaliziraj OAuth
oauth = init_oauth(app)

# Registriraj authentication blueprint
app.register_blueprint(auth_bp)


# ===== API RUTE =====

@app.route('/api/me')
@login_required
def get_current_user():
    """Vraća podatke o trenutno logiranom korisniku"""
    return jsonify(current_user.to_dict())


@app.route('/api/select-user-type', methods=['POST'])
@login_required
def select_user_type_api():
    """API endpoint za postavljanje tipa korisnika"""
    # Ako user već ima tip, vrati grešku
    if current_user.user_type:
        return jsonify({'error': 'User već ima postavljen tip'}), 400

    data = request.get_json()
    selected_type = data.get('user_type')

    # Validacija
    if selected_type not in ['regular', 'creator']:
        return jsonify({'error': 'Nevažeći tip korisnika'}), 400

    # Spremi tip u bazu
    current_user.user_type = selected_type
    db.session.commit()

    print(f"✅ User {current_user.email} odabrao tip: {selected_type}")

    return jsonify(current_user.to_dict())


@app.route('/api/delete-users', methods=['DELETE'])
def delete_users():
    """DEV ONLY - Briše sve usere iz baze"""
    User.query.delete()
    db.session.commit()
    return jsonify({'message': 'Svi useri obrisani'}), 200


# ===== REACT ROUTING - SPA =====

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    """
    Služi React aplikaciju za sve rute koje nisu /api/*
    catch all funkcija
    """
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


# ===== DATABASE SETUP =====

def create_tables():
    """Kreira database tablice ako ne postoje"""
    with app.app_context():
        db.create_all()
        print("✅ Database tablice kreirane")


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


# ===== POKRETANJE APLIKACIJE =====

if __name__ == '__main__':
    # Kreiraj tablice pri prvom pokretanju
    create_tables()

    print("=" * 50)
    print("🚀 ESCAPE ROOM APP - React + Flask")
    print("=" * 50)
    print("📍 Server: http://localhost:5000")
    print("🔐 OAuth callback: http://localhost:5000/api/auth/callback")
    print("📱 React app: http://localhost:5000")
    print("=" * 50)

    # Pokreni development server
    app.run(debug=True, port=5000, host='0.0.0.0')
