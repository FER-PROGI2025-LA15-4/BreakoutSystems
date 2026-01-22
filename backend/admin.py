from datetime import datetime

from dateutil.relativedelta import relativedelta
from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required
from db_connection import get_db_connection

admin_bp = Blueprint('admin', __name__)

# get subscription status for all owners
@admin_bp.route('/api/admin/subscription', methods=['GET'])
@login_required
def get_subscription_status():
    if current_user.uloga != 'ADMIN':
        return jsonify({'error': 'forbidden access'}), 403

    db = get_db_connection()
    users = db.execute("SELECT username, clanarinaDoDatVr FROM Vlasnik").fetchall()
    db.close()

    owners = [
        {
            "username": row["username"],
            "clanarinaDoDatVr": row["clanarinaDoDatVr"]
        }
        for row in users
    ]

    return jsonify({"users": owners}), 200

# uppdate subscription
@admin_bp.route('/api/admin/subscription', methods=['PUT'])
@login_required
def update_subscription_status():
    if current_user.uloga != 'ADMIN':
        return jsonify({'error': 'forbidden access'}), 403

    data = request.get_json() or {}
    username = data.get("username")
    tip = data.get("tip")

    months_to_add = 1 if tip == "mjesečna" else 12

    db = get_db_connection()

    owner = db.execute("""
                SELECT clanarinaDoDatVr
                FROM Vlasnik
                WHERE username = ?
            """, (username,)).fetchone()
    if owner is None:
        return jsonify({"error": "Bad request"}), 400

    now = datetime.now()

    if owner["clanarinaDoDatVr"]:
        current_end = datetime.fromisoformat(owner["clanarinaDoDatVr"])
        start_date = max(current_end, now)
    else:
        start_date = now

    new_end = start_date + relativedelta(months=months_to_add)

    db.execute("""
                UPDATE Vlasnik
                SET clanarinaDoDatVr = ?
                WHERE username = ?
            """, (new_end.strftime("%Y-%m-%d %H:%M:%S"), username))

    db.commit()
    db.close()
    return jsonify({"status": "subscription_extended"}), 200

# brisanje termina
@admin_bp.route('/api/admin/appointment', methods=['DELETE'])
@login_required
def delete_appointment_status():
    if current_user.uloga != 'ADMIN':
        return jsonify({'error': 'forbidden access'}), 403
    data = request.get_json() or {}
    room_id = data.get("room_id")
    datvrpoc = data.get("datVrPoc")

    db = get_db_connection()
    db.execute("DELETE FROM Termin WHERE room_id = ? AND datVrPoc = ?", (room_id, datvrpoc))
    db.commit()
    db.close()
    return jsonify({"status": "success"}), 200


# update termin
@admin_bp.route('/api/admin/appointment', methods=['PUT'])
@login_required
def put_appointment_status():
    if current_user.uloga != 'ADMIN':
        return jsonify({'error': 'forbidden access'}), 403
    data = request.get_json() or {}
    room_id = data.get("room_id")
    datvrpoc = data.get("datVrPoc")
    ime_tima = data.get("ime_tima")
    rezultatsek = data.get("rezultatSekunde")

    db = get_db_connection()
    db.execute("UPDATE Termin SET (ime_tima, rezultatSekunde) = (?,?) WHERE room_id = ? AND datVrPoc = ?", (ime_tima, rezultatsek, room_id, datvrpoc))
    db.commit()
    db.close()
    return jsonify({"status": "success"}), 200

