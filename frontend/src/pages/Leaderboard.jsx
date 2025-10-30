// frontend/src/pages/Leaderboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import PageTemplate from "./PageTemplate";

/*
 * API očekivanja (backend):
 * 1) GET /api/rooms
 *    → [{ id: "r1", name: "Pirati Kariba" }, ...]
 *
 * 2) GET /api/leaderboard?scope=global|room&roomId=&sort=score|time&order=desc|asc&page=1&pageSize=20&q=
 *    → {
 *         items: [
 *           { id, rank, teamName, roomId, roomName, timeSeconds, score, date } // date ISO
 *         ],
 *         page, pageSize, total
 *       }
 *
 * ako backend nije spreman, komponenta automatski pada na mock podatke.
 */

// MOCK, pali se automatski kad fetch padne
const MOCK_ROOMS = [
  { id: "r1", name: "Pirati Kariba" },
  { id: "r2", name: "Laboratorij X" },
  { id: "r3", name: "Zatvor – Bjeg" },
];

const MOCK_ITEMS = [
  { id: "1", rank: 1, teamName: "LockBusters", roomId: "r1", roomName: "Pirati Kariba", timeSeconds: 2480, score: 920, date: "2025-03-10" },
  { id: "2", rank: 2, teamName: "KeyMasters", roomId: "r2", roomName: "Laboratorij X", timeSeconds: 3015, score: 870, date: "2025-03-12" },
  { id: "3", rank: 3, teamName: "EscapeGoats", roomId: "r1", roomName: "Pirati Kariba", timeSeconds: 2550, score: 910, date: "2025-03-15" },
  { id: "4", rank: 4, teamName: "Brainiacs", roomId: "r3", roomName: "Zatvor – Bjeg", timeSeconds: 2790, score: 895, date: "2025-03-13" },
  { id: "5", rank: 5, teamName: "MysteryMinds", roomId: "r2", roomName: "Laboratorij X", timeSeconds: 2600, score: 905, date: "2025-03-17" },
  { id: "6", rank: 6, teamName: "CipherCats", roomId: "r1", roomName: "Pirati Kariba", timeSeconds: 2710, score: 898, date: "2025-03-17" },
  { id: "7", rank: 7, teamName: "PuzzlePunks", roomId: "r3", roomName: "Zatvor – Bjeg", timeSeconds: 2895, score: 876, date: "2025-03-18" },
  { id: "8", rank: 8, teamName: "HintHunters", roomId: "r2", roomName: "Laboratorij X", timeSeconds: 3100, score: 860, date: "2025-03-19" },
];

const DEFAULT_PAGE_SIZE = 10;

// helpers
const toHMS = (secs) => {
  const s = Math.max(0, Math.floor(secs));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(ss)}` : `${m}:${pad(ss)}`;
};

function useLeaderboardApi({ scope, roomId, sort, order, page, pageSize, q }) {
  const [state, setState] = useState({ items: [], total: 0, loading: true, error: null });
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const params = new URLSearchParams({
          scope,
          ...(roomId ? { roomId } : {}),
          sort,
          order,
          page: String(page),
          pageSize: String(pageSize),
          ...(q ? { q } : {}),
        });
        const res = await fetch(`/api/leaderboard?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setState({ items: data.items || [], total: data.total || 0, loading: false, error: null });
      } catch (e) {
        // fallback na mock
        if (cancelled) return;
        const filtered = MOCK_ITEMS
          .filter((it) => (scope === "room" ? it.roomId === roomId : true))
          .filter((it) => (q ? it.teamName.toLowerCase().includes(q.toLowerCase()) : true))
          .sort((a, b) => {
            if (sort === "score") return order === "desc" ? b.score - a.score : a.score - b.score;
            // sort === "time" (manje je bolje)
            return order === "asc" ? a.timeSeconds - b.timeSeconds : b.timeSeconds - a.timeSeconds;
          });

        const start = (page - 1) * pageSize;
        const items = filtered.slice(start, start + pageSize).map((it, idx) => ({ ...it, rank: start + idx + 1 }));
        setState({ items, total: filtered.length, loading: false, error: null });
      }
    };
    run();
    return () => { cancelled = true; };
  }, [scope, roomId, sort, order, page, pageSize, q]);

  return state;
}

function useRoomsApi() {
  const [state, setState] = useState({ rooms: [], loading: true, error: null });
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setState({ rooms: [], loading: true, error: null });
      try {
        const res = await fetch("/api/rooms");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setState({ rooms: data || [], loading: false, error: null });
      } catch (e) {
        if (cancelled) return;
        setState({ rooms: MOCK_ROOMS, loading: false, error: null });
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);
  return state;
}

function LeaderboardContent() {
  // kontrole
  const [scope, setScope] = useState("global"); // "global" | "room"
  const { rooms } = useRoomsApi();
  const [roomId, setRoomId] = useState("");
  const [sort, setSort] = useState("score"); // "score" | "time"
  const [order, setOrder] = useState("desc"); // "desc" | "asc"
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [q, setQ] = useState("");

  // kad mijenjaš glavne filtere -> resetiraj stranicu
  useEffect(() => { setPage(1); }, [scope, roomId, sort, order, q, pageSize]);

  // kad user prebaci na "room", automatski odaberi prvu sobu ako nema
  useEffect(() => {
    if (scope === "room" && !roomId && rooms.length > 0) {
      setRoomId(rooms[0].id);
    }
  }, [scope, rooms, roomId]);

  const { items, total, loading } = useLeaderboardApi({ scope, roomId, sort, order, page, pageSize, q });

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  return (
    <div className="leaderboard-page">
      {/* kontrole */}
      <div className="leaderboard-controls">
        <div className="lb-row">
          <div className="lb-tabs">
            <button
              className={`lb-tab ${scope === "global" ? "active" : ""}`}
              onClick={() => setScope("global")}
            >Globalna</button>
            <button
              className={`lb-tab ${scope === "room" ? "active" : ""}`}
              onClick={() => setScope("room")}
            >Po sobi</button>
          </div>

          {scope === "room" && (
            <select
              className="lb-select"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            >
              {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          )}

          <div className="lb-search">
            <input
              type="text"
              placeholder="Pretraži tim..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        <div className="lb-row">
          <div className="lb-sorters">
            <label>
              Sortiraj:
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="score">Bodovi (viši bolji)</option>
                <option value="time">Vrijeme (kraće bolje)</option>
              </select>
            </label>
            <label>
              Redoslijed:
              <select value={order} onChange={(e) => setOrder(e.target.value)}>
                <option value="desc">Silazno</option>
                <option value="asc">Uzlazno</option>
              </select>
            </label>
            <label>
              Po stranici:
              <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </label>
          </div>

          <div className="lb-pagination">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>←</button>
            <span>Stranica {page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>→</button>
          </div>
        </div>
      </div>

      {/* tablica */}
      <div className="leaderboard-table-wrap">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Tim</th>
              <th>Soba</th>
              <th>Vrijeme</th>
              <th>Bodovi</th>
              <th>Datum</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="lb-center">Učitavanje...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="6" className="lb-center">Nema rezultata.</td></tr>
            ) : (
              items.map((it) => (
                <tr key={it.id}>
                  <td>{it.rank}</td>
                  <td>{it.teamName}</td>
                  <td>{it.roomName}</td>
                  <td>{toHMS(it.timeSeconds)}</td>
                  <td>{it.score}</td>
                  <td>{new Date(it.date).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LeaderboardPage() {
  return <PageTemplate name="leaderboard" body={<LeaderboardContent />} />;
}

export default LeaderboardPage;
