import React, { useEffect, useState } from "react";
import PageTemplate from "./PageTemplate";
import PageNavLink1 from "../components/PageNavLink1";
import {SyncLoader} from "react-spinners";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import RoomTile from "../components/RoomTile";
import MapController from "../components/MapController";
import calculateMapCenterZoom from "../utils/calculateMapCenterZoom";

async function fetchPopularRooms() {
  const response = await fetch('/api/rooms/most_popular');
  if (response.ok) {
    const data = await response.json();
    return data["rooms"];
  } else {
    return [];
  }
}


function HomeContent() {
  const [popularRooms, setPopularRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetchPopularRooms()
      .then((rooms) => {
        setPopularRooms(rooms);
        setLoading(false);
      });
  }, []);

  const [initPos, setInitPos] = useState([45, 16.5]);
  const [initZoom, setInitZoom] = useState(7);
  useEffect(() => {
      const { center, zoom } = calculateMapCenterZoom(popularRooms.map((room) => [room.geo_lat, room.geo_long]));
      setInitPos(center);
      setInitZoom(zoom);
  }, [popularRooms]);

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
          <PageNavLink1 to="/escape-rooms" text="PRETRAŽI" />
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
            {popularRooms.map((room) => <RoomTile room={room}/>)}
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
        <MapContainer className="map-content" center={initPos} zoom={initZoom} scrollWheelZoom={true} attributionControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            <MapController center={initPos} zoom={initZoom}/>
            {
                popularRooms.map((room) => {
                    return <Marker position={[room.geo_lat, room.geo_long]}>
                        <Popup>A pretty CSS3 popup.<br/>Easily customizable.</Popup>
                    </Marker>;
                })
            }
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
