# BreakoutSystems

## Opis projekta
Ovaj projekt je rezultat timskog rada u sklopu projeknog zadatka kolegija [Programsko inženjerstvo](https://www.fer.unizg.hr/predmet/proinz) na Fakultetu elektrotehnike i računarstva Sveučilišta u Zagrebu. 

BreakoutSystems je web platforma za cjelovito upravljanje Escape Room poslovanjem. Platforma omogućuje igračima pretraživanje i rezervaciju Escape Roomova te praćenje rezultata i rangiranja timova, dok vlasnicima omogućuje oglašavanje soba, upravljanje terminima i unos rezultata. 

Sustav uključuje OAuth 2.0 autentifikaciju, integrirani sustav plaćanja, interaktivnu kartu lokacija i dinamički algoritam rangiranja temeljen na brzini rješavanja i prilagodljivoj težini soba.


## Funkcijski zahtjevi
### Dionici
* Vlasnici escape roomova
* Polaznici (voditelji i članovi timova)
* Administratori
* Razvojni tim

### Funkcionalni zahtjevi po aktorima
* Anonimni korisnik: pregledava escape roomove i rang-ljestvice, koristi interaktivnu kartu, registrira račun.
* Član tima: pregledava vlastite rezultate i povijest, organizira se u timove, prima e-mail podsjetnike, ocjenjuje escape roomove.
* Vođa tima: rezervira termine za tim, sprječava rezervaciju već posjećenih soba, plaća rezervacije.
* Vlasnik escape rooma: dodaje i uređuje escape roomove, otvara termine, plaća naknadu za objavu.
* Administrator: upravlja podacima sustava, briše profile i sobe, pristupa statistikama, dodaje nove administratore.
* Vanjski servisi: autentifikacija (OAuth), online plaćanje, integracija interaktivne karte.
* Baza podataka: pohranjuje korisnike, timove, escape roomove, termine, rezervacije, rezultate i rang-liste.


## Tehnologije
* Komunikacija: WhatsApp, Microsoft Teams, Git/GitHub
* Dokumentacija: LaTeX, ERDPlus, Astah UML
* Razvojna okruženja: VS Code, PyCharm, WebStorm
* Backend: Python 3.11, Flask 2.3
* Frontend: React 19.2, JavaScript ES2022
* Baza podataka: SQLite 3.41
* Testiranje: Selenium WebDriver 4.15, pytest 7.4
* CI/CD: GitHub Actions, Azure App Service
  
Sve tehnologije su besplatne ili imaju studentski/besplatni tier.
## Instalacija
[_Wiki - Upute za puštanje u pogon_](https://github.com/FER-PROGI2025-LA15-4/BreakoutSystems/wiki/8.--Upute-za-puštanje-u-pogon)

## Članovi tima 
| Ime i prezime   | Doprinos                   |
|-----------------|----------------------------|
| Hana Dolovčak   | Baza podataka, Wiki        |
| Antonio Mamić   | Voditelj, DevOps, Frontend |
| Aurora Necko    | Dizajn, Frontend           |
| Bruno Pećnik    | Frontend                   |
| Lucija Stipetić | Backend                    |
| Filip Šušak     | Backend                    |





# 📝 Kodeks ponašanja [![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

Kao tim smo upoznati s [Kodeksom ponašanja studenata FER-a](https://www.fer.hr/_download/repository/Kodeks_ponasanja_studenata_FER-a_procisceni_tekst_2016%5B1%5D.pdf) te [etičkim kodeksom IEEE-a](https://www.ieee.org/about/corporate/governance/p7-8.html). 

Tijekom rada pridržavali smo se načela jasne komunikacije, profesionalnog ponašanja i međusobnog poštovanja. Slijedili smo standarde integriteta i odgovornog ponašanja definirane u navedenim dokumentima.

# 📝 Licenca
Važeća (1)
[![CC BY-NC-SA 4.0][cc-by-nc-sa-shield]][cc-by-nc-sa]

Ovaj repozitorij sadrži otvoreni obrazovni sadržaji (eng. Open Educational Resources)  i licenciran je prema pravilima Creative Commons licencije koja omogućava da preuzmete djelo, podijelite ga s drugima uz 
uvjet da navođenja autora, ne upotrebljavate ga u komercijalne svrhe te dijelite pod istim uvjetima [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License HR][cc-by-nc-sa].
>
> ### Napomena:
>
> Svi paketi distribuiraju se pod vlastitim licencama.
> Svi upotrijebleni materijali  (slike, modeli, animacije, ...) distribuiraju se pod vlastitim licencama.

[cc-by-nc-sa]: https://creativecommons.org/licenses/by-nc/4.0/deed.hr 
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg

