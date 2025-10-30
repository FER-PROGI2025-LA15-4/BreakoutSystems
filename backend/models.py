# models.py
# Database modeli - definiše strukturu tablica u bazi
# Slično kao Sequelize models u Node.js ili JPA Entities u Javi
from math import trunc

from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

# Kreiraj SQLAlchemy instancu - ORM (Object Relational Mapper)
# Omogućava rad sa bazom kroz Python objekte umjesto SQL upita
db = SQLAlchemy()


class EscapeRoom(db.Model):

    """
    Escape Room model - predstavlja escape room u aplikaciji
    Kljuc: id
    Ime: varchar 200
    Opis text
    """

    __tablename__ = 'escape_rooms'

    id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    name = db.Column(
        db.String(200),
        nullable=False
    )

    description = db.Column(
        db.Text,
        nullable=True
    )

    def __repr__(self):
        return f'<EscapeRoom {self.name}>'




""""
Ljestvica najboljih rezultata za escape room

Kljuc: escape_room_id, user_id
Score: integer

"""


class LeaderBoard(db.Model):
    __tablename__ = 'leaderboard'

    escape_room_id = db.Column(
        db.Integer,
        db.ForeignKey('escape_rooms.id'),  # Foreign key prema escape_rooms tablici
        primary_key=True
    )


    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),  # Foreign key prema users tablici
        nullable=False
    )

    score = db.Column(
        db.Integer,
        nullable=False,
        default=0
    )

    def __repr__(self):
        return f'<LeaderBoard UserID: {self.user_id} Score: {self.score}>'



class User(UserMixin, db.Model):
    """
    User model - predstavlja korisnika u aplikaciji

    UserMixin dodaje metode koje Flask-Login zahtijeva:
    - is_authenticated: Da li je user logiran
    - is_active: Da li je user aktivan
    - is_anonymous: Da li je user anoniman
    - get_id(): Vraća user ID kao string

    db.Model je bazna klasa za sve SQLAlchemy modele
    Kao @Entity anotacija u JPA (Java)
    """

    # Ime tablice u bazi podataka
    __tablename__ = 'users'

    # ===== KOLONE TABLICE =====

    # ID - primarni ključ, auto-increment
    id = db.Column(
        db.Integer,  # Tip podatka
        primary_key=True,  # Primarni ključ
        autoincrement=True  # Automatski povećava vrijednost
    )

    # GitHub ID - jedinstveni identifikator od GitHuba
    # Čuvamo kao string jer GitHub ID može biti veliki broj
    github_id = db.Column(
        db.String(100),  # VARCHAR(100) u SQL-u
        unique=True,  # Mora biti jedinstven - INDEX constraint
        nullable=False  # Ne smije biti NULL - NOT NULL constraint
    )

    # Email adresa korisnika
    email = db.Column(
        db.String(120),
        unique=True,  # Svaki email može biti samo jednom u bazi
        nullable=False
    )

    # Puno ime korisnika (ili GitHub username ako nema ime)
    name = db.Column(db.String(100))

    # URL profilne slike sa GitHuba
    profile_picture = db.Column(db.String(500))

    # ===== TIMESTAMPOVI =====
    # Automatski se postavljaju pri kreiranju i updatu

    # Vrijeme kreiranja user-a
    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow  # Funkcija se poziva automatski pri INSERT-u
    )

    # Vrijeme zadnjeg updatea
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow  # Automatski update pri svakom UPDATE-u
    )


    user_type = db.Column(
        db.String(20),
        nullable=True,  # NULL dok ne izabere tip
        default=None
    )
    # Moguće vrijednosti: 'regular', 'creator', 'admin'

    def __repr__(self):
        return f'<User {self.email} ({self.user_type})>'

    def to_dict(self):
        return {
            'id': self.id,
            'github_id': self.github_id,
            'email': self.email,
            'name': self.name,
            'profile_picture': self.profile_picture,
            'user_type': self.user_type,  # Dodaj u dict
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    # Test metode za provjeru permisija
    def is_creator(self):
        """Da li user može kreirati rezervacije"""
        return self.user_type in ['creator', 'admin']

    def is_admin(self):
        """Da li user ima admin privilegije"""
        return self.user_type == 'admin'




