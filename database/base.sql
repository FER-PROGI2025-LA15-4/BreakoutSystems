CREATE TABLE Korisnik (
    username VARCHAR(255) PRIMARY KEY,
    oauth_id VARCHAR(255) UNIQUE NOT NULL,                                           -- ID iz OAuth 2.0 sustava
    uloga VARCHAR(8) NOT NULL CHECK (uloga IN ('POLAZNIK', 'VLASNIK', 'ADMIN'))      -- ogranicenje na dozvoljene uloge
);

CREATE TABLE Polaznik (
    username VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    profImgUrl VARCHAR(255),
    FOREIGN KEY (username) REFERENCES Korisnik(username) ON DELETE CASCADE
);

CREATE TABLE Vlasnik (
    username VARCHAR(255) PRIMARY KEY,
    naziv_tvrtke VARCHAR(255) NOT NULL,
    adresa VARCHAR(255) NOT NULL,
    grad VARCHAR(255) NOT NULL,
    telefon VARCHAR(255) NOT NULL,
    logoImgUrl VARCHAR(255),
    clanarinaDoDatVr VARCHAR(255),
    FOREIGN KEY (username) REFERENCES Korisnik(username) ON DELETE CASCADE
);

CREATE TABLE Tim (
    ime VARCHAR(255) PRIMARY KEY,
    image_url VARCHAR(255),
    voditelj_username VARCHAR(255) NOT NULL,                                      -- korisnik koji rezervira i placa
    FOREIGN KEY (voditelj_username) REFERENCES Polaznik(username) ON DELETE CASCADE
);

CREATE TABLE ClanTima (
    ime_tima VARCHAR(255),
    username VARCHAR(255),
    accepted BOOLEAN NOT NULL DEFAULT 0,
    PRIMARY KEY (ime_tima, username),
    FOREIGN KEY (ime_tima) REFERENCES Tim(ime) ON DELETE CASCADE,
    FOREIGN KEY (username) REFERENCES Polaznik(username) ON DELETE CASCADE
);

CREATE TABLE EscapeRoom (
    room_id INTEGER PRIMARY KEY AUTOINCREMENT,
    vlasnik_username VARCHAR(255) NOT NULL,
    naziv VARCHAR(255) NOT NULL,
    opis VARCHAR(255) NOT NULL,
    geo_lat DOUBLE NOT NULL CHECK (geo_lat BETWEEN -90.0 AND 90.0),
    geo_long DOUBLE NOT NULL CHECK (geo_long BETWEEN -180.0 AND 180.0),
    adresa VARCHAR(255) NOT NULL,
    grad VARCHAR(255) NOT NULL,
    inicijalna_tezina DOUBLE NOT NULL CHECK (inicijalna_tezina BETWEEN 1.0 AND 5.0),
    cijena DOUBLE NOT NULL CHECK (cijena >= 0.0),
    minBrClanTima INT NOT NULL CHECK (minBrClanTima >= 1),
    maxBrClanTima INT NOT NULL,
    kategorija VARCHAR(255) NOT NULL,
    CHECK (minBrClanTima <= maxBrClanTima),
    CHECK (kategorija IN ('Horor', 'SF', 'Povijest', 'Fantasy', 'Krimi', 'Obitelj', 'Ostalo')),
    FOREIGN KEY (vlasnik_username) REFERENCES Vlasnik(username) ON DELETE CASCADE
);

CREATE TABLE EscapeRoomImage (
    image_url VARCHAR(255) PRIMARY KEY,
    index INT NOT NULL DEFAULT 0,
    room_id INT NOT NULL,
    FOREIGN KEY (room_id) REFERENCES EscapeRoom(room_id) ON DELETE CASCADE
);

CREATE TABLE Termin (
    room_id INT,
    datVrPoc VARCHAR(255),
    ime_tima VARCHAR(255),
    rezultatSekunde INT,
    notified BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY(room_id, datVrPoc),
    FOREIGN KEY (room_id) REFERENCES EscapeRoom(room_id) ON DELETE CASCADE,
    FOREIGN KEY (ime_tima) REFERENCES Tim(ime) ON DELETE CASCADE
);

CREATE TABLE ClanNaTerminu (
    room_id INT,
    datVrPoc VARCHAR(255),
    username VARCHAR(255),
    PRIMARY KEY (room_id, datVrPoc, username),
    FOREIGN KEY (room_id, datVrPoc) REFERENCES Termin(room_id, datVrPoc) ON DELETE CASCADE,
    FOREIGN KEY (username) REFERENCES Polaznik(username) ON DELETE CASCADE
);

CREATE TABLE OcjenaTezine (
    room_id INT,
    username VARCHAR(255),
    vrijednost_ocjene DOUBLE NOT NULL CHECK (vrijednost_ocjene BETWEEN 0.5 AND 5.0),
    PRIMARY KEY (room_id, username),
    FOREIGN KEY (room_id) REFERENCES EscapeRoom(room_id) ON DELETE CASCADE,
    FOREIGN KEY (username) REFERENCES Polaznik(username) ON DELETE CASCADE
);

CREATE TRIGGER tg_OcjenaTezine_enforce_user_visit
    BEFORE INSERT ON OcjenaTezine
    FOR EACH ROW
BEGIN
    SELECT RAISE(ABORT, 'User never visited room')
    WHERE NOT EXISTS (
		SELECT *
		FROM ClanNaTerminu
		WHERE ClanNaTerminu.room_id=NEW.room_id AND ClanNaTerminu.username=NEW.username AND ClanNaTerminu.datVrPoc < CURRENT_TIMESTAMP
	);
END;
