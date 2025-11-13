# auth.py
# OAuth2 autentifikacija - API endpoints
from pathlib import Path

from flask import Blueprint, redirect, url_for, request, jsonify,current_app, session
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
    return oauth.github.authorize_redirect(redirect_uri)

@auth_bp.route('/register', methods=['POST'])
def register():
    """API endpoint za postavljanje tipa korisnika"""


    if current_user.is_authenticated:
        return redirect('/profile')

    session['username'] = request.form.get('username')
    session['uloga'] = request.form.get('uloga')
    if session['uloga'] == "POLAZNIK":
        session['email'] = request.form.get('email')
    elif session['uloga'] == "VLASNIK":
        session['naziv_tvrtke'] = request.form.get('naziv_tvrtke')
        session['adresa'] = request.form.get('adresa')
        session['grad'] = request.form.get('grad')
        session['telefon'] = request.form.get('telefon')
    else:
        #ciscenje session varijabli u slucaju nevalidne uloge
        session['username'] = None
        session['uloga'] = None
        return jsonify({'error': 'Nevažeća uloga korisnika'}), 400

    UPLOAD_FOLDER = Path("instance/images")
    UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

    file = request.files.get('image')

    if file:
        ext = os.path.splitext(secure_filename(file.filename))[1]
        filename = f"{uuid.uuid4().hex}{ext}"
        file_path = UPLOAD_FOLDER / filename
        file.save(file_path)
        session['imageUrl'] = str(file_path)
    else:
        session['imageUrl'] = str(UPLOAD_FOLDER / "default.png")

    # Get file upload
    #image upload
    #Spremi sliku u folder instance/images
    #slika ce dobiti naziv neki random string + extension

    # Validacija
    selected_type = session['uloga']
    #admin se ne moze odbarati preko forme, samo rucno u bazi
    if selected_type not in ['POLAZNIK', 'VLASNIK']:
        return jsonify({'error': 'Nevažeći tip korisnika'}), 400

    # Spremi tip u bazu

    return redirect('/api/auth/callback')


@auth_bp.route('/callback')
def callback():
    """
    GitHub callback - primanje authorization code-a
    Nakon uspješnog logina, redirecta na React frontend
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
            # Redirect na error stranicu u Reactu
            #redirect('/NotFound')
            return redirect('/?error=no_verified_email')

        oauth_id = str(user_data['id'])

        # Provjeri/kreiraj usera
        user = Korisnik.query.filter_by(oauth_id=oauth_id).first()

        if not user:
            user = Korisnik(session['username'],oauth_id,session['uloga'])
            db.session.add(user)
            db.session.commit()
            print(f"Novi user kreiran: {user.username}")

            #treba stvoriti i odgovarajucu podtablicu
            if session['uloga'] == 'POLAZNIK':
                polaznik = Polaznik(
                    username=user.username,
                    email=session['email'],
                    profImgUrl=str(session['imageUrl'])
                )
                db.session.add(polaznik)
                db.session.commit()
                print(f"Kreiran polaznik: {polaznik.username}")
            elif session['uloga'] == 'VLASNIK':
                vlasnik = Vlasnik(
                    username=user.username,
                    naziv_tvrtke=session['naziv_tvrtke'],
                    adresa=session['adresa'],
                    grad=session['grad'],
                    telefon=session['telefon'],
                    logoImgUrl=str(session['imageUrl'])
                )
                db.session.add(vlasnik)
                db.session.commit()
                print(f"Kreiran vlasnik: {vlasnik.username}")
        else:
            print("Vec logiran user")

        # Logiraj usera preko Flask-Login
        login_user(user, remember=True)
        print(f"User logiran: {user.email}")

        # Redirect na React frontend ovisno o tome ima li user_type
        session.clear()

        return redirect('/profile')

    except Exception as e:
        print(f"GitHub OAuth Error: {str(e)}")
        import traceback
        traceback.print_exc()
        # Redirect na error stranicu u Reactu
        return redirect(f'/?error=auth_failed&message={str(e)}')


@auth_bp.route('/logout')
@login_required
def logout():
    """
    Logout endpoint
    Pristupa se preko: http://localhost:5000/api/auth/logout
    Redirecta na login stranicu nakon logout-a
    """
    logout_user()
    print(f"User se odlogirao: {current_user.username}")

    return redirect('/')