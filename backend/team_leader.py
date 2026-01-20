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