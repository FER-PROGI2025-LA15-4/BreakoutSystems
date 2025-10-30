# app.py
# GLAVNA APLIKACIJA - Entry point projekta
from flask import Flask, render_template, redirect, url_for, request,jsonify
from flask_login import LoginManager, login_required, current_user
from config import Config
from models import db, User, LeaderBoard, EscapeRoom
#db je instanca ORM-a SQLAlchemy, User korisnik tablica

from auth import auth_bp, init_oauth

# Kreiraj Flask aplikaciju
app = Flask(__name__)

# Učitaj konfiguraciju iz config.py
app.config.from_object(Config)

# Inicijaliziraj database
db.init_app(app)

# Inicijaliziraj Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login_page'
login_manager.login_message = 'Molimo prijavite se za pristup ovoj stranici.'

# svi dekoratori @login_manager već postoje, mi ih samo koristimo ovdje

@login_manager.user_loader
def load_user(user_id):
    """
    Flask-Login koristi ovu funkciju da učita korisnika iz sessiona
    Args:
        user_id: ID korisnika spremljen u sessionu
    Returns:
        User objekt ili None ako ne postoji
    """
    return User.query.get(int(user_id))


# Inicijaliziraj OAuth
oauth = init_oauth(app)

# Registriraj authentication blueprint
app.register_blueprint(auth_bp)


# ===== GLAVNE RUTE APLIKACIJE =====

#Unutar svake rute možemo koristiti current_user iz Flask-Logina
#da dobijemo info o trenutno logiranom korisniku
@app.route('/')
def home_page():
    #Početna stranica koja trenutno ne postoji
    return "Home page još ne postoji - promjeni rutu na http://localhost:5000/login da vidiš Oauth2"

@app.route('/login')
def login_page():
    """
    LOGIN STRANICA - početna stranica aplikacije
    Ako je clan prijavljen onda ga prebacuje na dashboard
    inače prikazuje login stranicu
    """
    if current_user.is_authenticated:
        return redirect(url_for('dashboard')) #uzimamo url iz imena funkcije .route("url")
    return render_template('login.html')


@app.route('/dashboard')
@login_required
def dashboard():
    """
    DASHBOARD - glavna stranica nakon logina
    Mogu pristupiti samo logirani korisnici - @login_required
    Zahtjeva da user ima odabran tip
    """
    # Sigurnosna provjera - user MORA imati tip
    if not current_user.user_type:
        return redirect(url_for('select_user_type'))

    return render_template('dashboard.html', user=current_user)
@app.route('/select-user-type', methods=['GET', 'POST'])
@login_required
def select_user_type():
    """
    Stranica za izbor tipa korisnika nakon prve prijave
    """
    # Ako user već ima tip, preusmjeri na dashboard
    if current_user.user_type:
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        # Prihvati izbor korisnika
        selected_type = request.form.get('user_type')

        # Validacija - samo dozvoljene vrijednosti
        # Ovo nece trebati postojati ako front-endasi ispravno naprave formu
#        if selected_type not in ['regular', 'creator']:
#            return 'Nevažeći tip korisnika', 400

        # Spremi tip u bazu
        current_user.user_type = selected_type
        db.session.commit()

        print(f"✅ User {current_user.email} odabrao tip: {selected_type}")

        # Preusmjeri na dashboard
        return redirect(url_for('dashboard'))

    # GET request - prikaži stranicu za izbor
    return render_template('select_user_type.html', user=current_user)


# ===== DATABASE SETUP =====

def create_tables():
    """
    Kreira database tablice ako ne postoje
    """
    with app.app_context():
        db.create_all()
        print("✅ Database tablice kreirane")


# ===== ERROR HANDLERS =====
@app.errorhandler(404)
def page_not_found(e):
    """Handler za 404 greške"""
    return render_template(
        '404.html') if False else '<h1>404 - Stranica ne postoji</h1><a href="/">Nazad na početnu</a>', 404


@app.errorhandler(500)
def internal_error(e):
    """Handler za 500 greške"""
    db.session.rollback()
    return '<h1>500 - Greška na serveru</h1><a href="/">Nazad na početnu</a>', 500


# ===== POKRETANJE APLIKACIJE =====

if __name__ == '__main__':
    # Kreiraj tablice pri prvom pokretanju
    create_tables()

    print("=" * 50)
    print("🚀 ESCAPE ROOM APP - GitHub OAuth2 with Flask")
    print("=" * 50)
    print("📍 Server: http://localhost:5000")
    print("🔐 OAuth callback: http://localhost:5000/auth/callback")
    print("=" * 50)

    # Pokreni development server
    app.run(debug=True, port=5000, host='0.0.0.0')

