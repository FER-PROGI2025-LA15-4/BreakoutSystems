-- PROGI: Platforma za rezervaciju Escape Room-ova

-- 1. KORISNIK (Sve uloge)
CREATE TABLE Korisnik (
    korisnik_id SERIAL PRIMARY KEY, 
    oauth_id VARCHAR(255) UNIQUE NOT NULL, -- ID iz OAuth 2.0 sustava
    ime VARCHAR(100) NOT NULL,
    prezime VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    uloga VARCHAR(50) NOT NULL CHECK (uloga IN ('POLAZNIK', 'VLASNIK', 'ADMINISTRATOR')), -- ogranicenje na dozvoljene uloge
    datum_registracije TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. VLASNIK
CREATE TABLE Vlasnik (
    korisnik_id INT PRIMARY KEY,
    naziv_tvrtke VARCHAR(255) UNIQUE,
    opis_profila TEXT,
    FOREIGN KEY (korisnik_id) REFERENCES Korisnik(korisnik_id) ON DELETE CASCADE
);

-- 3. ESCAPE ROOM
CREATE TABLE EscapeRoom (
    room_id SERIAL PRIMARY KEY,
    vlasnik_id INT NOT NULL,
    naziv VARCHAR(255) NOT NULL,
    opis TEXT,
    slika_url VARCHAR(500),
    geografska_lokacija VARCHAR(100), -- Format 'lat,lon' ili JSON
    inicijalna_tezina DECIMAL(3,1) NOT NULL,
    cijena_po_timu DECIMAL(10,2) NOT NULL,
    prosjecna_tezina DECIMAL(3,1) DEFAULT 0.0, -- korigirana težina
    FOREIGN KEY (vlasnik_id) REFERENCES Vlasnik(korisnik_id) ON DELETE CASCADE
);

-- 4. OCJENATEZINE
CREATE TABLE OcjenaTezine (
    ocjena_id SERIAL PRIMARY KEY,
    room_id INT NOT NULL,
    korisnik_id INT NOT NULL,
    vrijednost_ocjene INT NOT NULL CHECK (vrijednost_ocjene BETWEEN 1 AND 5), 
    datum_ocjene DATE DEFAULT CURRENT_DATE,
    UNIQUE (room_id, korisnik_id), -- jedan korisnik može ocijeniti jedan room samo jednom
    FOREIGN KEY (room_id) REFERENCES EscapeRoom(room_id) ON DELETE CASCADE,
    FOREIGN KEY (korisnik_id) REFERENCES Korisnik(korisnik_id) ON DELETE CASCADE
);

-- 5. TERMIN
CREATE TABLE Termin (
    termin_id SERIAL PRIMARY KEY,
    room_id INT NOT NULL,
    vrijeme_pocetka TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('SLOBODNO', 'REZERVIRANO', 'ODIGRANO')),
    FOREIGN KEY (room_id) REFERENCES EscapeRoom(room_id) ON DELETE CASCADE
);

-- 6. TIM
CREATE TABLE Tim (
    tim_id SERIAL PRIMARY KEY,
    naziv VARCHAR(150) NOT NULL,
    voditelj_id INT NOT NULL, -- korisnik koji rezervira i plaća
    FOREIGN KEY (voditelj_id) REFERENCES Korisnik(korisnik_id) ON DELETE CASCADE
);

-- 7. CLANTIMA (M:N veza)
CREATE TABLE ClanTima (
    tim_id INT NOT NULL,
    korisnik_id INT NOT NULL,
    datum_pridruzivanja DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (tim_id, korisnik_id),
    FOREIGN KEY (tim_id) REFERENCES Tim(tim_id) ON DELETE CASCADE,
    FOREIGN KEY (korisnik_id) REFERENCES Korisnik(korisnik_id) ON DELETE CASCADE
);

-- 8. REZERVACIJA
CREATE TABLE Rezervacija (
    rezervacija_id SERIAL PRIMARY KEY,
    termin_id INT UNIQUE NOT NULL, -- Termin se može rezervirati samo jednom
    tim_id INT NOT NULL,
    datum_rezervacije TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    iznos_placanja DECIMAL(10,2) NOT NULL,
    status_placanja VARCHAR(50) NOT NULL CHECK (status_placanja IN ('PLACENO', 'CEKA', 'OTKAZANO')),
    FOREIGN KEY (termin_id) REFERENCES Termin(termin_id) ON DELETE RESTRICT,
    FOREIGN KEY (tim_id) REFERENCES Tim(tim_id) ON DELETE RESTRICT
);

-- 9. REZULTATIGRE
CREATE TABLE RezultatIgre (
    rezultat_id SERIAL PRIMARY KEY,
    rezervacija_id INT UNIQUE NOT NULL, 
    vrijeme_zavrsetka_sekunde INT NOT NULL, 
    datum_igre DATE,
    osvojeni_bodovi_globalno INT, 
    FOREIGN KEY (rezervacija_id) REFERENCES Rezervacija(rezervacija_id) ON DELETE CASCADE
);

-- 10. pomoćna tablica POSJECENIROOM (za provjeru pravila rezervacije)
-- osigurava da znamo točno koje je sobe posjetio koji korisnik
CREATE TABLE PosjeceniRoom (
    korisnik_id INT NOT NULL,
    room_id INT NOT NULL,
    PRIMARY KEY (korisnik_id, room_id),
    FOREIGN KEY (korisnik_id) REFERENCES Korisnik(korisnik_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES EscapeRoom(room_id) ON DELETE CASCADE
);

-- Indeksi za brže pretraživanje
CREATE INDEX idx_room_vlasnik ON EscapeRoom(vlasnik_id);
CREATE INDEX idx_termin_room ON Termin(room_id);
CREATE INDEX idx_clan_korisnik ON ClanTima(korisnik_id);
