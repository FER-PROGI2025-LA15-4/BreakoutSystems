import React, { useEffect, useState } from "react";
import PageTemplate from "./PageTemplate";
import Select from "react-select";
import makeAnimated from 'react-select/animated';
import UpDownSwitch from "../components/UpDownSwitch";
import {fetchRoomsFiltered} from "./EscapeRooms";
import {SyncLoader} from "react-spinners";
import sortArr from "../utils/sortArray";

async function fetchData(room_id) {
  const response = await fetch(`/api/leaderboard${room_id ? `?room_id=${room_id}` : ""}`);
  if (response.ok) {
    const data = await response.json();
    return data["leaderboard"];
  } else {
    return [];
  }
}

function LeaderboardContent() {
  const animatedComponents = makeAnimated();

  const [roomsOpts, setRoomsOpts] = useState(null);
  useEffect(() => {
    fetchRoomsFiltered()
        .then(rooms => {
          const opts = rooms.map(room => ({
            value: room.room_id,
            label: room.naziv,
          }));
          setRoomsOpts(opts);
        });
  }, []);

  const [roomId, setRoomId] = useState(null);
  const handleRoomChange = option => setRoomId(option ? option.value : null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const localRoomId = roomId;
    fetchData(localRoomId)
        .then(fetchedData => {
          for (const entry of fetchedData) {
            if (entry.score === null) {
              entry.score = Number.MAX_SAFE_INTEGER;
            }
          }
          fetchedData = sortArr(fetchedData, (value) => value.score, localRoomId ? "asc" : "desc");
          let rank = 1;
          for (const i in fetchedData) {
            if (parseInt(i) === 0 || fetchedData[parseInt(i) - 1]["score"] === fetchedData[i]["score"]) {
              fetchedData[i].rank = rank;
            } else {
              fetchedData[i].rank = ++rank;
            }
          }
          setData(fetchedData);
          setSortType({ field: "rank", direction: "asc" });  // this triggers sorting useEffect (which sets loading to false)
        });
  }, [roomId]);

  const [sortType, setSortType] = useState({ field: "rank", direction: "asc" });
  const handleSortClick = field => {
    const localSortType = { ...sortType };
    if (localSortType.field === field) {
      if (localSortType.direction === "asc") {
        localSortType.direction = "desc";
      } else if (localSortType.direction === "desc") {
        localSortType.direction = "asc";
      }
    } else {
      localSortType.field = field;
      localSortType.direction = "asc";
    }
    setSortType(localSortType);
  };
  useEffect(() => {
    setLoading(true);
    const localData = sortArr(data, (value) => value[sortType.field], sortType.direction);
    setData(localData);
    setLoading(false);
  }, [sortType]);


  return (
    <div className="leaderboard-page">
      <Select
          components={animatedComponents}
          options={roomsOpts || []}
          isLoading={roomsOpts === null}
          isMulti={false}
          isClearable={true}
          placeholder="Escape Room"
          onChange={handleRoomChange}
          className="leaderboard-room-select"
      />
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>
              <div>
                <p>#</p>
                <UpDownSwitch
                    direction={sortType.field === "rank" && sortType.direction === "desc" ? "down" : "up"}
                    visible={sortType.field === "rank"}
                    className={"leaderboard-table-sort-switch"}
                    onClick={() => handleSortClick("rank")}
                />
              </div>
            </th>
            <th>
              <div>
                <p>Tim</p>
                <UpDownSwitch
                    direction={sortType.field === "ime_tima" && sortType.direction === "desc" ? "down" : "up"}
                    visible={sortType.field === "ime_tima"}
                    className={"leaderboard-table-sort-switch"}
                    onClick={() => handleSortClick("ime_tima")}
                />
              </div>
            </th>
            <th>
              <div>
                <p>{roomId === null ? "Bodovi" : "Vrijeme"}</p>
                <UpDownSwitch
                    direction={sortType.field === "score" && sortType.direction === "desc" ? "down" : "up"}
                    visible={sortType.field === "score"}
                    className={"leaderboard-table-sort-switch"}
                    onClick={() => handleSortClick("score")}
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan={3}><div className={"leaderboard-loader-wrapper"}><SyncLoader/></div></td></tr>}
          {!loading && data.map((entry) => {
            return <tr>
              <td>{entry.rank}</td>
              <td>{entry.ime_tima}</td>
              <td>{entry.score}</td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}

function LeaderboardPage() {
  const name = "leaderboard";
  const body = <LeaderboardContent/>;
  return <PageTemplate name={name} body={body}/>;
}

export default LeaderboardPage;
