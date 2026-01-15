
-- KORISNICI
INSERT INTO Korisnik (username, oauth_id, uloga) VALUES
('marko123', '213290578', 'VLASNIK'),
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
('am', 'oauth_vlasnik_123', 'VLASNIK'),
('sara123', 'oauth_polaznik_666', 'POLAZNIK');

-- VLASNICI
INSERT INTO Vlasnik (username, naziv_tvrtke, adresa, grad, telefon, logoImgUrl, clanarinaDoDatVr) VALUES
('marko123', 'Mystery Masters d.o.o.', 'Ilica 98', 'Zagreb', '0953554728', 'https://picsum.photos/500/501', '2026-02-15T00:00:00'),
('petra123', 'Mystic Company d.o.o.', 'Ozaljska 34', 'Zagreb', '0981324562', 'https://picsum.photos/500/502', '2026-02-15T00:00:00'),
('maja123', 'Split Adventures d.o.o.', 'Poljička cesta 25', 'Split', '0987654321', 'https://picsum.photos/500/503', '2026-02-15T00:00:00'),
('tomislav123', 'Rijeka Rooms d.o.o.', 'Trg Ivana Koblera 1', 'Rijeka', '0911122334', 'https://picsum.photos/500/504', '2026-02-15T00:00:00'),
('katarina123', 'Rijeka Escape d.o.o.', 'Ulica Eugena Kovačića 88', 'Rijeka', '0955566778', null, '2026-02-15T00:00:00'),
('am', 'Karlovac Escape d.o.o.', 'Ulica Eugena Kovačića 88', 'Karlovac', '0995558888', null, '2026-02-15T00:00:00');

-- POLAZNICI
INSERT INTO Polaznik (username, email, profImgUrl) VALUES
('ivan123', 'ivan.peric@gmail.com', 'https://picsum.photos/500/501'),
('ana123', 'ana.kovac@yahoo.com', 'https://picsum.photos/500/502'),
('josip123', 'josip.horvat@hotmail.com', 'https://picsum.photos/500/503'),
('lucija123', 'lucija.novak@outlook.com', 'https://picsum.photos/500/504'),
('matej123', 'matej.babic@gmail.com', 'https://picsum.photos/500/505'),
('elena123', 'elena.kralj@icloud.com', 'https://picsum.photos/500/506'),
('antonio123', 'antonio.vukovic@protonmail.com', 'https://picsum.photos/500/507'),
('sara123', 'sara.visic@email.com', 'https://picsum.photos/500/508');

-- ESCAPE ROOM 
INSERT INTO EscapeRoom (room_id, naziv, opis, geo_lat, geo_long, adresa, grad, inicijalna_tezina, cijena, minBrClanTima, maxBrClanTima, kategorija, vlasnik_username) VALUES
(1, 'Tajna Nikole Tesle', 'Otkrijte izgubljene izume genija električne struje u laboratoriju punom zagonetki i iznenađenja.', 45.8121010, 15.9753360, 'Bogovićeva 3', 'Zagreb', 3, 60.00, 2, 6, 'SF', 'marko123'),
(2, 'Kletva Starog Egipta', 'Faraonova grobnica krije drevnu kletvu. Riješite hijeroglife prije nego što vas sustigne prokletstvo.', 45.8109440, 15.9741720, 'Preradovićeva 8', 'Zagreb', 5, 75.00, 3, 6, 'Povijest', 'marko123'),
(3, 'Noćna mora', 'Zarobljeni ste u napuštenoj psihijatrijskoj bolnici. Zvukovi koraka sve su bliže...',  45.3266620, 14.4448400, 'Užarska 14', 'Rijeka', 4, 70.00, 2, 5, 'Horor', 'tomislav123'),
(4, 'Čarobnjakov toranj', 'Uspnite se na vrh tornja zloglasnog čarobnjaka i pronađite čarobni štap prije nego što se vrati.', 43.5080980, 16.4390460, 'Dosud 6', 'Split', 3, 55.00, 2, 6, 'Fantasy', 'maja123'),
(5, 'Slučaj nestale slike', 'Rembrandt je ukraden iz muzeja. Imate 60 minuta da pronađete lopova i vratite remek-djelo.',  45.3404270, 14.4219440, 'Bakarska ulica 18', 'Rijeka', 3, 50.00, 2, 5, 'Krimi', 'katarina123'),
(6, 'Piratska avantura', 'Kapetan Crnobradi sakrio je blago na otoku. Savršeno za obitelji s djecom!', 45.8154100, 15.9576990, 'Buntićeva ulica 2', 'Zagreb', 2, 60.00, 3, 8, 'Obitelj', 'petra123'),
(7, 'Izgubljeni u svemiru', 'Svemirski brod gubi kisik. Popravite sustave i vratite se na Zemlju prije nego što bude prekasno.', 45.8029140, 15.9615480, 'Tratinska 18', 'Zagreb', 4, 65.00, 2, 6, 'SF', 'petra123'),
(8, 'Kuća duhova', 'Vila obitelji Horvat skriva mračnu tajnu. Preživite noć u najukletijoj kući u gradu.',  45.3266580, 14.4430530, 'Trg Ivana Koblera 1', 'Rijeka', 5, 80.00, 2, 4, 'Horor', 'tomislav123'),
(9, 'Vitezovi Okruglog stola', 'Srednjovjekovna avantura u dvorcu. Pronađite Excalibur i spriječite rat.', 43.5101470, 16.4378410, 'Ulica kralja Tomislava 3', 'Split', 3, 60.00, 3, 7, 'Fantasy', 'maja123'),
(10, 'Zatvorska pobuna', 'Optuženi ste za zločin koji niste počinili. Pobjegnite prije smaknuća u zoru.', 45.3291500, 14.4413490, 'Ulica Ivana Dežmana 6', 'Rijeka', 4, 65.00, 2, 5, 'Krimi', 'tomislav123'),
(11, 'Podmornica kapetana Nema', 'Istražite potonulu podmornicu i otkrijte tajne dubina oceana.', 43.5085640, 16.4557870, 'Ulica Matice hrvatske 7', 'Split', 3, 70.00, 2, 6, 'Ostalo', 'maja123'),
(12, 'Djed Mrazova radionica', 'Pomozite vilenjacima spasiti Božić! Idealno za najmlađe istraživače.', 45.8064080, 15.9227310, 'Ulica Joze Martinovića 9', 'Zagreb', 1, 40.00, 4, 10, 'Obitelj', 'petra123'),
(13, 'Hladni rat', 'Berlin, 1961. Morate prijeći Zid prije nego što vas otkrije Stasi.', 45.3388650, 14.4141550, 'Ulica Eugena Kovačića 88', 'Rijeka', 4, 70.00, 2, 5, 'Povijest', 'katarina123'),
(14, 'Laboratorij ludog znanstvenika', 'Eksperiment je pošao po zlu. Zaustavite reakciju prije eksplozije!',  43.5069960, 16.4876770, 'Primoštenska ulica 8', 'Split', 4, 65.00, 2, 6, 'SF', 'petra123');



-- TIMOVI (voditelj mora biti polaznik)
INSERT INTO Tim (ime, image_url, voditelj_username) VALUES
('Tim Alfa', '...', 'ivan123'),
('Tim Beta', '...', 'ana123'),
('Tim Gamma', '...', 'lucija123'),
('Tim Delta', '...', 'lucija123'),
('Tim Epsilon', '...', 'sara123');




-- ČLANOVI TIMA (prihvaćeni i pending zahtjevi)
INSERT INTO ClanTima (ime_tima, username, accepted) VALUES
('Tim Alfa', 'matej123', 1),
('Tim Alfa', 'elena123', 1),
('Tim Alfa', 'sara123', 0),    -- pending 
('Tim Beta', 'josip123', 1),
('Tim Beta', 'antonio123', 1),
('Tim Gamma', 'ivan123', 1),   -- u više timova
('Tim Gamma', 'matej123', 1),
('Tim Gamma', 'elena123', 0),  -- pending
('Tim Delta', 'antonio123', 0), -- pending
('Tim Delta', 'sara123', 1),
('Tim Epsilon', 'ivan123', 0),  -- pending
('Tim Epsilon', 'lucija123', 1),
('Tim Epsilon', 'matej123', 1),
('Tim Epsilon', 'antonio123', 1);


-- SLIKE ZA ESCAPE ROOMS (2-3 slike po sobi)
INSERT INTO EscapeRoomImage (image_url, room_id, cover) VALUES
('https://picsum.photos/4000/3000', 1, 0),
('https://picsum.photos/4000/3001', 1, 1),
('https://picsum.photos/4000/3002', 2, 0),
('https://picsum.photos/4000/3003', 2, 1),
('https://picsum.photos/4000/3004', 2, 0),
('https://picsum.photos/4000/3005', 3, 1),
('https://picsum.photos/4000/3006', 3, 0),
('https://picsum.photos/4000/3007', 4, 1),
('https://picsum.photos/4000/3008', 4, 0),
('https://picsum.photos/4000/3009', 5, 0),
('https://picsum.photos/4000/3010', 5, 1),
('https://picsum.photos/4000/3011', 6, 1),
('https://picsum.photos/4000/3012', 6, 0),
('https://picsum.photos/4000/3013', 6, 0),
('https://picsum.photos/4000/3014', 7, 0),
('https://picsum.photos/4000/3015', 7, 1),
('https://picsum.photos/4000/3016', 8, 1),
('https://picsum.photos/4000/3017', 8, 0),
('https://picsum.photos/4000/3018', 9, 1),
('https://picsum.photos/4000/3019', 9, 0),
('https://picsum.photos/4000/3020', 10, 1),
('https://picsum.photos/4000/3021', 10, 0),
('https://picsum.photos/4000/3022', 11, 1),
('https://picsum.photos/4000/3023', 11, 0),
('https://picsum.photos/4000/3024', 12, 1),
('https://picsum.photos/4000/3025', 12, 0),
('https://picsum.photos/4000/3026', 12, 0),
('https://picsum.photos/4000/3027', 13, 0),
('https://picsum.photos/4000/3028', 13, 1),
('https://picsum.photos/4000/3029', 14, 1),
('https://picsum.photos/4000/3030', 14, 0);

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
(3, 'lucija123', 4.5),
(3, 'ivan123', 4.0),
(3, 'matej123', 4.5),
(5, 'ivan123', 3.0),
(5, 'matej123', 3.5),
(5, 'elena123', 3.0),
(9, 'lucija123', 3.5),  
(9, 'ivan123', 3.0),
(9, 'matej123', 3.5);
