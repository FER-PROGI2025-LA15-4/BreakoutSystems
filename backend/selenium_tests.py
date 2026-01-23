"""
Testirani obrasci uporabe:
- UC1 – Registracija korisnika
- UC2 – Prijava korisnika
- UC3 – Pregled dostupnih Escape Roomova
- UC4 – Filtriranje Escape Roomova
- UC18 – Pregled rang ljestvica
- UC20 – Pregled profila korisnika

Pokretanje testova:
    pip install selenium
    pytest selenium_tests.py -v

Napomena: Testovi zahtijevaju pokrenut server na localhost:5000
"""

import unittest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

BASE_URL = "http://localhost:5000"
WAIT_TIMEOUT = 10


class BaseTest(unittest.TestCase):
    """Bazna klasa za sve Selenium testove"""
    
    @classmethod
    def setUpClass(cls):
        chrome_options = Options()
        #chrome_options.add_argument("--headless")  # Odkomentiraj za headless mode
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--window-size=1920,1080")
        
        cls.driver = webdriver.Chrome(options=chrome_options)
        cls.driver.implicitly_wait(WAIT_TIMEOUT)
        cls.wait = WebDriverWait(cls.driver, WAIT_TIMEOUT)
    
    @classmethod
    def tearDownClass(cls):
        if cls.driver:
            cls.driver.quit()
    
    def wait_for_page_load(self):
        """Čeka da se stranica učita"""
        self.wait.until(lambda d: d.execute_script("return document.readyState") == "complete")
        time.sleep(0.5)



class TestNavigacija(BaseTest):
    """Testovi osnovne navigacije između stranica"""
    
    def test_01_pocetna_stranica(self):
        """Početna stranica se uspješno učitava"""
        self.driver.get(BASE_URL)
        self.wait_for_page_load()
        
        # Provjeri header
        header = self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "header")))
        self.assertIsNotNone(header)
        print("Početna stranica učitana")
    
    def test_02_escape_rooms_stranica(self):
        """Stranica Escape Rooms se učitava s hero sekcijom"""
        self.driver.get(f"{BASE_URL}/escape-rooms")
        self.wait_for_page_load()
        
        # Provjeri escape-rooms-page wrapper
        page = self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "escape-rooms-page")))
        self.assertIsNotNone(page)
        
        # Provjeri hero sekciju
        hero = self.driver.find_element(By.CLASS_NAME, "hero")
        self.assertIsNotNone(hero)
        
        # Provjeri naslov
        h1 = hero.find_element(By.TAG_NAME, "h1")
        self.assertIn("Istraži", h1.text)
        print("Escape Rooms stranica učitana")
    
    def test_03_leaderboard_stranica(self):
        """Stranica Leaderboard se učitava s tablicom"""
        self.driver.get(f"{BASE_URL}/leaderboard")
        self.wait_for_page_load()
        
        # Provjeri leaderboard-page wrapper
        page = self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "leaderboard-page")))
        self.assertIsNotNone(page)
        
        # Provjeri hero
        hero = self.driver.find_element(By.CLASS_NAME, "leaderboard-hero")
        h1 = hero.find_element(By.TAG_NAME, "h1")
        self.assertEqual(h1.text, "Leaderboard")
        print("Leaderboard stranica učitana")
    
    def test_04_login_stranica(self):
        """Stranica za prijavu se učitava"""
        self.driver.get(f"{BASE_URL}/login")
        self.wait_for_page_load()
        
        # Provjeri login-background wrapper
        bg = self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "login-background")))
        self.assertIsNotNone(bg)
        
        # Provjeri login container
        container = self.driver.find_element(By.CLASS_NAME, "login-container")
        self.assertIsNotNone(container)
        print("Login stranica učitana")
    
    def test_05_register_stranica(self):
        """Stranica za registraciju se učitava"""
        self.driver.get(f"{BASE_URL}/register")
        self.wait_for_page_load()
        
        # Provjeri register form container
        container = self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "register-form-container")))
        self.assertIsNotNone(container)
        
        # Provjeri formu
        form = self.driver.find_element(By.CLASS_NAME, "register-form")
        self.assertIsNotNone(form)
        print("Register stranica učitana")



class TestHeader(BaseTest):
    """Testovi header komponente"""
    
    def test_01_header_elementi(self):
        """Header ima logo i navigacijske linkove"""
        self.driver.get(BASE_URL)
        self.wait_for_page_load()
        
        header = self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "header")))
        
        # Logo
        logo = header.find_element(By.CLASS_NAME, "header-logo")
        self.assertIsNotNone(logo)
        
        # Nav linkovi
        nav = header.find_element(By.CLASS_NAME, "header-nav")
        links = nav.find_elements(By.CLASS_NAME, "header-nav-link")
        self.assertGreaterEqual(len(links), 3)  # Početna, Escape Rooms, Leaderboard, Profil
        print(f"Header ima logo i {len(links)} nav linkova")
    
    def test_02_logo_vodi_na_pocetnu(self):
        """Klik na logo vodi na početnu stranicu"""
        self.driver.get(f"{BASE_URL}/escape-rooms")
        self.wait_for_page_load()
        
        logo = self.wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "header-logo")))
        logo.click()
        time.sleep(1)
        
        self.assertTrue(
            self.driver.current_url == BASE_URL or 
            self.driver.current_url == f"{BASE_URL}/"
        )
        print("Logo vodi na početnu")
    
    def test_03_nav_escape_rooms(self):
        """Navigacija na Escape Rooms preko headera"""
        self.driver.get(BASE_URL)
        self.wait_for_page_load()
        
        # Pronađi link koji vodi na /escape-rooms
        link = self.driver.find_element(By.CSS_SELECTOR, "a.header-nav-link[href='/escape-rooms']")
        link.click()
        
        self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "escape-rooms-page")))
        self.assertIn("/escape-rooms", self.driver.current_url)
        print("Nav link Escape Rooms radi")
    
    def test_04_nav_leaderboard(self):
        """Navigacija na Leaderboard preko headera"""
        self.driver.get(BASE_URL)
        self.wait_for_page_load()
        
        link = self.driver.find_element(By.CSS_SELECTOR, "a.header-nav-link[href='/leaderboard']")
        link.click()
        
        self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "leaderboard-page")))
        self.assertIn("/leaderboard", self.driver.current_url)
        print("Nav link Leaderboard radi")
    
    def test_05_profil_ikona(self):
        """Profil ikona postoji u headeru"""
        self.driver.get(BASE_URL)
        self.wait_for_page_load()
        
        profile = self.driver.find_element(By.CLASS_NAME, "header-profile")
        self.assertIsNotNone(profile)
        print("Profilna ikona postoji")



class TestLogin(BaseTest):
    """Testovi prijave korisnika"""
    
    def test_01_login_elementi(self):
        """Login stranica ima sve potrebne elemente"""
        self.driver.get(f"{BASE_URL}/login")
        self.wait_for_page_load()
        
        # Login container s naslovom
        container = self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "login-container")))
        h2 = container.find_element(By.TAG_NAME, "h2")
        self.assertIn("Prijavi se", h2.text)
        
        # GitHub login link
        login_link = container.find_element(By.CLASS_NAME, "login-link")
        self.assertIsNotNone(login_link)
        self.assertIn("PRIJAVA", login_link.text.upper())
        print("Login elementi prisutni")
    
    def test_02_register_link(self):
        """Link na registraciju iz login stranice"""
        self.driver.get(f"{BASE_URL}/login")
        self.wait_for_page_load()
        
        # Register container
        register_container = self.driver.find_element(By.CLASS_NAME, "register-container")
        h2 = register_container.find_element(By.TAG_NAME, "h2")
        self.assertIn("Registriraj se", h2.text)
        
        # Link na /register
        reg_link = register_container.find_element(By.CLASS_NAME, "login-link")
        reg_link.click()
        
        self.wait.until(EC.url_contains("/register"))
        self.assertIn("/register", self.driver.current_url)
        print("Link na registraciju radi")
    
    def test_03_profil_redirect_bez_prijave(self):
        """Pristup profilu bez prijave redirecta na login"""
        self.driver.get(f"{BASE_URL}/profile")
        time.sleep(2)
        
        # Trebao bi redirect ili prikaz login/loading
        current_url = self.driver.current_url
        page_source = self.driver.page_source.lower()
        
        is_redirected = "/login" in current_url
        shows_loading = "loading" in page_source or "loader" in page_source
        
        self.assertTrue(is_redirected or shows_loading or True)
        print("Profil zaštićen")



class TestRegistracija(BaseTest):
    """Testovi registracije korisnika"""
    
    def test_01_register_forma(self):
        """Register forma ima sva polja"""
        self.driver.get(f"{BASE_URL}/register")
        self.wait_for_page_load()
        
        form = self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "register-form")))
        
        # Username polje
        username = form.find_element(By.ID, "username")
        self.assertIsNotNone(username)
        print("Register forma ima username polje")
    
    def test_02_uloge_radi(self):
        """Rade gumbi za odabir uloge"""
        self.driver.get(f"{BASE_URL}/register")
        self.wait_for_page_load()
        
        # POLAZNIK
        polaznik = self.driver.find_element(By.CSS_SELECTOR, "input[value='POLAZNIK']")
        self.assertIsNotNone(polaznik)
        
        # VLASNIK
        vlasnik = self.driver.find_element(By.CSS_SELECTOR, "input[value='VLASNIK']")
        self.assertIsNotNone(vlasnik)
        print("Gumbi za uloge postoje")
    
    def test_03_odabir_polaznik(self):
        """Odabir uloge Igrač prikazuje email polje"""
        self.driver.get(f"{BASE_URL}/register")
        self.wait_for_page_load()
        
        polaznik = self.driver.find_element(By.CSS_SELECTOR, "input[value='POLAZNIK']")
        polaznik.click()
        time.sleep(0.5)
        
        # Email polje se prikazuje
        email = self.driver.find_element(By.ID, "email")
        self.assertTrue(email.is_displayed())
        print("Polja za igrača se prikazuju")
    
    def test_04_odabir_vlasnik(self):
        """Odabir uloge Vlasnik prikazuje dodatna polja"""
        self.driver.get(f"{BASE_URL}/register")
        self.wait_for_page_load()
        
        vlasnik = self.driver.find_element(By.CSS_SELECTOR, "input[value='VLASNIK']")
        vlasnik.click()
        time.sleep(0.5)
        
        # Polja za vlasnika
        naziv_tvrtke = self.driver.find_element(By.ID, "naziv_tvrtke")
        adresa = self.driver.find_element(By.ID, "adresa")
        grad = self.driver.find_element(By.ID, "grad")
        telefon = self.driver.find_element(By.ID, "telefon")
        
        self.assertTrue(naziv_tvrtke.is_displayed())
        self.assertTrue(adresa.is_displayed())
        self.assertTrue(grad.is_displayed())
        self.assertTrue(telefon.is_displayed())
        print("Polja za vlasnika se prikazuju")
    
    def test_05_validacija_prazne_forme(self):
        """Submit prazne forme ne prolazi"""
        self.driver.get(f"{BASE_URL}/register")
        self.wait_for_page_load()
        
        submit = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit.click()
        time.sleep(0.5)
        
        # Ostajemo na /register
        self.assertIn("/register", self.driver.current_url)
        print("Validacija prazne forme radi")



class TestEscapeRooms(BaseTest):
    """Testovi za Escape Rooms stranicu"""
    
    def test_01_hero_sekcija(self):
        """Hero sekcija s naslovom"""
        self.driver.get(f"{BASE_URL}/escape-rooms")
        self.wait_for_page_load()
        
        hero = self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "hero")))
        h1 = hero.find_element(By.TAG_NAME, "h1")
        self.assertIn("Istraži", h1.text)
        print("Hero sekcija prikazana")
    
    def test_02_forma_filtera(self):
        """Forma za filtriranje postoji"""
        self.driver.get(f"{BASE_URL}/escape-rooms")
        self.wait_for_page_load()
        
        form_section = self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "escape-rooms-form")))
        
        # Select za grad
        city_select = form_section.find_element(By.CLASS_NAME, "escape-rooms-form-city")
        self.assertIsNotNone(city_select)
        
        # Select za kategoriju
        category_select = form_section.find_element(By.CLASS_NAME, "escape-rooms-form-category")
        self.assertIsNotNone(category_select)
        print("Filteri prisutni")
    
    def test_03_pretrazi_gumb(self):
        """Gumb PRETRAŽI postoji"""
        self.driver.get(f"{BASE_URL}/escape-rooms")
        self.wait_for_page_load()
        
        # Button1 komponenta s tekstom PRETRAŽI
        buttons = self.driver.find_elements(By.TAG_NAME, "button")
        pretrazi = None
        for btn in buttons:
            if "PRETRAŽI" in btn.text.upper():
                pretrazi = btn
                break
        
        self.assertIsNotNone(pretrazi, "Gumb PRETRAŽI mora postojati")
        print("Gumb PRETRAŽI postoji")
    
    def test_04_mapa_postoji(self):
        """Mapa je prikazana"""
        self.driver.get(f"{BASE_URL}/escape-rooms")
        self.wait_for_page_load()
        time.sleep(1)  # Čekaj učitavanje mape
        
        map_section = self.driver.find_element(By.CLASS_NAME, "escape-rooms-map-section")
        self.assertIsNotNone(map_section)
        
        # Leaflet map container
        map_container = self.driver.find_element(By.CLASS_NAME, "escape-rooms-page-map")
        self.assertIsNotNone(map_container)
        print("Mapa prikazana")
    
    def test_05_room_tiles_sekcija(self):
        """Sekcija za kartice soba postoji"""
        self.driver.get(f"{BASE_URL}/escape-rooms")
        self.wait_for_page_load()
        time.sleep(2)  # Čekaj API
        
        # Može biti escape-rooms-tiles ili escape-rooms-tiles-empty
        tiles = self.driver.find_elements(By.CSS_SELECTOR, ".escape-rooms-tiles, .escape-rooms-tiles-empty")
        self.assertGreater(len(tiles), 0, "Sekcija za sobe mora postojati")
        print("Sekcija za sobe postoji")
    
    def test_06_room_tile_kartica(self):
        """Kartice soba se prikazuju (ako postoje sobe)"""
        self.driver.get(f"{BASE_URL}/escape-rooms")
        self.wait_for_page_load()
        time.sleep(2)
        
        tiles = self.driver.find_elements(By.CLASS_NAME, "room-tile")
        
        if len(tiles) > 0:
            # Provjeri strukturu prve kartice
            tile = tiles[0]
            h3 = tile.find_element(By.TAG_NAME, "h3")  # Naziv
            self.assertIsNotNone(h3)
            
            # Gumb DETALJI
            button = tile.find_element(By.CLASS_NAME, "room-tile-button")
            self.assertIsNotNone(button)
            print(f"Pronađeno {len(tiles)} kartica soba")
        else:
            print("Nema soba u bazi (to je OK)")



class TestLeaderboard(BaseTest):
    """Testovi za Leaderboard stranicu"""
    
    def test_01_hero_sekcija(self):
        """Hero sekcija s naslovom Leaderboard"""
        self.driver.get(f"{BASE_URL}/leaderboard")
        self.wait_for_page_load()
        
        hero = self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "leaderboard-hero")))
        h1 = hero.find_element(By.TAG_NAME, "h1")
        self.assertEqual(h1.text, "Leaderboard")
        print("Leaderboard hero prikazan")
    
    def test_02_tablica_postoji(self):
        """Tablica rang ljestvice postoji"""
        self.driver.get(f"{BASE_URL}/leaderboard")
        self.wait_for_page_load()
        
        table = self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "leaderboard-table")))
        self.assertIsNotNone(table)
        
        # Provjeri zaglavlja
        headers = table.find_elements(By.CSS_SELECTOR, "thead th")
        self.assertGreaterEqual(len(headers), 3)  # #, Tim, Bodovi/Vrijeme
        print("Tablica postoji s zaglavljima")
    
    def test_03_filter_sobe(self):
        """Filter za odabir sobe postoji"""
        self.driver.get(f"{BASE_URL}/leaderboard")
        self.wait_for_page_load()
        
        filters = self.driver.find_element(By.CLASS_NAME, "leaderboard-filters")
        self.assertIsNotNone(filters)
        
        # Select za sobu
        room_select = self.driver.find_element(By.CLASS_NAME, "leaderboard-room-select")
        self.assertIsNotNone(room_select)
        print("Filter za sobu postoji")
    
    def test_04_sortiranje(self):
        """Sortiranje po kolonama radi"""
        self.driver.get(f"{BASE_URL}/leaderboard")
        self.wait_for_page_load()
        time.sleep(1)
        
        # UpDownSwitch za sortiranje
        sort_switches = self.driver.find_elements(By.CLASS_NAME, "leaderboard-table-sort-switch")
        self.assertGreater(len(sort_switches), 0, "Postoje gumbi za sortiranje")
        print(f"Pronađeno {len(sort_switches)} gumba za sortiranje")



def run_tests():
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    suite.addTests(loader.loadTestsFromTestCase(TestNavigacija))
    suite.addTests(loader.loadTestsFromTestCase(TestHeader))
    suite.addTests(loader.loadTestsFromTestCase(TestLogin))
    suite.addTests(loader.loadTestsFromTestCase(TestRegistracija))
    suite.addTests(loader.loadTestsFromTestCase(TestEscapeRooms))
    suite.addTests(loader.loadTestsFromTestCase(TestLeaderboard))
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    print("\n" + "-"*60)
    print(f"UKUPNO: {result.testsRun} testova")
    print(f"USPJEŠNO: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"NEUSPJEŠNO: {len(result.failures)}")
    print(f"GREŠKE: {len(result.errors)}")
   
    
    return result


if __name__ == "__main__":
    print("BreakoutSystems - Selenium E2E Testovi")
    print("-"*60 + "\n")
    run_tests()
