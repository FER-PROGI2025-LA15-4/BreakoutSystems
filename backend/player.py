from flask import jsonify, request
from flask_login import current_user,login_required
from backend.app import app
from auth import get_db_connection


# dohvat povijesti igara jednog polaznika
@app.route('/api/game-history', methods=['GET'])
@login_required
def get_game_history():
    if current_user.uloga != "POLAZNIK":
        return jsonify({'error': 'forbidden access'}), 403

    db = get_db_connection()
    rows = db.execute("""SELECT naziv, c.room_id, c.datVrPoc, t.ime_tima
                            FROM ClanNaTerminu c JOIN Termin t ON c.room_id = t.room_id AND c.datVrPoc = t.datVrPoc
                            JOIN EscapeRoom e ON e.room_id = t.room_id""").fetchall()

    history = []
    for row in rows:
        room_id = rows["room_id"]
        ocjena = db.execute("SELECT vrijednost_ocjene FROM OcjenaTezine WHERE room_id = ? AND username = ?", (room_id, current_user.username)).fetchone()
        history.append({
            "room_name": row["naziv"],
            "room_id": room_id,
            "termin": row["datVrPoc"],
            "ime_tima": row["ime_tima"],
            "ocjena_tezine": ocjena
        })

    db.close()
    return jsonify({"history": history}), 200

# API preko kojeg korisnik ocjenjuje neku sobu
@app.route('/api/rate-room', methods=['POST'])
@login_required
def rate_room():
    if current_user.uloga != "POLAZNIK":
        return jsonify({'error': 'forbidden access'}), 403

    data = request.get_json() or {}
    room_id = data.get("room_id")
    rating = data.get("rating")

    db = get_db_connection()
    played = db.execute("SELECT * FROM ClanNaTerminu WHERE room_id = ? AND username = ?", (room_id, current_user.username)).fetchone()
    if played is None:
        db.close()
        return jsonify({'error': 'forbidden access'}), 403

    rtg_exists = db.execute("SELECT * FROM OcjenaTezine WHERE room_id = ? AND username = ?", (room_id, current_user.username)).fetchone()

    cursor = db.cursor()

    if rtg_exists is None:
        cursor.execute("INSERT INTO OcjenaTezine VALUES (room_id, username, vrijednost_ocjene) = (?,?,?)", (room_id, current_user.username, rating))

    else:
        cursor.execute("UPDATE OcjenaTezine SET vrijednost_ocjene = ? WHERE room_id = ? AND username = ?", (rating, room_id, current_user.username))

    db.commit()
    db.close()

    return jsonify({"success": True}), 200

# dohvat timova jednog polaznika
@app.route('/api/my-teams', methods=['GET'])
@login_required
def get_my_teams():
    if current_user.uloga != "POLAZNIK":
        return jsonify({'error': 'forbidden access'}), 403

    db = get_db_connection()

    teams = db.execute(
        """SELECT DISTINCT t.ime, t.image_url, t.voditelj_username 
        FROM Tim t JOIN ClanTima c 
        ON c.ime_tima = t.ime 
        WHERE c.username = ? 
        OR t.voditelj_username = ?""", (current_user.username, current_user.username,)
    ).fetchall()

    result = []

    for team in teams:
        members = db.execute("SELECT username FROM ClanTima WHERE ime_tima = ?", (team["ime"],)).fetchall()

        result.append({
            "name": team["ime"],
            "logo": team["image_url"],
            "leader": team["voditelj_username"],
            "members": [m["username"] for m in members]
        })

    db.close()
    return jsonify({"teams": result}), 200


# ažurira stanje atributa accepted u tablici ClanTima
@app.route('/api/update-invite', methods=['POST'])
@login_required
def update_invite():
    if current_user.uloga != "POLAZNIK":
        return jsonify({'error': 'forbidden access'}), 403

    data = request.get_json() or {}
    team_name = data.get("team_name")
    invite_update = data.get("invite_update")

    db = get_db_connection()
    invite = db.execute("SELECT accepted FROM ClanTima WHERE ime_tima = ? AND username = ?", (team_name,current_user.username,)).fetchone()

    if invite is None:
        db.close()
        return jsonify({"error": "Forbidden"}), 403

    cursor = db.cursor()

    if invite_update == "accept":
        cursor.execute("""
            UPDATE ClanTima
            SET accepted = 1
            WHERE ime_tima = ?
              AND username = ?
        """, (team_name, current_user.username))

    else:
        cursor.execute("""
            DELETE FROM ClanTima
            WHERE ime_tima = ?
              AND username = ?
        """, (team_name, current_user.username))

    db.commit()
    db.close()
    return jsonify({"success": True}), 200


# timovi u koje je korisnik pozvan, ali još nije prihvatio ulazak
@app.route('/api/my-invites', methods=['GET'])
@login_required
def get_my_invites():
    if current_user.uloga != "POLAZNIK":
        return jsonify({'error': 'forbidden access'}), 403
    db = get_db_connection()
    invites = db.execute("SELECT * FROM ClanTima WHERE username = ? AND accepted = 0", (current_user.username,)).fetchall()
    result = []
    for invite in invites:
        team_name = invite["ime_tima"]
        team = db.execute("SELECT * FROM Tim WHERE ime_tima = ?", (team_name,)).fetchone()
        result.append({
            "name": team["ime"],
            "logo": team["image_url"],
            "leader": team["voditelj_username"],
        })

    db.close()
    return jsonify({"invites": result}), 200


# vraća sve korisnike koji imaju aktivan invite u neki tim
@app.route('/api/invites', methods=['GET'])
@login_required
def get_invites():
    if current_user.uloga != "POLAZNIK":
        return jsonify({'error': 'forbidden access'}), 403

    team_name = request.args.get('team_name')
    db = get_db_connection()
    team = db.execute("SELECT * FROM Tim WHERE ime_tima = ? AND voditelj_username = ?", (team_name,current_user.username,)).fetchone()
    if team is None:
        db.close()
        return jsonify({'error': 'forbidden access'}), 403

    users = db.execute("SELECT username FROM ClanTima WHERE ime_tima = ? AND accepted = 0", (team_name,)).fetchall()

    users = [user["username"] for user in users]

    db.close()
    return jsonify({"users": users}), 200