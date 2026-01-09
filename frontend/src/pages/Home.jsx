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
    return null;
  }
}


function HomeContent() {
  const [popularRooms, setPopularRooms] = useState(null);
  useEffect(() => {
    fetchPopularRooms()
      .then((rooms) => {
        if (rooms !== null) {
          setPopularRooms(rooms);
        }
      });
  }, []);

  const [initPos, setInitPos] = useState([45, 16.5]);
  const [initZoom, setInitZoom] = useState(7);
  useEffect(() => {
      if (popularRooms === null || popularRooms.length === 0) {
        const defaultCenter = [45, 16.5];
        const defaultZoom = 7;
        setInitPos(defaultCenter);
        setInitZoom(defaultZoom);
      } else {
          const { center, zoom } = calculateMapCenterZoom(popularRooms.map((room) => [room.geo_lat, room.geo_long]));
          setInitPos(center);
          setInitZoom(zoom);
      }
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
          Na jednom mjestu možeš <strong>pretraživati</strong> sobe, <strong>usporediti</strong> teme, težine i cijene te
          brzo <strong>pronaći</strong> izazov koji odgovara tvojoj ekipi. Kad odabereš
          sobu, <strong>rezervacija</strong> i plaćanje su jednostavni i brzi.
        </p>
        <p>
          Okupi ekipu, <strong>prati odigrane avanture</strong> i gledaj kako napredujete iz igre u igru.
          Nakon igre možeš <strong>ocijeniti težinu sobe</strong> i pomoći drugima pri odabiru.
          Ako se voliš natjecati, tu su i ljestvice po sobama i globalne ljestvice – <strong>pokaži koji je tim njabolji!</strong>
        </p>
      </section>

      {/* kartice soba */}
      <section className="featured">
        <h2>Odaberi svoju sljedeću avanturu!</h2>
        <p>Više od 100 Escape Roomova iz cijele Hrvatske! Odaberite i rezervirajte.</p>

        {popularRooms === null ? (
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
          <p>
            Pogledaj lokacije svih Escape Roomova i planiraj svoju sljedeću
            avanturu — bilo da tražiš nešto <i>usput</i> dok putuješ,
            želiš organizirati team building ili samo želiš ideju za sljedeći izlazak.
          </p>
        </div>
        <MapContainer className="map-content" center={initPos} zoom={initZoom} scrollWheelZoom={true} attributionControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            <MapController center={initPos} zoom={initZoom}/>
            {popularRooms !== null && (
                popularRooms.map((room) => {
                    return <Marker position={[room.geo_lat, room.geo_long]}>
                        <Popup>A pretty CSS3 popup.<br/>Easily customizable.</Popup>
                    </Marker>;
                }))
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
