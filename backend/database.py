from flask import Blueprint, send_from_directory, jsonify
import os

db_bp = Blueprint('db', __name__, url_prefix='/api/db')
db_bp.images_dir = os.path.join(os.path.dirname(__file__), "..", "instance", "images")

@db_bp.route('/images/<path:path>')
def serve_images(path):
    full_path = os.path.join(db_bp.images_dir, path)
    print(full_path)
    if os.path.exists(full_path) and os.path.isfile(full_path):
        return send_from_directory(db_bp.images_dir, path)

    return jsonify({"error": "Not Found"}), 404
