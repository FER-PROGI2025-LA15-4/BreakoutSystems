import os
from flask import Blueprint, jsonify, request
from flask_login import current_user,login_required
from app import get_db_connection
import stripe
from datetime import datetime, timedelta

payment_bp = Blueprint('payment', __name__)
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

# početak plaćanja
@payment_bp.route('/api/start-payment', methods=['POST'])
@login_required
def test_stripe_payment():
    data = request.get_json()
    # tip placanja: pretplata ili rezervacija sobe
    tip_placanja = data.get('tip_placanja')

    if tip_placanja == 'pretplata':
        tip_pretplate = data.get('tip')

        iznos = 1099 if tip_pretplate == 'mjesečna' else 9999
        naziv = f"Escape Room - {tip_pretplate.capitalize()} članarina"

        try:
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                client_reference_id=current_user.username,
                metadata={
                    'tip_pretplate': tip_pretplate
                    ,'tip_placanja': 'pretplata'
                },
                line_items=[{
                    'price_data': {
                        'currency': 'eur',
                        'product_data': {'name': naziv},
                        'unit_amount': iznos,
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=request.host_url + f'profile?payment_status=true&session_id={{CHECKOUT_SESSION_ID}}',
                cancel_url=request.host_url + 'profile?payment_status=false',
            )
            return jsonify({'url': checkout_session.url})
        except Exception as e:
            return jsonify(error=str(e)), 500
    else:
        room_id = data.get('room_id')
        datVrPoc = data.get('datVrPoc')
        ime_tima = data.get('ime_tima')

        db = get_db_connection()
        room = db.execute("SELECT naziv, cijena FROM EscapeRoom WHERE room_id = ?", (room_id,)).fetchone()
        db.close()

        if not room:
            return jsonify({"error": "Soba nije pronađena"}), 404

        iznos = int(room['cijena'] * 100)
        naziv_proizvoda = f"Rezervacija: {room['naziv']} ({datVrPoc})"

        try:
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                client_reference_id=current_user.username,
                metadata={
                    'tip_placanja': 'rezervacija',
                    'room_id': room_id,
                    'datVrPoc': datVrPoc,
                    'ime_tima': ime_tima
                },
                line_items=[{
                    'price_data': {
                        'currency': 'eur',
                        'product_data': {'name': naziv_proizvoda},
                        'unit_amount': iznos,
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=request.host_url + f'escape-rooms/{room_id}?payment_status=true&session_id={{CHECKOUT_SESSION_ID}}',
                cancel_url=request.host_url + f'escape-rooms/{room_id}?payment_status=false',
            )
            return jsonify({'url': checkout_session.url})
        except Exception as e:
            return jsonify(error=str(e)), 500

# potvrda plaćanja
@payment_bp.route('/api/confirm-payment', methods=['POST'])
@login_required
def confirm_payment():
    data = request.get_json()
    session_id = data.get('session_id')

    try:
        session = stripe.checkout.Session.retrieve(session_id)

        if session.payment_status == 'paid':
            tip_placanja = session.metadata.get('tip_placanja')

            if tip_placanja == 'pretplata':
                # Logika za produljenje članarine
                tip = session.metadata.get('tip_pretplate')
                if tip == 'mjesečna':
                    dani = 30
                else:
                    dani = 365

                db = get_db_connection()
                # Logika: Ako već ima članarinu, produlji je. Ako nema, kreni od danas.

                print(dani)
                current_expiry = db.execute("SELECT clanarinaDoDatVr FROM Vlasnik WHERE username = ?", (current_user.username,)).fetchone()
                datum = datetime.now()

                if current_expiry and current_expiry['clanarinaDoDatVr']:
                    datum = max(datetime.fromisoformat(current_expiry['clanarinaDoDatVr']), datum)

                novi_datum = datum + timedelta(days=dani)

                db.execute("UPDATE Vlasnik SET clanarinaDoDatVr = ? WHERE username = ?", (novi_datum.isoformat(), current_user.username))

                db.commit()
                db.close()
                return jsonify({"status": "success", "message": f"Članarina produljena za {dani} dana."})
            else:
                room_id = session.metadata.get('room_id')
                datVrPoc = session.metadata.get('datVrPoc')
                ime_tima = session.metadata.get('ime_tima')

                db = get_db_connection()

                # Update tablice Termin: dodajemo ime tima na rezervirani termin
                db.execute("""
                    UPDATE Termin 
                    SET ime_tima = ? 
                    WHERE room_id = ? AND datVrPoc = ?
                """, (ime_tima, room_id, datVrPoc))

                db.commit()
                db.close()
                return jsonify({"status": "success", "message": "Termin uspješno rezerviran."})
        return jsonify({"status": "failed"}), 400
    except Exception as e:
        return jsonify(error=str(e)), 500
