from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required
from auth import save_temp_file, move_temp_image, delete_image_file
from db_connection import get_db_connection

leader_bp = Blueprint('leader', __name__)


@leader_bp.route('/api/has-played', methods=['POST'])
@login_required
def has_played():

    if current_user.uloga != "POLAZNIK":
        return jsonify({'error': 'forbidden access'}), 403

    data = request.get_json()
    team_name = data.get('ime_tima')
    room_id = data.get('room_id')

    if not team_name or not room_id:
        return jsonify({'error': 'missing params'}), 400

    db = get_db_connection()

    result = db.execute("""
        SELECT 1 
        FROM ClanNaTerminu 
        WHERE room_id = ? AND username IN (
            SELECT voditelj_username FROM Tim WHERE ime = ?
            UNION
            SELECT username FROM ClanTima WHERE ime_tima = ? AND accepted = 1
        )
        LIMIT 1
    """, (room_id, team_name, team_name)).fetchone()

    # Ako result postoji, znači da je netko već igrao
    netko_igrao = True if result else False

    return jsonify({"netko_igrao": netko_igrao}), 200


# vraća sve korisnike koji imaju aktivan invite u neki tim
@leader_bp.route('/api/invites', methods=['GET'])
@login_required
def get_invites():
    if current_user.uloga != "POLAZNIK":
        return jsonify({'error': 'forbidden access'}), 403

    team_name = request.args.get('teamName')
    db = get_db_connection()
    team = db.execute("SELECT * FROM Tim WHERE ime = ? AND voditelj_username = ?", (team_name,current_user.username,)).fetchone()
    if team is None:
        print("Nema tima ili nije voditelj")
        db.close()
        return jsonify({'error': 'forbidden access'}), 403

    users = db.execute(
        "SELECT username FROM ClanTima WHERE ime_tima = ? AND accepted = 0", (team_name,)).fetchall()

    for user in users: print(user["username"])
    users = [user["username"] for user in users]

    db.close()
    return jsonify({"users": users}), 200

# slanje invitea u tim korisniku


@leader_bp.route('/api/add-member', methods=['POST'])
@login_required
def add_member():
    if current_user.uloga != "POLAZNIK":
        return jsonify({'error': 'forbidden access'}), 403

    data = request.get_json() or {}
    team = data.get('team_name')
    username = data.get('user')
    db = get_db_connection()
    rows = db.execute("SELECT * FROM Tim WHERE ime = ? AND voditelj_username = ?",
                      (team, current_user.username)).fetchone()
    if rows is None:
        db.close()
        return jsonify({'error': 'forbidden access'}), 403

    existing = db.execute(
        "SELECT * FROM ClanTima WHERE ime_tima = ? AND username = ?", (team, username)).fetchone()
    if existing:
        return "", 204

    profile_exists = db.execute("SELECT * FROM Polaznik WHERE username = ?", (username,)).fetchone()
    if profile_exists is None:
        db.close()
        return jsonify({'error': 'no user'}), 404

    if username == current_user.username:
        db.close()
        return jsonify({'error': 'self invite'}), 404

    db.execute(
        "INSERT INTO ClanTima (ime_tima, username, accepted) VALUES (?, ?, 0)", (team, username))
    db.commit()
    db.close()
    return jsonify({"status": "invite_created"}), 200


@leader_bp.route('/api/create-team', methods=['POST'])
@login_required
def create_team():

    # name - ime tima
    # image - slika tima

    if current_user.uloga != 'POLAZNIK':
        return jsonify({'error': 'forbidden access'}), 403

    team_name = request.form.get("name")
    image_file = request.files.get("image")

    if not team_name:
        return jsonify({'error': 'team name missing'}), 400

    db = get_db_connection()

    name_is_taken = db.execute(
        'SELECT 1 FROM Tim WHERE ime = ?', (team_name,)).fetchone()

    if name_is_taken:
        db.close()
        return jsonify({'error': 'Team name already taken!'}), 400

    image_url = None
    if image_file and image_file.filename:
        temp_filename = save_temp_file(image_file)
        image_url = move_temp_image(temp_filename)

    db.execute('INSERT INTO Tim (ime, image_url, voditelj_username) VALUES (?,?,?)',
               (team_name, image_url, current_user.username),)

    db.commit()
    db.close()
    print("Stvoren tim")

    return jsonify({'status': 'Team created'}), 200


@leader_bp.route('/api/edit-team', methods=['POST'])
@login_required
def edit_team():
    # name - ime tima
    # image - slika tima

    if current_user.uloga != 'POLAZNIK':
        return jsonify({'error': 'forbidden access'}), 403

    team_name = request.form.get("name")
    image_file = request.files.get("image")

    if not team_name:
        return jsonify({'error': 'team name missing'}), 400

    db = get_db_connection()

    team = db.execute('SELECT image_url FROM Tim WHERE ime = ? AND voditelj_username = ?',
                      (team_name, current_user.username,)).fetchone()

    if team is None:
        db.close()
        return jsonify({'error': 'forbidden access'}), 403

    if image_file and image_file.filename:
        # Brisanje stare slike ako dodajemo novu za stednju memorije - salje se ime fajla za brisanje
        if team['image_url']:
            delete_image_file(team['image_url'].split('/')[-1])
        temp_filename = save_temp_file(image_file)
        image_url = move_temp_image(temp_filename)

        db.execute('UPDATE Tim SET image_url = ? WHERE ime = ?',
                   (image_url, team_name),)

    db.commit()
    db.close()

    return jsonify({'status': 'Team data edited'}), 200


# brisanje člana iz tima ili poništavnaje invitea
@leader_bp.route('/api/remove-member', methods=['POST'])
@login_required
def remove_member():
    if current_user.uloga != "POLAZNIK":
        return jsonify({'error': 'forbidden access'}), 403
    data = request.get_json() or {}
    team = data.get('team_name')
    username = data.get('user')
    db = get_db_connection()
    rows = db.execute("SELECT * FROM Tim WHERE ime = ? AND voditelj_username = ?",
                      (team, current_user.username)).fetchone()
    if rows is None:
        db.close()
        return jsonify({'error': 'forbidden access'}), 403

    existing = db.execute(
        "SELECT * FROM ClanTima WHERE ime_tima = ? AND username = ?", (team, username)).fetchone()
    if not existing:
        return "", 204

    db.execute(
        "DELETE FROM ClanTima WHERE ime_tima = ? AND username = ?", (team, username))
    db.commit()
    db.close()
    return jsonify({"status": "member_deleted"}), 200
