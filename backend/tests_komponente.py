"""
Pokretanje:
    pip install -r requirements.txt
    pip install pytest flask-testing
    pip install flask-login flask flask-sqlalchemy authlib python-dotenv
    pytest tests.py -v
"""

import pytest
import sqlite3
import tempfile
import os
from pathlib import Path
from flask import Flask
from flask_login import LoginManager, login_user
from unittest.mock import patch, MagicMock
from io import BytesIO
from datetime import datetime, timedelta


@pytest.fixture
def app():
    """Kreira Flask app s test konfiguracijom"""
    from app import app as flask_app
    from auth import auth_bp, init_oauth
    
    temp_dir = tempfile.mkdtemp()
    
    flask_app.config.update({
        'TESTING': True,
        'SECRET_KEY': 'test-secret-key',
        'WTF_CSRF_ENABLED': False,
        'LOGIN_DISABLED': False,
    })
    
    flask_app.instance_path = temp_dir
    
    with flask_app.app_context():
        init_test_db(flask_app)
    
    yield flask_app
    
    import shutil
    shutil.rmtree(temp_dir, ignore_errors=True)


@pytest.fixture
def client(app):
    """Test klijent"""
    return app.test_client()


@pytest.fixture
def auth_client(app, client):
    """Autenticirani test klijent (POLAZNIK)"""
    with client.session_transaction() as sess:
        sess['_user_id'] = 'test_polaznik'
    return client


@pytest.fixture
def owner_client(app, client):
    """Autenticirani test klijent (VLASNIK)"""
    with client.session_transaction() as sess:
        sess['_user_id'] = 'test_vlasnik'
    return client


@pytest.fixture
def admin_client(app, client):
    """Autenticirani test klijent (ADMIN)"""
    with client.session_transaction() as sess:
        sess['_user_id'] = 'test_admin'
    return client


def init_test_db(app):
    """Inicijalizira test bazu s potrebnim tablicama i podacima"""
    db_path = Path(app.instance_path) / "escape_room.db"
    db_path.parent.mkdir(parents=True, exist_ok=True)
    
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON")
    
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS Korisnik (
            username TEXT PRIMARY KEY,
            oauth_id TEXT UNIQUE,
            uloga TEXT NOT NULL CHECK(uloga IN ('POLAZNIK', 'VLASNIK', 'ADMIN'))
        );
        
        CREATE TABLE IF NOT EXISTS Polaznik (
            username TEXT PRIMARY KEY,
            email TEXT,
            profImgUrl TEXT,
            FOREIGN KEY (username) REFERENCES Korisnik(username)
        );
        
        CREATE TABLE IF NOT EXISTS Vlasnik (
            username TEXT PRIMARY KEY,
            naziv_tvrtke TEXT,
            adresa TEXT,
            grad TEXT,
            telefon TEXT,
            logoImgUrl TEXT,
            clanarinaDoDatVr TEXT,
            FOREIGN KEY (username) REFERENCES Korisnik(username)
        );
        
        CREATE TABLE IF NOT EXISTS EscapeRoom (
            room_id INTEGER PRIMARY KEY AUTOINCREMENT,
            vlasnik_username TEXT NOT NULL,
            naziv TEXT NOT NULL,
            opis TEXT,
            geo_lat REAL,
            geo_long REAL,
            adresa TEXT,
            grad TEXT,
            inicijalna_tezina REAL DEFAULT 3.0,
            cijena REAL,
            minBrClanTima INTEGER DEFAULT 2,
            maxBrClanTima INTEGER DEFAULT 6,
            kategorija TEXT,
            FOREIGN KEY (vlasnik_username) REFERENCES Vlasnik(username)
        );
        
        CREATE TABLE IF NOT EXISTS EscapeRoomImage (
            image_id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_id INTEGER NOT NULL,
            image_url TEXT,
            image_index INTEGER DEFAULT 0,
            FOREIGN KEY (room_id) REFERENCES EscapeRoom(room_id)
        );
        
        CREATE TABLE IF NOT EXISTS OcjenaTezine (
            room_id INTEGER,
            username TEXT,
            vrijednost_ocjene INTEGER,
            PRIMARY KEY (room_id, username),
            FOREIGN KEY (room_id) REFERENCES EscapeRoom(room_id)
        );
        
        CREATE TABLE IF NOT EXISTS Tim (
            ime TEXT PRIMARY KEY,
            image_url TEXT,
            voditelj_username TEXT NOT NULL,
            FOREIGN KEY (voditelj_username) REFERENCES Polaznik(username)
        );
        
        CREATE TABLE IF NOT EXISTS ClanTima (
            ime_tima TEXT,
            username TEXT,
            accepted INTEGER DEFAULT 0,
            PRIMARY KEY (ime_tima, username),
            FOREIGN KEY (ime_tima) REFERENCES Tim(ime),
            FOREIGN KEY (username) REFERENCES Polaznik(username)
        );
        
        CREATE TABLE IF NOT EXISTS Termin (
            room_id INTEGER,
            datVrPoc TEXT,
            ime_tima TEXT,
            rezultatSekunde INTEGER,
            PRIMARY KEY (room_id, datVrPoc),
            FOREIGN KEY (room_id) REFERENCES EscapeRoom(room_id),
            FOREIGN KEY (ime_tima) REFERENCES Tim(ime)
        );
        
        CREATE TABLE IF NOT EXISTS ClanNaTerminu (
            room_id INTEGER,
            datVrPoc TEXT,
            username TEXT,
            PRIMARY KEY (room_id, datVrPoc, username),
            FOREIGN KEY (room_id, datVrPoc) REFERENCES Termin(room_id, datVrPoc)
        );
    """)
    
    conn.executescript("""
        INSERT OR IGNORE INTO Korisnik (username, oauth_id, uloga) VALUES 
            ('test_polaznik', '12345', 'POLAZNIK'),
            ('test_vlasnik', '67890', 'VLASNIK'),
            ('drugi_polaznik', '11111', 'POLAZNIK'),
            ('treci_polaznik', '22222', 'POLAZNIK'),
            ('test_admin', '99999', 'ADMIN'),
            ('drugi_vlasnik', '88888', 'VLASNIK');
        
        INSERT OR IGNORE INTO Polaznik (username, email) VALUES 
            ('test_polaznik', 'test@example.com'),
            ('drugi_polaznik', 'drugi@example.com'),
            ('treci_polaznik', 'treci@example.com');
        
        INSERT OR IGNORE INTO Vlasnik (username, naziv_tvrtke, adresa, grad, telefon, clanarinaDoDatVr) VALUES 
            ('test_vlasnik', 'Test Escape d.o.o.', 'Testna 1', 'Zagreb', '01234567', '2025-12-31'),
            ('drugi_vlasnik', 'Drugi Escape d.o.o.', 'Druga 2', 'Split', '09876543', NULL);
        
        INSERT OR IGNORE INTO EscapeRoom (room_id, vlasnik_username, naziv, opis, grad, kategorija, inicijalna_tezina, cijena, minBrClanTima, maxBrClanTima, adresa, geo_lat, geo_long)
        VALUES 
            (1, 'test_vlasnik', 'Zatvor', 'Pobjegnite iz zatvora!', 'Zagreb', 'Horror', 4.0, 120.0, 2, 6, 'Zatvorska 1', 45.8, 15.9),
            (2, 'test_vlasnik', 'Laboratorij', 'Znanstveni escape room', 'Split', 'Sci-Fi', 3.5, 100.0, 3, 5, 'Laboratorijska 2', 43.5, 16.4),
            (3, 'test_vlasnik', 'Piratski brod', 'Ahoy!', 'Zagreb', 'Avantura', 2.5, 90.0, 2, 4, 'Lucka 3', 45.8, 15.9),
            (4, 'drugi_vlasnik', 'Spijunska soba', 'Top secret!', 'Split', 'Akcija', 4.5, 150.0, 2, 4, 'Tajna 4', 43.5, 16.4);
        
        INSERT OR IGNORE INTO EscapeRoomImage (room_id, image_url, image_index) VALUES
            (1, '/images/zatvor.jpg', 0),
            (1, '/images/zatvor2.jpg', 1),
            (2, '/images/lab.jpg', 0),
            (3, '/images/pirat.jpg', 0);
        
        INSERT OR IGNORE INTO OcjenaTezine (room_id, username, vrijednost_ocjene) VALUES
            (1, 'test_polaznik', 4),
            (1, 'drugi_polaznik', 5);
        
        INSERT OR IGNORE INTO Tim (ime, voditelj_username, image_url) VALUES 
            ('LockBusters', 'test_polaznik', '/images/lockbusters.jpg'),
            ('EscapeMasters', 'drugi_polaznik', '/images/escapemasters.jpg'),
            ('PrazniTim', 'treci_polaznik', NULL);
        
        INSERT OR IGNORE INTO ClanTima (ime_tima, username, accepted) VALUES 
            ('LockBusters', 'drugi_polaznik', 1),
            ('LockBusters', 'treci_polaznik', 0),
            ('EscapeMasters', 'test_polaznik', 1);
        
        INSERT OR IGNORE INTO Termin (room_id, datVrPoc, ime_tima, rezultatSekunde) VALUES
            (1, '2025-01-10 14:00:00', 'LockBusters', 2400),
            (1, '2025-01-15 16:00:00', 'EscapeMasters', 3000),
            (2, '2025-01-20 10:00:00', 'LockBusters', NULL),
            (2, '2026-06-01 14:00:00', NULL, NULL),
            (3, '2026-06-15 10:00:00', NULL, NULL);
        
        INSERT OR IGNORE INTO ClanNaTerminu (room_id, datVrPoc, username) VALUES
            (1, '2025-01-10 14:00:00', 'test_polaznik'),
            (1, '2025-01-10 14:00:00', 'drugi_polaznik'),
            (1, '2025-01-15 16:00:00', 'drugi_polaznik'),
            (1, '2025-01-15 16:00:00', 'test_polaznik');
    """)
    
    conn.commit()
    conn.close()


class TestAuth:
    """Testovi za autentikaciju - /api/auth/*"""
    
    def test_me_unauthorized(self, client):
        """GET /api/auth/me bez prijave vraca 401"""
        response = client.get('/api/auth/me')
        assert response.status_code == 401
        data = response.get_json()
        assert 'error' in data
    
    def test_me_authorized_polaznik(self, app, auth_client):
        """GET /api/auth/me s prijavljenim polaznikom vraca podatke korisnika"""
        with app.app_context():
            response = auth_client.get('/api/auth/me')
            assert response.status_code in [200]
    
    def test_me_authorized_vlasnik(self, app, owner_client):
        """GET /api/auth/me s prijavljenim vlasnikom"""
        with app.app_context():
            response = owner_client.get('/api/auth/me')
            assert response.status_code in [200]
    
    def test_logout_unauthorized(self, client):
        """GET /api/auth/logout bez prijave vraca 401"""
        response = client.get('/api/auth/logout')
        assert response.status_code == 401
    
    def test_logout_authorized(self, auth_client):
        """GET /api/auth/logout s prijavljenim korisnikom"""
        response = auth_client.get('/api/auth/logout')
        assert response.status_code in [200]
    
    def test_edit_unauthorized(self, client):
        """POST /api/auth/edit bez prijave vraca 401"""
        response = client.post('/api/auth/edit', data={})
        assert response.status_code == 401
    
    def test_register_missing_username(self, client):
        """POST /api/auth/register bez username vraca 400"""
        response = client.post('/api/auth/register', data={
            'uloga': 'POLAZNIK'
        })
        assert response.status_code == 400



class TestRooms:
    """Testovi za escape roomove - /api/rooms/*"""
    
    def test_get_all_rooms_via_filter(self, client):
        """POST /api/rooms/filter bez filtera vraca sve sobe"""
        response = client.post('/api/rooms/filter', json={}, content_type='application/json')
        assert response.status_code == 200
        data = response.get_json()
        assert 'rooms' in data
        assert isinstance(data['rooms'], list)
        assert len(data['rooms']) >= 1
    
    def test_get_room_by_id(self, client):
        """GET /api/rooms/<id> vraca pojedinacnu sobu"""
        response = client.get('/api/rooms/1')
        assert response.status_code == 200
        data = response.get_json()
        assert data['naziv'] == 'Zatvor'
        assert data['grad'] == 'Zagreb'
        assert 'tezina' in data
    
    def test_get_room_not_found(self, client):
        """GET /api/rooms/<id> za nepostojecu sobu vraca 404"""
        response = client.get('/api/rooms/9999')
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data
    
    def test_get_room_owner(self, client):
        """GET /api/rooms/<id>/owner vraca vlasnika sobe"""
        response = client.get('/api/rooms/1/owner')
        assert response.status_code == 200
        data = response.get_json()
        assert data['naziv_tvrtke'] == 'Test Escape d.o.o.'
        assert data['grad'] == 'Zagreb'
    
    def test_get_room_owner_not_found(self, client):
        """GET /api/rooms/<id>/owner za nepostojecu sobu vraca 404"""
        response = client.get('/api/rooms/9999/owner')
        assert response.status_code == 404
    
    
    
    def test_room_has_all_fields(self, client):
        """GET /api/rooms/<id> vraca sve potrebne atribute"""
        response = client.get('/api/rooms/1')
        data = response.get_json()
        required_fields = ['room_id', 'naziv', 'opis', 'grad', 'adresa', 
                          'tezina', 'cijena', 'minBrClanTima', 'maxBrClanTima', 
                          'kategorija', 'slike']
        for field in required_fields:
            assert field in data, f"Nedostaje polje: {field}"
    
    def test_room_tezina_calculation(self, client):
        """Provjera da se tezina ispravno racuna iz ocjena"""
        response = client.get('/api/rooms/1')
        data = response.get_json()
        assert isinstance(data['tezina'], (int, float))
        assert 1 <= data['tezina'] <= 5



class TestRoomFiltering:
    """Testovi za filtriranje soba"""
    
    def test_filter_by_city(self, client):
        """POST /api/rooms/filter s gradom"""
        response = client.post('/api/rooms/filter', json={'city': 'Zagreb'}, content_type='application/json')
        assert response.status_code == 200
        data = response.get_json()
        assert all(room['grad'] == 'Zagreb' for room in data['rooms'])
    
    def test_filter_by_category(self, client):
        """POST /api/rooms/filter s kategorijom"""
        response = client.post('/api/rooms/filter', json={'category': 'Horror'}, content_type='application/json')
        assert response.status_code == 200
        data = response.get_json()
        assert all(room['kategorija'] == 'Horror' for room in data['rooms'])
    
    def test_filter_combined(self, client):
        """POST /api/rooms/filter s vise filtera"""
        response = client.post('/api/rooms/filter', json={'city': 'Zagreb', 'category': 'Avantura'}, content_type='application/json')
        assert response.status_code == 200
        data = response.get_json()
        for room in data['rooms']:
            assert room['grad'] == 'Zagreb'
            assert room['kategorija'] == 'Avantura'
    
    def test_filter_no_results(self, client):
        """POST /api/rooms/filter bez rezultata vraca praznu listu"""
        response = client.post('/api/rooms/filter', json={'city': 'Nepostojeci grad'}, content_type='application/json')
        assert response.status_code == 200
        data = response.get_json()
        assert data['rooms'] == []
    
    
    def test_filter_no_body_returns_error(self, client):
        """POST /api/rooms/filter bez body-ja vraca 400"""
        response = client.post('/api/rooms/filter', content_type='application/json')
        assert response.status_code == 400
    

  



class TestLeaderboard:
    """Testovi za rang ljestvicu"""
    
    def test_global_leaderboard(self, client):
        """GET /api/leaderboard vraca globalnu ljestvicu"""
        response = client.get('/api/leaderboard')
        assert response.status_code == 200
        data = response.get_json()
        assert 'leaderboard' in data
        assert isinstance(data['leaderboard'], list)
    
    def test_room_leaderboard(self, client):
        """GET /api/leaderboard?room_id=1 vraca ljestvicu za sobu"""
        response = client.get('/api/leaderboard?room_id=1')
        assert response.status_code == 200
        data = response.get_json()
        assert 'leaderboard' in data
    
    def test_leaderboard_structure(self, client):
        """Provjera strukture leaderboard rezultata"""
        response = client.get('/api/leaderboard')
        data = response.get_json()
        for entry in data['leaderboard']:
            assert 'ime_tima' in entry
            assert 'score' in entry

    def test_nonexistent_room_leaderboard(self, client):
        """Leaderboard za nepostojecu sobu vraca praznu listu"""
        response = client.get('/api/leaderboard?room_id=9999')
        assert response.status_code == 200
        data = response.get_json()
        assert data['leaderboard'] == []



class TestMetadata:
    """Testovi za metadata endpointe"""
    
    def test_get_categories(self, client):
        """GET /api/categories vraca listu kategorija"""
        response = client.get('/api/categories')
        assert response.status_code == 200
        data = response.get_json()
        assert 'categories' in data
        assert 'Horror' in data['categories']
    
    def test_get_cities(self, client):
        """GET /api/cities vraca listu gradova"""
        response = client.get('/api/cities')
        assert response.status_code == 200
        data = response.get_json()
        assert 'cities' in data
        assert 'Zagreb' in data['cities']
    
    def test_categories_unique(self, client):
        """Kategorije su jedinstvene"""
        response = client.get('/api/categories')
        data = response.get_json()
        assert len(data['categories']) == len(set(data['categories']))
    
    def test_cities_unique(self, client):
        """Gradovi su jedinstveni"""
        response = client.get('/api/cities')
        data = response.get_json()
        assert len(data['cities']) == len(set(data['cities']))



class TestAppointments:
    """Testovi za termine"""
    
    def test_get_appointments(self, client):
        """GET /api/appointments?roomId=1 vraca termine za sobu"""
        response = client.get('/api/appointments?roomId=1')
        assert response.status_code == 200
        data = response.get_json()
        assert 'appointments' in data
    
    def test_get_appointments_missing_room_id(self, client):
        """GET /api/appointments bez roomId vraca 400"""
        response = client.get('/api/appointments')
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
    
    def test_appointments_structure(self, client):
        """Provjera strukture termina"""
        response = client.get('/api/appointments?roomId=1')
        data = response.get_json()
        for apt in data['appointments']:
            assert 'ime_tima' in apt
            assert 'datVrPoc' in apt
            assert 'rezultatSekunde' in apt
    
    def test_appointments_for_room_with_bookings(self, client):
        """Soba s rezervacijama vraca termine"""
        response = client.get('/api/appointments?roomId=1')
        data = response.get_json()
        assert len(data['appointments']) >= 1
    
    def test_appointments_for_empty_room(self, client):
        """Soba bez termina vraca praznu listu"""
        response = client.get('/api/appointments?roomId=4')
        assert response.status_code == 200
        data = response.get_json()
        assert data['appointments'] == []
    
    
    def test_appointments_with_results(self, client):
        """Termini s rezultatima imaju rezultatSekunde"""
        response = client.get('/api/appointments?roomId=1')
        data = response.get_json()
        completed = [a for a in data['appointments'] if a['rezultatSekunde'] is not None]
        assert len(completed) >= 1



class TestPlayer:
    """Testovi za polaznika"""
    
    def test_my_teams_unauthorized(self, client):
        """GET /api/my-teams bez prijave vraca 401"""
        response = client.get('/api/my-teams')
        assert response.status_code == 401
    
    def test_my_teams_authorized(self, auth_client):
        """GET /api/my-teams s prijavljenim polaznikom"""
        response = auth_client.get('/api/my-teams')
        assert response.status_code in [200]
    
    def test_game_history_unauthorized(self, client):
        """GET /api/game-history bez prijave vraca 401"""
        response = client.get('/api/game-history')
        assert response.status_code == 401
    
    def test_game_history_authorized(self, auth_client):
        """GET /api/game-history s prijavljenim polaznikom"""
        response = auth_client.get('/api/game-history')
        assert response.status_code in [200]
    
    def test_team_invites_unauthorized(self, client):
        """GET /api/team-invites bez prijave vraca 401"""
        response = client.get('/api/team-invites')
        assert response.status_code == 401
    
    def test_team_invites_authorized(self, auth_client):
        """GET /api/team-invites s prijavljenim polaznikom"""
        response = auth_client.get('/api/team-invites')
        assert response.status_code in [200, 403]
    
    def test_update_invite_unauthorized(self, client):
        """POST /api/update-invite bez prijave vraca 401"""
        response = client.post('/api/update-invite', json={})
        assert response.status_code == 401
    
    def test_rate_room_unauthorized(self, client):
        """POST /api/rate-room bez prijave vraca 401"""
        response = client.post('/api/rate-room', json={'room_id': 1, 'rating': 4})
        assert response.status_code == 401
    

class TestTeamLeader:
    """Testovi za voditelja tima"""
    
    def test_create_team_unauthorized(self, client):
        """POST /api/create-team bez prijave vraca 401"""
        response = client.post('/api/create-team', data={'name': 'NoviTim'})
        assert response.status_code == 401
    
    def test_create_team_missing_name(self, auth_client):
        """POST /api/create-team bez imena vraca 400"""
        response = auth_client.post('/api/create-team', data={})
        assert response.status_code in [400, 403]
    
    def test_add_member_unauthorized(self, client):
        """POST /api/add-member bez prijave vraca 401"""
        response = client.post('/api/add-member', json={})
        assert response.status_code == 401
    
    def test_add_member_forbidden_for_owner(self, owner_client):
        """POST /api/add-member s vlasnikom vraca 403"""
        response = owner_client.post('/api/add-member', json={'team_name': 'LockBusters', 'user': 'drugi_polaznik'})
        assert response.status_code == 403
    
    def test_remove_member_unauthorized(self, client):
        """POST /api/remove-member bez prijave vraca 401"""
        response = client.post('/api/remove-member', json={})
        assert response.status_code == 401
    
    def test_edit_team_unauthorized(self, client):
        """POST /api/edit-team bez prijave vraca 401"""
        response = client.post('/api/edit-team', data={'name': 'LockBusters'})
        assert response.status_code == 401
    
    def test_get_invites_unauthorized(self, client):
        """GET /api/invites bez prijave vraca 401"""
        response = client.get('/api/invites?teamName=LockBusters')
        assert response.status_code == 401
    
    def test_has_played_unauthorized(self, client):
        """GET /api/has-played bez prijave vraca 401"""
        response = client.get('/api/has-played?ime_tima=LockBusters&room_id=1')
        assert response.status_code == 401
    


class TestOwner:
    """Testovi za vlasnika"""
    
    def test_my_rooms_unauthorized(self, client):
        """GET /api/my-rooms bez prijave vraca 401"""
        response = client.get('/api/my-rooms')
        assert response.status_code == 401
    
    def test_my_rooms_forbidden_for_polaznik(self, auth_client):
        """GET /api/my-rooms s polaznikom vraca 403"""
        response = auth_client.get('/api/my-rooms')
        assert response.status_code == 403
    
    def test_my_rooms_authorized(self, owner_client):
        """GET /api/my-rooms s prijavljenim vlasnikom"""
        response = owner_client.get('/api/my-rooms')
        assert response.status_code in [200]
    
    def test_enter_result_unauthorized(self, client):
        """POST /api/owner/enter-result bez prijave vraca 401"""
        response = client.post('/api/owner/enter-result', json={})
        assert response.status_code == 401
    
    def test_enter_result_forbidden_for_polaznik(self, auth_client):
        """POST /api/owner/enter-result s polaznikom vraca 403"""
        response = auth_client.post('/api/owner/enter-result', json={
            'appointmentRoomId': 1, 'appointmentDatVrPoc': '2025-01-10 14:00:00',
            'teamMembers': ['test_polaznik'], 'resultSeconds': 2000
        })
        assert response.status_code == 403
    
    def test_owner_team_info_unauthorized(self, client):
        """GET /api/owner/team-info bez prijave vraca 401"""
        response = client.get('/api/owner/team-info?ime_tima=LockBusters')
        assert response.status_code == 401
    
    def test_add_appointment_unauthorized(self, client):
        """POST /api/owner/add-appointment bez prijave vraca 401"""
        response = client.post('/api/owner/add-appointment', json={})
        assert response.status_code == 401
    
    def test_edit_room_unauthorized(self, client):
        """POST /api/owner/edit-room bez prijave vraca 401"""
        response = client.post('/api/owner/edit-room', data={})
        assert response.status_code == 401
    
    def test_edit_room_forbidden_for_polaznik(self, auth_client):
        """POST /api/owner/edit-room s polaznikom vraca 403"""
        response = auth_client.post('/api/owner/edit-room', data={'room_id': 1, 'naziv': 'NovoIme'})
        assert response.status_code == 403


class TestPayment:
    """Testovi za placanje"""
    
    def test_start_payment_unauthorized(self, client):
        """POST /api/start-payment bez prijave vraca 401"""
        response = client.post('/api/start-payment', json={'tip_placanja': 'pretplata', 'tip': 'mjesecna'})
        assert response.status_code == 401
    
    def test_start_payment_subscription(self, auth_client):
        """POST /api/start-payment za pretplatu"""
        response = auth_client.post('/api/start-payment', json={'tip_placanja': 'pretplata', 'tip': 'mjesecna'})
        assert response.status_code in [200]
    
    def test_start_payment_reservation(self, auth_client):
        """POST /api/start-payment za rezervaciju"""
        response = auth_client.post('/api/start-payment', json={
            'tip_placanja': 'rezervacija', 'room_id': 1, 'datVrPoc': '2026-06-01 14:00:00', 'ime_tima': 'LockBusters'
        })
        assert response.status_code in [200]
    
    def test_start_payment_yearly_subscription(self, owner_client):
        """POST /api/start-payment za godisnju pretplatu"""
        response = owner_client.post('/api/start-payment', json={'tip_placanja': 'pretplata', 'tip': 'godisnja'})
        assert response.status_code in [200]


class TestStaticAndErrors:
    """Testovi za staticke datoteke i error handling"""
    
    def test_serve_react_index(self, client):
        """GET / vraca React app (ili 404 ako frontend nije buildiran)"""
        response = client.get('/')
        assert response.status_code in [200]
    
    def test_api_not_found(self, client):
        """GET /api/nepostojeci vraca 404"""
        response = client.get('/api/nepostojeci')
        assert response.status_code == 404
    
    def test_api_returns_json_error(self, client):
        """API 404 vraca JSON error"""
        response = client.get('/api/nepostojeci')
        data = response.get_json()
        assert 'error' in data
    
    def test_instance_images_route(self, client):
        """GET /instance/images/<filename> ruta postoji"""
        response = client.get('/instance/images/test.jpg')
        assert response.status_code in [404]
    
    def test_invalid_json_body(self, client):
        """POST s neispravnim JSON-om"""
        response = client.post('/api/rooms/filter', data='not valid json', content_type='application/json')
        assert response.status_code in [400]



if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])