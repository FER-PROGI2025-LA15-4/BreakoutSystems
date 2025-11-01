import React, { useEffect, useMemo, useState } from "react";
import PageTemplate from "./PageTemplate";

/*
 * očekivani backend:
 * GET /api/rooms?location=Zagreb&genre=Horor&difficulty=4&page=1&pageSize=9
 *  -> {
 *      items: [
 *        {
 *          id, name, description, genre, difficulty, city, district,
 *          imageUrl, // opcionalno
 *          lat, lng   // opcionalno (za mapu)
 *        }, ...
 *      ],
 *      page, pageSize, total
 *    }
 *
 * GET /api/rooms/filters
 *  -> {
 *      locations: ["Zagreb", "Split", ...],
 *      genres: ["Horor", "Sci-Fi", ...],
 *      difficulties: [1,2,3,4,5]
 *    }
 */

// mock podaci (fallback kad fetch ne radi) 
const MOCK_FILTERS = {
  locations: ["Zagreb", "Split", "Rijeka"],
  genres: ["Horor", "Sci-Fi", "Humor"],
  difficulties: [1, 2, 3, 4, 5],
};

const MOCK_ITEMS = [
  {
    id: "r1",
    name: "Kuća u tišini",
    description: "Svjetlo treperi, vrata škripe, a svaki zvuk može biti tvoj posljednji trag.",
    genre: "Horor",
    difficulty: 5,
    city: "Zagreb",
    district: "Donji grad",
    imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "r2",
    name: "Ukradeni kolači",
    description: "Netko je pojeo sve kolače iz pekare 'Slatki kutak'! Riješi misterij.",
    genre: "Humor",
    difficulty: 4,
    city: "Zagreb",
    district: "Donji grad",
    imageUrl: "https://images.unsplash.com/photo-1606755962773-0b57b7b9303d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "r3",
    name: "Tajni laboratorij",
    description: "Eksperiment je pošao po zlu. Sustav odbrojava do samouništenja.",
    genre: "Sci-Fi",
    difficulty: 5,
    city: "Zagreb",
    district: "Donji grad",
    imageUrl: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80",
  },
];

const DEFAULT_PAGE_SIZE = 9;

// helpers
function Stars({ value = 0 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const arr = [];
  for (let i = 0; i < full; i++) arr.push("★");
  if (half) arr.push("☆");
  while (arr.length < 5) arr.push("✩");
  return <span>{arr.join(" ")}</span>;
}

function RoomCard({ room }) {
  return (
    <div className="room-card">
      <div className="room-card-img">
        {room.imageUrl ? (
          <img src={room.imageUrl} alt={room.name} />
        ) : (
          <div className="room-card-img-placeholder">Slika</div>
        )}
      </div>
      <div className="room-card-body">
        <h3>{room.name}</h3>
        <p>{room.description}</p>
        <p><strong>Žanr:</strong> {room.genre || "-"}</p>
        <p><strong>Težina:</strong> <Stars value={room.difficulty || 0} /></p>
        <p>
          <strong>Lokacija:</strong>{" "}
          {room.city ? `${room.city}${room.district ? ", " + room.district : ""}` : "-"}
        </p>
        <div className="room-card-actions">
          <button type="button">Detalji</button>
        </div>
      </div>
    </div>
  );
}

function useFilters() {
  const [state, setState] = useState({ loading: true, error: null, data: MOCK_FILTERS });
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch("/api/rooms/filters");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setState({ loading: false, error: null, data });
      } catch (e) {
        if (!cancelled) setState({ loading: false, error: null, data: MOCK_FILTERS });
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);
  return state;
}

function useRooms(query) {
  const [state, setState] = useState({ items: [], total: 0, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const qs = new URLSearchParams(
          Object.entries(query).reduce((acc, [k, v]) => {
            if (v !== undefined && v !== null && v !== "") acc[k] = String(v);
            return acc;
          }, {})
        ).toString();

        const res = await fetch(`/api/rooms?${qs}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setState({
          items: data.items || [],
          total: data.total || (data.items ? data.items.length : 0),
          loading: false,
          error: null,
        });
      } catch (e) {
        if (cancelled) return;
        // fallback: jednostavna filtracija mocka
        const { location, genre, difficulty, page = 1, pageSize = DEFAULT_PAGE_SIZE } = query;
        let arr = [...MOCK_ITEMS];
        if (location) arr = arr.filter((r) => (r.city || "").toLowerCase() === location.toLowerCase());
        if (genre) arr = arr.filter((r) => (r.genre || "").toLowerCase() === genre.toLowerCase());
        if (difficulty) arr = arr.filter((r) => Math.round(r.difficulty) === Number(difficulty));
        const total = arr.length;
        const start = (page - 1) * pageSize;
        const items = arr.slice(start, start + pageSize);
        setState({ items, total, loading: false, error: null });
      }
    };
    run();
    return () => { cancelled = true; };
  }, [JSON.stringify(query)]);

  return state;
}

function FiltersBar({ filters, value, onChange, onSubmit }) {
  return (
    <div className="filters-bar">
      <select
        value={value.location}
        onChange={(e) => onChange({ ...value, location: e.target.value })}
      >
        <option value="">- Odaberite lokaciju -</option>
        {filters.locations.map((loc) => (
          <option key={loc} value={loc}>{loc}</option>
        ))}
      </select>

      <select
        value={value.genre}
        onChange={(e) => onChange({ ...value, genre: e.target.value })}
      >
        <option value="">- Odaberite žanr -</option>
        {filters.genres.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>

      <select
        value={value.difficulty}
        onChange={(e) => onChange({ ...value, difficulty: e.target.value })}
      >
        <option value="">- Odaberite težinu -</option>
        {filters.difficulties.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <button type="button" onClick={onSubmit}>Pretraži</button>
    </div>
  );
}

function Pagination({ page, totalPages, onPrev, onNext, onJump }) {
  const pages = useMemo(() => {
    const arr = [];
    for (let i = 1; i <= totalPages; i++) arr.push(i);
    return arr.slice(0, 5); // minimalno,bez CSS-a, prikaži do 5
  }, [totalPages]);

  return (
    <div className="pagination">
      <button onClick={onPrev} disabled={page <= 1}>Prethodno</button>
      {pages.map((p) => (
        <button key={p} onClick={() => onJump(p)} disabled={p === page}>
          {p}
        </button>
      ))}
      <button onClick={onNext} disabled={page >= totalPages}>Sljedeće</button>
    </div>
  );
}

function EscapeRoomsContent() {
  // filters
  const { data: filterData } = useFilters();
  const [filters, setFilters] = useState({ location: "", genre: "", difficulty: "" });

  // query / pagination state
  const [page, setPage] = useState(1);
  const pageSize = DEFAULT_PAGE_SIZE;

  const [query, setQuery] = useState({ page, pageSize });
  const { items, total, loading } = useRooms(query);

  // submit filtera
  const submit = () => {
    setPage(1);
    setQuery({
      location: filters.location,
      genre: filters.genre,
      difficulty: filters.difficulty,
      page: 1,
      pageSize,
    });
  };

  // promjena stranice
  useEffect(() => {
    setQuery((q) => ({ ...q, page }));
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="escape-rooms-page">
      {/* hero traka */}
      <section className="er-hero">
        <div className="er-hero-left">
          <h1>Istraži, rezerviraj, zaigraj!</h1>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.</p>
        </div>
        <div className="er-hero-right" aria-hidden="true">{/* ilustracija kroz CSS */}</div>
      </section>

      {/* naslov + filteri */}
      <section className="er-top">
        <div className="er-title">
          <h2>Odaberi svoju sljedeću avanturu!</h2>
          <p>Više od 100 Escape roomova iz cijele Hrvatske! Odaberite i rezervirajte.</p>
        </div>
        <FiltersBar
          filters={filterData}
          value={filters}
          onChange={setFilters}
          onSubmit={submit}
        />
      </section>

      {/* karta (placeholder) */}
      <section className="er-map">
        <div className="map-placeholder" style={{ width: "100%", height: 320, background: "#e9e9ef" }}>
          {/* mjesto ovog cu ubacit svoj map widget/iframe kad backend doda koordinate */}
          <div style={{ padding: 16 }}>Ovdje ide karta s lokacijama soba.</div>
        </div>
      </section>

      {/* lista soba */}
      <section className="er-list">
        {loading ? (
          <div>Učitavanje…</div>
        ) : items.length === 0 ? (
          <div>Nema soba za odabrane filtere.</div>
        ) : (
          <div className="er-grid">
            {items.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </section>

      {/*  */}
      <section className="er-pagination">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          onJump={(p) => setPage(p)}
        />
      </section>
    </div>
  );
}

function EscapeRoomsPage() {
  return <PageTemplate name="escape-rooms" body={<EscapeRoomsContent />} />;
}

export default EscapeRoomsPage;