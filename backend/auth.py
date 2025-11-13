# auth.py
# OAuth2 autentifikacija - API endpoints
from flask import Blueprint, redirect, url_for, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from authlib.integrations.flask_client import OAuth
from models import db, User
from werkzeug.utils import secure_filename
import os

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

    username = request.form.get('username')
    uloga = request.form.get('uloga')
    if uloga == "POLAZNIK":
        email = request.form.get('email')
    elif uloga == "VLASNIK":
        naziv_tvrtke = request.form.get('naziv_tvrtke')
        adresa = request.form.get('adresa')
        grad = request.form.get('grad')
        telefon = request.form.get('telefon')
    else:
        return jsonify({'error': 'Nevažeća uloga korisnika'}), 400

    # Get file upload
    if 'image' in request.files:
        file = request.files['image']
        if file.filename != '':
            # generate random filename
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)


    # Validacija
    if selected_type not in ['regular', 'creator']:
        return jsonify({'error': 'Nevažeći tip korisnika'}), 400

    # ako nije uspjela validacija, vratiti grešku

    # inače poslati na github

    # ako autentifikacija uspije, spremiti u bazu


    # Spremi tip u bazu
    current_user.user_type = selected_type
    db.session.commit()

    print(f"✅ User {current_user.email} odabrao tip: {selected_type}")

    return jsonify(current_user.to_dict())


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
            return redirect('/?error=no_verified_email')

        github_id = str(user_data['id'])

        # Provjeri/kreiraj usera
        user = User.query.filter_by(github_id=github_id).first()

        if not user:
            user = User(
                github_id=github_id,
                email=primary_email,
                name=user_data.get('name') or user_data.get('login'),
                profile_picture=user_data.get('avatar_url')
            )
            db.session.add(user)
            db.session.commit()
            print(f"✅ Novi user kreiran: {primary_email}")
        else:
            # Updateaj postojeće podatke
            user.name = user_data.get('name') or user_data.get('login')
            user.profile_picture = user_data.get('avatar_url')
            db.session.commit()
            print(f"✅ User updatan: {primary_email}")

        # Logiraj usera preko Flask-Login
        login_user(user, remember=True)
        print(f"✅ User logiran: {user.email}")

        # Redirect na React frontend ovisno o tome ima li user_type
        if not user.user_type:
            return redirect('/select-user-type')
        else:
            return redirect('/dashboard')

    except Exception as e:
        print(f"❌ GitHub OAuth Error: {str(e)}")
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
    email = current_user.email
    logout_user()
    print(f"✅ User se odlogirao: {email}")

    return redirect('/')