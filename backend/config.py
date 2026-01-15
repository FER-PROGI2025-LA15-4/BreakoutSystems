# config.py
# Konfiguracija aplikacije - sve postavke na jednom mjestu
import os
from dotenv import load_dotenv

# Učitaj environment varijable iz .env filea
load_dotenv()


class Config:
    """
    Config klasa koja drži sve postavke aplikacije
    Kao što bi bio config.js u Node.js projektu
    """

    # Flask secret key - koristi se za šifriranje cookija i sessiona
    SECRET_KEY = os.getenv('SECRET_KEY', 'super kul šašavi kljuc koji nitko ne zna')

    # SQLite database - file-based baza podataka
    # Kreira se automatski kao 'escape_room.db' file u root folderu
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'sqlite:///escape_room.db'
    )

    # Isključi tracking modifikacija - štedi memoriju i performanse
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ===== SESSION CONFIGURATION =====
    # Važno za session funkcionalnost
    SESSION_COOKIE_SECURE = False  # Postavi na True u produkciji s HTTPS
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = 3600  # 1 sat

    # ===== GITHUB OAUTH CREDENTIALS =====
    #Šablonski postupak: ovo su stvari koje su postavljene u .env file da bi OAuth radio

    # Client ID - javni identifikator tvoje aplikacije
    GITHUB_CLIENT_ID = os.getenv('GITHUB_CLIENT_ID')

    # Client Secret - tajni ključ (NIKAD ne commitaj u Git!)
    GITHUB_CLIENT_SECRET = os.getenv('GITHUB_CLIENT_SECRET')

    # Redirect URI - gdje GitHub vraća korisnika nakon logina
    # MORA biti isti kao u GitHub OAuth App postavkama
    GITHUB_REDIRECT_URI = os.getenv(
        'GITHUB_REDIRECT_URI',
        'http://localhost:5000/api/auth/callback'
    )

    # OAuth scope - koje podatke tražimo od GitHuba
    # 'user:email' - pristup email adresi korisnika
    GITHUB_SCOPE = ['user:email']

    STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY')
    STRIPE_PUBLIC_KEY = os.getenv('STRIPE_PUBLIC_KEY')