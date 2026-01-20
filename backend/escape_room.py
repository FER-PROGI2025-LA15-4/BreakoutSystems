from flask import Blueprint, jsonify, request
from flask_login import current_user
from backend.app import app
from auth import get_db_connection

room_bp = Blueprint('room', __name__)
# računa težinu sobe
def calculate_weight(room_id):
    db = get_db_connection()
    room = db.execute("SELECT * FROM EscapeRoom WHERE room_id = ?", (room_id,)).fetchone()
    rating = db.execute(
        "SELECT SUM(vrijednost_ocjene) AS total, COUNT(vrijednost_ocjene) AS cnt FROM OcjenaTezine WHERE room_id = ?",
        (room_id,)).fetchone()

    if rating["total"] is not None:
        tezina = (room["inicijalna_tezina"] + rating["total"]) / (rating["cnt"] + 1)
    else:
        tezina = room["inicijalna_tezina"]

    db.close()
    return tezina


# dohvat kategorija soba
@room_bp.route('/api/categories', methods=['GET'])
def get_categories():
    db = get_db_connection()
    rows = db.execute(
        "SELECT DISTINCT kategorija FROM EscapeRoom WHERE kategorija IS NOT NULL"
    ).fetchall()
    db.close()

    categories = sorted([row["kategorija"] for row in rows])
    return jsonify({"categories": categories}), 200


# vraća podatke o vlasniku neke sobe
@room_bp.route('/api/rooms/<int:room_id>/owner', methods=['GET'])
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


# API za dohvat gradova
@room_bp.route('/api/cities', methods=['GET'])
def get_cities():
    db = get_db_connection()

    rows = (db.execute("SELECT DISTINCT grad FROM EscapeRoom WHERE grad IS NOT NULL ORDER BY grad")
            .fetchall())

    db.close()
    cities = [row["grad"] for row in rows]
    return jsonify({"cities": cities}), 200


# vraća sobe koje ispunjavaju odabrane kategorije
@room_bp.route('/api/rooms/filter', methods=['POST'])
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

        tezina = calculate_weight(room_id)

        images = db.execute("""
            SELECT *
            FROM EscapeRoomImage
            WHERE room_id = ?
        """, (room_id,)).fetchall()

        for img in images:
            if img["cover"]:
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


# dohvat sobe za određeni room_id
@room_bp.route('/api/rooms/<int:room_id>', methods=['GET'])
def get_room(room_id):
    db = get_db_connection()
    room = db.execute("SELECT * FROM EscapeRoom WHERE room_id = ?", (room_id,)).fetchone()

    if room is None:
        db.close()
        return jsonify({"error": "Room not found"}), 404

    tezina = calculate_weight(room_id)

    images = db.execute("SELECT * FROM EscapeRoomImage WHERE room_id = ?", (room_id,)).fetchall()
    for img in images:
        if img["cover"]:
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


# dohvat 3 najpopularnije sobe
@room_bp.route('/api/rooms/most_popular', methods=['GET'])
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

        tezina = calculate_weight(room["room_id"])

        images = db.execute("""
            SELECT image_url
            FROM EscapeRoomImage
            WHERE room_id = ?
        """, (room["room_id"],)).fetchall()

        for img in images:
            if img["cover"]:
                images.remove(img)
                images.insert(0, img)
                break

        result.append({
            "room_id": room["room_id"],
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

# dohvat termina u nekoj sobi
@room_bp.route('/api/appointments', methods=['GET'])
def get_appointments():
    #{ appointments: [podaci_o_terminu1, podaci_o_terminu2, ...]}
    #{ ime_tima, datVrPoc, rezultatSekunde }
    db = get_db_connection()
    room_id = request.args.get('roomId', type=int)

    if room_id is None:
        return jsonify({"error": "roomId query parameter is required"}), 400

    try:
        appointments = db.execute("""
                SELECT ime_tima, datVrPoc, rezultatSekunde
                FROM Termin
                WHERE room_id = ?
                ORDER BY datVrPoc DESC
            """, (room_id,)).fetchall()

        result = [dict(row) for row in appointments]

        return jsonify({"appointments": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()