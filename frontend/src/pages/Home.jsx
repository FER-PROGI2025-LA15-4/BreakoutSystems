import React, { useEffect, useState } from "react";
import PageTemplate from "./PageTemplate";

/*
 * API očekivanja (backend) :
 * 1) GET /api/rooms?limit=3 -> prikaz tri najpopularnije sobe
 *    [{
 *      id: "r1",
 *      name: "Kuća u tišini",
 *      description: "Svjetlo treperi, vrata škripe...",
 *      genre: "Horor",
 *      difficulty: 4.5,
 *      location: "Zagreb, Donji grad",
 *      imageUrl: "https://example.com/slika.jpg"
 *    }]
 */

const MOCK_ROOMS = [
  {
    id: "r1",
    name: "Kuća u tišini",
    description: "Svjetlo treperi, vrata škripe, a svaki zvuk može biti tvoj posljednji trag.",
    genre: "Horor",
    difficulty: 5,
    location: "Zagreb, Donji grad",
    imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "r2",
    name: "Ukradeni kolači",
    description: "Netko je pojeo sve kolače iz pekare 'Slatki kutak'! Riješi misterij.",
    genre: "Humor",
    difficulty: 4,
    location: "Zagreb, Donji grad",
    imageUrl: "https://images.unsplash.com/photo-1606755962773-0b57b7b9303d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "r3",
    name: "Tajni laboratorij",
    description: "Eksperiment je pošao po zlu. Sustav odbrojava do samouništenja.",
    genre: "Sci-Fi",
    difficulty: 5,
    location: "Zagreb, Donji grad",
    imageUrl: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80",
  },
];

function useFeaturedRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch("/api/rooms?limit=3");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setRooms(data);
          setLoading(false);
        }
      } catch (err) {
        // fallback mock data
        if (!cancelled) {
          setRooms(MOCK_ROOMS);
          setLoading(false);
          setError(null);
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { rooms, loading, error };
}

function HomeContent() {
  const { rooms, loading } = useFeaturedRooms();

  return (
    <div className="home-page">
      {/* hero sekcija */}
      <section className="hero">
        <div className="hero-left">
          <h1>Istraži, rezerviraj, zaigraj!</h1>
          <p>
            Istraži najuzbudljivije Escape Room avanture u svom gradu – okupi tim, rješavaj zagonetke i
            popni se na vrh ljestvice!
          </p>
          <button>Pretraži ➜</button>
        </div>
        <div className="hero-right">
          {/* ovdje cemo neku sliku stavit */}
          <img
            src="https://cdn.pixabay.com/photo/2020/07/01/12/58/escape-room-5359953_1280.png"
            alt="Escape Room ilustracija"
          />
        </div>
      </section>

      {/* info sekcija */}
      <section className="info">
        <p>
          <strong>BreakoutSystems</strong> je platforma koja povezuje sve Escape Roomove, timove i
          organizatore.
        </p>
        <p>
          <strong>Pretraži</strong> sobe, <strong>rezerviraj</strong> termin, <strong>plati</strong>{" "}
          online i <strong>prati rezultate</strong> svog tima na ljestvici. Tvoja sljedeća avantura počinje
          ovdje!
        </p>
      </section>

      {/* kartice soba */}
      <section className="featured">
        <h2>Odaberi svoju sljedeću avanturu!</h2>
        <p>Više od 100 Escape Roomova iz cijele Hrvatske! Odaberite i rezervirajte.</p>

        {loading ? (
          <p>Učitavanje...</p>
        ) : (
          <div className="room-grid">
            {rooms.map((room) => (
              <div key={room.id} className="room-card">
                <img src={room.imageUrl} alt={room.name} />
                <h3>{room.name}</h3>
                <p>{room.description}</p>
                <p>
                  <strong>Žanr:</strong> {room.genre}
                </p>
                <p>
                  <strong>Težina:</strong>{" "}
                  {Array.from({ length: room.difficulty }).map((_, i) => "⭐")}
                </p>
                <p>
                  <strong>Lokacija:</strong> {room.location}
                </p>
                <button>Detalji</button>
              </div>
            ))}
          </div>
        )}
        <button className="show-all">Pogledaj sve ➜</button>
      </section>

      {/* mapa sekcija */}
      <section className="map-section">
        <div className="map-text">
          <h2>Sve na jednom mjestu</h2>
          <p>
            Pogledajte lokacije svih Escape Roomova i odaberite svoj sljedeći izazov! Uskoro će ovdje biti
            prikazana interaktivna karta s dostupnim sobama.
          </p>
        </div>
        <div className="map-placeholder">
          <iframe
            title="Google mapa"
            width="100%"
            height="300"
            loading="lazy"
            allowFullScreen
            src="https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=Zagreb"
          ></iframe>
        </div>
      </section>

      {/* CTA sekcija */}
      <section className="cta-owner">
        <h2>Vlasnik si Escape rooma?</h2>
        <p>
          <strong>Dodaj</strong> svoj Escape Room na BreakoutSystems, <strong>povećaj vidljivost</strong> i
          učini ga <strong>dostupnim svima</strong>.  
          Upravljaj <strong>terminima</strong>, <strong>rezultatima</strong> i{" "}
          <strong>rezervacijama</strong> – sve s jednog mjesta!
        </p>
        <button>Moje sobe ➜</button>
      </section>
    </div>
  );
}

function HomePage() {
  const name = "home";
  return <PageTemplate name={name} body={<HomeContent />} />;
}

export default HomePage;