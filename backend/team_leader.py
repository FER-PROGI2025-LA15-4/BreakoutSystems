from flask import Blueprint, jsonify, request
from flask_login import current_user,login_required
from auth import get_db_connection

leader_bp = Blueprint('leader', __name__)

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
        db.close()
        return jsonify({'error': 'forbidden access'}), 403

    users = db.execute("SELECT username FROM ClanTima WHERE ime_tima = ? AND accepted = 0", (team_name,)).fetchall()

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
    username = data.get('username')
    db = get_db_connection()
    rows = db.execute("SELECT * FROM Tim WHERE ime = ? AND voditelj_username = ?", (team, current_user.username)).fetchone()
    if rows is None:
        db.close()
        return jsonify({'error': 'forbidden access'}), 403

    existing = db.execute("SELECT * FROM ClanTima WHERE ime_tima = ? AND username = ?", (team, username)).fetchone()
    if existing:
        return "", 204

    db.execute("INSERT INTO ClanTima (ime_tima, username, accepted) VALUES (?, ?, 0)", (team, username))
    db.commit()
    db.close()
    return jsonify({"status": "invite_created"}), 200

# brisanje člana iz tima ili poništavnaje invitea
@leader_bp.route('/api/remove-member', methods=['POST'])
@login_required
def remove_member():
    if current_user.uloga != "POLAZNIK":
        return jsonify({'error': 'forbidden access'}), 403
    data = request.get_json() or {}
    team = data.get('team_name')
    username = data.get('username')
    db = get_db_connection()
    rows = db.execute("SELECT * FROM Tim WHERE ime = ? AND voditelj_username = ?",
                      (team, current_user.username)).fetchone()
    if rows is None:
        db.close()
        return jsonify({'error': 'forbidden access'}), 403

    existing = db.execute("SELECT * FROM ClanTima WHERE ime_tima = ? AND username = ?", (team, username)).fetchone()
    if not existing:
        return "", 204

    db.execute("DELETE FROM ClanTima WHERE ime_time = ? AND username = ?", (team, username))
    db.commit()
    db.close()
    return jsonify({"status": "member_deleted"}), 200

