import React, { useEffect, useState } from "react";
import PageTemplate from "./PageTemplate";
import PageNavLink1 from "../components/PageNavLink1";
import {SyncLoader} from "react-spinners";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import RoomTile from "../components/RoomTile";

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
    description: "Netko je pojeo sve kolače iz pekare 'Slatki kutak'!",
    genre: "Humor",
    difficulty: 4,
    location: "Zagreb, Donji grad",
    imageUrl: "https://hotelrepublika.qupola.net/wp-content/uploads/sites/14/2025/10/cookies-chocolate-chips-arrangement-1024x683.jpg",
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
  const position = [45.8150, 15.9819]; // Zagreb coordinates

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
          <PageNavLink1 to="/nf" text="PRETRAŽI" />
        </div>
      </section>

      {/* info sekcija */}
      <section className="info">
        <p>
          <strong>BreakoutSystems</strong> je platforma koja povezuje sve Escape Roomove, timove i
          organizatore.
        </p>
        <p>
          <strong>Pretraži</strong> sobe, <strong>rezerviraj</strong> termin, <strong>plati</strong> online
            i <strong>prati rezultate</strong> svog tima na ljestvici. Tvoja sljedeća avantura počinje ovdje!
        </p>
      </section>

      {/* kartice soba */}
      <section className="featured">
        <h2>Odaberi svoju sljedeću avanturu!</h2>
        <p>Više od 100 Escape Roomova iz cijele Hrvatske! Odaberite i rezervirajte.</p>

        {loading ? (
          <SyncLoader />
        ) : (
          <div className="room-grid">
            {rooms.map((room) => <RoomTile room={room}/>)}
          </div>
        )}
        <PageNavLink1 to="/escape-rooms" text="POGLEDAJ SVE" className="featured-btn"/>
      </section>

      {/* mapa sekcija */}
      <section className="map-section">
        <div className="map-text">
          <h2>Sve na jednom mjestu</h2>
          <p>Pogledajte lokacije svih Escape Roomova i odaberite svoje sljedeći izazov! Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        </div>
        <MapContainer className="map-content" center={position} zoom={13} scrollWheelZoom={true} attributionControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            <Marker position={position}>
                <Popup>A pretty CSS3 popup.<br/>Easily customizable.</Popup>
            </Marker>
        </MapContainer>
      </section>

      {/* CTA sekcija */}
      <section className="cta-owner">
        <div className="cta-owner-circle"></div>
        <div className="cta-owner-content">
          <h2>Vlasnik si Escape rooma?</h2>
          <p>
              <strong>Dodaj</strong> svoj Escape Room na BreakoutSystems, <strong>povećaj vidljivost</strong> i
              učini ga <strong>dostupnim svima</strong>.<br/>
              Upravljaj <strong>terminima</strong>, <strong>rezultatima</strong> i <strong>rezervacijama</strong> – sve
              s jednog mjesta!
          </p>
          <PageNavLink1 to="/profile" text="MOJE SOBE" className="cta-btn"/>
        </div>
      </section>
    </div>
  );
}

function HomePage() {
  const name = "home";
  return <PageTemplate name={name} body={<HomeContent />} />;
}

export default HomePage;
