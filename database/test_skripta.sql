-- Inicijalni podaci za testiranje baze podataka.
-- NAPOMENA: Budući da se koristi SERIAL za ključeve, preporučuje se resetiranje sekvenci
-- nakon unosa fiksnih ID-ova u testnom okruženju, ili koristiti INSERT bez navođenja ID-ova
-- i ručno pratiti generirane ključeve za FOREIGN KEY reference.
-- U ovoj skripti, koristimo fiksne ID-ove radi jasnoće referenciranja.

-- 1. KORISNIK (korisnik_id: 1=Admin, 2=Vlasnik, 3=Polaznik1, 4=Polaznik2)
INSERT INTO Korisnik (korisnik_id, oauth_id, ime, prezime, email, uloga) VALUES
(1, 'oauth_admin_123', 'Marko', 'Adminić', 'marko.adminic@fer.hr', 'ADMINISTRATOR'),
(2, 'oauth_vlasnik_456', 'Petra', 'Vlasnić', 'petra.vlasnic@fer.hr', 'VLASNIK'),
(3, 'oauth_polaznik_789', 'Ivan', 'Polić', 'ivan.polic@fer.hr', 'POLAZNIK'),
(4, 'oauth_polaznik_012', 'Ana', 'Polić', 'ana.polic@fer.hr', 'POLAZNIK');

-- 2. VLASNIK
INSERT INTO Vlasnik (korisnik_id, naziv_tvrtke, opis_profila) VALUES
(2, 'Mystery Masters d.o.o.', 'Vlasnik dva popularna Escape Room-a u Zagrebu.');

-- 3. ESCAPE ROOM (room_id: 1, 2)
INSERT INTO EscapeRoom (room_id, vlasnik_id, naziv, opis, cijena_po_timu, inicijalna_tezina, prosjecna_tezina) VALUES
(1, 2, 'Tajna Nikola Tesle', 'Soba s električnim zagonetkama. Početna razina.', 100.00, 2.5, 2.8),
(2, 2, 'Kletva Starog Egipta', 'Izuzetno teška soba, zahtijeva veliko timsko iskustvo.', 150.00, 4.0, 4.0);

-- 4. OCJENATEZINE (korisnici ocjenjuju sobe)
INSERT INTO OcjenaTezine (room_id, korisnik_id, vrijednost_ocjene) VALUES
(1, 3, 3), -- Ivan ocjenjuje Teslu s 3
(1, 4, 2), -- Ana ocjenjuje Teslu s 2
(2, 3, 4); -- Ivan ocjenjuje Egipat s 4

-- 5. TERMIN (termin_id: 1 do 6)
-- Termini za Sobu 1 (Tesla)
INSERT INTO Termin (termin_id, room_id, vrijeme_pocetka, status) VALUES
(1, 1, '2025-11-15 18:00:00', 'SLOBODNO'),
(2, 1, '2025-11-15 20:00:00', 'REZERVIRANO'),
(3, 1, '2025-11-16 18:00:00', 'ODIGRANO');

-- Termini za Sobu 2 (Egipat)
INSERT INTO Termin (termin_id, room_id, vrijeme_pocetka, status) VALUES
(4, 2, '2025-11-17 18:00:00', 'SLOBODNO'),
(5, 2, '2025-11-17 20:00:00', 'REZERVIRANO'),
(6, 2, '2025-11-18 20:00:00', 'SLOBODNO');

-- 6. TIM (tim_id: 1, 2)
INSERT INTO Tim (tim_id, naziv, voditelj_id) VALUES
(1, 'Riješitelji Zagonetki', 3), -- Voditelj: Ivan Polić
(2, 'Brzi i Bijesni', 4); -- Voditelj: Ana Polić

-- 7. CLANTIMA
INSERT INTO ClanTima (tim_id, korisnik_id) VALUES
(1, 3), -- Ivan je član Tima 1
(1, 4), -- Ana je član Tima 1
(2, 4); -- Ana je član Tima 2 (voditelj)

-- 8. REZERVACIJA (rezervacija_id: 1, 2)
INSERT INTO Rezervacija (rezervacija_id, termin_id, tim_id, iznos_placanja, status_placanja) VALUES
(1, 3, 1, 100.00, 'PLACENO'), -- Tim 1 rezervirao i odigrao Termin 3 (Tesla)
(2, 5, 2, 150.00, 'CEKA');    -- Tim 2 rezervirao Termin 5 (Egipat)

-- 9. REZULTATIGRE
INSERT INTO RezultatIgre (rezultat_id, rezervacija_id, vrijeme_zavrsetka_sekunde, datum_igre, osvojeni_bodovi_globalno) VALUES
(1, 1, 3450, '2025-11-16', 500); -- Tim 1 završio Sobu 1 za 57:30 (3450 sekundi)

-- 10. POSJECENIROOM (Mora se ažurirati nakon rezultata)
-- Oba člana Tima 1 (Ivan, Ana) posjetila su Room 1 (Tesla)
INSERT INTO PosjeceniRoom (korisnik_id, room_id) VALUES
(3, 1), -- Ivan je bio u Sobi 1
(4, 1); -- Ana je bila u Sobi 1

-- NAPOMENA ZA TESTIRANJE PRAVILA:
-- Tim 1 (članovi 3, 4) NE MOŽE rezervirati Room 1.
-- Tim 2 (član 4) NE MOŽE rezervirati Room 1.
-- Svi timovi MOGU rezervirati Room 2 (sve dok Ivan i Ana ne odigraju Room 2).
