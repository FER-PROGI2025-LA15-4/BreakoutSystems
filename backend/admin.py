from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required
from auth import get_db_connection

admin_bp = Blueprint('admin', __name__)

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