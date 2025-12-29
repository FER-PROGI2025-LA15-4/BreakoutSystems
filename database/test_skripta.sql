
-- KORISNICI
INSERT INTO Korisnik (username, oauth_id, uloga) VALUES
('marko123', 'oauth_vlasnik_123', 'VLASNIK'),
('petra123', 'oauth_vlasnik_456', 'VLASNIK'),
('maja123', 'oauth_vlasnik_678', 'VLASNIK'),
('tomislav123', 'oauth_vlasnik_901', 'VLASNIK'),
('katarina123', 'oauth_vlasnik_234', 'VLASNIK'),
('ivan123', 'oauth_polaznik_789', 'POLAZNIK'),
('ana123', 'oauth_polaznik_012', 'POLAZNIK'),
('josip123', 'oauth_polaznik_111', 'POLAZNIK'),
('lucija123', 'oauth_polaznik_222', 'POLAZNIK'),
('matej123', 'oauth_polaznik_333', 'POLAZNIK'),
('elena123', 'oauth_polaznik_444', 'POLAZNIK'),
('antonio123', 'oauth_polaznik_555', 'POLAZNIK'),
('sara123', 'oauth_polaznik_666', 'POLAZNIK');

-- VLASNICI
INSERT INTO Vlasnik (username, naziv_tvrtke, adresa, grad, telefon, logoImgUrl) VALUES
('marko123', 'Mystery Masters d.o.o.', 'Ilica 98', 'Zagreb', '0953554728', '....'),
('petra123', 'Mystic Company d.o.o.', 'Ozaljska 34', 'Zagreb', '0981324562', '...'),
('maja123', 'Split Adventures d.o.o.', 'Poljička cesta 25', 'Split', '0987654321', '...'),
('tomislav123', 'Rijeka Rooms d.o.o.', 'Trg Ivana Koblera 1', 'Rijeka', '0911122334', '...'),
('katarina123', 'Rijeka Escape d.o.o.', 'Ulica Eugena Kovačića 88', 'Rijeka', '0955566778', '...');


-- POLAZNICI
INSERT INTO Polaznik (username, email, profImgUrl) VALUES
('ivan123', 'ivan.peric@gmail.com', '...'),
('ana123', 'ana.kovac@yahoo.com', '...'),
('josip123', 'josip.horvat@hotmail.com', '....'),
('lucija123', 'lucija.novak@outlook.com', '...'),
('matej123', 'matej.babic@gmail.com', '...'),
('elena123', 'elena.kralj@icloud.com', '...'),
('antonio123', 'antonio.vukovic@protonmail.com', '...'),
('sara123', 'sara.visic@email.com', '...');

-- ESCAPE ROOM 
INSERT INTO EscapeRoom (room_id, naziv, opis, geo_lat, geo_long, adresa, grad, inicijalna_tezina, cijena, minBrClanTima, maxBrClanTima, kategorija, vlasnik_username) VALUES
(1, 'Tajna Nikole Tesle', 'Otkrijte izgubljene izume genija električne struje u laboratoriju punom zagonetki i iznenađenja.', 45.8121010, 15.9753360, 'Bogovićeva 3', 'Zagreb', 3, 60.00, 2, 6, 'znanstvena_fantastika', 'marko123'),
(2, 'Kletva Starog Egipta', 'Faraonova grobnica krije drevnu kletvu. Riješite hijeroglife prije nego što vas sustigne prokletstvo.', 45.8109440, 15.9741720, 'Preradovićeva 8', 'Zagreb', 5, 75.00, 3, 6, 'povijesni', 'marko123'),
(3, 'Noćna mora', 'Zarobljeni ste u napuštenoj psihijatrijskoj bolnici. Zvukovi koraka sve su bliže...',  45.3266620, 14.4448400, 'Užarska 14', 'Rijeka', 4, 70.00, 2, 5, 'horor', 'tomislav123'),
(4, 'Čarobnjakov toranj', 'Uspnite se na vrh tornja zloglasnog čarobnjaka i pronađite čarobni štap prije nego što se vrati.', 43.5080980, 16.4390460, 'Dosud 6', 'Split', 3, 55.00, 2, 6, 'fantasy', 'maja123'),
(5, 'Slučaj nestale slike', 'Rembrandt je ukraden iz muzeja. Imate 60 minuta da pronađete lopova i vratite remek-djelo.',  45.3404270, 14.4219440, 'Bakarska ulica 18', 'Rijeka', 3, 50.00, 2, 5, 'kriminalistika', 'katarina123'),
(6, 'Piratska avantura', 'Kapetan Crnobradi sakrio je blago na otoku. Savršeno za obitelji s djecom!', 45.8154100, 15.9576990, 'Buntićeva ulica 2', 'Zagreb', 2, 60.00, 3, 8, 'obiteljski', 'petra123'),
(7, 'Izgubljeni u svemiru', 'Svemirski brod gubi kisik. Popravite sustave i vratite se na Zemlju prije nego što bude prekasno.', 45.8029140, 15.9615480, 'Tratinska 18', 'Zagreb', 4, 65.00, 2, 6, 'znanstvena_fantastika', 'petra123'),
(8, 'Kuća duhova', 'Vila obitelji Horvat skriva mračnu tajnu. Preživite noć u najukletijoj kući u gradu.',  45.3266580, 14.4430530, 'Trg Ivana Koblera 1', 'Rijeka', 5, 80.00, 2, 4, 'horor', 'tomislav123'),
(9, 'Vitezovi Okruglog stola', 'Srednjovjekovna avantura u dvorcu. Pronađite Excalibur i spriječite rat.', 43.5101470, 16.4378410, 'Ulica kralja Tomislava 3', 'Split', 3, 60.00, 3, 7, 'fantasy', 'maja123'),
(10, 'Zatvorska pobuna', 'Optuženi ste za zločin koji niste počinili. Pobjednite prije smaknuća u zoru.', 45.3291500, 14.4413490, 'Ulica Ivana Dežmana 6', 'Rijeka', 4, 65.00, 2, 5, 'kriminalistika', 'tomislav123'),
(11, 'Podmornica kapetana Nema', 'Istražite potonulu podmornicu i otkrijte tajne dubina oceana.', 43.5085640, 16.4557870, 'Ulica Matice hrvatske 7', 'Split', 3, 70.00, 2, 6, 'ostalo', 'maja123'),
(12, 'Djed Mrazova radionica', 'Pomozite vilenjacima spasiti Božić! Idealno za najmlađe istraživače.', 45.8064080, 15.9227310, 'Ulica Joze Martinovića 9', 'Zagreb', 1, 40.00, 4, 10, 'obiteljski', 'petra123'),
(13, 'Hladni rat', 'Berlin, 1961. Morate prijeći Zid prije nego što vas otkrije Stasi.', 45.3388650, 14.4141550, 'Ulica Eugena Kovačića 88', 'Rijeka', 4, 70.00, 2, 5, 'povijesni', 'katarina123'),
(14, 'Laboratorij ludog znanstvenika', 'Eksperiment je pošao po zlu. Zaustavite reakciju prije eksplozije!',  43.5069960, 16.4876770, 'Primoštenska ulica 8', 'Split', 4, 65.00, 2, 6, 'znanstvena_fantastika', 'petra123');



-- TIMOVI (voditelj mora biti polaznik)
INSERT INTO Tim (ime, image_url, voditelj_username) VALUES
('Tim Alfa', '...', 'ivan123'),
('Tim Beta', '...', 'ana123'),
('Tim Gamma', '...', 'lucija123');




-- ČLANOVI TIMA (prihvaćeni i pending zahtjevi)
INSERT INTO ClanTima (ime_tima, username, accepted) VALUES
('Tim Alfa', 'ivan123', 1),    -- voditelj
('Tim Alfa', 'matej123', 1),
('Tim Alfa', 'elena123', 1),
('Tim Alfa', 'sara123', 0),    -- pending 
('Tim Beta', 'ana123', 1),     -- voditelj
('Tim Beta', 'josip123', 1),
('Tim Beta', 'antonio123', 1),
('Tim Gamma', 'lucija123', 1), -- voditelj
('Tim Gamma', 'ivan123', 1),   -- u više timova
('Tim Gamma', 'matej123', 1),
('Tim Gamma', 'elena123', 0);  -- pending 


-- SLIKE ZA ESCAPE ROOMS (2-3 slike po sobi)
INSERT INTO EscapeRoomImage (image_url, room_id) VALUES
('https://cdn.example.com/tesla1.jpg', 1),
('https://cdn.example.com/tesla2.jpg', 1),
('https://cdn.example.com/egypt1.jpg', 2),
('https://cdn.example.com/egypt2.jpg', 2),
('https://cdn.example.com/egypt3.jpg', 2),
('https://cdn.example.com/nightmare1.jpg', 3),
('https://cdn.example.com/nightmare2.jpg', 3),
('https://cdn.example.com/tower1.jpg', 4),
('https://cdn.example.com/tower2.jpg', 4),
('https://cdn.example.com/painting1.jpg', 5),
('https://cdn.example.com/painting2.jpg', 5),
('https://cdn.example.com/pirate1.jpg', 6),
('https://cdn.example.com/pirate2.jpg', 6),
('https://cdn.example.com/pirate3.jpg', 6),
('https://cdn.example.com/space1.jpg', 7),
('https://cdn.example.com/space2.jpg', 7),
('https://cdn.example.com/ghosthouse1.jpg', 8),
('https://cdn.example.com/ghosthouse2.jpg', 8),
('https://cdn.example.com/knights1.jpg', 9),
('https://cdn.example.com/knights2.jpg', 9),
('https://cdn.example.com/prison1.jpg', 10),
('https://cdn.example.com/prison2.jpg', 10),
('https://cdn.example.com/submarine1.jpg', 11),
('https://cdn.example.com/submarine2.jpg', 11),
('https://cdn.example.com/santa1.jpg', 12),
('https://cdn.example.com/santa2.jpg', 12),
('https://cdn.example.com/santa3.jpg', 12),
('https://cdn.example.com/coldwar1.jpg', 13),
('https://cdn.example.com/coldwar2.jpg', 13),
('https://cdn.example.com/madlab1.jpg', 14),
('https://cdn.example.com/madlab2.jpg', 14);

-- TERMINI 
INSERT INTO Termin (room_id, datVrPoc, ime_tima, rezultatSekunde) VALUES
-- Prošli termini (završeni)
(1, '2025-11-15 14:00:00', 'Tim Alfa', 3250),  -- 54 min 10 sec
(2, '2025-11-15 16:30:00', 'Tim Beta', NULL),  -- nisu uspjeli završiti
(6, '2025-11-20 18:00:00', 'Tim Beta', 2800),  
(3, '2025-11-22 20:00:00', 'Tim Gamma', 3300), 
(5, '2025-11-25 19:00:00', 'Tim Alfa', 2950),  
(9, '2025-12-01 17:00:00', 'Tim Gamma', 3100),


-- Budući termini (rezervirani)
(7, '2026-03-21 15:00:00', 'Tim Alfa', NULL),
(4, '2026-03-29 16:00:00', 'Tim Beta', NULL),
(10, '2026-03-30 19:30:00', 'Tim Gamma', NULL),
(12, '2026-03-02 14:00:00', 'Tim Beta', NULL), 
(13, '2026-04-03 18:00:00', 'Tim Alfa', NULL);



-- PRISUTNIČKI POPIS ZA SVAKI TERMIN
INSERT INTO ClanNaTerminu (room_id, datVrPoc, username) VALUES
-- escape room 1 tim alfa
(1, '2025-11-15 14:00:00', 'ivan123'),
(1, '2025-11-15 14:00:00', 'matej123'),
(1, '2025-11-15 14:00:00', 'elena123'),
-- escape room 2 tim beta
(2, '2025-11-15 16:30:00', 'ana123'),
(2, '2025-11-15 16:30:00', 'josip123'),
(2, '2025-11-15 16:30:00', 'antonio123'),
-- escape room 6 tim beta
(6, '2025-11-20 18:00:00', 'ana123'),
(6, '2025-11-20 18:00:00', 'josip123'),
(6, '2025-11-20 18:00:00', 'antonio123'),
-- escape room 3 tim gamma
(3, '2025-11-22 20:00:00', 'lucija123'),
(3, '2025-11-22 20:00:00', 'ivan123'),
(3, '2025-11-22 20:00:00', 'matej123'),
-- escape room 5 tim alfa
(5, '2025-11-25 19:00:00', 'ivan123'),
(5, '2025-11-25 19:00:00', 'matej123'),
(5, '2025-11-25 19:00:00', 'elena123'),
-- escape room 9 tim gamma
(9, '2025-12-01 17:00:00', 'lucija123'),
(9, '2025-12-01 17:00:00', 'ivan123'),
(9, '2025-12-01 17:00:00', 'matej123');

-- PLAĆENE ČLANARINE (pretplate vlasnika)
INSERT INTO PlacenaClanarina (room_id, datVrUplate, brMjeseci) VALUES
(1, '2025-01-05 10:00:00', 12),  -- godišnja
(2, '2025-01-05 10:00:00', 12),
(3, '2025-02-01 14:00:00', 1),   -- mjesečna
(4, '2025-01-10 09:00:00', 12),
(5, '2025-03-15 11:00:00', 1),
(6, '2025-01-20 13:00:00', 12),
(7, '2025-01-20 13:30:00', 12),
(8, '2025-02-01 15:00:00', 1),
(9, '2025-01-25 10:00:00', 12),
(10, '2025-02-05 16:00:00', 1),
(11, '2025-01-30 11:00:00', 12),
(12, '2025-02-10 14:00:00', 12),
(13, '2025-03-01 09:00:00', 1),
(14, '2025-01-15 12:00:00', 12);

-- OCJENE TEŽINE 
INSERT INTO OcjenaTezine (room_id, username, vrijednost_ocjene) VALUES
(1, 'ivan123', 4.0),      
(1, 'matej123', 3.5),
(1, 'elena123', 4.0),
(2, 'ana123', 5.0),      
(2, 'josip123', 5.0),
(2, 'antonio123', 4.5),
(6, 'ana123', 2.0),       
(6, 'josip123', 2.5),
(6, 'antonio123', 2.0),
(6, 'lucija123', 2.5),
(3, 'lucija123', 4.5),   
(3, 'ivan123', 4.0),
(3, 'matej123', 4.5),
(3, 'elena123', 5.0),
(5, 'ivan123', 3.0),      
(5, 'matej123', 3.5),
(5, 'elena123', 3.0),
(9, 'lucija123', 3.5),  
(9, 'ivan123', 3.0),
(9, 'matej123', 3.5);
