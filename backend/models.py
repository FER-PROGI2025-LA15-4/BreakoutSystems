# models.py
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()

# -----------------------------
# 1. Korisnik
# -----------------------------
class Korisnik(UserMixin, db.Model):
    __tablename__ = 'Korisnik'

    username = db.Column(db.String(255), primary_key=True)
    oauth_id = db.Column(db.String(255), unique=True, nullable=False)
    uloga = db.Column(db.String(8), nullable=False)

    __table_args__ = (
        db.CheckConstraint("uloga IN ('POLAZNIK', 'VLASNIK', 'ADMIN')"),
    )

    # Relacije
    polaznik = db.relationship('Polaznik', uselist=False, back_populates='korisnik', cascade='all, delete')
    vlasnik = db.relationship('Vlasnik', uselist=False, back_populates='korisnik', cascade='all, delete')

    def __init__(self, username, oauth_id, uloga):
        self.username = username
        self.oauth_id = oauth_id
        self.uloga = uloga

    def get_id(self):
        """Flask-Login zahtijeva ovu metodu - vraća username kao ID"""
        return self.username

    def __repr__(self):
        return f"<Korisnik {self.username} ({self.uloga})>"

    def to_dict(self):
        return {
            "username": self.username,
            "oauth_id": self.oauth_id,
            "uloga": self.uloga
        }


# -----------------------------
# 2. Polaznik
# -----------------------------
class Polaznik(UserMixin, db.Model):
    __tablename__ = 'Polaznik'

    username = db.Column(
        db.String(255),
        db.ForeignKey('Korisnik.username', ondelete='CASCADE'),
        primary_key=True
    )
    email = db.Column(db.String(255), nullable=False)
    profImgUrl = db.Column(db.String(255), unique=True)

    korisnik = db.relationship('Korisnik', back_populates='polaznik')

    def __init__(self, username, email, profImgUrl=None):
        self.username = username
        self.email = email
        self.profImgUrl = profImgUrl

    def get_id(self):
        """Flask-Login zahtijeva ovu metodu - vraća username kao ID"""
        return self.username

    def __repr__(self):
        return f"<Polaznik {self.username} ({self.email})>"

    def to_dict(self):
        return {
            "oauth_id": self.korisnik.oauth_id,
            "username": self.username,
            "email": self.email,
            "profImgUrl": self.profImgUrl,
            "uloga": "POLAZNIK"
        }


# -----------------------------
# 3. Vlasnik
# -----------------------------
class Vlasnik(UserMixin, db.Model):
    __tablename__ = 'Vlasnik'

    username = db.Column(
        db.String(255),
        db.ForeignKey('Korisnik.username', ondelete='CASCADE'),
        primary_key=True
    )
    naziv_tvrtke = db.Column(db.String(255), nullable=False)
    adresa = db.Column(db.String(255), nullable=False)
    grad = db.Column(db.String(255), nullable=False)
    telefon = db.Column(db.String(255), nullable=False)
    logoImgUrl = db.Column(db.String(255), unique=True)

    korisnik = db.relationship('Korisnik', back_populates='vlasnik')

    def __init__(self, username, naziv_tvrtke, adresa, grad, telefon, logoImgUrl=None):
        self.username = username
        self.naziv_tvrtke = naziv_tvrtke
        self.adresa = adresa
        self.grad = grad
        self.telefon = telefon
        self.logoImgUrl = logoImgUrl

    def get_id(self):
        """Flask-Login zahtijeva ovu metodu - vraća username kao ID"""
        return self.username

    def __repr__(self):
        return f"<Vlasnik {self.username} ({self.naziv_tvrtke})>"

    def to_dict(self):
        return {
            "oauth_id": self.korisnik.oauth_id,
            "username": self.username,
            "naziv_tvrtke": self.naziv_tvrtke,
            "adresa": self.adresa,
            "grad": self.grad,
            "telefon": self.telefon,
            "logoImgUrl": self.logoImgUrl,
            "uloga": "VLASNIK"
        }