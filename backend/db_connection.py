import sqlite3
from pathlib import Path
from flask import current_app


def get_db_connection():
    db_path = Path(current_app.instance_path) / "escape_room.db"
    db_path.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.row_factory = sqlite3.Row
    return conn