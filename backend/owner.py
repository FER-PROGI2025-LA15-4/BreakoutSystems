from flask import Blueprint, jsonify, request
from flask_login import current_user,login_required
from auth import get_db_connection
from datetime import datetime, timedelta,timezone


owner_bp = Blueprint('owner', __name__)

# unos rezultata
@owner_bp.route("/api/owner/enter-result", methods=["POST"])
@login_required
def enter_result():
    if current_user.uloga != "VLASNIK":
        return jsonify({'error': 'forbidden access'}), 403

    data = request.get_json() or {}
    room_id = data.get("appointmentRoomId")
    dat_vr_poc = data.get("appointmentDatVrPoc")
    members = data.get("teamMembers")
    result = data.get("resultSeconds")

    db = get_db_connection()

    room = db.execute("SELECT * FROM EscapeRoom WHERE room_id = ? AND vlasnik_username = ?", (room_id, current_user.username,)).fetchone()
    if not room:
        db.close()
        return jsonify({'error': 'forbidden access'}), 403
    cursor = db.cursor()
    cursor.execute("UPDATE Termin SET rezultatSekunde = ? WHERE room_id = ? AND datVrPoc = ?", (result, room_id, dat_vr_poc))
    if cursor.rowcount == 0:
        db.close()
        return jsonify({'error': 'appointment not found'}), 400
    for member in members:
        cursor.execute("INSERT INTO ClanNaTerminu (room_id, datVrPoc, username) VALUES (?, ?, ?)", (room_id, dat_vr_poc, member))

    db.commit()
    db.close()
    return jsonify({"success": True}), 200

# dohvat soba jednog vlasnika
@owner_bp.route('/api/my-rooms', methods=['GET'])
@login_required
def get_my_rooms():
    if current_user.uloga != "VLASNIK":
        return jsonify({'error': 'forbidden access'}), 403

    db = get_db_connection()

    rooms = db.execute("SELECT * FROM EscapeRoom WHERE vlasnik_username = ?", (current_user.username,)).fetchall()

    result = []
    for room in rooms:
        room_id = room["room_id"]

        images = db.execute("""
            SELECT *
            FROM EscapeRoomImage
            WHERE room_id = ?
        """, (room_id,)).fetchall()

        for img in images:
            if img["cover"]:
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

# dohvat podataka o timu prilikom unosa rezultata
@owner_bp.route('/api/owner/team-info')
@login_required
def get_owner_team_info():
    if current_user.uloga != "VLASNIK":
        return jsonify({'error': 'forbidden access'}), 403

    db = get_db_connection()
    ime_tima = request.args.get('ime_tima')

    if not ime_tima:
        return jsonify({'error': 'ime_tima query parameter is required'}), 400


    podaci_tima = db.execute("""
        SELECT t.image_url, t.voditelj_username
        FROM Tim t
        WHERE t.ime = ?
    """, (ime_tima,)).fetchone()

    if not podaci_tima:
        db.close()
        return jsonify({'error': 'Team not found'}), 404

    members_rows = db.execute("""
            SELECT username 
            FROM ClanTima 
            WHERE ime_tima = ? AND accepted = 1
        """, (ime_tima,)).fetchall()
    members_list = [member["username"] for member in members_rows]

    result = {
            "ime_tima": ime_tima,
            "logo": podaci_tima["image_url"],
            "leader": podaci_tima["voditelj_username"],
            "members": members_list
    }

    # ime_tima: "ime_tima1", logo: "url_slike_loga_tima1", leader: "username_voditelj_tim1", members: ["username_clan1_tim1", "username_clan2_tim1"] }

    db.close()
    return jsonify(result), 200

@owner_bp.route('/api/owner/add-appointment', methods=['POST'])
@login_required
def add_appointment():
    if current_user.uloga != "VLASNIK":
        return jsonify({'error': 'forbidden access'}), 403

    data = request.get_json() or {}
    room_id = data.get("room_id")
    date_time_string = data.get("dt")

    if not room_id or not date_time_string:
        return jsonify({'error': 'Missing data'}), 400

    db = get_db_connection()
    try:
        room = db.execute(
            "SELECT 1 FROM EscapeRoom WHERE room_id = ? AND vlasnik_username = ?",
            (room_id, current_user.username)
        ).fetchone()

        if not room:
            return jsonify({'error': 'forbidden access'}), 403

        #Parsiranje vremena (ISO format sa 'Z' na kraju)
        # Zamjenjujemo 'Z' sa '+00:00' da bi fromisoformat radio ispravno na starijim Python verzijama
        # ili koristimo UTC timezone
        dt_object = datetime.fromisoformat(date_time_string.replace('Z', '+00:00'))

        if dt_object < datetime.now(timezone.utc):
            return jsonify({'error': 'Cannot add appointment in the past'}), 400

        db.execute(
            "INSERT INTO Termin (room_id, datVrPoc) VALUES (?, ?)",
            (room_id, date_time_string)
        )
        db.commit()
        return jsonify({"success": True}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 403
    finally:
        db.close()