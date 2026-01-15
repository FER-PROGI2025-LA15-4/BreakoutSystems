# auth.py
import os
import uuid
import sqlite3
from pathlib import Path
from flask import Blueprint, redirect, url_for, request, jsonify, current_app, session
from flask_login import login_user, logout_user, login_required, current_user
from authlib.integrations.flask_client import OAuth
from models import User
from werkzeug.utils import secure_filename
import stripe

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
oauth = OAuth()


def get_db_connection():
    db_path = Path(current_app.instance_path) / "escape_room.db"
    db_path.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.row_factory = sqlite3.Row
    return conn

def init_oauth(app):
    oauth.init_app(app)
    oauth.register(
        name='github',
        client_id=app.config['GITHUB_CLIENT_ID'],
        client_secret=app.config['GITHUB_CLIENT_SECRET'],
        access_token_url='https://github.com/login/oauth/access_token',
        authorize_url='https://github.com/login/oauth/authorize',
        api_base_url='https://api.github.com/',
        client_kwargs={'scope': 'user:email'},
    )
    return oauth

#def save_uploaded_file(file):
    if not file or not file.filename:
        return "/instance/images/default.png"
    upload_folder = Path(current_app.instance_path) / "images"
    upload_folder.mkdir(parents=True, exist_ok=True)
    ext = Path(secure_filename(file.filename)).suffix or ".png"
    filename = f"{uuid.uuid4().hex}{ext}"
    file.save(upload_folder / filename)
    return f"/instance/images/{filename}"

def save_temp_file(file):
    if not file or not file.filename:
        return None
    tmp_folder = Path(current_app.instance_path) / "tmp_images"
    tmp_folder.mkdir(parents=True, exist_ok=True)
    ext = Path(secure_filename(file.filename)).suffix or ".png"
    filename = f"{uuid.uuid4().hex}{ext}"
    file.save(tmp_folder / filename)
    return filename

def move_temp_image(tmp_filename):
    if not tmp_filename:
        return None
    tmp_path = Path(current_app.instance_path) / "tmp_images" / tmp_filename
    if not tmp_path.exists():
        return None
    images_folder = Path(current_app.instance_path) / "images"
    images_folder.mkdir(parents=True, exist_ok=True)
    final_path = images_folder / tmp_filename
    tmp_path.rename(final_path)
    return f"/instance/images/{tmp_filename}"


def delete_image_file(filename):
    if not filename:
        return
    path = Path(current_app.instance_path) / "images" / filename
    path.unlink(missing_ok=True)

@auth_bp.route('/login')
def login():
    if current_user.is_authenticated:
        return redirect('/profile')
    return oauth.github.authorize_redirect(url_for('auth.callback', _external=True), prompt="select_account")

@auth_bp.route('/register', methods=['POST'])
def register():
    if current_user.is_authenticated:
        return redirect('/profile')

    session.pop('reg_data', None)
    username = request.form.get('username')
    uloga = request.form.get('uloga')

    if not username or uloga not in ['POLAZNIK', 'VLASNIK']:
        return jsonify({'error': 'Neispravni podaci'}), 400

    db = get_db_connection()
    if db.execute("SELECT 1 FROM Korisnik WHERE username = ?", (username,)).fetchone():
        db.close()
        return redirect('/register?auth_error=username_taken')
    db.close()

    reg_data = {
        'username': username,
        'uloga': uloga,
        'temp-image': save_temp_file(request.files.get('image'))
    }

    if uloga == "POLAZNIK":
        reg_data['email'] = request.form.get('email')
    else:
        reg_data.update({
            'naziv_tvrtke': request.form.get('naziv_tvrtke'),
            'adresa': request.form.get('adresa'),
            'grad': request.form.get('grad'),
            'telefon': request.form.get('telefon')
        })

    session['reg_data'] = reg_data
    session.modified = True
    return oauth.github.authorize_redirect(url_for('auth.callback', _external=True), prompt="select_account")

@auth_bp.route('/callback')
def callback():
    db = get_db_connection()
    try:
        # GitHub OAuth – dohvat tokena i user info
        token = oauth.github.authorize_access_token()
        user_info = oauth.github.get('user', token=token).json()
        oauth_id = str(user_info['id'])

        # Provjera postoji li korisnik s tim GitHub računom
        user_row = db.execute(
            "SELECT * FROM Korisnik WHERE oauth_id = ?",
            (oauth_id,)
        ).fetchone()

        reg_data = session.get('reg_data')


        # LOGIN FLOW
        if not reg_data:
            if user_row:
                login_user(User(dict(user_row)), remember=True)
                return redirect('/profile')
            else:
                return redirect('/login?auth_error=no_account')

        # REGISTER FLOW
        # GitHub račun već postoji
        if user_row:
            if reg_data.get('temp-image'):
                tmp = Path(current_app.instance_path) / "tmp_images" / reg_data['temp-image']
                tmp.unlink(missing_ok=True)
                delete_image_file(reg_data['temp-image'])
            session.pop('reg_data', None)
            return redirect('/register?auth_error=account')

        # Kreiranje novog korisnika
        db.execute(
            "INSERT INTO Korisnik (username, oauth_id, uloga) VALUES (?, ?, ?)",
            (reg_data['username'], oauth_id, reg_data['uloga'])
        )

        image_url = move_temp_image(reg_data['temp-image'])
        if reg_data['uloga'] == 'POLAZNIK':
            db.execute(
                "INSERT INTO Polaznik (username, email, profImgUrl) VALUES (?, ?, ?)",
                (reg_data['username'], reg_data['email'], image_url)
            )
        else:
            db.execute(
                """
                INSERT INTO Vlasnik
                (username, naziv_tvrtke, adresa, grad, telefon, logoImgUrl)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    reg_data['username'],
                    reg_data['naziv_tvrtke'],
                    reg_data['adresa'],
                    reg_data['grad'],
                    reg_data['telefon'],
                    image_url
                )
            )

        db.commit()
        session.permanent = True
        login_user(
            User({
                'username': reg_data['username'],
                'uloga': reg_data['uloga']
            }),
            remember=True
        )
        session.pop('reg_data', None)
        return redirect('/profile')

    except Exception as e:
        db.rollback()
        print(f"Auth Error: {e}")
        session.pop('reg_data', None)
        return redirect('/login?auth_error=auth_failed')

    finally:
        db.close()

@auth_bp.route('/edit', methods=['POST'])
@login_required
def edit_user():

    db = get_db_connection()

    file = request.files.get('image')
    new_image_url = None
    if file and file.filename:
        new_image_url = save_temp_file(file)
        new_image_url = move_temp_image(new_image_url)

    if(current_user.uloga == 'ADMIN'):

        return jsonify({'error': 'Admin je pokusao mijenjati profil', '': False}), 401

    try:
        if(current_user.uloga == 'POLAZNIK'):
            email = request.form.get('email')
            if email:
                db.execute("UPDATE Polaznik SET email = ? WHERE username = ?", (email, current_user.username))
            if new_image_url:
                db.execute("UPDATE Polaznik SET profImgUrl = ? WHERE username = ?",
                           (new_image_url, current_user.username))
        elif(current_user.uloga == 'VLASNIK'):
            naziv_tvrtke = request.form.get('naziv_tvrtke')
            adresa = request.form.get('adresa')
            grad = request.form.get('grad')
            telefon = request.form.get('telefon')

            if naziv_tvrtke:
                db.execute("UPDATE Vlasnik SET naziv_tvrtke = ? WHERE username = ?", (naziv_tvrtke, current_user.username))
            if adresa:
                db.execute("UPDATE Vlasnik SET adresa = ? WHERE username = ?", (adresa, current_user.username))
            if grad:
                db.execute("UPDATE Vlasnik SET grad = ? WHERE username = ?", (grad, current_user.username))
            if telefon:
                db.execute("UPDATE Vlasnik SET telefon = ? WHERE username = ?", (telefon, current_user.username))
            if new_image_url:
                db.execute("UPDATE Vlasnik SET logoImgUrl = ? WHERE username = ?",
                           (new_image_url, current_user.username))
        db.commit()
        return jsonify({'success': True}), 200
    except Exception as e:
        db.rollback()
        print(f"Edit User Error: {e}")
        return jsonify({'error': 'Neuspjelo azuriranje podataka'}), 500
    finally:
        db.close()


@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return "", 200


@auth_bp.route('/me')
def get_current_user():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Nije logiran'}), 401

    db = get_db_connection()

    user_data = {
        "username": current_user.username,
        "uloga": current_user.uloga
    }

    if current_user.uloga == 'POLAZNIK':
        res = db.execute("SELECT email, profImgUrl FROM Polaznik WHERE username = ?",
                         (current_user.username,)).fetchone()
        if res:
            user_data.update(dict(res))

    elif current_user.uloga == 'VLASNIK':
        res = db.execute("SELECT * FROM Vlasnik WHERE username = ?", (current_user.username,)).fetchone()
        if res:
            user_data.update(dict(res))

    db.close()
    return jsonify(user_data)