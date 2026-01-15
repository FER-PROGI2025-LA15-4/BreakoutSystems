# app.py
import os
import sqlite3
from json.encoder import INFINITY
from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory, session
from flask_login import LoginManager, current_user,login_required
from config import Config
from auth import auth_bp, init_oauth, get_db_connection
from models import User
import stripe


stripe.api_key = Config.STRIPE_SECRET_KEY

if not stripe.api_key:
    raise RuntimeError("stripe secret key not configured")

app = Flask(__name__)
app.frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
app.config.from_object(Config)
Path(app.instance_path).mkdir(parents=True, exist_ok=True)

login_manager = LoginManager()
login_manager.init_app(app)
init_oauth(app)
app.register_blueprint(auth_bp)

SCHEMA_SQL_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'base.sql')



@login_manager.user_loader
def load_user(username):
    db = get_db_connection()
    user_row = db.execute("SELECT * FROM Korisnik WHERE username = ?", (username,)).fetchone()
    db.close()
    if user_row:
        return User(dict(user_row))
    return None

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    if path.startswith("api"): return jsonify({"error": "Not Found"}), 404
    if path == "": path = "index.html"
    full_path = os.path.join(app.frontend_dir, path)
    if os.path.exists(full_path) and os.path.isfile(full_path):
        return send_from_directory(app.frontend_dir, path)
    return send_from_directory(app.frontend_dir, "index.html")

@app.route('/instance/images/<path:filename>')
def serve_instance_images(filename):
    image_dir = Path(app.instance_path) / "images"
    return send_from_directory(image_dir, filename)

@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({'error': 'Unauthorized', 'authenticated': False}), 401

def init_db():

    db = get_db_connection()
    cursor = db.cursor()

    # Only run script if there are no tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    if not tables:
        run_base_sql()
        run_test_sql()
    db.close()


def run_base_sql():
    db = get_db_connection()
    sql_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'base.sql')
    if os.path.exists(sql_path):
        with open(sql_path, 'r', encoding='utf-8') as f:
            db.executescript(f.read())

def run_test_sql():
    db = get_db_connection()
    test_sql = os.path.join(os.path.dirname(__file__), '..', 'database', 'test_skripta.sql')
    if os.path.exists(test_sql):
        try:
            with open(test_sql, 'r', encoding='utf-8') as f:
                db.executescript(f.read())
        except Exception as e:
            print(f"GREŠKA u test_skripta.sql: {e}")


@app.route("/config/stripe")
def stripe_config():
    return {
        "publishableKey": Config.STRIPE_PUBLIC_KEY
    }



@app.route('/api/categories', methods=['GET'])
def get_categories():
    db = get_db_connection()
    rows = db.execute(
        "SELECT DISTINCT kategorija FROM EscapeRoom WHERE kategorija IS NOT NULL"
    ).fetchall()
    db.close()

    categories = sorted([row["kategorija"] for row in rows])
    return jsonify({"categories": categories}), 200

@app.route('/api/rooms/<int:room_id>/owner', methods=['GET'])
def get_owner(room_id):

    db = get_db_connection()

    owner = db.execute("""
        SELECT
            v.naziv_tvrtke,
            v.adresa,
            v.grad,
            v.telefon,
            v.logoImgUrl
        FROM EscapeRoom e
        JOIN Vlasnik v ON v.username = e.vlasnik_username
        WHERE e.room_id = ?
    """, (room_id,)).fetchone()

    db.close()

    if owner is None:
        return jsonify({"error": "Room not found"}), 404

    return jsonify({
        "naziv_tvrtke": owner["naziv_tvrtke"],
        "adresa": owner["adresa"],
        "grad": owner["grad"],
        "telefon": owner["telefon"],
        "logoImgUrl": owner["logoImgUrl"]
    }), 200

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

# API za dohvat gradova
@app.route('/api/cities', methods=['GET'])
def get_cities():
    db = get_db_connection()

    rows = (db.execute("SELECT DISTINCT grad FROM EscapeRoom WHERE grad IS NOT NULL ORDER BY grad")
            .fetchall())

    db.close()
    cities = [row["grad"] for row in rows]
    return jsonify({"cities": cities}), 200

@app.route('/api/my-rooms', methods=['GET'])
@login_required
def get_my_rooms():
    if current_user.uloga != "VLASNIK":
        return jsonify({'error': 'forbidden access'}), 403

    db = get_db_connection()

    rooms = db.execute("SELECT * FROM EscapeRoom WHERE username = ?", (current_user.username,)).fetchall()

    result = []
    for room in rooms:
        room_id = rooms["room_id"]

        images = db.execute("""
            SELECT *
            FROM EscapeRoomImage
            WHERE room_id = ?
        """, (room_id,)).fetchall()

        for img in images:
            if img["cover"] == True:
                images.remove(img)
                images.insert(0, img)

        result.append({
            "room_id": room_id,
            "naziv": room["naziv"],
            "opis": room["opis"],
            "geo_lat": room["geo_lat"],
            "geo_long": room["geo_long"],
            "adresa": room["adresa"],
            "grad": room["grad"],
            "tezina": room["inicijalna_tezina"],
            "cijena": room["cijena"],
            "minBrClanTima": room["minBrClanTima"],
            "maxBrClanTima": room["maxBrClanTima"],
            "kategorija": room["kategorija"],
            "slike": [img["image_url"] for img in images]
        })

    db.close()
    return jsonify({"rooms": result}), 200



@app.route('/api/rooms/filter', methods=['POST'])
def filter_rooms():
    data = request.get_json() or {}

    city = data.get("city")
    category = data.get("category")
    team = data.get("team")
    players = data.get("players")

    db = get_db_connection()

    # --- base room query ---
    sql = "SELECT * FROM EscapeRoom WHERE 1=1"
    params = []

    if city:
        sql += " AND grad = ?"
        params.append(city)

    if category:
        sql += " AND kategorija = ?"
        params.append(category)

    rooms = db.execute(sql, params).fetchall()
    result = []

    team_filter = False
    players_filter = False

    if current_user.is_authenticated and team:
        membership = db.execute("""
            SELECT 1
            FROM ClanTima
            WHERE ime_tima = ? AND username = ?
        """, (team, current_user.username)).fetchone()

        team_filter = membership is not None

    if (
        current_user.is_authenticated
        and team_filter
        and players
        and isinstance(players, list)
        and len(players) > 0
    ):
        players_filter = True

    for room in rooms:
        room_id = room["room_id"]

        if team and team_filter:
            played = db.execute("""
                SELECT 1
                FROM Termin
                WHERE room_id = ? AND ime_tima = ?
            """, (room_id, team)).fetchone()

            if played:
                continue

        if players_filter:
            placeholders = ",".join("?" for _ in players)

            overlap = db.execute(f"""
                SELECT 1
                FROM ClanNaTerminu c
                JOIN Termin t
                  ON t.room_id = c.room_id
                 AND t.datVrPoc = c.datVrPoc
                WHERE t.room_id = ?
                  AND c.username IN ({placeholders})
            """, (room_id, *players)).fetchone()

            if overlap:
                continue

        rating = db.execute("""
            SELECT
                SUM(vrijednost_ocjene) AS total,
                COUNT(vrijednost_ocjene) AS cnt
            FROM OcjenaTezine
            WHERE room_id = ?
        """, (room_id,)).fetchone()

        if rating["total"] is not None:
            tezina = (room["inicijalna_tezina"] + rating["total"]) / (rating["cnt"] + 1)
        else:
            tezina = room["inicijalna_tezina"]

        images = db.execute("""
            SELECT *
            FROM EscapeRoomImage
            WHERE room_id = ?
        """, (room_id,)).fetchall()

        for img in images:
            if img["cover"] == True:
                images.remove(img)
                images.insert(0, img)
                break

        result.append({
            "room_id": room_id,
            "naziv": room["naziv"],
            "opis": room["opis"],
            "geo_lat": room["geo_lat"],
            "geo_long": room["geo_long"],
            "adresa": room["adresa"],
            "grad": room["grad"],
            "tezina": round(tezina, 2),
            "cijena": room["cijena"],
            "minBrClanTima": room["minBrClanTima"],
            "maxBrClanTima": room["maxBrClanTima"],
            "kategorija": room["kategorija"],
            "slike": [img["image_url"] for img in images]
        })

    db.close()
    return jsonify({"rooms": result}), 200

@app.route('/api/rooms/<int:room_id>', methods=['GET'])
def get_room(room_id):
    db = get_db_connection()
    room = db.execute("SELECT * FROM EscapeRoom WHERE room_id = ?", (room_id,)).fetchone()

    if room is None:
        db.close()
        return jsonify({"error": "Room not found"}), 404

    rating = db.execute("SELECT SUM(vrijednost_ocjene) AS total, COUNT(vrijednost_ocjene) AS cnt FROM OcjenaTezine WHERE room_id = ?", (room_id,)).fetchone()

    if rating["total"] is not None:
        tezina = (room["inicijalna_tezina"] + rating["total"]) / (rating["cnt"] + 1)
    else:
        tezina = room["inicijalna_tezina"]

    images = db.execute("SELECT * FROM EscapeRoomImage WHERE room_id = ?", (room_id,)).fetchall()
    for img in images:
        if img["cover"] == True:
            images.remove(img)
            images.insert(0, img)
            break

    db.close()
    return jsonify({
        "room_id": room_id,
        "naziv": room["naziv"],
        "opis": room["opis"],
        "geo_lat": room["geo_lat"],
        "geo_long": room["geo_long"],
        "adresa": room["adresa"],
        "grad": room["grad"],
        "tezina": round(tezina, 2),
        "cijena": room["cijena"],
        "minBrClanTima": room["minBrClanTima"],
        "maxBrClanTima": room["maxBrClanTima"],
        "kategorija": room["kategorija"],
        "slike": [img["image_url"] for img in images]
    }), 200

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    db = get_db_connection()
    room_id = request.args.get('room_id')
    sql = "SELECT ime_tima, rezultatSekunde FROM Termin WHERE datVrPoc < CURRENT_TIMESTAMP"

    params = []

    if room_id is not None:
        sql+= " AND room_id = ?"
        params.append(room_id)

    sql += " ORDER BY rezultatSekunde ASC NULLS LAST"

    rows = db.execute(sql, params).fetchall()
    db.close()

    # rank, ime tima, bodovi na globalnoj
    # rank, ime tima i vrijeme na lokalnoj za sobu
    leaderboard = []
    if room_id is not None: #lokalni leaderboard za sobu
        for row in rows:
            if row[1] is not None:  # tim je završio sobu
                leaderboard.append({
                    "ime_tima": row[0],
                    "score": row[1]
                })
            else: #tim nije završio sobu
                leaderboard.append({
                    "ime_tima": row[0],
                    "score": None
                })

    # globalni leaderboard
    # za svaki tim:
    # 1. uzeti sve sobe i izracunati prosjecno vrijeme igranja sobe
    # 2. iz tih soba odabrati sve one koje je igrao tim
    # 3. za svaku od tih soba izracunati koeficijent kao prosjecno vrijeme/vrijeme tima i taj koeficijent pomnoziti s tezinom sobe
    # 4. zbrojiti sve rezultate - to su bodovi tima

    else:
        db = get_db_connection()
        escape_rooms = db.execute("SELECT * FROM EscapeRoom").fetchall()
        teams = db.execute("SELECT ime FROM Tim").fetchall()

        avg_times_for_rooms = {}
        avg_weight_for_rooms = {}
        score_per_team = []

        for room in escape_rooms: #za svaku sobu izračunaj prosječno vrijeme
            room_id = room["room_id"]
            avg_time = db.execute("SELECT AVG(rezultatSekunde) FROM Termin WHERE room_id = ?", (room_id,)).fetchone()
            avg_times_for_rooms.update({room_id: avg_time[0]})

            # za svaku sobu izračunaj prosječnu ocjenu
            rating = db.execute(
                "SELECT SUM(vrijednost_ocjene) AS total, COUNT(vrijednost_ocjene) AS cnt FROM OcjenaTezine WHERE room_id = ?",
                (room_id,)).fetchone()
            if rating["total"] is not None:
                tezina = (room["inicijalna_tezina"] + rating["total"]) / (rating["cnt"] + 1)
            else:
                tezina = room["inicijalna_tezina"]
            avg_weight_for_rooms.update({room_id: tezina})

        # izračun bodova za svaki tim
        for team in teams:
            ime_tima = team["ime"]
            score = 0
            results = db.execute("SELECT room_id, rezultatSekunde FROM Termin WHERE ime_tima = ?", (ime_tima,)).fetchall()
            for r in results:
                room_id = r["room_id"]
                if r["rezultatSekunde"] is not None:
                    coef = avg_times_for_rooms[room_id] / r["rezultatSekunde"]
                else:
                    coef = 0
                score += coef * avg_weight_for_rooms[room_id]

            score_per_team.append([ime_tima, score])

        score_per_team.sort(key=lambda x: x[1], reverse=True)

        for pair in score_per_team:
            leaderboard.append({
                "ime_tima": pair[0],
                "score": round(pair[1], 2)
            })

        db.close()

    return jsonify({"leaderboard": leaderboard}), 200


@app.route('/api/rooms/most_popular', methods=['GET'])
def top3_most_popular_rooms():
    db = get_db_connection()

    rooms = db.execute("""
        SELECT
            er.room_id,
            er.naziv,
            er.opis,
            er.geo_lat,
            er.geo_long,
            er.adresa,
            er.grad,
            er.inicijalna_tezina,
            er.cijena,
            er.minBrClanTima,
            er.maxBrClanTima,
            er.kategorija,
            COUNT(t.ime_tima) AS broj_igranja
        FROM EscapeRoom er
        LEFT JOIN Termin t
          ON er.room_id = t.room_id
        GROUP BY er.room_id
        ORDER BY broj_igranja DESC
        LIMIT 3
    """).fetchall()

    result = []

    for room in rooms:
        images = db.execute("""
            SELECT image_url
            FROM EscapeRoomImage
            WHERE room_id = ?
        """, (room["room_id"],)).fetchall()

        result.append({
            "room_id": room["room_id"],
            "naziv": room["naziv"],
            "opis": room["opis"],
            "geo_lat": room["geo_lat"],
            "geo_long": room["geo_long"],
            "adresa": room["adresa"],
            "grad": room["grad"],
            "tezina": room["inicijalna_tezina"],
            "cijena": room["cijena"],
            "minBrClanTima": room["minBrClanTima"],
            "maxBrClanTima": room["maxBrClanTima"],
            "kategorija": room["kategorija"],
            "slike": [img["image_url"] for img in images]
        })

    db.close()
    return jsonify({"rooms": result}), 200


if __name__ == '__main__':
    with app.app_context():
        init_db()
    app.run(debug=True, port=int(os.environ.get("PORT", 5000)), host='0.0.0.0')