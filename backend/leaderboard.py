from flask import Blueprint, jsonify, request
from db_connection import get_db_connection
from escape_room import calculate_weight

leaderboard_bp = Blueprint('leaderboard', __name__)
# generira globalni leaderboard ako zahtjev nema parametara, inače lokalni leaderboard za neku sobu
@leaderboard_bp.route('/api/leaderboard', methods=['GET'])
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
            tezina = calculate_weight(room_id)
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