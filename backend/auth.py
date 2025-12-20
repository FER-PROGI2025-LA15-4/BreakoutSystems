# auth.py
# OAuth2 autentifikacija - API endpoints
from pathlib import Path

from flask import Blueprint, redirect, url_for, request, jsonify, current_app, session, send_from_directory
from flask_login import login_user, logout_user, login_required, current_user
from authlib.integrations.flask_client import OAuth
from models import db, Korisnik, Vlasnik, Polaznik
from werkzeug.utils import secure_filename
import os
import uuid

# Blueprint sa /api/auth prefiksom
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

oauth = OAuth()


def init_oauth(app):
    """Inicijalizira OAuth sa GitHub providerom"""
    oauth.init_app(app)

    oauth.register(
        name='github',
        client_id=app.config['GITHUB_CLIENT_ID'],
        client_secret=app.config['GITHUB_CLIENT_SECRET'],
        access_token_url='https://github.com/login/oauth/access_token',
        access_token_params=None,
        authorize_url='https://github.com/login/oauth/authorize',
        authorize_params=None,
        api_base_url='https://api.github.com/',
        client_kwargs={
            'scope': ' '.join(app.config['GITHUB_SCOPE'])
        },
    )

    return oauth


# ===== API RUTE =====

@auth_bp.route('/login', methods=['GET'])
def login():
    """
    Pokreće GitHub OAuth flow
    Frontend poziva: http://localhost:5000/api/auth/login
    User se redirecta na GitHub, a zatim nazad na /api/auth/callback
    """
    if current_user.is_authenticated:
        return redirect('/profile')

    redirect_uri = url_for('auth.callback', _external=True)
    return oauth.github.authorize_redirect(redirect_uri, prompt="select_account")

@auth_bp.route('/me')
def get_current_user():
    """Vraća podatke o trenutno logiranom korisniku"""

    #treba dodati is_authenticated
    if current_user.is_authenticated:
        return jsonify(current_user.to_dict())
    else:
        return jsonify({'error': 'Nije logiran'}), 401


# ===== Funkcija za upload slike =====
def save_uploaded_file(file):
    """Sprema uploadanu sliku i vraća relativni URL za frontend"""
    if not file or not file.filename:
        return "/static/images/default.png"  # default ako nema filea

    # Kreiraj folder ako ne postoji
    upload_folder = Path(current_app.static_folder) / "images"
    upload_folder.mkdir(parents=True, exist_ok=True)

    # Generiraj jedinstveno ime
    ext = Path(secure_filename(file.filename)).suffix or ".png"
    allowed_extensions = {".png", ".jpg", ".jpeg", ".webp"}
    if ext.lower() not in allowed_extensions:
        raise ValueError("Nedopušten format datoteke")
    filename = f"{uuid.uuid4().hex}{ext}"

    # Spremi datoteku
    file_path = upload_folder / filename
    file.save(file_path)

    # Vrati relativni URL za frontend
    return f"/static/images/{filename}"


@auth_bp.route('/register', methods=['POST'])
def register():
    """API endpoint za postavljanje tipa korisnika"""
    print("Pozvao se register")

    if current_user.is_authenticated:
        return redirect('/profile')

    # Očisti prethodne session podatke
    session.pop('reg_data', None)

    # Prikupi podatke iz forme
    username = request.form.get('username')
    uloga = request.form.get('uloga')

    # Validacija osnovnih podataka
    if not username or not uloga:
        return jsonify({'error': 'Korisničko ime i uloga su obavezni'}), 400

    if uloga not in ['POLAZNIK', 'VLASNIK']:
        return jsonify({'error': 'Nevažeća uloga korisnika'}), 400

    # provjeri da li username već postoji
    existing_user = db.session.execute(
        db.select(Korisnik).where(Korisnik.username == username)
    ).scalar_one_or_none()

    if existing_user:
        return redirect('/register?auth_error=username_taken')

    # Obrada slike
    file = request.files.get('image')
    image_url = save_uploaded_file(file)

    # Spremi sve podatke u session
    reg_data = {
        'username': username,
        'uloga': uloga,
        'imageUrl': image_url
    }

    # Dodaj specifične podatke ovisno o ulozi
    if uloga == "POLAZNIK":
        email = request.form.get('email')
        if not email:
            return jsonify({'error': 'Email je obavezan za polaznika'}), 400
        reg_data['email'] = email

    elif uloga == "VLASNIK":
        naziv_tvrtke = request.form.get('naziv_tvrtke')
        adresa = request.form.get('adresa')
        grad = request.form.get('grad')
        telefon = request.form.get('telefon')

        if not all([naziv_tvrtke, adresa, grad, telefon]):
            return jsonify({'error': 'Svi podaci su obavezni za vlasnika'}), 400

        reg_data['naziv_tvrtke'] = naziv_tvrtke
        reg_data['adresa'] = adresa
        reg_data['grad'] = grad
        reg_data['telefon'] = telefon

    # Spremi u session
    session['reg_data'] = reg_data
    session.modified = True  # Osiguraj da se session spremi

    print(f"Session reg_data spremljen: {reg_data}")

    redirect_uri = url_for('auth.callback', _external=True)
    return oauth.github.authorize_redirect(redirect_uri, prompt="select_account")


@auth_bp.route('/callback')
def callback():
    """
    GitHub callback - primanje authorization code-a
    Rukuje i login i register flowom
    """
    try:
        # Autoriziraj access token
        token = oauth.github.authorize_access_token()

        # Dohvati user podatke
        resp = oauth.github.get('user', token=token)
        user_data = resp.json()

        # Dohvati email
        email_resp = oauth.github.get('user/emails', token=token)
        emails = email_resp.json()

        # Nađi primarni email
        primary_email = None
        for email_obj in emails:
            if email_obj.get('primary') and email_obj.get('verified'):
                primary_email = email_obj.get('email')
                break

        if not primary_email and emails:
            for email_obj in emails:
                if email_obj.get('verified'):
                    primary_email = email_obj.get('email')
                    break

        if not primary_email:
            return redirect('/?error=no_verified_email')

        oauth_id = str(user_data['id'])
        github_username = user_data.get('login')

        # Provjeri postojećeg usera
        user = db.session.execute(
            db.select(Korisnik).where(Korisnik.oauth_id == oauth_id)
        ).scalar_one_or_none()

        if user:
            reg_data = session.get('reg_data')

            if reg_data:
                # registracija, ali GitHub account već postoji
                session.pop('reg_data', None)
                return redirect('/register?auth_error=account')

            # login flow
            print(f"Postojeći user logiran: {user.username}")
            login_user(user, remember=True)
            return redirect('/profile')


        else:
            # NOVI KORISNIK - REGISTER FLOW
            reg_data = session.get('reg_data')

            if not reg_data:
                # KORISNIK POKUŠAVA PRIJAVU BEZ REGISTRACIJE
                print("Korisnik pokušava prijavu bez registracije")
                return redirect('/login?auth_error=no_account')

            # REGISTRACIJA S PODACIMA IZ SESSIONA
            print(f"Reg data iz sessiona: {reg_data}")

            # Kreiraj novog usera
            user = Korisnik(
                username=reg_data['username'],
                oauth_id=oauth_id,
                uloga=reg_data['uloga']
            )
            db.session.add(user)
            db.session.commit()
            print(f"Novi user kreiran: {user.username}")

            # Dohvati imageUrl
            image_url = reg_data.get('imageUrl')

            # Kreiraj odgovarajuću podtablicu
            if reg_data['uloga'] == 'POLAZNIK':
                # Provjeri da li email već postoji
                existing_polaznik = db.session.execute(
                    db.select(Polaznik).where(Polaznik.email == reg_data['email'])
                ).scalar_one_or_none()

                if existing_polaznik:
                    # Rollback - obriši kreiranog korisnika
                    db.session.delete(user)
                    db.session.commit()
                    session.pop('reg_data', None)
                    return redirect('/register?error=email_taken')

                polaznik = Polaznik(
                    username=user.username,
                    email=reg_data['email'],
                    profImgUrl=None
                )
                db.session.add(polaznik)

            elif reg_data['uloga'] == 'VLASNIK':
                vlasnik = Vlasnik(
                    username=user.username,
                    naziv_tvrtke=reg_data['naziv_tvrtke'],
                    adresa=reg_data['adresa'],
                    grad=reg_data['grad'],
                    telefon=reg_data['telefon'],
                    logoImgUrl=None
                )
                db.session.add(vlasnik)

            db.session.commit()
            print(f"Kreiran {reg_data['uloga'].lower()}: {user.username}")

            # Očisti session podatke nakon uspješne registracije
            session.pop('reg_data', None)
            session.modified = True

            # Logiraj usera
            login_user(user, remember=True)
            return redirect('/profile')

    except Exception as e:
        print(f"GitHub OAuth Error: {str(e)}")
        import traceback
        traceback.print_exc()
        # Očisti session i u slučaju greške
        session.pop('reg_data', None)
        return redirect(f'/?error=auth_failed&message={str(e)}')

@auth_bp.route('/logout')
@login_required
def logout():
    """
    Logout endpoint
    Pristupa se preko: http://localhost:5000/api/auth/logout
    Redirecta na login stranicu nakon logout-a
    """
    username = current_user.username
    logout_user()
    print(f"User se odlogirao: {username}")

    return "", 200


# ===== ROUTE ZA PRIKAZ SLIKA ===== -možda ne treba ako se slike poslužuju iz static foldera
#@auth_bp.route('/images/<filename>')
#def uploaded_file(filename):
    """Servira uploadane slike iz instance/images"""
    return send_from_directory(os.path.join(current_app.instance_path, 'images'), filename)
